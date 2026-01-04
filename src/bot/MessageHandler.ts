/**
 * Handler de mensagens do chat
 * Processa mensagens recebidas e decide qual resposta enviar
 */

import { ChatClient } from "@twurple/chat";
import {
  getUserStage,
  advanceUserStage,
  userStateManager,
} from "../state/UserState.js";
import { getRandomGreeting } from "../messages/greetings.js";
import { getRandomQuestion } from "../messages/questions.js";
import { config } from "../config/Config.js";
import {
  normalizeChoice,
  getBotChoice,
  determineWinner,
  generateJokenpoResponse,
} from "../messages/jokenpo.js";
import {
  normalizeCoinChoice,
  flipCoin,
  didUserWin,
  generateCoinFlipResponse,
  type CoinSide,
} from "../messages/caraOuCoroa.js";

export class MessageHandler {
  constructor(private chatClient: ChatClient) {}

  /**
   * Verifica se a mensagem contém um comando de jokenpo
   * Retorna a resposta do bot ou null se não for um comando de jokenpo
   */
  private handleJokenpoCommand(
    message: string,
    username: string
  ): string | null {
    const lowerMessage = message.toLowerCase();
    const botMentions = [
      "heycorujita",
      "@heycorujita",
      "corujita",
      "@corujita",
    ];

    // Verifica se a mensagem menciona o bot
    const mentionsBot = botMentions.some((mention) =>
      lowerMessage.includes(mention)
    );

    if (!mentionsBot || !lowerMessage.includes("jokenpo")) {
      return null;
    }

    // Extrai a jogada do usuário
    // Procura por "jokenpo" seguido de uma palavra (pedra, papel, tesoura)
    const jokenpoMatch = lowerMessage.match(/jokenpo\s+(\w+)/);
    if (!jokenpoMatch) {
      return null;
    }

    const userChoiceInput = jokenpoMatch[1];
    const userChoice = normalizeChoice(userChoiceInput);

    if (!userChoice) {
      return null; // Jogada inválida, ignora
    }

    // Processa o jokenpo
    const botChoice = getBotChoice();
    const result = determineWinner(userChoice, botChoice);
    const response = generateJokenpoResponse(
      username,
      userChoice,
      botChoice,
      result
    );

    return response;
  }

  /**
   * Verifica se a mensagem contém um comando de cara ou coroa
   * Retorna a resposta do bot ou null se não for um comando de cara ou coroa
   */
  private handleCoinFlipCommand(
    message: string,
    username: string
  ): string | null {
    const lowerMessage = message.toLowerCase();
    const botMentions = [
      "heycorujita",
      "@heycorujita",
      "corujita",
      "@corujita",
    ];

    // Verifica se a mensagem menciona o bot
    const mentionsBot = botMentions.some((mention) =>
      lowerMessage.includes(mention)
    );

    if (!mentionsBot) {
      return null;
    }

    // Procura por "cara" ou "coroa" na mensagem
    const words = lowerMessage.split(/\s+/);
    let userChoice: CoinSide | null = null;

    for (const word of words) {
      const normalized = normalizeCoinChoice(word);
      if (normalized) {
        userChoice = normalized;
        break;
      }
    }

    if (!userChoice) {
      return null; // Escolha inválida, ignora
    }

    // Processa o cara ou coroa
    const coinResult = flipCoin();
    const userWon = didUserWin(userChoice, coinResult);
    const response = generateCoinFlipResponse(
      username,
      userChoice,
      coinResult,
      userWon
    );

    return response;
  }

  /**
   * Processa uma mensagem recebida do chat
   */
  handleMessage(
    channel: string,
    user: string,
    message: string,
    msg: any
  ): void {
    // Ignora mensagens do próprio bot
    if (user.toLowerCase() === config.botUsername.toLowerCase()) {
      return;
    }

    const username = msg.userInfo.displayName || user || "unknown";

    // Ignora mensagens de usuários sem nome válido
    if (username === "unknown") {
      return;
    }

    // Registra a primeira mensagem do usuário
    userStateManager.registerFirstMessage(username);

    // Verifica se é um comando de jokenpo
    const jokenpoResult = this.handleJokenpoCommand(message, username);
    if (jokenpoResult) {
      this.chatClient.say(channel, jokenpoResult);
      return; // Não processa outras interações quando é jokenpo
    }

    // Verifica se é um comando de cara ou coroa
    const coinFlipResult = this.handleCoinFlipCommand(message, username);
    if (coinFlipResult) {
      this.chatClient.say(channel, coinFlipResult);
      return; // Não processa outras interações quando é cara ou coroa
    }

    const stage = getUserStage(username);

    // Ignora as duas primeiras interações (saudação e pergunta) para fantonlord
    const isFantonlord = username.toLowerCase() === "fantonlord";
    if (isFantonlord && (stage === 0 || stage === 1)) {
      advanceUserStage(username);
      return;
    }

    try {
      // 🟢 Primeira mensagem - Saudação
      if (stage === 0) {
        const greeting = getRandomGreeting(username);
        this.chatClient.say(channel, greeting);
      }

      // 🔵 Segunda mensagem - Pergunta aleatória
      if (stage === 1) {
        const question = getRandomQuestion(username);
        this.chatClient.say(channel, question);
      }

      // Avança o stage após processar a mensagem
      advanceUserStage(username);
    } catch (error) {
      console.error(`❌ Erro ao processar mensagem de ${username}:`, error);
    }
  }
}
