import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

// Use Prisma as a singleton to avoid connection issues
const globalForPrisma = global;
globalForPrisma.prisma = globalForPrisma.prisma || new PrismaClient();
const prisma = globalForPrisma.prisma;

export async function GET(request, { params }) {
  const { id } = params;
  
  console.log(`[ADMIN_CUSTOMER_GET] Fetching customer details for ID: ${id}`);
  
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier si l'utilisateur est un administrateur
    if (!session || session.user.role !== 'ADMIN') {
      console.error('[ADMIN_CUSTOMER_GET] Unauthorized access');
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    // Récupérer le client avec ses commandes
    const customer = await prisma.user.findUnique({
      where: {
        id: id,
        role: 'CUSTOMER',
      },
      include: {
        orders: {
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
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    
    // Vérifier si le client existe
    if (!customer) {
      console.log(`[ADMIN_CUSTOMER_GET] Customer not found: ${id}`);
      return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
    }
    
    console.log(`[ADMIN_CUSTOMER_GET] Successfully fetched customer ${id}`);
    
    // Transformer les données pour l'affichage
    const transformedCustomer = {
      id: customer.id,
      name: customer.name || 'Client sans nom',
      email: customer.email,
      phone: customer.phone || 'Non renseigné',
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      orders: customer.orders.map(order => {
        // Récupérer l'adresse de livraison
        let shippingAddress = {
          name: 'Client',
          address: 'Adresse non disponible',
          city: 'Ville',
          postalCode: '00000',
          country: 'France'
        };
        
        try {
          // Si c'est déjà un objet, le retourner tel quel
          if (typeof order.shippingAddress === 'object' && order.shippingAddress !== null) {
            shippingAddress = order.shippingAddress;
          }
          
          // Si c'est une chaîne, essayer de parser en JSON avec gestion d'erreur
          if (typeof order.shippingAddress === 'string') {
            // Nettoyer la chaîne de caractères potentiellement problématique
            const cleaned = order.shippingAddress.trim().replace(/^\uFEFF/, '');
            if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
              shippingAddress = JSON.parse(cleaned);
            }
          }
        } catch (error) {
          console.error(`[ADMIN_CUSTOMER_GET] Error parsing shippingAddress: ${error.message}`, order.shippingAddress);
        }
        
        return {
          id: order.id,
          number: order.number || `ORD-${order.id.substring(0, 8)}`,
          status: order.status,
          statusLabel: getStatusLabel(order.status),
          paymentStatus: order.paymentStatus || 'PAID',
          total: order.total,
          shippingAddress: shippingAddress,
          createdAt: order.createdAt,
          items: order.items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
            product: item.product ? {
              id: item.product.id,
              name: item.product.name,
              image: item.product.images?.[0] || null
            } : null
          }))
        };
      })
    };
    
    // Sérialiser la réponse pour gérer les BigInt
    const serializedCustomer = JSON.parse(
      JSON.stringify(transformedCustomer, (key, value) => 
        typeof value === 'bigint' ? Number(value) : value
      )
    );
    
    return NextResponse.json(serializedCustomer);
    
  } catch (error) {
    console.error(`[ADMIN_CUSTOMER_GET] Error fetching customer ${id}:`, error);
    return NextResponse.json({ 
      error: `Erreur lors de la récupération du client: ${error.message}` 
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
    'CANCELLED': 'Annulée'
  };
  
  return statusLabels[status] || status;
} 