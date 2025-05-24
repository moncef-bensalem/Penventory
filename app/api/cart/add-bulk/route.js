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
    const { items } = await request.json();
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Aucun produit à ajouter" },
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

    // Récupérer les éléments existants dans le panier
    const existingCartItems = await prisma.cartItem.findMany({
      where: {
        cartId: cart.id
      }
    });

    // Préparer les opérations de mise à jour et de création
    const updateOperations = [];
    const createOperations = [];

    for (const item of items) {
      const { productId, quantity, price, sellerId, besoinId, listeId } = item;
      
      if (!productId || !quantity || quantity < 1) {
        continue; // Ignorer les éléments invalides
      }

      // Vérifier si le produit est déjà dans le panier
      const existingItem = existingCartItems.find(ci => ci.productId === productId);

      if (existingItem) {
        // Mettre à jour la quantité si le produit existe déjà
        updateOperations.push(
          prisma.cartItem.update({
            where: {
              id: existingItem.id
            },
            data: {
              quantity: existingItem.quantity + quantity
            }
          })
        );
      } else {
        // Ajouter un nouvel élément au panier
        createOperations.push(
          prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId,
              quantity,
              price,
              sellerId,
              besoinId,
              listeId
            }
          })
        );
      }
    }

    // Exécuter toutes les opérations en parallèle
    await Promise.all([
      ...updateOperations,
      ...createOperations
    ]);

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
    console.error("Erreur lors de l'ajout en masse au panier:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout en masse au panier" },
      { status: 500 }
    );
  }
}
