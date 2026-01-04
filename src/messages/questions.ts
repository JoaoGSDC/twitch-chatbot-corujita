/**
 * Módulo de perguntas com variações que geram assunto para o streamer
 * Todas as perguntas devem incluir o @username do usuário
 */

export interface QuestionTemplate {
  question: string; // Template com {username} placeholder
}

export const questions: QuestionTemplate[] = [
  // Jogos / gameplay (bem naturais)
  {
    question:
      "fala @{username}, que tipo de jogo você curte jogar mais? fanton7Hey",
  },
  {
    question:
      "@{username}, você anda jogando mais pra se divertir ou pra competir mesmo? fanton7Hey",
  },
  {
    question:
      "@{username}, tem algum jogo que sempre acaba voltando a jogar? fanton7Hey",
  },
  {
    question: "@{username}, qual foi o último jogo que te prendeu de verdade?",
  },
  { question: "@{username}, você é mais de jogar sozinho ou com a galera?" },
  {
    question:
      "@{username}, prefere jogo mais calmo ou aquele que já começa no caos? fanton7LUL",
  },
  {
    question:
      "@{username}, tem algum jogo que você ama mas passa raiva ao mesmo tempo? fanton7Hey",
  },
  { question: "@{username}, já teve jogo que você largou e depois voltou?" },
  { question: "@{username}, costuma zerar jogo ou vai jogando até cansar?" },
  { question: "@{username}, qual tipo de jogo mais te prende por horas?" },

  // Experiência assistindo lives
  {
    question:
      "@{username}, você costuma assistir live fazendo outra coisa ou focado mesmo?",
  },
  { question: "@{username}, prefere live mais conversa ou mais gameplay?" },
  { question: "@{username}, o que mais te faz ficar numa live até o fim?" },
  {
    question:
      "@{username}, você curte chat mais caótico ou mais tranquilo? fanton7Hey",
  },
  {
    question: "@{username}, normalmente você fala no chat ou fica mais de boa?",
  },
  {
    question:
      "@{username}, já aconteceu de você entrar numa live e perder a noção do tempo?",
  },
  { question: "@{username}, o que mais te incomoda numa live?" },
  { question: "@{username}, você prefere lives longas ou algo mais direto?" },
  { question: "@{username}, costuma assistir live todo dia ou só quando dá?" },

  // Resenha / cotidiano leve
  { question: "@{username}, hoje foi um dia mais tranquilo ou puxado?" },
  { question: "@{username}, você tá mais cansado ou de boa agora?" },
  {
    question:
      "@{username}, hoje sua paciência tá alta ou já foi de base? fanton7LUL",
  },
  { question: "@{username}, teve algo hoje que te deixou de bom humor?" },
  {
    question:
      "@{username}, quando o dia é ruim, você prefere descansar ou se distrair?",
  },
  { question: "@{username}, você costuma desligar a cabeça como?" },
  {
    question:
      "@{username}, hoje é mais dia de rir ou só existir mesmo? fanton7Hey",
  },

  // Humor / personalidade
  { question: "@{username}, você é mais calmo ou estressa fácil jogando?" },
  { question: "@{username}, costuma rir de coisa besta ou nem tanto?" },
  { question: "@{username}, você é do tipo competitivo até em jogo bobo?" },
  { question: "@{username}, costuma levar jogo muito a sério ou só curtir?" },
  { question: "@{username}, já tiltou feio em algum jogo? fanton7Hey" },
  { question: "@{username}, você é mais persistente ou larga quando enche?" },
  { question: "@{username}, prefere aprender tudo ou ir descobrindo jogando?" },

  // Conteúdo / gosto geral
  {
    question:
      "@{username}, além de jogar, o que você curte fazer pra passar o tempo?",
  },
  {
    question:
      "@{username}, você costuma consumir mais vídeo curto ou live longa?",
  },
  {
    question:
      "@{username}, prefere coisa mais tranquila ou sempre algo animado?",
  },
  {
    question:
      "@{username}, quando sobra tempo, você vai mais pra jogo, série ou vídeo?",
  },
  {
    question:
      "@{username}, você costuma repetir conteúdo que gosta ou sempre buscar coisa nova?",
  },

  // Emoção / conexão (ainda seguro)
  {
    question:
      "@{username}, o que normalmente te anima quando o dia tá meio meh? fanton7Hey",
  },
  {
    question:
      "@{username}, você é do tipo que guarda as coisas ou fala tudo logo?",
  },
  {
    question:
      "@{username}, quando algo dá errado, você ri ou se irrita? fanton7Hey",
  },
  { question: "@{username}, hoje você tá mais de boa ou meio no limite?" },
  { question: "@{username}, costuma se cobrar muito ou deixa fluir?" },

  // Papo mais solto
  {
    question: "@{username}, você curte mais rotina ou gosta quando tudo muda?",
  },
  { question: "@{username}, costuma planejar as coisas ou decide na hora?" },
  { question: "@{username}, você é mais noturno ou funciona melhor de dia?" },
  { question: "@{username}, hoje você tá mais falante ou só acompanhando?" },
  { question: "@{username}, prefere papo mais sério ou zoeira?" },

  // Meta / interação
  { question: "@{username}, o que mais te chama atenção numa live?" },
  {
    question:
      "@{username}, você costuma interagir quando o streamer puxa papo?",
  },
  {
    question:
      "@{username}, prefere quando o streamer lê o chat toda hora ou só às vezes?",
  },
  {
    question:
      "@{username}, você gosta mais quando a live flui ou quando tem muita interação?",
  },

  // Finalizando variações (pra não repetir padrão)
  { question: "@{username}, se fosse escolher agora, jogo difícil ou relax?" },
  { question: "@{username}, você curte desafio ou prefere algo mais de boa?" },
  { question: "@{username}, hoje tá mais pra focar ou só desligar a mente?" },
  {
    question:
      "@{username}, você costuma jogar até cansar ou sabe a hora de parar?",
  },
  {
    question:
      "@{username}, já teve jogo que te surpreendeu de verdade? fanton7Hey",
  },
];

/**
 * Retorna uma pergunta aleatória formatada com o username
 */
export function getRandomQuestion(username: string): string {
  const randomIndex = Math.floor(Math.random() * questions.length);
  const template = questions[randomIndex];
  return template.question.replace("{username}", username);
}
