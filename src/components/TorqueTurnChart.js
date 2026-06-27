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
  render(optimumTorqueNmLbs, maxTorqueNmLbs, minTorqueNmLbs, turnsTarget, lang = 'en', unitSystem = 'metric') {
    const canvas = document.getElementById(this.canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const isRu = lang === 'ru';
    const isMetric = unitSystem === 'metric';

    const margin = 40;
    const plotWidth = width - 2 * margin - 20;
    const plotHeight = height - 2 * margin;

    // Maximum value for axes limits
    const maxTorqueVal = maxTorqueNmLbs * 1.4;
    const maxTurnsVal = turnsTarget * 1.3;

    const scaleX = plotWidth / maxTurnsVal;
    const scaleY = plotHeight / maxTorqueVal;

    const cx = margin + 10;
    const cy = height - margin;

    // Draw Grid Lines
    ctx.strokeStyle = '#e4e4e7'; // zinc-200
    if (document.documentElement.classList.contains('dark')) {
      ctx.strokeStyle = '#27272a'; // zinc-800
    }
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Horizontal grids at key torque points
    const yMin = cy - minTorqueNmLbs * scaleY;
    const yOpt = cy - optimumTorqueNmLbs * scaleY;
    const yMax = cy - maxTorqueNmLbs * scaleY;

    ctx.moveTo(cx, yMin); ctx.lineTo(width - margin, yMin);
    ctx.moveTo(cx, yOpt); ctx.lineTo(width - margin, yOpt);
    ctx.moveTo(cx, yMax); ctx.lineTo(width - margin, yMax);
    
    // Vertical grids at key turns
    const xShoulder = cx + (turnsTarget * 0.7) * scaleX;
    const xTarget = cx + turnsTarget * scaleX;
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

    const tShoulder = optimumTorqueNmLbs * 0.15;
    const turnsShoulder = turnsTarget * 0.7;

    ctx.moveTo(cx, cy);

    // Plot Phase 1 (thread engagement)
    for (let t = 0; t <= turnsShoulder; t += 0.05) {
      // Quadratic increase
      const val = tShoulder * Math.pow(t / turnsShoulder, 2);
      ctx.lineTo(cx + t * scaleX, cy - val * scaleY);
    }

    // Plot Phase 2 (shoulder makeup to optimum)
    const slope = (optimumTorqueNmLbs - tShoulder) / (turnsTarget - turnsShoulder);
    for (let t = turnsShoulder; t <= turnsTarget * 1.15; t += 0.05) {
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

    // Text labels
    ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#a1a1aa' : '#52525b';
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

    // Limit annotations
    ctx.textAlign = 'left';
    ctx.fillText(`Max: ${Math.round(maxTorqueNmLbs)}`, cx + 5, yMax - 4);
    ctx.fillText(`Opt: ${Math.round(optimumTorqueNmLbs)}`, cx + 5, yOpt - 4);
    ctx.fillText(`Min: ${Math.round(minTorqueNmLbs)}`, cx + 5, yMin - 4);
    ctx.fillText(`Shoulder`, xShoulder + 4, cy - 10);
    ctx.fillText(`Target`, xTarget + 4, cy - 25);
  }
}

export default TorqueTurnChart;
