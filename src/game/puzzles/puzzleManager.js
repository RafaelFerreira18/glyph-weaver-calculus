/**
 * PuzzleManager — orquestra os desafios matemáticos do Atelier.
 *
 * Fluxo:
 *   iniciar() → apresenta desafio → jogador desenha sigilo
 *   → validar(elemento) → 'correto' | 'errado' | 'sem_desafio'
 *   → (se correto) avancar() → próximo desafio
 *
 * Comunicação com o resto do jogo via CustomEvents no document:
 *   'puzzle:novo'     — novo desafio apresentado   (detail: { desafio })
 *   'puzzle:avancou'  — jogador acertou, canvas deve ser limpo
 *   'puzzle:concluido'— todos os desafios do Ano I foram resolvidos
 *
 * @module game/puzzles/puzzleManager
 */

import { DESAFIOS } from './desafios.js';

export class PuzzleManager {
  constructor() {
    this.desafios = DESAFIOS;
    this.indice = -1;
    this.desafioAtual = null;
    this.aguardandoResposta = false;
  }

  // ── API pública ────────────────────────────────────────────────

  /** Inicia o sistema de desafios com o primeiro da lista. */
  iniciar() {
    this.indice = 0;
    this._apresentarDesafio();
  }

  /**
   * Verifica se o elemento desenhado responde ao desafio atual.
   *
   * @param {string} elemento - Elemento SpellIR ('fire', 'water', etc.)
   * @returns {'correto'|'errado'|'sem_desafio'}
   */
  validar(elemento) {
    if (!this.desafioAtual || !this.aguardandoResposta) {
      return 'sem_desafio';
    }
    return elemento === this.desafioAtual.respostaCorreta ? 'correto' : 'errado';
  }

  /**
   * Retorna o array de falas de erro específico para o elemento errado.
   * Usa a chave '_padrao' como fallback.
   *
   * @param {string} elemento
   * @returns {string[]}
   */
  feedbackErro(elemento) {
    const erros = this.desafioAtual?.dialogoErro ?? {};
    return (
      erros[elemento] ??
      erros._padrao ?? ['Esse sigilo não é o correto. Pense nas propriedades da Hessiana e tente novamente!']
    );
  }

  /**
   * Avança para o próximo desafio após o jogador acertar.
   * Deve ser chamado após o diálogo de acerto terminar.
   */
  avancar() {
    this.aguardandoResposta = false;

    // Notifica main.js para limpar o canvas
    document.dispatchEvent(new CustomEvent('puzzle:avancou'));

    this.indice += 1;

    if (this.indice < this.desafios.length) {
      setTimeout(() => this._apresentarDesafio(), 1400);
    } else {
      setTimeout(() => this._mostrarConclusao(), 1400);
    }
  }

  // ── Métodos internos ───────────────────────────────────────────

  _apresentarDesafio() {
    this.desafioAtual = this.desafios[this.indice];
    this.aguardandoResposta = true;

    this._atualizarPainelUI();

    // Notifica o jogo para que Nabla inicie o diálogo de apresentação
    document.dispatchEvent(
      new CustomEvent('puzzle:novo', { detail: { desafio: this.desafioAtual } })
    );
  }

  /** Atualiza o painel visual de desafio no HTML. */
  _atualizarPainelUI() {
    const painel = document.getElementById('desafioPanel');
    if (!painel || !this.desafioAtual) return;

    const d = this.desafioAtual;
    const progresso = `${this.indice + 1} / ${this.desafios.length}`;

    painel.hidden = false;
    painel.innerHTML = `
      <div class="desafio-cabecalho">
        <span class="desafio-numero">${progresso}</span>
        <span class="desafio-titulo">${d.titulo}</span>
      </div>
      <p class="desafio-enunciado">${d.enunciado}</p>
      <p class="desafio-dica">${d.dica}</p>
    `;
  }

  /** Exibe a tela de fim do Ano I e anuncia os conteúdos futuros. */
  _mostrarConclusao() {
    const painel = document.getElementById('desafioPanel');
    if (painel) {
      painel.hidden = false;
      painel.innerHTML = `
        <div class="ending-wrapper">
          <div class="ending-titulo">✦ Ano I Concluído ✦</div>
          <p class="ending-subtitulo">O Caderno de Sigilos está completo, aprendiz.</p>
          <ul class="ending-conquistas">
            <li>✦ Sigilo do Fogo — f(x,y) = x² + y² · Mínimo</li>
            <li>✦ Sigilo da Terra — f(x,y) = x² − y² · Sela</li>
            <li>✦ Sigilo da Água — f(x,y) = e^(−r²) · Máximo</li>
            <li>✦ Sigilo do Vento — f(x,y) = sin(x)+cos(y) · Periódico</li>
            <li>✦ Sigilo da Luz — f(x,y) = ln(x²+y²+1) · Logarítmico</li>
          </ul>
          <div class="ending-divisor">◈  ◈  ◈</div>
          <p class="ending-em-breve-titulo">Conteúdos futuros:</p>
          <ul class="ending-proximos">
            <li>
              <span class="ending-ano-badge">Ano II</span>
              <span>Os Ventos da Mudança</span>
              <span class="ending-tag">Derivadas Parciais &amp; Gradiente</span>
            </li>
            <li>
              <span class="ending-ano-badge">Ano III</span>
              <span>Topografia Mística</span>
              <span class="ending-tag">Curvas de Nível &amp; Campos Vetoriais</span>
            </li>
            <li>
              <span class="ending-ano-badge">Ano IV</span>
              <span>Os Pontos de Poder</span>
              <span class="ending-tag">Otimização &amp; Multiplicadores de Lagrange</span>
            </li>
          </ul>
        </div>
      `;
    }

    document.dispatchEvent(new CustomEvent('puzzle:concluido'));
  }
}
