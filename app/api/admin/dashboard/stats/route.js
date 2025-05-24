import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/db';
import logger from '@/utils/logger';

export async function GET() {
  try {
    logger.info('[API] Fetching admin dashboard statistics');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      logger.warn('[API] Unauthorized access attempt to dashboard stats');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    // Check user role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      logger.warn(`[API] User ${session.user.email} tried to access dashboard stats without permission`);
      return NextResponse.json({ error: 'Accès restreint aux administrateurs et managers' }, { status: 403 });
    }
    
    // Calculate date ranges
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    
    // Get orders count
    const totalOrders = await prisma.order.count();
    const ordersThisMonth = await prisma.order.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth
        }
      }
    });
    
    // Get revenue data
    const revenueQuery = await prisma.order.aggregate({
      where: {
        status: { notIn: ['CANCELLED', 'REFUNDED'] }
      },
      _sum: {
        total: true
      }
    });
    
    const revenueThisMonth = await prisma.order.aggregate({
      where: {
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
        createdAt: {
          gte: firstDayOfMonth
        }
      },
      _sum: {
        total: true
      }
    });
    
    const revenueLastMonth = await prisma.order.aggregate({
      where: {
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
        createdAt: {
          gte: lastMonth,
          lt: firstDayOfMonth
        }
      },
      _sum: {
        total: true
      }
    });
    
    // Get user statistics
    const totalUsers = await prisma.user.count();
    const totalSellers = await prisma.user.count({
      where: { role: 'SELLER' }
    });
    const newUsersThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth
        }
      }
    });
    
    // Get product statistics
    const totalProducts = await prisma.product.count();
    const pendingProducts = await prisma.product.count({
      where: { status: 'PENDING' }
    });
    
    // Prepare response
    const stats = {
      orders: {
        total: totalOrders,
        thisMonth: ordersThisMonth,
        growth: calculateGrowth(ordersThisMonth, await getLastMonthOrderCount())
      },
      revenue: {
        total: revenueQuery._sum.total || 0,
        thisMonth: revenueThisMonth._sum.total || 0,
        lastMonth: revenueLastMonth._sum.total || 0,
        growth: calculateGrowth(
          revenueThisMonth._sum.total || 0, 
          revenueLastMonth._sum.total || 0
        )
      },
      users: {
        total: totalUsers,
        sellers: totalSellers,
        newThisMonth: newUsersThisMonth,
        growth: calculateGrowth(newUsersThisMonth, await getLastMonthNewUsers())
      },
      products: {
        total: totalProducts,
        pending: pendingProducts
      }
    };
    
    logger.info('[API] Successfully retrieved dashboard statistics');
    return NextResponse.json(stats);
    
  } catch (error) {
    logger.error(`[API] Error fetching dashboard stats: ${error.message}`);
    
    // In development, return demo data if DB error occurs
    if (process.env.NODE_ENV === 'development') {
      logger.info('[API] Returning demo dashboard stats');
      return NextResponse.json(generateDemoStats());
    }
    
    return NextResponse.json({ error: 'Erreur lors de la récupération des statistiques' }, { status: 500 });
  }
}

// Helper function to get last month's order count
async function getLastMonthOrderCount() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  
  return prisma.order.count({
    where: {
      createdAt: {
        gte: lastMonth,
        lt: firstDayOfMonth
      }
    }
  });
}

// Helper function to get last month's new users
async function getLastMonthNewUsers() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  
  return prisma.user.count({
    where: {
      createdAt: {
        gte: lastMonth,
        lt: firstDayOfMonth
      }
    }
  });
}

// Helper function to calculate growth percentage
function calculateGrowth(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

// Helper function to generate demo stats for development
function generateDemoStats() {
  return {
    orders: {
      total: 1256,
      thisMonth: 178,
      growth: 12
    },
    revenue: {
      total: 285750,
      thisMonth: 42600,
      lastMonth: 38600,
      growth: 10
    },
    users: {
      total: 8754,
      sellers: 342,
      newThisMonth: 256,
      growth: 8
    },
    products: {
      total: 4589,
      pending: 127
    }
  };
} 