import { PrismaClient } from "@prisma/client";

// Éviter de créer plusieurs instances de Prisma Client pendant le développement
// en utilisant une variable globale
const globalForPrisma = global;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Fonction pour obtenir des statistiques générales
export async function getStats() {
  try {
    const [
      userCount,
      productCount,
      orderCount,
      storeCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.store.count()
    ]);

    return {
      userCount,
      productCount,
      orderCount,
      storeCount
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    throw error;
  }
}

// Fonction pour obtenir les ventes récentes
export async function getRecentSales(limit = 5) {
  try {
    const recentOrders = await prisma.order.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return recentOrders;
  } catch (error) {
    console.error("Erreur lors de la récupération des ventes récentes:", error);
    throw error;
  }
}

// Fonction pour obtenir les produits populaires
export async function getPopularProducts(limit = 5) {
  try {
    const products = await prisma.product.findMany({
      take: limit,
      orderBy: {
        rating: 'desc'
      },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        rating: true
      }
    });

    return products;
  } catch (error) {
    console.error("Erreur lors de la récupération des produits populaires:", error);
    throw error;
  }
}

// Fonction pour obtenir les données de vente par période
export async function getSalesByPeriod(period = 'month') {
  try {
    const now = new Date();
    let startDate;

    // Déterminer la date de début en fonction de la période
    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      select: {
        createdAt: true,
        total: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return orders;
  } catch (error) {
    console.error(`Erreur lors de la récupération des ventes par ${period}:`, error);
    throw error;
  }
}
