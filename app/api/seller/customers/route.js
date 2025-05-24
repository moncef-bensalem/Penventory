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

/**
 * Récupère la liste des clients pour un magasin spécifique.
 * 
 * @param {Request} request - La requête HTTP.
 * @returns {NextResponse} La réponse HTTP avec la liste des clients.
 */
export async function GET(request) {
  try {
    const sellerData = await checkSellerRole();
    if (!sellerData) {
      return NextResponse.json({ error: "Non autorisé ou magasin non trouvé" }, { status: 401 });
    }

    const { store } = sellerData;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Vérifier si c'est une demande de détails client
    const customerId = searchParams.get('id');
    if (customerId) {
      return getCustomerDetails(customerId, store.id);
    }

    // Construire la requête pour récupérer les clients qui ont commandé dans ce magasin
    const customersQuery = {
      where: {
        orders: {
          some: {
            storeId: store.id
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        role: true, // Ajouter le rôle
        createdAt: true,
        _count: {
          select: {
            orders: {
              where: {
                storeId: store.id
              }
            }
          }
        }
      }
    };

    // Ajouter la recherche si nécessaire
    if (search) {
      customersQuery.where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ];
    }

    // Récupérer les clients paginés
    const [customers, totalCustomers] = await prisma.$transaction([
      prisma.user.findMany({
        ...customersQuery,
        orderBy: {
          [sortField === 'totalOrders' ? '_count.orders' : 
           sortField === 'lastOrder' ? 'createdAt' : 
           sortField]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.user.count({
        where: customersQuery.where
      })
    ]);

    // Récupérer les informations supplémentaires pour chaque client
    const customersWithDetails = await Promise.all(
      customers.map(async (customer) => {
        // Récupérer le total dépensé par ce client dans ce magasin
        const orders = await prisma.order.findMany({
          where: {
            customerId: customer.id,
            storeId: store.id
          },
          select: {
            total: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
        const lastOrderDate = orders.length > 0 ? orders[0].createdAt : null;

        return {
          ...customer,
          totalOrders: customer._count.orders,
          totalSpent,
          lastOrderDate,
          _count: undefined
        };
      })
    );

    // Calculer les statistiques
    const totalOrdersCount = customersWithDetails.reduce((sum, customer) => sum + customer.totalOrders, 0);
    const totalRevenue = customersWithDetails.reduce((sum, customer) => sum + customer.totalSpent, 0);
    const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
    const averageRevenuePerCustomer = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
    
    // Calculer la répartition des clients par date d'inscription
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    
    const newCustomers = customersWithDetails.filter(c => new Date(c.createdAt) >= oneMonthAgo).length;
    const recentCustomers = customersWithDetails.filter(c => 
      new Date(c.createdAt) >= threeMonthsAgo && new Date(c.createdAt) < oneMonthAgo
    ).length;
    const regularCustomers = customersWithDetails.filter(c => 
      new Date(c.createdAt) >= sixMonthsAgo && new Date(c.createdAt) < threeMonthsAgo
    ).length;
    const loyalCustomers = customersWithDetails.filter(c => new Date(c.createdAt) < sixMonthsAgo).length;

    return NextResponse.json({
      customers: customersWithDetails,
      pagination: {
        page,
        limit,
        total: totalCustomers,
        totalPages: Math.ceil(totalCustomers / limit)
      },
      stats: {
        totalCustomers,
        totalOrdersCount,
        totalRevenue,
        averageOrderValue,
        averageRevenuePerCustomer,
        customerSegments: {
          new: newCustomers,
          recent: recentCustomers,
          regular: regularCustomers,
          loyal: loyalCustomers
        }
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des clients:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des clients" }, { status: 500 });
  }
}

/**
 * Récupère les détails d'un client spécifique.
 * 
 * @param {string} customerId - L'ID du client.
 * @param {number} storeId - L'ID du magasin.
 * @returns {NextResponse} La réponse HTTP avec les détails du client.
 */
export async function POST(request) {
  try {
    const sellerData = await checkSellerRole();
    if (!sellerData) {
      return NextResponse.json({ error: "Non autorisé ou magasin non trouvé" }, { status: 401 });
    }

    const { store } = sellerData;
    const data = await request.json();
    const { customerId } = data;

    // Récupérer les détails du client
    return await getCustomerDetails(customerId, store.id);
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du client:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des détails du client" }, { status: 500 });
  }
}

/**
 * Récupère les détails d'un client spécifique.
 * 
 * @param {string} customerId - L'ID du client.
 * @param {number} storeId - L'ID du magasin.
 * @returns {NextResponse} La réponse HTTP avec les détails du client.
 */
async function getCustomerDetails(customerId, storeId) {
  try {
    console.log('Récupération des détails du client:', { customerId, storeId });

    // Vérifier que le client existe et a commandé dans ce magasin
    const customer = await prisma.user.findFirst({
      where: {
        id: customerId,
        orders: {
          some: {
            storeId: storeId
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    console.log('Client trouvé:', customer);

    if (!customer) {
      console.log('Client non trouvé');
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
    }

    // Récupérer les commandes de ce client pour ce magasin
    const orders = await prisma.order.findMany({
      where: {
        customerId: customerId,
        storeId: storeId
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Commandes trouvées:', orders.length);

    // Calculer les statistiques du client
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    const lastOrderDate = totalOrders > 0 ? orders[0].createdAt : null;

    // Calculer les produits les plus achetés par ce client
    const productPurchases = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product.id;
        if (!productPurchases[productId]) {
          productPurchases[productId] = {
            id: productId,
            name: item.product.name,
            image: item.product.images && item.product.images.length > 0 ? item.product.images[0] : null,
            quantity: 0,
            totalSpent: 0
          };
        }
        productPurchases[productId].quantity += Number(item.quantity);
        productPurchases[productId].totalSpent += Number(item.price) * Number(item.quantity);
      });
    });

    const favoriteProducts = Object.values(productPurchases)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Formater les données pour la réponse
    const responseData = {
      ...customer,
      stats: {
        totalOrders,
        totalSpent,
        averageOrderValue,
        lastOrderDate,
        lastOrder: orders.length > 0 ? {
          id: orders[0].id,
          number: orders[0].number || `ORD-${orders[0].id.substring(0, 8)}`,
          total: Number(orders[0].total),
          status: orders[0].status,
          createdAt: orders[0].createdAt
        } : null,
        favoriteProducts: favoriteProducts.map(p => ({
          name: p.name,
          quantity: p.quantity,
          total: p.totalSpent
        }))
      },
      orders: orders.map(order => ({
        id: order.id,
        number: order.number || `ORD-${order.id.substring(0, 8)}`,
        total: Number(order.total),
        status: order.status,
        createdAt: order.createdAt,
        items: order.items.map(item => ({
          id: item.id,
          quantity: Number(item.quantity),
          price: Number(item.price),
          product: item.product
        }))
      }))
    };

    console.log('Données formatées:', responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Erreur détaillée lors de la récupération des détails du client:", error);
    return NextResponse.json({ 
      error: "Erreur lors de la récupération des détails du client",
      details: error.message 
    }, { status: 500 });
  }
}
