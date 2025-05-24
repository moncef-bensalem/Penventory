import { NextResponse } from "next/server";
import { getSellerStore } from "@/lib/seller-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Récupère la liste des produits pour un magasin spécifique ou un produit spécifique par ID.
 * 
 * @param {Request} request - La requête HTTP.
 * @returns {NextResponse} La réponse HTTP avec la liste des produits ou le produit spécifique.
 */
export async function GET(request) {
  try {
    console.log('[SELLER_PRODUCTS_GET] Début de la requête');
    const sellerData = await getSellerStore();
    
    if (!sellerData) {
      console.log('[SELLER_PRODUCTS_GET] Non autorisé ou magasin non trouvé');
      return NextResponse.json({ error: "Non autorisé ou magasin non trouvé" }, { status: 401 });
    }

    console.log('[SELLER_PRODUCTS_GET] Magasin trouvé:', sellerData.store.id);
    const { store } = sellerData;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Si un ID est fourni, récupérer un produit spécifique
    if (id) {
      console.log(`[SELLER_PRODUCTS_GET] Recherche du produit avec ID: ${id}`);
      const product = await prisma.product.findFirst({
        where: {
          id,
          storeId: store.id
        },
        include: {
          category: true
        }
      });

      if (!product) {
        console.log(`[SELLER_PRODUCTS_GET] Produit avec ID ${id} non trouvé`);
        return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
      }

      // Convertir les BigInt en nombre pour la sérialisation JSON
      const serializedProduct = JSON.parse(
        JSON.stringify(product, (key, value) => 
          typeof value === 'bigint' ? Number(value) : value
        )
      );
      
      console.log(`[SELLER_PRODUCTS_GET] Produit trouvé et renvoyé`);
      return NextResponse.json({ product: serializedProduct });
    }

    // Sinon, récupérer tous les produits du magasin
    console.log(`[SELLER_PRODUCTS_GET] Récupération de tous les produits pour le magasin ${store.id}`);
    const products = await prisma.product.findMany({
      where: {
        storeId: store.id
      },
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`[SELLER_PRODUCTS_GET] ${products.length} produits trouvés`);

    // Convertir les BigInt en nombre pour la sérialisation JSON
    const serializedProducts = JSON.parse(
      JSON.stringify(products, (key, value) => 
        typeof value === 'bigint' ? Number(value) : value
      )
    );

    const response = { products: serializedProducts };
    console.log(`[SELLER_PRODUCTS_GET] Réponse prête à être envoyée`);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('[SELLER_PRODUCTS_GET] Erreur:', error);
    console.error('[SELLER_PRODUCTS_GET] Stack d\'erreur:', error.stack);
    
    // Vérifier si l'erreur vient de Prisma pour plus de détails
    if (error.code && error.meta) {
      console.error('[SELLER_PRODUCTS_GET] Erreur Prisma:', { code: error.code, meta: error.meta });
    }
    
    return NextResponse.json({ 
      error: `Erreur lors de la récupération des produits: ${error.message}`,
      details: error.toString()
    }, { status: 500 });
  }
}

/**
 * Crée un nouveau produit pour un magasin spécifique.
 * 
 * @param {Request} request - La requête HTTP.
 * @returns {NextResponse} La réponse HTTP avec le produit créé.
 */
export async function POST(request) {
  try {
    const sellerData = await getSellerStore();
    if (!sellerData) {
      return NextResponse.json({ error: "Non autorisé ou magasin non trouvé" }, { status: 401 });
    }

    const { store } = sellerData;
    
    let data;
    try {
      data = await request.json();
    } catch (parseError) {
      console.error("Erreur lors de l'analyse du JSON:", parseError);
      return NextResponse.json({ error: "Format de données invalide" }, { status: 400 });
    }
    
    const { name, description, price, stock, categoryId, images } = data;

    // Validation des données
    if (!name || !description || !price || !stock || !categoryId) {
      return NextResponse.json({ 
        error: "Tous les champs obligatoires doivent être remplis",
        missingFields: Object.entries({ name, description, price, stock, categoryId })
          .filter(([_, value]) => !value)
          .map(([key]) => key)
      }, { status: 400 });
    }

    // Vérifier que la catégorie appartient bien au vendeur
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        storeId: store.id
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: "La catégorie spécifiée n'existe pas ou n'appartient pas à votre boutique" },
        { status: 400 }
      );
    }

    // Vérifier que les images sont fournies
    if (!images || images.length === 0) {
      return NextResponse.json({ error: "Au moins une image est requise pour le produit" }, { status: 400 });
    }

    // Stocker directement les URLs d'images telles quelles
    // Nous ne tentons plus d'extraire des identifiants courts
    console.log("Images reçues pour création de produit:", images);

    try {
      const product = await prisma.product.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          stock: parseInt(stock),
          categoryId,
          storeId: store.id,
          images, // Stocker les URLs complètes
          createdAt: new Date(),
          updatedAt: new Date(),
          rating: 0.0 // Valeur par défaut pour le rating
        }
      });

      // Convertir le BigInt en nombre pour la sérialisation JSON
      const serializedProduct = JSON.parse(
        JSON.stringify(product, (key, value) => 
          typeof value === 'bigint' ? Number(value) : value
        )
      );

      return NextResponse.json({ product: serializedProduct });
    } catch (dbError) {
      console.error("Erreur de base de données:", dbError);
      return NextResponse.json({ 
        error: "Erreur lors de la création du produit dans la base de données",
        details: dbError.message
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ 
      error: "Erreur lors de la création du produit",
      details: error.message
    }, { status: 500 });
  }
}

/**
 * Met à jour un produit existant.
 * 
 * @param {Request} request - La requête HTTP.
 * @returns {NextResponse} La réponse HTTP avec le produit mis à jour.
 */
export async function PUT(request) {
  try {
    const sellerData = await getSellerStore();
    if (!sellerData) {
      return NextResponse.json({ error: "Non autorisé ou magasin non trouvé" }, { status: 401 });
    }

    const { store } = sellerData;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID du produit non fourni" }, { status: 400 });
    }

    // Vérifier que le produit existe et appartient au vendeur
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        storeId: store.id
      }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Produit non trouvé ou non autorisé" }, { status: 404 });
    }

    let data;
    try {
      data = await request.json();
    } catch (parseError) {
      console.error("Erreur lors de l'analyse du JSON:", parseError);
      return NextResponse.json({ error: "Format de données invalide" }, { status: 400 });
    }
    
    const { name, description, price, stock, categoryId, images } = data;

    // Validation des données
    if (!name || !description || !price || !stock) {
      return NextResponse.json({ 
        error: "Les champs obligatoires doivent être remplis",
        missingFields: Object.entries({ name, description, price, stock })
          .filter(([_, value]) => !value)
          .map(([key]) => key)
      }, { status: 400 });
    }

    // Si une catégorie est spécifiée, vérifier qu'elle appartient au vendeur
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          storeId: store.id
        }
      });

      if (!category) {
        return NextResponse.json(
          { error: "La catégorie spécifiée n'existe pas ou n'appartient pas à votre boutique" },
          { status: 400 }
        );
      }
    }

    // Vérifier que les images sont fournies
    if (!images || images.length === 0) {
      return NextResponse.json({ error: "Au moins une image est requise pour le produit" }, { status: 400 });
    }

    // Stocker directement les URLs d'images telles quelles
    // Nous ne tentons plus d'extraire des identifiants courts
    console.log("Images reçues pour mise à jour de produit:", images);

    try {
      const updatedProduct = await prisma.product.update({
        where: {
          id
        },
        data: {
          name,
          description,
          price: parseFloat(price),
          stock: parseInt(stock),
          categoryId: categoryId || null,
          images, // Stocker les URLs complètes
          updatedAt: new Date()
        }
      });

      // Convertir les BigInt en nombre pour la sérialisation JSON
      const serializedProduct = JSON.parse(
        JSON.stringify(updatedProduct, (key, value) => 
          typeof value === 'bigint' ? Number(value) : value
        )
      );

      return NextResponse.json({ product: serializedProduct });
    } catch (dbError) {
      console.error("Erreur de base de données:", dbError);
      return NextResponse.json({ 
        error: "Erreur lors de la mise à jour du produit dans la base de données",
        details: dbError.message
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ 
      error: "Erreur lors de la mise à jour du produit",
      details: error.message
    }, { status: 500 });
  }
}

/**
 * Supprime un produit existant.
 * 
 * @param {Request} request - La requête HTTP.
 * @returns {NextResponse} La réponse HTTP avec un message de confirmation.
 */
export async function DELETE(request) {
  try {
    const sellerData = await getSellerStore();
    if (!sellerData) {
      return NextResponse.json({ error: "Non autorisé ou magasin non trouvé" }, { status: 401 });
    }

    const { store } = sellerData;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID du produit non fourni" }, { status: 400 });
    }

    // Vérifier que le produit existe et appartient au vendeur
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        storeId: store.id
      }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Produit non trouvé ou non autorisé" }, { status: 404 });
    }

    // Supprimer le produit
    await prisma.product.delete({
      where: {
        id
      }
    });

    return NextResponse.json({ message: "Produit supprimé avec succès" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ 
      error: "Erreur lors de la suppression du produit",
      details: error.message
    }, { status: 500 });
  }
}
