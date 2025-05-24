import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fonction pour vérifier la connexion à la base de données
async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    return true;
  } catch (error) {
    console.error('[DATABASE_CONNECTION] Erreur de connexion:', error);
    return false;
  }
}

// Fonction pour sérialiser les BigInt et les dates
function serializeProduct(product) {
  if (!product) return null;

  try {
    // Fonction récursive pour sérialiser les objets imbriqués
    const serializeNested = (obj) => {
      if (!obj) return null;
      if (typeof obj !== 'object') return obj;

      const result = { ...obj };
      
      // Sérialiser les champs spécifiques
      if (result.stock !== undefined) result.stock = result.stock.toString();
      if (result.price !== undefined) result.price = result.price.toString();
      if (result.createdAt instanceof Date) result.createdAt = result.createdAt.toISOString();
      if (result.updatedAt instanceof Date) result.updatedAt = result.updatedAt.toISOString();

      // Sérialiser les objets imbriqués
      Object.keys(result).forEach(key => {
        if (Array.isArray(result[key])) {
          result[key] = result[key].map(item => serializeNested(item));
        } else if (result[key] && typeof result[key] === 'object') {
          result[key] = serializeNested(result[key]);
        }
      });

      return result;
    };

    return serializeNested(product);
  } catch (error) {
    console.error('[SERIALIZE_PRODUCT] Erreur lors de la sérialisation:', error);
    return null;
  }
}

export async function GET(req, context) {
  try {
    console.log('[PRODUCT_GET] Début de la requête');
    const { productId } = await context.params;
    console.log('[PRODUCT_GET] ProductId:', productId);

    if (!productId) {
      console.log('[PRODUCT_GET] ID du produit manquant');
      return NextResponse.json(
        { error: 'ID du produit requis' },
        { status: 400 }
      );
    }

    // Récupérer le produit avec les relations
    console.log('[PRODUCT_GET] Récupération du produit...');
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        store: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      console.log('[PRODUCT_GET] Produit non trouvé');
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les produits similaires
    console.log('[PRODUCT_GET] Récupération des produits similaires...');
    const similarProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        store: { isApproved: true },
      },
      take: 4,
      include: {
        store: {
          select: {
            name: true,
            logo: true,
          },
        },
      },
    });

    // Sérialiser les produits
    console.log('[PRODUCT_GET] Sérialisation des produits...');
    const serializedProduct = serializeProduct(product);
    const serializedSimilarProducts = similarProducts.map(serializeProduct);

    if (!serializedProduct) {
      console.log('[PRODUCT_GET] Erreur lors de la sérialisation du produit');
      return NextResponse.json(
        { error: 'Erreur lors de la sérialisation du produit' },
        { status: 500 }
      );
    }

    console.log('[PRODUCT_GET] Envoi de la réponse');
    return NextResponse.json({
      ...serializedProduct,
      similarProducts: serializedSimilarProducts,
    });
  } catch (error) {
    console.error('[PRODUCT_GET] Erreur détaillée:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération du produit',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const { productId } = params;
    const body = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'ID du produit manquant' },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: body,
      include: {
        store: true,
        category: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCT_PATCH]', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du produit' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { productId } = params;

    if (!productId) {
      return NextResponse.json(
        { error: 'ID du produit manquant' },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PRODUCT_DELETE]', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du produit' },
      { status: 500 }
    );
  }
}
