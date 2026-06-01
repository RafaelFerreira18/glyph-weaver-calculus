import { CONFIG } from "./config.js";
import { loadDictionary } from "./dictionary/dictionaryLoader.js";
import { DrawingCapture } from "./input/drawingCapture.js";
import { createStrokeStore } from "./input/strokeStore.js";
import { classifyDrawing } from "./parser/drawingClassifier.js";
import { compileSpell } from "./compiler/spellBuilder.js";
import { CanvasRenderer } from "./renderer/canvasRenderer.js";
import { setupCanvasSizing as setupResponsiveCanvasSizing } from "./ui/canvasSizing.js";
import { updateDiagnostics, updateDiagnosticsMode } from "./ui/diagnosticsView.js";
import { getElements } from "./ui/elements.js";
import { renderDictionaryReference } from "./ui/dictionaryReferenceView.js";
import { updateStatus, updateSummary } from "./ui/spellSummaryView.js";
import { setupTabs } from "./ui/tabs.js";
import { DialogueBox } from "./ui/dialogueBox.js";
import { MathTeacher } from "./game/mathTeacher.js";
import { MestraNabla } from "./game/npcs/mestraNabla.js";
import { PuzzleManager } from "./game/puzzles/puzzleManager.js";

const elements = getElements();
const store = createStrokeStore();
let dictionary = null;
let renderer = null;
let capture = null;
let pipeline = null;
let spellIR = null;
let previousRing = null;
let resizeObserver = null;

// ── Sistemas RPG ────────────────────────────────────────────────
let dialogueBox = null;
let mathTeacher = null;
let puzzleManager = null;
/** Elemento reconhecido na última recomputação (evita diálogos repetidos). */
let elementoAnterior = null;

function setupCanvasSizing() {
  resizeObserver = setupResponsiveCanvasSizing({
    elements,
    store,
    onCanvasResized: () => {
      previousRing = null;
      recompute();
    }
  });
}

function recompute() {
  if (!dictionary) {
    return;
  }

  pipeline = classifyDrawing({
    strokes: store.getStrokes(),
    previousRing,
    dictionary,
    config: CONFIG
  });
  previousRing = pipeline.ring;
  spellIR = compileSpell({ glyphAST: pipeline.glyphAST, dictionary, config: CONFIG });
  updateSummary({ elements, store, capture, pipeline, spellIR });
  updateDiagnostics({ elements, store, pipeline, spellIR });

  // ── Lógica RPG: validar apenas quando o feitiço é LANÇADO (anel fechado) ──
  // spellIR.active === true significa que o anel foi fechado e a magia está ativa.
  // Antes disso (anel aberto), o elemento pode ser parcialmente reconhecido mas
  // a aprendiz ainda não "lançou" o feitiço — não deve acionar a resposta.
  const feiticoAtivo = Boolean(spellIR?.active);
  const elementoAtual = feiticoAtivo ? (spellIR?.element ?? null) : null;

  if (feiticoAtivo && elementoAtual && elementoAtual !== elementoAnterior && mathTeacher) {
    mathTeacher.ensinar(elementoAtual);
    elementoAnterior = elementoAtual;
  }

  // Se o canvas foi limpo (anel aberto), resetar para permitir nova tentativa
  if (!feiticoAtivo && elementoAnterior !== null) {
    elementoAnterior = null;
    mathTeacher?.resetar();
  }
}

function animationFrame(timestamp) {
  renderer.renderGlyph({
    strokes: store.getStrokes(),
    currentStroke: capture.getCurrentStroke(),
    pipeline,
    showGuides: elements.guidesToggle.checked,
    showDebug: elements.diagnosticsToggle.checked
  });

  if (spellIR.active) {
    renderer.renderActivatedGlyph({
      activatedAt: spellIR.activatedAt,
      duration: spellIR.duration,
      strokes: store.getStrokes(),
      pipeline,
      timestamp
    });
  }
  
  renderer.renderEffect({
    spellIR,
    ring: pipeline?.ring,
    timestamp,
    showGuides: elements.guidesToggle.checked
  });
  requestAnimationFrame(animationFrame);
}

function setupControls() {
  elements.undoButton.addEventListener("click", () => {
    store.undo();
    previousRing = null;
    recompute();
  });

  elements.clearButton.addEventListener("click", () => {
    store.clear();
    previousRing = null;
    recompute();
  });

  elements.guidesToggle.addEventListener("change", () => {
    updateSummary({ elements, store, capture, pipeline, spellIR });
    updateDiagnostics({ elements, store, pipeline, spellIR });
  });

  elements.diagnosticsToggle.addEventListener("change", () => {
    updateDiagnosticsMode(elements);
    updateDiagnostics({ elements, store, pipeline, spellIR });
  });

  updateDiagnosticsMode(elements);
}

async function init() {
  setupTabs(elements);
  setupControls();
  setupCanvasSizing();
  renderer = new CanvasRenderer({
    glyphCanvas: elements.glyphCanvas,
    effectCanvas: elements.effectCanvas,
    config: CONFIG
  });
  capture = new DrawingCapture(elements.glyphCanvas, store, CONFIG, {
    onPreview: () => {},
    onCommit: recompute
  });

  // ── Inicializar sistemas RPG ────────────────────────────────
  dialogueBox   = new DialogueBox();
  puzzleManager = new PuzzleManager();
  mathTeacher   = new MathTeacher(dialogueBox, puzzleManager);

  // Quando o puzzle avança: limpar canvas + resetar estado
  document.addEventListener('puzzle:avancou', () => {
    store.clear();
    previousRing = null;
    elementoAnterior = null;
    mathTeacher.resetar();
    recompute();
  });

  // Quando novo puzzle é apresentado: iniciar diálogo de apresentação
  document.addEventListener('puzzle:novo', (e) => {
    dialogueBox.iniciarSequencia(
      MestraNabla.nome,
      MestraNabla.personagem,
      e.detail.desafio.dialogoDesafio
    );
  });

  try {
    dictionary = await loadDictionary();
    renderDictionaryReference(elements, dictionary);
    capture.enable();
    recompute();
    requestAnimationFrame(animationFrame);

    // Boas-vindas da Mestra Nabla → ao fechar, inicia o primeiro desafio
    dialogueBox.aoFechar(() => puzzleManager.iniciar());
    dialogueBox.iniciarSequencia(
      MestraNabla.nome,
      MestraNabla.personagem,
      MestraNabla.dialogos.boasVindas
    );
  } catch (error) {
    console.error(error);
    updateStatus(elements, "Dictionary load failed", "invalid");
  }
}

init();
