/**
 * Módulo de cara ou coroa
 * Processa apostas e determina o resultado
 */

export type CoinSide = "cara" | "coroa";

/**
 * Faz um sorteio aleatório de cara ou coroa
 */
export function flipCoin(): CoinSide {
  return Math.random() < 0.5 ? "cara" : "coroa";
}

/**
 * Normaliza a escolha do usuário (case-insensitive)
 */
export function normalizeCoinChoice(input: string): CoinSide | null {
  const normalized = input.toLowerCase().trim();

  if (normalized === "cara" || normalized === "heads") {
    return "cara";
  }
  if (normalized === "coroa" || normalized === "tails") {
    return "coroa";
  }

  return null;
}

/**
 * Verifica se o usuário acertou
 */
export function didUserWin(
  userChoice: CoinSide,
  coinResult: CoinSide
): boolean {
  return userChoice === coinResult;
}

/**
 * Gera a mensagem de resposta do bot
 */
export function generateCoinFlipResponse(
  username: string,
  userChoice: CoinSide,
  coinResult: CoinSide,
  userWon: boolean
): string {
  const coinResultText =
    coinResult.charAt(0).toUpperCase() + coinResult.slice(1);

  if (userWon) {
    // Usuário acertou
    return `@{username} ${coinResultText}! Acertou fanton7LUL`.replace(
      "{username}",
      username
    );
  } else {
    // Usuário errou
    return `@{username} ${coinResultText}! Não foi dessa vez fanton7Hey`.replace(
      "{username}",
      username
    );
  }
}

