/**
 * Mestra Nabla — NPC mentora principal do Atelier do Gradiente.
 *
 * Seu nome referencia o operador nabla (∇), símbolo do gradiente
 * em cálculo vetorial. Ela guia a aprendiz pelos 4 Anos letivos
 * com diálogos que traduzem conceitos matemáticos em metáforas mágicas.
 *
 * @module game/npcs/mestraNabla
 */

export const MestraNabla = {
  nome: 'Mestra Nabla',
  simbolo: '∇',
  titulo: 'Guardiã do Gradiente',
  personagem: 'nabla', // chave para o retrato no DialogueBox

  dialogos: {

    /** Boas-vindas ao Atelier — exibido ao abrir o jogo. */
    boasVindas: [
      'Bem-vinda ao Atelier do Gradiente, jovem aprendiz.',
      'Meu nome é Nabla — como o símbolo ∇ que você aprenderá a dominar.',
      'Neste atelier, cada sigilo que você traçar é, na verdade, uma função matemática f(x, y).',
      'O anel que delimita o sigilo define o domínio da função: a região do plano onde a magia existe.',
      'Trace o anel primeiro. Em seguida, desenhe um sigilo no centro e feche o círculo para despertar o feitiço.',
      'Comece pelo Sigilo do Fogo — o mais fundamental de todos.'
    ],

    /** Ensinamentos para o Sigilo do Fogo: f(x,y) = x² + y² */
    fogo: [
      'Magnífico! Você traçou o Sigilo do Fogo com precisão.',
      'Este sigilo invoca a função f(x, y) = x² + y².',
      'Observe a superfície ao lado — um paraboloide elíptico, como uma tigela côncava perfeitamente simétrica.',
      'O domínio desta função é todo o plano ℝ²: a magia existe em qualquer ponto que você escolher.',
      'Seu gradiente é ∇f = (2x, 2y). Quanto mais longe da origem, maior a força do fogo.',
      'Na origem (0, 0), o gradiente se anula: ∇f = (0, 0). Este é o único ponto crítico.',
      'A matriz Hessiana nesse ponto é H = [[2, 0], [0, 2]].',
      'Det(H) = 2·2 − 0² = 4 > 0, e fxx = 2 > 0. Portanto: MÍNIMO LOCAL.',
      'O fogo repousa calmo na origem... mas desperta com violência à medida que se afasta do centro.'
    ],

    /** Ensinamentos para o Sigilo da Terra: f(x,y) = x² − y² */
    terra: [
      'O Sigilo da Terra... uma superfície traiçoeira, jovem aprendiz.',
      'Ele representa f(x, y) = x² − y² — o famoso paraboloide hiperbólico.',
      'Numa direção, a superfície sobe como uma montanha. Na outra, desce como um vale profundo.',
      'O gradiente é ∇f = (2x, −2y). Veja: o sinal negativo em y indica que a função decresce nessa direção.',
      'Na origem (0, 0), o gradiente se anula: ∇f = (0, 0). Parece um ponto especial...',
      'Calculemos a Hessiana: H = [[2, 0], [0, −2]].',
      'Det(H) = (2)(−2) − 0² = −4 < 0. Determinante negativo!',
      'Conclusão: PONTO DE SELA. Não é máximo nem mínimo — é instabilidade pura.',
      'Em magia, um ponto de sela significa que a energia oscila entre se concentrar e se dispersar. Perigo!'
    ],

    /** Ensinamentos para o Sigilo da Água: f(x,y) = e^(−(x²+y²)) */
    agua: [
      'Que beleza de traçado! Este é o Sigilo da Água.',
      'Sua função é f(x, y) = e^(−(x²+y²)) — uma gaussiana bidimensional.',
      'A superfície parece uma gota d\'água perfeita: máxima no centro, decaindo suavemente para todos os lados.',
      'O gradiente é ∇f = (−2x·e^Z, −2y·e^Z), onde Z = −(x²+y²).',
      'Na origem: ∇f = (0, 0). Ponto crítico identificado. Mas qual é a sua natureza?',
      'A Hessiana na origem é H = [[−2, 0], [0, −2]].',
      'Det(H) = (−2)(−2) − 0² = 4 > 0, e fxx = −2 < 0.',
      'Portanto: MÁXIMO LOCAL! A magia da água se concentra no pico central.',
      'A energia flui do centro para fora — como ondas na superfície de um lago.'
    ],

    /** Ensinamentos para o Sigilo do Vento: f(x,y) = sin(x) + cos(y) */
    vento: [
      'O Sigilo do Vento — uma superfície de beleza ondulatória e infinita.',
      'Ele representa f(x, y) = sin(x) + cos(y). Observe as ondas se propagando em direções perpendiculares.',
      'O gradiente é ∇f = (cos(x), −sin(y)). Ele oscila com o ritmo das próprias ondas.',
      'Esta função tem INFINITOS pontos críticos espalhados pelo plano!',
      'Eles ocorrem onde cos(x) = 0 e −sin(y) = 0 simultaneamente.',
      'Ou seja: x = π/2 + nπ e y = mπ, para quaisquer inteiros n e m.',
      'A Hessiana é H = [[−sin(x), 0], [0, −cos(y)]]. Cada ponto tem um tipo diferente.',
      'Alguns são máximos globais (f = 2), outros mínimos globais (f = −2), e muitos são selas.',
      'O vento nunca para de oscilar — infinitos nexos de poder espalhados pela realidade!'
    ],

    /** Ensinamentos para o Sigilo da Luz: f(x,y) = ln(x² + y² + 1) */
    luz: [
      'Excelente! O Sigilo da Luz, último dos sigilos primários.',
      'Ele invoca f(x, y) = ln(x² + y² + 1) — crescimento logarítmico.',
      'A superfície cresce em todas as direções, mas cada vez mais devagar. A luz se expande com sabedoria.',
      'O gradiente é ∇f = (2x / (x²+y²+1), 2y / (x²+y²+1)).',
      'Na origem: ∇f = (0, 0). Único ponto crítico em todo o plano ℝ².',
      'A Hessiana na origem é H = [[2, 0], [0, 2]].',
      'Det(H) = 4 > 0 e fxx = 2 > 0. Logo: MÍNIMO LOCAL na origem.',
      'Diferente do Sigilo do Fogo (x²+y²), a luz cresce cada vez mais devagar — é a sabedoria do logaritmo.',
      'Parabéns, aprendiz. Você conheceu os 5 sigilos primários. Agora começa o verdadeiro estudo.'
    ]
  }
};
