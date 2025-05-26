'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Loader2, 
  Package, 
  Edit, 
  Tag, 
  Truck, 
  ShieldCheck, 
  ShoppingBag,
  BarChart4,
  Bookmark
} from 'lucide-react';
import Link from 'next/link';

export default function ProductDetails({ params }) {
  const router = useRouter();
  const productId = use(params).id;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données du produit
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        
        // Récupérer les détails du produit
        const productResponse = await fetch(`/api/seller/products?id=${productId}`);
        if (!productResponse.ok) {
          throw new Error('Erreur lors du chargement du produit');
        }
        
        const response = await productResponse.json();
        console.log('Réponse de l\'API:', response);
        
        // Extraire les données du produit
        const productData = response.product || response;
        setProduct(productData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500 mb-4" />
          <p className="text-muted-foreground">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="text-red-500 mb-4">
          <Package className="h-16 w-16 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-center">Produit non trouvé</h3>
        </div>
        <p className="text-muted-foreground mb-6">
          {error || "Impossible de charger les détails du produit"}
        </p>
        <Button onClick={() => router.push('/seller/dashboard/products')}>
          Retour à la liste des produits
        </Button>
      </div>
    );
  }

  // Formater le prix
  const formatPrice = (price) => {
    return typeof price === 'number' 
      ? price.toFixed(2) + ' DT' 
      : (parseFloat(price) || 0).toFixed(2) + ' DT';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/seller/dashboard/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{product.name}</h2>
          <p className="text-muted-foreground">
            Détails du produit
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/seller/dashboard/products/edit/${productId}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Colonne de gauche - Images et statut */}
        <Card className="p-6 md:col-span-1">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Images</h3>
            
            {product.images && product.images.length > 0 ? (
              <div className="space-y-4">
                <div className="rounded-lg overflow-hidden bg-gray-50 aspect-square">
                  <img 
                    src={product.images[0]} 
                    alt={product.name} 
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.slice(1).map((image, index) => (
                      <div key={index} className="aspect-square rounded-md overflow-hidden bg-gray-50">
                        <img 
                          src={image} 
                          alt={`${product.name} ${index + 2}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                <Package className="h-16 w-16 text-gray-400" />
              </div>
            )}

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Statut</h4>
              <Badge variant={product.isActive ? "success" : "secondary"}>
                {product.isActive ? "Actif" : "Inactif"}
              </Badge>
            </div>

            {/* Code-barres */}
            {product.barcode && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Code-barres</h4>
                <p className="font-mono text-sm bg-gray-50 p-2 rounded">{product.barcode}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Colonne du milieu - Informations principales */}
        <Card className="p-6 md:col-span-2">
          <Tabs defaultValue="general">
            <TabsList className="mb-4">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="attributes">Attributs</TabsTrigger>
              <TabsTrigger value="pricing">Prix & Stock</TabsTrigger>
              {(product.author || product.collection || product.language || product.level || product.pages > 0) && (
                <TabsTrigger value="book">Livre/Papeterie</TabsTrigger>
              )}
            </TabsList>
            
            {/* Onglet Général */}
            <TabsContent value="general" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                    <p className="mt-1">{product.description || "Aucune description"}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Catégorie</h4>
                    <p className="mt-1">{product.category?.name || "Non catégorisé"}</p>
                  </div>

                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="flex items-center">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Onglet Attributs */}
            <TabsContent value="attributes" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Attributs du produit</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {product.brand && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Marque</h4>
                      <p className="mt-1">{product.brand}</p>
                    </div>
                  )}
                  
                  {product.color && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Couleur</h4>
                      <div className="flex items-center mt-1">
                        {product.color !== 'Undefined' && (
                          <div 
                            className="w-4 h-4 rounded-full mr-2" 
                            style={{ 
                              backgroundColor: product.color.toLowerCase() === 'multi color' 
                                ? 'linear-gradient(90deg, red, yellow, green, blue, purple)' 
                                : product.color.toLowerCase()
                            }}
                          />
                        )}
                        {product.color}
                      </div>
                    </div>
                  )}
                  
                  {product.material && product.material !== 'Undefined' && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Matériau</h4>
                      <p className="mt-1">{product.material}</p>
                    </div>
                  )}
                  
                  {product.size && product.size !== 'Undefined' && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Taille</h4>
                      <p className="mt-1">{product.size}</p>
                    </div>
                  )}

                  {product.dimensions && product.dimensions !== 'Undefined' && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Dimensions</h4>
                      <p className="mt-1">{product.dimensions}</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Onglet Prix & Stock */}
            <TabsContent value="pricing" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Prix et stock</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Prix de vente</h4>
                    <p className="mt-1 text-xl font-semibold">{formatPrice(product.price)}</p>
                  </div>
                  
                  {product.discount > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Remise</h4>
                      <p className="mt-1 text-xl font-semibold text-green-600">{product.discount}%</p>
                      <p className="text-sm text-muted-foreground">
                        Prix après remise: {formatPrice(product.price * (1 - product.discount / 100))}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Stock disponible</h4>
                    <p className="mt-1 text-xl font-semibold">{product.stock} unités</p>
                  </div>
                </div>
                
                {/* Vente en gros */}
                {product.isWholesale && (
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex items-center mb-4">
                      <Truck className="h-5 w-5 mr-2 text-blue-600" />
                      <h4 className="font-medium">Options de vente en gros</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Prix de gros</h4>
                        <p className="mt-1">{formatPrice(product.wholesalePrice)}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Quantité minimale</h4>
                        <p className="mt-1">{product.wholesaleMinQty} unités</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Onglet Livre/Papeterie */}
            {(product.author || product.collection || product.language || product.level || product.pages > 0) && (
              <TabsContent value="book" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Informations sur le livre/papeterie</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {product.author && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Auteur</h4>
                        <p className="mt-1">{product.author}</p>
                      </div>
                    )}
                    
                    {product.collection && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Collection</h4>
                        <p className="mt-1">{product.collection}</p>
                      </div>
                    )}
                    
                    {product.language && product.language !== 'Undefined' && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Langue</h4>
                        <p className="mt-1">{product.language}</p>
                      </div>
                    )}
                    
                    {product.level && product.level !== 'Undefined' && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Niveau scolaire</h4>
                        <p className="mt-1">{product.level}</p>
                      </div>
                    )}
                    
                    {product.pages > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Nombre de pages</h4>
                        <p className="mt-1">{product.pages}</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
