import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth/next";

// Use Prisma as a singleton to avoid connection issues
const globalForPrisma = global;
globalForPrisma.prisma = globalForPrisma.prisma || new PrismaClient();
const prisma = globalForPrisma.prisma;

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      },
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || `${profile.given_name} ${profile.family_name}`,
          email: profile.email,
          image: profile.picture,
          role: "CUSTOMER" // Par défaut, les utilisateurs Google sont des clients
        };
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("NO CREDENTIALS");
          throw new Error("Email et mot de passe requis");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          console.log("USER FOUND:", user);

          if (!user || !user.password) {
            console.log("USER NOT FOUND OR NO PASSWORD");
            throw new Error("Email ou mot de passe incorrect");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.log("PASSWORD INVALID");
            throw new Error("Email ou mot de passe incorrect");
          }

          console.log("LOGIN SUCCESS:", user.email, user.role);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, credentials }) {
      if (account?.provider === "google") {
        try {
          console.log("Google auth attempt for:", user.email);

          // Récupérer le paramètre role de la query string s'il existe
          // Ce paramètre sera ajouté lors de l'appel à signIn dans les pages d'inscription
          let requestedRole = "CUSTOMER";  // Rôle par défaut
          
          if (credentials?.callbackUrl) {
            const url = new URL(credentials.callbackUrl);
            const role = url.searchParams.get("role");
            if (role && ["CUSTOMER", "SELLER"].includes(role)) {
              requestedRole = role;
              console.log("Role requested in callback URL:", requestedRole);
            }
          }

          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            console.log(`Creating new ${requestedRole} user for Google auth:`, user.email);
            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                role: requestedRole,
                emailVerified: new Date(),
                image: user.image,
              },
            });

            // Si c'est un vendeur, créer une boutique
            if (requestedRole === "SELLER") {
              console.log("Creating store for new Google user:", user.email);
              await prisma.store.create({
                data: {
                  name: `${user.name}'s Store`,
                  description: "Description de la boutique",
                  ownerId: newUser.id,
                },
              });
            }

            user.role = requestedRole;
            user.id = newUser.id;
            console.log(`Google auth successful for new ${requestedRole}:`, user.email);
          } else {
            console.log("Google auth for existing user:", user.email);
            user.role = existingUser.role;
            user.id = existingUser.id;
          }
          return true;
        } catch (error) {
          console.error("Error in Google signIn callback:", error);
          return `/auth/error?error=${encodeURIComponent(error.message)}`;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        console.log("JWT CALLBACK ROLE:", user.role);
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
    redirect: async ({ url, baseUrl, token }) => {
      if (url.includes('/login') || url === baseUrl) {
        if (token?.role === 'SELLER') {
          return '/seller/dashboard';
        }
        if (token?.role === 'MANAGER') {
          return '/manager/dashboard';
        }
        return '/dashboard';
      }
      return url;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
    signOut: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60, // Mise à jour toutes les 24 heures
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, metadata) {
      console.error(`Auth error: ${code}`, metadata);
    },
    warn(code) {
      console.warn(`Auth warning: ${code}`);
    },
    debug(code, metadata) {
      console.log(`Auth debug: ${code}`, metadata);
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
