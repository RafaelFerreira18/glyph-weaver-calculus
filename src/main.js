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
import { renderGlyphLibrary, setActiveGlyph } from "./ui/glyphLibraryView.js";
import { PartialsLab } from "./ui/partialsLab.js";
import { GradientLab } from "./ui/gradientLab.js";
import { ClassifyLab } from "./ui/classifyLab.js";
import { OlhosArcanos } from "./ui/olhosArcanos.js";
import { CadernoView } from "./ui/cadernoView.js";
import { DemoMode } from "./game/demoMode.js";

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
let dialogueBox   = null;
let mathTeacher   = null;
let puzzleManager = null;
let partialsLab   = null;
let gradientLab   = null;
let classifyLab   = null;
let olhosArcanos  = null;
let cadernoView   = null;
let demoMode      = null;

/** Elemento reconhecido na última recomputação (evita diálogos repetidos). */
let elementoAnterior = null;

/** SpellIR e ring sintéticos para animação de quick cast (clique na biblioteca). */
let quickCastSpellIR = null;
let quickCastRing    = null;

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
  if (!dictionary) return;

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

  // ── Lógica RPG: só aciona quando o feitiço é lançado (anel fechado) ──
  const feiticoAtivo  = Boolean(spellIR?.active);
  const elementoAtual = feiticoAtivo ? (spellIR?.element ?? null) : null;

  if (feiticoAtivo && elementoAtual && elementoAtual !== elementoAnterior && mathTeacher) {
    mathTeacher.ensinar(elementoAtual);
    elementoAnterior = elementoAtual;
  }

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

  // Expirar quick cast
  if (quickCastSpellIR) {
    const durMs = quickCastSpellIR.duration * 1000 + 500;
    if (timestamp - quickCastSpellIR.activatedAt > durMs) {
      quickCastSpellIR = null;
      quickCastRing    = null;
    }
  }

  // Usa quick cast se não houver feitiço desenhado ativo
  const activeSpellIR = (quickCastSpellIR && !spellIR?.active) ? quickCastSpellIR : spellIR;
  const activeRing    = (quickCastSpellIR && !spellIR?.active) ? quickCastRing    : pipeline?.ring;

  if (activeSpellIR?.active) {
    renderer.renderActivatedGlyph({
      activatedAt: activeSpellIR.activatedAt,
      duration:    activeSpellIR.duration,
      strokes:     store.getStrokes(),
      pipeline,
      timestamp
    });
  }

  renderer.renderEffect({
    spellIR:    activeSpellIR,
    ring:       activeRing,
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

  // ── Sistemas RPG ────────────────────────────────────────────
  dialogueBox   = new DialogueBox();
  puzzleManager = new PuzzleManager();
  mathTeacher   = new MathTeacher(dialogueBox, puzzleManager);

  // ── Labs educacionais ────────────────────────────────────────
  partialsLab  = new PartialsLab();
  gradientLab  = new GradientLab();
  classifyLab  = new ClassifyLab();
  olhosArcanos = new OlhosArcanos();
  cadernoView  = new CadernoView();
  demoMode     = new DemoMode();

  // ── Biblioteca de Glifos ─────────────────────────────────────
  const bibliotecaContainer = document.getElementById('bibliotecaBtns');
  if (bibliotecaContainer) renderGlyphLibrary(bibliotecaContainer);

  // ── Botões HUD ───────────────────────────────────────────────
  document.getElementById('olhosArcanosBtn')?.addEventListener('click', () => olhosArcanos.alternar());
  document.getElementById('olhosFechar')?.addEventListener('click',     () => olhosArcanos.fechar());
  document.getElementById('cadernoBtn')?.addEventListener('click',      () => cadernoView.alternar());
  document.getElementById('cadernoFechar')?.addEventListener('click',   () => cadernoView.fechar());
  document.getElementById('demoBtn')?.addEventListener('click',         () => demoMode.iniciar());

  // ── Fechar labs (botão ✕ interno) ───────────────────────────
  document.getElementById('labParciaisFechar')?.addEventListener('click',    () => { document.getElementById('labParciais').hidden    = true; });
  document.getElementById('labGradienteFechar')?.addEventListener('click',   () => { document.getElementById('labGradiente').hidden   = true; });
  document.getElementById('labClassificarFechar')?.addEventListener('click', () => { document.getElementById('labClassificar').hidden = true; });

  // ── Atalhos de reabertura dos labs ────────────────────────────
  document.getElementById('abrirLabParciais')?.addEventListener('click',    () => { if (partialsLab.sigilo)  document.getElementById('labParciais').hidden    = false; });
  document.getElementById('abrirLabGradiente')?.addEventListener('click',   () => { if (gradientLab.sigilo)  document.getElementById('labGradiente').hidden   = false; });
  document.getElementById('abrirLabClassificar')?.addEventListener('click', () => { if (classifyLab.sigilo)  document.getElementById('labClassificar').hidden = false; });

  // ── Evento: sigilo reconhecido (desenhado ou clicado na biblioteca) ──
  document.addEventListener('sigilo:reconhecido', (e) => {
    const el = e.detail.elemento;
    partialsLab.atualizar(el);
    gradientLab.atualizar(el);
    classifyLab.atualizar(el);
    cadernoView.desbloquearSigilo(el);
    setActiveGlyph(bibliotecaContainer, el);

    // Mostrar atalhos de labs no aside
    const atalhos = document.getElementById('labsAtalhos');
    if (atalhos) atalhos.hidden = false;
  });

  // ── Evento: sigilo escolhido da Biblioteca — quick cast ──────────
  document.addEventListener('glifo:escolhido', (e) => {
    const el = e.detail.element;
    if (!el) return;

    // Animação de quick cast centrada no canvas
    const canvas = elements.glyphCanvas;
    const cx     = canvas.width  / 2;
    const cy     = canvas.height / 2;

    quickCastRing = {
      found:    true,
      complete: true,
      center:   { x: cx, y: cy },
      radius:   Math.min(canvas.width, canvas.height) * 0.27,
    };

    quickCastSpellIR = {
      type:                 'SpellIR',
      active:               true,
      valid:                true,
      prepared:             false,
      element:              el,
      activatedAt:          performance.now(),
      duration:             5,
      focus:                0.65,
      spread:               0.35,
      force:                0.55,
      range:                0.5,
      quality:              0.75,
      stability:            0.75,
      neatness:             0.8,
      gravity:              1,
      directionCoherence:   0,
      direction:            { x: 0, y: 0, z: 1, xTiltDeg: 0, yTiltDeg: 0, tiltFromZDeg: 0 },
      primaryManifestation: 'none',
      manifestations:       {},
      warnings:             [],
      signature:            `quickcast-${el}-${Date.now()}`,
      primarySizeNorm:      0.6,
      effectScale:          1,
    };

    document.dispatchEvent(new CustomEvent('sigilo:reconhecido', { detail: { elemento: el } }));
    mathTeacher.ensinar(el);
  });

  // ── Progresso dos puzzles ────────────────────────────────────
  document.addEventListener('puzzle:avancou', () => {
    store.clear();
    previousRing = null;
    elementoAnterior = null;
    mathTeacher.resetar();
    partialsLab.resetar();
    gradientLab.resetar();
    classifyLab.resetar();
    recompute();
  });

  document.addEventListener('puzzle:novo', (e) => {
    dialogueBox.iniciarSequencia(
      MestraNabla.nome,
      MestraNabla.personagem,
      e.detail.desafio.dialogoDesafio
    );
  });

  // ── Feedback visual CORRETO / ERRADO ─────────────────────────
  const feedbackEl = document.getElementById('feedbackOverlay');
  function mostrarFeedback(tipo) {
    if (!feedbackEl) return;
    feedbackEl.removeAttribute('hidden');
    feedbackEl.className = `feedback-overlay feedback-${tipo}`;
    feedbackEl.innerHTML = `<span class="feedback-texto">${tipo === 'correto' ? '✓ CORRETO' : '✗ ERRADO'}</span>`;
    setTimeout(() => {
      feedbackEl.setAttribute('hidden', '');
      feedbackEl.className = 'feedback-overlay';
    }, 1600);
  }

  document.addEventListener('resposta:correto', () => mostrarFeedback('correto'));
  document.addEventListener('resposta:errado',  () => mostrarFeedback('errado'));

  document.addEventListener('puzzle:concluido', () => {
    setTimeout(() => {
      dialogueBox.iniciarSequencia(
        MestraNabla.nome,
        MestraNabla.personagem,
        MestraNabla.dialogos.conclusaoAnoI
      );
    }, 200);
  });

  try {
    dictionary = await loadDictionary();
    renderDictionaryReference(elements, dictionary);
    capture.enable();
    recompute();
    requestAnimationFrame(animationFrame);

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
