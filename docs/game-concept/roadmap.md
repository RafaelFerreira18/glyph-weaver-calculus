> **Como usar este documento:** Este arquivo é a fonte única da verdade sobre o estado e a direção do projeto. Toda IA (Claude Code, Cursor, Copilot, Bolt) e todo desenvolvedor humano deve ler este arquivo antes de tocar em qualquer código. Atualize as checkboxes ao final de cada sprint e mova itens entre seções conforme o trabalho avança. Se um agente de IA for invocado sem contexto, anexe este arquivo no prompt.

---

# ROADMAP — Glyph Weaver: Atelier do Gradiente

## 📌 Visão Geral do Projeto

| Campo | Valor |
|---|---|
| **Nome** | Glyph Weaver: Atelier do Gradiente |
| **Tipo** | Serious Game web (browser-based) |
| **Disciplina** | Resolução de Problemas Multivariáveis |
| **Instituição** | CESUPA — Centro Universitário do Pará |
| **Curso** | Ciência da Computação |
| **Professor** | Pedro Girotto |
| **Equipe** | Até 4 alunos |
| **Valor** | 4,0 pontos da nota final |
| **Apresentação** | [DEFINIR DATA] |

### Pitch em uma frase

> Uma escola de magia onde a Mestra Nabla ensina o jogador a tecer sigilos — e cada sigilo é, na prática, uma função de duas variáveis cujo gradiente, derivadas parciais e pontos críticos governam o comportamento do feitiço no mundo.

### Conceitos matemáticos obrigatórios (ementa)

- Funções de várias variáveis — domínio, imagem, representação gráfica
- Derivadas parciais — cálculo e interpretação
- Vetor gradiente `∇f` — interpretação geométrica
- Máximos e mínimos — pontos críticos, Hessiana, classificação

---

## 🎯 Critérios de Sucesso (rubrica do projeto)

| Critério | Pontos | Meta da equipe |
|---|---|---|
| Eficácia Educacional | 2,0 | 1,75 — 2,0 (Excelente) |
| Jogabilidade e Engajamento | 1,5 | 1,25 — 1,5 (Excelente) |
| Qualidade da Apresentação | 0,5 | 0,45 — 0,5 (Excelente) |
| **TOTAL** | **4,0** | **3,5 — 4,0** |

### Definição de "pronto" para a banca

- [ ] Os 4 conceitos da ementa são demonstráveis em fases jogáveis distintas
- [ ] Modo "Tutor Arcano" mostra a matemática real por trás de cada feitiço
- [ ] Pelo menos 1 professor do CESUPA testou o jogo e respondeu o formulário
- [ ] Pelo menos 3 testadores externos não-equipe responderam o formulário
- [ ] Relatório de testes está em `docs/relatorio-testes.md`
- [ ] Modo "Biblioteca de Glifos" funciona como fallback caso o reconhecedor falhe na demo
- [ ] Manual completo em `docs/manual.md`
- [ ] Apresentação ensaiada cabe em 15 minutos

---

## 🏗️ Arquitetura

### Stack

| Camada | Tecnologia |
|---|---|
| Build | Vite |
| Linguagem | JavaScript Vanilla (sem TypeScript nesta fase) |
| Renderização 2D | Canvas API |
| Renderização 3D | Three.js |
| Matemática | Math.js |
| Estilo | CSS puro com variáveis |
| Tipografia | Google Fonts (IM Fell English + Cinzel Decorative) |
| Testes | Node test runner nativo (`node --test`) |

### Base forkada

[https://github.com/ytnrvdf/wha-spell-simulator](https://github.com/ytnrvdf/wha-spell-simulator)

Reaproveitamos: canvas de desenho, detecção de anel, parser `GlyphAST → SpellIR`, dicionário de sigilos, ferramentas em `/tools/`.

### Estrutura de pastas

```
glyph-weaver/
├── public/
│   ├── textures/
│   └── fonts/
├── src/
│   ├── main.js
│   ├── parser/                  ← HERDADO do fork
│   │   ├── glyphAST.js
│   │   ├── spellIR.js
│   │   └── strokeRecognizer.js
│   ├── math/                    ← NÚCLEO PEDAGÓGICO
│   │   ├── multivarCalc.js
│   │   ├── gradient.js
│   │   ├── hessian.js
│   │   └── criticalPoints.js
│   ├── render/
│   │   ├── canvas2D.js
│   │   ├── scene3D.js
│   │   └── tutorOverlay.js
│   ├── game/
│   │   ├── phases/
│   │   │   ├── ano1_caderno.js
│   │   │   ├── ano2_ventos.js
│   │   │   ├── ano3_topografia.js
│   │   │   └── ano4_pontos.js
│   │   ├── puzzles/
│   │   ├── npcs/
│   │   │   └── mestraNabla.js
│   │   └── progression.js
│   └── ui/
│       ├── styles.css
│       ├── grimoire.html
│       └── dialogueBox.js
├── docs/
│   ├── manual.md
│   ├── conceitos-matematicos.md
│   ├── relatorio-testes.md
│   └── dialogos/
│       ├── ano1.md
│       ├── ano2.md
│       ├── ano3.md
│       └── ano4.md
├── tests/
│   └── math.test.js
├── ROADMAP.md                   ← este arquivo
├── README.md
├── index.html
└── package.json
```

### Mapeamento Sigilo → Função

| Sigilo | Função `f(x,y)` | Comportamento no jogo |
|---|---|---|
| Fogo | `x² + y²` | Paraboloide elíptico — expansão radial |
| Vento | `sin(x) + cos(y)` | Superfície ondulatória |
| Água | `e^(-(x²+y²))` | Gaussiana — concentração |
| Terra | `x² - y²` | Sela — instabilidade |
| Luz | `ln(x² + y² + 1)` | Crescimento logarítmico |

### Mapeamento Signo → Operador

| Signo | Operação |
|---|---|
| Expansão | `∇f · k` (escalar) |
| Reverso | `-∇f` (inversão) |
| Compressão | `f(2x, 2y)` (escala) |
| Direção | `∇f · û` (derivada direcional) |

---

## 🗓️ Cronograma — 8 Sprints

> Cada sprint dura 1 semana. Atualize as checkboxes a cada sexta-feira na reunião de equipe.

---

### Sprint 1 — Fundação (Semana 1)

**Meta:** Projeto rodável, módulo matemático funcional, equipe alinhada.

- [ ] Repositório forkado de `ytnrvdf/wha-spell-simulator`
- [ ] Setup Vite + estrutura de pastas criada
- [ ] `package.json` com dependências (vite, three, mathjs)
- [ ] Tela inicial com estética de pergaminho e botão "Entrar no Atelier"
- [ ] Módulo `src/math/multivarCalc.js` completo
- [ ] Testes unitários para os 5 sigilos primários
- [ ] Rota `/math-demo` para validação isolada do módulo matemático
- [ ] CSS base com paleta de pergaminho e Google Fonts
- [ ] `README.md` com instruções de instalação
- [ ] Equipe leu e entendeu este ROADMAP

> **Critério de saída:** `npm install && npm run dev` abre uma tela com a função `x² + y²` digitada, mostrando gradiente, Hessiana e ponto crítico classificado corretamente.

---

### Sprint 2 — Núcleo do Sigilo (Semana 2)

**Meta:** Integração entre o parser do fork e o módulo matemático.

- [ ] Estudo coletivo do código do `wha-spell-simulator`
- [ ] Adaptar `strokeRecognizer.js` para o contexto do jogo
- [ ] Estender `SpellIR` para emitir expressão matemática avaliável
- [ ] Função `sigilToFunction(spellIR)` no módulo `math/`
- [ ] Testes de integração: desenhar Fogo → recuperar `f(x,y) = x² + y²`
- [ ] Modo "Biblioteca de Glifos" implementado como fallback
- [ ] Dicionário visual dos 5 sigilos no painel lateral

> **Critério de saída:** Desenhar um sigilo de Fogo no canvas resulta em uma função matemática real exibida na tela, com gradiente calculado em tempo real.

---

### Sprint 3 — Ano I: O Caderno em Branco (Semana 3)

**Meta:** Primeira fase jogável. Conceito coberto: funções de várias variáveis.

- [ ] Cenário 2D do atelier (sala de aula)
- [ ] Sprite ou ilustração da Mestra Nabla
- [ ] Sistema de diálogos diegéticos (`dialogueBox.js`)
- [ ] Diálogos do Ano I escritos em `docs/dialogos/ano1.md`
- [ ] 3 puzzles de domínio (desenhar anel correto)
- [ ] 2 puzzles de identificação de função
- [ ] Caderno do Aprendiz com a primeira página preenchida
- [ ] Prova final do Ano I (puzzle integrador)

> **Critério de saída:** Jogador consegue jogar do início ao fim o Ano I sem instruções externas.

---

### Sprint 4 — Ano II: Os Ventos da Variação (Semana 4)

**Meta:** Segunda fase jogável. Conceito: derivadas parciais.

- [ ] Mecânica de esticar/comprimir runas
- [ ] Visualização ao vivo de `∂f/∂x` e `∂f/∂y` na lateral
- [ ] NPC Tálio implementado (dicas opcionais)
- [ ] 4 puzzles que exigem ajuste de derivadas parciais
- [ ] Diálogos do Ano II em `docs/dialogos/ano2.md`
- [ ] Prova final do Ano II

> **Critério de saída:** Jogador entende, ao final do Ano II, o que muda quando estica a runa horizontal vs. verticalmente.

---

### Sprint 5 — Renderização 3D + Modo Olhos Arcanos (Semana 5)

**Meta:** Visualização que "vende" o projeto na banca.

- [ ] Cena Three.js com superfície `f(x,y)` translúcida
- [ ] Sincronização entre cena 3D e função ativa
- [ ] Campo vetorial `∇f` animado em partículas no Canvas 2D
- [ ] Tecla/botão para alternar Modo Olhos Arcanos
- [ ] Curvas de nível desenhadas sobre o cenário 2D
- [ ] Setas direcionais luminosas mostrando `∇f`

> **Critério de saída:** Pressionar a tecla do Modo Olhos Arcanos revela o campo vetorial em tempo real e a superfície 3D ao lado.

---

### Sprint 6 — Anos III e IV (Semana 6)

**Meta:** Fechar a cobertura da ementa. Conceitos: gradiente + máximos/mínimos.

**Ano III: A Topografia das Estrelas**
- [ ] Mapas com superfícies acidentadas
- [ ] Puzzles de fluxo de água (drenagem por `∇f` invertido)
- [ ] Puzzles de propagação de fogo (subida por `∇f`)
- [ ] NPC Eulália + duelo opcional
- [ ] Diálogos em `docs/dialogos/ano3.md`

**Ano IV: Os Pontos do Destino**
- [ ] Puzzles de identificação de máx/mín/sela
- [ ] Reações físicas distintas por tipo de ponto crítico
- [ ] NPC Corvo + dicas opcionais
- [ ] Diálogos em `docs/dialogos/ano4.md`
- [ ] Prova de Mestria (puzzle final integrador)

> **Critério de saída:** Os 4 conceitos da ementa são jogáveis ponta-a-ponta.

---

### Sprint 7 — Testes com Público Externo (Semana 7)

**Meta:** Cumprir requisito obrigatório da rubrica.

- [ ] Formulário de feedback estruturado pronto (Google Forms)
- [ ] Sessão agendada com pelo menos 1 professor do CESUPA
- [ ] Sessão agendada com 3+ testadores externos não-equipe
- [ ] Registro fotográfico das sessões
- [ ] Aplicação do formulário (mínimo 5 respostas)
- [ ] Relatório de testes em `docs/relatorio-testes.md`
- [ ] Lista priorizada de melhorias a implementar

> **Critério de saída:** `docs/relatorio-testes.md` contém análise dos feedbacks e plano de melhorias.

---

### Sprint 8 — Polimento + Apresentação (Semana 8)

**Meta:** Entrega final.

- [ ] Top 5 melhorias dos testes incorporadas
- [ ] Manual do jogo completo em `docs/manual.md`
- [ ] `docs/conceitos-matematicos.md` finalizado (gabarito da banca)
- [ ] Build de produção testado em pelo menos 3 navegadores
- [ ] Deploy em GitHub Pages (URL pública para a banca)
- [ ] Slides da apresentação prontos
- [ ] Apresentação ensaiada (timer real, máx 15 min)
- [ ] Plano B caso a internet caia na apresentação (build local)
- [ ] Easter egg do Mestre Girotto inserido no cenário

> **Critério de saída:** A equipe consegue apresentar de cabeça e o jogo roda em qualquer máquina com navegador.

---

## 🧩 Divisão de Responsabilidades (sugestão para 4 alunos)

| Papel | Responsabilidades principais |
|---|---|
| Tech Lead / Engine | Setup Vite, integração com fork, parser, render 3D |
| Matemático | `src/math/`, validação de fórmulas, gabarito do manual |
| Game Designer / Narrativa | Diálogos da Mestra Nabla, NPCs, balanceamento de puzzles |
| UI/UX + Testes Externos | Estética pergaminho, Caderno do Aprendiz, formulário, sessões |

> Todos os 4 participam da apresentação oral (requisito da rubrica).

---

## 🧠 Convenções para Trabalho com IA

### Regras para invocar agentes (Claude Code, Cursor, etc.)

1. Sempre cole o `ROADMAP.md` atualizado no contexto inicial.
2. Indique o sprint atual e o item específico da checkbox em que está trabalhando.
3. Não peça features de sprints futuros sem fechar os anteriores.
4. Comente todo código matemático em português brasileiro — vira documentação para a banca.
5. Toda função do módulo `math/` precisa ter JSDoc com:
   - Conceito matemático que representa
   - Exemplo de uso
   - Sprint/Ano em que é usada

### Padrão de commit

```
[sprint-N] tipo: descrição curta
```

tipos: `feat`, `fix`, `docs`, `test`, `refactor`, `style`, `chore`

**Exemplos:**
```
[sprint-1] feat: implementa classifyCriticalPoint com teste da Hessiana
[sprint-3] docs: adiciona diálogos do Ano I em docs/dialogos/ano1.md
```

### Branching

- `main` — sempre estável e demonstrável
- `dev` — integração contínua dos sprints
- `feature/<sprint-N>-<descricao-curta>` — features individuais

> Toda PR para `dev` precisa de revisão de pelo menos 1 outro integrante.

---

## 🚨 Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Reconhecedor de traços falhar na banca | Alta | Alto | Modo Biblioteca de Glifos como fallback (Sprint 2) |
| Atraso por curva de aprendizado de Three.js | Média | Médio | Three.js só na Sprint 5; jogo já jogável em 2D antes disso |
| Professor do CESUPA indisponível | Média | Alto | Convidar 2+ professores na Sprint 6, antes da janela de teste |
| Membro da equipe trancar/desistir | Baixa | Alto | Documentação rigorosa permite redistribuição rápida |
| Bug crítico na apresentação | Média | Crítico | Build local em pendrive como plano B |
| Conceito matematicamente incorreto | Baixa | Crítico | Revisão dupla pelo Matemático + um colega |

---

## 📚 Referências

### Acadêmicas

- Stewart, J. *Cálculo, Volume 2.* (referência principal da disciplina)
- Documento de projeto: GDD em `docs/GDD.pdf`
- Plano de ensino: rubrica oficial do professor

### Técnicas

- Repositório base: [https://github.com/ytnrvdf/wha-spell-simulator](https://github.com/ytnrvdf/wha-spell-simulator)
- Math.js: [https://mathjs.org/docs/expressions/algebra.html](https://mathjs.org/docs/expressions/algebra.html)
- Three.js: [https://threejs.org/docs/](https://threejs.org/docs/)
- Vite: [https://vitejs.dev/guide/](https://vitejs.dev/guide/)

### Inspiração

- Mangá: *Witch Hat Atelier* (Kamome Shirahama)
- Visualização: GeoGebra 3D Calculator (referência matemática, **NÃO** de UX)
- Estética: manuscritos medievais iluminados, Studio Ghibli

---

## 🔄 Histórico de Alterações

| Data | Sprint | Autor | Mudança |
|---|---|---|---|
| 2026-06-01 | — | [Equipe] | Criação inicial do roadmap |

> A cada sprint encerrado, adicione uma linha aqui resumindo o que foi entregue.

---

## ✅ Checklist Mestre — Visão de Pássaro

### Conceitos da ementa cobertos

- [ ] Funções de várias variáveis (Ano I)
- [ ] Derivadas parciais (Ano II)
- [ ] Vetor gradiente (Ano III)
- [ ] Máximos e mínimos com Hessiana (Ano IV)

### Entregáveis exigidos pela rubrica

- [ ] Jogo funcional rodando no navegador
- [ ] Código-fonte no GitHub
- [ ] Documentação técnica em `docs/`
- [ ] Manual do jogo em `docs/manual.md`
- [ ] Relatório de testes em `docs/relatorio-testes.md`
- [ ] Formulários respondidos (anexos)
- [ ] Registro fotográfico das sessões
- [ ] Apresentação oral (slides + demo)

### Salvaguardas para o dia da banca

- [ ] Build de produção testado offline
- [ ] Plano B caso a internet caia
- [ ] Modo Biblioteca de Glifos funcionando
- [ ] Equipe inteira sabe explicar qualquer parte do código matemático
- [ ] Apresentação cabe em 15 minutos cronometrados

---

**Última atualização:** [preencher a cada commit no roadmap]  
**Sprint atual:** Sprint 1 — Fundação  
**Próximo marco:** Tela inicial + módulo matemático funcionando