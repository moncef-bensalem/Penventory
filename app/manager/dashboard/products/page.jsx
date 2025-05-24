'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import PageHead from '@/components/backoffice/PageHead';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Package, 
  AlertTriangle, 
  Store, 
  Filter, 
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  Pencil,
  Trash,
  CheckSquare,
  XSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createColumns } from './components/columns';

export default function ManagerProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [productSummary, setProductSummary] = useState({
    totalProducts: 0,
    pendingApproval: 0,
    lowStockProducts: 0,
    activeSellers: 0
  });
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    inStock: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Fetch all products that need manager approval
  useEffect(() => {
    if (user && user.role === 'MANAGER') {
      console.log('Manager user detected, fetching products data...');
      fetchProducts();
    }
  }, [user]);

  // Apply filters whenever products or filters change
  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products for manager approval...');
      
      // Appel à l'API pour récupérer les vrais produits
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.category) queryParams.append('categoryId', filters.category);
      
      const response = await fetch(`/api/manager/products?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la récupération des produits');
      }
      
      const data = await response.json();
      console.log('Products fetched successfully:', data.products?.length);
      
      // Adapter les données pour notre format
      const formattedProducts = data.products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock: product.stock || 0,
        status: product.approved ? 'APPROVED' : 'PENDING',
        category: product.category?.name || 'Sans catégorie',
        categoryId: product.categoryId,
        rating: product.rating || 0,
        createdAt: product.createdAt,
        seller: {
          id: product.store?.owner?.id || 'unknown',
          name: product.store?.owner?.name || product.store?.name || 'Vendeur inconnu',
          email: product.store?.owner?.email || ''
        }
      }));
      
      setProducts(formattedProducts);
      
      // Calculate summary
      const summary = {
        totalProducts: formattedProducts.length,
        pendingApproval: formattedProducts.filter(p => p.status === 'PENDING').length,
        lowStockProducts: formattedProducts.filter(p => p.stock < 10 && p.stock > 0).length,
        activeSellers: [...new Set(formattedProducts.map(p => p.seller.id))].length
      };
      
      setProductSummary(summary);
      setFilteredProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Erreur lors de la récupération des produits');
      
      // En cas d'erreur, utiliser des données simulées comme solution de secours
      const mockProducts = generateMockProducts(15);
      setProducts(mockProducts);
      
      const summary = {
        totalProducts: mockProducts.length,
        pendingApproval: mockProducts.filter(p => p.status === 'PENDING').length,
        lowStockProducts: mockProducts.filter(p => p.stock < 10 && p.stock > 0).length,
        activeSellers: [...new Set(mockProducts.map(p => p.seller.id))].length
      };
      
      setProductSummary(summary);
      setFilteredProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock products for demo
  const generateMockProducts = (count) => {
    const statuses = ['PENDING', 'APPROVED', 'REJECTED'];
    const categories = ['Smartphones', 'Accessoires', 'Ordinateurs', 'Périphériques', 'Audio', 'Photo', 'TV & Vidéo', 'Consoles & Jeux'];
    
    return Array.from({ length: count }).map((_, index) => {
      const stock = Math.floor(Math.random() * 100);
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        id: `prod-${index + 1}`,
        name: `Produit ${index + 1}`,
        description: `Description du produit ${index + 1}`,
        price: Math.floor(Math.random() * 1000) + 10,
        stock: stock,
        status: status,
        category: categories[Math.floor(Math.random() * categories.length)],
        rating: (Math.random() * 5).toFixed(1),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        seller: {
          id: `seller-${Math.floor(Math.random() * 10) + 1}`,
          name: `Vendeur ${Math.floor(Math.random() * 10) + 1}`,
          email: `vendeur${Math.floor(Math.random() * 10) + 1}@example.com`
        }
      };
    });
  };
  
  const applyFilters = () => {
    let filtered = [...products];
    
    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }
    
    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(product => product.status === filters.status);
    }
    
    // Apply price filters
    if (filters.minPrice) {
      filtered = filtered.filter(product => product.price >= parseFloat(filters.minPrice));
    }
    
    if (filters.maxPrice) {
      filtered = filtered.filter(product => product.price <= parseFloat(filters.maxPrice));
    }
    
    // Apply stock filter
    if (filters.inStock === 'in-stock') {
      filtered = filtered.filter(product => product.stock > 10);
    } else if (filters.inStock === 'low-stock') {
      filtered = filtered.filter(product => product.stock > 0 && product.stock <= 10);
    } else if (filters.inStock === 'out-of-stock') {
      filtered = filtered.filter(product => product.stock === 0);
    }
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.seller.name.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredProducts(filtered);
  };
  
  const handleApproveProduct = async (productId) => {
    try {
      console.log(`Approving product ${productId}`);
      
      // Appel à l'API pour approuver le produit
      const response = await fetch(`/api/manager/products/${productId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved: true }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Erreur lors de l\'approbation du produit');
      }

      const data = await response.json();
      console.log('Product approved successfully:', data);

      // Mettre à jour la liste des produits
      fetchProducts();
      toast.success('Produit approuvé avec succès');
    } catch (error) {
      console.error('Error approving product:', error);
      toast.error('Erreur lors de l\'approbation du produit');
      
      // Mise à jour locale en cas d'erreur
      const updatedProducts = products.map(product => 
        product.id === productId ? { ...product, status: 'APPROVED' } : product
      );
      setProducts(updatedProducts);
    }
  };
  
  const handleRejectProduct = async (productId) => {
    try {
      console.log(`Rejecting product ${productId}`);
      
      // Appel à l'API pour rejeter le produit
      const response = await fetch(`/api/manager/products/${productId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved: false }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Erreur lors du rejet du produit');
      }

      const data = await response.json();
      console.log('Product rejected successfully:', data);

      // Mettre à jour la liste des produits
      fetchProducts();
      toast.success('Produit rejeté avec succès');
    } catch (error) {
      console.error('Error rejecting product:', error);
      toast.error('Erreur lors du rejet du produit');
      
      // Mise à jour locale en cas d'erreur
      const updatedProducts = products.map(product => 
        product.id === productId ? { ...product, status: 'REJECTED' } : product
      );
      setProducts(updatedProducts);
    }
  };
  
  const resetFilters = () => {
    setFilters({
      category: '',
      status: '',
      minPrice: '',
      maxPrice: '',
      inStock: '',
      search: ''
    });
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
        "Vendeur", 
        "Statut", 
        "Date d'ajout"
      ];

      // Formater les données des produits pour le CSV
      const data = products.map(product => [
        product.id,
        product.name,
        product.price,
        product.category,
        product.stock,
        product.seller.name,
        product.status,
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

  // Create columns with action handlers
  const columns = createColumns({
    onApprove: handleApproveProduct,
    onReject: handleRejectProduct,
    onViewDetails: (id) => console.log('View details:', id),
    onEdit: (id) => console.log('Edit:', id),
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'MANAGER') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl text-center">
          <AlertTriangle className="w-16 h-16 text-destructive mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Accès restreint
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Cette page est réservée aux managers.
            Veuillez vous connecter avec un compte manager.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHead 
        title="Gestion des Produits" 
        description="Approuvez, gérez et surveillez les produits vendus sur la plateforme" 
      />

      <div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Total Produits</h3>
              <Package className="h-6 w-6 text-orange-500" />
            </div>
            <p className="text-3xl font-bold mt-2">{productSummary.totalProducts}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">En attente</h3>
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold mt-2 text-yellow-600">
              {productSummary.pendingApproval}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Stock faible</h3>
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-3xl font-bold mt-2 text-red-600">
              {productSummary.lowStockProducts}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Vendeurs actifs</h3>
              <Store className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-3xl font-bold mt-2 text-blue-600">
              {productSummary.activeSellers}
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
              onClick={fetchProducts}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => exportToCSV(filteredProducts)}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Badge variant="outline" className="text-sm">
              Total: {products.length} produits
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Filtrés: {filteredProducts.length} produits
            </Badge>
          </div>
        </div>
        
        {showFilters && (
          <Card className="mb-6 p-4">
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
                </select>
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catégorie
                </label>
                <select
                  id="category"
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Toutes les catégories</option>
                  <option value="Smartphones">Smartphones</option>
                  <option value="Accessoires">Accessoires</option>
                  <option value="Ordinateurs">Ordinateurs</option>
                  <option value="Périphériques">Périphériques</option>
                  <option value="Audio">Audio</option>
                  <option value="Photo">Photo</option>
                  <option value="TV & Vidéo">TV & Vidéo</option>
                  <option value="Consoles & Jeux">Consoles & Jeux</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="inStock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Disponibilité
                </label>
                <select
                  id="inStock"
                  value={filters.inStock}
                  onChange={(e) => setFilters({...filters, inStock: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Tous</option>
                  <option value="in-stock">En stock</option>
                  <option value="low-stock">Stock faible</option>
                  <option value="out-of-stock">Épuisé</option>
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
                    placeholder="Nom, description, vendeur..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="pl-8 w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prix minimum
                </label>
                <input
                  id="minPrice"
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prix maximum
                </label>
                <input
                  id="maxPrice"
                  type="number"
                  placeholder="1000"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  className="w-full p-2 border rounded-md"
                />
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
          </Card>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <DataTable 
            columns={columns} 
            data={filteredProducts}
            searchKey="name"
          />
        </div>
      </div>
    </div>
  );
} 