import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/tickets/[id]/messages - Ajouter un message à un ticket
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    // Récupérer le ticket
    const ticket = await prisma.supportTicket.findUnique({
      where: { id }
    });
    
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket non trouvé' }, { status: 404 });
    }
    
    // Vérifier si l'utilisateur a le droit d'ajouter un message à ce ticket
    const isManager = session.user.role === 'MANAGER';
    const isOwner = ticket.customerId === session.user.id;
    
    if (!isManager && !isOwner) {
      return NextResponse.json({ error: 'Non autorisé à ajouter un message à ce ticket' }, { status: 403 });
    }
    
    const data = await request.json();
    
    // Valider les données
    if (!data.content || data.content.trim() === '') {
      return NextResponse.json({ error: 'Le contenu du message est requis' }, { status: 400 });
    }
    
    // Créer le message
    const message = await prisma.ticketMessage.create({
      data: {
        content: data.content,
        ticketId: id,
        senderId: session.user.id,
        attachments: data.attachments || []
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        }
      }
    });
    
    // Mettre à jour le statut du ticket si nécessaire
    let statusUpdate = {};
    
    if (isManager && ticket.status === 'OPEN') {
      statusUpdate = { status: 'PENDING' };
    } else if (isOwner && ticket.status === 'RESOLVED') {
      statusUpdate = { status: 'PENDING' };
    }
    
    if (Object.keys(statusUpdate).length > 0) {
      await prisma.supportTicket.update({
        where: { id },
        data: {
          ...statusUpdate,
          updatedAt: new Date()
        }
      });
    }
    
    return NextResponse.json(message, { status: 201 });
    
  } catch (error) {
    console.error('Erreur lors de l\'ajout du message:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
