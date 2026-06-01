import * as math from 'mathjs';
import { gradient, gradientAt, partialDerivative } from './multivarCalc.js';

// Re-exportações do módulo principal
export { gradient, gradientAt, partialDerivative };

/**
 * Gera um campo vetorial de gradientes sobre um domínio retangular.
 * O campo vetorial ∇f associa a cada ponto (x, y) do domínio o vetor
 * gradiente, que aponta na direção de maior crescimento de f.
 *
 * Essa visualização é essencial para entender o "fluxo de energia" de um
 * sigilo: as setas mostram para onde a potência do sigilo aumenta e com
 * qual intensidade.
 *
 * Ano letivo: Ano III — Gradiente.
 *
 * @param {math.MathNode} node - Árvore sintática da função.
 * @param {{ xMin: number, xMax: number, yMin: number, yMax: number }} [domain]
 *   Domínio de amostragem. Padrão: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 }.
 * @param {number} [step=1] - Espaçamento entre pontos da grade.
 * @returns {{ x: number, y: number, dx: number, dy: number, magnitude: number }[]}
 *   Lista de vetores do campo gradiente com posição, componentes e magnitude.
 * @example
 * import { parseFunction } from './multivarCalc.js';
 * const node = parseFunction('x^2 + y^2');
 * const campo = gradientField(node, { xMin: -2, xMax: 2, yMin: -2, yMax: 2 }, 1);
 * // [{ x: -2, y: -2, dx: -4, dy: -4, magnitude: 5.656... }, ...]
 */
export function gradientField(node, domain, step = 1) {
  const { xMin = -5, xMax = 5, yMin = -5, yMax = 5 } = domain || {};
  const [dfdx, dfdy] = gradient(node);
  const campo = [];

  for (let x = xMin; x <= xMax; x += step) {
    for (let y = yMin; y <= yMax; y += step) {
      const dx = dfdx.evaluate({ x, y });
      const dy = dfdy.evaluate({ x, y });
      const magnitude = Math.sqrt(dx * dx + dy * dy);
      campo.push({ x, y, dx, dy, magnitude });
    }
  }

  return campo;
}

/**
 * Calcula a derivada direcional de f em (x, y) na direção do vetor (dirX, dirY).
 *
 * A derivada direcional D_û f = ∇f · û mede a taxa de variação de f na
 * direção do vetor unitário û. O vetor fornecido é normalizado automaticamente.
 *
 * No jogo, a derivada direcional responde à pergunta: "se eu caminhar nesta
 * direção, quão rápido a potência do sigilo muda?"
 *
 * Ano letivo: Ano III — Gradiente.
 *
 * @param {math.MathNode} node - Árvore sintática da função.
 * @param {number} x - Coordenada x do ponto.
 * @param {number} y - Coordenada y do ponto.
 * @param {number} dirX - Componente x do vetor de direção.
 * @param {number} dirY - Componente y do vetor de direção.
 * @returns {number} Valor da derivada direcional D_û f(x, y).
 * @example
 * import { parseFunction } from './multivarCalc.js';
 * const node = parseFunction('x^2 + y^2');
 * // Derivada direcional em (1, 1) na direção (1, 0) → 2
 * directionalDerivative(node, 1, 1, 1, 0); // 2
 */
export function directionalDerivative(node, x, y, dirX, dirY) {
  const norma = Math.sqrt(dirX * dirX + dirY * dirY);
  if (norma === 0) {
    throw new Error('O vetor de direção não pode ser nulo.');
  }

  const ux = dirX / norma;
  const uy = dirY / norma;

  const [gx, gy] = gradientAt(node, x, y);
  return gx * ux + gy * uy;
}

/**
 * Calcula a magnitude (norma euclidiana) do vetor gradiente em um ponto.
 * |∇f(x,y)| = √((∂f/∂x)² + (∂f/∂y)²)
 *
 * A magnitude do gradiente indica a intensidade máxima de variação de f
 * naquele ponto. Magnitude zero indica um ponto crítico.
 *
 * Ano letivo: Ano III — Gradiente.
 *
 * @param {math.MathNode} node - Árvore sintática da função.
 * @param {number} x - Coordenada x do ponto.
 * @param {number} y - Coordenada y do ponto.
 * @returns {number} Magnitude |∇f(x, y)|.
 * @example
 * import { parseFunction } from './multivarCalc.js';
 * const node = parseFunction('x^2 + y^2');
 * gradientMagnitude(node, 3, 4); // 10
 */
export function gradientMagnitude(node, x, y) {
  const [gx, gy] = gradientAt(node, x, y);
  return Math.sqrt(gx * gx + gy * gy);
}
