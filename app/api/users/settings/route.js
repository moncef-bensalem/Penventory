import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

// Récupérer les paramètres de l'utilisateur
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier l'authentification
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur avec ses préférences
    const user = await prisma.user.findUnique({
      where: { 
        id: session.user.id 
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        preferences: true, // Incluez toute table de préférences liée
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Si l'application n'a pas encore de table de préférences utilisateur,
    // nous pouvons simuler des données de préférences
    const defaultPreferences = {
      darkMode: true,
      emailNotifications: true,
      appNotifications: true,
      smsNotifications: false,
      language: 'fr',
      currency: 'TND',
      twoFactorAuth: false,
      sessionTimeout: '30',
      ipRestriction: false,
      dataRetention: '90',
    };

    // Combiner les données utilisateur avec les préférences par défaut si nécessaire
    const userSettings = {
      ...user,
      preferences: user.preferences || defaultPreferences
    };

    return NextResponse.json(userSettings);
  } catch (error) {
    console.error('[USER_SETTINGS_GET]', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des paramètres utilisateur" },
      { status: 500 }
    );
  }
}

// Mettre à jour les paramètres de l'utilisateur
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier l'authentification
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const updateData = {};
    
    // Mettre à jour les informations de base de l'utilisateur
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.phone) updateData.phone = data.phone;
    
    // Si un nouveau mot de passe est fourni, le hacher
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // Si des préférences sont fournies, les mettre à jour
    if (data.preferences) {
      updateData.preferences = data.preferences;
    }

    // Mettre à jour l'utilisateur avec toutes les données
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData
    });

    // Ne pas renvoyer le mot de passe
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('[USER_SETTINGS_PUT]', error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des paramètres utilisateur" },
      { status: 500 }
    );
  }
}

// Supprimer le compte utilisateur
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier l'authentification
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Supprimer l'utilisateur
    // Dans une vraie application, envisagez de:
    // 1. Anonymiser les données plutôt que de les supprimer complètement
    // 2. Implémenter une suppression en plusieurs étapes (soft delete puis hard delete)
    // 3. Nettoyer les relations (supprimer ou anonymiser les données associées)
    
    await prisma.user.delete({
      where: { id: session.user.id }
    });

    return NextResponse.json({ 
      success: true,
      message: "Compte utilisateur supprimé avec succès" 
    });
  } catch (error) {
    console.error('[USER_SETTINGS_DELETE]', error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du compte utilisateur" },
      { status: 500 }
    );
  }
} 