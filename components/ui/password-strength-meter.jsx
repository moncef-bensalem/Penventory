"use client";

import React, { useMemo } from 'react';
import {
  checkPasswordCriteria,
  getPasswordCriteria,
  getPasswordScore,
  evaluatePasswordStrength,
  validatePasswordWithDetails
} from '@/lib/password-validator';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

/**
 * Composant d'indicateur de force du mot de passe conforme à la norme ISO/IEC 27034-1
 * Affiche un score visuel, des critères à satisfaire et les problèmes détectés
 */
export default function PasswordStrengthMeter({ password, className = "" }) {
  // Calcul du score
  const score = useMemo(() => password ? getPasswordScore(password) : 0, [password]);
  
  // Évaluation du niveau de force
  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);
  
  // Vérification des critères remplis
  const criteriaStatus = useMemo(() => password ? checkPasswordCriteria(password) : {}, [password]);
  
  // Récupération de la liste des critères
  const criteria = useMemo(() => getPasswordCriteria(), []);
  
  // Liste des problèmes identifiés
  const issues = useMemo(() => password ? validatePasswordWithDetails(password) : [], [password]);
  
  // Définition de la couleur de la barre en fonction du score
  const getColorClass = (score) => {
    if (score < 40) return "bg-red-500";
    if (score < 60) return "bg-yellow-500";
    if (score < 80) return "bg-blue-500";
    return "bg-green-500";
  };
  
  // Texte descriptif du niveau de force
  const getStrengthText = (strength) => {
    switch (strength) {
      case "faible": return "Faible - Facile à deviner";
      case "moyen": return "Moyen - Pourrait être plus fort";
      case "fort": return "Fort - Difficile à deviner";
      case "très fort": return "Très fort - Excellente protection";
      default: return "Entrez un mot de passe";
    }
  };
  
  // Style du texte descriptif
  const getStrengthTextClass = (strength) => {
    switch (strength) {
      case "faible": return "text-red-500";
      case "moyen": return "text-yellow-500";
      case "fort": return "text-blue-500";
      case "très fort": return "text-green-500";
      default: return "text-gray-500";
    }
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barre de progression */}
      <div className="space-y-2">
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${getColorClass(score)}`} 
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <p className={`text-sm font-medium ${getStrengthTextClass(strength)}`}>
            {getStrengthText(strength)}
          </p>
          <p className="text-xs text-gray-500">
            Score: {score}/100
          </p>
        </div>
      </div>
      
      {/* Critères */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {criteria.map((criterion) => {
          const isMet = criteriaStatus[criterion.id];
          return (
            <div key={criterion.id} className="flex items-center gap-2">
              {isMet ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
              <span className={`text-xs ${isMet ? 'text-gray-700' : 'text-gray-500'}`}>
                {criterion.label}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Problèmes détectés */}
      {issues.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-2">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-xs font-medium text-red-700">Problèmes détectés</span>
          </div>
          <ul className="list-disc pl-5 text-xs text-red-600 space-y-1">
            {issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Composant simple pour visualiser la force d'un mot de passe
 * Affiche uniquement une barre de progression et un texte
 */
export function SimplePasswordStrengthMeter({ password, className = "" }) {
  const score = useMemo(() => password ? getPasswordScore(password) : 0, [password]);
  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);
  
  const getColorClass = (score) => {
    if (score < 40) return "bg-red-500";
    if (score < 60) return "bg-yellow-500";
    if (score < 80) return "bg-blue-500";
    return "bg-green-500";
  };
  
  const getStrengthText = (strength) => {
    switch (strength) {
      case "faible": return "Faible";
      case "moyen": return "Moyen";
      case "fort": return "Fort";
      case "très fort": return "Très fort";
      default: return "";
    }
  };
  
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${getColorClass(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 text-right">
        {getStrengthText(strength)}
      </p>
    </div>
  );
} 