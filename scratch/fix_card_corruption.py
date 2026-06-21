import os

file_path = "/Users/niko/Documents/Личное/AI/Antigravity/OmniLab/src/components/EngineeringCard.js"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "sec6Html = `<ul class=\"text-[11px] text-zinc-700 dark:text-zinc-350 space-y-0.5\">${formatList(rec.advantages || rec.why_selected, 'bg-emerald-500')}</ul>`;"
end_marker = "    // 4. Build Recommendations block HTML\n    let recommendationsHtml = '';"

start_idx = content.find(start_marker)
if start_idx == -1:
    print("Error: start marker not found")
    exit(1)

# We want to keep the start_marker itself
start_idx += len(start_marker)

end_idx = content.find(end_marker, start_idx)
if end_idx == -1:
    print("Error: end marker not found")
    exit(1)

new_content = content[:start_idx] + """
      sec7Html = `<ul class="text-[11px] text-zinc-700 dark:text-zinc-350 space-y-0.5">${formatList(rec.limitations || rec.why_avoided, 'bg-red-500')}</ul>`;
      sec8Html = `<ul class="text-[11px] text-zinc-700 dark:text-zinc-350 space-y-0.5">${formatList(rec.applications || rec.typical_applications || rec.running_notes || rec.engineering_notes, 'bg-blue-500')}</ul>`;
      sec9Html = `<div class="text-[10px] font-mono text-zinc-755 dark:text-zinc-300">${rec.standards && rec.standards.length > 0 ? rec.standards.join(', ') : getPlaceholder('no_data', lang)}</div>`;
    }

    if (viewMode === 'engineering') {
      const profile = alignRecordToStandard(rec);
      if (profile) {
        sec9Html += `
          <div class="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2 select-none">
            <span class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest mb-1.5">${lang === 'ru' ? 'Классификация стандартов' : 'Standard Classification'}</span>
            <div class="grid grid-cols-1 gap-1.5 text-[10px] font-sans">
              <div class="flex justify-between border-b border-zinc-50 dark:border-zinc-850/30 pb-1">
                <span class="text-zinc-400 dark:text-zinc-555 font-medium">${lang === 'ru' ? 'Класс API' : 'API Class'}:</span>
                <span class="text-zinc-700 dark:text-zinc-300 font-semibold text-right">${profile.apiReference || getPlaceholder('na', lang)}</span>
              </div>
              <div class="flex justify-between border-b border-zinc-50 dark:border-zinc-850/30 pb-1">
                <span class="text-zinc-400 dark:text-zinc-555 font-medium">${lang === 'ru' ? 'Спецификация ISO' : 'ISO Reference'}:</span>
                <span class="text-zinc-700 dark:text-zinc-300 font-semibold text-right">${profile.isoReference || getPlaceholder('na', lang)}</span>
              </div>
              <div class="flex justify-between border-b border-zinc-50 dark:border-zinc-850/30 pb-1">
                <span class="text-zinc-400 dark:text-zinc-555 font-medium">${lang === 'ru' ? 'Класс материала' : 'Material Class'}:</span>
                <span class="text-zinc-700 dark:text-zinc-300 font-semibold text-right">${profile.materialClass || getPlaceholder('na', lang)}</span>
              </div>
              <div class="flex justify-between border-b border-zinc-50 dark:border-zinc-850/30 pb-1">
                <span class="text-zinc-400 dark:text-zinc-555 font-medium">${lang === 'ru' ? 'Условия эксплуатации' : 'Service Env'}:</span>
                <span class="text-zinc-700 dark:text-zinc-300 font-semibold text-right">${profile.serviceEnvironment || getPlaceholder('no_data', lang)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-400 dark:text-zinc-555 font-medium">${lang === 'ru' ? 'Предельные параметры' : 'Envelope Limits'}:</span>
                <span class="text-zinc-700 dark:text-zinc-300 font-semibold text-right">${profile.envelopeLimits || getPlaceholder('no_data', lang)}</span>
              </div>
            </div>
          </div>
        `;
      }
    }

    // 1. Rules Engine warnings HTML (hidden in field mode)
    let warningsHtml = '';
    if (warnings.length > 0 && viewMode !== 'field') {
      warningsHtml = `
        <div class="space-y-1.5 mb-4 shrink-0 font-sans">
          ${warnings.map(w => {
            let colors = 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30 text-blue-700 dark:text-blue-400';
            let label = 'INFO';
            if (w.type === 'warning') {
              colors = 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400';
              label = 'WARNING';
            } else if (w.type === 'caution') {
              colors = 'bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400';
              label = 'CRITICAL';
            }
            return `
              <div class="p-3 border rounded-xl flex items-start gap-3 text-[10.5px] leading-relaxed ${colors}">
                <span class="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase font-mono tracking-wider shrink-0 bg-white/70 dark:bg-zinc-800 border border-current/20">${label}</span>
                <span>${w.text}</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // 2. Related Items HTML (hidden in field mode)
    const relatedMap = graph.getRelated(rec.id);
    let relatedHtml = '';
    if (relatedMap.size > 0 && viewMode !== 'field') {
      const links = [];
      relatedMap.forEach((targetIds, relation) => {
        const relationLabel = EngineeringGraph.getRelationLabel(relation, lang);
        targetIds.forEach(targetId => {
          let targetRec = null;
          for (const key of Object.keys(mockDb)) {
            const found = mockDb[key].find(item => item.id === targetId);
            if (found) {
              targetRec = { ...found, module: key === 'acid_environments' ? 'steel-grades' : key };
              break;
            }
          }
          if (targetRec) {
            links.push(`
              <button data-related-id="${targetRec.id}" data-related-module="${targetRec.module}" class="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-350 border border-zinc-200/50 dark:border-zinc-700 rounded text-[9px] font-semibold cursor-pointer transition-colors">
                ${relationLabel}: ${targetRec.name}
              </button>
            `);
          }
        });
      });
      if (links.length > 0) {
        relatedHtml = `
          <div class="space-y-2 border-t border-zinc-150 dark:border-zinc-800/80 pt-4">
            <h4 class="text-[9px] font-bold text-zinc-455 dark:text-zinc-555 uppercase tracking-widest border-l-2 border-zinc-400 dark:border-zinc-655 pl-2">
              ${lang === 'ru' ? 'Взаимосвязанное оборудование' : 'Linked Equipment & Context'}
            </h4>
            <div class="flex flex-wrap gap-2 pl-2">
              ${links.join('')}
            </div>
          </div>
        `;
      }
    }

    const renderEvidenceBlock = () => {
      const innerHtml = `
        <div class="space-y-3 font-sans text-xs">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-zinc-655 dark:text-zinc-350 text-[10.5px]">
            <div>
              <span class="block text-[8.5px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-widest mb-0.5">${lang === 'ru' ? 'Ревизия источника' : 'Source Revision'}</span>
              <span class="font-mono">${evidence.revision || getPlaceholder('validation', lang)}</span>
            </div>
            <div>
              <span class="block text-[8.5px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest mb-0.5">${lang === 'ru' ? 'Документ-источник' : 'Source Document'}</span>
              <span class="font-medium truncate block max-w-[120px]" title="${evidence.sourceDocument || ''}">${evidence.sourceDocument || getPlaceholder('no_data', lang)}</span>
            </div>
            <div>
              <span class="block text-[8.5px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest mb-0.5">${lang === 'ru' ? 'Уровень доверия' : 'Confidence Level'}</span>
              <span class="font-bold text-emerald-600 dark:text-emerald-450 uppercase">${evidence.confidence || 'REFERENCE'}</span>
            </div>
            <div>
              <span class="block text-[8.5px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-widest mb-0.5">${lang === 'ru' ? 'Дата проверки' : 'Verified At'}</span>
              <span class="font-mono">${evidence.lastUpdated || getPlaceholder('validation', lang)}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 text-zinc-655 dark:text-zinc-350 text-[10.5px]">
            <div>
              <span class="block text-[8.5px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-widest mb-0.5">${lang === 'ru' ? 'Область применения (Scope)' : 'Applicability Scope'}</span>
              <span class="font-medium">${evidence.applicabilityScope || getPlaceholder('no_data', lang)}</span>
            </div>
            <div>
              <span class="block text-[8.5px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest mb-0.5">${lang === 'ru' ? 'Ограничения и риски' : 'Limitation Notes'}</span>
              <span class="font-medium text-amber-600 dark:text-amber-450">${evidence.limitationNotes || getPlaceholder('na', lang)}</span>
            </div>
          </div>
        </div>
      `;

      if (viewMode === 'engineering') {
        return innerHtml;
      }

      // Reference Mode: render inside details block
      return `
        <details class="group mt-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/30 dark:bg-zinc-900/10">
          <summary class="flex justify-between items-center p-3 text-[10px] font-bold uppercase tracking-wider text-zinc-455 dark:text-zinc-500 cursor-pointer select-none outline-none">
            <span>${lang === 'ru' ? 'Показать технические доказательства (Evidence)' : 'Show Technical Evidence'}</span>
            <span class="transition-transform duration-200 group-open:rotate-180">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path></svg>
            </span>
          </summary>
          <div class="p-4 border-t border-zinc-150 dark:border-zinc-800/85">
            ${innerHtml}
          </div>
        </details>
      `;
    };

""" + content[end_idx:]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Successfully fixed corruption in EngineeringCard.js")
