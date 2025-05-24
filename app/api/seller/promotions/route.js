import { NextResponse } from "next/server";
import { getSellerStore } from "@/lib/seller-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const sellerData = await getSellerStore();
    if (!sellerData) {
      return NextResponse.json({ error: "Non autorisé ou magasin non trouvé" }, { status: 401 });
    }

    const { store } = sellerData;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Construire la requête
    const where = {
      storeId: store.id
    };

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    try {
      // Récupérer les promotions
      const [promotions, total] = await prisma.$transaction([
        prisma.promotion.findMany({
          where,
          orderBy: {
            [sortField]: sortOrder
          },
          skip,
          take: limit
        }),
        prisma.promotion.count({ where })
      ]);

      // Calculer les statistiques
      const now = new Date();
      const activePromotions = await prisma.promotion.count({
        where: {
          storeId: store.id,
          isActive: true,
          endDate: {
            gte: now
          }
        }
      });

      // Récupérer le nombre total d'utilisations
      const totalUsages = await prisma.order.count({
        where: {
          storeId: store.id,
          promotionId: {
            not: null
          }
        }
      });

      // Calculer le revenu généré par les promotions
      const promotionOrders = await prisma.order.findMany({
        where: {
          storeId: store.id,
          promotionId: {
            not: null
          },
          status: {
            in: ['COMPLETED', 'DELIVERED']
          }
        },
        select: {
          total: true
        }
      });

      const revenue = promotionOrders.reduce((sum, order) => sum + order.total, 0);

      // Sérialiser les résultats pour gérer les BigInt
      const serializedPromotions = JSON.parse(
        JSON.stringify(promotions, (key, value) => 
          typeof value === 'bigint' ? Number(value) : value
        )
      );

      return NextResponse.json({
        promotions: serializedPromotions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        stats: {
          totalPromotions: total,
          activePromotions,
          totalUsages,
          revenue
        }
      });
    } catch (dbError) {
      console.error("Erreur de base de données:", dbError);
      return NextResponse.json({ 
        error: "Erreur lors de la récupération des données", 
        details: dbError.message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des promotions:", error);
    return NextResponse.json({ 
      error: "Erreur lors de la récupération des promotions",
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const sellerData = await getSellerStore();
    if (!sellerData) {
      return NextResponse.json({ error: "Non autorisé ou magasin non trouvé" }, { status: 401 });
    }

    const { store } = sellerData;
    const data = await request.json();
    
    // Validation des données
    if (!data.code || !data.type || !data.value || !data.startDate || !data.endDate) {
      return NextResponse.json(
        { error: "Données de promotion incomplètes" },
        { status: 400 }
      );
    }

    // Vérifier si le code existe déjà pour ce vendeur
    const existingPromotion = await prisma.promotion.findFirst({
      where: {
        code: data.code,
        storeId: store.id
      }
    });

    if (existingPromotion) {
      return NextResponse.json(
        { error: "Un code de promotion identique existe déjà" },
        { status: 400 }
      );
    }

    // Créer la promotion
    const promotion = await prisma.promotion.create({
      data: {
        code: data.code,
        type: data.type,
        value: parseFloat(data.value),
        minPurchase: data.minPurchase ? parseFloat(data.minPurchase) : 0,
        maxUses: data.maxUses ? parseInt(data.maxUses) : 0,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        description: data.description || "",
        isActive: data.isActive !== undefined ? data.isActive : true,
        storeId: store.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Sérialiser le résultat pour gérer les BigInt
    const serializedPromotion = JSON.parse(
      JSON.stringify(promotion, (key, value) => 
        typeof value === 'bigint' ? Number(value) : value
      )
    );

    return NextResponse.json(serializedPromotion);
  } catch (error) {
    console.error("Erreur lors de la création de la promotion:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la promotion" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const sellerData = await getSellerStore();
    if (!sellerData) {
      return NextResponse.json({ error: "Non autorisé ou magasin non trouvé" }, { status: 401 });
    }

    const { store } = sellerData;
    const data = await request.json();
    
    // Validation des données
    if (!data.id || !data.code || !data.type || !data.value || !data.startDate || !data.endDate) {
      return NextResponse.json(
        { error: "Données de promotion incomplètes" },
        { status: 400 }
      );
    }

    // Vérifier que la promotion appartient bien au vendeur
    const existingPromotion = await prisma.promotion.findFirst({
      where: {
        id: data.id,
        storeId: store.id
      }
    });

    if (!existingPromotion) {
      return NextResponse.json(
        { error: "Promotion non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier si le code existe déjà pour ce vendeur (sauf pour cette promotion)
    if (data.code !== existingPromotion.code) {
      const duplicateCode = await prisma.promotion.findFirst({
        where: {
          code: data.code,
          storeId: store.id,
          id: {
            not: data.id
          }
        }
      });

      if (duplicateCode) {
        return NextResponse.json(
          { error: "Un code de promotion identique existe déjà" },
          { status: 400 }
        );
      }
    }

    // Mettre à jour la promotion
    const promotion = await prisma.promotion.update({
      where: {
        id: data.id
      },
      data: {
        code: data.code,
        type: data.type,
        value: parseFloat(data.value),
        minPurchase: data.minPurchase ? parseFloat(data.minPurchase) : 0,
        maxUses: data.maxUses ? parseInt(data.maxUses) : 0,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        description: data.description || "",
        isActive: data.isActive,
        updatedAt: new Date()
      }
    });

    // Sérialiser le résultat pour gérer les BigInt
    const serializedPromotion = JSON.parse(
      JSON.stringify(promotion, (key, value) => 
        typeof value === 'bigint' ? Number(value) : value
      )
    );

    return NextResponse.json(serializedPromotion);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la promotion:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la promotion" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const sellerData = await getSellerStore();
    if (!sellerData) {
      return NextResponse.json({ error: "Non autorisé ou magasin non trouvé" }, { status: 401 });
    }

    const { store } = sellerData;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: "ID de promotion requis" },
        { status: 400 }
      );
    }

    try {
      // Vérifier que la promotion appartient bien au vendeur
      const existingPromotion = await prisma.promotion.findFirst({
        where: {
          id,
          storeId: store.id
        }
      });

      if (!existingPromotion) {
        return NextResponse.json(
          { error: "Promotion non trouvée" },
          { status: 404 }
        );
      }

      // Vérifier si la promotion est utilisée par des commandes
      const ordersCount = await prisma.order.count({
        where: {
          promotionId: id
        }
      });

      if (ordersCount > 0) {
        // Plutôt que de bloquer la suppression, on peut désactiver la promotion
        await prisma.promotion.update({
          where: { id },
          data: { isActive: false }
        });

        return NextResponse.json({
          success: true,
          message: "La promotion a été désactivée car elle est utilisée par des commandes"
        });
      }

      // Supprimer la promotion
      await prisma.promotion.delete({
        where: { id }
      });

      return NextResponse.json({ 
        success: true,
        message: "Promotion supprimée avec succès" 
      });
    } catch (dbError) {
      console.error("Erreur de base de données lors de la suppression:", dbError);
      return NextResponse.json({ 
        error: "Erreur lors de la suppression de la promotion", 
        details: dbError.message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de la promotion:", error);
    return NextResponse.json(
      { 
        error: "Erreur lors de la suppression de la promotion",
        details: error.message
      },
      { status: 500 }
    );
  }
}
