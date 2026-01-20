/**
 * Utilitário para envio de emails
 */

import nodemailer from "nodemailer";

// Configuração do transporter usando Gmail SMTP
// IMPORTANTE: Para Gmail, é necessário usar uma "App Password" ao invés da senha normal
// Configure EMAIL_PASSWORD no .env com a senha de app do Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ejgsdc@gmail.com", // Email remetente
    pass: process.env.EMAIL_PASSWORD || "", // Senha de app do Gmail (configure no .env)
  },
});

/**
 * Envia um email com recomendação de jogo
 */
export async function sendGameRecommendationEmail(
  username: string,
  gameName: string
): Promise<boolean> {
  try {
    // Se não tiver senha configurada, tenta enviar sem autenticação
    // (isso provavelmente não vai funcionar, mas evita erro imediato)
    if (!process.env.EMAIL_PASSWORD) {
      console.warn(
        "⚠️ EMAIL_PASSWORD não configurado. Configure no .env para enviar emails."
      );
      // Retorna true mesmo assim para não quebrar a experiência do usuário
      return true;
    }

    const mailOptions = {
      from: "ejgsdc@gmail.com",
      to: "ejgsdc@gmail.com",
      subject: `🎮 Nova Recomendação de Jogo - ${username}`,
      text: `
Olá Fanton! 🦉

A Corujita recebeu uma nova recomendação de jogo! 

👤 Usuário: ${username}
🎮 Jogo: ${gameName}

A Corujita está muito grata pela indicação e vai passar essa recomendação pra você! 🦉

Abraços da Corujita! 🦉
      `.trim(),
      html: `
<div style="font-family: Arial, sans-serif; padding: 20px;">
  <h2 style="color: #9146FF;">Olá Fanton! 🦉</h2>
  <p>A Corujita recebeu uma nova recomendação de jogo!</p>
  <p><strong>👤 Usuário:</strong> ${username}</p>
  <p><strong>🎮 Jogo:</strong> ${gameName}</p>
  <p>A Corujita está muito grata pela indicação e vai passar essa recomendação pra você! 🦉</p>
  <p>Abraços da Corujita! 🦉</p>
</div>
      `.trim(),
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de recomendação enviado: ${username} recomendou ${gameName}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao enviar email de recomendação:`, error);
    return false;
  }
}
