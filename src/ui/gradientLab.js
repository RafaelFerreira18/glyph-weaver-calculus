/**
 * Laboratório da Bússola Arcana — Vetor Gradiente.
 *
 * Fluxo:
 *   1. Sigilo reconhecido → atualizar(elemento) exibe o lab.
 *   2. Canvas mostra mapa de calor de f(x,y) + setas do campo ∇f.
 *   3. Slider permite ao aluno girar uma seta (direção prevista).
 *   4. "Verificar" revela o ∇f real, mostra erro angular e derivada direcional.
 *
 * @module ui/gradientLab
 */

import { parseFunction, gradientAt, evaluateAt } from '../math/multivarCalc.js';
import { gradientField } from '../math/gradient.js';
import { SIGILOS } from '../game/mathTeacher.js';

export class GradientLab {
  constructor() {
    this.sigilo     = null;
    this.node       = null;
    this._revelado  = false;
    this._raf       = null;
    this._campo     = null;  // cache do campo vetorial
    this._coletar();
    this._bindEvents();
  }

  _coletar() {
    this.el = {
      secao:        document.getElementById('labGradiente'),
      funcao:       document.getElementById('gradienteFuncao'),
      objetivo:     document.getElementById('gradienteObjetivo'),
      canvas:       document.getElementById('gradienteCanvas'),
      aponta:       document.getElementById('gradienteAponta'),
      magnitude:    document.getElementById('gradienteMagnitude'),
      direcional:   document.getElementById('gradienteDirecional'),
      dirSlider:    document.getElementById('gradienteDir'),
      dirLabel:     document.getElementById('gradienteDirLabel'),
      btnVerificar: document.getElementById('gradienteBtnVerificar'),
      resultado:    document.getElementById('gradienteResultado'),
    };
  }

  // ── API pública ──────────────────────────────────────────────

  atualizar(elemento) {
    const dados = SIGILOS[elemento];
    if (!dados || !this.el.secao) return;
    this.sigilo    = dados;
    this._revelado = false;
    try { this.node = parseFunction(dados.expressao); }
    catch (e) { console.warn('[GradientLab]', e.message); return; }

    // Pré-computa campo vetorial (faz a sincronia ficar rápida depois)
    try {
      this._campo = gradientField(this.node, { xMin: -3, xMax: 3, yMin: -3, yMax: 3 }, 0.75);
    } catch (_) { this._campo = []; }

    if (this.el.funcao)   this.el.funcao.textContent   = dados.funcao;
    if (this.el.objetivo) this.el.objetivo.textContent =
      `Use o slider para apontar a direção de maior crescimento de ${dados.nome} em (0, 0).`;

    if (this.el.dirSlider) this.el.dirSlider.value = '0';
    if (this.el.dirLabel)  this.el.dirLabel.textContent = '0';
    if (this.el.resultado) { this.el.resultado.hidden = true; this.el.resultado.innerHTML = ''; }
    if (this.el.btnVerificar) this.el.btnVerificar.disabled = false;

    this._atualizarInfoPanel();
    this._desenhar();
  }

  resetar() {
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
    this._revelado = false;
    this.sigilo = this.node = this._campo = null;
    if (this.el.secao) this.el.secao.hidden = true;
    if (this.el.canvas) {
      this.el.canvas.getContext('2d').clearRect(0, 0, this.el.canvas.width, this.el.canvas.height);
    }
  }

  // ── Eventos ──────────────────────────────────────────────────

  _bindEvents() {
    this.el.dirSlider?.addEventListener('input', () => {
      if (this.el.dirLabel) this.el.dirLabel.textContent = this.el.dirSlider.value;
      this._desenhar();
    });

    this.el.btnVerificar?.addEventListener('click', () => this._verificar());
  }

  _verificar() {
    if (!this.node || this._revelado) return;
    this._revelado = true;
    if (this.el.btnVerificar) this.el.btnVerificar.disabled = true;

    try {
      const [gx, gy] = gradientAt(this.node, 0, 0);
      const mag = Math.sqrt(gx * gx + gy * gy);
      const angReal  = (Math.atan2(gy, gx) * 180 / Math.PI + 360) % 360;
      const angUser  = parseFloat(this.el.dirSlider?.value ?? 0);
      const erro     = Math.abs(((angReal - angUser + 540) % 360) - 180);

      const avaliar  = erro < 15 ? '✓ Excelente intuição!' :
                       erro < 40 ? '~ Quase! Boa estimativa.' :
                                   '✗ Direção incorreta.';

      if (this.el.resultado) {
        this.el.resultado.hidden = false;
        this.el.resultado.innerHTML = `
          <span class="lab-resp-${erro < 40 ? 'certo' : 'errado'}">${avaliar}</span>
          <code>∇f(0,0) = (${gx.toFixed(3)}, ${gy.toFixed(3)})</code>
          <code>Direção real: <strong>${angReal.toFixed(1)}°</strong> &nbsp;|&nbsp; Sua previsão: ${angUser}° &nbsp;|&nbsp; Erro: ${erro.toFixed(1)}°</code>
          <span class="lab-resp-formula">${this.sigilo.gradiente.formula}</span>
          <em>${this.sigilo.gradiente.explicacao}</em>`;
      }
      this._atualizarInfoPanel(gx, gy, mag);
      this._desenhar();
    } catch (err) {
      console.warn('[GradientLab] verificar:', err.message);
    }
  }

  // ── Painel de info ───────────────────────────────────────────

  _atualizarInfoPanel(gx, gy, mag) {
    if (this.el.aponta) {
      if (gx !== undefined) {
        const ang = (Math.atan2(gy, gx) * 180 / Math.PI + 360) % 360;
        this.el.aponta.textContent = `∇f aponta para: ${ang.toFixed(1)}°`;
      } else {
        this.el.aponta.textContent = `∇f aponta para: —`;
      }
    }
    if (this.el.magnitude) {
      this.el.magnitude.textContent = mag !== undefined
        ? `|∇f|(0,0) = ${mag.toFixed(3)}`
        : '|∇f| = —';
    }
    if (this.el.direcional) {
      const angUser = parseFloat(this.el.dirSlider?.value ?? 0) * Math.PI / 180;
      if (gx !== undefined) {
        const dd = gx * Math.cos(angUser) + gy * Math.sin(angUser);
        this.el.direcional.textContent = `D_û f(0,0) = ${dd.toFixed(3)}`;
      } else {
        this.el.direcional.textContent = 'D_û f = —';
      }
    }
  }

  // ── Desenho ──────────────────────────────────────────────────

  _desenhar() {
    if (!this.el.canvas || !this.node) return;
    const canvas = this.el.canvas;
    const ctx    = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const R   = 3.5;
    const pad = 2;
    const toCanvasX = (x) => pad + ((x + R) / (2 * R)) * (W - 2 * pad);
    const toCanvasY = (y) => H - pad - ((y + R) / (2 * R)) * (H - 2 * pad);

    // ── 1. Mapa de calor ─────────────────────────────────────
    const SAMPLES = 80;
    let fMin = Infinity, fMax = -Infinity;
    const fGrid = [];
    for (let ix = 0; ix < SAMPLES; ix++) {
      const row = [];
      for (let iy = 0; iy < SAMPLES; iy++) {
        const x = -R + (2 * R * ix / (SAMPLES - 1));
        const y = -R + (2 * R * iy / (SAMPLES - 1));
        let v = 0;
        try { v = evaluateAt(this.node, x, y); } catch (_) { v = 0; }
        if (!isFinite(v)) v = 0;
        fMin = Math.min(fMin, v);
        fMax = Math.max(fMax, v);
        row.push(v);
      }
      fGrid.push(row);
    }
    const fSpan = Math.max(fMax - fMin, 0.01);
    const cellW = (W - 2 * pad) / SAMPLES;
    const cellH = (H - 2 * pad) / SAMPLES;

    for (let ix = 0; ix < SAMPLES; ix++) {
      for (let iy = 0; iy < SAMPLES; iy++) {
        const t = (fGrid[ix][iy] - fMin) / fSpan; // 0–1
        // paleta: azul escuro → dourado → branco-âmbar
        const r = Math.round(t < 0.5 ? t * 2 * 140 + 10  : 140 + (t - 0.5) * 2 * 100);
        const g = Math.round(t < 0.5 ? t * 2 * 100 + 5   : 100 + (t - 0.5) * 2 * 96);
        const b = Math.round(t < 0.5 ? 60 - t * 2 * 40   : 20  + (t - 0.5) * 2 * 80);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        const px = pad + ix * cellW;
        const py = H - pad - (iy + 1) * cellH;
        ctx.fillRect(px, py, cellW + 1, cellH + 1);
      }
    }

    // ── 2. Setas do campo ∇f ─────────────────────────────────
    if (this._campo) {
      for (const v of this._campo) {
        if (!isFinite(v.dx) || !isFinite(v.dy) || v.magnitude < 0.0001) continue;
        const px = toCanvasX(v.x);
        const py = toCanvasY(v.y);
        const ux = v.dx / v.magnitude;
        const uy = v.dy / v.magnitude;
        const len = Math.min(12, v.magnitude * 3 + 5);
        const ex = px + ux * len;
        const ey = py - uy * len; // y invertido no canvas

        ctx.strokeStyle = 'rgba(201,168,76,0.65)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ex, ey); ctx.stroke();

        // Cabeça da seta
        const ang = Math.atan2(-(uy), ux);
        const hl = 4;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - hl * Math.cos(ang - 0.45), ey - hl * Math.sin(ang - 0.45));
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - hl * Math.cos(ang + 0.45), ey - hl * Math.sin(ang + 0.45));
        ctx.stroke();
      }
    }

    // ── 3. Eixos ─────────────────────────────────────────────
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth   = 1;
    const cx = toCanvasX(0), cy = toCanvasY(0);
    ctx.beginPath(); ctx.moveTo(cx, pad); ctx.lineTo(cx, H - pad); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad, cy); ctx.lineTo(W - pad, cy); ctx.stroke();

    // ── 4. Seta do aluno (direção prevista) ──────────────────
    const userDeg = parseFloat(this.el.dirSlider?.value ?? 0);
    const userRad = userDeg * Math.PI / 180;
    const arrowLen = Math.min(W, H) * 0.2;
    const ex_u = cx + Math.cos(userRad) * arrowLen;
    const ey_u = cy - Math.sin(userRad) * arrowLen;

    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth   = 2.5;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex_u, ey_u); ctx.stroke();
    _desenharCabecaSeta(ctx, ex_u, ey_u, userRad, 9, '#00ff88');

    // ── 5. Seta real ∇f (após verificar) ────────────────────
    if (this._revelado) {
      try {
        const [gx, gy] = gradientAt(this.node, 0, 0);
        const mag = Math.sqrt(gx * gx + gy * gy);
        if (mag > 0.0001) {
          const realRad = Math.atan2(gy, gx);
          const ex_r = cx + Math.cos(realRad) * arrowLen;
          const ey_r = cy - Math.sin(realRad) * arrowLen;
          ctx.strokeStyle = '#ff3366';
          ctx.lineWidth   = 2.5;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex_r, ey_r); ctx.stroke();
          _desenharCabecaSeta(ctx, ex_r, ey_r, realRad, 9, '#ff3366');

          // Label
          ctx.fillStyle = '#ff3366';
          ctx.font = 'bold 14px Courier New';
          ctx.fillText('∇f real', ex_r + 8, ey_r - 5);
        }
      } catch (_) { /* skip */ }
    }

    // ── 6. Legenda ───────────────────────────────────────────
    ctx.font = '13px Courier New';
    ctx.fillStyle = '#00ff88';
    ctx.fillText('← sua previsão', 6, H - 24);
    if (this._revelado) {
      ctx.fillStyle = '#ff3366';
      ctx.fillText('∇f real ↑', 6, H - 10);
    }

    // ── 7. Ponto central ────────────────────────────────────
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Courier New';
    ctx.fillText('(0,0)', cx + 8, cy - 7);
  }
}

function _desenharCabecaSeta(ctx, ex, ey, ang, len, cor) {
  ctx.strokeStyle = cor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - len * Math.cos(ang - 0.4), ey + len * Math.sin(ang - 0.4));
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - len * Math.cos(ang + 0.4), ey + len * Math.sin(ang + 0.4));
  ctx.stroke();
}
