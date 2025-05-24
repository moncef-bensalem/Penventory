'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import PageHead from '@/components/backoffice/PageHead';
import TableActions from '@/components/backoffice/TableActions';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './components/columns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Filter, 
  RefreshCw,
  AlertTriangle,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    store: '',
    category: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    inStock: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch all products
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      console.log('Admin user detected, fetching data...');
      fetchProducts();
    }
  }, [user]);

  // Adapter les données des produits pour l'affichage
  const formatProductsForDisplay = (productsData) => {
    if (!productsData || !Array.isArray(productsData)) {
      console.error('Invalid products data:', productsData);
      return [];
    }
    return productsData.map(product => ({
      ...product,
      storeName: product.store?.name || 'Magasin inconnu',
      categoryName: product.category?.name || 'Catégorie inconnue',
      sellerName: product.store?.seller?.name || 'Vendeur inconnu',
      approved: product.approved || false
    }));
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products...');
      const response = await fetch('/api/all-products-admin');
      console.log('Products response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la récupération des produits');
      }
      
      const data = await response.json();
      console.log('Products fetched successfully:', data.products?.length);
      setProducts(formatProductsForDisplay(data.products || []));
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(error.message || 'Erreur lors de la récupération des produits');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProduct = async (productId, approved) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/products/${productId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved }),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de ${approved ? 'l\'approbation' : 'le rejet'} du produit`);
      }

      // Mettre à jour la liste des produits
      fetchProducts();
      toast.success(`Produit ${approved ? 'approuvé' : 'rejeté'} avec succès`);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du produit');
      }

      // Mettre à jour la liste des produits
      fetchProducts();
      toast.success('Produit supprimé avec succès');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les produits en fonction des critères sélectionnés
  const filteredProducts = products.filter(product => {
    // Filtre par magasin
    if (filters.store && product.storeId !== filters.store) {
      return false;
    }
    
    // Filtre par catégorie
    if (filters.category && product.categoryId !== filters.category) {
      return false;
    }
    
    // Filtre par prix minimum
    if (filters.minPrice && product.price < parseFloat(filters.minPrice)) {
      return false;
    }
    
    // Filtre par prix maximum
    if (filters.maxPrice && product.price > parseFloat(filters.maxPrice)) {
      return false;
    }
    
    // Filtre par stock
    if (filters.inStock === 'in-stock' && product.stock <= 0) {
      return false;
    }
    
    if (filters.inStock === 'out-of-stock' && product.stock > 0) {
      return false;
    }
    
    // Filtre par statut
    if (filters.status === 'approved' && !product.isApproved) {
      return false;
    }
    
    if (filters.status === 'pending' && product.isApproved) {
      return false;
    }
    
    return true;
  });

  const handleRefresh = () => {
    fetchProducts();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      store: '',
      category: '',
      status: '',
      minPrice: '',
      maxPrice: '',
      inStock: ''
    });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const exportToCSV = (products) => {
    // Vérifier qu'il y a des produits à exporter
    if (!products || products.length === 0) {
      toast.error("Aucun produit à exporter");
      return;
    }

    try {
      // Définir les en-têtes du CSV
      const headers = [
        "ID", 
        "Nom", 
        "Prix", 
        "Catégorie", 
        "Stock", 
        "Magasin", 
        "Vendeur", 
        "Statut", 
        "Date d'ajout"
      ];

      // Formater les données des produits pour le CSV
      const data = products.map(product => [
        product.id,
        product.name,
        product.price,
        product.categoryName,
        product.stock,
        product.storeName,
        product.sellerName,
        product.approved ? "Approuvé" : "En attente",
        new Date(product.createdAt).toLocaleDateString('fr-FR')
      ]);

      // Combiner les en-têtes et les données
      const csvContent = [
        headers.join(','),
        ...data.map(row => row.join(','))
      ].join('\n');

      // Créer un objet Blob avec le contenu CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `produits_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      // Ajouter le lien au DOM, cliquer dessus, puis le supprimer
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Export CSV réussi");
    } catch (error) {
      console.error("Erreur lors de l'export CSV:", error);
      toast.error("Erreur lors de l'export CSV");
    }
  };

  if (authLoading) {
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
          <AlertTriangle className="w-16 h-16 text-destructive mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Accès restreint
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Cette page est réservée aux administrateurs.
            Veuillez vous connecter avec un compte administrateur.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <PageHead 
        title="Gestion des Produits" 
        description="Gérez tous les produits de la plateforme"
      >
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm" 
          className="ml-auto"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </PageHead>

      <div className="mt-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="mb-6 flex justify-between items-center">
          <Button 
            onClick={toggleFilters} 
            variant="outline" 
            size="sm"
            className="flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(filteredProducts)}
              className="flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">Prix minimum</label>
                <Input
                  type="number"
                  placeholder="Prix min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">Prix maximum</label>
                <Input
                  type="number"
                  placeholder="Prix max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">Stock</label>
                <Select
                  value={filters.inStock}
                  onValueChange={(value) => handleFilterChange('inStock', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous</SelectItem>
                    <SelectItem value="in-stock">En stock</SelectItem>
                    <SelectItem value="out-of-stock">Épuisé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">Statut</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous</SelectItem>
                    <SelectItem value="approved">Approuvé</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1 md:col-span-2 lg:col-span-4 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleResetFilters}
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
            columns={columns({ 
              onApprove: handleApproveProduct, 
              onDelete: handleDeleteProduct 
            })} 
            data={filteredProducts} 
            searchKey="name"
            loading={loading}
          />
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-normal">
              Total: {filteredProducts.length} produits
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-normal">
              En stock: {filteredProducts.filter(p => p.stock > 0).length}
            </Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-normal">
              Épuisés: {filteredProducts.filter(p => p.stock <= 0).length}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">
                Approuvés: {filteredProducts.filter(p => p.isApproved).length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm">
                En attente: {filteredProducts.filter(p => !p.isApproved).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}