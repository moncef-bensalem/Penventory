import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Middleware pour vérifier le rôle vendeur
async function checkSellerRole() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session data:', JSON.stringify(session, null, 2));
    
    if (!session?.user?.id) {
      console.log('No user session found');
      return false;
    }

    // Vérifier si l'utilisateur a le rôle SELLER
    if (session.user.role !== 'SELLER') {
      console.log('User is not a seller, role:', session.user.role);
      return false;
    }
    
    // Récupérer le magasin associé à l'utilisateur
    const store = await prisma.store.findFirst({
      where: {
        ownerId: session.user.id
      }
    });
    
    console.log('Found store:', JSON.stringify(store, null, 2));
    
    if (!store) {
      console.log('No store found for user ID:', session.user.id);
      return false;
    }
    
    return { store };
  } catch (error) {
    console.error('Error in checkSellerRole:', error);
    return false;
  }
}

export async function GET(request) {
  try {
    const sellerData = await checkSellerRole();
    if (!sellerData) {
      return NextResponse.json({ error: "Non autorisé ou magasin non trouvé" }, { status: 401 });
    }

    const { store } = sellerData;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // week, month, year, all
    
    // Déterminer la date de début pour la période actuelle
    const now = new Date();
    let startDate = new Date();
    let previousPeriodStart = new Date();
    
    // Calculer la date de début selon la période
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 14);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 2);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 2);
        break;
      default: // 'all'
        startDate = new Date(2023, 0, 1);
        previousPeriodStart = new Date(2022, 0, 1);
    }
    
    // Récupérer les commandes pour la période actuelle
    const currentPeriodOrders = await prisma.order.findMany({
      where: {
        storeId: store.id,
        createdAt: {
          gte: startDate
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                categoryId: true,
                images: true
              }
            }
          }
        }
      }
    });
    
    // Récupérer les commandes pour la période précédente
    const previousPeriodOrders = await prisma.order.findMany({
      where: {
        storeId: store.id,
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate
        }
      }
    });

    // Calculer les statistiques
    // Inclure toutes les commandes, pas seulement celles complétées, pour le chiffre d'affaires total
    console.log('Nombre de commandes pour la période actuelle:', currentPeriodOrders.length);
    
    const totalRevenue = currentPeriodOrders.reduce((sum, order) => {
      console.log(`Commande ID: ${order.id}, Total: ${order.total}`);
      return sum + order.total;
    }, 0);
    
    console.log('Chiffre d\'affaires total:', totalRevenue);
    
    const totalOrders = currentPeriodOrders.length;
    
    // Utiliser Number() pour convertir les BigInt en nombre
    const totalProductsSold = currentPeriodOrders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => {
        // Convertir BigInt en nombre si nécessaire
        const quantity = typeof item.quantity === 'bigint' ? Number(item.quantity) : item.quantity;
        return itemSum + quantity;
      }, 0), 0);
    
    // Calculer la croissance des revenus
    const previousRevenue = previousPeriodOrders.reduce((sum, order) => sum + order.total, 0);
    const revenueGrowth = previousRevenue === 0
      ? 100
      : ((totalRevenue - previousRevenue) / previousRevenue) * 100;

    // Compter les commandes par statut
    const ordersByStatus = {};
    currentPeriodOrders.forEach(order => {
      const status = order.status;
      ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;
    });

    // Calculer les revenus par jour pour le graphique
    const revenueByDay = {};
    
    // Formater les dates pour le graphique
    currentPeriodOrders.forEach(order => {
      const date = new Date(order.createdAt);
      const dateString = date.toISOString().split('T')[0];
      
      if (!revenueByDay[dateString]) {
        revenueByDay[dateString] = 0;
      }
      
      revenueByDay[dateString] += order.total;
    });
    
    // Convertir en tableau pour le graphique
    const revenueData = Object.entries(revenueByDay).map(([date, revenue]) => ({
      date,
      revenue
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculer les produits les plus vendus
    const productSales = {};
    
    currentPeriodOrders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product.id;
        
        if (!productSales[productId]) {
          productSales[productId] = {
            id: productId,
            name: item.product.name,
            quantity: 0,
            revenue: 0,
            image: item.product.images && item.product.images.length > 0 ? item.product.images[0] : null
          };
        }
        
        // Convertir BigInt en nombre si nécessaire
        const quantity = typeof item.quantity === 'bigint' ? Number(item.quantity) : item.quantity;
        productSales[productId].quantity += quantity;
        productSales[productId].revenue += item.price * quantity;
      });
    });
    
    // Convertir en tableau et trier par quantité
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Calculer les revenus par catégorie
    const categoryRevenue = {};
    
    currentPeriodOrders.forEach(order => {
      order.items.forEach(item => {
        const categoryId = item.product.categoryId;
        
        if (categoryId) {
          if (!categoryRevenue[categoryId]) {
            categoryRevenue[categoryId] = {
              id: categoryId,
              revenue: 0
            };
          }
          
          // Convertir BigInt en nombre si nécessaire
          const quantity = typeof item.quantity === 'bigint' ? Number(item.quantity) : item.quantity;
          categoryRevenue[categoryId].revenue += item.price * quantity;
        }
      });
    });
    
    // Récupérer les noms des catégories
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: Object.keys(categoryRevenue)
        }
      },
      select: {
        id: true,
        name: true
      }
    });
    
    // Ajouter les noms des catégories
    categories.forEach(category => {
      if (categoryRevenue[category.id]) {
        categoryRevenue[category.id].name = category.name;
      }
    });
    
    // Convertir en tableau et trier par revenu
    const revenueByCategory = Object.values(categoryRevenue)
      .sort((a, b) => b.revenue - a.revenue);

    // Calculer la croissance des commandes
    const ordersGrowth = previousPeriodOrders.length === 0
      ? 100
      : ((totalOrders - previousPeriodOrders.length) / previousPeriodOrders.length) * 100;

    // Calculer le nombre de clients uniques
    const uniqueCustomers = new Set(currentPeriodOrders.map(order => order.customerId)).size;
    const uniquePreviousCustomers = new Set(previousPeriodOrders.map(order => order.customerId)).size;
    
    // Calculer la croissance des clients
    const customersGrowth = uniquePreviousCustomers === 0
      ? 100
      : ((uniqueCustomers - uniquePreviousCustomers) / uniquePreviousCustomers) * 100;

    // Calculer la croissance des produits vendus
    const previousProductsSold = previousPeriodOrders.reduce((sum, order) => 
      sum + (order.items ? order.items.reduce((itemSum, item) => {
        // Convertir BigInt en nombre si nécessaire
        const quantity = typeof item.quantity === 'bigint' ? Number(item.quantity) : item.quantity;
        return itemSum + quantity;
      }, 0) : 0), 0);
    
    const productsGrowth = previousProductsSold === 0
      ? 100
      : ((totalProductsSold - previousProductsSold) / previousProductsSold) * 100;

    const data = {
      overview: {
        revenue: totalRevenue,
        orders: totalOrders,
        productsSold: Number(totalProductsSold), // Assurer la conversion en nombre
        customers: uniqueCustomers,
        revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
        ordersGrowth: parseFloat(ordersGrowth.toFixed(2)),
        customersGrowth: parseFloat(customersGrowth.toFixed(2)),
        productsGrowth: parseFloat(productsGrowth.toFixed(2)),
        averageOrderValue: totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0
      },
      revenueData,
      ordersByStatus,
      categoryRevenue: revenueByCategory,
      topProducts
    };
    
    // Sérialiser la réponse pour gérer les BigInt
    const serializedData = JSON.parse(
      JSON.stringify(data, (key, value) => 
        typeof value === 'bigint' ? Number(value) : value
      )
    );

    return NextResponse.json(serializedData);
  } catch (error) {
    console.error("Erreur lors de la récupération des revenus:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des revenus: " + error.message },
      { status: 500 }
    );
  }
}
