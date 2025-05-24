"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClockIcon, ShieldCheckIcon, ShieldXIcon, Clock, AlertCircle } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import toast from "react-hot-toast";

export default function PendingApprovalPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [store, setStore] = useState(null);
  const [loadingStore, setLoadingStore] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté et est un vendeur
    if (!loading && (!user || user.role !== 'SELLER')) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchStore();
    }
  }, [user, loading, router]);

  const fetchStore = async () => {
    try {
      setLoadingStore(true);
      const response = await fetch('/api/seller/store');
      
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des informations du magasin");
      }
      
      const data = await response.json();
      setStore(data.store);
      
      // Si le magasin est approuvé, rediriger vers le tableau de bord
      if (data.store && data.store.isApproved) {
        toast.success("Votre magasin a été approuvé!");
        router.push('/seller/subscription');
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la récupération des informations du magasin");
    } finally {
      setLoadingStore(false);
    }
  };

  const handleRefresh = () => {
    fetchStore();
  };

  if (loading || loadingStore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900">
            <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            En attente d'approbation
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Votre compte vendeur est en cours d'examen. Nous vous notifierons dès que votre compte sera approuvé.
          </p>
          
          <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-orange-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Prochaines étapes
                </h3>
                <div className="mt-2 text-sm text-orange-700 dark:text-orange-300">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Vérification des informations fournies</li>
                    <li>Validation de votre identité</li>
                    <li>Configuration de votre boutique</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton de souscription */}
          <div className="mt-6">
            <button
              onClick={() => router.push('/seller/subscription')}
              className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
            >
              <span>Souscrire à un abonnement</span>
            </button>
          </div>

          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Délai d'approbation estimé : 24-48 heures
          </p>
        </div>
      </div>
    </div>
  );
} 