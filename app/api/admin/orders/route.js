import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fonction pour gérer la sérialisation des BigInt
const bigIntSerializer = (data) => {
  return JSON.parse(JSON.stringify(data, (key, value) => 
    typeof value === 'bigint' ? Number(value) : value
  ));
};

export async function GET() {
  try {
    console.log('Admin order API called');
    
    // Récupérer toutes les commandes avec les relations
    const rawOrders = await prisma.order.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        items: {
          include: {
            product: true
          }
        },
        promotion: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    
    console.log(`Found ${rawOrders.length} orders`);
    
    // Récupérer les informations des magasins pour toutes les commandes
    const storeIds = [...new Set(rawOrders.map(order => order.storeId))].filter(Boolean);
    const stores = await prisma.store.findMany({
      where: {
        id: {
          in: storeIds
        }
      },
      select: {
        id: true,
        name: true,
        logo: true
      }
    });
    
    // Créer un map des magasins pour un accès rapide
    const storeMap = stores.reduce((acc, store) => {
      acc[store.id] = store;
      return acc;
    }, {});
    
    // Transformer les commandes pour éviter les références circulaires
    const orders = rawOrders.map(order => ({
      id: order.id,
      number: order.number,
      status: order.status,
      total: order.total,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customer: order.customer ? {
        id: order.customer.id,
        name: order.customer.name,
        email: order.customer.email,
        image: order.customer.image
      } : null,
      store: order.storeId && storeMap[order.storeId] ? {
        id: storeMap[order.storeId].id,
        name: storeMap[order.storeId].name,
        logo: storeMap[order.storeId].logo
      } : null,
      items: order.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          image: item.product.images?.[0] || null
        } : {
          id: "deleted",
          name: "Produit supprimé",
          image: null
        }
      })),
      promotion: order.promotion ? {
        id: order.promotion.id,
        code: order.promotion.code,
        type: order.promotion.type,
        value: order.promotion.value
      } : null
    }));
    
    // Retourner les commandes dans un format cohérent
    const serializedOrders = bigIntSerializer({ orders: orders });
    return NextResponse.json(serializedOrders);
  } catch (error) {
    console.error('[ADMIN_ORDERS_GET]', error);
    return NextResponse.json({ error: "Erreur lors de la récupération des commandes" }, { status: 500 });
  }
} 