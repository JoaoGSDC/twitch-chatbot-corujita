/**
 * Classe principal do bot Twitch
 * Gerencia conexão, eventos e handlers
 */

import { ChatClient } from "@twurple/chat";
import { StaticAuthProvider } from "@twurple/auth";
import { config } from "../config/Config.js";
import { MessageHandler } from "./MessageHandler.js";
import { userStateManager } from "../state/UserState.js";

export class Bot {
  private chatClient: ChatClient;
  private messageHandler: MessageHandler;

  constructor() {
    // Preparar token OAuth
    let token = config.oauthToken;
    if (token.startsWith("oauth:")) {
      token = token.substring(6);
    }

    // Criar provedor de autenticação
    const authProvider = new StaticAuthProvider(
      config.botUsername.toLowerCase(),
      token
    );

    // Criar cliente de chat
    this.chatClient = new ChatClient({
      authProvider,
      channels: [config.channel],
    });

    // Criar handler de mensagens
    this.messageHandler = new MessageHandler(this.chatClient);

    // Configurar event handlers
    this.setupEventHandlers();
  }

  /**
   * Configura todos os event handlers do bot
   */
  private setupEventHandlers(): void {
    // Evento de conexão
    this.chatClient.onConnect(() => {
      console.log(`✅ ${config.botUsername} conectada ao canal ${config.channel}`);
      // Envia mensagem de boas-vindas após 5 segundos
      this.sendWelcomeMessage();
    });

    // Handler de mensagens
    this.chatClient.onMessage((channel, user, message, msg) => {
      this.messageHandler.handleMessage(channel, user, message, msg);
    });

    // Tratamento de desconexão
    this.chatClient.onDisconnect(() => {
      console.log(`⚠️ Desconectado do chat`);
    });

    // Tratamento de erros de autenticação
    this.chatClient.onAuthenticationFailure((msg) => {
      console.error("\n❌ ERRO DE AUTENTICAÇÃO:");
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error(msg);
      console.error("\n💡 SOLUÇÃO:");
      console.error("   1. Acesse: https://twitchapps.com/tmi/");
      console.error("   2. Faça login com a conta do bot");
      console.error("   3. Autorize o aplicativo");
      console.error("   4. Copie o token gerado (formato: oauth:xxxxx)");
      console.error("   5. Atualize o arquivo .env ou config.ts");
      console.error("\n⚠️  IMPORTANTE: O token deve ser um 'user access token'");
      console.error("   Tokens 'app access token' não funcionam para chat!");
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    });
  }

  /**
   * Envia mensagem de boas-vindas geral para o chat após 5 segundos
   */
  private sendWelcomeMessage(): void {
    setTimeout(() => {
      const welcomeMessage = "Ae mais uma live, bora que vai começar pessoal! fanton7Hey";
      this.chatClient.say(config.channel, welcomeMessage);
    }, 5000); // 5 segundos
  }

  /**
   * Conecta o bot ao chat da Twitch
   */
  async connect(): Promise<void> {
    try {
      await this.chatClient.connect();
    } catch (error: unknown) {
      console.error("❌ Erro ao conectar:", error);
      throw error;
    }
  }

  /**
   * Desconecta o bot do chat
   */
  async disconnect(): Promise<void> {
    await this.chatClient.quit();
  }

  /**
   * Obtém estatísticas do bot
   */
  getStats() {
    return {
      totalUsers: userStateManager.getTotalUsers(),
      channel: config.channel,
      botUsername: config.botUsername,
    };
  }
}

