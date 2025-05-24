import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

/**
 * Fonction pour gérer les BigInt et les convertir en String
 * pour éviter les erreurs de sérialisation
 */
function handleBigInt(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(handleBigInt);
  }
  
  if (typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      result[key] = handleBigInt(obj[key]);
    }
    return result;
  }
  
  return obj;
}

// PATCH - Approuver ou rejeter un produit (pour les managers)
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier si l'utilisateur est connecté et est un manager
    if (!session?.user || session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { productId } = params;
    const { approved } = await request.json();

    console.log(`[MANAGER_PRODUCT_APPROVE] Modification du statut d'approbation pour le produit ${productId} à ${approved ? 'approuvé' : 'rejeté'}`);

    // Vérifier que le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!existingProduct) {
      console.log(`[MANAGER_PRODUCT_APPROVE] Produit non trouvé: ${productId}`);
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    // Mettre à jour le statut d'approbation du produit
    const updatedProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        approved: approved,
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
      },
    });

    // Traiter les BigInt avant de retourner la réponse
    const processedProduct = handleBigInt(updatedProduct);

    console.log(`[MANAGER_PRODUCT_APPROVE] Produit ${productId} ${approved ? 'approuvé' : 'rejeté'} avec succès`);
    return NextResponse.json({ 
      success: true,
      product: processedProduct,
      message: approved ? "Produit approuvé avec succès" : "Produit rejeté avec succès"
    });
  } catch (error) {
    console.error('[MANAGER_PRODUCT_APPROVE] Erreur:', error);
    return NextResponse.json({ 
      success: false,
      error: `Erreur lors de la mise à jour du statut du produit: ${error.message}` 
    }, { status: 500 });
  }
} 