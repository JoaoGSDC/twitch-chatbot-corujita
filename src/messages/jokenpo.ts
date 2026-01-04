/**
 * Módulo de jokenpo (pedra, papel, tesoura)
 * Processa jogadas e determina o resultado
 */

export type JokenpoChoice = "pedra" | "papel" | "tesoura";

const choices: JokenpoChoice[] = ["pedra", "papel", "tesoura"];

/**
 * Escolhe uma jogada aleatória para o bot
 */
export function getBotChoice(): JokenpoChoice {
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
}

/**
 * Normaliza a escolha do usuário (case-insensitive)
 */
export function normalizeChoice(input: string): JokenpoChoice | null {
  const normalized = input.toLowerCase().trim();
  
  if (normalized === "pedra" || normalized === "rock") {
    return "pedra";
  }
  if (normalized === "papel" || normalized === "paper") {
    return "papel";
  }
  if (normalized === "tesoura" || normalized === "scissors" || normalized === "tesoura") {
    return "tesoura";
  }
  
  return null;
}

/**
 * Determina o resultado do jogo
 * @returns 1 se o bot ganhou, -1 se o usuário ganhou, 0 se empate
 */
export function determineWinner(
  userChoice: JokenpoChoice,
  botChoice: JokenpoChoice
): number {
  if (userChoice === botChoice) {
    return 0; // Empate
  }

  // Regras do jokenpo:
  // Pedra ganha de tesoura
  // Papel ganha de pedra
  // Tesoura ganha de papel
  
  if (
    (userChoice === "pedra" && botChoice === "tesoura") ||
    (userChoice === "papel" && botChoice === "pedra") ||
    (userChoice === "tesoura" && botChoice === "papel")
  ) {
    return -1; // Usuário ganhou
  }

  return 1; // Bot ganhou
}

/**
 * Gera a mensagem de resposta do bot
 */
export function generateJokenpoResponse(
  username: string,
  userChoice: JokenpoChoice,
  botChoice: JokenpoChoice,
  result: number
): string {
  const botChoiceText = botChoice.charAt(0).toUpperCase() + botChoice.slice(1);
  
  if (result === 1) {
    // Bot ganhou
    return `@{username} ${botChoiceText}! Ganhei fanton7LUL`.replace(
      "{username}",
      username
    );
  } else if (result === -1) {
    // Usuário ganhou
    return `@{username} ${botChoiceText}! Perdi fanton7Hey`.replace(
      "{username}",
      username
    );
  } else {
    // Empate
    return `@{username} ${botChoiceText}! Empate fanton7Hey`.replace(
      "{username}",
      username
    );
  }
}

