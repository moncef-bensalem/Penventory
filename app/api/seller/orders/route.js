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
    console.log('Seller orders API called');
    
    const sellerData = await checkSellerRole();
    if (!sellerData) {
      console.log('Not authorized: No seller data found');
      return NextResponse.json({ error: "Non autorisé ou magasin non trouvé" }, { status: 401 });
    }

    const { store } = sellerData;
    console.log('Seller store ID:', store.id);
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Construire la requête
    const where = {
      storeId: store.id
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { number: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { email: { contains: search } } }
      ];
    }
    
    console.log('Query where clause:', where);

    // Récupérer les commandes
    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true
            }
          },
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
          createdAt: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ]);
    
    console.log(`Found ${orders.length} orders for seller`);

    // Calculer les statistiques
    const stats = await prisma.order.groupBy({
      by: ['status'],
      where: {
        storeId: store.id
      },
      _count: true
    });
    
    // Transformer les commandes pour garantir la compatibilité
    const formattedOrders = orders.map(order => ({
      id: order.id,
      number: order.number || `ORD-${order.id.substring(0, 6)}`,
      status: order.status,
      total: order.total,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customer: order.customer ? {
        id: order.customer.id,
        name: order.customerName || order.customer.name,
        email: order.customerEmail || order.customer.email,
        phone: order.customerPhone || order.customer.phone,
        role: order.customer.role
      } : null,
      items: (order.items || []).map(item => ({
        id: item.id,
        quantity: typeof item.quantity === 'bigint' ? Number(item.quantity) : item.quantity,
        price: item.price,
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.images?.[0] || null
        } : null
      }))
    }));

    // Sérialiser les données pour gérer les BigInt
    const serializedOrders = JSON.parse(
      JSON.stringify(formattedOrders, (key, value) => 
        typeof value === 'bigint' ? Number(value) : value
      )
    );

    return NextResponse.json({
      orders: serializedOrders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      },
      stats: stats.reduce((acc, stat) => {
        acc[stat.status.toLowerCase()] = stat._count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commandes" },
      { status: 500 }
    );
  }
}

// Mettre à jour le statut d'une commande
export async function PATCH(request) {
  try {
    console.log('[SELLER_ORDERS_PATCH] Update order status request received');
    
    const sellerData = await checkSellerRole();
    if (!sellerData) {
      console.log('[SELLER_ORDERS_PATCH] Not authorized');
      return NextResponse.json({ error: "Non autorisé ou magasin non trouvé" }, { status: 401 });
    }

    const { store } = sellerData;
    const body = await request.json();
    const { orderId, status } = body;
    
    if (!orderId) {
      console.log('[SELLER_ORDERS_PATCH] Order ID missing in request body');
      return NextResponse.json({ error: "ID de commande manquant" }, { status: 400 });
    }

    console.log(`[SELLER_ORDERS_PATCH] Updating order ${orderId} to status ${status}`);

    // Vérifier que la commande appartient bien au vendeur
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        storeId: store.id
      }
    });

    if (!order) {
      console.log(`[SELLER_ORDERS_PATCH] Order ${orderId} not found or doesn't belong to store ${store.id}`);
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que le nouveau statut est valide
    const validStatuses = [
      'EN_ATTENTE',
      'CONFIRMEE',
      'EN_PREPARATION',
      'EXPEDIEE',
      'LIVREE',
      'ANNULEE'
    ];

    if (!status || !validStatuses.includes(status)) {
      console.log(`[SELLER_ORDERS_PATCH] Invalid status: ${status}`);
      return NextResponse.json(
        { error: "Statut invalide" },
        { status: 400 }
      );
    }

    // Mettre à jour le statut
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log(`[SELLER_ORDERS_PATCH] Order ${orderId} updated successfully to ${status}`);

    // Créer une notification pour le client si un ID client existe
    if (updatedOrder.customerId) {
      try {
        await prisma.notification.create({
          data: {
            userId: updatedOrder.customerId,
            title: "Mise à jour de votre commande",
            message: `Votre commande #${updatedOrder.number || orderId.substring(0, 8)} est maintenant ${status.toLowerCase().replace('_', ' ')}`,
            type: "ORDER_UPDATE",
            meta: {
              orderId: updatedOrder.id,
              status: updatedOrder.status
            },
            read: false
          }
        });
        console.log(`[SELLER_ORDERS_PATCH] Notification created for customer ${updatedOrder.customerId}`);
      } catch (notifError) {
        console.error('[SELLER_ORDERS_PATCH] Failed to create notification:', notifError);
        // Continue even if notification creation fails
      }
    }

    // Sérialiser la réponse pour gérer les BigInt
    const serializedOrder = JSON.parse(
      JSON.stringify(updatedOrder, (key, value) => 
        typeof value === 'bigint' ? Number(value) : value
      )
    );

    return NextResponse.json({ 
      success: true,
      message: "Statut mis à jour avec succès", 
      order: serializedOrder
    });
  } catch (error) {
    console.error("[SELLER_ORDERS_PATCH] Error updating order:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la commande: " + error.message },
      { status: 500 }
    );
  }
}

// Récupérer les détails d'une commande spécifique
export async function POST(request) {
  try {
    const sellerData = await checkSellerRole();
    if (!sellerData) {
      return NextResponse.json({ error: "Non autorisé ou magasin non trouvé" }, { status: 401 });
    }

    const { store } = sellerData;
    const data = await request.json();
    const { orderId } = data;

    // Vérifier que la commande appartient bien au vendeur
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        storeId: store.id
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
            address: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
                images: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order details:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des détails de la commande" },
      { status: 500 }
    );
  }
}
