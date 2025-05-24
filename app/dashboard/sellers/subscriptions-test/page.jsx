'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHead from '@/components/backoffice/PageHead';
import { formatDate, formatPrice, isDateExpired } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Calendar, 
  Store, 
  CreditCard, 
  Clock, 
  XCircle, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SellerSubscriptionsTestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState([]);
  const [currentDate] = useState(new Date());

  useEffect(() => {
    fetchAllSellers();
  }, []);

  const fetchAllSellers = async () => {
    try {
      setLoading(true);
      console.log('Récupération de tous les vendeurs avec leurs abonnements...');
      
      const response = await fetch('/api/admin/sellers');
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des vendeurs: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.sellers || !Array.isArray(data.sellers)) {
        throw new Error('Format de réponse invalide');
      }
      
      console.log(`${data.sellers.length} vendeurs trouvés`);
      
      // Récupérer les détails de chaque vendeur, y compris les abonnements
      const sellersWithDetails = await Promise.all(
        data.sellers.map(async (seller) => {
          try {
            const detailsResponse = await fetch(`/api/admin/sellers/${seller.id}`);
            
            if (!detailsResponse.ok) {
              console.error(`Erreur pour le vendeur ${seller.id}:`, detailsResponse.status);
              // Retourner le vendeur sans détails d'abonnement en cas d'erreur
              return {
                ...seller,
                subscriptions: [],
                hasSubscriptionError: true
              };
            }
            
            const detailsData = await detailsResponse.json();
            return {
              ...seller,
              ...detailsData.seller,
              subscriptions: detailsData.subscriptions || [],
              hasSubscriptionError: false
            };
          } catch (error) {
            console.error(`Erreur pour le vendeur ${seller.id}:`, error);
            // Retourner le vendeur sans détails d'abonnement en cas d'erreur
            return {
              ...seller,
              subscriptions: [],
              hasSubscriptionError: true
            };
          }
        })
      );    
      
      // Vérifier et mettre à jour les abonnements expirés
      await updateExpiredSubscriptions(sellersWithDetails);
      
      setSellers(sellersWithDetails);
      console.log('Vendeurs récupérés avec leurs abonnements:', sellersWithDetails);
      
    } catch (error) {
      console.error('Erreur lors de la récupération des vendeurs:', error);
      toast.error(`Erreur: ${error.message}`);
      setSellers([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour mettre à jour les abonnements expirés
  const updateExpiredSubscriptions = async (sellers) => {
    try {
      console.log("Vérification et mise à jour des abonnements expirés...");
      
      // Filtrer les vendeurs avec des abonnements expirés mais toujours marqués comme ACTIVE
      const sellersWithExpiredSubscriptions = sellers.filter(seller => {
        if (!seller.subscriptions || seller.subscriptions.length === 0) return false;
        
        const latestSubscription = seller.subscriptions[0];
        const isExpired = isDateExpired(latestSubscription.expiresAt);
        
        return isExpired && latestSubscription.status === 'ACTIVE';
      });
      
      console.log(`${sellersWithExpiredSubscriptions.length} vendeurs ont des abonnements expirés à mettre à jour`);
      
      // Mettre à jour le statut des abonnements expirés
      const updatePromises = sellersWithExpiredSubscriptions.map(async (seller) => {
        try {
          const latestSubscription = seller.subscriptions[0];
          console.log(`Mise à jour de l'abonnement ${latestSubscription.id} pour le vendeur ${seller.id}`);
          
          const response = await fetch('/api/admin/update-subscription-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subscriptionId: latestSubscription.id,
              status: 'EXPIRED'
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Erreur lors de la mise à jour: ${response.status}`);
          }
          
          // Mettre à jour le statut en local pour l'affichage
          latestSubscription.status = 'EXPIRED';
          latestSubscription.updatedByFrontend = true;
          
          return { success: true, sellerId: seller.id };
        } catch (error) {
          console.error(`Erreur lors de la mise à jour de l'abonnement pour le vendeur ${seller.id}:`, error);
          return { success: false, sellerId: seller.id, error: error.message };
        }
      });
      
      // Attendre la fin des mises à jour
      const results = await Promise.all(updatePromises);
      
      const successCount = results.filter(r => r.success).length;
      
      if (successCount > 0) {
        toast.success(`${successCount} abonnement(s) expirés ont été mis à jour avec succès`);
      }
      
      return results;
    } catch (error) {
      console.error("Erreur lors de la mise à jour des abonnements expirés:", error);
      toast.error("Erreur lors de la mise à jour des abonnements expirés");
      return [];
    }
  };

  const isSubscriptionExpired = (subscription) => {
    if (!subscription) return true;
    return isDateExpired(subscription.expiresAt);
  };

  const getSubscriptionStatusClass = (subscription) => {
    if (!subscription) return 'bg-gray-100 text-gray-800';
    
    const isExpired = isSubscriptionExpired(subscription);
    
    if (isExpired) return 'bg-red-100 text-red-800';
    if (subscription.status === 'ACTIVE') return 'bg-green-100 text-green-800';
    if (subscription.status === 'CANCELLED') return 'bg-yellow-100 text-yellow-800';
    
    return 'bg-gray-100 text-gray-800';
  };

  const getSubscriptionStatusLabel = (subscription) => {
    if (!subscription) return 'Aucun abonnement';
    
    const isExpired = isSubscriptionExpired(subscription);
    
    if (isExpired) return 'Expiré';
    if (subscription.status === 'ACTIVE') return 'Actif';
    if (subscription.status === 'CANCELLED') return 'Annulé';
    if (subscription.status === 'EXPIRED') return 'Expiré';
    
    return subscription.status;
  };

  if (loading) {
    return (
      <div className="p-6">
        <PageHead 
          title="Test des abonnements vendeurs"
          backButton={true}
          backButtonLink="/dashboard/sellers"
        />
        <p className="text-gray-500 mb-4">Chargement des données...</p>
        <div className="flex justify-center mt-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHead 
        title="Test des abonnements vendeurs"
        backButton={true}
        backButtonLink="/dashboard/sellers"
      />
      <p className="text-gray-500 mb-4">Affichage de tous les vendeurs avec leurs détails d'abonnement</p>
      
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
        <p className="text-blue-800 font-medium">Date actuelle: {currentDate.toLocaleDateString('fr-FR')} {currentDate.toLocaleTimeString('fr-FR')}</p>
        
        <div className="flex space-x-2">
          <Button 
            onClick={fetchAllSellers}
            className="bg-gray-600 hover:bg-gray-700 text-white"
            size="sm"
          >
            Rafraîchir les données
          </Button>
          
          <Button 
            onClick={() => updateExpiredSubscriptions(sellers)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            Mettre à jour les abonnements expirés
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {sellers.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-500 font-medium">Aucun vendeur trouvé</p>
          </div>
        ) : (
          sellers.map((seller) => {
            const latestSubscription = seller.subscriptions && seller.subscriptions.length > 0 
              ? seller.subscriptions[0] 
              : null;
            
            const isExpired = isSubscriptionExpired(latestSubscription);
            
            return (
              <div key={seller.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{seller.name || 'Vendeur sans nom'}</h3>
                      <p className="text-gray-600">{seller.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      seller.store?.isApproved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {seller.store?.isApproved ? 'Approuvé' : 'Non approuvé'}
                    </span>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      getSubscriptionStatusClass(latestSubscription)
                    }`}>
                      {getSubscriptionStatusLabel(latestSubscription)}
                    </span>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => router.push(`/dashboard/sellers/${seller.id}`)}
                    >
                      Détails
                    </Button>
                  </div>
                </div>
                
                <div className="p-4">
                  {seller.hasSubscriptionError ? (
                    <div className="p-3 bg-yellow-50 text-yellow-800 rounded-md flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      <p>Erreur lors de la récupération des détails d'abonnement</p>
                    </div>
                  ) : latestSubscription ? (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Abonnement actuel</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center text-gray-700 mb-1">
                            <CreditCard className="h-4 w-4 mr-2" />
                            <span className="font-medium">Type:</span>
                          </div>
                          <p className="text-gray-900 capitalize">{latestSubscription.type}</p>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center text-gray-700 mb-1">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="font-medium">Début:</span>
                          </div>
                          <p className="text-gray-900">{formatDate(latestSubscription.createdAt)}</p>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center text-gray-700 mb-1">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="font-medium">Expiration:</span>
                          </div>
                          <p className={`${isExpired ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                            {formatDate(latestSubscription.expiresAt)}
                            {isExpired && (
                              <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                <Clock className="h-3 w-3 inline mr-1" />
                                Expiré!
                              </span>
                            )}
                          </p>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center text-gray-700 mb-1">
                            <CreditCard className="h-4 w-4 mr-2" />
                            <span className="font-medium">Statut en BDD:</span>
                          </div>
                          <p className="flex items-center">
                            {latestSubscription.status === 'ACTIVE' && !isExpired ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span className={`${
                              latestSubscription.status === 'ACTIVE' && !isExpired ? 'text-green-600' : 
                              'text-red-600'
                            }`}>
                              {latestSubscription.status}
                            </span>
                            {isExpired && latestSubscription.status !== 'EXPIRED' && (
                              <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                Devrait être EXPIRED
                              </span>
                            )}
                            {latestSubscription.updatedByFrontend && (
                              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                Mise à jour réussie
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      {seller.subscriptions.length > 1 && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-800 mb-2">Historique des abonnements</h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Début</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expiration</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                </tr>
                              </thead>
                              <tbody>
                                {seller.subscriptions.slice(1).map((sub, index) => {
                                  const subExpired = isSubscriptionExpired(sub);
                                  return (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm capitalize">{sub.type}</td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm">{formatDate(sub.createdAt)}</td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                                        <span className={subExpired ? 'text-red-600' : ''}>
                                          {formatDate(sub.expiresAt)}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm">{formatPrice(sub.amount || 0)}</td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                          subExpired ? 'bg-red-100 text-red-800' :
                                          sub.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                          'bg-gray-100 text-gray-800'
                                        }`}>
                                          {subExpired && sub.status !== 'EXPIRED' ? 'EXPIRED*' : sub.status}
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
                  ) : (
                    <div className="p-3 bg-gray-50 text-gray-500 rounded-md">
                      <p>Aucun abonnement trouvé pour ce vendeur</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 