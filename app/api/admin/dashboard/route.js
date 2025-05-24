import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Fonction pour gérer la sérialisation des BigInt
function handleBigInt(data) {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

// Vérification de l'autorisation admin
async function checkAdminAuth() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return false;
    }
    return { authorized: true, admin: session.user };
  } catch (error) {
    console.error('[ADMIN_DASHBOARD] Erreur d\'authentification:', error);
    return false;
  }
}

export async function GET() {
  try {
    console.log('[ADMIN_DASHBOARD_GET] Démarrage de la requête...');
    
    // Vérifier l'authentification
    const auth = await checkAdminAuth();
    if (!auth && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    
    // Date courante et calcul des périodes
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    
    // Statistiques des commandes par période
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      cancelledOrders,
      todayOrders,
      yesterdayOrders,
      monthOrders,
      yearOrders
    ] = await Promise.all([
      // Total des commandes
      prisma.order.count(),
      // Commandes en attente
      prisma.order.count({
        where: {
          status: {
            in: ['PENDING', 'EN_ATTENTE']
          }
        }
      }),
      // Commandes en cours de traitement
      prisma.order.count({
        where: {
          status: {
            in: ['PROCESSING', 'EN_PREPARATION', 'SHIPPED', 'EXPEDIEE']
          }
        }
      }),
      // Commandes livrées
      prisma.order.count({
        where: {
          status: {
            in: ['DELIVERED', 'LIVREE']
          }
        }
      }),
      // Commandes annulées
      prisma.order.count({
        where: {
          status: {
            in: ['CANCELLED', 'ANNULEE']
          }
        }
      }),
      // Commandes d'aujourd'hui
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: today
          }
        },
        select: {
          total: true
        }
      }),
      // Commandes d'hier
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: yesterday,
            lt: today
          }
        },
        select: {
          total: true
        }
      }),
      // Commandes du mois
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: firstDayOfMonth
          }
        },
        select: {
          total: true
        }
      }),
      // Commandes de l'année
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: firstDayOfYear
          }
        },
        select: {
          total: true
        }
      })
    ]);
    
    // Calculer les montants totaux des commandes
    const calculateTotal = (orders) => orders.reduce((sum, order) => sum + Number(order.total), 0);
    
    const todayTotal = calculateTotal(todayOrders);
    const yesterdayTotal = calculateTotal(yesterdayOrders);
    const monthTotal = calculateTotal(monthOrders);
    const yearTotal = calculateTotal(yearOrders);
    
    // Obtenir des statistiques supplémentaires
    const [
      totalUsers,
      totalProducts,
      totalStores,
      recentOrders,
      topProducts
    ] = await Promise.all([
      // Nombre total d'utilisateurs
      prisma.user.count(),
      // Nombre total de produits
      prisma.product.count(),
      // Nombre total de magasins
      prisma.store.count(),
      // Commandes récentes
      prisma.order.findMany({
        take: 5,
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
      }),
      // Produits les plus vendus
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 5
      })
    ]);

    // Obtenir les détails des produits les plus vendus
    const topProductsDetails = await prisma.product.findMany({
      where: {
        id: {
          in: topProducts.map(p => p.productId)
        }
      },
      select: {
        id: true,
        name: true,
        price: true,
        images: true
      }
    });

    // Associer les quantités aux détails des produits
    const topProductsWithDetails = topProducts.map(tp => {
      const product = topProductsDetails.find(p => p.id === tp.productId);
      return {
        id: tp.productId,
        name: product?.name || 'Produit inconnu',
        image: product?.images?.[0] || null,
        price: product?.price || 0,
        quantity: tp._sum.quantity
      };
    });

    // Transformer les commandes récentes pour la réponse
    const formattedRecentOrders = recentOrders.map(order => ({
      id: order.id,
      number: order.number,
      date: order.createdAt,
      status: order.status,
      total: order.total,
      customer: order.customer ? {
        name: order.customer.name,
        email: order.customer.email
      } : null
    }));
    
    // Créer les données de ventes pour les graphiques (par semaine)
    // Obtenir les données des 7 derniers jours
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }).reverse();
    
    const salesByDay = await Promise.all(
      last7Days.map(async (day) => {
        const nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const orders = await prisma.order.findMany({
          where: {
            createdAt: {
              gte: day,
              lt: nextDay
            }
          },
          select: {
            total: true
          }
        });
        
        return {
          day: day.toISOString().split('T')[0],
          totalSales: calculateTotal(orders)
        };
      })
    );
    
    // Préparer les données de réponse
    const dashboardData = {
      orderStats: {
        total: totalOrders,
        pending: pendingOrders,
        processing: processingOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders
      },
      salesStats: {
        today: todayTotal,
        yesterday: yesterdayTotal,
        thisMonth: monthTotal,
        thisYear: yearTotal
      },
      generalStats: {
        totalUsers,
        totalProducts,
        totalStores
      },
      recentOrders: formattedRecentOrders,
      topProducts: topProductsWithDetails,
      salesCharts: {
        weeklySales: salesByDay
      }
    };
    
    // Gérer les BigInt dans les données
    const responseData = handleBigInt(dashboardData);
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[ADMIN_DASHBOARD_GET] Erreur:', error);
    return NextResponse.json({ 
      error: "Erreur lors de la récupération des données du tableau de bord",
      details: error.message 
    }, { status: 500 });
  }
} 