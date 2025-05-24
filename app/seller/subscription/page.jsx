"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Check, X, CreditCard, Calendar, Gift, Loader2, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

export default function SubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [processingSubscription, setProcessingSubscription] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [hasUsedFreeTrial, setHasUsedFreeTrial] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [message, setMessage] = useState('');

  const paymentMethods = [
    {
      id: 'card',
      name: 'Carte bancaire',
      icon: <CreditCard className="h-6 w-6" />,
      description: 'Payer avec votre carte bancaire'
    },
    {
      id: 'wallet',
      name: 'Wallet',
      icon: <Wallet className="h-6 w-6" />,
      description: 'Payer avec votre solde wallet'
    }
  ];

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà un abonnement actif
    checkSubscription();
    
    // Vérifier si un userId est passé dans l'URL (pour renouvellement depuis l'admin)
    const searchParams = new URLSearchParams(window.location.search);
    const userId = searchParams.get('userId');
    if (userId) {
      console.log("Renouvellement pour l'utilisateur:", userId);
      // Stocker cet ID pour rediriger vers le dashboard admin après
      localStorage.setItem('adminRenewalUserId', userId);
    }

    // Récupérer le message d'erreur de l'URL si présent
    const urlMessage = searchParams.get('message');
    
    if (urlMessage) {
      // Décoder le message qui pourrait être encodé pour l'URL
      const decodedMessage = decodeURIComponent(urlMessage);
      setMessage(decodedMessage);
      // Afficher le message comme toast également
      toast.error(decodedMessage);
    }
  }, []);

  const checkSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/subscriptions");
      
      if (!response.ok) {
        if (response.status === 401) {
          // Non authentifié, rediriger vers la page de connexion
          return router.push("/login");
        }
        throw new Error("Erreur lors de la vérification de l'abonnement");
      }
      
      const data = await response.json();
      console.log("Données d'abonnement:", data);
      
      // Vérifier si l'abonnement est réellement expiré
      let isReallyExpired = false;
      if (data.activeSubscription) {
        const expirationDate = new Date(data.activeSubscription.expiresAt);
        const currentDate = new Date();
        isReallyExpired = expirationDate < currentDate;
        
        console.log("Date d'expiration:", expirationDate.toISOString());
        console.log("Date actuelle:", currentDate.toISOString());
        console.log("Est réellement expiré:", isReallyExpired);
      }
      
      // Mettre à jour l'état en fonction des vérifications
      setCurrentSubscription(data.activeSubscription);
      setHasActiveSubscription(!isReallyExpired && data.hasActiveSubscription);
      setHasUsedFreeTrial(data.hasUsedFreeTrial);
      setIsExpired(isReallyExpired || data.expired);
      
      // Notifications
      if (!isReallyExpired && data.hasActiveSubscription) {
        toast.success("Vous avez déjà un abonnement actif");
      }
      
      if (isReallyExpired || data.expired) {
        toast.error("Votre abonnement a expiré. Veuillez le renouveler pour continuer à utiliser nos services.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentMethods(true);
    setSelectedPaymentMethod(null);
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      return toast.error("Veuillez sélectionner un plan d'abonnement");
    }

    if (!selectedPaymentMethod) {
      return toast.error("Veuillez sélectionner une méthode de paiement");
    }

    try {
      setProcessingSubscription(true);
      
      // Définir le prix et l'id du plan en fonction du plan sélectionné
      let planPrice = 0;
      let planId = '';
      
      switch(selectedPlan) {
        case 'FREE':
          planPrice = 0;
          planId = 'FREE';
          break;
        case 'MONTHLY':
          planPrice = 30;
          planId = 'MONTHLY';
          break;
        case 'ANNUAL':
          planPrice = 310;
          planId = 'ANNUAL';
          break;
        default:
          throw new Error("Plan invalide");
      }
      
      const paymentData = {
        planId: planId,
        amount: planPrice,
        duration: 1,
        paymentMethod: selectedPaymentMethod.id
      };
      
      console.log("Données d'abonnement à envoyer:", paymentData);
      
      const response = await fetch('/api/payments/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      
      console.log("Statut de la réponse:", response.status);
      
      // Récupérer le corps de la réponse
      const responseText = await response.text();
      console.log("Réponse brute:", responseText);
      
      // Convertir la réponse en JSON (s'il s'agit bien de JSON)
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Données de réponse:", data);
      } catch (jsonError) {
        console.error("Erreur lors de l'analyse JSON:", jsonError);
        throw new Error("Réponse du serveur invalide. Veuillez réessayer.");
      }

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du paiement');
      }

      toast.success('Abonnement souscrit avec succès !');
      
      // Vérifier si c'est un renouvellement initié par l'admin
      const adminRenewalUserId = localStorage.getItem('adminRenewalUserId');
      if (adminRenewalUserId) {
        // Nettoyer le localStorage
        localStorage.removeItem('adminRenewalUserId');
        // Rediriger vers la page de détails du vendeur
        router.push(`/dashboard/sellers/${adminRenewalUserId}`);
      } else {
        // Redirection normale vers le tableau de bord vendeur
        router.push('/seller/dashboard');
      }

    } catch (error) {
      console.error('Erreur lors de la souscription:', error);
      toast.error(error.message || 'Erreur lors de la souscription. Veuillez réessayer.');
    } finally {
      setProcessingSubscription(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Logo className="mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choisissez votre abonnement
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Commencez à vendre vos produits sur notre plateforme en choisissant l'abonnement qui vous convient
          </p>
          
          {message && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg max-w-lg mx-auto">
              <p className="font-semibold">{message}</p>
            </div>
          )}
          
          {hasActiveSubscription && (
            <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg max-w-lg mx-auto">
              <p className="font-semibold">Vous avez déjà un abonnement actif!</p>
              <p className="text-sm mt-1">
                Votre abonnement {currentSubscription?.type.toLowerCase()} expire le{" "}
                {new Date(currentSubscription?.expiresAt).toLocaleDateString()}
              </p>
              <Button 
                onClick={() => router.push("/seller/dashboard")}
                className="mt-2 bg-green-600 hover:bg-green-700"
              >
                Aller au tableau de bord
              </Button>
            </div>
          )}
          
          {isExpired && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg max-w-lg mx-auto">
              <p className="font-semibold">Votre abonnement a expiré!</p>
              <p className="text-sm mt-1">
                Votre abonnement {currentSubscription?.type.toLowerCase()} a expiré le{" "}
                {new Date(currentSubscription?.expiresAt).toLocaleDateString()}. Veuillez renouveler votre abonnement pour continuer à utiliser nos services.
              </p>
            </div>
          )}
        </div>

        {!showPaymentMethods ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plan Gratuit */}
            <div 
              className={`
                bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300
                ${selectedPlan === 'FREE' ? 'ring-4 ring-orange-500 transform scale-105' : 'hover:shadow-2xl hover:scale-105'}
                ${hasUsedFreeTrial ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              onClick={() => !hasUsedFreeTrial && handleSelectPlan('FREE')}
            >
              <div className="p-8">
                <div className="flex items-center justify-center h-16 w-16 bg-orange-100 dark:bg-orange-900 rounded-full mx-auto mb-4">
                  <Gift className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">Essai Gratuit</h3>
                <div className="text-center mb-6">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">0</span>
                  <span className="text-xl text-gray-600 dark:text-gray-400"> DT</span>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Pour 3 jours</p>
                </div>
                
                <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
                  Essayez notre plateforme gratuitement pendant 3 jours
                </p>
                
                {hasUsedFreeTrial && (
                  <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-3 rounded-lg text-sm mb-4">
                    Vous avez déjà utilisé votre essai gratuit
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">3 jours d'accès</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">Jusqu'à 10 produits</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">Support par email</span>
                  </div>
                  <div className="flex items-center">
                    <X className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-gray-400 dark:text-gray-500">Statistiques avancées</span>
                  </div>
                </div>
              </div>
              
              <div className="px-8 pb-8">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPlan('FREE');
                  }}
                  className={`
                    w-full py-3 px-4 rounded-lg font-semibold transition-colors
                    ${selectedPlan === 'FREE' 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white'}
                  `}
                >
                  Commencer gratuitement
                </button>
              </div>
            </div>
            
            {/* Plan Mensuel */}
            <div 
              className={`
                bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300
                ${selectedPlan === 'MONTHLY' ? 'ring-4 ring-orange-500 transform scale-105' : 'hover:shadow-2xl hover:scale-105'}
              `}
              onClick={() => handleSelectPlan('MONTHLY')}
            >
              <div className="p-8">
                <div className="flex items-center justify-center h-16 w-16 bg-orange-100 dark:bg-orange-900 rounded-full mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">Mensuel</h3>
                <div className="text-center mb-6">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">30</span>
                  <span className="text-xl text-gray-600 dark:text-gray-400"> DT</span>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Par mois</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">Accès à la plateforme</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">Gestion des produits</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">Suivi des commandes</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">Support prioritaire</span>
                  </li>
                  <li className="flex items-center">
                    <X className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-gray-400 dark:text-gray-500">Statistiques avancées</span>
                  </li>
                </ul>
              </div>
              
              <div className="px-8 pb-8">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPlan('MONTHLY');
                  }}
                  className={`
                    w-full py-3 px-4 rounded-lg font-semibold transition-colors
                    ${selectedPlan === 'MONTHLY' 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white'}
                  `}
                >
                  Choisir ce plan
                </button>
              </div>
            </div>
            
            {/* Plan Annuel */}
            <div 
              className={`
                bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300
                ${selectedPlan === 'ANNUAL' ? 'ring-4 ring-orange-500 transform scale-105' : 'hover:shadow-2xl hover:scale-105'}
              `}
              onClick={() => handleSelectPlan('ANNUAL')}
            >
              <div className="absolute top-4 right-4">
                <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Recommandé</span>
              </div>
              <div className="p-8">
                <div className="flex items-center justify-center h-16 w-16 bg-orange-100 dark:bg-orange-900 rounded-full mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">Annuel</h3>
                <div className="text-center mb-6">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">310</span>
                  <span className="text-xl text-gray-600 dark:text-gray-400"> DT</span>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Par an (économisez 50 DT)</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">Accès à la plateforme</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">Gestion des produits</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">Suivi des commandes</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">Support prioritaire</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">Statistiques avancées</span>
                  </li>
                </ul>
              </div>
              
              <div className="px-8 pb-8">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPlan('ANNUAL');
                  }}
                  className={`
                    w-full py-3 px-4 rounded-lg font-semibold transition-colors
                    ${selectedPlan === 'ANNUAL' 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white'}
                  `}
                >
                  Choisir ce plan
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Choisissez votre méthode de paiement
            </h2>
            <div className="grid gap-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => handlePaymentMethodSelect(method)}
                  className={`
                    p-6 rounded-lg border-2 cursor-pointer transition-all
                    ${selectedPaymentMethod?.id === method.id 
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                      : 'border-gray-200 hover:border-orange-300 dark:border-gray-700'}
                  `}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 text-orange-600 dark:text-orange-400">
                      {method.icon}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {method.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {method.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className={`
                        w-6 h-6 rounded-full border-2 
                        ${selectedPaymentMethod?.id === method.id 
                          ? 'border-orange-500 bg-orange-500' 
                          : 'border-gray-300'}
                      `}>
                        {selectedPaymentMethod?.id === method.id && (
                          <Check className="h-5 w-5 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <Button
                onClick={() => setShowPaymentMethods(false)}
                variant="outline"
                className="px-6"
              >
                Retour
              </Button>
              <Button
                onClick={handleSubscribe}
                disabled={!selectedPaymentMethod || processingSubscription}
                className="px-8 bg-orange-600 hover:bg-orange-700 text-white"
              >
                {processingSubscription ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  "Confirmer et payer"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 