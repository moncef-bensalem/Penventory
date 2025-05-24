'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Search,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

export default function MyTicketsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/account/tickets');
      } else {
        fetchTickets();
      }
    }
  }, [user, authLoading, router]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/tickets');
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des tickets');
      }
      
      const data = await response.json();
      setTickets(data);
      
    } catch (error) {
      console.error('Erreur lors de la récupération des tickets:', error);
      toast.error('Impossible de charger vos tickets');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'OPEN': return 'Ouvert';
      case 'PENDING': return 'En attente';
      case 'RESOLVED': return 'Résolu';
      case 'CLOSED': return 'Fermé';
      default: return status;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OPEN': return <MessageSquare className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'RESOLVED': return <CheckCircle className="h-4 w-4" />;
      case 'CLOSED': return <XCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    let matchesStatus = true;
    let matchesSearch = true;
    
    if (statusFilter) {
      matchesStatus = ticket.status === statusFilter;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matchesSearch = 
        ticket.subject.toLowerCase().includes(query) || 
        ticket.id.toLowerCase().includes(query) ||
        (ticket.orderNumber && ticket.orderNumber.toLowerCase().includes(query));
    }
    
    return matchesStatus && matchesSearch;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Connexion requise</h1>
            <p className="mb-6">Veuillez vous connecter pour accéder à vos tickets de support.</p>
            <Link 
              href="/login?redirect=/account/tickets" 
              className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Mes tickets de support</h1>
          <Link 
            href="/contact" 
            className="bg-orange-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-orange-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau ticket
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher par sujet, ID ou numéro de commande..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full p-2 border rounded-md"
              />
            </div>
            <div className="w-full md:w-64">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Tous les statuts</option>
                <option value="OPEN">Ouvert</option>
                <option value="PENDING">En attente</option>
                <option value="RESOLVED">Résolu</option>
                <option value="CLOSED">Fermé</option>
              </select>
            </div>
          </div>

          {filteredTickets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left">ID</th>
                    <th className="py-3 px-4 text-left">Sujet</th>
                    <th className="py-3 px-4 text-left">Statut</th>
                    <th className="py-3 px-4 text-left">Date de création</th>
                    <th className="py-3 px-4 text-left">Dernière mise à jour</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{ticket.id.substring(0, 8)}...</td>
                      <td className="py-3 px-4">{ticket.subject}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1">{getStatusLabel(ticket.status)}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {format(new Date(ticket.createdAt), 'dd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {format(new Date(ticket.updatedAt), 'dd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="py-3 px-4">
                        <Link 
                          href={`/account/tickets/${ticket.id}`}
                          className="text-orange-600 hover:text-orange-800 font-medium"
                        >
                          Voir détails
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              {loading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <AlertTriangle className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Aucun ticket trouvé</h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery || statusFilter ? 
                      "Aucun ticket ne correspond à vos critères de recherche." : 
                      "Vous n'avez pas encore créé de ticket de support."}
                  </p>
                  <Link 
                    href="/contact" 
                    className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors"
                  >
                    Créer un nouveau ticket
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-100 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Besoin d'aide ?</h2>
          <p className="mb-4">
            Si vous avez des questions ou des problèmes, n'hésitez pas à créer un nouveau ticket de support. 
            Notre équipe vous répondra dans les plus brefs délais.
          </p>
          <div className="flex space-x-4">
            <Link 
              href="/contact" 
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
            >
              Contacter le support
            </Link>
            <Link 
              href="/help" 
              className="bg-white text-orange-600 border border-orange-600 px-4 py-2 rounded-md hover:bg-orange-50 transition-colors"
            >
              Centre d'aide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
