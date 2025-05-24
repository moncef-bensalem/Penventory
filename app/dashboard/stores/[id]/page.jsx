'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import PageHead from '@/components/backoffice/PageHead';
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  Check, 
  Clock, 
  Edit, 
  Globe, 
  Image, 
  LayoutGrid, 
  Mail, 
  MapPin, 
  Phone, 
  ShoppingBag, 
  Star, 
  Store, 
  User, 
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function StoreDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(null);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const storeId = params.id;

  // Récupérer les détails du magasin
  useEffect(() => {
    if (!authLoading && user && user.role === 'ADMIN') {
      fetchStoreDetails();
    }
  }, [user, storeId, authLoading]);

  const fetchStoreDetails = async () => {
    try {
      setLoading(true);
      setError(null); // Réinitialiser l'erreur au début de chaque tentative
      console.log(`[CLIENT] Fetching store details for ID: ${storeId}`);
      console.log(`[CLIENT] User role: ${user?.role}`);
      
      if (!user || user.role !== 'ADMIN') {
        throw new Error('Vous devez être connecté en tant qu\'administrateur');
      }

      // Valider le format de l'ID MongoDB
      const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!mongoIdRegex.test(storeId)) {
        throw new Error('ID de magasin invalide');
      }

      const response = await fetch(`/api/admin/stores/${storeId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('[CLIENT] Response status:', response.status);
      
      // Traiter les erreurs HTTP courantes
      if (response.status === 404) {
        throw new Error('Magasin non trouvé');
      } else if (response.status === 401) {
        throw new Error('Non autorisé. Vous devez être connecté en tant qu\'administrateur.');
      } else if (response.status === 500) {
        throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
      }
      
      let responseData;
      try {
        responseData = await response.json();
        console.log('[CLIENT] Response data:', responseData);
      } catch (parseError) {
        console.error('[CLIENT] Error parsing response:', parseError);
        throw new Error('Erreur lors de la lecture des données du serveur');
      }
      
      if (!response.ok) {
        throw new Error(responseData.error || `Erreur serveur (${response.status})`);
      }
      
      if (!responseData.success || !responseData.store) {
        throw new Error('Les données du magasin sont invalides ou manquantes');
      }
      
      // Formater les dates
      setStore({
        ...responseData.store,
        formattedCreatedAt: format(new Date(responseData.store.createdAt), 'dd MMMM yyyy', { locale: fr }),
      });
      
      // Récupérer les produits et commandes liés si disponibles
      if (responseData.products) setProducts(responseData.products);
      if (responseData.orders) setOrders(responseData.orders);
      
      console.log('[CLIENT] Store details successfully loaded');
      
    } catch (error) {
      console.error('[CLIENT] Error fetching store details:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Changer le statut d'approbation du magasin
  const handleToggleApproval = async () => {
    const newStatus = !store.isApproved;
    const actionText = newStatus ? 'approuver' : 'désapprouver';
    
    if (!confirm(`Êtes-vous sûr de vouloir ${actionText} ce magasin ?
      Nom du magasin: ${store.name}`)) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/stores/${storeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isApproved: newStatus
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur lors de la modification du statut du magasin`);
      }
      
      const data = await response.json();
      
      if (data.success && data.store) {
        setStore({
          ...data.store,
          formattedCreatedAt: format(new Date(data.store.createdAt), 'dd MMMM yyyy', { locale: fr }),
        });
        toast.success(`Magasin ${newStatus ? 'approuvé' : 'désapprouvé'} avec succès`);
      } else {
        throw new Error('Format de données invalide');
      }
    } catch (error) {
      console.error('Error toggling store approval:', error);
      toast.error(error.message || `Erreur lors de la modification du statut du magasin`);
    } finally {
      setLoading(false);
    }
  };

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

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-start mb-6">
          <Button variant="ghost" onClick={() => router.push('/dashboard/stores')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux magasins
          </Button>
        </div>
        <div className="text-center py-12">
          <Store className="h-16 w-16 mx-auto text-gray-400" />
          <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Erreur lors du chargement du magasin
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {error}
          </p>
          <div className="mt-6">
            <Button onClick={() => fetchStoreDetails()}>
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-start mb-6">
          <Button variant="ghost" onClick={() => router.push('/dashboard/stores')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux magasins
          </Button>
        </div>
        <div className="text-center py-12">
          <Store className="h-16 w-16 mx-auto text-gray-400" />
          <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Magasin non trouvé
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Les détails du magasin demandé ne sont pas disponibles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.push('/dashboard/stores')} className="self-start">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux magasins
        </Button>
        
        <div className="flex-1">
          <PageHead 
            title={store.name} 
            description={`Détails et gestion du magasin ${store.name}`}
          >
            <div className="flex items-center gap-2 ml-auto">
              <Button 
                variant={store.isApproved ? "destructive" : "success"}
                size="sm" 
                className="flex items-center gap-1"
                onClick={handleToggleApproval}
              >
                {store.isApproved ? (
                  <>
                    <X className="w-4 h-4" />
                    Désapprouver
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Approuver
                  </>
                )}
              </Button>
              <Link href={`/dashboard/catalogue/store-banners?storeId=${store.id}`}>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Image className="w-4 h-4" />
                  Gérer la bannière
                </Button>
              </Link>
              <Link href={`/dashboard/stores/update/${store.id}`}>
                <Button size="sm" className="flex items-center gap-1">
                  <Edit className="w-4 h-4" />
                  Modifier
                </Button>
              </Link>
            </div>
          </PageHead>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-1">
          <CardHeader className="relative pb-0">
            <div className="h-40 bg-gray-100 overflow-hidden rounded-t-lg">
              {store.banner ? (
                <img 
                  src={store.banner} 
                  alt={`Bannière de ${store.name}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/placeholder-banner.jpg';
                  }}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Image className="h-12 w-12 mb-2" />
                  <p className="text-sm">Aucune bannière</p>
                </div>
              )}
            </div>
            <div className="absolute -bottom-10 left-4 w-20 h-20 rounded-full overflow-hidden border-4 border-white bg-white shadow-md">
              {store.logo ? (
                <img 
                  src={store.logo} 
                  alt={store.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.className = 'hidden';
                    e.target.parentNode.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-200"><Store class="h-8 w-8 text-gray-500" /></div>`;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <Store className="h-8 w-8 text-gray-500" />
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pt-12 pb-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{store.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={store.isApproved ? 'success' : 'destructive'} className="gap-1">
                    {store.isApproved ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {store.isApproved ? 'Approuvé' : 'Non approuvé'}
                  </Badge>
                  {store.rating > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      {store.rating.toFixed(1)}
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300">{store.description}</p>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {store.owner?.name || 'Propriétaire inconnu'}
                  </span>
                </div>
                
                {store.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {[store.address, store.city].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                
                {store.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{store.phone}</span>
                  </div>
                )}
                
                {store.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{store.email}</span>
                  </div>
                )}
                
                {store.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <a href={store.website} target="_blank" rel="noopener noreferrer" 
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {store.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Créé le {store.formattedCreatedAt}
                  </span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex flex-wrap gap-2">
                {store.facebook && (
                  <a href={store.facebook} target="_blank" rel="noopener noreferrer" 
                    className="p-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    Facebook
                  </a>
                )}
                
                {store.instagram && (
                  <a href={store.instagram} target="_blank" rel="noopener noreferrer" 
                    className="p-2 bg-pink-100 text-pink-800 rounded-md hover:bg-pink-200 transition-colors"
                  >
                    Instagram
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardContent className="p-0">
            <Tabs defaultValue="overview">
              <TabsList className="w-full rounded-none border-b bg-transparent">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Aperçu
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Produits ({products.length || 0})
                </TabsTrigger>
                <TabsTrigger value="hours" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Horaires
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <ShoppingBag className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                        <CardTitle className="text-xl mb-1">{products.length || 0}</CardTitle>
                        <p className="text-sm text-gray-500">Produits</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Building2 className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                        <CardTitle className="text-xl mb-1">{store.categories?.length || 0}</CardTitle>
                        <p className="text-sm text-gray-500">Catégories</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Star className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                        <CardTitle className="text-xl mb-1">{store.rating.toFixed(1)}</CardTitle>
                        <p className="text-sm text-gray-500">Note moyenne</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Actions rapides</h3>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/dashboard/catalogue/store-banners?storeId=${store.id}`}>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Image className="w-4 h-4" />
                        Gérer la bannière
                      </Button>
                    </Link>
                    <Link href={`/dashboard/stores/update/${store.id}`}>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Edit className="w-4 h-4" />
                        Modifier le magasin
                      </Button>
                    </Link>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="products" className="p-6">
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map(product => (
                      <Card key={product.id} className="overflow-hidden">
                        <div className="h-40 bg-gray-100">
                          {product.images && product.images[0] ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.className = 'hidden';
                              }}
                            />
                          ) : (
                            <div className="h-full flex items-center justify-center">
                              <ShoppingBag className="h-12 w-12 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-medium truncate">{product.name}</h4>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="font-bold text-orange-600">{product.price.toFixed(2)} DT</span>
                            <Badge>{product.stock} en stock</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">Aucun produit trouvé pour ce magasin</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="hours" className="p-6">
                {store.openingHours && store.openingHours.length > 0 ? (
                  <div className="space-y-4">
                    {store.openingHours.map(hours => (
                      <div key={hours.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <div className="font-medium">{hours.day}</div>
                        {hours.isClosed ? (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Fermé
                          </Badge>
                        ) : (
                          <div className="text-sm">
                            {hours.openTime} - {hours.closeTime}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">Aucun horaire défini pour ce magasin</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 