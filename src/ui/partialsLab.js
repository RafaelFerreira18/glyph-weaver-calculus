/**
 * Laboratório de Derivadas Parciais — avaliação ativa.
 *
 * Fluxo:
 *   1. Sigilo reconhecido → atualizar(elemento) exibe o lab.
 *   2. Aluno ajusta x₀, y₀ com sliders → canvas redesenha cortes.
 *   3. Pergunta: "Se x aumentar, f sobe, desce ou fica igual?"
 *   4. Aluno responde → feedback + revelação de ∂f/∂x(x₀,y₀).
 *   5. Mesmo ciclo para ∂f/∂y.
 *
 * @module ui/partialsLab
 */

import { parseFunction, partialDerivative, evaluateAt } from '../math/multivarCalc.js';
import { SIGILOS } from '../game/mathTeacher.js';

const COR_CORTE_X   = '#c9a84c';   // dourado — eixo x
const COR_CORTE_Y   = '#5aa9ff';   // azul    — eixo y
const COR_TANGENTE  = '#00ff88';   // esmeralda — reta tangente
const COR_PONTO     = '#ff3366';   // rubi — ponto marcado

export class PartialsLab {
  constructor() {
    this.sigilo   = null;
    this.node     = null;
    this._fase    = 'aguardando'; // 'aguardando'|'preverX'|'preverY'|'concluido'
    this._coletar();
    this._bindEvents();
  }

  // ── Coleta de elementos ──────────────────────────────────────

  _coletar() {
    this.el = {
      secao:        document.getElementById('labParciais'),
      funcao:       document.getElementById('parcialFuncao'),
      objetivo:     document.getElementById('parcialObjetivo'),
      x0Input:      document.getElementById('parcialX0'),
      y0Input:      document.getElementById('parcialY0'),
      x0Label:      document.getElementById('parcialX0Label'),
      y0Label:      document.getElementById('parcialY0Label'),
      perguntaX:    document.getElementById('parcialPerguntaX'),
      perguntaY:    document.getElementById('parcialPerguntaY'),
      resultadoX:   document.getElementById('parcialResultadoX'),
      resultadoY:   document.getElementById('parcialResultadoY'),
      botoesX:      document.getElementById('parcialBotoesX'),
      botoesY:      document.getElementById('parcialBotoesY'),
      canvasX:      document.getElementById('parcialCanvasX'),
      canvasY:      document.getElementById('parcialCanvasY'),
    };
  }

  // ── API pública ──────────────────────────────────────────────

  /**
   * Atualiza o lab com o elemento reconhecido.
   * @param {string} elemento - chave do sigilo ('fire', 'earth', etc.)
   */
  atualizar(elemento) {
    const dados = SIGILOS[elemento];
    if (!dados || !this.el.secao) return;
    this.sigilo = dados;
    try { this.node = parseFunction(dados.expressao); }
    catch (e) { console.warn('[PartialsLab] parse falhou:', e.message); return; }

    this._fase = 'preverX';

    if (this.el.funcao)   this.el.funcao.textContent   = dados.funcao;
    if (this.el.objetivo) this.el.objetivo.textContent =
      `Explore como ${dados.nome} varia em cada direção. Preveja o sinal de ∂f/∂x e ∂f/∂y.`;

    this._atualizarLabels();
    this._redesenhar();
    this._mostrarPerguntaX();
  }

  resetar() {
    this._fase = 'aguardando';
    this.sigilo = this.node = null;
    if (this.el.secao) this.el.secao.hidden = true;
    if (this.el.resultadoX) { this.el.resultadoX.hidden = true; this.el.resultadoX.innerHTML = ''; }
    if (this.el.resultadoY) { this.el.resultadoY.hidden = true; this.el.resultadoY.innerHTML = ''; }
    if (this.el.botoesX)   this.el.botoesX.hidden = true;
    if (this.el.botoesY)   this.el.botoesY.hidden = true;
    if (this.el.perguntaY) this.el.perguntaY.hidden = true;
    [this.el.canvasX, this.el.canvasY].forEach((c) => {
      if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height);
    });
  }

  // ── Eventos ──────────────────────────────────────────────────

  _bindEvents() {
    this.el.x0Input?.addEventListener('input', () => {
      this._atualizarLabels();
      this._redesenhar();
      if (this._fase === 'preverX') this._mostrarPerguntaX();
    });
    this.el.y0Input?.addEventListener('input', () => {
      this._atualizarLabels();
      this._redesenhar();
      if (this._fase === 'preverX') this._mostrarPerguntaX();
    });

    this.el.botoesX?.addEventListener('click', (e) => this._responderX(e));
    this.el.botoesY?.addEventListener('click', (e) => this._responderY(e));
  }

  _atualizarLabels() {
    const x0 = this._x0();
    const y0 = this._y0();
    if (this.el.x0Label) this.el.x0Label.textContent = x0.toFixed(1);
    if (this.el.y0Label) this.el.y0Label.textContent = y0.toFixed(1);
  }

  _x0() { return parseFloat(this.el.x0Input?.value ?? '1'); }
  _y0() { return parseFloat(this.el.y0Input?.value ?? '1'); }

  // ── Perguntas / respostas ────────────────────────────────────

  _mostrarPerguntaX() {
    const x0 = this._x0().toFixed(1), y0 = this._y0().toFixed(1);
    if (this.el.perguntaX) {
      this.el.perguntaX.textContent =
        `Em (${x0}, ${y0}), se x aumentar levemente, f vai…`;
      this.el.perguntaX.hidden = false;
    }
    if (this.el.botoesX)  this.el.botoesX.hidden  = false;
    if (this.el.resultadoX) { this.el.resultadoX.hidden = true; this.el.resultadoX.innerHTML = ''; }
    if (this.el.perguntaY) this.el.perguntaY.hidden = true;
    if (this.el.botoesY)   this.el.botoesY.hidden   = true;
    if (this.el.resultadoY) { this.el.resultadoY.hidden = true; this.el.resultadoY.innerHTML = ''; }
  }

  _responderX(e) {
    const btn = e.target.closest('[data-resposta]');
    if (!btn || !this.node) return;
    const resposta = btn.dataset.resposta;
    const x0 = this._x0(), y0 = this._y0();

    try {
      const dfdx_node = partialDerivative(this.node, 'x');
      const valor     = Number(dfdx_node.evaluate({ x: x0, y: y0 }));
      const correto   = valor >  0.0001 ? 'sobe'
                      : valor < -0.0001 ? 'desce'
                      : 'igual';
      const acertou   = resposta === correto;

      if (this.el.resultadoX) {
        this.el.resultadoX.hidden = false;
        this.el.resultadoX.innerHTML = `
          <span class="lab-resp-${acertou ? 'certo' : 'errado'}">${acertou ? '✓ Correto!' : '✗ Não desta vez.'}</span>
          <code>∂f/∂x(${x0.toFixed(1)}, ${y0.toFixed(1)}) = <strong>${valor.toFixed(3)}</strong></code>
          <span class="lab-resp-formula">${this.sigilo.derivadas.fx}</span>
          <em>${this.sigilo.derivadas.explicacao}</em>`;
      }
      // Redesenha com tangente visível
      this._desenharCorte(this.el.canvasX, 'x', x0, y0, true);
      if (this.el.botoesX) this.el.botoesX.hidden = true;
      this._fase = 'preverY';
      this._mostrarPerguntaY(x0, y0);
    } catch (err) {
      console.warn('[PartialsLab] responderX:', err.message);
    }
  }

  _mostrarPerguntaY(x0, y0) {
    if (this.el.perguntaY) {
      this.el.perguntaY.hidden = false;
      this.el.perguntaY.textContent =
        `Agora: em (${x0.toFixed(1)}, ${y0.toFixed(1)}), se y aumentar levemente, f vai…`;
    }
    if (this.el.botoesY) this.el.botoesY.hidden = false;
  }

  _responderY(e) {
    const btn = e.target.closest('[data-resposta]');
    if (!btn || !this.node) return;
    const resposta = btn.dataset.resposta;
    const x0 = this._x0(), y0 = this._y0();

    try {
      const dfdy_node = partialDerivative(this.node, 'y');
      const valor     = Number(dfdy_node.evaluate({ x: x0, y: y0 }));
      const correto   = valor >  0.0001 ? 'sobe'
                      : valor < -0.0001 ? 'desce'
                      : 'igual';
      const acertou   = resposta === correto;

      if (this.el.resultadoY) {
        this.el.resultadoY.hidden = false;
        this.el.resultadoY.innerHTML = `
          <span class="lab-resp-${acertou ? 'certo' : 'errado'}">${acertou ? '✓ Correto!' : '✗ Não desta vez.'}</span>
          <code>∂f/∂y(${x0.toFixed(1)}, ${y0.toFixed(1)}) = <strong>${valor.toFixed(3)}</strong></code>
          <span class="lab-resp-formula">${this.sigilo.derivadas.fy}</span>
          <em>${this.sigilo.derivadas.explicacao}</em>`;
      }
      this._desenharCorte(this.el.canvasY, 'y', x0, y0, true);
      if (this.el.botoesY) this.el.botoesY.hidden = true;
      this._fase = 'concluido';
    } catch (err) {
      console.warn('[PartialsLab] responderY:', err.message);
    }
  }

  // ── Desenho ──────────────────────────────────────────────────

  _redesenhar() {
    if (!this.node) return;
    const x0 = this._x0(), y0 = this._y0();
    this._desenharCorte(this.el.canvasX, 'x', x0, y0, this._fase !== 'preverX');
    this._desenharCorte(this.el.canvasY, 'y', x0, y0, this._fase === 'concluido');
  }

  /**
   * Desenha o corte f(var, constante) num canvas 2D.
   * @param {HTMLCanvasElement} canvas
   * @param {'x'|'y'} eixo - variável livre do corte
   * @param {number} x0
   * @param {number} y0
   * @param {boolean} mostrarTangente
   */
  _desenharCorte(canvas, eixo, x0, y0, mostrarTangente) {
    if (!canvas || !this.node) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const R = 3.5;
    const STEPS = 120;
    const pad = 26;

    // Amostrar
    const pts = [];
    let fMin = Infinity, fMax = -Infinity;
    for (let i = 0; i <= STEPS; i++) {
      const t = -R + (2 * R * i / STEPS);
      try {
        const fy = eixo === 'x'
          ? evaluateAt(this.node, t, y0)
          : evaluateAt(this.node, x0, t);
        if (isFinite(fy)) {
          pts.push({ t, fy });
          fMin = Math.min(fMin, fy);
          fMax = Math.max(fMax, fy);
        }
      } catch (_) { /* pula */ }
    }
    if (!pts.length) return;

    const fSpan  = Math.max(fMax - fMin, 0.01);
    const toX    = (t)  => pad + ((t + R) / (2 * R)) * (W - 2 * pad);
    const toY    = (fy) => H - pad - ((fy - fMin) / fSpan) * (H - 2 * pad);

    // Fundo
    ctx.fillStyle = 'rgba(13,7,3,0.85)';
    ctx.fillRect(0, 0, W, H);

    // Grade tênue
    ctx.strokeStyle = 'rgba(201,168,76,0.12)';
    ctx.lineWidth = 1;
    for (let v = Math.ceil(fMin); v <= Math.floor(fMax); v++) {
      const y = toY(v);
      if (y < pad || y > H - pad) continue;
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
    }

    // Eixo horizontal (t = 0)
    ctx.strokeStyle = 'rgba(201,168,76,0.25)';
    ctx.beginPath(); ctx.moveTo(toX(0), pad); ctx.lineTo(toX(0), H - pad); ctx.stroke();
    // Eixo f = 0
    if (fMin < 0 && fMax > 0) {
      ctx.beginPath(); ctx.moveTo(pad, toY(0)); ctx.lineTo(W - pad, toY(0)); ctx.stroke();
    }

    // Curva do corte
    const cor = eixo === 'x' ? COR_CORTE_X : COR_CORTE_Y;
    ctx.strokeStyle = cor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    pts.forEach(({ t, fy }, i) => {
      const cx = toX(t), cy = toY(fy);
      if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    });
    ctx.stroke();

    // Ponto (x₀ ou y₀)
    const t0 = eixo === 'x' ? x0 : y0;
    const fy0 = eixo === 'x'
      ? evaluateAt(this.node, x0, y0)
      : evaluateAt(this.node, x0, y0);
    const px0 = toX(t0), py0 = toY(fy0);

    // Reta tangente
    if (mostrarTangente) {
      try {
        const derivada = partialDerivative(this.node, eixo);
        const slope = Number(derivada.evaluate({ x: x0, y: y0 }));
        const dt = 0.9;
        const scaleX = (W - 2 * pad) / (2 * R);
        const scaleY = (H - 2 * pad) / fSpan;
        const slope_canvas = -slope * scaleY / scaleX; // y flipped, scale

        ctx.strokeStyle = COR_TANGENTE;
        ctx.lineWidth = 2;
        const tangLen = 60;
        ctx.beginPath();
        ctx.moveTo(px0 - tangLen, py0 - (-slope_canvas) * (-tangLen));
        ctx.lineTo(px0 + tangLen, py0 - (-slope_canvas) * ( tangLen));
        ctx.stroke();

        // Anotação da derivada
        const sinal = slope >= 0 ? '+' : '';
        ctx.fillStyle = COR_TANGENTE;
        ctx.font = '11px Courier New';
        ctx.fillText(`∂f/∂${eixo} = ${slope.toFixed(2)}`, pad + 2, pad + 12);
      } catch (_) { /* skip */ }
    }

    // Ponto marcado (por cima)
    ctx.fillStyle = COR_PONTO;
    ctx.beginPath(); ctx.arc(px0, py0, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Rótulo do eixo
    ctx.fillStyle = 'rgba(201,168,76,0.55)';
    ctx.font = '10px IM Fell English, serif';
    const label = eixo === 'x'
      ? `f(x, ${y0.toFixed(1)}) — corte y₀`
      : `f(${x0.toFixed(1)}, y) — corte x₀`;
    ctx.fillText(label, pad, H - 7);
  }
}
