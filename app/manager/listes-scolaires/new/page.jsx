"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, ArrowLeft, X } from "lucide-react";

export default function CreateListePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    classe: "",
    besoins: [{ nomProduit: "", quantite: 1, details: "" }]
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.titre || formData.titre.length < 3) {
      newErrors.titre = "Le titre doit contenir au moins 3 caractères";
    }
    
    if (!formData.classe) {
      newErrors.classe = "La classe est requise";
    }
    
    // Vérifier chaque besoin
    const besoinErrors = [];
    formData.besoins.forEach((besoin, index) => {
      const besoinError = {};
      if (!besoin.nomProduit || besoin.nomProduit.length < 3) {
        besoinError.nomProduit = "Le nom du produit doit contenir au moins 3 caractères";
      }
      if (!besoin.quantite || besoin.quantite < 1) {
        besoinError.quantite = "La quantité doit être au moins de 1";
      }
      if (Object.keys(besoinError).length > 0) {
        besoinErrors[index] = besoinError;
      }
    });
    
    if (besoinErrors.length > 0) {
      newErrors.besoins = besoinErrors;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleBesoinChange = (index, field, value) => {
    const newBesoins = [...formData.besoins];
    newBesoins[index][field] = field === 'quantite' ? parseInt(value) : value;
    setFormData({
      ...formData,
      besoins: newBesoins
    });
  };

  const addBesoin = () => {
    setFormData({
      ...formData,
      besoins: [...formData.besoins, { nomProduit: "", quantite: 1, details: "" }]
    });
  };

  const removeBesoin = (index) => {
    if (formData.besoins.length > 1) {
      const newBesoins = formData.besoins.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        besoins: newBesoins
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/manager/listes-scolaires", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la liste scolaire");
      }

      const data = await response.json();
      alert("Liste scolaire créée avec succès");

      // Redirection vers la page de détail
      router.push(`/manager/listes-scolaires/${data.id}/details`);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Impossible de créer la liste scolaire");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <button
        className="mb-6 px-4 py-2 border rounded flex items-center"
        onClick={() => router.push("/manager/listes-scolaires")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux listes
      </button>

      <div className="border rounded shadow bg-white p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Créer une nouvelle liste scolaire</h1>
          <p className="text-gray-500">
            Remplissez les informations ci-dessous pour créer une nouvelle liste scolaire
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="titre">
                Titre
              </label>
              <input
                id="titre"
                name="titre"
                type="text"
                className={`w-full p-2 border rounded ${errors.titre ? "border-red-500" : ""}`}
                placeholder="Liste de fournitures CM1"
                value={formData.titre}
                onChange={handleInputChange}
              />
              {errors.titre && (
                <p className="text-red-500 text-sm mt-1">{errors.titre}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                Donnez un titre clair à votre liste scolaire
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="classe">
                Classe
              </label>
              <input
                id="classe"
                name="classe"
                type="text"
                className={`w-full p-2 border rounded ${errors.classe ? "border-red-500" : ""}`}
                placeholder="CM1, 6ème, 3ème, etc."
                value={formData.classe}
                onChange={handleInputChange}
              />
              {errors.classe && (
                <p className="text-red-500 text-sm mt-1">{errors.classe}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                Indiquez la classe pour laquelle cette liste est destinée
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="description">
                Description (optionnelle)
              </label>
              <textarea
                id="description"
                name="description"
                className="w-full p-2 border rounded resize-none h-24"
                placeholder="Décrivez cette liste scolaire..."
                value={formData.description}
                onChange={handleInputChange}
              />
              <p className="text-gray-500 text-sm mt-1">
                Ajoutez des détails supplémentaires sur cette liste
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                Besoins (produits nécessaires)
              </h3>
              <button
                type="button"
                className="px-3 py-1 bg-blue-600 text-white rounded flex items-center"
                onClick={addBesoin}
              >
                <Plus className="mr-2 h-4 w-4" /> Ajouter un produit
              </button>
            </div>

            {formData.besoins.map((besoin, index) => (
              <div key={index} className="mb-4 p-4 border rounded shadow">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Produit #{index + 1}</h4>
                  {formData.besoins.length > 1 && (
                    <button
                      type="button"
                      className="p-1 rounded-full hover:bg-gray-200"
                      onClick={() => removeBesoin(index)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nom du produit
                    </label>
                    <input
                      type="text"
                      className={`w-full p-2 border rounded ${
                        errors.besoins && errors.besoins[index]?.nomProduit ? "border-red-500" : ""
                      }`}
                      placeholder="Cahier grand format"
                      value={besoin.nomProduit}
                      onChange={(e) =>
                        handleBesoinChange(index, "nomProduit", e.target.value)
                      }
                    />
                    {errors.besoins && errors.besoins[index]?.nomProduit && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.besoins[index].nomProduit}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Quantité
                    </label>
                    <input
                      type="number"
                      min="1"
                      className={`w-full p-2 border rounded ${
                        errors.besoins && errors.besoins[index]?.quantite ? "border-red-500" : ""
                      }`}
                      value={besoin.quantite}
                      onChange={(e) =>
                        handleBesoinChange(index, "quantite", e.target.value)
                      }
                    />
                    {errors.besoins && errors.besoins[index]?.quantite && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.besoins[index].quantite}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Détails (optionnel)
                    </label>
                    <textarea
                      className="w-full p-2 border rounded resize-none h-24"
                      placeholder="92 pages, grands carreaux, couverture plastifiée..."
                      value={besoin.details}
                      onChange={(e) =>
                        handleBesoinChange(index, "details", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="px-4 py-2 border rounded mr-2"
              onClick={() => router.push("/manager/listes-scolaires")}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                "Créer la liste scolaire"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 