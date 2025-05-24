import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils/serialize";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier si l'utilisateur est connecté
    if (!session) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour ajouter des produits au panier" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { productId, quantity, price, sellerId, besoinId, listeId } = await request.json();
    
    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Informations de produit invalides" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur a déjà un panier
    let cart = await prisma.cart.findFirst({
      where: {
        userId: userId,
        status: "ACTIVE"
      }
    });

    // Si l'utilisateur n'a pas de panier, en créer un nouveau
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: userId,
          status: "ACTIVE"
        }
      });
    }

    // Vérifier si le produit est déjà dans le panier
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: productId
      }
    });

    if (existingCartItem) {
      // Mettre à jour la quantité si le produit existe déjà
      await prisma.cartItem.update({
        where: {
          id: existingCartItem.id
        },
        data: {
          quantity: existingCartItem.quantity + quantity
        }
      });
    } else {
      // Ajouter un nouvel élément au panier
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId,
          quantity: quantity,
          price: price,
          sellerId: sellerId,
          besoinId: besoinId,
          listeId: listeId
        }
      });
    }

    // Récupérer le panier mis à jour avec tous les éléments
    const updatedCart = await prisma.cart.findUnique({
      where: {
        id: cart.id
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json(serializeBigInt(updatedCart));
  } catch (error) {
    console.error("Erreur lors de l'ajout au panier:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout au panier" },
      { status: 500 }
    );
  }
}
