import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const transactionId = params.id;
  console.log(`[WALLET_TRANSACTION_DETAILS_GET] Démarrage de la requête pour ID: ${transactionId}`);
  
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.log('[WALLET_TRANSACTION_DETAILS_GET] Utilisateur non authentifié');
      
      // En développement, permettre l'accès pour faciliter les tests
      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
      } else {
        console.warn('[WALLET_TRANSACTION_DETAILS_GET] Accès non authentifié ignoré en mode développement');
      }
    }

    const userId = session?.user?.id || "demo-user-id";
    console.log(`[WALLET_TRANSACTION_DETAILS_GET] Utilisateur ID: ${userId}`);

    // Récupérer la transaction par ID
    console.log(`[WALLET_TRANSACTION_DETAILS_GET] Exécution de la requête Prisma...`);
    
    let transaction;
    try {
      transaction = await prisma.transaction.findUnique({
        where: {
          id: transactionId
        }
      });
      
      if (!transaction) {
        console.log(`[WALLET_TRANSACTION_DETAILS_GET] Transaction non trouvée pour ID: ${transactionId}`);
        return NextResponse.json(
          { error: 'Transaction non trouvée' },
          { status: 404 }
        );
      }
      
      // Vérifier que l'utilisateur a le droit d'accéder à cette transaction
      if (session?.user?.role !== 'ADMIN' && 
          transaction.senderId !== userId && 
          transaction.receiverId !== userId) {
        console.log(`[WALLET_TRANSACTION_DETAILS_GET] Accès non autorisé à la transaction: ${transactionId}`);
        return NextResponse.json(
          { error: 'Vous n\'êtes pas autorisé à accéder à cette transaction' },
          { status: 403 }
        );
      }
      
      // Récupérer les informations des utilisateurs impliqués
      let sender = null;
      let receiver = null;
      
      if (transaction.senderId) {
        sender = await prisma.user.findUnique({
          where: { id: transaction.senderId },
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        });
      }
      
      if (transaction.receiverId) {
        receiver = await prisma.user.findUnique({
          where: { id: transaction.receiverId },
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        });
      }
      
      // Enrichir la transaction avec les données utilisateur
      transaction = {
        ...transaction,
        sender,
        receiver
      };
      
      console.log(`[WALLET_TRANSACTION_DETAILS_GET] Transaction trouvée pour ID: ${transactionId}`);
    } catch (dbError) {
      console.error(`[WALLET_TRANSACTION_DETAILS_GET] Erreur Prisma:`, dbError);
      
      // En mode développement, utiliser des données fictives
      if (process.env.NODE_ENV === 'development') {
        console.log('[WALLET_TRANSACTION_DETAILS_GET] Utilisation de données de démo');
        
        // Données de démonstration pour le développement
        return NextResponse.json({
          id: transactionId,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          description: 'Vente #ORD-789456',
          type: 'INCOME',
          category: 'SALE',
          amount: 125.50,
          currency: 'TND',
          status: 'COMPLETED',
          reference: 'ORD-789456',
          paymentMethod: 'CARD',
          sender: { id: 'user-1', name: 'Client', email: 'client@example.com', role: 'CUSTOMER' },
          receiver: { id: userId, name: 'Vendeur', email: 'seller@example.com', role: 'SELLER' },
          notes: 'Paiement pour commande #ORD-789456'
        });
      }
      
      throw new Error(`Erreur de base de données: ${dbError.message}`);
    }

    // Formater la transaction pour la réponse
    const formattedTransaction = {
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
        : { id: null, name: 'Système', email: 'system@example.com', role: 'SYSTEM' },
      notes: transaction.notes || null
    };

    return NextResponse.json(formattedTransaction);

  } catch (error) {
    console.error('[WALLET_TRANSACTION_DETAILS_GET] Erreur:', error);
    
    // En mode développement, retourner des données factices
    if (process.env.NODE_ENV === 'development') {
      console.log('[WALLET_TRANSACTION_DETAILS_GET] Erreur, utilisation de données de démo');
      
      return NextResponse.json({
        id: transactionId,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        description: 'Vente #ORD-789456',
        type: 'INCOME',
        category: 'SALE',
        amount: 125.50,
        currency: 'TND',
        status: 'COMPLETED',
        reference: 'ORD-789456',
        paymentMethod: 'CARD',
        sender: { id: 'user-1', name: 'Client', email: 'client@example.com', role: 'CUSTOMER' },
        receiver: { id: 'demo-user-id', name: 'Vendeur', email: 'seller@example.com', role: 'SELLER' },
        notes: 'Paiement pour commande #ORD-789456'
      });
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des détails de la transaction', details: error.message },
      { status: 500 }
    );
  }
} 