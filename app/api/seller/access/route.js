import { NextResponse } from "next/server";
import { getSellerStore } from "@/lib/seller-auth";

export async function GET() {
  try {
    console.log('API: /api/seller/access - Vérification de l\'accès...');
    const result = await getSellerStore();
    
    if (!result) {
      console.error('API: /api/seller/access - Erreur: getSellerStore() a retourné null');
      return NextResponse.json({ error: "Erreur lors de la vérification de l'accès" }, { status: 500 });
    }
    
    const { user, store, status, subscriptionInfo } = result;
    console.log('API: /api/seller/access - Résultat:', { userId: user?.id, storeId: store?.id, status });
    
    // Si l'utilisateur n'est pas authentifié
    if (status === "unauthenticated" || !user) {
      console.log('API: /api/seller/access - Utilisateur non authentifié');
      return NextResponse.json({ status, message: "Non authentifié" }, { status: 401 });
    }
    
    // Si l'utilisateur n'est pas un vendeur
    if (status === "not_seller") {
      console.log('API: /api/seller/access - L\'utilisateur n\'est pas un vendeur');
      return NextResponse.json({ status, message: "Rôle vendeur requis" }, { status: 403 });
    }
    
    // Retourner le statut actuel
    console.log('API: /api/seller/access - Retour du statut:', status);
    return NextResponse.json({
      status,
      store: store || null,
      subscriptionInfo,
      message: getStatusMessage(status, subscriptionInfo)
    });
  } catch (error) {
    console.error("[SELLER_ACCESS_CHECK] Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur lors de la vérification de l'accès", message: error.message }, { status: 500 });
  }
}

// Fonction pour obtenir un message basé sur le statut
function getStatusMessage(status, subscriptionInfo) {
  switch (status) {
    case "authenticated":
      return "Accès autorisé";
    case "no_store":
      return "Vous devez créer un magasin pour accéder au tableau de bord";
    case "store_not_approved":
      return "Votre magasin est en attente d'approbation par notre équipe";
    case "subscription_required":
      if (subscriptionInfo && subscriptionInfo.hasExpired) {
        return `Votre abonnement ${subscriptionInfo.type} a expiré le ${formatDate(subscriptionInfo.expiresAt)}. Veuillez renouveler votre abonnement pour continuer à utiliser nos services.`;
      }
      return "Vous devez souscrire à un abonnement pour accéder au tableau de bord";
    default:
      return "Vérification de l'accès";
  }
}

// Fonction pour formater une date
function formatDate(dateString) {
  if (!dateString) return "date inconnue";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error("Erreur lors du formatage de la date:", error);
    return dateString;
  }
} 