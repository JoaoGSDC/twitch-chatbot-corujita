/**
 * Módulo de saudações com variações de mensagens de boas-vindas
 * Todas as mensagens devem incluir o @username do usuário
 */

export interface GreetingTemplate {
  message: string; // Template com {username} placeholder
}

export const greetings: GreetingTemplate[] = [
  { message: "Olá @{username}, tudo bem? fanton7Hey" },
  { message: "Oi @{username}, como vai? fanton7Hey" },
  { message: "E aí @{username}, beleza? fanton7Hey" },
  { message: "Fala @{username}, tranquilo? fanton7Hey" },
  { message: "Opa @{username}, tudo certo? fanton7Hey" },
  { message: "Salve @{username}, como está? fanton7Hey" },
  { message: "Hey @{username}, tudo joia? fanton7Hey" },
  { message: "Eae @{username}, de boa? fanton7Hey" },
  { message: "Oi @{username}, como está aí? fanton7Hey" },
  { message: "Olá @{username}, tudo tranquilo? fanton7Hey" },
  { message: "Fala aí @{username}, beleza? fanton7Hey" },
  { message: "Opa @{username}, tudo bem contigo? fanton7Hey" },
  { message: "E aí @{username}, como vai a vida? fanton7Hey" },
  { message: "Salve @{username}, tudo certo por aí? fanton7Hey" },
  { message: "Hey @{username}, como está? fanton7Hey" },
  { message: "Oi @{username}, tudo bem? fanton7Hey" },
  { message: "Olá @{username}, como vai? fanton7Hey" },
  { message: "Eae @{username}, de boa? fanton7Hey" },
  { message: "Fala @{username}, tranquilo? fanton7Hey" },
  { message: "Opa @{username}, tudo certo? fanton7Hey" },
  { message: "Salve @{username}, beleza? fanton7Hey" },
  { message: "Hey @{username}, como está aí? fanton7Hey" },
  { message: "Oi @{username}, tudo joia? fanton7Hey" },
  { message: "Olá @{username}, como vai? fanton7Hey" },
  { message: "E aí @{username}, tudo bem? fanton7Hey" },
  { message: "Fala aí @{username}, tranquilo? fanton7Hey" },
  { message: "Opa @{username}, beleza? fanton7Hey" },
  { message: "Salve @{username}, como está? fanton7Hey" },
  { message: "Hey @{username}, tudo certo? fanton7Hey" },
  { message: "Oi @{username}, de boa? fanton7Hey" },
  { message: "Olá @{username}, como vai a vida? fanton7Hey" },
  { message: "Eae @{username}, tudo bem contigo? fanton7Hey" },
  { message: "Fala @{username}, tranquilo por aí? fanton7Hey" },
  { message: "Opa @{username}, beleza? fanton7Hey" },
  { message: "Salve @{username}, como está? fanton7Hey" },
  { message: "Hey @{username}, tudo joia? fanton7Hey" },
  { message: "Oi @{username}, de boa? fanton7Hey" },
  { message: "Olá @{username}, como vai? fanton7Hey" },
  { message: "E aí @{username}, tudo certo? fanton7Hey" },
  { message: "Fala aí @{username}, beleza? fanton7Hey" },
  { message: "Opa @{username}, como está? fanton7Hey" },
  { message: "Salve @{username}, tranquilo? fanton7Hey" },
  { message: "Hey @{username}, tudo bem? fanton7Hey" },
  { message: "Oi @{username}, como vai aí? fanton7Hey" },
  { message: "Olá @{username}, de boa? fanton7Hey" },
  { message: "Eae @{username}, tudo certo? fanton7Hey" },
  { message: "Fala @{username}, beleza? fanton7Hey" },
  { message: "Opa @{username}, como está? fanton7Hey" },
  { message: "Salve @{username}, tranquilo? fanton7Hey" },
  { message: "Hey @{username}, tudo joia? fanton7Hey" },
  { message: "Oi @{username}, de boa? fanton7Hey" },
  { message: "Olá @{username}, como vai? fanton7Hey" },
  { message: "E aí @{username}, tudo bem contigo? fanton7Hey" },
  { message: "Fala aí @{username}, beleza? fanton7Hey" },
  { message: "Opa @{username}, como está por aí? fanton7Hey" },
  { message: "Salve @{username}, tranquilo? fanton7Hey" },
  { message: "Hey @{username}, tudo certo? fanton7Hey" },
  { message: "Oi @{username}, de boa? fanton7Hey" },
  { message: "Olá @{username}, como vai a vida? fanton7Hey" },
  { message: "Eae @{username}, tudo bem? fanton7Hey" },
  { message: "Fala @{username}, beleza? fanton7Hey" },
  { message: "Opa @{username}, como está? fanton7Hey" },
  { message: "Salve @{username}, tranquilo? fanton7Hey" },
  { message: "Hey @{username}, tudo joia? fanton7Hey" },
];

/**
 * Retorna uma saudação aleatória formatada com o username
 */
export function getRandomGreeting(username: string): string {
  const randomIndex = Math.floor(Math.random() * greetings.length);
  const template = greetings[randomIndex];
  return template.message.replace("{username}", username);
}
