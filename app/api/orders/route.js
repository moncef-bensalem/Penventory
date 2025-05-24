import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fonction pour créer une commande
export async function POST(req) {
  try {
    console.log('Orders API - Creating new order...');
    
    // Vérifier l'authentification (optionnel)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    console.log('User from session:', userId ? `ID: ${userId}` : 'Not authenticated');
    
    // Récupérer les données de la commande
    const data = await req.json();
    const { 
      items, 
      shippingAddress, 
      total,
      customerInfo
    } = data;
    
    console.log('Order request data:', {
      itemsCount: items?.length,
      hasShippingAddress: !!shippingAddress,
      total,
      hasCustomerInfo: !!customerInfo
    });
    
    if (!items || !items.length || !shippingAddress || !total) {
      console.log('Missing required order data');
      return NextResponse.json({ error: "Données de commande incomplètes" }, { status: 400 });
    }
    
    // Grouper les articles par magasin
    const itemsByStore = {};
    const productsToUpdate = [];
    
    for (const item of items) {
      // Récupérer le produit pour obtenir le storeId et vérifier le stock
      console.log(`Fetching product details for item ID: ${item.productId || item.id}`);
      const product = await prisma.product.findUnique({
        where: { id: item.productId || item.id },
        select: { id: true, storeId: true, price: true, stock: true, name: true }
      });
      
      if (!product) {
        console.log(`Product not found: ${item.name || item.productId || item.id}`);
        return NextResponse.json({ 
          error: `Produit introuvable: ${item.name || item.productId || item.id}` 
        }, { status: 404 });
      }
      
      // Vérifier si le stock est suffisant
      const requestedQuantity = item.quantity || 1;
      if (product.stock < requestedQuantity) {
        console.log(`Insufficient stock for product ${product.id}: requested ${requestedQuantity}, available ${product.stock}`);
        return NextResponse.json({ 
          error: `Stock insuffisant pour le produit "${product.name}". Disponible: ${product.stock}, demandé: ${requestedQuantity}` 
        }, { status: 400 });
      }
      
      // Ajouter le produit à la liste des produits à mettre à jour
      productsToUpdate.push({
        id: product.id,
        quantity: requestedQuantity,
        currentStock: product.stock
      });
      
      // Regrouper par magasin
      if (!itemsByStore[product.storeId]) {
        itemsByStore[product.storeId] = [];
      }
      
      itemsByStore[product.storeId].push({
        productId: item.productId || item.id,
        quantity: requestedQuantity,
        price: item.price || product.price
      });
    }
    
    console.log(`Items grouped by store: ${Object.keys(itemsByStore).length} stores`);
    
    // Créer une commande pour chaque magasin
    const createdOrders = [];
    
    for (const [storeId, storeItems] of Object.entries(itemsByStore)) {
      // Calculer le total pour ce magasin
      const storeTotal = storeItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
      );
      
      // Créer un numéro de commande unique
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      console.log(`Creating order for store ${storeId}, number: ${orderNumber}, items: ${storeItems.length}`);
      
      // Vérifier si un utilisateur avec cet email existe déjà
      let customerId = userId;
      
      if (!userId && customerInfo && customerInfo.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: customerInfo.email }
        });
        
        if (existingUser) {
          customerId = existingUser.id;
          console.log(`Found existing user with email ${customerInfo.email}, ID: ${customerId}`);
        } else if (customerInfo.email) {
          // Créer un nouvel utilisateur
          try {
            const newUser = await prisma.user.create({
              data: {
                name: customerInfo.name,
                email: customerInfo.email,
                role: "CUSTOMER",
                createdAt: new Date(),
                updatedAt: new Date()
              }
            });
            customerId = newUser.id;
            console.log(`Created new user with email ${customerInfo.email}, ID: ${customerId}`);
          } catch (userError) {
            console.error(`Error creating user: ${userError.message}`);
            // Si la création échoue, continuer sans utilisateur
            customerId = null;
          }
        }
      }
      
      // Créer la commande
      try {
        // Préparer les données complètes de la commande
        const orderData = {
          number: orderNumber,
          status: "PENDING",
          total: storeTotal,
          shippingAddress: typeof shippingAddress === 'string' 
            ? shippingAddress 
            : JSON.stringify(shippingAddress),
          storeId: storeId,
          items: {
            create: storeItems.map(item => ({
              quantity: BigInt(item.quantity),
              price: item.price,
              product: {
                connect: { id: item.productId }
              },
              createdAt: new Date(),
              updatedAt: new Date()
            }))
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Ajouter la relation avec l'utilisateur seulement si on a un ID
        if (customerId) {
          orderData.customer = {
            connect: { id: customerId }
          };
        }
        
        const order = await prisma.order.create({
          data: orderData,
          include: {
            items: true,
            customer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });
        
        console.log(`Order created successfully: ${order.id}`);
        createdOrders.push(order);
      } catch (err) {
        console.error(`Error creating order for store ${storeId}:`, err);
        throw err;
      }
    }
    
    console.log(`Total orders created: ${createdOrders.length}`);
    
    // Mettre à jour le stock des produits
    console.log('Updating product stock...');
    for (const product of productsToUpdate) {
      const newStock = typeof product.currentStock === 'bigint' 
        ? product.currentStock - BigInt(product.quantity)
        : BigInt(product.currentStock) - BigInt(product.quantity);

      const finalStock = newStock < BigInt(0) ? BigInt(0) : newStock;
      
      await prisma.product.update({
        where: { id: product.id },
        data: { stock: finalStock }
      });
      console.log(`Updated stock for product ${product.id}: ${product.currentStock} -> ${finalStock}`);
    }
    
    // Extraction des IDs MongoDB pour faciliter le suivi des commandes
    const orderIds = createdOrders.map(order => ({
      id: order.id,            // ID MongoDB
      number: order.number,    // Numéro de commande formaté
      storeId: order.storeId
    }));
    
    // Sérialiser les commandes pour gérer les BigInt
    const serializedOrders = JSON.parse(
      JSON.stringify(createdOrders, (key, value) => 
        typeof value === 'bigint' ? Number(value) : value
      )
    );
    
    return NextResponse.json({ 
      success: true,
      message: `${createdOrders.length} commande(s) créée(s) avec succès`,
      orders: serializedOrders,
      orderIds: orderIds  // Ajout des IDs pour faciliter le stockage côté client
    });
    
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
    return NextResponse.json({ 
      error: `Erreur lors de la création de la commande: ${error.message}` 
    }, { status: 500 });
  }
}

// Obtenir les commandes d'un utilisateur
export async function GET(req) {
  try {
    console.log('Orders API - Getting user orders...');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('Not authorized: No user session');
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    
    const userId = session.user.id;
    console.log(`Fetching orders for user: ${userId}`);
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    
    const where = {
      customerId: userId
    };
    
    if (status) {
      where.status = status;
    }
    
    console.log('Query where clause:', where);
    
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true
              }
            }
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${orders.length} orders for user`);
    
    // Sérialiser les commandes pour gérer les BigInt
    const serializedOrders = JSON.parse(
      JSON.stringify(orders, (key, value) => 
        typeof value === 'bigint' ? Number(value) : value
      )
    );
    
    return NextResponse.json({ orders: serializedOrders });
    
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
    return NextResponse.json({ 
      error: `Erreur lors de la récupération des commandes: ${error.message}` 
    }, { status: 500 });
  }
} 