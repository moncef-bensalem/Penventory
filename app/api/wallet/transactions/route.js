import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  console.log('[WALLET_TRANSACTIONS_GET] Démarrage de la requête...');
  
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.log('[WALLET_TRANSACTIONS_GET] Utilisateur non authentifié');
      
      // En développement, permettre l'accès pour faciliter les tests
      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
      } else {
        console.warn('[WALLET_TRANSACTIONS_GET] Accès non authentifié ignoré en mode développement');
      }
    }

    const userId = session?.user?.id || "demo-user-id";
    console.log(`[WALLET_TRANSACTIONS_GET] Utilisateur ID: ${userId}`);

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    console.log(`[WALLET_TRANSACTIONS_GET] Filtres: type=${type}, status=${status}, startDate=${startDate}, endDate=${endDate}`);

    // Construire la requête de filtrage
    const where = {
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ]
    };

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Récupérer les transactions
    console.log(`[WALLET_TRANSACTIONS_GET] Exécution de la requête Prisma...`);
    
    let transactions;
    try {
      transactions = await prisma.transaction.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      console.log(`[WALLET_TRANSACTIONS_GET] ${transactions.length} transactions récupérées`);
      
      // Récupérer les informations des utilisateurs associés avec des requêtes distinctes
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
      console.error(`[WALLET_TRANSACTIONS_GET] Erreur Prisma:`, dbError);
      
      // En mode développement, utiliser des données fictives
      if (process.env.NODE_ENV === 'development') {
        console.log('[WALLET_TRANSACTIONS_GET] Utilisation de données de démo');
        
        // Données de démonstration pour le développement
        return NextResponse.json([
          {
            id: 'tr_123456',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            description: 'Vente #ORD-789456',
            type: 'INCOME',
            category: 'SALE',
            amount: 125.50,
            currency: 'TND',
            status: 'COMPLETED',
            reference: 'ORD-789456',
            paymentMethod: 'CARD',
            sender: { id: 'user-1', name: 'Plateforme', email: 'platform@example.com', role: 'SYSTEM' },
            receiver: { id: userId, name: 'Utilisateur', email: 'user@example.com', role: 'USER' }
          },
          {
            id: 'tr_123457',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            description: 'Frais de plateforme',
            type: 'EXPENSE',
            category: 'FEE',
            amount: 12.55,
            currency: 'TND',
            status: 'COMPLETED',
            reference: 'FEE-789456',
            paymentMethod: 'AUTOMATIC',
            sender: { id: userId, name: 'Utilisateur', email: 'user@example.com', role: 'USER' },
            receiver: { id: 'user-1', name: 'Plateforme', email: 'platform@example.com', role: 'SYSTEM' }
          }
        ]);
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
    console.error('[WALLET_TRANSACTIONS_GET] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des transactions', details: error.message },
      { status: 500 }
    );
  }
} 