/**
 * Caderno do Aprendiz — glossário pedagógico in-game.
 *
 * Overlay que se preenche progressivamente conforme o aluno reconhece
 * sigilos. Cada conceito da ementa tem uma "página":
 *   - Página 1: Funções de Várias Variáveis (desbloqueada sempre)
 *   - Página 2: Derivadas Parciais
 *   - Página 3: Vetor Gradiente ∇f
 *   - Página 4: Máximos e Mínimos — Hessiana
 *   - Páginas 5–9: um sigilo por página (conforme reconhecidos)
 *
 * @module ui/cadernoView
 */

import { SIGILOS } from '../game/mathTeacher.js';

const PAGINAS_CONCEITOS = [
  {
    id: 'funcoes',
    titulo: 'Funções de Várias Variáveis',
    icone: '📐',
    conteudo: `
      <p>Uma <strong>função de duas variáveis</strong> associa a cada par (x, y) do plano
      um único valor real z = f(x, y). No Atelier, cada sigilo <em>é</em> uma dessas funções.</p>
      <ul>
        <li><strong>Domínio:</strong> conjunto de pares (x, y) onde f está definida.
            O anel delimitador do sigilo representa o domínio.</li>
        <li><strong>Imagem:</strong> conjunto de todos os valores z = f(x, y) assumidos.
            Visualize-a como a faixa de alturas da superfície 3D.</li>
        <li><strong>Representação gráfica:</strong> superfície S = {(x, y, f(x,y)) : (x,y) ∈ D}
            no espaço tridimensional.</li>
      </ul>
      <code class="caderno-formula">z = f(x, y) = x² + y²  →  paraboloide elíptico</code>
      <p class="caderno-nota"><em>"O anel não é decoração, aprendiz. É o domínio. A região onde sua
      vontade tem permissão de agir."</em> — Mestra Nabla</p>`,
  },
  {
    id: 'derivadas',
    titulo: 'Derivadas Parciais',
    icone: '🔬',
    conteudo: `
      <p>A <strong>derivada parcial</strong> mede a taxa de variação de f em uma direção,
      mantendo a outra variável constante.</p>
      <ul>
        <li><strong>∂f/∂x</strong>: quanto f varia se x aumentar levemente, com y fixo.</li>
        <li><strong>∂f/∂y</strong>: quanto f varia se y aumentar levemente, com x fixo.</li>
      </ul>
      <code class="caderno-formula">f = x² + y²  →  ∂f/∂x = 2x  ,  ∂f/∂y = 2y</code>
      <p>Geometricamente, ∂f/∂x é o <strong>coeficiente angular</strong> da reta tangente
      ao corte z = f(x, y₀) no ponto (x₀, y₀).</p>
      <p class="caderno-regra">Sinal positivo → f cresce naquela direção.<br>
      Sinal negativo → f decresce.<br>Zero → ponto de estacionamento (candidato a ponto crítico).</p>
      <p class="caderno-nota"><em>"Cada vez que puxou a runa para o lado, perguntou ao mundo:
      quanto você muda se eu mudar só x? Isso tem nome: derivada parcial."</em></p>`,
  },
  {
    id: 'gradiente',
    titulo: 'Vetor Gradiente ∇f',
    icone: '🧭',
    conteudo: `
      <p>O <strong>gradiente</strong> é o vetor formado pelas derivadas parciais:</p>
      <code class="caderno-formula">∇f(x, y) = (∂f/∂x, ∂f/∂y)</code>
      <p>Propriedades fundamentais:</p>
      <ul>
        <li>∇f <strong>aponta</strong> na direção de maior crescimento de f.</li>
        <li>|∇f| é a <strong>taxa de crescimento</strong> máxima naquele ponto.</li>
        <li>∇f é <strong>perpendicular</strong> às curvas de nível f = constante.</li>
        <li>Onde ∇f = (0, 0), temos um <strong>ponto crítico</strong>.</li>
      </ul>
      <code class="caderno-formula">Derivada direcional: D_û f = ∇f · û</code>
      <p>A derivada direcional mede a variação de f na direção do vetor unitário û.
      É máxima quando û = ∇f/|∇f|.</p>
      <p class="caderno-nota"><em>"O gradiente é a bússola arcana: aponta sempre para onde
      o mundo mais cresce daqui."</em></p>`,
  },
  {
    id: 'hessiana',
    titulo: 'Máximos, Mínimos e a Hessiana',
    icone: '⚡',
    conteudo: `
      <p>Onde ∇f = 0, temos um <strong>ponto crítico</strong>. Para classificá-lo,
      calculamos a <strong>matriz Hessiana</strong>:</p>
      <code class="caderno-formula">H = [[∂²f/∂x², ∂²f/∂x∂y],
     [∂²f/∂y∂x, ∂²f/∂y²]]</code>
      <p><strong>Teste da segunda derivada:</strong></p>
      <table class="caderno-tabela">
        <tr><th>Det(H)</th><th>f<sub>xx</sub></th><th>Tipo</th></tr>
        <tr><td>&gt; 0</td><td>&gt; 0</td><td>Mínimo local</td></tr>
        <tr><td>&gt; 0</td><td>&lt; 0</td><td>Máximo local</td></tr>
        <tr><td>&lt; 0</td><td>qualquer</td><td>Ponto de sela</td></tr>
        <tr><td>= 0</td><td>—</td><td>Inconclusivo</td></tr>
      </table>
      <p class="caderno-nota"><em>"Olhe duas vezes. O mundo recompensa quem faz.
      Esse segundo olhar chama-se Hessiana."</em></p>`,
  },
];

export class CadernoView {
  constructor() {
    this.aberto       = false;
    this._paginaAtual = 0;
    this._sigilosVistos = new Set();
    this._coletar();
    this._bindEvents();
    this._renderPaginas();
  }

  _coletar() {
    this.el = {
      overlay:  document.getElementById('cadernoOverlay'),
      fechar:   document.getElementById('cadernoFechar'),
      conteudo: document.getElementById('cadernoConteudo'),
      tabs:     document.getElementById('cadernoTabs'),
      btnPrev:  document.getElementById('cadernoPrev'),
      btnNext:  document.getElementById('cadernoNext'),
      contador: document.getElementById('cadernoContador'),
    };
  }

  abrir() {
    if (!this.el.overlay) return;
    this.aberto = true;
    this.el.overlay.hidden = false;
    this._mostrarPagina(0);
  }

  fechar() {
    this.aberto = false;
    if (this.el.overlay) this.el.overlay.hidden = true;
  }

  alternar() { this.aberto ? this.fechar() : this.abrir(); }

  /** Chamado quando um novo sigilo é reconhecido — desbloqueia a sua página. */
  desbloquearSigilo(elemento) {
    this._sigilosVistos.add(elemento);
    this._renderPaginas();
  }

  // ── Renderização ─────────────────────────────────────────────

  _paginas() {
    const conceitos = PAGINAS_CONCEITOS;
    const sigilos = Object.entries(SIGILOS)
      .filter(([k]) => this._sigilosVistos.has(k))
      .map(([, dados]) => this._sigiloParaPagina(dados));
    return [...conceitos, ...sigilos];
  }

  _sigiloParaPagina(dados) {
    const pontoHtml = (dados.pontosCriticos ?? []).map((p) =>
      `<li>(${p.x.toFixed(2)}, ${p.y.toFixed(2)}) — ${p.classificacao}</li>`
    ).join('');

    return {
      id:     dados.dialogosChave,
      titulo: `Sigilo ${dados.nome} ${dados.emoji}`,
      icone:  dados.emoji,
      conteudo: `
        <code class="caderno-formula">${dados.funcao}</code>
        <p><strong>Tipo de superfície:</strong> ${dados.tipo}</p>
        <p><strong>Derivadas parciais</strong><br>
           ${dados.derivadas.fx}<br>${dados.derivadas.fy}</p>
        <p><em>${dados.derivadas.explicacao}</em></p>
        <p><strong>Gradiente:</strong> ${dados.gradiente.formula}</p>
        <p><em>${dados.gradiente.explicacao}</em></p>
        <p><strong>Hessiana:</strong></p>
        <code class="caderno-formula">${dados.hessiana.formula}</code>
        <code class="caderno-formula">${dados.hessiana.det}</code>
        <code class="caderno-formula">${dados.hessiana.fxx}</code>
        <p><em>${dados.hessiana.explicacao}</em></p>
        <p><strong>Pontos críticos:</strong><ul>${pontoHtml || '<li>Nenhum no domínio visível.</li>'}</ul></p>`,
    };
  }

  _renderPaginas() {
    if (!this.el.tabs) return;
    const pags = this._paginas();

    this.el.tabs.innerHTML = pags.map((p, i) =>
      `<button type="button" class="caderno-tab ${i === this._paginaAtual ? 'ativo' : ''}"
               data-index="${i}" title="${p.titulo}">${p.icone}</button>`
    ).join('');

    this.el.tabs.querySelectorAll('.caderno-tab').forEach((btn) => {
      btn.addEventListener('click', () => this._mostrarPagina(parseInt(btn.dataset.index, 10)));
    });

    this._mostrarPagina(Math.min(this._paginaAtual, pags.length - 1));
  }

  _mostrarPagina(i) {
    const pags = this._paginas();
    if (!pags.length) return;
    this._paginaAtual = Math.max(0, Math.min(i, pags.length - 1));
    const pag = pags[this._paginaAtual];

    if (this.el.conteudo) {
      this.el.conteudo.innerHTML = `
        <h2 class="caderno-titulo-pag">${pag.icone} ${pag.titulo}</h2>
        <div class="caderno-corpo-pag">${pag.conteudo}</div>`;
    }

    if (this.el.contador) {
      this.el.contador.textContent = `${this._paginaAtual + 1} / ${pags.length}`;
    }

    if (this.el.btnPrev) this.el.btnPrev.disabled = this._paginaAtual === 0;
    if (this.el.btnNext) this.el.btnNext.disabled = this._paginaAtual === pags.length - 1;

    // Marca tab ativo
    this.el.tabs?.querySelectorAll('.caderno-tab').forEach((btn, idx) =>
      btn.classList.toggle('ativo', idx === this._paginaAtual)
    );
  }

  // ── Eventos ──────────────────────────────────────────────────

  _bindEvents() {
    this.el.fechar?.addEventListener('click',   () => this.fechar());
    this.el.btnPrev?.addEventListener('click',  () => this._mostrarPagina(this._paginaAtual - 1));
    this.el.btnNext?.addEventListener('click',  () => this._mostrarPagina(this._paginaAtual + 1));

    document.addEventListener('keydown', (e) => {
      if (!this.aberto) return;
      if (e.key === 'Escape') this.fechar();
      if (e.key === 'ArrowLeft')  this._mostrarPagina(this._paginaAtual - 1);
      if (e.key === 'ArrowRight') this._mostrarPagina(this._paginaAtual + 1);
    });
  }
}
