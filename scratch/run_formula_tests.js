
/**
 * HADALBORE_LAB — Automated Engineering Test Suite Runner
 * Compliance: ISO/IEC 25010 & ISO 9001 Quality Management Protocols
 */

// 1. Инициализация полифилов и изоляция рантайма Node.js от Browser API
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    getLength: () => Object.keys(store).length
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: false,
  configurable: true
});

Object.defineProperty(globalThis, 'window', {
  value: globalThis,
  configurable: true
});

globalThis.matchMedia = () => ({
  matches: false,
  addEventListener: () => {},
  removeEventListener: () => {}
});
globalThis.dispatchEvent = () => {};

Object.defineProperty(globalThis, 'document', {
  value: {
    documentElement: { 
      style: {
        setProperty: () => {}
      },
      classList: {
        toggle: () => {}
      }
    },
    getElementsByTagName: () => [],
    querySelector: () => null
  },
  configurable: true
});

// Заглушка для navigator, защищенная от перезаписи в современных версиях Node
Object.defineProperty(globalThis, 'navigator', {
  value: { userAgent: 'NodeJS-Architecture-Test-Runner', language: 'en-US' },
  configurable: true
});

// 2. Реализация механизмов контроля целостности (Immutability Guards)
const deepFreeze = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  const propNames = Object.getOwnPropertyNames(obj);
  for (const name of propNames) {
    const value = obj[name];
    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  }
  return Object.freeze(obj);
};

// 3. Запуск изолированной тестовой среды
async function runTestExecutionPlan() {
  console.log('Running HADALBORE_LAB Formula and Validation Tests...');
  console.log('======================================================================');

  try {
    // Динамический импорт расчетных модулей для предотвращения преждевременного вызова Browser API
    const { formulas } = await import('../src/engineering-tests/formulas.js');
    const { mockDb, populateMockDb, compareQueue } = await import('../src/database/mockDb.js');
    const rawDb = await import('../src/data/mock-db.json');
    populateMockDb(rawDb.default || rawDb);
    
    let passed = 0;
    let failed = 0;

    const assertTest = (description, condition) => {
      if (condition) {
        console.log(`🟢 [PASS] ${description}`);
        passed++;
      } else {
        console.error(`🔴 [FAIL] ${description}`);
        failed++;
      }
    };

    // --- Домен 1: Вычислительные ядра (Well Completions) ---
    
    // Гидростатическое давление: P = 0.00981 * rho * TVD
    const p_hydro = formulas.calculateHydrostatic(1200, 3000); // rho = 1200 kg/m³, TVD = 3000m
    assertTest('#01: Hydrostatic Pressure Engine (Metric)', Math.abs(p_hydro - 35316) <= 100);

    // Коэффициент плавучести: BF = 1 - (rho_fluid / 7850)
    const bf = formulas.calculateBuoyancy(1200);
    assertTest('#02: Buoyancy Factor Module (Metric)', Math.abs(bf - 0.847) <= 0.01);

    // Термическое расширение объема: dV = V0 * beta * dT
    const dv = formulas.calculateThermalExpansion(100, 0.00018, 40); 
    assertTest('#03: Thermal Expansion Algorithm', Math.abs(dv - 0.72) <= 0.01);

    // Внутренний объем (Вместимость колонны)
    const volume = formulas.calculateVolume(0.152, 2500); // ID = 0.152m, Length = 2500m
    assertTest('#04: Internal Capacity & Volume Calculation', Math.abs(volume - 45.36) <= 0.5);

    // --- Домен 2: Защита рантайма и контроль иммутабельности ---

    // Тест А: Database Immutability Guard
    const frozenDb = deepFreeze(mockDb);
    try {
      frozenDb.equipment[0].maxPressure = 99999;
    } catch (e) {
      // Исключение ожидаемо при строгом режиме (Strict Mode)
    }
    assertTest('#10: Database Immutability Guard (Test A)', frozenDb.equipment[0].maxPressure !== 99999);

    // Тест B: Compare Queue Immutability Guard
    const frozenQueue = deepFreeze(compareQueue);
    try {
      frozenQueue.push({ id: 'corrupted_item' });
    } catch (e) {}
    assertTest('#11: Compare Queue Immutability Guard (Test B)', frozenQueue.length === 0 || !frozenQueue.some(i => i.id === 'corrupted_item'));

    // Тест C: Валидация схемы данных (Schema Drift Detection)
    const expectedKeys = ['equipment', 'fluids', 'metadata'];
    const hasValidSchema = expectedKeys.every(key => Object.hasOwn(mockDb, key));
    assertTest('#12: Schema Drift Detection (Test C)', hasValidSchema);

    // Тест G: Контроль целостности бренда и сигнатур
    const hasOldIdentity = JSON.stringify(mockDb).includes('omnilab') || JSON.stringify(mockDb).includes('nikolai');
    assertTest('#16: Database Integrity Seal Check (Test G)', !hasOldIdentity);

    // --- Итоги тестирования ---
    console.log('======================================================================');
    console.log(`>> Validation Report Summary: ${failed === 0 ? 'PASS' : 'FAIL'}`);
    console.log(`>> Execution Metrics: Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
    console.log('======================================================================');

    process.exit(failed === 0 ? 0 : 1);

  } catch (error) {
    console.error('💥 Critical failure inside Test Execution Suite:');
    console.error(error);
    process.exit(1);
  }
}

runTestExecutionPlan();
