import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { addDays } from "date-fns";

const prisma = new PrismaClient();

// Obtenir les abonnements de l'utilisateur connecté
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("GET /api/subscriptions - Session:", session?.user?.email);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    
    const userId = session.user.id;
    console.log("Recherche d'abonnements pour l'utilisateur:", userId);
    
    // Récupérer tous les abonnements de l'utilisateur, triés par date de création
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log("Abonnements trouvés:", subscriptions.length);
    
    // Récupérer l'abonnement actif (le plus récent)
    const activeSubscription = subscriptions.length > 0 ? subscriptions[0] : null;
    const currentDate = new Date();
    
    // Vérifier si l'abonnement le plus récent est encore valide
    const isActive = activeSubscription && new Date(activeSubscription.expiresAt) > currentDate;
    
    // Si l'abonnement le plus récent a expiré, mettre à jour son statut dans la base de données
    if (activeSubscription && !isActive) {
      console.log(`L'abonnement ${activeSubscription.id} a expiré le ${activeSubscription.expiresAt}, mise à jour du statut...`);
      try {
        // Mettre à jour le statut uniquement s'il n'est pas déjà EXPIRED
        if (activeSubscription.status !== 'EXPIRED') {
          await prisma.subscription.update({
            where: { id: activeSubscription.id },
            data: { status: 'EXPIRED' }
          });
          activeSubscription.status = 'EXPIRED';
          console.log(`Statut de l'abonnement mis à jour à EXPIRED`);
          
          // Si le vendeur a un magasin approuvé, le désactiver
          const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { store: true }
          });
          
          if (user && user.store && user.store.isApproved) {
            console.log(`Désactivation du magasin ${user.store.id} suite à l'expiration de l'abonnement`);
            
            await prisma.store.update({
              where: { id: user.store.id },
              data: { isApproved: false }
            });
            
            console.log("Magasin désactivé avec succès");
          }
        } else {
          console.log(`L'abonnement est déjà marqué comme EXPIRED, aucune action nécessaire`);
        }
      } catch (updateError) {
        console.error("Erreur lors de la mise à jour du statut de l'abonnement:", updateError);
      }
    }
    
    // Vérifier si l'utilisateur a déjà utilisé un abonnement gratuit
    const hasUsedFreeTrial = subscriptions.some(sub => sub.type === 'FREE');
    
    console.log("Abonnement actif:", activeSubscription?.id, "Expiré le:", activeSubscription?.expiresAt);
    console.log("A utilisé l'essai gratuit:", hasUsedFreeTrial);
    
    return NextResponse.json({ 
      subscriptions, 
      activeSubscription,
      hasActiveSubscription: isActive,
      hasUsedFreeTrial,
      expired: activeSubscription && !isActive
    });
  } catch (error) {
    console.error("[SUBSCRIPTION_GET]", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des abonnements" }, { status: 500 });
  }
}

// Créer un nouvel abonnement
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("POST /api/subscriptions - Session:", session?.user?.email);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    
    if (session.user.role !== 'SELLER') {
      return NextResponse.json({ error: "Seuls les vendeurs peuvent créer des abonnements" }, { status: 403 });
    }
    
    const userId = session.user.id;
    const body = await request.json();
    const { type, paymentId = null } = body;
    
    console.log("Création d'abonnement:", { type, userId });
    
    if (!type || !['FREE', 'MONTHLY', 'ANNUAL'].includes(type)) {
      return NextResponse.json({ error: "Type d'abonnement invalide" }, { status: 400 });
    }
    
    // Vérifier si l'utilisateur a déjà utilisé un abonnement gratuit
    if (type === 'FREE') {
      const existingFreeSubscriptions = await prisma.subscription.findMany({
        where: {
          userId: userId,
          type: 'FREE'
        }
      });
      
      if (existingFreeSubscriptions.length > 0) {
        return NextResponse.json({ 
          error: "Vous avez déjà utilisé votre essai gratuit. Veuillez choisir un autre plan d'abonnement." 
        }, { status: 400 });
      }
    }
    
    // Annuler tous les abonnements actifs précédents
    await prisma.subscription.updateMany({
      where: {
        userId: userId,
        status: 'ACTIVE'
      },
      data: {
        status: 'CANCELLED'
      }
    });
    
    // Calculer le montant et la date d'expiration en fonction du type d'abonnement
    let amount = 0;
    let expiresAt = new Date();
    
    switch (type) {
      case 'FREE':
        // Gratuit pendant 3 jours
        amount = 0;
        expiresAt = addDays(new Date(), 3);
        break;
      case 'MONTHLY':
        // Abonnement mensuel à 30 dinars
        amount = 30;
        expiresAt = addDays(new Date(), 30);
        break;
      case 'ANNUAL':
        // Abonnement annuel à 310 dinars
        amount = 310;
        expiresAt = addDays(new Date(), 365);
        break;
    }
    
    // Créer le nouvel abonnement
    const subscription = await prisma.subscription.create({
      data: {
        type,
        amount,
        userId,
        expiresAt,
        status: 'ACTIVE',
        paymentId,
        createdAt: new Date()
      }
    });
    
    console.log("Abonnement créé:", subscription.id);
    
    return NextResponse.json({ 
      success: true,
      message: "Abonnement créé avec succès",
      subscription
    });
  } catch (error) {
    console.error("[SUBSCRIPTION_POST]", error);
    return NextResponse.json({ error: "Erreur lors de la création de l'abonnement", message: error.message }, { status: 500 });
  }
} 