import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fonction pour vérifier l'authentification admin
async function checkAdminAuth() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'authentification admin:", error);
    return false;
  }
}

// Récupérer les détails d'un vendeur spécifique
export async function GET(request, { params }) {
  try {
    const isAdmin = await checkAdminAuth();
    
    if (!isAdmin && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }
    
    const { id } = params;
    console.log(`Récupération des détails pour le vendeur avec l'ID: ${id}`);
    
    if (!id) {
      return NextResponse.json({ error: "ID du vendeur manquant" }, { status: 400 });
    }
    
    // Récupérer les informations du vendeur
    console.log("Récupération des informations du vendeur...");
    const seller = await prisma.user.findUnique({
      where: {
        id: id,
        role: 'SELLER'
      },
      include: {
        store: true
      }
    });
    
    if (!seller) {
      console.log(`Vendeur avec l'ID ${id} non trouvé`);
      return NextResponse.json({ error: "Vendeur non trouvé" }, { status: 404 });
    }
    
    console.log(`Vendeur trouvé: ${seller.email}`);
    
    // Récupérer les abonnements du vendeur
    console.log(`Récupération des abonnements pour le vendeur ${id}...`);
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`${subscriptions.length} abonnements trouvés pour le vendeur ${id}`);
    
    // Vérifier et corriger les dates des abonnements si nécessaire
    const processedSubscriptions = subscriptions.map(sub => {
      try {
        // S'assurer que les dates sont au format ISO
        const expiresAt = sub.expiresAt instanceof Date ? sub.expiresAt.toISOString() : sub.expiresAt;
        const createdAt = sub.createdAt instanceof Date ? sub.createdAt.toISOString() : sub.createdAt;
        
        // Vérifier que les dates sont valides
        const expiresAtDate = new Date(expiresAt);
        const createdAtDate = new Date(createdAt);
        const isExpiresAtValid = !isNaN(expiresAtDate.getTime());
        const isCreatedAtValid = !isNaN(createdAtDate.getTime());
        
        console.log(`Vérification des dates pour l'abonnement ${sub.id}:`);
        console.log(`- expiresAt: ${expiresAt} (${isExpiresAtValid ? 'valide' : 'invalide'})`);
        console.log(`- createdAt: ${createdAt} (${isCreatedAtValid ? 'valide' : 'invalide'})`);
        
        return {
          ...sub,
          // Utiliser les chaînes ISO pour les dates
          expiresAt: isExpiresAtValid ? expiresAt : new Date().toISOString(),
          createdAt: isCreatedAtValid ? createdAt : new Date().toISOString(),
          // Ajouter des informations de débogage
          _debug: {
            originalExpiresAt: sub.expiresAt,
            originalCreatedAt: sub.createdAt,
            isExpiresAtValid,
            isCreatedAtValid
          }
        };
      } catch (error) {
        console.error(`Erreur lors du traitement de l'abonnement ${sub.id}:`, error);
        // En cas d'erreur, retourner l'abonnement original
        return sub;
      }
    });
    
    // Enregistrer les détails de chaque abonnement pour le débogage
    if (processedSubscriptions.length > 0) {
      processedSubscriptions.forEach((sub, index) => {
        const expirationDate = new Date(sub.expiresAt);
        const currentDate = new Date();
        const isExpired = expirationDate < currentDate;
        
        console.log(`Abonnement ${index + 1}:`);
        console.log(`- ID: ${sub.id}`);
        console.log(`- Type: ${sub.type}`);
        console.log(`- Date de création: ${new Date(sub.createdAt).toISOString()}`);
        console.log(`- Date d'expiration: ${expirationDate.toISOString()}`);
        console.log(`- Montant: ${sub.amount}`);
        console.log(`- Statut: ${sub.status}`);
        console.log(`- Est expiré: ${isExpired}`);
      });
    }
    
    // Vérifier si l'abonnement le plus récent est expiré
    let warning = null;
    const latestSubscription = processedSubscriptions.length > 0 ? processedSubscriptions[0] : null;
    
    if (latestSubscription) {
      const expirationDate = new Date(latestSubscription.expiresAt);
      const currentDate = new Date();
      const isExpired = expirationDate < currentDate;
      
      console.log(`Vérification de l'expiration de l'abonnement le plus récent:`);
      console.log(`- Date d'expiration: ${expirationDate.toISOString()}`);
      console.log(`- Date actuelle: ${currentDate.toISOString()}`);
      console.log(`- Est expiré: ${isExpired}`);
      
      // Mise à jour du statut de l'abonnement si expiré
      if (isExpired && latestSubscription.status !== 'EXPIRED') {
        console.log(`Mise à jour du statut de l'abonnement ${latestSubscription.id} de ${latestSubscription.status} à EXPIRED`);
        try {
          await prisma.subscription.update({
            where: { id: latestSubscription.id },
            data: { status: 'EXPIRED' }
          });
          
          // Mettre à jour l'objet dans notre réponse également
          latestSubscription.status = 'EXPIRED';
        } catch (updateError) {
          console.error(`Erreur lors de la mise à jour du statut de l'abonnement: ${updateError.message}`);
        }
      }
      
      // Si l'abonnement est expiré et le magasin est approuvé, désactiver le magasin
      if (isExpired && seller.store?.isApproved) {
        console.log(`Abonnement expiré pour le vendeur ${id}, désactivation automatique du magasin`);
        await prisma.store.update({
          where: { id: seller.store.id },
          data: { isApproved: false }
        });
        
        // Mettre à jour l'objet vendeur avec le nouveau statut
        seller.store.isApproved = false;
        
        // Informer que le vendeur a été automatiquement rejeté
        warning = "L'abonnement de ce vendeur est expiré. Son magasin a été automatiquement désactivé.";
      }
    } else {
      console.log(`Aucun abonnement trouvé pour le vendeur ${id}`);
    }
    
    return NextResponse.json({ 
      seller,
      subscriptions: processedSubscriptions,
      warning,
      debug: {
        currentDate: new Date().toISOString(),
        hasSubscriptions: processedSubscriptions.length > 0,
        latestSubscriptionId: latestSubscription?.id || null
      }
    });
  } catch (error) {
    console.error('[ADMIN_SELLER_GET]', error);
    return NextResponse.json({ error: "Erreur lors de la récupération du vendeur" }, { status: 500 });
  }
}

// Mettre à jour le statut d'un vendeur (approuver/refuser)
export async function PATCH(request, { params }) {
  try {
    const isAdmin = await checkAdminAuth();
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: "ID du vendeur manquant" }, { status: 400 });
    }
    
    // Vérifier si le vendeur existe
    const seller = await prisma.user.findUnique({
      where: {
        id: id,
        role: 'SELLER'
      },
      include: {
        store: true
      }
    });
    
    if (!seller) {
      return NextResponse.json({ error: "Vendeur non trouvé" }, { status: 404 });
    }
    
    if (!seller.store) {
      return NextResponse.json({ error: "Ce vendeur n'a pas encore de magasin" }, { status: 400 });
    }
    
    // Récupérer les données de la requête
    const data = await request.json();
    const { isApproved } = data;
    
    if (isApproved === undefined) {
      return NextResponse.json({ error: "Le statut d'approbation est requis" }, { status: 400 });
    }
    
    // Si on essaie d'approuver le vendeur, vérifier si son abonnement est actif
    if (isApproved === true) {
      // Récupérer l'abonnement le plus récent
      const latestSubscription = await prisma.subscription.findFirst({
        where: {
          userId: id
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Vérifier si l'abonnement est expiré basé sur la date, indépendamment du statut stocké
      if (latestSubscription) {
        const expirationDate = new Date(latestSubscription.expiresAt);
        const currentDate = new Date();
        const isExpired = expirationDate < currentDate;
        
        console.log(`Vérification de l'abonnement avant approbation:`);
        console.log(`- Date d'expiration: ${expirationDate.toISOString()}`);
        console.log(`- Date actuelle: ${currentDate.toISOString()}`);
        console.log(`- Est expiré: ${isExpired}`);
        console.log(`- Statut actuel: ${latestSubscription.status}`);
        
        // Mettre à jour le statut de l'abonnement s'il est expiré mais toujours marqué comme ACTIVE
        if (isExpired && latestSubscription.status !== 'EXPIRED') {
          console.log(`Mise à jour automatique du statut de l'abonnement à EXPIRED`);
          await prisma.subscription.update({
            where: { id: latestSubscription.id },
            data: { status: 'EXPIRED' }
          });
        }
        
        if (isExpired) {
          return NextResponse.json({ 
            error: "Impossible d'approuver un vendeur dont l'abonnement est expiré. Le vendeur doit renouveler son abonnement." 
          }, { status: 400 });
        }
      } else {
        return NextResponse.json({ 
          error: "Impossible d'approuver un vendeur sans abonnement actif." 
        }, { status: 400 });
      }
    }
    
    // Mettre à jour le statut d'approbation du magasin
    const updatedStore = await prisma.store.update({
      where: { id: seller.store.id },
      data: { isApproved: Boolean(isApproved) }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: isApproved ? "Vendeur approuvé avec succès" : "Vendeur refusé avec succès",
      store: updatedStore
    });
  } catch (error) {
    console.error('[ADMIN_SELLER_PATCH]', error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour du statut du vendeur" }, { status: 500 });
  }
} 