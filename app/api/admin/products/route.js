import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

/**
 * Route pour récupérer tous les produits pour l'administrateur
 * avec des options de filtrage et de pagination
 */
export async function GET(request) {
  try {
    console.log('[ADMIN_PRODUCTS_GET] Vérification de l\'authentification admin...');
    
    const session = await getServerSession(authOptions);
    
    // Vérifier si l'utilisateur est connecté et est un administrateur
    if (!session?.user || session.user.role !== 'ADMIN') {
      console.log('[ADMIN_PRODUCTS_GET] Non autorisé: rôle administrateur requis');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Récupérer les paramètres de requête pour le filtrage et la pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const categoryId = searchParams.get('categoryId');
    const storeId = searchParams.get('storeId');
    const searchTerm = searchParams.get('search');
    
    console.log(`[ADMIN_PRODUCTS_GET] Paramètres: page=${page}, limit=${limit}, categoryId=${categoryId}, storeId=${storeId}, search=${searchTerm}`);

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

    console.log(`[ADMIN_PRODUCTS_GET] ${products.length} produits récupérés sur un total de ${totalCount}`);
    
    // Retourner les produits avec les métadonnées de pagination
    return NextResponse.json({
      products: products || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('[ADMIN_PRODUCTS_GET] Erreur:', error);
    return NextResponse.json({ error: `Erreur lors de la récupération des produits: ${error.message}` }, { status: 500 });
  }
}
