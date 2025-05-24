import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

// Use Prisma as a singleton to avoid connection issues
const globalForPrisma = global;
globalForPrisma.prisma = globalForPrisma.prisma || new PrismaClient();
const prisma = globalForPrisma.prisma;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier si l'utilisateur est un administrateur
    if (!session || session.user.role !== 'ADMIN') {
      console.error('[ADMIN_CUSTOMERS_GET] Unauthorized access');
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    console.log('[ADMIN_CUSTOMERS_GET] Fetching all customers');
    
    // 1. Récupérer tous les utilisateurs avec le rôle CLIENT
    const customers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
      },
      include: {
        orders: true, // Récupérer toutes les commandes sans restriction
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Nombre total de clients trouvés
    console.log(`[ADMIN_CUSTOMERS_GET] Found ${customers.length} customers`);
    
    // 2. Transformer les données pour éviter les références circulaires et problèmes de sérialisation
    const formattedCustomers = customers.map(customer => {
      // Gérer les commandes nulles
      const customerOrders = customer.orders || [];
      console.log(`Customer ${customer.id} has ${customerOrders.length} orders`);
      
      // Récupérer l'adresse de la dernière commande si disponible
      let address = 'Non renseignée';
      if (customerOrders.length > 0) {
        // Trier les commandes par date (la plus récente d'abord)
        const sortedOrders = [...customerOrders].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        // Utiliser l'adresse de la commande la plus récente si disponible
        if (sortedOrders[0]?.shippingAddress) {
          try {
            // Si c'est un objet JSON, essayer de le parser
            if (typeof sortedOrders[0].shippingAddress === 'string') {
              const shippingAddressObj = JSON.parse(sortedOrders[0].shippingAddress);
              // Formater l'adresse
              if (shippingAddressObj) {
                const addressParts = [
                  shippingAddressObj.address,
                  shippingAddressObj.city,
                  shippingAddressObj.postalCode,
                  shippingAddressObj.country
                ].filter(Boolean);
                
                if (addressParts.length > 0) {
                  address = addressParts.join(', ');
                }
              }
            } else {
              // Si c'est déjà un string formaté
              address = sortedOrders[0].shippingAddress;
            }
          } catch (error) {
            // Si le parsing échoue, utiliser l'adresse telle quelle
            address = sortedOrders[0].shippingAddress;
          }
        }
      }
      
      return {
        id: customer.id,
        name: customer.name || 'Client sans nom',
        email: customer.email,
        phone: customer.phone || 'Non renseigné',
        address: address,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        orders: customerOrders.map(order => ({
          id: order.id,
          totalAmount: order.total, // Mapper total vers totalAmount pour compatibilité
          status: order.status,
          createdAt: order.createdAt
        }))
      };
    });
    
    // 3. Vérifier et enregistrer les résultats pour le débogage
    console.log(`[ADMIN_CUSTOMERS_GET] Returning ${formattedCustomers.length} formatted customers`);
    
    return NextResponse.json(formattedCustomers);
  } catch (error) {
    console.error('[ADMIN_CUSTOMERS_GET] Error:', error);
    return NextResponse.json({ 
      error: `Erreur lors de la récupération des clients: ${error.message}` 
    }, { status: 500 });
  }
} 