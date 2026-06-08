/**
 * Modo Demo — tour guiado pelos 4 conceitos da ementa.
 *
 * Exibe uma sequência de passos automatizados usando a Biblioteca de
 * Glifos (sem desenhar), para garantir que a apresentação nunca trave.
 *
 * Cada passo despacha 'glifo:escolhido' e abre o lab correspondente
 * após um delay configurável.
 *
 * @module game/demoMode
 */

const PASSOS_DEMO = [
  {
    elemento:  'fire',
    descricao: 'Ano I — Funções: paraboloide elíptico f = x² + y²',
    conceito:  'Domínio ℝ², imagem [0,∞), único mínimo na origem.',
    delay:     1200,
  },
  {
    elemento:  'earth',
    descricao: 'Ano II — Derivadas Parciais: f = x² − y²',
    conceito:  '∂f/∂x = 2x (cresce em x), ∂f/∂y = −2y (decresce em y).',
    delay:     1200,
  },
  {
    elemento:  'water',
    descricao: 'Ano III — Gradiente: Gaussiana f = e^(−r²)',
    conceito:  '∇f aponta para a origem em todos os pontos — o gradiente desce para o pico.',
    delay:     1200,
  },
  {
    elemento:  'wind',
    descricao: 'Ano IV — Máximos e Mínimos: f = sin(x) + cos(y)',
    conceito:  'Infinitos pontos críticos; Det(H) pode ser >, < ou = 0 conforme o ponto.',
    delay:     1200,
  },
];

export class DemoMode {
  constructor() {
    this._rodando     = false;
    this._passoAtual  = -1;
    this._timer       = null;
    this._coletar();
    this._bindEvents();
  }

  _coletar() {
    this.el = {
      overlay:   document.getElementById('demoOverlay'),
      fechar:    document.getElementById('demoFechar'),
      progresso: document.getElementById('demoProgresso'),
      descricao: document.getElementById('demoDescricao'),
      conceito:  document.getElementById('demoCeito'),
      btnProx:   document.getElementById('demoBtnProx'),
      btnPausar: document.getElementById('demoBtnPausar'),
    };
  }

  iniciar() {
    if (!this.el.overlay) return;
    this._rodando    = true;
    this._passoAtual = -1;
    this.el.overlay.hidden = false;
    this._proximoPasso();
  }

  parar() {
    this._rodando = false;
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
    if (this.el.overlay) this.el.overlay.hidden = true;
  }

  // ── Passos ───────────────────────────────────────────────────

  _proximoPasso() {
    this._passoAtual++;
    if (this._passoAtual >= PASSOS_DEMO.length) {
      this._concluir();
      return;
    }

    const passo = PASSOS_DEMO[this._passoAtual];
    this._atualizarUI(passo);

    // Despacha o evento da biblioteca de glifos — aciona mathTeacher
    document.dispatchEvent(
      new CustomEvent('glifo:escolhido', { detail: { element: passo.elemento } })
    );
  }

  _concluir() {
    if (this.el.descricao) this.el.descricao.textContent = 'Demo concluída! Todos os 4 conceitos foram demonstrados.';
    if (this.el.conceito)  this.el.conceito.textContent  = '';
    if (this.el.btnProx)   this.el.btnProx.disabled = true;
    if (this.el.progresso) this.el.progresso.textContent =
      `${PASSOS_DEMO.length} / ${PASSOS_DEMO.length}`;
  }

  _atualizarUI(passo) {
    const n   = this._passoAtual + 1;
    const tot = PASSOS_DEMO.length;
    if (this.el.progresso) this.el.progresso.textContent = `Passo ${n} / ${tot}`;
    if (this.el.descricao) this.el.descricao.textContent = passo.descricao;
    if (this.el.conceito)  this.el.conceito.textContent  = passo.conceito;
    if (this.el.btnProx)   this.el.btnProx.disabled      = (n >= tot);
  }

  // ── Eventos ──────────────────────────────────────────────────

  _bindEvents() {
    this.el.fechar?.addEventListener('click',    () => this.parar());
    this.el.btnProx?.addEventListener('click',   () => this._proximoPasso());
    this.el.btnPausar?.addEventListener('click', () => this.parar());
  }
}
