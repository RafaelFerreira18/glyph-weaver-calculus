import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  parseFunction,
  evaluateAt,
  partialDerivative,
  gradient,
  gradientAt,
  hessian,
  hessianAt,
  classifyCriticalPoint,
  findCriticalPoints
} from '../src/math/multivarCalc.js';

const EPSILON = 0.01;
const SEARCH_EPSILON = 0.1;

function approx(actual, expected, eps = EPSILON, msg) {
  assert.ok(
    Math.abs(actual - expected) < eps,
    msg || `Expected ~${expected}, got ${actual}`
  );
}

// ── Sigil expressions (mathjs syntax) ──
const FOGO  = 'x^2 + y^2';
const VENTO = 'sin(x) + cos(y)';
const AGUA  = 'exp(-(x^2 + y^2))';
const TERRA = 'x^2 - y^2';
const LUZ   = 'log(x^2 + y^2 + 1)';

// ────────────────────────────────────────
// 1. parseFunction
// ────────────────────────────────────────
describe('parseFunction', () => {
  it('parses Fogo: x^2 + y^2', () => {
    assert.doesNotThrow(() => parseFunction(FOGO));
  });

  it('parses Vento: sin(x) + cos(y)', () => {
    assert.doesNotThrow(() => parseFunction(VENTO));
  });

  it('parses Água: exp(-(x^2+y^2))', () => {
    assert.doesNotThrow(() => parseFunction(AGUA));
  });

  it('parses Terra: x^2 - y^2', () => {
    assert.doesNotThrow(() => parseFunction(TERRA));
  });

  it('parses Luz: log(x^2 + y^2 + 1)', () => {
    assert.doesNotThrow(() => parseFunction(LUZ));
  });

  it('throws on invalid expression', () => {
    assert.throws(() => parseFunction('x^2 +* y'));
  });
});

// ────────────────────────────────────────
// 2. evaluateAt
// ────────────────────────────────────────
describe('evaluateAt', () => {
  it('Fogo at (1,1) → 2', () => {
    const node = parseFunction(FOGO);
    approx(evaluateAt(node, 1, 1), 2);
  });

  it('Fogo at (0,0) → 0', () => {
    const node = parseFunction(FOGO);
    approx(evaluateAt(node, 0, 0), 0);
  });

  it('Vento at (0,0) → 1 (sin(0)+cos(0))', () => {
    const node = parseFunction(VENTO);
    approx(evaluateAt(node, 0, 0), 1);
  });

  it('Terra at (1,1) → 0', () => {
    const node = parseFunction(TERRA);
    approx(evaluateAt(node, 1, 1), 0);
  });
});

// ────────────────────────────────────────
// 3. Gradient tests
// ────────────────────────────────────────
describe('gradient', () => {
  describe('Fogo (x^2 + y^2)', () => {
    it('∇f at (1,1) → [2, 2]', () => {
      const node = parseFunction(FOGO);
      const [gx, gy] = gradientAt(node, 1, 1);
      approx(gx, 2);
      approx(gy, 2);
    });

    it('∇f at (0,0) → [0, 0]', () => {
      const node = parseFunction(FOGO);
      const [gx, gy] = gradientAt(node, 0, 0);
      approx(gx, 0);
      approx(gy, 0);
    });
  });

  describe('Vento (sin(x) + cos(y))', () => {
    it('∇f at (0,0) → [1, 0]', () => {
      const node = parseFunction(VENTO);
      const [gx, gy] = gradientAt(node, 0, 0);
      approx(gx, 1);
      approx(gy, 0);
    });
  });

  describe('Água (exp(-(x^2+y^2)))', () => {
    it('∇f at (0,0) → [0, 0] (critical point)', () => {
      const node = parseFunction(AGUA);
      const [gx, gy] = gradientAt(node, 0, 0);
      approx(gx, 0);
      approx(gy, 0);
    });
  });

  describe('Terra (x^2 - y^2)', () => {
    it('∇f at (1,1) → [2, -2]', () => {
      const node = parseFunction(TERRA);
      const [gx, gy] = gradientAt(node, 1, 1);
      approx(gx, 2);
      approx(gy, -2);
    });

    it('∇f at (0,0) → [0, 0]', () => {
      const node = parseFunction(TERRA);
      const [gx, gy] = gradientAt(node, 0, 0);
      approx(gx, 0);
      approx(gy, 0);
    });
  });

  describe('Luz (log(x^2 + y^2 + 1))', () => {
    it('∇f at (0,0) → [0, 0]', () => {
      const node = parseFunction(LUZ);
      const [gx, gy] = gradientAt(node, 0, 0);
      approx(gx, 0);
      approx(gy, 0);
    });
  });
});

// ────────────────────────────────────────
// 4. Hessian tests
// ────────────────────────────────────────
describe('hessian', () => {
  it('Fogo: H = [[2, 0], [0, 2]] everywhere', () => {
    const node = parseFunction(FOGO);
    const H = hessianAt(node, 3, 7);
    approx(H[0][0], 2);
    approx(H[0][1], 0);
    approx(H[1][0], 0);
    approx(H[1][1], 2);
  });

  it('Terra: H = [[2, 0], [0, -2]] everywhere', () => {
    const node = parseFunction(TERRA);
    const H = hessianAt(node, 5, -3);
    approx(H[0][0], 2);
    approx(H[0][1], 0);
    approx(H[1][0], 0);
    approx(H[1][1], -2);
  });

  it('Vento at (0,0): H = [[0, 0], [0, -1]]', () => {
    const node = parseFunction(VENTO);
    const H = hessianAt(node, 0, 0);
    approx(H[0][0], 0);   // -sin(0) = 0
    approx(H[0][1], 0);
    approx(H[1][0], 0);
    approx(H[1][1], -1);  // -cos(0) = -1
  });
});

// ────────────────────────────────────────
// 5. Critical point classification
// ────────────────────────────────────────
describe('classifyCriticalPoint', () => {
  it('Fogo at (0,0): minimum', () => {
    const node = parseFunction(FOGO);
    const result = classifyCriticalPoint(node, 0, 0);
    assert.equal(result.tipo, 'min');
    assert.ok(result.determinante > 0, 'det > 0');
  });

  it('Terra at (0,0): saddle', () => {
    const node = parseFunction(TERRA);
    const result = classifyCriticalPoint(node, 0, 0);
    assert.equal(result.tipo, 'saddle');
    assert.ok(result.determinante < 0, 'det < 0');
  });

  it('Água at (0,0): maximum', () => {
    const node = parseFunction(AGUA);
    const result = classifyCriticalPoint(node, 0, 0);
    assert.equal(result.tipo, 'max');
    assert.ok(result.determinante > 0, 'det > 0');
  });

  it('Luz at (0,0): minimum', () => {
    const node = parseFunction(LUZ);
    const result = classifyCriticalPoint(node, 0, 0);
    assert.equal(result.tipo, 'min');
    assert.ok(result.determinante > 0, 'det > 0');
  });

  it('Vento: critical point at (π/2, 0) is a saddle or extremum', () => {
    const node = parseFunction(VENTO);
    const result = classifyCriticalPoint(node, Math.PI / 2, 0);
    assert.ok(
      ['min', 'max', 'saddle'].includes(result.tipo),
      `Expected a valid classification, got ${result.tipo}`
    );
  });
});

// ────────────────────────────────────────
// 6. findCriticalPoints
// ────────────────────────────────────────
describe('findCriticalPoints', () => {
  const domain = { xMin: -3, xMax: 3, yMin: -3, yMax: 3 };

  it('Fogo: finds (0,0) as a critical point', () => {
    const node = parseFunction(FOGO);
    const points = findCriticalPoints(node, domain);
    const origin = points.find(
      (p) => Math.abs(p.x) < SEARCH_EPSILON && Math.abs(p.y) < SEARCH_EPSILON
    );
    assert.ok(origin, 'Should find critical point near (0,0)');
    assert.equal(origin.tipo, 'min');
  });

  it('Terra: finds (0,0) as a critical point', () => {
    const node = parseFunction(TERRA);
    const points = findCriticalPoints(node, domain);
    const origin = points.find(
      (p) => Math.abs(p.x) < SEARCH_EPSILON && Math.abs(p.y) < SEARCH_EPSILON
    );
    assert.ok(origin, 'Should find critical point near (0,0)');
    assert.equal(origin.tipo, 'saddle');
  });

  it('Água: finds (0,0) as a critical point', () => {
    const node = parseFunction(AGUA);
    const points = findCriticalPoints(node, domain);
    const origin = points.find(
      (p) => Math.abs(p.x) < SEARCH_EPSILON && Math.abs(p.y) < SEARCH_EPSILON
    );
    assert.ok(origin, 'Should find critical point near (0,0)');
    assert.equal(origin.tipo, 'max');
  });
});
