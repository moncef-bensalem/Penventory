import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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
 * Route pour récupérer un produit spécifique pour un manager
 * avec des informations détaillées sur la catégorie, le magasin et le vendeur
 */
export async function GET(request, { params }) {
  try {
    console.log(`[MANAGER_PRODUCT_GET] Récupération du produit ID: ${params.productId}`);
    
    const session = await getServerSession(authOptions);
    
    // Vérifier si l'utilisateur est connecté et est un manager
    if (!session?.user || session.user.role !== 'MANAGER') {
      console.log('[MANAGER_PRODUCT_GET] Non autorisé: rôle manager requis');
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
            products: true,
          },
        },
      },
    });

    if (!product) {
      console.log(`[MANAGER_PRODUCT_GET] Produit avec l'ID ${productId} non trouvé`);
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    // Traiter les BigInt avant de retourner la réponse
    const processedProduct = handleBigInt(product);

    console.log(`[MANAGER_PRODUCT_GET] Produit ${product.name} récupéré avec succès`);
    return NextResponse.json({ product: processedProduct });
  } catch (error) {
    console.error('[MANAGER_PRODUCT_GET] Erreur:', error);
    return NextResponse.json(
      { error: `Erreur lors de la récupération du produit: ${error.message}` },
      { status: 500 }
    );
  }
} 