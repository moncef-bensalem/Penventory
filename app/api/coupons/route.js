import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from '@/lib/prisma';

// Middleware pour vérifier le rôle administrateur
async function checkAdminRole() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return false;
  }
  return true;
}

// Route pour récupérer tous les coupons (admin uniquement)
export async function GET(request) {
  try {
    console.log('[COUPONS_GET] Fetching coupons...');
    
    // Vérifier si l'utilisateur est un administrateur
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      console.log('[COUPONS_GET] Unauthorized: admin role required');
      return NextResponse.json({ error: "Non autorisé: rôle administrateur requis" }, { status: 401 });
    }
    
    const coupons = await prisma.coupon.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('[COUPONS_GET] Found coupons:', coupons.length);
    return NextResponse.json(coupons);
  } catch (error) {
    console.error('[COUPONS_GET] Error:', error);
    return NextResponse.json({ error: `Erreur lors de la récupération des coupons: ${error.message}` }, { status: 500 });
  }
}

// Route pour créer un coupon (admin uniquement)
export async function POST(request) {
  try {
    console.log('[COUPONS_POST] Checking admin authorization...');
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      console.log('[COUPONS_POST] Unauthorized: admin role required');
      return NextResponse.json({ error: "Non autorisé: rôle administrateur requis" }, { status: 401 });
    }
    
    const body = await request.json();
    console.log('[COUPONS_POST] Received data:', body);
    
    const { title, couponCode, expiryDate, discountPercentage, isActive } = body;
    
    if (!title || !couponCode || !expiryDate) {
      console.log('[COUPONS_POST] Validation failed: missing required fields');
      return NextResponse.json({ error: 'Le titre, le code et la date d\'expiration sont requis' }, { status: 400 });
    }

    // Convertir la date en objet Date et vérifier si elle est valide
    const dateObject = new Date(expiryDate);
    if (isNaN(dateObject.getTime())) {
      console.log('[COUPONS_POST] Invalid expiry date format');
      return NextResponse.json({ error: 'Format de date d\'expiration invalide' }, { status: 400 });
    }

    console.log('[COUPONS_POST] Creating coupon with data:', { title, couponCode, expiryDate });
    
    const coupon = await prisma.coupon.create({
      data: {
        title,
        CouponCode: couponCode,
        expiryDate: dateObject,
        discountPercentage: discountPercentage || 0,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    console.log('[COUPONS_POST] Coupon created successfully:', coupon);
    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error('[COUPONS_POST] Error:', error);
    return NextResponse.json({ 
      error: `Erreur lors de la création du coupon: ${error.message}` 
    }, { status: 500 });
  }
}

// Route pour mettre à jour un coupon (admin uniquement)
export async function PUT(request) {
  try {
    console.log('[COUPONS_PUT] Checking admin authorization...');
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      console.log('[COUPONS_PUT] Unauthorized: admin role required');
      return NextResponse.json({ error: "Non autorisé: rôle administrateur requis" }, { status: 401 });
    }
    
    const body = await request.json();
    console.log('[COUPONS_PUT] Received data:', body);
    
    const { id, title, couponCode, expiryDate, discountPercentage, isActive } = body;
    
    if (!id || !title || !couponCode || !expiryDate) {
      console.log('[COUPONS_PUT] Validation failed: missing required fields');
      return NextResponse.json({ error: 'ID, titre, code et date d\'expiration sont requis' }, { status: 400 });
    }

    // Convertir la date en objet Date et vérifier si elle est valide
    const dateObject = new Date(expiryDate);
    if (isNaN(dateObject.getTime())) {
      console.log('[COUPONS_PUT] Invalid expiry date format');
      return NextResponse.json({ error: 'Format de date d\'expiration invalide' }, { status: 400 });
    }

    console.log(`[COUPONS_PUT] Updating coupon ID: ${id}`);
    
    const coupon = await prisma.coupon.update({
      where: {
        id
      },
      data: {
        title,
        CouponCode: couponCode,
        expiryDate: dateObject,
        discountPercentage: discountPercentage !== undefined ? discountPercentage : 0,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    console.log('[COUPONS_PUT] Coupon updated successfully:', coupon);
    return NextResponse.json(coupon);
  } catch (error) {
    console.error('[COUPONS_PUT] Error:', error);
    return NextResponse.json({ error: `Erreur lors de la mise à jour du coupon: ${error.message}` }, { status: 500 });
  }
}

// Route pour supprimer un coupon (admin uniquement)
export async function DELETE(request) {
  try {
    console.log('[COUPONS_DELETE] Checking admin authorization...');
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      console.log('[COUPONS_DELETE] Unauthorized: admin role required');
      return NextResponse.json({ error: "Non autorisé: rôle administrateur requis" }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      console.log('[COUPONS_DELETE] Validation failed: missing ID');
      return NextResponse.json({ error: 'ID de coupon requis' }, { status: 400 });
    }

    console.log(`[COUPONS_DELETE] Deleting coupon ID: ${id}`);
    
    // Vérifier que le coupon existe
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id }
    });

    if (!existingCoupon) {
      console.log(`[COUPONS_DELETE] Coupon with ID ${id} not found`);
      return NextResponse.json({ error: 'Coupon non trouvé' }, { status: 404 });
    }

    // Supprimer le coupon
    await prisma.coupon.delete({
      where: { id }
    });

    console.log('[COUPONS_DELETE] Coupon deleted successfully');
    return NextResponse.json({ success: true, message: 'Coupon supprimé avec succès' });
  } catch (error) {
    console.error('[COUPONS_DELETE] Error:', error);
    return NextResponse.json({ error: `Erreur lors de la suppression du coupon: ${error.message}` }, { status: 500 });
  }
}

// Route pour vérifier la validité d'un code promotionnel (accessible à tous)
export async function PATCH(request) {
  try {
    console.log('[COUPONS_VERIFY] Verifying coupon code...');
    
    const body = await request.json();
    console.log('[COUPONS_VERIFY] Received data:', body);
    
    const { code, storeIds, cartItems, cartTotal } = body;
    
    if (!code) {
      console.log('[COUPONS_VERIFY] Validation failed: missing code');
      return NextResponse.json({ error: 'Code promotionnel requis' }, { status: 400 });
    }

    // Vérification plus stricte: on doit avoir des informations sur les produits du panier
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      console.log('[COUPONS_VERIFY] Validation failed: missing cart items');
      return NextResponse.json({ 
        valid: false, 
        message: 'Information sur les produits du panier requise'
      }, { status: 400 });
    }

    // Collecter les IDs de magasins présents dans le panier
    const cartStoreIds = [...new Set(cartItems
      .map(item => item.store?.id)
      .filter(Boolean))];
    
    console.log('[COUPONS_VERIFY] Cart store IDs:', cartStoreIds);

    // D'abord, chercher dans les promotions de vendeurs
    const promotion = await prisma.promotion.findFirst({
      where: {
        code: code,
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() }
      },
      include: {
        store: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (promotion) {
      console.log('[COUPONS_VERIFY] Found promotion:', promotion);
      
      // TEMPORAIREMENT COMMENTÉ: Vérification si la promotion est valide pour les magasins du panier
      /*
      // Cas spécial : Si le panier ne contient que des produits sans magasin spécifié
      const allItemsHaveNoStore = cartItems.every(item => !item.store);
      
      // Vérifier si la promotion appartient à un des magasins du panier
      // Ou si tous les produits n'ont pas de magasin spécifié, on autorise l'application du code
      if (!cartStoreIds.includes(promotion.storeId) && !allItemsHaveNoStore) {
        return NextResponse.json({ 
          valid: false, 
          message: `Ce code promo est valable uniquement pour les produits de ${promotion.store?.name || 'son magasin'}`
        });
      }
      */
      
      // Vérifier les conditions spécifiques à la promotion
      if (promotion.minPurchase && cartTotal < promotion.minPurchase) {
        return NextResponse.json({ 
          valid: false, 
          message: `Ce code nécessite un achat minimum de ${promotion.minPurchase} DT`
        });
      }

      // TEMPORAIREMENT MODIFIÉ: On calcule le sous-total pour tous les produits
      let storeSubtotal = cartTotal;
      
      /*
      // Si tous les articles n'ont pas de store spécifié, on autorise l'application du code sur tout le panier
      let storeSubtotal = 0;
      
      if (allItemsHaveNoStore) {
        // Calculer le sous-total pour tous les produits sans magasin spécifié
        storeSubtotal = cartItems.reduce((total, item) => {
          const itemPrice = item.discount > 0 
            ? item.price * (1 - item.discount / 100) 
            : item.price;
          return total + (itemPrice * item.quantity);
        }, 0);
      } else {
        // Calculer le sous-total spécifique au magasin de la promotion
        storeSubtotal = cartItems
          .filter(item => (item.store?.id === promotion.storeId) || !item.store)
          .reduce((total, item) => {
            const itemPrice = item.discount > 0 
              ? item.price * (1 - item.discount / 100) 
              : item.price;
            return total + (itemPrice * item.quantity);
          }, 0);
      }
      */
      
      if (storeSubtotal <= 0) {
        return NextResponse.json({ 
          valid: false, 
          message: `Ce code promo ne peut pas être appliqué car vous n'avez pas de produits de ${promotion.store?.name || 'ce magasin'} dans votre panier`
        });
      }

      console.log('[COUPONS_VERIFY] Valid promotion found:', promotion);
      return NextResponse.json({
        valid: true,
        type: 'promotion',
        discount: {
          type: promotion.type,
          value: promotion.value
        },
        store: promotion.store,
        storeId: promotion.storeId,
        message: `Code promo "${code}" appliqué avec succès pour ${promotion.store?.name || 'les produits du magasin'}`
      });
    }

    // Si ce n'est pas une promotion vendeur, chercher dans les coupons administrateur
    const coupon = await prisma.coupon.findFirst({
      where: {
        CouponCode: code,
        isActive: true,
        expiryDate: { gte: new Date() }
      }
    });

    if (coupon) {
      console.log('[COUPONS_VERIFY] Valid coupon found:', coupon);
      return NextResponse.json({
        valid: true,
        type: 'coupon',
        discount: {
          type: 'PERCENTAGE',
          value: coupon.discountPercentage
        },
        message: `Code promo global "${code}" appliqué avec succès`
      });
    }

    // Ni coupon ni promotion trouvé
    console.log('[COUPONS_VERIFY] No valid coupon or promotion found');
    return NextResponse.json({ 
      valid: false, 
      message: 'Code promo invalide ou expiré' 
    });
  } catch (error) {
    console.error('[COUPONS_VERIFY] Error:', error);
    return NextResponse.json({ 
      error: `Erreur lors de la vérification du code: ${error.message}`,
      valid: false 
    }, { status: 500 });
  }
}