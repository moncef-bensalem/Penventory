"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Package, Save, Check, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AssocierProduitsPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [liste, setListe] = useState(null);
  // Initialiser produits comme un tableau vide
  const [produits, setProduits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [associations, setAssociations] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Récupérer les détails de la liste scolaire
        const listeRes = await fetch(`/api/seller/listes-scolaires/${id}`);
        if (!listeRes.ok) {
          throw new Error("Erreur lors de la récupération de la liste scolaire");
        }
        const listeData = await listeRes.json();
        setListe(listeData);

        // Récupérer les produits du vendeur
        const produitsRes = await fetch("/api/seller/products");
        if (!produitsRes.ok) {
          throw new Error("Erreur lors de la récupération des produits");
        }
        const produitsData = await produitsRes.json();
        
        // L'API renvoie les produits dans un objet avec une clé 'products'
        if (produitsData && Array.isArray(produitsData.products)) {
          setProduits(produitsData.products);
        } else {
          console.error("Format de données produits invalide:", produitsData);
          setProduits([]);
        }

        // Récupérer les associations existantes
        const associationsRes = await fetch(`/api/seller/listes-scolaires/${id}/associations`);
        if (associationsRes.ok) {
          const associationsData = await associationsRes.json();
          
          // Formater les associations pour l'état
          const formattedAssociations = {};
          associationsData.forEach(assoc => {
            formattedAssociations[assoc.besoinId] = {
              produitId: assoc.produitId,
              prix: assoc.prix,
              quantiteDisponible: assoc.quantiteDisponible
            };
          });
          
          setAssociations(formattedAssociations);
        }
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Impossible de charger les données");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAssociationChange = (besoinId, field, value) => {
    // Si l'utilisateur sélectionne "Aucun produit", supprimer l'association pour ce besoin
    if (field === "produitId" && value === "no-product") {
      setAssociations(prev => {
        const newAssociations = { ...prev };
        delete newAssociations[besoinId];
        return newAssociations;
      });
      return;
    }
    
    setAssociations(prev => ({
      ...prev,
      [besoinId]: {
        ...prev[besoinId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Formater les données pour l'API
      const associationsData = Object.entries(associations).map(([besoinId, data]) => ({
        besoinId,
        produitId: data.produitId,
        prix: parseFloat(data.prix),
        quantiteDisponible: parseInt(data.quantiteDisponible)
      })).filter(assoc => 
        // Filtrer les associations valides (avec un produit, un prix et une quantité)
        assoc.produitId && assoc.produitId !== "no-product" && 
        !isNaN(assoc.prix) && assoc.prix > 0 &&
        !isNaN(assoc.quantiteDisponible) && assoc.quantiteDisponible > 0
      );

      // Envoyer les données à l'API
      const response = await fetch(`/api/seller/listes-scolaires/${id}/associations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ associations: associationsData }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement des associations");
      }

      toast.success("Associations enregistrées avec succès");
      // Rediriger vers la liste des listes scolaires
      router.push("/seller/listes-scolaires");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible d'enregistrer les associations");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Obtenir le statut du besoin avec la couleur correspondante
  const getBesoinStatusBadge = (status) => {
    switch (status) {
      case "OBLIGATOIRE":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Obligatoire</Badge>;
      case "RECOMMANDE":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Recommandé</Badge>;
      case "OPTIONNEL":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Optionnel</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        onClick={() => router.push("/seller/listes-scolaires")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux listes scolaires
      </Button>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{liste?.titre || "Chargement..."}</CardTitle>
              <CardDescription className="mt-1">
                {liste ? (
                  <>
                    <span className="font-medium">Classe:</span> {liste.classe} | 
                    <span className="font-medium ml-2">Établissement:</span> {liste.etablissement}
                  </>
                ) : "Chargement des détails..."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <Separator />
        
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <p className="mt-4 text-gray-500">Chargement des données...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-md flex items-start">
                <AlertCircle className="text-blue-500 dark:text-blue-300 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">Instructions</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Associez vos produits aux besoins de cette liste scolaire. Pour chaque besoin, sélectionnez un produit, indiquez son prix et la quantité disponible.
                  </p>
                </div>
              </div>
              
              {liste?.besoins && liste.besoins.length > 0 ? (
                <div className="space-y-4">
                  {liste.besoins.map(besoin => (
                    <Card key={besoin.id} className="border border-gray-200 dark:border-gray-700">
                      <CardHeader className="bg-gray-50 dark:bg-gray-800 py-3 px-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">{besoin.libelle}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {besoin.description || "Aucune description"}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getBesoinStatusBadge(besoin.statut)}
                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                              <Package className="h-3 w-3 mr-1" />
                              Qté: {besoin.quantite}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid gap-4 md:grid-cols-12">
                          <div className="md:col-span-6 space-y-2">
                            <Label htmlFor={`produit-${besoin.id}`}>Sélectionner un produit</Label>
                            <Select 
                              value={associations[besoin.id]?.produitId || ""} 
                              onValueChange={(value) => handleAssociationChange(besoin.id, "produitId", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choisir un produit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="no-product">Aucun produit</SelectItem>
                                {Array.isArray(produits) ? produits.map(produit => (
                                  <SelectItem key={produit.id} value={produit.id}>
                                    {produit.name}
                                  </SelectItem>
                                )) : <SelectItem value="loading">Chargement des produits...</SelectItem>}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="md:col-span-3 space-y-2">
                            <Label htmlFor={`prix-${besoin.id}`}>Prix (DT)</Label>
                            <Input
                              id={`prix-${besoin.id}`}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={associations[besoin.id]?.prix || ""}
                              onChange={(e) => handleAssociationChange(besoin.id, "prix", e.target.value)}
                              disabled={!associations[besoin.id]?.produitId || associations[besoin.id]?.produitId === "no-product"}
                            />
                          </div>
                          
                          <div className="md:col-span-3 space-y-2">
                            <Label htmlFor={`quantite-${besoin.id}`}>Quantité disponible</Label>
                            <Input
                              id={`quantite-${besoin.id}`}
                              type="number"
                              min="0"
                              placeholder="0"
                              value={associations[besoin.id]?.quantiteDisponible || ""}
                              onChange={(e) => handleAssociationChange(besoin.id, "quantiteDisponible", e.target.value)}
                              disabled={!associations[besoin.id]?.produitId || associations[besoin.id]?.produitId === "no-product"}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-gray-50 dark:bg-gray-800 rounded-md">
                  <p className="text-gray-500">Aucun produit dans cette liste</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t p-6">
          <Button
            variant="outline"
            onClick={() => router.push("/seller/listes-scolaires")}
          >
            Annuler
          </Button>
          
          <Button 
            onClick={handleSubmit}
            className="bg-orange-500 hover:bg-orange-600 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer les associations
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
