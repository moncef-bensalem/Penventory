'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import PageHead from '@/components/backoffice/PageHead';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle,
  Pencil,
  Trash2,
  Filter, 
  RefreshCw,
  Download,
  MessageCircle,
  Search,
  Calendar,
  ArrowUpDown,
  ThumbsUp,
  Eye,
  Flag,
  User,
  Check,
  X,
  AlertTriangle,
  MessageSquare,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function CommunityPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Récupérer les publications
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      console.log('Admin user detected, fetching community posts...');
      fetchPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      console.log('Fetching community posts...');
      
      const response = await fetch('/api/admin/community');
      console.log('Community response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la récupération des publications');
      }
      
      const data = await response.json();
      console.log('Community posts fetched successfully:', data.length);
      
      // S'assurer que les données sont valides
      if (!data || !Array.isArray(data)) {
        console.error('Invalid community data format:', data);
        throw new Error('Format de données de la communauté invalide');
      }
      
      // Transformer les données pour l'affichage
      const formattedPosts = data.map(post => ({
        ...post,
        formattedCreatedAt: format(new Date(post.createdAt), 'dd MMMM yyyy', { locale: fr }),
        formattedUpdatedAt: post.updatedAt ? format(new Date(post.updatedAt), 'dd MMMM yyyy', { locale: fr }) : 'N/A'
      }));
      
      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching community posts:', error);
      toast.error(error.message || 'Erreur lors de la récupération des publications');
      
      // En cas d'erreur, utiliser des données fictives pour la démonstration
      const demoData = [
        {
          id: 'post_123456',
          title: 'Comment améliorer les performances de mon magasin ?',
          content: 'Bonjour à tous, je suis nouveau sur la plateforme et je cherche des conseils pour améliorer les performances de mon magasin. Quelles sont vos meilleures pratiques ?',
          author: { id: 'user_123', name: 'Jean Dupont', email: 'jean.dupont@example.com', role: 'SELLER' },
          type: 'QUESTION',
          status: 'PUBLISHED',
          tags: ['performance', 'conseils', 'débutant'],
          commentsCount: 12,
          likesCount: 25,
          viewsCount: 156,
          createdAt: new Date(),
          formattedCreatedAt: format(new Date(), 'dd MMMM yyyy', { locale: fr }),
          updatedAt: null,
          formattedUpdatedAt: 'N/A',
          isReported: false,
          reportsCount: 0
        },
        {
          id: 'post_123457',
          title: 'Nouvelle fonctionnalité : export CSV des commandes',
          content: 'Nous avons ajouté une nouvelle fonctionnalité qui vous permet d\'exporter vos commandes au format CSV. Vous pouvez y accéder depuis votre tableau de bord vendeur.',
          author: { id: 'user_456', name: 'Admin PENVENTORY', email: 'admin@penventory.com', role: 'ADMIN' },
          type: 'ANNOUNCEMENT',
          status: 'PUBLISHED',
          tags: ['annonce', 'fonctionnalité', 'commandes', 'export'],
          commentsCount: 5,
          likesCount: 42,
          viewsCount: 320,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 jours avant
          formattedCreatedAt: format(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy', { locale: fr }),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 jour avant
          formattedUpdatedAt: format(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy', { locale: fr }),
          isReported: false,
          reportsCount: 0
        },
        {
          id: 'post_123458',
          title: 'Problème avec le système de paiement',
          content: 'Depuis hier, j\'ai des problèmes avec le système de paiement. Les clients ne peuvent pas finaliser leurs achats. Est-ce que d\'autres vendeurs rencontrent ce problème ?',
          author: { id: 'user_789', name: 'Marie Martin', email: 'marie.martin@example.com', role: 'SELLER' },
          type: 'DISCUSSION',
          status: 'PUBLISHED',
          tags: ['problème', 'paiement', 'technique'],
          commentsCount: 18,
          likesCount: 8,
          viewsCount: 210,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 jours avant
          formattedCreatedAt: format(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy', { locale: fr }),
          updatedAt: null,
          formattedUpdatedAt: 'N/A',
          isReported: true,
          reportsCount: 2
        },
        {
          id: 'post_123459',
          title: 'Contenu inapproprié à modérer',
          content: 'Ce message contient du contenu inapproprié qui a été signalé par plusieurs utilisateurs.',
          author: { id: 'user_101', name: 'Utilisateur Problématique', email: 'probleme@example.com', role: 'CUSTOMER' },
          type: 'DISCUSSION',
          status: 'REPORTED',
          tags: ['signalé', 'inapproprié'],
          commentsCount: 3,
          likesCount: 1,
          viewsCount: 45,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 jour avant
          formattedCreatedAt: format(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy', { locale: fr }),
          updatedAt: null,
          formattedUpdatedAt: 'N/A',
          isReported: true,
          reportsCount: 5
        },
        {
          id: 'post_123460',
          title: 'Suggestions pour améliorer la plateforme',
          content: 'J\'ai quelques suggestions pour améliorer l\'expérience utilisateur sur la plateforme. Voici mes idées : 1) Ajouter un système de notifications en temps réel, 2) Améliorer le système de recherche, 3) Ajouter plus d\'options de personnalisation pour les magasins.',
          author: { id: 'user_202', name: 'Pierre Dubois', email: 'pierre.dubois@example.com', role: 'SELLER' },
          type: 'FEEDBACK',
          status: 'PUBLISHED',
          tags: ['suggestion', 'amélioration', 'feedback'],
          commentsCount: 15,
          likesCount: 38,
          viewsCount: 180,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 jours avant
          formattedCreatedAt: format(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy', { locale: fr }),
          updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 jours avant
          formattedUpdatedAt: format(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy', { locale: fr }),
          isReported: false,
          reportsCount: 0
        }
      ];
      
      setPosts(demoData);
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
      dateTo: ''
    });
  };

  // Appliquer les filtres
  const applyFilters = (posts) => {
    return posts.filter(post => {
      // Filtre par type
      if (filters.type && post.type !== filters.type) {
        return false;
      }
      
      // Filtre par statut
      if (filters.status && post.status !== filters.status) {
        return false;
      }
      
      // Filtre par recherche (titre, contenu ou auteur)
      if (filters.search && 
         !(post.title?.toLowerCase().includes(filters.search.toLowerCase()) || 
           post.content?.toLowerCase().includes(filters.search.toLowerCase()) ||
           post.author?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
           post.tags?.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase())))) {
        return false;
      }
      
      // Filtre par date de début
      if (filters.dateFrom) {
        const dateFrom = new Date(filters.dateFrom);
        const postDate = new Date(post.createdAt);
        if (postDate < dateFrom) {
          return false;
        }
      }
      
      // Filtre par date de fin
      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        dateTo.setHours(23, 59, 59, 999); // Fin de journée
        const postDate = new Date(post.createdAt);
        if (postDate > dateTo) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Exporter les publications en CSV
  const exportToCSV = () => {
    try {
      const headers = ['ID', 'Titre', 'Auteur', 'Type', 'Statut', 'Date de création', 'Commentaires', 'Likes', 'Vues', 'Signalements'];
      
      // Convertir les données en format CSV
      const csvRows = [];
      csvRows.push(headers.join(','));
      
      filteredPosts.forEach(post => {
        const row = [
          `"${post.id}"`,
          `"${post.title || ''}"`,
          `"${post.author?.name || ''}"`,
          `"${getTypeLabel(post.type)}"`,
          `"${getStatusLabel(post.status)}"`,
          `"${post.formattedCreatedAt}"`,
          `"${post.commentsCount}"`,
          `"${post.likesCount}"`,
          `"${post.viewsCount}"`,
          `"${post.reportsCount}"`
        ];
        csvRows.push(row.join(','));
      });
      
      // Créer un blob et télécharger le fichier
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `communaute_${format(new Date(), 'yyyy-MM-dd')}.csv`);
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
      case 'QUESTION': return 'Question';
      case 'DISCUSSION': return 'Discussion';
      case 'ANNOUNCEMENT': return 'Annonce';
      case 'FEEDBACK': return 'Feedback';
      default: return type;
    }
  };

  // Obtenir la couleur du badge selon le type
  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'QUESTION': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DISCUSSION': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ANNOUNCEMENT': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'FEEDBACK': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtenir l'icône du type
  const getTypeIcon = (type) => {
    switch (type) {
      case 'QUESTION': return <MessageCircle className="h-4 w-4 mr-1" />;
      case 'DISCUSSION': return <MessageSquare className="h-4 w-4 mr-1" />;
      case 'ANNOUNCEMENT': return <Bell className="h-4 w-4 mr-1" />;
      case 'FEEDBACK': return <ThumbsUp className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  // Obtenir le libellé du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'PUBLISHED': return 'Publié';
      case 'PENDING': return 'En attente';
      case 'REPORTED': return 'Signalé';
      case 'REMOVED': return 'Supprimé';
      default: return status;
    }
  };

  // Obtenir la couleur du badge selon le statut
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REPORTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'REMOVED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'PUBLISHED': return <Check className="h-4 w-4 mr-1" />;
      case 'PENDING': return <Calendar className="h-4 w-4 mr-1" />;
      case 'REPORTED': return <Flag className="h-4 w-4 mr-1" />;
      case 'REMOVED': return <X className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  // Approuver une publication
  const approvePost = async (postId) => {
    try {
      const response = await fetch(`/api/admin/community/${postId}/approve`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de l\'approbation de la publication');
      }
      
      toast.success('Publication approuvée avec succès');
      fetchPosts(); // Rafraîchir la liste
    } catch (error) {
      console.error('Error approving post:', error);
      toast.error(error.message || 'Erreur lors de l\'approbation de la publication');
    }
  };

  // Supprimer une publication
  const deletePost = async (postId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette publication ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/community/${postId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la suppression de la publication');
      }
      
      toast.success('Publication supprimée avec succès');
      fetchPosts(); // Rafraîchir la liste
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error(error.message || 'Erreur lors de la suppression de la publication');
    }
  };

  const columns = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <div className="flex items-center">
          Titre
          <ArrowUpDown 
            className="ml-2 h-4 w-4 cursor-pointer" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.title}</div>
          <div className="text-sm text-gray-500 max-w-xs truncate">{row.original.content}</div>
        </div>
      ),
    },
    {
      accessorKey: "author.name",
      header: "Auteur",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
            <User className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <div className="font-medium">{row.original.author?.name || 'N/A'}</div>
            <div className="text-xs text-gray-500">{row.original.author?.role || 'N/A'}</div>
          </div>
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
      accessorKey: "formattedCreatedAt",
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
      accessorKey: "engagement",
      header: "Engagement",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center">
            <MessageSquare className="h-3 w-3 mr-1" />
            {row.original.commentsCount}
          </Badge>
          <Badge variant="outline" className="flex items-center">
            <ThumbsUp className="h-3 w-3 mr-1" />
            {row.original.likesCount}
          </Badge>
          <Badge variant="outline" className="flex items-center">
            <Eye className="h-3 w-3 mr-1" />
            {row.original.viewsCount}
          </Badge>
          {row.original.reportsCount > 0 && (
            <Badge variant="destructive" className="flex items-center">
              <Flag className="h-3 w-3 mr-1" />
              {row.original.reportsCount}
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const post = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/community/${post.id}`}>
              <Button variant="outline" size="icon" title="Voir les détails">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            {post.status === 'REPORTED' && (
              <Button 
                variant="outline" 
                size="icon" 
                title="Approuver"
                onClick={() => approvePost(post.id)}
              >
                <Check className="h-4 w-4 text-green-500" />
              </Button>
            )}
            <Button 
              variant="outline" 
              size="icon" 
              title="Supprimer"
              onClick={() => deletePost(post.id)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        );
      },
    },
  ];

  const filteredPosts = applyFilters(posts);

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

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Accès restreint
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Cette page est réservée aux administrateurs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <PageHead 
        title="Gestion de la Communauté" 
        subtitle="Consultez et modérez les publications de la communauté"
        linkTitle="Nouvelle annonce"
        route="/dashboard/community/new"
      />
      
      <div className="p-6">
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
              onClick={fetchPosts}
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
              Total: {posts.length} publications
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Filtrées: {filteredPosts.length} publications
            </Badge>
            {posts.filter(post => post.status === 'REPORTED').length > 0 && (
              <Badge variant="destructive" className="text-sm">
                Signalées: {posts.filter(post => post.status === 'REPORTED').length} publications
              </Badge>
            )}
          </div>
        </div>
        
        {showFilters && (
          <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Filtres</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                  <option value="QUESTION">Question</option>
                  <option value="DISCUSSION">Discussion</option>
                  <option value="ANNOUNCEMENT">Annonce</option>
                  <option value="FEEDBACK">Feedback</option>
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
                  <option value="PUBLISHED">Publié</option>
                  <option value="PENDING">En attente</option>
                  <option value="REPORTED">Signalé</option>
                  <option value="REMOVED">Supprimé</option>
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
                    placeholder="Titre, contenu, auteur..."
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
              
              <div className="md:col-span-5 flex justify-end">
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
            data={filteredPosts}
            searchKey="title"
          />
        </div>
      </div>
    </div>
  );
}
