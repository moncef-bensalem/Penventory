'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  CheckCircle,
  XCircle,
  Truck,
  Package,
  ShoppingBag,
  Clock,
  ArrowLeft,
  Printer,
  Calendar,
  Building,
  Home,
  Star,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.orderId;
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [showRatingPanel, setShowRatingPanel] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [comment, setComment] = useState('');
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;
      
      try {
        setLoading(true);
        
        // Afficher quel ID nous essayons de récupérer pour le débogage
        console.log(`Tentative de récupération de la commande avec ID: ${orderId}`);
        
        const response = await fetch(`/api/orders/${orderId}`);
        
        if (!response.ok) {
          if (response.headers.get('content-type')?.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erreur ${response.status}`);
          } else {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
          }
        }
        
        // Récupérer le texte de la réponse et tenter de le parser
        const responseText = await response.text();
        
        try {
          // Nettoyer tout caractère BOM ou autre caractère non-JSON au début
          const cleanedText = responseText.replace(/^\s+|\s+$/g, '');
          const jsonStartPos = cleanedText.indexOf('{');
          const jsonText = jsonStartPos >= 0 ? cleanedText.substring(jsonStartPos) : cleanedText;
          
          console.log('Texte réponse API:', jsonText.substring(0, 100) + '...');
          
          const data = JSON.parse(jsonText);
          console.log('Données de commande parsées avec succès');
          setOrder(data);
        } catch (parseError) {
          console.error('Erreur parsing JSON:', parseError);
          console.error('Réponse brute:', responseText);
          throw new Error(`Impossible de lire la réponse du serveur: ${parseError.message}`);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération de la commande:', err);
        setError(err.message);
        toast.error(err.message || 'Impossible de récupérer la commande');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId]);
  
  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Impossible de charger la commande</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link href="/account/orders" className="text-orange-600 hover:text-orange-700 font-medium inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à mes commandes
          </Link>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Commande introuvable</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            La commande que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <Link href="/account/orders" className="text-orange-600 hover:text-orange-700 font-medium inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à mes commandes
          </Link>
        </div>
      </div>
    );
  }
  
  // Déterminer l'étape actuelle
  const getCurrentStep = (status) => {
    const statusMap = {
      'PENDING': 0,
      'EN_ATTENTE': 0,
      'CONFIRMEE': 1,
      'EN_PREPARATION': 2,
      'PROCESSING': 2,
      'EXPEDIEE': 3,
      'SHIPPED': 3,
      'LIVREE': 4,
      'DELIVERED': 4,
      'COMPLETED': 4,
      'ANNULEE': -1,
      'CANCELLED': -1
    };
    
    return statusMap[status] !== undefined ? statusMap[status] : 0;
  };
  
  const currentStep = getCurrentStep(order.status);
  const isOrderCancelled = order.status === 'ANNULEE' || order.status === 'CANCELLED';
  const formattedDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  // Étapes du suivi
  const steps = [
    { name: 'Commande reçue', icon: ShoppingBag },
    { name: 'Commande confirmée', icon: CheckCircle },
    { name: 'En préparation', icon: Package },
    { name: 'Expédiée', icon: Truck },
    { name: 'Livrée', icon: Home }
  ];
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Link href="/account/orders" className="text-gray-600 hover:text-orange-600 inline-flex items-center mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à mes commandes
      </Link>
      
      <h1 className="text-2xl font-bold mb-6">Suivi de commande</h1>
      
      {/* Informations de commande */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Commande #{order.number}</p>
            <h2 className="text-xl font-semibold">
              {isOrderCancelled ? (
                <span className="text-red-600 dark:text-red-400">Commande annulée</span>
              ) : (
                <span>{order.statusLabel}</span>
              )}
            </h2>
          </div>
          <div className="mt-2 md:mt-0 flex items-center">
            <Calendar className="h-4 w-4 text-gray-500 mr-1" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Commandé le {formattedDate}
            </p>
          </div>
        </div>
        
        {/* Informations du vendeur */}
        {order.store && (
          <div className="flex items-center mb-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Building className="h-5 w-5 text-gray-500 mr-2" />
            <div>
              <p className="text-sm font-medium">Vendu et expédié par</p>
              <p className="text-gray-600 dark:text-gray-400">{order.store.name}</p>
            </div>
          </div>
        )}
        
        {/* Barre de progression */}
        {!isOrderCancelled ? (
          <div className="mb-8">
            <div className="relative pt-1">
              <div className="flex items-center justify-between mb-2">
                {steps.map((step, index) => (
                  <div 
                    key={index} 
                    className={`text-center flex flex-col items-center ${index <= currentStep ? 'text-orange-600' : 'text-gray-400'}`}
                  >
                    <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${
                      index < currentStep ? 'bg-orange-600 border-orange-600 text-white' :
                      index === currentStep ? 'border-orange-600 text-orange-600' :
                      'border-gray-300 text-gray-300'
                    }`}>
                      <step.icon className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                <div 
                  style={{ width: `${order.statusProgress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-600"
                ></div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                {steps.map((step, index) => (
                  <div 
                    key={index} 
                    className={`text-center ${index <= currentStep ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'} text-xs`}
                    style={{ width: '20%' }}
                  >
                    <p className="truncate">{step.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center bg-red-50 dark:bg-red-900/20 p-4 rounded-lg my-6">
            <XCircle className="h-6 w-6 text-red-500 mr-2" />
            <p className="text-red-600 dark:text-red-400">Cette commande a été annulée</p>
          </div>
        )}
      </div>
      
      {/* Articles commandés */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Articles commandés</h2>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {order.items.map((item) => (
            <div key={item.id} className="py-4 flex justify-between">
              <div className="flex items-center">
                {item.product?.image && (
                  <div className="h-16 w-16 mr-4 rounded overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                )}
                <div>
                  <p className="font-medium">{item.product?.name || 'Produit'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Quantité: {item.quantity}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{(item.price * item.quantity).toFixed(2)} DT</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.price.toFixed(2)} DT par unité
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400">Total</span>
            <span className="font-bold">{order.total.toFixed(2)} DT</span>
          </div>
        </div>
      </div>
      
      {/* Évaluations et litiges */}
      {order.status === "DELIVERED" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Évaluer vos produits</h2>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {order.items.map((item) => (
              <div key={item.id} className="py-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    {item.product?.image && (
                      <div className="h-12 w-12 mr-4 rounded overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{item.product?.name || 'Produit'}</p>
                    </div>
                  </div>
                  
                  {/* Afficher le bouton d'évaluation ou les étoiles */}
                  {item.reviewed ? (
                    // Si déjà évalué, afficher les étoiles
                    <div className="flex items-center">
                      <div className="flex mr-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-4 w-4 ${star <= item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">Évalué</span>
                    </div>
                  ) : (
                    // Sinon, afficher le bouton d'évaluation (toujours visible)
                    <button 
                      onClick={async () => {
                        const rating = prompt('Notez ce produit de 1 à 5');
                        if (rating && !isNaN(rating) && rating >= 1 && rating <= 5) {
                          try {
                            const comment = prompt('Laissez un commentaire (optionnel)');
                            
                            const response = await fetch('/api/reviews', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                productId: item.product?.id,
                                orderId: order.id,
                                rating: parseInt(rating),
                                comment: comment || ''
                              }),
                            });
                            
                            if (!response.ok) {
                              throw new Error('Erreur lors de l\'ajout de l\'avis');
                            }
                            
                            toast.success('Merci pour votre évaluation !');
                            
                            // Mettre à jour l'affichage sans rechargement
                            item.reviewed = true;
                            item.rating = parseInt(rating);
                            item.review = comment;
                            setOrder({...order});
                          } catch (error) {
                            console.error('Erreur:', error);
                            toast.error('Impossible d\'ajouter votre avis');
                          }
                        }
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Évaluer ce produit
                    </button>
                  )}
                </div>
                
                {item.reviewed && item.review && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">"{item.review}"</p>
                  </div>
                )}
                
                {!item.hasDispute && (
                  <div className="mt-2">
                    <button 
                      onClick={() => {
                        const reason = prompt('Veuillez décrire le problème avec ce produit');
                        if (reason && reason.length > 10) {
                          // Appel API pour enregistrer le litige
                          toast.success('Votre litige a été enregistré. Nous vous contacterons sous peu.');
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Signaler un problème
                    </button>
                  </div>
                )}
                
                {item.hasDispute && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md mt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                        <p className="text-sm text-red-600 dark:text-red-400">Litige en cours</p>
                      </div>
                      <span className="text-xs text-gray-500">{item.disputeStatus || 'En attente'}</span>
                    </div>
                    {item.disputeMessages && item.disputeMessages.length > 0 && (
                      <div className="mt-2">
                        <Link 
                          href={`/account/disputes/${item.disputeId}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Voir les messages ({item.disputeMessages.length})
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <button onClick={() => window.print()} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 px-4 rounded-md flex items-center">
          <Printer className="h-4 w-4 mr-2" />
          Imprimer
        </button>
        
        {/* Bouton d'évaluation de la commande (toujours visible) */}
        {/* Affichage du statut actuel pour débogage */}
        <div className="text-xs text-gray-500 mb-2">Statut actuel: {order.status}</div>
        
        {/* Bouton pour afficher/masquer le panneau d'évaluation */}
        <button 
          onClick={() => setShowRatingPanel(!showRatingPanel)}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex items-center"
        >
          <Star className="h-4 w-4 mr-2" fill="white" />
          Évaluer la commande
        </button>
        
        {/* Modal d'évaluation moderne */}
        {showRatingPanel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 transform transition-all duration-300 ease-in-out">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Évaluer votre commande</h3>
                <button 
                  onClick={() => setShowRatingPanel(false)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Comment évaluez-vous cette commande ?</p>
                
                {/* Étoiles d'évaluation interactives */}
                <div className="flex justify-center space-x-3 my-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="focus:outline-none transition-transform duration-200 transform hover:scale-125"
                      onMouseEnter={() => setRatingHover(star)}
                      onMouseLeave={() => setRatingHover(0)}
                      onClick={() => setRatingValue(star)}
                    >
                      <Star 
                        className={`h-10 w-10 ${(ratingHover >= star || ratingValue >= star) 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-gray-300'}`} 
                      />
                    </button>
                  ))}
                </div>
                
                {/* Affichage du texte correspondant à la note */}
                <p className="text-center text-sm font-medium mb-4">
                  {ratingValue === 1 && "Très déçu"}
                  {ratingValue === 2 && "Déçu"}
                  {ratingValue === 3 && "Correct"}
                  {ratingValue === 4 && "Satisfait"}
                  {ratingValue === 5 && "Très satisfait"}
                  {ratingValue === 0 && <span className="text-gray-400">Sélectionnez une note</span>}
                </p>
              </div>
              
              {/* Champ de commentaire */}
              <div className="mb-6">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Votre commentaire (optionnel)
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Partagez votre expérience avec cette commande..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                  rows="3"
                />
              </div>
              
              {/* Boutons d'action */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRatingPanel(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={async () => {
                    if (ratingValue > 0) {
                      try {
                        // Envoyer l'évaluation à l'API
                        const response = await fetch('/api/order-ratings', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            orderId: order.id,
                            rating: ratingValue,
                            comment: comment || ''
                          }),
                        });
                        
                        if (!response.ok) {
                          const errorData = await response.json();
                          throw new Error(errorData.error || 'Erreur lors de l\'enregistrement de l\'avis');
                        }
                        
                        // Afficher un message de succès
                        toast.success('Merci pour votre évaluation !', {
                          duration: 3000,
                        });
                        
                        // Mettre à jour l'affichage
                        setOrder({
                          ...order,
                          isRated: true,
                          rating: {
                            rating: ratingValue,
                            comment: comment || ''
                          }
                        });
                        
                        // Fermer le panneau
                        setShowRatingPanel(false);
                      } catch (error) {
                        console.error('Erreur:', error);
                        toast.error('Impossible d\'enregistrer votre évaluation');
                      }
                    } else {
                      toast.error('Veuillez sélectionner une note');
                    }
                  }}
                  disabled={ratingValue === 0}
                  className={`px-4 py-2 rounded-md text-white transition-colors duration-200 ${ratingValue > 0 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-gray-400 cursor-not-allowed'}`}
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        )}
        
        <Link href="/account/contact" className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-md flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Besoin d'aide ?
        </Link>
      </div>
    </div>
  );
} 