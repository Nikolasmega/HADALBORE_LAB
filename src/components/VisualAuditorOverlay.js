import { store } from '../core/State.js';

export class VisualAuditorOverlay {
  constructor() {
    this.visible = false;
    this.gridActive = false;
    this.contrastActive = false;
    this.touchActive = false;
    
    this.fps = 60;
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();
    this.fpsAnimationId = null;
    
    this.overlayElement = null;
    this.styleElement = null;
    
    this.initKeyboardShortcut();
    this.injectStyles();
  }

  initKeyboardShortcut() {
    window.addEventListener('keydown', (e) => {
      // Shift + Option + A (Option is 'altKey' in JS)
      if (e.shiftKey && e.altKey && e.code === 'KeyA') {
        e.preventDefault();
        this.toggleVisibility();
      }
    });
  }

  toggleVisibility() {
    this.visible = !this.visible;
    if (this.visible) {
      this.render();
      this.startFpsTracker();
    } else {
      this.destroy();
    }
  }

  startFpsTracker() {
    const loop = () => {
      if (!this.visible) return;
      this.frameCount++;
      const now = performance.now();
      const delta = now - this.lastFpsUpdate;
      
      if (delta >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / delta);
        this.frameCount = 0;
        this.lastFpsUpdate = now;
        this.updateFpsDisplay();
      }
      this.fpsAnimationId = requestAnimationFrame(loop);
    };
    this.fpsAnimationId = requestAnimationFrame(loop);
  }

  updateFpsDisplay() {
    const el = document.getElementById('auditor-fps-value');
    if (el) {
      el.innerText = `${this.fps} FPS`;
      if (this.fps < 45) {
        el.className = 'text-red-500 font-bold';
      } else if (this.fps < 58) {
        el.className = 'text-amber-500 font-bold';
      } else {
        el.className = 'text-emerald-500 font-bold';
      }
    }
  }

  injectStyles() {
    if (this.styleElement) return;
    
    this.styleElement = document.createElement('style');
    this.styleElement.id = 'hadalbore-auditor-styles';
    this.styleElement.innerHTML = `
      /* Visual Alignment Grid */
      .auditor-grid-overlay {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 9990;
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 16px;
        padding: 0 16px;
      }
      .auditor-grid-col {
        height: 100%;
        background-color: rgba(0, 150, 255, 0.03);
        border-left: 1px dashed rgba(0, 150, 255, 0.15);
        border-right: 1px dashed rgba(0, 150, 255, 0.15);
      }
      
      /* Touch Targets Highlighter */
      .auditor-touch-highlight {
        outline: 2px dashed #f59e0b !important;
        outline-offset: 2px !important;
        position: relative;
      }
      .auditor-touch-highlight::after {
        content: '⚠ <44px';
        position: absolute;
        bottom: -14px;
        left: 0;
        background: #f59e0b;
        color: #000;
        font-family: monospace;
        font-size: 7px;
        font-weight: bold;
        padding: 0px 3px;
        border-radius: 3px;
        white-space: nowrap;
        z-index: 10000;
      }

      /* Contrast Violations Highlighter */
      .auditor-contrast-violation {
        outline: 2px solid #ef4444 !important;
        outline-offset: 1px !important;
        position: relative;
      }
      .auditor-contrast-violation-badge {
        position: absolute;
        top: -14px;
        right: 0;
        background: #ef4444;
        color: #fff;
        font-family: monospace;
        font-size: 7.5px;
        font-weight: bold;
        padding: 0px 4px;
        border-radius: 3px;
        white-space: nowrap;
        z-index: 10000;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        pointer-events: none;
      }
    `;
    document.head.appendChild(this.styleElement);
  }

  render() {
    if (this.overlayElement) return;

    this.overlayElement = document.createElement('div');
    this.overlayElement.id = 'hadalbore-visual-auditor';
    this.overlayElement.className = 'fixed top-4 right-4 w-72 bg-zinc-950/85 backdrop-blur-md border border-zinc-800 text-zinc-200 p-4 rounded-xl shadow-2xl z-[9999] font-sans text-xs transition-all duration-200 select-none';
    
    const isRu = store.getState().lang === 'ru';
    
    this.overlayElement.innerHTML = `
      <div class="flex items-center justify-between border-b border-zinc-800 pb-2.5 mb-3">
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span class="font-bold tracking-wider uppercase text-[10px]">Hadalbore QA Live Auditor</span>
        </div>
        <button id="auditor-close-btn" class="text-zinc-500 hover:text-zinc-350 cursor-pointer text-sm font-bold">×</button>
      </div>
      
      <div class="space-y-3">
        <!-- Live performance indicator -->
        <div class="flex justify-between items-center bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50">
          <span class="text-zinc-400">${isRu ? 'Плавность интерфейса' : 'Interface Smoothness'}:</span>
          <span id="auditor-fps-value" class="font-bold text-emerald-500">-- FPS</span>
        </div>
        
        <!-- Checklist toggles -->
        <div class="space-y-2">
          <!-- Toggle 1: Alignment grid -->
          <label class="flex items-center justify-between p-2 rounded hover:bg-zinc-900/40 cursor-pointer">
            <span class="text-zinc-300">${isRu ? 'Сетка выравнивания (12 col)' : 'Alignment Grid (12 col)'}</span>
            <input type="checkbox" id="auditor-toggle-grid" class="w-3.5 h-3.5 rounded border-zinc-800 bg-zinc-900 text-emerald-500 focus:ring-emerald-500">
          </label>

          <!-- Toggle 2: Contrast checker -->
          <label class="flex items-center justify-between p-2 rounded hover:bg-zinc-900/40 cursor-pointer">
            <span class="text-zinc-300">${isRu ? 'Проверка контрастности (WCAG)' : 'Contrast Checker (WCAG)'}</span>
            <input type="checkbox" id="auditor-toggle-contrast" class="w-3.5 h-3.5 rounded border-zinc-800 bg-zinc-900 text-emerald-500 focus:ring-emerald-500">
          </label>

          <!-- Toggle 3: Touch targets -->
          <label class="flex items-center justify-between p-2 rounded hover:bg-zinc-900/40 cursor-pointer">
            <span class="text-zinc-300">${isRu ? 'Интерактивные зоны (<44px)' : 'Touch Targets (<44px)'}</span>
            <input type="checkbox" id="auditor-toggle-touch" class="w-3.5 h-3.5 rounded border-zinc-800 bg-zinc-900 text-emerald-500 focus:ring-emerald-500">
          </label>
        </div>
        
        <div class="text-[8.5px] text-zinc-500 font-mono border-t border-zinc-850 pt-2 text-center">
          ${isRu ? 'Нажмите Shift + Option + A для закрытия' : 'Press Shift + Option + A to toggle'}
        </div>
      </div>
    `;
    
    document.body.appendChild(this.overlayElement);
    this.bindEvents();
  }

  bindEvents() {
    // Close button
    const closeBtn = this.overlayElement.querySelector('#auditor-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => this.toggleVisibility();
    }
    
    // Grid toggle
    const gridToggle = this.overlayElement.querySelector('#auditor-toggle-grid');
    if (gridToggle) {
      gridToggle.onchange = (e) => this.toggleGrid(e.target.checked);
    }

    // Contrast toggle
    const contrastToggle = this.overlayElement.querySelector('#auditor-toggle-contrast');
    if (contrastToggle) {
      contrastToggle.onchange = (e) => this.toggleContrast(e.target.checked);
    }

    // Touch toggle
    const touchToggle = this.overlayElement.querySelector('#auditor-toggle-touch');
    if (touchToggle) {
      touchToggle.onchange = (e) => this.toggleTouch(e.target.checked);
    }
  }

  toggleGrid(active) {
    this.gridActive = active;
    let gridOverlay = document.getElementById('hadalbore-auditor-grid');
    
    if (active) {
      if (!gridOverlay) {
        gridOverlay = document.createElement('div');
        gridOverlay.id = 'hadalbore-auditor-grid';
        gridOverlay.className = 'auditor-grid-overlay';
        for (let i = 0; i < 12; i++) {
          const col = document.createElement('div');
          col.className = 'auditor-grid-col';
          gridOverlay.appendChild(col);
        }
        document.body.appendChild(gridOverlay);
      }
    } else {
      if (gridOverlay) gridOverlay.remove();
    }
  }

  toggleContrast(active) {
    this.contrastActive = active;
    
    // Clean old state
    document.querySelectorAll('.auditor-contrast-violation').forEach(el => {
      el.classList.remove('auditor-contrast-violation');
    });
    document.querySelectorAll('.auditor-contrast-violation-badge').forEach(el => el.remove());

    if (!active) return;

    // Run audit
    const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, span, td, button, select, label'));
    
    const getLuminance = (r, g, b) => {
      const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    const colorToRGBA = (color) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      return Array.from(ctx.getImageData(0, 0, 1, 1).data);
    };

    const getContrast = (rgba1, rgba2) => {
      const l1 = getLuminance(rgba1[0], rgba1[1], rgba1[2]);
      const l2 = getLuminance(rgba2[0], rgba2[1], rgba2[2]);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };

    const getActualBackgroundColor = (el) => {
      let currentEl = el;
      while (currentEl) {
        const bg = window.getComputedStyle(currentEl).backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          return bg;
        }
        currentEl = currentEl.parentElement;
      }
      return document.documentElement.classList.contains('dark') ? 'rgb(9, 9, 11)' : 'rgb(250, 250, 250)';
    };

    elements.forEach(el => {
      if (el.offsetWidth === 0 || el.offsetHeight === 0 || el.innerText.trim().length === 0) return;
      if (el.closest('#hadalbore-visual-auditor')) return; // ignore auditor panel itself
      
      const styles = window.getComputedStyle(el);
      const color = styles.color;
      const bg = getActualBackgroundColor(el);
      
      const rgba1 = colorToRGBA(color);
      const rgba2 = colorToRGBA(bg);
      const ratio = getContrast(rgba1, rgba2);
      
      if (ratio < 4.5) {
        el.classList.add('auditor-contrast-violation');
        
        // Add absolute badge with ratio
        const badge = document.createElement('span');
        badge.className = 'auditor-contrast-violation-badge';
        badge.innerText = `CR ${ratio.toFixed(1)}`;
        
        // position adjustment for inline elements
        if (styles.position === 'static') {
          el.style.position = 'relative';
        }
        el.appendChild(badge);
      }
    });
  }

  toggleTouch(active) {
    this.touchActive = active;
    
    document.querySelectorAll('.auditor-touch-highlight').forEach(el => {
      el.classList.remove('auditor-touch-highlight');
    });

    if (!active) return;

    const interactive = Array.from(document.querySelectorAll('button, a, select, input[type="button"], input[type="submit"]'));
    interactive.forEach(el => {
      if (el.offsetWidth === 0 || el.offsetHeight === 0) return;
      if (el.closest('#hadalbore-visual-auditor')) return;

      const rect = el.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        el.classList.add('auditor-touch-highlight');
      }
    });
  }

  destroy() {
    if (this.overlayElement) {
      this.overlayElement.remove();
      this.overlayElement = null;
    }
    if (this.fpsAnimationId) {
      cancelAnimationFrame(this.fpsAnimationId);
      this.fpsAnimationId = null;
    }
    this.toggleGrid(false);
    this.toggleContrast(false);
    this.toggleTouch(false);
    this.visible = false;
  }
}
