import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  console.log('[MANAGER_TRANSACTIONS_GET] Démarrage de la requête...');
  
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.log('[MANAGER_TRANSACTIONS_GET] Utilisateur non authentifié');
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un manager
    if (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN') {
      console.log(`[MANAGER_TRANSACTIONS_GET] Accès non autorisé pour le rôle: ${session.user.role}`);
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const userId = session.user.id;
    console.log(`[MANAGER_TRANSACTIONS_GET] Utilisateur autorisé: ${userId}, rôle: ${session.user.role}`);

    // Construire les conditions de recherche
    const where = {};

    // Récupérer les transactions
    console.log(`[MANAGER_TRANSACTIONS_GET] Exécution de la requête Prisma...`);
    
    let transactions;
    try {
      transactions = await prisma.transaction.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      console.log(`[MANAGER_TRANSACTIONS_GET] ${transactions.length} transactions récupérées`);
      
      // Récupérer les informations des utilisateurs associés
      const userIds = new Set();
      transactions.forEach(tx => {
        if (tx.senderId) userIds.add(tx.senderId);
        if (tx.receiverId) userIds.add(tx.receiverId);
      });
      
      const users = await prisma.user.findMany({
        where: {
          id: { in: Array.from(userIds) }
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });
      
      const usersMap = users.reduce((map, user) => {
        map[user.id] = user;
        return map;
      }, {});
      
      // Enrichir les transactions avec les données utilisateurs
      transactions = transactions.map(tx => {
        const sender = tx.senderId ? usersMap[tx.senderId] : null;
        const receiver = tx.receiverId ? usersMap[tx.receiverId] : null;
        
        return {
          ...tx,
          sender,
          receiver
        };
      });
      
    } catch (dbError) {
      console.error(`[MANAGER_TRANSACTIONS_GET] Erreur Prisma:`, dbError);
      
      // En mode développement, utiliser des données fictives
      if (process.env.NODE_ENV === 'development') {
        console.log('[MANAGER_TRANSACTIONS_GET] Utilisation de données de démo');
        
        return generateDemoTransactions();
      }
      
      throw new Error(`Erreur de base de données: ${dbError.message}`);
    }

    // Formater les transactions pour la réponse
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      date: transaction.createdAt,
      description: transaction.description,
      type: transaction.type,
      category: transaction.type === 'SUBSCRIPTION' ? 'SUBSCRIPTION' : 
               transaction.type === 'WITHDRAWAL' ? 'WITHDRAWAL' : 
               transaction.type === 'DEPOSIT' ? 'DEPOSIT' : 'OTHER',
      amount: transaction.amount,
      currency: transaction.currency === 'DT' ? 'TND' : (transaction.currency || 'TND'),
      status: transaction.status,
      reference: transaction.reference,
      paymentMethod: transaction.paymentMethod,
      sender: transaction.sender 
        ? {
            id: transaction.sender.id,
            name: transaction.sender.name,
            email: transaction.sender.email,
            role: transaction.sender.role
          }
        : { id: null, name: 'Système', email: 'system@example.com', role: 'SYSTEM' },
      receiver: transaction.receiver
        ? {
            id: transaction.receiver.id,
            name: transaction.receiver.name,
            email: transaction.receiver.email,
            role: transaction.receiver.role
          }
        : { id: null, name: 'Système', email: 'system@example.com', role: 'SYSTEM' }
    }));

    return NextResponse.json(formattedTransactions);

  } catch (error) {
    console.error('[MANAGER_TRANSACTIONS_GET] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des transactions', details: error.message },
      { status: 500 }
    );
  }
}

// Fonction pour générer des données de démo en cas d'erreur ou en développement
function generateDemoTransactions() {
  console.log('[MANAGER_TRANSACTIONS_GET] Génération de données de démo');
  
  // Générer des transactions qui correspondent aux données de l'interface
  const demoTransactions = [
    {
      id: '67fcd18c4d9db140b3b27938',
      date: new Date('2025-04-14T10:12:00'),
      description: "Paiement d'abonnement - Plan Premium",
      type: 'SUBSCRIPTION',
      category: 'SUBSCRIPTION',
      amount: 0.00,
      currency: 'TND',
      status: 'COMPLETED',
      reference: 'SUB-20250414-1012',
      paymentMethod: 'CARD',
      sender: { id: 'usr1001', name: 'ayhem', email: 'ayhem@example.com', role: 'SELLER' },
      receiver: { id: 'sys1', name: 'Système', email: 'system@example.com', role: 'SYSTEM' }
    },
    {
      id: '67fcd0e24d9db140b3b27932',
      date: new Date('2025-04-14T10:09:00'),
      description: "Paiement d'abonnement - Plan Premium",
      type: 'SUBSCRIPTION',
      category: 'SUBSCRIPTION',
      amount: 30.00,
      currency: 'TND',
      status: 'COMPLETED',
      reference: 'SUB-20250414-1009',
      paymentMethod: 'CARD',
      sender: { id: 'usr1002', name: 'ayhem', email: 'ayhem@example.com', role: 'SELLER' },
      receiver: { id: 'sys1', name: 'Système', email: 'system@example.com', role: 'SYSTEM' }
    },
    {
      id: '67fcd0d24d9db140b3b27931',
      date: new Date('2025-04-14T10:09:00'),
      description: "Paiement d'abonnement - Plan Premium",
      type: 'SUBSCRIPTION',
      category: 'SUBSCRIPTION',
      amount: 0.00,
      currency: 'TND',
      status: 'COMPLETED',
      reference: 'SUB-20250414-1009',
      paymentMethod: 'CARD',
      sender: { id: 'usr1003', name: 'ayhem', email: 'ayhem@example.com', role: 'SELLER' },
      receiver: { id: 'sys1', name: 'Système', email: 'system@example.com', role: 'SYSTEM' }
    },
    {
      id: '67fcd0be4d9db140b3b2792f',
      date: new Date('2025-04-14T10:09:00'),
      description: "Paiement d'abonnement - Plan Premium",
      type: 'SUBSCRIPTION',
      category: 'SUBSCRIPTION',
      amount: 30.00,
      currency: 'TND',
      status: 'COMPLETED',
      reference: 'SUB-20250414-1009',
      paymentMethod: 'CARD',
      sender: { id: 'usr1004', name: 'ayhem', email: 'ayhem@example.com', role: 'SELLER' },
      receiver: { id: 'sys1', name: 'Système', email: 'system@example.com', role: 'SYSTEM' }
    },
    {
      id: '6712c936f5dbfec194cdea55',
      date: new Date('2025-04-06T19:34:00'),
      description: "Paiement d'abonnement - Plan Premium",
      type: 'SUBSCRIPTION',
      category: 'SUBSCRIPTION',
      amount: 0.00,
      currency: 'TND',
      status: 'COMPLETED',
      reference: 'SUB-20250406-1934',
      paymentMethod: 'CARD',
      sender: { id: 'usr1005', name: 'ayhem', email: 'ayhem@example.com', role: 'SELLER' },
      receiver: { id: 'sys1', name: 'Système', email: 'system@example.com', role: 'SYSTEM' }
    },
    {
      id: '6712c4e6f5dbfec194cdea45',
      date: new Date('2025-04-06T19:16:00'),
      description: "Paiement d'abonnement - Plan Premium",
      type: 'SUBSCRIPTION',
      category: 'SUBSCRIPTION',
      amount: 0.00,
      currency: 'TND',
      status: 'COMPLETED',
      reference: 'SUB-20250406-1916',
      paymentMethod: 'CARD',
      sender: { id: 'sys1', name: 'Système', email: 'system@example.com', role: 'SYSTEM' },
      receiver: { id: 'usr1006', name: 'Système', email: 'system@example.com', role: 'SYSTEM' }
    },
    {
      id: '67eee2b583d54121cbe4c9e0',
      date: new Date('2025-04-03T20:34:00'),
      description: "Paiement d'abonnement - Plan Premium",
      type: 'SUBSCRIPTION',
      category: 'SUBSCRIPTION',
      amount: 310.00,
      currency: 'TND',
      status: 'COMPLETED',
      reference: 'SUB-20250403-2034',
      paymentMethod: 'CARD',
      sender: { id: 'usr1007', name: 'zakeria', email: 'zakeria@example.com', role: 'SELLER' },
      receiver: { id: 'sys1', name: 'Système', email: 'system@example.com', role: 'SYSTEM' }
    },
    {
      id: '67eee24383d54121cbe4c9de',
      date: new Date('2025-04-03T20:32:00'),
      description: "Paiement d'abonnement - Plan Premium",
      type: 'SUBSCRIPTION',
      category: 'SUBSCRIPTION',
      amount: 0.00,
      currency: 'TND',
      status: 'COMPLETED',
      reference: 'SUB-20250403-2032',
      paymentMethod: 'CARD',
      sender: { id: 'usr1008', name: 'zakeria', email: 'zakeria@example.com', role: 'SELLER' },
      receiver: { id: 'sys1', name: 'Système', email: 'system@example.com', role: 'SYSTEM' }
    }
  ];
  
  return NextResponse.json(demoTransactions);
} 