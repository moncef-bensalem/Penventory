'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

export default function TicketDetailPage({ params }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push(`/login?redirect=/account/tickets/${id}`);
      } else {
        fetchTicketDetails();
      }
    }
  }, [user, authLoading, id, router]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      
      // Récupérer les détails du ticket via l'API
      const response = await fetch(`/api/tickets/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Ticket non trouvé');
          router.push('/account/tickets');
          return;
        }
        throw new Error('Erreur lors de la récupération des détails du ticket');
      }
      
      const ticketData = await response.json();
      
      // Vérifier si le ticket appartient à l'utilisateur connecté
      if (ticketData.customer.id !== user.id) {
        toast.error('Vous n\'avez pas accès à ce ticket');
        router.push('/account/tickets');
        return;
      }
      
      setTicket(ticketData);
      setMessages(ticketData.messages);
      
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du ticket:', error);
      toast.error('Impossible de charger les détails du ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      // Préparer les données du message
      const messageData = {
        content: newMessage,
        attachments: []
      };
      
      // Envoyer le message via l'API
      const response = await fetch(`/api/tickets/${id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'envoi du message');
      }
      
      const newMessageData = await response.json();
      
      // Actualiser les données du ticket
      fetchTicketDetails();
      
      // Réinitialiser le champ de message
      setNewMessage('');
      
      toast.success('Message envoyé avec succès');
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setIsSubmitting(false);
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

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'LOW': return 'Basse';
      case 'MEDIUM': return 'Moyenne';
      case 'HIGH': return 'Haute';
      case 'URGENT': return 'Urgente';
      default: return priority;
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'URGENT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
              href={`/login?redirect=/account/tickets/${id}`}
              className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <AlertTriangle className="h-8 w-8 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Ticket non trouvé</h1>
            <p className="mb-6">Le ticket demandé n'existe pas ou vous n'y avez pas accès.</p>
            <Link 
              href="/account/tickets"
              className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors"
            >
              Retour à mes tickets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <Link 
            href="/account/tickets" 
            className="inline-flex items-center text-orange-600 hover:text-orange-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à mes tickets
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold">{ticket.subject}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-sm text-gray-500">Ticket #{ticket.id.substring(0, 8)}...</span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">
                  Créé le {format(new Date(ticket.createdAt), 'dd MMMM yyyy', { locale: fr })}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(ticket.status)}`}>
                {getStatusIcon(ticket.status)}
                <span className="ml-1">{getStatusLabel(ticket.status)}</span>
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityBadgeClass(ticket.priority)}`}>
                Priorité: {getPriorityLabel(ticket.priority)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <div className="bg-gray-50 rounded-lg p-4">
                <h2 className="font-medium mb-4">Informations</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Catégorie</p>
                    <p className="font-medium">{getCategoryLabel(ticket.category)}</p>
                  </div>
                  {ticket.orderNumber && (
                    <div>
                      <p className="text-sm text-gray-500">N° de commande</p>
                      <p className="font-medium">{ticket.orderNumber}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Statut</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(ticket.status)}`}>
                      {getStatusIcon(ticket.status)}
                      <span className="ml-1">{getStatusLabel(ticket.status)}</span>
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dernière mise à jour</p>
                    <p className="font-medium">
                      {format(new Date(ticket.updatedAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.sender.role === 'MANAGER' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div 
                      className={`max-w-3/4 rounded-lg p-4 ${
                        message.sender.role === 'MANAGER' 
                          ? 'bg-gray-50 border border-gray-100' 
                          : 'bg-orange-50 border border-orange-100'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <div className="relative h-8 w-8 rounded-full overflow-hidden mr-2">
                          <Image 
                            src={message.sender.image || 
                                 (message.sender.role === 'MANAGER' ? 
                                  'https://randomuser.me/api/portraits/women/68.jpg' : 
                                  user.image || 'https://randomuser.me/api/portraits/men/32.jpg')} 
                            alt={message.sender.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">
                            {message.sender.name}
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                              message.sender.role === 'MANAGER' 
                                ? 'bg-orange-100 text-orange-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {message.sender.role === 'MANAGER' ? 'Support' : 'Vous'}
                            </span>
                          </h3>
                          <p className="text-xs text-gray-500">
                            {format(new Date(message.createdAt), 'dd MMM yyyy à HH:mm', { locale: fr })}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 whitespace-pre-wrap">{message.content}</div>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <h4 className="text-sm font-medium mb-2">Pièces jointes:</h4>
                          <div className="flex flex-wrap gap-2">
                            {message.attachments.map((attachment, i) => (
                              <a 
                                key={i}
                                href={attachment} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-orange-600 hover:text-orange-800 flex items-center"
                              >
                                <Paperclip className="h-4 w-4 mr-1" />
                                Pièce jointe {i+1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Formulaire de réponse */}
                {ticket.status !== 'CLOSED' && (
                  <div className="border-t pt-6 mt-8">
                    <h3 className="font-medium mb-3">Répondre</h3>
                    <div className="mb-4">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Tapez votre réponse ici..."
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      ></textarea>
                    </div>
                    <div className="flex justify-between items-center">
                      <button 
                        className="text-gray-600 border border-gray-300 px-4 py-2 rounded-md flex items-center hover:bg-gray-50 transition-colors"
                      >
                        <Paperclip className="h-4 w-4 mr-2" />
                        Joindre un fichier
                      </button>
                      <button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSubmitting}
                        className={`bg-orange-600 text-white px-6 py-2 rounded-md flex items-center hover:bg-orange-700 transition-colors ${
                          !newMessage.trim() || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Envoyer
                      </button>
                    </div>
                  </div>
                )}

                {ticket.status === 'CLOSED' && (
                  <div className="border-t pt-6 mt-8">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <XCircle className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                      <h3 className="font-medium mb-1">Ce ticket est fermé</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Vous ne pouvez plus ajouter de réponses à ce ticket car il a été fermé.
                      </p>
                      <Link 
                        href="/contact" 
                        className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
                      >
                        Créer un nouveau ticket
                      </Link>
                    </div>
                  </div>
                )}

                {ticket.status === 'RESOLVED' && (
                  <div className="border-t pt-6 mt-8">
                    <div className="bg-green-50 rounded-lg p-4 text-center mb-6">
                      <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
                      <h3 className="font-medium mb-1">Ce ticket a été résolu</h3>
                      <p className="text-sm text-gray-500">
                        Si vous avez encore des questions, vous pouvez ajouter une réponse ci-dessous.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Besoin d'aide supplémentaire ?</h2>
          <p className="mb-4">
            Si vous avez d'autres questions ou problèmes, n'hésitez pas à consulter notre centre d'aide 
            ou à créer un nouveau ticket de support.
          </p>
          <div className="flex space-x-4">
            <Link 
              href="/contact" 
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
            >
              Nouveau ticket
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
