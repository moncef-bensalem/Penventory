'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  CreditCard, 
  FileText,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function TransactionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState(null);
  const transactionId = params.id;

  useEffect(() => {
    if (!authLoading && user) {
      fetchTransactionDetails();
    }
  }, [user, authLoading, transactionId]);

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`[CLIENT] Fetching transaction details for ID: ${transactionId}`);
      
      const response = await fetch(`/api/wallet/transactions/${transactionId}`);
      console.log('[CLIENT] Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des détails de la transaction (${response.status})`);
      }
      
      let responseData;
      try {
        responseData = await response.json();
        console.log('[CLIENT] Transaction data:', responseData);
      } catch (parseError) {
        console.error('[CLIENT] Error parsing response:', parseError);
        throw new Error('Erreur lors de la lecture des données du serveur');
      }
      
      if (!responseData) {
        throw new Error('Transaction non trouvée');
      }
      
      // Formater la date
      responseData.formattedDate = format(new Date(responseData.date), 'dd MMMM yyyy à HH:mm', { locale: fr });
      
      setTransaction(responseData);
    } catch (error) {
      console.error('[CLIENT] Error fetching transaction details:', error);
      setError(error.message);
      toast.error(error.message);
      
      // En cas d'erreur, utiliser des données fictives pour la démonstration
      setTransaction({
        id: transactionId,
        type: 'INCOME',
        category: 'SALE',
        description: 'Vente #ORD-789456',
        amount: 125.50,
        currency: 'TND',
        status: 'COMPLETED',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        formattedDate: format(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy à HH:mm', { locale: fr }),
        reference: 'ORD-789456',
        paymentMethod: 'CARD',
        sender: { id: 'user-1', name: 'Plateforme', email: 'platform@example.com', role: 'SYSTEM' },
        receiver: { id: 'user-2', name: 'Utilisateur', email: 'user@example.com', role: 'USER' },
        notes: 'Paiement pour commande #ORD-789456'
      });
    } finally {
      setLoading(false);
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 mr-1 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 mr-1 text-yellow-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 mr-1 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 mr-1 text-gray-500" />;
    }
  };

  // Obtenir le libellé du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'COMPLETED': return 'Terminé';
      case 'PENDING': return 'En attente';
      case 'FAILED': return 'Échoué';
      case 'CANCELLED': return 'Annulé';
      default: return status;
    }
  };

  // Obtenir la classe du badge selon le statut
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtenir la couleur du texte selon le type
  const getTypeTextColor = (type) => {
    return type === 'INCOME' || type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600';
  };

  // Obtenir le libellé du type
  const getTypeLabel = (type) => {
    switch (type) {
      case 'INCOME': return 'Revenu';
      case 'EXPENSE': return 'Dépense';
      case 'DEPOSIT': return 'Dépôt';
      case 'WITHDRAWAL': return 'Retrait';
      default: return type;
    }
  };

  // Obtenir l'icône du type
  const getTypeIcon = (type) => {
    switch (type) {
      case 'INCOME':
      case 'DEPOSIT':
        return <ArrowUp className="h-4 w-4 mr-1 text-green-500" />;
      case 'EXPENSE':
      case 'WITHDRAWAL':
        return <ArrowDown className="h-4 w-4 mr-1 text-red-500" />;
      default:
        return <DollarSign className="h-4 w-4 mr-1 text-gray-500" />;
    }
  };

  // Obtenir le libellé de la méthode de paiement
  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'CARD': return 'Carte bancaire';
      case 'BANK_TRANSFER': return 'Virement bancaire';
      case 'PAYPAL': return 'PayPal';
      case 'WALLET': return 'Portefeuille électronique';
      case 'CASH': return 'Espèces';
      case 'AUTOMATIC': return 'Automatique';
      default: return method || 'Non spécifié';
    }
  };

  // Formater le montant
  const formatAmount = (amount, currency, type) => {
    // Normaliser le code de devise (DT → TND)
    const normalizedCurrency = currency === 'DT' ? 'TND' : (currency || 'TND');
    
    const formattedAmount = new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: normalizedCurrency
    }).format(amount);
    
    return `${type === 'INCOME' || type === 'DEPOSIT' ? '+' : '-'} ${formattedAmount}`;
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-start mb-6">
          <Button variant="ghost" onClick={() => router.push('/dashboard/wallet')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au portefeuille
          </Button>
        </div>
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto text-gray-400" />
          <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Erreur lors du chargement de la transaction
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {error}
          </p>
          <div className="mt-6">
            <Button onClick={() => fetchTransactionDetails()}>
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-start mb-6">
          <Button variant="ghost" onClick={() => router.push('/dashboard/wallet')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au portefeuille
          </Button>
        </div>
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto text-gray-400" />
          <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Transaction non trouvée
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            La transaction demandée n'a pas pu être trouvée
          </p>
          <div className="mt-6">
            <Button onClick={() => router.push('/dashboard/wallet')}>
              Retour au portefeuille
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-start mb-6">
        <Button variant="ghost" onClick={() => router.push('/dashboard/wallet')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au portefeuille
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">Détails de la transaction</CardTitle>
                <Badge className={getStatusBadgeClass(transaction.status)}>
                  <div className="flex items-center">
                    {getStatusIcon(transaction.status)}
                    {getStatusLabel(transaction.status)}
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">{transaction.description}</h3>
                <p className="text-gray-500 flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  {transaction.formattedDate}
                </p>
              </div>
              
              <div className="flex items-center">
                <div className={`text-3xl font-bold ${getTypeTextColor(transaction.type)}`}>
                  {formatAmount(transaction.amount, transaction.currency, transaction.type)}
                </div>
                <Badge variant="outline" className="ml-4">
                  <div className="flex items-center">
                    {getTypeIcon(transaction.type)}
                    {getTypeLabel(transaction.type)}
                  </div>
                </Badge>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Référence</p>
                  <p className="font-medium">{transaction.reference || 'Non spécifié'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Méthode de paiement</p>
                  <p className="font-medium">{getPaymentMethodLabel(transaction.paymentMethod)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ID de transaction</p>
                  <p className="font-medium">{transaction.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Catégorie</p>
                  <p className="font-medium">{transaction.category || 'Non spécifié'}</p>
                </div>
              </div>
              
              {transaction.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="mt-1">{transaction.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Parties impliquées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Expéditeur</h4>
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <User className="h-10 w-10 text-gray-400 bg-gray-200 dark:bg-gray-600 p-2 rounded-full" />
                    <div className="ml-3">
                      <p className="font-medium">{transaction.sender?.name || 'Inconnu'}</p>
                      <p className="text-sm text-gray-500">{transaction.sender?.email || 'Email non disponible'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Destinataire</h4>
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <User className="h-10 w-10 text-gray-400 bg-gray-200 dark:bg-gray-600 p-2 rounded-full" />
                    <div className="ml-3">
                      <p className="font-medium">{transaction.receiver?.name || 'Inconnu'}</p>
                      <p className="text-sm text-gray-500">{transaction.receiver?.email || 'Email non disponible'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={() => toast('Fonctionnalité en cours de développement', { icon: '📄' })}
              >
                <FileText className="h-4 w-4 mr-2" />
                Exporter en PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 