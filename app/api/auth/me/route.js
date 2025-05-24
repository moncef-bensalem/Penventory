import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("session");
    
    if (!sessionCookie?.value) {
      return NextResponse.json(
        { authenticated: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }
    
    const user = await getCurrentUser(sessionCookie.value);
    
    if (!user) {
      return NextResponse.json(
        { authenticated: false, message: 'Utilisateur non trouvé' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image
      }
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Erreur lors de la vérification de l\'authentification' },
      { status: 500 }
    );
  }
}
