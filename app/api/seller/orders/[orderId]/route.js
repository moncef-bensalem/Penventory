import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

// Use Prisma as a singleton to avoid connection issues
const globalForPrisma = global;
globalForPrisma.prisma = globalForPrisma.prisma || new PrismaClient();
const prisma = globalForPrisma.prisma;

// Middleware pour vérifier le rôle vendeur
async function checkSellerRole() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('[SELLER_ORDERS_PATCH] No user session found');
      return false;
    }

    // Vérifier si l'utilisateur a le rôle SELLER
    if (session.user.role !== 'SELLER') {
      console.log('[SELLER_ORDERS_PATCH] User is not a seller, role:', session.user.role);
      return false;
    }
    
    // Récupérer le magasin associé à l'utilisateur
    const store = await prisma.store.findFirst({
      where: {
        ownerId: session.user.id
      }
    });
    
    if (!store) {
      console.log('[SELLER_ORDERS_PATCH] No store found for user ID:', session.user.id);
      return false;
    }
    
    return { store, user: session.user };
  } catch (error) {
    console.error('[SELLER_ORDERS_PATCH] Error in checkSellerRole:', error);
    return false;
  }
}

// Mettre à jour le statut d'une commande
export async function PATCH(request, { params }) {
  console.log('[SELLER_ORDERS_PATCH] Update order status request', params);
  
  try {
    const sellerData = await checkSellerRole();
    if (!sellerData) {
      console.log('[SELLER_ORDERS_PATCH] Not authorized');
      return NextResponse.json({ error: "Non autorisé ou magasin non trouvé" }, { status: 401 });
    }

    const { store } = sellerData;
    const orderId = params.orderId;
    const data = await request.json();
    const { status } = data;

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

    if (!validStatuses.includes(status)) {
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

    return NextResponse.json({ 
      success: true, 
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status
      }
    });
  } catch (error) {
    console.error("[SELLER_ORDERS_PATCH] Error updating order:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la commande: " + error.message },
      { status: 500 }
    );
  }
} 