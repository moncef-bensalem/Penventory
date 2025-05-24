import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

// Use Prisma as a singleton to avoid connection issues
const globalForPrisma = global;
globalForPrisma.prisma = globalForPrisma.prisma || new PrismaClient();
const prisma = globalForPrisma.prisma;

// Middleware pour vérifier le rôle vendeur
async function checkSellerRole() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'SELLER') {
    return false;
  }
  return session.user;
}

export async function GET() {
  try {
    console.log("[PAYMENT_METHODS_GET] Début de la requête GET");
    
    const user = await checkSellerRole();
    if (!user) {
      console.log("[PAYMENT_METHODS_GET] Non autorisé");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    console.log("[PAYMENT_METHODS_GET] ID de l'utilisateur:", user.id);
    
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log("[PAYMENT_METHODS_GET] Nombre de méthodes de paiement trouvées:", paymentMethods.length);
    
    return NextResponse.json(paymentMethods);
  } catch (error) {
    console.log("[PAYMENT_METHODS_GET] Erreur:", error.message);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des méthodes de paiement: " + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    console.log("[PAYMENT_METHODS_PUT] Début de la requête PUT");
    
    const user = await checkSellerRole();
    if (!user) {
      console.log("[PAYMENT_METHODS_PUT] Non autorisé");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    console.log("[PAYMENT_METHODS_PUT] ID de l'utilisateur:", user.id);
    
    // Vérifier si la requête contient des données JSON valides
    let data;
    try {
      data = await request.json();
      console.log("[PAYMENT_METHODS_PUT] Données JSON reçues:", JSON.stringify(data).substring(0, 100) + "...");
    } catch (error) {
      console.log("[PAYMENT_METHODS_PUT] Erreur de parsing JSON:", error.message);
      return NextResponse.json({ 
        error: "Format de données invalide: " + error.message
      }, { status: 400 });
    }
    
    // Vérifier que les données ne sont pas null
    if (!data || !data.paymentMethods) {
      console.log("[PAYMENT_METHODS_PUT] Aucune donnée fournie");
      return NextResponse.json({ 
        error: "Aucune donnée fournie ou format incorrect"
      }, { status: 400 });
    }

    const { paymentMethods } = data;
    
    // Transaction pour mettre à jour les méthodes de paiement
    try {
      // Supprimer toutes les méthodes de paiement existantes
      await prisma.paymentMethod.deleteMany({
        where: {
          userId: user.id
        }
      });
      
      // Créer les nouvelles méthodes de paiement
      const createdMethods = await Promise.all(
        paymentMethods.map(async (method) => {
          return prisma.paymentMethod.create({
            data: {
              type: method.type,
              accountNumber: method.accountNumber,
              accountName: method.accountName,
              isDefault: method.isDefault,
              userId: user.id
            }
          });
        })
      );
      
      console.log("[PAYMENT_METHODS_PUT] Méthodes de paiement mises à jour avec succès");
      
      return NextResponse.json(createdMethods);
    } catch (dbError) {
      console.error("[PAYMENT_METHODS_PUT] Erreur de base de données:", dbError);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour des méthodes de paiement: " + dbError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[PAYMENT_METHODS_PUT] Erreur générale:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des méthodes de paiement: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    console.log("[PAYMENT_METHODS_DELETE] Début de la requête DELETE");
    
    const user = await checkSellerRole();
    if (!user) {
      console.log("[PAYMENT_METHODS_DELETE] Non autorisé");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    
    // Récupérer l'ID de la méthode de paiement à supprimer
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      console.log("[PAYMENT_METHODS_DELETE] ID non fourni");
      return NextResponse.json({ error: "ID de la méthode de paiement non fourni" }, { status: 400 });
    }
    
    console.log("[PAYMENT_METHODS_DELETE] Suppression de la méthode de paiement:", id);
    
    // Vérifier que la méthode de paiement appartient à l'utilisateur
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: {
        id: id
      }
    });
    
    if (!paymentMethod) {
      console.log("[PAYMENT_METHODS_DELETE] Méthode de paiement non trouvée");
      return NextResponse.json({ error: "Méthode de paiement non trouvée" }, { status: 404 });
    }
    
    if (paymentMethod.userId !== user.id) {
      console.log("[PAYMENT_METHODS_DELETE] Non autorisé à supprimer cette méthode de paiement");
      return NextResponse.json({ error: "Non autorisé à supprimer cette méthode de paiement" }, { status: 403 });
    }
    
    // Supprimer la méthode de paiement
    await prisma.paymentMethod.delete({
      where: {
        id: id
      }
    });
    
    console.log("[PAYMENT_METHODS_DELETE] Méthode de paiement supprimée avec succès");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PAYMENT_METHODS_DELETE] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la méthode de paiement: " + error.message },
      { status: 500 }
    );
  }
}
