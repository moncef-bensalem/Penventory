import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// API pour créer ou mettre à jour une évaluation de commande
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier si l'utilisateur est connecté
    if (!session) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour évaluer une commande" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { orderId, rating, comment } = await request.json();
    
    if (!orderId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Données d'évaluation invalides" },
        { status: 400 }
      );
    }

    // Vérifier si la commande existe et appartient à l'utilisateur
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        customerId: userId
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Commande introuvable ou vous n'êtes pas autorisé à l'évaluer" },
        { status: 404 }
      );
    }

    // Vérifier si une évaluation existe déjà pour cette commande
    const existingRating = await prisma.orderRating.findUnique({
      where: {
        orderId: orderId
      }
    });

    let orderRating;

    if (existingRating) {
      // Mettre à jour l'évaluation existante
      orderRating = await prisma.orderRating.update({
        where: {
          id: existingRating.id
        },
        data: {
          rating: rating,
          comment: comment || existingRating.comment,
          updatedAt: new Date()
        }
      });
    } else {
      // Créer une nouvelle évaluation
      orderRating = await prisma.orderRating.create({
        data: {
          orderId: orderId,
          userId: userId,
          rating: rating,
          comment: comment || "",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Mettre à jour le statut de la commande pour indiquer qu'elle a été évaluée
      await prisma.order.update({
        where: {
          id: orderId
        },
        data: {
          isRated: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Évaluation enregistrée avec succès",
      rating: orderRating
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'évaluation:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout de l'évaluation" },
      { status: 500 }
    );
  }
}

// API pour récupérer les évaluations de commandes
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    
    // Si un orderId est fourni, récupérer une évaluation spécifique
    if (orderId) {
      const orderRating = await prisma.orderRating.findUnique({
        where: {
          orderId: orderId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      });

      if (!orderRating) {
        return NextResponse.json({
          rated: false,
          message: "Aucune évaluation trouvée pour cette commande"
        });
      }

      return NextResponse.json({
        rated: true,
        rating: orderRating
      });
    } 
    
    // Si aucun orderId n'est fourni, récupérer toutes les évaluations
    // Vérifier si l'utilisateur est un manager (optionnel pour le développement)
    /*
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }
    */
    
    // Récupérer toutes les évaluations avec les informations associées
    const allRatings = await prisma.orderRating.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        order: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            number: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(allRatings);
  } catch (error) {
    console.error("Erreur lors de la récupération des évaluations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des évaluations" },
      { status: 500 }
    );
  }
}
