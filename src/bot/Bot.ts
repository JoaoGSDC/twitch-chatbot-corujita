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
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;

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

    // Criar cliente de chat com opções de reconexão
    this.chatClient = new ChatClient({
      authProvider,
      channels: [config.channel],
      // Opções para garantir estabilidade da conexão
      requestMembershipEvents: false,
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
      this.isConnected = true;
      const timestamp = new Date().toISOString();
      console.log(`✅ [${timestamp}] ${config.botUsername} conectada ao canal ${config.channel}`);
      // Limpa timeout de reconexão se existir
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
      // Envia mensagem de boas-vindas após 5 segundos
      this.sendWelcomeMessage();
    });

    // Handler de mensagens
    this.chatClient.onMessage(async (channel: string, user: string, message: string, msg: any) => {
      await this.messageHandler.handleMessage(channel, user, message, msg);
    });

    // Tratamento de desconexão
    this.chatClient.onDisconnect((manually: boolean, reason?: Error) => {
      this.isConnected = false;
      const timestamp = new Date().toISOString();
      console.log(`⚠️ [${timestamp}] Desconectado do chat`);
      if (reason) {
        console.log(`   Motivo: ${reason.message || reason}`);
        if (reason.stack) {
          console.log(`   Stack: ${reason.stack}`);
        }
      }
      console.log(`   Manual: ${manually}`);
      
      // Tenta reconectar automaticamente após desconexão não manual
      if (!manually) {
        console.log("🔄 Tentando reconectar automaticamente em 5 segundos...");
        this.reconnectTimeout = setTimeout(() => {
          this.attemptReconnect();
        }, 5000);
      }
    });

    // Tratamento de erros de autenticação
    this.chatClient.onAuthenticationFailure((msg: string) => {
      const timestamp = new Date().toISOString();
      console.error(`\n❌ [${timestamp}] ERRO DE AUTENTICAÇÃO:`);
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
   * Tenta reconectar o bot manualmente
   */
  private async attemptReconnect(): Promise<void> {
    if (this.isConnected) {
      console.log("✅ Bot já está conectado, cancelando reconexão");
      return;
    }

    try {
      console.log("🔄 Tentando reconectar...");
      await this.chatClient.connect();
    } catch (error: unknown) {
      console.error("❌ Erro ao reconectar:", error);
      // Agenda nova tentativa
      this.reconnectTimeout = setTimeout(() => {
        this.attemptReconnect();
      }, 10000); // 10 segundos
    }
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
      const timestamp = new Date().toISOString();
      console.log(`🔄 [${timestamp}] Iniciando conexão com a Twitch...`);
      await this.chatClient.connect();
      this.isConnected = true;
      // Registra o tempo de início da live quando o bot conecta
      this.messageHandler.setStreamStartTime(new Date());
      console.log(`✅ [${new Date().toISOString()}] Conexão estabelecida com sucesso`);
    } catch (error: unknown) {
      this.isConnected = false;
      const timestamp = new Date().toISOString();
      console.error(`❌ [${timestamp}] Erro ao conectar:`, error);
      throw error;
    }
  }

  /**
   * Desconecta o bot do chat
   */
  async disconnect(): Promise<void> {
    const timestamp = new Date().toISOString();
    console.log(`🛑 [${timestamp}] Desconectando bot...`);
    
    // Limpa timeout de reconexão
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.isConnected = false;
    await this.chatClient.quit();
    console.log(`✅ [${new Date().toISOString()}] Bot desconectado`);
  }

  /**
   * Verifica se o bot está conectado
   */
  getIsConnected(): boolean {
    return this.isConnected;
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

