"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Loader2, 
  ShoppingCart, 
  ArrowLeft, 
  Check, 
  Info, 
  Store, 
  Truck, 
  Star, 
  Package, 
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { serializeBigInt } from "@/lib/utils/serialize";

export default function ListeScolairePage({ params }) {
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  const router = useRouter();
  const [liste, setListe] = useState(null);
  const [besoins, setBesoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [addingToCart, setAddingToCart] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    fetchListeDetails();
  }, [id]);

  useEffect(() => {
    // Calculer le prix total des produits sélectionnés
    let total = 0;
    Object.keys(selectedProducts).forEach(besoinId => {
      const productId = selectedProducts[besoinId];
      const besoin = besoins.find(b => b.id === besoinId);
      if (besoin && productId) {
        const association = besoin.produitAssociations.find(a => a.produit.id === productId);
        if (association) {
          total += association.prix;
        }
      }
    });
    setTotalPrice(total);
  }, [selectedProducts, besoins]);

  const fetchListeDetails = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/listes-scolaires/${id}`);
      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des détails de la liste");
      }
      const data = await res.json();
      setListe(data);
      
      // Récupérer les besoins avec les produits associés
      const besoinsRes = await fetch(`/api/listes-scolaires/${id}/besoins`);
      if (!besoinsRes.ok) {
        throw new Error("Erreur lors de la récupération des besoins");
      }
      const besoinsData = await besoinsRes.json();
      setBesoins(besoinsData);
      
      // Initialiser les produits sélectionnés avec les produits validés par défaut
      const initialSelected = {};
      besoinsData.forEach(besoin => {
        const validatedProduct = besoin.produitAssociations.find(assoc => assoc.validated);
        if (validatedProduct) {
          initialSelected[besoin.id] = validatedProduct.produit.id;
        }
      });
      setSelectedProducts(initialSelected);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de charger les détails de la liste");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProduct = (besoinId, productId) => {
    setSelectedProducts(prev => ({
      ...prev,
      [besoinId]: productId
    }));
  };

  const handleAddAllToCart = async () => {
    try {
      setAddingToCart(true);
      
      // Vérifier si tous les besoins ont un produit sélectionné
      const allBesoinsHaveProducts = besoins.every(besoin => 
        selectedProducts[besoin.id] !== undefined
      );
      
      if (!allBesoinsHaveProducts) {
        toast.warning("Veuillez sélectionner un produit pour chaque besoin");
        return;
      }
      
      // Récupérer le panier actuel du localStorage
      let cart = [];
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        try {
          cart = JSON.parse(storedCart);
        } catch (e) {
          console.error("Erreur lors de la récupération du panier:", e);
        }
      }
      
      // Préparer les produits à ajouter au panier
      for (const besoinId in selectedProducts) {
        const productId = selectedProducts[besoinId];
        const besoin = besoins.find(b => b.id === besoinId);
        const association = besoin.produitAssociations.find(a => a.produit.id === productId);
        
        if (association) {
          // Vérifier si le produit est déjà dans le panier
          const existingItemIndex = cart.findIndex(item => item.id === association.produit.id);
          
          if (existingItemIndex !== -1) {
            // Mettre à jour la quantité si le produit existe déjà
            cart[existingItemIndex].quantity += 1;
          } else {
            // Ajouter un nouvel élément au panier
            cart.push({
              id: association.produit.id,
              name: association.produit.name,
              price: Number(association.prix),
              discount: 0,
              quantity: 1,
              images: association.produit.images || [],
              store: association.produit.store ? {
                id: association.produit.store.id,
                name: association.produit.store.name
              } : null,
              sellerId: association.seller.id,
              besoinId: besoinId,
              listeId: id
            });
          }
        }
      }
      
      // Sauvegarder le panier mis à jour dans le localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Déclencher un événement pour mettre à jour le compteur du panier dans la navigation
      window.dispatchEvent(new Event('storage'));
      
      toast.success("Tous les produits ont été ajoutés au panier");
      router.push("/cart");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible d'ajouter les produits au panier");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddSingleToCart = async (besoinId, productId) => {
    try {
      const besoin = besoins.find(b => b.id === besoinId);
      const association = besoin.produitAssociations.find(a => a.produit.id === productId);
      
      if (!association) {
        toast.error("Produit non trouvé");
        return;
      }
      
      // Récupérer le panier actuel du localStorage
      let cart = [];
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        try {
          cart = JSON.parse(storedCart);
        } catch (e) {
          console.error("Erreur lors de la récupération du panier:", e);
        }
      }
      
      // Vérifier si le produit est déjà dans le panier
      const existingItemIndex = cart.findIndex(item => item.id === association.produit.id);
      
      if (existingItemIndex !== -1) {
        // Mettre à jour la quantité si le produit existe déjà
        cart[existingItemIndex].quantity += 1;
      } else {
        // Ajouter un nouvel élément au panier
        cart.push({
          id: association.produit.id,
          name: association.produit.name,
          price: Number(association.prix),
          discount: 0,
          quantity: 1,
          images: association.produit.images || [],
          store: association.produit.store ? {
            id: association.produit.store.id,
            name: association.produit.store.name
          } : null,
          sellerId: association.seller.id,
          besoinId: besoinId,
          listeId: id
        });
      }
      
      // Sauvegarder le panier mis à jour dans le localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Déclencher un événement pour mettre à jour le compteur du panier dans la navigation
      window.dispatchEvent(new Event('storage'));
      
      toast.success("Produit ajouté au panier");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible d'ajouter le produit au panier");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des détails de la liste...</span>
      </div>
    );
  }

  if (!liste) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <Info className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium mb-2">Liste non trouvée</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            La liste scolaire que vous recherchez n'existe pas ou n'est pas disponible.
          </p>
          <Button onClick={() => router.push("/listes-scolaires")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux listes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={() => router.push("/listes-scolaires")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux listes
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{liste.nom}</CardTitle>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {liste.etablissement} - {liste.niveau}
                  </p>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {liste.annee}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {liste.description || "Aucune description disponible pour cette liste."}
                </p>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Articles de la liste ({besoins.length})</h3>
                
                {besoins.length === 0 ? (
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="text-gray-500">Aucun article trouvé dans cette liste</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {besoins.map((besoin) => (
                      <Accordion 
                        key={besoin.id} 
                        type="single" 
                        className="border rounded-md"
                      >
                        <AccordionItem value="item-1">
                          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center">
                                <div className="ml-2">
                                  <h4 className="text-sm font-medium">{besoin.nom}</h4>
                                  <p className="text-xs text-gray-500">
                                    {besoin.description || "Aucune description"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <Badge variant="outline" className="mr-2">
                                  {besoin.quantite} {besoin.quantite > 1 ? "unités" : "unité"}
                                </Badge>
                                {besoin.produitAssociations.length > 0 ? (
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    {besoin.produitAssociations.length} options
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                    Non disponible
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 py-3">
                            {besoin.produitAssociations.length > 0 ? (
                              <div className="space-y-4">
                                <RadioGroup 
                                  value={selectedProducts[besoin.id] || ""}
                                  onValueChange={(value) => handleSelectProduct(besoin.id, value)}
                                >
                                  {besoin.produitAssociations.map((assoc) => (
                                    <div 
                                      key={assoc.id} 
                                      className={`border rounded-md p-3 ${
                                        selectedProducts[besoin.id] === assoc.produit.id 
                                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                                      }`}
                                    >
                                      <div className="flex items-start">
                                        <RadioGroupItem 
                                          value={assoc.produit.id} 
                                          id={`product-${assoc.id}`}
                                          className="mt-1"
                                        />
                                        <div className="ml-3 flex-1">
                                          <Label 
                                            htmlFor={`product-${assoc.id}`}
                                            className="text-sm font-medium cursor-pointer"
                                          >
                                            {assoc.produit.name}
                                            {assoc.validated && (
                                              <Badge className="ml-2 bg-green-100 text-green-800">
                                                <Check className="h-3 w-3 mr-1" />
                                                Recommandé
                                              </Badge>
                                            )}
                                          </Label>
                                          <div className="mt-1 flex items-center text-sm text-gray-500">
                                            <Store className="h-3 w-3 mr-1" />
                                            {assoc.produit.store.name}
                                          </div>
                                          <div className="mt-2 flex justify-between items-center">
                                            <div className="text-sm font-medium">
                                              {assoc.prix.toFixed(2)} DT
                                            </div>
                                            <Button 
                                              variant="outline" 
                                              size="sm"
                                              onClick={() => handleAddSingleToCart(besoin.id, assoc.produit.id)}
                                            >
                                              <ShoppingCart className="h-3 w-3 mr-1" />
                                              Ajouter
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </div>
                            ) : (
                              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                                <p className="text-gray-500">Aucun produit disponible pour cet article</p>
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-xl">Résumé de la liste</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Articles:</span>
                  <span className="font-medium">{besoins.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Articles sélectionnés:</span>
                  <span className="font-medium">{Object.keys(selectedProducts).length} / {besoins.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Prix total:</span>
                  <span className="font-medium">{totalPrice.toFixed(2)} DT</span>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Options de livraison disponibles:</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <Truck className="h-4 w-4 mr-2" />
                    Livraison à domicile
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="h-4 w-4 mr-2" />
                    Retrait en magasin
                  </div>
                </div>
                
                <Separator />
                
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleAddAllToCart}
                  disabled={addingToCart || Object.keys(selectedProducts).length === 0}
                >
                  {addingToCart ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ajout en cours...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Ajouter tous les articles au panier
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  Vous pourrez modifier les quantités dans votre panier
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
