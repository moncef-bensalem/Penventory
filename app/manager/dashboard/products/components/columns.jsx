"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Pencil, 
  CheckSquare, 
  XSquare
} from "lucide-react";

// Factory function to create columns with action handlers
export function createColumns({ onApprove, onReject, onViewDetails, onEdit }) {
  return [
    {
      accessorKey: "name",
      header: "Produit",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "price",
      header: "Prix",
      cell: ({ row }) => `${row.original.price.toLocaleString()} TND`,
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const stock = row.original.stock;
        if (stock === 0) {
          return <Badge variant="destructive">Épuisé</Badge>;
        } else if (stock <= 10) {
          return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Faible ({stock})</Badge>;
        } else {
          return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">En stock ({stock})</Badge>;
        }
      },
    },
    {
      accessorKey: "category",
      header: "Catégorie",
      cell: ({ row }) => row.original.category,
    },
    {
      accessorKey: "seller.name",
      header: "Vendeur",
      cell: ({ row }) => row.original.seller.name,
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.original.status;
        if (status === 'APPROVED') {
          return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Approuvé</Badge>;
        } else if (status === 'REJECTED') {
          return <Badge variant="destructive">Rejeté</Badge>;
        } else {
          return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">En attente</Badge>;
        }
      },
    },
    {
      accessorKey: "rating",
      header: "Évaluation",
      cell: ({ row }) => row.original.rating,
    },
    {
      accessorKey: "createdAt",
      header: "Date d'ajout",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('fr-FR'),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center space-x-2">
            {product.status === 'PENDING' && (
              <>
                <Button
                  onClick={() => onApprove?.(product.id)}
                  variant="ghost"
                  size="icon"
                  className="text-green-500 hover:text-green-700"
                >
                  <CheckSquare className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => onReject?.(product.id)}
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                >
                  <XSquare className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-500 hover:text-blue-700"
              onClick={() => onViewDetails?.(product.id)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-orange-500 hover:text-orange-700"
              onClick={() => onEdit?.(product.id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
} 