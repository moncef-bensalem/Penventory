import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  console.log("[STORE_CREATE] Début de la requête POST");
  
  try {
    // Vérifier l'authentification et le rôle
    const session = await getServerSession(authOptions);
    console.log("[STORE_CREATE] Session:", session ? "Trouvée" : "Non trouvée");
    
    if (!session || session.user.role !== 'SELLER') {
      console.log("[STORE_CREATE] Non autorisé - Rôle incorrect ou non authentifié");
      return NextResponse.json({ 
        error: {
          message: "Non autorisé",
          details: "Vous devez être connecté en tant que vendeur"
        }
      }, { status: 401 });
    }
    
    // Vérifier si le vendeur a déjà une boutique
    const existingStore = await prisma.store.findUnique({
      where: { ownerId: session.user.id }
    });
    
    if (existingStore) {
      console.log("[STORE_CREATE] Le vendeur a déjà une boutique");
      return NextResponse.json({ 
        error: {
          message: "Boutique existante",
          details: "Vous avez déjà une boutique. Utilisez la route PUT pour la mettre à jour."
        }
      }, { status: 400 });
    }
    
    // Récupérer les données de la requête
    let data;
    try {
      data = await request.json();
      console.log("[STORE_CREATE] Données JSON reçues:", JSON.stringify(data).substring(0, 100) + "...");
    } catch (error) {
      console.log("[STORE_CREATE] Erreur de parsing JSON:", error.message);
      return NextResponse.json({ 
        error: {
          message: "Format de données invalide",
          details: error.message
        }
      }, { status: 400 });
    }
    
    // Vérifier que les données ne sont pas null
    if (!data) {
      console.log("[STORE_CREATE] Aucune donnée fournie");
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
    
    // Validation des données
    if (!name || !description) {
      console.log("[STORE_CREATE] Validation échouée: nom ou description manquant");
      return NextResponse.json({ 
        error: {
          message: "Le nom et la description sont obligatoires",
          details: "Veuillez fournir un nom et une description pour votre boutique"
        }
      }, { status: 400 });
    }
    
    // Préparer les données pour la création
    const storeData = {
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
      banner: banner || undefined,
      owner: {
        connect: {
          id: session.user.id
        }
      }
    };
    
    console.log("[STORE_CREATE] Données de création préparées:", JSON.stringify(storeData).substring(0, 100) + "...");
    
    // Créer la boutique
    let newStore;
    try {
      newStore = await prisma.store.create({
        data: storeData
      });
      console.log("[STORE_CREATE] Boutique créée avec succès");
    } catch (error) {
      console.log("[STORE_CREATE] Erreur lors de la création de la boutique:", error.message);
      return NextResponse.json({ 
        error: {
          message: "Erreur lors de la création de la boutique",
          details: {
            message: error.message,
            code: error.code,
            meta: error.meta
          }
        }
      }, { status: 500 });
    }
    
    // Créer les horaires d'ouverture si fournis
    if (openingHours) {
      console.log("[STORE_CREATE] Traitement des horaires d'ouverture");
      try {
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
              storeId: newStore.id
            });
          }
        }
        
        if (openingHoursData.length > 0) {
          await prisma.openingHours.createMany({
            data: openingHoursData
          });
          console.log("[STORE_CREATE] Horaires d'ouverture créés avec succès");
        }
      } catch (error) {
        console.log("[STORE_CREATE] Erreur lors de la création des horaires d'ouverture:", error.message);
        // Ne pas retourner d'erreur ici, la boutique a déjà été créée
      }
    }
    
    // Récupérer la boutique avec tous les détails
    try {
      const storeWithDetails = await prisma.store.findUnique({
        where: {
          id: newStore.id
        },
        include: {
          openingHours: true,
          categories: true
        }
      });
      
      console.log("[STORE_CREATE] Détails récupérés avec succès");
      if (storeWithDetails) {
        return NextResponse.json(storeWithDetails);
      } else {
        return NextResponse.json({ 
          error: {
            message: "Boutique non trouvée",
            details: "Impossible de récupérer les détails de la boutique après la création"
          }
        }, { status: 404 });
      }
    } catch (error) {
      console.log("[STORE_CREATE] Erreur lors de la récupération des détails:", error.message);
      // Retourner au moins la boutique créée
      return NextResponse.json(newStore || {});
    }
  } catch (error) {
    console.log("[STORE_CREATE] Erreur générale:", error.message);
    return NextResponse.json(
      { 
        error: {
          message: "Erreur lors de la création de la boutique",
          details: error.message
        }
      },
      { status: 500 }
    );
  }
}
