/**
 * Ano IV — Os Pontos de Poder
 * 
 * Conceito matemático: Máximos e mínimos (pontos críticos, Hessiana, classificação)
 * 
 * Os pontos críticos são onde ∇f = 0 — locais de poder especial
 * onde a magia se concentra (mínimo), se dispersa (máximo) ou
 * se torna instável (ponto de sela).
 * 
 * A Hessiana determina a natureza do ponto:
 * - det(H) > 0 e fxx > 0: mínimo local (concentração estável)
 * - det(H) > 0 e fxx < 0: máximo local (dispersão controlada)
 * - det(H) < 0: ponto de sela (instabilidade)
 * 
 * @module game/phases/ano4_pontos
 */

export const ANO_IV = {
  nome: 'Os Pontos de Poder',
  conceito: 'Máximos e mínimos',
  descricao: 'Encontre os pontos de poder nos sigilos. Classifique máximos, mínimos e selas.',
  desbloqueado: false,
  puzzles: [],
  
  iniciar() {
    console.log('[Ano IV] Os Pontos de Poder — a ser implementado');
  }
};
