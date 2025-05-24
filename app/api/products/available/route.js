import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Récupère tous les produits disponibles (stock > 0) dans la base de données.
 * Supporte le filtrage par catégorie, magasin et limite de résultats.
 * 
 * @param {Request} req - La requête HTTP.
 * @returns {NextResponse} La réponse HTTP avec les produits disponibles.
 */
export async function GET(req) {
  try {
    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const storeId = searchParams.get('storeId');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : undefined;
    
    // Construire les conditions de recherche avec stock > 0 par défaut
    const where = {
      stock: { gt: 0 }
    };
    
    // Filtrer par catégorie si spécifié
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    // Filtrer par magasin si spécifié
    if (storeId) {
      where.storeId = storeId;
    }
    
    // Récupérer les produits disponibles avec les relations
    const products = await prisma.product.findMany({
      where,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      ...(limit ? { take: limit } : {})
    });

    // Utiliser exactement le même format que l'API qui fonctionne
    return NextResponse.json({ products });
  } catch (error) {
    console.error('[AVAILABLE_PRODUCTS_GET]', error);
    return NextResponse.json({ error: `Erreur lors de la récupération des produits disponibles: ${error.message}` }, { status: 500 });
  }
}
