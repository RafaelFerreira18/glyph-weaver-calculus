/**
 * Banco de desafios do Ano I — Sigilos Primários.
 *
 * Cada desafio representa um problema matemático que a Mestra Nabla
 * propõe à aprendiz. A resposta é desenhada no caderno de sigilos.
 *
 * Estrutura de cada desafio:
 *  - id              : identificador único
 *  - titulo          : nome exibido no painel de desafio
 *  - enunciado       : o problema matemático em linguagem mágica
 *  - dica            : pista exibida no painel (interpretação geométrica)
 *  - respostaCorreta : elemento SpellIR esperado ('fire', 'earth', etc.)
 *  - dialogoDesafio  : falas de Nabla ao apresentar o problema
 *  - dialogoAcerto   : falas de Nabla ao confirmar acerto (ensino do conceito)
 *  - dialogoErro     : mapa elemento → falas de erro específicas + '_padrao'
 *
 * @module game/puzzles/desafios
 */

export const DESAFIOS = [
  // ─────────────────────────────────────────────────────────────────────
  // DESAFIO 1 — Fogo: f(x,y) = x² + y²
  // Conceito: mínimo global, gradiente radial, paraboloide elíptico
  // ─────────────────────────────────────────────────────────────────────
  {
    id: 'ano1_fogo',
    titulo: 'Desafio I — O Vale Central',
    enunciado:
      'Uma superfície mágica que cresce simetricamente em todas as direções a partir da origem, formando um vale circular perfeito. Seu único ponto crítico é na origem — um mínimo. Qual sigilo representa essa função?',
    dica: '💡 Tigela côncava. Det(H) > 0 e fxx > 0 → mínimo local.',
    respostaCorreta: 'fire',

    dialogoDesafio: [
      'Bom dia, aprendiz. É hora do seu primeiro desafio real.',
      'Preciso que você identifique uma superfície mágica específica pelo seu sigilo.',
      'A função que procuro é definida em todo o plano ℝ² — domínio irrestrito.',
      'Ela possui um único ponto crítico na origem (0, 0), onde ∇f = (0, 0).',
      'A matriz Hessiana nesse ponto tem determinante positivo e fxx positivo.',
      'Isso classifica a origem como MÍNIMO LOCAL.',
      'Geometricamente, é uma tigela côncava — quanto mais longe da origem, maior o valor.',
      'Desenhe o sigilo que representa essa superfície!'
    ],

    dialogoAcerto: [
      'Excelente! O Sigilo do Fogo — você acertou, aprendiz!',
      'f(x, y) = x² + y² é o paraboloide elíptico — a tigela de fogo.',
      'Seu gradiente ∇f = (2x, 2y) aponta radialmente para fora da origem.',
      'Na origem: ∇f = (0, 0). A Hessiana é H = [[2, 0], [0, 2]].',
      'Det(H) = 2·2 − 0² = 4 > 0, e fxx = 2 > 0.',
      'Conclusão: MÍNIMO LOCAL na origem. O fogo repousa calmo no centro.'
    ],

    dialogoErro: {
      water: [
        'Quase, aprendiz — mas a Água não é o que procuro.',
        'O Sigilo da Água, e^(−(x²+y²)), tem MÁXIMO na origem.',
        'A Hessiana dela tem fxx = −2 < 0 — concavidade para baixo.',
        'Eu preciso de uma superfície com MÍNIMO — fxx positivo.',
        'Tente novamente. O que forma uma tigela côncava?'
      ],
      earth: [
        'Não, aprendiz. A Terra tem Det(H) = −4 < 0 — é uma sela.',
        'Uma sela sobe em uma direção e desce em outra.',
        'Preciso de um ponto onde Det(H) > 0 E fxx > 0: mínimo puro.',
        'Que sigilo cresce igualmente em x e y?'
      ],
      wind: [
        'O Vento tem infinitos pontos críticos por todo o plano.',
        'Preciso de uma função com EXATAMENTE um ponto crítico: a origem.',
        'Pense mais simples — apenas x e y elevados ao quadrado.',
        'Tente novamente!'
      ],
      light: [
        'A Luz cresce logaritmicamente — cada vez mais devagar.',
        'Embora também tenha mínimo na origem, não é ela que procuro agora.',
        'A função que busco cresce QUADRATICAMENTE: ∇f = (2x, 2y).',
        'O gradiente da Luz é 2x/(x²+y²+1) — bem diferente.',
        'Tente outra vez!'
      ],
      _padrao: [
        'Esse sigilo não é o correto, aprendiz.',
        'Procuro uma superfície com MÍNIMO na origem, crescendo em todas as direções.',
        'Det(H) > 0 e fxx > 0. Que sigilo tem essa propriedade?'
      ]
    }
  },

  // ─────────────────────────────────────────────────────────────────────
  // DESAFIO 2 — Terra: f(x,y) = x² − y²
  // Conceito: ponto de sela, Det(H) < 0, instabilidade
  // ─────────────────────────────────────────────────────────────────────
  {
    id: 'ano1_terra',
    titulo: 'Desafio II — A Sela da Instabilidade',
    enunciado:
      'Uma superfície que sobe como montanha em uma direção e desce como vale na outra. O ponto crítico na origem não é máximo nem mínimo — é uma sela, sinal de instabilidade. Que sigilo é este?',
    dica: '💡 Det(H) < 0 → ponto de sela. Sobe em x, desce em y.',
    respostaCorreta: 'earth',

    dialogoDesafio: [
      'Segundo desafio, aprendiz. Agora entra a instabilidade.',
      'A superfície que procuro tem um ponto crítico na origem — ∇f = (0, 0).',
      'Mas ao calcular a Hessiana, descobrimos algo perturbador.',
      'Det(H) = fxx·fyy − (fxy)² é NEGATIVO nesse ponto.',
      'Um determinante negativo da Hessiana significa: PONTO DE SELA.',
      'A superfície sobe em uma direção e desce em outra — como uma passagem de montanha.',
      'Não é máximo, não é mínimo. É instabilidade pura.',
      'Qual sigilo invoca essa superfície traiçoeira?'
    ],

    dialogoAcerto: [
      'Perfeito! O Sigilo da Terra — o paraboloide hiperbólico!',
      'f(x, y) = x² − y²: sobe ao longo de x, desce ao longo de y.',
      'O gradiente é ∇f = (2x, −2y). O sinal negativo em y é a chave!',
      'Hessiana: H = [[2, 0], [0, −2]]. Det(H) = (2)(−2) − 0² = −4 < 0.',
      'Determinante negativo → PONTO DE SELA na origem.',
      'Nem máximo, nem mínimo. Um equilíbrio instável — perigoso em magia!'
    ],

    dialogoErro: {
      fire: [
        'O Fogo tem Det(H) = 4 > 0 e fxx = 2 > 0: é MÍNIMO.',
        'Mas preciso de Det(H) < 0: ponto de sela.',
        'A função que procuro cresce em x e DECRESCE em y.',
        'Que sinal deve ter o coeficiente de y²?'
      ],
      water: [
        'A Água tem Det(H) = 4 > 0 e fxx = −2 < 0: é MÁXIMO.',
        'Mas quero Det(H) < 0 — sela, não máximo.',
        'Pense: x² − y² sobe em x e desce em y. Que sigilo é esse?'
      ],
      _padrao: [
        'Não é esse, aprendiz.',
        'Procuro Det(H) < 0 na origem: ponto de sela.',
        'A função sobe em uma direção e desce na outra. Qual sigilo representa isso?'
      ]
    }
  },

  // ─────────────────────────────────────────────────────────────────────
  // DESAFIO 3 — Água: f(x,y) = e^(−(x²+y²))
  // Conceito: máximo local, gaussiana, Det(H) > 0 e fxx < 0
  // ─────────────────────────────────────────────────────────────────────
  {
    id: 'ano1_agua',
    titulo: 'Desafio III — O Pico Central',
    enunciado:
      'Uma função que atinge seu valor MÁXIMO na origem e decai exponencialmente em todas as direções — o oposto de uma tigela. Det(H) > 0 e fxx < 0 na origem. Qual sigilo invoca esse pico?',
    dica: '💡 Máximo na origem. fxx < 0 → concavidade para baixo. Decaimento exponencial.',
    respostaCorreta: 'water',

    dialogoDesafio: [
      'Terceiro desafio! Agora o oposto geométrico do que vimos antes.',
      'A superfície que procuro também tem gradiente nulo na origem.',
      'Mas a Hessiana revela algo diferente: fxx = −2 < 0.',
      'Det(H) > 0 e fxx < 0 → MÁXIMO LOCAL na origem.',
      'Em vez de uma tigela côncava, é um pico: o maior valor está no centro.',
      'Ao se afastar da origem em qualquer direção, a função DECAI.',
      'E esse decaimento é exponencial — muito rápido!',
      'Qual sigilo forma esse pico suave e concentrado?'
    ],

    dialogoAcerto: [
      'Belíssimo! O Sigilo da Água — a gaussiana bidimensional!',
      'f(x, y) = e^(−(x²+y²)): máximo 1 na origem, decai para 0 no infinito.',
      '∇f = (−2x·e^Z, −2y·e^Z) onde Z = −(x²+y²). Na origem: ∇f = (0, 0).',
      'Hessiana na origem: H = [[−2, 0], [0, −2]].',
      'Det(H) = (−2)(−2) = 4 > 0 e fxx = −2 < 0 → MÁXIMO LOCAL!',
      'A energia mágica se concentra no pico. Como uma gota d\'água.'
    ],

    dialogoErro: {
      fire: [
        'O Fogo (x²+y²) tem MÍNIMO na origem — tigela côncava.',
        'Mas procuro uma superfície com MÁXIMO: fxx < 0.',
        'A concavidade precisa ser para baixo, não para cima.',
        'Tente novamente!'
      ],
      earth: [
        'A Terra tem Det(H) < 0 — ponto de sela, sem máximo nem mínimo.',
        'Preciso de Det(H) > 0 E fxx < 0: máximo puro na origem.',
        'Pense em decaimento exponencial concentrado no centro...'
      ],
      _padrao: [
        'Não é esse, aprendiz.',
        'Procuro MÁXIMO na origem: Det(H) > 0 e fxx < 0.',
        'Qual função atinge seu maior valor no centro e decai para fora?'
      ]
    }
  },

  // ─────────────────────────────────────────────────────────────────────
  // DESAFIO 4 — Vento: f(x,y) = sin(x) + cos(y)
  // Conceito: infinitos pontos críticos, funções periódicas
  // ─────────────────────────────────────────────────────────────────────
  {
    id: 'ano1_vento',
    titulo: 'Desafio IV — As Ondas Infinitas',
    enunciado:
      'Uma superfície com infinitos pontos críticos espalhados periodicamente pelo plano — picos, vales e selas alternados sem fim. O gradiente oscila com o ritmo de funções trigonométricas. Que sigilo é esse?',
    dica: '💡 Funções periódicas geram infinitos pontos críticos. Seno e cosseno.',
    respostaCorreta: 'wind',

    dialogoDesafio: [
      'Quarto desafio! Este é muito diferente dos anteriores.',
      'Todas as funções que vimos tinham poucos pontos críticos — ou apenas um.',
      'A função que busco agora tem INFINITOS pontos críticos!',
      'Eles se repetem periodicamente pelo plano inteiro, como ondas do mar.',
      'O gradiente ∇f se anula em infinitos pontos: é periódico.',
      'A superfície oscila: máximos de valor 2, mínimos de valor −2, e selas.',
      'Duas funções trigonométricas — uma em x, outra em y.',
      'Qual sigilo captura essa dança periódica e infinita?'
    ],

    dialogoAcerto: [
      'Magnífico! O Sigilo do Vento — a superfície ondulatória!',
      'f(x, y) = sin(x) + cos(y): oscila entre −2 e 2 em todo o plano.',
      '∇f = (cos(x), −sin(y)). O gradiente oscila com a mesma periodicidade.',
      '∇f = (0, 0) quando cos(x) = 0 e sin(y) = 0.',
      'Ou seja: x = π/2 + nπ e y = mπ, para todos os inteiros n, m.',
      'São infinitos pontos críticos! Alguns máximos, alguns mínimos, muitas selas.',
      'O vento nunca para. A magia oscila eternamente pelo plano!'
    ],

    dialogoErro: {
      fire: [
        'O Fogo tem apenas UM ponto crítico em todo o ℝ².',
        'Mas procuro uma função com INFINITOS pontos críticos periódicos.',
        'Funções polinomiais têm finitos pontos críticos.',
        'Funções trigonométricas criam padrões que se repetem. Tente!'
      ],
      earth: [
        'A Terra também tem apenas um ponto crítico: a origem.',
        'Preciso de infinitos pontos críticos periódicos.',
        'Pense em sin e cos — eles oscilam para sempre...',
        'Tente novamente!'
      ],
      _padrao: [
        'Não é esse, aprendiz.',
        'Procuro infinitos pontos críticos periódicos espalhados pelo plano.',
        'Que tipo de função cria padrões que se repetem indefinidamente?'
      ]
    }
  },

  // ─────────────────────────────────────────────────────────────────────
  // DESAFIO 5 — Luz: f(x,y) = ln(x² + y² + 1)
  // Conceito: crescimento logarítmico, mínimo na origem, comparação com Fogo
  // ─────────────────────────────────────────────────────────────────────
  {
    id: 'ano1_luz',
    titulo: 'Desafio V — O Crescimento Moderado',
    enunciado:
      'Como o primeiro sigilo estudado, esta função tem mínimo na origem e cresce em todas as direções. Mas aqui o crescimento desacelera com a distância — cada vez MAIS DEVAGAR. Ao contrário do crescimento quadrático, este é logarítmico. Qual sigilo é este?',
    dica: '💡 Mínimo na origem, crescimento logarítmico. ∇f diminui com a distância.',
    respostaCorreta: 'light',

    dialogoDesafio: [
      'Último desafio do Ano I, aprendiz. Você chegou longe!',
      'A superfície que procuro guarda um segredo sutil.',
      'Como o primeiro sigilo que estudamos, ela tem mínimo na origem: Det(H) > 0 e fxx > 0.',
      'Mas o crescimento é fundamentalmente diferente.',
      'A função x²+y² tem gradiente (2x, 2y) — cresce linearmente com a distância.',
      'A função que busco tem gradiente que DIMINUI conforme você se afasta.',
      'Quanto mais longe da origem, menor o incremento. Esse é o logaritmo.',
      'Qual sigilo representa esse crescimento sábio e moderado?'
    ],

    dialogoAcerto: [
      'Perfeito! O Sigilo da Luz — ln(x² + y² + 1)!',
      'Mínimo 0 na origem, cresce para sempre, mas cada vez mais devagar.',
      '∇f = (2x/(x²+y²+1), 2y/(x²+y²+1)) — o denominador cresce e freia o gradiente.',
      'Hessiana na origem: H = [[2, 0], [0, 2]]. Det(H) = 4 > 0, fxx = 2 > 0.',
      'MÍNIMO LOCAL! Igualzinho ao Fogo na origem — mas o comportamento global difere.',
      'Compare: Fogo cresce como r², Luz cresce como ln(r²+1). Sabedoria é moderação.',
      'Parabéns, aprendiz! Você concluiu os 5 sigilos do Ano I! O Ano II aguarda.'
    ],

    dialogoErro: {
      fire: [
        'O Fogo também tem mínimo na origem — você chegou perto!',
        'Mas o Fogo cresce QUADRATICAMENTE: f = x²+y², ∇f = (2x, 2y).',
        'A função que busco cresce LOGARITMICAMENTE: cada vez mais devagar.',
        'Para x grande, ln(x²+1) cresce muito menos que x².',
        'Tente outra vez!'
      ],
      earth: [
        'A Terra tem sela — Det(H) < 0. Não tem mínimo.',
        'Preciso de mínimo com crescimento logarítmico.',
        'Pense em ln aplicado a x² + y²...'
      ],
      _padrao: [
        'Não é esse sigilo.',
        'Procuro crescimento logarítmico com mínimo na origem.',
        'O gradiente deve diminuir conforme a distância aumenta.',
        'Que sigilo representa essa contenção sábia?'
      ]
    }
  }
];
