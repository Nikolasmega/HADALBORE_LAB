/**
 * StrengthEnvelopeChart.js
 * Renders the Von Mises (VME) yield strength envelope for tubulars
 * using HTML5 Canvas. Pure, offline-first calculation and drawing.
 *
 * VME criterion: σa² − σa·σh + σh² = σy²
 *
 * Correct parametric form (derived via eigendecomposition of the VME quadratic):
 *   Semi-axis₁ = σy·√2     along [1, 1]/√2  (45°)
 *   Semi-axis₂ = σy·√(2/3) along [1,−1]/√2 (135°)
 *   ⟹ σh(t) = σy·(cos t + sin t / √3)
 *      σa(t) = σy·(cos t − sin t / √3)
 */
export class StrengthEnvelopeChart {
  constructor(canvasId) {
    this.canvasId = canvasId;
  }

  /**
   * Renders the VME chart onto the canvas.
   *
   * @param {number} yieldStrengthPa    - Material yield strength [Pa]
   * @param {number} axialForceN        - Net axial force [N] (tension +, compression −)
   * @param {number} internalPressurePa - Internal bore pressure [Pa]
   * @param {number} externalPressurePa - External annulus pressure [Pa]
   * @param {number} outerDiaM          - Outer diameter [m]
   * @param {number} innerDiaM          - Inner diameter [m]
   * @param {string} [lang='en']        - 'en' | 'ru'
   * @param {number} [zoom=1.0]         - Zoom factor
   */
  render(yieldStrengthPa, axialForceN, internalPressurePa, externalPressurePa, outerDiaM, innerDiaM, lang = 'en', zoom = 1.0) {
    const canvas = document.getElementById(this.canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // --- HiDPI / Retina support ---
    const dpr     = window.devicePixelRatio || 1;
    const cssW    = canvas.offsetWidth  || 300;
    const cssH    = canvas.offsetHeight || 200;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width  = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.scale(dpr, dpr);

    // Logical dimensions (all drawing uses these)
    const width  = cssW;
    const height = cssH;

    ctx.clearRect(0, 0, width, height);

    // Cache dark-mode check once per render (avoid 5× DOM queries)
    const isRu   = lang === 'ru';
    const isDark = document.documentElement.classList.contains('dark');

    // --- Geometry ---
    const ro = outerDiaM / 2;
    const ri = innerDiaM / 2;
    const t  = ro - ri;                              // wall thickness [m]
    const area = Math.PI * (ro * ro - ri * ri);      // cross-section area [m²]

    // Guard: invalid geometry — show message and bail
    if (area <= 0 || t <= 0) {
      ctx.fillStyle  = isDark ? '#a1a1aa' : '#52525b';
      ctx.font       = '11px monospace';
      ctx.textAlign  = 'center';
      ctx.fillText(
        isRu ? 'Нет данных о геометрии трубы' : 'No valid tubular geometry',
        width / 2, height / 2
      );
      return;
    }

    // --- Stress calculation ---
    // Axial stress [Pa]: tension positive
    const sa = axialForceN / area;

    // Hoop stress — thin-wall Lamé (asymmetric: Pi acts on ri, Pe acts on ro):
    //   σh = (Pi·ri − Pe·ro) / t
    // More accurate than (Pi−Pe)·ri/t when external pressure is significant.
    const sh = (internalPressurePa * ri - externalPressurePa * ro) / t;

    // Convert to MPa for plotting
    const yieldMPa = yieldStrengthPa / 1e6;
    const saMPa    = sa / 1e6;
    const shMPa    = sh / 1e6;

    // VME utilisation check
    const isSafe = (saMPa * saMPa - saMPa * shMPa + shMPa * shMPa) <= yieldMPa * yieldMPa;

    // --- Chart layout ---
    const margin     = 40;
    const plotWidth  = width  - 2 * margin;
    const plotHeight = height - 2 * margin;
    const maxVal     = yieldMPa * 1.5;
    const scaleX     = (plotWidth  / (2 * maxVal)) * zoom;
    const scaleY     = (plotHeight / (2 * maxVal)) * zoom;
    const cx = margin + plotWidth  / 2;
    const cy = margin + plotHeight / 2;

    // ---- Begin clipped drawing zone ----
    ctx.save();
    ctx.beginPath();
    ctx.rect(margin, margin, plotWidth, plotHeight);
    ctx.clip();

    // Grid lines
    ctx.strokeStyle = isDark ? '#27272a' : '#e4e4e7';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    for (let val = -yieldMPa; val <= yieldMPa; val += yieldMPa / 2) {
      const px = cx + val * scaleX;
      const py = cy - val * scaleY;
      ctx.moveTo(px, margin);        ctx.lineTo(px, height - margin); // vertical
      ctx.moveTo(margin, py);        ctx.lineTo(width  - margin, py); // horizontal
    }
    ctx.stroke();

    // Main axes
    ctx.strokeStyle = '#71717a';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(margin, cy);          ctx.lineTo(width - margin, cy); // X
    ctx.moveTo(cx,     margin);      ctx.lineTo(cx, height - margin); // Y
    ctx.stroke();

    // --- VME Ellipse ---
    // Derived parametric (verified: σa² − σa·σh + σh² = σy² for all t):
    //   σh(t) = σy·(cos t + sin t / √3)
    //   σa(t) = σy·(cos t − sin t / √3)
    const INV_SQRT3 = 1 / Math.sqrt(3); // ≈ 0.5774
    const TWO_PI    = 2 * Math.PI;
    const STEPS     = 180;
    const STEP_RAD  = TWO_PI / STEPS;  // cached constant, avoids per-iteration multiply

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    for (let i = 0; i <= STEPS; i++) {
      const rad = i * STEP_RAD;
      const cosR = Math.cos(rad);
      const sinR = Math.sin(rad);
      const x = yieldMPa * (cosR + sinR * INV_SQRT3); // σh
      const y = yieldMPa * (cosR - sinR * INV_SQRT3); // σa
      const px = cx + x * scaleX;
      const py = cy - y * scaleY;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();

    // --- Current load point ---
    const pxCurrent = cx + shMPa * scaleX;
    const pyCurrent = cy - saMPa * scaleY;

    ctx.fillStyle   = isSafe ? '#22c55e' : '#ef4444';
    ctx.beginPath();
    ctx.arc(pxCurrent, pyCurrent, 6, 0, TWO_PI);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    ctx.restore(); // end clip region

    // --- Axis labels ---
    ctx.fillStyle = isDark ? '#a1a1aa' : '#52525b';
    ctx.font      = '10px monospace';

    // Y-axis label (rotated)
    ctx.save();
    ctx.translate(margin - 10, cy);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText(isRu ? 'ОСЕВОЕ НАПРЯЖЕНИЕ (MPa)' : 'AXIAL STRESS (MPa)', 0, 0);
    ctx.restore();

    // X-axis label
    ctx.textAlign = 'center';
    ctx.fillText(
      isRu ? 'РАДИАЛЬНОЕ / ТАНГЕНЦИАЛЬНОЕ НАПРЯЖЕНИЕ (MPa)' : 'HOOP / DIFFERENTIAL STRESS (MPa)',
      cx, height - margin + 20
    );

    // --- Grid tick labels ---
    ctx.fillStyle = isDark ? '#71717a' : '#a1a1aa';
    ctx.font      = '9px monospace';
    for (let val = -yieldMPa; val <= yieldMPa; val += yieldMPa / 2) {
      if (Math.round(val) === 0) continue; // skip 0 to avoid clutter
      const px = cx + val * scaleX;
      const py = cy - val * scaleY;
      if (px >= margin && px <= width - margin) {
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(val)}`, px, cy + 12);
      }
      if (py >= margin && py <= height - margin) {
        ctx.textAlign = 'left';
        ctx.fillText(`${Math.round(val)}`, cx + 5, py + 3);
      }
    }

    // --- Legend ---
    ctx.textAlign   = 'left';
    ctx.fillStyle   = '#ef4444';
    ctx.fillRect(margin + 10, margin + 10, 12, 6);
    ctx.fillStyle   = isDark ? '#f4f4f5' : '#18181b';
    ctx.fillText(isRu ? 'Предел текучести VME' : 'VME Yield Envelope', margin + 28, margin + 16);

    ctx.fillStyle = isSafe ? '#22c55e' : '#ef4444';
    ctx.beginPath();
    ctx.arc(margin + 16, margin + 28, 4, 0, TWO_PI);
    ctx.fill();
    ctx.fillStyle = isDark ? '#f4f4f5' : '#18181b';
    ctx.fillText(
      isRu
        ? `Нагрузка: ${isSafe ? 'БЕЗОПАСНО' : 'ПЛАСТИКА/РАЗРУШЕНИЕ'}`
        : `Load Point: ${isSafe ? 'SAFE' : 'YIELD FAILURE'}`,
      margin + 28, margin + 32
    );
  }
}

export default StrengthEnvelopeChart;
