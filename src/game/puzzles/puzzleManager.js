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
    /** Lista completa de desafios do Ano I. */
    this.desafios = DESAFIOS;

    /** Índice do desafio atual. */
    this.indice = -1;

    /** Desafio em andamento (objeto do banco de desafios). */
    this.desafioAtual = null;

    /** Quando false, ignora tentativas (ex: durante diálogo de conclusão). */
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
      // Aguarda um momento para a transição ser suave
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

  /** Exibe mensagem de conclusão do Ano I. */
  _mostrarConclusao() {
    const painel = document.getElementById('desafioPanel');
    if (painel) {
      painel.innerHTML = `
        <div class="desafio-cabecalho">
          <span class="desafio-titulo">✦ Ano I Concluído! ✦</span>
        </div>
        <p class="desafio-enunciado">
          Você dominou todos os 5 sigilos primários do Atelier do Gradiente.
          O Ano II — Derivadas Parciais e Gradiente — aguarda, aprendiz.
        </p>
      `;
    }

    document.dispatchEvent(new CustomEvent('puzzle:concluido'));
  }
}
