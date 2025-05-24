'use client';

import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, HelpCircle, Trash2 } from 'lucide-react';

export function ConfirmationDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmation", 
  message = "Êtes-vous sûr de vouloir continuer ?",
  confirmText = "Confirmer",
  cancelText = "Annuler",
  type = "warning", // warning, info, danger
  icon = null
}) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);
  
  if (!isVisible && !isOpen) return null;

  // Définir l'icône et les couleurs en fonction du type
  let IconComponent = icon || (type === "warning" ? AlertTriangle : type === "danger" ? Trash2 : HelpCircle);
  
  // Couleurs pour différents types
  const colors = {
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-500',
      button: 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500'
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-500',
      button: 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-500',
      button: 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500'
    }
  };
  
  const currentColors = colors[type] || colors.warning;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className={`relative w-full max-w-md p-6 mx-auto rounded-xl shadow-xl ${currentColors.bg} ${currentColors.border} border transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
      >
        {/* Effet de brillance */}
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          <div className="absolute -inset-x-40 -inset-y-40 bg-gradient-to-r from-transparent via-white/10 to-transparent transform rotate-45 animate-shimmer"></div>
        </div>
        
        {/* Bouton de fermeture */}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200 transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
        
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${currentColors.bg} ${currentColors.icon}`}>
            <IconComponent className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        
        <p className="mt-4 text-gray-700">{message}</p>
        
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentColors.button} transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
