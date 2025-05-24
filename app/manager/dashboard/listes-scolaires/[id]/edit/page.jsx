"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash, Save, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function EditListeScolairePage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    titre: "",
    classe: "",
    description: "",
    besoins: []
  });

  useEffect(() => {
    const fetchListe = async () => {
      try {
        const res = await fetch(`/api/manager/listes-scolaires/${id}`);
        if (!res.ok) {
          throw new Error("Erreur lors de la récupération de la liste scolaire");
        }
        const data = await res.json();
        
        // Formater les données pour le formulaire
        setFormData({
          titre: data.titre || "",
          classe: data.classe || "",
          description: data.description || "",
          besoins: data.besoins?.map(b => ({
            id: b.id,
            nomProduit: b.nomProduit,
            quantite: b.quantite,
            details: b.details || "",
            statut: b.statut
          })) || []
        });
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Impossible de charger les détails de la liste scolaire");
        router.push("/manager/dashboard/listes-scolaires");
      } finally {
        setIsLoading(false);
      }
    };

    fetchListe();
  }, [id, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBesoinChange = (index, field, value) => {
    const newBesoins = [...formData.besoins];
    newBesoins[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      besoins: newBesoins
    }));
  };

  const addBesoin = () => {
    setFormData((prev) => ({
      ...prev,
      besoins: [...prev.besoins, { nomProduit: "", quantite: 1, details: "", statut: "NON_COUVERT" }]
    }));
  };

  const removeBesoin = (index) => {
    if (formData.besoins.length === 1) {
      toast.error("Vous devez avoir au moins un produit dans la liste");
      return;
    }
    
    const newBesoins = formData.besoins.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      besoins: newBesoins
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation de base
    if (!formData.titre.trim()) {
      toast.error("Le titre est requis");
      return;
    }
    
    if (!formData.classe.trim()) {
      toast.error("La classe est requise");
      return;
    }
    
    // Validation des besoins
    const invalidBesoins = formData.besoins.filter(b => !b.nomProduit.trim());
    if (invalidBesoins.length > 0) {
      toast.error("Tous les produits doivent avoir un nom");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`/api/manager/listes-scolaires/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) {
        throw new Error("Erreur lors de la mise à jour de la liste scolaire");
      }
      
      toast.success("Liste scolaire mise à jour avec succès");
      router.push(`/manager/dashboard/listes-scolaires/${id}/details`);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de mettre à jour la liste scolaire");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
          <p className="mt-4 text-gray-500">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="flex items-center text-gray-600 hover:text-gray-900"
          onClick={() => router.push(`/manager/dashboard/listes-scolaires/${id}/details`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux détails
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Modifier la Liste Scolaire</CardTitle>
          <CardDescription>
            Modifiez les informations et les produits de cette liste scolaire
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Informations de base */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informations générales</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="titre">Titre de la liste <span className="text-red-500">*</span></Label>
                  <Input
                    id="titre"
                    name="titre"
                    placeholder="Ex: Fournitures 6ème année"
                    value={formData.titre}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="classe">Classe <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.classe} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, classe: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une classe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1ère année">1ère année</SelectItem>
                      <SelectItem value="2ème année">2ème année</SelectItem>
                      <SelectItem value="3ème année">3ème année</SelectItem>
                      <SelectItem value="4ème année">4ème année</SelectItem>
                      <SelectItem value="5ème année">5ème année</SelectItem>
                      <SelectItem value="6ème année">6ème année</SelectItem>
                      <SelectItem value="Collège - 7ème">Collège - 7ème</SelectItem>
                      <SelectItem value="Collège - 8ème">Collège - 8ème</SelectItem>
                      <SelectItem value="Collège - 9ème">Collège - 9ème</SelectItem>
                      <SelectItem value="Lycée - 1ère">Lycée - 1ère</SelectItem>
                      <SelectItem value="Lycée - 2ème">Lycée - 2ème</SelectItem>
                      <SelectItem value="Lycée - 3ème">Lycée - 3ème</SelectItem>
                      <SelectItem value="Lycée - Terminale">Lycée - Terminale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Description de la liste de fournitures..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
            </div>
            
            {/* Liste des besoins */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Produits requis</h3>
                <Button 
                  type="button" 
                  onClick={addBesoin}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un produit
                </Button>
              </div>
              
              <div className="space-y-4">
                {formData.besoins.map((besoin, index) => (
                  <Card key={index} className="border border-gray-200">
                    <CardContent className="pt-6">
                      <div className="grid gap-4 md:grid-cols-12">
                        <div className="md:col-span-6 space-y-2">
                          <Label htmlFor={`produit-${index}`}>Nom du produit <span className="text-red-500">*</span></Label>
                          <Input
                            id={`produit-${index}`}
                            placeholder="Ex: Cahier grand format"
                            value={besoin.nomProduit}
                            onChange={(e) => handleBesoinChange(index, "nomProduit", e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="md:col-span-2 space-y-2">
                          <Label htmlFor={`quantite-${index}`}>Quantité</Label>
                          <Input
                            id={`quantite-${index}`}
                            type="number"
                            min="1"
                            value={besoin.quantite}
                            onChange={(e) => handleBesoinChange(index, "quantite", parseInt(e.target.value))}
                          />
                        </div>
                        
                        <div className="md:col-span-3 space-y-2">
                          <Label htmlFor={`details-${index}`}>Détails</Label>
                          <Input
                            id={`details-${index}`}
                            placeholder="Ex: Grands carreaux"
                            value={besoin.details}
                            onChange={(e) => handleBesoinChange(index, "details", e.target.value)}
                          />
                        </div>
                        
                        <div className="md:col-span-1 flex items-end justify-center">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeBesoin(index)}
                            className="h-10 w-10"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t p-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/manager/dashboard/listes-scolaires/${id}/details`)}
            >
              Annuler
            </Button>
            
            <Button 
              type="submit" 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">◌</span>
                  Mise à jour en cours...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
