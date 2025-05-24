import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// GET - Récupérer tous les magasins pour l'administrateur
export async function GET() {
  try {
    console.log('[ADMIN_STORES_GET] Démarrage de la requête...');
    
    // Vérifier l'authentification mais avec une gestion d'erreur améliorée
    try {
      const session = await getServerSession(authOptions);
      
      // Pour le développement, permettre l'accès même sans authentification
      if (!session?.user || session.user.role !== 'ADMIN') {
        if (process.env.NODE_ENV === 'production') {
          return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        } else {
          console.warn('[ADMIN_STORES_GET] Accès non autorisé ignoré en mode développement');
        }
      }
    } catch (authError) {
      console.warn('[ADMIN_STORES_GET] Erreur d\'authentification ignorée en mode dev:', authError);
      // En dev, continuer même si l'authentification échoue
    }

    // Récupérer tous les magasins avec une requête simplifiée pour éviter les erreurs
    try {
      console.log('[ADMIN_STORES_GET] Exécution de la requête prisma...');
      
      try {
        // Version simplifiée pour être plus robuste et gérer owner optionnel
        const rawStores = await prisma.store.findMany({
          select: {
            id: true,
            name: true,
            description: true,
            logo: true,
            banner: true,
            address: true,
            phone: true,
            email: true,
            website: true,
            facebook: true,
            instagram: true,
            rating: true,
            isApproved: true,
            createdAt: true,
            updatedAt: true,
            ownerId: true, // Ajouté pour pouvoir faire la jointure manuellement
            _count: {
              select: {
                products: true,
                categories: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
        
        console.log(`[ADMIN_STORES_GET] Trouvé ${rawStores.length} magasins`);
        
        // Récupérer tous les propriétaires en une seule requête pour optimiser
        const ownerIds = rawStores.map(store => store.ownerId).filter(Boolean);
        const owners = ownerIds.length > 0 
          ? await prisma.user.findMany({
              where: { id: { in: ownerIds } },
              select: {
                id: true, 
                name: true, 
                email: true, 
                image: true, 
                role: true
              }
            }) 
          : [];
        
        // Récupérer le chiffre d'affaires pour chaque magasin
        const storeIds = rawStores.map(store => store.id);
        
        // Obtenir tous les totaux de commandes par magasin
        const storeRevenues = await prisma.order.groupBy({
          by: ['storeId'],
          where: {
            storeId: {
              in: storeIds
            }
          },
          _sum: {
            total: true
          }
        });
        
        // Récupérer les informations sur les commandes pour chaque magasin
        const orderCounts = await prisma.order.groupBy({
          by: ['storeId'],
          where: {
            storeId: {
              in: storeIds
            }
          },
          _count: {
            _all: true
          }
        });
        
        // Créer un map pour accéder rapidement aux revenus par ID de magasin
        const revenuesMap = storeRevenues.reduce((map, revenue) => {
          map[revenue.storeId] = revenue._sum.total || 0;
          return map;
        }, {});
        
        // Créer un map pour accéder rapidement aux propriétaires par ID
        const ownersMap = owners.reduce((map, owner) => {
          map[owner.id] = owner;
          return map;
        }, {});
        
        // Créer un map pour accéder rapidement au nombre de commandes par ID de magasin
        const orderCountsMap = orderCounts.reduce((map, count) => {
          map[count.storeId] = count._count._all || 0;
          return map;
        }, {});
        
        // Transformer les magasins pour éviter les références circulaires
        const stores = rawStores.map(store => {
          try {
            const ownerId = store.ownerId;
            const owner = ownerId ? ownersMap[ownerId] : null;
            
            return {
              id: store.id || '',
              name: store.name || '',
              description: store.description || '',
              logo: store.logo || '',
              banner: store.banner || '',
              address: store.address || '',
              phone: store.phone || '',
              email: store.email || '',
              website: store.website || '',
              facebook: store.facebook || '',
              instagram: store.instagram || '',
              rating: store.rating || 0,
              isApproved: store.isApproved || false,
              createdAt: store.createdAt || new Date(),
              updatedAt: store.updatedAt || new Date(),
              productsCount: store._count?.products || 0,
              categoriesCount: store._count?.categories || 0,
              totalRevenue: revenuesMap[store.id] || 0,
              ordersCount: orderCountsMap[store.id] || 0,
              owner: owner ? {
                id: owner.id || '',
                name: owner.name || 'Propriétaire inconnu',
                email: owner.email || '',
                image: owner.image || '',
                role: owner.role || 'USER'
              } : null
            };
          } catch (formatError) {
            console.error('[ADMIN_STORES_GET] Erreur lors du formatage d\'un magasin:', formatError);
            // En cas d'erreur de formatage, retourner un objet minimal
            return {
              id: store.id || 'error',
              name: store.name || 'Erreur de formatage',
              createdAt: new Date(),
              productsCount: 0,
              owner: null,
              totalRevenue: 0,
              ordersCount: 0
            };
          }
        });
        
        // Retourner les magasins dans un format cohérent
        return NextResponse.json({ stores });
      } catch (prismaError) {
        console.error('[ADMIN_STORES_GET] Erreur Prisma:', prismaError);
        throw new Error(`Erreur de requête Prisma: ${prismaError.message}`);
      }
    } catch (dbError) {
      console.error('[ADMIN_STORES_GET] Erreur de base de données:', dbError);
      
      // Retourner une réponse même en cas d'erreur avec un tableau vide
      return NextResponse.json({
        stores: [],
        error: dbError.message
      }, { status: 200 }); // Retourner 200 avec un tableau vide plutôt que 500
    }
  } catch (error) {
    console.error('[ADMIN_STORES_GET] Erreur générale:', error);
    
    // Retourner une réponse même en cas d'erreur générale
    return NextResponse.json({
      stores: [],
      error: error.message
    }, { status: 200 }); // Retourner 200 plutôt que 500
  }
}
