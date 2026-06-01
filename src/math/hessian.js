import * as math from 'mathjs';
import { hessian, hessianAt } from './multivarCalc.js';

/**
 * Retorna a matriz Hessiana simbólica 2×2 de uma função f(x, y).
 *
 * A Hessiana contém todas as derivadas parciais de segunda ordem:
 *   H = [[∂²f/∂x², ∂²f/∂x∂y],
 *        [∂²f/∂y∂x, ∂²f/∂y²]]
 *
 * No jogo, a Hessiana é o "mapa de curvatura" do terreno ao redor
 * de um nexo de poder, revelando se o terreno é côncavo, convexo ou
 * possui forma de sela.
 *
 * Ano letivo: Ano IV — Pontos Críticos.
 *
 * @param {math.MathNode} node - Árvore sintática da função.
 * @returns {math.MathNode[][]} Matriz 2×2 [[fxx, fxy], [fyx, fyy]] simbólica.
 * @example
 * import { parseFunction } from './multivarCalc.js';
 * const node = parseFunction('x^2 + y^2');
 * const H = hessianMatrix(node);
 * // H[0][0].toString() → "2"
 */
export function hessianMatrix(node) {
  return hessian(node);
}

/**
 * Calcula o determinante da matriz Hessiana em um ponto (x, y).
 *   det(H) = fxx · fyy − fxy²
 *
 * O determinante é a peça central do teste da segunda derivada:
 *   - det > 0 → ponto é extremo local (mínimo ou máximo)
 *   - det < 0 → ponto de sela
 *   - det = 0 → teste inconclusivo
 *
 * Ano letivo: Ano IV — Pontos Críticos.
 *
 * @param {math.MathNode} node - Árvore sintática da função.
 * @param {number} x - Coordenada x do ponto.
 * @param {number} y - Coordenada y do ponto.
 * @returns {number} Determinante det(H) avaliado em (x, y).
 * @example
 * import { parseFunction } from './multivarCalc.js';
 * const node = parseFunction('x^2 - y^2');
 * hessianDeterminant(node, 0, 0); // -4 (ponto de sela)
 */
export function hessianDeterminant(node, x, y) {
  const H = hessianAt(node, x, y);
  const fxx = H[0][0];
  const fxy = H[0][1];
  const fyy = H[1][1];
  return fxx * fyy - fxy * fxy;
}

/**
 * Calcula o traço da matriz Hessiana em um ponto (x, y).
 *   tr(H) = fxx + fyy = ∂²f/∂x² + ∂²f/∂y²
 *
 * O traço da Hessiana é igual ao Laplaciano da função (∇²f), que mede
 * a curvatura média da superfície. Um Laplaciano positivo indica que
 * a superfície é localmente "côncava para cima" em média; negativo
 * indica "côncava para baixo".
 *
 * Ano letivo: Ano IV — Pontos Críticos.
 *
 * @param {math.MathNode} node - Árvore sintática da função.
 * @param {number} x - Coordenada x do ponto.
 * @param {number} y - Coordenada y do ponto.
 * @returns {number} Traço tr(H) = Laplaciano ∇²f avaliado em (x, y).
 * @example
 * import { parseFunction } from './multivarCalc.js';
 * const node = parseFunction('x^2 + y^2');
 * hessianTrace(node, 0, 0); // 4 (Laplaciano)
 */
export function hessianTrace(node, x, y) {
  const H = hessianAt(node, x, y);
  return H[0][0] + H[1][1];
}

/**
 * Verifica se a matriz Hessiana é positiva definida em um ponto (x, y).
 *
 * Uma Hessiana positiva definida garante que o ponto crítico é um mínimo local.
 * Pelo critério de Sylvester para matrizes 2×2:
 *   - fxx > 0 (primeiro menor principal positivo)
 *   - det(H) > 0 (segundo menor principal positivo)
 *
 * No jogo, um ponto com Hessiana positiva definida é um "poço de poder" —
 * a energia do sigilo converge para esse ponto de todas as direções.
 *
 * Ano letivo: Ano IV — Pontos Críticos.
 *
 * @param {math.MathNode} node - Árvore sintática da função.
 * @param {number} x - Coordenada x do ponto.
 * @param {number} y - Coordenada y do ponto.
 * @returns {boolean} true se H é positiva definida em (x, y).
 * @example
 * import { parseFunction } from './multivarCalc.js';
 * const node = parseFunction('x^2 + y^2');
 * isPositiveDefinite(node, 0, 0); // true (mínimo)
 */
export function isPositiveDefinite(node, x, y) {
  const H = hessianAt(node, x, y);
  const fxx = H[0][0];
  const det = hessianDeterminant(node, x, y);
  return fxx > 0 && det > 0;
}

/**
 * Verifica se a matriz Hessiana é negativa definida em um ponto (x, y).
 *
 * Uma Hessiana negativa definida garante que o ponto crítico é um máximo local.
 * Pelo critério de Sylvester para matrizes 2×2:
 *   - fxx < 0 (primeiro menor principal negativo)
 *   - det(H) > 0 (segundo menor principal positivo, pois (-)(-)=(+))
 *
 * No jogo, um ponto com Hessiana negativa definida é um "pico de poder" —
 * a energia do sigilo irradia a partir desse ponto em todas as direções.
 *
 * Ano letivo: Ano IV — Pontos Críticos.
 *
 * @param {math.MathNode} node - Árvore sintática da função.
 * @param {number} x - Coordenada x do ponto.
 * @param {number} y - Coordenada y do ponto.
 * @returns {boolean} true se H é negativa definida em (x, y).
 * @example
 * import { parseFunction } from './multivarCalc.js';
 * // Gaussiana invertida: -e^(-(x^2+y^2)) tem máximo na origem
 * const node = parseFunction('-e^(-(x^2+y^2))');
 * isNegativeDefinite(node, 0, 0); // true (máximo)
 */
export function isNegativeDefinite(node, x, y) {
  const H = hessianAt(node, x, y);
  const fxx = H[0][0];
  const det = hessianDeterminant(node, x, y);
  return fxx < 0 && det > 0;
}
