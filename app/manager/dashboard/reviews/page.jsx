'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import PageHead from '@/components/backoffice/PageHead';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  RefreshCw, 
  Star, 
  Calendar,
  ArrowUpDown,
  Search,
  Check,
  X,
  Flag,
  Eye,
  Pencil,
  ShieldAlert,
  User,
  ShoppingBag,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

export default function ManagerReviewsPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    rating: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    reportCount: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [reviewSummary, setReviewSummary] = useState({
    totalReviews: 0,
    pendingReviews: 0,
    reportedReviews: 0,
    approvedReviews: 0
  });

  // Récupérer les avis
  useEffect(() => {
    if (user && user.role === 'MANAGER') {
      console.log('Manager user detected, fetching reviews...');
      fetchReviews();
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      // Récupérer les vraies évaluations de commandes depuis l'API
      const response = await fetch('/api/order-ratings');
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transformer les données pour correspondre au format attendu par le tableau
      const formattedReviews = data.map(rating => ({
        id: rating.id,
        userId: rating.userId,
        userName: rating.user?.name || 'Client',
        orderId: rating.orderId,
        productName: `Commande #${rating.orderId}`,
        rating: rating.rating,
        content: rating.comment || '(Pas de commentaire)',
        status: 'APPROVED', // Par défaut, les évaluations sont approuvées
        createdAt: new Date(rating.createdAt),
        reportCount: 0
      }));
      
      setReviews(formattedReviews);
      
      // Calculer le résumé des avis
      calculateReviewSummary(formattedReviews);
      
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Erreur lors de la récupération des avis');
      
      // En cas d'erreur, utiliser des données de démonstration
      const demoReviews = generateDemoReviews();
      setReviews(demoReviews);
      calculateReviewSummary(demoReviews);
    } finally {
      setLoading(false);
    }
  };
  
  // Générer des avis de démonstration
  const generateDemoReviews = () => {
    const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'REPORTED'];
    const ratings = [1, 2, 3, 4, 5];
    const productNames = [
      'Smartphone Galaxy S23', 
      'Montre connectée Apple Watch', 
      'Enceinte Bluetooth JBL',
      'Écouteurs sans fil Sony',
      'Tablette iPad Air',
      'Ordinateur portable Dell XPS',
      'Téléviseur Samsung QLED',
      'Appareil photo Canon EOS'
    ];
    
    const reviewContents = [
      'Très satisfait de mon achat, le produit correspond parfaitement à mes attentes.',
      'Bon rapport qualité-prix, je recommande !',
      'Produit correct mais la livraison a été trop longue.',
      'Déçu par la qualité, ne vaut pas son prix.',
      'Excellent service client et produit conforme à la description.',
      'Le produit est arrivé endommagé, j\'ai demandé un remboursement.',
      'Fonctionne très bien, rien à redire.',
      'La qualité n\'est pas à la hauteur de mes attentes.',
      'Très bonne expérience d\'achat, je reviendrai !',
      'Le produit a cessé de fonctionner après une semaine d\'utilisation.',
      'ARNAQUE TOTALE !!! À ÉVITER ABSOLUMENT !!!',
      'Vendeur peu sérieux, évitez cet article.',
      'Franchement nul, ne perdez pas votre argent.'
    ];
    
    const demoReviews = Array.from({ length: 30 }, (_, i) => {
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomRating = ratings[Math.floor(Math.random() * ratings.length)];
      const randomProduct = productNames[Math.floor(Math.random() * productNames.length)];
      const randomContent = reviewContents[Math.floor(Math.random() * reviewContents.length)];
      const daysAgo = Math.floor(Math.random() * 60) + 1;
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const reportCount = randomStatus === 'REPORTED' ? Math.floor(Math.random() * 5) + 1 : 0;
      const containsBadWords = randomStatus === 'REJECTED' || (randomStatus === 'REPORTED' && Math.random() > 0.5);
      
      return {
        id: `REVIEW-${20000 + i}`,
        content: randomContent,
        rating: randomRating,
        status: randomStatus,
        reportCount,
        containsBadWords,
        customer: {
          id: `customer-${1000 + i}`,
          name: `Client ${1000 + i}`,
          email: `client${1000 + i}@example.com`
        },
        product: {
          id: `product-${2000 + i}`,
          name: randomProduct,
          seller: `Vendeur ${500 + Math.floor(Math.random() * 50)}`
        },
        createdAt: createdAt,
        formattedCreatedAt: format(createdAt, 'dd MMMM yyyy', { locale: fr }),
        moderationComments: randomStatus !== 'PENDING' ? `Commentaire de modération #${i}` : ''
      };
    });
    
    return demoReviews;
  };
  
  // Calculer le résumé des avis
  const calculateReviewSummary = (reviews) => {
    const pendingReviews = reviews.filter(review => review.status === 'PENDING').length;
    const reportedReviews = reviews.filter(review => review.status === 'REPORTED').length;
    const approvedReviews = reviews.filter(review => review.status === 'APPROVED').length;
    
    setReviewSummary({
      totalReviews: reviews.length,
      pendingReviews,
      reportedReviews,
      approvedReviews
    });
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      status: '',
      rating: '',
      search: '',
      dateFrom: '',
      dateTo: '',
      reportCount: ''
    });
  };

  // Appliquer les filtres
  const applyFilters = (reviews) => {
    return reviews.filter(review => {
      // Filtre par statut
      if (filters.status && review.status !== filters.status) {
        return false;
      }
      
      // Filtre par note
      if (filters.rating && review.rating !== parseInt(filters.rating)) {
        return false;
      }
      
      // Filtre par nombre de signalements
      if (filters.reportCount) {
        const minReportCount = parseInt(filters.reportCount);
        if (review.reportCount < minReportCount) {
          return false;
        }
      }
      
      // Filtre par recherche (contenu, produit ou client)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const contentMatch = review.content?.toLowerCase().includes(searchLower);
        const productMatch = review.productName?.toLowerCase().includes(searchLower);
        const userMatch = review.userName?.toLowerCase().includes(searchLower);
        
        if (!(contentMatch || productMatch || userMatch)) {
          return false;
        }
      }
      
      // Filtre par date de début
      if (filters.dateFrom) {
        const dateFrom = new Date(filters.dateFrom);
        const reviewDate = new Date(review.createdAt);
        if (reviewDate < dateFrom) {
          return false;
        }
      }
      
      // Filtre par date de fin
      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        dateTo.setHours(23, 59, 59, 999); // Fin de journée
        const reviewDate = new Date(review.createdAt);
        if (reviewDate > dateTo) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Approuver un avis
  const approveReview = (reviewId) => {
    setReviews(prevReviews => 
      prevReviews.map(review => 
        review.id === reviewId ? { ...review, status: 'APPROVED' } : review
      )
    );
    calculateReviewSummary(reviews.map(review => 
      review.id === reviewId ? { ...review, status: 'APPROVED' } : review
    ));
    toast.success('Avis approuvé avec succès');
  };

  // Rejeter un avis
  const rejectReview = (reviewId) => {
    setReviews(prevReviews => 
      prevReviews.map(review => 
        review.id === reviewId ? { ...review, status: 'REJECTED' } : review
      )
    );
    calculateReviewSummary(reviews.map(review => 
      review.id === reviewId ? { ...review, status: 'REJECTED' } : review
    ));
    toast.success('Avis rejeté avec succès');
  };

  // Obtenir le libellé du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'APPROVED': return 'Approuvé';
      case 'REJECTED': return 'Rejeté';
      case 'REPORTED': return 'Signalé';
      default: return status;
    }
  };

  // Obtenir la couleur du badge selon le statut
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'REPORTED': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4 mr-1" />;
      case 'APPROVED': return <Check className="h-4 w-4 mr-1" />;
      case 'REJECTED': return <X className="h-4 w-4 mr-1" />;
      case 'REPORTED': return <Flag className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  // Afficher les étoiles pour la note
  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating}/5</span>
      </div>
    );
  };
  
  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return format(date, 'dd MMMM yyyy', { locale: fr });
  };

  const columns = [
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.original.status || 'APPROVED';
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
      accessorKey: "rating",
      header: "Note",
      cell: ({ row }) => renderStars(row.original.rating),
    },
    {
      accessorKey: "content",
      header: "Commentaire",
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate" title={row.original.content}>
          {row.original.content || '(Pas de commentaire)'}
        </div>
      ),
    },
    {
      accessorKey: "orderId",
      header: "Commande",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" />
          <span className="max-w-[150px] truncate">
            Commande #{row.original.orderId}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "userName",
      header: "Client",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>{row.original.userName || 'Client'}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <div className="flex items-center">
          Date
          <ArrowUpDown 
            className="ml-2 h-4 w-4 cursor-pointer" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const review = row.original;
        
        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8"
              title="Voir détails"
              onClick={() => {
                // Afficher les détails de l'évaluation
                toast.success(`Détails de l'évaluation pour la commande #${review.orderId}`);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const filteredReviews = applyFilters(reviews);

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
        title="Modération des Avis" 
        subtitle="Gérez les avis clients et assurez le respect des règles de la communauté"
      />
      
      <div className="p-6">
        {/* Résumé des avis */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Total des avis</h3>
              <Star className="h-6 w-6 text-orange-500" />
            </div>
            <p className="text-3xl font-bold mt-2">{reviewSummary.totalReviews}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">En attente</h3>
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-3xl font-bold mt-2 text-blue-600">
              {reviewSummary.pendingReviews}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Signalés</h3>
              <Flag className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-3xl font-bold mt-2 text-red-600">
              {reviewSummary.reportedReviews}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Approuvés</h3>
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold mt-2 text-green-600">
              {reviewSummary.approvedReviews}
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
              onClick={fetchReviews}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm">
              Total: {reviews.length} avis
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Filtrés: {filteredReviews.length} avis
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
                  <option value="PENDING">En attente</option>
                  <option value="APPROVED">Approuvé</option>
                  <option value="REJECTED">Rejeté</option>
                  <option value="REPORTED">Signalé</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Note
                </label>
                <select
                  id="rating"
                  value={filters.rating}
                  onChange={(e) => setFilters({...filters, rating: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Toutes les notes</option>
                  <option value="1">1 étoile</option>
                  <option value="2">2 étoiles</option>
                  <option value="3">3 étoiles</option>
                  <option value="4">4 étoiles</option>
                  <option value="5">5 étoiles</option>
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
                    placeholder="Commentaire, commande, client..."
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
            data={filteredReviews}
            searchKey="content"
          />
        </div>
      </div>
    </div>
  );
}
