import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// API pour créer un nouvel avis
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier si l'utilisateur est connecté
    if (!session) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour laisser un avis" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { productId, orderId, rating, comment } = await request.json();
    
    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Données d'avis invalides" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur a déjà laissé un avis pour ce produit
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: userId,
        productId: productId
      }
    });

    if (existingReview) {
      // Mettre à jour l'avis existant
      const updatedReview = await prisma.review.update({
        where: {
          id: existingReview.id
        },
        data: {
          rating: rating,
          comment: comment || existingReview.comment,
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: "Avis mis à jour avec succès",
        review: updatedReview
      });
    } else {
      // Créer un nouvel avis
      const newReview = await prisma.review.create({
        data: {
          productId: productId,
          userId: userId,
          orderId: orderId,
          rating: rating,
          comment: comment || "",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: "Avis ajouté avec succès",
        review: newReview
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'avis:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout de l'avis" },
      { status: 500 }
    );
  }
}

// API pour récupérer les avis d'un produit
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    
    if (!productId) {
      return NextResponse.json(
        { error: "ID de produit non fourni" },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId: productId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Calculer la note moyenne
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      reviews: reviews,
      averageRating: averageRating,
      count: reviews.length
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des avis:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des avis" },
      { status: 500 }
    );
  }
}
