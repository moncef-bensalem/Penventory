    import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

// Use Prisma as a singleton to avoid connection issues
const globalForPrisma = global;
globalForPrisma.prisma = globalForPrisma.prisma || new PrismaClient();
const prisma = globalForPrisma.prisma;

// Récupérer les détails d'une commande spécifique
export async function GET(request, { params }) {
  const { orderId } = params;
  
  console.log(`[ORDER_GET] Fetching order details for ID: ${orderId}`);
  
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Vérifier si l'orderId est un ObjectID MongoDB valide ou un numéro de commande
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(orderId);
    
    let order;
    
    if (isValidObjectId) {
      // Rechercher par ID
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  price: true
                }
              }
            }
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        }
      });
    } else {
      // Rechercher par numéro de commande
      order = await prisma.order.findFirst({
        where: { number: orderId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  price: true
                }
              }
            }
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        }
      });
    }
    
    // Vérifier si la commande existe
    if (!order) {
      console.log(`[ORDER_GET] Order not found: ${orderId}`);
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }
    
    // Si l'utilisateur est connecté, vérifier qu'il est bien le propriétaire de la commande
    // ou un vendeur/admin concerné par cette commande
    if (userId) {
      const userRole = session.user.role;
      
      if (userRole === 'CUSTOMER' && order.customerId !== userId) {
        console.log(`[ORDER_GET] Unauthorized: User ${userId} trying to access order ${orderId} that belongs to customer ${order.customerId}`);
        return NextResponse.json({ error: "Vous n'êtes pas autorisé à consulter cette commande" }, { status: 403 });
      }
      
      if (userRole === 'SELLER') {
        // Vérifier que ce vendeur est lié à cette commande
        const sellerStore = await prisma.store.findFirst({
          where: {
            ownerId: userId
          }
        });
        
        if (!sellerStore || order.storeId !== sellerStore.id) {
          console.log(`[ORDER_GET] Unauthorized: Seller ${userId} trying to access order ${orderId} that belongs to store ${order.storeId}`);
          return NextResponse.json({ error: "Vous n'êtes pas autorisé à consulter cette commande" }, { status: 403 });
        }
      }
    }
    
    console.log(`[ORDER_GET] Successfully fetched order ${orderId}`);
    
    // Récupérer les informations du magasin
    let storeInfo = null;
    if (order.storeId) {
      const store = await prisma.store.findUnique({
        where: { id: order.storeId },
        select: {
          id: true,
          name: true,
          logo: true
        }
      });
      if (store) {
        storeInfo = store;
      }
    }
    
    // Transformer les données pour l'affichage
    const transformedOrder = {
      id: order.id,
      number: order.number || `ORD-${order.id.substring(0, 8)}`,
      status: order.status,
      statusLabel: getStatusLabel(order.status),
      statusProgress: getStatusProgress(order.status),
      paymentStatus: order.paymentStatus || 'PAID',
      total: order.total,
      customer: order.customer ? {
        id: order.customer.id,
        name: order.customer.name || 'Client',
        email: order.customer.email || 'Email non disponible',
        phone: order.customer.phone || 'Téléphone non disponible'
      } : {
        name: 'Client',
        email: 'Email non disponible',
        phone: 'Téléphone non disponible'
      },
      shippingAddress: (() => {
        try {
          // Si c'est déjà un objet, le retourner tel quel
          if (typeof order.shippingAddress === 'object' && order.shippingAddress !== null) {
            return order.shippingAddress;
          }
          
          // Si c'est une chaîne, essayer de parser en JSON avec gestion d'erreur
          if (typeof order.shippingAddress === 'string') {
            // Nettoyer la chaîne de caractères potentiellement problématique
            const cleaned = order.shippingAddress.trim().replace(/^\uFEFF/, '');
            if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
              return JSON.parse(cleaned);
            }
          }
          
          // Si parsing impossible ou format non valide, retourner un objet par défaut
          return {
            name: 'Client',
            address: 'Adresse non disponible',
            city: 'Ville',
            postalCode: '00000',
            country: 'France'
          };
        } catch (error) {
          console.error(`[ORDER_GET] Error parsing shippingAddress: ${error.message}`, order.shippingAddress);
          // En cas d'erreur, retourner un objet par défaut
          return {
            name: 'Client',
            address: 'Adresse non disponible',
            city: 'Ville',
            postalCode: '00000',
            country: 'France'
          };
        }
      })(),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          image: item.product.images?.[0] || null
        } : null
      })),
      store: storeInfo
    };
    
    // Sérialiser la réponse pour gérer les BigInt
    const serializedOrder = JSON.parse(
      JSON.stringify(transformedOrder, (key, value) => 
        typeof value === 'bigint' ? Number(value) : value
      )
    );
    
    return NextResponse.json(serializedOrder);
    
  } catch (error) {
    console.error(`[ORDER_GET] Error fetching order ${orderId}:`, error);
    return NextResponse.json({ 
      error: `Erreur lors de la récupération de la commande: ${error.message}` 
    }, { status: 500 });
  }
}

// Fonction pour obtenir le libellé du statut
function getStatusLabel(status) {
  const statusLabels = {
    'PENDING': 'En attente',
    'EN_ATTENTE': 'En attente',
    'CONFIRMEE': 'Confirmée',
    'EN_PREPARATION': 'En préparation',
    'PROCESSING': 'En préparation',
    'EXPEDIEE': 'Expédiée',
    'SHIPPED': 'Expédiée',
    'LIVREE': 'Livrée',
    'DELIVERED': 'Livrée',
    'ANNULEE': 'Annulée',
    'CANCELLED': 'Annulée',
    'COMPLETED': 'Complétée'
  };
  
  return statusLabels[status] || status;
}

// Fonction pour obtenir le pourcentage de progression du statut
function getStatusProgress(status) {
  const statusProgress = {
    'PENDING': 10,
    'EN_ATTENTE': 10,
    'CONFIRMEE': 25,
    'EN_PREPARATION': 50,
    'PROCESSING': 50,
    'EXPEDIEE': 75,
    'SHIPPED': 75,
    'LIVREE': 100,
    'DELIVERED': 100,
    'COMPLETED': 100,
    'ANNULEE': 0,
    'CANCELLED': 0
  };
  
  return statusProgress[status] || 0;
} 