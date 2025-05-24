import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    console.log('[API] Fetching categories summary data for admin dashboard');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.warn('[API] Unauthorized access attempt to categories summary data');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    // Check user role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      console.warn(`[API] User ${session.user.email} tried to access categories summary without permission`);
      return NextResponse.json({ error: 'Accès restreint aux administrateurs et managers' }, { status: 403 });
    }
    
    // Get categories with product counts
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    
    // Since OrderItem doesn't directly have categoryId, we need to get this data differently
    // First get all products with their categories
    const products = await prisma.product.findMany({
      select: {
        id: true,
        categoryId: true
      }
    });
    
    // Create a map of product to category for quick lookup
    const productCategoryMap = {};
    products.forEach(product => {
      productCategoryMap[product.id] = product.categoryId;
    });
    
    // Get order items with their product data
    const orderItems = await prisma.orderItem.findMany({
      select: {
        productId: true,
        price: true,
        quantity: true
      }
    });
    
    // Manually group by category
    const categorySalesMap = {};
    orderItems.forEach(item => {
      const categoryId = productCategoryMap[item.productId];
      if (categoryId) {
        if (!categorySalesMap[categoryId]) {
          categorySalesMap[categoryId] = {
            totalPrice: 0,
            totalQuantity: 0
          };
        }
        categorySalesMap[categoryId].totalPrice += item.price;
        categorySalesMap[categoryId].totalQuantity += Number(item.quantity);
      }
    });
    
    // Merge data and format for frontend
    const formattedCategories = categories.map(category => {
      const sales = categorySalesMap[category.id] || { totalPrice: 0, totalQuantity: 0 };
      
      return {
        id: category.id,
        name: category.name,
        image: category.image,
        productCount: category._count.products,
        totalSales: sales.totalPrice,
        totalQuantity: sales.totalQuantity
      };
    }).sort((a, b) => b.totalSales - a.totalSales);
    
    console.log(`[API] Successfully retrieved ${formattedCategories.length} categories summary`);
    return NextResponse.json({
      categories: formattedCategories
    });
    
  } catch (error) {
    console.error(`[API] Error fetching categories summary data: ${error.message}`);
    
    // In development, return demo data if DB error occurs
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Returning demo categories summary data');
      return NextResponse.json({
        categories: generateDemoCategories()
      });
    }
    
    return NextResponse.json({ error: 'Erreur lors de la récupération des données des catégories' }, { status: 500 });
  }
}

// Helper function to generate demo data for development
function generateDemoCategories() {
  const categories = [
    { name: 'Writing Tools', image: '/images/categories/writing-tools.jpg' },
    { name: 'Paper Products', image: '/images/categories/paper-products.jpg' },
    { name: 'Books & Stories', image: '/images/categories/books.jpg' },
    { name: 'Office Supplies', image: '/images/categories/office-supplies.jpg' },
    { name: 'Art/Craft Supplies', image: '/images/categories/art-supplies.jpg' },
    { name: 'School Supplies', image: '/images/categories/school-supplies.jpg' },
    { name: 'Technology & Accessories', image: '/images/categories/technology.jpg' },
    { name: 'Gifts & Games', image: '/images/categories/gifts.jpg' }
  ];
  
  return categories.map((category, index) => {
    const productCount = Math.floor(Math.random() * 500) + 50;
    const averagePrice = Math.floor(Math.random() * 5000) + 1000;
    const averageQuantity = Math.floor(Math.random() * 30) + 5;
    const totalQuantity = averageQuantity * productCount;
    const totalSales = averagePrice * totalQuantity;
    
    return {
      id: `cat-${index + 1}`,
      name: category.name,
      image: category.image,
      productCount,
      totalSales,
      totalQuantity
    };
  }).sort((a, b) => b.totalSales - a.totalSales);
}