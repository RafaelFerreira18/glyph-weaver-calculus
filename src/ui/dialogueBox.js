/**
 * Caixa de Diálogo RPG — sistema de falas dos personagens.
 *
 * Renderiza diálogos ao estilo JRPG: retrato do personagem à esquerda,
 * nome em destaque, texto com efeito de digitação (typewriter) e botão
 * para avançar. Suporta sequências de múltiplas falas.
 *
 * @module ui/dialogueBox
 */

/** SVG do retrato da Mestra Nabla — bruxa professora de cálculo. */
const RETRATO_NABLA = `<svg viewBox="0 0 110 148" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <!-- Robe / corpo -->
  <ellipse cx="55" cy="128" rx="40" ry="24" fill="#0d0703"/>
  <rect x="20" y="100" width="70" height="32" rx="6" fill="#0d0703"/>
  <!-- Bordas douradas do robe -->
  <line x1="20" y1="100" x2="20" y2="132" stroke="#c9a84c" stroke-width="1.2" opacity="0.6"/>
  <line x1="90" y1="100" x2="90" y2="132" stroke="#c9a84c" stroke-width="1.2" opacity="0.6"/>
  <!-- Símbolo nabla no robe -->
  <text x="55" y="125" text-anchor="middle" fill="#c9a84c" font-size="22" font-family="serif" opacity="0.9">∇</text>
  <!-- Pescoço -->
  <rect x="48" y="88" width="14" height="16" rx="4" fill="#c4845a"/>
  <!-- Cabeça -->
  <ellipse cx="55" cy="80" rx="23" ry="24" fill="#c4845a"/>
  <!-- Rosto mais claro -->
  <ellipse cx="55" cy="82" rx="18" ry="18" fill="#d4956a"/>
  <!-- Olhos -->
  <ellipse cx="47" cy="78" rx="4" ry="4.5" fill="#1a0f05"/>
  <ellipse cx="63" cy="78" rx="4" ry="4.5" fill="#1a0f05"/>
  <!-- Brilho dos olhos (esmeralda — poder mágico) -->
  <circle cx="47" cy="76.5" r="2" fill="#00ff88" opacity="0.85"/>
  <circle cx="63" cy="76.5" r="2" fill="#00ff88" opacity="0.85"/>
  <!-- Sorriso sutil -->
  <path d="M 48 89 Q 55 95 62 89" stroke="#8B4513" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <!-- Sobrancelhas -->
  <path d="M 43 72 Q 47 70 51 72" stroke="#5c2d0a" stroke-width="1.2" fill="none"/>
  <path d="M 59 72 Q 63 70 67 72" stroke="#5c2d0a" stroke-width="1.2" fill="none"/>
  <!-- Chapéu de bruxa -->
  <polygon points="55,14 28,58 82,58" fill="#0d0703"/>
  <polygon points="55,14 30,48 80,48" fill="#1a0f05"/>
  <!-- Aba do chapéu -->
  <ellipse cx="55" cy="58" rx="30" ry="5" fill="#1a0f05"/>
  <!-- Faixa dourada do chapéu -->
  <rect x="29" y="54" width="52" height="6" rx="2" fill="#c9a84c" opacity="0.85"/>
  <!-- Estrela no chapéu -->
  <text x="55" y="46" text-anchor="middle" fill="#c9a84c" font-size="10" font-family="serif">✦</text>
  <!-- Cabelo visível nas laterais -->
  <ellipse cx="30" cy="82" rx="8" ry="16" fill="#2c1810"/>
  <ellipse cx="80" cy="82" rx="8" ry="16" fill="#2c1810"/>
</svg>`;

/** Mapeamento de personagem → retrato SVG. */
const RETRATOS = {
  nabla: RETRATO_NABLA
};

/**
 * Caixa de diálogo estilo JRPG com efeito typewriter e fila de falas.
 */
export class DialogueBox {
  constructor() {
    this.container   = document.getElementById('dialogoRpg');
    this.retratoEl   = document.getElementById('retratoPersonagem');
    this.nomeEl      = document.getElementById('nomePersonagem');
    this.textoEl     = document.getElementById('textoDialogo');
    this.avancarBtn  = document.getElementById('avancarDialogo');
    this.progressoEl = document.getElementById('dialogoProgresso');

    /** @type {string[]} Falas da sequência atual. */
    this.sequencia = [];
    this.indice    = 0;

    /** Texto completo da fala exibida. */
    this.textoCompleto = '';

    /** ID do intervalo do typewriter. */
    this._timerId = null;

    this._configurarEventos();
  }

  _configurarEventos() {
    this.avancarBtn?.addEventListener('click', () => this.avancar());

    // Espaço também avança o diálogo
    document.addEventListener('keydown', (e) => {
      if (!this.container || this.container.hidden) return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        this.avancar();
      }
    });
  }

  /**
   * Inicia uma sequência de falas de um personagem.
   *
   * @param {string} nome - Nome exibido na caixa de diálogo.
   * @param {string} personagem - Chave do retrato (ex: 'nabla').
   * @param {string[]} falas - Array de strings com as falas.
   */
  iniciarSequencia(nome, personagem, falas) {
    if (!this.container) return;
    this.sequencia = falas;
    this.indice    = 0;

    this.nomeEl.textContent  = nome;
    this.retratoEl.innerHTML = RETRATOS[personagem] ?? RETRATOS.nabla;
    this.container.hidden    = false;

    this._exibirFalaAtual();
  }

  /**
   * Avança para a próxima fala, ou conclui o texto atual se ainda digitando.
   */
  avancar() {
    const textoAtual = this.textoEl.textContent ?? '';

    // Se ainda digitando, completa o texto imediatamente
    if (textoAtual.length < this.textoCompleto.length) {
      clearInterval(this._timerId);
      this.textoEl.textContent = this.textoCompleto;
      this._pararAnimacaoRetrato();
      return;
    }

    // Avança para a próxima fala
    this.indice++;
    if (this.indice >= this.sequencia.length) {
      this.fechar();
    } else {
      this._exibirFalaAtual();
    }
  }

  /** Fecha a caixa de diálogo e dispara o callback de conclusão, se houver. */
  fechar() {
    clearInterval(this._timerId);
    this._pararAnimacaoRetrato();
    if (this.container) this.container.hidden = true;

    // Callback one-shot registrado por aoFechar()
    if (typeof this._onFechar === 'function') {
      const cb = this._onFechar;
      this._onFechar = null;
      cb();
    }
  }

  /**
   * Registra um callback a ser chamado uma única vez quando o diálogo terminar.
   * @param {() => void} cb
   */
  aoFechar(cb) {
    this._onFechar = cb;
  }

  _exibirFalaAtual() {
    const fala = this.sequencia[this.indice];
    if (!fala) { this.fechar(); return; }

    // Atualiza o indicador de progresso
    if (this.progressoEl) {
      this.progressoEl.textContent = `${this.indice + 1} / ${this.sequencia.length}`;
    }

    this._digitarTexto(fala);
  }

  /**
   * Efeito typewriter: exibe o texto caractere por caractere.
   * @param {string} texto
   */
  _digitarTexto(texto) {
    clearInterval(this._timerId);
    this.textoCompleto   = texto;
    this.textoEl.textContent = '';

    this.retratoEl.classList.add('falando');

    let i = 0;
    this._timerId = setInterval(() => {
      this.textoEl.textContent += texto[i];
      i++;
      if (i >= texto.length) {
        clearInterval(this._timerId);
        this._pararAnimacaoRetrato();
      }
    }, 22); // ~22ms por caractere ≈ velocidade de leitura confortável
  }

  _pararAnimacaoRetrato() {
    this.retratoEl?.classList.remove('falando');
  }
}
