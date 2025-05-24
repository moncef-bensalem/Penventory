import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    console.log('[API] Fetching orders chart data for admin dashboard');
    
    // Extract time period from query params (default to 'week')
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week';
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.warn('[API] Unauthorized access attempt to orders chart data');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    // Check user role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      console.warn(`[API] User ${session.user.email} tried to access orders chart without permission`);
      return NextResponse.json({ error: 'Accès restreint aux administrateurs et managers' }, { status: 403 });
    }
    
    // Get current date
    const now = new Date();
    let startDate;
    let interval;
    let format;
    
    // Set date range based on period
    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        interval = 'day';
        format = { day: 'numeric', month: 'short' };
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        interval = 'day';
        format = { day: 'numeric', month: 'short' };
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        interval = 'month';
        format = { month: 'short' };
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        interval = 'day';
        format = { day: 'numeric', month: 'short' };
    }
    
    // Execute the database query to get orders data
    const ordersData = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate
        },
        status: {
          not: 'CANCELLED'
        }
      },
      select: {
        createdAt: true,
        id: true
      }
    });
    
    // Format the data with dates and counts
    let formattedData;
    
    if (interval === 'day') {
      // Group by day
      const dateMap = new Map();
      
      // Initialize all days in the range
      let currentDate = new Date(startDate);
      while (currentDate <= now) {
        const dateKey = currentDate.toISOString().split('T')[0];
        dateMap.set(dateKey, 0);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Fill in the actual orders data
      ordersData.forEach(entry => {
        const dateKey = new Date(entry.createdAt).toISOString().split('T')[0];
        const currentCount = dateMap.get(dateKey) || 0;
        dateMap.set(dateKey, currentCount + 1);
      });
      
      // Convert map to array format needed for the chart
      formattedData = Array.from(dateMap).map(([date, count]) => {
        const dateObj = new Date(date);
        return {
          date: dateObj.toLocaleDateString('fr-FR', format),
          count: count
        };
      });
    } else {
      // Group by month
      const monthMap = new Map();
      
      // Initialize all months in the range
      let currentMonth = new Date(startDate);
      while (currentMonth <= now) {
        const monthKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}`;
        monthMap.set(monthKey, 0);
        currentMonth.setMonth(currentMonth.getMonth() + 1);
      }
      
      // Fill in the actual orders data
      ordersData.forEach(entry => {
        const entryDate = new Date(entry.createdAt);
        const monthKey = `${entryDate.getFullYear()}-${entryDate.getMonth() + 1}`;
        const currentCount = monthMap.get(monthKey) || 0;
        monthMap.set(monthKey, currentCount + 1);
      });
      
      // Convert map to array format needed for the chart
      formattedData = Array.from(monthMap).map(([monthKey, count]) => {
        const [year, month] = monthKey.split('-');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1);
        return {
          date: dateObj.toLocaleDateString('fr-FR', format),
          count: count
        };
      });
    }
    
    // Calculate total and average
    const total = formattedData.reduce((sum, item) => sum + item.count, 0);
    const average = total / formattedData.length || 0;
    
    const response = {
      data: formattedData,
      total,
      average,
      period
    };
    
    console.log(`[API] Successfully retrieved orders chart data for ${period}`);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error(`[API] Error fetching orders chart data: ${error.message}`);
    
    // In development, return demo data if DB error occurs
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Returning demo orders chart data');
      // Générer des données de démonstration différentes à chaque appel
      // en utilisant le paramètre de période pour varier les données
      return NextResponse.json(generateDemoOrdersData(period));
    }
    
    return NextResponse.json({ error: 'Erreur lors de la récupération des données de commandes' }, { status: 500 });
  }
}

// Helper function to generate demo data for development
function generateDemoOrdersData(period = 'week') {
  // Get current date
  const now = new Date();
  let startDate;
  let interval;
  let format;
  
  // Set date range based on period
  switch (period) {
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      interval = 'day';
      format = { day: 'numeric', month: 'short' };
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      interval = 'day';
      format = { day: 'numeric', month: 'short' };
      break;
    case 'year':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      interval = 'month';
      format = { month: 'short' };
      break;
    default:
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      interval = 'day';
      format = { day: 'numeric', month: 'short' };
  }
  
  // Generate data based on period
  const data = [];
  let total = 0;
  
  if (interval === 'day') {
    // Generate daily data
    let currentDate = new Date(startDate);
    while (currentDate <= now) {
      // Utiliser Date.now() pour avoir des valeurs différentes à chaque appel
      // Random orders between 5 and 50 with some variance based on timestamp
      const seed = currentDate.getTime() + Date.now() % 10000;
      const count = Math.floor((seed % 45) + 5);
      total += count;
      
      data.push({
        date: currentDate.toLocaleDateString('fr-FR', format),
        count
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else {
    // Generate monthly data
    let currentMonth = new Date(startDate);
    while (currentMonth <= now) {
      // Utiliser Date.now() pour avoir des valeurs différentes à chaque appel
      // Random orders between 50 and 500 with some variance based on timestamp
      const seed = currentMonth.getTime() + Date.now() % 10000;
      const count = Math.floor((seed % 450) + 50);
      total += count;
      
      data.push({
        date: currentMonth.toLocaleDateString('fr-FR', format),
        count
      });
      
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }
  }
  
  const average = total / data.length || 0;
  
  return {
    data,
    total,
    average,
    period
  };
}
