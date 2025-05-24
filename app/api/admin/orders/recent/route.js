import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/db';
import logger from '@/utils/logger';

export async function GET() {
  try {
    logger.info('[API] Fetching recent orders');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      logger.warn('[API] Unauthorized access attempt to recent orders');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    // Check user role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      logger.warn(`[API] User ${session.user.email} tried to access recent orders without permission`);
      return NextResponse.json({ error: 'Accès restreint aux administrateurs et managers' }, { status: 403 });
    }
    
    // Fetch 10 most recent orders
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { name: true, email: true, image: true }
        },
        items: {
          select: {
            quantity: true,
            price: true,
            product: {
              select: { name: true, image: true }
            }
          }
        }
      }
    });
    
    logger.info(`[API] Successfully retrieved ${recentOrders.length} recent orders`);
    return NextResponse.json(recentOrders);
    
  } catch (error) {
    logger.error(`[API] Error fetching recent orders: ${error.message}`);
    
    // In development, return demo data if DB error occurs
    if (process.env.NODE_ENV === 'development') {
      logger.info('[API] Returning demo orders data');
      return NextResponse.json(generateDemoOrders());
    }
    
    return NextResponse.json({ error: 'Erreur lors de la récupération des commandes récentes' }, { status: 500 });
  }
}

// Helper function to generate demo orders for development
function generateDemoOrders() {
  const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  const paymentStatuses = ['PAID', 'PENDING', 'FAILED', 'REFUNDED'];
  
  return Array.from({ length: 10 }, (_, i) => {
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const itemCount = Math.floor(1 + Math.random() * 5);
    const orderDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
    const total = Math.floor(50 + Math.random() * 950);
    
    return {
      id: `demo-${i}`,
      number: orderNumber,
      createdAt: orderDate,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
      total: total,
      customer: {
        name: `Client Demo ${i+1}`,
        email: `client${i+1}@example.com`,
        image: null
      },
      items: Array.from({ length: itemCount }, (_, j) => ({
        id: `item-${i}-${j}`,
        quantity: Math.floor(1 + Math.random() * 3),
        price: Math.floor(10 + Math.random() * 100),
        product: {
          name: `Produit Demo ${j+1}`,
          image: null
        }
      }))
    };
  });
} 