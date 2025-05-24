import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Fonction pour gérer les BigInt dans les objets JSON
function handleBigInt(data) {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

// Vérification de l'autorisation admin
async function checkAdminAuth() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return false;
    }
    return { authorized: true, admin: session.user };
  } catch (error) {
    console.error('[ADMIN_PROMOTIONS] Erreur d\'authentification:', error);
    return false;
  }
}

// Liste de toutes les promotions (avec filtres, tri et pagination)
export async function GET(request) {
  try {
    console.log('[ADMIN_PROMOTIONS_GET] Démarrage de la requête...');
    
    // Vérifier l'authentification mais avec une gestion d'erreur améliorée
    try {
      const auth = await checkAdminAuth();
      
      // Pour le développement, permettre l'accès même sans authentification
      if (!auth && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
      }
    } catch (authError) {
      console.warn('[ADMIN_PROMOTIONS_GET] Erreur d\'authentification ignorée en mode dev:', authError);
      // En dev, continuer même si l'authentification échoue
    }
    
    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100'); // Augmenter la limite par défaut
    const storeId = searchParams.get('storeId');
    const status = searchParams.get('status'); // 'active', 'expired', 'all'
    const skip = (page - 1) * limit;
    
    console.log(`[ADMIN_PROMOTIONS_GET] Paramètres: search=${search}, sort=${sortField}:${sortOrder}, page=${page}, limit=${limit}, storeId=${storeId}, status=${status}`);
    
    // Construire la requête avec les filtres
    let where = {};
    
    try {
      if (search) {
        where.OR = [
          { code: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }
      
      if (storeId) {
        where.storeId = storeId;
      }
      
      // Filtrer par statut si demandé
      const now = new Date();
      if (status === 'active') {
        where.AND = [
          { isActive: true },
          { endDate: { gte: now } }
        ];
      } else if (status === 'expired') {
        where.OR = [
          { isActive: false },
          { endDate: { lt: now } }
        ];
      }
    } catch (whereError) {
      console.error('[ADMIN_PROMOTIONS_GET] Erreur lors de la construction des filtres:', whereError);
      // Réinitialiser les filtres en cas d'erreur
      where = {};
    }
    
    try {
      console.log('[ADMIN_PROMOTIONS_GET] Exécution de la requête prisma...');
      
      // VERSION SIMPLIFIÉE POUR DÉBOGUER
      // Requête simple sans relations complexes ni pagination
      const promotions = await prisma.promotion.findMany({
        where,
        orderBy: {
          [sortField]: sortOrder
        },
        take: limit
      });
      
      console.log(`[ADMIN_PROMOTIONS_GET] Trouvé ${promotions.length} promotions`);
      
      // Transformer les données pour une meilleure utilisation côté client
      const formattedPromotions = [];
      
      for (const promo of promotions) {
        try {
          const now = new Date();
          
          // Version simplifiée sans accès aux relations pour éviter les erreurs
          formattedPromotions.push({
            id: promo.id,
            code: promo.code || 'SANS CODE',
            type: promo.type || 'PERCENTAGE',
            value: promo.value || 0,
            minPurchase: promo.minPurchase || 0,
            maxUses: promo.maxUses || 0,
            startDate: promo.startDate || now,
            endDate: promo.endDate || now,
            description: promo.description || '',
            isActive: promo.isActive || false,
            storeId: promo.storeId || null,
            createdAt: promo.createdAt || now,
            updatedAt: promo.updatedAt || now,
            status: (promo.endDate && new Date(promo.endDate) > now && promo.isActive) ? 'active' : 'expired',
            usage: {
              ordersCount: 0
            },
            store: null
          });
        } catch (formatError) {
          console.error('[ADMIN_PROMOTIONS_GET] Erreur lors du formatage d\'une promotion:', formatError);
        }
      }
      
      // Statistiques simples
      const total = formattedPromotions.length;
      const stats = {
        total,
        activeCount: formattedPromotions.filter(p => p.status === 'active').length,
        expiredCount: formattedPromotions.filter(p => p.status === 'expired').length,
        storeCount: 0
      };
      
      // Utiliser handleBigInt pour gérer la sérialisation des BigInt
      const responseData = handleBigInt({
        promotions: formattedPromotions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        stats
      });
      
      return NextResponse.json(responseData);
    } catch (dbError) {
      console.error("[ADMIN_PROMOTIONS_GET] Erreur de base de données:", dbError);
      
      // Retourner une réponse même en cas d'erreur avec un tableau vide
      return NextResponse.json({
        promotions: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        },
        stats: {
          total: 0,
          activeCount: 0,
          expiredCount: 0,
          storeCount: 0
        },
        error: dbError.message
      }, { status: 200 }); // Retourner 200 avec un tableau vide plutôt que 500
    }
  } catch (error) {
    console.error("[ADMIN_PROMOTIONS_GET] Erreur générale:", error);
    
    // Retourner une réponse même en cas d'erreur générale
    return NextResponse.json({
      promotions: [],
      error: error.message
    }, { status: 200 }); // Retourner 200 plutôt que 500
  }
}

// Créer une nouvelle promotion
export async function POST(request) {
  try {
    console.log('[ADMIN_PROMOTIONS_POST] Démarrage de la requête...');
    const auth = await checkAdminAuth();
    
    if (!auth && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    
    const data = await request.json();
    
    // Validation des données
    if (!data.code || !data.type || data.value === undefined || !data.storeId || !data.startDate || !data.endDate) {
      return NextResponse.json(
        { error: "Données de promotion incomplètes", requiredFields: ['code', 'type', 'value', 'storeId', 'startDate', 'endDate'] },
        { status: 400 }
      );
    }
    
    // Vérifier si le magasin existe
    const store = await prisma.store.findUnique({
      where: { id: data.storeId }
    });
    
    if (!store) {
      return NextResponse.json(
        { error: "Magasin non trouvé" },
        { status: 404 }
      );
    }
    
    // Vérifier si le code existe déjà pour ce magasin
    const existingPromotion = await prisma.promotion.findFirst({
      where: {
        code: data.code,
        sellerId: data.storeId
      }
    });
    
    if (existingPromotion) {
      return NextResponse.json(
        { error: "Un code de promotion identique existe déjà pour ce magasin" },
        { status: 400 }
      );
    }
    
    // Créer la promotion
    const promotion = await prisma.promotion.create({
      data: {
        code: data.code,
        type: data.type,
        value: parseFloat(data.value),
        minPurchase: data.minPurchase ? parseFloat(data.minPurchase) : null,
        maxUses: data.maxUses ? parseInt(data.maxUses) : null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        description: data.description || "",
        isActive: data.isActive !== undefined ? data.isActive : true,
        sellerId: data.storeId
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    // Utiliser handleBigInt pour gérer la sérialisation des BigInt
    const processedPromotion = handleBigInt(promotion);
    
    return NextResponse.json({
      message: "Promotion créée avec succès",
      promotion: processedPromotion
    });
  } catch (error) {
    console.error("[ADMIN_PROMOTIONS_POST] Erreur:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Mettre à jour une promotion existante
export async function PUT(request) {
  try {
    console.log('[ADMIN_PROMOTIONS_PUT] Démarrage de la requête...');
    const auth = await checkAdminAuth();
    
    if (!auth && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json(
        { error: "ID de promotion requis" },
        { status: 400 }
      );
    }
    
    // Vérifier si la promotion existe
    const existingPromotion = await prisma.promotion.findUnique({
      where: { id: data.id }
    });
    
    if (!existingPromotion) {
      return NextResponse.json(
        { error: `Promotion avec l'ID ${data.id} non trouvée` },
        { status: 404 }
      );
    }
    
    // Préparer les données à mettre à jour
    const updateData = {};
    
    if (data.code !== undefined) updateData.code = data.code;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.value !== undefined) updateData.value = parseFloat(data.value);
    if (data.minPurchase !== undefined) updateData.minPurchase = data.minPurchase ? parseFloat(data.minPurchase) : null;
    if (data.maxUses !== undefined) updateData.maxUses = data.maxUses ? parseInt(data.maxUses) : null;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.storeId !== undefined) updateData.storeId = data.storeId;
    
    // Mettre à jour la promotion
    const promotion = await prisma.promotion.update({
      where: { id: data.id },
      data: updateData,
      include: {
        store: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // Utiliser handleBigInt pour gérer la sérialisation des BigInt
    const processedPromotion = handleBigInt(promotion);
    
    return NextResponse.json({
      message: "Promotion mise à jour avec succès",
      promotion: processedPromotion
    });
  } catch (error) {
    console.error('[ADMIN_PROMOTIONS_PUT] Erreur:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Supprimer une promotion
export async function DELETE(request) {
  try {
    console.log('[ADMIN_PROMOTIONS_DELETE] Démarrage de la requête...');
    const auth = await checkAdminAuth();
    
    if (!auth && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: "ID de promotion requis" },
        { status: 400 }
      );
    }
    
    // Vérifier si la promotion existe
    const existingPromotion = await prisma.promotion.findUnique({
      where: { id }
    });
    
    if (!existingPromotion) {
      return NextResponse.json(
        { error: `Promotion avec l'ID ${id} non trouvée` },
        { status: 404 }
      );
    }
    
    // Vérifier si la promotion est utilisée dans des commandes
    const ordersWithPromotion = await prisma.order.count({
      where: {
        promotionId: id
      }
    });
    
    // Supprimer la promotion
    // Note: Si des commandes utilisent cette promotion, considérer une suppression logique
    // au lieu d'une suppression physique
    await prisma.promotion.delete({
      where: { id }
    });
    
    // Gérer les BigInt si nécessaire
    const responseData = handleBigInt({
      message: `Promotion supprimée avec succès${ordersWithPromotion > 0 ? ` (utilisée dans ${ordersWithPromotion} commandes)` : ''}`,
      id,
      ordersAffected: ordersWithPromotion
    });
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[ADMIN_PROMOTIONS_DELETE] Erreur:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Obtenir des statistiques sur les promotions
export async function PATCH(request) {
  try {
    console.log('[ADMIN_PROMOTIONS_PATCH] Démarrage de la requête...');
    const auth = await checkAdminAuth();
    
    if (!auth && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json(
        { error: "ID de promotion requis" },
        { status: 400 }
      );
    }
    
    // Vérifier si la promotion existe
    const existingPromotion = await prisma.promotion.findUnique({
      where: { id: data.id }
    });
    
    if (!existingPromotion) {
      return NextResponse.json(
        { error: `Promotion avec l'ID ${data.id} non trouvée` },
        { status: 404 }
      );
    }
    
    // Préparer les données à mettre à jour
    const updateData = {};
    
    // PATCH permet des mises à jour partielles
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    
    // Mettre à jour la promotion
    const promotion = await prisma.promotion.update({
      where: { id: data.id },
      data: updateData,
      include: {
        store: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // Utiliser handleBigInt pour gérer la sérialisation des BigInt
    const processedPromotion = handleBigInt(promotion);
    
    return NextResponse.json({
      message: "Promotion mise à jour avec succès",
      promotion: processedPromotion
    });
  } catch (error) {
    console.error('[ADMIN_PROMOTIONS_PATCH] Erreur:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 