/**
 * Sistema de progressão do jogo.
 * 
 * Controla o avanço da aprendiz pelos 4 Anos letivos,
 * desbloqueio de conteúdo e registro de conquistas.
 * 
 * @module game/progression
 */

import { ANO_I } from './phases/ano1_caderno.js';
import { ANO_II } from './phases/ano2_ventos.js';
import { ANO_III } from './phases/ano3_topografia.js';
import { ANO_IV } from './phases/ano4_pontos.js';

export const ANOS_LETIVOS = [ANO_I, ANO_II, ANO_III, ANO_IV];

export function getAnoAtual() {
  const progresso = carregarProgresso();
  return ANOS_LETIVOS[progresso.anoAtual] || ANO_I;
}

export function avancarAno() {
  const progresso = carregarProgresso();
  if (progresso.anoAtual < 3) {
    progresso.anoAtual++;
    salvarProgresso(progresso);
    ANOS_LETIVOS[progresso.anoAtual].desbloqueado = true;
  }
}

function carregarProgresso() {
  try {
    const dados = localStorage.getItem('glyph-weaver-progresso');
    return dados ? JSON.parse(dados) : { anoAtual: 0, puzzlesCompletos: [] };
  } catch {
    return { anoAtual: 0, puzzlesCompletos: [] };
  }
}

function salvarProgresso(progresso) {
  localStorage.setItem('glyph-weaver-progresso', JSON.stringify(progresso));
}
