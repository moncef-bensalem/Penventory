import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    console.log('Début du traitement de la souscription...');

    // Vérifier que l'instance prisma est correctement chargée
    if (!prisma) {
      console.error('Erreur: prisma n\'est pas défini');
      return NextResponse.json({ 
        error: 'Erreur interne du serveur: client de base de données non disponible' 
      }, { status: 500 });
    }

    // Vérifier que les modèles Prisma existent
    if (!prisma.wallet || !prisma.transaction || !prisma.subscription) {
      console.error('Erreur: modèles Prisma manquants');
      return NextResponse.json({ 
        error: 'Erreur interne du serveur: schéma de base de données incomplet' 
      }, { status: 500 });
    }

    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log('Utilisateur non authentifié');
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier le rôle vendeur
    if (session.user.role !== 'SELLER') {
      console.log('Utilisateur non autorisé, rôle:', session.user.role);
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Récupérer les données du corps de la requête
    const requestText = await req.text();
    console.log('Requête brute:', requestText);
    
    let data;
    try {
      data = JSON.parse(requestText);
      console.log('Données reçues (après parsing):', data);
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError);
      return NextResponse.json(
        { error: 'Format de requête invalide' },
        { status: 400 }
      );
    }
    
    const { planId, amount, duration, paymentMethod } = data;
    console.log('Données extraites:', { planId, amount, duration, paymentMethod });

    // Validation des données
    if (!planId) {
      console.log('Plan ID manquant');
      return NextResponse.json(
        { error: 'Le plan d\'abonnement est requis' },
        { status: 400 }
      );
    }

    if (amount === undefined || amount === null) {
      console.log('Montant manquant');
      return NextResponse.json(
        { error: 'Le montant est requis' },
        { status: 400 }
      );
    }

    if (!duration) {
      console.log('Durée manquante');
      return NextResponse.json(
        { error: 'La durée est requise' },
        { status: 400 }
      );
    }

    // Validation spécifique selon le type de plan
    if (planId === 'FREE') {
      // Pour le plan FREE, le montant doit être exactement 0
      if (amount !== 0) {
        console.log('Montant invalide pour plan FREE:', amount);
        return NextResponse.json(
          { error: 'Le montant doit être 0 pour le plan gratuit' },
          { status: 400 }
        );
      }
    } else {
      // Pour les plans payants, le montant doit être > 0
      if (amount <= 0) {
        console.log('Montant invalide pour plan payant:', { planId, amount });
        return NextResponse.json(
          { error: 'Le montant doit être supérieur à 0 pour les plans payants' },
          { status: 400 }
        );
      }
    }

    if (duration <= 0) {
      console.log('Durée invalide:', { duration });
      return NextResponse.json(
        { error: 'La durée doit être supérieure à 0' },
        { status: 400 }
      );
    }

    // Trouver l'administrateur pour créditer son portefeuille
    console.log('Recherche de l\'administrateur...');
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!admin) {
      console.log('Administrateur non trouvé');
      return NextResponse.json(
        { error: 'Administrateur non trouvé' },
        { status: 500 }
      );
    }

    console.log('Administrateur trouvé:', admin.id);

    try {
      // Vérifier si le portefeuille de l'admin existe, sinon le créer
      console.log('Vérification du wallet admin...');
      let adminWallet = await prisma.wallet.findUnique({
        where: { userId: admin.id }
      });

      if (!adminWallet) {
        console.log('Création du wallet admin...');
        adminWallet = await prisma.wallet.create({
          data: {
            userId: admin.id,
            balance: 0
          }
        });
      }

      console.log('Wallet admin OK:', adminWallet.id);

      // Générer une référence unique pour la transaction
      const reference = `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log('Référence générée:', reference);

      // Créer la transaction
      console.log('Création de la transaction...');
      const transaction = await prisma.transaction.create({
        data: {
          amount,
          type: 'SUBSCRIPTION',
          status: 'COMPLETED',
          senderId: session.user.id,
          receiverId: admin.id,
          description: `Paiement d'abonnement - Plan ${planId} pour ${duration} mois`,
          currency: 'TND',
          reference,
          paymentMethod: paymentMethod || 'CARD'
        }
      });

      console.log('Transaction créée:', transaction.id);

      // Mettre à jour le solde du portefeuille de l'admin
      console.log('Mise à jour du wallet admin...');
      await prisma.wallet.update({
        where: { userId: admin.id },
        data: {
          balance: {
            increment: amount
          }
        }
      });

      // Calculer les dates de début et de fin de l'abonnement
      const createdAt = new Date();
      const expiresAt = new Date();
      
      if (planId === 'FREE') {
        // Pour le plan gratuit, l'abonnement expire après 3 jours
        expiresAt.setDate(expiresAt.getDate() + 3);
        console.log('Abonnement FREE: expiration dans 3 jours:', expiresAt.toISOString());
      } else {
        // Pour les plans payants, l'abonnement expire après la durée spécifiée en mois
        expiresAt.setMonth(expiresAt.getMonth() + parseInt(duration));
        console.log('Abonnement payant: expiration dans', duration, 'mois:', expiresAt.toISOString());
      }

      // Créer ou mettre à jour l'abonnement
      console.log('Création/mise à jour de l\'abonnement...');
      
      // Vérifier si l'abonnement existe déjà
      const existingSubscription = await prisma.subscription.findFirst({
        where: { userId: session.user.id }
      });
      
      let subscription;
      
      if (existingSubscription) {
        // Mettre à jour l'abonnement existant
        subscription = await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            type: planId,
            amount,
            createdAt,
            expiresAt,
            status: 'ACTIVE',
            paymentId: transaction.id
          }
        });
        console.log('Abonnement mis à jour:', subscription.id);
      } else {
        // Créer un nouvel abonnement
        subscription = await prisma.subscription.create({
          data: {
            userId: session.user.id,
            type: planId,
            amount,
            createdAt,
            expiresAt,
            status: 'ACTIVE',
            paymentId: transaction.id
          }
        });
        console.log('Nouvel abonnement créé:', subscription.id);
      }

      return NextResponse.json({ 
        success: true,
        message: 'Abonnement créé avec succès',
        transaction,
        subscription
      });
    } catch (dbError) {
      console.error('Erreur de base de données:', dbError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'accès à la base de données' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erreur lors du traitement du paiement:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors du traitement du paiement' },
      { status: 500 }
    );
  }
} 