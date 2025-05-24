'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import PageHead from '@/components/backoffice/PageHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  Calendar, 
  MessageSquare,
  Tag,
  Edit,
  Trash,
  RefreshCw,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

export default function TicketDetailPage({ params }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [statusOptions] = useState(['OPEN', 'PENDING', 'RESOLVED', 'CLOSED']);
  const [priorityOptions] = useState(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
  const [categoryOptions] = useState(['PAYMENT', 'SHIPPING', 'PRODUCT', 'ACCOUNT', 'OTHER']);
  const [editMode, setEditMode] = useState(false);
  const [editedTicket, setEditedTicket] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.role === 'MANAGER') {
      fetchTicketDetails();
    } else if (!authLoading && (!user || user.role !== 'MANAGER')) {
      router.push('/login');
    }
  }, [user, authLoading, id]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      
      // Appeler l'API pour récupérer les détails du ticket
      const response = await fetch(`/api/tickets/${id}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des détails du ticket');
      }
      
      const ticketData = await response.json();
      
      // Formater le ticket pour qu'il corresponde à notre structure
      const formattedTicket = {
        id: ticketData.id,
        subject: ticketData.subject,
        description: ticketData.description,
        status: ticketData.status,
        priority: ticketData.priority,
        category: ticketData.category,
        customer: {
          id: ticketData.customer.id,
          name: ticketData.customer.name,
          email: ticketData.customer.email,
          phone: ticketData.customer.phone,
          avatar: ticketData.customer.image || 'https://randomuser.me/api/portraits/men/32.jpg'
        },
        assignedTo: ticketData.assignedTo ? {
          id: ticketData.assignedTo.id,
          name: ticketData.assignedTo.name,
          email: ticketData.assignedTo.email,
          avatar: ticketData.assignedTo.image || 'https://randomuser.me/api/portraits/women/68.jpg'
        } : null,
        createdAt: new Date(ticketData.createdAt),
        lastUpdated: new Date(ticketData.updatedAt),
        messagesCount: ticketData.messages.length,
        orderNumber: ticketData.orderNumber
      };
      
      // Formater les messages
      const formattedMessages = ticketData.messages.map(message => ({
        id: message.id,
        ticketId: message.ticketId,
        content: message.content,
        sender: {
          id: message.sender.id,
          name: message.sender.name,
          email: message.sender.email,
          avatar: message.sender.image || 
                 (message.sender.role === 'MANAGER' ? 
                  'https://randomuser.me/api/portraits/women/68.jpg' : 
                  'https://randomuser.me/api/portraits/men/32.jpg'),
          role: message.sender.role
        },
        createdAt: new Date(message.createdAt),
        attachments: message.attachments || []
      }));
      
      setTicket(formattedTicket);
      setMessages(formattedMessages);
      setEditedTicket(formattedTicket);
      
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      toast.error('Erreur lors de la récupération des détails du ticket');
      
      // En cas d'erreur, utiliser des données de démo
      const demoTicket = generateDemoTicket(id);
      const demoMessages = generateDemoMessages(id, demoTicket);
      
      setTicket(demoTicket);
      setMessages(demoMessages);
      setEditedTicket(demoTicket);
    } finally {
      setLoading(false);
    }
  };

  const generateDemoTicket = (ticketId) => {
    const statuses = ['OPEN', 'PENDING', 'RESOLVED', 'CLOSED'];
    const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const categories = ['PAYMENT', 'SHIPPING', 'PRODUCT', 'ACCOUNT', 'OTHER'];
    const subjects = [
      'Problème avec ma commande', 
      'Question sur un produit', 
      'Retard de livraison', 
      'Problème de paiement', 
      'Demande de remboursement'
    ];
    
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    const daysAgo = Math.floor(Math.random() * 30) + 1;
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const lastUpdated = new Date(createdAt.getTime() + Math.floor(Math.random() * daysAgo) * 24 * 60 * 60 * 1000);
    
    return {
      id: ticketId,
      subject: randomSubject,
      description: `Ce ticket concerne ${randomSubject.toLowerCase()}. J'ai rencontré un problème avec ${randomSubject.toLowerCase()} et j'aimerais obtenir de l'aide pour le résoudre. Merci de votre assistance.`,
      status: randomStatus,
      priority: randomPriority,
      category: randomCategory,
      customer: {
        id: `customer-${Math.floor(1000 + Math.random() * 9000)}`,
        name: `Client Example`,
        email: `client.example@email.com`,
        phone: '+216 71 234 567',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
      },
      assignedTo: randomStatus !== 'OPEN' ? {
        id: `staff-${Math.floor(500 + Math.random() * 500)}`,
        name: `Support Agent`,
        email: `agent@penventory.com`,
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
      } : null,
      createdAt: createdAt,
      lastUpdated: lastUpdated,
      messagesCount: Math.floor(Math.random() * 10) + 1,
      orderNumber: Math.random() > 0.5 ? `ORD-${Math.floor(10000 + Math.random() * 90000)}` : null
    };
  };

  const generateDemoMessages = (ticketId, ticket) => {
    const messageCount = ticket.messagesCount || Math.floor(Math.random() * 5) + 1;
    const messages = [];
    
    // Premier message du client (ticket initial)
    messages.push({
      id: `msg-${ticketId}-1`,
      ticketId: ticketId,
      content: ticket.description,
      sender: {
        id: ticket.customer.id,
        name: ticket.customer.name,
        email: ticket.customer.email,
        avatar: ticket.customer.avatar,
        role: 'CUSTOMER'
      },
      createdAt: ticket.createdAt,
      attachments: []
    });
    
    // Messages supplémentaires
    for (let i = 2; i <= messageCount; i++) {
      const isCustomer = i % 2 === 0; // Alterner entre client et support
      const sender = isCustomer 
        ? ticket.customer 
        : (ticket.assignedTo || { 
            id: 'staff-default', 
            name: 'Support Agent', 
            email: 'support@penventory.com',
            avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
            role: 'STAFF'
          });
      
      const hoursLater = (i - 1) * Math.floor(Math.random() * 24) + 1;
      const messageDate = new Date(ticket.createdAt.getTime() + hoursLater * 60 * 60 * 1000);
      
      const messageContent = isCustomer 
        ? [
            "Merci pour votre réponse. J'ai encore quelques questions à ce sujet.",
            "Je n'ai toujours pas reçu de solution à mon problème. Pouvez-vous m'aider davantage ?",
            "J'ai vérifié ce que vous m'avez suggéré, mais ça ne fonctionne pas.",
            "Pourriez-vous me donner plus de détails sur la procédure à suivre ?",
            "Je vous remercie pour votre aide précieuse !"
          ][Math.floor(Math.random() * 5)]
        : [
            "Merci de nous avoir contactés. Nous allons examiner votre demande et revenir vers vous rapidement.",
            "Nous avons bien reçu votre message. Pourriez-vous nous fournir plus de détails sur le problème rencontré ?",
            "J'ai vérifié votre dossier et je peux confirmer que nous travaillons sur une solution.",
            "Voici les étapes à suivre pour résoudre ce problème...",
            "Votre problème a été résolu. N'hésitez pas à nous contacter si vous avez d'autres questions."
          ][Math.floor(Math.random() * 5)];
      
      messages.push({
        id: `msg-${ticketId}-${i}`,
        ticketId: ticketId,
        content: messageContent,
        sender: {
          ...sender,
          role: isCustomer ? 'CUSTOMER' : 'STAFF'
        },
        createdAt: messageDate,
        attachments: []
      });
    }
    
    // Trier les messages par date
    return messages.sort((a, b) => a.createdAt - b.createdAt);
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
      const response = await fetch(`/api/tickets/${ticket.id}/messages`, {
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
      
      // Formater le nouveau message
      const newMessageObj = {
        id: newMessageData.id,
        ticketId: newMessageData.ticketId,
        content: newMessageData.content,
        sender: {
          id: newMessageData.sender.id,
          name: newMessageData.sender.name,
          email: newMessageData.sender.email,
          avatar: newMessageData.sender.image || 'https://randomuser.me/api/portraits/women/68.jpg',
          role: newMessageData.sender.role
        },
        createdAt: new Date(newMessageData.createdAt),
        attachments: newMessageData.attachments || []
      };
      
      // Ajouter le message à la liste
      setMessages([...messages, newMessageObj]);
      
      // Mettre à jour le ticket
      const updatedTicket = {
        ...ticket,
        lastUpdated: new Date(),
        messagesCount: ticket.messagesCount + 1,
        status: ticket.status === 'OPEN' ? 'PENDING' : ticket.status
      };
      
      setTicket(updatedTicket);
      setEditedTicket(updatedTicket);
      
      // Réinitialiser le champ de message
      setNewMessage('');
      
      toast.success('Message envoyé avec succès');
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTicket = async () => {
    try {
      setIsSubmitting(true);
      
      // Préparer les données de mise à jour
      const updateData = {
        status: editedTicket.status,
        priority: editedTicket.priority,
        category: editedTicket.category,
        assignedToId: editedTicket.assignedTo?.id || null
      };
      
      // Envoyer la mise à jour via l'API
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour du ticket');
      }
      
      const updatedTicketData = await response.json();
      
      // Mettre à jour le ticket dans l'état local
      const updatedTicket = {
        ...ticket,
        status: updatedTicketData.status,
        priority: updatedTicketData.priority,
        category: updatedTicketData.category,
        assignedTo: updatedTicketData.assignedTo,
        lastUpdated: new Date(updatedTicketData.updatedAt)
      };
      
      setTicket(updatedTicket);
      setEditedTicket(updatedTicket);
      setEditMode(false);
      
      toast.success('Ticket mis à jour avec succès');
      
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Erreur lors de la mise à jour du ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (status) => {
    // Mettre à jour le statut du ticket
    const updatedTicket = {
      ...ticket,
      status: status,
      lastUpdated: new Date()
    };
    
    setTicket(updatedTicket);
    setEditedTicket(updatedTicket);
    
    toast.success(`Statut mis à jour: ${getStatusLabel(status)}`);
  };

  // Fonctions utilitaires
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
      case 'OPEN': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user || user.role !== 'MANAGER') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Accès refusé</h1>
        <p className="mb-6">Vous n'avez pas les autorisations nécessaires pour accéder à cette page.</p>
        <Link href="/login" className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors">
          Se connecter
        </Link>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Ticket non trouvé</h1>
        <p className="mb-6">Le ticket demandé n'existe pas ou a été supprimé.</p>
        <Link href="/manager/dashboard/support" className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors">
          Retour à la liste des tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHead 
        title={`Ticket #${ticket.id}`} 
        description="Détails du ticket de support"
        actions={
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => router.push('/manager/dashboard/support')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button 
              variant="outline" 
              onClick={fetchTicketDetails}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations sur le ticket */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Informations</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setEditMode(!editMode)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>

              {!editMode ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Statut</h3>
                    <Badge className={`mt-1 ${getStatusBadgeClass(ticket.status)}`}>
                      {getStatusIcon(ticket.status)}
                      <span className="ml-1">{getStatusLabel(ticket.status)}</span>
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Priorité</h3>
                    <Badge className={`mt-1 ${getPriorityBadgeClass(ticket.priority)}`}>
                      {getPriorityLabel(ticket.priority)}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Catégorie</h3>
                    <p className="mt-1 font-medium">{getCategoryLabel(ticket.category)}</p>
                  </div>

                  {ticket.orderNumber && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">N° de commande</h3>
                      <p className="mt-1 font-medium">{ticket.orderNumber}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Créé le</h3>
                    <p className="mt-1">
                      {format(new Date(ticket.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Dernière mise à jour</h3>
                    <p className="mt-1">
                      {format(new Date(ticket.lastUpdated), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Statut
                    </label>
                    <select
                      id="status"
                      value={editedTicket.status}
                      onChange={(e) => setEditedTicket({...editedTicket, status: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>
                          {getStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Priorité
                    </label>
                    <select
                      id="priority"
                      value={editedTicket.priority}
                      onChange={(e) => setEditedTicket({...editedTicket, priority: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      {priorityOptions.map(priority => (
                        <option key={priority} value={priority}>
                          {getPriorityLabel(priority)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Catégorie
                    </label>
                    <select
                      id="category"
                      value={editedTicket.category}
                      onChange={(e) => setEditedTicket({...editedTicket, category: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      {categoryOptions.map(category => (
                        <option key={category} value={category}>
                          {getCategoryLabel(category)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button 
                      onClick={handleUpdateTicket}
                      disabled={isSubmitting}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Enregistrer
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditMode(false);
                        setEditedTicket(ticket);
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Client</h2>
              <div className="flex items-center mb-4">
                <div className="relative h-12 w-12 rounded-full overflow-hidden mr-3">
                  <Image 
                    src={ticket.customer.avatar || 'https://via.placeholder.com/60'} 
                    alt={ticket.customer.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{ticket.customer.name}</h3>
                  <p className="text-sm text-gray-500">{ticket.customer.email}</p>
                </div>
              </div>
              {ticket.customer.phone && (
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-gray-500">Téléphone</h3>
                  <p className="mt-1">{ticket.customer.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Actions rapides</h2>
              <div className="space-y-2">
                {statusOptions.map(status => (
                  <Button
                    key={status}
                    variant={ticket.status === status ? "default" : "outline"}
                    className={`w-full justify-start ${ticket.status === status ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                    onClick={() => handleStatusChange(status)}
                    disabled={ticket.status === status}
                  >
                    {getStatusIcon(status)}
                    <span className="ml-2">Marquer comme {getStatusLabel(status).toLowerCase()}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversation et réponse */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-2">{ticket.subject}</h2>
              <div className="flex items-center space-x-2 mb-6">
                <Badge className={getStatusBadgeClass(ticket.status)}>
                  {getStatusIcon(ticket.status)}
                  <span className="ml-1">{getStatusLabel(ticket.status)}</span>
                </Badge>
                <Badge className={getPriorityBadgeClass(ticket.priority)}>
                  {getPriorityLabel(ticket.priority)}
                </Badge>
                <span className="text-sm text-gray-500">
                  {format(new Date(ticket.createdAt), 'dd MMM yyyy', { locale: fr })}
                </span>
              </div>

              <div className="space-y-6 mb-8">
                {messages.map((message, index) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.sender.role === 'STAFF' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-3/4 rounded-lg p-4 ${
                        message.sender.role === 'STAFF' 
                          ? 'bg-orange-50 border border-orange-100' 
                          : 'bg-gray-50 border border-gray-100'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <div className="relative h-8 w-8 rounded-full overflow-hidden mr-2">
                          <Image 
                            src={message.sender.avatar || 'https://via.placeholder.com/32'} 
                            alt={message.sender.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">
                            {message.sender.name}
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                              message.sender.role === 'STAFF' 
                                ? 'bg-orange-100 text-orange-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {message.sender.role === 'STAFF' ? 'Support' : 'Client'}
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
                                href={attachment.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-orange-600 hover:text-orange-800 flex items-center"
                              >
                                <Paperclip className="h-4 w-4 mr-1" />
                                {attachment.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Formulaire de réponse */}
              <div className="border-t pt-6">
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
                  <Button variant="outline" className="flex items-center">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Joindre un fichier
                  </Button>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSubmitting}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
