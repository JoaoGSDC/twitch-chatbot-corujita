/**
 * Configuração do bot
 * Carrega variáveis de ambiente e valida configurações
 */

import * as fs from "fs";
import * as path from "path";

export interface Config {
  botUsername: string;
  oauthToken: string;
  channel: string;
}

function loadEnvFile(): Record<string, string> {
  const envPath = path.join(process.cwd(), ".env");
  const env: Record<string, string> = {};

  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    const lines = content.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const equalIndex = trimmed.indexOf("=");
      if (equalIndex === -1) continue;

      const key = trimmed.substring(0, equalIndex).trim();
      let value = trimmed.substring(equalIndex + 1).trim();

      // Remove aspas se existirem
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      env[key] = value;
    }
  }

  return env;
}

const env = loadEnvFile();

// Carrega token do .env ou usa o hardcoded (temporário)
const rawToken =
  env.OAUTH_TOKEN ||
  process.env.OAUTH_TOKEN ||
  "jngh02ekz7s4agsjf4xn3n2630p6xl";

export const config: Config = {
  botUsername: "Corujita",
  oauthToken: rawToken,
  channel: env.CHANNEL || process.env.CHANNEL || "fantonlord",
};

// Validação
if (!config.oauthToken) {
  console.error("❌ ERRO: OAUTH_TOKEN não encontrado!");
  console.error("Por favor, configure o arquivo .env com:");
  console.error("OAUTH_TOKEN=oauth:seu_token_aqui");
  process.exit(1);
}

// Aviso se o token não tem o prefixo "oauth:"
if (!config.oauthToken.startsWith("oauth:")) {
  console.warn("⚠️  AVISO: Token OAuth sem prefixo 'oauth:'");
  console.warn("   Certifique-se de que o token está no formato correto");
}

console.log(`✅ Configuração carregada - Canal: ${config.channel}`);
