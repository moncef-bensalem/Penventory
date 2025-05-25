'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Créer le contexte
const CartContext = createContext();

// Hook personnalisé pour utiliser le contexte
export function useCart() {
  return useContext(CartContext);
}

// Provider du contexte
export function CartProvider({ children }) {
  // Initialiser l'état du panier depuis localStorage si disponible
  const [cartItems, setCartItems] = useState([]);
  
  // Charger les données du panier depuis localStorage au chargement
  useEffect(() => {
    // Fonction pour charger les données du panier
    const loadCartData = () => {
      if (typeof window !== 'undefined') {
        try {
          const storedCart = localStorage.getItem('cart');
          console.log('Stored cart from localStorage:', storedCart);
          
          if (storedCart) {
            const parsedCart = JSON.parse(storedCart);
            console.log('Parsed cart:', parsedCart);
            console.log('Parsed cart length:', parsedCart.length);
            
            // Vérifier si les données ont changé avant de mettre à jour l'état
            if (JSON.stringify(parsedCart) !== JSON.stringify(cartItems)) {
              setCartItems(parsedCart);
            }
          } else {
            console.log('No cart data found in localStorage');
            if (cartItems.length > 0) {
              setCartItems([]);
            }
          }
        } catch (error) {
          console.error('Error loading cart data from localStorage:', error);
          if (cartItems.length > 0) {
            setCartItems([]);
          }
        }
      }
    };
    
    // Charger les données au montage du composant
    loadCartData();
  }, []);

  // Sauvegarder les changements dans localStorage
  // Nous utilisons une référence pour éviter de déclencher une boucle infinie
  const prevCartItemsRef = React.useRef(cartItems);
  
  useEffect(() => {
    // Vérifier si les cartItems ont réellement changé
    const prevCartItems = prevCartItemsRef.current;
    const cartItemsChanged = JSON.stringify(prevCartItems) !== JSON.stringify(cartItems);
    
    if (typeof window !== 'undefined' && cartItemsChanged) {
      console.log('Saving cart to localStorage:', cartItems);
      localStorage.setItem('cart', JSON.stringify(cartItems));
      // Mettre à jour la référence
      prevCartItemsRef.current = cartItems;
    }
  }, [cartItems]);

  // Ajouter un article au panier
  const addToCart = (product) => {
    const { id, title, price, imageUrl, color, brand, userId: vendorId } = product;
    
    setCartItems(prevItems => {
      // Vérifier si l'article existe déjà
      const existingItemIndex = prevItems.findIndex(item => item.id === id);
      
      if (existingItemIndex >= 0) {
        // Si l'article existe, mettre à jour la quantité
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: (updatedItems[existingItemIndex].quantity || 1) + 1
        };
        return updatedItems;
      } else {
        // Si l'article n'existe pas, l'ajouter au panier
        return [...prevItems, { 
          id, 
          title, 
          price, 
          quantity: 1, 
          imageUrl, 
          color, 
          brand, 
          vendorId 
        }];
      }
    });
  };

  // Supprimer un article du panier
  const removeFromCart = (cartId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== cartId));
  };

  // Augmenter la quantité d'un article
  const incrementQty = (cartId) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === cartId ? { ...item, quantity: (item.quantity || 1) + 1 } : item
      )
    );
  };

  // Diminuer la quantité d'un article
  const decrementQty = (cartId) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === cartId && (item.quantity || 1) > 1 ? { ...item, quantity: (item.quantity || 1) - 1 } : item
      )
    );
  };

  // Valeur du contexte
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    incrementQty,
    decrementQty
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
