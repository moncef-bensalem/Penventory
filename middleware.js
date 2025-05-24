import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    // et essaie d'accéder au dashboard
    if (!token && (pathname.startsWith("/(back-office)/dashboard") || pathname.startsWith("/manager/dashboard"))) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Rediriger vers le dashboard si l'utilisateur est connecté
    // et essaie d'accéder à la page de connexion ou d'inscription
    if (token && (pathname === "/login" || pathname.startsWith("/register"))) {
      // Rediriger en fonction du rôle
      if (token.role === 'ADMIN') {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      } else if (token.role === 'SELLER') {
        return NextResponse.redirect(new URL("/seller/dashboard", req.url));
      } else if (token.role === 'MANAGER') {
        return NextResponse.redirect(new URL("/manager/dashboard", req.url));
      } else if (token.role === 'CUSTOMER') {
        return NextResponse.redirect(new URL("/", req.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Protéger les routes du manager uniquement pour les managers
    if (pathname.startsWith("/manager/") && (!token || token.role !== 'MANAGER')) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
      } else {
        // Rediriger vers le dashboard approprié selon le rôle
        if (token.role === 'ADMIN') {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        } else if (token.role === 'SELLER') {
          return NextResponse.redirect(new URL("/seller/dashboard", req.url));
        } else {
          return NextResponse.redirect(new URL("/", req.url));
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Autoriser l'accès aux pages publiques
        if (pathname === "/login" || pathname.startsWith("/register")) {
          return true;
        }

        // Protéger les routes du dashboard
        if (pathname.startsWith("/(back-office)/dashboard")) {
          return !!token;
        }

        // Protéger les routes du manager
        if (pathname.startsWith("/manager/")) {
          return !!token && token.role === 'MANAGER';
        }

        // Autoriser l'accès aux autres pages
        return true;
      },
    },
  }
);

// Protéger toutes les routes du dashboard et gérer les pages d'authentification
export const config = {
  matcher: [
    "/(back-office)/dashboard/:path*",
    "/manager/:path*",
    "/login",
    "/register/:path*"
  ]
};
