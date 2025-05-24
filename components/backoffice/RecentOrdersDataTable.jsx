'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { RefreshCcw, Eye } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import LoadingSpinner from '../ui/loading-spinner';

export default function RecentOrdersDataTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/dashboard/recent-orders?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des commandes');
      }
      
      const data = await response.json();
      setOrders(data.data || []);
      setTotalItems(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.page || 1);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const handleRefresh = () => {
    fetchOrders(currentPage);
    toast.success('Données rafraîchies');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: 'En attente', className: 'bg-yellow-500 hover:bg-yellow-600' },
      EN_ATTENTE: { label: 'En attente', className: 'bg-yellow-500 hover:bg-yellow-600' },
      PROCESSING: { label: 'En traitement', className: 'bg-blue-500 hover:bg-blue-600' },
      EN_PREPARATION: { label: 'En préparation', className: 'bg-blue-500 hover:bg-blue-600' },
      SHIPPED: { label: 'Expédiée', className: 'bg-indigo-500 hover:bg-indigo-600' },
      EXPEDIEE: { label: 'Expédiée', className: 'bg-indigo-500 hover:bg-indigo-600' },
      DELIVERED: { label: 'Livrée', className: 'bg-green-500 hover:bg-green-600' },
      LIVREE: { label: 'Livrée', className: 'bg-green-500 hover:bg-green-600' },
      CANCELLED: { label: 'Annulée', className: 'bg-red-500 hover:bg-red-600' },
      ANNULEE: { label: 'Annulée', className: 'bg-red-500 hover:bg-red-600' }
    };

    const defaultStatus = { label: status, className: 'bg-gray-500 hover:bg-gray-600' };
    const statusConfig = statusMap[status] || defaultStatus;

    return (
      <Badge className={statusConfig.className}>
        {statusConfig.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusMap = {
      PAID: { label: 'Payée', className: 'bg-green-500 hover:bg-green-600' },
      PENDING: { label: 'En attente', className: 'bg-yellow-500 hover:bg-yellow-600' },
      FAILED: { label: 'Échouée', className: 'bg-red-500 hover:bg-red-600' },
      REFUNDED: { label: 'Remboursée', className: 'bg-purple-500 hover:bg-purple-600' }
    };

    const defaultStatus = { label: status, className: 'bg-gray-500 hover:bg-gray-600' };
    const statusConfig = statusMap[status] || defaultStatus;

    return (
      <Badge className={statusConfig.className}>
        {statusConfig.label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Commandes récentes</CardTitle>
          <CardDescription>Suivez les dernières commandes de la plateforme</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={handleRefresh}>
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Paiement</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.number}</TableCell>
                        <TableCell>{formatDate(order.date)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{order.customer_name}</span>
                            <span className="text-xs text-muted-foreground">{order.customer_email}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(order.total)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Link href={`/dashboard/orders/${order.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Aucune commande trouvée
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Affichage de {Math.min((currentPage - 1) * limit + 1, totalItems)} à {Math.min(currentPage * limit, totalItems)} sur {totalItems} commandes
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Précédent
                  </Button>
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <Button
                      key={index}
                      variant={currentPage === index + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/dashboard/orders">
            Voir toutes les commandes
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 