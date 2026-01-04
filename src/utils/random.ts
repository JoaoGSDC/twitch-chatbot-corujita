/**
 * Utilitários para randomização e seleção aleatória
 */

/**
 * Retorna um número aleatório entre min (inclusive) e max (exclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Retorna um elemento aleatório de um array
 */
export function randomElement<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error("Array não pode estar vazio");
  }
  return array[randomInt(0, array.length)];
}

/**
 * Embaralha um array usando o algoritmo Fisher-Yates
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

