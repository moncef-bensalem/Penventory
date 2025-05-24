"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Pencil, Trash2, FilePlus } from "lucide-react";

export default function DetailsListePage({ params }) {
  const { id } = params;
  const router = useRouter();
  const [liste, setListe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchListe = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/manager/listes-scolaires/${id}`);
        if (!res.ok) {
          throw new Error("Erreur lors de la récupération des détails");
        }
        const data = await res.json();
        setListe(data);
      } catch (error) {
        console.error("Erreur:", error);
        alert("Impossible de charger les détails de la liste scolaire");
      } finally {
        setIsLoading(false);
      }
    };

    fetchListe();
  }, [id]);

  const handleEdit = () => {
    router.push(`/manager/listes-scolaires/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette liste scolaire ?")) {
      return;
    }
    
    try {
      const res = await fetch(`/api/manager/listes-scolaires/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      alert("Liste scolaire supprimée avec succès");
      router.push("/manager/listes-scolaires");
    } catch (error) {
      console.error("Erreur:", error);
      alert("Impossible de supprimer la liste scolaire");
    }
  };

  const handleGenererPDF = () => {
    alert("La génération de PDF sera disponible prochainement");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!liste) {
    return (
      <div className="container mx-auto py-6">
        <div className="border rounded shadow p-8 bg-white">
          <div className="text-center">
            <p className="text-gray-500 mb-4">
              Liste scolaire non trouvée
            </p>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => router.push("/manager/listes-scolaires")}
            >
              Retour aux listes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <button
          className="px-4 py-2 border rounded flex items-center"
          onClick={() => router.push("/manager/listes-scolaires")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux listes
        </button>
        <div className="flex space-x-2">
          <button 
            className="px-4 py-2 border rounded flex items-center"
            onClick={handleGenererPDF}
          >
            <FilePlus className="mr-2 h-4 w-4" /> Générer PDF
          </button>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded flex items-center"
            onClick={handleEdit}
          >
            <Pencil className="mr-2 h-4 w-4" /> Modifier
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded flex items-center"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
          </button>
        </div>
      </div>

      <div className="border rounded shadow bg-white p-6 mb-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{liste.titre}</h1>
          <p className="text-gray-500">
            Classe: <span className="font-medium">{liste.classe}</span> • Créée le{" "}
            {new Date(liste.createdAt).toLocaleDateString("fr-FR")}
          </p>
        </div>

        {liste.description ? (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-1">Description:</h3>
            <p className="text-gray-600">{liste.description}</p>
          </div>
        ) : null}

        <hr className="my-4" />

        <div>
          <h3 className="text-lg font-medium mb-4">
            Produits nécessaires ({liste.besoins.length})
          </h3>

          {liste.besoins.length === 0 ? (
            <p className="text-gray-500">
              Aucun produit dans cette liste
            </p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Nom du produit</th>
                  <th className="text-left p-2">Quantité</th>
                  <th className="text-left p-2">Détails</th>
                </tr>
              </thead>
              <tbody>
                {liste.besoins.map((besoin) => (
                  <tr key={besoin.id} className="border-b">
                    <td className="p-2 font-medium">
                      {besoin.nomProduit}
                    </td>
                    <td className="p-2">{besoin.quantite}</td>
                    <td className="p-2">
                      {besoin.details || <span className="text-gray-400 italic">Non spécifié</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
