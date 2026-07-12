/**
 * TorqueTurnChart.js
 * Renders an engineering Torque-Turn curve for casing/tubing thread connections
 * using HTML5 Canvas. Pure, offline-first drawing.
 */
export class TorqueTurnChart {
  constructor(canvasId) {
    this.canvasId = canvasId;
  }

  /**
   * Renders the Torque-Turn chart onto the canvas.
   */
  render(optimumTorqueNm, maxTorqueNm, minTorqueNm, turnsTarget, lang = 'en', unitSystem = 'metric', zoom = 1.0, theme = null) {
    const canvas = document.getElementById(this.canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Parse and validate incoming numeric parameters (guards against division by zero or NaN)
    const optTorqueVal = Number(optimumTorqueNm);
    const maxTorqueValInput = Number(maxTorqueNm);
    const minTorqueValInput = Number(minTorqueNm);
    const turns = Number(turnsTarget);
    const z = Number(zoom) || 1.0;

    if (
      isNaN(optTorqueVal) || optTorqueVal <= 0 ||
      isNaN(maxTorqueValInput) || maxTorqueValInput <= 0 ||
      isNaN(minTorqueValInput) || minTorqueValInput <= 0 ||
      isNaN(turns) || turns <= 0 ||
      isNaN(z) || z <= 0
    ) {
      return;
    }

    // --- HiDPI / Retina support ---
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.offsetWidth || 360;
    const cssH = canvas.offsetHeight || 280;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.scale(dpr, dpr);

    // Logical dimensions (all drawing uses these)
    const width = cssW;
    const height = cssH;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const isRu = lang === 'ru';
    const isMetric = unitSystem === 'metric';
    const isDark = theme 
      ? (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) 
      : document.documentElement.classList.contains('dark');
    
    // Convert received torque values (which are always in N·m) to the requested unit system
    const factor = isMetric ? 1.0 : (1.0 / 1.35582);
    const minTorque = minTorqueValInput * factor;
    const optimumTorque = optTorqueVal * factor;
    const maxTorque = maxTorqueValInput * factor;

    const margin = 40;
    const plotWidth = width - 2 * margin - 20;
    const plotHeight = height - 2 * margin;

    // Maximum value for axes limits
    const maxTorqueVal = maxTorque * 1.4;
    const maxTurnsVal = turns * 1.3;

    const scaleX = (plotWidth / maxTurnsVal) * z;
    const scaleY = (plotHeight / maxTorqueVal) * z;

    const cx = margin + 10;
    const cy = height - margin;

    // Clip drawing inside the axes boundaries (prevents overflow during zoom)
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx, margin, width - margin - cx, cy - margin);
    ctx.clip();

    // Draw Grid Lines
    ctx.strokeStyle = isDark ? '#27272a' : '#e4e4e7'; // zinc-800 or zinc-200
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Horizontal grids at key torque points
    const yMin = cy - minTorque * scaleY;
    const yOpt = cy - optimumTorque * scaleY;
    const yMax = cy - maxTorque * scaleY;

    ctx.moveTo(cx, yMin); ctx.lineTo(width - margin, yMin);
    ctx.moveTo(cx, yOpt); ctx.lineTo(width - margin, yOpt);
    ctx.moveTo(cx, yMax); ctx.lineTo(width - margin, yMax);
    
    // Vertical grids at key turns
    const xShoulder = cx + (turns * 0.7) * scaleX;
    const xTarget = cx + turns * scaleX;
    ctx.moveTo(xShoulder, margin); ctx.lineTo(xShoulder, cy);
    ctx.moveTo(xTarget, margin); ctx.lineTo(xTarget, cy);
    ctx.stroke();

    // Draw Main Axes
    ctx.strokeStyle = '#71717a'; // zinc-500
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, margin);
    ctx.lineTo(cx, cy);
    ctx.lineTo(width - margin, cy);
    ctx.stroke();

    // Draw Torque-Turn curve
    // Phase 1: Thread running (concave curve)
    // Phase 2: Shoulder torque (steep linear curve after shoulder point)
    ctx.strokeStyle = '#3b82f6'; // blue-500
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    // Illustrative curve shape, not derived from telemetry
    const tShoulder = optimumTorque * 0.15;
    const turnsShoulder = turns * 0.7;

    ctx.moveTo(cx, cy);

    // Plot Phase 1 (thread engagement) with dynamic step based on zoom
    const step = Math.max(0.01, 0.05 / z);
    for (let t = 0; t <= turnsShoulder; t += step) {
      // Quadratic increase
      const val = tShoulder * Math.pow(t / turnsShoulder, 2);
      ctx.lineTo(cx + t * scaleX, cy - val * scaleY);
    }
    // Ensure precise end of Phase 1
    ctx.lineTo(cx + turnsShoulder * scaleX, cy - tShoulder * scaleY);

    // Plot Phase 2 (shoulder makeup to optimum)
    const slope = (optimumTorque - tShoulder) / (turns - turnsShoulder);
    for (let t = turnsShoulder; t <= turns * 1.15; t += step) {
      const val = tShoulder + slope * (t - turnsShoulder);
      ctx.lineTo(cx + t * scaleX, cy - val * scaleY);
    }
    ctx.stroke();

    // Highlight key control bounds: Min, Opt, Max Torques
    ctx.fillStyle = '#ef4444'; // Red for Max limit
    ctx.beginPath(); ctx.arc(xTarget, yMax, 4, 0, 2 * Math.PI); ctx.fill();

    ctx.fillStyle = '#22c55e'; // Green for Opt target
    ctx.beginPath(); ctx.arc(xTarget, yOpt, 5, 0, 2 * Math.PI); ctx.fill();

    ctx.fillStyle = '#f59e0b'; // Amber for Min target
    ctx.beginPath(); ctx.arc(xTarget, yMin, 4, 0, 2 * Math.PI); ctx.fill();

    // Limit annotations (inside clip so they don't overflow when zoomed)
    ctx.fillStyle = isDark ? '#a1a1aa' : '#52525b';
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    const lblMax = isRu ? 'Макс' : 'Max';
    const lblOpt = isRu ? 'Опт' : 'Opt';
    const lblMin = isRu ? 'Мин' : 'Min';
    const lblShoulder = isRu ? 'Упор' : 'Shoulder';
    const lblTarget = isRu ? 'Цель' : 'Target';
    ctx.fillText(`${lblMax}: ${Math.round(maxTorque)}`, cx + 5, Math.round(yMax) - 4);
    ctx.fillText(`${lblOpt}: ${Math.round(optimumTorque)}`, cx + 5, Math.round(yOpt) - 4);
    ctx.fillText(`${lblMin}: ${Math.round(minTorque)}`, cx + 5, Math.round(yMin) - 4);
    ctx.fillText(lblShoulder, Math.round(xShoulder) + 4, Math.round(cy) - 10);
    ctx.fillText(lblTarget, Math.round(xTarget) + 4, Math.round(cy) - 25);

    ctx.restore(); // Restore clipping state before drawing labels and legends

    // Text labels for axes (outside clip)
    ctx.fillStyle = isDark ? '#a1a1aa' : '#52525b';
    ctx.font = '8px monospace';
    
    // Y-axis label
    ctx.save();
    ctx.translate(margin - 18, (cy + margin) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText(
      isRu 
        ? `КРУТЯЩИЙ МОМЕНТ (${isMetric ? 'N·m' : 'ft-lbs'})` 
        : `TORQUE (${isMetric ? 'N·m' : 'ft-lbs'})`,
      0, 0
    );
    ctx.restore();

    // X-axis label
    ctx.textAlign = 'center';
    ctx.fillText(isRu ? 'ЧИСЛО ОБОРОТОВ (Turns)' : 'TURNS', cx + plotWidth / 2, cy + 22);
  }
}

export default TorqueTurnChart;
