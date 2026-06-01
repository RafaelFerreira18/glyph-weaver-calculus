# Manual do Desenvolvedor — Glyph Weaver: Atelier do Gradiente

## Visão Geral

Glyph Weaver: Atelier do Gradiente é um *serious game* educacional para o ensino
de Cálculo Multivariável. O jogo utiliza mecânicas de magia inspiradas no mangá
*Witch Hat Atelier* para tornar conceitos matemáticos abstratos tangíveis e
interativos.

## Arquitetura

### Módulos Principais

#### src/math/ — Núcleo Pedagógico
O coração do jogo. Contém toda a lógica matemática:
- `multivarCalc.js` — Funções principais: parsing, derivação, gradiente, hessiana
- `gradient.js` — Campo vetorial gradiente e derivada direcional
- `hessian.js` — Matriz Hessiana e testes de definição
- `criticalPoints.js` — Busca e classificação de pontos críticos

#### src/parser/ — Reconhecimento de Glifos (Herdado)
Código herdado do wha-spell-simulator:
- `strokeRecognizer.js` → reconhecimento de traços desenhados
- `ringDetector.js` → detecção do anel delimitador (domínio)
- `symbolRecognizer.js` → identificação de sigilos e signos

#### src/render/ — Visualização
- `scene3D.js` — Renderização Three.js das superfícies f(x,y)
- `canvas2D.js` — Canvas 2D para sigilos e partículas (futuro)
- `tutorOverlay.js` — Modo "Olhos Arcanos" (futuro)

#### src/game/ — Mecânicas de Jogo
- `phases/` — Os 4 Anos letivos
- `npcs/` — Personagens (Mestra Nabla)
- `progression.js` — Sistema de progressão
- `puzzles/` — Desafios (futuro)

#### src/ui/ — Interface
- `styles.css` — Tema visual pergaminho
- `dialogueBox.js` — Caixa de diálogo para NPCs

### Mapeamento Sigilo → Função

| Sigilo | Função | Tipo de Superfície |
|--------|--------|-------------------|
| 🔥 Fogo | f(x,y) = x² + y² | Paraboloide elíptico |
| 💨 Vento | f(x,y) = sin(x) + cos(y) | Ondulatória |
| 💧 Água | f(x,y) = e^(-(x²+y²)) | Gaussiana |
| 🌍 Terra | f(x,y) = x² - y² | Sela hiperbólica |
| ✨ Luz | f(x,y) = ln(x²+y²+1) | Logarítmica |

### Mapeamento Signo Modificador → Operação

| Signo | Operação |
|-------|----------|
| Expansão | ∇f · k (escalar multiplicador) |
| Reverso | -∇f (inversão de fluxo) |
| Compressão | f(2x, 2y) (mudança de escala) |
| Direção | Derivada direcional ∇f · û |

## Como Executar

```bash
git clone <url-do-repositorio>
cd glyph-weaver-calculus
npm install
npm run dev
```

Acesse:
- Página inicial: http://127.0.0.1:5173/
- Laboratório Matemático: http://127.0.0.1:5173/math-demo.html
- Simulador de Sigilos (original): http://127.0.0.1:5173/index.html

## Testes

```bash
npm test
```

## Dependências

- **Vite** — Bundler e dev server
- **Three.js** — Visualização 3D das superfícies
- **Math.js** — Parsing simbólico, derivação e álgebra
