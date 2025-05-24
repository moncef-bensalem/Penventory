'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import PageHead from '@/components/backoffice/PageHead';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Filter, 
  RefreshCw, 
  Download, 
  Calendar,
  ArrowUpDown,
  CreditCard,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Wallet,
  DollarSign,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

export default function ManagerTransactionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [transactionSummary, setTransactionSummary] = useState({
    totalAmount: 0,
    totalIncome: 0,
    totalExpense: 0,
    pendingAmount: 0,
    currency: 'TND',
    transactionCount: 0
  });

  // Récupérer les transactions
  useEffect(() => {
    if (user && user.role === 'MANAGER') {
      console.log('Manager user detected, fetching transactions...');
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      console.log('Fetching transaction data...');
      
      // Récupérer les informations du portefeuille depuis la nouvelle API manager
      const walletResponse = await fetch('/api/manager/wallet/info');
      console.log('Wallet info response status:', walletResponse.status);
      
      if (!walletResponse.ok) {
        const errorData = await walletResponse.json().catch(() => ({}));
        console.error('Error wallet response:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la récupération des informations financières');
      }
      
      const walletData = await walletResponse.json();
      console.log('Wallet info fetched successfully:', walletData);
      
      // Mettre à jour le résumé des transactions avec les données du wallet
      setTransactionSummary({
        totalAmount: walletData.balance || 0,
        totalIncome: walletData.totalIncome || 0,
        totalExpense: walletData.totalExpense || 0,
        pendingAmount: walletData.pendingAmount || 0,
        currency: walletData.currency || 'TND',
        transactionCount: 0 // Sera mis à jour avec le nombre réel de transactions
      });
      
      // Récupérer les transactions depuis la nouvelle API manager
      const transactionsResponse = await fetch('/api/manager/transactions');
      console.log('Transactions response status:', transactionsResponse.status);
      
      if (!transactionsResponse.ok) {
        const errorData = await transactionsResponse.json().catch(() => ({}));
        console.error('Error transactions response:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la récupération des transactions');
      }
      
      const transactionsData = await transactionsResponse.json();
      console.log('Transactions fetched successfully:', transactionsData.length);
      
      // S'assurer que les données sont valides
      if (!transactionsData || !Array.isArray(transactionsData)) {
        console.error('Invalid transactions data format:', transactionsData);
        throw new Error('Format de données des transactions invalide');
      }
      
      // Transformer les données pour l'affichage
      const formattedTransactions = transactionsData.map(transaction => ({
        ...transaction,
        formattedDate: format(new Date(transaction.date), 'dd MMMM yyyy, HH:mm', { locale: fr }),
        formattedAmount: `${transaction.type === 'EXPENSE' ? '-' : '+'} ${Math.abs(transaction.amount).toFixed(2)} ${transaction.currency}`,
        sellerName: transaction.sender?.name || transaction.receiver?.name || 'Système',
        // Map les propriétés pour être cohérentes avec notre modèle
        type: mapTransactionType(transaction.type),
        status: transaction.status,
        amount: transaction.amount
      }));
      
      setTransactions(formattedTransactions);
      
      // Mettre à jour le nombre total de transactions
      setTransactionSummary(prev => ({
        ...prev,
        transactionCount: formattedTransactions.length
      }));
      
      console.log('Transactions processed:', formattedTransactions.length);
    } catch (error) {
      console.error('Error fetching transaction data:', error);
      toast.error(error.message || 'Erreur lors de la récupération des données des transactions');
      
      // En cas d'erreur, utiliser des données fictives pour la démonstration
      useDemoData();
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour mapper les types de transactions de l'API aux types attendus par notre UI
  const mapTransactionType = (apiType) => {
    switch (apiType) {
      case 'INCOME': return 'PAYMENT';
      case 'EXPENSE': return 'REFUND';
      case 'WITHDRAWAL': return 'WITHDRAWAL';
      case 'DEPOSIT': return 'DEPOSIT';
      case 'SUBSCRIPTION': return 'SUBSCRIPTION';
      default: return apiType;
    }
  };
  
  // Utiliser des données fictives en cas d'erreur ou pour le développement
  const useDemoData = () => {
    const demoData = generateDemoTransactions();
    
    // Transformer les données pour l'affichage
    const formattedTransactions = demoData.map(transaction => ({
      ...transaction,
      formattedDate: format(new Date(transaction.date), 'dd MMMM yyyy, HH:mm', { locale: fr }),
      formattedAmount: `${transaction.type === 'REFUND' ? '-' : '+'} ${Math.abs(transaction.amount).toFixed(2)} ${transaction.currency}`
    }));
    
    setTransactions(formattedTransactions);
    
    // Calculer le résumé des transactions
    calculateSummaryFromTransactions(formattedTransactions);
  };
  
  // Calculer le résumé des transactions à partir des transactions
  const calculateSummaryFromTransactions = (transactions) => {
    let totalAmount = 0;
    let totalIncome = 0;
    let totalExpense = 0;
    let pendingAmount = 0;
    
    transactions.forEach(transaction => {
      const amount = transaction.amount;
      
      // Ajouter le montant au total, quelle que soit le type de transaction
      totalAmount += amount;
      
      if (transaction.status === 'PENDING') {
        pendingAmount += amount;
      }
      
      if (transaction.type === 'PAYMENT' || transaction.type === 'DEPOSIT' || transaction.type === 'SUBSCRIPTION') {
        totalIncome += amount;
      } else if (transaction.type === 'REFUND' || transaction.type === 'WITHDRAWAL') {
        totalExpense += Math.abs(amount);
      }
    });
    
    setTransactionSummary({
      totalAmount,
      totalIncome,
      totalExpense,
      pendingAmount,
      currency: 'TND',
      transactionCount: transactions.length
    });
  };

  // Générer des données de démonstration
  const generateDemoTransactions = () => {
    const types = ['PAYMENT', 'REFUND', 'WITHDRAWAL', 'DEPOSIT'];
    const statuses = ['COMPLETED', 'PENDING', 'FAILED'];
    const sellers = ['Électronique Pro', 'Mode Élégante', 'Cuisine Moderne', 'Sports et Loisirs', 'Maison Déco'];
    
    return Array.from({ length: 50 }, (_, i) => {
      const type = types[Math.floor(Math.random() * types.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const seller = sellers[Math.floor(Math.random() * sellers.length)];
      const amount = Math.random() * 1000 + 10;
      const daysAgo = Math.floor(Math.random() * 30);
      const isRefund = type === 'REFUND';
      
      return {
        id: `TRX${100000 + i}`,
        type,
        status,
        amount: isRefund ? -amount : amount,
        date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        currency: 'TND',
        paymentMethod: Math.random() > 0.5 ? 'CARD' : 'BANK_TRANSFER',
        description: type === 'PAYMENT' ? 'Paiement pour commande' : 
                    type === 'REFUND' ? 'Remboursement client' : 
                    type === 'WITHDRAWAL' ? 'Retrait vers compte bancaire' :
                    'Dépôt sur compte',
        orderNumber: type === 'PAYMENT' || type === 'REFUND' ? `ORD${200000 + Math.floor(Math.random() * 10000)}` : null,
        // Ajouter des informations sur le vendeur/acheteur pour imiter les données de l'API
        sender: isRefund ? 
          { id: `usr${1000 + i}`, name: 'Plateforme', email: 'platform@example.com', role: 'SYSTEM' } : 
          { id: `usr${1000 + i}`, name: seller, email: `contact@${seller.toLowerCase().replace(/\s+/g, '')}.com`, role: 'SELLER' },
        receiver: isRefund ? 
          { id: `usr${1000 + i}`, name: seller, email: `contact@${seller.toLowerCase().replace(/\s+/g, '')}.com`, role: 'SELLER' } : 
          { id: `usr${1000 + i}`, name: 'Plateforme', email: 'platform@example.com', role: 'SYSTEM' },
        sellerName: seller
      };
    });
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      status: '',
      type: '',
      search: '',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  // Appliquer les filtres
  const applyFilters = (transactions) => {
    return transactions.filter(transaction => {
      // Filtre par statut
      if (filters.status && transaction.status !== filters.status) {
        return false;
      }
      
      // Filtre par type
      if (filters.type && transaction.type !== filters.type) {
        return false;
      }
      
      // Filtre par recherche (ID, vendeur ou description)
      if (filters.search && 
         !(transaction.id?.toLowerCase().includes(filters.search.toLowerCase()) || 
           transaction.sellerName?.toLowerCase().includes(filters.search.toLowerCase()) ||
           transaction.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
           transaction.orderNumber?.toLowerCase().includes(filters.search.toLowerCase()))) {
        return false;
      }
      
      // Filtre par date de début
      if (filters.dateFrom) {
        const dateFrom = new Date(filters.dateFrom);
        const transactionDate = new Date(transaction.date);
        if (transactionDate < dateFrom) {
          return false;
        }
      }
      
      // Filtre par date de fin
      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        dateTo.setHours(23, 59, 59, 999); // Fin de journée
        const transactionDate = new Date(transaction.date);
        if (transactionDate > dateTo) {
          return false;
        }
      }
      
      // Filtre par montant minimum
      if (filters.minAmount && transaction.amount < parseFloat(filters.minAmount)) {
        return false;
      }
      
      // Filtre par montant maximum
      if (filters.maxAmount && transaction.amount > parseFloat(filters.maxAmount)) {
        return false;
      }
      
      return true;
    });
  };

  // Exporter les transactions en CSV
  const exportToCSV = () => {
    try {
      const headers = ['ID', 'Vendeur', 'Type', 'Statut', 'Montant', 'Date', 'Méthode de paiement', 'Description', 'N° Commande'];
      
      // Convertir les données en format CSV
      const csvRows = [];
      csvRows.push(headers.join(','));
      
      filteredTransactions.forEach(transaction => {
        const row = [
          `"${transaction.id}"`,
          `"${transaction.sellerName || ''}"`,
          `"${getTypeLabel(transaction.type)}"`,
          `"${getStatusLabel(transaction.status)}"`,
          `"${transaction.formattedAmount}"`,
          `"${transaction.formattedDate}"`,
          `"${getPaymentMethodLabel(transaction.paymentMethod)}"`,
          `"${transaction.description || ''}"`,
          `"${transaction.orderNumber || ''}"`,
        ];
        csvRows.push(row.join(','));
      });
      
      // Créer un blob et télécharger le fichier
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Export CSV réussi');
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error);
      toast.error('Erreur lors de l\'export CSV');
    }
  };

  // Obtenir le libellé du type de transaction
  const getTypeLabel = (type) => {
    switch (type) {
      case 'PAYMENT': return 'Paiement';
      case 'REFUND': return 'Remboursement';
      case 'WITHDRAWAL': return 'Retrait';
      case 'DEPOSIT': return 'Dépôt';
      case 'SUBSCRIPTION': return 'Abonnement';
      default: return type;
    }
  };

  // Obtenir la couleur du badge selon le type
  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'PAYMENT': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REFUND': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'WITHDRAWAL': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'DEPOSIT': return 'bg-green-100 text-green-800 border-green-200';
      case 'SUBSCRIPTION': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtenir le libellé du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'COMPLETED': return 'Complété';
      case 'PENDING': return 'En attente';
      case 'FAILED': return 'Échoué';
      default: return status;
    }
  };

  // Obtenir la couleur du badge selon le statut
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'PENDING': return <AlertTriangle className="h-4 w-4 mr-1" />;
      case 'FAILED': return <XCircle className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  // Obtenir le libellé de la méthode de paiement
  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'CARD': return 'Carte bancaire';
      case 'BANK_TRANSFER': return 'Virement bancaire';
      default: return method;
    }
  };

  const columns = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.id}</div>
      ),
    },
    {
      accessorKey: "sellerName",
      header: ({ column }) => (
        <div className="flex items-center">
          Vendeur
          <ArrowUpDown 
            className="ml-2 h-4 w-4 cursor-pointer" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.original.sellerName}</div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <Badge className={getTypeBadgeClass(type)}>
            {getTypeLabel(type)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge className={getStatusBadgeClass(status)}>
            <div className="flex items-center">
              {getStatusIcon(status)}
              {getStatusLabel(status)}
            </div>
          </Badge>
        );
      },
    },
    {
      accessorKey: "formattedAmount",
      header: ({ column }) => (
        <div className="flex items-center">
          Montant
          <ArrowUpDown 
            className="ml-2 h-4 w-4 cursor-pointer" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: ({ row }) => {
        const amount = row.original.amount;
        return (
          <div className={`font-medium ${amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {row.original.formattedAmount}
          </div>
        );
      },
    },
    {
      accessorKey: "formattedDate",
      header: ({ column }) => (
        <div className="flex items-center">
          Date
          <ArrowUpDown 
            className="ml-2 h-4 w-4 cursor-pointer" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.original.description}>
          {row.original.description}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center"
            >
              <Eye className="h-4 w-4 mr-1" />
              Voir détails
            </Button>
          </div>
        );
      },
    },
  ];

  const filteredTransactions = applyFilters(transactions);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'MANAGER') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Accès restreint
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Cette page est réservée aux managers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <PageHead 
        title="Gestion des Transactions" 
        subtitle="Suivez toutes les transactions de la plateforme"
      />
      
      <div className="p-6">
        {/* Résumé des transactions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Transactions totales</h3>
              <CreditCard className="h-6 w-6 text-orange-500" />
            </div>
            <p className="text-3xl font-bold mt-2">{transactionSummary.transactionCount}</p>
            {transactionSummary.pendingAmount > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                En attente: {Math.abs(transactionSummary.pendingAmount).toFixed(2)} {transactionSummary.currency}
              </p>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Montant total</h3>
              <Wallet className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-3xl font-bold mt-2">
              {transactionSummary.totalAmount.toFixed(2)} {transactionSummary.currency}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Revenus</h3>
              <ArrowUp className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold mt-2 text-green-600">
              {transactionSummary.totalIncome.toFixed(2)} {transactionSummary.currency}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Dépenses</h3>
              <ArrowDown className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-3xl font-bold mt-2 text-red-600">
              {transactionSummary.totalExpense.toFixed(2)} {transactionSummary.currency}
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={fetchTransactions}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            
            <Button 
              variant="outline" 
              onClick={exportToCSV}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm">
              Total: {transactions.length} transactions
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Filtrées: {filteredTransactions.length} transactions
            </Badge>
          </div>
        </div>
        
        {showFilters && (
          <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Filtres</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Statut
                </label>
                <select
                  id="status"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Tous les statuts</option>
                  <option value="COMPLETED">Complété</option>
                  <option value="PENDING">En attente</option>
                  <option value="FAILED">Échoué</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  id="type"
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Tous les types</option>
                  <option value="PAYMENT">Paiement</option>
                  <option value="REFUND">Remboursement</option>
                  <option value="WITHDRAWAL">Retrait</option>
                  <option value="DEPOSIT">Dépôt</option>
                  <option value="SUBSCRIPTION">Abonnement</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recherche
                </label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    id="search"
                    type="text"
                    placeholder="ID, vendeur, description..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="pl-8 w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date depuis
                </label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                    className="pl-8 w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date jusqu'à
                </label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                    className="pl-8 w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="minAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Montant min
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    id="minAmount"
                    type="number"
                    placeholder="0"
                    value={filters.minAmount}
                    onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                    className="pl-8 w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="maxAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Montant max
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    id="maxAmount"
                    type="number"
                    placeholder="1000"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
                    className="pl-8 w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div className="md:col-span-3 lg:col-span-4 flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  className="flex items-center"
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <DataTable 
            columns={columns} 
            data={filteredTransactions}
            searchKey="id"
          />
        </div>
      </div>
    </div>
  );
} 