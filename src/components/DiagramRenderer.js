/**
 * SVG-first Engineering Drawing & Diagram Renderer Subsystem.
 * Loads SVGs and annotations dynamically via HTTP fetch.
 * Supports mouse-wheel zooming, click-and-drag panning, and CAD-style callouts.
 */
import { store } from '../core/State.js';
import { convertDimension, convertLengthText, convertPressure, convertTorqueText } from '../utils/units.js';

export class DiagramRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    
    this.svgMarkup = '';
    this.annotations = [];
    this.config = {};
  }

  /**
   * Loads diagram files dynamically and renders the viewport.
   * 
   * @param {string} diagramId - Unique diagram identifier (e.g., 'tubing_connection')
   * @param {string} [lang] - Active language ('en' | 'ru')
   * @param {Object} [rec] - Selected record database entity
   */
  async render(diagramId, lang = 'en', rec = null) {
    const targetElement = this.container || document.getElementById('diagram-renderer-container');
    if (!targetElement) return;

    const folderName = diagramId.replace(/_/g, '-');
    
    try {
      // Fetch SVG, Config, and Annotations in parallel
      const [svgResponse, annotationsResponse, configResponse] = await Promise.all([
        fetch(`/assets/diagrams/${folderName}/diagram.svg`).then(r => {
          if (!r.ok) throw new Error(`file_not_found`);
          return r.text();
        }),
        fetch(`/assets/diagrams/${folderName}/annotations.json`).then(r => {
          if (!r.ok) return [];
          return r.json();
        }).catch(() => []),
        fetch(`/assets/diagrams/${folderName}/config.json`).then(r => {
          if (!r.ok) return {};
          return r.json();
        }).catch(() => ({}))
      ]);

      // Check SVG structure parsing error
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgResponse, 'image/svg+xml');
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        throw new Error('parsing_error');
      }

      this.svgMarkup = svgResponse;
      this.annotations = annotationsResponse;
      this.config = configResponse;
      
      this.drawViewport(targetElement, lang, rec);
      
    } catch (error) {
      if (!navigator.onLine) {
        console.warn('Failed to load diagram (offline):', error);
      } else {
        console.error('Failed to load diagram:', error);
      }
      const isRu = lang === 'ru';
      const isParsingError = error.message === 'parsing_error';
      
      const title = isParsingError
        ? (isRu ? 'СБОЙ ОТРИСОВКИ СХЕМЫ SVG' : 'SVG RENDERING FAILURE')
        : (isRu ? 'СХЕМА ОТСУТСТВУЕТ / БИТАЯ ССЫЛКА' : 'DIAGRAM MISSING / BROKEN LINK');
        
      const details = isParsingError
        ? (isRu ? 'Файл схемы поврежден или содержит некорректный XML/SVG код.' : 'The drawing file is corrupted or contains invalid XML/SVG markup.')
        : (isRu ? `Файл diagram.svg не найден или недоступен для ${diagramId}.` : `The diagram.svg file was not found or is inaccessible for ${diagramId}.`);

      targetElement.innerHTML = `
        <div class="w-full h-full border border-rose-200 dark:border-rose-900/40 rounded-xl bg-rose-500/5 dark:bg-rose-950/10 flex flex-col items-center justify-center p-6 text-center text-xs text-rose-600 dark:text-rose-400 font-sans min-h-80 select-none">
          <svg class="w-6 h-6 text-rose-400 dark:text-rose-500/80 mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"></path></svg>
          <span class="font-extrabold uppercase tracking-wider text-[10px]">${title}</span>
          <span class="text-[9px] text-zinc-400 dark:text-zinc-555 mt-1 max-w-sm">${details}</span>
        </div>
      `;
    }
  }

  drawViewport(targetElement, lang, rec) {
    const isRu = lang === 'ru';
    targetElement.innerHTML = `
      <div id="diag-viewport-wrapper" class="relative w-full border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 overflow-hidden flex flex-col h-full min-h-80 select-none">
        <!-- Viewport Controls (Top Right) -->
        <div class="absolute top-3 right-3 z-10 flex flex-col gap-1.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-lg p-1 shadow-sm">
          <button id="diag-zoom-in" class="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-655 dark:text-zinc-400 cursor-pointer" title="${isRu ? 'Приблизить' : 'Zoom In'}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
            </svg>
          </button>
          <button id="diag-zoom-out" class="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-655 dark:text-zinc-400 cursor-pointer" title="${isRu ? 'Отдалить' : 'Zoom Out'}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15"></path>
            </svg>
          </button>
          <button id="diag-zoom-reset" class="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-555 cursor-pointer" title="${isRu ? 'Сбросить вид' : 'Reset View'}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"></path>
            </svg>
          </button>
          <button id="diag-fullscreen" class="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-555 cursor-pointer" title="${isRu ? 'На весь экран' : 'Fullscreen'}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15"></path>
            </svg>
          </button>
        </div>

        <!-- Render Viewport -->
        <div id="diag-viewport" class="flex-grow relative cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden min-h-[280px]">
          <div id="diag-transform-target" class="origin-center transition-transform duration-75 ease-out relative w-full h-full flex items-center justify-center" style="transform: translate(${this.panX}px, ${this.panY}px) scale(${this.zoom});">
            <div class="relative max-w-full max-h-full aspect-square flex items-center justify-center">
              ${this.svgMarkup}
              <!-- Annotations layer overlay -->
              <div class="absolute inset-0 pointer-events-none" id="diag-annotations-layer">
                ${this.renderAnnotations(this.annotations, lang, rec)}
              </div>
            </div>
          </div>
        </div>

        <!-- Viewport Legend -->
        <div class="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-3 py-2 text-[9px] text-zinc-455 dark:text-zinc-550 font-mono flex items-center justify-between shrink-0">
          <span class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-zinc-450 dark:bg-zinc-555"></span>
            <span>${isRu ? 'ИНТЕРАКТИВНЫЙ ЧЕРТЕЖ CAD' : 'CAD SCHEMATIC VIEWPORT'} — ${this.config.name ? this.config.name.toUpperCase() : (isRu ? 'ЧЕРТЕЖ CAD' : 'CAD VIEW')}</span>
          </span>
          <span>${isRu ? 'Масштаб' : 'Scale'}: ${(this.zoom * 100).toFixed(0)}%</span>
        </div>
      </div>
    `;

    this.bindEvents(lang, rec);
  }

  getShortValue(key, rec, lang, unitSystem) {
    const isRu = lang === 'ru';
    // Force metric length, torque and pressure for Russian settings, force imperial for English settings
    const forceMetric = isRu;
    
    if (key.includes('wall thickness')) {
      if (rec.wall_thickness !== undefined) {
        return forceMetric 
          ? `${rec.wall_thickness.toFixed(2)} мм`
          : `${(rec.wall_thickness / 25.4).toFixed(3)}"`
      }
    } else if (key.includes('out-to-out') || key.includes('pipe od')) {
      if (rec.od !== undefined) {
        return forceMetric
          ? `${(rec.od * 25.4).toFixed(1)} мм`
          : `${rec.od.toFixed(3)}"`;
      }
    } else if (key.includes('coupling od')) {
      if (rec.od !== undefined) {
        const couplingOD = rec.od * 1.08;
        return forceMetric
          ? `~${(couplingOD * 25.4).toFixed(1)} мм`
          : `~${couplingOD.toFixed(3)}"`;
      }
    } else if (key.includes('makeup loss')) {
      if (rec.makeup_loss !== undefined) {
        const num = parseFloat(rec.makeup_loss);
        if (!isNaN(num)) {
          return forceMetric
            ? `${(num * 25.4).toFixed(1)} мм`
            : `${num.toFixed(2)}"`;
        }
        return rec.makeup_loss;
      }
      return forceMetric ? `~76.2 мм` : `~3.0"`;
    } else if (key.includes('pitch')) {
      return rec.connection_type && rec.connection_type.toLowerCase().includes('eue') ? '10 TPI' : '8 TPI';
    } else if (key.includes('height')) {
      return rec.connection_type && rec.connection_type.toLowerCase().includes('eue') ? '1.41 mm' : '1.81 mm';
    } else if (key.includes('angle')) {
      return rec.name && rec.name.toLowerCase().includes('btc') ? '3°/25°' : '30°/30°';
    } else if (key.includes('optimum makeup torque')) {
      if (rec.torque_range !== undefined) {
        const numRegex = /([\d,]+)\s*(?:-\s*([\d,]+))?/g;
        const match = numRegex.exec(rec.torque_range.replace(/\s+/g, ''));
        if (match) {
          const val1 = parseFloat(match[1].replace(/,/g, ''));
          const val2 = match[2] ? parseFloat(match[2].replace(/,/g, '')) : null;
          const opt = val2 !== null ? (val1 + val2) / 2 : val1;
          if (forceMetric) {
            return `${Math.round(opt * 1.35582)} N·m`;
          }
          return `${Math.round(opt)} ft-lbs`;
        }
      }
    } else if (key.includes('pressure')) {
      if (rec.pressure_rating_psi !== undefined) {
        return forceMetric
          ? `${Math.round(rec.pressure_rating_psi / 14.5038)} бар`
          : `${rec.pressure_rating_psi} psi`;
      } else if (rec.collapse !== undefined) {
        return forceMetric
          ? `${Math.round(rec.collapse / 14.5038)} бар`
          : `${rec.collapse} psi`;
      }
    } else if (key.includes('turns')) {
      if (rec.turns !== undefined) {
        return `${rec.turns} ${isRu ? 'об.' : 'turns'}`;
      }
    } else if (key.includes('extrusion gap')) {
      return `~0.15 mm`;
    }
    return '';
  }

  renderAnnotations(annotations, lang, rec) {
    const isRu = lang === 'ru';
    const forceMetric = isRu;

    return annotations.map((ann, idx) => {
      let text = isRu ? (ann.text_ru || ann.text) : ann.text;
      let shortVal = '';
      
      if (rec) {
        const key = (ann.text || '').toLowerCase();
        shortVal = this.getShortValue(key, rec, lang, null);
        
        // Enrich detailed tooltip with actual dimensions
        if (key.includes('wall thickness') && rec.wall_thickness !== undefined) {
          text += forceMetric
            ? `: ${rec.wall_thickness.toFixed(2)} мм`
            : `: ${(rec.wall_thickness / 25.4).toFixed(3)} in`;
        } else if ((key.includes('out-to-out') || key.includes('pipe od')) && rec.od !== undefined) {
          text += forceMetric
            ? `: ${(rec.od * 25.4).toFixed(1)} мм`
            : `: ${rec.od.toFixed(3)} in`;
        } else if (key.includes('coupling od') && rec.od !== undefined) {
          const couplingOD = rec.od * 1.08;
          text += forceMetric
            ? `: ~${(couplingOD * 25.4).toFixed(1)} мм`
            : `: ~${couplingOD.toFixed(3)} in`;
        } else if (key.includes('makeup loss')) {
          if (rec.makeup_loss !== undefined) {
            const num = parseFloat(rec.makeup_loss);
            if (!isNaN(num)) {
              text += forceMetric
                ? `: ${(num * 25.4).toFixed(1)} мм`
                : `: ${num.toFixed(2)} in`;
            } else {
              text += `: ${rec.makeup_loss}`;
            }
          } else {
            text += forceMetric ? `: ~76.2 мм` : `: ~3.0 in`;
          }
        } else if (key.includes('pitch')) {
          const pitch = rec.connection_type && rec.connection_type.toLowerCase().includes('eue') ? '10 TPI (2.54 mm)' : '8 TPI (3.175 mm)';
          text += `: ${pitch}`;
        } else if (key.includes('height')) {
          const height = rec.connection_type && rec.connection_type.toLowerCase().includes('eue') ? '1.41 mm' : '1.81 mm';
          text += `: ${height}`;
        } else if (key.includes('angle')) {
          const angle = rec.name && rec.name.toLowerCase().includes('btc') ? '3° / 25° (Buttress)' : '30° / 30° (API)';
          text += `: ${angle}`;
        } else if (key.includes('optimum makeup torque')) {
          if (rec.torque_range !== undefined) {
            const numRegex = /([\d,]+)\s*(?:-\s*([\d,]+))?/g;
            const match = numRegex.exec(rec.torque_range.replace(/\s+/g, ''));
            if (match) {
              const val1 = parseFloat(match[1].replace(/,/g, ''));
              const val2 = match[2] ? parseFloat(match[2].replace(/,/g, '')) : null;
              const opt = val2 !== null ? (val1 + val2) / 2 : val1;
              text += forceMetric
                ? `: ${Math.round(opt * 1.35582)} N·m`
                : `: ${Math.round(opt)} ft-lbs`;
            } else {
              text += `: ${rec.torque_range}`;
            }
          }
        } else if (key.includes('turns') && rec.turns !== undefined) {
          text += `: ${rec.turns}`;
        } else if (key.includes('pressure')) {
          if (rec.pressure_rating_psi !== undefined) {
            text += forceMetric
              ? `: ${Math.round(rec.pressure_rating_psi / 14.5038)} бар`
              : `: ${rec.pressure_rating_psi} psi`;
          } else if (rec.collapse !== undefined) {
            text += forceMetric
              ? `: ${Math.round(rec.collapse / 14.5038)} бар`
              : `: ${rec.collapse} psi`;
          }
        } else if (key.includes('extrusion gap')) {
          text += `: ~0.15 mm`;
        }

        // Add secondary parameters where appropriate
        if (key.includes('coupling od') || key.includes('out-to-out')) {
          if (rec.inner_dia !== undefined) {
            text += ` | ${isRu ? 'Внутренний диаметр (ID)' : 'Pipe ID'}: ${convertDimension(rec.inner_dia, 'id')}`;
          }
          if (rec.drift_id !== undefined) {
            text += ` | ${isRu ? 'Шаблон (Drift)' : 'Drift ID'}: ${convertDimension(rec.drift_id, 'drift_id')}`;
          }
        }
      }

      return `
        <div 
          class="absolute pointer-events-auto group cursor-help transition-all duration-150" 
          style="left: ${ann.x}%; top: ${ann.y}%; transform: translate(-50%, -50%);"
        >
          <!-- Circular CAD callout label / Pill badge if size present -->
          ${shortVal ? `
            <div class="flex items-center gap-1 bg-zinc-900/90 text-white dark:bg-white/95 dark:text-black border border-zinc-700/60 dark:border-zinc-300 rounded-full px-1.5 py-0.5 shadow-sm text-[8px] font-bold font-mono">
              <span class="w-3.5 h-3.5 flex items-center justify-center rounded-full bg-red-600 text-white text-[7.5px] font-bold">
                ${idx + 1}
              </span>
              <span class="whitespace-nowrap">${shortVal}</span>
            </div>
          ` : `
            <span class="relative flex h-4.5 w-4.5 rounded-full border border-zinc-400 dark:border-zinc-500 bg-zinc-850 text-white dark:bg-zinc-200 dark:text-zinc-900 items-center justify-center text-[9px] font-bold font-mono shadow-sm group-hover:bg-red-600 group-hover:border-red-600 dark:group-hover:bg-red-600 dark:group-hover:text-white dark:group-hover:border-red-650 transition-colors">
              ${idx + 1}
            </span>
          `}
          
          <!-- Hover Tooltip -->
          <div class="absolute bottom-6 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all duration-150 bg-zinc-950 text-white dark:bg-white dark:text-black border border-zinc-800 dark:border-zinc-200 px-2 py-1 rounded text-[8px] font-mono whitespace-nowrap shadow-md z-30 pointer-events-none">
            ${text}
          </div>
        </div>
      `;
    }).join('');
  }

  bindEvents(lang, rec) {
    const viewport = document.getElementById('diag-viewport');
    const target = document.getElementById('diag-transform-target');

    if (!viewport || !target) return;

    const updateTransform = () => {
      target.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
    };

    // Zoom buttons handling
    document.getElementById('diag-zoom-in').onclick = () => {
      this.zoom = Math.min(this.zoom + 0.2, 3);
      this.drawViewport(this.container, lang, rec);
    };

    document.getElementById('diag-zoom-out').onclick = () => {
      this.zoom = Math.max(this.zoom - 0.2, 0.6);
      this.drawViewport(this.container, lang, rec);
    };

    document.getElementById('diag-zoom-reset').onclick = () => {
      this.zoom = 1;
      this.panX = 0;
      this.panY = 0;
      this.drawViewport(this.container, lang, rec);
    };

    document.getElementById('diag-fullscreen').onclick = () => {
      const wrapper = document.getElementById('diag-viewport-wrapper');
      if (!wrapper) return;
      if (!document.fullscreenElement) {
        wrapper.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    };

    // Click and drag panning
    viewport.onmousedown = (e) => {
      this.isDragging = true;
      this.startX = e.clientX - this.panX;
      this.startY = e.clientY - this.panY;
      viewport.classList.replace('cursor-grab', 'cursor-grabbing');
    };

    // Stop dragging
    const stopDragging = () => {
      if (this.isDragging) {
        this.isDragging = false;
        viewport.classList.replace('cursor-grabbing', 'cursor-grab');
      }
    };
    viewport.onmouseup = stopDragging;
    viewport.onmouseleave = stopDragging;

    viewport.onmousemove = (e) => {
      if (!this.isDragging) return;
      this.panX = e.clientX - this.startX;
      this.panY = e.clientY - this.startY;
      updateTransform();
    };

    // Mouse-wheel zoom handling
    viewport.onwheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      this.zoom = Math.max(0.6, Math.min(this.zoom + delta, 3));
      updateTransform();
    };
  }
}

export default DiagramRenderer;
