/**
 * Utilitário para acessar a API da Twitch
 */

import { config } from "../config/Config.js";

/**
 * Obtém o jogo atual que está sendo transmitido no canal
 */
export async function getCurrentGame(): Promise<string | null> {
  try {
    // Usa a API pública da Twitch para obter informações do stream
    const response = await fetch(
      `https://decapi.me/twitch/game/${config.channel}`
    );

    if (!response.ok) {
      // Se falhar, tenta método alternativo via API da Twitch
      return await getCurrentGameAlternative();
    }

    const gameName = await response.text();
    
    // Se retornar uma mensagem de erro ou vazio
    if (!gameName || gameName.includes("error") || gameName.includes("not found")) {
      return null;
    }

    return gameName.trim();
  } catch (error) {
    console.error("❌ Erro ao obter jogo atual:", error);
    // Tenta método alternativo
    return await getCurrentGameAlternative();
  }
}

/**
 * Método alternativo para obter o jogo atual usando API direta da Twitch
 */
async function getCurrentGameAlternative(): Promise<string | null> {
  try {
    // Usa um serviço público alternativo
    const response = await fetch(
      `https://api.ivr.fi/twitch/resolve?login=${config.channel}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data?.displayName || null;
  } catch (error) {
    console.error("❌ Erro no método alternativo:", error);
    return null;
  }
}
