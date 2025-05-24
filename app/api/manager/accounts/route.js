import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

/**
 * Fonction pour gérer les BigInt et les convertir en String
 * pour éviter les erreurs de sérialisation
 */
function handleBigInt(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(handleBigInt);
  }
  
  if (typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      result[key] = handleBigInt(obj[key]);
    }
    return result;
  }
  
  return obj;
}

/**
 * Route pour récupérer tous les comptes utilisateurs pour le manager
 * avec des options de filtrage et de pagination
 */
export async function GET(request) {
  try {
    console.log('[MANAGER_ACCOUNTS_GET] Vérification de l\'authentification manager...');
    
    const session = await getServerSession(authOptions);
    
    // Vérifier si l'utilisateur est connecté et est un manager
    if (!session?.user || session.user.role !== 'MANAGER') {
      console.log('[MANAGER_ACCOUNTS_GET] Non autorisé: rôle manager requis');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Récupérer les paramètres de requête pour le filtrage et la pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const role = searchParams.get('role');
    const searchTerm = searchParams.get('search');
    const status = searchParams.get('status');
    
    console.log(`[MANAGER_ACCOUNTS_GET] Paramètres: page=${page}, limit=${limit}, role=${role}, search=${searchTerm}, status=${status}`);

    // Calculer le décalage pour la pagination
    const skip = (page - 1) * limit;

    // Construire la clause where pour le filtrage
    const whereClause = {};
    
    if (role) {
      whereClause.role = role;
    }
    
    if (searchTerm) {
      whereClause.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }
    
    // Les managers peuvent voir tous les utilisateurs sauf les ADMIN
    whereClause.role = {
      not: 'ADMIN'
    };

    // Compter le nombre total d'utilisateurs correspondant aux critères de filtrage
    const totalCount = await prisma.user.count({
      where: whereClause
    });

    // Récupérer les utilisateurs avec pagination et filtrage
    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            logo: true,
            isApproved: true
          }
        },
        orders: {
          select: {
            id: true
          }
        },
        sentTransactions: {
          select: {
            id: true
          }
        },
        receivedTransactions: {
          select: {
            id: true
          }
        },
        wallet: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Calculer le nombre total de pages
    const totalPages = Math.ceil(totalCount / limit);

    // Transformer les données pour éviter les références circulaires et les informations sensibles
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      phone: user.phone,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      status: user.emailVerified ? 'ACTIVE' : 'PENDING',
      ordersCount: user.orders.length,
      transactionsCount: user.sentTransactions.length + user.receivedTransactions.length,
      walletBalance: user.wallet?.balance || 0,
      store: user.store ? {
        id: user.store.id,
        name: user.store.name,
        logo: user.store.logo,
        isApproved: user.store.isApproved
      } : null
    }));

    console.log(`[MANAGER_ACCOUNTS_GET] ${users.length} utilisateurs récupérés sur un total de ${totalCount}`);
    
    // Traiter les BigInt et les convertir en String
    const processedUsers = handleBigInt(sanitizedUsers);
    
    // Retourner les utilisateurs avec les métadonnées de pagination
    return NextResponse.json({
      users: processedUsers || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('[MANAGER_ACCOUNTS_GET] Erreur:', error);
    
    // En cas d'erreur de base de données, utiliser les données de démonstration
    if (process.env.NODE_ENV === 'development') {
      console.log('[MANAGER_ACCOUNTS_GET] Mode développement détecté, utilisation de données de démo');
      return generateDemoAccounts();
    }
    
    return NextResponse.json({ error: `Erreur lors de la récupération des utilisateurs: ${error.message}` }, { status: 500 });
  }
}

/**
 * Générer des données de comptes fictifs pour les tests
 */
function generateDemoAccounts() {
  const roles = ['CUSTOMER', 'SELLER', 'MANAGER', 'SUPPORT'];
  const statuses = ['ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE'];
  
  const users = Array.from({ length: 50 }, (_, index) => {
    const role = roles[Math.floor(Math.random() * roles.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000));
    
    return {
      id: `user-${index + 1}`,
      name: `Utilisateur ${index + 1}`,
      email: `user${index + 1}@example.com`,
      role,
      image: `https://i.pravatar.cc/150?u=${index}`,
      phone: `+216 ${Math.floor(10000000 + Math.random() * 90000000)}`,
      emailVerified: status === 'ACTIVE',
      createdAt,
      updatedAt: new Date(createdAt.getTime() + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
      status,
      ordersCount: Math.floor(Math.random() * 20),
      transactionsCount: Math.floor(Math.random() * 15),
      walletBalance: Math.floor(Math.random() * 10000) / 100,
      store: role === 'SELLER' ? {
        id: `store-${index}`,
        name: `Magasin ${index}`,
        logo: `https://picsum.photos/seed/${index}/200/200`,
        isApproved: Math.random() > 0.3
      } : null
    };
  });
  
  return NextResponse.json({
    users,
    pagination: {
      currentPage: 1,
      totalPages: 5,
      totalItems: 50,
      itemsPerPage: 10
    }
  });
} 