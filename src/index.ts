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
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ 
      status: "ok", 
      service: "twitch-chatbot-corujita",
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`🌐 Servidor HTTP iniciado na porta ${PORT} (health check)`);
});

// Criar e inicializar o bot
const bot = new Bot();

console.log(`🦉 Bot iniciando...`);

// Conectar ao chat
(async () => {
  try {
    await bot.connect();
  } catch (error: unknown) {
    console.error("❌ Erro ao conectar:", error);
    process.exit(1);
  }
})();

// Tratamento de erros não capturados
process.on("unhandledRejection", (error) => {
  console.error("❌ Erro não tratado:", error);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Encerrando bot...");
  try {
    await bot.disconnect();
    server.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao desconectar:", error);
    process.exit(1);
  }
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Encerrando bot (SIGTERM)...");
  try {
    await bot.disconnect();
    server.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao desconectar:", error);
    process.exit(1);
  }
});
