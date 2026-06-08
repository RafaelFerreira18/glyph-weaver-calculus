/**
 * Olhos Arcanos — exploração livre em overlay.
 *
 * Para qualquer sigilo, exibe em tempo real:
 *   - Mapa de calor + campo ∇f (canvas 2D)
 *   - Informações de função, gradiente, Hessiana e pontos críticos
 *
 * O modal usa o atributo `hidden` para mostrar/ocultar; o CSS deve
 * incluir `.olhos-overlay[hidden] { display: none }` para isso funcionar.
 *
 * @module ui/olhosArcanos
 */

import { parseFunction, evaluateAt, gradientAt } from '../math/multivarCalc.js';
import { gradientField } from '../math/gradient.js';
import { SIGILOS } from '../game/mathTeacher.js';

const SIGILOS_OLHOS = [
  { element: 'fire',  emoji: '🔥', nome: 'Fogo',  expr: 'x^2 + y^2',         label: 'x² + y²'           },
  { element: 'earth', emoji: '🌍', nome: 'Terra', expr: 'x^2 - y^2',         label: 'x² − y²'           },
  { element: 'water', emoji: '💧', nome: 'Água',  expr: 'exp(-(x^2 + y^2))', label: 'e^(−(x²+y²))'     },
  { element: 'wind',  emoji: '💨', nome: 'Vento', expr: 'sin(x) + cos(y)',   label: 'sin(x) + cos(y)'   },
  { element: 'light', emoji: '✨', nome: 'Luz',   label: 'ln(x²+y²+1)',      expr: 'log(x^2+y^2+1)'    },
];

const COR_TIPO = { max: '#ff3366', min: '#5aa9ff', saddle: '#c9a84c' };

export class OlhosArcanos {
  constructor() {
    this.aberto = false;
    this.sig    = null;
    this._raf   = null;
    this._campo = null;
    this._node  = null;
    this._onSigilo = this._aoEscolherSigilo.bind(this);
    this._coletar();
  }

  _coletar() {
    this.el = {
      overlay:     document.getElementById('labOlhos'),
      sigilos:     document.getElementById('olhosSigilos'),
      canvas:      document.getElementById('olhosCanvas'),
      formula:     document.getElementById('olhosFormula'),
    };
  }

  abrir() {
    if (!this.el.overlay || this.aberto) return;
    this.aberto = true;
    this.el.overlay.hidden = false;

    this._renderPicker();
    this.el.sigilos?.addEventListener('click', this._onSigilo);

    // Seleciona o primeiro sigilo após a tinta da UI secar
    setTimeout(() => {
      if (!this.aberto) return;
      try { this._selecionar(SIGILOS_OLHOS[0]); }
      catch (e) { console.warn('[OlhosArcanos]', e.message); }
    }, 0);
  }

  fechar() {
    if (!this.aberto) return;
    this.aberto = false;
    if (this.el.overlay) this.el.overlay.hidden = true;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
    this.el.sigilos?.removeEventListener('click', this._onSigilo);
  }

  alternar() { this.aberto ? this.fechar() : this.abrir(); }

  // ── Picker de sigilos ────────────────────────────────────────

  _renderPicker() {
    if (!this.el.sigilos) return;
    this.el.sigilos.innerHTML = SIGILOS_OLHOS.map((s) =>
      `<button type="button" class="olhos-sigilo" data-element="${s.element}">
         <span aria-hidden="true">${s.emoji}</span> ${s.nome}
       </button>`
    ).join('');
  }

  _aoEscolherSigilo(e) {
    const btn = e.target.closest('.olhos-sigilo');
    if (!btn) return;
    const s = SIGILOS_OLHOS.find((x) => x.element === btn.dataset.element);
    if (s) this._selecionar(s);
  }

  // ── Seleção de sigilo ────────────────────────────────────────

  _selecionar(sig) {
    this.sig = sig;
    try { this._node = parseFunction(sig.expr); }
    catch (e) { console.warn('[OlhosArcanos]', e.message); return; }

    try {
      this._campo = gradientField(this._node, { xMin: -3, xMax: 3, yMin: -3, yMax: 3 }, 0.75);
    } catch (_) { this._campo = []; }

    // Marca botão ativo
    this.el.sigilos?.querySelectorAll('.olhos-sigilo').forEach((b) =>
      b.classList.toggle('ativo', b.dataset.element === sig.element)
    );

    const dados = SIGILOS[sig.element];
    this._renderFormula(sig, dados);
    this._desenhar();
  }

  // ── Painel de fórmula ────────────────────────────────────────

  _renderFormula(sig, dados) {
    if (!this.el.formula) return;
    const gradFormula = dados?.gradiente?.formula  ?? '∇f = —';
    const hessFormula = dados?.hessiana?.formula   ?? 'H = —';
    const detFormula  = dados?.hessiana?.det       ?? '';
    const pontos      = (dados?.pontosCriticos ?? []);

    const pontosHtml = pontos.length
      ? pontos.map((p) => {
          const cor = COR_TIPO[p.tipo] ?? '#fff';
          const rot = { max: 'máximo', min: 'mínimo', saddle: 'sela' }[p.tipo] ?? p.tipo;
          return `<li><span class="olhos-bola" style="background:${cor}"></span>
            (${p.x.toFixed(2)}, ${p.y.toFixed(2)}) — <strong>${rot}</strong>
            <br><em style="font-size:0.8em">${p.classificacao}</em></li>`;
        }).join('')
      : '<li>Sem pontos críticos no domínio visível.</li>';

    this.el.formula.innerHTML = `
      <div class="olhos-sec">
        <span class="olhos-rotulo">Função</span>
        <code>f(x, y) = ${sig.label}</code>
      </div>
      <div class="olhos-sec">
        <span class="olhos-rotulo">Gradiente ∇f</span>
        <code>${gradFormula}</code>
      </div>
      <div class="olhos-sec">
        <span class="olhos-rotulo">Hessiana H</span>
        <code>${hessFormula}</code>
        ${detFormula ? `<code class="olhos-destaque">${detFormula}</code>` : ''}
        <code>${dados?.hessiana?.fxx ?? ''}</code>
      </div>
      <div class="olhos-sec">
        <span class="olhos-rotulo">Pontos críticos (∇f = 0)</span>
        <ul class="olhos-pontos">${pontosHtml}</ul>
      </div>`;
  }

  // ── Canvas ───────────────────────────────────────────────────

  _desenhar() {
    if (!this.el.canvas || !this._node) return;
    const canvas = this.el.canvas;
    const ctx    = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const R   = 3.5;
    const pad = 4;
    const toX = (x) => pad + ((x + R) / (2 * R)) * (W - 2 * pad);
    const toY = (y) => H - pad - ((y + R) / (2 * R)) * (H - 2 * pad);

    // 1. Mapa de calor
    const S = 80;
    let fMin = Infinity, fMax = -Infinity;
    const fG = [];
    for (let ix = 0; ix < S; ix++) {
      const row = [];
      for (let iy = 0; iy < S; iy++) {
        const x = -R + (2 * R * ix / (S - 1));
        const y = -R + (2 * R * iy / (S - 1));
        let v = 0;
        try { v = evaluateAt(this._node, x, y); } catch (_) { v = 0; }
        if (!isFinite(v)) v = 0;
        fMin = Math.min(fMin, v); fMax = Math.max(fMax, v);
        row.push(v);
      }
      fG.push(row);
    }
    const fSp = Math.max(fMax - fMin, 0.01);
    const cW  = (W - 2 * pad) / S;
    const cH  = (H - 2 * pad) / S;
    for (let ix = 0; ix < S; ix++) {
      for (let iy = 0; iy < S; iy++) {
        const t = (fG[ix][iy] - fMin) / fSp;
        const r = Math.round(t < 0.5 ? t * 2 * 140 + 10  : 140 + (t - 0.5) * 2 * 100);
        const g = Math.round(t < 0.5 ? t * 2 * 100 + 5   : 100 + (t - 0.5) * 2 * 96);
        const b = Math.round(t < 0.5 ? 60 - t * 2 * 40   : 20  + (t - 0.5) * 2 * 80);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(pad + ix * cW, H - pad - (iy + 1) * cH, cW + 1, cH + 1);
      }
    }

    // 2. Setas ∇f
    if (this._campo) {
      for (const v of this._campo) {
        if (!isFinite(v.dx) || !isFinite(v.dy) || v.magnitude < 0.0001) continue;
        const px = toX(v.x), py = toY(v.y);
        const ux = v.dx / v.magnitude, uy = v.dy / v.magnitude;
        const len = Math.min(10, v.magnitude * 2.5 + 4);
        const ex = px + ux * len, ey = py - uy * len;
        ctx.strokeStyle = 'rgba(201,168,76,0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ex, ey); ctx.stroke();
        const ang = Math.atan2(-uy, ux);
        const hl = 3.5;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - hl * Math.cos(ang - 0.45), ey - hl * Math.sin(ang - 0.45));
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - hl * Math.cos(ang + 0.45), ey - hl * Math.sin(ang + 0.45));
        ctx.stroke();
      }
    }

    // 3. Eixos
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(toX(0), pad); ctx.lineTo(toX(0), H - pad); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad, toY(0)); ctx.lineTo(W - pad, toY(0)); ctx.stroke();

    // 4. Pontos críticos
    const dados = SIGILOS[this.sig?.element];
    (dados?.pontosCriticos ?? []).forEach((p) => {
      const px = toX(p.x), py = toY(p.y);
      const cor = COR_TIPO[p.tipo] ?? '#fff';
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = cor;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }
}
