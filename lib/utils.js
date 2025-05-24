import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Fonction pour générer un code de vérification à 6 chiffres
export function generateVerificationCode() {
  // Générer un nombre aléatoire entre 100000 et 999999
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Fonction pour formater une date
export function formatDate(date) {
  if (!date) return "Non définie";
  
  try {
    // Convertir en objet Date si nécessaire
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      console.error("Date invalide:", date);
      return "Date invalide";
    }
    
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return dateObj.toLocaleDateString('fr-FR', options);
  } catch (error) {
    console.error("Erreur de formatage de date:", error, date);
    return "Date invalide";
  }
}

// Fonction pour formater un prix
export function formatPrice(price) {
  if (price === undefined || price === null) return "0 DT";
  
  try {
    const numericPrice = Number(price);
    
    if (isNaN(numericPrice)) {
      console.error("Prix invalide:", price);
      return "Prix invalide";
    }
    
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(numericPrice);
  } catch (error) {
    console.error("Erreur de formatage de prix:", error, price);
    return `${price} DT`;
  }
}

// Fonction pour vérifier si une date est expirée
export function isDateExpired(date) {
  if (!date) return true; // Considérer comme expiré si aucune date
  
  try {
    const expirationDate = date instanceof Date ? date : new Date(date);
    const currentDate = new Date();
    
    // Vérifier si la date est valide
    if (isNaN(expirationDate.getTime())) {
      console.error("Date d'expiration invalide:", date);
      return true; // Par sécurité, considérer comme expiré
    }
    
    console.log("Comparaison des dates:");
    console.log("- Date d'expiration:", expirationDate.toISOString());
    console.log("- Date actuelle:", currentDate.toISOString());
    console.log("- Est expiré:", expirationDate < currentDate);
    
    return expirationDate < currentDate;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'expiration:", error, date);
    return true; // Par sécurité, considérer comme expiré
  }
}
