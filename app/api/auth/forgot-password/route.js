import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: "Email requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Pour des raisons de sécurité, ne pas indiquer que l'email n'existe pas
      // Simuler un délai pour éviter les attaques par timing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json(
        { message: "Si cet email existe, un code de vérification a été envoyé." },
        { status: 200 }
      );
    }

    // Générer un code à 6 chiffres
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Créer un token de vérification complet avec type et date d'expiration
    const tokenData = {
      type: "reset_password",
      token: verificationCode,
      expires: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    };
    
    // Mettre à jour l'utilisateur avec le token de vérification - stocker en JSON
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: JSON.stringify(tokenData)
      },
    });

    console.log("Code généré pour", email, ":", verificationCode);

    // Envoyer l'email avec le code de vérification
    await sendEmail({
      to: email,
      subject: "Code de vérification pour réinitialisation de mot de passe PENVENTORY",
      text: `Votre code de vérification pour réinitialiser votre mot de passe est : ${verificationCode}. Ce code est valide pendant 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">Réinitialisation de mot de passe</h2>
          <p>Bonjour ${user.name},</p>
          <p>Vous avez demandé à réinitialiser votre mot de passe sur PENVENTORY.</p>
          <p>Voici votre code de vérification à 6 chiffres :</p>
          <div style="margin: 20px 0; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; background-color: #f3f4f6; padding: 15px; border-radius: 5px; display: inline-block;">
              ${verificationCode}
            </div>
          </div>
          <p>Entrez ce code sur la page de vérification pour continuer la procédure de réinitialisation de mot de passe.</p>
          <p>Ce code est valide pendant 15 minutes.</p>
          <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
          <p>Cordialement,<br>L'équipe PENVENTORY</p>
        </div>
      `
    });

    return NextResponse.json(
      { message: "Code de vérification envoyé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de l'envoi du code de vérification:", error);
    
    return NextResponse.json(
      { message: "Une erreur est survenue lors de l'envoi du code de vérification" },
      { status: 500 }
    );
  }
} 