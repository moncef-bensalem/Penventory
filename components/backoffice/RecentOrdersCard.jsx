import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { MoreHorizontal } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function RecentOrdersCard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/dashboard');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Erreur lors de la récupération des commandes récentes');
        }
        
        const data = await response.json();
        
        if (data.recentOrders && Array.isArray(data.recentOrders)) {
          setOrders(data.recentOrders);
        }
      } catch (error) {
        console.error('Error fetching recent orders:', error);
        toast.error("Erreur lors du chargement des commandes récentes");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, []);

  // Fonction pour obtenir la couleur du badge en fonction du statut de la commande
  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-200 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100';
      case 'PROCESSING':
        return 'bg-blue-200 text-blue-800 dark:bg-blue-600 dark:text-blue-100';
      case 'SHIPPED':
        return 'bg-indigo-200 text-indigo-800 dark:bg-indigo-600 dark:text-indigo-100';
      case 'DELIVERED':
        return 'bg-green-200 text-green-800 dark:bg-green-600 dark:text-green-100';
      case 'CANCELLED':
        return 'bg-red-200 text-red-800 dark:bg-red-600 dark:text-red-100';
      default:
        return 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100';
    }
  };

  return (
    <Card className="col-span-1 md:col-span-3 rounded-lg border bg-card text-card-foreground shadow-sm w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Commandes Récentes</CardTitle>
          <CardDescription>
            {loading 
              ? 'Chargement des commandes...' 
              : orders.length > 0 
                ? `Vous avez ${orders.length} commandes récentes` 
                : 'Aucune commande récente'}
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="flex items-center justify-center h-52">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune commande récente à afficher
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={order.user?.image || ''} alt={order.user?.name || 'User'} />
                    <AvatarFallback>{(order.user?.name || 'U').substring(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {order.user?.name || 'Utilisateur anonyme'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusBadgeClass(order.status)}>
                    {order.status || 'Non défini'}
                  </Badge>
                  <div className="font-medium">
                    {order.totalPrice ? `${order.totalPrice.toFixed(2)} €` : 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">
          <Link href="/admin/dashboard/orders">Voir toutes les commandes</Link>
        </Button>
        <Button variant="outline" size="sm" disabled={loading} onClick={() => fetchRecentOrders()}>
          Actualiser
        </Button>
      </CardFooter>
    </Card>
  )
} 