import * as math from 'mathjs';
import {
  parseFunction,
  gradient,
  hessian,
  findCriticalPoints as _findCriticalPoints,
  classifyCriticalPoint as _classifyCriticalPoint,
} from './multivarCalc.js';

/**
 * Busca numericamente pontos críticos de f(x, y) em um domínio retangular.
 * Pontos críticos são posições onde o gradiente se anula (∇f = 0), indicando
 * possíveis mínimos, máximos ou pontos de sela.
 *
 * Utiliza varredura em grade seguida de refinamento por descida de gradiente,
 * e classifica cada ponto encontrado pelo teste da segunda derivada.
 *
 * No jogo, essa função revela os "nexos de poder" ocultos no mapa do sigilo.
 *
 * Ano letivo: Ano IV — Pontos Críticos.
 *
 * @param {math.MathNode} node - Árvore sintática da função.
 * @param {{ xMin: number, xMax: number, yMin: number, yMax: number }} [domain]
 *   Domínio de busca. Padrão: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 }.
 * @returns {{ x: number, y: number, tipo: string }[]}
 *   Lista de pontos críticos com classificação.
 * @example
 * import { parseFunction } from './multivarCalc.js';
 * const node = parseFunction('x^2 + y^2');
 * findCriticalPoints(node); // [{ x: 0, y: 0, tipo: 'min' }]
 */
export function findCriticalPoints(node, domain) {
  return _findCriticalPoints(node, domain);
}

/**
 * Classifica um ponto crítico (x₀, y₀) pelo teste da segunda derivada,
 * usando o determinante e o traço da Hessiana.
 *
 * Ano letivo: Ano IV — Pontos Críticos.
 *
 * @param {math.MathNode} node - Árvore sintática da função.
 * @param {number} x0 - Coordenada x do ponto crítico.
 * @param {number} y0 - Coordenada y do ponto crítico.
 * @returns {{ tipo: string, determinante: number, traco: number }}
 *   Classificação do ponto, determinante e traço da Hessiana.
 * @example
 * import { parseFunction } from './multivarCalc.js';
 * const node = parseFunction('x^2 - y^2');
 * classifyCriticalPoint(node, 0, 0);
 * // { tipo: 'saddle', determinante: -4, traco: 0 }
 */
export function classifyCriticalPoint(node, x0, y0) {
  return _classifyCriticalPoint(node, x0, y0);
}

/**
 * Realiza uma análise completa de uma função multivariável a partir de sua
 * expressão em texto. Essa é a função de mais alto nível do sistema,
 * combinando todas as etapas: parsing, cálculo simbólico do gradiente e
 * da Hessiana (inclusive em LaTeX), busca e classificação de pontos críticos.
 *
 * O objeto retornado contém tudo o que o jogo precisa para exibir a
 * "ficha técnica" de um sigilo ao jogador.
 *
 * Ano letivo: Ano IV — Pontos Críticos (combina todos os anos anteriores).
 *
 * @param {string} expr - Expressão matemática em texto (variáveis x e y).
 * @returns {{
 *   expressao: string,
 *   gradiente: { simbolico: string[], latex: string[] },
 *   hessiana: { simbolica: string[][], latex: string[][] },
 *   pontosCriticos: { x: number, y: number, tipo: string }[]
 * }} Objeto completo de análise da função.
 * @example
 * // Análise completa do Sigilo Fogo
 * const resultado = analyzeFunction('x^2 + y^2');
 * // resultado.pontosCriticos → [{ x: 0, y: 0, tipo: 'min' }]
 * // resultado.gradiente.simbolico → ['2 * x', '2 * y']
 */
export function analyzeFunction(expr) {
  const node = parseFunction(expr);

  // Gradiente simbólico e LaTeX
  const [dfdx, dfdy] = gradient(node);
  const gradienteSimbólico = [dfdx.toString(), dfdy.toString()];
  const gradienteLatex = [dfdx.toTex(), dfdy.toTex()];

  // Hessiana simbólica e LaTeX
  const H = hessian(node);
  const hessianaSimbólica = [
    [H[0][0].toString(), H[0][1].toString()],
    [H[1][0].toString(), H[1][1].toString()],
  ];
  const hessianaLatex = [
    [H[0][0].toTex(), H[0][1].toTex()],
    [H[1][0].toTex(), H[1][1].toTex()],
  ];

  // Pontos críticos
  const pontosCriticos = findCriticalPoints(node);

  return {
    expressao: expr,
    gradiente: {
      simbolico: gradienteSimbólico,
      latex: gradienteLatex,
    },
    hessiana: {
      simbolica: hessianaSimbólica,
      latex: hessianaLatex,
    },
    pontosCriticos,
  };
}
