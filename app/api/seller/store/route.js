import { NextResponse } from "next/server";
import { getSellerStore } from "@/lib/seller-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log("[STORE_GET] Début de la requête GET");
    
    const sellerData = await getSellerStore();
    console.log("[STORE_GET] Données du vendeur:", sellerData ? "Trouvées" : "Non trouvées");
    
    if (!sellerData) {
      console.log("[STORE_GET] Non autorisé ou magasin non trouvé");
      return NextResponse.json({ error: "Non autorisé ou magasin non trouvé" }, { status: 401 });
    }

    const { store } = sellerData;
    console.log("[STORE_GET] ID du magasin:", store.id);
    
    const storeWithDetails = await prisma.store.findUnique({
      where: {
        id: store.id
      },
      include: {
        openingHours: true
      }
    });

    return NextResponse.json(storeWithDetails || {});
  } catch (error) {
    console.log("[STORE_GET] Erreur:", error.message);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des informations du magasin" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    console.log("[STORE_PUT] Début de la requête PUT");
    
    const sellerData = await getSellerStore();
    console.log("[STORE_PUT] Données du vendeur:", sellerData ? "Trouvées" : "Non trouvées");
    
    if (!sellerData) {
      console.log("[STORE_PUT] Non autorisé ou magasin non trouvé");
      return NextResponse.json({ error: "Non autorisé ou magasin non trouvé" }, { status: 401 });
    }

    const { store } = sellerData;
    console.log("[STORE_PUT] ID du magasin:", store.id);
    
    // Vérifier si la requête contient des données JSON valides
    let data;
    try {
      data = await request.json();
      console.log("[STORE_PUT] Données JSON reçues:", JSON.stringify(data).substring(0, 100) + "...");
    } catch (error) {
      console.log("[STORE_PUT] Erreur de parsing JSON:", error.message);
      return NextResponse.json({ 
        error: {
          message: "Format de données invalide",
          details: error.message
        }
      }, { status: 400 });
    }
    
    // Vérifier que les données ne sont pas null
    if (!data) {
      console.log("[STORE_PUT] Aucune donnée fournie");
      return NextResponse.json({ 
        error: {
          message: "Aucune donnée fournie",
          details: "Le corps de la requête est vide ou invalide"
        }
      }, { status: 400 });
    }
    
    const {
      name,
      description,
      address,
      city,
      phone,
      email,
      website,
      facebook,
      instagram,
      logo,
      banner,
      openingHours
    } = data;

    console.log("[STORE_PUT] Nom:", name);
    console.log("[STORE_PUT] Description:", description ? "Présente" : "Absente");

    // Validation des données
    if (!name || !description) {
      console.log("[STORE_PUT] Validation échouée: nom ou description manquant");
      return NextResponse.json({ 
        error: {
          message: "Le nom et la description sont obligatoires",
          details: "Veuillez fournir un nom et une description pour votre boutique"
        }
      }, { status: 400 });
    }

    // Préparer les données de mise à jour en évitant les valeurs null/undefined
    const updateData = {
      name,
      description,
      address: address || undefined,
      city: city || undefined,
      phone: phone || undefined,
      email: email || undefined,
      website: website || undefined,
      facebook: facebook || undefined,
      instagram: instagram || undefined,
      logo: logo || undefined,
      banner: banner || undefined
    };
    
    console.log("[STORE_PUT] Données de mise à jour préparées:", updateData);
    
    // Mettre à jour le magasin
    let updatedStore;
    try {
      updatedStore = await prisma.store.update({
        where: {
          id: store.id
        },
        data: updateData
      });
      console.log("[STORE_PUT] Magasin mis à jour avec succès");
    } catch (error) {
      console.log("[STORE_PUT] Erreur lors de la mise à jour du magasin:", error.message);
      return NextResponse.json({ 
        error: {
          message: "Erreur lors de la mise à jour des informations du magasin",
          details: {
            message: error.message,
            code: error.code,
            meta: error.meta
          }
        }
      }, { status: 500 });
    }

    // Mettre à jour les horaires d'ouverture
    if (openingHours) {
      console.log("[STORE_PUT] Traitement des horaires d'ouverture");
      try {
        // Supprimer les horaires existants
        await prisma.openingHours.deleteMany({
          where: {
            storeId: store.id
          }
        });
        
        // Créer les nouveaux horaires
        const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const openingHoursData = [];
        
        for (const day of daysOfWeek) {
          if (openingHours[day]) {
            const dayData = openingHours[day];
            openingHoursData.push({
              day: day,
              openTime: dayData.open || null,
              closeTime: dayData.close || null,
              isClosed: dayData.closed || false,
              storeId: store.id,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }
        
        if (openingHoursData.length > 0) {
          await prisma.openingHours.createMany({
            data: openingHoursData
          });
          console.log("[STORE_PUT] Horaires d'ouverture mis à jour avec succès");
        }
      } catch (error) {
        console.log("[STORE_PUT] Erreur lors de la mise à jour des horaires d'ouverture:", error.message);
        return NextResponse.json({ 
          error: {
            message: "Erreur lors de la mise à jour des horaires d'ouverture",
            details: error.message
          }
        }, { status: 500 });
      }
    }

    // Récupérer la boutique mise à jour avec les horaires
    try {
      console.log("[STORE_PUT] Récupération des détails du magasin mis à jour");
      const storeWithDetails = await prisma.store.findUnique({
        where: {
          id: store.id
        },
        include: {
          openingHours: true,
          categories: true
        }
      });
      
      console.log("[STORE_PUT] Détails récupérés avec succès");
      if (storeWithDetails) {
        return NextResponse.json(storeWithDetails);
      } else {
        return NextResponse.json({ 
          error: {
            message: "Magasin non trouvé",
            details: "Impossible de récupérer les détails du magasin après la mise à jour"
          }
        }, { status: 404 });
      }
    } catch (error) {
      console.log("[STORE_PUT] Erreur lors de la récupération des détails:", error.message);
      // Si on ne peut pas récupérer les détails, retourner au moins le magasin mis à jour
      return NextResponse.json(updatedStore || {});
    }
  } catch (error) {
    console.log("[STORE_PUT] Erreur générale:", error.message);
    return NextResponse.json(
      { 
        error: {
          message: "Erreur lors de la mise à jour de la boutique",
          details: error.message
        }
      },
      { status: 500 }
    );
  }
}

// Endpoint pour récupérer les statistiques de la boutique
export async function POST(request) {
  try {
    const sellerData = await getSellerStore();
    if (!sellerData) {
      return NextResponse.json({ error: "Non autorisé ou magasin non trouvé" }, { status: 401 });
    }

    const { store } = sellerData;
    const { period } = await request.json();

    // Calculer la date de début selon la période
    const startDate = new Date();
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setFullYear(2000); // Pour "all", on prend une date très ancienne
    }

    // Récupérer les statistiques
    const stats = await prisma.$transaction([
      // Total des ventes
      prisma.order.aggregate({
        where: {
          storeId: store.id,
          createdAt: {
            gte: startDate
          },
          status: {
            in: ['COMPLETED', 'DELIVERED']
          }
        },
        _sum: {
          total: true
        },
        _count: true
      }),
      
      // Nombre de produits
      prisma.product.count({
        where: {
          storeId: store.id
        }
      }),
      
      // Nombre de clients uniques
      prisma.order.groupBy({
        by: ['customerId'],
        where: {
          storeId: store.id,
          createdAt: {
            gte: startDate
          }
        },
        _count: true
      }),
      
      // Nombre de vues
      prisma.storeView.aggregate({
        where: {
          storeId: store.id,
          createdAt: {
            gte: startDate
          }
        },
        _count: true
      })
    ]);
    
    // Formater les résultats
    const [salesStats, productsCount, customerGroups, viewsStats] = stats;
    
    return NextResponse.json({
      sales: {
        total: salesStats._sum.total || 0,
        count: salesStats._count || 0
      },
      products: productsCount,
      customers: customerGroups.length,
      views: viewsStats._count || 0
    });
  } catch (error) {
    console.log("Error fetching store stats:", error.message);
    return NextResponse.json(
      { 
        error: {
          message: "Erreur lors de la récupération des statistiques de la boutique",
          details: error.message
        }
      },
      { status: 500 }
    );
  }
}
