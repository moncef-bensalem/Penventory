'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  DollarSign,
  ShoppingBag,
  ArrowUpDown,
  UserPlus
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function CustomersPage() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalRevenue: 0,
    newCustomers: 0,
    averageRevenuePerCustomer: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [pagination.page, search, sortField, sortOrder]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sortField,
        sortOrder
      });

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/seller/customers?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des clients');
      }

      const data = await response.json();
      setCustomers(data.customers);
      setPagination(data.pagination);
      setStats(data.stats);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (customerId) => {
    try {
      const response = await fetch('/api/seller/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des détails du client');
      }

      const data = await response.json();
      setSelectedCustomer(data);
      setCustomerDialogOpen(true);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement des détails du client');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchCustomers();
  };

  const handleSort = (field) => {
    const newSortOrder = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newSortOrder);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'PP', { locale: fr });
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
        <p className="text-muted-foreground">
          Gérez vos clients et consultez leurs historiques d'achats
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total clients
              </p>
              <h3 className="text-2xl font-bold mt-2">
                {stats.totalCustomers}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Nouveaux clients (30j)
              </p>
              <h3 className="text-2xl font-bold mt-2">
                {stats.newCustomers}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
              <UserPlus className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Revenu total
              </p>
              <h3 className="text-2xl font-bold mt-2">
                {stats.totalRevenue.toFixed(2)} DT
              </h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Panier moyen
              </p>
              <h3 className="text-2xl font-bold mt-2">
                {stats.averageRevenuePerCustomer.toFixed(2)} DT
              </h3>
            </div>
            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/20">
              <ShoppingBag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <form onSubmit={handleSearch} className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </form>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('totalOrders')}
                      className="flex items-center gap-1 font-medium"
                    >
                      Commandes
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('totalSpent')}
                      className="flex items-center gap-1 font-medium"
                    >
                      Dépenses
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('createdAt')}
                      className="flex items-center gap-1 font-medium"
                    >
                      Dernière commande
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Users className="h-10 w-10 mb-2" />
                        <p>Aucun client trouvé</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={customer.image} alt={customer.name} />
                            <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{customer.name}</p>
                              {customer.role && (
                                <Badge variant="outline" className="text-xs">
                                  {customer.role}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{customer.totalOrders}</TableCell>
                      <TableCell>{customer.totalSpent.toFixed(2)} DT</TableCell>
                      <TableCell>
                        {customer.lastOrderDate 
                          ? formatDate(customer.lastOrderDate)
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => fetchCustomerDetails(customer.id)}
                        >
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Affichage de {(pagination.page - 1) * pagination.limit + 1} à{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} sur{' '}
                {pagination.total} clients
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Dialogue de détails du client */}
      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Détails du client</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedCustomer.image} alt={selectedCustomer.name} />
                  <AvatarFallback>{getInitials(selectedCustomer.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedCustomer.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <p>{selectedCustomer.email}</p>
                    {selectedCustomer.phone && (
                      <>
                        <span>•</span>
                        <p>{selectedCustomer.phone}</p>
                      </>
                    )}
                    {selectedCustomer.role && (
                      <>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {selectedCustomer.role}
                        </Badge>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Client depuis {formatDate(selectedCustomer.createdAt)}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <Card className="p-4">
                  <p className="text-sm font-medium text-muted-foreground">Commandes</p>
                  <p className="text-xl font-bold mt-1">{selectedCustomer.stats.totalOrders}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm font-medium text-muted-foreground">Dépenses totales</p>
                  <p className="text-xl font-bold mt-1">{selectedCustomer.stats.totalSpent.toFixed(2)} DT</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm font-medium text-muted-foreground">Panier moyen</p>
                  <p className="text-xl font-bold mt-1">{selectedCustomer.stats.averageOrderValue.toFixed(2)} DT</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm font-medium text-muted-foreground">Dernière commande</p>
                  <p className="text-xl font-bold mt-1">
                    {selectedCustomer.stats.lastOrder 
                      ? formatDate(selectedCustomer.stats.lastOrder.createdAt)
                      : 'N/A'}
                  </p>
                </Card>
              </div>

              <Tabs defaultValue="orders">
                <TabsList className="mb-4">
                  <TabsTrigger value="orders">Commandes</TabsTrigger>
                  <TabsTrigger value="favorites">Produits favoris</TabsTrigger>
                </TabsList>

                <TabsContent value="orders" className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>N° Commande</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Articles</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedCustomer.orders.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-6">
                              <p className="text-muted-foreground">Aucune commande</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          selectedCustomer.orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell>#{order.number || order.id.substring(0, 8)}</TableCell>
                              <TableCell>{formatDate(order.createdAt)}</TableCell>
                              <TableCell>
                                <Badge variant={
                                  order.status === 'COMPLETED' ? 'default' :
                                  order.status === 'PENDING' ? 'outline' :
                                  order.status === 'CANCELLED' ? 'destructive' :
                                  'secondary'
                                }>
                                  {order.status.toLowerCase().replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>{order.total.toFixed(2)} DT</TableCell>
                              <TableCell>{order.items.length} articles</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="favorites" className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produit</TableHead>
                          <TableHead>Quantité achetée</TableHead>
                          <TableHead>Montant total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedCustomer.stats.favoriteProducts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-6">
                              <p className="text-muted-foreground">Aucun produit favori</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          selectedCustomer.stats.favoriteProducts.map((product, index) => (
                            <TableRow key={index}>
                              <TableCell>{product.name}</TableCell>
                              <TableCell>{product.quantity}</TableCell>
                              <TableCell>{product.total.toFixed(2)} DT</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
