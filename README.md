# 🧙‍♂️ Glyph Weaver: Atelier do Gradiente

> *Serious game* educacional de **Cálculo Multivariável** inspirado no mangá
> *Witch Hat Atelier* (とんがり帽子のアトリエ).

<div align="center">
  <!-- Substitua por uma captura de tela do projeto -->
  <img src="./assets/demo.gif" width="720" alt="Screenshot do Glyph Weaver"/>
</div>

## 📖 Sobre

Glyph Weaver transforma conceitos de Cálculo Multivariável em mecânicas de
magia: sigilos elementais representam funções de duas variáveis, o gradiente
indica a direção de maior potência, a Hessiana revela a natureza do terreno
mágico, e pontos críticos são nexos de poder a serem descobertos.

O projeto é um fork educacional do
[wha-spell-simulator](https://github.com/ytnrvdf/wha-spell-simulator),
estendido com módulos de matemática simbólica e visualização 3D.

## 🚀 Como Executar

```bash
git clone https://github.com/RafaelFerreira18/glyph-weaver-calculus.git
cd glyph-weaver-calculus
npm install
npm run dev
```

Acesse:
- **Página inicial**: http://127.0.0.1:5173/
- **Laboratório Matemático**: http://127.0.0.1:5173/math-demo.html
- **Simulador de Sigilos**: http://127.0.0.1:5173/spell-simulator.html

## 🗂️ Estrutura do Projeto

```
glyph-weaver-calculus/
├── src/
│   ├── math/               # Núcleo matemático (gradiente, hessiana, pontos críticos)
│   ├── parser/              # Reconhecimento de glifos (herdado do spell-simulator)
│   ├── render/              # Visualização 3D (Three.js)
│   ├── game/                # Mecânicas de jogo e progressão
│   └── ui/                  # Interface e estilos
├── tests/                   # Testes unitários (node:test)
├── tools/                   # Ferramentas de referência (labs)
├── docs/                    # Documentação
├── index.html               # Página principal
├── math-demo.html           # Laboratório matemático
└── spell-simulator.html     # Simulador de sigilos original
```

## 🧪 Testes

```bash
npm test
```

## 🛠️ Stack Tecnológica

| Tecnologia | Uso |
|-----------|-----|
| **Vite** | Bundler e dev server |
| **Three.js** | Visualização 3D das superfícies |
| **Math.js** | Parsing simbólico, derivação e álgebra computacional |
| **Node.js test runner** | Testes unitários |

## 📐 Conceitos Matemáticos

O jogo cobre os seguintes tópicos, organizados em 4 "Anos letivos":

| Ano | Tema | Mecânica no Jogo |
|-----|------|-------------------|
| I | Funções de várias variáveis | Sigilos elementais geram superfícies |
| II | Derivadas parciais | Força direcional dos sigilos |
| III | Vetor gradiente | Bússola mágica — direção de maior potência |
| IV | Pontos críticos e Hessiana | Nexos de poder — classificação do terreno |

### Sigilos Elementais

| Sigilo | Função | Superfície |
|--------|--------|-----------|
| 🔥 Fogo | x² + y² | Paraboloide elíptico |
| 💨 Vento | sin(x) + cos(y) | Ondulatória |
| 💧 Água | e^(-(x²+y²)) | Gaussiana |
| 🌍 Terra | x² - y² | Sela hiperbólica |
| ✨ Luz | ln(x²+y²+1) | Logarítmica |

## 📚 Documentação

- [Manual do Desenvolvedor](docs/manual.md)
- [Conceitos Matemáticos](docs/conceitos-matematicos.md)
- [Autoria de dicionários](docs/dictionary-authoring.md)
- [Regras do parser e semântica](docs/play-rules.md)
- [Contrato do GlyphAST](docs/glyph-ast.md)
- [Contrato do SpellIR](docs/spell-ir.md)
- [Notas de renderização](docs/effect-rendering.md)

## 🙏 Créditos e Agradecimentos

- **Witch Hat Atelier** (とんがり帽子のアトリエ) por Kamome Shirahama — inspiração
  artística e temática. Este é um projeto não oficial de fã, sem afiliação com
  os criadores, editoras ou licenciadores oficiais.
- [wha-spell-simulator](https://github.com/ytnrvdf/wha-spell-simulator) —
  projeto original de simulação de sigilos, do qual este repositório é derivado.
- **Math.js** — biblioteca de matemática simbólica e numérica.
- **Three.js** — motor de renderização 3D.

## 📄 Licença

Este projeto é distribuído sob a licença [MIT](LICENSE).
