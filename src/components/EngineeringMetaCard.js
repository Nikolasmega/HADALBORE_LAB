import { i18n } from '../utils/i18n.js';

/**
 * Reusable Engineering Traceability Metadata block.
 */
export class EngineeringMetaCard {
  /**
   * Renders the trust/traceability metadata block.
   * 
   * @param {Object} params - Metadata parameters
   * @param {string} params.source - Source document
   * @param {string} params.revisionDate - Revision or publish date
   * @param {string} params.lastUpdated - Date of verification
   * @param {string} params.confidenceLevel - High, Medium, or Reference Only
   * @param {string} lang - Active language ('en' | 'ru')
   * @returns {string} HTML string
   */
  static render({ source, revisionDate, lastUpdated, confidenceLevel }, lang) {
    const t = (key) => i18n.t(key);
    
    // Default fallback
    const confidence = (confidenceLevel || 'Reference Only').toLowerCase();
    
    let badgeClass = '';
    let confidenceLabel = '';

    if (confidence.includes('high')) {
      badgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30';
      confidenceLabel = t('confidence_high');
    } else if (confidence.includes('medium')) {
      badgeClass = 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30';
      confidenceLabel = t('confidence_medium');
    } else {
      badgeClass = 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-750';
      confidenceLabel = t('confidence_reference');
    }

    return `
      <div class="mt-4 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-900/20 font-sans text-xs space-y-3 shadow-sm select-none">
        <div class="flex items-center justify-between">
          <span class="text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest">${t('confidence_title')}</span>
          <span class="px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider font-mono ${badgeClass}">${confidenceLabel}</span>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400 text-[10.5px]">
          <div>
            <span class="block text-[8.5px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest mb-0.5">${t('columns.source')}</span>
            <span class="font-medium">${source || '—'}</span>
          </div>
          <div>
            <span class="block text-[8.5px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-widest mb-0.5">${t('columns.revision')}</span>
            <span class="font-mono">${revisionDate || '—'}</span>
          </div>
          <div>
            <span class="block text-[8.5px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-widest mb-0.5">${t('columns.verified_at')}</span>
            <span class="font-mono">${lastUpdated || '—'}</span>
          </div>
        </div>
      </div>
    `;
  }
}

export default EngineeringMetaCard;
