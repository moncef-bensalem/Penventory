'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import PageHead from '@/components/backoffice/PageHead';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Filter, 
  RefreshCw, 
  Download, 
  Calendar,
  ArrowUpDown,
  MessageSquare,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Clock,
  MessagesSquare,
  UserCheck,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

export default function ManagerSupportPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    category: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [ticketSummary, setTicketSummary] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    pendingTickets: 0
  });

  // Récupérer les tickets
  useEffect(() => {
    if (user && user.role === 'MANAGER') {
      console.log('Manager user detected, fetching support tickets...');
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      
      // Appeler l'API pour récupérer les tickets
      const response = await fetch('/api/tickets');
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des tickets');
      }
      
      const ticketsData = await response.json();
      
      // Formater les tickets pour qu'ils correspondent à notre structure
      const formattedTickets = ticketsData.map(ticket => ({
        id: ticket.id,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        customer: {
          id: ticket.customer.id,
          name: ticket.customer.name,
          email: ticket.customer.email
        },
        assignedTo: ticket.assignedTo ? {
          id: ticket.assignedTo.id,
          name: ticket.assignedTo.name,
          email: ticket.assignedTo.email
        } : null,
        createdAt: new Date(ticket.createdAt),
        lastUpdated: new Date(ticket.updatedAt),
        messagesCount: ticket.messages.length,
        orderNumber: ticket.orderNumber
      }));
      
      setTickets(formattedTickets);
      
      // Calculer le résumé des tickets
      calculateTicketSummary(formattedTickets);
      
      // En cas d'erreur ou si aucun ticket n'est retourné, utiliser des données de démo
      if (formattedTickets.length === 0) {
        const demoTickets = generateDemoTickets();
        setTickets(demoTickets);
        calculateTicketSummary(demoTickets);
        toast.info('Aucun ticket trouvé. Affichage des données de démonstration.');
      }
      
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      toast.error('Erreur lors de la récupération des tickets de support');
      
      // En cas d'erreur, utiliser des données de démo
      const demoTickets = generateDemoTickets();
      setTickets(demoTickets);
      calculateTicketSummary(demoTickets);
    } finally {
      setLoading(false);
    }
  };
  
  // Générer des tickets de démonstration
  const generateDemoTickets = () => {
    const statuses = ['OPEN', 'PENDING', 'RESOLVED', 'CLOSED'];
    const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const categories = ['PAYMENT', 'SHIPPING', 'PRODUCT', 'ACCOUNT', 'OTHER'];
    const subjects = [
      'Problème avec ma commande', 
      'Question sur un produit', 
      'Retard de livraison', 
      'Problème de paiement', 
      'Demande de remboursement',
      'Problème avec mon compte',
      'Question sur un abonnement',
      'Produit défectueux reçu'
    ];
    
    const demoTickets = Array.from({ length: 20 }, (_, i) => {
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
      const daysAgo = Math.floor(Math.random() * 30) + 1;
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const lastUpdated = new Date(createdAt.getTime() + Math.floor(Math.random() * daysAgo) * 24 * 60 * 60 * 1000);
      
      return {
        id: `TICKET-${10000 + i}`,
        subject: randomSubject,
        description: `Ce ticket concerne ${randomSubject.toLowerCase()}. Merci de résoudre ce problème dès que possible.`,
        status: randomStatus,
        priority: randomPriority,
        category: randomCategory,
        customer: {
          id: `customer-${1000 + i}`,
          name: `Client ${1000 + i}`,
          email: `client${1000 + i}@example.com`
        },
        assignedTo: randomStatus !== 'OPEN' ? {
          id: `staff-${500 + i}`,
          name: `Support Agent ${500 + i}`,
          email: `agent${500 + i}@penventory.com`
        } : null,
        createdAt: createdAt,
        lastUpdated: lastUpdated,
        messagesCount: Math.floor(Math.random() * 10) + 1,
        formattedCreatedAt: format(createdAt, 'dd MMMM yyyy, HH:mm', { locale: fr }),
        formattedLastUpdated: format(lastUpdated, 'dd MMMM yyyy, HH:mm', { locale: fr })
      };
    });
    
    return demoTickets;
  };
  
  // Calculer le résumé des tickets
  const calculateTicketSummary = (tickets) => {
    const openTickets = tickets.filter(ticket => ticket.status === 'OPEN').length;
    const resolvedTickets = tickets.filter(ticket => ticket.status === 'RESOLVED' || ticket.status === 'CLOSED').length;
    const pendingTickets = tickets.filter(ticket => ticket.status === 'PENDING').length;
    
    setTicketSummary({
      totalTickets: tickets.length,
      openTickets,
      resolvedTickets,
      pendingTickets
    });
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      status: '',
      priority: '',
      search: '',
      dateFrom: '',
      dateTo: '',
      category: ''
    });
  };

  // Appliquer les filtres
  const applyFilters = (tickets) => {
    return tickets.filter(ticket => {
      // Filtre par statut
      if (filters.status && ticket.status !== filters.status) {
        return false;
      }
      
      // Filtre par priorité
      if (filters.priority && ticket.priority !== filters.priority) {
        return false;
      }
      
      // Filtre par catégorie
      if (filters.category && ticket.category !== filters.category) {
        return false;
      }
      
      // Filtre par recherche (ID, sujet ou client)
      if (filters.search && 
         !(ticket.id.toLowerCase().includes(filters.search.toLowerCase()) || 
           ticket.subject.toLowerCase().includes(filters.search.toLowerCase()) ||
           ticket.customer.name.toLowerCase().includes(filters.search.toLowerCase()))) {
        return false;
      }
      
      // Filtre par date de début
      if (filters.dateFrom) {
        const dateFrom = new Date(filters.dateFrom);
        const ticketDate = new Date(ticket.createdAt);
        if (ticketDate < dateFrom) {
          return false;
        }
      }
      
      // Filtre par date de fin
      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        dateTo.setHours(23, 59, 59, 999); // Fin de journée
        const ticketDate = new Date(ticket.createdAt);
        if (ticketDate > dateTo) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Exporter les tickets en CSV
  const exportToCSV = () => {
    try {
      const headers = ['ID', 'Sujet', 'Statut', 'Priorité', 'Catégorie', 'Client', 'Date de création', 'Dernière mise à jour', 'Assigné à'];
      
      // Convertir les données en format CSV
      const csvRows = [];
      csvRows.push(headers.join(','));
      
      filteredTickets.forEach(ticket => {
        const row = [
          `"${ticket.id}"`,
          `"${ticket.subject}"`,
          `"${getStatusLabel(ticket.status)}"`,
          `"${getPriorityLabel(ticket.priority)}"`,
          `"${getCategoryLabel(ticket.category)}"`,
          `"${ticket.customer.name}"`,
          `"${ticket.formattedCreatedAt}"`,
          `"${ticket.formattedLastUpdated}"`,
          `"${ticket.assignedTo ? ticket.assignedTo.name : 'Non assigné'}"`
        ];
        csvRows.push(row.join(','));
      });
      
      // Créer un blob et télécharger le fichier
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `tickets_support_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Export CSV réussi');
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error);
      toast.error('Erreur lors de l\'export CSV');
    }
  };

  // Obtenir le libellé du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'OPEN': return 'Ouvert';
      case 'PENDING': return 'En cours';
      case 'RESOLVED': return 'Résolu';
      case 'CLOSED': return 'Fermé';
      default: return status;
    }
  };

  // Obtenir la couleur du badge selon le statut
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'OPEN': return <MessageSquare className="h-4 w-4 mr-1" />;
      case 'PENDING': return <Clock className="h-4 w-4 mr-1" />;
      case 'RESOLVED': return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'CLOSED': return <XCircle className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  // Obtenir le libellé de la priorité
  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'LOW': return 'Basse';
      case 'MEDIUM': return 'Moyenne';
      case 'HIGH': return 'Haute';
      case 'URGENT': return 'Urgente';
      default: return priority;
    }
  };

  // Obtenir la couleur du badge selon la priorité
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtenir le libellé de la catégorie
  const getCategoryLabel = (category) => {
    switch (category) {
      case 'PAYMENT': return 'Paiement';
      case 'SHIPPING': return 'Livraison';
      case 'PRODUCT': return 'Produit';
      case 'ACCOUNT': return 'Compte';
      case 'OTHER': return 'Autre';
      default: return category;
    }
  };

  const columns = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs">{row.original.id}</div>
      ),
    },
    {
      accessorKey: "subject",
      header: ({ column }) => (
        <div className="flex items-center">
          Sujet
          <ArrowUpDown 
            className="ml-2 h-4 w-4 cursor-pointer" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="font-medium max-w-[200px] truncate" title={row.original.subject}>
          {row.original.subject}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge className={getStatusBadgeClass(status)}>
            <div className="flex items-center">
              {getStatusIcon(status)}
              {getStatusLabel(status)}
            </div>
          </Badge>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Priorité",
      cell: ({ row }) => {
        const priority = row.original.priority;
        return (
          <Badge className={getPriorityBadgeClass(priority)}>
            {getPriorityLabel(priority)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Catégorie",
      cell: ({ row }) => (
        <div>{getCategoryLabel(row.original.category)}</div>
      ),
    },
    {
      accessorKey: "customer.name",
      header: "Client",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>{row.original.customer.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "formattedCreatedAt",
      header: ({ column }) => (
        <div className="flex items-center">
          Date de création
          <ArrowUpDown 
            className="ml-2 h-4 w-4 cursor-pointer" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
    },
    {
      accessorKey: "messagesCount",
      header: "Messages",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MessagesSquare className="h-4 w-4" />
          <span>{row.original.messagesCount}</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const ticket = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link href={`/manager/dashboard/support/${row.original.id}`}>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center"
              >
                <Eye className="h-4 w-4 mr-1" />
                Voir détails
              </Button>
            </Link>
          </div>
        );
      },
    },
  ];

  const filteredTickets = applyFilters(tickets);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'MANAGER') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Accès restreint
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Cette page est réservée aux managers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <PageHead 
        title="Support client" 
        description="Gestion des tickets de support client" 
        icon={<MessagesSquare className="h-6 w-6" />}
      />
      
      <div className="space-y-6">
        {/* Résumé des tickets */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold mb-1">{ticketSummary.totalTickets}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total des tickets</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold mb-1 text-blue-500">{ticketSummary.openTickets}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Tickets ouverts</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold mb-1 text-yellow-500">{ticketSummary.pendingTickets}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Tickets en attente</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold mb-1 text-green-500">{ticketSummary.resolvedTickets}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Tickets résolus</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Actions */}
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={fetchTickets}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            onClick={exportToCSV}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter en CSV
          </Button>
        </div>
        
        {/* Filtres */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Statut
                </label>
                <select
                  id="status"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Tous les statuts</option>
                  <option value="OPEN">Ouvert</option>
                  <option value="PENDING">En attente</option>
                  <option value="RESOLVED">Résolu</option>
                  <option value="CLOSED">Fermé</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priorité
                </label>
                <select
                  id="priority"
                  value={filters.priority}
                  onChange={(e) => setFilters({...filters, priority: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Toutes les priorités</option>
                  <option value="LOW">Basse</option>
                  <option value="MEDIUM">Moyenne</option>
                  <option value="HIGH">Haute</option>
                  <option value="URGENT">Urgente</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catégorie
                </label>
                <select
                  id="category"
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Toutes les catégories</option>
                  <option value="PAYMENT">Paiement</option>
                  <option value="SHIPPING">Livraison</option>
                  <option value="PRODUCT">Produit</option>
                  <option value="ACCOUNT">Compte</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recherche
                </label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    id="search"
                    type="text"
                    placeholder="ID, sujet, client..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="pl-8 w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date depuis
                </label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                    className="pl-8 w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date jusqu'à
                </label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                    className="pl-8 w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div className="md:col-span-4 flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  className="flex items-center"
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <DataTable 
            columns={columns} 
            data={filteredTickets}
            searchKey="subject"
          />
        </div>
      </div>
    </div>
  );
}