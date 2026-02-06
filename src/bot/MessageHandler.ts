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
import { getCurrentGame } from "../utils/twitchApi.js";
import { sendGameRecommendationEmail } from "../utils/email.js";

export class MessageHandler {
  private streamStartTime: Date | null = null;
  private isWaitingMode: boolean = false;
  private usersNotifiedInWaitingMode: Set<string> = new Set();
  private readonly RESPONSE_DELAY_MIN_MS = 2000; // 2 segundos mínimo
  private readonly RESPONSE_DELAY_MAX_MS = 4000; // 4 segundos máximo

  constructor(private chatClient: ChatClient) { }

  /**
   * Define o tempo de início da live
   */
  setStreamStartTime(startTime: Date): void {
    this.streamStartTime = startTime;
  }

  /**
   * Envia uma mensagem no chat com delay opcional
   * @param channel - Canal do chat
   * @param message - Mensagem a ser enviada
   * @param isCommand - Se true, envia imediatamente (sem delay). Se false, adiciona delay aleatório
   */
  private async sayWithDelay(
    channel: string,
    message: string,
    isCommand: boolean = false
  ): Promise<void> {
    if (isCommand) {
      // Comandos são enviados imediatamente sem delay
      this.chatClient.say(channel, message);
    } else {
      // Respostas normais têm delay aleatório para parecer mais humanizado
      const delayMs =
        Math.floor(
          Math.random() *
          (this.RESPONSE_DELAY_MAX_MS - this.RESPONSE_DELAY_MIN_MS)
        ) + this.RESPONSE_DELAY_MIN_MS;

      await new Promise((resolve) => setTimeout(resolve, delayMs));
      this.chatClient.say(channel, message);
    }
  }

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
   * Verifica se a mensagem contém o comando !social
   * Retorna a resposta do bot com as redes sociais ou null se não for o comando
   */
  private handleSocialCommand(message: string): string | null {
    const lowerMessage = message.toLowerCase().trim();

    // Verifica se é o comando !social
    if (lowerMessage === "!social" || lowerMessage === "!Social") {
      return "Oii! 🦉 Aqui estão as redes sociais do fantonlord: 📺 YouTube: https://www.youtube.com/c/FantonLord | 📷 Instagram: https://www.instagram.com/fanton.lord/ | 💬 Discord: https://discord.gg/b6N8HqhR | 🐦 Twitter: https://x.com/fantonlord | Segue lá pra não perder nada! fanton7Hey";
    }

    return null;
  }

  /**
   * Verifica se a mensagem contém o comando !tempo
   * Retorna a resposta do bot com o tempo da live ou null se não for o comando
   */
  private handleTempoCommand(message: string): string | null {
    const lowerMessage = message.toLowerCase().trim();

    if (lowerMessage === "!tempo" || lowerMessage === "!Tempo") {
      if (!this.streamStartTime) {
        return "Oii! 🦉 A live ainda não começou! Ou eu esqueci de marcar o horário... ups! fanton7Hey";
      }

      const now = new Date();
      const diffMs = now.getTime() - this.streamStartTime.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(diffSeconds / 3600);
      const minutes = Math.floor((diffSeconds % 3600) / 60);
      const seconds = diffSeconds % 60;

      let timeString = "";
      if (hours > 0) {
        timeString += `${hours}h `;
      }
      if (minutes > 0 || hours > 0) {
        timeString += `${minutes}m `;
      }
      timeString += `${seconds}s`;

      return `Oii! 🦉 A live está rolando há ${timeString.trim()}! Que loucura, né? fanton7Hey`;
    }

    return null;
  }

  /**
   * Verifica se a mensagem contém o comando !discord
   * Retorna a resposta do bot com o link do discord ou null se não for o comando
   */
  private handleDiscordCommand(message: string): string | null {
    const lowerMessage = message.toLowerCase().trim();

    if (lowerMessage === "!discord" || lowerMessage === "!Discord") {
      return "Oii! 🦉 Vem pro nosso Discord, a galera lá é muito legal! 💬 https://discord.gg/b6N8HqhR | Junta aí com a gente! fanton7Hey";
    }

    return null;
  }

  /**
   * Verifica se a mensagem contém o comando !holy
   * Retorna a resposta do bot com o link do discord do Tropinha do Holy ou null se não for o comando
   */
  private handleHolyCommand(message: string): string | null {
    const lowerMessage = message.toLowerCase().trim();

    if (lowerMessage === "!holy" || lowerMessage === "!Holy") {
      return "Oii! 🦉 Quer jogar com a gente? Entra no Tropinha do Holy! É o server de Minecraft onde a gente se junta pra jogar vários jogos juntos! 🎮 https://discord.gg/F7g8CJ36RF | Bora lá! fanton7Hey";
    }

    return null;
  }

  /**
   * Verifica se a mensagem contém o comando !comandos
   * Retorna a resposta do bot com a lista de comandos ou null se não for o comando
   */
  private handleComandosCommand(message: string): string | null {
    const lowerMessage = message.toLowerCase().trim();

    if (lowerMessage === "!comandos" || lowerMessage === "!Comandos") {
      return "Oii! 🦉 Aqui estão os comandos que eu sei: !social (redes sociais) | !tempo (tempo da live) | !game (jogo atual) | !discord (link do discord) | !holy (server do Tropinha do Holy) | !recomendar [NOME_JOGO] (recomendar um jogo) | !comandos (essa listinha aqui!) | Jokenpo e Cara ou Coroa (me mencione + o comando) | Espero que seja útil! fanton7Hey";
    }

    return null;
  }

  /**
   * Verifica se a mensagem contém o comando !game
   * Retorna a resposta do bot com o jogo atual ou null se não for o comando
   */
  private async handleGameCommand(message: string): Promise<string | null> {
    const lowerMessage = message.toLowerCase().trim();

    if (lowerMessage === "!game" || lowerMessage === "!Game") {
      try {
        const currentGame = await getCurrentGame();

        if (!currentGame) {
          return "Oii! 🦉 Não consegui descobrir qual jogo está rolando agora... 😢 Mas se quiser recomendar algum jogo legal, digite !recomendar [NOME_JOGO] que eu vou deixar avisado para o Fanton! fanton7Hey";
        }

        return `Oii! 🦉 O jogo que está rolando agora é: ${currentGame}! Gostaria de recomendar algum jogo? Digite !recomendar [NOME_JOGO] que eu vou deixar avisado para o Fanton! fanton7Hey`;
      } catch (error) {
        console.error("❌ Erro ao obter jogo atual:", error);
        return "Oii! 🦉 Não consegui descobrir qual jogo está rolando agora... 😢 Mas se quiser recomendar algum jogo legal, digite !recomendar [NOME_JOGO] que eu vou deixar avisado para o Fanton! fanton7Hey";
      }
    }

    return null;
  }

  /**
   * Verifica se a mensagem contém o comando !recomendar
   * Retorna a resposta do bot agradecendo ou null se não for o comando
   */
  private async handleRecomendarCommand(
    message: string,
    username: string
  ): Promise<string | null> {
    const lowerMessage = message.toLowerCase().trim();

    // Verifica se é o comando !recomendar seguido de um nome de jogo
    const match = message.match(/^!recomendar\s+(.+)$/i);

    if (match) {
      const gameName = match[1].trim();

      if (!gameName || gameName.length === 0) {
        return "Oii! 🦉 Você precisa digitar o nome do jogo! Tipo: !recomendar Minecraft fanton7Hey";
      }

      // Envia o email de recomendação
      const emailSent = await sendGameRecommendationEmail(username, gameName);

      if (emailSent) {
        return `Oii! 🦉 Obrigada pela recomendação, ${username}! 💜 Muito obrigada por recomendar "${gameName}"! Já deixei avisado para o Fanton, ele vai adorar saber! Se você tem mais alguma recomendação, pode mandar! fanton7Hey`;
      } else {
        return `Oii! 🦉 Obrigada pela recomendação, ${username}! 💜 Anotei aqui que você recomendou "${gameName}"! Vou passar pro Fanton em breve! fanton7Hey`;
      }
    }

    return null;
  }

  /**
   * Verifica se o fantonlord está ativando ou desativando o modo "já volto"
   * Retorna a resposta do bot ou null se não for esse comando
   */
  private handleWaitingModeCommand(
    message: string,
    username: string
  ): string | null {
    const lowerMessage = message.toLowerCase();
    const lowerUsername = username.toLowerCase();

    // Só processa se for o fantonlord
    if (lowerUsername !== "fantonlord") {
      return null;
    }

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

    // Verifica se contém "já volto" ou variações
    if (
      lowerMessage.includes("já volto") ||
      lowerMessage.includes("ja volto")
    ) {
      this.isWaitingMode = true;
      this.usersNotifiedInWaitingMode.clear();
      return "Beleza Fanton, vou ficar esperando! fanton7Hey";
    }

    // Verifica se contém "voltei" ou variações
    if (lowerMessage.includes("voltei")) {
      this.isWaitingMode = false;
      this.usersNotifiedInWaitingMode.clear();
      return "Seja bem vindo de volta Fanton! fanton7Hey"; // Não precisa responder quando volta
    }

    return null;
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
  async handleMessage(
    channel: string,
    user: string,
    message: string,
    msg: any
  ): Promise<void> {
    // Ignora mensagens do próprio bot
    if (user.toLowerCase() === config.botUsername.toLowerCase()) {
      return;
    }

    const username = msg.userInfo.displayName || user || "unknown";

    // Ignora mensagens da própria Corujita (verifica tanto username quanto displayName)
    const normalizedUsername = username.toLowerCase();
    const normalizedUser = user.toLowerCase();
    if (
      normalizedUser === "corujita" ||
      normalizedUsername === "corujita" ||
      normalizedUser.includes("corujita") ||
      normalizedUsername.includes("corujita")
    ) {
      return;
    }

    // Ignora mensagens do StreamElements
    if (
      normalizedUser === "streamelements" ||
      normalizedUsername === "streamelements" ||
      normalizedUser === "streamelementsbot" ||
      normalizedUsername === "streamelementsbot"
    ) {
      return;
    }

    // Ignora mensagens de usuários sem nome válido
    if (username === "unknown") {
      return;
    }

    // Registra a primeira mensagem do usuário
    userStateManager.registerFirstMessage(username);

    // Verifica se é o comando !comandos
    const comandosResult = this.handleComandosCommand(message);
    if (comandosResult) {
      await this.sayWithDelay(channel, comandosResult, true); // true = comando, sem delay
      return;
    }

    // Verifica se é o comando !social
    const socialResult = this.handleSocialCommand(message);
    if (socialResult) {
      await this.sayWithDelay(channel, socialResult, true); // true = comando, sem delay
      return; // Não processa outras interações quando é !social
    }

    // Verifica se é o comando !tempo
    const tempoResult = this.handleTempoCommand(message);
    if (tempoResult) {
      await this.sayWithDelay(channel, tempoResult, true); // true = comando, sem delay
      return;
    }

    // Verifica se é o comando !discord
    const discordResult = this.handleDiscordCommand(message);
    if (discordResult) {
      await this.sayWithDelay(channel, discordResult, true); // true = comando, sem delay
      return;
    }

    // Verifica se é o comando !holy
    const holyResult = this.handleHolyCommand(message);
    if (holyResult) {
      await this.sayWithDelay(channel, holyResult, true); // true = comando, sem delay
      return;
    }

    // Verifica se é o comando !game
    const gameResult = await this.handleGameCommand(message);
    if (gameResult) {
      await this.sayWithDelay(channel, gameResult, true); // true = comando, sem delay
      return;
    }

    // Verifica se é o comando !recomendar
    const recomendarResult = await this.handleRecomendarCommand(message, username);
    if (recomendarResult) {
      await this.sayWithDelay(channel, recomendarResult, true); // true = comando, sem delay
      return;
    }

    // Verifica se é um comando de jokenpo
    const jokenpoResult = this.handleJokenpoCommand(message, username);
    if (jokenpoResult) {
      await this.sayWithDelay(channel, jokenpoResult, true); // true = comando, sem delay
      return; // Não processa outras interações quando é jokenpo
    }

    // Verifica se é um comando de cara ou coroa
    const coinFlipResult = this.handleCoinFlipCommand(message, username);
    if (coinFlipResult) {
      await this.sayWithDelay(channel, coinFlipResult, true); // true = comando, sem delay
      return; // Não processa outras interações quando é cara ou coroa
    }

    // Verifica se é o comando de modo "já volto" do fantonlord
    const waitingModeResult = this.handleWaitingModeCommand(message, username);
    if (waitingModeResult) {
      await this.sayWithDelay(channel, waitingModeResult, true); // true = comando, sem delay
      return;
    }

    // Se o fantonlord disse "voltei", o handleWaitingModeCommand já desativou o modo
    // Não precisa fazer nada aqui, apenas continuar o processamento normal

    const stage = getUserStage(username);

    // Ignora as duas primeiras interações (saudação e pergunta) para fantonlord
    const isFantonlord = username.toLowerCase() === "fantonlord";
    if (isFantonlord && (stage === 0 || stage === 1)) {
      advanceUserStage(username);
      return;
    }

    try {
      // Se estiver no modo "já volto"
      if (this.isWaitingMode) {
        // Se for a primeira mensagem do usuário e ainda não foi notificado
        if (stage === 0 && !this.usersNotifiedInWaitingMode.has(username.toLowerCase())) {
          const waitingMessage = `Oi @${username}, o Fanton já volta, tá bom? Espere só um pouquinho fanton7Hey`;
          await this.sayWithDelay(channel, waitingMessage, false); // false = resposta normal, com delay
          this.usersNotifiedInWaitingMode.add(username.toLowerCase());
          advanceUserStage(username);
          return;
        }
        // Se não for primeira mensagem ou já foi notificado, apenas avança o stage sem responder
        advanceUserStage(username);
        return;
      }

      // 🟢 Primeira mensagem - Saudação (apenas se não estiver no modo "já volto")
      if (stage === 0) {
        const greeting = getRandomGreeting(username);
        await this.sayWithDelay(channel, greeting, false); // false = resposta normal, com delay
      }

      // 🔵 Segunda mensagem - Pergunta aleatória (apenas se não estiver no modo "já volto")
      if (stage === 1) {
        const question = getRandomQuestion(username);
        await this.sayWithDelay(channel, question, false); // false = resposta normal, com delay
      }

      // Avança o stage após processar a mensagem
      advanceUserStage(username);
    } catch (error) {
      console.error(`❌ Erro ao processar mensagem de ${username}:`, error);
    }
  }
}
