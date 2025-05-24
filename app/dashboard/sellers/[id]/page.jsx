"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { toast } from 'react-hot-toast';
import PageHead from '@/components/backoffice/PageHead';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Store, 
  ShoppingBag, 
  DollarSign,
  CreditCard,
  AlertTriangle,
  Clock,
  AlertOctagon
} from 'lucide-react';
import { formatDate, formatPrice, isDateExpired } from '@/lib/utils';
import Link from 'next/link';

export default function SellerDetails() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [warning, setWarning] = useState(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const id = params.id;

  useEffect(() => {
    fetchSellerDetails();
  }, [id]);

  const fetchSellerDetails = async () => {
    try {
      setLoading(true);
      console.log(`Récupération des détails pour le vendeur ID: ${id}`);
      
      const response = await fetch(`/api/admin/sellers/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Erreur API: ${response.status}`, errorData);
        throw new Error(errorData.error || "Erreur lors de la récupération des détails");
      }
      
      const data = await response.json();
      console.log("Données complètes reçues:", data);
      
      // Vérifier les données du vendeur
      if (!data.seller) {
        console.error("Données du vendeur manquantes dans la réponse API");
        throw new Error("Données du vendeur manquantes dans la réponse API");
      }
      
      // Définir le vendeur
      setSeller(data.seller);
      console.log("Vendeur défini:", data.seller);
      
      // Vérifier et traiter les abonnements
      if (data.subscriptions && Array.isArray(data.subscriptions)) {
        console.log(`${data.subscriptions.length} abonnements trouvés:`, data.subscriptions);
        
        // Vérifier que les dates sont correctement formatées
        const formattedSubscriptions = data.subscriptions.map(sub => {
          // S'assurer que la date d'expiration est un objet Date
          const expiresAt = new Date(sub.expiresAt);
          const createdAt = new Date(sub.createdAt);
          
          // Vérifier si la date d'expiration est valide
          const isExpired = expiresAt < new Date();
          console.log(`Abonnement ${sub.id}: expire le ${expiresAt.toISOString()}, est expiré: ${isExpired}`);
          
          return {
            ...sub,
            expiresAt: sub.expiresAt, // Garder la chaîne originale pour la cohérence
            createdAt: sub.createdAt, // Garder la chaîne originale pour la cohérence
            // Ajouter des méta-données pour le débogage
            _debug: {
              parsedExpiresAt: expiresAt.toISOString(),
              parsedCreatedAt: createdAt.toISOString(),
              isExpired
            }
          };
        });
        
        setSubscriptionHistory(formattedSubscriptions);
      } else {
        console.log("Aucun abonnement trouvé, utilisation de données par défaut");
        // Aucun abonnement trouvé, utiliser un abonnement mockée par défaut
        const mockSubscription = {
          id: "default-free",
          type: "FREE",
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 jours
          amount: 0,
          status: "ACTIVE",
          _debug: { isMock: true }
        };
        console.log("Utilisation de l'abonnement mocké:", mockSubscription);
        setSubscriptionHistory([mockSubscription]);
      }
      
      // Vérifier si un avertissement est présent (abonnement expiré)
      if (data.warning) {
        console.log("Avertissement détecté:", data.warning);
        setWarning(data.warning);
        toast.error(data.warning);
      }
      
      // Vérifier les informations de débogage si disponibles
      if (data.debug) {
        console.log("Informations de débogage:", data.debug);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des détails:", error);
      toast.error(error.message || "Une erreur est survenue lors de la récupération des détails");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    // Vérifier si l'abonnement est expiré
    const latestSubscription = subscriptionHistory.length > 0 ? subscriptionHistory[0] : null;
    const isExpired = latestSubscription ? isDateExpired(latestSubscription.expiresAt) : true;
    
    if (isExpired) {
      toast.error("Ce vendeur a un abonnement expiré. Il doit renouveler son abonnement avant de pouvoir être approuvé.");
      return;
    }
    
    if (confirm("Êtes-vous sûr de vouloir approuver ce vendeur?")) {
      setProcessing(true);
      try {
        const response = await fetch(`/api/admin/sellers/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isApproved: true }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          toast.success("Vendeur approuvé avec succès");
          fetchSellerDetails();
        } else {
          toast.error(data.error || "Une erreur est survenue");
        }
      } catch (error) {
        console.error("Erreur lors de l'approbation:", error);
        toast.error("Une erreur est survenue");
      } finally {
        setProcessing(false);
      }
    }
  };
  
  const handleReject = async () => {
    if (confirm("Êtes-vous sûr de vouloir rejeter ce vendeur?")) {
      setProcessing(true);
      try {
        const response = await fetch(`/api/admin/sellers/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isApproved: false }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          toast.success("Vendeur rejeté avec succès");
          fetchSellerDetails();
        } else {
          toast.error(data.error || "Une erreur est survenue");
        }
      } catch (error) {
        console.error("Erreur lors du rejet:", error);
        toast.error("Une erreur est survenue");
      } finally {
        setProcessing(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <PageHead 
          title="Détails du vendeur"
          backButton={true}
          backButtonLink="/dashboard/sellers"
        />
        <p className="text-gray-500 mb-4">Chargement des informations...</p>
        <div className="mt-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="p-6">
        <PageHead 
          title="Erreur"
          backButton={true}
          backButtonLink="/dashboard/sellers"
        />
        <p className="text-gray-500 mb-4">Vendeur non trouvé</p>
        <Button 
          onClick={() => router.push('/dashboard/sellers')}
          className="mt-4"
        >
          Retour à la liste
        </Button>
      </div>
    );
  }

  // Obtenir le statut actuel de l'abonnement
  const latestSubscription = subscriptionHistory && subscriptionHistory.length > 0 ? subscriptionHistory[0] : null;
  const isExpired = latestSubscription ? isDateExpired(latestSubscription.expiresAt) : true;
  
  console.log("Statut de l'abonnement:");
  console.log("- Abonnement le plus récent:", latestSubscription?.id);
  console.log("- Date d'expiration:", latestSubscription?.expiresAt);
  console.log("- Date actuelle:", new Date().toISOString());
  console.log("- Est expiré:", isExpired);
  console.log("- Statut en BDD:", latestSubscription?.status);
  
  // Corriger le statut de l'abonnement en fonction de la date d'expiration
  // même si le statut dans la base de données n'est pas encore mis à jour
  const subscriptionStatus = !latestSubscription 
    ? "Aucun abonnement" 
    : (isExpired ? "Expiré" : "Actif");

  const subscriptionStatusClass = 
    subscriptionStatus === "Actif" ? "bg-green-100 text-green-800" :
    subscriptionStatus === "Expiré" ? "bg-red-100 text-red-800" :
    "bg-gray-100 text-gray-800";

  // Déterminer le nom complet du vendeur en fonction de la structure des données
  const sellerName = seller.firstName && seller.lastName 
    ? `${seller.firstName} ${seller.lastName}`
    : seller.name || "Vendeur";

  if (latestSubscription) {
    // Vérifier si l'abonnement est expiré en utilisant la fonction utilitaire
    const isExpired = isDateExpired(latestSubscription.expiresAt);
    
    console.log("Vérification supplémentaire d'expiration:");
    console.log("- Date d'expiration:", latestSubscription.expiresAt);
    console.log("- Est expiré:", isExpired);
    
    if (isExpired && seller.store?.isApproved === false) {
      return (
        <div className="p-6">
          <PageHead 
            title={`Détails du vendeur: ${sellerName}`}
            backButton={true}
            backButtonLink="/dashboard/sellers"
          />
          <p className="text-gray-500 mb-4">Consulter et gérer les informations du vendeur</p>
          
          <div className="mt-6 bg-white shadow-md rounded-lg p-6">
            <div className="flex flex-col items-center">
              <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4 text-center">
                <h3 className="font-bold text-lg mb-2">Abonnement expiré</h3>
                <p>L'abonnement de ce vendeur a expiré le {formatDate(latestSubscription.expiresAt)}.</p>
                <p>Son magasin a été automatiquement désactivé.</p>
              </div>
              
              <div className="mt-4 space-x-4">
                <Button 
                  onClick={() => router.push(`/seller/subscription?userId=${seller.id}`)}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Renouveler l'abonnement
                </Button>
                
                <Button 
                  onClick={() => router.push('/dashboard/sellers')}
                  variant="outline"
                >
                  Retour à la liste
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="p-6">
      <PageHead 
        title={`Détails du vendeur: ${sellerName}`}
        backButton={true}
        backButtonLink="/dashboard/sellers" 
      />
      <p className="text-gray-500 mb-4">Consulter et gérer les informations du vendeur</p>

      {warning && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
          <p className="text-yellow-700">{warning}</p>
        </div>
      )}

      {isExpired && !warning && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertOctagon className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
          <div>
            <p className="text-red-700 font-medium">L'abonnement de ce vendeur est expiré !</p>
            <p className="text-red-600 text-sm mt-1">Il doit renouveler son abonnement avant de pouvoir être approuvé. Le statut du magasin est automatiquement défini sur "Non approuvé".</p>
            <Button 
              onClick={() => router.push(`/seller/subscription?userId=${seller.id}`)}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white"
              size="sm"
            >
              Renouveler l'abonnement
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 bg-white shadow-md rounded-lg p-6">
        {/* En-tête avec statut et actions */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <div>
            <h2 className="text-2xl font-bold">{sellerName}</h2>
            <div className="mt-2 flex items-center flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                seller.store?.isApproved 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {seller.store?.isApproved ? 'Approuvé' : 'Non approuvé'}
              </span>
              
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                seller.emailVerified 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {seller.emailVerified ? 'Email vérifié' : 'Email non vérifié'}
              </span>

              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${subscriptionStatusClass}`}>
                Abonnement: {subscriptionStatus}
                {isExpired && latestSubscription && 
                  <span className="ml-1 text-xs">
                    (expiré le {new Date(latestSubscription.expiresAt).toLocaleDateString()})
                  </span>
                }
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {!seller.store?.isApproved && (
              <Button 
                onClick={handleApprove}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approuver
              </Button>
            )}
            
            {seller.store?.isApproved && (
              <Button 
                onClick={handleReject}
                disabled={processing}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Rejeter
              </Button>
            )}
          </div>
        </div>

        {/* Informations principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations personnelles */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Informations personnelles</h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-500 mr-2" />
                <span className="font-medium mr-2">Nom complet:</span>
                <span>{sellerName}</span>
              </div>
              
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-500 mr-2" />
                <span className="font-medium mr-2">Email:</span>
                <span>{seller.email}</span>
              </div>
              
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-500 mr-2" />
                <span className="font-medium mr-2">Téléphone:</span>
                <span>{seller.phone || "Non renseigné"}</span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                <span className="font-medium mr-2">Inscrit le:</span>
                <span>{formatDate(seller.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Informations de la boutique */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Informations de la boutique</h3>
            
            {seller.store ? (
              <div className="space-y-3">
                <div className="flex items-center">
                  <Store className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="font-medium mr-2">Nom de la boutique:</span>
                  <span>{seller.store.name}</span>
                </div>
                
                <div className="flex items-center">
                  <ShoppingBag className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="font-medium mr-2">Nombre de produits:</span>
                  <span>{seller.store.productsCount || seller.store.productCount || 0}</span>
                </div>
                
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="font-medium mr-2">Chiffre d'affaires:</span>
                  <span>{formatPrice(seller.store.revenue || 0)}</span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="font-medium mr-2">Créée le:</span>
                  <span>{formatDate(seller.store.createdAt)}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">Aucune boutique créée</p>
            )}
          </div>

          {/* Informations d'abonnement courant */}
          <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Informations d'abonnement</h3>
              {isExpired && latestSubscription && (
                <span className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded">
                  <AlertOctagon className="h-4 w-4 mr-1" />
                  Abonnement expiré
                </span>
              )}
            </div>
            
            {latestSubscription ? (
              <div className="space-y-3">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="font-medium mr-2">Type d'abonnement:</span>
                  <span className="capitalize">{latestSubscription.type}</span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="font-medium mr-2">Date de début:</span>
                  <span>{formatDate(latestSubscription.createdAt)}</span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="font-medium mr-2">Date d'expiration:</span>
                  <span className={isExpired ? "text-red-600 font-medium" : ""}>
                    {formatDate(latestSubscription.expiresAt)}
                  </span>
                  {isExpired && (
                    <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Expiré depuis {Math.ceil((new Date() - new Date(latestSubscription.expiresAt)) / (1000 * 60 * 60 * 24))} jours
                    </span>
                  )}
                </div>
                
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="font-medium mr-2">Montant payé:</span>
                  <span>{formatPrice(latestSubscription.amount || 0)}</span>
                </div>
                
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="font-medium mr-2">Statut:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    latestSubscription.status === 'ACTIVE' && !isExpired ? 'bg-green-100 text-green-800' :
                    latestSubscription.status === 'EXPIRED' || isExpired ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {isExpired ? 'EXPIRED' : latestSubscription.status}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">Aucun abonnement actif</p>
            )}
          </div>

          {/* Historique des abonnements */}
          {subscriptionHistory.length > 1 && (
            <div className="bg-gray-50 p-4 rounded-lg md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold mb-4">Historique des abonnements</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date début</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date expiration</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscriptionHistory.slice(1).map((sub, index) => {
                      const subExpired = isDateExpired(sub.expiresAt);
                      return (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{sub.type}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{formatDate(sub.createdAt)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <span className={subExpired ? "text-red-600" : ""}>
                              {formatDate(sub.expiresAt)}
                            </span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{formatPrice(sub.amount || 0)}</td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              sub.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                              sub.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 