import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Fonction pour gérer la sérialisation des BigInt
function handleBigInt(data) {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

export async function GET(request) {
  try {
    console.log('[API] Fetching recent orders data for admin dashboard');
    
    // Extract limit from query params (default to 10)
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.warn('[API] Unauthorized access attempt to recent orders data');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    // Check user role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      console.warn(`[API] User ${session.user.email} tried to access recent orders without permission`);
      return NextResponse.json({ error: 'Accès restreint aux administrateurs et managers' }, { status: 403 });
    }

    // Get total count for pagination
    const totalCount = await prisma.order.count();
    
    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      }
    });
    
    // Format the orders for the data table
    const formattedOrders = recentOrders.map(order => ({
      id: order.id,
      number: order.number,
      date: order.createdAt,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total,
      customer_name: order.customer?.name || 'Client inconnu',
      customer_email: order.customer?.email || '-'
    }));
    
    console.log(`[API] Successfully retrieved ${formattedOrders.length} recent orders for page ${page}`);
    
    // Sérialiser les données pour éviter les problèmes avec BigInt
    const responseData = handleBigInt({
      data: formattedOrders,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    });
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error(`[API] Error fetching recent orders data: ${error.message}`);
    
    // In development, return demo data if DB error occurs
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Returning demo orders data');
      return NextResponse.json({
        data: generateDemoOrders(limit),
        total: 30,
        page,
        limit,
        totalPages: 3
      });
    }
    
    return NextResponse.json({ error: 'Erreur lors de la récupération des commandes récentes' }, { status: 500 });
  }
}

// Helper function to generate demo orders for development
function generateDemoOrders(count = 10) {
  const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  const paymentStatuses = ['PAID', 'PENDING', 'FAILED', 'REFUNDED'];
  
  return Array.from({ length: count }, (_, i) => {
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
    const total = Math.floor(50 + Math.random() * 950);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
    
    return {
      id: `demo-${i}`,
      number: orderNumber,
      date: orderDate,
      status: status,
      paymentStatus: paymentStatus,
      total: total,
      customer_name: `Client Demo ${i+1}`,
      customer_email: `client${i+1}@example.com`
    };
  });
} 