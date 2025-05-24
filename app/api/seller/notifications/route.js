import { NextResponse } from "next/server";
import { getSellerStore } from "@/lib/seller-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const sellerData = await getSellerStore();
    if (!sellerData) {
      return NextResponse.json({ error: "Non autorisé ou magasin non trouvé" }, { status: 401 });
    }

    const { user } = sellerData;

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limiter à 50 notifications récentes
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des notifications" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const sellerData = await getSellerStore();
    if (!sellerData) {
      return NextResponse.json({ error: "Non autorisé ou magasin non trouvé" }, { status: 401 });
    }

    const { user } = sellerData;
    const data = await request.json();
    const { notifications } = data;

    // Mettre à jour les préférences de notification
    const updatedPreferences = await prisma.notificationPreferences.upsert({
      where: {
        userId: user.id
      },
      update: {
        email: notifications.email,
        push: notifications.push,
        orders: notifications.orders,
        messages: notifications.messages,
        marketing: notifications.marketing
      },
      create: {
        userId: user.id,
        email: notifications.email,
        push: notifications.push,
        orders: notifications.orders,
        messages: notifications.messages,
        marketing: notifications.marketing
      }
    });

    return NextResponse.json(updatedPreferences);
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des préférences de notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const sellerData = await getSellerStore();
    if (!sellerData) {
      return NextResponse.json({ error: "Non autorisé ou magasin non trouvé" }, { status: 401 });
    }

    const { user } = sellerData;
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json(
        { error: "ID de notification requis" },
        { status: 400 }
      );
    }

    // Vérifier que la notification appartient bien au vendeur
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: user.id
      }
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer la notification
    await prisma.notification.delete({
      where: {
        id: notificationId
      }
    });

    return NextResponse.json({ message: "Notification supprimée avec succès" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la notification" },
      { status: 500 }
    );
  }
}
