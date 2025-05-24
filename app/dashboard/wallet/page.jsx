'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import PageHead from '@/components/backoffice/PageHead';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle,
  Filter, 
  RefreshCw,
  Download,
  Search,
  Calendar,
  ArrowUpDown,
  Wallet,
  CreditCard,
  DollarSign,
  User,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [walletInfo, setWalletInfo] = useState({
    balance: 0,
    pendingAmount: 0,
    totalIncome: 0,
    totalExpense: 0,
    currency: 'TND'
  });
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  // Récupérer les transactions et les informations du portefeuille
  useEffect(() => {
    if (user) {
      console.log('User detected, fetching wallet data...');
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      console.log('Fetching wallet data...');
      
      // Récupérer les informations du portefeuille
      const walletResponse = await fetch('/api/wallet/info');
      console.log('Wallet info response status:', walletResponse.status);
      
      if (!walletResponse.ok) {
        const errorData = await walletResponse.json().catch(() => ({}));
        console.error('Error wallet response:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la récupération des informations du portefeuille');
      }
      
      const walletData = await walletResponse.json();
      console.log('Wallet info fetched successfully:', walletData);
      
      setWalletInfo(walletData);
      
      // Récupérer les transactions
      const transactionsResponse = await fetch('/api/wallet/transactions');
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
        formattedAmount: `${transaction.type === 'EXPENSE' ? '-' : '+'} ${transaction.amount.toFixed(2)} ${transaction.currency}`
      }));
      
      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error(error.message || 'Erreur lors de la récupération des données du portefeuille');
      
      // En cas d'erreur, utiliser des données fictives pour la démonstration
      setWalletInfo({
        balance: 2580.75,
        pendingAmount: 450.25,
        totalIncome: 5230.50,
        totalExpense: 2649.75,
        currency: 'TND'
      });
      
      const demoTransactions = [
        {
          id: 'tr_123456',
          type: 'INCOME',
          category: 'SALE',
          description: 'Vente #ORD-789456',
          amount: 125.50,
          currency: 'TND',
          status: 'COMPLETED',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 jours avant
          formattedDate: format(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy, HH:mm', { locale: fr }),
          formattedAmount: '+ 125.50 TND',
          reference: 'ORD-789456',
          paymentMethod: 'CARD'
        },
        {
          id: 'tr_123457',
          type: 'EXPENSE',
          category: 'FEE',
          description: 'Frais de plateforme',
          amount: 12.55,
          currency: 'TND',
          status: 'COMPLETED',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 jours avant
          formattedDate: format(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy, HH:mm', { locale: fr }),
          formattedAmount: '- 12.55 TND',
          reference: 'FEE-789456',
          paymentMethod: 'AUTOMATIC'
        },
        {
          id: 'tr_123458',
          type: 'INCOME',
          category: 'SALE',
          description: 'Vente #ORD-789457',
          amount: 350.00,
          currency: 'TND',
          status: 'COMPLETED',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 jours avant
          formattedDate: format(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy, HH:mm', { locale: fr }),
          formattedAmount: '+ 350.00 TND',
          reference: 'ORD-789457',
          paymentMethod: 'PAYPAL'
        },
        {
          id: 'tr_123459',
          type: 'EXPENSE',
          category: 'FEE',
          description: 'Frais de plateforme',
          amount: 35.00,
          currency: 'TND',
          status: 'COMPLETED',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 jours avant
          formattedDate: format(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy, HH:mm', { locale: fr }),
          formattedAmount: '- 35.00 TND',
          reference: 'FEE-789457',
          paymentMethod: 'AUTOMATIC'
        },
        {
          id: 'tr_123460',
          type: 'WITHDRAWAL',
          category: 'WITHDRAWAL',
          description: 'Retrait vers compte bancaire',
          amount: 400.00,
          currency: 'TND',
          status: 'PENDING',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 jour avant
          formattedDate: format(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy, HH:mm', { locale: fr }),
          formattedAmount: '- 400.00 TND',
          reference: 'WD-123456',
          paymentMethod: 'BANK_TRANSFER'
        },
        {
          id: 'tr_123461',
          type: 'INCOME',
          category: 'REFUND',
          description: 'Remboursement frais',
          amount: 50.25,
          currency: 'TND',
          status: 'COMPLETED',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 jours avant
          formattedDate: format(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy, HH:mm', { locale: fr }),
          formattedAmount: '+ 50.25 TND',
          reference: 'REF-123456',
          paymentMethod: 'SYSTEM'
        },
        {
          id: 'tr_123462',
          type: 'INCOME',
          category: 'SALE',
          description: 'Vente #ORD-789458',
          amount: 75.80,
          currency: 'TND',
          status: 'COMPLETED',
          date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 jours avant
          formattedDate: format(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy, HH:mm', { locale: fr }),
          formattedAmount: '+ 75.80 TND',
          reference: 'ORD-789458',
          paymentMethod: 'CARD'
        },
        {
          id: 'tr_123463',
          type: 'EXPENSE',
          category: 'FEE',
          description: 'Frais de plateforme',
          amount: 7.58,
          currency: 'TND',
          status: 'COMPLETED',
          date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 jours avant
          formattedDate: format(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy, HH:mm', { locale: fr }),
          formattedAmount: '- 7.58 TND',
          reference: 'FEE-789458',
          paymentMethod: 'AUTOMATIC'
        }
      ];
      
      setTransactions(demoTransactions);
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      type: '',
      status: '',
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
      // Filtre par type
      if (filters.type && transaction.type !== filters.type) {
        return false;
      }
      
      // Filtre par statut
      if (filters.status && transaction.status !== filters.status) {
        return false;
      }
      
      // Filtre par recherche (description ou référence)
      if (filters.search && 
         !(transaction.description?.toLowerCase().includes(filters.search.toLowerCase()) || 
           transaction.reference?.toLowerCase().includes(filters.search.toLowerCase()))) {
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
      if (filters.minAmount && !isNaN(parseFloat(filters.minAmount))) {
        const minAmount = parseFloat(filters.minAmount);
        if (transaction.amount < minAmount) {
          return false;
        }
      }
      
      // Filtre par montant maximum
      if (filters.maxAmount && !isNaN(parseFloat(filters.maxAmount))) {
        const maxAmount = parseFloat(filters.maxAmount);
        if (transaction.amount > maxAmount) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Exporter les transactions en CSV
  const exportToCSV = () => {
    try {
      const headers = ['ID', 'Type', 'Catégorie', 'Description', 'Montant', 'Devise', 'Statut', 'Date', 'Référence', 'Méthode de paiement'];
      
      // Convertir les données en format CSV
      const csvRows = [];
      csvRows.push(headers.join(','));
      
      const filteredTransactions = applyFilters(transactions);
      filteredTransactions.forEach(transaction => {
        const row = [
          `"${transaction.id}"`,
          `"${getTypeLabel(transaction.type)}"`,
          `"${getCategoryLabel(transaction.category)}"`,
          `"${transaction.description || ''}"`,
          `"${transaction.amount.toFixed(2)}"`,
          `"${transaction.currency}"`,
          `"${getStatusLabel(transaction.status)}"`,
          `"${transaction.formattedDate}"`,
          `"${transaction.reference || ''}"`,
          `"${getPaymentMethodLabel(transaction.paymentMethod)}"`
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

  // Obtenir le libellé du type
  const getTypeLabel = (type) => {
    switch (type) {
      case 'INCOME': return 'Revenu';
      case 'EXPENSE': return 'Dépense';
      case 'WITHDRAWAL': return 'Retrait';
      case 'DEPOSIT': return 'Dépôt';
      default: return type;
    }
  };

  // Normaliser le code de devise
  const normalizeCurrency = (currency) => {
    return currency === 'DT' ? 'TND' : (currency || 'TND');
  };

  // Obtenir la couleur du badge selon le type
  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'INCOME': return 'bg-green-100 text-green-800 border-green-200';
      case 'EXPENSE': return 'bg-red-100 text-red-800 border-red-200';
      case 'WITHDRAWAL': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'DEPOSIT': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtenir l'icône du type
  const getTypeIcon = (type) => {
    switch (type) {
      case 'INCOME': return <ArrowUp className="h-4 w-4 mr-1" />;
      case 'EXPENSE': return <ArrowDown className="h-4 w-4 mr-1" />;
      case 'WITHDRAWAL': return <CreditCard className="h-4 w-4 mr-1" />;
      case 'DEPOSIT': return <Wallet className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  // Obtenir le libellé de la catégorie
  const getCategoryLabel = (category) => {
    switch (category) {
      case 'SALE': return 'Vente';
      case 'FEE': return 'Frais';
      case 'REFUND': return 'Remboursement';
      case 'WITHDRAWAL': return 'Retrait';
      case 'DEPOSIT': return 'Dépôt';
      default: return category;
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

  // Obtenir la couleur du badge selon le statut
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'PENDING': return <Clock className="h-4 w-4 mr-1" />;
      case 'FAILED': return <XCircle className="h-4 w-4 mr-1" />;
      case 'CANCELLED': return <AlertCircle className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  // Obtenir le libellé de la méthode de paiement
  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'CARD': return 'Carte bancaire';
      case 'PAYPAL': return 'PayPal';
      case 'BANK_TRANSFER': return 'Virement bancaire';
      case 'AUTOMATIC': return 'Automatique';
      case 'SYSTEM': return 'Système';
      default: return method;
    }
  };

  const columns = [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <div className="flex items-center">
          Date
          <ArrowUpDown 
            className="ml-2 h-4 w-4 cursor-pointer" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: ({ row }) => <div>{row.original.formattedDate}</div>,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.description}</div>
          <div className="text-xs text-gray-500">{row.original.reference}</div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <Badge className={getTypeBadgeClass(type)}>
            <div className="flex items-center">
              {getTypeIcon(type)}
              {getTypeLabel(type)}
            </div>
          </Badge>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Catégorie",
      cell: ({ row }) => <div>{getCategoryLabel(row.original.category)}</div>,
    },
    {
      accessorKey: "amount",
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
        const type = row.original.type;
        const textColor = type === 'INCOME' || type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600';
        
        return (
          <div className={`font-medium ${textColor}`}>
            {row.original.formattedAmount}
          </div>
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
      accessorKey: "paymentMethod",
      header: "Méthode de paiement",
      cell: ({ row }) => <div>{getPaymentMethodLabel(row.original.paymentMethod)}</div>,
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
              onClick={() => router.push(`/dashboard/wallet/transactions/${transaction.id}`)}
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Accès restreint
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Vous devez être connecté pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <PageHead 
        title="Portefeuille" 
        subtitle="Gérez vos transactions et votre solde"
        linkTitle="Demander un retrait"
        route="/dashboard/wallet/withdrawal"
      />
      
      <div className="p-6">
        {/* Résumé du portefeuille */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Solde disponible</h3>
              <Wallet className="h-6 w-6 text-orange-500" />
            </div>
            <p className="text-3xl font-bold mt-2">{walletInfo.balance.toFixed(2)} {walletInfo.currency}</p>
            {walletInfo.pendingAmount > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                En attente: {walletInfo.pendingAmount.toFixed(2)} {walletInfo.currency}
              </p>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Revenus totaux</h3>
              <ArrowUp className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold mt-2 text-green-600">
              {walletInfo.totalIncome.toFixed(2)} {walletInfo.currency}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Dépenses totales</h3>
              <ArrowDown className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-3xl font-bold mt-2 text-red-600">
              {walletInfo.totalExpense.toFixed(2)} {walletInfo.currency}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Actions rapides</h3>
              <DollarSign className="h-6 w-6 text-blue-500" />
            </div>
            <div className="mt-4 flex flex-col space-y-2">
              <Link href="/dashboard/wallet/withdrawal">
                <Button className="w-full" variant="outline">
                  Demander un retrait
                </Button>
              </Link>
              <Link href="/dashboard/wallet/history">
                <Button className="w-full" variant="outline">
                  Historique complet
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Filtres et actions */}
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
              onClick={fetchWalletData}
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
        
        {/* Filtres */}
        {showFilters && (
          <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Filtres</h3>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
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
                  <option value="INCOME">Revenu</option>
                  <option value="EXPENSE">Dépense</option>
                  <option value="WITHDRAWAL">Retrait</option>
                  <option value="DEPOSIT">Dépôt</option>
                </select>
              </div>
              
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
                  <option value="COMPLETED">Terminé</option>
                  <option value="PENDING">En attente</option>
                  <option value="FAILED">Échoué</option>
                  <option value="CANCELLED">Annulé</option>
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
                    placeholder="Description, référence..."
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
              
              <div className="md:col-span-7 flex justify-end">
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
        
        {/* Tableau des transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <DataTable 
            columns={columns} 
            data={filteredTransactions}
            searchKey="description"
          />
        </div>
      </div>
    </div>
  );
}
