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

// Mettre à jour le statut d'un abonnement
export async function POST(request) {
  try {
    // Vérifier l'authentification (autorisé uniquement pour les admins)
    const isAdmin = await checkAdminAuth();
    
    if (!isAdmin && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }
    
    // Obtenir les données de la requête
    const data = await request.json();
    const { subscriptionId, status } = data;
    
    // Vérifier les données requises
    if (!subscriptionId) {
      return NextResponse.json({ error: "ID de l'abonnement manquant" }, { status: 400 });
    }
    
    if (!status || !['ACTIVE', 'EXPIRED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }
    
    console.log(`Mise à jour de l'abonnement ${subscriptionId} au statut ${status}`);
    
    // Mettre à jour le statut de l'abonnement
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status }
    });
    
    console.log("Abonnement mis à jour avec succès:", updatedSubscription);
    
    // Si le statut est EXPIRED, désactiver le magasin du vendeur
    if (status === 'EXPIRED') {
      // Récupérer l'utilisateur associé à cet abonnement
      const user = await prisma.user.findUnique({
        where: { id: updatedSubscription.userId },
        include: { store: true }
      });
      
      // Si l'utilisateur a un magasin qui est approuvé, le désactiver
      if (user && user.store && user.store.isApproved) {
        console.log(`Désactivation du magasin ${user.store.id} suite à l'expiration de l'abonnement`);
        
        await prisma.store.update({
          where: { id: user.store.id },
          data: { isApproved: false }
        });
        
        console.log("Magasin désactivé avec succès");
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Statut de l'abonnement mis à jour avec succès`,
      subscription: updatedSubscription
    });
  } catch (error) {
    console.error('[UPDATE_SUBSCRIPTION_STATUS]', error);
    return NextResponse.json({ 
      error: "Erreur lors de la mise à jour du statut de l'abonnement",
      message: error.message
    }, { status: 500 });
  }
} 