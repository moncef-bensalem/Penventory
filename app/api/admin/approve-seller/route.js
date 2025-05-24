import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    // Vérifier l'authentification et les autorisations
    const session = await getServerSession(authOptions);
    console.log('POST /api/admin/approve-seller - Session:', session?.user?.email, 'Role:', session?.user?.role);
    
    if (!session) {
      return NextResponse.json(
        { message: "Non authentifié" },
        { status: 401 }
      );
    }
    
    if (!session.user?.role || session.user.role !== "ADMIN") {
      console.log('Accès non autorisé - Rôle requis: ADMIN, Rôle actuel:', session.user?.role);
      return NextResponse.json(
        { message: "Seuls les administrateurs peuvent effectuer cette action" },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json(
        { message: "Email requis" },
        { status: 400 }
      );
    }
    
    // Trouver l'utilisateur avec cet email
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }
    
    // Rechercher le magasin du vendeur
    const store = await prisma.store.findFirst({
      where: { ownerId: user.id }
    });
    
    if (!store) {
      return NextResponse.json(
        { message: "Utilisateur n'a pas de magasin" },
        { status: 400 }
      );
    }
    
    // Mettre à jour le magasin pour l'approuver
    const updatedStore = await prisma.store.update({
      where: { id: store.id },
      data: { isApproved: true }
    });
    
    // Vérifier l'email s'il n'est pas déjà vérifié
    if (!user.emailVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      });
    }
    
    // Créer un abonnement de test (gratuit pour 30 jours)
    const hasSubscription = await prisma.subscription.findFirst({
      where: { userId: user.id, status: "ACTIVE" }
    });
    
    if (!hasSubscription) {
      await prisma.subscription.create({
        data: {
          type: "FREE",
          amount: 0,
          userId: user.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
          status: "ACTIVE",
          createdAt: new Date()
        }
      });
    }
    
    return NextResponse.json({
      message: "Vendeur approuvé avec succès",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: true
      },
      store: {
        id: updatedStore.id,
        name: updatedStore.name,
        isApproved: true
      }
    });
  } catch (error) {
    console.error("Erreur d'approbation:", error);
    return NextResponse.json({ 
      message: "Erreur lors de l'approbation du vendeur",
      error: error.message 
    }, { status: 500 });
  }
} 