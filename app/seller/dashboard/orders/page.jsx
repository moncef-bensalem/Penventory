'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ShoppingBag,
  Search,
  Calendar,
  Package,
  ArrowUpDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

const statusColors = {
  'EN_ATTENTE': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'CONFIRMEE': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'EN_PREPARATION': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'EXPEDIEE': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'LIVREE': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'ANNULEE': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

export default function SellerOrders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, searchQuery, statusFilter, sortOrder]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sortOrder,
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'ALL' && { status: statusFilter })
      });

      const response = await fetch(`/api/seller/orders?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', data);
        throw new Error(data.error || 'Erreur lors de la récupération des commandes');
      }

      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error details:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!orderId) {
      toast.error("ID de commande invalide");
      return;
    }
    
    try {
      setLoading(true);
      console.log(`Mise à jour du statut de la commande ${orderId} à ${newStatus}`);
      
      const response = await fetch(`/api/seller/orders`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          orderId, 
          status: newStatus 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Erreur de mise à jour:', data);
        throw new Error(data.error || 'Erreur lors de la mise à jour du statut');
      }

      toast.success('Statut de la commande mis à jour avec succès');
      
      // Mettre à jour l'état local pour éviter de recharger toutes les commandes
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Erreur détaillée:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du statut');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Commandes</h2>
        <p className="text-muted-foreground">
          Gérez vos commandes et leur statut
        </p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Rechercher une commande..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-80"
              />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les statuts</SelectItem>
                <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                <SelectItem value="CONFIRMEE">Confirmée</SelectItem>
                <SelectItem value="EN_PREPARATION">En préparation</SelectItem>
                <SelectItem value="EXPEDIEE">Expédiée</SelectItem>
                <SelectItem value="LIVREE">Livrée</SelectItem>
                <SelectItem value="ANNULEE">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Date
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-6 relative">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <ShoppingBag className="h-10 w-10 mb-2" />
                      <p>Aucune commande trouvée</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono">#{order.number}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(order.createdAt), 'PPP', { locale: fr })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.customer?.name || "Client inconnu"}
                      {order.customer?.role && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({order.customer.role})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{order.total.toFixed(2)} DT</TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status]}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleUpdateStatus(order.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                          <SelectItem value="CONFIRMEE">Confirmée</SelectItem>
                          <SelectItem value="EN_PREPARATION">En préparation</SelectItem>
                          <SelectItem value="EXPEDIEE">Expédiée</SelectItem>
                          <SelectItem value="LIVREE">Livrée</SelectItem>
                          <SelectItem value="ANNULEE">Annulée</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
