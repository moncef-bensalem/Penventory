/**
 * Tests unitaires pour le module de validation des mots de passe
 * Conforme à la norme ISO/IEC 27034-1
 */

import {
  validatePassword,
  validatePasswordWithDetails,
  evaluatePasswordStrength,
  getPasswordScore,
  checkPasswordCriteria,
  getPasswordCriteria,
  RULES
} from '../password-validator';

describe('Password Validator', () => {
  describe('validatePassword', () => {
    test('should return true for valid passwords', () => {
      const validPasswords = [
        'Test1234!',         // Basique mais valide
        'SuperSecure123!',   // Plus long et complexe
        'P@$$w0rd2023',      // Avec caractères spéciaux variés
        'Abcdefg1!2@3#',     // Mélange de types
        'Very-Complex-Password-123!' // Très long avec tirets
      ];
      
      validPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(true);
      });
    });
    
    test('should return false for invalid passwords', () => {
      const invalidPasswords = [
        '',                  // Vide
        'short',             // Trop court
        'password123',       // Pas de majuscule ni de symbole
        'PASSWORD123',       // Pas de minuscule ni de symbole
        'Password',          // Pas de chiffre ni de symbole
        'password',          // Mot interdit
        '1234abcd',          // Séquence commune
        'qwertyuiop',        // Séquence commune
        'aaaaaaaaa1A!',      // Répétition excessive
        'penventory1A!',     // Mot lié au projet
      ];
      
      invalidPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(false);
      });
    });
    
    test('should handle null or undefined input', () => {
      expect(validatePassword(null)).toBe(false);
      expect(validatePassword(undefined)).toBe(false);
    });
  });
  
  describe('validatePasswordWithDetails', () => {
    test('should return empty array for valid passwords', () => {
      expect(validatePasswordWithDetails('Test1234!')).toHaveLength(0);
    });
    
    test('should identify specific issues with passwords', () => {
      // Trop court
      const shortPassword = validatePasswordWithDetails('Abc1!');
      expect(shortPassword).toContainEqual(expect.stringContaining('au moins 10 caractères'));
      
      // Pas de minuscule
      const noLower = validatePasswordWithDetails('PASSWORD123!');
      expect(noLower).toContainEqual(expect.stringContaining('minuscule'));
      
      // Pas de majuscule
      const noUpper = validatePasswordWithDetails('password123!');
      expect(noUpper).toContainEqual(expect.stringContaining('majuscule'));
      
      // Pas de chiffre
      const noNumber = validatePasswordWithDetails('Password!');
      expect(noNumber).toContainEqual(expect.stringContaining('chiffre'));
      
      // Pas de symbole
      const noSymbol = validatePasswordWithDetails('Password123');
      expect(noSymbol).toContainEqual(expect.stringContaining('spécial'));
      
      // Mot interdit
      const prohibitedWord = validatePasswordWithDetails('password123A!');
      expect(prohibitedWord).toContainEqual(expect.stringContaining('mot interdit'));
      
      // Séquence commune
      const commonSequence = validatePasswordWithDetails('1234abcdAB!');
      expect(commonSequence).toContainEqual(expect.stringContaining('séquences communes'));
    });
    
    test('should handle empty input', () => {
      const emptyPassword = validatePasswordWithDetails('');
      expect(emptyPassword).toContainEqual('Le mot de passe est vide');
    });
  });
  
  describe('evaluatePasswordStrength', () => {
    test('should correctly categorize passwords by strength', () => {
      // Faible (moins de 40 points)
      expect(evaluatePasswordStrength('short1')).toBe('faible');
      
      // Moyen (40-60 points)
      expect(evaluatePasswordStrength('Password1')).toBe('moyen');
      
      // Fort (60-80 points)
      expect(evaluatePasswordStrength('Password1!')).toBe('fort');
      
      // Très fort (80+ points)
      expect(evaluatePasswordStrength('Very-Complex-P@$$w0rd-2023!')).toBe('très fort');
    });
    
    test('should handle empty input', () => {
      expect(evaluatePasswordStrength('')).toBe('faible');
    });
  });
  
  describe('getPasswordScore', () => {
    test('should return 0 for empty or null password', () => {
      expect(getPasswordScore('')).toBe(0);
      expect(getPasswordScore(null)).toBe(0);
      expect(getPasswordScore(undefined)).toBe(0);
    });
    
    test('should award points for password length', () => {
      // Un mot de passe court devrait avoir un score plus bas qu'un mot de passe long
      // avec la même complexité
      const shortPasswordScore = getPasswordScore('Abcd1!');
      const longPasswordScore = getPasswordScore('Abcdefghijklm1!');
      expect(longPasswordScore).toBeGreaterThan(shortPasswordScore);
    });
    
    test('should award points for character variety', () => {
      // Un mot de passe avec plus de variété devrait avoir un meilleur score
      const lessVarietyScore = getPasswordScore('Abababab1!');
      const moreVarietyScore = getPasswordScore('Abcdefgh1!');
      expect(moreVarietyScore).toBeGreaterThan(lessVarietyScore);
    });
    
    test('should penalize passwords with common patterns', () => {
      // Un mot de passe avec des séquences communes devrait avoir un score plus bas
      const commonPatternScore = getPasswordScore('Abcd1234!');
      const randomPatternScore = getPasswordScore('Xzq71%$w!');
      expect(randomPatternScore).toBeGreaterThan(commonPatternScore);
    });
  });
  
  describe('checkPasswordCriteria', () => {
    test('should correctly identify all criteria', () => {
      const result = checkPasswordCriteria('Test1234!');
      expect(result.length).toBe(true);
      expect(result.lowercase).toBe(true);
      expect(result.uppercase).toBe(true);
      expect(result.number).toBe(true);
      expect(result.symbol).toBe(true);
      expect(result.noSequences).toBe(true);
      expect(result.noCommon).toBe(true);
    });
    
    test('should correctly identify missing criteria', () => {
      const result = checkPasswordCriteria('password');
      expect(result.length).toBe(false); // Trop court
      expect(result.lowercase).toBe(true);
      expect(result.uppercase).toBe(false); // Pas de majuscule
      expect(result.number).toBe(false); // Pas de chiffre
      expect(result.symbol).toBe(false); // Pas de symbole
      expect(result.noSequences).toBe(true);
      expect(result.noCommon).toBe(false); // 'password' est un mot commun
    });
  });
  
  describe('getPasswordCriteria', () => {
    test('should return array with all criteria', () => {
      const criteria = getPasswordCriteria();
      expect(Array.isArray(criteria)).toBe(true);
      expect(criteria.length).toBeGreaterThan(0);
      
      // Vérifier que chaque critère a un id et un label
      criteria.forEach(criterion => {
        expect(criterion).toHaveProperty('id');
        expect(criterion).toHaveProperty('label');
      });
      
      // Vérifier la présence de critères spécifiques
      const criteriaIds = criteria.map(c => c.id);
      expect(criteriaIds).toContain('length');
      expect(criteriaIds).toContain('lowercase');
      expect(criteriaIds).toContain('uppercase');
      expect(criteriaIds).toContain('number');
      expect(criteriaIds).toContain('symbol');
    });
  });
}); 