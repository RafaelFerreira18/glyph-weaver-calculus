/**
 * MathTeacher — módulo ponte entre reconhecimento de sigilos e ensino de cálculo.
 *
 * Quando um sigilo é reconhecido, este módulo verifica se é a resposta correta
 * para o desafio atual (via PuzzleManager) e responde de três formas:
 *
 *  - CORRETO  → revela superfície 3D, exibe info matemática, inicia diálogo
 *               de acerto e avança o puzzle ao final do diálogo.
 *  - ERRADO   → inicia diálogo de erro específico para o sigilo desenhado.
 *  - SEM_DESAFIO → comportamento original: ensina o conceito do sigilo.
 *
 * @module game/mathTeacher
 */

import { Scene3D } from '../render/scene3D.js';
import { MestraNabla } from './npcs/mestraNabla.js';

/**
 * Dados pedagógicos pré-computados para cada sigilo primário.
 * Chave: elemento conforme retornado pelo SpellIR ('fire', 'water', etc.)
 */
const SIGILOS = {
  fire: {
    nome: 'Fogo',
    emoji: '🔥',
    expressao: 'x^2 + y^2',
    funcao: 'f(x, y) = x² + y²',
    tipo: 'Paraboloide Elíptico',
    // Derivadas parciais: taxa de variação em cada direção
    derivadas: {
      fx: '∂f/∂x = 2x',
      fy: '∂f/∂y = 2y',
      explicacao: 'A função cresce 2x por unidade em x, e 2y por unidade em y.'
    },
    // Gradiente: vetor que aponta na direção de maior crescimento
    gradiente: {
      formula: '∇f = (2x, 2y)',
      explicacao: 'Na origem ∇f = (0,0). Longe dela, aponta radialmente para fora — o fogo cresce para todos os lados igualmente.'
    },
    // Hessiana: matriz das derivadas segundas — revela a curvatura
    hessiana: {
      formula: 'H = [[2, 0], [0, 2]]',
      det: 'Det(H) = 2·2 − 0² = 4',
      fxx: 'fxx = 2 > 0',
      explicacao: 'Det(H) > 0 e fxx > 0 → curvatura côncava para cima em toda direção.'
    },
    // Classificação do ponto crítico pelo teste da segunda derivada
    pontosCriticos: [{
      x: 0, y: 0, tipo: 'min',
      classificacao: 'MÍNIMO LOCAL: a superfície sobe em todas as direções a partir de (0,0).'
    }],
    dialogosChave: 'fogo'
  },
  earth: {
    nome: 'Terra',
    emoji: '🌍',
    expressao: 'x^2 - y^2',
    funcao: 'f(x, y) = x² − y²',
    tipo: 'Paraboloide Hiperbólico',
    derivadas: {
      fx: '∂f/∂x = 2x',
      fy: '∂f/∂y = −2y',
      explicacao: 'Sinal positivo em x (cresce) e negativo em y (decresce). Direções opostas!'
    },
    gradiente: {
      formula: '∇f = (2x, −2y)',
      explicacao: 'O gradiente aponta para direções opostas em x e y — instabilidade pura.'
    },
    hessiana: {
      formula: 'H = [[2, 0], [0, −2]]',
      det: 'Det(H) = 2·(−2) − 0² = −4',
      fxx: 'fxx = 2',
      explicacao: 'Det(H) < 0 → não é máximo nem mínimo. É ponto de sela!'
    },
    pontosCriticos: [{
      x: 0, y: 0, tipo: 'saddle',
      classificacao: 'PONTO DE SELA: sobe em x, desce em y. Det(H) < 0 → equilíbrio instável.'
    }],
    dialogosChave: 'terra'
  },
  water: {
    nome: 'Água',
    emoji: '💧',
    expressao: 'exp(-(x^2 + y^2))',
    funcao: 'f(x, y) = e^(−(x²+y²))',
    tipo: 'Gaussiana Bidimensional',
    derivadas: {
      fx: '∂f/∂x = −2x · e^(−r²)',
      fy: '∂f/∂y = −2y · e^(−r²)',
      explicacao: 'O sinal negativo indica que a função decresce ao se afastar da origem.'
    },
    gradiente: {
      formula: '∇f = (−2x·e^Z, −2y·e^Z)',
      explicacao: 'Na origem ∇f = (0,0). Fora dela, aponta para a origem — a água sempre "desce" para o centro.'
    },
    hessiana: {
      formula: 'H|₀ = [[−2, 0], [0, −2]]',
      det: 'Det(H) = (−2)·(−2) − 0² = 4',
      fxx: 'fxx = −2 < 0',
      explicacao: 'Det(H) > 0 e fxx < 0 → curvatura côncava para baixo → pico!'
    },
    pontosCriticos: [{
      x: 0, y: 0, tipo: 'max',
      classificacao: 'MÁXIMO LOCAL: a superfície desce em todas as direções a partir de (0,0).'
    }],
    dialogosChave: 'agua'
  },
  wind: {
    nome: 'Vento',
    emoji: '💨',
    expressao: 'sin(x) + cos(y)',
    funcao: 'f(x, y) = sin(x) + cos(y)',
    tipo: 'Superfície Ondulatória (Periódica)',
    derivadas: {
      fx: '∂f/∂x = cos(x)',
      fy: '∂f/∂y = −sin(y)',
      explicacao: 'Derivadas oscilatórias → infinitos zeros → infinitos pontos críticos.'
    },
    gradiente: {
      formula: '∇f = (cos(x), −sin(y))',
      explicacao: '∇f = (0,0) quando cos(x)=0 e sin(y)=0. Isso ocorre em infinitos pontos!'
    },
    hessiana: {
      formula: 'H = [[−sin(x), 0], [0, −cos(y)]]',
      det: 'Det(H) = sin(x)·cos(y)',
      fxx: 'fxx = −sin(x)',
      explicacao: 'Det(H) varia conforme o ponto — cria máximos, mínimos e selas alternados.'
    },
    pontosCriticos: [
      { x: Math.PI / 2,  y: 0,       tipo: 'max',    classificacao: 'MÁXIMO: f = sin(π/2)+cos(0) = 2' },
      { x: -Math.PI / 2, y: 0,       tipo: 'min',    classificacao: 'MÍNIMO: f = −1+1 = 0 (mín local)' },
      { x: Math.PI / 2,  y: Math.PI, tipo: 'saddle', classificacao: 'SELA: Det(H) < 0 neste ponto' }
    ],
    dialogosChave: 'vento'
  },
  light: {
    nome: 'Luz',
    emoji: '✨',
    expressao: 'log(x^2 + y^2 + 1)',
    funcao: 'f(x, y) = ln(x² + y² + 1)',
    tipo: 'Crescimento Logarítmico',
    derivadas: {
      fx: '∂f/∂x = 2x / (x²+y²+1)',
      fy: '∂f/∂y = 2y / (x²+y²+1)',
      explicacao: 'O denominador cresce → derivadas diminuem com a distância. Crescimento que desacelera!'
    },
    gradiente: {
      formula: '∇f = (2x/(x²+y²+1), 2y/(x²+y²+1))',
      explicacao: 'Na origem ∇f = (0,0). Longe dela, o gradiente enfraquece — diferente do Fogo (2x, 2y)!'
    },
    hessiana: {
      formula: 'H|₀ = [[2, 0], [0, 2]]',
      det: 'Det(H) = 2·2 − 0² = 4',
      fxx: 'fxx = 2 > 0',
      explicacao: 'Igual ao Fogo na origem! Mas o crescimento global é logarítmico, não quadrático.'
    },
    pontosCriticos: [{
      x: 0, y: 0, tipo: 'min',
      classificacao: 'MÍNIMO LOCAL: mesma classificação do Fogo, mas crescimento bem mais lento.'
    }],
    dialogosChave: 'luz'
  }
};

/** Rótulos amigáveis para o tipo do ponto crítico. */
const LABELS_TIPO = {
  min:          { texto: 'mínimo',  classe: 'min'    },
  max:          { texto: 'máximo',  classe: 'max'    },
  saddle:       { texto: 'sela',    classe: 'saddle' },
  inconclusive: { texto: '?',       classe: 'inconclusive' }
};

/**
 * Módulo de ensino matemático integrado ao loop do jogo.
 */
export class MathTeacher {
  /**
   * @param {import('../ui/dialogueBox.js').DialogueBox} dialogueBox
   * @param {import('./puzzles/puzzleManager.js').PuzzleManager} puzzleManager
   */
  constructor(dialogueBox, puzzleManager) {
    this.dialogueBox   = dialogueBox;
    this.puzzleManager = puzzleManager;

    /** @type {Scene3D|null} Inicializado de forma lazy quando o painel aparece. */
    this.scene3D = null;

    /** Elemento atualmente processado (evita re-disparo do mesmo sigilo). */
    this.elementoAtual = null;
  }

  /**
   * Ponto de entrada chamado por main.js quando um novo elemento é reconhecido.
   * Delega para o fluxo correto conforme o estado do PuzzleManager.
   *
   * @param {string} elemento - Nome do elemento ('fire', 'water', etc.)
   */
  ensinar(elemento) {
    if (elemento === this.elementoAtual) return;
    this.elementoAtual = elemento;

    const resultado = this.puzzleManager.validar(elemento);

    if (resultado === 'correto') {
      this._responderAcerto(elemento);
    } else if (resultado === 'errado') {
      this._responderErro(elemento);
    } else {
      // Sem desafio ativo: ensino livre (ex: modo demonstração)
      this._ensinarLivre(elemento);
    }
  }

  /**
   * Reseta o estado quando o canvas é limpo.
   * Oculta o painel de superfície para preparar o próximo desafio.
   */
  resetar() {
    this.elementoAtual = null;
    this._ocultarPainelSuperficie();
  }

  // ── Fluxos de resposta ────────────────────────────────────────────────

  /**
   * Fluxo de ACERTO: revela superfície, exibe info matemática,
   * inicia diálogo de parabéns e avança o puzzle ao fechar.
   */
  _responderAcerto(elemento) {
    const sigilo = SIGILOS[elemento];
    if (!sigilo) return;

    // Revelar e renderizar a superfície 3D
    this._revelarPainelSuperficie();
    this._inicializarScene3D();
    if (this.scene3D) {
      try {
        this.scene3D.renderSurface(sigilo.expressao);
      } catch (e) {
        console.warn('[MathTeacher] Erro ao renderizar superfície:', e.message);
      }
    }
    this._mostrarInfoMatematica(sigilo);

    // Ao terminar o diálogo de acerto → avançar puzzle (auto-limpa canvas)
    this.dialogueBox.aoFechar(() => this.puzzleManager.avancar());

    // Iniciar diálogo de acerto (do banco de desafios)
    const falas = this.puzzleManager.desafioAtual?.dialogoAcerto ?? [];
    this.dialogueBox.iniciarSequencia(MestraNabla.nome, MestraNabla.personagem, falas);
  }

  /**
   * Fluxo de ERRO: inicia diálogo de dica específico para o elemento errado.
   * Não exibe a superfície 3D (o jogador não acertou ainda).
   */
  _responderErro(elemento) {
    const falas = this.puzzleManager.feedbackErro(elemento);
    this.dialogueBox.iniciarSequencia(MestraNabla.nome, MestraNabla.personagem, falas);
  }

  /**
   * Ensino livre (sem desafio ativo): comportamento original — revela superfície
   * e inicia os diálogos de ensino do sigilo desenhado.
   */
  _ensinarLivre(elemento) {
    const sigilo = SIGILOS[elemento];
    if (!sigilo) return;

    this._revelarPainelSuperficie();
    this._inicializarScene3D();
    if (this.scene3D) {
      try {
        this.scene3D.renderSurface(sigilo.expressao);
      } catch (e) {
        console.warn('[MathTeacher] Erro ao renderizar superfície:', e.message);
      }
    }
    this._mostrarInfoMatematica(sigilo);

    const falas = MestraNabla.dialogos[sigilo.dialogosChave];
    if (falas) {
      this.dialogueBox.iniciarSequencia(MestraNabla.nome, MestraNabla.personagem, falas);
    }
  }

  // ── Métodos de UI ─────────────────────────────────────────────────────

  _revelarPainelSuperficie() {
    const painel = document.getElementById('superficiePanel');
    if (painel) painel.hidden = false;
  }

  _ocultarPainelSuperficie() {
    const painel = document.getElementById('superficiePanel');
    if (painel) painel.hidden = true;

    const info = document.getElementById('mathInfoPanel');
    if (info) info.innerHTML = '';
  }

  _inicializarScene3D() {
    if (this.scene3D) return;
    try {
      this.scene3D = new Scene3D('container3d');
    } catch (e) {
      console.warn('[MathTeacher] Scene3D não inicializada:', e.message);
    }
  }

  /**
   * Preenche o painel lateral com explicação matemática passo a passo.
   * Cada seção corresponde a um conceito do currículo de Cálculo Multivariável.
   * @param {object} sigilo
   */
  _mostrarInfoMatematica(sigilo) {
    const painel = document.getElementById('mathInfoPanel');
    if (!painel) return;

    // ── 1. Pontos críticos com classificação explicada ──
    const pontosHtml = sigilo.pontosCriticos.map((p) => {
      const label = LABELS_TIPO[p.tipo] ?? LABELS_TIPO.inconclusive;
      return `<div class="math-ponto math-ponto-${label.classe}">
        <span class="math-ponto-coord">(${p.x.toFixed(2)}, ${p.y.toFixed(2)})</span>
        <span class="math-ponto-tipo">${label.texto.toUpperCase()}</span>
        <p class="math-ponto-explicacao">${p.classificacao}</p>
      </div>`;
    }).join('');

    painel.innerHTML = `
      <div class="math-section math-section-funcao">
        <div class="math-section-titulo">📐 A Função</div>
        <code class="math-formula">${sigilo.funcao}</code>
        <p class="math-section-desc">Superfície: <strong>${sigilo.tipo}</strong></p>
      </div>

      <div class="math-section math-section-derivadas">
        <div class="math-section-titulo">🔬 Derivadas Parciais</div>
        <p class="math-section-conceito">A derivada parcial mede como f varia em <em>uma</em> direção, mantendo a outra fixa.</p>
        <code class="math-formula">${sigilo.derivadas.fx}</code>
        <code class="math-formula">${sigilo.derivadas.fy}</code>
        <p class="math-section-desc">${sigilo.derivadas.explicacao}</p>
      </div>

      <div class="math-section math-section-gradiente">
        <div class="math-section-titulo">🧭 Vetor Gradiente ∇f</div>
        <p class="math-section-conceito">O gradiente aponta na direção de <em>maior crescimento</em> de f. Onde ∇f = (0,0) há um ponto crítico.</p>
        <code class="math-formula">${sigilo.gradiente.formula}</code>
        <p class="math-section-desc">${sigilo.gradiente.explicacao}</p>
      </div>

      <div class="math-section math-section-hessiana">
        <div class="math-section-titulo">📊 Matriz Hessiana H</div>
        <p class="math-section-conceito">A Hessiana contém as derivadas <em>segundas</em> e revela a curvatura da superfície no ponto crítico.</p>
        <code class="math-formula">${sigilo.hessiana.formula}</code>
        <code class="math-formula math-destaque">${sigilo.hessiana.det}</code>
        <code class="math-formula">${sigilo.hessiana.fxx}</code>
        <p class="math-section-desc">${sigilo.hessiana.explicacao}</p>
        <p class="math-regra">
          <strong>Regra:</strong> Det &gt; 0 e f<sub>xx</sub> &gt; 0 → mín &nbsp;|&nbsp;
          Det &gt; 0 e f<sub>xx</sub> &lt; 0 → máx &nbsp;|&nbsp;
          Det &lt; 0 → sela
        </p>
      </div>

      <div class="math-section math-section-criticos">
        <div class="math-section-titulo">⚡ Ponto(s) Crítico(s)</div>
        <p class="math-section-conceito">Encontramos onde ∇f = (0,0) e aplicamos o teste da Hessiana.</p>
        <div class="math-pontos-lista">${pontosHtml}</div>
      </div>
    `;
  }
}

