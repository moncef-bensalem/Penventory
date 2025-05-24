import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// Fonction pour gérer les BigInt dans les objets JSON
function handleBigInt(data) {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

/**
 * Route pour récupérer un produit spécifique pour l'administrateur
 * avec des informations détaillées sur la catégorie, le magasin et le vendeur
 */
export async function GET(request, { params }) {
  try {
    console.log(`[ADMIN_PRODUCT_GET] Récupération du produit ID: ${params.productId}`);
    
    const session = await getServerSession(authOptions);
    
    // Vérifier si l'utilisateur est connecté et est un administrateur
    if (!session?.user || session.user.role !== 'ADMIN') {
      console.log('[ADMIN_PRODUCT_GET] Non autorisé: rôle administrateur requis');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { productId } = params;

    // Récupérer le produit avec les relations nécessaires
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
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
        orderItems: {
          take: 5,
          include: {
            order: {
              select: {
                id: true,
                createdAt: true,
                status: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    if (!product) {
      console.log(`[ADMIN_PRODUCT_GET] Produit avec l'ID ${productId} non trouvé`);
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    // Traiter les BigInt avant de retourner la réponse
    const processedProduct = handleBigInt(product);

    console.log(`[ADMIN_PRODUCT_GET] Produit ${product.name} récupéré avec succès`);
    return NextResponse.json({ product: processedProduct });
  } catch (error) {
    console.error('[ADMIN_PRODUCT_GET] Erreur:', error);
    return NextResponse.json(
      { error: `Erreur lors de la récupération du produit: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * Route pour supprimer un produit spécifique (admin uniquement)
 */
export async function DELETE(request, { params }) {
  try {
    console.log(`[ADMIN_PRODUCT_DELETE] Suppression du produit ID: ${params.productId}`);
    
    const session = await getServerSession(authOptions);
    
    // Vérifier si l'utilisateur est connecté et est un administrateur
    if (!session?.user || session.user.role !== 'ADMIN') {
      console.log('[ADMIN_PRODUCT_DELETE] Non autorisé: rôle administrateur requis');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { productId } = params;

    // Vérifier que le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!existingProduct) {
      console.log(`[ADMIN_PRODUCT_DELETE] Produit avec l'ID ${productId} non trouvé`);
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    // Vérifier si le produit a des commandes associées
    const orderItemsCount = await prisma.orderItem.count({
      where: {
        productId,
      },
    });

    if (orderItemsCount > 0) {
      console.log(`[ADMIN_PRODUCT_DELETE] Le produit a ${orderItemsCount} commandes, avertissement envoyé`);
      // On permet quand même la suppression, mais on envoie un avertissement
      return NextResponse.json({ 
        warning: `Ce produit est associé à ${orderItemsCount} commandes. La suppression peut affecter l'historique des commandes.`,
        canDelete: true,
        orderItemsCount,
      });
    }

    // Supprimer le produit
    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    console.log(`[ADMIN_PRODUCT_DELETE] Produit ID ${productId} supprimé avec succès`);
    return NextResponse.json({ success: true, message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('[ADMIN_PRODUCT_DELETE] Erreur:', error);
    return NextResponse.json(
      { error: `Erreur lors de la suppression du produit: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * Route pour mettre à jour un produit spécifique (admin uniquement)
 */
export async function PATCH(request, { params }) {
  try {
    console.log(`[ADMIN_PRODUCT_PATCH] Mise à jour du produit ID: ${params.productId}`);
    
    const session = await getServerSession(authOptions);
    
    // Vérifier si l'utilisateur est connecté et est un administrateur
    if (!session?.user || session.user.role !== 'ADMIN') {
      console.log('[ADMIN_PRODUCT_PATCH] Non autorisé: rôle administrateur requis');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { productId } = params;
    const body = await request.json();
    
    // Vérifier que le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!existingProduct) {
      console.log(`[ADMIN_PRODUCT_PATCH] Produit avec l'ID ${productId} non trouvé`);
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    const { name, description, price, stock, categoryId, images, storeId } = body;
    
    // Validation des données
    if (!name || !description || !price || !stock) {
      console.log('[ADMIN_PRODUCT_PATCH] Validation échouée: champs requis manquants');
      return NextResponse.json({ 
        error: 'Les champs nom, description, prix et stock sont requis' 
      }, { status: 400 });
    }

    // Vérifier que la catégorie existe si fournie
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });
      
      if (!category) {
        console.log(`[ADMIN_PRODUCT_PATCH] Catégorie avec l'ID ${categoryId} non trouvée`);
        return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 });
      }
    }

    // Vérifier que le magasin existe si fourni
    if (storeId) {
      const store = await prisma.store.findUnique({
        where: { id: storeId }
      });
      
      if (!store) {
        console.log(`[ADMIN_PRODUCT_PATCH] Magasin avec l'ID ${storeId} non trouvé`);
        return NextResponse.json({ error: 'Magasin non trouvé' }, { status: 404 });
      }
    }

    // Vérifier que les images sont fournies
    if (!images || images.length === 0) {
      console.log('[ADMIN_PRODUCT_PATCH] Validation échouée: au moins une image est requise');
      return NextResponse.json({ error: 'Au moins une image est requise pour le produit' }, { status: 400 });
    }

    // Mettre à jour le produit
    const updatedProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId: categoryId || undefined,
        storeId: storeId || undefined,
        images,
      },
    });

    console.log(`[ADMIN_PRODUCT_PATCH] Produit ${updatedProduct.name} mis à jour avec succès`);
    return NextResponse.json({ product: updatedProduct || {} });
  } catch (error) {
    console.error('[ADMIN_PRODUCT_PATCH] Erreur:', error);
    return NextResponse.json(
      { error: `Erreur lors de la mise à jour du produit: ${error.message}` },
      { status: 500 }
    );
  }
}
