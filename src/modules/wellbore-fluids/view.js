import { BaseView } from '../ModuleFactory.js';
import { store } from '../../core/State.js';
import { i18n } from '../../utils/i18n.js';
import { searchMockDb } from '../../utils/search.js';
import { mockDb } from '../../database/mockDb.js';
import table from './table.js';
import details from './details.js';

// Selected ID caching for wellbore-fluids
const selectedRecordIds = {};

export class WellboreFluidsView extends BaseView {
  constructor() {
    super('wellbore-fluids', 'wellbore_fluids', table, details);
    this.activeCategory = 'all'; // 'all' | 'drilling_mud' | 'cement_slurry' | 'spacer' | 'additive'
  }

  render(containerId, searchQuery = '') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const { lang } = store.getState();
    const isRu = lang === 'ru';

    // 1. Fetch and search all raw records
    let records = searchMockDb(mockDb, 'wellbore_fluids', searchQuery);

    // 2. Filter records by active category
    if (this.activeCategory !== 'all') {
      records = records.filter(rec => rec.category === this.activeCategory);
    }

    // 3. Keep selected record in memory
    if (window.selectedRecordForced && window.selectedRecordForced.module === this.moduleType) {
      selectedRecordIds[this.moduleType] = window.selectedRecordForced.id;
      window.selectedRecordForced = null;
    }

    if (records.length > 0) {
      if (!selectedRecordIds[this.moduleType] || !records.some(r => r.id === selectedRecordIds[this.moduleType])) {
        selectedRecordIds[this.moduleType] = records[0].id;
      }
    }

    const selectedId = selectedRecordIds[this.moduleType];
    const selectedRec = records.find(r => r.id === selectedId);

    if (selectedRec) {
      setTimeout(() => {
        store.trackRecordView(selectedRec.id, this.moduleType);
      }, 0);
    }

    // Category buttons HTML
    const categories = [
      { id: 'all', en: 'All Fluids', ru: 'Все жидкости' },
      { id: 'drilling_mud', en: 'Drilling Muds', ru: 'Буровые растворы' },
      { id: 'cement_slurry', en: 'Cement Slurries', ru: 'Тампонажные растворы' },
      { id: 'spacer', en: 'Spacers', ru: 'Буферные жидкости' },
      { id: 'additive', en: 'Additives', ru: 'Реагенты и добавки' }
    ];

    const categoryButtonsHtml = categories.map(cat => {
      const isActive = this.activeCategory === cat.id;
      const activeClass = isActive
        ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm font-semibold'
        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-650 dark:bg-zinc-850 dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-750/80';
      return `
        <button id="fluid-cat-${cat.id}" class="px-3 py-1.5 rounded-lg text-[10px] font-sans font-medium transition-all uppercase tracking-wider cursor-pointer ${activeClass}">
          ${isRu ? cat.ru : cat.en}
        </button>
      `;
    }).join('');

    const tableHtml = this.tableComponent.render(records, selectedId, lang);
    const detailsHtml = selectedRec ? this.detailsComponent.render(selectedRec, lang, this.moduleType) : '';

    container.innerHTML = `
      <div class="flex flex-col gap-4 h-full font-sans">
        <!-- Category selector -->
        <div class="flex flex-wrap gap-2 pb-1 shrink-0">
          ${categoryButtonsHtml}
        </div>

        <!-- Split Layout -->
        <div class="flex flex-col lg:flex-row gap-5 h-full items-start">
          <div class="w-full lg:w-1/2 shrink-0">
            ${tableHtml}
          </div>
          <div class="flex-grow w-full">
            ${detailsHtml}
          </div>
        </div>
      </div>
    `;

    // Bind category button clicks
    categories.forEach(cat => {
      const btn = document.getElementById(`fluid-cat-${cat.id}`);
      if (btn) {
        btn.onclick = () => {
          this.activeCategory = cat.id;
          this.render(containerId, searchQuery);
        };
      }
    });

    // Bind table row clicks
    const rows = container.querySelectorAll('tr[data-record-id]');
    rows.forEach(row => {
      row.onclick = () => {
        const id = row.getAttribute('data-record-id');
        selectedRecordIds[this.moduleType] = id;
        this.render(containerId, searchQuery);
      };
    });
  }
}

export const view = new WellboreFluidsView();
export default view;
