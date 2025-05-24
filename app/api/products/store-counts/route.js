import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('[PRODUCTS_STORE_COUNTS_GET] Fetching product counts for approved stores...');
    
    // 1. D'abord, récupérer les IDs des magasins approuvés
    const approvedStores = await prisma.store.findMany({
      where: {
        isApproved: true
      },
      select: {
        id: true
      }
    });
    
    const approvedStoreIds = approvedStores.map(store => store.id);
    console.log(`[PRODUCTS_STORE_COUNTS_GET] Found ${approvedStoreIds.length} approved stores`);
    
    // 2. Récupérer les comptages de produits uniquement pour les magasins approuvés
    const storeProducts = await prisma.product.groupBy({
      by: ['storeId'],
      _count: {
        id: true
      },
      where: {
        storeId: {
          in: approvedStoreIds
        }
      }
    });
    
    // Formater les résultats en un objet plus facile à utiliser
    const storeCounts = {};
    storeProducts.forEach(item => {
      if (item.storeId) {
        storeCounts[item.storeId] = item._count.id;
      }
    });
    
    console.log('[PRODUCTS_STORE_COUNTS_GET] Product counts retrieved successfully');
    return NextResponse.json({ 
      success: true, 
      storeCounts 
    });
  } catch (error) {
    console.error('[PRODUCTS_STORE_COUNTS_GET] Error:', error);
    return NextResponse.json(
      { 
        error: `Erreur lors de la récupération des comptages de produits par magasin: ${error.message}`,
        storeCounts: {} 
      },
      { status: 500 }
    );
  }
} 