'use client';

import { MoreHorizontal, Pen, Trash, CheckCircle, XCircle, Eye, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const columns = ({ onApprove, onDelete }) => [
  {
    accessorKey: 'name',
    header: 'Produit',
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[0]} 
                alt={product.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500">
                <AlertTriangle size={16} />
              </div>
            )}
          </div>
          <div>
            <div className="font-medium">{product.name}</div>
            <div className="text-sm text-gray-500">ID: {product.id.substring(0, 8)}...</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'price',
    header: 'Prix',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'));
      const formatted = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'TND',
      }).format(price);

      return <div>{formatted.replace('TND', 'DT')}</div>;
    },
  },
  {
    accessorKey: 'categoryName',
    header: 'Catégorie',
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="font-normal">
          {row.getValue('categoryName')}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
    cell: ({ row }) => {
      const stock = parseInt(row.getValue('stock'));
      return (
        <Badge 
          variant={stock > 0 ? "outline" : "destructive"} 
          className={stock > 0 ? "bg-green-50 text-green-700 border-green-200" : ""}
        >
          {stock > 0 ? `${stock} unités` : 'Épuisé'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'storeName',
    header: 'Magasin',
    cell: ({ row }) => {
      return <div>{row.getValue('storeName')}</div>;
    },
  },
  {
    accessorKey: 'sellerName',
    header: 'Vendeur',
    cell: ({ row }) => {
      return <div>{row.getValue('sellerName')}</div>;
    },
  },
  {
    accessorKey: 'approved',
    header: 'Statut',
    cell: ({ row }) => {
      const isApproved = row.getValue('approved');
      return (
        <Badge 
          variant={isApproved ? "outline" : "secondary"}
          className={isApproved 
            ? "bg-green-50 text-green-700 border-green-200" 
            : "bg-orange-50 text-orange-700 border-orange-200"}
        >
          <div className="flex items-center space-x-1">
            {isApproved ? (
              <>
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                <span>Approuvé</span>
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5 mr-1" />
                <span>En attente</span>
              </>
            )}
          </div>
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Date d\'ajout',
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return <div>{format(date, 'dd MMM yyyy', { locale: fr })}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const product = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => window.open(`/dashboard/catalogue/products/${product.id}`, '_blank')}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              Voir le produit
            </DropdownMenuItem>
            {!product.approved && (
              <DropdownMenuItem 
                onClick={() => onApprove(product.id, true)}
                className="cursor-pointer"
              >
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Approuver
              </DropdownMenuItem>
            )}
            {product.approved && (
              <DropdownMenuItem 
                onClick={() => onApprove(product.id, false)}
                className="cursor-pointer"
              >
                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                Rejeter
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => onDelete(product.id)}
              className="cursor-pointer"
            >
              <Trash className="mr-2 h-4 w-4 text-red-500" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
