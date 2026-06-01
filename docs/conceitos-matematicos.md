# Conceitos Matemáticos — Glyph Weaver: Atelier do Gradiente

Este documento apresenta os conceitos de Cálculo Multivariável utilizados no
jogo, organizados por Ano letivo (fase de progressão).

---

## 1. Funções de Várias Variáveis (Ano I)

### Definição

Uma **função de duas variáveis** é uma regra que associa a cada par ordenado
(x, y) do domínio D ⊂ R² um único valor real:

    f: R² → R
    (x, y) ↦ f(x, y)

### Domínio e Imagem

- **Domínio**: conjunto de todos os pares (x, y) para os quais f está definida.
- **Imagem**: conjunto de todos os valores f(x, y) possíveis.

### Representação Gráfica

O gráfico de f(x, y) é uma **superfície** no espaço tridimensional R³. Cada
ponto da superfície tem coordenadas (x, y, f(x, y)). A altura z = f(x, y)
representa o valor da função naquele ponto do plano.

### Os 5 Sigilos e Suas Funções

| Sigilo | Expressão | Descrição |
|--------|-----------|-----------|
| 🔥 Fogo | f(x,y) = x² + y² | Paraboloide elíptico — "tigela" voltada para cima. Mínimo global na origem. |
| 💨 Vento | f(x,y) = sin(x) + cos(y) | Superfície ondulatória — ondulações periódicas em ambas as direções. |
| 💧 Água | f(x,y) = e^(-(x²+y²)) | Gaussiana — "sino" centrado na origem. Máximo global em (0,0). |
| 🌍 Terra | f(x,y) = x² - y² | Sela hiperbólica — curvatura oposta nos eixos x e y. |
| ✨ Luz | f(x,y) = ln(x² + y² + 1) | Logarítmica — crescimento lento e radial a partir da origem. |

---

## 2. Derivadas Parciais (Ano II)

### Definição

A **derivada parcial** de f em relação a x mede a taxa de variação de f na
direção do eixo x, mantendo y constante:

    ∂f/∂x = lim[h→0] (f(x+h, y) - f(x, y)) / h

Analogamente, a derivada parcial em relação a y:

    ∂f/∂y = lim[h→0] (f(x, y+h) - f(x, y)) / h

### Interpretação Geométrica

- **∂f/∂x** em um ponto (a, b) é a inclinação da curva obtida ao cortar a
  superfície com o plano y = b (caminhando na direção x).
- **∂f/∂y** em um ponto (a, b) é a inclinação da curva obtida ao cortar a
  superfície com o plano x = a (caminhando na direção y).

### Cálculo para Cada Sigilo

#### 🔥 Fogo: f(x,y) = x² + y²
    ∂f/∂x = 2x
    ∂f/∂y = 2y

#### 💨 Vento: f(x,y) = sin(x) + cos(y)
    ∂f/∂x = cos(x)
    ∂f/∂y = -sin(y)

#### 💧 Água: f(x,y) = e^(-(x²+y²))
    ∂f/∂x = -2x · e^(-(x²+y²))
    ∂f/∂y = -2y · e^(-(x²+y²))

#### 🌍 Terra: f(x,y) = x² - y²
    ∂f/∂x = 2x
    ∂f/∂y = -2y

#### ✨ Luz: f(x,y) = ln(x² + y² + 1)
    ∂f/∂x = 2x / (x² + y² + 1)
    ∂f/∂y = 2y / (x² + y² + 1)

---

## 3. Vetor Gradiente (Ano III)

### Definição

O **gradiente** de f é o vetor formado pelas derivadas parciais:

    ∇f = (∂f/∂x, ∂f/∂y)

### Propriedades Fundamentais

1. **Direção de máximo crescimento**: ∇f aponta na direção em que f cresce
   mais rapidamente.

2. **Magnitude**: |∇f| = √((∂f/∂x)² + (∂f/∂y)²) indica a taxa máxima de
   variação de f naquele ponto.

3. **Perpendicular às curvas de nível**: ∇f é sempre perpendicular às curvas
   de nível f(x, y) = c.

### Derivada Direcional

A **derivada direcional** mede a taxa de variação de f na direção de um vetor
unitário û = (u₁, u₂):

    D_û f = ∇f · û = (∂f/∂x)·u₁ + (∂f/∂y)·u₂

Propriedades:
- Máxima quando û é paralelo a ∇f.
- Zero quando û é perpendicular a ∇f (ao longo de uma curva de nível).
- Mínima quando û é antiparalelo a ∇f.

### Campo Vetorial

O gradiente define um **campo vetorial**: em cada ponto (x, y) do domínio,
associamos o vetor ∇f(x, y). Visualizar esse campo é como ver o "fluxo de
energia" do sigilo em todo o mapa.

### Gradiente de Cada Sigilo

#### 🔥 Fogo
    ∇f = (2x, 2y)
    Aponta radialmente para fora da origem — a energia aumenta ao se afastar.

#### 💨 Vento
    ∇f = (cos(x), -sin(y))
    Padrão ondulatório — a direção de crescimento oscila periodicamente.

#### 💧 Água
    ∇f = (-2x·e^(-(x²+y²)), -2y·e^(-(x²+y²)))
    Aponta radialmente para a origem — a energia se concentra no centro.

#### 🌍 Terra
    ∇f = (2x, -2y)
    Cresce em x e decresce em y — fluxo em "X" cruzado.

#### ✨ Luz
    ∇f = (2x/(x²+y²+1), 2y/(x²+y²+1))
    Radial como Fogo, mas com intensidade decrescente (logarítmica).

---

## 4. Pontos Críticos e Classificação (Ano IV)

### Definição

Um **ponto crítico** de f é um ponto (x₀, y₀) onde o gradiente se anula:

    ∇f(x₀, y₀) = (0, 0)

Nos pontos críticos, a função não tem uma direção preferencial de crescimento.
São candidatos a máximos, mínimos ou pontos de sela.

### Matriz Hessiana

A **Hessiana** é a matriz 2×2 das derivadas parciais de segunda ordem:

    H = | ∂²f/∂x²    ∂²f/∂x∂y |
        | ∂²f/∂y∂x   ∂²f/∂y²  |

Para funções suficientemente suaves (classe C²), a Hessiana é simétrica:
∂²f/∂x∂y = ∂²f/∂y∂x.

### Teste da Segunda Derivada

Seja (x₀, y₀) um ponto crítico. Definimos:

    fxx = ∂²f/∂x²(x₀, y₀)
    fyy = ∂²f/∂y²(x₀, y₀)
    fxy = ∂²f/∂x∂y(x₀, y₀)

    D = det(H) = fxx · fyy - fxy²

A classificação é:

| Condição | Classificação |
|----------|--------------|
| D > 0 e fxx > 0 | **Mínimo local** — o ponto é um "vale" |
| D > 0 e fxx < 0 | **Máximo local** — o ponto é um "pico" |
| D < 0 | **Ponto de sela** — o ponto é um "passo de montanha" |
| D = 0 | **Inconclusivo** — o teste não determina |

O **traço** da Hessiana (fxx + fyy) fornece informação adicional sobre a
curvatura média.

### Classificação de Cada Sigilo

#### 🔥 Fogo: f(x,y) = x² + y²
    Ponto crítico: (0, 0)
    H = | 2  0 |    D = 4 > 0, fxx = 2 > 0
        | 0  2 |
    Classificação: **Mínimo local** (global)

#### 💨 Vento: f(x,y) = sin(x) + cos(y)
    Pontos críticos: (nπ + π/2, mπ) para n, m inteiros
    - Em (π/2, 0): fxx = -1, fyy = -1, fxy = 0 → D = 1 > 0, fxx < 0 → **Máximo**
    - Em (-π/2, 0): fxx = 1, fyy = -1, fxy = 0 → D = -1 < 0 → **Sela**
    - Em (π/2, π): fxx = -1, fyy = 1, fxy = 0 → D = -1 < 0 → **Sela**
    - Em (-π/2, π): fxx = 1, fyy = 1, fxy = 0 → D = 1 > 0, fxx > 0 → **Mínimo**

#### 💧 Água: f(x,y) = e^(-(x²+y²))
    Ponto crítico: (0, 0)
    H = | -2  0  |    D = 4 > 0, fxx = -2 < 0
        |  0  -2 |
    Classificação: **Máximo local** (global)

#### 🌍 Terra: f(x,y) = x² - y²
    Ponto crítico: (0, 0)
    H = | 2   0  |    D = -4 < 0
        | 0  -2  |
    Classificação: **Ponto de sela**

#### ✨ Luz: f(x,y) = ln(x² + y² + 1)
    Ponto crítico: (0, 0)
    H = | 2  0 |    D = 4 > 0, fxx = 2 > 0
        | 0  2 |
    Classificação: **Mínimo local** (global)
