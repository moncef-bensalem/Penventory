import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/tickets/[id] - Récupérer un ticket spécifique
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    // Récupérer le ticket avec ses messages
    const ticket = await prisma.supportTicket.findUnique({
      where: {
        id
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        messages: {
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
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });
    
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket non trouvé' }, { status: 404 });
    }
    
    // Vérifier si l'utilisateur a le droit d'accéder à ce ticket
    if (session.user.role !== 'MANAGER' && ticket.customerId !== session.user.id) {
      return NextResponse.json({ error: 'Accès non autorisé à ce ticket' }, { status: 403 });
    }
    
    return NextResponse.json(ticket);
    
  } catch (error) {
    console.error('Erreur lors de la récupération du ticket:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH /api/tickets/[id] - Mettre à jour un ticket
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const data = await request.json();
    
    // Récupérer le ticket existant
    const existingTicket = await prisma.supportTicket.findUnique({
      where: { id }
    });
    
    if (!existingTicket) {
      return NextResponse.json({ error: 'Ticket non trouvé' }, { status: 404 });
    }
    
    // Vérifier les permissions
    const isManager = session.user.role === 'MANAGER';
    const isOwner = existingTicket.customerId === session.user.id;
    
    if (!isManager && !isOwner) {
      return NextResponse.json({ error: 'Non autorisé à modifier ce ticket' }, { status: 403 });
    }
    
    // Préparer les données à mettre à jour
    const updateData = {};
    
    // Les managers peuvent mettre à jour tous les champs
    if (isManager) {
      if (data.status !== undefined) updateData.status = data.status;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId || null;
    }
    
    // Les propriétaires peuvent mettre à jour certains champs
    if (isOwner) {
      if (data.subject !== undefined) updateData.subject = data.subject;
    }
    
    // Mettre à jour le ticket
    const updatedTicket = await prisma.supportTicket.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });
    
    return NextResponse.json(updatedTicket);
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour du ticket:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
