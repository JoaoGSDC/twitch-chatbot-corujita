/**
 * Gerenciamento de estado dos usuários no chat
 * Controla em qual etapa da interação cada usuário está
 */

export type UserStage = 0 | 1 | 2;

interface UserState {
  stage: UserStage;
  firstMessageTime: number;
  lastInteractionTime: number;
}

class UserStateManager {
  private userStates = new Map<string, UserState>();

  /**
   * Obtém o stage atual do usuário
   */
  getUserStage(username: string): UserStage {
    const state = this.userStates.get(username.toLowerCase());
    return state?.stage ?? 0;
  }

  /**
   * Avança o stage do usuário
   */
  advanceUserStage(username: string): void {
    const normalizedUsername = username.toLowerCase();
    const current = this.getUserStage(normalizedUsername);
    
    if (current < 2) {
      const newStage = (current + 1) as UserStage;
      const existingState = this.userStates.get(normalizedUsername);
      
      this.userStates.set(normalizedUsername, {
        stage: newStage,
        firstMessageTime: existingState?.firstMessageTime ?? Date.now(),
        lastInteractionTime: Date.now(),
      });
    }
  }

  /**
   * Registra a primeira mensagem do usuário
   */
  registerFirstMessage(username: string): void {
    const normalizedUsername = username.toLowerCase();
    const existingState = this.userStates.get(normalizedUsername);
    
    if (!existingState) {
      this.userStates.set(normalizedUsername, {
        stage: 0,
        firstMessageTime: Date.now(),
        lastInteractionTime: Date.now(),
      });
    } else {
      existingState.lastInteractionTime = Date.now();
    }
  }

  /**
   * Reseta o estado de um usuário específico
   */
  resetUserState(username: string): void {
    this.userStates.delete(username.toLowerCase());
  }

  /**
   * Reseta todos os estados
   */
  resetAllStates(): void {
    this.userStates.clear();
  }

  /**
   * Obtém informações completas do estado do usuário
   */
  getUserState(username: string): UserState | undefined {
    return this.userStates.get(username.toLowerCase());
  }

  /**
   * Obtém o número total de usuários registrados
   */
  getTotalUsers(): number {
    return this.userStates.size;
  }

  /**
   * Limpa estados antigos (usuários que não interagem há muito tempo)
   * Útil para evitar vazamento de memória
   */
  cleanupOldStates(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [username, state] of this.userStates.entries()) {
      if (now - state.lastInteractionTime > maxAgeMs) {
        this.userStates.delete(username);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// Singleton instance
export const userStateManager = new UserStateManager();

// Funções de conveniência para compatibilidade com código antigo
export function getUserStage(username: string): UserStage {
  return userStateManager.getUserStage(username);
}

export function advanceUserStage(username: string): void {
  userStateManager.advanceUserStage(username);
}

export function resetUserStates(): void {
  userStateManager.resetAllStates();
}

