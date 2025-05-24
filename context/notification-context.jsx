'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Création du contexte de notification
const NotificationContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification doit être utilisé à l\'intérieur d\'un NotificationProvider');
  }
  return context;
};

// Fournisseur de contexte pour les notifications
export function NotificationProvider({ children }) {
  // État pour stocker les notifications
  const [notifications, setNotifications] = useState([]);

  // Charger les notifications depuis le localStorage au chargement
  useEffect(() => {
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      try {
        setNotifications(JSON.parse(storedNotifications));
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
        setNotifications([]);
      }
    }
  }, []);

  // Sauvegarder les notifications dans le localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Ajouter une nouvelle notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    return newNotification.id;
  };

  // Marquer une notification comme lue
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Supprimer une notification
  const removeNotification = (id) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };

  // Supprimer toutes les notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Obtenir le nombre de notifications non lues
  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  // Valeur du contexte
  const value = {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    getUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
