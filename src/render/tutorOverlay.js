/**
 * Módulo de sobreposição tutorial "Olhos Arcanos".
 * 
 * O modo "Olhos Arcanos" é uma mecânica de jogo onde a aprendiz
 * pode ativar uma visão especial que revela:
 * - O campo vetorial ∇f sobreposto ao cenário
 * - As curvas de nível da função f(x,y)
 * - A direção de máximo crescimento (gradiente)
 * - Os pontos críticos destacados com classificação
 * 
 * Este modo serve como ferramenta pedagógica para visualizar
 * conceitos abstratos do cálculo multivariável de forma intuitiva.
 * 
 * @module render/tutorOverlay
 * @see Ano III — Topografia Mística (vetor gradiente)
 */

export class TutorOverlay {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ativo = false;
  }

  ativar() {
    this.ativo = true;
    console.log('[OlhosArcanos] Modo tutorial ativado — a ser implementado');
  }

  desativar() {
    this.ativo = false;
    console.log('[OlhosArcanos] Modo tutorial desativado');
  }

  renderCampoVetorial(gradientField) {
    console.log('[OlhosArcanos] renderCampoVetorial — a ser implementado');
  }

  renderCurvasDeNivel(funcao, niveis) {
    console.log('[OlhosArcanos] renderCurvasDeNivel — a ser implementado');
  }
}
