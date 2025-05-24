import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    // Récupérer le paramètre role de l'URL si présent
    const url = new URL(request.url);
    const requestedRole = url.searchParams.get("role");
    
    // Récupérer la session de l'utilisateur
    const session = await getServerSession(authOptions);
    
    // Vérifier si l'utilisateur est connecté
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL));
    }
    
    // Si on a un paramètre role et que c'est une nouvelle inscription via Google,
    // mettre à jour le rôle de l'utilisateur si nécessaire
    if (requestedRole && ["CUSTOMER", "SELLER"].includes(requestedRole)) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
      
      // Si c'est une authentification récente (moins de 30 secondes)
      const isRecentAuth = user.updatedAt && 
        (new Date().getTime() - new Date(user.updatedAt).getTime()) < 30000;
      
      // Si le rôle demandé est différent du rôle actuel et que c'est une authentification récente,
      // mettre à jour le rôle
      if (isRecentAuth && user.role !== requestedRole) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: requestedRole }
        });
        
        // Si le nouveau rôle est SELLER et qu'il n'a pas de boutique, en créer une
        if (requestedRole === "SELLER") {
          const storeExists = await prisma.store.findUnique({
            where: { ownerId: user.id }
          });
          
          if (!storeExists) {
            await prisma.store.create({
              data: {
                name: `${user.name}'s Store`,
                description: "Description de la boutique",
                ownerId: user.id,
              },
            });
          }
        }
        
        // Mettre à jour la session
        session.user.role = requestedRole;
      }
    }
    
    // Rediriger en fonction du rôle
    const role = session.user.role;
    
    if (role === "CUSTOMER") {
      return NextResponse.redirect(new URL('/', process.env.NEXTAUTH_URL));
    } else if (role === "SELLER") {
      return NextResponse.redirect(new URL('/seller/dashboard', process.env.NEXTAUTH_URL));
    } else if (role === "MANAGER") {
      return NextResponse.redirect(new URL('/manager/dashboard', process.env.NEXTAUTH_URL));
    } else if (role === "ADMIN") {
      return NextResponse.redirect(new URL('/dashboard', process.env.NEXTAUTH_URL));
    } else {
      return NextResponse.redirect(new URL('/dashboard', process.env.NEXTAUTH_URL));
    }
  } catch (error) {
    console.error('Erreur lors de la redirection:', error);
    // En cas d'erreur, rediriger vers la page de connexion
    return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL));
  }
}
