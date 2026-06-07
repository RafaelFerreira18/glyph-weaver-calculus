/**
 * Biblioteca de Glifos — fallback para invocar sigilos sem desenhar.
 *
 * Garante que a apresentação e testes nunca travam por falha do
 * reconhecedor. Também serve como atalho pedagógico: o aluno escolhe
 * o sigilo que quer estudar diretamente.
 *
 * @module ui/glyphLibraryView
 */

const SIGILOS_BIBLIOTECA = [
  { element: 'fire',  emoji: '🔥', nome: 'Fogo',  formula: 'x² + y²'      },
  { element: 'earth', emoji: '🌍', nome: 'Terra', formula: 'x² − y²'      },
  { element: 'water', emoji: '💧', nome: 'Água',  formula: 'e^(−x²−y²)'   },
  { element: 'wind',  emoji: '💨', nome: 'Vento', formula: 'sen x + cos y' },
  { element: 'light', emoji: '✨', nome: 'Luz',   formula: 'ln(x²+y²+1)'  }
];

/**
 * Renderiza os botões de sigilo no contêiner e despacha o evento
 * 'glifo:escolhido' ao clicar.
 * @param {HTMLElement} container
 */
export function renderGlyphLibrary(container) {
  if (!container) return;

  container.innerHTML = SIGILOS_BIBLIOTECA.map((s) => `
    <button type="button" class="glifo-btn" data-element="${s.element}"
            title="${s.nome}: f(x,y) = ${s.formula}">
      <span class="glifo-emoji" aria-hidden="true">${s.emoji}</span>
      <span class="glifo-nome">${s.nome}</span>
      <code class="glifo-formula">${s.formula}</code>
    </button>
  `).join('');

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.glifo-btn');
    if (!btn) return;
    // Marca o botão como ativo
    container.querySelectorAll('.glifo-btn').forEach((b) => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    document.dispatchEvent(
      new CustomEvent('glifo:escolhido', { detail: { element: btn.dataset.element } })
    );
  });
}

/**
 * Marca o botão correspondente ao elemento como ativo.
 * @param {HTMLElement} container
 * @param {string|null} element
 */
export function setActiveGlyph(container, element) {
  if (!container) return;
  container.querySelectorAll('.glifo-btn').forEach((b) => {
    b.classList.toggle('ativo', b.dataset.element === element);
  });
}
