import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/db';
import logger from '@/utils/logger';

export async function GET(request) {
  try {
    logger.info('[API] Fetching top products data for admin dashboard');
    
    // Extract limit from query params (default to 5)
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5', 10);
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      logger.warn('[API] Unauthorized access attempt to top products data');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    // Check user role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      logger.warn(`[API] User ${session.user.email} tried to access top products without permission`);
      return NextResponse.json({ error: 'Accès restreint aux administrateurs et managers' }, { status: 403 });
    }
    
    // Get top selling products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: limit
    });
    
    // Get detailed product info for the top products
    const productDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            stock: true,
            category: {
              select: {
                name: true
              }
            },
            store: {
              select: {
                name: true,
                id: true
              }
            }
          }
        });
        
        return {
          id: product?.id,
          name: product?.name,
          price: product?.price,
          image: product?.images[0] || null,
          category: product?.category?.name,
          store: product?.store?.name,
          storeId: product?.store?.id,
          stock: product?.stock,
          totalSold: item._sum.quantity
        };
      })
    );
    
    logger.info(`[API] Successfully retrieved ${productDetails.length} top products`);
    return NextResponse.json({
      products: productDetails
    });
    
  } catch (error) {
    logger.error(`[API] Error fetching top products data: ${error.message}`);
    
    // In development, return demo data if DB error occurs
    if (process.env.NODE_ENV === 'development') {
      logger.info('[API] Returning demo top products data');
      return NextResponse.json({
        products: generateDemoTopProducts(5)
      });
    }
    
    return NextResponse.json({ error: 'Erreur lors de la récupération des produits populaires' }, { status: 500 });
  }
}

// Helper function to generate demo data for development
function generateDemoTopProducts(count = 5) {
  const categories = ['Électronique', 'Vêtements', 'Maison', 'Beauté', 'Alimentation'];
  const storeNames = ['TechStore', 'FashionHub', 'HomeDecor', 'BeautyShop', 'GourmetMarket'];
  
  return Array.from({ length: count }, (_, i) => {
    // Create a product number between 100-999
    const productNum = Math.floor(Math.random() * 900) + 100;
    const categoryIndex = Math.floor(Math.random() * categories.length);
    const storeName = storeNames[Math.floor(Math.random() * storeNames.length)];
    
    return {
      id: `prod-${i+1}`,
      name: `Produit Populaire ${productNum}`,
      price: Math.floor(Math.random() * 15000) + 1000, // Price between 1000-16000
      image: `/images/products/product-${i+1}.jpg`,
      category: categories[categoryIndex],
      store: storeName,
      storeId: `store-${Math.floor(Math.random() * 10) + 1}`,
      stock: Math.floor(Math.random() * 50) + 5,
      totalSold: Math.floor(Math.random() * 300) + 50 // Units sold between 50-350
    };
  });
} 