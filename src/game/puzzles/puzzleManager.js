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

const NOMES_ANOS = ['', 'Caderno dos Sigilos', 'Os Ventos da Mudança', 'Topografia Mística', 'Os Pontos de Poder'];
const CONCEITOS_ANOS = ['', 'Sigilos primários', 'Derivadas parciais', 'Vetor gradiente e Integrais', 'Otimização e Campos vetoriais'];

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

    /** Ano atual (1–4). */
    this.faseAtual = 1;
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
   * Avança para o próximo ANO após conclusão do atual.
   * Dispara `fase:nova` para que main.js exiba o diálogo e painel do novo ano.
   */
  avancarFase() {
    if (this.faseAtual >= 4) return;
    this.faseAtual += 1;
    document.dispatchEvent(new CustomEvent('fase:nova', { detail: { fase: this.faseAtual } }));
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

  /** Exibe mensagem de conclusão do ano atual e botão para avançar. */
  _mostrarConclusao() {
    const painel = document.getElementById('desafioPanel');
    const nomeAtual  = NOMES_ANOS[this.faseAtual]    || `Ano ${this.faseAtual}`;
    const nomeProx   = NOMES_ANOS[this.faseAtual + 1] || null;
    const conceitoProx = CONCEITOS_ANOS[this.faseAtual + 1] || null;
    const temProximo = this.faseAtual < 4;

    if (painel) {
      painel.hidden = false;
      painel.innerHTML = `
        <div class="desafio-cabecalho">
          <span class="desafio-titulo">✦ Ano ${this.faseAtual} Concluído! ✦</span>
        </div>
        <p class="desafio-enunciado">
          Você completou todos os desafios de <strong>${nomeAtual}</strong>.
          ${temProximo
            ? `O Ano ${this.faseAtual + 1} — <em>${nomeProx}</em> (${conceitoProx}) — aguarda, aprendiz.`
            : 'Você concluiu todos os 4 anos do Atelier do Gradiente. Parabéns, mestre!'}
        </p>
        ${temProximo
          ? `<button type="button" id="btnProximoAno" class="desafio-btn-avancar">
               ✦ Ir para o Ano ${this.faseAtual + 1} →
             </button>`
          : ''}
      `;
    }

    document.dispatchEvent(new CustomEvent('puzzle:concluido'));
  }
}
