import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as math from 'mathjs';

/**
 * Renderizador 3D de superfícies f(x,y) usando Three.js.
 *
 * Responsável por gerar a malha 3D a partir de uma expressão matemática,
 * exibir setas do campo gradiente e destacar pontos críticos.
 *
 * @module render/scene3D
 */
export class Scene3D {
  /**
   * Inicializa a cena 3D dentro do contêiner informado.
   * @param {string} containerId - ID do elemento DOM que receberá o canvas.
   */
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Contêiner "${containerId}" não encontrado no DOM.`);
    }

    /** @type {THREE.Scene} */
    this.scene = new THREE.Scene();

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    /** @type {THREE.PerspectiveCamera} */
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(8, 6, 8);
    this.camera.lookAt(0, 0, 0);

    /** @type {THREE.WebGLRenderer} */
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    /** @type {OrbitControls} */
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    // Iluminação
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);

    // Auxiliares visuais
    this.scene.add(new THREE.AxesHelper(5));
    this.scene.add(new THREE.GridHelper(10, 10));

    /** @type {THREE.Mesh|null} Malha da superfície atual */
    this.surfaceMesh = null;
    /** @type {THREE.Mesh|null} Wireframe sobreposto */
    this.wireframeMesh = null;
    /** @type {THREE.ArrowHelper[]} Setas do gradiente */
    this.gradientArrows = [];
    /** @type {THREE.Mesh[]} Esferas de destaque */
    this.highlights = [];

    this._animating = true;
    this._animate();
  }

  /* ------------------------------------------------------------------ */
  /*  Renderização de superfície                                        */
  /* ------------------------------------------------------------------ */

  /**
   * Renderiza a superfície 3D correspondente à expressão f(x,y).
   *
   * @param {string} expressao - Expressão matemática em notação mathjs (ex.: "x^2 + y^2").
   * @param {{ xMin: number, xMax: number, yMin: number, yMax: number }} dominio
   *   Limites do domínio de amostragem.
   */
  renderSurface(expressao, dominio = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 }) {
    // Remove superfície anterior
    this._removeSurface();

    const node = math.parse(expressao);
    const compilada = node.compile();
    const resolucao = 100;

    const dx = (dominio.xMax - dominio.xMin) / resolucao;
    const dy = (dominio.yMax - dominio.yMin) / resolucao;
    const totalVertices = (resolucao + 1) * (resolucao + 1);

    // Primeira passagem: calcula os valores z e encontra a escala
    const zValues = new Float32Array(totalVertices);
    let maxAbs = 0;

    for (let j = 0; j <= resolucao; j++) {
      for (let i = 0; i <= resolucao; i++) {
        const x = dominio.xMin + i * dx;
        const y = dominio.yMin + j * dy;
        let z;
        try {
          z = compilada.evaluate({ x, y });
        } catch {
          z = 0;
        }
        if (!Number.isFinite(z)) z = 0;
        const idx = j * (resolucao + 1) + i;
        zValues[idx] = z;
        if (Math.abs(z) > maxAbs) maxAbs = Math.abs(z);
      }
    }

    // Fator de normalização para melhor visualização
    const escala = maxAbs > 0 ? 3 / maxAbs : 1;

    // Segunda passagem: preenche os vértices
    const vertices = new Float32Array(totalVertices * 3);
    for (let j = 0; j <= resolucao; j++) {
      for (let i = 0; i <= resolucao; i++) {
        const idx = j * (resolucao + 1) + i;
        const x = dominio.xMin + i * dx;
        const y = dominio.yMin + j * dy;
        vertices[idx * 3] = x;
        vertices[idx * 3 + 1] = zValues[idx] * escala;
        vertices[idx * 3 + 2] = y;
      }
    }

    // Índices dos triângulos
    const indices = [];
    for (let j = 0; j < resolucao; j++) {
      for (let i = 0; i < resolucao; i++) {
        const a = j * (resolucao + 1) + i;
        const b = a + 1;
        const c = a + (resolucao + 1);
        const d = c + 1;
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    // Material sólido
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      wireframe: false,
    });

    this.surfaceMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.surfaceMesh);

    // Wireframe sobreposto
    const wireframeMat = new THREE.MeshPhongMaterial({
      color: 0xc9a84c,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
      side: THREE.DoubleSide,
    });

    this.wireframeMesh = new THREE.Mesh(geometry.clone(), wireframeMat);
    this.scene.add(this.wireframeMesh);
  }

  /* ------------------------------------------------------------------ */
  /*  Campo gradiente                                                   */
  /* ------------------------------------------------------------------ */

  /**
   * Renderiza setas do campo gradiente sobre a superfície.
   *
   * @param {Array<{ x: number, y: number, dx: number, dy: number, magnitude: number }>} gradientField
   *   Vetor de amostras do gradiente.
   */
  renderGradientArrows(gradientField) {
    this._removeGradientArrows();

    for (const pt of gradientField) {
      const dir = new THREE.Vector3(pt.dx, 0, pt.dy);
      const len = dir.length();
      if (len === 0) continue;
      dir.normalize();

      // Cor baseada na magnitude: verde (baixa) → vermelho (alta)
      const t = Math.min(pt.magnitude / 5, 1);
      const color = new THREE.Color().setHSL(0.33 * (1 - t), 1, 0.5);

      const arrow = new THREE.ArrowHelper(
        dir,
        new THREE.Vector3(pt.x, 0, pt.y),
        Math.min(len, 2),
        color.getHex(),
      );
      this.gradientArrows.push(arrow);
      this.scene.add(arrow);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Destaque de pontos                                                */
  /* ------------------------------------------------------------------ */

  /**
   * Adiciona uma esfera de destaque em um ponto 3D.
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} [color=0xff3366] - Cor hexadecimal do destaque.
   */
  highlightPoint(x, y, z, color = 0xff3366) {
    const geometry = new THREE.SphereGeometry(0.15, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(x, z, y);
    this.highlights.push(sphere);
    this.scene.add(sphere);
  }

  /**
   * Remove todos os destaques de pontos da cena.
   */
  clearHighlights() {
    for (const h of this.highlights) {
      this.scene.remove(h);
      h.geometry.dispose();
      h.material.dispose();
    }
    this.highlights = [];
  }

  /* ------------------------------------------------------------------ */
  /*  Utilitários                                                       */
  /* ------------------------------------------------------------------ */

  /**
   * Ajusta o renderizador e a câmera ao novo tamanho do contêiner.
   */
  resize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Libera todos os recursos do Three.js e para a animação.
   */
  dispose() {
    this._animating = false;
    this._removeSurface();
    this._removeGradientArrows();
    this.clearHighlights();
    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Métodos internos                                                  */
  /* ------------------------------------------------------------------ */

  /** @private Loop de animação */
  _animate() {
    if (!this._animating) return;
    requestAnimationFrame(() => this._animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  /** @private Remove a superfície e o wireframe atuais */
  _removeSurface() {
    if (this.surfaceMesh) {
      this.scene.remove(this.surfaceMesh);
      this.surfaceMesh.geometry.dispose();
      this.surfaceMesh.material.dispose();
      this.surfaceMesh = null;
    }
    if (this.wireframeMesh) {
      this.scene.remove(this.wireframeMesh);
      this.wireframeMesh.geometry.dispose();
      this.wireframeMesh.material.dispose();
      this.wireframeMesh = null;
    }
  }

  /** @private Remove todas as setas do gradiente */
  _removeGradientArrows() {
    for (const arrow of this.gradientArrows) {
      this.scene.remove(arrow);
      arrow.dispose();
    }
    this.gradientArrows = [];
  }
}
