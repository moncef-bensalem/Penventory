import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

// Création d'une instance singleton de Prisma pour éviter les problèmes de connexion
const prismaClientSingleton = () => {
  return new PrismaClient();
};

const globalForPrisma = globalThis;
globalForPrisma.prisma = globalForPrisma.prisma ?? prismaClientSingleton();
const prisma = globalForPrisma.prisma;

/**
 * Vérifie si l'utilisateur est un vendeur et récupère les infos de son magasin
 * Retourne { user, store, status } si tout est ok, null sinon
 * status est une chaîne décrivant le statut de l'autorisation:
 *   - "authenticated": Tout est ok
 *   - "unauthenticated": Utilisateur non authentifié
 *   - "not_seller": L'utilisateur n'est pas un vendeur
 *   - "no_store": Le vendeur n'a pas encore de magasin
 *   - "store_not_approved": Le magasin du vendeur n'est pas approuvé
 *   - "subscription_required": Le vendeur n'a pas d'abonnement actif
 */
export async function getSellerStore() {
  try {
    console.log("[LIB_SELLER_AUTH] Vérification de l'accès vendeur...");
    
    // Vérifier si l'utilisateur est connecté
    const session = await getServerSession(authOptions);
    console.log("[LIB_SELLER_AUTH] Session:", session?.user?.email);
    
    if (!session || !session.user) {
      console.log("[LIB_SELLER_AUTH] Utilisateur non authentifié");
      return { status: "unauthenticated" };
    }
    
    // Vérifier si l'utilisateur est un vendeur
    if (session.user.role !== "SELLER") {
      console.log("[LIB_SELLER_AUTH] L'utilisateur n'est pas un vendeur:", session.user.role);
      return { user: session.user, status: "not_seller" };
    }
    
    const userId = session.user.id;
    console.log("[LIB_SELLER_AUTH] ID de l'utilisateur:", userId);
    
    // Obtenir les informations du vendeur
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      console.log("[LIB_SELLER_AUTH] Utilisateur non trouvé en base de données");
      return { status: "unauthenticated" };
    }
    
    console.log("[LIB_SELLER_AUTH] Utilisateur trouvé:", user.id, user.email);
    
    // Récupérer le magasin du vendeur
    const store = await prisma.store.findFirst({
      where: { ownerId: userId }
    });
    
    // Vérifier si le vendeur a un magasin
    if (!store) {
      console.log("[LIB_SELLER_AUTH] Magasin non trouvé pour le vendeur:", user.id);
      return { user, store: null, status: "no_store" };
    }
    
    console.log("[LIB_SELLER_AUTH] Magasin trouvé:", store.id, "Approuvé:", store.isApproved);
    
    // Vérifier si le magasin est approuvé
    if (!store.isApproved) {
      console.log("[LIB_SELLER_AUTH] Magasin non approuvé:", store.id);
      return { user, store, status: "store_not_approved" };
    }
    
    // Vérifier si le vendeur a un abonnement actif
    const currentDate = new Date();
    console.log("[LIB_SELLER_AUTH] Date actuelle:", currentDate.toISOString());
    
    // Récupérer l'abonnement le plus récent, qu'il soit ACTIVE ou non
    const latestSubscription = await prisma.subscription.findFirst({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Si aucun abonnement n'existe, redirection vers la page d'abonnement
    if (!latestSubscription) {
      console.log("[LIB_SELLER_AUTH] Aucun abonnement trouvé pour le vendeur");
      return { user, store, status: "subscription_required" };
    }
    
    console.log("[LIB_SELLER_AUTH] Abonnement le plus récent:", 
      `${latestSubscription.id} (expire le ${latestSubscription.expiresAt}, statut: ${latestSubscription.status})`);
    
    // Vérifier si l'abonnement est expiré en comparant la date d'expiration avec la date actuelle,
    // indépendamment du statut stocké en base de données
    const expirationDate = new Date(latestSubscription.expiresAt);
    const isExpired = expirationDate < currentDate;
    
    console.log("[LIB_SELLER_AUTH] Vérification d'expiration:", 
      `Date d'expiration: ${expirationDate.toISOString()}, Est expiré: ${isExpired}`);
    
    // Si l'abonnement est expiré mais pas encore marqué comme tel en base de données,
    // mettre à jour son statut automatiquement
    if (isExpired && latestSubscription.status !== 'EXPIRED') {
      console.log("[LIB_SELLER_AUTH] L'abonnement est expiré mais pas encore marqué comme tel, mise à jour...");
      
      try {
        await prisma.subscription.update({
          where: { id: latestSubscription.id },
          data: { status: 'EXPIRED' }
        });
        
        console.log("[LIB_SELLER_AUTH] Statut de l'abonnement mis à jour à EXPIRED");
        
        // Si le magasin est approuvé, le désactiver automatiquement
        if (store.isApproved) {
          console.log("[LIB_SELLER_AUTH] Désactivation du magasin suite à l'expiration de l'abonnement");
          
          await prisma.store.update({
            where: { id: store.id },
            data: { isApproved: false }
          });
          
          // Comme le magasin vient d'être désactivé, mettre à jour l'objet store
          store.isApproved = false;
          
          console.log("[LIB_SELLER_AUTH] Magasin désactivé avec succès");
        }
      } catch (updateError) {
        console.error("[LIB_SELLER_AUTH] Erreur lors de la mise à jour du statut de l'abonnement:", updateError);
        // Continuer malgré l'erreur pour ne pas bloquer l'accès
      }
    }
    
    // Si l'abonnement est expiré (que ce soit par la date ou par le statut),
    // rediriger vers la page d'abonnement
    if (isExpired || latestSubscription.status === 'EXPIRED') {
      console.log("[LIB_SELLER_AUTH] L'abonnement est expiré, redirection vers la page d'abonnement");
      return { 
        user, 
        store, 
        status: "subscription_required",
        subscriptionInfo: {
          id: latestSubscription.id,
          type: latestSubscription.type,
          createdAt: latestSubscription.createdAt,
          expiresAt: latestSubscription.expiresAt,
          status: isExpired ? 'EXPIRED' : latestSubscription.status,
          hasExpired: true
        }
      };
    }
    
    console.log("[LIB_SELLER_AUTH] Vendeur authentifié avec magasin approuvé et abonnement actif");
    return { 
      user, 
      store, 
      status: "authenticated",
      subscriptionInfo: {
        id: latestSubscription.id,
        type: latestSubscription.type,
        createdAt: latestSubscription.createdAt,
        expiresAt: latestSubscription.expiresAt,
        status: latestSubscription.status,
        hasExpired: false
      }
    };
  } catch (error) {
    console.error("[LIB_SELLER_AUTH] Erreur dans getSellerStore:", error);
    throw error; // Propagation de l'erreur pour meilleure visibilité
  }
}
