import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/tickets - Récupérer tous les tickets (pour les managers)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier si l'utilisateur est un manager
    if (session.user.role !== 'MANAGER') {
      // Si c'est un client, retourner uniquement ses tickets
      const tickets = await prisma.supportTicket.findMany({
        where: {
          customerId: session.user.id
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
          },
          messages: {
            select: {
              id: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      return NextResponse.json(tickets);
    }
    
    // Pour les managers, retourner tous les tickets
    const tickets = await prisma.supportTicket.findMany({
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
        },
        messages: {
          select: {
            id: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(tickets);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/tickets - Créer un nouveau ticket
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const data = await request.json();
    
    // Valider les données requises
    const { subject, description, category, priority } = data;
    
    if (!subject || !description || !category) {
      return NextResponse.json({ error: 'Données incomplètes' }, { status: 400 });
    }
    
    // Créer le ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        subject,
        description,
        category,
        priority: priority || 'MEDIUM',
        status: 'OPEN',
        orderNumber: data.orderNumber || null,
        customerId: session.user.id
      }
    });
    
    // Créer le premier message du ticket (la description)
    await prisma.ticketMessage.create({
      data: {
        content: description,
        ticketId: ticket.id,
        senderId: session.user.id,
        attachments: []
      }
    });
    
    return NextResponse.json(ticket, { status: 201 });
    
  } catch (error) {
    console.error('Erreur lors de la création du ticket:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
