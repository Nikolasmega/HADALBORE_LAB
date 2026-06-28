/**
 * StrengthEnvelopeChart.js
 * Renders the Von Mises Yield strength envelope (VME) ellipse for tubulars
 * using HTML5 Canvas. Pure, offline-first calculation and drawing.
 */
export class StrengthEnvelopeChart {
  constructor(canvasId) {
    this.canvasId = canvasId;
  }

  /**
   * Renders the VME chart onto the canvas.
   */
  render(yieldStrengthPa, axialForceN, internalPressurePa, externalPressurePa, outerDiaM, innerDiaM, lang = 'en', zoom = 1.0) {
    const canvas = document.getElementById(this.canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const isRu = lang === 'ru';
    const ro = outerDiaM / 2;
    const ri = innerDiaM / 2;
    const area = Math.PI * (Math.pow(ro, 2) - Math.pow(ri, 2));

    // Calculate actual stresses
    const sa = area > 0 ? axialForceN / area : 0; // axial stress
    const sh = (outerDiaM - innerDiaM) > 0 ? ((internalPressurePa - externalPressurePa) * ri) / (ro - ri) : 0; // hoop stress (approx)

    // Yield strength in MPa for plotting
    const yieldMPa = yieldStrengthPa / 1e6;
    const saMPa = sa / 1e6;
    const shMPa = sh / 1e6;

    // Chart margins and scale
    const margin = 40;
    const plotWidth = width - 2 * margin;
    const plotHeight = height - 2 * margin;
    
    // Scale factor (pixel per MPa)
    // Scale so that 1.5 * yield strength fits in the plot area
    const maxVal = yieldMPa * 1.5;
    const scaleX = (plotWidth / (2 * maxVal)) * zoom;
    const scaleY = (plotHeight / (2 * maxVal)) * zoom;

    // Center of plot area (0,0 point)
    const cx = margin + plotWidth / 2;
    const cy = margin + plotHeight / 2;

    // Clip drawing to plot boundaries (prevents drawing outside chart grid)
    ctx.save();
    ctx.beginPath();
    ctx.rect(margin, margin, plotWidth, plotHeight);
    ctx.clip();

    // Draw Grid and Axes
    ctx.strokeStyle = '#e4e4e7'; // zinc-200
    if (document.documentElement.classList.contains('dark')) {
      ctx.strokeStyle = '#27272a'; // zinc-800
    }
    ctx.lineWidth = 1;

    // Draw grid lines
    ctx.beginPath();
    for (let val = -yieldMPa; val <= yieldMPa; val += yieldMPa / 2) {
      const px = cx + val * scaleX;
      const py = cy - val * scaleY;
      
      // Vertical grid
      ctx.moveTo(px, margin);
      ctx.lineTo(px, height - margin);
      
      // Horizontal grid
      ctx.moveTo(margin, py);
      ctx.lineTo(width - margin, py);
    }
    ctx.stroke();

    // Draw Main Axes
    ctx.strokeStyle = '#71717a'; // zinc-500
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // X Axis
    ctx.moveTo(margin, cy);
    ctx.lineTo(width - margin, cy);
    // Y Axis
    ctx.moveTo(cx, margin);
    ctx.lineTo(cx, height - margin);
    ctx.stroke();

    // Draw VME Ellipse: sa^2 - sa*sh + sh^2 = yield^2
    // We can draw it by computing points around 360 degrees
    ctx.strokeStyle = '#ef4444'; // red-500
    ctx.lineWidth = 2;
    ctx.beginPath();
    let first = true;
    for (let deg = 0; deg <= 360; deg += 2) {
      const rad = (deg * Math.PI) / 180;
      
      // Parametric equation for inclined VME ellipse
      // x = hoop, y = axial
      const x = yieldMPa * Math.cos(rad) * Math.sqrt(2 / 3) + yieldMPa * Math.sin(rad) * Math.sqrt(2) / 2;
      const y = -yieldMPa * Math.cos(rad) * Math.sqrt(2 / 3) + yieldMPa * Math.sin(rad) * Math.sqrt(2) / 2;

      const px = cx + x * scaleX;
      const py = cy - y * scaleY;

      if (first) {
        ctx.moveTo(px, py);
        first = false;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.stroke();

    // Draw Current Load Point
    const pxCurrent = cx + shMPa * scaleX;
    const pyCurrent = cy - saMPa * scaleY;

    // Draw safety zone shading (green if inside, red if outside)
    const isSafe = (Math.pow(saMPa, 2) - saMPa * shMPa + Math.pow(shMPa, 2)) <= Math.pow(yieldMPa, 2);

    ctx.fillStyle = isSafe ? '#22c55e' : '#ef4444'; // green-500 or red-500
    ctx.beginPath();
    ctx.arc(pxCurrent, pyCurrent, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore(); // Restore clipping state before drawing labels and legends

    // Labels
    ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#a1a1aa' : '#52525b';
    ctx.font = '10px monospace';
    
    // Y Axis Label (Axial Stress)
    ctx.save();
    ctx.translate(margin - 10, cy);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText(isRu ? 'ОСЕВОЕ НАПРЯЖЕНИЕ (MPa)' : 'AXIAL STRESS (MPa)', 0, 0);
    ctx.restore();

    // X Axis Label (Hoop Stress)
    ctx.textAlign = 'center';
    ctx.fillText(isRu ? 'РАДИАЛЬНОЕ / ТАНГЕНЦИАЛЬНОЕ НАПРЯЖЕНИЕ (MPa)' : 'HOOP / DIFFERENTIAL STRESS (MPa)', cx, height - margin + 20);

    // Dynamic Grid Labels
    ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#71717a' : '#a1a1aa';
    ctx.font = '9px monospace';
    for (let val = -yieldMPa; val <= yieldMPa; val += yieldMPa / 2) {
      const px = cx + val * scaleX;
      const py = cy - val * scaleY;
      
      // Label on X-axis (skip 0 to avoid clutter)
      if (Math.round(val) !== 0 && px >= margin && px <= width - margin) {
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(val)}`, px, cy + 12);
      }
      
      // Label on Y-axis (skip 0 to avoid clutter)
      if (Math.round(val) !== 0 && py >= margin && py <= height - margin) {
        ctx.textAlign = 'left';
        ctx.fillText(`${Math.round(val)}`, cx + 5, py + 3);
      }
    }

    // Legend
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(margin + 10, margin + 10, 12, 6);
    ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#f4f4f5' : '#18181b';
    ctx.fillText(isRu ? 'Предел текучести VME' : 'VME Yield Envelope', margin + 28, margin + 16);

    ctx.fillStyle = isSafe ? '#22c55e' : '#ef4444';
    ctx.beginPath();
    ctx.arc(margin + 16, margin + 28, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#f4f4f5' : '#18181b';
    ctx.fillText(
      isRu 
        ? `Нагрузка: ${isSafe ? 'БЕЗОПАСНО' : 'ПЛАСТИКА/РАЗРУШЕНИЕ'}` 
        : `Load Point: ${isSafe ? 'SAFE' : 'YIELD FAILURE'}`,
      margin + 28, margin + 32
    );
  }
}

export default StrengthEnvelopeChart;
