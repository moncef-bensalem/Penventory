'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHead from '@/components/backoffice/PageHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash, CheckCircle, XCircle, Package, Store, Tag, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/auth-context';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (id && user && (user.role === 'ADMIN' || user.role === 'MANAGER')) {
      fetchProductDetails();
    }
  }, [id, user]);
  
  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const apiEndpoint = user.role === 'ADMIN' 
        ? `/api/admin/products/${id}`
        : `/api/manager/products/${id}`;
        
      const response = await fetch(apiEndpoint);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des détails du produit');
      }
      
      const data = await response.json();
      setProduct(data.product);
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleApprove = async (approved) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/products/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved }),
      });

      if (!response.ok) {
        throw new Error(approved ? 'Erreur lors de l\'approbation du produit' : 'Erreur lors du rejet du produit');
      }

      toast.success(approved ? 'Produit approuvé avec succès' : 'Produit rejeté avec succès');
      fetchProductDetails();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du produit');
      }

      toast.success('Produit supprimé avec succès');
      router.push('/dashboard/catalogue/products');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Accès restreint</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Cette page est réservée aux administrateurs et managers.
          </p>
          <Button
            onClick={() => router.push('/')}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHead 
          title="Détails du produit" 
          description="Chargement..."
          backButton
          backButtonLink="/dashboard/catalogue/products"
        />
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHead 
          title="Détails du produit" 
          description="Produit non trouvé"
          backButton
          backButtonLink="/dashboard/catalogue/products"
        />
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Produit non trouvé</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Le produit que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Button
            onClick={() => router.push('/dashboard/catalogue/products')}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Retour à la liste des produits
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHead 
        title={product.name} 
        description="Détails du produit"
        backButton
        backButtonLink="/dashboard/catalogue/products"
      >
        <div className="flex space-x-2">
          <Button
            onClick={() => router.push(`/dashboard/catalogue/products/update/${id}`)}
            variant="outline"
            className="flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <Button
            onClick={handleDelete}
            variant="destructive"
            className="flex items-center"
          >
            <Trash className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </PageHead>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Informations principales */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Informations du produit</span>
              <Badge className={product.isApproved ? "bg-green-500" : "bg-yellow-500"}>
                {product.isApproved ? "Approuvé" : "En attente"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {product.images && product.images.length > 0 ? (
                product.images.map((image, index) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                    <img 
                      src={image} 
                      alt={`${product.name} - Image ${index + 1}`} 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/600x600/orange/white?text=Image%20non%20disponible';
                      }}
                    />
                  </div>
                ))
              ) : (
                <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Description */}
            <div>
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-400">{product.description || "Aucune description disponible"}</p>
            </div>
            
            {/* Prix et stock */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Prix</h3>
                <p className="text-2xl font-bold text-orange-600">{product.price.toFixed(2)} DT</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Stock</h3>
                <p className="text-2xl font-bold">{product.stock}</p>
              </div>
            </div>
            
            {/* Catégorie */}
            <div>
              <h3 className="text-lg font-medium mb-2">Catégorie</h3>
              <Badge variant="outline" className="text-sm">
                <Tag className="w-4 h-4 mr-2" />
                {product.category?.name || "Non catégorisé"}
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            {!product.isApproved ? (
              <Button onClick={() => handleApprove(true)} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Approuver ce produit
              </Button>
            ) : (
              <Button onClick={() => handleApprove(false)} variant="outline" className="text-red-600 border-red-600">
                <XCircle className="w-4 h-4 mr-2" />
                Rejeter ce produit
              </Button>
            )}
          </CardFooter>
        </Card>
        
        {/* Informations du vendeur */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du vendeur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              {product.store?.logo ? (
                <img 
                  src={product.store.logo} 
                  alt={product.store.name} 
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/200x200/orange/white?text=Logo';
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <Store className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <div>
                <h3 className="font-medium">{product.store?.name || "Magasin inconnu"}</h3>
                <p className="text-sm text-gray-500">{product.store?.owner?.name || "Propriétaire inconnu"}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-1">Email</h3>
              <p className="text-gray-600">{product.store?.owner?.email || "Non disponible"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1">Adresse</h3>
              <p className="text-gray-600">{product.store?.address || "Non disponible"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1">Produits du vendeur</h3>
              <p className="text-gray-600">{product._count?.products || 0} produits</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => router.push(`/dashboard/stores/${product.store?.id}`)}
              variant="outline" 
              className="w-full"
            >
              <Info className="w-4 h-4 mr-2" />
              Voir le magasin
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 