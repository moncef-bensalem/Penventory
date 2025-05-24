import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// Vérification de l'authentification admin
async function checkAdminAuth() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return false;
    }
    return { authorized: true, admin: session.user };
  } catch (error) {
    console.error('[ADMIN_STORE_BANNERS] Erreur d\'authentification:', error);
    return false;
  }
}

// GET - Récupérer les bannières des magasins
export async function GET(request) {
  try {
    console.log('[ADMIN_STORE_BANNERS_GET] Démarrage de la requête...');
    
    // Vérifier l'authentification (mais permettre l'accès en développement)
    const auth = await checkAdminAuth();
    if (!auth && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    
    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Construction du filtre
    const where = {};
    if (storeId) {
      where.id = storeId;
    }
    
    // Récupérer les magasins de base sans la relation owner
    const stores = await prisma.store.findMany({
      where,
      select: {
        id: true,
        name: true,
        logo: true,
        banner: true,
        ownerId: true
      },
      orderBy: {
        name: 'asc'
      },
      skip,
      take: limit
    });
    
    // Compter le nombre total de magasins
    const total = await prisma.store.count({ where });
    
    // Récupérer les informations des vendeurs (owners) pour les magasins qui ont un ownerId
    const ownerIds = stores
      .filter(store => store.ownerId)
      .map(store => store.ownerId);
    
    let owners = [];
    if (ownerIds.length > 0) {
      owners = await prisma.user.findMany({
        where: {
          id: {
            in: ownerIds
          }
        },
        select: {
          id: true,
          name: true,
          email: true
        }
      });
    }
    
    // Mapper les vendeurs aux magasins
    const ownersMap = {};
    owners.forEach(owner => {
      ownersMap[owner.id] = owner;
    });
    
    // Transformer les données pour la réponse
    const storeBanners = stores.map(store => {
      const seller = store.ownerId && ownersMap[store.ownerId]
        ? {
            id: ownersMap[store.ownerId].id,
            name: ownersMap[store.ownerId].name,
            email: ownersMap[store.ownerId].email
          }
        : null;
      
      return {
        id: store.id,
        name: store.name,
        logo: store.logo,
        banner: store.banner,
        hasBanner: !!store.banner,
        seller
      };
    });
    
    console.log(`[ADMIN_STORE_BANNERS_GET] Récupéré ${stores.length} magasins`);
    
    return NextResponse.json({
      success: true,
      storeBanners,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[ADMIN_STORE_BANNERS_GET] Erreur:', error);
    return NextResponse.json({ 
      error: "Erreur lors de la récupération des bannières de magasins",
      details: error.message
    }, { status: 500 });
  }
}

// PATCH - Mettre à jour la bannière d'un magasin
export async function PATCH(request) {
  try {
    console.log('[ADMIN_STORE_BANNERS_PATCH] Démarrage de la requête...');
    
    // Vérifier l'authentification
    const auth = await checkAdminAuth();
    if (!auth && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    
    const data = await request.json();
    
    // Validation des données
    if (!data.storeId || !data.bannerUrl) {
      return NextResponse.json({
        error: "Données incomplètes",
        required: ["storeId", "bannerUrl"]
      }, { status: 400 });
    }
    
    // Vérifier si le magasin existe
    const store = await prisma.store.findUnique({
      where: { id: data.storeId }
    });
    
    if (!store) {
      return NextResponse.json({ error: "Magasin non trouvé" }, { status: 404 });
    }
    
    // Mettre à jour la bannière du magasin
    const updatedStore = await prisma.store.update({
      where: { id: data.storeId },
      data: {
        banner: data.bannerUrl
      },
      select: {
        id: true,
        name: true,
        banner: true
      }
    });
    
    console.log(`[ADMIN_STORE_BANNERS_PATCH] Bannière mise à jour pour le magasin: ${updatedStore.id}`);
    
    return NextResponse.json({
      success: true,
      store: updatedStore,
      message: `Bannière mise à jour pour "${updatedStore.name}"`
    });
  } catch (error) {
    console.error('[ADMIN_STORE_BANNERS_PATCH] Erreur:', error);
    return NextResponse.json({ 
      error: "Erreur lors de la mise à jour de la bannière",
      details: error.message
    }, { status: 500 });
  }
}

// DELETE - Supprimer la bannière d'un magasin
export async function DELETE(request) {
  try {
    console.log('[ADMIN_STORE_BANNERS_DELETE] Démarrage de la requête...');
    
    // Vérifier l'authentification
    const auth = await checkAdminAuth();
    if (!auth && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    
    // Récupérer l'ID du magasin dans les paramètres de la requête
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    
    if (!storeId) {
      return NextResponse.json({ error: "ID de magasin requis" }, { status: 400 });
    }
    
    // Vérifier si le magasin existe
    const store = await prisma.store.findUnique({
      where: { id: storeId }
    });
    
    if (!store) {
      return NextResponse.json({ error: "Magasin non trouvé" }, { status: 404 });
    }
    
    // Supprimer la bannière (mettre à null)
    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: {
        banner: null
      },
      select: {
        id: true,
        name: true
      }
    });
    
    console.log(`[ADMIN_STORE_BANNERS_DELETE] Bannière supprimée pour le magasin: ${updatedStore.id}`);
    
    return NextResponse.json({
      success: true,
      message: `Bannière supprimée pour "${updatedStore.name}"`
    });
  } catch (error) {
    console.error('[ADMIN_STORE_BANNERS_DELETE] Erreur:', error);
    return NextResponse.json({ 
      error: "Erreur lors de la suppression de la bannière",
      details: error.message
    }, { status: 500 });
  }
} 