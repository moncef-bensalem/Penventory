import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// Helper function pour vérifier l'authentification admin
async function checkAdminAuth() {
  // En développement, on peut skipper l'auth pour faciliter les tests
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return false;
  }
  
  return true;
}

// Fonction pour transformer les BigInt en strings
function replaceBigInt(key, value) {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

export async function GET(request, { params }) {
  const storeId = params.id;
  console.log(`[ADMIN API] GET Store ${storeId} details`);
  
  try {
    // Vérifier l'authentification
    const isAuth = await checkAdminAuth();
    console.log(`[ADMIN API] Auth check result: ${isAuth}`);
    
    if (!isAuth) {
      console.log(`[ADMIN API] Unauthorized access attempt`);
      return NextResponse.json({ 
        success: false, 
        error: 'Non autorisé. Vous devez être connecté en tant qu\'administrateur.' 
      }, { status: 401 });
    }
    
    console.log(`[ADMIN API] Store ID: ${storeId}`);
    
    if (!storeId) {
      console.log(`[ADMIN API] Missing store ID`);
      return NextResponse.json({ 
        success: false, 
        error: 'ID de magasin manquant' 
      }, { status: 400 });
    }
    
    // Récupérer le magasin avec toutes ses relations importantes
    console.log(`[ADMIN API] Fetching store from database`);
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        },
        categories: true,
        openingHours: true
      }
    });
    
    if (!store) {
      console.log(`[ADMIN API] Store not found: ${storeId}`);
      return NextResponse.json({ 
        success: false, 
        error: 'Magasin non trouvé' 
      }, { status: 404 });
    }
    
    console.log(`[ADMIN API] Store found: ${store.name}`);
    
    // Récupérer les produits du magasin
    console.log(`[ADMIN API] Fetching products for store: ${storeId}`);
    const products = await prisma.product.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: 9 // Limiter à 9 produits récents pour des raisons de performance
    });
    
    // Récupérer les commandes du magasin
    console.log(`[ADMIN API] Fetching orders for store: ${storeId}`);
    const orders = await prisma.order.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: 5 // Limiter à 5 commandes récentes
    });
    
    console.log(`[ADMIN API] Successfully retrieved store details, products, and orders`);
    
    // Utilisation de la fonction replaceBigInt pour gérer les BigInt
    const responseData = {
      success: true,
      store,
      products,
      orders,
      stats: {
        productsCount: await prisma.product.count({ where: { storeId } }),
        ordersCount: await prisma.order.count({ where: { storeId } }),
        categoriesCount: await prisma.category.count({ where: { storeId } })
      }
    };
    
    // Convertir les données pour gérer les BigInt
    const safeResponse = JSON.parse(JSON.stringify(responseData, replaceBigInt));
    
    return NextResponse.json(safeResponse);
    
  } catch (error) {
    console.error(`[ADMIN API] Error getting store ${storeId} details:`, error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la récupération des détails du magasin',
      details: error.message
    }, { status: 500 });
  }
}

// PATCH - Mettre à jour partiellement un magasin (par exemple, changer le statut d'approbation)
export async function PATCH(request, { params }) {
  const storeId = params.id;
  console.log(`[ADMIN API] PATCH Store ${storeId}`);
  
  try {
    // Vérifier l'authentification
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json({ 
        success: false, 
        error: 'Non autorisé. Vous devez être connecté en tant qu\'administrateur.' 
      }, { status: 401 });
    }
    
    if (!storeId) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID de magasin manquant' 
      }, { status: 400 });
    }
    
    // Vérifier que le magasin existe
    const existingStore = await prisma.store.findUnique({
      where: { id: storeId }
    });
    
    if (!existingStore) {
      return NextResponse.json({ 
        success: false, 
        error: 'Magasin non trouvé' 
      }, { status: 404 });
    }
    
    // Obtenir les données à mettre à jour
    const data = await request.json();
    console.log(`[ADMIN API] PATCH Store data:`, data);
    
    // Valider les données (vous pouvez ajouter plus de validation si nécessaire)
    if (data.isApproved !== undefined && typeof data.isApproved !== 'boolean') {
      return NextResponse.json({ 
        success: false, 
        error: 'Le statut d\'approbation doit être un booléen' 
      }, { status: 400 });
    }
    
    // Mettre à jour le magasin
    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: {
        isApproved: data.isApproved !== undefined ? data.isApproved : existingStore.isApproved,
        // Vous pouvez ajouter d'autres champs à mettre à jour ici
        name: data.name || existingStore.name,
        description: data.description || existingStore.description,
        address: data.address || existingStore.address,
        city: data.city || existingStore.city,
        phone: data.phone || existingStore.phone,
        email: data.email || existingStore.email,
        website: data.website || existingStore.website,
        logo: data.logo || existingStore.logo,
        banner: data.banner || existingStore.banner
      }
    });
    
    // Convertir les données pour gérer les BigInt
    const safeResponse = JSON.parse(JSON.stringify({ 
      success: true, 
      store: updatedStore 
    }, replaceBigInt));
    
    return NextResponse.json(safeResponse);
    
  } catch (error) {
    console.error(`[ADMIN API] Error updating store ${storeId}:`, error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la mise à jour du magasin',
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE - Supprimer un magasin
export async function DELETE(request, { params }) {
  const storeId = params.id;
  console.log(`[ADMIN API] DELETE Store ${storeId}`);
  
  try {
    // Vérifier l'authentification
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json({ 
        success: false, 
        error: 'Non autorisé. Vous devez être connecté en tant qu\'administrateur.' 
      }, { status: 401 });
    }
    
    if (!storeId) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID de magasin manquant' 
      }, { status: 400 });
    }
    
    // Vérifier que le magasin existe
    const existingStore = await prisma.store.findUnique({
      where: { id: storeId }
    });
    
    if (!existingStore) {
      return NextResponse.json({ 
        success: false, 
        error: 'Magasin non trouvé' 
      }, { status: 404 });
    }
    
    // Supprimer le magasin (en cascade avec les relations si défini dans le schéma)
    await prisma.store.delete({
      where: { id: storeId }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Magasin supprimé avec succès'
    });
    
  } catch (error) {
    console.error(`[ADMIN API] Error deleting store ${storeId}:`, error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la suppression du magasin',
      details: error.message 
    }, { status: 500 });
  }
} 