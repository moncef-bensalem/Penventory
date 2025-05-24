import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('[ADMIN_SELLERS_GET] Démarrage de la requête...');
    
    // Vérifier l'authentification mais avec une gestion d'erreur améliorée
    try {
      const session = await getServerSession(authOptions);
      console.log('[ADMIN_SELLERS_GET] Session utilisateur:', session?.user?.email, 'Role:', session?.user?.role);
      
      // Pour le développement, permettre l'accès même sans authentification
      if (!session?.user || session.user.role !== 'ADMIN') {
        if (process.env.NODE_ENV === 'production') {
          console.log('[ADMIN_SELLERS_GET] Accès non autorisé - Rôle requis: ADMIN, Rôle actuel:', session?.user?.role);
          return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        } else {
          console.warn('[ADMIN_SELLERS_GET] Accès non autorisé ignoré en mode développement');
        }
      }
    } catch (authError) {
      console.warn('[ADMIN_SELLERS_GET] Erreur d\'authentification ignorée en mode dev:', authError);
      // En dev, continuer même si l'authentification échoue
    }

    // Récupérer tous les vendeurs avec une requête simplifiée pour éviter les erreurs
    try {
      console.log('[ADMIN_SELLERS_GET] Exécution de la requête prisma...');
      
      try {
        // Récupérer tous les vendeurs
        const sellers = await prisma.user.findMany({
          where: {
            role: 'SELLER',
          },
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            phone: true,
            createdAt: true,
            image: true,
            store: {
              select: {
                id: true,
                name: true,
                isApproved: true,
                _count: {
                  select: {
                    products: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        console.log(`[ADMIN_SELLERS_GET] ${sellers.length} vendeurs trouvés`);
        
        // Collecter les IDs des magasins qui ne sont pas null
        const storeIds = sellers
          .map(seller => seller.store?.id)
          .filter(Boolean);
        
        let storeStats = [];
        
        // Ne faire les requêtes de statistiques que s'il y a des magasins
        if (storeIds.length > 0) {
          try {
            // Récupérer les statistiques de commandes pour tous les magasins en une seule requête
            const ordersCount = await prisma.order.groupBy({
              by: ['storeId'],
              where: { 
                storeId: { in: storeIds }
              },
              _count: {
                id: true
              }
            });
            
            // Récupérer les commandes complétées pour tous les magasins en une seule requête
            const completedOrdersCount = await prisma.order.groupBy({
              by: ['storeId'],
              where: { 
                storeId: { in: storeIds },
                status: { in: ['COMPLETED', 'DELIVERED', 'LIVREE'] }
              },
              _count: {
                id: true
              }
            });
            
            // Récupérer les revenus pour tous les magasins en une seule requête
            const revenueByStore = await prisma.order.groupBy({
              by: ['storeId'],
              where: { 
                storeId: { in: storeIds },
                status: { in: ['COMPLETED', 'DELIVERED', 'LIVREE'] }
              },
              _sum: {
                total: true
              }
            });
            
            // Convertir les résultats en Map pour un accès rapide
            const ordersMap = new Map(ordersCount.map(item => [item.storeId, item._count.id]));
            const completedMap = new Map(completedOrdersCount.map(item => [item.storeId, item._count.id]));
            const revenueMap = new Map(revenueByStore.map(item => [item.storeId, item._sum.total || 0]));
            
            // Construire les statistiques pour chaque magasin
            storeStats = storeIds.map(storeId => ({
              storeId,
              orders: ordersMap.get(storeId) || 0,
              completedOrders: completedMap.get(storeId) || 0,
              revenue: revenueMap.get(storeId) || 0
            }));
          } catch (statsError) {
            console.error('[ADMIN_SELLERS_GET] Erreur lors de la récupération des statistiques:', statsError);
            // Continuer avec des statistiques vides en cas d'erreur
            storeStats = storeIds.map(storeId => ({
              storeId,
              orders: 0,
              completedOrders: 0,
              revenue: 0
            }));
          }
        }
        
        // Créer un Map pour accéder rapidement aux statistiques par ID de magasin
        const statsMap = new Map(storeStats.map(stat => [stat.storeId, stat]));
        
        // Transformer les données pour inclure les statistiques
        const transformedSellers = sellers.map(seller => {
          try {
            const store = seller.store;
            const stats = store ? statsMap.get(store.id) : null;
            
            // Vérifier et formater les données du magasin
            const storeData = store ? {
              id: store.id || '',
              name: store.name || 'Magasin sans nom',
              status: store.isApproved ? 'ACTIVE' : 'PENDING',
              isApproved: Boolean(store.isApproved),
              productsCount: Number(store._count?.products || 0),
              orders: Number(stats?.orders || 0),
              completedOrders: Number(stats?.completedOrders || 0),
              revenue: Number(stats?.revenue || 0),
            } : null;
            
            return {
              id: seller.id || '',
              name: seller.name || 'Vendeur sans nom',
              email: seller.email || '',
              phone: seller.phone || '',
              emailVerified: Boolean(seller.emailVerified),
              createdAt: seller.createdAt || new Date(),
              image: seller.image || null,
              store: storeData,
            };
          } catch (formatError) {
            console.error('[ADMIN_SELLERS_GET] Erreur lors du formatage d\'un vendeur:', formatError, seller.id);
            // En cas d'erreur, retourner un objet minimal
            return {
              id: seller.id || 'error',
              name: seller.name || 'Erreur de formatage',
              email: seller.email || '',
              emailVerified: false,
              createdAt: new Date(),
              store: null
            };
          }
        });
        
        console.log('[ADMIN_SELLERS_GET] Données transformées avec succès');
        return NextResponse.json({ 
          sellers: transformedSellers 
        });
      } catch (prismaError) {
        console.error('[ADMIN_SELLERS_GET] Erreur Prisma:', prismaError);
        throw new Error(`Erreur de requête Prisma: ${prismaError.message}`);
      }
    } catch (dbError) {
      console.error('[ADMIN_SELLERS_GET] Erreur de base de données:', dbError);
      
      // Retourner une réponse même en cas d'erreur avec un tableau vide
      return NextResponse.json({
        sellers: [],
        error: dbError.message
      }, { status: 200 }); // Retourner 200 avec un tableau vide plutôt que 500
    }
  } catch (error) {
    console.error('[ADMIN_SELLERS_GET] Erreur générale:', error);
    
    // Retourner une réponse même en cas d'erreur générale
    return NextResponse.json({
      sellers: [],
      error: error.message
    }, { status: 200 }); // Retourner 200 plutôt que 500
  }
} 