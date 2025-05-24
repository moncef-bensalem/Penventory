/**
 * Module de validation des mots de passe conformément à la norme ISO/IEC 27034-1
 * Ce module implémente des règles strictes de sécurité pour les mots de passe
 * et fournit des fonctions d'évaluation et de validation
 */

// Configuration des règles de validation
const PASSWORD_RULES = {
  minLength: 10,             // Longueur minimale
  maxLength: 128,            // Longueur maximale
  minLowercase: 1,           // Minimum de lettres minuscules
  minUppercase: 1,           // Minimum de lettres majuscules
  minNumbers: 1,             // Minimum de chiffres
  minSymbols: 1,             // Minimum de caractères spéciaux
  maxConsecutiveChars: 3,    // Maximum de caractères consécutifs identiques
  maxConsecutiveNumbers: 3,  // Maximum de chiffres consécutifs
  maxConsecutiveSymbols: 3,  // Maximum de symboles consécutifs
  prohibitedPatterns: [      // Motifs interdits (expressions régulières)
    /password/i,
    /motdepasse/i,
    /123456/,
    /abcdef/,
    /qwerty/i,
    /azerty/i
  ],
  prohibitedWords: [         // Mots interdits
    "admin", "administrateur", "user", "utilisateur", "penventory", "secret"
  ]
};

/**
 * Valide un mot de passe selon les règles définies
 * @param {string} password - Le mot de passe à valider
 * @returns {boolean} Vrai si le mot de passe est valide, faux sinon
 */
export function validatePassword(password) {
  try {
    const issues = validatePasswordWithDetails(password);
    return issues.length === 0;
  } catch (error) {
    console.error("Erreur lors de la validation du mot de passe:", error);
    return false;
  }
}

/**
 * Évalue la force d'un mot de passe et retourne un niveau
 * @param {string} password - Le mot de passe à évaluer
 * @returns {string} Le niveau de force ('faible', 'moyen', 'fort', 'très fort')
 */
export function evaluatePasswordStrength(password) {
  const score = getPasswordScore(password);
  
  if (score < 40) return "faible";
  if (score < 60) return "moyen";
  if (score < 80) return "fort";
  return "très fort";
}

/**
 * Évalue la force d'un mot de passe et retourne un score numérique
 * @param {string} password - Le mot de passe à évaluer
 * @returns {number} Score entre 0 et 100
 */
export function getPasswordScore(password) {
  if (!password) return 0;
  
  // Initialisation du score
  let score = 0;
  
  // Longueur (jusqu'à 25 points)
  const lengthScore = Math.min(25, Math.floor(password.length * 2));
  score += lengthScore;
  
  // Complexité (jusqu'à 50 points)
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^A-Za-z0-9]/.test(password)) score += 10;
  
  // Variété de caractères (jusqu'à 10 points)
  const uniqueChars = new Set(password).size;
  const uniqueCharScore = Math.min(10, Math.floor(uniqueChars / 2));
  score += uniqueCharScore;
  
  // Distribution des types de caractères (jusqu'à 15 points)
  const lowerCount = (password.match(/[a-z]/g) || []).length;
  const upperCount = (password.match(/[A-Z]/g) || []).length;
  const numberCount = (password.match(/[0-9]/g) || []).length;
  const symbolCount = (password.match(/[^A-Za-z0-9]/g) || []).length;
  
  const total = lowerCount + upperCount + numberCount + symbolCount;
  const distributionScore = Math.min(15, Math.floor(
    (Math.min(lowerCount, 3) / 3 + 
     Math.min(upperCount, 3) / 3 + 
     Math.min(numberCount, 3) / 3 + 
     Math.min(symbolCount, 3) / 3) * 15
  ));
  score += distributionScore;
  
  // Pénalités
  const issues = validatePasswordWithDetails(password);
  const penaltyPerIssue = 10;
  const penalty = Math.min(50, issues.length * penaltyPerIssue);
  score = Math.max(0, score - penalty);
  
  return score;
}

/**
 * Valide un mot de passe et retourne des détails sur les problèmes trouvés
 * @param {string} password - Le mot de passe à valider
 * @returns {Array<string>} Liste des problèmes trouvés
 */
export function validatePasswordWithDetails(password) {
  if (!password) return ["Le mot de passe est vide"];
  
  const issues = [];
  
  // Vérification de la longueur
  if (password.length < PASSWORD_RULES.minLength) {
    issues.push(`Le mot de passe doit contenir au moins ${PASSWORD_RULES.minLength} caractères`);
  }
  
  if (password.length > PASSWORD_RULES.maxLength) {
    issues.push(`Le mot de passe ne doit pas dépasser ${PASSWORD_RULES.maxLength} caractères`);
  }
  
  // Vérification des caractères requis
  const lowerCaseCount = (password.match(/[a-z]/g) || []).length;
  if (lowerCaseCount < PASSWORD_RULES.minLowercase) {
    issues.push(`Le mot de passe doit contenir au moins ${PASSWORD_RULES.minLowercase} lettre(s) minuscule(s)`);
  }
  
  const upperCaseCount = (password.match(/[A-Z]/g) || []).length;
  if (upperCaseCount < PASSWORD_RULES.minUppercase) {
    issues.push(`Le mot de passe doit contenir au moins ${PASSWORD_RULES.minUppercase} lettre(s) majuscule(s)`);
  }
  
  const numberCount = (password.match(/[0-9]/g) || []).length;
  if (numberCount < PASSWORD_RULES.minNumbers) {
    issues.push(`Le mot de passe doit contenir au moins ${PASSWORD_RULES.minNumbers} chiffre(s)`);
  }
  
  const symbolCount = (password.match(/[^A-Za-z0-9]/g) || []).length;
  if (symbolCount < PASSWORD_RULES.minSymbols) {
    issues.push(`Le mot de passe doit contenir au moins ${PASSWORD_RULES.minSymbols} caractère(s) spécial(aux)`);
  }
  
  // Vérification des caractères consécutifs
  for (let i = 0; i < password.length - PASSWORD_RULES.maxConsecutiveChars; i++) {
    const fragment = password.substring(i, i + PASSWORD_RULES.maxConsecutiveChars + 1);
    if (new Set(fragment).size === 1) {
      issues.push(`Le mot de passe ne doit pas contenir plus de ${PASSWORD_RULES.maxConsecutiveChars} caractères identiques consécutifs`);
      break;
    }
  }
  
  // Vérification des séquences
  const sequences = ["abcdefghijklmnopqrstuvwxyz", "0123456789"];
  for (const sequence of sequences) {
    for (let i = 0; i <= sequence.length - 4; i++) {
      const fragment = sequence.substring(i, i + 4);
      if (password.toLowerCase().includes(fragment) || 
          password.toLowerCase().includes(fragment.split('').reverse().join(''))) {
        issues.push("Le mot de passe ne doit pas contenir de séquences communes (ex: abcd, 1234)");
        break;
      }
    }
  }
  
  // Vérification des motifs interdits
  for (const pattern of PASSWORD_RULES.prohibitedPatterns) {
    if (pattern.test(password)) {
      issues.push("Le mot de passe contient un motif interdit");
      break;
    }
  }
  
  // Vérification des mots interdits
  for (const word of PASSWORD_RULES.prohibitedWords) {
    if (password.toLowerCase().includes(word.toLowerCase())) {
      issues.push("Le mot de passe contient un mot interdit");
      break;
    }
  }
  
  return issues;
}

/**
 * Obtient la liste des critères de sécurité pour un mot de passe
 * @returns {Array<{id: string, label: string}>} Liste des critères
 */
export function getPasswordCriteria() {
  return [
    { id: 'length', label: `Au moins ${PASSWORD_RULES.minLength} caractères` },
    { id: 'lowercase', label: `Au moins ${PASSWORD_RULES.minLowercase} lettre minuscule` },
    { id: 'uppercase', label: `Au moins ${PASSWORD_RULES.minUppercase} lettre majuscule` },
    { id: 'number', label: `Au moins ${PASSWORD_RULES.minNumbers} chiffre` },
    { id: 'symbol', label: `Au moins ${PASSWORD_RULES.minSymbols} caractère spécial` },
    { id: 'noSequences', label: 'Pas de séquences communes (1234, abcd)' },
    { id: 'noCommon', label: 'Pas de mots communs ou évidents' }
  ];
}

/**
 * Vérifie quels critères sont satisfaits par un mot de passe
 * @param {string} password - Le mot de passe à vérifier
 * @returns {Object<string, boolean>} Map des critères satisfaits
 */
export function checkPasswordCriteria(password) {
  return {
    length: password.length >= PASSWORD_RULES.minLength,
    lowercase: (password.match(/[a-z]/g) || []).length >= PASSWORD_RULES.minLowercase,
    uppercase: (password.match(/[A-Z]/g) || []).length >= PASSWORD_RULES.minUppercase,
    number: (password.match(/[0-9]/g) || []).length >= PASSWORD_RULES.minNumbers,
    symbol: (password.match(/[^A-Za-z0-9]/g) || []).length >= PASSWORD_RULES.minSymbols,
    noSequences: !["abcdef", "123456", "qwerty", "azerty"]
      .some(seq => password.toLowerCase().includes(seq)),
    noCommon: !PASSWORD_RULES.prohibitedWords
      .some(word => password.toLowerCase().includes(word.toLowerCase()))
  };
}

/**
 * Journalise les événements liés à la sécurité des mots de passe
 * @param {string} event - Type d'événement
 * @param {Object} data - Données associées à l'événement
 */
export function logPasswordEvent(event, data = {}) {
  // Suppression des données sensibles avant la journalisation
  const sanitizedData = { ...data };
  if (sanitizedData.password) {
    delete sanitizedData.password;
  }
  
  console.log(`[SECURITY] Password event: ${event}`, sanitizedData);
  
  // Ici, on pourrait ajouter l'enregistrement dans un système de log externe
  // ou une base de données pour des analyses de sécurité
}

// Exporter les constantes pour permettre leur utilisation dans les tests
export const RULES = PASSWORD_RULES; 