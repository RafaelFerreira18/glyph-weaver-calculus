import * as math from 'mathjs';

/**
 * MAPEAMENTO DE SIGILOS (referência pedagógica):
 * - Fogo:  f(x,y) = x^2 + y^2            (paraboloide elíptico)
 * - Vento: f(x,y) = sin(x) + cos(y)       (superfície ondulatória)
 * - Água:  f(x,y) = e^(-(x^2+y^2))        (gaussiana)
 * - Terra: f(x,y) = x^2 - y^2             (sela)
 * - Luz:   f(x,y) = ln(x^2 + y^2 + 1)    (crescimento logarítmico)
 */

/**
 * Converte uma expressão matemática em formato texto para uma árvore sintática
 * do Math.js. Essa é a porta de entrada do sistema: toda função multivariável
 * começa como uma string (ex.: "x^2 + y^2") e precisa ser interpretada antes
 * de qualquer operação simbólica ou numérica.
 *
 * Ano letivo: Ano I — Funções Multivariáveis.
 *
 * @param {string} expr - Expressão matemática em texto (variáveis x e y).
 * @returns {math.MathNode} Árvore sintática do Math.js.
 * @example
 * // Sigilo Fogo — paraboloide elíptico
 * const node = parseFunction('x^2 + y^2');
 */
export function parseFunction(expr) {
  return math.parse(expr);
}

/**
 * Avalia numericamente uma função multivariável já parseada em um ponto
 * específico (x, y) do plano. No contexto do jogo, isso determina a
 * "intensidade do sigilo" numa posição do mapa.
 *
 * Ano letivo: Ano I — Funções Multivariáveis.
 *
 * @param {math.MathNode} node - Árvore sintática da função.
 * @param {number} x - Coordenada x do ponto.
 * @param {number} y - Coordenada y do ponto.
 * @returns {number} Valor numérico f(x, y).
 * @example
 * const node = parseFunction('x^2 + y^2');
 * evaluateAt(node, 1, 2); // 5
 */
export function evaluateAt(node, x, y) {
  return node.evaluate({ x, y });
}

/**
 * Calcula a derivada parcial simbólica de uma função em relação a uma variável.
 * A derivada parcial ∂f/∂x mede a taxa de variação da função na direção do
 * eixo x, mantendo y constante (e vice-versa). No jogo, representa a
 * "força direcional" de um sigilo ao longo de um eixo.
 *
 * Ano letivo: Ano II — Derivadas Parciais.
 *
 * @param {math.MathNode} node - Árvore sintática da função.
 * @param {string} variable - Variável de diferenciação: 'x' ou 'y'.
 * @returns {math.MathNode} Árvore sintática da derivada parcial.
 * @example
 * const node = parseFunction('x^2 + y^2');
 * const dfdx = partialDerivative(node, 'x'); // 2 * x
 */
export function partialDerivative(node, variable) {
  return math.derivative(node, variable);
}

/**
 * Calcula o vetor gradiente ∇f = [∂f/∂x, ∂f/∂y] simbolicamente.
 * O gradiente aponta na direção de maior crescimento da função e sua
 * magnitude indica a intensidade dessa variação. No jogo, o gradiente
 * é a "bússola mágica" que guia o jogador na direção de maior potência
 * do sigilo.
 *
 * Ano letivo: Ano III — Gradiente.
 *
 * @param {math.MathNode} node - Árvore sintática da função.
 * @returns {math.MathNode[]} Vetor [∂f/∂x, ∂f/∂y] como nós simbólicos.
 * @example
 * const node = parseFunction('x^2 + y^2');
 * const grad = gradient(node); // [2*x, 2*y]
 */
export function gradient(node) {
  const dfdx = math.derivative(node, 'x');
  const dfdy = math.derivative(node, 'y');
  return [dfdx, dfdy];
}

/**
 * Avalia o vetor gradiente numericamente em um ponto (x, y).
 * Retorna as componentes numéricas do gradiente, permitindo determinar
 * a direção e intensidade de crescimento da função naquele ponto exato.
 *
 * Ano letivo: Ano III — Gradiente.
 *
 * @param {math.MathNode} node - Árvore sintática da função.
 * @param {number} x - Coordenada x do ponto.
 * @param {number} y - Coordenada y do ponto.
 * @returns {number[]} Vetor [∂f/∂x(x,y), ∂f/∂y(x,y)] avaliado numericamente.
 * @example
 * const node = parseFunction('x^2 + y^2');
 * gradientAt(node, 1, 2); // [2, 4]
 */
export function gradientAt(node, x, y) {
  const [dfdx, dfdy] = gradient(node);
  return [
    dfdx.evaluate({ x, y }),
    dfdy.evaluate({ x, y }),
  ];
}

/**
 * Calcula a matriz Hessiana simbólica de uma função de duas variáveis.
 * A Hessiana é a matriz 2×2 das derivadas parciais de segunda ordem:
 *
 *   H = [[∂²f/∂x², ∂²f/∂x∂y],
 *        [∂²f/∂y∂x, ∂²f/∂y²]]
 *
 * Ela captura a curvatura local da superfície e é fundamental para
 * classificar pontos críticos. No jogo, a Hessiana revela a "natureza
 * do terreno mágico" ao redor de um ponto de poder.
 *
 * Ano letivo: Ano IV — Pontos Críticos.
 *
 * @param {math.MathNode} node - Árvore sintática da função.
 * @returns {math.MathNode[][]} Matriz 2×2 [[fxx, fxy], [fyx, fyy]] simbólica.
 * @example
 * const node = parseFunction('x^2 + y^2');
 * const H = hessian(node);
 * // H[0][0].toString() → "2", H[1][1].toString() → "2"
 */
export function hessian(node) {
  const dfdx = math.derivative(node, 'x');
  const dfdy = math.derivative(node, 'y');

  const fxx = math.derivative(dfdx, 'x');
  const fxy = math.derivative(dfdx, 'y');
  const fyx = math.derivative(dfdy, 'x');
  const fyy = math.derivative(dfdy, 'y');

  return [
    [fxx, fxy],
    [fyx, fyy],
  ];
}

/**
 * Avalia a matriz Hessiana numericamente em um ponto (x, y).
 * Retorna uma matriz 2×2 de números que descrevem a curvatura local
 * da superfície naquele ponto específico.
 *
 * Ano letivo: Ano IV — Pontos Críticos.
 *
 * @param {math.MathNode} node - Árvore sintática da função.
 * @param {number} x - Coordenada x do ponto.
 * @param {number} y - Coordenada y do ponto.
 * @returns {number[][]} Matriz 2×2 [[fxx, fxy], [fyx, fyy]] numérica.
 * @example
 * const node = parseFunction('x^2 + y^2');
 * hessianAt(node, 0, 0); // [[2, 0], [0, 2]]
 */
export function hessianAt(node, x, y) {
  const H = hessian(node);
  return [
    [H[0][0].evaluate({ x, y }), H[0][1].evaluate({ x, y })],
    [H[1][0].evaluate({ x, y }), H[1][1].evaluate({ x, y })],
  ];
}

/**
 * Classifica um ponto crítico (x₀, y₀) utilizando o teste da segunda derivada.
 *
 * O algoritmo calcula a Hessiana em (x₀, y₀) e usa:
 *   det(H) = fxx·fyy − fxy²
 *   - det > 0 e fxx > 0 → mínimo local
 *   - det > 0 e fxx < 0 → máximo local
 *   - det < 0           → ponto de sela
 *   - det = 0           → teste inconclusivo
 *
 * No jogo, essa classificação determina o "tipo de nexo de poder":
 * mínimos são poços, máximos são picos, e selas são portais dimensionais.
 *
 * Ano letivo: Ano IV — Pontos Críticos.
 *
 * @param {math.MathNode} node - Árvore sintática da função.
 * @param {number} x0 - Coordenada x do ponto crítico.
 * @param {number} y0 - Coordenada y do ponto crítico.
 * @returns {{ tipo: string, determinante: number, traco: number }}
 *   Classificação, determinante e traço da Hessiana.
 * @example
 * // Sigilo Terra — ponto de sela na origem
 * const node = parseFunction('x^2 - y^2');
 * classifyCriticalPoint(node, 0, 0);
 * // { tipo: 'saddle', determinante: -4, traco: 0 }
 */
export function classifyCriticalPoint(node, x0, y0) {
  const H = hessianAt(node, x0, y0);
  const fxx = H[0][0];
  const fxy = H[0][1];
  const fyy = H[1][1];

  const determinante = fxx * fyy - fxy * fxy;
  const traco = fxx + fyy;

  let tipo;
  if (determinante > 0 && fxx > 0) {
    tipo = 'min';
  } else if (determinante > 0 && fxx < 0) {
    tipo = 'max';
  } else if (determinante < 0) {
    tipo = 'saddle';
  } else {
    tipo = 'inconclusive';
  }

  return { tipo, determinante, traco };
}

/**
 * Busca numericamente pontos críticos de uma função f(x, y) em um domínio
 * retangular. Um ponto crítico ocorre onde o gradiente se anula: ∇f = 0.
 *
 * O algoritmo utiliza duas fases:
 *   1. Varredura em grade (passo 0.5) para localizar regiões candidatas
 *      onde |∇f| está próximo de zero.
 *   2. Refinamento por descida de gradiente do módulo de ∇f para convergir
 *      ao ponto crítico exato.
 *
 * Pontos duplicados (distância < 0.1) são eliminados. Cada ponto encontrado
 * é classificado automaticamente pelo teste da segunda derivada.
 *
 * No jogo, essa função "revela os nexos de poder" escondidos no mapa.
 *
 * Ano letivo: Ano IV — Pontos Críticos.
 *
 * @param {math.MathNode} node - Árvore sintática da função.
 * @param {{ xMin: number, xMax: number, yMin: number, yMax: number }} [domain]
 *   Domínio de busca. Padrão: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 }.
 * @returns {{ x: number, y: number, tipo: string }[]}
 *   Lista de pontos críticos encontrados com sua classificação.
 * @example
 * // Sigilo Vento — múltiplos pontos críticos
 * const node = parseFunction('sin(x) + cos(y)');
 * const pontos = findCriticalPoints(node);
 */
export function findCriticalPoints(node, domain) {
  const { xMin = -5, xMax = 5, yMin = -5, yMax = 5 } = domain || {};
  const step = 0.5;
  const tolerancia = 0.05;
  const candidatos = [];

  const [dfdx, dfdy] = gradient(node);

  // Fase 1: varredura em grade
  for (let xi = xMin; xi <= xMax; xi += step) {
    for (let yi = yMin; yi <= yMax; yi += step) {
      const gx = dfdx.evaluate({ x: xi, y: yi });
      const gy = dfdy.evaluate({ x: xi, y: yi });
      const magnitude = Math.sqrt(gx * gx + gy * gy);

      if (magnitude < tolerancia) {
        candidatos.push({ x: xi, y: yi });
      }
    }
  }

  // Fase 2: refinamento por descida de gradiente no módulo de ∇f
  const taxaAprendizado = 0.01;
  const iteracoesMax = 100;
  const refinados = candidatos.map((ponto) => {
    let { x, y } = ponto;

    for (let i = 0; i < iteracoesMax; i++) {
      const gx = dfdx.evaluate({ x, y });
      const gy = dfdy.evaluate({ x, y });
      const mag = Math.sqrt(gx * gx + gy * gy);

      if (mag < 1e-10) break;

      x -= taxaAprendizado * gx;
      y -= taxaAprendizado * gy;
    }

    return { x: Math.round(x * 1e6) / 1e6, y: Math.round(y * 1e6) / 1e6 };
  });

  // Eliminação de pontos duplicados
  const unicos = [];
  for (const ponto of refinados) {
    const duplicado = unicos.some(
      (p) => Math.abs(p.x - ponto.x) < 0.1 && Math.abs(p.y - ponto.y) < 0.1
    );
    if (!duplicado) {
      unicos.push(ponto);
    }
  }

  // Classificação de cada ponto crítico
  return unicos.map((ponto) => {
    const { tipo } = classifyCriticalPoint(node, ponto.x, ponto.y);
    return { x: ponto.x, y: ponto.y, tipo };
  });
}
