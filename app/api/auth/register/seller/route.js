import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { createTransport } from "nodemailer";
import { NextResponse } from "next/server";
import { validatePasswordWithDetails, logPasswordEvent } from "@/lib/password-validator";

const prisma = new PrismaClient();

// Fonction pour générer un code à 6 chiffres
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req) {
  try {
    const body = await req.json();

    // Vérifier les données requises
    const { name, email, password } = body;

    if (!name || !email || !password) {
      logPasswordEvent("registration_failed", {
        reason: "missing_fields",
        email: email || "non_fourni",
      });
      
      return NextResponse.json(
        { message: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logPasswordEvent("registration_failed", {
        reason: "email_exists",
        email,
      });
      
      return NextResponse.json(
        { message: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Valider la force du mot de passe côté serveur
    const passwordIssues = validatePasswordWithDetails(password);
    if (passwordIssues.length > 0) {
      logPasswordEvent("password_validation_failed", {
        email,
        issues: passwordIssues.length,
      });
      
      return NextResponse.json(
        { 
          message: "Le mot de passe ne respecte pas les critères de sécurité",
          issues: passwordIssues 
        },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12); // Augmentation du coût à 12 pour plus de sécurité

    // Générer le code de vérification
    const verificationCode = generateVerificationCode();

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "SELLER",
        emailVerified: null,
        verificationToken: verificationCode,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Créer un store par défaut pour le vendeur
    await prisma.store.create({
      data: {
        name: `${name}'s Store`,
        description: "Description de la boutique",
        ownerId: user.id,
        isApproved: false,
        address: "",
        email: email,
        phone: "",
        logo: "",
        banner: "",
        website: "",
        facebook: "",
        instagram: "",
        rating: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Journaliser la création du compte
    logPasswordEvent("user_created", {
      userId: user.id,
      email: user.email,
      role: "SELLER",
    });

    // Envoyer l'email avec le code
    try {
      const transporter = createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT),
        secure: false,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Vérifiez votre compte",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f97316; text-align: center;">Bienvenue sur notre plateforme!</h1>
            <div style="background-color: #f8f8f8; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <p style="font-size: 16px; color: #333;">Votre code de vérification est :</p>
              <h2 style="color: #f97316; text-align: center; font-size: 32px; letter-spacing: 5px; margin: 20px 0;">${verificationCode}</h2>
              <p style="font-size: 14px; color: #666;">Ce code est valable pendant 24 heures.</p>
            </div>
            <div style="margin-top: 20px; padding: 15px; border-top: 1px solid #ddd;">
              <p style="font-size: 14px; color: #666;">
                Pour votre sécurité, nous utilisons une politique de mot de passe stricte conforme aux normes ISO/IEC 27034-1.
                Si vous n'avez pas créé ce compte, veuillez ignorer cet email.
              </p>
            </div>
          </div>
        `,
      });
      
      logPasswordEvent("verification_email_sent", {
        email: user.email,
      });
    } catch (emailError) {
      console.error("Erreur d'envoi d'email:", emailError);
      logPasswordEvent("email_sending_failed", {
        email: user.email,
        error: emailError.message,
      });
      // Nous continuons malgré l'erreur d'email, mais nous la logons
    }

    return NextResponse.json({
      message: "Compte créé avec succès. Veuillez vérifier votre email pour obtenir le code de vérification.",
      email: user.email,
    }, { status: 201 });
    
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    logPasswordEvent("registration_error", {
      error: error.message,
    });
    return NextResponse.json({ 
      message: "Erreur lors de l'inscription",
      error: error.message 
    }, { status: 500 });
  }
}
