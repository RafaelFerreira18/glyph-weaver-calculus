/**
 * Laboratório de Classificação de Pontos Críticos.
 *
 * Fluxo:
 *   1. Sigilo reconhecido → atualizar(elemento) exibe os pontos críticos como "?".
 *   2. Aluno clica num ponto → botões Mínimo / Máximo / Sela ativam.
 *   3. Aluno clica no tipo → revelação do Det(H), fxx e classificação real.
 *   4. Pontos acertados ficam coloridos; errados mostram a resposta correta.
 *
 * @module ui/classifyLab
 */

import { SIGILOS } from '../game/mathTeacher.js';

const COR_TIPO = {
  min:    '#5aa9ff',
  max:    '#ff3366',
  saddle: '#c9a84c',
};
const ROTULO_TIPO = {
  min:    'Mínimo',
  max:    'Máximo',
  saddle: 'Sela',
};

export class ClassifyLab {
  constructor() {
    this.sigilo         = null;
    this.pontos         = [];
    this._pontoAtivo    = null;   // índice do ponto selecionado
    this._respostas     = {};     // índice → { previsto, correto }
    this._coletar();
    this._bindEvents();
  }

  _coletar() {
    this.el = {
      secao:       document.getElementById('labClassificar'),
      funcao:      document.getElementById('classificarFuncao'),
      objetivo:    document.getElementById('classificarObjetivo'),
      pergunta:    document.getElementById('classificarPergunta'),
      resultado:   document.getElementById('classificarResultado'),
      botoes:      document.getElementById('classificarBotoes'),
      listaDiv:    document.getElementById('classificarPontosLista'),
    };
  }

  // ── API pública ──────────────────────────────────────────────

  atualizar(elemento) {
    const dados = SIGILOS[elemento];
    if (!dados || !this.el.secao) return;
    this.sigilo      = dados;
    this.pontos      = (dados.pontosCriticos ?? []);
    this._pontoAtivo = null;
    this._respostas  = {};

    this.el.secao.hidden = false;
    if (this.el.funcao)   this.el.funcao.textContent   = dados.funcao;
    if (this.el.objetivo) this.el.objetivo.textContent =
      `Classifique os pontos críticos de ${dados.nome} usando o teste da Hessiana.`;
    if (this.el.resultado) { this.el.resultado.hidden = true; this.el.resultado.innerHTML = ''; }
    if (this.el.pergunta)  this.el.pergunta.textContent = 'Selecione um ponto na lista abaixo.';

    this._desativarBotoes();
    this._renderLista();
  }

  resetar() {
    this.sigilo = null; this.pontos = []; this._respostas = {};
    if (this.el.secao) this.el.secao.hidden = true;
  }

  // ── Renderização ─────────────────────────────────────────────

  _renderLista() {
    if (!this.el.listaDiv) return;
    if (!this.pontos.length) {
      this.el.listaDiv.innerHTML = '<p class="lab-pergunta-texto">Nenhum ponto crítico no domínio visível.</p>';
      return;
    }

    this.el.listaDiv.innerHTML = this.pontos.map((p, i) => {
      const resp     = this._respostas[i];
      const cor      = resp ? COR_TIPO[p.tipo] : 'rgba(201,168,76,0.4)';
      const rotulo   = resp ? ROTULO_TIPO[p.tipo] : '?';
      const acertou  = resp && resp.previsto === p.tipo;
      const marcador = resp ? (acertou ? '✓' : '✗') : '';
      return `
        <button type="button" class="classificar-ponto-btn ${resp ? 'respondido' : ''}"
                data-index="${i}" style="border-color:${cor}">
          <span class="classificar-coords">(${p.x.toFixed(2)}, ${p.y.toFixed(2)})</span>
          <span class="classificar-tipo" style="color:${cor}">${rotulo}</span>
          ${marcador ? `<span class="classificar-marcador">${marcador}</span>` : ''}
        </button>`;
    }).join('');

    // Bind
    this.el.listaDiv.querySelectorAll('.classificar-ponto-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.index, 10);
        if (this._respostas[i] !== undefined) return; // já respondido
        this._pontoAtivo = i;
        this._mostrarPergunta(i);
        this._ativarBotoes();
        this.el.listaDiv.querySelectorAll('.classificar-ponto-btn').forEach((b) =>
          b.classList.toggle('selecionado', parseInt(b.dataset.index, 10) === i)
        );
      });
    });
  }

  _mostrarPergunta(i) {
    const p = this.pontos[i];
    if (!p || !this.el.pergunta) return;
    this.el.pergunta.textContent =
      `No ponto (${p.x.toFixed(2)}, ${p.y.toFixed(2)}), o ponto crítico é…`;
    if (this.el.resultado) { this.el.resultado.hidden = true; this.el.resultado.innerHTML = ''; }
  }

  _ativarBotoes() {
    this.el.botoes?.querySelectorAll('.classificar-btn').forEach((b) => b.disabled = false);
  }

  _desativarBotoes() {
    this.el.botoes?.querySelectorAll('.classificar-btn').forEach((b) => b.disabled = true);
  }

  // ── Eventos ──────────────────────────────────────────────────

  _bindEvents() {
    this.el.botoes?.addEventListener('click', (e) => {
      const btn = e.target.closest('.classificar-btn');
      if (!btn || btn.disabled || this._pontoAtivo === null) return;
      this._responder(this._pontoAtivo, btn.dataset.tipo);
    });
  }

  _responder(i, tipoUsuario) {
    const p = this.pontos[i];
    if (!p) return;
    this._respostas[i] = { previsto: tipoUsuario, correto: p.tipo };
    this._desativarBotoes();
    this._pontoAtivo = null;

    const acertou  = tipoUsuario === p.tipo;
    const dadosS   = this.sigilo;

    let hessianaHtml = '';
    if (dadosS?.hessiana) {
      hessianaHtml = `
        <code>${dadosS.hessiana.formula}</code>
        <code class="lab-destaque">${dadosS.hessiana.det}</code>
        <code>${dadosS.hessiana.fxx}</code>
        <em>${dadosS.hessiana.explicacao}</em>`;
    }

    if (this.el.resultado) {
      this.el.resultado.hidden = false;
      this.el.resultado.innerHTML = `
        <span class="lab-resp-${acertou ? 'certo' : 'errado'}">
          ${acertou ? '✓ Correto!' : `✗ Não desta vez. A resposta correta é ${ROTULO_TIPO[p.tipo]}.`}
        </span>
        <p>${p.classificacao}</p>
        ${hessianaHtml}`;
    }

    this._renderLista(); // atualiza marcadores
    this._verificarConcluido();
  }

  _verificarConcluido() {
    if (Object.keys(this._respostas).length < this.pontos.length) return;
    const acertos = Object.values(this._respostas).filter((r) => r.previsto === r.correto).length;
    if (this.el.pergunta) {
      this.el.pergunta.textContent =
        `Todos os pontos classificados! Acertos: ${acertos} / ${this.pontos.length}`;
    }
  }
}
