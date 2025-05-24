import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('[PRODUCTS_COUNTS_GET] Fetching product counts by category...');
    
    // Récupérer les comptages de produits par catégorie
    const categoryProducts = await prisma.product.groupBy({
      by: ['categoryId'],
      _count: {
        id: true
      }
    });
    
    // Formater les résultats en un objet plus facile à utiliser
    const categoryCounts = {};
    categoryProducts.forEach(item => {
      if (item.categoryId) {
        categoryCounts[item.categoryId] = item._count.id;
      }
    });
    
    console.log('[PRODUCTS_COUNTS_GET] Product counts retrieved successfully');
    return NextResponse.json({ 
      success: true, 
      categoryCounts 
    });
  } catch (error) {
    console.error('[PRODUCTS_COUNTS_GET] Error:', error);
    return NextResponse.json(
      { 
        error: `Erreur lors de la récupération des comptages de produits: ${error.message}`,
        categoryCounts: {} 
      },
      { status: 500 }
    );
  }
} 