'use client';

import React, { createContext, useContext, useState } from 'react';

// Créer le contexte
const CheckoutContext = createContext();

// Hook personnalisé pour utiliser le contexte
export function useCheckout() {
  return useContext(CheckoutContext);
}

// Provider du contexte
export function CheckoutProvider({ children }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutFormData, setCheckoutFormData] = useState({});
  
  // Fonction pour mettre à jour les données du formulaire
  const updateCheckoutFormData = (newData) => {
    setCheckoutFormData(prevData => ({
      ...prevData,
      ...newData
    }));
  };

  // Valeur du contexte
  const value = {
    currentStep,
    setCurrentStep,
    checkoutFormData,
    updateCheckoutFormData
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}
