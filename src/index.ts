/**
 * Entry point do bot Twitch
 * Inicializa e conecta o bot ao chat
 */

import { Bot } from "./bot/Bot.js";
import { questions } from "./messages/questions.js";
import http from "http";

console.log(
  "\n\n =================================================================================================="
);
console.log(
  " 🚨 Se necessário, acesse: https://twitchtokengenerator.com/ para gerar um novo token OAuth 🚨"
);
console.log(
  " ==================================================================================================\n\n "
);

// Validação de perguntas
if (questions.length === 0) {
  console.error("❌ Erro: Nenhuma pergunta configurada!");
  process.exit(1);
}

// Criar servidor HTTP simples para health check (necessário para Render)
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  if (req.url === "/health" || req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("ok");
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`🌐 Servidor HTTP iniciado na porta ${PORT} (health check)`);
  console.log(`   Endpoint: http://localhost:${PORT}/health`);
});

// Criar e inicializar o bot
const bot = new Bot();

console.log(`🦉 Bot iniciando...`);

// Variável para controlar reconexão
let isConnecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY_MS = 5000; // 5 segundos

/**
 * Função para conectar o bot com retry automático
 */
async function connectBot(): Promise<void> {
  if (isConnecting) {
    console.log("⏳ Conexão já em andamento, aguardando...");
    return;
  }

  isConnecting = true;
  
  try {
    console.log(`🔄 Tentando conectar ao chat da Twitch... (tentativa ${reconnectAttempts + 1})`);
    await bot.connect();
    console.log("✅ Bot conectado com sucesso!");
    reconnectAttempts = 0; // Reset contador em caso de sucesso
  } catch (error: unknown) {
    reconnectAttempts++;
    console.error(`❌ Erro ao conectar (tentativa ${reconnectAttempts}):`, error);
    
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      console.log(`⏳ Tentando reconectar em ${RECONNECT_DELAY_MS / 1000} segundos...`);
      setTimeout(() => {
        isConnecting = false;
        connectBot();
      }, RECONNECT_DELAY_MS);
    } else {
      console.error(`❌ Máximo de tentativas de reconexão atingido (${MAX_RECONNECT_ATTEMPTS})`);
      console.error("   O bot continuará tentando, mas com intervalos maiores...");
      // Continua tentando, mas com intervalo maior
      setTimeout(() => {
        reconnectAttempts = 0; // Reset após muitas tentativas
        isConnecting = false;
        connectBot();
      }, RECONNECT_DELAY_MS * 5); // 25 segundos
    }
  } finally {
    // Libera o lock após um pequeno delay para evitar reconexões muito rápidas
    setTimeout(() => {
      isConnecting = false;
    }, 1000);
  }
}

// Conectar ao chat
connectBot();

// Watchdog de processo - mantém o processo vivo e evita congelamento
let watchdogInterval: NodeJS.Timeout | null = null;

function startWatchdog(): void {
  // Limpa intervalo anterior se existir
  if (watchdogInterval) {
    clearInterval(watchdogInterval);
  }

  // Watchdog roda a cada 60 segundos
  watchdogInterval = setInterval(() => {
    const timestamp = new Date().toISOString();
    const uptime = Math.floor(process.uptime());
    const uptimeMinutes = Math.floor(uptime / 60);
    const uptimeSeconds = uptime % 60;
    
    console.log(`💓 [${timestamp}] Watchdog - Processo vivo | Uptime: ${uptimeMinutes}m ${uptimeSeconds}s`);
    
    // Verifica status da conexão do bot
    const isConnected = bot.getIsConnected();
    if (!isConnected) {
      console.log("⚠️ Bot não está conectado - aguardando reconexão automática...");
    }
  }, 60000); // 60 segundos

  console.log("✅ Watchdog iniciado (verificação a cada 60 segundos)");
}

// Inicia o watchdog
startWatchdog();

// Tratamento de erros não capturados - NÃO encerra o processo
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ [UNHANDLED REJECTION] Erro não tratado:", reason);
  console.error("   Promise:", promise);
  console.error("   Timestamp:", new Date().toISOString());
  // Não encerra o processo - permite que o bot continue tentando
});

process.on("uncaughtException", (error) => {
  console.error("❌ [UNCAUGHT EXCEPTION] Erro não capturado:", error);
  console.error("   Stack:", error.stack);
  console.error("   Timestamp:", new Date().toISOString());
  // Não encerra o processo - permite que o bot continue tentando
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 [SIGINT] Encerrando bot...");
  try {
    // Para o watchdog
    if (watchdogInterval) {
      clearInterval(watchdogInterval);
      watchdogInterval = null;
    }
    await bot.disconnect();
    server.close(() => {
      console.log("✅ Servidor HTTP encerrado");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Erro ao desconectar:", error);
    process.exit(1);
  }
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 [SIGTERM] Encerrando bot...");
  try {
    // Para o watchdog
    if (watchdogInterval) {
      clearInterval(watchdogInterval);
      watchdogInterval = null;
    }
    await bot.disconnect();
    server.close(() => {
      console.log("✅ Servidor HTTP encerrado");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Erro ao desconectar:", error);
    process.exit(1);
  }
});
