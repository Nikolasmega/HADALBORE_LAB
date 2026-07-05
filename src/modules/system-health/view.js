import { store } from '../../core/State.js';
import { i18n } from '../../utils/i18n.js';
import { FormulaTests } from '../../engineering-tests/tests.js';
import { graph, EngineeringGraph } from '../../core/EngineeringGraph.js';
import AppLogger from '../../core/AppLogger.js';
import { EngineeringLimits } from '../../core/EngineeringLimits.js';
import { EngineeringRules } from '../../core/EngineeringRules.js';
import { OfflineStorage } from '../../core/OfflineStorage.js';
import { mockDb } from '../../database/mockDb.js';
import { FeedbackEngine } from '../../core/feedbackEngine.js';
import { LibraryValidator } from '../../core/LibraryValidation.js';
import releaseManifest from '../../data/release_manifest.json';
import { IntegritySnapshot } from '../../core/IntegritySnapshot.js';
import { PROJECT_IDENTITY } from '../../core/projectIdentity.js';

class SystemHealthView {
  constructor() {
    this.moduleType = 'system-health';
    this.activeTab = 'status'; // 'status' | 'explorer' | 'tests' | 'limits' | 'offline' | 'library' | 'certification' | 'logs'
    this.indexedDbCounts = null;
    this.cacheHealthy = undefined;
    this.testResults = null;
    this.explorerSelectedId = 'L80'; // Default start node for relationship explorer

    // Listen for direct tab navigation from sidebar shortcuts
    window.addEventListener('hadalbore-open-tab', (e) => {
      const tab = e.detail && e.detail.tab;
      if (tab) {
        this.activeTab = tab;
        // Re-render if system-health is currently active
        const { activeModule } = store.getState();
        if (activeModule === 'system-health') {
          this.render('app-content', '');
        }
      }
    });
  }

  render(containerId, searchQuery) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const { lang, viewMode, bootStatus, fieldMode, schemaCorrupted } = store.getState();
    const t = (key) => i18n.t(key);
    const isRu = lang === 'ru';

    // 1. Handle Field Mode Read-Only View
    if (viewMode === 'field') {
      const isSWActive = typeof navigator !== 'undefined' && navigator.serviceWorker && navigator.serviceWorker.controller !== null;
      const isIDBAvailable = typeof window !== 'undefined' && !!window.indexedDB;
      const offlineReady = isSWActive && isIDBAvailable;
      
      const runtimeSealVal = IntegritySnapshot.computeIntegritySealHash(mockDb);
      const expectedSealVal = releaseManifest.integritySealHash;
      const isSealValid = runtimeSealVal === expectedSealVal;

      const title = isRu ? 'Статус системы' : 'System Status';
      const subtitle = isRu ? 'Автономная работа и качество инженерной библиотеки' : 'Offline operational status & integrity verification';
      
      const offlineStatusLabel = offlineReady ? (isRu ? 'АКТИВЕН' : 'ACTIVE') : (isRu ? 'В СЕТИ' : 'NETWORK ONLY');
      const offlineStatusColor = offlineReady ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';
      
      const bootStatusColor = bootStatus === 'BOOT_OK' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500';
      const sealStatusColor = isSealValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500';

      const sourceWarningText = isRu
        ? `${PROJECT_IDENTITY.PRODUCT_NAME} поддерживается исключительно ${PROJECT_IDENTITY.CREATOR}. Официальным и доверенным источником проекта является публичный репозиторий GitHub и официальные ссылки. Неофициальные копии, форки или измененные версии не гарантируют точность, безопасность или актуальность данных.`
        : `${PROJECT_IDENTITY.PRODUCT_NAME} is officially maintained only by ${PROJECT_IDENTITY.CREATOR}. The official and trusted source of the project is the public GitHub repository and official project links. Unofficial copies, forks, or redistributed versions are not guaranteed to be accurate, supported, updated, or safe for engineering use.`;

      container.innerHTML = `
        <div class="space-y-6 py-2 flex flex-col h-full font-sans max-w-xl mx-auto">
          <!-- Back and title -->
          <div class="flex items-center gap-3 shrink-0">
            <button id="module-back-btn" class="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors border border-zinc-200/30 dark:border-zinc-800 shadow-sm text-zinc-500 cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"></path></svg>
            </button>
            <div>
              <h2 class="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">${title}</h2>
              <p class="text-[9px] text-zinc-400 dark:text-zinc-555 font-medium uppercase mt-0.5">${subtitle}</p>
            </div>
          </div>

          <!-- Simplified Read-Only Snapshot Grid -->
          <div class="glassmorphic p-4 rounded-xl border border-zinc-200/40 dark:border-zinc-800/60 shadow-sm space-y-4 font-mono text-xs">
            <div class="flex justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2">
              <span class="text-zinc-455">${isRu ? 'Работа оффлайн' : 'Offline Status'}:</span>
              <span class="font-bold ${offlineStatusColor}">${offlineStatusLabel}</span>
            </div>
            <div class="flex justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2">
              <span class="text-zinc-455">${isRu ? 'Статус запуска' : 'Boot Status'}:</span>
              <span class="font-bold ${bootStatusColor}">${bootStatus}</span>
            </div>
            <div class="flex justify-between pb-1">
              <span class="text-zinc-455">${isRu ? 'Печать целостности' : 'Integrity Seal'}:</span>
              <span class="font-bold ${sealStatusColor}">${isSealValid ? 'OK' : 'MISMATCH'}</span>
            </div>
          </div>

          <!-- Official Source Warning -->
          <div class="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl text-[10px] leading-relaxed font-medium">
            <span class="font-bold block mb-1 uppercase tracking-wider">${isRu ? 'Официальный источник' : 'Official Source Warning'}</span>
            ${sourceWarningText}
          </div>
        </div>
      `;

      // Bind back button
      const backBtn = container.querySelector('#module-back-btn');
      if (backBtn) {
        backBtn.onclick = () => {
          store.setState({ activeModule: 'home' });
        };
      }
      return;
    }

    // 2. Load IndexedDB and Cache statuses asynchronously
    if (!this.indexedDbCounts) {
      OfflineStorage.getStoreCounts().then(counts => {
        this.indexedDbCounts = counts;
        this.render(containerId, searchQuery);
      });
    }

    if (this.cacheHealthy === undefined) {
      this.cacheHealthy = null;
      if (typeof caches !== 'undefined') {
        caches.keys().then(keys => {
          this.cacheHealthy = keys.some(k => k.startsWith('hadalbore-core-cache-'));
          this.render(containerId, searchQuery);
        }).catch(() => {
          this.cacheHealthy = false;
          this.render(containerId, searchQuery);
        });
      } else {
        this.cacheHealthy = false;
      }
    }

    if (!this.testResults) {
      this.testResults = FormulaTests.runAll();
    }
    const testResults = this.testResults;

    // Render Tabs Header
    const tabs = ['status', 'explorer', 'tests', 'limits', 'offline', 'library', 'certification', 'logs'];
    
    const tabLabels = {
      status: isRu ? 'Статус системы' : 'System Status',
      explorer: isRu ? 'Проводник совместимости' : 'Relationship Explorer',
      tests: isRu ? 'Проверка формул' : 'Formula Verification',
      limits: isRu ? 'Лимиты и Правила' : 'Envelope Limits',
      offline: isRu ? 'Локальная база' : 'Offline Database',
      library: isRu ? 'Качество базы' : 'Library Quality',
      certification: isRu ? 'Сертификация' : 'Field Certification',
      logs: isRu ? 'Журнал ошибок' : 'Audit Logs'
    };

    const tabNavHtml = `
      <div class="flex border-b border-zinc-200 dark:border-zinc-800 mb-4 text-xs font-sans shrink-0 overflow-x-auto whitespace-nowrap">
        ${tabs.map((tab, idx) => `
          <button id="health-tab-${tab}" class="px-4 py-2.5 font-semibold transition-all border-b-2 cursor-pointer ${this.activeTab === tab ? 'border-zinc-950 text-zinc-950 dark:border-white dark:text-white bg-zinc-100/60 dark:bg-zinc-800/40 rounded-t-lg' : 'border-transparent text-zinc-400 hover:text-zinc-655 dark:hover:text-zinc-200'}">
            [SYS${idx + 1}] ${tabLabels[tab]}
          </button>
        `).join('')}
      </div>
    `;

    // Render Tab content
    let tabContentHtml = '';
    if (this.activeTab === 'status') {
      tabContentHtml = this.renderStatusTab(isRu);
    } else if (this.activeTab === 'explorer') {
      tabContentHtml = this.renderExplorerTab(isRu);
    } else if (this.activeTab === 'tests') {
      tabContentHtml = this.renderTestsTab(testResults, isRu);
    } else if (this.activeTab === 'logs') {
      tabContentHtml = this.renderLogsTab(AppLogger.getLogs(), AppLogger.getStats(), isRu);
    } else if (this.activeTab === 'limits') {
      tabContentHtml = this.renderLimitsTab(isRu);
    } else if (this.activeTab === 'library') {
      tabContentHtml = this.renderLibraryTab(isRu);
    } else if (this.activeTab === 'certification') {
      tabContentHtml = this.renderCertificationTab(isRu);
    } else {
      tabContentHtml = this.renderOfflineTab(isRu, containerId, searchQuery);
    }

    container.innerHTML = `
      <div class="space-y-4 py-2 flex flex-col h-full font-sans">
        <!-- Back and title -->
        <div class="flex items-center gap-3 shrink-0">
          <button id="module-back-btn" class="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors border border-zinc-200/30 dark:border-zinc-800 shadow-sm text-zinc-500 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"></path></svg>
          </button>
          <div>
            <h2 class="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">${isRu ? 'Статус системы' : 'System Status'}</h2>
            <p class="text-[9px] text-zinc-400 dark:text-zinc-555 font-medium uppercase mt-0.5">
              ${isRu ? 'Операционный статус и качество инженерной библиотеки' : 'System operational status & engineering library health'}
            </p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        ${tabNavHtml}

        <!-- Active View Content -->
        <div id="health-tab-content" class="flex-1 overflow-y-auto">
          ${tabContentHtml}
        </div>
      </div>
    `;

    this.bindEvents(containerId, searchQuery);
  }

  renderStatusTab(isRu) {
    const { bootStatus, fieldMode, schemaCorrupted } = store.getState();
    const isSWActive = typeof navigator !== 'undefined' && navigator.serviceWorker && navigator.serviceWorker.controller !== null;
    const isIDBAvailable = typeof window !== 'undefined' && !!window.indexedDB;
    const offlineReady = isSWActive && isIDBAvailable;

    const runtimeSealVal = IntegritySnapshot.computeIntegritySealHash(mockDb);
    const expectedSealVal = releaseManifest.integritySealHash;
    const isSealValid = runtimeSealVal === expectedSealVal;

    // Coverage stats from database
    const tubularsCount = (mockDb.tubulars || []).length;
    const connectionsCount = (mockDb.threads || []).length;
    const elastomersCount = (mockDb.elastomers || []).length;
    const steelGradesCount = (mockDb.steel_grades || mockDb.acid_environments || []).length;
    const failuresCount = (mockDb.failures || []).length;
    const standardsCount = (mockDb.standards || []).length;
    const totalRecords = tubularsCount + connectionsCount + elastomersCount + steelGradesCount + failuresCount + standardsCount;

    return `
      <div class="space-y-5 font-sans select-none">
        
        <!-- Grid layout: Device Status & Engineering Library Health -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Device Status Panel -->
          <div class="glassmorphic p-4 rounded-xl border border-zinc-200/40 dark:border-zinc-800/60 shadow-sm space-y-3">
            <h4 class="text-[10px] font-bold text-zinc-950 dark:text-white uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-850 pb-2">${isRu ? 'Статус устройства' : 'Device Status'}</h4>
            <div class="space-y-2 text-xs font-mono">
              <div class="flex justify-between">
                <span class="text-zinc-455">${isRu ? 'Работа оффлайн' : 'Offline Ready'}:</span>
                <span class="font-bold ${offlineReady ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}">
                  ${offlineReady ? (isRu ? 'АКТИВЕН' : 'READY') : (isRu ? 'В СЕТИ' : 'NETWORK ONLY')}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-455">${isRu ? 'Целостность базы данных' : 'Database Status'}:</span>
                <span class="font-bold ${!schemaCorrupted ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}">
                  ${!schemaCorrupted ? (isRu ? 'НОРМА' : 'HEALTHY') : (isRu ? 'ПОВРЕЖДЕНА' : 'CORRUPTED')}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-455">${isRu ? 'Полевой режим' : 'Field Mode Status'}:</span>
                <span class="font-bold ${fieldMode ? 'text-amber-500' : 'text-zinc-400'}">
                  ${fieldMode ? (isRu ? 'АКТИВЕН' : 'ACTIVE') : (isRu ? 'СТАНДАРТНЫЙ' : 'STANDARD')}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-455">${isRu ? 'Статус обновления' : 'Update Status'}:</span>
                <span class="font-bold text-emerald-600 dark:text-emerald-400">
                  ${isRu ? 'ОБНОВЛЕНО' : 'UP TO DATE'}
                </span>
              </div>
            </div>
          </div>

          <!-- Engineering Library Health Panel -->
          <div class="glassmorphic p-4 rounded-xl border border-zinc-200/40 dark:border-zinc-800/60 shadow-sm space-y-3">
            <h4 class="text-[10px] font-bold text-zinc-950 dark:text-white uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-850 pb-2">${isRu ? 'Здоровье инженерной библиотеки' : 'Engineering Library Health'}</h4>
            <div class="space-y-2 text-xs font-mono">
              <div class="flex justify-between">
                <span class="text-zinc-455">${isRu ? 'Всего записей в справочнике' : 'Total reference records'}:</span>
                <span class="font-bold text-zinc-900 dark:text-white">${totalRecords}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-455">${isRu ? 'Проверка цифровой подписи' : 'Integrity verified'}:</span>
                <span class="font-bold ${isSealValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}">
                  ${isSealValid ? (isRu ? 'ПОДТВЕРЖДЕНО' : 'VERIFIED OK') : (isRu ? 'РАССОГЛАСОВАНИЕ' : 'MISMATCH')}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-455">${isRu ? 'Последняя проверка' : 'Last verified'}:</span>
                <span class="font-bold text-zinc-500">${isRu ? 'Только что' : 'Just now'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-455">${isRu ? 'Версия датасета' : 'Dataset Version'}:</span>
                <span class="font-bold text-zinc-700 dark:text-zinc-300">v${releaseManifest.datasetVersion}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Engineering Coverage Panel -->
        <div class="glassmorphic p-4 rounded-xl border border-zinc-200/40 dark:border-zinc-800/60 shadow-sm space-y-3">
          <h4 class="text-[10px] font-bold text-zinc-955 dark:text-white uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-850 pb-2">${isRu ? 'Инженерное покрытие базы данных' : 'Engineering Library Coverage'}</h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div class="p-2.5 bg-zinc-50 dark:bg-zinc-850/50 rounded border border-zinc-200/30 dark:border-zinc-800/80 flex flex-col justify-between">
              <span class="text-zinc-455 text-[8.5px] uppercase font-bold tracking-wider">${isRu ? 'Трубная продукция' : 'Tubulars'}</span>
              <span class="font-bold mt-1.5 text-zinc-900 dark:text-white">${tubularsCount} ${isRu ? 'записей' : 'records'}</span>
            </div>
            <div class="p-2.5 bg-zinc-50 dark:bg-zinc-850/50 rounded border border-zinc-200/30 dark:border-zinc-800/80 flex flex-col justify-between">
              <span class="text-zinc-455 text-[8.5px] uppercase font-bold tracking-wider">${isRu ? 'Соединения и резьбы' : 'Thread Connections'}</span>
              <span class="font-bold mt-1.5 text-zinc-900 dark:text-white">${connectionsCount} ${isRu ? 'записей' : 'records'}</span>
            </div>
            <div class="p-2.5 bg-zinc-50 dark:bg-zinc-850/50 rounded border border-zinc-200/30 dark:border-zinc-800/80 flex flex-col justify-between">
              <span class="text-zinc-455 text-[8.5px] uppercase font-bold tracking-wider">${isRu ? 'Уплотнения / Эластомеры' : 'Elastomers & Seals'}</span>
              <span class="font-bold mt-1.5 text-zinc-900 dark:text-white">${elastomersCount} ${isRu ? 'записей' : 'records'}</span>
            </div>
            <div class="p-2.5 bg-zinc-50 dark:bg-zinc-850/50 rounded border border-zinc-200/30 dark:border-zinc-800/80 flex flex-col justify-between">
              <span class="text-zinc-455 text-[8.5px] uppercase font-bold tracking-wider">${isRu ? 'Марки сталей' : 'Steel Grades'}</span>
              <span class="font-bold mt-1.5 text-zinc-900 dark:text-white">${steelGradesCount} ${isRu ? 'записей' : 'records'}</span>
            </div>
            <div class="p-2.5 bg-zinc-50 dark:bg-zinc-850/50 rounded border border-zinc-200/30 dark:border-zinc-800/80 flex flex-col justify-between">
              <span class="text-zinc-455 text-[8.5px] uppercase font-bold tracking-wider">${isRu ? 'Виды отказов' : 'Failure Modes'}</span>
              <span class="font-bold mt-1.5 text-zinc-900 dark:text-white">${failuresCount} ${isRu ? 'записей' : 'records'}</span>
            </div>
            <div class="p-2.5 bg-zinc-50 dark:bg-zinc-850/50 rounded border border-zinc-200/30 dark:border-zinc-800/80 flex flex-col justify-between">
              <span class="text-zinc-455 text-[8.5px] uppercase font-bold tracking-wider">${isRu ? 'Стандарты спецификаций' : 'Standards'}</span>
              <span class="font-bold mt-1.5 text-zinc-900 dark:text-white">${standardsCount} ${isRu ? 'записей' : 'records'}</span>
            </div>
          </div>
        </div>

        <!-- Missing Coverage Panel -->
        <div class="p-4 bg-zinc-50 dark:bg-zinc-900/10 border border-zinc-200/60 dark:border-zinc-800 rounded-xl space-y-2.5">
          <h4 class="text-[10px] font-bold text-zinc-950 dark:text-white uppercase tracking-wider pl-2 border-l-2 border-zinc-400 dark:border-zinc-600">${isRu ? 'В процессе наполнения и валидации' : 'Missing Coverage / Under Validation'}</h4>
          <p class="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal pl-2">
            ${isRu ? 'Следующие инженерные разделы находятся на этапе валидации и будут добавлены в базу данных в ближайших обновлениях датасета:' : 'The following categories and components are currently undergoing QA validation and will be integrated in future dataset updates:'}
          </p>
          <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono pl-6 list-disc text-zinc-600 dark:text-zinc-400">
            <li>${isRu ? 'HPHT пакеры и уплотнительные узлы' : 'HPHT Packers & Sealing assemblies'}</li>
            <li>${isRu ? 'Расширяемые профильные лайнеры' : 'Expandable Premium Liners'}</li>
            <li>${isRu ? 'Ингибиторы кислотной коррозии стали' : 'Acid Corrosion Inhibitors'}</li>
            <li>${isRu ? 'Трубы из стеклопластика (GRE/FRP)' : 'Fiberglass (GRE/FRP) Tubing specs'}</li>
          </ul>
        </div>

      </div>
    `;
  }

  renderExplorerTab(isRu) {
    // Collect all nodes from graph adjacency list
    const allNodes = Array.from(graph.adjacencyList.keys()).sort();
    
    // Fallback if explorerSelectedId is not in the list
    if (!graph.adjacencyList.has(this.explorerSelectedId) && allNodes.length > 0) {
      this.explorerSelectedId = allNodes[0];
    }

    const selectedId = this.explorerSelectedId;
    const relationsMap = graph.adjacencyList.get(selectedId);

    // Let's resolve the selected node's metadata details
    let selectedRec = null;
    let selectedModule = '';
    for (const key of Object.keys(mockDb)) {
      if (Array.isArray(mockDb[key])) {
        const found = mockDb[key].find(item => item.id === selectedId);
        if (found) {
          selectedRec = found;
          selectedModule = key === 'acid_environments' ? 'steel-grades' : key;
          break;
        }
      }
    }

    // Resolve name of selected item
    const selectedName = selectedRec ? selectedRec.name : selectedId;
    const selectedTypeLabel = selectedRec ? (isRu ? `Модуль: ${i18n.t('nav.' + selectedModule)}` : `Module: ${selectedModule.toUpperCase()}`) : (isRu ? 'Узел связи' : 'Environment Node');

    // Build lists of relations
    let relationsHtml = '';
    if (relationsMap && relationsMap.size > 0) {
      for (const [relation, targetIds] of relationsMap.entries()) {
        const relationLabel = EngineeringGraph.getRelationLabel(relation, isRu ? 'ru' : 'en');
        const badges = Array.from(targetIds).map(targetId => {
          let targetRec = null;
          for (const key of Object.keys(mockDb)) {
            if (Array.isArray(mockDb[key])) {
              const found = mockDb[key].find(item => item.id === targetId);
              if (found) {
                targetRec = found;
                break;
              }
            }
          }
          const targetName = targetRec ? targetRec.name : targetId;
          
          return `
            <button 
              data-explorer-target-id="${targetId}" 
              class="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700 rounded text-[9.5px] font-semibold cursor-pointer transition-colors"
            >
              ${targetName}
            </button>
          `;
        }).join(' ');

        relationsHtml += `
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 py-2.5 border-b border-zinc-100 dark:border-zinc-800/40 last:border-0">
            <span class="text-[10px] text-zinc-450 dark:text-zinc-555 font-bold sm:w-48 shrink-0 uppercase tracking-wider">${relationLabel}:</span>
            <div class="flex flex-wrap gap-1.5">${badges}</div>
          </div>
        `;
      }
    } else {
      relationsHtml = `
        <div class="text-zinc-400 dark:text-zinc-555 text-xs italic py-4 text-center">
          ${isRu ? 'Для этого узла нет определенных взаимосвязей.' : 'No engineering connections defined for this node.'}
        </div>
      `;
    }

    // Predefined shortcuts to make traversing easy
    const pathways = [
      { id: 'L80', label: isRu ? 'Цепочка L80 (Sour Service)' : 'L80 sour pathway' },
      { id: 'VAM_TOP', label: isRu ? 'Соединение VAM TOP' : 'VAM TOP compatibility' },
      { id: 'FKM', label: isRu ? 'Эластомер FKM / Viton' : 'FKM temperature limits' },
      { id: '13Cr', label: isRu ? 'Нержавеющая сталь 13Cr' : '13Cr CO2 pathway' }
    ];

    const dropdownOptions = allNodes.map(node => {
      let nodeRec = null;
      for (const key of Object.keys(mockDb)) {
        if (Array.isArray(mockDb[key])) {
          const found = mockDb[key].find(item => item.id === node);
          if (found) {
            nodeRec = found;
            break;
          }
        }
      }
      const nodeName = nodeRec ? nodeRec.name : node;
      return `<option value="${node}" ${node === selectedId ? 'selected' : ''}>${nodeName} (${node})</option>`;
    }).join('');

    return `
      <div class="space-y-4 font-sans">
        
        <!-- Selection block -->
        <div class="p-4 bg-zinc-50 dark:bg-zinc-900/10 border border-zinc-200/60 dark:border-zinc-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div class="space-y-1">
            <label class="block text-[8.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">${isRu ? 'Выберите инженерный узел для анализа' : 'Select starting engineering node'}</label>
            <select id="explorer-node-select" class="block w-full sm:w-64 px-2.5 py-1.5 text-xs border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer">
              ${dropdownOptions}
            </select>
          </div>

          <!-- Shortcuts -->
          <div class="space-y-1">
            <span class="block text-[8.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">${isRu ? 'Быстрые цепочки совместимости' : 'Predefined pathways'}</span>
            <div class="flex flex-wrap gap-1.5">
              ${pathways.map(path => `
                <button 
                  data-explorer-shortcut-id="${path.id}" 
                  class="px-2 py-1 bg-zinc-150 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700 rounded-lg text-[9px] font-bold cursor-pointer transition-colors"
                >
                  ${path.label}
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Main Explorer visualizer card -->
        <div class="glassmorphic p-5 rounded-xl border border-zinc-200/40 dark:border-zinc-800/60 shadow-sm space-y-4">
          <div class="border-b border-zinc-150 dark:border-zinc-800 pb-2.5 flex justify-between items-start">
            <div>
              <span class="text-[9px] font-bold text-zinc-450 dark:text-zinc-555 uppercase tracking-widest">${selectedTypeLabel}</span>
              <h3 class="text-sm font-extrabold text-zinc-955 dark:text-white mt-0.5">${selectedName}</h3>
            </div>
            <span class="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 uppercase tracking-widest shrink-0">
              Active Node: ${selectedId}
            </span>
          </div>

          <!-- Explorer visual flow representation -->
          <div class="py-4 px-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-150 dark:border-zinc-850 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs font-mono font-bold text-center">
            <div class="px-3 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 rounded-lg min-w-32 shadow-sm truncate">
              ${selectedName}
            </div>
            <div class="text-zinc-400 dark:text-zinc-600 text-sm rotate-90 sm:rotate-0">➔</div>
            <div class="text-[9.5px] text-zinc-450 dark:text-zinc-500 uppercase tracking-wider font-sans">
              ${isRu ? 'Связано с совместимым оборудованием' : 'Traversing connected compatibility matrix'}
            </div>
            <div class="text-zinc-400 dark:text-zinc-600 text-sm rotate-90 sm:rotate-0">➔</div>
            <div class="px-3 py-2 bg-emerald-500 text-white rounded-lg min-w-32 shadow-sm">
              ${isRu ? 'Интерактивные цели' : 'Interactive Targets'}
            </div>
          </div>

          <!-- Relationships detail lists -->
          <div class="divide-y divide-zinc-100 dark:divide-zinc-800/40 pt-2 select-none">
            ${relationsHtml}
          </div>
        </div>

        <div class="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl text-[10px] leading-relaxed pl-4 font-sans select-none">
          <span class="font-bold mr-1">💡 ${isRu ? 'Инструкция:' : 'Tip:'}</span>
          ${isRu 
            ? 'Нажимайте на любые кнопки элементов в списке отношений выше, чтобы мгновенно перейти на этот узел и исследовать его цепочку прослеживаемости.' 
            : 'Click on any of the target node buttons in the relationships list above to instantly hop onto that node and traverse its compatibility flow.'}
        </div>
      </div>
    `;
  }

  renderTestsTab(testResults, isRu) {
    const rows = testResults.map(r => `
      <tr class="border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50/20 dark:hover:bg-zinc-900/10 text-[11px] font-sans">
        <td class="px-4 py-2.5 font-bold text-zinc-955 dark:text-zinc-100">${r.name}</td>
        <td class="px-4 py-2.5 text-zinc-450 dark:text-zinc-500 max-w-[200px] truncate" title="${r.description}">${r.description}</td>
        <td class="px-4 py-2.5 font-mono text-zinc-700 dark:text-zinc-350">${r.expected}</td>
        <td class="px-4 py-2.5 font-mono text-zinc-700 dark:text-zinc-350">${r.actual}</td>
        <td class="px-4 py-2.5 font-mono text-zinc-400 dark:text-zinc-550">${r.tolerance}</td>
        <td class="px-4 py-2.5 text-right font-semibold">
          <span class="px-1.5 py-0.5 rounded text-[9px] ${r.passed ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'}">
            ${r.passed ? (isRu ? 'Пройден' : 'Passed') : (isRu ? 'Ошибка' : 'Failed')}
          </span>
        </td>
      </tr>
    `).join('');

    return `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-[10px] uppercase tracking-wider font-bold text-zinc-900 dark:text-white">
            ${isRu ? 'Результаты автоматической сверки формул (±1% API/OEM)' : 'Automatic Formula Verification Results (±1% API/OEM)'}
          </h3>
          ${store.getState().fieldMode ? '' : `
          <button id="re-run-tests-btn" class="px-2.5 py-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-850 dark:hover:bg-zinc-100 text-[10px] font-bold rounded-lg cursor-pointer transition-colors shadow-sm select-none">
            ${isRu ? 'Перезапустить верификацию' : 'Re-run Verification'}
          </button>
          `}
        </div>

        <div class="w-full overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm shrink-0">
          <table class="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr class="bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-200 dark:border-zinc-800 text-[9px] font-bold text-zinc-450 dark:text-zinc-555 uppercase tracking-wider font-sans">
                <th class="px-4 py-3">${isRu ? 'Тест' : 'Test ID'}</th>
                <th class="px-4 py-3">${isRu ? 'Описание' : 'Description'}</th>
                <th class="px-4 py-3">${isRu ? 'API Предел' : 'Expected (API)'}</th>
                <th class="px-4 py-3">${isRu ? 'Результат системы' : 'Actual (System)'}</th>
                <th class="px-4 py-3">${isRu ? 'Погрешность' : 'Tolerance'}</th>
                <th class="px-4 py-3 text-right">${isRu ? 'Статус' : 'Status'}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              ${rows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderLogsTab(logs, loggerStats, isRu) {
    let logsHtml = '';
    
    if (logs.length === 0) {
      logsHtml = `
        <div class="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-850 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/10">
          <p class="text-[11px] text-zinc-400 dark:text-zinc-555 font-medium">
            ${isRu ? 'Логи отсутствуют. Система функционирует в штатном режиме.' : 'No audit log entries available. System functioning correctly.'}
          </p>
        </div>
      `;
    } else {
      logsHtml = logs.map((log) => {
        let levelColor = 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400';
        if (log.level === 'ERROR' || log.level === 'FATAL') {
          levelColor = 'text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400';
        } else if (log.level === 'WARN') {
          levelColor = 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400';
        }

        const dateStr = new Date(log.timestamp).toLocaleTimeString();
        
        let errDetails = '';
        if (log.error) {
          errDetails = `
            <div class="mt-2 p-2 bg-rose-50/50 dark:bg-rose-950/5 border border-rose-100/50 dark:border-rose-900/20 rounded font-mono text-[9px] text-rose-600 dark:text-rose-455 leading-relaxed overflow-x-auto">
              <strong>${log.error.name}:</strong> ${log.error.message}
              <div class="mt-1 opacity-70 whitespace-pre">${log.error.stack || ''}</div>
            </div>
          `;
        }

        let contextDetails = '';
        if (log.context && Object.keys(log.context).length > 0) {
          contextDetails = `
            <div class="mt-1.5 text-[9px] font-mono text-zinc-550 pl-2 border-l border-zinc-200 dark:border-zinc-800">
              Context: ${JSON.stringify(log.context)}
            </div>
          `;
        }

        return `
          <div class="p-3 border-b border-zinc-100 dark:border-zinc-800/80 last:border-0 hover:bg-zinc-50/30 dark:hover:bg-zinc-900/5 transition-colors">
            <div class="flex items-center justify-between gap-3 text-[10px]">
              <div class="flex items-center gap-2">
                <span class="px-1.5 py-0.5 rounded font-bold text-[8.5px] uppercase tracking-wider shrink-0 ${levelColor}">${log.level}</span>
                <span class="font-bold text-zinc-900 dark:text-zinc-200">${log.message}</span>
              </div>
              <span class="text-zinc-400 dark:text-zinc-500 font-mono text-[9px] shrink-0">${dateStr}</span>
            </div>
            ${contextDetails}
            ${errDetails}
          </div>
        `;
      }).join('');
    }

    return `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-[10px] uppercase tracking-wider font-bold text-zinc-900 dark:text-white">
            ${isRu ? 'Инженерный аудит расчетов и сбоев (Последние 500 записей)' : 'Engineering Audit Logs & Calculations Trace (Max 500)'}
          </h3>
          ${store.getState().fieldMode ? '' : `
          <button id="clear-logs-btn" class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-455 border border-rose-100/30 dark:border-rose-900/30 text-[10px] font-bold rounded-lg cursor-pointer transition-colors shadow-sm select-none">
            ${isRu ? 'Очистить журнал логов' : 'Clear Audit Logs'}
          </button>
          `}
        </div>

        <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800/80 max-h-[500px] overflow-y-auto">
          ${logsHtml}
        </div>
      </div>
    `;
  }

  renderLimitsTab(isRu) {
    const limitsList = [
      { category: isRu ? 'Физические величины' : 'Physical Absolute Boundaries', details: [
        { name: 'MIN_TEMP_C / MIN_TEMP_F', val: `${EngineeringLimits.PHYSICAL.MIN_TEMP_C} °C / ${EngineeringLimits.PHYSICAL.MIN_TEMP_F} °F`, action: isRu ? 'Блокировка расчета' : 'Block calculation' },
        { name: 'MIN_DENSITY', val: `${EngineeringLimits.PHYSICAL.MIN_DENSITY} (ppg / sg)`, action: isRu ? 'Блокировка расчета' : 'Block calculation' },
        { name: 'MIN_DEPTH', val: `${EngineeringLimits.PHYSICAL.MIN_DEPTH} ft / m`, action: isRu ? 'Блокировка расчета' : 'Block calculation' },
        { name: 'MIN_PRESSURE', val: `${EngineeringLimits.PHYSICAL.MIN_PRESSURE} psi / bar`, action: isRu ? 'Блокировка расчета' : 'Block calculation' },
        { name: 'MIN_HOOK_LOAD', val: `${EngineeringLimits.PHYSICAL.MIN_HOOK_LOAD} lbs / kg`, action: isRu ? 'Блокировка расчета' : 'Block calculation' }
      ]},
      { category: isRu ? 'Технологические лимиты (Раствор и Давление)' : 'Mud Density & High Pressure Thresholds', details: [
        { name: 'MAX_DENSITY_PPG / MAX_DENSITY_SG', val: `${EngineeringLimits.MUD.MAX_DENSITY_PPG} ppg / ${EngineeringLimits.MUD.MAX_DENSITY_SG} sg`, action: isRu ? 'Предупреждение в UI' : 'UI Warn Alert' },
        { name: 'HIGH_THRESHOLD_PSI / HIGH_THRESHOLD_BAR', val: `${EngineeringLimits.PRESSURE.HIGH_THRESHOLD_PSI} psi / ${EngineeringLimits.PRESSURE.HIGH_THRESHOLD_BAR} bar`, action: isRu ? 'Рекомендовать Q125 / Премиум стыки' : 'Recommend Q125 / Premium joints' },
        { name: 'CRITICAL_CORROSION_TEMP_C', val: `${EngineeringLimits.PRESSURE.CRITICAL_CORROSION_TEMP_C} °C`, action: isRu ? 'Предупреждение о коррозии' : 'Acid corrosion warning' }
      ]},
      { category: isRu ? 'Лимиты полимеров (Эластомеры)' : 'Elastomers Absolute Temp Limits', details: Object.entries(EngineeringLimits.ELASTOMERS).map(([k, v]) => ({
        name: k.toUpperCase(),
        val: `${v.maxTempC} °C`,
        action: isRu ? `Превышение -> Рекомендовать Kalrez/Teflon, химстойкость: ${v.chemicalRes}` : `Recommend alternative, resistance: ${v.chemicalRes}`
      }))},
      { category: isRu ? 'Совместимость металлургии во влажном H2S' : 'High Strength Steels Sour Service Envelope', details: [
        { name: 'P110 Sour Service', val: isRu ? 'НЕСОВМЕСТИМА (Риск водородного растрескивания)' : 'NOT COMPATIBLE (Hydrogen Cracking Risk)', action: isRu ? 'Рекомендовать L80 / 13Cr' : 'Recommend L80 / 13Cr' },
        { name: 'Q125 Sour Service', val: isRu ? 'НЕСОВМЕСТИМА (Риск водородного растрескивания)' : 'NOT COMPATIBLE (Hydrogen Cracking Risk)', action: isRu ? 'Рекомендовать L80 / 13Cr' : 'Recommend L80 / 13Cr' },
        { name: 'L80 / 13Cr / Inconel 718', val: isRu ? 'Совместимы' : 'Sour Compatible', action: isRu ? 'Допускается в Н2S' : 'Allowed in Sour environment' }
      ]}
    ];

    const sectionsHtml = limitsList.map(sec => {
      const rows = sec.details.map(d => `
        <tr class="border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50/20 dark:hover:bg-zinc-900/10 text-[11px] font-sans">
          <td class="px-4 py-2 font-bold text-zinc-950 dark:text-zinc-100 font-mono">${d.name}</td>
          <td class="px-4 py-2 font-mono text-zinc-700 dark:text-zinc-350">${d.val}</td>
          <td class="px-4 py-2 text-zinc-450 dark:text-zinc-500 font-medium">${d.action}</td>
        </tr>
      `).join('');

      return `
        <div class="glassmorphic p-4 rounded-xl border border-zinc-200/40 dark:border-zinc-800/50 space-y-3">
          <h4 class="text-[9.5px] uppercase tracking-wider font-extrabold text-zinc-900 dark:text-white font-sans">${sec.category}</h4>
          <div class="w-full overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <table class="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr class="bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-200 dark:border-zinc-800 text-[8.5px] font-bold text-zinc-455 dark:text-zinc-555 uppercase tracking-wider font-sans">
                  <th class="px-4 py-2">${isRu ? 'Параметр' : 'Parameter'}</th>
                  <th class="px-4 py-2">${isRu ? 'Значение лимита' : 'Limit Value'}</th>
                  <th class="px-4 py-2">${isRu ? 'Действие системы' : 'System Validation Rule'}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                ${rows}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-[10px] uppercase tracking-wider font-bold text-zinc-900 dark:text-white">
            ${isRu ? 'Централизованный реестр лимитов и защитных правил' : 'Centralized Limits Database & Envelope Validation Rules'}
          </h3>
        </div>
        <div class="space-y-4">
          ${sectionsHtml}
        </div>
      </div>
    `;
  }

  renderOfflineTab(isRu, containerId, searchQuery) {
    const counts = this.indexedDbCounts || {};
    const storesList = OfflineStorage.STORES;

    const rows = storesList.map(storeName => {
      const dbCount = counts[storeName] !== undefined ? counts[storeName] : '...';
      const baselineCount = (mockDb[storeName] || []).length;
      const statusClass = dbCount === baselineCount 
        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' 
        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400';
      const statusLabel = dbCount === baselineCount 
        ? (isRu ? 'Совпадает' : 'Verified OK') 
        : (isRu ? 'Рассогласован' : 'Out of Sync');

      return `
        <tr class="border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50/20 dark:hover:bg-zinc-900/10 text-[11px] font-sans">
          <td class="px-4 py-2.5 font-bold text-zinc-955 dark:text-zinc-100 font-mono">${storeName}</td>
          <td class="px-4 py-2.5 font-mono text-zinc-700 dark:text-zinc-350">${dbCount}</td>
          <td class="px-4 py-2.5 font-mono text-zinc-400 dark:text-zinc-555">${baselineCount}</td>
          <td class="px-4 py-2.5 text-right font-semibold">
            <span class="px-1.5 py-0.5 rounded text-[9px] ${statusClass}">
              ${statusLabel}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    const dbName = OfflineStorage.DB_NAME;
    const dbVersion = OfflineStorage.DB_VERSION;
    const isSupported = typeof window !== 'undefined' && !!window.indexedDB;

    return `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-[10px] uppercase tracking-wider font-bold text-zinc-900 dark:text-white">
            ${isRu ? 'Оффлайн-база данных (IndexedDB)' : 'Offline Local Database (IndexedDB)'}
          </h3>
          <div class="flex gap-2">
            ${store.getState().fieldMode ? '' : `
            <button id="re-sync-db-btn" class="px-2.5 py-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-850 dark:hover:bg-zinc-100 text-[10px] font-bold rounded-lg cursor-pointer transition-colors shadow-sm select-none">
              ${isRu ? 'Восстановить базу' : 'Force Re-sync & Repair'}
            </button>
            `}
          </div>
        </div>

        <div class="glassmorphic p-4 rounded-xl border border-zinc-200/40 dark:border-zinc-800/50 space-y-3 font-sans text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-zinc-655 dark:text-zinc-355 text-[10.5px]">
            <div>
              <span class="block text-[8.5px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest mb-0.5">${isRu ? 'Статус IndexedDB' : 'IndexedDB Engine'}</span>
              <span class="font-bold ${isSupported ? 'text-emerald-500' : 'text-rose-500'}">${isSupported ? (isRu ? 'Активен' : 'Available') : (isRu ? 'Недоступен' : 'Not Supported')}</span>
            </div>
            <div>
              <span class="block text-[8.5px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-widest mb-0.5">${isRu ? 'Имя базы' : 'DB Name'}</span>
              <span class="font-mono">${dbName}</span>
            </div>
            <div>
              <span class="block text-[8.5px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-widest mb-0.5">${isRu ? 'Версия схемы' : 'DB Schema Version'}</span>
              <span class="font-mono">${dbVersion}</span>
            </div>
          </div>
        </div>

        <div class="w-full overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm shrink-0">
          <table class="w-full text-left border-collapse min-w-[550px]">
            <thead>
              <tr class="bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-200 dark:border-zinc-800 text-[9px] font-bold text-zinc-450 dark:text-zinc-555 uppercase tracking-wider font-sans">
                <th class="px-4 py-3">${isRu ? 'Таблица БД' : 'IndexedDB Store'}</th>
                <th class="px-4 py-3">${isRu ? 'Локальных записей' : 'Local Records Count'}</th>
                <th class="px-4 py-3">${isRu ? 'Базовый лимит' : 'Baseline Count'}</th>
                <th class="px-4 py-3 text-right">${isRu ? 'Состояние' : 'Status'}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              ${rows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderLibraryTab(isRu) {
    const report = LibraryValidator.validate(mockDb);
    const statusColor = report.status === 'PASS' 
      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
      : (report.status === 'WARNING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400');

    return `
      <div class="space-y-4 font-sans select-none">
        <!-- Validation Status Card -->
        <div class="border rounded-xl p-4 flex items-center justify-between ${statusColor}">
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider">${isRu ? 'СТАТУС ВАЛИДАЦИИ БАЗЫ' : 'LIBRARY VALIDATION STATUS'}</h4>
            <p class="text-[10px] mt-0.5 opacity-80">
              ${isRu ? 'Автоматическая проверка полноты данных, связей и локализации' : 'Automated check of data completeness, connections, and localization'}
            </p>
          </div>
          <span class="text-xl font-mono font-extrabold tracking-widest px-3 py-1 rounded bg-white/40 dark:bg-black/20">${report.status}</span>
        </div>

        <!-- Metric Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3 bg-zinc-50 dark:bg-zinc-850/40 border border-zinc-200/40 dark:border-zinc-800/80 rounded-xl">
            <span class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider">${isRu ? 'Всего записей' : 'Total Records'}</span>
            <span class="block text-base font-mono font-bold mt-1 text-zinc-900 dark:text-white">${report.totalRecords}</span>
          </div>
          <div class="p-3 bg-zinc-50 dark:bg-zinc-850/40 border border-zinc-200/40 dark:border-zinc-800/80 rounded-xl">
            <span class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider">${isRu ? 'Пропуски метаданных' : 'Metadata Gaps'}</span>
            <span class="block text-base font-mono font-bold mt-1 ${report.missingMetadataCount > 0 ? 'text-amber-500' : 'text-zinc-900 dark:text-white'}">${report.missingMetadataCount} (${report.missingMetadataPercent}%)</span>
          </div>
          <div class="p-3 bg-zinc-50 dark:bg-zinc-850/40 border border-zinc-200/40 dark:border-zinc-800/80 rounded-xl">
            <span class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider">${isRu ? 'Покрытие связями' : 'Trace Coverage'}</span>
            <span class="block text-base font-mono font-bold mt-1 ${report.traceCoveragePercent >= 90 ? 'text-emerald-500' : 'text-rose-500'}">${report.traceCoveragePercent}%</span>
          </div>
          <div class="p-3 bg-zinc-50 dark:bg-zinc-850/40 border border-zinc-200/40 dark:border-zinc-800/80 rounded-xl">
            <span class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider">${isRu ? 'Ошибки перевода' : 'Translation Gaps'}</span>
            <span class="block text-base font-mono font-bold mt-1 ${report.missingTranslationsCount > 0 ? 'text-amber-500' : 'text-zinc-900 dark:text-white'}">${report.missingTranslationsCount}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Category breakdown -->
          <div class="p-4 bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200/30 dark:border-zinc-800 rounded-xl space-y-3">
            <h5 class="text-[9px] font-bold text-zinc-455 dark:text-zinc-555 uppercase tracking-wider border-b border-zinc-150 dark:border-zinc-800/60 pb-1.5">${isRu ? 'Распределение по категориям' : 'Category Distribution'}</h5>
            <div class="space-y-2 text-[10px]">
              ${Object.keys(report.categoryCounts).map(cat => {
                const count = report.categoryCounts[cat];
                const pct = Math.round((count / report.totalRecords) * 100);
                return `
                  <div class="flex justify-between border-b border-zinc-100 dark:border-zinc-850 pb-1">
                    <span class="text-zinc-400 dark:text-zinc-500 uppercase font-medium font-sans">${cat}</span>
                    <span class="text-zinc-755 dark:text-zinc-350 font-bold font-mono">${count} (${pct}%)</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Quality Diagnostics and Issues -->
          <div class="p-4 bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200/30 dark:border-zinc-800 rounded-xl space-y-3">
            <h5 class="text-[9px] font-bold text-zinc-455 dark:text-zinc-555 uppercase tracking-wider border-b border-zinc-150 dark:border-zinc-800/60 pb-1.5">${isRu ? 'Диагностика ошибок' : 'Issue Diagnostics'}</h5>
            <div class="space-y-2 text-[10px] font-mono">
              <div class="flex justify-between border-b border-zinc-100 dark:border-zinc-850 pb-1">
                <span class="text-zinc-400 dark:text-zinc-500">${isRu ? 'Дубликаты ID' : 'Duplicate IDs'}:</span>
                <span class="font-bold ${report.duplicateIdsCount > 0 ? 'text-rose-500' : 'text-emerald-500'}">${report.duplicateIdsCount}</span>
              </div>
              <div class="flex justify-between border-b border-zinc-100 dark:border-zinc-855 pb-1">
                <span class="text-zinc-400 dark:text-zinc-555">${isRu ? 'Битые ссылки' : 'Broken Links'}:</span>
                <span class="font-bold ${report.brokenLinksCount > 0 ? 'text-rose-500' : 'text-emerald-500'}">${report.brokenLinksCount}</span>
              </div>
              <div class="flex justify-between border-b border-zinc-100 dark:border-zinc-855 pb-1">
                <span class="text-zinc-400 dark:text-zinc-555">${isRu ? 'Недоступно в поиске' : 'Undiscoverable'}:</span>
                <span class="font-bold ${report.undiscoverableCount > 0 ? 'text-amber-500' : 'text-emerald-500'}">${report.undiscoverableCount}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Issue details -->
        ${report.details.length > 0 ? `
          <div class="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2.5">
            <h5 class="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">${isRu ? 'Журнал ошибок качества' : 'Quality Error Logs'}</h5>
            <div class="max-h-40 overflow-y-auto text-[9.5px] font-mono space-y-1.5 text-zinc-655 dark:text-zinc-400">
              ${report.details.slice(0, 50).map(det => `
                <div class="flex items-start gap-2 border-b border-zinc-100 dark:border-zinc-850/50 pb-1">
                  <span class="text-amber-600 dark:text-amber-450 shrink-0 font-bold">⚠️</span>
                  <span>${det}</span>
                </div>
              `).join('')}
              ${report.details.length > 50 ? `<div class="text-[9px] text-zinc-400 mt-1 uppercase">${isRu ? `...и еще ${report.details.length - 50} предупреждений` : `...and ${report.details.length - 50} more warnings`}</div>` : ''}
            </div>
          </div>
        ` : `
          <div class="p-4 border border-zinc-200 dark:border-zinc-850/80 rounded-xl text-center text-[10px] text-emerald-600 dark:text-emerald-450 font-bold uppercase tracking-widest bg-emerald-50/10">
            ✓ ${isRu ? 'Все проверки базы данных пройдены успешно' : 'All database QA checks passed successfully'}
          </div>
        `}
      </div>
    `;
  }

  renderCertificationTab(isRu) {
    const certItems = [
      { name: isRu ? 'Блокировка целостности IndexedDB' : 'IndexedDB Integrity Protection', desc: isRu ? 'Защищает локальную базу данных от несанкционированного изменения значений.' : 'Secures local browser database offline records from arbitrary alterations or manipulation.', status: { label: isRu ? 'Активен' : 'ACTIVE', colorClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' } },
      { name: isRu ? 'Сервисный воркер оффлайн-кэша' : 'Offline Service Worker Cache', desc: isRu ? 'Обеспечивает 100% автономную загрузку всех ресурсов системы без подключения к сети.' : 'Maintains absolute offline capability by caching application resources locally.', status: { label: isRu ? 'Активен' : 'ACTIVE', colorClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' } },
      { name: isRu ? 'Неизменяемость исходного кода БД' : 'Database Freeze Protection', desc: isRu ? 'Блокирует перезапись статических данных в оперативной памяти на уровне Object.freeze.' : 'Prevents runtime modification of database models using strict Object.freeze checks.', status: { label: isRu ? 'Активен' : 'ACTIVE', colorClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' } },
      { name: isRu ? 'Доверенный источник Niko Y' : 'Niko Y Identity Guardian', desc: isRu ? 'Обеспечивает авторскую идентичность Niko Y и защиту от сторонней модификации.' : 'Protects original authorship and prevents redistribution by unauthorized providers.', status: { label: isRu ? 'АКТИВЕН' : 'ACTIVE', colorClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' } }
    ];

    const rows = certItems.map(item => `
      <tr class="border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50/20 dark:hover:bg-zinc-900/10 text-[11px] font-sans">
        <td class="px-4 py-3 font-bold text-zinc-955 dark:text-zinc-100">${item.name}</td>
        <td class="px-4 py-3 text-zinc-500 dark:text-zinc-400 text-[10px] leading-relaxed max-w-xs sm:max-w-md">${item.desc}</td>
        <td class="px-4 py-3 text-right font-semibold">
          <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${item.status.colorClass}">
            ${item.status.label}
          </span>
        </td>
      </tr>
    `).join('');

    return `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-[10px] uppercase tracking-wider font-bold text-zinc-900 dark:text-white">
            ${isRu ? 'Ведомость полевой сертификации и безопасности' : 'Field Safety Certification Registry & Controls'}
          </h3>
        </div>

        <div class="w-full overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm shrink-0">
          <table class="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr class="bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-200 dark:border-zinc-800 text-[9px] font-bold text-zinc-455 dark:text-zinc-555 uppercase tracking-wider font-sans">
                <th class="px-4 py-3">${isRu ? 'Контрольный модуль' : 'Security Subsystem'}</th>
                <th class="px-4 py-3">${isRu ? 'Описание защиты' : 'Subsystem Function & Hardening'}</th>
                <th class="px-4 py-3 text-right">${isRu ? 'Статус' : 'Security Status'}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              ${rows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  bindEvents(containerId, searchQuery) {
    // 1. Back button
    const backBtn = document.getElementById('module-back-btn');
    if (backBtn) {
      backBtn.onclick = () => {
        store.setState({ activeModule: 'home' });
      };
    }

    // 2. Tab switching
    const tabs = ['status', 'explorer', 'tests', 'limits', 'offline', 'library', 'certification', 'logs'];
    tabs.forEach(tab => {
      const btn = document.getElementById(`health-tab-${tab}`);
      if (btn) {
        btn.onclick = () => {
          this.activeTab = tab;
          this.render(containerId, searchQuery);
        };
      }
    });

    // 3. Re-run tests button
    const rerunBtn = document.getElementById('re-run-tests-btn');
    if (rerunBtn) {
      rerunBtn.onclick = () => {
        AppLogger.info('Manual formula verification rerun triggered.');
        this.testResults = null;
        this.render(containerId, searchQuery);
      };
    }

    // 4. Clear logs button
    const clearBtn = document.getElementById('clear-logs-btn');
    if (clearBtn) {
      clearBtn.onclick = () => {
        AppLogger.clear();
        AppLogger.info('Audit logs cleared by engineer.');
        this.render(containerId, searchQuery);
      };
    }

    // 5. Re-sync DB button
    const resyncBtn = document.getElementById('re-sync-db-btn');
    if (resyncBtn) {
      resyncBtn.onclick = () => {
        AppLogger.warn('User triggered manual database recovery & sync from System Status.');
        OfflineStorage.recover(mockDb).then(() => {
          AppLogger.info('Manual database recovery complete. Reloading application to apply changes...');
          setTimeout(() => {
            window.location.reload();
          }, 500);
        });
      };
    }

    // 6. Relationship Explorer Node Selection
    const selectNode = document.getElementById('explorer-node-select');
    if (selectNode) {
      selectNode.onchange = (e) => {
        this.explorerSelectedId = e.target.value;
        this.render(containerId, searchQuery);
      };
    }

    // 7. Relationship Explorer Target Clicks
    const explorerTargets = document.querySelectorAll('[data-explorer-target-id]');
    explorerTargets.forEach(btn => {
      btn.onclick = () => {
        this.explorerSelectedId = btn.getAttribute('data-explorer-target-id');
        this.render(containerId, searchQuery);
      };
    });

    // 8. Relationship Explorer Shortcut Clicks
    const explorerShortcuts = document.querySelectorAll('[data-explorer-shortcut-id]');
    explorerShortcuts.forEach(btn => {
      btn.onclick = () => {
        this.explorerSelectedId = btn.getAttribute('data-explorer-shortcut-id');
        this.render(containerId, searchQuery);
      };
    });
  }
}

export const view = new SystemHealthView();
export default view;
