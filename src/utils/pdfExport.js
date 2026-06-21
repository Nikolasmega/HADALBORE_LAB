/**
 * Browser-native PDF Export Utility for HADALBORE LAB.
 * Generates an official print-optimized engineering report.
 */
import { EngineeringRules } from '../core/EngineeringRules.js';
import { EngineeringRecommendationEngine } from '../core/EngineeringRecommendationEngine.js';
import { EngineeringValidator } from '../core/EngineeringValidator.js';
export class PDFExporter {
  /**
   * Triggers browser print/PDF export dialog with dynamically generated report sheet.
   * 
   * @param {string} calcType - Type of calculator ('tally' | 'displacement' | 'corrosion' | 'thermal' | 'hydrostatic' | 'hook_load')
   * @param {Object} inputs - Key-value pair of input parameters
   * @param {Object} outputs - Key-value pair of output results
   * @param {string} lang - Language ('en' | 'ru')
   * @param {string} unitSystem - Active unit system ('metric' | 'imperial' | 'hybrid')
   */
  static exportToPDF(calcType, inputs, outputs, lang, unitSystem) {
    const isRu = lang === 'ru';
    
    const getNum = (labelEn, labelRu) => {
      const valStr = inputs[labelEn] || inputs[labelRu] || '';
      const matches = valStr.match(/[\d\.]+/);
      return matches ? parseFloat(matches[0]) : 0;
    };

    let rawInputs = {};
    if (calcType === 'hydrostatic') {
      rawInputs = {
        depth: getNum('True Vertical Depth (TVD)', 'Вертикальная глубина (TVD)'),
        density: getNum('Fluid Density', 'Плотность жидкости')
      };
    } else if (calcType === 'hook_load') {
      rawInputs = {
        airWeight: getNum('String Weight in Air', 'Номинальный вес в воздухе'),
        mudDensity: getNum('Drilling Fluid Density', 'Плотность бурового раствора'),
        drag: getNum('Friction Drag Coefficient', 'Силы сопротивления (Drag)')
      };
    } else if (calcType === 'corrosion') {
      const envStr = inputs['Medium Type'] || inputs['Тип среды'] || '';
      rawInputs = {
        temperature: getNum('Temperature', 'Температура'),
        environment: (envStr.includes('H₂S') || envStr.includes('sour') || envStr.includes('Кислый') || envStr.includes('сероводород')) ? 'sour' : 'hcl'
      };
    }

    // Evaluate rules warnings
    const warnings = EngineeringRules.evaluateCalculation(calcType, rawInputs, outputs, lang);
    
    // Evaluate engineering recommendations
    const recommendations = EngineeringRecommendationEngine.getRecommendationsForCalculation(calcType, rawInputs, outputs, lang);
    
    // Evaluate validator warnings
    let validatorWarnings = [];
    if (calcType === 'hydrostatic') {
      const v = EngineeringValidator.validateInputs('hydrostatic', rawInputs, lang);
      if (!v.valid) validatorWarnings.push(v.error);
      validatorWarnings.push(...v.warnings);
    } else if (calcType === 'hook_load') {
      const v = EngineeringValidator.validateInputs('hook_load', rawInputs, lang);
      if (!v.valid) validatorWarnings.push(v.error);
      validatorWarnings.push(...v.warnings);
    } else if (calcType === 'corrosion') {
      const v = EngineeringValidator.validateInputs('corrosion', { temperature: rawInputs.temperature, pressure: rawInputs.pressure }, lang);
      if (!v.valid) validatorWarnings.push(v.error);
      validatorWarnings.push(...v.warnings);
    } else if (calcType === 'displacement') {
      const v = EngineeringValidator.validateInputs('capacity', { length: getNum('Length of Pipe String', 'Длина спускаемой колонны') }, lang);
      if (!v.valid) validatorWarnings.push(v.error);
    }

    const allWarnings = [...(warnings || []).map(w => w.text || w), ...validatorWarnings];

    // Verification Status logic
    let verificationColor = '#10b981'; // emerald-500
    let verificationText = isRu ? 'ВЕРИФИЦИРОВАНО' : 'VALIDATED';

    const hasPhysicalViolations = allWarnings.some(w => 
      w.toLowerCase().includes('negative') || 
      w.toLowerCase().includes('отрицательн') || 
      w.toLowerCase().includes('абсолютного нуля') || 
      w.toLowerCase().includes('absolute zero') ||
      w.toLowerCase().includes('меньше нуля') ||
      w.toLowerCase().includes('больше нуля')
    );

    if (hasPhysicalViolations) {
      verificationColor = '#ef4444'; // red-500
      verificationText = isRu ? 'ВНЕ ИНЖЕНЕРНЫХ ГРАНИЦ' : 'OUTSIDE ENVELOPE';
    } else if (allWarnings.length > 0) {
      verificationColor = '#f59e0b'; // amber-500
      verificationText = isRu ? 'ТРЕБУЕТСЯ ЭКСПЕРТИЗА' : 'REVIEW REQUIRED';
    }
    
    // Title mapping
    const titles = {
      tally: isRu ? 'Калькулятор набора труб (Tubing Tally)' : 'Tubing Tally Joint Calculation',
      displacement: isRu ? 'Объем вытеснения раствора' : 'Tubular Displacement Volume',
      corrosion: isRu ? 'Оценка скорости коррозии металлов' : 'Metal Corrosion & Elastomer Compatibility',
      thermal: isRu ? 'Температурное расширение стальной колонны' : 'Casing/Tubing Thermal Expansion',
      hydrostatic: isRu ? 'Гидростатическое давление столба жидкости' : 'Hydrostatic Fluid Column Pressure',
      hook_load: isRu ? 'Нагрузка на крюке и плавучесть колонны' : 'Hook Load & String Buoyancy'
    };

    const formulas = {
      tally: 'L_total = Sum(L_joints)',
      displacement: 'V_disp = [π × (OD² - ID²) / 4] × L',
      corrosion: 'Rate = Rate_base × 2^[(T - 20) / 20] × (1 + P / 5000)',
      thermal: 'ΔL = L × α × ΔT',
      hydrostatic: unitSystem === 'imperial' ? 'P = H × ρ × 0.052' : 'P = H × ρ × 0.0000981',
      hook_load: 'BF = 1 - (ρ_mud / ρ_steel); W_buoy = W_air × BF; W_pickup = W_buoy × (1 + Drag)'
    };

    const assumptions = {
      tally: isRu 
        ? 'Суммирование длин отдельных труб. Предполагается точное физическое измерение каждой трубы рулеткой.'
        : 'Summation of individual joint lengths. Assumes physical measurement of joints on the rack.',
      displacement: isRu
        ? 'Идеальные концентрические стальные цилиндры. Высадка резьбы и муфты не учитываются.'
        : 'Perfect concentric steel cylinders. Excludes joint upsets, connections, and external accessories.',
      corrosion: isRu
        ? 'Температурное ускорение Аррениуса (скорость удваивается каждые 20C), линейный рост от давления. Справочная оценка.'
        : 'Arrhenius-style temperature acceleration (rate doubles every 20C), linear pressure factor. Reference only.',
      thermal: isRu
        ? 'Стальная колонна свободна в перемещении (не зафиксирована пакером/прихватом), тепловое расширение однородно.'
        : 'Casing/tubing string is unconstrained (free to move), temperature delta is uniform along the length.',
      hydrostatic: isRu
        ? 'Вертикальный ствол скважины, статический столб однородной жидкости, отсутствие газосодержания.'
        : 'True vertical wellbore, static fluid column, uniform density, gas-free fluid.',
      hook_load: isRu
        ? 'Равномерное сопротивление/трение по всей длине ствола, отсутствие локальных прихватов и сужений.'
        : 'Uniform drag along the string, excluding localized tight spots, doglegs, or keyseats.'
    };

    const disclaimer = isRu
      ? 'Только для инженерной оценки. Не для принятия эксплуатационных решений или решений, критических для безопасности. Всегда сверяйте данные со спецификациями OEM, API, процедурами оператора или компании.'
      : 'Engineering reference estimate only. Not for operational or safety-critical decisions. Always validate against OEM, API, operator, or company procedures.';

    const evidenceData = {
      tally: {
        sources: ['API RP 5C1', 'Hadalbore Tally Standard H-TALLY-01'],
        confidenceLevel: 'High',
        lastUpdated: '2026-06-12',
        revisionDate: '2026-05-10',
        applicabilityScope: isRu ? 'Суммирование физических длин труб на мостках.' : 'Summation of physical pipe lengths on the rack.',
        limitationNotes: isRu ? 'Требует калиброванной рулетки. Округление до 0.01 м/фута.' : 'Requires calibrated tape measure. Subject to 0.01 m/ft rounding.'
      },
      displacement: {
        sources: ['API Bulletin 5C3', 'Hadalbore Fluid Displacement Manual'],
        confidenceLevel: 'High',
        lastUpdated: '2026-06-12',
        revisionDate: '2026-04-15',
        applicabilityScope: isRu ? 'Концентрические стальные трубы без учета муфт и протектора.' : 'Concentric steel pipes excluding connection upsets and thread protectors.',
        limitationNotes: isRu ? 'Не учитывает внешнее оборудование или сужение скважины.' : 'Does not account for external casing accessories or borehole restrictions.'
      },
      corrosion: {
        sources: ['NACE MR0175 / ISO 15156', 'Hadalbore Sour Service Matrix v2'],
        confidenceLevel: 'Reference Only',
        lastUpdated: '2026-06-10',
        revisionDate: '2026-03-22',
        applicabilityScope: isRu ? 'Предварительная оценка скорости коррозии от температуры и H₂S.' : 'Preliminary corrosion rate estimation based on temperature and H₂S.',
        limitationNotes: isRu ? 'Только для сравнительного анализа. Требуется лабораторная валидация.' : 'For comparative study only. Actual corrosion requires laboratory validation.'
      },
      thermal: {
        sources: ['Lubinski Casing Strain Theory', 'API RP 90'],
        confidenceLevel: 'Medium',
        lastUpdated: '2026-06-11',
        revisionDate: '2026-02-18',
        applicabilityScope: isRu ? 'Свободное температурное расширение колонны в скважине.' : 'Unconstrained thermal elongation of a casing/tubing string.',
        limitationNotes: isRu ? 'Предполагает равномерный градиент температур. Не учитывает силы трения.' : 'Assumes uniform temperature gradient. Neglects wellbore friction forces.'
      },
      hydrostatic: {
        sources: ['API RP 59', 'Hadalbore Well Control Standards'],
        confidenceLevel: 'High',
        lastUpdated: '2026-06-12',
        revisionDate: '2026-05-20',
        applicabilityScope: isRu ? 'Статический столб однородной несжимаемой жидкости в вертикальном стволе.' : 'Static column of uniform incompressible fluid in vertical wellbore.',
        limitationNotes: isRu ? 'Не учитывает динамические эффекты (свабирование, поршневание), сжимаемость и температурное расширение раствора.' : 'Excludes dynamic effects (swabbing, surging), fluid compressibility, and thermal expansion.'
      },
      hook_load: {
        sources: ['API RP 7G', 'Hadalbore Drill String Mechanics'],
        confidenceLevel: 'Medium',
        lastUpdated: '2026-06-11',
        revisionDate: '2026-05-01',
        applicabilityScope: isRu ? 'Нагрузка на крюк с учетом сил плавучести и равномерного трения.' : 'Hook load calculations accounting for buoyancy and uniform drag.',
        limitationNotes: isRu ? 'Исключает локальные прихваты, искривления ствола скважины (doglegs) и влияние вращения колонны.' : 'Excludes localized tight spots, doglegs, and rotation effects.'
      }
    };
    const evidence = evidenceData[calcType] || {
      sources: ['Internal Reference'],
      confidenceLevel: 'Reference Only',
      lastUpdated: 'N/A',
      revisionDate: 'N/A',
      applicabilityScope: 'General engineering estimation.',
      limitationNotes: 'For reference only.'
    };

    // Generate input parameters table rows
    const inputRows = Object.entries(inputs).map(([label, val]) => `
      <tr>
        <td class="lbl">${label}</td>
        <td class="val font-mono">${val}</td>
      </tr>
    `).join('');

    // Generate output results table rows
    const outputRows = Object.entries(outputs).map(([label, val]) => `
      <tr>
        <td class="lbl">${label}</td>
        <td class="val font-mono highlight">${val}</td>
      </tr>
    `).join('');

    const timestamp = new Date().toLocaleString(isRu ? 'ru-RU' : 'en-US');
    const title = titles[calcType] || 'Engineering Calculation';

    // Build print HTML document
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
          
          @page {
            size: A4;
            margin: 20mm;
          }
          
          body {
            font-family: 'Inter', sans-serif;
            color: #18181b;
            background: #ffffff;
            margin: 0;
            padding: 0;
            font-size: 11px;
            line-height: 1.5;
          }

          /* Header styles */
          .header {
            border-bottom: 2px solid #09090b;
            padding-bottom: 12px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }

          .header-title h1 {
            font-size: 16px;
            font-weight: 800;
            margin: 0;
            letter-spacing: -0.5px;
            color: #09090b;
            text-transform: uppercase;
          }

          .header-title p {
            font-size: 9px;
            font-weight: 600;
            margin: 2px 0 0 0;
            color: #71717a;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .header-meta {
            text-align: right;
            font-size: 8.5px;
            color: #71717a;
            font-weight: 500;
          }
          
          .header-meta span {
            font-weight: 700;
            color: #18181b;
          }

          /* Report Layout */
          .section-title {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #71717a;
            border-bottom: 1px solid #e4e4e7;
            padding-bottom: 4px;
            margin-top: 25px;
            margin-bottom: 10px;
          }

          .grid-container {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          td {
            padding: 6px 0;
            border-bottom: 1px dashed #e4e4e7;
            vertical-align: top;
          }

          tr:last-child td {
            border-bottom: none;
          }

          td.lbl {
            font-weight: 600;
            color: #52525b;
          }

          td.val {
            text-align: right;
            font-weight: 600;
            color: #09090b;
          }
          
          .font-mono {
            font-family: 'JetBrains Mono', monospace;
            font-size: 10.5px;
          }

          td.highlight {
            color: #059669;
            font-weight: 700;
          }

          /* Mathematical model block */
          .model-card {
            background: #f4f4f5;
            border: 1px solid #e4e4e7;
            border-radius: 6px;
            padding: 12px;
            margin-top: 8px;
          }

          .equation {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            font-weight: 700;
            background: #ffffff;
            border: 1px solid #e4e4e7;
            padding: 8px;
            border-radius: 4px;
            margin-bottom: 8px;
            color: #09090b;
            display: inline-block;
          }

          .assumptions {
            font-size: 10px;
            color: #52525b;
            margin: 4px 0 0 0;
          }

          /* Disclaimer */
          .disclaimer {
            margin-top: 40px;
            border: 1px solid #f59e0b;
            background: #fffbeb;
            padding: 12px;
            border-radius: 6px;
            font-size: 9.5px;
            color: #b45309;
            line-height: 1.4;
          }

          .disclaimer-title {
            font-weight: 700;
            text-transform: uppercase;
            font-size: 8px;
            letter-spacing: 1px;
            margin-bottom: 4px;
            display: block;
          }

          .footer {
            margin-top: 50px;
            border-top: 1px solid #e4e4e7;
            padding-top: 8px;
            text-align: center;
            font-size: 8px;
            color: #a1a1aa;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <div class="header-title">
            <h1>HADALBORE_LAB</h1>
            <p>Engineering Calculation Sheet</p>
          </div>
          <div style="display: flex; align-items: center; gap: 15px; text-align: left;">
            <div class="header-meta">
              Date: <span>${timestamp}</span><br>
              Units: <span>${unitSystem.toUpperCase()}</span><br>
              Creator: <span>Niko Y</span>
            </div>
            <div style="border: 2px solid ${verificationColor}; color: ${verificationColor}; border-radius: 4px; padding: 4px 8px; font-weight: 800; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; line-height: 1.1; font-family: 'Inter', sans-serif; min-width: 120px; shrink-0; select-none;">
              ${verificationText}<br>
              <span style="font-size: 7px; font-weight: 500; color: #71717a;">${isRu ? 'АВТОМАТИЧЕСКИЙ ШТАМП' : 'SYSTEM AUTO STAMP'}</span>
            </div>
          </div>
        </div>

        <h2 style="font-size: 14px; font-weight: 700; margin: 0 0 15px 0; color: #09090b;">${title}</h2>

        <!-- Grid Input & Output -->
        <div class="grid-container">
          <!-- Inputs Column -->
          <div>
            <div class="section-title">${isRu ? 'Входные параметры' : 'Input Parameters'}</div>
            <table>
              <tbody>
                ${inputRows}
              </tbody>
            </table>
          </div>

          <!-- Outputs Column -->
          <div>
            <div class="section-title">${isRu ? 'Результаты расчетов' : 'Output Results'}</div>
            <table>
              <tbody>
                ${outputRows}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mathematical Model Section -->
        <div class="section-title">${isRu ? 'Математическая модель и допущения' : 'Mathematical Model & Assumptions'}</div>
        <div class="model-card">
          <div class="equation">${formulas[calcType] || ''}</div>
          <div class="assumptions">
            <strong>${isRu ? 'Допущения:' : 'Assumptions:'}</strong> ${assumptions[calcType] || ''}
          </div>
        </div>

        <!-- Warnings Section -->
        ${warnings.length > 0 ? `
          <div class="section-title">${isRu ? 'Предупреждения безопасности (Warnings)' : 'Safety Warnings'}</div>
          <div class="disclaimer" style="border-color: #ef4444; background: #fef2f2; color: #b91c1c; margin-top: 8px;">
            <div style="font-weight: 700; text-transform: uppercase; font-size: 8px; letter-spacing: 1px; margin-bottom: 4px;">⚠️ ${isRu ? 'КРИТИЧЕСКОЕ ПРЕДУПРЕЖДЕНИЕ' : 'CRITICAL ALERT'}</div>
            <ul style="margin: 0; padding-left: 14px;">
              ${warnings.map(w => `<li>${w.text}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- Recommendations Section -->
        ${recommendations.length > 0 ? `
          <div class="section-title">${isRu ? 'Инженерные рекомендации (Recommendations)' : 'Engineering Recommendations'}</div>
          <div class="model-card" style="border-color: #10b981; background: #ecfdf5; margin-top: 8px; color: #065f46;">
            <div style="font-weight: 700; text-transform: uppercase; font-size: 8px; letter-spacing: 1px; margin-bottom: 6px; color: #047857;">✓ ${isRu ? 'РЕКОМЕНДУЕМЫЕ ДЕЙСТВИЯ' : 'RECOMMENDED ACTIONS'}</div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${recommendations.map(r => `
                <div style="margin-bottom: 6px; last:margin-bottom: 0;">
                  <strong style="display: block; font-size: 10px; color: #064e3b;">${r.recommendation}</strong>
                  <span style="font-size: 9px; color: #047857; display: block; margin-top: 2px;">${r.reason}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Data Confidence & Evidence Section -->
        <div class="section-title">${isRu ? 'Достоверность расчетных данных (Evidence)' : 'Calculation Confidence & Evidence'}</div>
        <div class="model-card">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e4e4e7; padding-bottom: 6px; margin-bottom: 8px;">
            <strong style="text-transform: uppercase; font-size: 8px; color: #71717a; letter-spacing: 0.5px;">${isRu ? 'Уровень уверенности:' : 'Confidence Level:'}</strong>
            <span style="font-weight: 700; color: ${evidence.confidenceLevel === 'High' ? '#059669' : (evidence.confidenceLevel === 'Medium' ? '#2563eb' : '#71717a')}; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; font-size: 9px;">
              ${isRu ? (evidence.confidenceLevel === 'High' ? 'ВЫСОКИЙ' : (evidence.confidenceLevel === 'Medium' ? 'СРЕДНИЙ' : 'ДЛЯ СПРАВКИ')) : evidence.confidenceLevel}
            </span>
          </div>
          <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 10px; font-size: 9.5px; color: #52525b; line-height: 1.4;">
            <div>
              <strong>${isRu ? 'Первоисточники:' : 'Sources:'}</strong> ${evidence.sources.join(', ')}
            </div>
            <div>
              <strong>${isRu ? 'Дата редакции:' : 'Revision Date:'}</strong> ${evidence.revisionDate} / <strong>${isRu ? 'Проверено:' : 'Verified:'}</strong> ${evidence.lastUpdated}
            </div>
            <div style="grid-column: span 2; border-top: 1px dashed #e4e4e7; padding-top: 6px;">
              <strong>${isRu ? 'Область применения:' : 'Applicability Scope:'}</strong> ${evidence.applicabilityScope}
            </div>
            <div style="grid-column: span 2; color: #b45309;">
              <strong>${isRu ? 'Ограничения и риски:' : 'Limitation Notes:'}</strong> ${evidence.limitationNotes}
            </div>
          </div>
        </div>

        <!-- Disclaimer -->
        <div class="disclaimer">
          <span class="disclaimer-title">${isRu ? 'Предупреждение безопасности' : 'Engineering Disclaimer'}</span>
          ${disclaimer}
        </div>

        <!-- Footer -->
        <div class="footer" style="text-align: center; font-size: 8px; color: #a1a1aa; border-top: 1px solid #e4e4e7; padding-top: 8px; margin-top: 40px;">
          Generated by official HADALBORE_LAB build • Creator: Niko Y • ALL RIGHTS RESERVED
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    // Create a temporary hidden iframe to trigger print without modifying original page
    let iframe = document.getElementById('hadalbore-print-iframe');
    if (iframe) {
      iframe.parentNode.removeChild(iframe);
    }
    
    iframe = document.createElement('iframe');
    iframe.id = 'hadalbore-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.bottom = '0';
    iframe.style.right = '0';
    iframe.style.visibility = 'hidden';
    
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();
  }
}

export default PDFExporter;
