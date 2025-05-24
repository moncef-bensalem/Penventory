import { getServerSession } from "next-auth/next";

// Importer et réexporter authOptions depuis le fichier NextAuth
import { authOptions as nextAuthOptions } from "@/app/api/auth/[...nextauth]/route";
export const authOptions = nextAuthOptions;

// Fonction pour obtenir la session utilisateur côté serveur
export async function getSession() {
  return await getServerSession(authOptions);
}

// Fonction pour obtenir l'utilisateur actuel côté serveur
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

// Fonction pour vérifier si l'utilisateur est authentifié
export async function isAuthenticated() {
  const session = await getSession();
  return !!session;
}

// Fonction pour vérifier si l'utilisateur a un rôle spécifique
export async function hasRole(role) {
  const session = await getSession();
  return session?.user?.role === role;
}

// Fonction pour vérifier si l'utilisateur est un administrateur
export async function isAdmin() {
  return await hasRole("ADMIN");
}

// Fonction pour vérifier si l'utilisateur est un vendeur
export async function isSeller() {
  return await hasRole("SELLER");
}

// Fonction pour vérifier si l'utilisateur est un client
export async function isCustomer() {
  return await hasRole("CUSTOMER");
}

// Fonction pour vérifier si l'utilisateur a accès à une ressource
export async function hasAccess(resourceOwnerId) {
  const session = await getSession();
  
  if (!session) return false;
  
  // Les administrateurs ont accès à tout
  if (session.user.role === "ADMIN") return true;
  
  // Les utilisateurs ont accès à leurs propres ressources
  return session.user.id === resourceOwnerId;
}
