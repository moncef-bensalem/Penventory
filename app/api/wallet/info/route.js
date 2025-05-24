import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  console.log('[WALLET_INFO_GET] Démarrage de la requête...');
  
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.log('[WALLET_INFO_GET] Utilisateur non authentifié');
      
      // En développement, permettre l'accès pour faciliter les tests
      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
      } else {
        console.warn('[WALLET_INFO_GET] Accès non authentifié ignoré en mode développement');
      }
    }

    const userId = session?.user?.id || "demo-user-id";
    console.log(`[WALLET_INFO_GET] Utilisateur ID: ${userId}`);

    // Récupérer le wallet de l'utilisateur
    let wallet;
    try {
      wallet = await prisma.wallet.findUnique({
        where: { userId }
      });
      
      console.log(`[WALLET_INFO_GET] Wallet trouvé:`, wallet ? "Oui" : "Non");

      if (!wallet) {
        // Créer un nouveau wallet s'il n'existe pas
        console.log(`[WALLET_INFO_GET] Création d'un nouveau wallet...`);
        
        try {
          const newWallet = await prisma.wallet.create({
            data: {
              userId,
              balance: 0
            }
          });
          
          console.log(`[WALLET_INFO_GET] Nouveau wallet créé avec ID: ${newWallet.id}`);
          
          return NextResponse.json({
            balance: 0,
            pendingAmount: 0,
            totalIncome: 0,
            totalExpense: 0,
            currency: 'TND'
          });
        } catch (createError) {
          console.error(`[WALLET_INFO_GET] Erreur lors de la création du wallet:`, createError);
          
          // En développement, retourner un wallet factice
          if (process.env.NODE_ENV === 'development') {
            console.log('[WALLET_INFO_GET] Utilisation de données de démo');
            return NextResponse.json({
              balance: 2580.75,
              pendingAmount: 450.25,
              totalIncome: 5230.50,
              totalExpense: 2649.75,
              currency: 'TND'
            });
          }
          
          throw new Error(`Erreur lors de la création du wallet: ${createError.message}`);
        }
      }
    } catch (walletError) {
      console.error(`[WALLET_INFO_GET] Erreur lors de la récupération du wallet:`, walletError);
      
      // En développement, retourner un wallet factice
      if (process.env.NODE_ENV === 'development') {
        console.log('[WALLET_INFO_GET] Utilisation de données de démo');
        return NextResponse.json({
          balance: 2580.75,
          pendingAmount: 450.25,
          totalIncome: 5230.50,
          totalExpense: 2649.75,
          currency: 'TND'
        });
      }
      
      throw new Error(`Erreur lors de la récupération du wallet: ${walletError.message}`);
    }

    // Récupérer les transactions pour calculer les totaux
    let transactions;
    try {
      transactions = await prisma.transaction.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      });
      
      console.log(`[WALLET_INFO_GET] ${transactions.length} transactions récupérées pour les calculs`);
    } catch (transactionError) {
      console.error(`[WALLET_INFO_GET] Erreur lors de la récupération des transactions:`, transactionError);
      
      // En cas d'erreur, utiliser un tableau vide
      transactions = [];
    }

    // Calculer les totaux
    const totalIncome = transactions
      .filter(t => t.receiverId === userId && t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.senderId === userId && t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingAmount = transactions
      .filter(t => t.receiverId === userId && t.status === 'PENDING')
      .reduce((sum, t) => sum + t.amount, 0);

    console.log(`[WALLET_INFO_GET] Calculs terminés - Balance: ${wallet.balance}, Revenus: ${totalIncome}, Dépenses: ${totalExpense}, En attente: ${pendingAmount}`);

    return NextResponse.json({
      balance: wallet.balance,
      pendingAmount,
      totalIncome,
      totalExpense,
      currency: 'TND'
    });

  } catch (error) {
    console.error('[WALLET_INFO_GET] Erreur:', error);
    
    // En développement, retourner des données factices
    if (process.env.NODE_ENV === 'development') {
      console.log('[WALLET_INFO_GET] Erreur, utilisation de données de démo');
      return NextResponse.json({
        balance: 2580.75,
        pendingAmount: 450.25,
        totalIncome: 5230.50,
        totalExpense: 2649.75,
        currency: 'TND'
      });
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des informations du wallet', details: error.message },
      { status: 500 }
    );
  }
} 