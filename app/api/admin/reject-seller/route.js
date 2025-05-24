import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    // Vérifier l'authentification et les autorisations
    const session = await getServerSession(authOptions);
    console.log('POST /api/admin/reject-seller - Session:', session?.user?.email, 'Role:', session?.user?.role);
    
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
    
    // Récupérer les données de la requête
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
        { message: "Vendeur non trouvé" },
        { status: 404 }
      );
    }
    
    // Rechercher le magasin du vendeur
    const store = await prisma.store.findFirst({
      where: { ownerId: user.id }
    });
    
    if (!store) {
      return NextResponse.json(
        { message: "Le vendeur n'a pas de magasin" },
        { status: 400 }
      );
    }
    
    // Mettre à jour le magasin pour le rejeter
    const updatedStore = await prisma.store.update({
      where: { id: store.id },
      data: { isApproved: false }
    });
    
    // Annuler tous les abonnements existants
    await prisma.subscription.updateMany({
      where: { 
        userId: user.id,
        status: "ACTIVE"
      },
      data: { 
        status: "CANCELLED"
      }
    });
    
    return NextResponse.json({
      message: "Vendeur rejeté avec succès",
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      store: {
        id: updatedStore.id,
        name: updatedStore.name,
        isApproved: false
      }
    });
  } catch (error) {
    console.error("Erreur lors du rejet du vendeur:", error);
    return NextResponse.json({ 
      message: "Erreur lors du rejet du vendeur",
      error: error.message 
    }, { status: 500 });
  }
} 