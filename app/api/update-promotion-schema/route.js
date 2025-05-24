import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from '@/lib/prisma';

// Middleware pour vérifier le rôle administrateur
async function checkAdminRole() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return false;
  }
  return true;
}

// Route pour mettre à jour le schéma de promotion (admin uniquement)
export async function GET(request) {
  try {
    console.log('[UPDATE_PROMOTION_SCHEMA] Checking admin authorization...');
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      console.log('[UPDATE_PROMOTION_SCHEMA] Unauthorized: admin role required');
      return NextResponse.json({ error: "Non autorisé: rôle administrateur requis" }, { status: 401 });
    }
    
    console.log('[UPDATE_PROMOTION_SCHEMA] Starting manual database update for the promotion with code "STOUFA"...');
    
    // Créer une nouvelle promotion pour tester
    const promotion = await prisma.promotion.create({
      data: {
        code: "STOUFA",
        description: "PROMO STOUFA",
        isActive: true,
        startDate: new Date("2025-04-04T00:00:00.000Z"),
        endDate: new Date("2025-05-07T00:00:00.000Z"),
        type: "PERCENTAGE",
        value: 50, // 50% de réduction
        createdAt: new Date(),
        updatedAt: new Date(),
        storeId: "67ec1c9f053554df379dfda6" // ID du store basé sur la capture d'écran
      }
    });
    
    console.log('[UPDATE_PROMOTION_SCHEMA] Created test promotion:', promotion);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Promotion de test créée avec succès',
      promotion
    });
  } catch (error) {
    console.error('[UPDATE_PROMOTION_SCHEMA] Error:', error);
    return NextResponse.json({ 
      error: `Erreur lors de la création de la promotion de test: ${error.message}` 
    }, { status: 500 });
  }
} 