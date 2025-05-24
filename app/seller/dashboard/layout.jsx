'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import SellerSidebar from '@/components/seller/Sidebar';
import SellerHeader from '@/components/seller/Header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';

export default function SellerDashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [store, setStore] = useState(null);
  const [storeStatus, setStoreStatus] = useState(null);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('Utilisateur non connecté, redirection vers login');
        router.push('/login');
        return;
      }
      
      if (user && user.role !== 'SELLER') {
        console.log('Utilisateur non vendeur, redirection vers login');
        router.push('/login');
        return;
      }

      if (user && user.role === 'SELLER') {
        console.log('Utilisateur vendeur, vérification de l\'accès');
        checkSellerAccess();
      }
    }
  }, [user, loading, router]);

  // Vérifier l'accès à chaque changement de chemin (route)
  useEffect(() => {
    // Si l'utilisateur est connecté et est un vendeur, vérifier son accès à chaque navigation
    if (!loading && user && user.role === 'SELLER') {
      console.log('Vérification périodique de l\'accès vendeur...');
      checkSellerAccess();
    }
  }, [router.pathname]);

  const checkSellerAccess = async () => {
    try {
      setCheckingAccess(true);
      console.log('Vérification de l\'accès au tableau de bord vendeur...');
      
      const response = await fetch('/api/seller/access');
      console.log('Réponse du serveur:', response.status);
      
      const data = await response.json();
      console.log('Données de réponse:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la vérification de l\'accès');
      }

      // Définir le statut pour le contrôle d'accès
      setStoreStatus(data.status);
      console.log('Statut défini:', data.status);

      if (data.status === 'no_store') {
        console.log('Redirection vers la création de magasin...');
        router.push('/seller/register');
        return;
      }

      if (data.status === 'store_not_approved') {
        console.log('Redirection vers la page d\'attente d\'approbation...');
        router.push('/seller/pending-approval');
        return;
      }

      if (data.status === 'subscription_required') {
        console.log('Redirection vers la page d\'abonnement...');
        
        let redirectUrl = '/seller/subscription';
        
        // Si l'abonnement est expiré, inclure le message dans l'URL
        if (data.subscriptionInfo && data.subscriptionInfo.hasExpired) {
          const message = data.message || "Votre abonnement a expiré. Veuillez le renouveler pour continuer.";
          toast.error(message);
          // Encoder le message pour l'URL
          const encodedMessage = encodeURIComponent(message);
          redirectUrl = `/seller/subscription?message=${encodedMessage}`;
        }
        
        router.push(redirectUrl);
        return;
      }

      if (data.status === 'authenticated') {
        console.log('Accès autorisé au tableau de bord, store:', data.store);
        setStore(data.store);
        setStoreStatus('authenticated');
        return;
      }

      throw new Error('Statut d\'accès invalide');
    } catch (error) {
      console.error('Erreur d\'accès:', error);
      toast.error('Erreur lors de la vérification de l\'accès');
      router.push('/login');
    } finally {
      setCheckingAccess(false);
    }
  };

  if (loading || checkingAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  // Vérification des conditions d'accès
  if (!user || user.role !== 'SELLER' || storeStatus !== 'authenticated') {
    console.log('Accès refusé - User:', user?.role, 'Status:', storeStatus);
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md mx-auto text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Accès non autorisé</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder au tableau de bord vendeur.
          </p>
          <Button 
            onClick={() => router.push('/login')}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Retour à la connexion
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {/* Sidebar desktop */}
      <div className="hidden h-full md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-[80]">
        <SellerSidebar />
      </div>

      {/* Contenu principal */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        <SellerHeader store={store} />
        <main className="flex-1 p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
          {children}
        </main>
      </div>

      {/* Notifications toast */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            style: {
              background: 'green',
            },
          },
          error: {
            style: {
              background: 'red',
            },
          },
        }}
      />
    </div>
  );
}
