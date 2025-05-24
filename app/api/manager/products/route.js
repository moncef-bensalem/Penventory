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
 * Route pour récupérer tous les produits pour le manager
 * avec des options de filtrage et de pagination
 */
export async function GET(request) {
  try {
    console.log('[MANAGER_PRODUCTS_GET] Vérification de l\'authentification manager...');
    
    const session = await getServerSession(authOptions);
    
    // Vérifier si l'utilisateur est connecté et est un manager
    if (!session?.user || session.user.role !== 'MANAGER') {
      console.log('[MANAGER_PRODUCTS_GET] Non autorisé: rôle manager requis');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Récupérer les paramètres de requête pour le filtrage et la pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const categoryId = searchParams.get('categoryId');
    const storeId = searchParams.get('storeId');
    const searchTerm = searchParams.get('search');
    const status = searchParams.get('status');
    
    console.log(`[MANAGER_PRODUCTS_GET] Paramètres: page=${page}, limit=${limit}, categoryId=${categoryId}, storeId=${storeId}, search=${searchTerm}, status=${status}`);

    // Calculer le décalage pour la pagination
    const skip = (page - 1) * limit;

    // Construire la clause where pour le filtrage
    const whereClause = {};
    
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    
    if (storeId) {
      whereClause.storeId = storeId;
    }
    
    if (searchTerm) {
      whereClause.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }
    
    if (status === 'PENDING') {
      whereClause.approved = false;
    } else if (status === 'APPROVED') {
      whereClause.approved = true;
    }

    // Compter le nombre total de produits correspondant aux critères de filtrage
    const totalCount = await prisma.product.count({
      where: whereClause
    });

    // Récupérer les produits avec pagination et filtrage
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        store: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        _count: {
          select: {
            orderItems: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Calculer le nombre total de pages
    const totalPages = Math.ceil(totalCount / limit);

    console.log(`[MANAGER_PRODUCTS_GET] ${products.length} produits récupérés sur un total de ${totalCount}`);
    
    // Traiter les BigInt et les convertir en String
    const processedProducts = handleBigInt(products);
    
    // Retourner les produits avec les métadonnées de pagination
    return NextResponse.json({
      products: processedProducts || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('[MANAGER_PRODUCTS_GET] Erreur:', error);
    return NextResponse.json({ error: `Erreur lors de la récupération des produits: ${error.message}` }, { status: 500 });
  }
} 