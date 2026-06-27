var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/engineering-tests/formulas.js
var formulas_exports = {};
__export(formulas_exports, {
  formulas: () => formulas
});
var formulas;
var init_formulas = __esm({
  "src/engineering-tests/formulas.js"() {
    formulas = {
      // Hydrostatic pressure in kPa: P = 0.00981 * rho * TVD
      calculateHydrostatic(rho, tvd) {
        return 981e-5 * rho * tvd;
      },
      // Buoyancy factor: BF = 1 - (rho_fluid / 7850)
      calculateBuoyancy(rho) {
        return 1 - rho / 7850;
      },
      // Thermal expansion elongation: dV = V0 * beta * dT
      calculateThermalExpansion(v0, beta, dt) {
        return v0 * beta * dt;
      },
      // Internal volume: volume = (pi * ID^2 / 4) * Length
      calculateVolume(id, length) {
        return Math.PI * Math.pow(id, 2) / 4 * length;
      },
      // Triaxial stress: Von Mises equivalent stress
      calculateVonMisesStress(axialForceN, internalPressurePa, externalPressurePa, outerDiaM, innerDiaM) {
        const ro = outerDiaM / 2;
        const ri = innerDiaM / 2;
        const area = Math.PI * (Math.pow(ro, 2) - Math.pow(ri, 2));
        if (area <= 0) return 0;
        const sigmaAxial = axialForceN / area;
        const sigmaRadial = -internalPressurePa;
        const sigmaTangential = (internalPressurePa * (Math.pow(ro, 2) + Math.pow(ri, 2)) - 2 * externalPressurePa * Math.pow(ro, 2)) / (Math.pow(ro, 2) - Math.pow(ri, 2));
        return Math.sqrt(0.5 * (Math.pow(sigmaAxial - sigmaRadial, 2) + Math.pow(sigmaRadial - sigmaTangential, 2) + Math.pow(sigmaTangential - sigmaAxial, 2)));
      },
      // Herschel-Bulkley rheology parameters
      calculateHerschelBulkley(theta600, theta300, theta200, theta100, theta6, theta3) {
        let tau0 = 0.511 * (2 * theta3 - theta6);
        if (tau0 < 0) tau0 = 0;
        let n = 1;
        if (theta300 > theta3 && theta100 > theta3) {
          const logRatio = Math.log((theta300 - theta3) / (theta100 - theta3));
          n = logRatio / Math.log(300 / 100);
        }
        if (n <= 0 || isNaN(n)) n = 0.5;
        const K = (0.511 * theta300 - tau0) / Math.pow(511, n);
        return { tau0, n, K };
      },
      // Critical mud pressure to prevent borehole breakout
      calculateBreakoutPressure(sigmaHMax, sigmaHMin, pp, ucs, frictionAngle) {
        const phiRad = frictionAngle * Math.PI / 180;
        const q = (1 + Math.sin(phiRad)) / (1 - Math.sin(phiRad));
        return (3 * sigmaHMax - sigmaHMin - ucs + (q - 1) * pp) / (1 + q);
      }
    };
  }
});

// src/core/IntegritySnapshot.js
var init_IntegritySnapshot = __esm({
  "src/core/IntegritySnapshot.js"() {
  }
});

// src/core/AppLogger.js
var AppLogger, loggerInstance;
var init_AppLogger = __esm({
  "src/core/AppLogger.js"() {
    AppLogger = class {
      constructor() {
        this.logs = [];
        this.maxLogs = 500;
        this.crashCount = 0;
      }
      log(level, message, context = {}, error = null) {
        const timestamp = (/* @__PURE__ */ new Date()).toISOString();
        const logEntry = {
          timestamp,
          level,
          // 'INFO' | 'WARN' | 'ERROR' | 'FATAL'
          message,
          context,
          error: error ? {
            message: error.message,
            stack: error.stack,
            name: error.name
          } : null
        };
        this.logs.unshift(logEntry);
        if (this.logs.length > this.maxLogs) {
          this.logs.pop();
        }
        if (level === "FATAL" || level === "ERROR") {
          this.crashCount++;
        }
        if (level === "ERROR" || level === "FATAL") {
          console.error(`[${timestamp}] [${level}] ${message}`, context, error);
        } else if (level === "WARN") {
          console.warn(`[${timestamp}] [${level}] ${message}`, context);
        } else {
          console.log(`[${timestamp}] [${level}] ${message}`, context);
        }
      }
      info(message, context = {}) {
        this.log("INFO", message, context);
      }
      warn(message, context = {}) {
        this.log("WARN", message, context);
      }
      error(message, context = {}, error = null) {
        this.log("ERROR", message, context, error);
      }
      fatal(message, context = {}, error = null) {
        this.log("FATAL", message, context, error);
      }
      getLogs() {
        return this.logs;
      }
      getStats() {
        return {
          total: this.logs.length,
          info: this.logs.filter((l) => l.level === "INFO").length,
          warn: this.logs.filter((l) => l.level === "WARN").length,
          error: this.logs.filter((l) => l.level === "ERROR").length,
          fatal: this.logs.filter((l) => l.level === "FATAL").length,
          crashCount: this.crashCount
        };
      }
      clear() {
        this.logs = [];
        this.crashCount = 0;
      }
    };
    loggerInstance = new AppLogger();
    if (typeof window !== "undefined") {
      window.AppLogger = loggerInstance;
    }
  }
});

// src/core/LibraryFreezeGuard.js
function deepFreeze(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  const seen = /* @__PURE__ */ new WeakSet();
  function freezeRecursive(val) {
    if (val === null || typeof val !== "object" || seen.has(val)) {
      return;
    }
    seen.add(val);
    const proto = Object.getPrototypeOf(val);
    if (proto && proto !== Object.prototype && proto !== Array.prototype) {
      Object.freeze(proto);
    }
    const propNames = Reflect.ownKeys(val);
    for (const name of propNames) {
      const desc = Object.getOwnPropertyDescriptor(val, name);
      if (desc && desc.value !== null && typeof desc.value === "object") {
        freezeRecursive(desc.value);
      }
    }
    Object.preventExtensions(val);
    Object.freeze(val);
  }
  freezeRecursive(obj);
  return obj;
}
function freezeCompareInput(record) {
  return deepFreeze(record);
}
var init_LibraryFreezeGuard = __esm({
  "src/core/LibraryFreezeGuard.js"() {
    init_IntegritySnapshot();
    init_AppLogger();
  }
});

// src/data/version.json
var version_default;
var init_version = __esm({
  "src/data/version.json"() {
    version_default = {
      product: "HADALBORE_LAB",
      creator: "Niko Y",
      officialSource: "GitHub",
      buildVersion: "1.3.1",
      schemaVersion: 2,
      datasetVersion: "2.9.1"
    };
  }
});

// src/core/State.js
var State, store;
var init_State = __esm({
  "src/core/State.js"() {
    init_LibraryFreezeGuard();
    init_version();
    State = class {
      constructor() {
        this.listeners = [];
        const initialLang = localStorage.getItem("lang") || (navigator.language.startsWith("ru") ? "ru" : "en");
        const initialTheme = localStorage.getItem("theme") || "system";
        const initialUnit = localStorage.getItem("unit_system") || (initialLang === "ru" ? "metric" : "imperial");
        let initialCompareQueue = [];
        try {
          const parsed = JSON.parse(localStorage.getItem("hadalbore_compare_queue") || "[]");
          if (Array.isArray(parsed)) {
            const ids = /* @__PURE__ */ new Set();
            const cleaned = parsed.filter((item) => {
              if (!item || !item.id || !item.module) return false;
              if (ids.has(item.id)) return false;
              ids.add(item.id);
              return true;
            });
            if (cleaned.length > 0) {
              const firstModule = cleaned[0].module;
              initialCompareQueue = cleaned.filter((item) => item.module === firstModule).slice(0, 4);
            }
          }
        } catch (e) {
          initialCompareQueue = [];
        }
        const storedMode = localStorage.getItem("hadalbore_view_mode");
        const storedFieldMode = localStorage.getItem("hadalbore_field_mode") === "true";
        const initialViewMode = storedFieldMode ? "field" : (storedMode === "reference" ? "engineering" : storedMode) || "engineering";
        this.state = {
          lang: initialLang,
          theme: initialTheme,
          unitSystem: initialUnit,
          viewMode: initialViewMode,
          // field (Field View) | engineering (Technical View)
          activeModule: "home",
          searchQuery: "",
          feedbacks: JSON.parse(localStorage.getItem("feedback_requests") || "[]"),
          updateAvailable: false,
          // Reactive state variables for local analytics
          favorites: JSON.parse(localStorage.getItem("hadalbore_favorites") || "[]"),
          recentlyViewed: JSON.parse(localStorage.getItem("hadalbore_recently_viewed") || "[]"),
          pinnedModules: JSON.parse(localStorage.getItem("hadalbore_pinned_modules") || "[]"),
          releaseNotesRead: localStorage.getItem("hadalbore_release_notes_read") === "true",
          searchHistory: JSON.parse(localStorage.getItem("hadalbore_search_history") || "[]"),
          preferredCategories: JSON.parse(localStorage.getItem("hadalbore_preferred_categories") || "[]"),
          offlineMode: localStorage.getItem("hadalbore_offline_mode") === "true",
          sidebarCollapsed: localStorage.getItem("hadalbore_sidebar_collapsed") === "true",
          mostOpened: JSON.parse(localStorage.getItem("hadalbore_most_opened") || "{}"),
          compareQueue: initialCompareQueue,
          schemaCorrupted: false,
          dbHash: "",
          currentVersion: version_default.buildVersion,
          fieldMode: localStorage.getItem("hadalbore_field_mode") === "true",
          bootStatus: "BOOT_OK",
          fontScale: parseFloat(localStorage.getItem("hadalbore_font_scale") || "1.0"),
          obsidianNotes: [],
          obsidianConnected: localStorage.getItem("hadalbore_obsidian_connected") === "true",
          obsidianPermissionRequired: false
        };
        localStorage.setItem("lang", this.state.lang);
        localStorage.setItem("theme", this.state.theme);
        localStorage.setItem("unit_system", this.state.unitSystem);
        localStorage.setItem("hadalbore_view_mode", this.state.viewMode);
        localStorage.setItem("hadalbore_field_mode", this.state.fieldMode.toString());
        this.initSystemThemeListener();
        this.applyTheme(this.state.theme);
        this.applyFontScale(this.state.fontScale);
      }
      getState() {
        return this.state;
      }
      subscribe(listener) {
        this.listeners.push(listener);
        return () => {
          this.listeners = this.listeners.filter((l) => l !== listener);
        };
      }
      setState(updates) {
        if (updates && updates.viewMode === "reference") {
          updates.viewMode = "engineering";
        }
        let hasChanges = false;
        for (const key in updates) {
          if (this.state[key] !== updates[key]) {
            hasChanges = true;
            break;
          }
        }
        if (!hasChanges) return;
        this.state = { ...this.state, ...updates };
        if ("lang" in updates) localStorage.setItem("lang", this.state.lang);
        if ("theme" in updates) {
          localStorage.setItem("theme", this.state.theme);
          this.applyTheme(this.state.theme);
        }
        if ("unitSystem" in updates) localStorage.setItem("unit_system", this.state.unitSystem);
        if ("viewMode" in updates) localStorage.setItem("hadalbore_view_mode", this.state.viewMode);
        if ("fieldMode" in updates) localStorage.setItem("hadalbore_field_mode", this.state.fieldMode.toString());
        if ("fontScale" in updates) {
          localStorage.setItem("hadalbore_font_scale", this.state.fontScale.toString());
          this.applyFontScale(this.state.fontScale);
        }
        if ("feedbacks" in updates) localStorage.setItem("feedback_requests", JSON.stringify(this.state.feedbacks));
        if ("obsidianConnected" in updates) localStorage.setItem("hadalbore_obsidian_connected", this.state.obsidianConnected.toString());
        if ("favorites" in updates) localStorage.setItem("hadalbore_favorites", JSON.stringify(this.state.favorites));
        if ("recentlyViewed" in updates) localStorage.setItem("hadalbore_recently_viewed", JSON.stringify(this.state.recentlyViewed));
        if ("pinnedModules" in updates) localStorage.setItem("hadalbore_pinned_modules", JSON.stringify(this.state.pinnedModules));
        if ("releaseNotesRead" in updates) localStorage.setItem("hadalbore_release_notes_read", this.state.releaseNotesRead.toString());
        if ("searchHistory" in updates) localStorage.setItem("hadalbore_search_history", JSON.stringify(this.state.searchHistory));
        if ("preferredCategories" in updates) localStorage.setItem("hadalbore_preferred_categories", JSON.stringify(this.state.preferredCategories));
        if ("offlineMode" in updates) localStorage.setItem("hadalbore_offline_mode", this.state.offlineMode.toString());
        if ("sidebarCollapsed" in updates) localStorage.setItem("hadalbore_sidebar_collapsed", this.state.sidebarCollapsed.toString());
        if ("mostOpened" in updates) localStorage.setItem("hadalbore_most_opened", JSON.stringify(this.state.mostOpened));
        if ("compareQueue" in updates) localStorage.setItem("hadalbore_compare_queue", JSON.stringify(this.state.compareQueue));
        this.listeners.forEach((listener) => listener(this.state));
      }
      // Compare Actions
      addToCompare(record, moduleType) {
        const queue = [...this.state.compareQueue];
        if (queue.length > 0 && queue[0].module !== moduleType) {
          this.triggerToast({
            en: "Can only compare items of the same type",
            ru: "\u041C\u043E\u0436\u043D\u043E \u0441\u0440\u0430\u0432\u043D\u0438\u0432\u0430\u0442\u044C \u0442\u043E\u043B\u044C\u043A\u043E \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u044B \u043E\u0434\u043D\u043E\u0433\u043E \u0442\u0438\u043F\u0430"
          });
          return false;
        }
        if (queue.length >= 4) {
          this.triggerToast({
            en: "Maximum 4 items can be compared",
            ru: "\u041C\u043E\u0436\u043D\u043E \u0441\u0440\u0430\u0432\u043D\u0438\u0432\u0430\u0442\u044C \u043C\u0430\u043A\u0441\u0438\u043C\u0443\u043C 4 \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430"
          });
          return false;
        }
        if (queue.some((item) => item.id === record.id)) {
          return false;
        }
        const frozenRecord = freezeCompareInput({ ...record, module: moduleType });
        queue.push(frozenRecord);
        this.setState({ compareQueue: queue });
        return true;
      }
      removeFromCompare(recordId) {
        const queue = this.state.compareQueue.filter((item) => item.id !== recordId);
        this.setState({ compareQueue: queue });
      }
      clearCompare() {
        this.setState({ compareQueue: [] });
      }
      triggerToast(messages) {
        const event = new CustomEvent("hadalbore-toast", { detail: messages });
        window.dispatchEvent(event);
      }
      // Analytics Helpers
      trackModuleOpen(moduleType) {
        const mostOpened = { ...this.state.mostOpened };
        mostOpened[moduleType] = (mostOpened[moduleType] || 0) + 1;
        this.setState({ mostOpened });
      }
      trackRecordView(recordId, moduleType) {
        if (this.state.recentlyViewed[0] && this.state.recentlyViewed[0].id === recordId) return;
        let recentlyViewed = [...this.state.recentlyViewed];
        recentlyViewed = recentlyViewed.filter((item) => item.id !== recordId);
        recentlyViewed.unshift({ id: recordId, module: moduleType, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
        recentlyViewed = recentlyViewed.slice(0, 5);
        this.setState({ recentlyViewed });
      }
      trackSearch(query) {
        if (!query || !query.trim()) return;
        if (this.state.searchHistory[0] === query) return;
        let searchHistory = [...this.state.searchHistory];
        searchHistory = searchHistory.filter((q) => q !== query);
        searchHistory.unshift(query);
        searchHistory = searchHistory.slice(0, 10);
        this.setState({ searchHistory });
      }
      initSystemThemeListener() {
        const darkMedia = window.matchMedia("(prefers-color-scheme: dark)");
        darkMedia.addEventListener("change", () => {
          if (this.state.theme === "system") {
            this.applyTheme("system");
          }
        });
      }
      applyTheme(theme) {
        const isDark = theme === "dark" || theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.classList.toggle("dark", isDark);
        document.documentElement.style.colorScheme = isDark ? "dark" : "light";
        const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
        if (metaColorScheme) {
          metaColorScheme.content = isDark ? "dark" : "light";
        }
      }
      applyFontScale(scale) {
        const validScale = [0.9, 1, 1.1, 1.25].includes(scale) ? scale : 1;
        document.documentElement.style.setProperty("--font-scale", validScale.toString());
        document.documentElement.style.fontSize = `${validScale * 100}%`;
      }
    };
    store = new State();
  }
});

// src/database/mockDb.js
var mockDb_exports = {};
__export(mockDb_exports, {
  compareQueue: () => compareQueue,
  injectObsidianRecords: () => injectObsidianRecords,
  mockDb: () => mockDb,
  populateMockDb: () => populateMockDb
});
function populateMockDb(decryptedDb) {
  Object.assign(mockDb, decryptedDb);
  mockDb.equipment = decryptedDb.standards || [{}];
  mockDb.fluids = decryptedDb.brines || [{}];
  mockDb.wellbore_fluids = decryptedDb.wellbore_fluids || [{}];
}
function injectObsidianRecords(notes) {
  notes.forEach((note) => {
    if (note.isDatabaseRecord && note.frontmatter && note.frontmatter.type) {
      const type = note.frontmatter.type;
      if (mockDb[type]) {
        const existingIdx = mockDb[type].findIndex((r) => r.id === note.id);
        const record = { ...note.frontmatter, id: note.id, _source: "obsidian", _markdownDescription: note.content };
        if (existingIdx !== -1) {
          mockDb[type][existingIdx] = record;
        } else {
          mockDb[type].push(record);
        }
      }
    }
  });
}
var mockDb, compareQueue;
var init_mockDb = __esm({
  "src/database/mockDb.js"() {
    init_State();
    mockDb = {
      metadata: { version: "1.3.1" }
    };
    compareQueue = store.getState().compareQueue;
  }
});

// src/data/mock-db.json
var require_mock_db = __commonJS({
  "src/data/mock-db.json"(exports, module) {
    module.exports = {
      tubulars: [
        {
          id: "tubing_2375_j55",
          type: "Tubular",
          name: '2.375" J55 Tubing',
          aliases: [
            "2-3/8 J55",
            "2.375 J55",
            "60\u043C\u043C J55",
            "60 J55",
            "\u041D\u041A\u0422 60 J55"
          ],
          description: "API Specification 5CT grade J55 light-duty production tubing.",
          standards: [
            "API Spec 5CT",
            "ISO 11960",
            "\u0413\u041E\u0421\u0422 31446"
          ],
          temperature: {
            min: -20,
            max: 120,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 7700,
            unit: "psi"
          },
          chemicalComposition: [
            "Carbon Steel (C-Mn)"
          ],
          chemicalCompatibility: [
            "Crude oil",
            "Water",
            "Sweet production gas"
          ],
          usedInEquipment: [
            "Standard completion strings",
            "Artificial lift (ESP/Rod pump)"
          ],
          advantages: [
            "Highly ductile",
            "Very economic choice",
            "Standard global availability"
          ],
          limitations: [
            "Low corrosion resistance in sour gas",
            "Low collapse rating"
          ],
          applications: [
            "Low-pressure production wells",
            "Water injection/disposal wells"
          ],
          diagrams: [
            "tubing-connection"
          ],
          graphs: [],
          sources: [
            "API Spec 5CT 10th Ed",
            "\u0413\u041E\u0421\u0422 31446"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          od: 2.375,
          weight: 4.7,
          inner_dia: 1.995,
          drift_id: 1.901,
          grade: "J55",
          tubular_type: "Tubing",
          burst: 7700,
          collapse: 5680,
          tensile: 72e3,
          confidenceLevel: "High"
        },
        {
          id: "tubing_2875_l80",
          type: "Tubular",
          name: '2.875" L80 Tubing',
          aliases: [
            "2-7/8 L80",
            "2.875 L80",
            "73\u043C\u043C L80",
            "73 L80",
            "\u041D\u041A\u0422 73 L80"
          ],
          description: "API Specification 5CT grade L80 production tubing with controlled hardness for sour service.",
          standards: [
            "API Spec 5CT",
            "ISO 11960",
            "\u0413\u041E\u0421\u0422 31446"
          ],
          temperature: {
            min: -29,
            max: 150,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 10570,
            unit: "psi"
          },
          chemicalComposition: [
            "Medium Carbon Steel",
            "Chromium-Molybdenum alloys"
          ],
          chemicalCompatibility: [
            "Crude oil",
            "Brine fluids",
            "Mild H2S environments"
          ],
          usedInEquipment: [
            "Production strings",
            "Corrosive injector wells"
          ],
          advantages: [
            "Sour service compatibility (NACE MR0175 compliance)",
            "Good tensile strength"
          ],
          limitations: [
            "Not suitable for high CO2 with high watercut without inhibition"
          ],
          applications: [
            "Standard production wells with mild H2S",
            "Deep completion strings"
          ],
          diagrams: [
            "tubing-connection"
          ],
          graphs: [
            "collapse_envelope_l80"
          ],
          sources: [
            "API Spec 5CT 10th Ed",
            "\u0413\u041E\u0421\u0422 31446"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          od: 2.875,
          weight: 6.5,
          inner_dia: 2.441,
          drift_id: 2.347,
          grade: "L80",
          tubular_type: "Tubing",
          burst: 10570,
          collapse: 11100,
          tensile: 145e3,
          confidenceLevel: "High"
        },
        {
          id: "tubing_3500_t95",
          type: "Tubular",
          name: '3.500" T95 Tubing',
          aliases: [
            "3-1/2 T95",
            "3.500 T95",
            "89\u043C\u043C T95",
            "89 T95",
            "\u041D\u041A\u0422 89 T95"
          ],
          description: "High-strength sour service production tubing designed for severe H2S environments with strict QC.",
          standards: [
            "API Spec 5CT",
            "ISO 11960",
            "\u0413\u041E\u0421\u0422 31446",
            "NACE MR0175"
          ],
          temperature: {
            min: -29,
            max: 175,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 12640,
            unit: "psi"
          },
          chemicalComposition: [
            "Cr-Mo Alloy Steel",
            "Controlled grain structure"
          ],
          chemicalCompatibility: [
            "Sour gas (H2S)",
            "Carbon dioxide (CO2)",
            "Completion brines"
          ],
          usedInEquipment: [
            "High-pressure sour completions",
            "Deep corrosive wells"
          ],
          advantages: [
            "Excellent Sulfide Stress Cracking (SSC) resistance",
            "Very high collapse ratings"
          ],
          limitations: [
            "Higher cost",
            "Susceptible to severe CO2 corrosion in wet gas without inhibitors"
          ],
          applications: [
            "Severe H2S wells",
            "Deep sour gas completions",
            "High-stress production strings"
          ],
          diagrams: [
            "tubing-connection"
          ],
          graphs: [],
          sources: [
            "API Spec 5CT 10th Ed",
            "NACE MR0175"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          od: 3.5,
          weight: 9.3,
          inner_dia: 2.992,
          drift_id: 2.867,
          grade: "T95",
          tubular_type: "Tubing",
          burst: 12640,
          collapse: 12220,
          tensile: 213e3,
          confidenceLevel: "High"
        },
        {
          id: "tubing_4500_p110",
          type: "Tubular",
          name: '4.500" P110 Tubing',
          aliases: [
            "4-1/2 P110",
            "4.500 P110",
            "114\u043C\u043C P110",
            "114 P110",
            "\u041D\u041A\u0422 114 P110"
          ],
          description: "High-strength standard production tubing for deep, high-pressure wells.",
          standards: [
            "API Spec 5CT",
            "ISO 11960",
            "\u0413\u041E\u0421\u0422 31446"
          ],
          temperature: {
            min: -20,
            max: 190,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 14420,
            unit: "psi"
          },
          chemicalComposition: [
            "Carbon Alloy Steel (Mn-Cr-Mo)"
          ],
          chemicalCompatibility: [
            "Crude oil",
            "Sweet gas",
            "Standard completion fluids"
          ],
          usedInEquipment: [
            "Deep production wells",
            "High-rate gas completion strings"
          ],
          advantages: [
            "Exceptional tensile and burst ratings",
            "Suitable for deep vertical wells"
          ],
          limitations: [
            "Not resistant to H2S (SSC hazard)",
            "Strict temperature limits under stress"
          ],
          applications: [
            "Deep sweet gas completions",
            "High-pressure wells"
          ],
          diagrams: [
            "tubing-connection"
          ],
          graphs: [],
          sources: [
            "API Spec 5CT 10th Ed",
            "\u0413\u041E\u0421\u0422 31446"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          od: 4.5,
          weight: 12.6,
          inner_dia: 3.958,
          drift_id: 3.833,
          grade: "P110",
          tubular_type: "Tubing",
          burst: 14420,
          collapse: 10320,
          tensile: 334e3,
          confidenceLevel: "High"
        },
        {
          id: "casing_5500_q125",
          type: "Tubular",
          name: '5.500" Q125 Casing',
          aliases: [
            "5-1/2 Q125",
            "5.500 Q125",
            "140\u043C\u043C Q125",
            "140 Q125",
            "\u041E\u041A 140 Q125"
          ],
          description: "Ultra-high strength casing designed for high pressure deep wells.",
          standards: [
            "API Spec 5CT",
            "ISO 11960"
          ],
          temperature: {
            min: -20,
            max: 200,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 16300,
            unit: "psi"
          },
          chemicalComposition: [
            "Quenched & Tempered Cr-Mo Alloy Steel"
          ],
          chemicalCompatibility: [
            "Sweet wells",
            "Heavy drilling muds"
          ],
          usedInEquipment: [
            "Production liner",
            "Deep intermediate casing"
          ],
          advantages: [
            "Maximum yield strength",
            "High collapse resistance for deep reservoirs"
          ],
          limitations: [
            "No H2S resistance (very brittle in sour environment)"
          ],
          applications: [
            "Deep gas wells",
            "HPHT reservoir sections"
          ],
          diagrams: [
            "makeup-loss"
          ],
          graphs: [],
          sources: [
            "API Spec 5CT 10th Ed"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          od: 5.5,
          weight: 20,
          inner_dia: 4.778,
          drift_id: 4.653,
          grade: "Q125",
          tubular_type: "Casing",
          burst: 16300,
          collapse: 14200,
          tensile: 512e3,
          confidenceLevel: "High"
        },
        {
          id: "casing_7000_p110",
          type: "Tubular",
          name: '7.000" P110 Casing',
          aliases: [
            "7 P110",
            "7.000 P110",
            "178\u043C\u043C P110",
            "178 P110",
            "\u041E\u041A 178 P110"
          ],
          description: "High-strength intermediate and production casing for deep wells.",
          standards: [
            "API Spec 5CT",
            "ISO 11960",
            "\u0413\u041E\u0421\u0422 31446"
          ],
          temperature: {
            min: -20,
            max: 180,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 11220,
            unit: "psi"
          },
          chemicalComposition: [
            "Medium Carbon Alloy Steel"
          ],
          chemicalCompatibility: [
            "Hydrocarbons",
            "Water",
            "Drilling fluids"
          ],
          usedInEquipment: [
            "Intermediate casing",
            "Production casing string"
          ],
          advantages: [
            "Great balance of tensile strength and price",
            "Wide availability"
          ],
          limitations: [
            "High susceptibility to SSC in H2S environments"
          ],
          applications: [
            "Intermediate sections in deep wells",
            "Production casing in sweet wells"
          ],
          diagrams: [
            "makeup-loss"
          ],
          graphs: [],
          sources: [
            "API Spec 5CT 10th Ed",
            "\u0413\u041E\u0421\u0422 31446"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          od: 7,
          weight: 29,
          inner_dia: 6.185,
          drift_id: 6.06,
          grade: "P110",
          tubular_type: "Casing",
          burst: 11220,
          collapse: 8530,
          tensile: 692e3,
          confidenceLevel: "High"
        },
        {
          id: "casing_9625_l80",
          type: "Tubular",
          name: '9.625" L80 Casing',
          aliases: [
            "9-5/8 L80",
            "9.625 L80",
            "245\u043C\u043C L80",
            "245 L80",
            "\u041E\u041A 245 L80"
          ],
          description: "Intermediate casing designed for sweet to mild sour environments.",
          standards: [
            "API Spec 5CT",
            "ISO 11960",
            "\u0413\u041E\u0421\u0422 31446"
          ],
          temperature: {
            min: -29,
            max: 160,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 5750,
            unit: "psi"
          },
          chemicalComposition: [
            "Carbon Steel",
            "Chromium-Molybdenum alloys"
          ],
          chemicalCompatibility: [
            "Mild H2S",
            "CO2",
            "Cement slurries"
          ],
          usedInEquipment: [
            "Intermediate casing strings",
            "Production casing strings"
          ],
          advantages: [
            "Controlled yield strength for mild sour service",
            "Good collapse resistance"
          ],
          limitations: [
            "Not for high H2S concentrations",
            "Medium pressure limit"
          ],
          applications: [
            "Intermediate casing sections",
            "Medium-depth wells"
          ],
          diagrams: [
            "makeup-loss"
          ],
          graphs: [],
          sources: [
            "API Spec 5CT 10th Ed",
            "\u0413\u041E\u0421\u0422 31446"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          od: 9.625,
          weight: 40,
          inner_dia: 8.835,
          drift_id: 8.679,
          grade: "L80",
          tubular_type: "Casing",
          burst: 5750,
          collapse: 3090,
          tensile: 686e3,
          confidenceLevel: "High"
        },
        {
          id: "casing_13375_j55",
          type: "Tubular",
          name: '13.375" J55 Casing',
          aliases: [
            "13-3/8 J55",
            "13.375 J55",
            "340\u043C\u043C J55",
            "340 J55",
            "\u041E\u041A 340 J55"
          ],
          description: "Surface casing used to isolate shallow water zones and support subsequent strings.",
          standards: [
            "API Spec 5CT",
            "\u0413\u041E\u0421\u0422 31446"
          ],
          temperature: {
            min: -20,
            max: 100,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 2730,
            unit: "psi"
          },
          chemicalComposition: [
            "Carbon Steel"
          ],
          chemicalCompatibility: [
            "Standard muds",
            "Cement",
            "Fresh water"
          ],
          usedInEquipment: [
            "Surface casing string",
            "Conductor strings"
          ],
          advantages: [
            "Economic surface protection",
            "Ductile and easily welded"
          ],
          limitations: [
            "Low collapse threshold",
            "No acid/H2S resistance"
          ],
          applications: [
            "Surface hole isolation",
            "Water aquifer protection"
          ],
          diagrams: [
            "makeup-loss"
          ],
          graphs: [],
          sources: [
            "API Spec 5CT 10th Ed",
            "\u0413\u041E\u0421\u0422 31446"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          od: 13.375,
          weight: 54.5,
          inner_dia: 12.615,
          drift_id: 12.459,
          grade: "J55",
          tubular_type: "Casing",
          burst: 2730,
          collapse: 1130,
          tensile: 514e3,
          confidenceLevel: "High"
        },
        {
          id: "casing_20000_k55",
          type: "Tubular",
          name: '20.000" K55 Casing',
          aliases: [
            "20 K55",
            "20.000 K55",
            "508\u043C\u043C K55",
            "508 K55",
            "\u041E\u041A 508 K55"
          ],
          description: "Large diameter surface or conductor casing for structural support.",
          standards: [
            "API Spec 5CT",
            "\u0413\u041E\u0421\u0422 31446"
          ],
          temperature: {
            min: -20,
            max: 90,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 2110,
            unit: "psi"
          },
          chemicalComposition: [
            "Carbon Steel (C-Mn)"
          ],
          chemicalCompatibility: [
            "Fresh water",
            "Sea water",
            "Cement"
          ],
          usedInEquipment: [
            "Conductor strings",
            "Structural surface casings"
          ],
          advantages: [
            "High structural bending capacity",
            "Cheap, easy to weld/joint"
          ],
          limitations: [
            "Low burst and collapse rating",
            "Heavy weight per unit length"
          ],
          applications: [
            "Structural casing sections",
            "Top-hole drilling stabilization"
          ],
          diagrams: [
            "makeup-loss"
          ],
          graphs: [],
          sources: [
            "API Spec 5CT 10th Ed"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          od: 20,
          weight: 94,
          inner_dia: 19.124,
          drift_id: 18.936,
          grade: "K55",
          tubular_type: "Casing",
          burst: 2110,
          collapse: 520,
          tensile: 789e3,
          confidenceLevel: "High"
        },
        {
          id: "drillpipe_2875_e75",
          type: "Tubular",
          name: '2.875" E75 Drill Pipe',
          aliases: [
            "2-7/8 DP E75",
            "2.875 E75",
            "73\u043C\u043C E75",
            "\u0421\u0411\u0422 73 E75"
          ],
          description: "Standard light-weight drill pipe commonly used in slim-hole drilling and workovers.",
          standards: [
            "API Spec 5DP",
            "\u0413\u041E\u0421\u0422 32696"
          ],
          temperature: {
            min: -20,
            max: 130,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 12400,
            unit: "psi"
          },
          chemicalComposition: [
            "Medium Carbon Steel"
          ],
          chemicalCompatibility: [
            "Drilling muds",
            "Brines",
            "Sweet production"
          ],
          usedInEquipment: [
            "Workover strings",
            "Slim-hole drill string"
          ],
          advantages: [
            "Light weight",
            "Excellent flexibility in high dogleg severities"
          ],
          limitations: [
            "Low torsional limit compared to high grades"
          ],
          applications: [
            "Slim hole drilling",
            "Coiled tubing and workover operations"
          ],
          diagrams: [
            "tubing-connection"
          ],
          graphs: [],
          sources: [
            "API Spec 5DP 2nd Ed",
            "\u0413\u041E\u0421\u0422 32696"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2024",
          od: 2.875,
          weight: 10.4,
          inner_dia: 2.151,
          drift_id: 2.026,
          grade: "E75",
          tubular_type: "Drill Pipe",
          burst: 12400,
          collapse: 12e3,
          tensile: 16e4,
          confidenceLevel: "High"
        },
        {
          id: "drillpipe_3500_g105",
          type: "Tubular",
          name: '3.500" G105 Drill Pipe',
          aliases: [
            "3-1/2 DP G105",
            "3.500 G105",
            "89\u043C\u043C G105",
            "\u0421\u0411\u0422 89 G105"
          ],
          description: "High strength drill pipe commonly used in medium-depth directional wells.",
          standards: [
            "API Spec 5DP",
            "API RP 7G",
            "\u0413\u041E\u0421\u0422 32696"
          ],
          temperature: {
            min: -20,
            max: 150,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 15200,
            unit: "psi"
          },
          chemicalComposition: [
            "Nickel-Chromium alloy steel"
          ],
          chemicalCompatibility: [
            "Standard drilling muds",
            "Completion fluids"
          ],
          usedInEquipment: [
            "Drill string",
            "Tapered workover strings"
          ],
          advantages: [
            "Balanced tensile-to-weight ratio",
            "Good fatigue resistance"
          ],
          limitations: [
            "Limited sour service compatibility"
          ],
          applications: [
            "Directional drilling",
            "Standard workovers"
          ],
          diagrams: [
            "tubing-connection"
          ],
          graphs: [],
          sources: [
            "API Spec 5DP 2nd Ed",
            "\u0413\u041E\u0421\u0422 32696"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          od: 3.5,
          weight: 13.3,
          inner_dia: 2.764,
          drift_id: 2.639,
          grade: "G105",
          tubular_type: "Drill Pipe",
          burst: 15200,
          collapse: 14500,
          tensile: 271e3,
          confidenceLevel: "High"
        },
        {
          id: "drillpipe_4500_x95",
          type: "Tubular",
          name: '4.500" X95 Drill Pipe',
          aliases: [
            "4-1/2 DP X95",
            "4.500 X95",
            "114\u043C\u043C X95",
            "\u0421\u0411\u0422 114 X95"
          ],
          description: "Medium-high strength drill pipe for standard deep well drilling.",
          standards: [
            "API Spec 5DP",
            "\u0413\u041E\u0421\u0422 32696"
          ],
          temperature: {
            min: -20,
            max: 160,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 14800,
            unit: "psi"
          },
          chemicalComposition: [
            "Chromium-Molybdenum Alloy Steel"
          ],
          chemicalCompatibility: [
            "Drilling muds",
            "Brines"
          ],
          usedInEquipment: [
            "Drill string",
            "Drill stem test strings"
          ],
          advantages: [
            "High ductility",
            "Good fatigue life in abrasive wells"
          ],
          limitations: [
            "Lower tensile limit than S135"
          ],
          applications: [
            "Intermediate hole section drilling",
            "Medium torque operations"
          ],
          diagrams: [
            "tubing-connection"
          ],
          graphs: [],
          sources: [
            "API Spec 5DP 2nd Ed"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2024",
          od: 4.5,
          weight: 16.6,
          inner_dia: 3.826,
          drift_id: 3.701,
          grade: "X95",
          tubular_type: "Drill Pipe",
          burst: 14800,
          collapse: 12800,
          tensile: 395e3,
          confidenceLevel: "High"
        },
        {
          id: "drillpipe_5000_s135",
          type: "Tubular",
          name: '5.000" S135 Drill Pipe',
          aliases: [
            "5 DP S135",
            "5.000 S135",
            "127\u043C\u043C S135",
            "\u0421\u0411\u0422 127 S135"
          ],
          description: "Ultra-high strength drill pipe for deep vertical and extended reach wells.",
          standards: [
            "API Spec 5DP",
            "API RP 7G",
            "\u0413\u041E\u0421\u0422 32696"
          ],
          temperature: {
            min: -20,
            max: 180,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 19100,
            unit: "psi"
          },
          chemicalComposition: [
            "Premium Nickel-Chromium-Molybdenum alloys"
          ],
          chemicalCompatibility: [
            "High-density drilling muds",
            "Brines",
            "Completion fluids"
          ],
          usedInEquipment: [
            "Drill string",
            "Workover strings"
          ],
          advantages: [
            "Maximum tensile limit",
            "High torsional capacity",
            "Excellent fatigue limits"
          ],
          limitations: [
            "Highly susceptible to sulfide stress cracking in H2S",
            "High cost"
          ],
          applications: [
            "Deep drilling",
            "Extended reach drilling (ERD)",
            "High torque operations"
          ],
          diagrams: [
            "tubing-connection"
          ],
          graphs: [],
          sources: [
            "API Spec 5DP 2nd Ed",
            "\u0413\u041E\u0421\u0422 32696"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          od: 5,
          weight: 19.5,
          inner_dia: 4.276,
          drift_id: 4.151,
          grade: "S135",
          tubular_type: "Drill Pipe",
          burst: 19100,
          collapse: 15600,
          tensile: 56e4,
          confidenceLevel: "High"
        },
        {
          id: "drillpipe_5500_s135",
          type: "Tubular",
          name: '5.500" S135 Drill Pipe',
          aliases: [
            "5-1/2 DP S135",
            "5.500 S135",
            "140\u043C\u043C S135",
            "\u0421\u0411\u0422 140 S135"
          ],
          description: "Ultra-heavy high capacity drill pipe for maximum torque and flow rate.",
          standards: [
            "API Spec 5DP",
            "\u0413\u041E\u0421\u0422 32696"
          ],
          temperature: {
            min: -20,
            max: 180,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 18200,
            unit: "psi"
          },
          chemicalComposition: [
            "Premium Ni-Cr-Mo Alloy Steel"
          ],
          chemicalCompatibility: [
            "Drilling muds",
            "Brines"
          ],
          usedInEquipment: [
            "Extended reach drill strings",
            "Heavy landing strings"
          ],
          advantages: [
            "Very high tensile rating",
            "Lower pressure drop due to large ID"
          ],
          limitations: [
            "Very heavy, requires high capacity rigs",
            "Extremely stiff"
          ],
          applications: [
            "Extended reach horizontal drilling",
            "Deep marine gas wells"
          ],
          diagrams: [
            "tubing-connection"
          ],
          graphs: [],
          sources: [
            "API Spec 5DP 2nd Ed"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2024",
          od: 5.5,
          weight: 21.9,
          inner_dia: 4.778,
          drift_id: 4.653,
          grade: "S135",
          tubular_type: "Drill Pipe",
          burst: 18200,
          collapse: 14900,
          tensile: 615e3,
          confidenceLevel: "High"
        },
        {
          id: "casing_4500_l80",
          type: "Tubular",
          name: '4.500" L80 Casing',
          aliases: [
            "4-1/2 L80",
            "4.5 L80",
            "114\u043C\u043C L80",
            "114 L80",
            "\u041E\u041A 114 L80"
          ],
          description: "API Specification 5CT grade L80 casing, commonly used for production casing strings in deep oil and gas wells.",
          standards: [
            "API Spec 5CT",
            "\u0413\u041E\u0421\u0422 31446"
          ],
          temperature: {
            min: -29,
            max: 150,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 8430,
            unit: "psi"
          },
          chemicalComposition: [
            "Carbon Steel (C-Mn) Quenched & Tempered"
          ],
          chemicalCompatibility: [
            "Produced oil",
            "Fresh water",
            "Brines",
            "Moderate H2S"
          ],
          usedInEquipment: [
            "Production casing strings",
            "Intermediate casing strings"
          ],
          advantages: [
            "Good H2S cracking resistance",
            "Quenched & Tempered grain structure",
            "High yield strength constraint"
          ],
          limitations: [
            "Requires chemical inhibition in sweet CO2 wells with high water cut"
          ],
          applications: [
            "Sour service well completions",
            "Production casing in medium/deep wells"
          ],
          diagrams: [
            "makeup-loss"
          ],
          graphs: [],
          sources: [
            "API Spec 5CT 10th Ed"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          od: 4.5,
          weight: 13.5,
          inner_dia: 3.92,
          drift_id: 3.795,
          grade: "L80",
          tubular_type: "Casing",
          burst: 8430,
          collapse: 8070,
          tensile: 315e3,
          confidenceLevel: "High"
        },
        {
          id: "casing_7000_l80",
          type: "Tubular",
          name: '7.000" L80 Casing',
          aliases: [
            "7 L80",
            "7.0 L80",
            "178\u043C\u043C L80",
            "178 L80",
            "\u041E\u041A 178 L80"
          ],
          description: "API Specification 5CT grade L80 casing for intermediate or production casing strings in deep reservoirs.",
          standards: [
            "API Spec 5CT",
            "\u0413\u041E\u0421\u0422 31446"
          ],
          temperature: {
            min: -29,
            max: 150,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 7240,
            unit: "psi"
          },
          chemicalComposition: [
            "Carbon Steel (C-Mn) Quenched & Tempered"
          ],
          chemicalCompatibility: [
            "Produced oil",
            "Fresh water",
            "Brines",
            "Moderate H2S"
          ],
          usedInEquipment: [
            "Production casing strings",
            "Intermediate casing strings",
            "Downhole liners"
          ],
          advantages: [
            "Excellent sulfide stress cracking (SSC) resistance",
            "Highly ductile"
          ],
          limitations: [
            "Susceptible to general weight loss corrosion in wet CO2"
          ],
          applications: [
            "Intermediate casing for deviated wells",
            "Sour production casing strings"
          ],
          diagrams: [
            "makeup-loss"
          ],
          graphs: [],
          sources: [
            "API Spec 5CT 10th Ed"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          od: 7,
          weight: 26,
          inner_dia: 6.276,
          drift_id: 6.151,
          grade: "L80",
          tubular_type: "Casing",
          burst: 7240,
          collapse: 5410,
          tensile: 604e3,
          confidenceLevel: "High"
        },
        {
          id: "casing_9625_p110",
          type: "Tubular",
          name: '9.625" P110 Casing',
          aliases: [
            "9-5/8 P110",
            "9.625 P110",
            "244\u043C\u043C P110",
            "244 P110",
            "\u041E\u041A 244 P110"
          ],
          description: "High-strength API Spec 5CT grade P110 casing for deep, high-pressure intermediate or production casing applications.",
          standards: [
            "API Spec 5CT",
            "\u0413\u041E\u0421\u0422 31446"
          ],
          temperature: {
            min: -20,
            max: 180,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 9380,
            unit: "psi"
          },
          chemicalComposition: [
            "Alloy Steel (Cr-Mo) Quenched & Tempered"
          ],
          chemicalCompatibility: [
            "Standard drilling muds",
            "Brines",
            "Sweet gas"
          ],
          usedInEquipment: [
            "Intermediate casing strings",
            "Production casing strings"
          ],
          advantages: [
            "Very high tensile and yield strength",
            "High collapse resistance for salt zone squeezing"
          ],
          limitations: [
            "Not suitable for sour service (susceptible to SSC)"
          ],
          applications: [
            "High-pressure intermediate casing runs",
            "HPHT vertical and deviated wells"
          ],
          diagrams: [
            "makeup-loss"
          ],
          graphs: [],
          sources: [
            "API Spec 5CT 10th Ed"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          od: 9.625,
          weight: 47,
          inner_dia: 8.681,
          drift_id: 8.525,
          grade: "P110",
          tubular_type: "Casing",
          burst: 9380,
          collapse: 5300,
          tensile: 1495e3,
          confidenceLevel: "High"
        },
        {
          id: "casing_13375_n80",
          type: "Tubular",
          name: '13.375" N80 Casing',
          aliases: [
            "13-3/8 N80",
            "13.375 N80",
            "340\u043C\u043C N80",
            "340 N80",
            "\u041E\u041A 340 N80"
          ],
          description: "Medium-strength API Spec 5CT grade N80 casing, typically used for surface or intermediate casing strings.",
          standards: [
            "API Spec 5CT",
            "\u0413\u041E\u0421\u0422 31446"
          ],
          temperature: {
            min: -20,
            max: 120,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 3450,
            unit: "psi"
          },
          chemicalComposition: [
            "Medium carbon steel"
          ],
          chemicalCompatibility: [
            "Drilling muds",
            "Fresh water",
            "Cement"
          ],
          usedInEquipment: [
            "Surface casing string",
            "Intermediate casing string"
          ],
          advantages: [
            "Cost-effective intermediate strength option",
            "Good reliability in vertical sections"
          ],
          limitations: [
            "Highly susceptible to SSC in sour service",
            "Lower collapse rating"
          ],
          applications: [
            "Surface hole isolation",
            "Intermediate casing strings in shallow to medium depth wells"
          ],
          diagrams: [
            "makeup-loss"
          ],
          graphs: [],
          sources: [
            "API Spec 5CT 10th Ed"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          od: 13.375,
          weight: 68,
          inner_dia: 12.415,
          drift_id: 12.259,
          grade: "N80",
          tubular_type: "Casing",
          burst: 3450,
          collapse: 1950,
          tensile: 1535e3,
          confidenceLevel: "High"
        },
        {
          id: "tubing_2875_j55",
          type: "Tubular",
          name: '2.875" J55 Tubing',
          aliases: [
            "2-7/8 J55",
            "2.875 J55",
            "73\u043C\u043C J55",
            "73 J55",
            "\u041D\u041A\u0422 73 J55"
          ],
          description: "Standard API Specification 5CT grade J55 tubing for light-duty production and injection wells.",
          standards: [
            "API Spec 5CT",
            "\u0413\u041E\u0421\u0422 31446"
          ],
          temperature: {
            min: -20,
            max: 120,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 7260,
            unit: "psi"
          },
          chemicalComposition: [
            "Carbon Steel (C-Mn)"
          ],
          chemicalCompatibility: [
            "Produced oil",
            "Fresh water",
            "Sweet gas"
          ],
          usedInEquipment: [
            "Standard completion strings",
            "Water injection strings"
          ],
          advantages: [
            "Highly economic",
            "Standard global availability"
          ],
          limitations: [
            "Vulnerable to sour corrosion",
            "Low tensile capacity"
          ],
          applications: [
            "Shallow vertical oil production wells",
            "Water injection wells"
          ],
          diagrams: [
            "tubing-connection"
          ],
          graphs: [],
          sources: [
            "API Spec 5CT 10th Ed"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          od: 2.875,
          weight: 6.5,
          inner_dia: 2.441,
          drift_id: 2.347,
          grade: "J55",
          tubular_type: "Tubing",
          burst: 7260,
          collapse: 7680,
          tensile: 145e3,
          confidenceLevel: "High"
        },
        {
          id: "tubing_3500_l80",
          type: "Tubular",
          name: '3.500" L80 Tubing',
          aliases: [
            "3-1/2 L80",
            "3.5 L80",
            "89\u043C\u043C L80",
            "89 L80",
            "\u041D\u041A\u0422 89 L80"
          ],
          description: "API Specification 5CT grade L80 production tubing for high-pressure or sour well completions.",
          standards: [
            "API Spec 5CT",
            "\u0413\u041E\u0421\u0422 31446"
          ],
          temperature: {
            min: -29,
            max: 150,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 10160,
            unit: "psi"
          },
          chemicalComposition: [
            "Carbon Steel (C-Mn) Quenched & Tempered"
          ],
          chemicalCompatibility: [
            "Produced oil",
            "Brines",
            "Sour gas"
          ],
          usedInEquipment: [
            "Standard completion strings",
            "Gas lift strings",
            "ESP completions"
          ],
          advantages: [
            "Sour service NACE MR0175 compliant",
            "High mechanical envelope"
          ],
          limitations: [
            "Requires chemical inhibition for CO2 and high water cuts"
          ],
          applications: [
            "Sour gas and oil production wells",
            "HPHT completions"
          ],
          diagrams: [
            "tubing-connection"
          ],
          graphs: [],
          sources: [
            "API Spec 5CT 10th Ed"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          od: 3.5,
          weight: 9.3,
          inner_dia: 2.992,
          drift_id: 2.867,
          grade: "L80",
          tubular_type: "Tubing",
          burst: 10160,
          collapse: 10540,
          tensile: 271e3,
          confidenceLevel: "High"
        },
        {
          id: "drillpipe_5000_g105",
          type: "Tubular",
          name: '5.000" G105 Drill Pipe',
          aliases: [
            "5 G105",
            "5.0 G105",
            "127\u043C\u043C G105",
            "127 G105",
            "\u0411\u0422 127 G105"
          ],
          description: "High-strength API Spec 5DP grade G105 drill pipe designed for heavy-duty drilling operations in medium to deep wells.",
          standards: [
            "API Spec 5DP",
            "ISO 11961"
          ],
          temperature: {
            min: -20,
            max: 150,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 16500,
            unit: "psi"
          },
          chemicalComposition: [
            "Alloy Steel Quenched & Tempered"
          ],
          chemicalCompatibility: [
            "Drilling fluids",
            "Completion brines",
            "Fresh water"
          ],
          usedInEquipment: [
            "Drill string",
            "Workover strings"
          ],
          advantages: [
            "High torsional yield capacity",
            "Outstanding tensile load limit"
          ],
          limitations: [
            "Susceptible to Sulfide Stress Cracking in low-pH sour fluids"
          ],
          applications: [
            "Rotary drilling strings",
            "High-curvature deviated well drilling"
          ],
          diagrams: [
            "tubing-connection"
          ],
          graphs: [],
          sources: [
            "API Spec 5DP 2nd Ed"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2020",
          od: 5,
          weight: 19.5,
          inner_dia: 4.276,
          drift_id: 4.151,
          grade: "G105",
          tubular_type: "Drill Pipe",
          burst: 16500,
          collapse: 15300,
          tensile: 501e3,
          confidenceLevel: "High"
        }
      ],
      threads: [
        {
          id: "thread_eue_2875",
          type: "Thread",
          name: "EUE (External Upset End)",
          aliases: [
            "eue",
            "api eue",
            "\u0432\u044B\u0441\u0430\u0436\u0435\u043D\u043D\u0430\u044F \u0440\u0435\u0437\u044C\u0431\u0430",
            "\u0440\u0435\u0437\u044C\u0431\u0430 \u043D\u043A\u0442\u0432"
          ],
          description: "Standard API connection with external upset on tubing ends for standard oilfield completions.",
          standards: [
            "API Spec 5B",
            "\u0413\u041E\u0421\u0422 633"
          ],
          temperature: {
            min: -50,
            max: 180,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 1e4,
            unit: "psi"
          },
          chemicalComposition: [],
          chemicalCompatibility: [
            "API modified thread compounds",
            "Inhibitors"
          ],
          usedInEquipment: [
            "Tubing strings",
            "Pup joints",
            "Flow couplings"
          ],
          advantages: [
            "Easy to run",
            "High joint strength due to upset",
            "Highly cost effective"
          ],
          limitations: [
            "Upset increases outer diameter",
            "Not gas-tight (interference seal only)"
          ],
          applications: [
            "Standard oil and gas wells",
            "Low-pressure production completions"
          ],
          diagrams: [
            "thread-anatomy"
          ],
          graphs: [
            "torque_progression_eue"
          ],
          sources: [
            "API Spec 5B 16th Ed",
            "\u0413\u041E\u0421\u0422 633"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2023",
          connection_type: "API Tubing Upset",
          torque_range: "1,650 - 2,200 ft-lbs",
          turns: "4.5 - 5.5",
          makeup_loss: "2.25 in",
          standoff: "1.5 threads",
          drift: "2.347 in",
          seal_type: "Thread interference seal",
          running_notes: "Use API modified thread compound. Clean pins and boxes thoroughly before stabbing.",
          confidenceLevel: "High",
          torque_envelope: "Standard API envelope.",
          gas_tight_suitability: "Not rated for gas pressure, interference seal only.",
          compression_tension_behavior: "Standard tension efficiency.",
          galling_risks: "Low.",
          running_recommendations: "Follow API running guidelines.",
          compatible_lubricants: "Standard API thread compound.",
          field_assembly_notes: "Standard oilfield procedures.",
          typical_failures: "Leakage under gas pressure.",
          oem_references: "Standard specifications.",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "API Specs"
            ],
            verificationDate: "2026-06"
          },
          connection_type_ru: "\u0412\u044B\u0441\u0430\u0436\u0435\u043D\u043D\u043E\u0435 API \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435 \u0434\u043B\u044F \u041D\u041A\u0422",
          seal_type_ru: "\u0420\u0435\u0437\u044C\u0431\u043E\u0432\u043E\u0439 \u043D\u0430\u0442\u044F\u0433 (\u0443\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u0435 \u043F\u043E \u0432\u0438\u0442\u043A\u0430\u043C)",
          running_notes_ru: "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u0440\u0435\u0437\u044C\u0431\u043E\u0432\u0443\u044E \u0441\u043C\u0430\u0437\u043A\u0443 \u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u0430 API. \u0422\u0449\u0430\u0442\u0435\u043B\u044C\u043D\u043E \u043E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u043D\u0438\u043F\u043F\u0435\u043B\u044C \u0438 \u043C\u0443\u0444\u0442\u0443 \u043F\u0435\u0440\u0435\u0434 \u0441\u0432\u0438\u043D\u0447\u0438\u0432\u0430\u043D\u0438\u0435\u043C."
        },
        {
          id: "thread_btc_9625",
          type: "Thread",
          name: "BTC (Buttress Thread Connection)",
          aliases: [
            "btc",
            "buttress",
            "\u0442\u0440\u0430\u043F\u0435\u0446\u0435\u0438\u0434\u0430\u043B\u044C\u043D\u0430\u044F \u0440\u0435\u0437\u044C\u0431\u0430"
          ],
          description: "API standard casing connection with buttress profile, offering high tensile strength.",
          standards: [
            "API Spec 5B",
            "\u0413\u041E\u0421\u0422 632"
          ],
          temperature: {
            min: -50,
            max: 200,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 7500,
            unit: "psi"
          },
          chemicalComposition: [],
          chemicalCompatibility: [
            "Thread compounds"
          ],
          usedInEquipment: [
            "Casing strings"
          ],
          advantages: [
            "High tensile efficiency",
            "Good resistance to bending and compression"
          ],
          limitations: [
            "Not gas-tight under high pressure gas (requires liquid/interference seal)"
          ],
          applications: [
            "Intermediate and production casing strings in sweet wells"
          ],
          diagrams: [
            "makeup-loss"
          ],
          graphs: [],
          sources: [
            "API Spec 5B 16th Ed"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2023",
          connection_type: "API Casing Buttress",
          torque_range: "8,500 - 11,200 ft-lbs",
          turns: "3.5 - 4.5",
          makeup_loss: "3.62 in",
          standoff: "1.0 threads",
          drift: "8.679 in",
          seal_type: "Mechanical thread interference",
          running_notes: "Align accurately to prevent cross-threading. Control final makeup torque carefully.",
          confidenceLevel: "High",
          torque_envelope: "Standard API envelope.",
          gas_tight_suitability: "Not rated for gas pressure, interference seal only.",
          compression_tension_behavior: "Standard tension efficiency.",
          galling_risks: "Low.",
          running_recommendations: "Follow API running guidelines.",
          compatible_lubricants: "Standard API thread compound.",
          field_assembly_notes: "Standard oilfield procedures.",
          typical_failures: "Leakage under gas pressure.",
          oem_references: "Standard specifications.",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "API Specs"
            ],
            verificationDate: "2026-06"
          },
          connection_type_ru: "\u0422\u0440\u0430\u043F\u0435\u0446\u0435\u0438\u0434\u0430\u043B\u044C\u043D\u0430\u044F API \u043E\u0431\u0441\u0430\u0434\u043D\u0430\u044F \u0440\u0435\u0437\u044C\u0431\u0430 (Buttress)",
          seal_type_ru: "\u041C\u0435\u0445\u0430\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0440\u0435\u0437\u044C\u0431\u043E\u0432\u043E\u0439 \u043D\u0430\u0442\u044F\u0433",
          running_notes_ru: "\u0412\u044B\u0440\u0430\u0432\u043D\u0438\u0432\u0430\u0442\u044C \u0441\u043E\u043E\u0441\u043D\u043E \u0432\u043E \u0438\u0437\u0431\u0435\u0436\u0430\u043D\u0438\u0435 \u043F\u043E\u0432\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u044F \u0432\u0438\u0442\u043A\u043E\u0432. \u041A\u043E\u043D\u0442\u0440\u043E\u043B\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043A\u043E\u043D\u0435\u0447\u043D\u044B\u0439 \u043C\u043E\u043C\u0435\u043D\u0442 \u0441\u0432\u0438\u043D\u0447\u0438\u0432\u0430\u043D\u0438\u044F."
        },
        {
          id: "thread_ottm_gost",
          type: "Thread",
          name: "\u041E\u0422\u0422\u041C (\u0413\u041E\u0421\u0422 632)",
          aliases: [
            "\u043E\u0442\u0442\u043C",
            "ottm",
            "\u0440\u0435\u0437\u044C\u0431\u0430 \u043E\u0442\u0442\u043C",
            "\u0433\u043E\u0441\u0442 632"
          ],
          description: "Standard Russian trapezoidal thread connection for casing strings.",
          standards: [
            "\u0413\u041E\u0421\u0422 632-80"
          ],
          temperature: {
            min: -60,
            max: 180,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 6500,
            unit: "psi"
          },
          chemicalComposition: [],
          chemicalCompatibility: [
            "Standard grease (\u0420-402, \u0420-113)"
          ],
          usedInEquipment: [
            "\u041E\u0431\u0441\u0430\u0434\u043D\u044B\u0435 \u043A\u043E\u043B\u043E\u043D\u043D\u044B"
          ],
          advantages: [
            "\u0412\u044B\u0441\u043E\u043A\u0430\u044F \u043F\u0440\u043E\u0447\u043D\u043E\u0441\u0442\u044C \u043D\u0430 \u0440\u0430\u0441\u0442\u044F\u0436\u0435\u043D\u0438\u0435",
            "\u041F\u0440\u043E\u0441\u0442\u043E\u0439 \u043C\u043E\u043D\u0442\u0430\u0436 \u043D\u0430 \u0431\u0443\u0440\u043E\u0432\u044B\u0445 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0430\u0445 \u0420\u0424"
          ],
          limitations: [
            "\u041D\u0435 \u043E\u0431\u0435\u0441\u043F\u0435\u0447\u0438\u0432\u0430\u0435\u0442 \u0433\u0435\u0440\u043C\u0435\u0442\u0438\u0447\u043D\u043E\u0441\u0442\u044C \u043F\u043E \u0433\u0430\u0437\u0443 \u0432\u044B\u0441\u043E\u043A\u043E\u0433\u043E \u0434\u0430\u0432\u043B\u0435\u043D\u0438\u044F"
          ],
          applications: [
            "\u0421\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u0441\u0442\u0432\u043E \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C\u043D\u044B\u0445 \u0438 \u043D\u0430\u043A\u043B\u043E\u043D\u043D\u043E-\u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043D\u044B\u0445 \u0441\u043A\u0432\u0430\u0436\u0438\u043D \u043D\u0430 \u0441\u0443\u0448\u0435"
          ],
          diagrams: [
            "makeup-loss"
          ],
          graphs: [],
          sources: [
            "\u0413\u041E\u0421\u0422 632-80"
          ],
          lastUpdated: "2026-06",
          revisionDate: "1980",
          connection_type: "\u0413\u041E\u0421\u0422 \u041A\u043E\u043D\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0422\u0440\u0430\u043F\u0435\u0446\u0435\u0438\u0434\u0430\u043B\u044C\u043D\u0430\u044F",
          torque_range: "6,500 - 8,800 \u041D\xB7\u043C",
          turns: "3.0 - 4.0",
          makeup_loss: "85 \u043C\u043C",
          standoff: "1.0 - 2.0 \u043D\u0438\u0442\u043A\u0438",
          drift: "220 \u043C\u043C",
          seal_type: "\u0420\u0435\u0437\u044C\u0431\u043E\u0432\u043E\u0435 \u0441\u043E\u043F\u0440\u044F\u0436\u0435\u043D\u0438\u0435 \u0441 \u0443\u043F\u043B\u043E\u0442\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u0441\u043C\u0430\u0437\u043A\u043E\u0439",
          running_notes: "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u0441\u043C\u0430\u0437\u043A\u0443 \u0420-402. \u041A\u043E\u043D\u0442\u0440\u043E\u043B\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043D\u0430\u0442\u044F\u0433 \u043F\u043E \u0442\u043E\u0440\u0446\u0443 \u043C\u0443\u0444\u0442\u044B.",
          confidenceLevel: "High",
          torque_envelope: "Standard API envelope.",
          gas_tight_suitability: "Not rated for gas pressure, interference seal only.",
          compression_tension_behavior: "Standard tension efficiency.",
          galling_risks: "Low.",
          running_recommendations: "Follow API running guidelines.",
          compatible_lubricants: "Standard API thread compound.",
          field_assembly_notes: "Standard oilfield procedures.",
          typical_failures: "Leakage under gas pressure.",
          oem_references: "Standard specifications.",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "API Specs"
            ],
            verificationDate: "2026-06"
          },
          connection_type_ru: "\u0413\u041E\u0421\u0422 \u041A\u043E\u043D\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0422\u0440\u0430\u043F\u0435\u0446\u0435\u0438\u0434\u0430\u043B\u044C\u043D\u0430\u044F",
          seal_type_ru: "\u0420\u0435\u0437\u044C\u0431\u043E\u0432\u043E\u0435 \u0441\u043E\u043F\u0440\u044F\u0436\u0435\u043D\u0438\u0435 \u0441 \u0443\u043F\u043B\u043E\u0442\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u0441\u043C\u0430\u0437\u043A\u043E\u0439",
          running_notes_ru: "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u0441\u043C\u0430\u0437\u043A\u0443 \u0420-402. \u041A\u043E\u043D\u0442\u0440\u043E\u043B\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043D\u0430\u0442\u044F\u0433 \u043F\u043E \u0442\u043E\u0440\u0446\u0443 \u043C\u0443\u0444\u0442\u044B."
        },
        {
          id: "thread_ottg_gost",
          type: "Thread",
          name: "\u041E\u0422\u0422\u0413 (\u0413\u041E\u0421\u0422 632)",
          aliases: [
            "\u043E\u0442\u0442\u0433",
            "ottg",
            "\u0440\u0435\u0437\u044C\u0431\u0430 \u043E\u0442\u0442\u0433"
          ],
          description: "Russian premium casing connection with metal-to-metal seal and torque shoulder.",
          standards: [
            "\u0413\u041E\u0421\u0422 632-80"
          ],
          temperature: {
            min: -60,
            max: 220,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 12e3,
            unit: "psi"
          },
          chemicalComposition: [],
          chemicalCompatibility: [
            "Grease",
            "Inhibitors"
          ],
          usedInEquipment: [
            "\u042D\u043A\u0441\u043F\u043B\u0443\u0430\u0442\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0435 \u043A\u043E\u043B\u043E\u043D\u043D\u044B",
            "\u0425\u0432\u043E\u0441\u0442\u043E\u0432\u0438\u043A\u0438"
          ],
          advantages: [
            "\u0413\u0435\u0440\u043C\u0435\u0442\u0438\u0447\u043D\u043E\u0441\u0442\u044C \u043A\u043B\u0430\u0441\u0441\u0430 \u043C\u0435\u0442\u0430\u043B\u043B-\u043C\u0435\u0442\u0430\u043B\u043B",
            "\u0421\u0442\u043E\u0439\u043A\u043E\u0441\u0442\u044C \u043A \u0432\u044B\u0441\u043E\u043A\u043E\u043C\u0443 \u0432\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0435\u043C\u0443 \u0434\u0430\u0432\u043B\u0435\u043D\u0438\u044E \u0433\u0430\u0437\u0430"
          ],
          limitations: [
            "\u0427\u0443\u0432\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u043A \u0437\u0430\u0433\u0440\u044F\u0437\u043D\u0435\u043D\u0438\u044E \u0440\u0435\u0437\u044C\u0431\u044B \u043F\u0435\u0440\u0435\u0434 \u0441\u0432\u0438\u043D\u0447\u0438\u0432\u0430\u043D\u0438\u0435\u043C"
          ],
          applications: [
            "\u0413\u0430\u0437\u043E\u0432\u044B\u0435 \u0438 \u0433\u0430\u0437\u043E\u043A\u043E\u043D\u0434\u0435\u043D\u0441\u0430\u0442\u043D\u044B\u0435 \u0441\u043A\u0432\u0430\u0436\u0438\u043D\u044B, \u0433\u043B\u0443\u0431\u043E\u043A\u0438\u0435 \u0441\u043A\u0432\u0430\u0436\u0438\u043D\u044B"
          ],
          diagrams: [
            "seal-surfaces"
          ],
          graphs: [],
          sources: [
            "\u0413\u041E\u0421\u0422 632-80"
          ],
          lastUpdated: "2026-06",
          revisionDate: "1980",
          connection_type: "\u0420\u0424 \u041F\u0440\u0435\u043C\u0438\u0443\u043C \u041C\u0435\u0442\u0430\u043B\u043B-\u041C\u0435\u0442\u0430\u043B\u043B",
          torque_range: "7,800 - 10,500 \u041D\xB7\u043C",
          turns: "4.0 - 5.0",
          makeup_loss: "90 \u043C\u043C",
          standoff: "0 (\u0443\u043F\u043E\u0440 \u0432 \u0443\u0441\u0442\u0443\u043F)",
          drift: "220 \u043C\u043C",
          seal_type: "\u041A\u043E\u043D\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u0440\u0430\u0434\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u0443\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u0435 \u043C\u0435\u0442\u0430\u043B\u043B-\u043C\u0435\u0442\u0430\u043B\u043B",
          running_notes: "\u0422\u0449\u0430\u0442\u0435\u043B\u044C\u043D\u043E \u043E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u0443\u0437\u0435\u043B \u0443\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u044F. \u0418\u0437\u0431\u0435\u0433\u0430\u0442\u044C \u0441\u043E\u0443\u0434\u0430\u0440\u0435\u043D\u0438\u044F \u043F\u0440\u0438 \u0441\u043F\u0443\u0441\u043A\u0435.",
          confidenceLevel: "High",
          torque_envelope: "Standard API envelope.",
          gas_tight_suitability: "Not rated for gas pressure, interference seal only.",
          compression_tension_behavior: "Standard tension efficiency.",
          galling_risks: "Low.",
          running_recommendations: "Follow API running guidelines.",
          compatible_lubricants: "Standard API thread compound.",
          field_assembly_notes: "Standard oilfield procedures.",
          typical_failures: "Leakage under gas pressure.",
          oem_references: "Standard specifications.",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "API Specs"
            ],
            verificationDate: "2026-06"
          },
          connection_type_ru: "\u0420\u0424 \u041F\u0440\u0435\u043C\u0438\u0443\u043C \u041C\u0435\u0442\u0430\u043B\u043B-\u041C\u0435\u0442\u0430\u043B\u043B",
          seal_type_ru: "\u041A\u043E\u043D\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u0440\u0430\u0434\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u0443\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u0435 \u043C\u0435\u0442\u0430\u043B\u043B-\u043C\u0435\u0442\u0430\u043B\u043B",
          running_notes_ru: "\u0422\u0449\u0430\u0442\u0435\u043B\u044C\u043D\u043E \u043E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u0443\u0437\u0435\u043B \u0443\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u044F. \u0418\u0437\u0431\u0435\u0433\u0430\u0442\u044C \u0441\u043E\u0443\u0434\u0430\u0440\u0435\u043D\u0438\u044F \u043F\u0440\u0438 \u0441\u043F\u0443\u0441\u043A\u0435."
        },
        {
          id: "thread_vam_top",
          type: "Thread",
          name: "VAM TOP",
          aliases: [
            "vam top",
            "vam",
            "\u0432\u0430\u043C \u0442\u043E\u043F"
          ],
          description: "Premium gas-tight threaded connection for casing and tubing with metal-to-metal seal.",
          standards: [
            "ISO 13679 CAL-IV"
          ],
          temperature: {
            min: -50,
            max: 240,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 15e3,
            unit: "psi"
          },
          chemicalComposition: [],
          chemicalCompatibility: [
            "Bestolife compounds",
            "Premium greases"
          ],
          usedInEquipment: [
            "High pressure tubing strings",
            "Production casing"
          ],
          advantages: [
            "100% gas-tight performance under ISO 13679 CAL-IV",
            "Excellent torque capacity"
          ],
          limitations: [
            "Expensive",
            "Requires specialized field service representatives for running"
          ],
          applications: [
            "HPHT wells",
            "Critical gas wells",
            "Deep water projects"
          ],
          diagrams: [
            "seal-surfaces"
          ],
          graphs: [
            "torque_progression_eue"
          ],
          sources: [
            "Vallourec Connection Guide"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2024",
          connection_type: "European Premium Metal-Metal",
          torque_range: "3,200 - 4,100 ft-lbs",
          turns: "5.0 - 6.0",
          makeup_loss: "2.85 in",
          standoff: "0 (Shoulder contact)",
          drift: "2.347 in",
          seal_type: "Metal-to-metal radial seal",
          running_notes: "Use VAM-approved thread compound. Torque-turn monitoring is highly recommended.",
          confidenceLevel: "High",
          torque_envelope: "CAL-IV qualified, max torque up to 8,500 ft-lbs.",
          gas_tight_suitability: "100% gas-tight under ISO 13679 CAL-IV.",
          compression_tension_behavior: "Compression load capability equals 100% of pipe body yield.",
          galling_risks: "High risk in CRA materials, moderate risk in carbon steels.",
          running_recommendations: "Use computer-aided torque-turn analyzer.",
          compatible_lubricants: "API modified compound, metal-free premium greases.",
          field_assembly_notes: "Inspect metal seal area for scratches before stabbing.",
          typical_failures: "Metal seal scratching, galling.",
          oem_references: "Vallourec Connection Guide",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "Vallourec guide"
            ],
            verificationDate: "2026-06"
          },
          connection_type_ru: "\u0415\u0432\u0440\u043E\u043F\u0435\u0439\u0441\u043A\u043E\u0435 \u043F\u0440\u0435\u043C\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435 \u0441 \u0443\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u0435\u043C \u043C\u0435\u0442\u0430\u043B\u043B-\u043C\u0435\u0442\u0430\u043B\u043B",
          seal_type_ru: "\u0420\u0430\u0434\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u0443\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u0435 \u043C\u0435\u0442\u0430\u043B\u043B-\u043C\u0435\u0442\u0430\u043B\u043B",
          running_notes_ru: "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u0441\u043C\u0430\u0437\u043A\u0443, \u043E\u0434\u043E\u0431\u0440\u0435\u043D\u043D\u0443\u044E VAM. \u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u0442\u0441\u044F \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u043F\u0440\u0438\u0431\u043E\u0440 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044F \u043C\u043E\u043C\u0435\u043D\u0442\u0430-\u043E\u0431\u043E\u0440\u043E\u0442\u0430."
        },
        {
          id: "thread_tenaris_blue",
          type: "Thread",
          name: "TenarisHydril Blue",
          aliases: [
            "tenaris blue",
            "blue connection",
            "\u0442\u0435\u043D\u0430\u0440\u0438\u0441 \u0431\u043B\u044E"
          ],
          description: "Premium gas-tight connection with double torque shoulder and high compression rating.",
          standards: [
            "ISO 13679 CAL-IV"
          ],
          temperature: {
            min: -50,
            max: 240,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 16e3,
            unit: "psi"
          },
          chemicalComposition: [],
          chemicalCompatibility: [
            "Dope-free technologies",
            "Standard greases"
          ],
          usedInEquipment: [
            "Production casing",
            "HPHT completions"
          ],
          advantages: [
            "CAL-IV certified",
            "Excellent resistance to high compression",
            "Easy stabbing"
          ],
          limitations: [
            "High premium price",
            "High sensitivity to misalignment during stab"
          ],
          applications: [
            "Extended reach wells (ERD)",
            "High pressure gas injections"
          ],
          diagrams: [
            "seal-surfaces"
          ],
          graphs: [],
          sources: [
            "Tenaris Tubulars Guide"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2024",
          connection_type: "Tenaris Premium Gas-Tight",
          torque_range: "3,400 - 4,500 ft-lbs",
          turns: "5.5 - 6.5",
          makeup_loss: "3.10 in",
          standoff: "0 (Torque shoulder)",
          drift: "2.347 in",
          seal_type: "Sphere-to-cone metal-to-metal seal",
          running_notes: "Clean thoroughly. Apply dope uniformly over the threads, avoiding excessive build-up on seal.",
          confidenceLevel: "High",
          torque_envelope: "CAL-IV qualified, high torque capacity.",
          gas_tight_suitability: "CAL-IV certified gas-tight.",
          compression_tension_behavior: "Compression capability is 100% of pipe body.",
          galling_risks: "Moderate.",
          running_recommendations: "Run slowly, align precisely.",
          compatible_lubricants: "Tenaris approved lubricants.",
          field_assembly_notes: "Clean box carefully to remove shipping grease.",
          typical_failures: "Cross-threading.",
          oem_references: "Tenaris Guide",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "Tenaris guide"
            ],
            verificationDate: "2026-06"
          },
          connection_type_ru: "Tenaris \u041F\u0440\u0435\u043C\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u0433\u0430\u0437\u043E\u0433\u0435\u0440\u043C\u0435\u0442\u0438\u0447\u043D\u043E\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435",
          seal_type_ru: "\u0423\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u0435 \u0441\u0444\u0435\u0440\u0430-\u043A\u043E\u043D\u0443\u0441 \u043C\u0435\u0442\u0430\u043B\u043B-\u043C\u0435\u0442\u0430\u043B\u043B",
          running_notes_ru: "\u0422\u0449\u0430\u0442\u0435\u043B\u044C\u043D\u043E \u043E\u0447\u0438\u0441\u0442\u0438\u0442\u044C. \u041D\u0430\u043D\u043E\u0441\u0438\u0442\u044C \u0440\u0435\u0437\u044C\u0431\u043E\u0432\u0443\u044E \u0441\u043C\u0430\u0437\u043A\u0443 \u0440\u0430\u0432\u043D\u043E\u043C\u0435\u0440\u043D\u043E, \u0438\u0437\u0431\u0435\u0433\u0430\u044F \u0438\u0437\u0431\u044B\u0442\u043A\u0430 \u043D\u0430 \u0443\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u0438."
        },
        {
          id: "thread_tmk_up",
          type: "Thread",
          name: "TMK UP (\u0420\u0424 Premium)",
          aliases: [
            "tmk up",
            "\u0442\u043C\u043A \u0430\u043F",
            "\u0440\u0435\u0437\u044C\u0431\u0430 \u0442\u043C\u043A"
          ],
          description: "Russian premium gas-tight connection family for tubing and casing with metal-to-metal seals.",
          standards: [
            "\u0413\u041E\u0421\u0422 31446",
            "ISO 13679 CAL-IV"
          ],
          temperature: {
            min: -60,
            max: 200,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 14e3,
            unit: "psi"
          },
          chemicalComposition: [],
          chemicalCompatibility: [
            "\u0420-402, \u0420-113, Thread dopes"
          ],
          usedInEquipment: [
            "\u041A\u043E\u043B\u043E\u043D\u043D\u044B \u041D\u041A\u0422",
            "\u042D\u043A\u0441\u043F\u043B\u0443\u0430\u0442\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0435 \u043E\u0431\u0441\u0430\u0434\u043D\u044B\u0435 \u043A\u043E\u043B\u043E\u043D\u043D\u044B"
          ],
          advantages: [
            "\u0412\u044B\u0441\u043E\u043A\u0430\u044F \u0441\u043E\u043F\u0440\u043E\u0442\u0438\u0432\u043B\u044F\u0435\u043C\u043E\u0441\u0442\u044C \u043A\u0440\u0443\u0442\u044F\u0449\u0435\u043C\u0443 \u043C\u043E\u043C\u0435\u043D\u0442\u0443",
            "\u041E\u0442\u0435\u0447\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0435 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E (\u0437\u0430\u043C\u0435\u0449\u0435\u043D\u0438\u0435 \u0438\u043C\u043F\u043E\u0440\u0442\u0430)"
          ],
          limitations: [
            "\u0422\u0440\u0435\u0431\u0443\u0435\u0442 \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u0446\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0445 \u043A\u043B\u044E\u0447\u0435\u0439 \u0434\u043B\u044F \u0441\u0432\u0438\u043D\u0447\u0438\u0432\u0430\u043D\u0438\u044F"
          ],
          applications: [
            "\u0421\u043A\u0432\u0430\u0436\u0438\u043D\u044B \u0441 \u041C\u0413\u0420\u041F",
            "\u041D\u0430\u043A\u043B\u043E\u043D\u043D\u043E-\u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043D\u043E\u0435 \u0431\u0443\u0440\u0435\u043D\u0438\u0435 \u043D\u0430 \u043C\u0435\u0441\u0442\u043E\u0440\u043E\u0436\u0434\u0435\u043D\u0438\u044F\u0445 \u0420\u0424"
          ],
          diagrams: [
            "seal-surfaces"
          ],
          graphs: [],
          sources: [
            "\u041A\u0430\u0442\u0430\u043B\u043E\u0433 \u043F\u0440\u0435\u043C\u0438\u0443\u043C-\u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0439 \u0422\u041C\u041A"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          connection_type: "\u0420\u0424 \u041F\u0440\u0435\u043C\u0438\u0443\u043C \u0413\u0430\u0437\u043E\u0433\u0435\u0440\u043C\u0435\u0442\u0438\u0447\u043D\u043E\u0435",
          torque_range: "2,800 - 3,700 \u041D\xB7\u043C",
          turns: "4.0 - 5.0",
          makeup_loss: "78 \u043C\u043C",
          standoff: "0 (\u0423\u043F\u043E\u0440 \u0432 \u0442\u043E\u0440\u0435\u0446)",
          drift: "73 \u043C\u043C",
          seal_type: "\u0420\u0430\u0434\u0438\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u043E\u043D\u0442\u0430\u043A\u0442 \u043C\u0435\u0442\u0430\u043B\u043B-\u043C\u0435\u0442\u0430\u043B\u043B",
          running_notes: "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043F\u0440\u0438\u0431\u043E\u0440 \u0434\u043B\u044F \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044F \u043C\u043E\u043C\u0435\u043D\u0442\u0430-\u043E\u0431\u043E\u0440\u043E\u0442\u0430.",
          confidenceLevel: "High",
          torque_envelope: "Standard API envelope.",
          gas_tight_suitability: "Not rated for gas pressure, interference seal only.",
          compression_tension_behavior: "Standard tension efficiency.",
          galling_risks: "Low.",
          running_recommendations: "Follow API running guidelines.",
          compatible_lubricants: "Standard API thread compound.",
          field_assembly_notes: "Standard oilfield procedures.",
          typical_failures: "Leakage under gas pressure.",
          oem_references: "Standard specifications.",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "API Specs"
            ],
            verificationDate: "2026-06"
          },
          connection_type_ru: "\u0420\u0424 \u041F\u0440\u0435\u043C\u0438\u0443\u043C \u0413\u0430\u0437\u043E\u0433\u0435\u0440\u043C\u0435\u0442\u0438\u0447\u043D\u043E\u0435",
          seal_type_ru: "\u0420\u0430\u0434\u0438\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u043E\u043D\u0442\u0430\u043A\u0442 \u043C\u0435\u0442\u0430\u043B\u043B-\u043C\u0435\u0442\u0430\u043B\u043B",
          running_notes_ru: "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043F\u0440\u0438\u0431\u043E\u0440 \u0434\u043B\u044F \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044F \u043C\u043E\u043C\u0435\u043D\u0442\u0430-\u043E\u0431\u043E\u0440\u043E\u0442\u0430."
        },
        {
          id: "thread_tp_cq",
          type: "Thread",
          name: "TP-CQ (\u041A\u0438\u0442\u0430\u0439 Premium)",
          aliases: [
            "tp-cq",
            "tpcq",
            "\u043A\u0438\u0442\u0430\u0439\u0441\u043A\u0438\u0439 \u043F\u0440\u0435\u043C\u0438\u0443\u043C"
          ],
          description: "Chinese premium connection with high torque capacity and metal-to-metal seal.",
          standards: [
            "ISO 13679 CAL-IV",
            "GB/T 19830"
          ],
          temperature: {
            min: -40,
            max: 200,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 13500,
            unit: "psi"
          },
          chemicalComposition: [],
          chemicalCompatibility: [
            "Standard thread grease"
          ],
          usedInEquipment: [
            "Intermediate casings",
            "Deep production strings"
          ],
          advantages: [
            "Excellent torque capacity for horizontal sections",
            "100% internal flush ID"
          ],
          limitations: [
            "Not widely used outside China/Asia projects"
          ],
          applications: [
            "Extended reach horizontal wells in China/Asia"
          ],
          diagrams: [
            "seal-surfaces"
          ],
          graphs: [],
          sources: [
            "TPCO Premium Connections Catalog"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2024",
          connection_type: "Chinese Premium Gas-Tight",
          torque_range: "4,100 - 5,500 ft-lbs",
          turns: "5.0 - 6.2",
          makeup_loss: "2.90 in",
          standoff: "0 (Shoulder stop)",
          drift: "3.833 in",
          seal_type: "Metal-to-metal radial seal with external shoulder",
          running_notes: "Verify torque gauges before execution. Avoid aggressive stabbing.",
          confidenceLevel: "High",
          torque_envelope: "Standard API envelope.",
          gas_tight_suitability: "Not rated for gas pressure, interference seal only.",
          compression_tension_behavior: "Standard tension efficiency.",
          galling_risks: "Low.",
          running_recommendations: "Follow API running guidelines.",
          compatible_lubricants: "Standard API thread compound.",
          field_assembly_notes: "Standard oilfield procedures.",
          typical_failures: "Leakage under gas pressure.",
          oem_references: "Standard specifications.",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "API Specs"
            ],
            verificationDate: "2026-06"
          },
          connection_type_ru: "\u041A\u0438\u0442\u0430\u0439\u0441\u043A\u043E\u0435 \u043F\u0440\u0435\u043C\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u0433\u0430\u0437\u043E\u0433\u0435\u0440\u043C\u0435\u0442\u0438\u0447\u043D\u043E\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435",
          seal_type_ru: "\u0420\u0430\u0434\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u0443\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u0435 \u043C\u0435\u0442\u0430\u043B\u043B-\u043C\u0435\u0442\u0430\u043B\u043B \u0441 \u0432\u043D\u0435\u0448\u043D\u0438\u043C \u0443\u043F\u043E\u0440\u043D\u044B\u043C \u0443\u0441\u0442\u0443\u043F\u043E\u043C",
          running_notes_ru: "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u043C\u0430\u043D\u043E\u043C\u0435\u0442\u0440\u044B \u043A\u0440\u0443\u0442\u044F\u0449\u0435\u0433\u043E \u043C\u043E\u043C\u0435\u043D\u0442\u0430 \u043F\u0435\u0440\u0435\u0434 \u0440\u0430\u0431\u043E\u0442\u043E\u0439. \u0418\u0437\u0431\u0435\u0433\u0430\u0442\u044C \u0440\u0435\u0437\u043A\u043E\u0439 \u043F\u043E\u0441\u0430\u0434\u043A\u0438 \u0442\u0440\u0443\u0431."
        },
        {
          id: "thread_vam_21",
          type: "Thread",
          name: "VAM 21 (Premium Casing & Tubing)",
          aliases: [
            "VAM 21",
            "VAM21"
          ],
          description: "Next-generation premium connection featuring a unique threaded sleeve design and 100% burst/collapse envelope rating.",
          standards: [
            "API Spec 5CT",
            "ISO 13679 CAL IV"
          ],
          temperature: {
            min: -50,
            max: 240,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 18e3,
            unit: "psi"
          },
          chemicalComposition: [
            "Compatible with carbon steel, 13Cr, Super 13Cr, and high-nickel CRAs"
          ],
          chemicalCompatibility: [
            "Sour gas (H2S)",
            "Hydrochloric acid",
            "Inhibitors",
            "Methanol"
          ],
          usedInEquipment: [
            "High-pressure production casing",
            "HPHT tubing completions",
            "Casing drilling"
          ],
          advantages: [
            "Extremely high torque capacity",
            "100% structural efficiency under combined tension and internal pressure",
            "CAL IV validation according to ISO 13679"
          ],
          limitations: [
            "Requires certified VAM technicians for running",
            "Critical makeup control necessary (torque-turn charts)"
          ],
          applications: [
            "Deepwater HPHT completions",
            "Highly deviated production casing runs"
          ],
          sources: [
            "Vallourec VAM 21 Technical catalog",
            "ISO 13679 Test Report"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2024",
          torque_range: "3500 - 6500 ft-lbs (depends on pipe OD/weight)",
          turns: "2.5 - 4.0 turns",
          makeup_loss: "3.2 in",
          standoff: "Torque-turn controlled shoulder makeup",
          compatibility: "Carbon steels and high-nickel alloys, optimized for Dopeless running",
          why_selected: [
            "100% rating under both burst and collapse makes casing design much safer",
            "Eliminates makeup errors due to visual shoulder check"
          ],
          why_avoided: [
            "Higher connection cost compared to standard VAM TOP",
            "Not necessary for standard shallow vertical wells"
          ],
          confidenceLevel: "High",
          torque_envelope: "Standard API envelope.",
          gas_tight_suitability: "Not rated for gas pressure, interference seal only.",
          compression_tension_behavior: "Standard tension efficiency.",
          galling_risks: "Low.",
          running_recommendations: "Follow API running guidelines.",
          compatible_lubricants: "Standard API thread compound.",
          field_assembly_notes: "Standard oilfield procedures.",
          typical_failures: "Leakage under gas pressure.",
          oem_references: "Standard specifications.",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "API Specs"
            ],
            verificationDate: "2026-06"
          },
          compatibility_ru: "\u0423\u0433\u043B\u0435\u0440\u043E\u0434\u0438\u0441\u0442\u044B\u0435 \u0441\u0442\u0430\u043B\u0438 \u0438 \u0441\u043F\u043B\u0430\u0432\u044B \u0441 \u0432\u044B\u0441\u043E\u043A\u0438\u043C \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u043D\u0438\u0435\u043C \u043D\u0438\u043A\u0435\u043B\u044F, \u043E\u043F\u0442\u0438\u043C\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0435 \u0434\u043B\u044F \u0441\u0432\u0438\u043D\u0447\u0438\u0432\u0430\u043D\u0438\u044F \u0431\u0435\u0437 \u0440\u0435\u0437\u044C\u0431\u043E\u0432\u043E\u0439 \u0441\u043C\u0430\u0437\u043A\u0438 (Dopeless)"
        },
        {
          id: "thread_hydril_wedge",
          type: "Thread",
          name: "TenarisHydril Wedge 563",
          aliases: [
            "Wedge 563",
            "Hydril Wedge"
          ],
          description: "Premium integral connection utilizing a dovetail wedge thread profile that provides high torque capability without a torque shoulder.",
          standards: [
            "API Spec 5CT",
            "ISO 13679 CAL IV"
          ],
          temperature: {
            min: -50,
            max: 200,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 15e3,
            unit: "psi"
          },
          chemicalComposition: [
            "Compatible with carbon steels and high-strength metallurgies"
          ],
          chemicalCompatibility: [
            "Sour service muds",
            "Acidizing chemicals",
            "Completion brines"
          ],
          usedInEquipment: [
            "Production liners",
            "Workover strings",
            "High-torque casing drilling"
          ],
          advantages: [
            "Immune to compression yield failure",
            "Exceptional bending capacity (suitable for horizontal wells)",
            "Does not require a torque shoulder to seal"
          ],
          limitations: [
            "High galling risk if run without correct thread dope",
            "Difficult to clean and inspect in the field"
          ],
          applications: [
            "Extended-reach drilling (ERD) horizontal wells",
            "High-dogleg wellbore profiles"
          ],
          sources: [
            "TenarisHydril Connection Catalog",
            "ISO 13679 Test Reference"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          torque_range: "5000 - 9000 ft-lbs",
          turns: "3.0 - 5.0 turns",
          makeup_loss: "4.1 in",
          standoff: "Direct wedge mating verification",
          compatibility: "High strength carbon steel grades (P110, Q125)",
          why_selected: [
            "Dovetail thread wedge action provides highest compression capacity in the industry",
            "Highly resistant to jump-out in high-curvature wells"
          ],
          why_avoided: [
            "Premium price",
            "Risk of galling in high-alloy CRAs unless specialized dopeless versions are used"
          ],
          confidenceLevel: "High",
          torque_envelope: "Standard API envelope.",
          gas_tight_suitability: "Not rated for gas pressure, interference seal only.",
          compression_tension_behavior: "Standard tension efficiency.",
          galling_risks: "Low.",
          running_recommendations: "Follow API running guidelines.",
          compatible_lubricants: "Standard API thread compound.",
          field_assembly_notes: "Standard oilfield procedures.",
          typical_failures: "Leakage under gas pressure.",
          oem_references: "Standard specifications.",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "API Specs"
            ],
            verificationDate: "2026-06"
          },
          compatibility_ru: "\u0412\u044B\u0441\u043E\u043A\u043E\u043F\u0440\u043E\u0447\u043D\u044B\u0435 \u0433\u0440\u0443\u043F\u043F\u044B \u0443\u0433\u043B\u0435\u0440\u043E\u0434\u0438\u0441\u0442\u044B\u0445 \u0441\u0442\u0430\u043B\u0435\u0439 (P110, Q125)"
        },
        {
          id: "thread_vam_ht",
          type: "Thread",
          name: "VAM HT (High Torque)",
          aliases: [
            "vam ht",
            "vam high torque",
            "\u0432\u0430\u043C \u0445\u0442"
          ],
          description: "Premium connection designed for high torque applications in drilling and casing strings.",
          standards: [
            "ISO 13679 CAL-IV"
          ],
          temperature: {
            min: -50,
            max: 240,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 15e3,
            unit: "psi"
          },
          connection_type: "European Premium High-Torque",
          torque_range: "4,500 - 6,200 ft-lbs",
          turns: "4.5 - 5.5",
          makeup_loss: "2.90 in",
          standoff: "0 (Shoulder contact)",
          drift: "2.347 in",
          seal_type: "Metal-to-metal radial seal",
          running_notes: "Verify torque limit prior to makeup. Run slowly.",
          torque_envelope: "Max torque up to 12,000 ft-lbs depending on wall thickness.",
          gas_tight_suitability: "Certified gas-tight under ISO 13679 CAL-IV.",
          compression_tension_behavior: "100% compression rating matching pipe body yield.",
          galling_risks: "Moderate. Requires standard copper/zinc-based compounds.",
          running_recommendations: "Use torque-turn monitoring equipment.",
          compatible_lubricants: "API modified compound, metal-free thread dopes.",
          field_assembly_notes: "Inspect shoulder contact carefully.",
          typical_failures: "Shoulder yielding due to excessive torque.",
          oem_references: "Vallourec Connection Guide",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "Vallourec Connection Guide"
            ],
            verificationDate: "2026-06"
          },
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          connection_type_ru: "\u0415\u0432\u0440\u043E\u043F\u0435\u0439\u0441\u043A\u043E\u0435 \u043F\u0440\u0435\u043C\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u0432\u044B\u0441\u043E\u043A\u043E\u043C\u043E\u043C\u0435\u043D\u0442\u043D\u043E\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435",
          seal_type_ru: "\u0420\u0430\u0434\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u0443\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u0435 \u043C\u0435\u0442\u0430\u043B\u043B-\u043C\u0435\u0442\u0430\u043B\u043B",
          running_notes_ru: "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0435 \u043A\u0440\u0443\u0442\u044F\u0449\u0435\u0433\u043E \u043C\u043E\u043C\u0435\u043D\u0442\u0430 \u043F\u0435\u0440\u0435\u0434 \u0441\u0432\u0438\u043D\u0447\u0438\u0432\u0430\u043D\u0438\u0435\u043C. \u0421\u043F\u0443\u0441\u043A\u0430\u0442\u044C \u043C\u0435\u0434\u043B\u0435\u043D\u043D\u043E."
        },
        {
          id: "thread_blue_dopeless",
          type: "Thread",
          name: "Tenaris Blue Dopeless",
          aliases: [
            "blue dopeless",
            "dopeless",
            "\u0442\u0435\u043D\u0430\u0440\u0438\u0441 \u0434\u043E\u043F\u043B\u0435\u0441\u0441"
          ],
          description: "Dry premium connection requiring no thread compound (dope-free) for environmental safety.",
          standards: [
            "ISO 13679 CAL-IV"
          ],
          temperature: {
            min: -50,
            max: 240,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 16e3,
            unit: "psi"
          },
          connection_type: "Tenaris Dope-Free Premium",
          torque_range: "3,400 - 4,500 ft-lbs",
          turns: "5.5 - 6.5",
          makeup_loss: "3.10 in",
          standoff: "0 (Torque shoulder)",
          drift: "2.347 in",
          seal_type: "Dope-free metal-to-metal seal",
          running_notes: "Do not apply dope. Ensure dry and clean surfaces. Protect from dust.",
          torque_envelope: "Symmetric envelope with solid shoulder feedback.",
          gas_tight_suitability: "CAL-IV certified gas-tight.",
          compression_tension_behavior: "Excellent compression performance; equal to standard Tenaris Blue.",
          galling_risks: "Low. Dry lubricant coating protects pins and boxes.",
          running_recommendations: "Keep thread protector on until final stabbing.",
          compatible_lubricants: "None (dry-film lubricant factory applied).",
          field_assembly_notes: "Dry clean only. Water/oil on threads can cause makeup errors.",
          typical_failures: "Coating abrasion from rough stabbing.",
          oem_references: "Tenaris Blue Connection Specifications",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "Tenaris Tubulars Guide"
            ],
            verificationDate: "2026-06"
          },
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          connection_type_ru: "Tenaris \u0431\u0435\u0437\u0441\u043C\u0430\u0437\u043E\u0447\u043D\u043E\u0435 \u043F\u0440\u0435\u043C\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435",
          seal_type_ru: "\u0411\u0435\u0437\u0441\u043C\u0430\u0437\u043E\u0447\u043D\u043E\u0435 \u0443\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u0435 \u043C\u0435\u0442\u0430\u043B\u043B-\u043C\u0435\u0442\u0430\u043B\u043B (Dope-Free)",
          running_notes_ru: "\u041D\u0435 \u043D\u0430\u043D\u043E\u0441\u0438\u0442\u044C \u0440\u0435\u0437\u044C\u0431\u043E\u0432\u0443\u044E \u0441\u043C\u0430\u0437\u043A\u0443. \u041E\u0431\u0435\u0441\u043F\u0435\u0447\u0438\u0442\u044C \u0441\u0443\u0445\u043E\u0441\u0442\u044C \u0438 \u0447\u0438\u0441\u0442\u043E\u0442\u0443 \u043F\u043E\u0432\u0435\u0440\u0445\u043D\u043E\u0441\u0442\u0435\u0439. \u0417\u0430\u0449\u0438\u0449\u0430\u0442\u044C \u043E\u0442 \u043F\u044B\u043B\u0438."
        },
        {
          id: "thread_fox",
          type: "Thread",
          name: "FOX Premium Connection",
          aliases: [
            "fox",
            "fox connection",
            "\u0440\u0435\u0437\u044C\u0431\u0430 \u0444\u043E\u043A\u0441"
          ],
          description: "Premium casing/tubing thread designed with a unique pitch change to distribute load and reduce galling.",
          standards: [
            "ISO 13679 CAL-IV"
          ],
          temperature: {
            min: -40,
            max: 200,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 14e3,
            unit: "psi"
          },
          connection_type: "JFE Premium Thread",
          torque_range: "3,200 - 4,200 ft-lbs",
          turns: "5.0 - 6.0",
          makeup_loss: "2.75 in",
          standoff: "0 (Shoulder stop)",
          drift: "2.441 in",
          seal_type: "Metal-to-metal radial seal",
          running_notes: "Use JFE approved thread compound.",
          torque_envelope: "Broad envelope due to localized pitch design.",
          gas_tight_suitability: "CAL-IV certified.",
          compression_tension_behavior: "Excellent tension efficiency.",
          galling_risks: "Low. Pitch change minimizes contact pressure.",
          running_recommendations: "Run at low RPM to ensure even thread loading.",
          compatible_lubricants: "API modified compound, metal-free dopes.",
          field_assembly_notes: "Visual check of shoulder alignment is critical.",
          typical_failures: "Thread pitch damage from cross-threading.",
          oem_references: "JFE Steel Tubulars Guide",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "JFE Steel Tubulars Catalog"
            ],
            verificationDate: "2026-06"
          },
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          connection_type_ru: "JFE \u043F\u0440\u0435\u043C\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435",
          seal_type_ru: "\u0420\u0430\u0434\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u0443\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u0435 \u043C\u0435\u0442\u0430\u043B\u043B-\u043C\u0435\u0442\u0430\u043B\u043B",
          running_notes_ru: "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u0440\u0435\u0437\u044C\u0431\u043E\u0432\u0443\u044E \u0441\u043C\u0430\u0437\u043A\u0443, \u043E\u0434\u043E\u0431\u0440\u0435\u043D\u043D\u0443\u044E JFE."
        },
        {
          id: "thread_bear",
          type: "Thread",
          name: "BEAR Premium Connection",
          aliases: [
            "bear",
            "bear connection",
            "\u0440\u0435\u0437\u044C\u0431\u0430 \u0431\u0435\u0430\u0440"
          ],
          description: "High-collapse premium casing thread optimized for thick-wall salt zone casings.",
          standards: [
            "ISO 13679 CAL-II"
          ],
          temperature: {
            min: -30,
            max: 180,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 15e3,
            unit: "psi"
          },
          connection_type: "Proprietary Premium Thread",
          torque_range: "6,000 - 8,500 ft-lbs",
          turns: "4.0 - 5.0",
          makeup_loss: "3.50 in",
          standoff: "0 (Shoulder)",
          drift: "6.06 in",
          seal_type: "Metal-to-metal seal",
          running_notes: "Thorough cleaning. Run slowly.",
          torque_envelope: "Very high yield limits.",
          gas_tight_suitability: "Certified gas-tight.",
          compression_tension_behavior: "High compression rating.",
          galling_risks: "Moderate. Heavy wall thickness requires good lubrication.",
          running_recommendations: "Strict torque-turn monitoring.",
          compatible_lubricants: "Standard API compounds.",
          field_assembly_notes: "Ensure no mud enters pin or box.",
          typical_failures: "Over-torque yielding.",
          oem_references: "BEAR Catalog specifications.",
          evidence_metadata: {
            confidenceLevel: "Medium",
            sources: [
              "BEAR Casing Technical Specs"
            ],
            verificationDate: "2026-06"
          },
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          connection_type_ru: "\u0417\u0430\u043F\u0430\u0442\u0435\u043D\u0442\u043E\u0432\u0430\u043D\u043D\u043E\u0435 \u043F\u0440\u0435\u043C\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435",
          seal_type_ru: "\u0423\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u0435 \u043C\u0435\u0442\u0430\u043B\u043B-\u043C\u0435\u0442\u0430\u043B\u043B",
          running_notes_ru: "\u0422\u0449\u0430\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u043E\u0447\u0438\u0441\u0442\u043A\u0430. \u041C\u0435\u0434\u043B\u0435\u043D\u043D\u044B\u0439 \u0441\u043F\u0443\u0441\u043A."
        },
        {
          id: "thread_atlas_bradford",
          type: "Thread",
          name: "Atlas Bradford Premium",
          aliases: [
            "atlas bradford",
            "atlas",
            "\u0430\u0442\u043B\u0430\u0441 \u0431\u0440\u044D\u0434\u0444\u043E\u0440\u0434"
          ],
          description: "Standard flushing joint premium connection with gas-tight seal for slim-hole completions.",
          standards: [
            "ISO 13679 CAL-IV"
          ],
          temperature: {
            min: -40,
            max: 220,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 12e3,
            unit: "psi"
          },
          connection_type: "Slim-Hole Premium",
          torque_range: "2,200 - 3,100 ft-lbs",
          turns: "4.0 - 5.0",
          makeup_loss: "2.20 in",
          standoff: "0 (Shoulder)",
          drift: "1.901 in",
          seal_type: "Metal-to-metal radial seal",
          running_notes: "Ideal for tight clearances. Run at low speed.",
          torque_envelope: "Lower torque limits due to slim joint design.",
          gas_tight_suitability: "CAL-IV certified.",
          compression_tension_behavior: "Reduced tension capability compared to coupling joints.",
          galling_risks: "Moderate to High. Slim profile requires precise alignment.",
          running_recommendations: "Use stabilizer/alignment clamps.",
          compatible_lubricants: "API modified compound.",
          field_assembly_notes: "Double check pin shoulder contact.",
          typical_failures: "Slim box expansion, thread jump-out under high tension.",
          oem_references: "Atlas Bradford Connection Catalog",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "Atlas Bradford Catalog"
            ],
            verificationDate: "2026-06"
          },
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          connection_type_ru: "Slim-Hole \u043F\u0440\u0435\u043C\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435",
          seal_type_ru: "\u0420\u0430\u0434\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u0443\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u0435 \u043C\u0435\u0442\u0430\u043B\u043B-\u043C\u0435\u0442\u0430\u043B\u043B",
          running_notes_ru: "\u0418\u0434\u0435\u0430\u043B\u044C\u043D\u043E \u0434\u043B\u044F \u043C\u0430\u043B\u044B\u0445 \u0437\u0430\u0437\u043E\u0440\u043E\u0432. \u0421\u043F\u0443\u0441\u043A\u0430\u0442\u044C \u043D\u0430 \u043D\u0438\u0437\u043A\u043E\u0439 \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u0438."
        },
        {
          id: "thread_hydril_ph6",
          type: "Thread",
          name: "Hydril PH6 Premium Tubing",
          aliases: [
            "ph6",
            "hydril ph6",
            "\u0440\u0435\u0437\u044C\u0431\u0430 ph6"
          ],
          description: "Two-step premium tubing connection with high tensile efficiency and gas-tight seal.",
          standards: [
            "ISO 13679 CAL-IV"
          ],
          temperature: {
            min: -50,
            max: 240,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 15e3,
            unit: "psi"
          },
          connection_type: "Two-Step Premium",
          torque_range: "2,800 - 3,600 ft-lbs",
          turns: "4.0 - 4.8",
          makeup_loss: "2.50 in",
          standoff: "0 (Double shoulder)",
          drift: "2.347 in",
          seal_type: "Double metal-to-metal seal",
          running_notes: "Two-step threads: slide together, then rotate. Do not cross-thread.",
          torque_envelope: "Exceptional torque limits.",
          gas_tight_suitability: "Certified gas-tight.",
          compression_tension_behavior: "100% tension efficiency.",
          galling_risks: "Low. Two-step design limits initial thread contact.",
          running_recommendations: "Align joints perfectly before stabbing.",
          compatible_lubricants: "API modified compound.",
          field_assembly_notes: "Ensure double shoulder contacts are clean.",
          typical_failures: "Box splitting due to excessive torque.",
          oem_references: "TenarisHydril Catalog PH6",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "TenarisHydril Connection Guide"
            ],
            verificationDate: "2026-06"
          },
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          connection_type_ru: "\u0414\u0432\u0443\u0445\u0441\u0442\u0443\u043F\u0435\u043D\u0447\u0430\u0442\u043E\u0435 \u043F\u0440\u0435\u043C\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435",
          seal_type_ru: "\u0414\u0432\u043E\u0439\u043D\u043E\u0435 \u0443\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u0435 \u043C\u0435\u0442\u0430\u043B\u043B-\u043C\u0435\u0442\u0430\u043B\u043B",
          running_notes_ru: "\u0414\u0432\u0443\u0445\u0441\u0442\u0443\u043F\u0435\u043D\u0447\u0430\u0442\u0430\u044F \u0440\u0435\u0437\u044C\u0431\u0430: \u0432\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u043A\u043E\u0430\u043A\u0441\u0438\u0430\u043B\u044C\u043D\u043E \u0434\u043E \u0443\u043F\u043E\u0440\u0430, \u0437\u0430\u0442\u0435\u043C \u0441\u0432\u0438\u043D\u0442\u0438\u0442\u044C. \u0418\u0437\u0431\u0435\u0433\u0430\u0442\u044C \u043F\u0435\u0440\u0435\u043A\u043E\u0441\u0430."
        },
        {
          id: "thread_hydril_cs",
          type: "Thread",
          name: "Hydril CS Premium Tubing",
          aliases: [
            "cs",
            "hydril cs",
            "\u0440\u0435\u0437\u044C\u0431\u0430 cs"
          ],
          description: "Standard two-step premium tubing connection with flush joint profile for clearance wells.",
          standards: [
            "ISO 13679 CAL-II"
          ],
          temperature: {
            min: -40,
            max: 180,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 1e4,
            unit: "psi"
          },
          connection_type: "Flush Two-Step Premium",
          torque_range: "1,800 - 2,500 ft-lbs",
          turns: "3.5 - 4.5",
          makeup_loss: "2.30 in",
          standoff: "0 (Shoulder stop)",
          drift: "2.347 in",
          seal_type: "Metal-to-metal seal",
          running_notes: "Flush outer diameter. Stabbing must be perfectly vertical.",
          torque_envelope: "Low torque envelope due to flush wall thickness.",
          gas_tight_suitability: "Gas-tight under standard conditions.",
          compression_tension_behavior: "Reduced tension capacity compared to PH6.",
          galling_risks: "Moderate. Flush joints have thinner sections.",
          running_recommendations: "Use light stabbing guide.",
          compatible_lubricants: "API modified compound.",
          field_assembly_notes: "Examine thin box area for damage.",
          typical_failures: "Thread strip-out under tension, box parting.",
          oem_references: "TenarisHydril CS Catalog",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "TenarisHydril Connection Guide"
            ],
            verificationDate: "2026-06"
          },
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          connection_type_ru: "\u0411\u0435\u0437\u043C\u0443\u0444\u0442\u043E\u0432\u043E\u0435 \u0434\u0432\u0443\u0445\u0441\u0442\u0443\u043F\u0435\u043D\u0447\u0430\u0442\u043E\u0435 \u043F\u0440\u0435\u043C\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435",
          seal_type_ru: "\u0423\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u0435 \u043C\u0435\u0442\u0430\u043B\u043B-\u043C\u0435\u0442\u0430\u043B\u043B",
          running_notes_ru: "\u0411\u0435\u0437\u043C\u0443\u0444\u0442\u043E\u0432\u044B\u0439 \u043D\u0430\u0440\u0443\u0436\u043D\u044B\u0439 \u0434\u0438\u0430\u043C\u0435\u0442\u0440. \u041F\u043E\u0441\u0430\u0434\u043A\u0430 \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0441\u0442\u0440\u043E\u0433\u043E \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C\u043D\u043E\u0439."
        },
        {
          id: "thread_xt",
          type: "Thread",
          name: "eXtreme Torque (XT)",
          aliases: [
            "xt",
            "xt connection",
            "\u0440\u0435\u0437\u044C\u0431\u0430 \u0445\u0442"
          ],
          description: "Drill pipe premium connection designed for extreme torsional loads in directional and ERD wells.",
          standards: [
            "API RP 7G"
          ],
          temperature: {
            min: -40,
            max: 200,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 2e4,
            unit: "psi"
          },
          connection_type: "Double-Shoulder Drill Pipe",
          torque_range: "28,000 - 38,000 ft-lbs",
          turns: "3.5 - 4.5",
          makeup_loss: "4.20 in",
          standoff: "0 (Double shoulder)",
          drift: "3.701 in",
          seal_type: "Double shoulder metal-to-metal seal",
          running_notes: "Designed for rotation. Use premium drill pipe dope.",
          torque_envelope: "Highest torque capability in industry.",
          gas_tight_suitability: "Highly reliable fluid seal, not CAL-IV certified gas-tight.",
          compression_tension_behavior: "Extreme tension and bending resistance.",
          galling_risks: "Low. Heavy tool joint geometry prevents galling.",
          running_recommendations: "Clean tool joint threads thoroughly after each trip.",
          compatible_lubricants: "Copper-based or zinc-based drill pipe dopes.",
          field_assembly_notes: "Verify secondary shoulder contact visually.",
          typical_failures: "Box swelling under severe drilling torque.",
          oem_references: "NOV Grant Prideco Connection Guide",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "NOV Grant Prideco Catalog"
            ],
            verificationDate: "2026-06"
          },
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          connection_type_ru: "\u0417\u0430\u043C\u043E\u043A \u0441 \u0434\u0432\u043E\u0439\u043D\u044B\u043C \u0443\u043F\u043E\u0440\u043D\u044B\u043C \u0442\u043E\u0440\u0446\u043E\u043C",
          seal_type_ru: "\u0414\u0432\u043E\u0439\u043D\u043E\u0439 \u0443\u043F\u043E\u0440\u043D\u044B\u0439 \u0442\u043E\u0440\u0435\u0446 \u0441 \u0443\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u0435\u043C \u043C\u0435\u0442\u0430\u043B\u043B-\u043C\u0435\u0442\u0430\u043B\u043B",
          running_notes_ru: "\u041F\u0440\u0435\u0434\u043D\u0430\u0437\u043D\u0430\u0447\u0435\u043D \u0434\u043B\u044F \u0432\u0440\u0430\u0449\u0435\u043D\u0438\u044F \u043F\u0440\u0438 \u0431\u0443\u0440\u0435\u043D\u0438\u0438. \u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u043F\u0440\u0435\u043C\u0438\u0430\u043B\u044C\u043D\u0443\u044E \u0441\u043C\u0430\u0437\u043A\u0443 \u0434\u043B\u044F \u0431\u0443\u0440\u0438\u043B\u044C\u043D\u044B\u0445 \u0442\u0440\u0443\u0431."
        }
      ],
      elastomers: [
        {
          id: "elastomer_viton_fkm",
          type: "Elastomer",
          name: "Viton (FKM / \u0424\u0442\u043E\u0440\u043A\u0430\u0443\u0447\u0443\u043A)",
          aliases: [
            "viton",
            "fkm",
            "\u0444\u0442\u043E\u0440\u043A\u0430\u0443\u0447\u0443\u043A",
            "\u0432\u0438\u0442\u043E\u043D"
          ],
          description: "Fluorocarbon elastomer with exceptional temperature and chemical resistance in sweet and mildly sour environments.",
          standards: [
            "ASTM D1418",
            "ISO 1629"
          ],
          temperature: {
            min: -20,
            max: 204,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 15e3,
            unit: "psi"
          },
          chemicalComposition: [
            "Fluorinated vinylidene fluoride copolymers"
          ],
          chemicalCompatibility: [
            "Crude oil",
            "HCl acid",
            "Sour gas (H2S up to 5%)",
            "Aliphatic hydrocarbons"
          ],
          usedInEquipment: [
            "Packer seals",
            "O-rings",
            "BOP seal elements",
            "Downhole pump valves"
          ],
          advantages: [
            "Superb acid resistance",
            "Thermal stability up to 200\xB0C",
            "Excellent chemical stability"
          ],
          limitations: [
            "Rapidly degrades in steam, amines, and high concentration H2S (vulcanization reversal)"
          ],
          applications: [
            "High temperature oil wells",
            "Acid stimulation wash packer seals"
          ],
          diagrams: [
            "seal-surfaces"
          ],
          graphs: [
            "viton_temp_envelope"
          ],
          sources: [
            "Standard Elastomers Guide",
            "Dupont Viton Data Sheet"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2024",
          confidenceLevel: "Medium",
          temperature_envelope: "-20\xB0C to 204\xB0C",
          chemical_compatibility: "Excellent with crude oil, HCl, aliphatic hydrocarbons; poor with amines/steam.",
          rgd_resistance: "Medium to High (depending on compounding structure).",
          sour_service_suitability: "Limited to mild sour (max 5% H2S).",
          steam_resistance: "Poor. Suffers rapid chemical reverse vulcanization.",
          acid_compatibility: "Excellent with HCl stimulation fluids.",
          aromatics_resistance: "Excellent.",
          failure_mechanisms: "Amine hardening, chemical degradation in steam/amines.",
          storage_recommendations: "Aged storage up to 10 years in sealed bags away from ozone.",
          field_limitations: "Do not run in injection/geothermal wells with steam.",
          standards_metadata: "ASTM D1418, ISO 1629",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "Dupont Viton Specs"
            ],
            verificationDate: "2026-06"
          }
        },
        {
          id: "elastomer_nbr_nitrile",
          type: "Elastomer",
          name: "NBR (Nitrile / \u0411\u0443\u0442\u0430\u0434\u0438\u0435\u043D-\u043D\u0438\u0442\u0440\u0438\u043B\u044C\u043D\u044B\u0439 \u043A\u0430\u0443\u0447\u0443\u043A)",
          aliases: [
            "nbr",
            "nitrile",
            "\u043D\u0438\u0442\u0440\u0438\u043B",
            "\u0431\u043D\u043A",
            "\u043A\u0430\u0443\u0447\u0443\u043A \u0431\u043D\u043A"
          ],
          description: "Standard oilfield elastomer with excellent physical strength and wear resistance in low-temperature oil service.",
          standards: [
            "ASTM D1418",
            "ISO 1629"
          ],
          temperature: {
            min: -40,
            max: 120,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 1e4,
            unit: "psi"
          },
          chemicalComposition: [
            "Acrylonitrile butadiene copolymer"
          ],
          chemicalCompatibility: [
            "Crude oil",
            "Water",
            "Aliphatic hydrocarbons",
            "Salt solutions"
          ],
          usedInEquipment: [
            "ESP seals",
            "Stator linings for progressive cavity pumps",
            "BOP rams"
          ],
          advantages: [
            "High wear resistance",
            "Low cost",
            "Excellent mechanical properties and elasticity"
          ],
          limitations: [
            "Poor resistance to ozone, polar solvents, H2S, and temperatures above 120\xB0C"
          ],
          applications: [
            "Shallow oil production",
            "Standard surface equipment sealing"
          ],
          diagrams: [
            "seal-surfaces"
          ],
          graphs: [],
          sources: [
            "Rubber Handbook for Engineers"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2023",
          confidenceLevel: "Medium",
          temperature_envelope: "-40\xB0C to 120\xB0C",
          chemical_compatibility: "Good with hydrocarbons; poor with polar solvents, ozone, and hot water.",
          rgd_resistance: "Poor.",
          sour_service_suitability: "Poor. Rapid degradation in H2S.",
          steam_resistance: "Poor.",
          acid_compatibility: "Moderate.",
          aromatics_resistance: "Moderate.",
          failure_mechanisms: "Ozone cracking, heat embrittlement, sour gas swelling.",
          storage_recommendations: "Max 5 years shelf life. Keep out of daylight.",
          field_limitations: "Forbidden in H2S reservoirs.",
          standards_metadata: "ASTM D1418, ISO 1629",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "Rubber Handbook"
            ],
            verificationDate: "2026-06"
          }
        },
        {
          id: "elastomer_hnbr",
          type: "Elastomer",
          name: "HNBR (Hydrogenated Nitrile / \u0413\u0438\u0434\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u0411\u041D\u041A)",
          aliases: [
            "hnbr",
            "therban",
            "\u0433\u0438\u0434\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043D\u0438\u0442\u0440\u0438\u043B",
            "\u0433\u0431\u043D\u043A"
          ],
          description: "Hydrogenated nitrile elastomer showing high mechanical performance and better H2S resistance than NBR.",
          standards: [
            "ASTM D1418",
            "ISO 1629"
          ],
          temperature: {
            min: -30,
            max: 150,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 12500,
            unit: "psi"
          },
          chemicalComposition: [
            "Hydrogenated acrylonitrile butadiene copolymer"
          ],
          chemicalCompatibility: [
            "Sour crude oil",
            "H2S (up to 10%)",
            "Corrosion inhibitors",
            "Completion brines"
          ],
          usedInEquipment: [
            "Downhole packers",
            "BOP seals",
            "Drill bit seals"
          ],
          advantages: [
            "Excellent tensile strength",
            "High abrasion resistance",
            "Good resistance to H2S"
          ],
          limitations: [
            "Moderate performance in hot steam and strong concentrated acids"
          ],
          applications: [
            "Medium-temperature sour wells",
            "Drilling BOP elements"
          ],
          diagrams: [
            "seal-surfaces"
          ],
          graphs: [],
          sources: [
            "HNBR Engineering Data Sheets"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2024",
          confidenceLevel: "Medium",
          temperature_envelope: "-40\xB0C to 120\xB0C",
          chemical_compatibility: "Good with hydrocarbons; poor with polar solvents, ozone, and hot water.",
          rgd_resistance: "Poor.",
          sour_service_suitability: "Poor. Rapid degradation in H2S.",
          steam_resistance: "Poor.",
          acid_compatibility: "Moderate.",
          aromatics_resistance: "Moderate.",
          failure_mechanisms: "Ozone cracking, heat embrittlement, sour gas swelling.",
          storage_recommendations: "Max 5 years shelf life. Keep out of daylight.",
          field_limitations: "Forbidden in H2S reservoirs.",
          standards_metadata: "ASTM D1418, ISO 1629",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "Rubber Handbook"
            ],
            verificationDate: "2026-06"
          }
        },
        {
          id: "elastomer_kalrez_ffkm",
          type: "Elastomer",
          name: "Kalrez / FFKM (\u041F\u0435\u0440\u0444\u0442\u043E\u0440\u043A\u0430\u0443\u0447\u0443\u043A)",
          aliases: [
            "kalrez",
            "ffkm",
            "\u043F\u0435\u0440\u0444\u0442\u043E\u0440\u043A\u0430\u0443\u0447\u0443\u043A",
            "\u043A\u0430\u043B\u044C\u0440\u0435\u0437"
          ],
          description: "Ultimate performance perfluoroelastomer with near-complete chemical inertia, resisting severe sour service.",
          standards: [
            "ASTM D1418",
            "ISO 1629"
          ],
          temperature: {
            min: -15,
            max: 315,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 2e4,
            unit: "psi"
          },
          chemicalComposition: [
            "Fully fluorinated copolymer backbone"
          ],
          chemicalCompatibility: [
            "All acids (HCl, HF)",
            "Sour gas (H2S up to 100%)",
            "Steam",
            "Amines",
            "Solvents"
          ],
          usedInEquipment: [
            "HPHT packers",
            "Safety valve dynamic seals",
            "Chemical injection valve o-rings"
          ],
          advantages: [
            "Extreme temperature resistance (300\xB0C+)",
            "Resists practically all oilfield chemicals"
          ],
          limitations: [
            "Extremely expensive",
            "Poor low-temperature elasticity",
            "Low mechanical tear resistance"
          ],
          applications: [
            "HPHT completions",
            "Deep sour gas injection wells",
            "Chemical injection systems"
          ],
          diagrams: [
            "seal-surfaces"
          ],
          graphs: [],
          sources: [
            "DuPont Kalrez Chemical Resistance Guide"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          confidenceLevel: "Medium",
          temperature_envelope: "-15\xB0C to 315\xB0C",
          chemical_compatibility: "Near total chemical inertia. Resistant to acids, steam, amines, and H2S.",
          rgd_resistance: "Excellent (in specific HPHT compounds).",
          sour_service_suitability: "Outstanding. Immune to H2S.",
          steam_resistance: "Exceptional.",
          acid_compatibility: "Exceptional (HCl, HF).",
          aromatics_resistance: "Exceptional.",
          failure_mechanisms: "Dynamic extrusion due to low mechanical tear strength, low temperature leakage.",
          storage_recommendations: "Unlimited shelf life. Avoid compression.",
          field_limitations: "Extremely expensive. Fails to seal at low temperatures (<-15\xB0C).",
          standards_metadata: "ASTM D1418, ISO 1629",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "DuPont Kalrez Guide"
            ],
            verificationDate: "2026-06"
          }
        },
        {
          id: "elastomer_teflon_ptfe",
          type: "Elastomer",
          name: "Teflon / PTFE (\u0424\u0442\u043E\u0440\u043E\u043F\u043B\u0430\u0441\u0442)",
          aliases: [
            "teflon",
            "ptfe",
            "\u0444\u0442\u043E\u0440\u043E\u043F\u043B\u0430\u0441\u0442",
            "\u0442\u0435\u0444\u043B\u043E\u043D"
          ],
          description: "Thermoplastic fluorpolymer with total chemical resistance. Used with elastomeric energizers.",
          standards: [
            "ASTM D4894"
          ],
          temperature: {
            min: -200,
            max: 260,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 25e3,
            unit: "psi"
          },
          chemicalComposition: [
            "Polytetrafluoroethylene"
          ],
          chemicalCompatibility: [
            "All acids",
            "All bases",
            "Solvents",
            "All gas concentrations"
          ],
          usedInEquipment: [
            "Back-up rings",
            "Packer seal stacks",
            "Ball valve seats"
          ],
          advantages: [
            "Zero chemical degradation",
            "Extremely low coefficient of friction",
            "No explosive decompression"
          ],
          limitations: [
            "Subject to cold flow (creep) under compression",
            "Zero elasticity (requires spring/rubber energizer)"
          ],
          applications: [
            "Back-up rings for packer seals",
            "HPHT dynamic seal assemblies"
          ],
          diagrams: [
            "seal-surfaces"
          ],
          graphs: [],
          sources: [
            "PTFE Engineering Handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2024",
          confidenceLevel: "Medium",
          temperature_envelope: "-200\xB0C to 260\xB0C",
          chemical_compatibility: "Total chemical resistance to all downhole fluids.",
          rgd_resistance: "Immune (no gas solubility).",
          sour_service_suitability: "Exceptional.",
          steam_resistance: "Exceptional.",
          acid_compatibility: "Exceptional.",
          aromatics_resistance: "Exceptional.",
          failure_mechanisms: "Cold flow (creep) deformation, lack of elastic memory.",
          storage_recommendations: "Store dry. Shield from dust.",
          field_limitations: "Cannot be used as primary elastic energizer (must be backed up with elastomer).",
          standards_metadata: "ASTM D4894",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "PTFE Handbook"
            ],
            verificationDate: "2026-06"
          }
        },
        {
          id: "elastomer_aflas",
          type: "Elastomer",
          name: "AFLAS (FEPM / \u0424\u0442\u043E\u0440\u043A\u0430\u0443\u0447\u0443\u043A)",
          aliases: [
            "AFLAS",
            "FEPM",
            "Tetrafluoroethylene-propylene"
          ],
          description: "Unique fluoroelastomer resistant to a broad range of harsh chemicals, specifically designed for steam, amines, and sour environments.",
          standards: [
            "ISO 3601",
            "NACE TM0187"
          ],
          temperature: {
            min: -10,
            max: 200,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 15e3,
            unit: "psi"
          },
          chemicalCompatibility: [
            "High H2S",
            "Steam",
            "Corrosion inhibitors (amines)",
            "Acids",
            "Bases",
            "Methanol"
          ],
          swelling_resistance: "Excellent in amines, basic drilling muds, and steam. Poor in aromatic hydrocarbons, ketones, and chlorinated solvents.",
          rgd_resistance: "Medium.",
          typical_failures: [
            "Extrusion under high pressure if backup rings are absent",
            "Low-temperature brittleness cracking"
          ],
          typical_applications: [
            "Packer seals in steam injection wells",
            "ESP cable protectors",
            "Downhole chemical injection valves"
          ],
          why_selected: [
            "AFLAS is immune to amine-based corrosion inhibitors that destroy standard Viton (FKM)",
            "Exceptional steam service lifetime"
          ],
          why_avoided: [
            "Avoid in sub-zero polar environments due to loss of elasticity below -10C",
            "Avoid in presence of low-aniline point mineral oils"
          ],
          confidenceLevel: "High",
          sources: [
            "Asahi Glass Company AFLAS Tech Manual",
            "NACE TM0187 Evaluation"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2024",
          temperature_envelope: "-30\xB0C to 150\xB0C",
          chemical_compatibility: "Good with standard hydrocarbons.",
          sour_service_suitability: "Moderate.",
          steam_resistance: "Moderate.",
          acid_compatibility: "Moderate.",
          aromatics_resistance: "Moderate.",
          failure_mechanisms: "Abrasion and thermal hardening.",
          storage_recommendations: "Store in dry room.",
          field_limitations: "Check specific material specs.",
          standards_metadata: "ASTM D1418",
          evidence_metadata: {
            confidenceLevel: "Medium",
            sources: [
              "General Elastomer Guidelines"
            ],
            verificationDate: "2026-06"
          }
        },
        {
          id: "elastomer_epdm",
          type: "Elastomer",
          name: "EPDM (Ethylene Propylene Diene Monomer)",
          aliases: [
            "EPDM",
            "Ethylene Propylene"
          ],
          description: "Standard oilfield elastomer designed for extreme hot water, steam, and polar chemical service, but completely incompatible with hydrocarbons.",
          standards: [
            "ASTM D1418",
            "ISO 1629"
          ],
          temperature: {
            min: -50,
            max: 150,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 1e4,
            unit: "psi"
          },
          chemicalCompatibility: [
            "Hot water/steam",
            "Dilute acids",
            "Alkalies",
            "Ketones (MEK)",
            "Methanol"
          ],
          swelling_resistance: "Excellent in water, steam, and polar solvents. Completely swells and disintegrates in crude oil, diesel, and hydrocarbons.",
          rgd_resistance: "Medium.",
          typical_failures: [
            "Catastrophic swelling and extrusion in oil/hydrocarbon service",
            "Thermal degradation above 150C"
          ],
          typical_applications: [
            "Steam stimulation well packer elements (hydrocarbon-free zones)",
            "Subsurface safety valve hydraulic seals (water-based fluid)"
          ],
          why_selected: [
            "Exceptional low-temperature elasticity down to -50C",
            "Economic seal material for non-hydrocarbon geothermal systems"
          ],
          why_avoided: [
            "Strictly avoid in any oil, gas, or hydrocarbon mud contact; even trace oil causes rapid seal failure"
          ],
          confidenceLevel: "High",
          sources: [
            "ASTM D1418 Specification",
            "HADALBORE_LAB Seal Materials Handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2023",
          temperature_envelope: "-30\xB0C to 150\xB0C",
          chemical_compatibility: "Good with standard hydrocarbons.",
          sour_service_suitability: "Moderate.",
          steam_resistance: "Moderate.",
          acid_compatibility: "Moderate.",
          aromatics_resistance: "Moderate.",
          failure_mechanisms: "Abrasion and thermal hardening.",
          storage_recommendations: "Store in dry room.",
          field_limitations: "Check specific material specs.",
          standards_metadata: "ASTM D1418",
          evidence_metadata: {
            confidenceLevel: "Medium",
            sources: [
              "General Elastomer Guidelines"
            ],
            verificationDate: "2026-06"
          }
        },
        {
          id: "elastomer_peek",
          type: "Polymer",
          name: "PEEK (Polyetheretherketone / \u041F\u043E\u043B\u0438\u044D\u0444\u0438\u0440\u044D\u0444\u0438\u0440\u043A\u0435\u0442\u043E\u043D)",
          aliases: [
            "PEEK",
            "Polyketone"
          ],
          description: "High-performance thermoplastic polymer offering exceptional mechanical strength, wear resistance, and chemical compatibility at high temperatures.",
          standards: [
            "ASTM D6269",
            "ISO 10423"
          ],
          temperature: {
            min: -70,
            max: 260,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 25e3,
            unit: "psi"
          },
          chemicalCompatibility: [
            "All oilfield fluids",
            "Concentrated HCl/HF",
            "H2S",
            "CO2",
            "Chlorides",
            "Steam",
            "Amines"
          ],
          swelling_resistance: "Immune to swelling. Absorption of wellbore chemicals is negligible.",
          rgd_resistance: "Medium.",
          typical_failures: [
            "Brittle cracking if subjected to extreme impact or bending at low temperatures",
            "Creep deformation under continuous ultra-high loads at >200C"
          ],
          typical_applications: [
            "Anti-extrusion backup rings for elastomer O-rings",
            "Electrical connectors for logging-while-drilling (LWD) tools",
            "Downhole ESP valve seats"
          ],
          why_selected: [
            "Combines metal-like mechanical strength with total chemical inertness up to 260C",
            "Standard anti-extrusion choice for HPHT O-ring seal packages"
          ],
          why_avoided: [
            "Avoid where flexibility is required (rigid polymer, cannot function as a dynamic seal by itself)",
            "Extremely high raw material cost"
          ],
          confidenceLevel: "High",
          sources: [
            "Victrex PEEK Technical Database",
            "API Spec 6A / ISO 10423 Annex M"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          temperature_envelope: "-30\xB0C to 150\xB0C",
          chemical_compatibility: "Good with standard hydrocarbons.",
          sour_service_suitability: "Moderate.",
          steam_resistance: "Moderate.",
          acid_compatibility: "Moderate.",
          aromatics_resistance: "Moderate.",
          failure_mechanisms: "Abrasion and thermal hardening.",
          storage_recommendations: "Store in dry room.",
          field_limitations: "Check specific material specs.",
          standards_metadata: "ASTM D1418",
          evidence_metadata: {
            confidenceLevel: "Medium",
            sources: [
              "General Elastomer Guidelines"
            ],
            verificationDate: "2026-06"
          }
        },
        {
          id: "elastomer_pu",
          type: "Elastomer",
          name: "PU (Polyurethane / \u041F\u043E\u043B\u0438\u0443\u0440\u0435\u0442\u0430\u043D)",
          aliases: [
            "pu",
            "polyurethane",
            "\u043F\u043E\u043B\u0438\u0443\u0440\u0435\u0442\u0430\u043D"
          ],
          description: "Thermoplastic elastomer with extreme mechanical strength, high wear and abrasion resistance.",
          standards: [
            "ASTM D1418",
            "ISO 1629"
          ],
          temperature: {
            min: -40,
            max: 90,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 1e4,
            unit: "psi"
          },
          temperature_envelope: "-40\xB0C to 90\xB0C.",
          chemical_compatibility: "Good with crude oil, water, aliphatic hydrocarbons. Poor with polar solvents and acids.",
          rgd_resistance: "Excellent. Strong mechanical properties prevent gas decompression cracking.",
          sour_service_suitability: "Poor. Susceptible to amine and H2S degradation.",
          steam_resistance: "Very poor. Hydrolyzes rapidly in hot water or steam.",
          acid_compatibility: "Poor. Degrades in hydrochloric or organic stimulation acids.",
          aromatics_resistance: "Moderate.",
          failure_mechanisms: "Hydrolysis (reversion), chemical degradation by acids and H2S, thermal softening.",
          storage_recommendations: "Store in cool, dark, dry environment. Avoid moisture.",
          field_limitations: "Do not use in high-temperature or wet wells.",
          standards_metadata: "ASTM D1418, ISO 1629",
          evidence_metadata: {
            confidenceLevel: "Medium",
            sources: [
              "Elastomers in Oilfield Applications Handbook"
            ],
            verificationDate: "2026-06"
          },
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "elastomer_xnbr",
          type: "Elastomer",
          name: "XNBR (Carboxylated Nitrile / \u041A\u0430\u0440\u0431\u043E\u043A\u0441\u0438\u043B\u0430\u0442\u043D\u044B\u0439 \u0411\u041D\u041A)",
          aliases: [
            "xnbr",
            "carboxylated nitrile",
            "\u043A\u0430\u0440\u0431\u043E\u043A\u0441\u0438\u043B\u0430\u0442\u043D\u044B\u0439 \u043D\u0438\u0442\u0440\u0438\u043B"
          ],
          description: "Carboxylated nitrile elastomer offering supreme abrasion and tear resistance, for high mechanical load applications.",
          standards: [
            "ASTM D1418",
            "ISO 1629"
          ],
          temperature: {
            min: -35,
            max: 125,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 12e3,
            unit: "psi"
          },
          temperature_envelope: "-35\xB0C to 125\xB0C.",
          chemical_compatibility: "Excellent with petroleum oils and water. Poor with highly polar solvents.",
          rgd_resistance: "High. Carboxylation increases physical density and resistance to RGD.",
          sour_service_suitability: "Moderate. Marginally better than standard NBR, but not for high H2S.",
          steam_resistance: "Poor. Suffers steam degradation above 100\xB0C.",
          acid_compatibility: "Moderate. Resists trace concentrations of acid wash.",
          aromatics_resistance: "Moderate.",
          failure_mechanisms: "Thermal oxidation, cracking, wear in sour gas.",
          storage_recommendations: "Cool, dry space, away from UV and ozone.",
          field_limitations: "Not suitable for HPHT sour completions.",
          standards_metadata: "ASTM D1418, ISO 1629",
          evidence_metadata: {
            confidenceLevel: "Medium",
            sources: [
              "Elastomers in Oilfield Applications Handbook"
            ],
            verificationDate: "2026-06"
          },
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        }
      ],
      brines: [
        {
          id: "fluid_nacl_brine",
          type: "Fluid",
          name: "NaCl (Sodium Chloride / \u0425\u043B\u043E\u0440\u0438\u0434 \u043D\u0430\u0442\u0440\u0438\u044F)",
          aliases: [
            "nacl",
            "salt water",
            "\u0440\u0430\u0441\u0441\u043E\u043B \u0445\u043B\u043E\u0440\u0438\u0434\u0430 \u043D\u0430\u0442\u0440\u0438\u044F",
            "\u043D\u0430\u0442\u0440\u0438\u0439 \u0445\u043B\u043E\u0440"
          ],
          description: "Standard monovalent salt brine used for completion and workover.",
          standards: [
            "API RP 13F",
            "ISO 13503-3"
          ],
          temperature: {
            min: -21,
            max: 150,
            unit: "C"
          },
          pressure: {
            min: null,
            max: null,
            unit: ""
          },
          chemicalComposition: [
            "Sodium Chloride in water"
          ],
          chemicalCompatibility: [
            "Compatible with carbon steels and standard seals",
            "Non-damaging to clays"
          ],
          usedInEquipment: [
            "Wellbore fluid",
            "Completion ballast",
            "Packer fluid"
          ],
          advantages: [
            "Very cheap",
            "Environmentally safe",
            "Easy to mix"
          ],
          limitations: [
            "Max density limit of 1.20 sg (10 ppg) at saturation",
            "Corrosive in oxygenated environments"
          ],
          applications: [
            "Shallow wells",
            "Standard completion fluids"
          ],
          diagrams: [],
          graphs: [],
          sources: [
            "M-I SWACO Completion Fluids Manual"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2023",
          confidenceLevel: "Medium"
        },
        {
          id: "fluid_cacl2_brine",
          type: "Fluid",
          name: "CaCl\u2082 (Calcium Chloride / \u0425\u043B\u043E\u0440\u0438\u0434 \u043A\u0430\u043B\u044C\u0446\u0438\u044F)",
          aliases: [
            "cacl2",
            "calcium chloride",
            "\u0440\u0430\u0441\u0441\u043E\u043B \u0445\u043B\u043E\u0440\u0438\u0434\u0430 \u043A\u0430\u043B\u044C\u0446\u0438\u044F",
            "\u043A\u0430\u043B\u044C\u0446\u0438\u0439 \u0445\u043B\u043E\u0440"
          ],
          description: "Divalent salt brine used for higher density completion requirements.",
          standards: [
            "API RP 13F",
            "ISO 13503-3"
          ],
          temperature: {
            min: -40,
            max: 180,
            unit: "C"
          },
          pressure: {
            min: null,
            max: null,
            unit: ""
          },
          chemicalComposition: [
            "Calcium Chloride in water"
          ],
          chemicalCompatibility: [
            "Highly corrosive to carbon steel in presence of dissolved oxygen",
            "May precipitate with carbonates"
          ],
          usedInEquipment: [
            "Wellbore ballast",
            "Packer fluid"
          ],
          advantages: [
            "Achieves density up to 1.39 sg (11.6 ppg)",
            "Inhibits clay swelling"
          ],
          limitations: [
            "Relatively high cost",
            "Corrosive to packer metals without corrosion inhibitors"
          ],
          applications: [
            "Medium pressure completions",
            "Clay sensitive formations"
          ],
          diagrams: [],
          graphs: [],
          sources: [
            "M-I SWACO Completion Fluids Manual"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2023",
          confidenceLevel: "Medium"
        }
      ],
      pt_reference: [
        {
          id: "pt_fresh_water_gradient",
          type: "PT_Reference",
          name: "Fresh Water Gradient (\u041F\u0440\u0435\u0441\u043D\u0430\u044F \u0432\u043E\u0434\u0430)",
          aliases: [
            "fresh water",
            "hydrostatic water",
            "\u043F\u0440\u0435\u0441\u043D\u0430\u044F \u0432\u043E\u0434\u0430",
            "\u0433\u0440\u0430\u0434\u0438\u0435\u043D\u0442 \u043F\u0440\u0435\u0441\u043D\u043E\u0439 \u0432\u043E\u0434\u044B"
          ],
          description: "Standard baseline hydrostatic fluid gradient calculations based on pure water density.",
          standards: [
            "IPDS Handbook"
          ],
          temperature: {
            min: null,
            max: null,
            unit: ""
          },
          pressure: {
            min: null,
            max: null,
            unit: ""
          },
          chemicalComposition: [
            "Pure H2O"
          ],
          chemicalCompatibility: [],
          usedInEquipment: [
            "Hydrostatic calculations"
          ],
          advantages: [
            "Standard global reference baseline"
          ],
          limitations: [
            "Does not account for temperature salinity variations"
          ],
          applications: [
            "Hydrostatic baseline comparisons"
          ],
          diagrams: [],
          graphs: [],
          sources: [
            "IPDS Handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2024",
          confidenceLevel: "Medium"
        },
        {
          id: "pt_salt_water_gradient",
          type: "PT_Reference",
          name: "Salt Water Gradient (\u0421\u043E\u043B\u0435\u043D\u0430\u044F \u0432\u043E\u0434\u0430)",
          aliases: [
            "salt water",
            "sea water",
            "\u0441\u043E\u043B\u0435\u043D\u0430\u044F \u0432\u043E\u0434\u0430",
            "\u0433\u0440\u0430\u0434\u0438\u0435\u043D\u0442 \u0441\u043E\u043B\u0435\u043D\u043E\u0439 \u0432\u043E\u0434\u044B"
          ],
          description: "Standard hydrostatic gradient baseline for offshore and sea water applications.",
          standards: [
            "IPDS Handbook"
          ],
          temperature: {
            min: null,
            max: null,
            unit: ""
          },
          pressure: {
            min: null,
            max: null,
            unit: ""
          },
          chemicalComposition: [
            "Sea water (avg salinity 3.5%)"
          ],
          chemicalCompatibility: [],
          usedInEquipment: [
            "Hydrostatic ocean column calculations",
            "Offshore drilling"
          ],
          advantages: [
            "Accurate for offshore hydrostatic calculations"
          ],
          limitations: [
            "Salinity variations in different seas"
          ],
          applications: [
            "Deepwater offshore drilling hydrostatic calculations"
          ],
          diagrams: [],
          graphs: [],
          sources: [
            "IPDS Handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2024",
          confidenceLevel: "Medium"
        }
      ],
      standards: [
        {
          id: "standard_casing_tubing",
          type: "Standard",
          name: "Casing & Tubing Standard Mappings (\u041E\u041A\u0422 \u0438 \u041D\u041A\u0422)",
          aliases: [
            "5ct",
            "gost 31446",
            "gbt 19830",
            "\u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u044B \u0442\u0440\u0443\u0431"
          ],
          description: "Cross-reference equivalency map for casing and tubing specifications.",
          standards: [
            "API Spec 5CT",
            "ISO 11960",
            "\u0413\u041E\u0421\u0422 31446",
            "GB/T 19830"
          ],
          temperature: {
            min: null,
            max: null,
            unit: ""
          },
          pressure: {
            min: null,
            max: null,
            unit: ""
          },
          chemicalComposition: [],
          chemicalCompatibility: [],
          usedInEquipment: [
            "Downhole pipes",
            "Wellhead joints"
          ],
          advantages: [
            "Simplifies global procurement",
            "Cross-regional compliance"
          ],
          limitations: [
            "Minor differences in testing standards may exist"
          ],
          applications: [
            "Standard design engineering compliance checks"
          ],
          diagrams: [],
          graphs: [],
          sources: [
            "API/ISO/GOST Mappings Handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          confidenceLevel: "High",
          api: "API Spec 5CT, 10th Ed. (2018)",
          iso: "ISO 11960:2014",
          gost: "\u0413\u041E\u0421\u0422 31446-2017",
          gbt: "GB/T 19830-2017",
          nace: "NACE MR0175 (partial)",
          scope: "Casing, tubing, pup joints, couplings, connectors and accessories for use in oil and gas wells. Covers grades H40 through Q125. Specifies mechanical properties, dimensional tolerances, testing, inspection, and marking.",
          scope_ru: "\u041E\u0431\u0441\u0430\u0434\u043D\u044B\u0435 \u0438 \u043D\u0430\u0441\u043E\u0441\u043D\u043E-\u043A\u043E\u043C\u043F\u0440\u0435\u0441\u0441\u043E\u0440\u043D\u044B\u0435 \u0442\u0440\u0443\u0431\u044B, \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u043D\u0438\u043A\u0438, \u043C\u0443\u0444\u0442\u044B \u0438 \u0444\u0438\u0442\u0438\u043D\u0433\u0438 \u0434\u043B\u044F \u043D\u0435\u0444\u0442\u0435\u0433\u0430\u0437\u043E\u0432\u044B\u0445 \u0441\u043A\u0432\u0430\u0436\u0438\u043D. \u041E\u0445\u0432\u0430\u0442\u044B\u0432\u0430\u0435\u0442 \u0433\u0440\u0443\u043F\u043F\u044B \u043F\u0440\u043E\u0447\u043D\u043E\u0441\u0442\u0438 H40\u2013Q125. \u0420\u0435\u0433\u043B\u0430\u043C\u0435\u043D\u0442\u0438\u0440\u0443\u0435\u0442 \u043C\u0435\u0445\u0430\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0441\u0432\u043E\u0439\u0441\u0442\u0432\u0430, \u0440\u0430\u0437\u043C\u0435\u0440\u044B, \u0438\u0441\u043F\u044B\u0442\u0430\u043D\u0438\u044F, \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C \u0438 \u043C\u0430\u0440\u043A\u0438\u0440\u043E\u0432\u043A\u0443."
        },
        {
          id: "standard_drill_pipe",
          type: "Standard",
          name: "Drill Pipe Specifications (\u0411\u0443\u0440\u0438\u043B\u044C\u043D\u044B\u0435 \u0442\u0440\u0443\u0431\u044B)",
          aliases: [
            "5dp",
            "gost 32696",
            "\u0431\u0443\u0440\u0438\u043B\u044C\u043D\u044B\u0439 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442"
          ],
          description: "Equivalency standard mapping for steel drill pipes and tool joints.",
          standards: [
            "API Spec 5DP",
            "ISO 11961",
            "\u0413\u041E\u0421\u0422 32696-2014"
          ],
          temperature: {
            min: null,
            max: null,
            unit: ""
          },
          pressure: {
            min: null,
            max: null,
            unit: ""
          },
          chemicalComposition: [],
          chemicalCompatibility: [],
          usedInEquipment: [
            "Drill strings",
            "Heavy-weight drill pipes"
          ],
          advantages: [
            "Allows standard drill string integrity verification across countries"
          ],
          limitations: [
            "Differences in upset geometry standards"
          ],
          applications: [
            "Drill string design and load limit calculations"
          ],
          diagrams: [],
          graphs: [],
          sources: [
            "API Spec 5DP 2nd Ed",
            "\u0413\u041E\u0421\u0422 32696-2014"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2024",
          confidenceLevel: "High",
          api: "API Spec 5DP, 2nd Ed. (2009)",
          iso: "ISO 11961:2008",
          gost: "\u0413\u041E\u0421\u0422 32570-2013",
          gbt: "GB/T 20659-2020",
          nace: "\u2014",
          scope: "Drill pipe for use in rotary drilling operations. Covers grades E-75 through S-135. Specifies dimensions, mechanical properties, inspection, and marking for drill pipe body and tool joints.",
          scope_ru: "\u0411\u0443\u0440\u0438\u043B\u044C\u043D\u044B\u0435 \u0442\u0440\u0443\u0431\u044B \u0434\u043B\u044F \u0440\u043E\u0442\u043E\u0440\u043D\u043E\u0433\u043E \u0431\u0443\u0440\u0435\u043D\u0438\u044F. \u041E\u0445\u0432\u0430\u0442\u044B\u0432\u0430\u0435\u0442 \u0433\u0440\u0443\u043F\u043F\u044B \u043F\u0440\u043E\u0447\u043D\u043E\u0441\u0442\u0438 E-75\u2013S-135. \u0420\u0435\u0433\u043B\u0430\u043C\u0435\u043D\u0442\u0438\u0440\u0443\u0435\u0442 \u0440\u0430\u0437\u043C\u0435\u0440\u044B, \u043C\u0435\u0445\u0430\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0441\u0432\u043E\u0439\u0441\u0442\u0432\u0430, \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C \u0438 \u043C\u0430\u0440\u043A\u0438\u0440\u043E\u0432\u043A\u0443 \u0442\u0435\u043B\u0430 \u0442\u0440\u0443\u0431\u044B \u0438 \u0437\u0430\u043C\u043A\u043E\u0432."
        },
        {
          id: "standard_api_5ct",
          type: "Standard Specifications",
          name: "API Spec 5CT / ISO 11960",
          aliases: [
            "API 5CT",
            "ISO 11960"
          ],
          description: "Specification for Casing and Tubing. Governs the mechanical, chemical, and dimensional requirements for steel pipes used in oil and gas wells.",
          standards: [
            "API Spec 5CT 10th Edition",
            "ISO 11960:2020"
          ],
          temperature: {
            min: -60,
            max: 350,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 2e4,
            unit: "psi"
          },
          chemicalComposition: [],
          chemicalCompatibility: [],
          usedInEquipment: [
            "All downhole tubing",
            "Casing strings",
            "Pup joints"
          ],
          advantages: [
            "Global industrial standard",
            "Ensures strict quality control and dimensional uniformity"
          ],
          limitations: [
            "Does not cover premium connections testing (governed by ISO 13679)",
            "Does not cover corrosion resistant alloys (covered by API 5CRA)"
          ],
          applications: [
            "Material specification for standard carbon steel casing and tubing procurement"
          ],
          sources: [
            "API Spec 5CT 10th Ed"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2020",
          why_selected: [
            "Essential foundation standard for casing and tubing design in oil and gas completions"
          ],
          why_avoided: [
            "Supplement with API 5CRA when using stainless steel or nickel alloys"
          ],
          confidenceLevel: "High",
          purpose: "Defines technical delivery conditions for casing and tubing steel pipes, coupling stock, and accessory materials.",
          scope: "Primary standard for OCTG (oil country tubular goods). Specifies manufacturing, testing, and inspection requirements for casing and tubing used in wells. Grades: J55, K55, N80, L80, C90, T95, P110, Q125.",
          critical_sections: "Section 7: Chemical composition and hardness limits. Section 10: NDT inspection levels (SR1, SR2). Table C.1: Tensile and yield properties.",
          cross_standard_mapping: "API Spec 5CT \u2194 ISO 11960 \u2194 \u0413\u041E\u0421\u0422 31446 (fully harmonized for steel grades up to P110).",
          scope_ru: "\u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442 \u0434\u043B\u044F \u041D\u041A\u0422 \u0438 \u041E\u041A\u0422 (\u043D\u0435\u0444\u0442\u0435\u043F\u0440\u043E\u043C\u044B\u0441\u043B\u043E\u0432\u044B\u0435 \u0442\u0440\u0443\u0431\u044B). \u041E\u043F\u0440\u0435\u0434\u0435\u043B\u044F\u0435\u0442 \u0442\u0440\u0435\u0431\u043E\u0432\u0430\u043D\u0438\u044F \u043A \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u0443, \u0438\u0441\u043F\u044B\u0442\u0430\u043D\u0438\u044F\u043C \u0438 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044E \u043E\u0431\u0441\u0430\u0434\u043D\u044B\u0445 \u0438 \u043D\u0430\u0441\u043E\u0441\u043D\u043E-\u043A\u043E\u043C\u043F\u0440\u0435\u0441\u0441\u043E\u0440\u043D\u044B\u0445 \u0442\u0440\u0443\u0431. \u0413\u0440\u0443\u043F\u043F\u044B: J55, K55, N80, L80, C90, T95, P110, Q125.",
          api: "API Spec 5CT, 10th Ed. (2018)",
          iso: "ISO 11960:2014",
          gost: "\u0413\u041E\u0421\u0422 31446-2017",
          gbt: "GB/T 19830-2017",
          nace: "NACE MR0175/ISO 15156"
        },
        {
          id: "standard_nace_mr0175",
          type: "Standard Specifications",
          name: "NACE MR0175 / ISO 15156",
          aliases: [
            "NACE MR0175",
            "ISO 15156"
          ],
          description: "Materials for use in H2S-containing environments in oil and gas production. Defines strict rules to prevent sulfide stress cracking (SSC) and stress corrosion cracking (SCC).",
          standards: [
            "NACE MR0175 / ISO 15156 Part 1, 2, and 3"
          ],
          temperature: {
            min: -100,
            max: 400,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 3e4,
            unit: "psi"
          },
          chemicalComposition: [],
          chemicalCompatibility: [],
          usedInEquipment: [
            "Downhole tubulars",
            "Packers",
            "Subsea trees",
            "Chokes and valves"
          ],
          advantages: [
            "Crucial standard for safety in sour oilfield operations",
            "Prevents catastrophic failures due to hydrogen embrittlement"
          ],
          limitations: [
            "Does not specify mechanical design limits, only chemical/metallurgical thresholds for H2S service"
          ],
          applications: [
            "Material selection guidelines for all wells with H2S partial pressure > 0.05 psi"
          ],
          sources: [
            "NACE MR0175/ISO 15156:2020"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2020",
          why_selected: [
            "Mandatory global standard for environmental safety and materials compliance in sour service completions"
          ],
          why_avoided: [
            "Not required for sweet wells where H2S is completely absent (reduces material cost significantly)"
          ],
          confidenceLevel: "High",
          purpose: "Establishes requirements and recommendations for the selection and qualification of carbon steels, low-alloy steels, and CRAs in sour environments.",
          scope: "Materials for use in H2S-containing environments in oil and gas production. Defines requirements for metallic materials for sulfide stress cracking (SSC) resistance. Mandatory for sour service applications.",
          critical_sections: "Part 2, Clause 8: Hardness requirements for carbon steels (max 22 HRC). Part 3, Annex A: Environmental limits for CRAs (temperature vs. H2S limits).",
          cross_standard_mapping: "NACE MR0175 \u2194 ISO 15156 \u2194 \u0413\u041E\u0421\u0422 \u0420 53678 (sour service compliance verification).",
          scope_ru: "\u041C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044B \u0434\u043B\u044F \u0440\u0430\u0431\u043E\u0442\u044B \u0432 \u0441\u0440\u0435\u0434\u0430\u0445, \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0449\u0438\u0445 H2S, \u043F\u0440\u0438 \u0434\u043E\u0431\u044B\u0447\u0435 \u043D\u0435\u0444\u0442\u0438 \u0438 \u0433\u0430\u0437\u0430. \u041E\u043F\u0440\u0435\u0434\u0435\u043B\u044F\u0435\u0442 \u0442\u0440\u0435\u0431\u043E\u0432\u0430\u043D\u0438\u044F \u043A \u043C\u0435\u0442\u0430\u043B\u043B\u0438\u0447\u0435\u0441\u043A\u0438\u043C \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u0430\u043C \u043F\u043E \u0441\u0443\u043B\u044C\u0444\u0438\u0434\u043D\u043E\u043C\u0443 \u0440\u0430\u0441\u0442\u0440\u0435\u0441\u043A\u0438\u0432\u0430\u043D\u0438\u044E \u043F\u043E\u0434 \u043D\u0430\u043F\u0440\u044F\u0436\u0435\u043D\u0438\u0435\u043C (\u0412\u0420\u041D/SSC). \u041E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u0435\u043D \u0434\u043B\u044F \u043A\u0438\u0441\u043B\u044B\u0445 \u0441\u0440\u0435\u0434.",
          api: "\u2014",
          iso: "ISO 15156:2015 (Parts 1-3)",
          gost: "\u0413\u041E\u0421\u0422 \u0420 \u0418\u0421\u041E 15156-2012",
          gbt: "GB/T 20972-2007",
          nace: "NACE MR0175, 2015 Ed."
        }
      ],
      acid_environments: [
        {
          id: "acid_hcl_carbon_steel",
          type: "Acid_Environment",
          name: "Carbon Steel in HCl (\u0423\u0433\u043B\u0435\u0440\u043E\u0434\u0438\u0441\u0442\u0430\u044F \u0441\u0442\u0430\u043B\u044C \u0432 HCl)",
          aliases: [
            "hcl carbon steel",
            "\u0441\u043E\u043B\u044F\u043D\u0430\u044F \u043A\u0438\u0441\u043B\u043E\u0442\u0430 \u0441\u0442\u0430\u043B\u044C",
            "hcl",
            "\u0443\u0433\u043B\u0435\u0440\u043E\u0434\u0438\u0441\u0442\u0430\u044F \u0441\u0442\u0430\u043B\u044C \u0441\u043E\u043B\u044F\u043D\u0430\u044F"
          ],
          description: "Corrosion rate mapping of Carbon Steel in Hydrochloric Acid (HCl) under stimulation conditions.",
          standards: [
            "NACE SP0169"
          ],
          temperature: {
            min: 0,
            max: 100,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 1e4,
            unit: "psi"
          },
          chemicalComposition: [],
          chemicalCompatibility: [],
          usedInEquipment: [
            "Acidizing pipes",
            "Production strings during stimulation"
          ],
          advantages: [
            "Affordable material under active inhibition"
          ],
          limitations: [
            "Rapid metal loss without organic amine inhibitors above 60\xB0C"
          ],
          applications: [
            "Acid wash stimulation monitoring"
          ],
          diagrams: [
            "makeup-loss"
          ],
          graphs: [
            "pitting_corrosion_rate_hcl"
          ],
          sources: [
            "NACE SP0169"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2023",
          confidenceLevel: "Medium"
        },
        {
          id: "acid_sour_gas_13cr",
          type: "Acid_Environment",
          name: "13Cr Steel in Sour Gas (13Cr \u0441\u0442\u0430\u043B\u044C \u0432 H\u2082S + CO\u2082)",
          aliases: [
            "13cr h2s",
            "13cr sour gas",
            "13\u0445\u0440 \u0441\u0435\u0440\u043E\u0432\u043E\u0434\u043E\u0440\u043E\u0434",
            "13cr"
          ],
          description: "Performance and corrosion envelopes for 13Cr Martensitic Stainless Steel in H2S and CO2 environments.",
          standards: [
            "NACE MR0175",
            "ISO 15156-2"
          ],
          temperature: {
            min: 0,
            max: 160,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 12e3,
            unit: "psi"
          },
          chemicalComposition: [
            "13% Chromium martensitic stainless steel"
          ],
          chemicalCompatibility: [
            "Resistant to CO2 corrosion",
            "Slight susceptibility to H2S SSC"
          ],
          usedInEquipment: [
            "Production tubing strings",
            "Subsurface safety valves"
          ],
          advantages: [
            "Excellent CO2 weight-loss corrosion resistance",
            "Cost-effective compared to CRA alloys"
          ],
          limitations: [
            "Susceptible to SSC at high H2S partial pressures and low pH"
          ],
          applications: [
            "Wells with high CO2 content and trace H2S concentrations"
          ],
          diagrams: [
            "seal-surfaces"
          ],
          graphs: [],
          sources: [
            "NACE MR0175",
            "ISO 15156"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          confidenceLevel: "Medium"
        }
      ],
      steel_grades: [
        {
          id: "steel_grade_l80",
          type: "Steel Grade",
          name: "L80 Carbon Steel",
          aliases: [
            "L80",
            "\u0441\u0442\u0430\u043B\u044C L80",
            "13Cr L80",
            "API L80"
          ],
          description: "API 5CT controlled hardness carbon steel grade designed for mild sour service (H2S) environments.",
          standards: [
            "API Spec 5CT",
            "ISO 11960",
            "NACE MR0175"
          ],
          temperature: {
            min: -29,
            max: 180,
            unit: "C"
          },
          pressure: {
            min: null,
            max: null,
            unit: ""
          },
          yield_strength: "80,000 - 95,000 psi (552 - 655 MPa)",
          tensile_strength: "Min 95,000 psi (655 MPa)",
          chemical_composition: "Carbon Steel with Chrome and Moly additions, strictly controlled hardness (Max 23 HRC)",
          sour_service_suitability: "Suitable for H2S service under NACE MR0175 / ISO 15156 limits",
          temperature_suitability: "Stable down to -29C (-20F), suitable for deep hot wells up to 180C",
          corrosion_resistance: "Resistant to Sulfide Stress Cracking (SSC). Poor CO2 resistance without corrosion inhibitors.",
          used_in_equipment: [
            "Tubulars (tubing and casing)",
            "Pup joints",
            "Crossovers",
            "Couplings"
          ],
          advantages: [
            "NACE MR0175 compliant for sour service",
            "High yield strength compared to H40/J55",
            "Excellent global availability and standard sizing"
          ],
          limitations: [
            "High corrosion rate in wet CO2 environments without chemical inhibition",
            "Brittle failure risk if hardness exceeds 23 HRC"
          ],
          typical_applications: [
            "Production and injection wells with mild H2S",
            "Intermediate and production casing strings"
          ],
          engineering_notes: "Always verify hardness certification (maximum 23 HRC is mandatory for NACE compliance).",
          sources: [
            "API Spec 5CT 10th Ed",
            "NACE MR0175 / ISO 15156"
          ],
          revisionDate: "2025",
          lastUpdated: "2026-06",
          confidenceLevel: "High"
        },
        {
          id: "steel_grade_p110",
          type: "Steel Grade",
          name: "P110 Carbon Steel",
          aliases: [
            "P110",
            "\u0441\u0442\u0430\u043B\u044C P110",
            "API P110"
          ],
          description: "High-strength API 5CT carbon steel grade for deep, high-pressure wells without H2S risks.",
          standards: [
            "API Spec 5CT",
            "ISO 11960"
          ],
          temperature: {
            min: -20,
            max: 200,
            unit: "C"
          },
          pressure: {
            min: null,
            max: null,
            unit: ""
          },
          yield_strength: "110,000 - 140,000 psi (758 - 965 MPa)",
          tensile_strength: "Min 125,000 psi (862 MPa)",
          chemical_composition: "Quenched & Tempered Manganese-Chromium Carbon Steel",
          sour_service_suitability: "NOT suitable for H2S service (susceptible to rapid Sulfide Stress Cracking)",
          temperature_suitability: "Good performance up to 200C (392F)",
          corrosion_resistance: "Standard carbon steel corrosion rate. High susceptibility to SSC.",
          used_in_equipment: [
            "High pressure casing strings",
            "Deep production tubing",
            "Liner hangers"
          ],
          advantages: [
            "Extremely high tensile and collapse capacity",
            "Most cost-effective grade for deep sweet wells"
          ],
          limitations: [
            "Strictly forbidden in sour gas or sour oil wells due to catastrophic SSC risks"
          ],
          typical_applications: [
            "Deep vertical wells",
            "High pressure sweet gas reservoirs",
            "Intermediate casing sections"
          ],
          engineering_notes: "Never use in sour wells. Ensure strict QA/QC to avoid accidental H2S exposure.",
          sources: [
            "API Spec 5CT 10th Ed"
          ],
          revisionDate: "2025",
          lastUpdated: "2026-06",
          confidenceLevel: "High"
        },
        {
          id: "steel_grade_q125",
          type: "Steel Grade",
          name: "Q125 High-Strength Steel",
          aliases: [
            "Q125",
            "\u0441\u0442\u0430\u043B\u044C Q125",
            "API Q125"
          ],
          description: "Ultra-high strength API 5CT carbon steel grade designed for high-pressure deep wells. Requires special manufacturing controls.",
          standards: [
            "API Spec 5CT",
            "ISO 11960"
          ],
          temperature: {
            min: -20,
            max: 200,
            unit: "C"
          },
          pressure: {
            min: null,
            max: null,
            unit: ""
          },
          yield_strength: "125,000 - 150,000 psi (862 - 1034 MPa)",
          tensile_strength: "Min 135,000 psi (931 MPa)",
          chemical_composition: "Quenched & Tempered Cr-Mo Alloy Steel with strict grain size requirements",
          sour_service_suitability: "Generally NOT suitable for sour service, though highly controlled chemistry Q125 can be used in limited mild sour conditions with operator approval",
          temperature_suitability: "Stable at deep downhole conditions up to 200C",
          corrosion_resistance: "High strength makes it very brittle in presence of hydrogen or H2S",
          used_in_equipment: [
            "Heavy wall production casing",
            "Deep liners",
            "HPHT completion components"
          ],
          advantages: [
            "Ultimate load capability for deep reservoirs",
            "High collapse resistance under heavy mud weight"
          ],
          limitations: [
            "High susceptibility to cracking under stress in sour environments",
            "Very high cost and limited sourcing"
          ],
          typical_applications: [
            "Deep gas wells",
            "HPHT reservoir sections",
            "Severe tectonic stress areas"
          ],
          engineering_notes: "Manufacturing quality and heat treatment records must be fully traceable.",
          sources: [
            "API Spec 5CT 10th Ed"
          ],
          revisionDate: "2025",
          lastUpdated: "2026-06",
          confidenceLevel: "High"
        },
        {
          id: "steel_grade_13cr",
          type: "Steel Grade",
          name: "13Cr Martensitic Stainless Steel",
          aliases: [
            "13Cr",
            "\u0441\u0442\u0430\u043B\u044C 13Cr",
            "13 \u0445\u0440\u043E\u043C\u0438\u0441\u0442\u0430\u044F \u0441\u0442\u0430\u043B\u044C",
            "L80-13Cr"
          ],
          description: "Martensitic stainless steel with 13% Chromium, providing excellent resistance to CO2 weight-loss corrosion.",
          standards: [
            "API Spec 5CT",
            "NACE MR0175",
            "ISO 15156-3"
          ],
          temperature: {
            min: -10,
            max: 150,
            unit: "C"
          },
          pressure: {
            min: null,
            max: null,
            unit: ""
          },
          yield_strength: "80,000 - 95,500 psi (552 - 658 MPa)",
          tensile_strength: "Min 95,000 psi (655 MPa)",
          chemical_composition: "12.0 - 14.0% Chromium, low Carbon alloy steel",
          sour_service_suitability: "Limited. Suitable for trace H2S only (partial pressure H2S < 0.1 psi / 1.5 kPa) depending on pH.",
          temperature_suitability: "Max temperature limit of 150C (302F) to prevent pitting in chloride environments",
          corrosion_resistance: "Superb resistance to sweet CO2 corrosion. High pitting risk in presence of oxygen and high chlorides.",
          used_in_equipment: [
            "Production tubing strings",
            "Subsurface safety valves",
            "Packer mandrels"
          ],
          advantages: [
            "Eliminates the need for continuous downhole corrosion inhibitors in CO2 wells",
            "High yield strength equivalent to L80"
          ],
          limitations: [
            "Extremely prone to galling during makeup (requires premium thread compounds and slow makeup speed)",
            "High cost compared to L80 carbon steel"
          ],
          typical_applications: [
            "CO2 production wells",
            "Water injection wells with dissolved CO2",
            "Corrosive sweet gas wells"
          ],
          engineering_notes: "Always use specialized thread compounds (e.g. metal-free premium dopes) and slow RPM during makeup to prevent galling.",
          sources: [
            "API Spec 5CT 10th Ed",
            "NACE MR0175 / ISO 15156-3"
          ],
          revisionDate: "2025",
          lastUpdated: "2026-06",
          confidenceLevel: "High"
        },
        {
          id: "steel_grade_super_13cr",
          type: "Steel Grade",
          name: "Super 13Cr (HP2-13Cr)",
          aliases: [
            "Super 13Cr",
            "\u0441\u0442\u0430\u043B\u044C Super 13Cr",
            "\u0441\u0443\u043F\u0435\u0440 13Cr",
            "HP2-13Cr"
          ],
          description: "Enhanced martensitic stainless steel with low Carbon, Nickel, and Molybdenum additions, offering higher strength and improved H2S resistance over standard 13Cr.",
          standards: [
            "NACE MR0175",
            "ISO 15156-3",
            "Proprietary OEM Specs"
          ],
          temperature: {
            min: -20,
            max: 180,
            unit: "C"
          },
          pressure: {
            min: null,
            max: null,
            unit: ""
          },
          yield_strength: "95,000 - 110,000 psi (655 - 758 MPa)",
          tensile_strength: "Min 105,000 psi (724 MPa)",
          chemical_composition: "12.0 - 14.0% Cr, 4.0 - 6.0% Ni, 1.5 - 2.5% Mo, Ultra-low Carbon (< 0.03%)",
          sour_service_suitability: "Intermediate. Suitable for H2S partial pressures up to 1.5 psi (10 kPa) depending on pH and temperature.",
          temperature_suitability: "Extended limit up to 180C (356F) in mild sour conditions",
          corrosion_resistance: "Excellent CO2 resistance, superior pitting and SSC resistance compared to standard 13Cr.",
          used_in_equipment: [
            "HPHT production tubing",
            "CRA crossovers",
            "High performance packers"
          ],
          advantages: [
            "Extends the envelope of 13Cr to higher temperatures and mild sour service",
            "High yield strength (95ksi and 110ksi grades)"
          ],
          limitations: [
            "Significant cost premium over standard 13Cr",
            "Requires premium thread connections and careful handling to prevent damage"
          ],
          typical_applications: [
            "Deep hot wells with CO2 and mild H2S",
            "HPHT sweet/mildly sour gas wells"
          ],
          engineering_notes: "Check specific manufacturer limits for pH vs Cl- concentration vs H2S partial pressure envelopes.",
          sources: [
            "NACE MR0175 / ISO 15156-3",
            "CRA Material Data Sheets"
          ],
          revisionDate: "2024",
          lastUpdated: "2026-06",
          confidenceLevel: "High"
        },
        {
          id: "steel_grade_inconel_718",
          type: "Steel Grade",
          name: "Inconel 718 (Nickel-Based CRA)",
          aliases: [
            "Inconel",
            "Inconel 718",
            "\u0438\u043D\u043A\u043E\u043D\u0435\u043B\u044C",
            "\u0441\u0442\u0430\u043B\u044C Inconel",
            "CRA Inconel"
          ],
          description: "Precipitation-hardenable nickel-chromium alloy containing significant amounts of iron, niobium, and molybdenum, designed for extreme high-strength and severe sour service.",
          standards: [
            "NACE MR0175",
            "ISO 15156-3",
            "API Spec 6A",
            "ASTM B637"
          ],
          temperature: {
            min: -100,
            max: 350,
            unit: "C"
          },
          pressure: {
            min: null,
            max: null,
            unit: ""
          },
          yield_strength: "120,000 - 150,000 psi (827 - 1034 MPa)",
          tensile_strength: "Min 150,000 psi (1034 MPa)",
          chemical_composition: "50.0 - 55.0% Nickel, 17.0 - 21.0% Chromium, 2.8 - 3.3% Molybdenum, Balance Iron",
          sour_service_suitability: "Fully suitable for severe sour service (100% H2S) with no limits under NACE MR0175 up to high temperatures.",
          temperature_suitability: "Exceptional stability from cryogenic temperatures up to 350C+ downhole",
          corrosion_resistance: "Virtually immune to CO2 corrosion, chloride stress corrosion cracking, and H2S sulfide stress cracking.",
          used_in_equipment: [
            "Subsurface safety valve springs and housings",
            "HPHT packer components",
            "Logging tool housings",
            "Wellhead valve gates"
          ],
          advantages: [
            "Ultimate mechanical strength combined with ultimate corrosion resistance",
            "Immunity to SSC/SCC under extreme loading"
          ],
          limitations: [
            "Extremely high cost (up to 10-15x carbon steel)",
            "Very difficult to machine and fabricate"
          ],
          typical_applications: [
            "HPHT severe sour wells",
            "Subsurface safety critical components",
            "Deep water completion strings"
          ],
          engineering_notes: "Verify material certification to ensure proper solution annealing and precipitation hardening treatment.",
          sources: [
            "NACE MR0175 / ISO 15156-3",
            "Inconel 718 Material Handbook"
          ],
          revisionDate: "2024",
          lastUpdated: "2026-06",
          confidenceLevel: "High"
        },
        {
          id: "steel_grade_25cr",
          type: "Steel Grade",
          name: "25Cr Super Duplex Steel",
          aliases: [
            "25Cr",
            "Super Duplex",
            "\u0441\u0442\u0430\u043B\u044C 25Cr",
            "\u0441\u0443\u043F\u0435\u0440\u0434\u0443\u043F\u043B\u0435\u043A\u0441"
          ],
          description: "Premium 25% Chromium duplex stainless steel with high molybdenum and nitrogen content for highly corrosive environments.",
          standards: [
            "ASTM A790",
            "NACE MR0175",
            "ISO 15156-3"
          ],
          temperature: {
            min: -50,
            max: 230,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 16e3,
            unit: "psi"
          },
          mechanical_properties: "Yield: 80,000 - 125,000 psi (552 - 862 MPa), Tensile: Min 110,000 psi (758 MPa). Hardness: Max 32 HRC.",
          h2s_compatibility: "Excellent. Resistant to higher H2S partial pressures than 22Cr Duplex (up to 3.0 psi).",
          co2_compatibility: "Exceptional. Complete resistance to sweet weight-loss corrosion up to 230\xB0C.",
          chloride_resistance: "Outstanding. Pitting Resistance Equivalent Number (PREN) > 40.",
          temperature_envelope: "-50\xB0C to 230\xB0C.",
          collapse_yield_considerations: "Excellent load capacity for deep corrosive HPHT wells.",
          galling_tendency: "Very High. Demands premium thread coatings, slow stabbing, and clean joints.",
          corrosion_mechanisms: "Sulfide Stress Cracking if NACE limits are exceeded in extreme environments.",
          field_limitations: "Strict NACE limits apply for H2S partial pressures at high temperatures.",
          common_failure_modes: "Running galling, stress corrosion cracking under extreme acidizing jobs.",
          applicable_standards: "ASTM A790, NACE MR0175 / ISO 15156-3",
          oem_references: "Sandvik Super Duplex guidelines.",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "NACE MR0175",
              "ASTM A790"
            ],
            verificationDate: "2026-06"
          },
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "steel_grade_28cr",
          type: "Steel Grade",
          name: "28Cr Austenitic Stainless Steel",
          aliases: [
            "28Cr",
            "UNS N08028",
            "Sanicro 28"
          ],
          description: "Highly alloyed austenitic stainless steel with superb resistance to sour environments containing chlorides and hydrogen sulfide.",
          standards: [
            "NACE MR0175",
            "API Spec 5CRA",
            "UNS N08028"
          ],
          temperature: {
            min: -60,
            max: 300,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 16e3,
            unit: "psi"
          },
          chemicalComposition: [
            "28% Chromium",
            "31% Nickel",
            "3.5% Molybdenum",
            "1% Copper",
            "Iron balance"
          ],
          chemicalCompatibility: [
            "High H2S and CO2",
            "Concentrated phosphoric/sulfuric acids",
            "Chloride brines"
          ],
          usedInEquipment: [
            "HPHT production casing",
            "Downhole liners",
            "Sulfide-rich flowlines"
          ],
          advantages: [
            "Excellent resistance to stress corrosion cracking in sour chloride media",
            "Superb general corrosion resistance in wet acid gas"
          ],
          limitations: [
            "Relatively high cost due to chromium/nickel content",
            "Lower yield strength in annealed state compared to cold-worked Duplex grades"
          ],
          applications: [
            "Tubulars for corrosive sour wells with high temperature and watercut",
            "Geothermal steam recovery installations"
          ],
          sources: [
            "API Spec 5CRA",
            "NACE MR0175 / ISO 15156-3"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          yield_strength: "110,000 - 125,000 psi (cold-worked)",
          tensile_strength: "115,000 - 140,000 psi",
          hardness: "max 35 HRC",
          sour_service_suitability: "Highly compatible (excellent resistance to SSC and SCC)",
          corrosion_resistance: "Superior pitting resistance in hot brine and sour environments containing sulfur compounds.",
          why_selected: [
            "Bridges the gap between Super 13Cr and expensive nickel-based alloys in warm, moderately sour wells",
            "Excellent ductility and fracture toughness"
          ],
          why_avoided: [
            "Avoid in extreme chloride/H2S environments above 230C where nickel-based Inconel 718 is mandatory",
            "Avoid if simple 13Cr provides sufficient envelope (cost optimization)"
          ],
          confidenceLevel: "High"
        },
        {
          id: "steel_grade_duplex",
          type: "Steel Grade",
          name: "22Cr Duplex Stainless Steel",
          aliases: [
            "22Cr",
            "Duplex 22Cr",
            "\u0441\u0442\u0430\u043B\u044C 22Cr",
            "\u0434\u0432\u0443\u0445\u0444\u0430\u0437\u043D\u0430\u044F \u0441\u0442\u0430\u043B\u044C"
          ],
          description: "Austenitic-ferritic duplex stainless steel with 22% Chromium, providing high mechanical strength and excellent resistance to CO2/H2S.",
          standards: [
            "ASTM A790",
            "NACE MR0175",
            "ISO 15156-3"
          ],
          temperature: {
            min: -50,
            max: 200,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 15e3,
            unit: "psi"
          },
          mechanical_properties: "Yield: 65,000 - 110,000 psi (448 - 758 MPa), Tensile: Min 90,000 psi (621 MPa). Hardness: Max 28 HRC.",
          h2s_compatibility: "Good. Suitable for sour service under NACE MR0175 limit envelopes (pH vs. H2S partial pressure).",
          co2_compatibility: "Outstanding. Almost immune to CO2 weight-loss corrosion up to 200\xB0C.",
          chloride_resistance: "High. Excellent resistance to pitting and chloride stress corrosion cracking.",
          temperature_envelope: "-50\xB0C to 200\xB0C downhole environment.",
          collapse_yield_considerations: "Very high yield ratings in cold-worked versions (e.g. 110 ksi yield grades).",
          galling_tendency: "High galling risk during running. Requires specialized metal-free lubricants and controlled torque-turn monitoring.",
          corrosion_mechanisms: "Local pitting in severe low-pH chloride solutions under trace oxygen.",
          field_limitations: "Subject to NACE H2S limits at high temperatures (typically max 1.5 psi H2S partial pressure).",
          common_failure_modes: "Makeup galling damage, chloride SCC if NACE limits are exceeded.",
          applicable_standards: "NACE MR0175 / ISO 15156-3, ASTM A790",
          oem_references: "Sandvik Duplex Steel Guides.",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "NACE MR0175",
              "Sandvik Material Specifications"
            ],
            verificationDate: "2026-06"
          },
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "steel_grade_inconel_625",
          type: "Steel Grade",
          name: "Inconel 625 (Nickel CRA)",
          aliases: [
            "Inconel 625",
            "alloy 625",
            "\u0438\u043D\u043A\u043E\u043D\u0435\u043B\u044C 625"
          ],
          description: "Non-magnetic nickel-based CRA with excellent strength, toughness, and chemical resistance.",
          standards: [
            "ASTM B444",
            "NACE MR0175",
            "ISO 15156-3"
          ],
          temperature: {
            min: -196,
            max: 300,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 18e3,
            unit: "psi"
          },
          mechanical_properties: "Yield: 60,000 - 120,000 psi (414 - 827 MPa), Tensile: Min 120,000 psi (827 MPa). Hardness: Max 35 HRC.",
          h2s_compatibility: "Outstanding. Immunity to SSC across all H2S concentrations under NACE MR0175.",
          co2_compatibility: "Exceptional. No weight-loss corrosion in wet CO2.",
          chloride_resistance: "Extreme resistance to chloride pitting, crevice corrosion, and SCC.",
          temperature_envelope: "Excellent stability from cryogenic up to 300\xB0C+.",
          collapse_yield_considerations: "Excellent load limits in cold-worked status; highly ductile.",
          galling_tendency: "Very high galling risk. Specialized premium compounds mandatory.",
          corrosion_mechanisms: "Virtually immune to common downhole corrosion mechanisms.",
          field_limitations: "Very high cost limit; complex machining requirements.",
          common_failure_modes: "Galling during installation, mechanical over-stress.",
          applicable_standards: "ASTM B444, NACE MR0175 / ISO 15156",
          oem_references: "Special Metals Inconel Handbook.",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "NACE MR0175",
              "Special Metals Corp"
            ],
            verificationDate: "2026-06"
          },
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "steel_grade_inconel_725",
          type: "Steel Grade",
          name: "Inconel 725 (High-Strength CRA)",
          aliases: [
            "Inconel 725",
            "Alloy 725",
            "UNS N07725"
          ],
          description: "Age-hardenable nickel-chromium superalloy that combines the corrosion resistance of Alloy 625 with much higher mechanical strength.",
          standards: [
            "NACE MR0175",
            "API Spec 6A",
            "UNS N07725"
          ],
          temperature: {
            min: -150,
            max: 400,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 22e3,
            unit: "psi"
          },
          chemicalComposition: [
            "57% Nickel",
            "21% Chromium",
            "8% Molybdenum",
            "3.5% Niobium",
            "1.6% Titanium",
            "Iron balance"
          ],
          chemicalCompatibility: [
            "Elemental sulfur",
            "Sour service (H2S + CO2)",
            "Hydrochloric acid",
            "Chloride brines"
          ],
          usedInEquipment: [
            "High-strength downhole hangers",
            "Safety valves components",
            "Shear pins and polished bore receptacles (PBR)"
          ],
          advantages: [
            "Extremely high yield strength (>120 ksi) achieved through age hardening",
            "Maintains high impact strength and ductility",
            "Excellent resistance to hydrogen embrittlement"
          ],
          limitations: [
            "Premium pricing",
            "Requires sophisticated vacuum-induction melting and heat treatment controls"
          ],
          applications: [
            "Ultra-HPHT completions in deepwater offshore wells",
            "Critical landing joints and packers"
          ],
          sources: [
            "Special Metals Corp Alloy 725 Datasheet",
            "NACE MR0175-3"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2024",
          yield_strength: "120,000 - 140,000 psi",
          tensile_strength: "150,000 - 170,000 psi",
          hardness: "max 40 HRC",
          sour_service_suitability: "Excellent, fully approved for severe sour service without H2S limit up to 232C",
          corrosion_resistance: "Equivalent to Inconel 625, but with mechanical envelope capable of exceeding standard yield thresholds.",
          why_selected: [
            "Mandatory when both extreme tensile capacity and maximum corrosion immunity are required",
            "Avoids the weld cladding limitations of Alloy 625"
          ],
          why_avoided: [
            "High cost prohibits bulk casing/tubing runs; limited to critical downhole tools and flow controls"
          ],
          confidenceLevel: "High"
        },
        {
          id: "steel_grade_j55",
          type: "Steel Grade",
          name: "J55 Carbon Steel",
          aliases: [
            "J55",
            "\u0441\u0442\u0430\u043B\u044C J55",
            "API J55"
          ],
          description: "API Spec 5CT J55 standard carbon steel grade for shallow, low-pressure tubulars.",
          standards: [
            "API Spec 5CT",
            "ISO 11960",
            "\u0413\u041E\u0421\u0422 31446"
          ],
          temperature: {
            min: -20,
            max: 120,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 7500,
            unit: "psi"
          },
          mechanical_properties: "Yield: 55,000 - 80,000 psi (379 - 552 MPa), Tensile: Min 75,000 psi (517 MPa). Hardness: Max 22 HRC.",
          h2s_compatibility: "Not recommended for sour service. Highly vulnerable to Sulfide Stress Cracking (SSC).",
          co2_compatibility: "Low resistance. Requires continuous corrosion inhibitor injection in sweet CO2 wells.",
          chloride_resistance: "Moderate in low-temperature fresh/salt waters. Susceptible to pitting.",
          temperature_envelope: "Typical operational range: -20\xB0C to 120\xB0C.",
          collapse_yield_considerations: "Relatively low collapse resistance; limited thickness options compared to L80.",
          galling_tendency: "Low galling risk during makeup. Resilient to standard assembly.",
          corrosion_mechanisms: "General sweet corrosion, galvanic corrosion, and oxygen-driven pitting.",
          field_limitations: "Forbidden in H2S conditions and high-stress HPHT zones.",
          common_failure_modes: "Tubular collapse, burst, general weight-loss corrosion.",
          applicable_standards: "API Spec 5CT, ISO 11960, \u0413\u041E\u0421\u0422 31446",
          oem_references: "Standard API specifications.",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "API Spec 5CT 10th Ed"
            ],
            verificationDate: "2026-06"
          },
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "steel_grade_k55",
          type: "Steel Grade",
          name: "K55 Carbon Steel",
          aliases: [
            "K55",
            "\u0441\u0442\u0430\u043B\u044C K55",
            "API K55"
          ],
          description: "API Spec 5CT grade K55 steel, similar to J55 but with higher tensile strength requirements.",
          standards: [
            "API Spec 5CT",
            "ISO 11960",
            "\u0413\u041E\u0421\u0422 31446"
          ],
          temperature: {
            min: -20,
            max: 120,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 8e3,
            unit: "psi"
          },
          mechanical_properties: "Yield: 55,000 - 80,000 psi (379 - 552 MPa), Tensile: Min 95,000 psi (655 MPa). Hardness: Max 22 HRC.",
          h2s_compatibility: "Poor. Susceptible to SSC. Not compliant with NACE MR0175.",
          co2_compatibility: "Low. Suffers severe sweet weight-loss corrosion in presence of wet carbon dioxide.",
          chloride_resistance: "Poor. Vulnerable to chloride-induced pitting.",
          temperature_envelope: "Typical range: -20\xB0C to 120\xB0C.",
          collapse_yield_considerations: "Standard collapse ratings for intermediate and surface casing.",
          galling_tendency: "Low galling tendency under standard API thread lubricants.",
          corrosion_mechanisms: "Sweet weight-loss corrosion, oxygen corrosion.",
          field_limitations: "Do not use in sour service or HPHT reservoir sections.",
          common_failure_modes: "Corrosion-driven wall thinning, mechanical collapse.",
          applicable_standards: "API Spec 5CT, ISO 11960",
          oem_references: "Standard API 5CT specifications.",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "API Spec 5CT 10th Ed"
            ],
            verificationDate: "2026-06"
          },
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "steel_grade_n80_1",
          type: "Steel Grade",
          name: "N80 Type 1 Steel",
          aliases: [
            "N80-1",
            "N80 Type 1",
            "\u0441\u0442\u0430\u043B\u044C N80-1"
          ],
          description: "API Spec 5CT Grade N80 Type 1 normalized carbon steel for medium-depth wells.",
          standards: [
            "API Spec 5CT",
            "ISO 11960"
          ],
          temperature: {
            min: -20,
            max: 150,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 9500,
            unit: "psi"
          },
          mechanical_properties: "Yield: 80,000 - 110,000 psi (552 - 758 MPa), Tensile: Min 100,000 psi (689 MPa). Hardness: Max 28 HRC.",
          h2s_compatibility: "Poor. High hardness normalized-only structure is highly susceptible to SSC.",
          co2_compatibility: "Low. Requires corrosion inhibitor and amine protection.",
          chloride_resistance: "Low. Prone to pitting in high chloride brines.",
          temperature_envelope: "Typical range: -20\xB0C to 150\xB0C.",
          collapse_yield_considerations: "Good intermediate strength casing option for vertical wells.",
          galling_tendency: "Low galling tendency with API compound.",
          corrosion_mechanisms: "Carbon dioxide corrosion, Sulfide Stress Cracking if trace H2S is present.",
          field_limitations: "Strictly sweet service. Not to be used where H2S partial pressure exceeds 0.05 psi.",
          common_failure_modes: "Sulfide stress cracking, sweet corrosion scaling.",
          applicable_standards: "API Spec 5CT, ISO 11960",
          oem_references: "Standard API specifications.",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "API Spec 5CT 10th Ed"
            ],
            verificationDate: "2026-06"
          },
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "steel_grade_n80q",
          type: "Steel Grade",
          name: "N80Q Carbon Steel",
          aliases: [
            "N80Q",
            "\u0441\u0442\u0430\u043B\u044C N80Q",
            "API N80Q"
          ],
          description: "API Spec 5CT Grade N80Q quenched and tempered carbon steel with improved grain structure.",
          standards: [
            "API Spec 5CT",
            "ISO 11960"
          ],
          temperature: {
            min: -20,
            max: 150,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 1e4,
            unit: "psi"
          },
          mechanical_properties: "Yield: 80,000 - 110,000 psi (552 - 758 MPa), Tensile: Min 100,000 psi (689 MPa). Hardness: Max 25 HRC.",
          h2s_compatibility: "Moderate. Quenched & Tempered structure offers better SSC resistance than Type 1 but still not fully sour-rated.",
          co2_compatibility: "Low. Requires corrosion inhibition.",
          chloride_resistance: "Low to moderate.",
          temperature_envelope: "Typical range: -20\xB0C to 150\xB0C.",
          collapse_yield_considerations: "Higher collapse performance than normalized Type 1 due to quenching structure.",
          galling_tendency: "Low galling risk.",
          corrosion_mechanisms: "General sweet corrosion, pitting in chlorides.",
          field_limitations: "Should not be used in critical sour service (H2S concentration > 50 ppm).",
          common_failure_modes: "Acid-driven weight loss, pitting under deposits.",
          applicable_standards: "API Spec 5CT",
          oem_references: "Standard API 5CT specs.",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "API Spec 5CT 10th Ed"
            ],
            verificationDate: "2026-06"
          },
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "steel_grade_l80_1",
          type: "Steel Grade",
          name: "L80 Type 1 Carbon Steel",
          aliases: [
            "L80-1",
            "L80 Type 1",
            "\u0441\u0442\u0430\u043B\u044C L80-1"
          ],
          description: "API Spec 5CT Grade L80 Type 1 quenched and tempered carbon steel with strictly controlled maximum hardness for H2S service.",
          standards: [
            "API Spec 5CT",
            "ISO 11960",
            "NACE MR0175"
          ],
          temperature: {
            min: -29,
            max: 180,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 11e3,
            unit: "psi"
          },
          mechanical_properties: "Yield: 80,000 - 95,000 psi (552 - 655 MPa), Tensile: Min 95,000 psi (655 MPa). Hardness: strictly Max 23 HRC.",
          h2s_compatibility: "NACE MR0175 compliant. Excellent SSC resistance in sour wells.",
          co2_compatibility: "Low resistance. Requires continuous chemical inhibitor injection to prevent weight loss.",
          chloride_resistance: "Moderate. Pitting risk in high temperature, oxygenated brines.",
          temperature_envelope: "Typical range: -29\xB0C to 180\xB0C.",
          collapse_yield_considerations: "Controlled yield strength limits the absolute mechanical loads but ensures ductility.",
          galling_tendency: "Low galling tendency with standard dopes.",
          corrosion_mechanisms: "CO2 weight-loss corrosion, galvanic corrosion in dual completions.",
          field_limitations: "Requires chemical inhibition program for wet CO2 or high-cut water environments.",
          common_failure_modes: "Inhibitor deficiency corrosion, mechanical wear from rod pumping.",
          applicable_standards: "API Spec 5CT, NACE MR0175 / ISO 15156",
          oem_references: "NACE standard materials manuals.",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "API Spec 5CT 10th Ed",
              "NACE MR0175"
            ],
            verificationDate: "2026-06"
          },
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "steel_grade_l80_13cr",
          type: "Steel Grade",
          name: "L80 13Cr Martensitic Steel",
          aliases: [
            "L80 13Cr",
            "L80-13Cr",
            "\u0441\u0442\u0430\u043B\u044C L80-13Cr",
            "13Cr L80"
          ],
          description: "API Spec 5CT Grade L80 13Cr martensitic stainless steel for wet CO2 applications.",
          standards: [
            "API Spec 5CT",
            "ISO 11960",
            "NACE MR0175"
          ],
          temperature: {
            min: -10,
            max: 150,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 12e3,
            unit: "psi"
          },
          mechanical_properties: "Yield: 80,000 - 95,000 psi (552 - 655 MPa), Tensile: Min 95,000 psi (655 MPa). Hardness: Max 23 HRC.",
          h2s_compatibility: "Limited sour service rating. Partial pressure of H2S must be < 0.1 psi (1.5 kPa).",
          co2_compatibility: "Excellent. Highly resistant to sweet weight-loss corrosion up to 150\xB0C.",
          chloride_resistance: "Moderate. Susceptible to pitting and SCC at high chloride concentrations and high temperatures.",
          temperature_envelope: "Operational limits: -10\xB0C to 150\xB0C.",
          collapse_yield_considerations: "Identical yield envelope to L80 Carbon Steel but provides stainless benefits.",
          galling_tendency: "High. Requires strict makeup protocols and premium compounds to prevent thread galling.",
          corrosion_mechanisms: "Chloride-induced pitting, Sulfide Stress Cracking if H2S limits are exceeded.",
          field_limitations: "Do not use in highly sour environments or high salinity/high temperature water zones.",
          common_failure_modes: "Thread galling during installation, chloride pitting corrosion.",
          applicable_standards: "API Spec 5CT, NACE MR0175 / ISO 15156-3",
          oem_references: "Vallourec/Tenaris material catalogs.",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "API Spec 5CT 10th Ed",
              "NACE MR0175"
            ],
            verificationDate: "2026-06"
          },
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "steel_grade_c90",
          type: "Steel Grade",
          name: "C90 Sour Service Steel",
          aliases: [
            "C90",
            "\u0441\u0442\u0430\u043B\u044C C90",
            "API C90"
          ],
          description: "API Spec 5CT high-strength sour service grade with strictly controlled martensitic structure and maximum hardness constraint.",
          standards: [
            "API Spec 5CT",
            "ISO 11960",
            "NACE MR0175"
          ],
          temperature: {
            min: -29,
            max: 180,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 12500,
            unit: "psi"
          },
          mechanical_properties: "Yield: 90,000 - 105,000 psi (621 - 724 MPa), Tensile: Min 100,000 psi (689 MPa). Hardness: strictly Max 25.4 HRC.",
          h2s_compatibility: "Fully rated for H2S service under NACE MR0175 limits (Region 3). High SSC resistance.",
          co2_compatibility: "Low. Requires chemical inhibition for wet CO2.",
          chloride_resistance: "Moderate. Standard carbon steel chloride pitting susceptibility.",
          temperature_envelope: "Operational limits: -29\xB0C to 180\xB0C.",
          collapse_yield_considerations: "Improved collapse and yield rating over L80, allowing deep sour completion designs.",
          galling_tendency: "Low galling risk.",
          corrosion_mechanisms: "CO2 weight-loss corrosion, sweet erosion-corrosion.",
          field_limitations: "Requires continuous corrosion inhibition for sweet wet gas.",
          common_failure_modes: "General corrosion, mechanical wear.",
          applicable_standards: "API Spec 5CT, NACE MR0175",
          oem_references: "Standard OCTG specifications.",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "API Spec 5CT 10th Ed",
              "NACE MR0175"
            ],
            verificationDate: "2026-06"
          },
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "steel_grade_t95",
          type: "Steel Grade",
          name: "T95 Sour Service Steel",
          aliases: [
            "T95",
            "\u0441\u0442\u0430\u043B\u044C T95",
            "API T95"
          ],
          description: "High-strength sour service steel grade with strict manufacturing quality control and maximum hardness restriction.",
          standards: [
            "API Spec 5CT",
            "ISO 11960",
            "NACE MR0175"
          ],
          temperature: {
            min: -29,
            max: 180,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 13e3,
            unit: "psi"
          },
          mechanical_properties: "Yield: 95,000 - 110,000 psi (655 - 758 MPa), Tensile: Min 105,000 psi (724 MPa). Hardness: strictly Max 26 HRC.",
          h2s_compatibility: "Excellent. Fully sour-service rated (NACE MR0175 Region 3). Outstanding SSC resistance.",
          co2_compatibility: "Low. Susceptible to sweet weight-loss corrosion; requires active chemical inhibition.",
          chloride_resistance: "Moderate.",
          temperature_envelope: "Operational range: -29\xB0C to 180\xB0C.",
          collapse_yield_considerations: "Very high yield limits allow deep, high-pressure sour well designs.",
          galling_tendency: "Low galling risk with standard API compounds.",
          corrosion_mechanisms: "Weight loss sweet corrosion, pitting in stagnant water phases.",
          field_limitations: "Unprotected carbon steel weight loss occurs in wet carbon dioxide conditions.",
          common_failure_modes: "Corrosion under deposit, mechanical fatigue.",
          applicable_standards: "API Spec 5CT, NACE MR0175",
          oem_references: "Vallourec/Tenaris Steel Grade catalogs.",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "API Spec 5CT 10th Ed",
              "NACE MR0175"
            ],
            verificationDate: "2026-06"
          },
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "steel_grade_vm125hc",
          type: "Steel Grade",
          name: "VM125HC High-Collapse Steel",
          aliases: [
            "VM125HC",
            "VM125",
            "VM 125 HC",
            "\u0441\u0442\u0430\u043B\u044C VM125HC"
          ],
          description: "OEM proprietary ultra-high strength, high-collapse casing for extreme depth sweet reservoirs.",
          standards: [
            "Proprietary OEM Spec",
            "API Spec 5CT Equivalent"
          ],
          temperature: {
            min: -20,
            max: 200,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 16500,
            unit: "psi"
          },
          mechanical_properties: "Yield: 125,000 - 150,000 psi (862 - 1034 MPa), Tensile: Min 135,000 psi (931 MPa). High collapse certified.",
          h2s_compatibility: "Strictly sweet service. Extremely susceptible to rapid SSC due to high yield stress structure.",
          co2_compatibility: "Low. Requires continuous chemical inhibition in wet CO2.",
          chloride_resistance: "Low. Prone to pitting in saline drilling muds.",
          temperature_envelope: "Stable up to 200\xB0C downhole.",
          collapse_yield_considerations: "Engineered for high collapse load under heavy salt flow and casing squeezing.",
          galling_tendency: "Low to moderate.",
          corrosion_mechanisms: "General sweet corrosion, hydrogen embrittlement if exposed to acid/H2S.",
          field_limitations: "Strictly prohibited in sour services. Requires careful mud weight design.",
          common_failure_modes: "Accidental H2S exposure SSC failure, installation wear.",
          applicable_standards: "OEM Proprietary Specifications, API 5CT Class",
          oem_references: "Vallourec OCTG Technical Guide.",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "Vallourec Connection Guide"
            ],
            verificationDate: "2026-06"
          },
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "steel_grade_incoloy_825",
          type: "Steel Grade",
          name: "Incoloy 825 (Nickel-Iron-Chromium CRA)",
          aliases: [
            "Incoloy 825",
            "alloy 825",
            "\u0438\u043D\u043A\u043E\u043B\u043E\u0439 825"
          ],
          description: "Nickel-iron-chromium alloy with additions of molybdenum and copper, offering excellent resistance to both reducing and oxidizing acids.",
          standards: [
            "ASTM B423",
            "NACE MR0175"
          ],
          temperature: {
            min: -50,
            max: 200,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 15e3,
            unit: "psi"
          },
          mechanical_properties: "Yield: 45,000 - 110,000 psi (310 - 758 MPa), Tensile: Min 85,000 psi (586 MPa). Hardness: Max 28 HRC.",
          h2s_compatibility: "Excellent. Widely used for sour gas completions under NACE MR0175.",
          co2_compatibility: "Exceptional. Highly resistant to sweet weight-loss corrosion up to 200\xB0C.",
          chloride_resistance: "High resistance to chloride stress corrosion cracking and pitting.",
          temperature_envelope: "Stable operational performance up to 200\xB0C.",
          collapse_yield_considerations: "Good yield envelopes in cold-worked high-strength OCTG forms.",
          galling_tendency: "High. Requires premium thread compounds and specialized torque control.",
          corrosion_mechanisms: "Pitting in highly concentrated stagnant acidizing fluids.",
          field_limitations: "Upper temperature limits in severe acid environments.",
          common_failure_modes: "Thread galling, pitting under severe acidizing without flush.",
          applicable_standards: "ASTM B423, NACE MR0175 / ISO 15156",
          oem_references: "Special Metals Incoloy Guide.",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "NACE MR0175",
              "ASTM B423"
            ],
            verificationDate: "2026-06"
          },
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "steel_grade_monel_400",
          type: "Steel Grade",
          name: "Monel 400 (Nickel-Copper Alloy)",
          aliases: [
            "Monel 400",
            "alloy 400",
            "\u043C\u043E\u043D\u0435\u043B\u044C 400"
          ],
          description: "Nickel-copper alloy with high strength and excellent corrosion resistance in hydrofluoric and sulfuric acids and sea water.",
          standards: [
            "ASTM B163",
            "NACE MR0175"
          ],
          temperature: {
            min: -100,
            max: 250,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 12e3,
            unit: "psi"
          },
          mechanical_properties: "Yield: 40,000 - 90,000 psi (276 - 621 MPa), Tensile: Min 80,000 psi (552 MPa). Hardness: Max 23 HRC.",
          h2s_compatibility: "Good. Suitable for sour service but nickel-copper has strict stress limits in presence of H2S.",
          co2_compatibility: "Excellent. Immune to sweet weight-loss corrosion.",
          chloride_resistance: "Outstanding. Excellent resistance to chloride stress corrosion cracking.",
          temperature_envelope: "Operational range: -100\xB0C to 250\xB0C.",
          collapse_yield_considerations: "Lower yield strength compared to Inconel, requiring thicker wall tubing design.",
          galling_tendency: "Moderate to high. Requires standard thread lubricants.",
          corrosion_mechanisms: "Slight oxidation in aerated environments, stress corrosion in hydrofluoric acid vapor.",
          field_limitations: "Not suitable for high-strength casing due to lower yield envelope.",
          common_failure_modes: "Mechanical wear, over-torque deformation.",
          applicable_standards: "ASTM B163, NACE MR0175",
          oem_references: "Special Metals Monel Specifications.",
          evidence_metadata: {
            confidenceLevel: "High",
            sources: [
              "NACE MR0175",
              "ASTM B163"
            ],
            verificationDate: "2026-06"
          },
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        }
      ],
      failures: [
        {
          id: "failure_ssc",
          type: "Failure Mode",
          name: "Sulfide Stress Cracking (SSC / \u0412\u043E\u0434\u043E\u0440\u043E\u0434\u043D\u043E\u0435 \u0440\u0430\u0441\u0442\u0440\u0435\u0441\u043A\u0438\u0432\u0430\u043D\u0438\u0435)",
          aliases: [
            "SSC",
            "Sulfide Cracking",
            "Hydrogen Embrittlement"
          ],
          description: "Catastrophic failure mechanism where high-strength steel becomes brittle and cracks under tensile stress in the presence of H2S and water.",
          standards: [
            "NACE MR0175",
            "ISO 15156",
            "ASTM G39"
          ],
          temperature: {
            min: -20,
            max: 80,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 2e4,
            unit: "psi"
          },
          chemicalComposition: [],
          chemicalCompatibility: [],
          usedInEquipment: [
            "Tubulars",
            "Wellheads",
            "Packers"
          ],
          advantages: [],
          limitations: [],
          applications: [],
          typical_applications: [
            "Prevention: Strict usage of L80 / T95 steel grades in sour service."
          ],
          typical_failures: [
            "Sudden parting of tubing string without warning",
            "Brittle fracture of wellhead bolts"
          ],
          sources: [
            "NACE MR0175",
            "API RP 5C1"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025",
          why_selected: [
            "Critical understanding of SSC is required for all sour completions design"
          ],
          why_avoided: [
            "Avoid P110 and Q125 steel grades in sour environments unless absolute dry conditions are guaranteed"
          ],
          confidenceLevel: "High",
          symptoms: "Sudden pressure drop in tubing, tubing string parting (separation), zero plastical deformation at the fracture site (brittle look).",
          root_causes: "Atomic hydrogen absorption into the steel crystal lattice. Hydrogen atoms migrate to stress concentration points, causing lattice lattice distortion and microcracking.",
          trigger_environments: "Presence of H2S (even in ppm levels), liquid water (wet gas or brine), low temperature (<82\xB0C / 180\xB0F), and tensile stress (axial load or internal pressure).",
          typical_metallurgy: "High-strength low-alloy steels (P110, Q125) and weld heat-affected zones with hardness exceeding 22 HRC.",
          prevention_methods: "Use controlled hardness steels (L80, T95, C90) with max hardness 22 HRC. Inject corrosion inhibitors to form protective film. Optimize string design to reduce tensile stress.",
          field_troubleshooting: "Perform ultrasonic testing of joints. Run caliper logs to detect tubing parting. Check gas analysis for H2S and water dew point."
        },
        {
          id: "failure_galling",
          type: "Failure Mode",
          name: "Thread Galling (\u0417\u0430\u0434\u0438\u0440\u044B \u0440\u0435\u0437\u044C\u0431\u044B)",
          aliases: [
            "Galling",
            "Thread Locking",
            "Cold Welding"
          ],
          description: "Severe wear mechanism occurring during connection makeup, where friction causes localized welding and tearing of thread surfaces.",
          standards: [
            "API RP 5A3",
            "ISO 13679"
          ],
          temperature: {
            min: -40,
            max: 100,
            unit: "C"
          },
          pressure: {
            min: 0,
            max: 15e3,
            unit: "psi"
          },
          chemicalComposition: [],
          chemicalCompatibility: [],
          usedInEquipment: [
            "Premium connections",
            "Tool joints",
            "Casing couplers"
          ],
          advantages: [],
          limitations: [],
          applications: [],
          typical_failures: [
            "Inability to achieve correct makeup torque",
            "Leaking seal due to deformed metal-to-metal barrier"
          ],
          sources: [
            "API RP 5C1",
            "Vallourec Running Manual"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2024",
          why_selected: [
            "Galling is the number one cause of premium connection rejection during running operations"
          ],
          why_avoided: [
            "Avoid rapid makeup speeds and running alloys (like 13Cr) dry without specialized lubricants"
          ],
          confidenceLevel: "High",
          symptoms: "Makeup torque spikes before reaching shoulder position, connection gets hot, thread profile is physically deformed or metal slivers are visible.",
          root_causes: "High contact pressure and sliding friction strip the oxide film from metal surfaces, allowing direct metal-to-metal contact and micro-welding.",
          trigger_environments: "High makeup rotation speed (>10 RPM), misalignment of joints during stabbing, dirt or debris in threads, and dry threads (no dope).",
          typical_metallurgy: "Corrosion Resistant Alloys (13Cr, Super 13Cr, Duplex, Inconel 718) are highly susceptible due to their protective chromium oxide film.",
          prevention_methods: "Use correct API 5A3 thread dope (or dopeless dry coatings). Ensure perfect vertical alignment using stabbing guides. Control makeup speed (<5 RPM). Use copper plating or thread blasting.",
          field_troubleshooting: "Immediately stop makeup if torque spikes. Break out the connection slowly. Inspect with thread gauges. Minor damage can be repaired using hand files."
        },
        {
          id: "failure_hic",
          type: "Failure Mode",
          name: "Hydrogen Induced Cracking (HIC)",
          aliases: [
            "hic",
            "hic cracking",
            "\u0432\u043E\u0434\u043E\u0440\u043E\u0434\u043D\u043E\u0435 \u0440\u0430\u0441\u0442\u0440\u0435\u0441\u043A\u0438\u0432\u0430\u043D\u0438\u0435"
          ],
          description: "Stepwise internal cracking in steel occurring without external stress, driven by hydrogen diffusion.",
          symptoms: "Blistering on tubular surfaces, internal laminations and parallel cracks visible in ultrasonic inspection.",
          root_cause: "H2S corrosion produces atomic hydrogen which diffuses into steel and recombines at inclusions (MnS).",
          trigger_conditions: "Presence of wet H2S, low pH, high manganese-sulfide inclusion density.",
          usedInEquipment: [
            "Casing strings",
            "Flowlines",
            "Pressure vessels"
          ],
          prevention: "Use HIC-resistant steel (controlled sulfur < 0.002%, calcium treatment for shape control).",
          typical_metallurgy: "Low-strength carbon steels (e.g. J55, K55, normalized steels) with high sulfur content.",
          typical_metallurgy_at_risk: [
            "J55",
            "K55",
            "N80 Type 1"
          ],
          field_troubleshooting: "Perform ultrasonic testing. Replace strings with HIC-resistant or CRA materials.",
          oem_api_references: "NACE TM0284, NACE MR0175",
          evidence_confidence: "High",
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "failure_sohic",
          type: "Failure Mode",
          name: "Stress Oriented HIC (SOHIC)",
          aliases: [
            "sohic",
            "sohic cracking",
            "\u043D\u0430\u043F\u0440\u044F\u0436\u0435\u043D\u043D\u043E\u0435 \u0432\u043E\u0434\u043E\u0440\u043E\u0434\u043D\u043E\u0435 \u0440\u0430\u0441\u0442\u0440\u0435\u0441\u043A\u0438\u0432\u0430\u043D\u0438\u0435"
          ],
          description: "Array of HIC cracks stacked perpendicularly to tensile stress, leading to rapid brittle fracture.",
          symptoms: "Sudden brittle failure of casing or tubing under tension, cracks starting from pitting or defects.",
          root_cause: "Interaction of high tensile stress and HIC, aligning hydrogen cracks into a critical fracture path.",
          trigger_conditions: "Wet H2S, high tensile load, susceptible normalized metallurgy.",
          usedInEquipment: [
            "Production casing",
            "High-tension tubing sections"
          ],
          prevention: "Use quenched and tempered low-hardness steels. Maintain design tension safety factors.",
          typical_metallurgy: "Normalized carbon steels under stress.",
          typical_metallurgy_at_risk: [
            "N80 Type 1",
            "J55"
          ],
          field_troubleshooting: "Check tensile calculations. Implement chemical wash inhibitors. Replace with sour-service Q&T grade.",
          oem_api_references: "NACE MR0175 / ISO 15156",
          evidence_confidence: "High",
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "failure_sulfide_corrosion",
          type: "Failure Mode",
          name: "Sulfide Weight Loss Corrosion",
          aliases: [
            "sulfide corrosion",
            "h2s corrosion",
            "\u043A\u043E\u0440\u0440\u043E\u0437\u0438\u044F h2s"
          ],
          description: "General weight loss and pitting corrosion driven by hydrogen sulfide reactions, forming iron sulfide scale.",
          symptoms: "Black powder or scale (FeS) deposits in production fluids, localized pitting under scale.",
          root_cause: "Direct chemical reaction of H2S and iron, forming cathodic iron sulfide scales that drive galvanic attack.",
          trigger_conditions: "Wet H2S gas or liquids, flow turbulence, temperatures above 60\xB0C.",
          usedInEquipment: [
            "Production tubing",
            "Wellhead valves"
          ],
          prevention: "Use 13Cr or nickel CRA alloys. Continuous injection of film-forming corrosion inhibitors.",
          typical_metallurgy: "Carbon steels (J55, K55, L80).",
          typical_metallurgy_at_risk: [
            "J55",
            "K55",
            "L80 Type 1"
          ],
          field_troubleshooting: "Flush well with scale dissolver. Increase inhibitor concentration.",
          oem_api_references: "API RP 571",
          evidence_confidence: "High",
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "failure_co2_corrosion",
          type: "Failure Mode",
          name: "CO\u2082 Corrosion (Sweet Corrosion)",
          aliases: [
            "co2 corrosion",
            "sweet corrosion",
            "\u0443\u0433\u043B\u0435\u043A\u0438\u0441\u043B\u043E\u0442\u043D\u0430\u044F \u043A\u043E\u0440\u0440\u043E\u0437\u0438\u044F"
          ],
          description: "Severe weight-loss and mesa-type corrosion in carbon steels due to carbonic acid formation.",
          symptoms: "Mesa-type flat-bottomed pits in steel, rapid wall thinning, iron carbonate scale.",
          root_cause: "Dissolution of CO2 in water forming carbonic acid, which directly attacks iron.",
          trigger_conditions: "High CO2 partial pressure, high water cut, temperatures between 60\xB0C and 120\xB0C.",
          usedInEquipment: [
            "Production tubing",
            "Casing flow paths"
          ],
          prevention: "Use 13Cr martensitic stainless steel. Inject continuous organic amine inhibitors.",
          typical_metallurgy: "All carbon steels.",
          typical_metallurgy_at_risk: [
            "J55",
            "K55",
            "L80 Type 1",
            "P110"
          ],
          field_troubleshooting: "Run caliper survey to detect thin walls. Switch string to 13Cr.",
          oem_api_references: "API RP 571",
          evidence_confidence: "High",
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "failure_chloride_scc",
          type: "Failure Mode",
          name: "Chloride Stress Corrosion Cracking (Chloride SCC)",
          aliases: [
            "chloride scc",
            "cl- scc",
            "\u0445\u043B\u043E\u0440\u043D\u043E\u0435 \u0440\u0430\u0441\u0442\u0440\u0435\u0441\u043A\u0438\u0432\u0430\u043D\u0438\u0435"
          ],
          description: "Brittle cracking of stainless steel and CRA alloys in hot chloride solutions under tensile stress.",
          symptoms: "Fine branched cracking visible on CRA surfaces under dye penetrant testing, rapid pressure leak.",
          root_cause: "Synergistic effect of chloride ions, oxygen, high temperature, and tensile stress.",
          trigger_conditions: "Chloride concentration > 1000 ppm, temperature > 60\xB0C, high tensile stress.",
          usedInEquipment: [
            "13Cr production tubing",
            "Duplex packers"
          ],
          prevention: "Use Super Duplex or Nickel-based alloys (Inconel 625/718). Limit oxygen ingress.",
          typical_metallurgy: "Standard 13Cr, 22Cr Duplex (under extreme conditions).",
          typical_metallurgy_at_risk: [
            "13Cr",
            "Super 13Cr",
            "22Cr Duplex"
          ],
          field_troubleshooting: "Analyze water salinity and oxygen levels. Upgrade metallurgy.",
          oem_api_references: "NACE MR0175",
          evidence_confidence: "High",
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "failure_pitting",
          type: "Failure Mode",
          name: "Pitting Corrosion",
          aliases: [
            "pitting",
            "pitting corrosion",
            "\u043F\u0438\u0442\u0442\u0438\u043D\u0433\u043E\u0432\u0430\u044F \u043A\u043E\u0440\u0440\u043E\u0437\u0438\u044F"
          ],
          description: "Highly localized corrosive attack producing deep cavities or holes in passivated alloys.",
          symptoms: "Small pinhole leaks in casing or tubing, localized deep holes with surrounding surface unaffected.",
          root_cause: "Local breakdown of the passive chromium oxide film in presence of chlorides and oxygen.",
          trigger_conditions: "Chloride fluids, presence of oxygen, stagnant fluid conditions.",
          usedInEquipment: [
            "CRA completions",
            "Liner hangers"
          ],
          prevention: "Use materials with high PREN (PREN > 40, e.g. Inconel 625). Avoid stagnant fluid phases.",
          typical_metallurgy: "13Cr, Super 13Cr, 22Cr Duplex.",
          typical_metallurgy_at_risk: [
            "13Cr",
            "Super 13Cr"
          ],
          field_troubleshooting: "Perform hydrochloric acid wash flush. Maintain flow velocity.",
          oem_api_references: "ASTM G48",
          evidence_confidence: "High",
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "failure_galvanic",
          type: "Failure Mode",
          name: "Galvanic Corrosion",
          aliases: [
            "galvanic",
            "galvanic corrosion",
            "\u0433\u0430\u043B\u044C\u0432\u0430\u043D\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u043A\u043E\u0440\u0440\u043E\u0437\u0438\u044F"
          ],
          description: "Accelerated corrosion of a less noble metal when in electrical contact with a more noble metal in an electrolyte.",
          symptoms: "Severe localized wall loss on carbon steel components immediately adjacent to stainless steel joints.",
          root_cause: "Potential difference between dissimilar metals creating a galvanic cell.",
          trigger_conditions: "Dissimilar metals connected in conductive completion brine.",
          usedInEquipment: [
            "Crossovers",
            "Packer-to-tubing connections"
          ],
          prevention: "Use dielectric isolation subs or ensure adjacent materials match in electrochemical potential.",
          typical_metallurgy: "Carbon steel connected to CRA.",
          typical_metallurgy_at_risk: [
            "J55",
            "K55",
            "L80",
            "P110"
          ],
          field_troubleshooting: "Install insulating pup joints. Ensure inhibitor program is active.",
          oem_api_references: "API RP 571",
          evidence_confidence: "High",
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "failure_washout",
          type: "Failure Mode",
          name: "Fluid Washout",
          aliases: [
            "washout",
            "fluid washout",
            "\u043F\u0440\u043E\u043C\u044B\u0432 \u0440\u0435\u0437\u044C\u0431\u044B"
          ],
          description: "Erosion-corrosion channel cut through connection seal or thread due to high-velocity fluid escape.",
          symptoms: "Casing or tubing pressure leak, connection pin or box displaying smooth deep groove cuts.",
          root_cause: "Micro-gap in thread seal allows high-pressure fluid to leak, causing mechanical erosion.",
          trigger_conditions: "Insufficient makeup torque, damaged seal surfaces, abrasive particles in fluid.",
          usedInEquipment: [
            "Tubing connections",
            "Drill pipe tool joints"
          ],
          prevention: "Follow strict torque-turn running procedures. Visually inspect seals before running.",
          typical_metallurgy: "All connection steels.",
          typical_metallurgy_at_risk: [
            "J55",
            "L80",
            "P110"
          ],
          field_troubleshooting: "Lay down damaged pipe. Recut threads at shop.",
          oem_api_references: "API RP 5C1",
          evidence_confidence: "High",
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "failure_collapse",
          type: "Failure Mode",
          name: "Tubular Collapse",
          aliases: [
            "collapse",
            "casing collapse",
            "\u0441\u043C\u044F\u0442\u0438\u0435 \u0442\u0440\u0443\u0431\u044B"
          ],
          description: "Structural failure of pipe wall buckling inward due to excessive external pressure.",
          symptoms: "Restriction of wellbore ID, inability to run downhole tools, drop in production.",
          root_cause: "External pressure load exceeds the collapse capacity of the tubular.",
          trigger_conditions: "High mud weight, reservoir subsidence, tectonic salt flow, casing evacuation.",
          usedInEquipment: [
            "Casing strings",
            "Production liners"
          ],
          prevention: "Use high-collapse rated casing (e.g. VM125HC). Ensure casing is fully cemented.",
          typical_metallurgy: "Carbon steels under high load.",
          typical_metallurgy_at_risk: [
            "J55",
            "K55",
            "L80"
          ],
          field_troubleshooting: "Run lead impression block or casing caliper. Swage casing or sidetrack.",
          oem_api_references: "API Bulletin 5C3",
          evidence_confidence: "High",
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "failure_burst",
          type: "Failure Mode",
          name: "Tubular Burst",
          aliases: [
            "burst",
            "casing burst",
            "\u0440\u0430\u0437\u0440\u044B\u0432 \u0442\u0440\u0443\u0431\u044B"
          ],
          description: "Tensile failure of pipe wall tearing outward due to excessive internal pressure.",
          symptoms: "Sudden loss of wellhead pressure, gas or oil returning in casing annulus.",
          root_cause: "Internal pressure exceeds the design burst rating of the steel tubular.",
          trigger_conditions: "High-pressure gas kicks, casing pressure buildup (sap), thermal expansion of trapped annular fluid.",
          usedInEquipment: [
            "Production casing",
            "Tubing strings"
          ],
          prevention: "Use high-burst grade steels (P110, Q125). Implement annular pressure management.",
          typical_metallurgy: "Carbon steels.",
          typical_metallurgy_at_risk: [
            "J55",
            "K55",
            "L80"
          ],
          field_troubleshooting: "Isolate leak zone using packers or scab liners. Cement squeeze.",
          oem_api_references: "API Bulletin 5C3",
          evidence_confidence: "High",
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "failure_fatigue",
          type: "Failure Mode",
          name: "Fatigue Cracking",
          aliases: [
            "fatigue",
            "fatigue cracking",
            "\u0443\u0441\u0442\u0430\u043B\u043E\u0441\u0442\u043D\u043E\u0435 \u0440\u0430\u0437\u0440\u0443\u0448\u0435\u043D\u0438\u0435"
          ],
          description: "Progressive, localized structural damage occurring when a material is subjected to cyclic loading.",
          symptoms: "Transverse cracks in drill pipe body or tool joints, sudden parting of the drill string.",
          root_cause: "Cyclic bending stresses exceeding fatigue limits, starting from surface defects or pits.",
          trigger_conditions: "Drilling in high dogleg severity intervals, drill string vibration.",
          usedInEquipment: [
            "Drill pipe strings",
            "Sucker rods"
          ],
          prevention: "Minimize dogleg severity. Run drill string inspections regularly. Avoid resonance vibration speeds.",
          typical_metallurgy: "High-strength drill pipe steels.",
          typical_metallurgy_at_risk: [
            "G105",
            "S135"
          ],
          field_troubleshooting: "Check dogleg survey. Perform electromagnetic inspection of the string.",
          oem_api_references: "API RP 7G-2",
          evidence_confidence: "High",
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "failure_seal_leak",
          type: "Failure Mode",
          name: "Elastomer Seal Failure",
          aliases: [
            "seal failure",
            "elastomer leak",
            "\u043E\u0442\u043A\u0430\u0437 \u0443\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u044F"
          ],
          description: "Loss of sealing integrity in packer or BOP rubber element, allowing fluid communication.",
          symptoms: "Annular pressure communication, fluid leak at surface BOP stacks.",
          root_cause: "Thermal degradation, chemical attack, or explosive decompression (RGD) cracking.",
          trigger_conditions: "High temperature, sour gas exposure, rapid pressure drops.",
          usedInEquipment: [
            "Packers",
            "BOP elements",
            "O-rings"
          ],
          prevention: "Select chemically inert elastomers (FFKM/Kalrez). Specify RGD-resistant materials.",
          typical_metallurgy: "Elastomers (NBR, Viton).",
          typical_metallurgy_at_risk: [
            "NBR",
            "Viton"
          ],
          field_troubleshooting: "Run packer leak test. Retrieve completion string and replace seal elements.",
          oem_api_references: "ISO 23936-2",
          evidence_confidence: "High",
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "failure_thread_jumpout",
          type: "Failure Mode",
          name: "Thread Jump-Out (Connection Parting)",
          aliases: [
            "thread jumpout",
            "thread jump-out",
            "\u0432\u044B\u0445\u043E\u0434 \u0440\u0435\u0437\u044C\u0431\u044B"
          ],
          description: "Complete separation of a threaded joint under high tensile or bending load without structural steel fracture.",
          symptoms: "Annular leak, drop in hook load weight, casing string parting.",
          root_cause: "Tensile stress causes the box to expand or the pin to compress, letting threads slip past each other.",
          trigger_conditions: "High tensile load, insufficient thread interference, API round thread connection type.",
          usedInEquipment: [
            "Casing strings",
            "Tubing strings"
          ],
          prevention: "Use premium connections with negative load flank angles (e.g. VAM TOP, Tenaris Blue).",
          typical_metallurgy: "All casing/tubing grades.",
          typical_metallurgy_at_risk: [
            "J55",
            "K55",
            "L80"
          ],
          field_troubleshooting: "Run casing caliper. Run casing patch or back off and fish.",
          oem_api_references: "API Bullet 5C3",
          evidence_confidence: "High",
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "failure_overtorque",
          type: "Failure Mode",
          name: "Over-Torque Damage",
          aliases: [
            "overtorque",
            "over-torque",
            "\u043F\u0435\u0440\u0435\u043A\u0440\u0443\u0442 \u0440\u0435\u0437\u044C\u0431\u044B"
          ],
          description: "Plastic deformation and yielding of connection pin/box due to excessive make-up torque.",
          symptoms: "Difficulty in unscrewing connection, flared box ends, swollen pin shoulders.",
          root_cause: "Applied torque exceeds the torsional yield strength of the connection.",
          trigger_conditions: "Incorrect rig torque calibration, lack of torque-turn monitoring.",
          usedInEquipment: [
            "Drill pipes",
            "Premium connections"
          ],
          prevention: "Use strict torque-turn tables. Calibrate rig tongs. Use shoulder-stop connections.",
          typical_metallurgy: "Carbon and alloy steel connections.",
          typical_metallurgy_at_risk: [
            "J55",
            "L80",
            "P110"
          ],
          field_troubleshooting: "Lay down damaged pipe. Recut threads at qualified machine shop.",
          oem_api_references: "API RP 5C1",
          evidence_confidence: "High",
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "failure_backoff",
          type: "Failure Mode",
          name: "Thread Connection Back-Off",
          aliases: [
            "backoff",
            "back-off",
            "\u043E\u0442\u0432\u0438\u043D\u0447\u0438\u0432\u0430\u043D\u0438\u0435"
          ],
          description: "Unintended unscrewing of a threaded connection during downhole rotation or vibration.",
          symptoms: "Parted drill string or casing, loss of torque signature on rig floor.",
          root_cause: "Dynamic vibration and reverse rotation torque overcome thread friction.",
          trigger_conditions: "Drilling with high torque/vibration, reverse rotation, lack of thread locking compound.",
          usedInEquipment: [
            "Drill strings",
            "Casing strings run in horizontal wells"
          ],
          prevention: "Apply thread-locking compound (e.g. Bakerlok) on casing connections. Use double-shoulder joints.",
          typical_metallurgy: "Steel tubulars.",
          typical_metallurgy_at_risk: [
            "J55",
            "L80",
            "P110",
            "S135"
          ],
          field_troubleshooting: "Fish out the backed-off string.",
          oem_api_references: "API RP 7G",
          evidence_confidence: "High",
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        },
        {
          id: "failure_erosion",
          type: "Failure Mode",
          name: "Erosion (Sand Erosion)",
          aliases: [
            "erosion",
            "sand erosion",
            "\u044D\u0440\u043E\u0437\u0438\u044F"
          ],
          description: "Mechanical wear of steel surface caused by the high-velocity impact of solid sand particles in fluid.",
          symptoms: "Wall thinning in elbows, chokes, blast joints, and tubing connections near perforation.",
          root_cause: "High velocity gas/oil containing sand grains grinding down steel walls.",
          trigger_conditions: "Unconsolidated sand reservoirs, high production flow rate, bends in piping.",
          usedInEquipment: [
            "Blast joints",
            "Flow couplings",
            "Choke manifolds"
          ],
          prevention: "Install sand control screens downhole. Limit fluid velocity. Use heavy-wall blast joints.",
          typical_metallurgy: "Carbon steels.",
          typical_metallurgy_at_risk: [
            "J55",
            "L80",
            "P110"
          ],
          field_troubleshooting: "Reduce choke size. Replace blast joints with erosion-resistant materials.",
          oem_api_references: "API RP 14E",
          evidence_confidence: "High",
          confidenceLevel: "High",
          sources: [
            "API Spec OCTG handbook"
          ],
          lastUpdated: "2026-06",
          revisionDate: "2025"
        }
      ],
      wellbore_fluids: [
        {
          id: "fluid_wbm_bentonite",
          type: "WellboreFluid",
          category: "drilling_mud",
          name: "Bentonite WBM (Water-Based Mud / \u0413\u043B\u0438\u043D\u0438\u0441\u0442\u044B\u0439 \u0431\u0443\u0440\u043E\u0432\u043E\u0439 \u0440\u0430\u0441\u0442\u0432\u043E\u0440)",
          aliases: [
            "wbm",
            "\u0443\u0431\u0440",
            "\u0432\u043E\u0434\u043D\u044B\u0439 \u0440\u0430\u0441\u0442\u0432\u043E\u0440",
            "\u0433\u043B\u0438\u043D\u0438\u0441\u0442\u044B\u0439 \u0440\u0430\u0441\u0442\u0432\u043E\u0440",
            "\u0431\u0435\u043D\u0442\u043E\u043D\u0438\u0442"
          ],
          description: "Standard water-based drilling fluid using bentonite clay for viscosity and fluid loss control.",
          standards: [
            "API RP 13B-1",
            "ISO 10414-1"
          ],
          density: {
            min_sg: 1.02,
            max_sg: 1.4,
            unit: "SG"
          },
          temperature_limit: {
            max_c: 120,
            unit: "C"
          },
          rheology: {
            pv_cp: "8 - 20",
            yp_lb100ft2: "12 - 28"
          },
          fann_readings: {
            theta_600: 38,
            theta_300: 26,
            theta_200: 20,
            theta_100: 14,
            theta_6: 6,
            theta_3: 4
          },
          compatibility: {
            steels: "Prone to sweet (CO2) and sour (H2S) corrosion. Requires corrosion inhibitors (amines) or oxygen scavengers.",
            elastomers: "Fully compatible with all standard elastomers (NBR, HNBR, FKM, EPDM, Kalrez)."
          },
          applications: [
            "Upper hole sections",
            "Low temperature production intervals",
            "Standard drilling conditions"
          ],
          advantages: [
            "Highly economical",
            "Environmentally friendly",
            "Easy filtration control and viscosity adjustment"
          ],
          limitations: [
            "Low thermal stability (degrades above 120\xB0C)",
            "Reacts with active swelling clays (shales)",
            "Poor lubrication compared to OBM"
          ],
          sources: [
            "API RP 13B-1",
            "Drilling Fluids Reference Guide"
          ],
          description_ru: "\u0421\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u044B\u0439 \u0431\u0443\u0440\u043E\u0432\u043E\u0439 \u0440\u0430\u0441\u0442\u0432\u043E\u0440 \u043D\u0430 \u0432\u043E\u0434\u043D\u043E\u0439 \u043E\u0441\u043D\u043E\u0432\u0435 \u0441 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u0435\u043C \u0431\u0435\u043D\u0442\u043E\u043D\u0438\u0442\u043E\u0432\u043E\u0439 \u0433\u043B\u0438\u043D\u044B \u0434\u043B\u044F \u0440\u0435\u0433\u0443\u043B\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F \u0432\u044F\u0437\u043A\u043E\u0441\u0442\u0438 \u0438 \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u0438.",
          compatibility_ru: {
            steels: "\u041F\u043E\u0434\u0432\u0435\u0440\u0436\u0435\u043D \u0443\u0433\u043B\u0435\u043A\u0438\u0441\u043B\u043E\u0439 (CO2) \u0438 \u0441\u0435\u0440\u043E\u0432\u043E\u0434\u043E\u0440\u043E\u0434\u043D\u043E\u0439 (H2S) \u043A\u043E\u0440\u0440\u043E\u0437\u0438\u0438. \u0422\u0440\u0435\u0431\u0443\u0435\u0442 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0438\u043D\u0433\u0438\u0431\u0438\u0442\u043E\u0440\u043E\u0432 \u043A\u043E\u0440\u0440\u043E\u0437\u0438\u0438 (\u0430\u043C\u0438\u043D\u043E\u0432) \u0438\u043B\u0438 \u043F\u043E\u0433\u043B\u043E\u0442\u0438\u0442\u0435\u043B\u0435\u0439 \u043A\u0438\u0441\u043B\u043E\u0440\u043E\u0434\u0430.",
            elastomers: "\u041F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E \u0441\u043E\u0432\u043C\u0435\u0441\u0442\u0438\u043C \u0441\u043E \u0432\u0441\u0435\u043C\u0438 \u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u044B\u043C\u0438 \u044D\u043B\u0430\u0441\u0442\u043E\u043C\u0435\u0440\u0430\u043C\u0438 (NBR, HNBR, FKM, EPDM, Kalrez)."
          },
          applications_ru: [
            "\u0412\u0435\u0440\u0445\u043D\u0438\u0435 \u0438\u043D\u0442\u0435\u0440\u0432\u0430\u043B\u044B \u0431\u0443\u0440\u0435\u043D\u0438\u044F",
            "\u041D\u0438\u0437\u043A\u043E\u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u043D\u044B\u0435 \u0438\u043D\u0442\u0435\u0440\u0432\u0430\u043B\u044B \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0438\u0432\u043D\u043E\u0433\u043E \u043F\u043B\u0430\u0441\u0442\u0430",
            "\u0421\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u044B\u0435 \u0443\u0441\u043B\u043E\u0432\u0438\u044F \u0431\u0443\u0440\u0435\u043D\u0438\u044F"
          ],
          advantages_ru: [
            "\u0412\u044B\u0441\u043E\u043A\u0430\u044F \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u0447\u043D\u043E\u0441\u0442\u044C",
            "\u042D\u043A\u043E\u043B\u043E\u0433\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u044C",
            "\u041F\u0440\u043E\u0441\u0442\u043E\u0435 \u0440\u0435\u0433\u0443\u043B\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u0438 \u0438 \u0432\u044F\u0437\u043A\u043E\u0441\u0442\u0438"
          ],
          limitations_ru: [
            "\u041D\u0438\u0437\u043A\u0430\u044F \u0442\u0435\u0440\u043C\u043E\u0441\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u043E\u0441\u0442\u044C (\u0434\u0435\u0433\u0440\u0430\u0434\u0430\u0446\u0438\u044F \u0432\u044B\u0448\u0435 120\xB0C)",
            "\u0420\u0435\u0430\u0433\u0438\u0440\u0443\u0435\u0442 \u0441 \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u043C\u0438 \u043D\u0430\u0431\u0443\u0445\u0430\u044E\u0449\u0438\u043C\u0438 \u0433\u043B\u0438\u043D\u0430\u043C\u0438 (\u0441\u043B\u0430\u043D\u0446\u0430\u043C\u0438)",
            "\u041D\u0438\u0437\u043A\u0430\u044F \u0441\u043C\u0430\u0437\u044B\u0432\u0430\u044E\u0449\u0430\u044F \u0441\u043F\u043E\u0441\u043E\u0431\u043D\u043E\u0441\u0442\u044C \u043F\u043E \u0441\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u044E \u0441 \u0420\u0423\u041E"
          ]
        },
        {
          id: "fluid_obm_diesel",
          type: "WellboreFluid",
          category: "drilling_mud",
          name: "OBM (Diesel-Based / \u0420\u0423\u041E \u043D\u0430 \u0434\u0438\u0437\u0435\u043B\u044C\u043D\u043E\u0439 \u043E\u0441\u043D\u043E\u0432\u0435)",
          aliases: [
            "obm",
            "\u0440\u0443\u043E",
            "diesel mud",
            "\u0440\u0430\u0441\u0442\u0432\u043E\u0440 \u043D\u0430 \u043D\u0435\u0444\u0442\u044F\u043D\u043E\u0439 \u043E\u0441\u043D\u043E\u0432\u0435"
          ],
          description: "Invert emulsion drilling fluid using diesel oil as the continuous phase and calcium chloride brine as the dispersed phase.",
          standards: [
            "API RP 13B-2",
            "ISO 10414-2"
          ],
          density: {
            min_sg: 1.1,
            max_sg: 2.3,
            unit: "SG"
          },
          temperature_limit: {
            max_c: 180,
            unit: "C"
          },
          rheology: {
            pv_cp: "15 - 35",
            yp_lb100ft2: "10 - 25"
          },
          fann_readings: {
            theta_600: 55,
            theta_300: 35,
            theta_200: 27,
            theta_100: 18,
            theta_6: 6,
            theta_3: 4
          },
          compatibility: {
            steels: "Non-corrosive. Passivates steel surfaces and minimizes corrosion risk.",
            elastomers: "Severe swelling and degradation of standard NBR and EPDM. Requires Viton (FKM), HNBR, or FFKM seals."
          },
          applications: [
            "High temperature / High pressure (HTHP) sections",
            "Swelling shale intervals",
            "Extended reach (ERD) wells"
          ],
          advantages: [
            "Excellent shale inhibition",
            "High lubricity, reducing torque and drag",
            "Thermally stable up to 180\xB0C"
          ],
          limitations: [
            "High environmental impact and strict discharge limits",
            "High initial preparation costs",
            "Difficult mud cleanup prior to cementing"
          ],
          sources: [
            "API RP 13B-2",
            "Drilling Fluids Reference Guide"
          ],
          description_ru: "\u0420\u0430\u0441\u0442\u0432\u043E\u0440 \u043D\u0430 \u0443\u0433\u043B\u0435\u0432\u043E\u0434\u043E\u0440\u043E\u0434\u043D\u043E\u0439 \u043E\u0441\u043D\u043E\u0432\u0435 (\u043E\u0431\u0440\u0430\u0442\u043D\u0430\u044F \u044D\u043C\u0443\u043B\u044C\u0441\u0438\u044F), \u0433\u0434\u0435 \u0434\u0438\u0437\u0435\u043B\u044C\u043D\u043E\u0435 \u0442\u043E\u043F\u043B\u0438\u0432\u043E \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u0434\u0438\u0441\u043F\u0435\u0440\u0441\u0438\u043E\u043D\u043D\u043E\u0439 \u0441\u0440\u0435\u0434\u043E\u0439, \u0430 \u0440\u0430\u0441\u0442\u0432\u043E\u0440 \u0445\u043B\u043E\u0440\u0438\u0434\u0430 \u043A\u0430\u043B\u044C\u0446\u0438\u044F \u2014 \u0434\u0438\u0441\u043F\u0435\u0440\u0441\u043D\u043E\u0439 \u0444\u0430\u0437\u043E\u0439.",
          compatibility_ru: {
            steels: "\u041D\u0435 \u0432\u044B\u0437\u044B\u0432\u0430\u0435\u0442 \u043A\u043E\u0440\u0440\u043E\u0437\u0438\u0438. \u041F\u0430\u0441\u0441\u0438\u0432\u0438\u0440\u0443\u0435\u0442 \u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0435 \u043F\u043E\u0432\u0435\u0440\u0445\u043D\u043E\u0441\u0442\u0438 \u0438 \u043C\u0438\u043D\u0438\u043C\u0438\u0437\u0438\u0440\u0443\u0435\u0442 \u0440\u0438\u0441\u043A\u0438 \u043A\u043E\u0440\u0440\u043E\u0437\u0438\u043E\u043D\u043D\u043E\u0433\u043E \u0440\u0430\u0437\u0440\u0443\u0448\u0435\u043D\u0438\u044F.",
            elastomers: "\u0412\u044B\u0437\u044B\u0432\u0430\u0435\u0442 \u0441\u0438\u043B\u044C\u043D\u043E\u0435 \u043D\u0430\u0431\u0443\u0445\u0430\u043D\u0438\u0435 \u0438 \u0434\u0435\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044E \u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u044B\u0445 NBR \u0438 EPDM. \u0422\u0440\u0435\u0431\u0443\u044E\u0442\u0441\u044F \u0443\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u044F \u0438\u0437 Viton (FKM), HNBR \u0438\u043B\u0438 FFKM."
          },
          applications_ru: [
            "\u0412\u044B\u0441\u043E\u043A\u043E\u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u043D\u044B\u0435 \u0438 \u0432\u044B\u0441\u043E\u043A\u043E\u0433\u043E\u0440\u043D\u044B\u0435 \u0438\u043D\u0442\u0435\u0440\u0432\u0430\u043B\u044B (HPHT)",
            "\u041D\u0435\u0443\u0441\u0442\u043E\u0439\u0447\u0438\u0432\u044B\u0435 \u0433\u043B\u0438\u043D\u0438\u0441\u0442\u044B\u0435 \u0438 \u0441\u043B\u0430\u043D\u0446\u0435\u0432\u044B\u0435 \u043E\u0442\u043B\u043E\u0436\u0435\u043D\u0438\u044F",
            "\u0421\u043A\u0432\u0430\u0436\u0438\u043D\u044B \u0441 \u0431\u043E\u043B\u044C\u0448\u0438\u043C \u043E\u0442\u0445\u043E\u0434\u043E\u043C \u043E\u0442 \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u0438 (ERD)"
          ],
          advantages_ru: [
            "\u041E\u0442\u043B\u0438\u0447\u043D\u043E\u0435 \u0438\u043D\u0433\u0438\u0431\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043D\u0430\u0431\u0443\u0445\u0430\u043D\u0438\u044F \u0433\u043B\u0438\u043D",
            "\u0412\u044B\u0441\u043E\u043A\u0430\u044F \u0441\u043C\u0430\u0437\u044B\u0432\u0430\u044E\u0449\u0430\u044F \u0441\u043F\u043E\u0441\u043E\u0431\u043D\u043E\u0441\u0442\u044C, \u0441\u043D\u0438\u0436\u0430\u044E\u0449\u0430\u044F \u043A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442 \u0438 \u0437\u0430\u0442\u0430\u0441\u043A\u0438\u0432\u0430\u043D\u0438\u0435",
            "\u0422\u0435\u0440\u043C\u043E\u0441\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u0434\u043E 180\xB0C"
          ],
          limitations_ru: [
            "\u0412\u044B\u0441\u043E\u043A\u0430\u044F \u044D\u043A\u043E\u043B\u043E\u0433\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u043D\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0438 \u0436\u0435\u0441\u0442\u043A\u0438\u0435 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u044F \u043F\u043E \u0443\u0442\u0438\u043B\u0438\u0437\u0430\u0446\u0438\u0438",
            "\u0412\u044B\u0441\u043E\u043A\u0430\u044F \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u043F\u0435\u0440\u0432\u043E\u043D\u0430\u0447\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u043F\u0440\u0438\u0433\u043E\u0442\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0440\u0430\u0441\u0442\u0432\u043E\u0440\u0430",
            "\u0421\u043B\u043E\u0436\u043D\u0430\u044F \u043E\u0447\u0438\u0441\u0442\u043A\u0430 \u0441\u0442\u0432\u043E\u043B\u0430 \u0441\u043A\u0432\u0430\u0436\u0438\u043D\u044B \u043F\u0435\u0440\u0435\u0434 \u0446\u0435\u043C\u0435\u043D\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435\u043C"
          ]
        },
        {
          id: "fluid_cement_class_g",
          type: "WellboreFluid",
          category: "cement_slurry",
          name: "Class G Neat Cement Slurry (\u0426\u0435\u043C\u0435\u043D\u0442\u043D\u044B\u0439 \u0440\u0430\u0441\u0442\u0432\u043E\u0440 \u043A\u043B\u0430\u0441\u0441\u0430 G)",
          aliases: [
            "cement",
            "class g",
            "\u0446\u0435\u043C\u0435\u043D\u0442",
            "\u0442\u0430\u043C\u043F\u043E\u043D\u0430\u0436\u043D\u044B\u0439 \u0446\u0435\u043C\u0435\u043D\u0442"
          ],
          description: "Standard oil-well cement slurry mixed with fresh water, designed for primary casing cementing.",
          standards: [
            "API Spec 10A",
            "ISO 10426-1"
          ],
          density: {
            min_sg: 1.85,
            max_sg: 1.95,
            unit: "SG"
          },
          temperature_limit: {
            max_c: 150,
            unit: "C"
          },
          rheology: {
            pv_cp: "40 - 70",
            yp_lb100ft2: "15 - 30"
          },
          compatibility: {
            steels: "Highly alkaline, protects steel from corrosion. High shrinkage can cause micro-annulus.",
            elastomers: "Compatible with standard elastomers once set. High pH during placement requires alkali-resistant seals."
          },
          applications: [
            "Primary casing cementing",
            "Production casing isolation",
            "Abandonment plugs"
          ],
          advantages: [
            "High compressive strength",
            "Predictable thickening time and hydration behavior",
            "Standardized globally under API Spec 10A"
          ],
          limitations: [
            "High density may cause formation breakdown",
            "Subject to gas migration during setting transition",
            "Susceptible to CO2 acid degradation over time"
          ],
          sources: [
            "API Spec 10A",
            "Well Cementing Handbook"
          ],
          description_ru: "\u0421\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u044B\u0439 \u0431\u0435\u0437\u0434\u043E\u0431\u0430\u0432\u043E\u0447\u043D\u044B\u0439 \u0442\u0430\u043C\u043F\u043E\u043D\u0430\u0436\u043D\u044B\u0439 \u0440\u0430\u0441\u0442\u0432\u043E\u0440 \u043A\u043B\u0430\u0441\u0441\u0430 G \u043D\u0430 \u043F\u0440\u0435\u0441\u043D\u043E\u0439 \u0432\u043E\u0434\u0435, \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u043D\u044B\u0439 \u0434\u043B\u044F \u043F\u0435\u0440\u0432\u0438\u0447\u043D\u043E\u0433\u043E \u0446\u0435\u043C\u0435\u043D\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F \u043E\u0431\u0441\u0430\u0434\u043D\u044B\u0445 \u043A\u043E\u043B\u043E\u043D\u043D.",
          compatibility_ru: {
            steels: "\u0412\u044B\u0441\u043E\u043A\u043E\u0449\u0435\u043B\u043E\u0447\u043D\u0430\u044F \u0441\u0440\u0435\u0434\u0430 \u0437\u0430\u0449\u0438\u0449\u0430\u0435\u0442 \u0441\u0442\u0430\u043B\u044C \u043E\u0442 \u043A\u043E\u0440\u0440\u043E\u0437\u0438\u0438. \u0412\u044B\u0441\u043E\u043A\u0430\u044F \u0443\u0441\u0430\u0434\u043A\u0430 \u043C\u043E\u0436\u0435\u0442 \u043F\u0440\u0438\u0432\u0435\u0441\u0442\u0438 \u043A \u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u044E \u043C\u0438\u043A\u0440\u043E\u0437\u0430\u0437\u043E\u0440\u0430.",
            elastomers: "\u0421\u043E\u0432\u043C\u0435\u0441\u0442\u0438\u043C \u0441\u043E \u0432\u0441\u0435\u043C\u0438 \u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u044B\u043C\u0438 \u044D\u043B\u0430\u0441\u0442\u043E\u043C\u0435\u0440\u0430\u043C\u0438 \u043F\u043E\u0441\u043B\u0435 \u043E\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F. \u0412\u044B\u0441\u043E\u043A\u0438\u0439 pH \u043F\u0440\u0438 \u0437\u0430\u043A\u0430\u0447\u043A\u0435 \u0442\u0440\u0435\u0431\u0443\u0435\u0442 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F \u0449\u0435\u043B\u043E\u0447\u0435\u0441\u0442\u043E\u0439\u043A\u0438\u0445 \u0443\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u0439."
          },
          applications_ru: [
            "\u041F\u0435\u0440\u0432\u0438\u0447\u043D\u043E\u0435 \u0446\u0435\u043C\u0435\u043D\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043E\u0431\u0441\u0430\u0434\u043D\u044B\u0445 \u043A\u043E\u043B\u043E\u043D\u043D",
            "\u0418\u0437\u043E\u043B\u044F\u0446\u0438\u044F \u044D\u043A\u0441\u043F\u043B\u0443\u0430\u0442\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0445 \u043A\u043E\u043B\u043E\u043D\u043D",
            "\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0430 \u043B\u0438\u043A\u0432\u0438\u0434\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0445 \u043C\u043E\u0441\u0442\u043E\u0432"
          ],
          advantages_ru: [
            "\u0412\u044B\u0441\u043E\u043A\u0430\u044F \u043F\u0440\u043E\u0447\u043D\u043E\u0441\u0442\u044C \u043D\u0430 \u0441\u0436\u0430\u0442\u0438\u0435",
            "\u041F\u0440\u0435\u0434\u0441\u043A\u0430\u0437\u0443\u0435\u043C\u043E\u0435 \u0432\u0440\u0435\u043C\u044F \u0437\u0430\u0433\u0443\u0441\u0442\u0435\u0432\u0430\u043D\u0438\u044F \u0438 \u043A\u0438\u043D\u0435\u0442\u0438\u043A\u0430 \u0433\u0438\u0434\u0440\u0430\u0442\u0430\u0446\u0438\u0438",
            "\u0421\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u0438\u0437\u043E\u0432\u0430\u043D \u0432\u043E \u0432\u0441\u0435\u043C \u043C\u0438\u0440\u0435 \u0441\u043E\u0433\u043B\u0430\u0441\u043D\u043E API Spec 10A"
          ],
          limitations_ru: [
            "\u0412\u044B\u0441\u043E\u043A\u0430\u044F \u043F\u043B\u043E\u0442\u043D\u043E\u0441\u0442\u044C \u043C\u043E\u0436\u0435\u0442 \u0432\u044B\u0437\u0432\u0430\u0442\u044C \u0433\u0438\u0434\u0440\u043E\u0440\u0430\u0437\u0440\u044B\u0432 \u0441\u043B\u0430\u0431\u044B\u0445 \u043F\u043B\u0430\u0441\u0442\u043E\u0432",
            "\u0421\u043A\u043B\u043E\u043D\u0435\u043D \u043A \u043C\u0438\u0433\u0440\u0430\u0446\u0438\u0438 \u0433\u0430\u0437\u0430 \u0432 \u043F\u0435\u0440\u0435\u0445\u043E\u0434\u043D\u044B\u0439 \u043F\u0435\u0440\u0438\u043E\u0434 \u0441\u0445\u0432\u0430\u0442\u044B\u0432\u0430\u043D\u0438\u044F",
            "\u041F\u043E\u0434\u0432\u0435\u0440\u0436\u0435\u043D \u0443\u0433\u043B\u0435\u043A\u0438\u0441\u043B\u043E\u0439 \u043A\u043E\u0440\u0440\u043E\u0437\u0438\u0438 \u0446\u0435\u043C\u0435\u043D\u0442\u043D\u043E\u0433\u043E \u043A\u0430\u043C\u043D\u044F \u0441\u043E \u0432\u0440\u0435\u043C\u0435\u043D\u0435\u043C"
          ]
        },
        {
          id: "fluid_cement_lightweight",
          type: "WellboreFluid",
          category: "cement_slurry",
          name: "Lightweight Silica-Lite Cement Slurry (\u041E\u0431\u043B\u0435\u0433\u0447\u0435\u043D\u043D\u044B\u0439 \u0446\u0435\u043C\u0435\u043D\u0442\u043D\u044B\u0439 \u0440\u0430\u0441\u0442\u0432\u043E\u0440)",
          aliases: [
            "lightweight cement",
            "\u043E\u0431\u043B\u0435\u0433\u0447\u0435\u043D\u043D\u044B\u0439 \u0446\u0435\u043C\u0435\u043D\u0442"
          ],
          description: "Low-density cement slurry formulated with microspheres or lightweight additives to prevent losses in weak formations.",
          standards: [
            "API Spec 10A",
            "ISO 10426-1"
          ],
          density: {
            min_sg: 1.35,
            max_sg: 1.6,
            unit: "SG"
          },
          temperature_limit: {
            max_c: 140,
            unit: "C"
          },
          rheology: {
            pv_cp: "30 - 55",
            yp_lb100ft2: "10 - 22"
          },
          compatibility: {
            steels: "Provides corrosion protection, but lower strength than standard Class G.",
            elastomers: "Fully compatible with standard elastomers."
          },
          applications: [
            "Conductor and surface casing cementing",
            "Weak depleted reservoirs",
            "Thief zones with low fracture gradients"
          ],
          advantages: [
            "Low hydrostatic pressure avoids fracturing formation",
            "Good yield volume per sack of cement",
            "Reduced risk of circulation loss"
          ],
          limitations: [
            "Lower final compressive strength",
            "Higher permeability compared to neat slurries",
            "Additive quality affects slurry stability"
          ],
          sources: [
            "API Spec 10A",
            "Well Cementing Handbook"
          ],
          description_ru: "\u041E\u0431\u043B\u0435\u0433\u0447\u0435\u043D\u043D\u044B\u0439 \u0442\u0430\u043C\u043F\u043E\u043D\u0430\u0436\u043D\u044B\u0439 \u0440\u0430\u0441\u0442\u0432\u043E\u0440 \u043D\u0438\u0437\u043A\u043E\u0439 \u043F\u043B\u043E\u0442\u043D\u043E\u0441\u0442\u0438, \u0440\u0435\u0446\u0435\u043F\u0442\u0443\u0440\u0430 \u043A\u043E\u0442\u043E\u0440\u043E\u0433\u043E \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442 \u043C\u0438\u043A\u0440\u043E\u0441\u0444\u0435\u0440\u044B \u0438\u043B\u0438 \u043E\u0431\u043B\u0435\u0433\u0447\u0430\u044E\u0449\u0438\u0435 \u0434\u043E\u0431\u0430\u0432\u043A\u0438 \u0434\u043B\u044F \u043F\u0440\u0435\u0434\u043E\u0442\u0432\u0440\u0430\u0449\u0435\u043D\u0438\u044F \u043F\u043E\u0433\u043B\u043E\u0449\u0435\u043D\u0438\u0439 \u0432 \u0441\u043B\u0430\u0431\u044B\u0445 \u043F\u043B\u0430\u0441\u0442\u0430\u0445.",
          compatibility_ru: {
            steels: "\u041E\u0431\u0435\u0441\u043F\u0435\u0447\u0438\u0432\u0430\u0435\u0442 \u0430\u043D\u0442\u0438\u043A\u043E\u0440\u0440\u043E\u0437\u0438\u043E\u043D\u043D\u0443\u044E \u0437\u0430\u0449\u0438\u0442\u0443 \u0441\u0442\u0430\u043B\u0435\u0439, \u043D\u043E \u0438\u043C\u0435\u0435\u0442 \u0431\u043E\u043B\u0435\u0435 \u043D\u0438\u0437\u043A\u0443\u044E \u043F\u0440\u043E\u0447\u043D\u043E\u0441\u0442\u044C \u0446\u0435\u043C\u0435\u043D\u0442\u043D\u043E\u0433\u043E \u043A\u0430\u043C\u043D\u044F \u043F\u043E \u0441\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u044E \u0441\u043E \u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u044B\u043C \u041A\u043B\u0430\u0441\u0441\u043E\u043C G.",
            elastomers: "\u041F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E \u0441\u043E\u0432\u043C\u0435\u0441\u0442\u0438\u043C \u0441\u043E \u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u044B\u043C\u0438 \u044D\u043B\u0430\u0441\u0442\u043E\u043C\u0435\u0440\u0430\u043C\u0438."
          },
          applications_ru: [
            "\u0426\u0435\u043C\u0435\u043D\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043A\u043E\u043D\u0434\u0443\u043A\u0442\u043E\u0440\u043E\u0432 \u0438 \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435",
            "\u0421\u043B\u0430\u0431\u044B\u0435 \u0438\u0441\u0442\u043E\u0449\u0435\u043D\u043D\u044B\u0435 \u043A\u043E\u043B\u043B\u0435\u043A\u0442\u043E\u0440\u044B",
            "\u0417\u043E\u043D\u044B \u043F\u043E\u0433\u043B\u043E\u0449\u0435\u043D\u0438\u0439 \u0441 \u043D\u0438\u0437\u043A\u0438\u043C \u0433\u0440\u0430\u0434\u0438\u0435\u043D\u0442\u043E\u043C \u0440\u0430\u0437\u0440\u044B\u0432\u0430 \u043F\u043E\u0440\u043E\u0434"
          ],
          advantages_ru: [
            "\u041D\u0438\u0437\u043A\u043E\u0435 \u0433\u0438\u0434\u0440\u043E\u0441\u0442\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u0434\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u0440\u0435\u0434\u043E\u0442\u0432\u0440\u0430\u0449\u0430\u0435\u0442 \u0433\u0438\u0434\u0440\u043E\u0440\u0430\u0437\u0440\u044B\u0432 \u043F\u043B\u0430\u0441\u0442\u0430",
            "\u0411\u043E\u043B\u044C\u0448\u043E\u0439 \u0432\u044B\u0445\u043E\u0434\u043D\u043E\u0439 \u043E\u0431\u044A\u0435\u043C \u0440\u0430\u0441\u0442\u0432\u043E\u0440\u0430 \u043D\u0430 \u043C\u0435\u0448\u043E\u043A \u0446\u0435\u043C\u0435\u043D\u0442\u0430",
            "\u0421\u043D\u0438\u0436\u0435\u043D\u0438\u0435 \u0440\u0438\u0441\u043A\u0430 \u043F\u043E\u0442\u0435\u0440\u0438 \u0446\u0438\u0440\u043A\u0443\u043B\u044F\u0446\u0438\u0438"
          ],
          limitations_ru: [
            "\u0411\u043E\u043B\u0435\u0435 \u043D\u0438\u0437\u043A\u0430\u044F \u043A\u043E\u043D\u0435\u0447\u043D\u0430\u044F \u043F\u0440\u043E\u0447\u043D\u043E\u0441\u0442\u044C \u043D\u0430 \u0441\u0436\u0430\u0442\u0438\u0435",
            "\u041F\u043E\u0432\u044B\u0448\u0435\u043D\u043D\u0430\u044F \u043F\u0440\u043E\u043D\u0438\u0446\u0430\u0435\u043C\u043E\u0441\u0442\u044C \u0446\u0435\u043C\u0435\u043D\u0442\u043D\u043E\u0433\u043E \u043A\u0430\u043C\u043D\u044F \u043F\u043E \u0441\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u044E \u0441 \u0447\u0438\u0441\u0442\u044B\u043C\u0438 \u0446\u0435\u043C\u0435\u043D\u0442\u0430\u043C\u0438",
            "\u041A\u0430\u0447\u0435\u0441\u0442\u0432\u043E \u0434\u043E\u0431\u0430\u0432\u043E\u043A \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u043E \u0432\u043B\u0438\u044F\u0435\u0442 \u043D\u0430 \u0441\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u0440\u0430\u0441\u0442\u0432\u043E\u0440\u0430"
          ]
        },
        {
          id: "fluid_spacer_weighted",
          type: "WellboreFluid",
          category: "spacer",
          name: "Weighted Spacer Fluid (\u0423\u0442\u044F\u0436\u0435\u043B\u0435\u043D\u043D\u0430\u044F \u0431\u0443\u0444\u0435\u0440\u043D\u0430\u044F \u0436\u0438\u0434\u043A\u043E\u0441\u0442\u044C)",
          aliases: [
            "spacer",
            "buffer",
            "\u0431\u0443\u0444\u0435\u0440",
            "\u0431\u0443\u0444\u0435\u0440\u043D\u0430\u044F \u0441\u043C\u0435\u0441\u044C"
          ],
          description: "High-density spacer fluid designed to separate drilling mud and cement slurry while maintaining well control and cleaning casing.",
          standards: [
            "API RP 10B-2",
            "ISO 10426-2"
          ],
          density: {
            min_sg: 1.2,
            max_sg: 2.1,
            unit: "SG"
          },
          temperature_limit: {
            max_c: 180,
            unit: "C"
          },
          rheology: {
            pv_cp: "20 - 45",
            yp_lb100ft2: "15 - 35"
          },
          compatibility: {
            steels: "Non-corrosive. Contains surfactants to water-wet the steel surface for cement bonding.",
            elastomers: "Surfactants can degrade standard NBR. FKM/HNBR seals recommended."
          },
          applications: [
            "Pre-flush separator before primary cementing",
            "OBM removal from casing walls",
            "Laminar to turbulent displacement spacer"
          ],
          advantages: [
            "Maintains wellbore pressure integrity during cementing",
            "Cleans drilling mud residue from casing and formation",
            "Water-wets casing to ensure optimal cement bonding"
          ],
          limitations: [
            "Requires precise surfactant concentration",
            "Viscosity must be carefully matched to prevent mixing",
            "Limited storage life after mixing"
          ],
          sources: [
            "API RP 10B-2",
            "Well Cementing Handbook"
          ],
          description_ru: "\u0423\u0442\u044F\u0436\u0435\u043B\u0435\u043D\u043D\u0430\u044F \u0431\u0443\u0444\u0435\u0440\u043D\u0430\u044F \u0436\u0438\u0434\u043A\u043E\u0441\u0442\u044C \u0432\u044B\u0441\u043E\u043A\u043E\u0439 \u043F\u043B\u043E\u0442\u043D\u043E\u0441\u0442\u0438, \u043F\u0440\u0435\u0434\u043D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u0430\u044F \u0434\u043B\u044F \u0440\u0430\u0437\u0434\u0435\u043B\u0435\u043D\u0438\u044F \u0431\u0443\u0440\u043E\u0432\u043E\u0433\u043E \u0438 \u0446\u0435\u043C\u0435\u043D\u0442\u043D\u043E\u0433\u043E \u0440\u0430\u0441\u0442\u0432\u043E\u0440\u043E\u0432 \u0441 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435\u043C \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044F \u043D\u0430\u0434 \u0441\u043A\u0432\u0430\u0436\u0438\u043D\u043E\u0439 \u0438 \u043E\u0447\u0438\u0441\u0442\u043A\u0438 \u043E\u0431\u0441\u0430\u0434\u043D\u043E\u0439 \u043A\u043E\u043B\u043E\u043D\u043D\u044B.",
          compatibility_ru: {
            steels: "\u041D\u0435 \u0432\u044B\u0437\u044B\u0432\u0430\u0435\u0442 \u043A\u043E\u0440\u0440\u043E\u0437\u0438\u0438. \u0421\u043E\u0434\u0435\u0440\u0436\u0438\u0442 \u041F\u0410\u0412 \u0434\u043B\u044F \u0433\u0438\u0434\u0440\u043E\u0444\u0438\u043B\u0438\u0437\u0430\u0446\u0438\u0438 \u043F\u043E\u0432\u0435\u0440\u0445\u043D\u043E\u0441\u0442\u0438 \u0441\u0442\u0430\u043B\u0438, \u0447\u0442\u043E \u0443\u043B\u0443\u0447\u0448\u0430\u0435\u0442 \u0441\u0446\u0435\u043F\u043B\u0435\u043D\u0438\u0435 \u0446\u0435\u043C\u0435\u043D\u0442\u0430.",
            elastomers: "\u041F\u0410\u0412 \u043C\u043E\u0433\u0443\u0442 \u0440\u0430\u0437\u0440\u0443\u0448\u0430\u0442\u044C \u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u044B\u0439 NBR. \u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u044E\u0442\u0441\u044F \u0443\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u044F \u0438\u0437 FKM/HNBR."
          },
          applications_ru: [
            "\u0420\u0430\u0437\u0434\u0435\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0431\u0443\u0444\u0435\u0440 \u043F\u0435\u0440\u0435\u0434 \u043F\u0435\u0440\u0432\u0438\u0447\u043D\u044B\u043C \u0446\u0435\u043C\u0435\u043D\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435\u043C",
            "\u0423\u0434\u0430\u043B\u0435\u043D\u0438\u0435 \u043E\u0441\u0442\u0430\u0442\u043A\u043E\u0432 \u0420\u0423\u041E \u0441\u043E \u0441\u0442\u0435\u043D\u043E\u043A \u043E\u0431\u0441\u0430\u0434\u043D\u044B\u0445 \u043A\u043E\u043B\u043E\u043D\u043D",
            "\u0412\u044B\u0442\u0435\u0441\u043D\u0435\u043D\u0438\u0435 \u0432 \u043B\u0430\u043C\u0438\u043D\u0430\u0440\u043D\u043E\u043C \u0438\u043B\u0438 \u0442\u0443\u0440\u0431\u0443\u043B\u0435\u043D\u0442\u043D\u043E\u043C \u0440\u0435\u0436\u0438\u043C\u0435"
          ],
          advantages_ru: [
            "\u0421\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u0442 \u0433\u0438\u0434\u0440\u043E\u0441\u0442\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u0434\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u0440\u0438 \u0446\u0435\u043C\u0435\u043D\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0438",
            "\u041E\u0447\u0438\u0449\u0430\u0435\u0442 \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u043E\u043D\u043D\u0443\u044E \u043A\u043E\u0440\u043A\u0443 \u0431\u0443\u0440\u043E\u0432\u043E\u0433\u043E \u0440\u0430\u0441\u0442\u0432\u043E\u0440\u0430 \u0441 \u043E\u0431\u0441\u0430\u0434\u043D\u043E\u0439 \u043A\u043E\u043B\u043E\u043D\u043D\u044B \u0438 \u043F\u043E\u0440\u043E\u0434\u044B",
            "\u0413\u0438\u0434\u0440\u043E\u0444\u0438\u043B\u0438\u0437\u0438\u0440\u0443\u0435\u0442 \u043E\u0431\u0441\u0430\u0434\u043D\u0443\u044E \u043A\u043E\u043B\u043E\u043D\u043D\u0443 \u0434\u043B\u044F \u043E\u0431\u0435\u0441\u043F\u0435\u0447\u0435\u043D\u0438\u044F \u043E\u043F\u0442\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0441\u0446\u0435\u043F\u043B\u0435\u043D\u0438\u044F \u0446\u0435\u043C\u0435\u043D\u0442\u0430"
          ],
          limitations_ru: [
            "\u0422\u0440\u0435\u0431\u0443\u0435\u0442 \u0442\u043E\u0447\u043D\u043E\u0439 \u0434\u043E\u0437\u0438\u0440\u043E\u0432\u043A\u0438 \u043F\u043E\u0432\u0435\u0440\u0445\u043D\u043E\u0441\u0442\u043D\u043E-\u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u0432\u0435\u0449\u0435\u0441\u0442\u0432",
            "\u0412\u044F\u0437\u043A\u043E\u0441\u0442\u044C \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0442\u0449\u0430\u0442\u0435\u043B\u044C\u043D\u043E \u043F\u043E\u0434\u043E\u0431\u0440\u0430\u043D\u0430 \u0432\u043E \u0438\u0437\u0431\u0435\u0436\u0430\u043D\u0438\u0435 \u0441\u043C\u0435\u0448\u0438\u0432\u0430\u043D\u0438\u044F \u0441\u043C\u0435\u0436\u043D\u044B\u0445 \u0444\u043B\u044E\u0438\u0434\u043E\u0432",
            "\u041E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u043D\u044B\u0439 \u0441\u0440\u043E\u043A \u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F \u0433\u043E\u0442\u043E\u0432\u043E\u0439 \u0441\u043C\u0435\u0441\u0438"
          ]
        },
        {
          id: "fluid_additive_barite",
          type: "WellboreFluid",
          category: "additive",
          name: "Barite Weighting Agent (\u0411\u0430\u0440\u0438\u0442 \u0443\u0442\u044F\u0436\u0435\u043B\u0438\u0442\u0435\u043B\u044C)",
          aliases: [
            "barite",
            "\u0431\u0430\u0440\u0438\u0442",
            "\u0443\u0442\u044F\u0436\u0435\u043B\u0438\u0442\u0435\u043B\u044C"
          ],
          description: "Barium sulfate powder used to increase the density of drilling muds, completion fluids, and cement slurries.",
          standards: [
            "API Spec 13A",
            "ISO 13500"
          ],
          density: {
            min_sg: 4.1,
            max_sg: 4.25,
            unit: "SG"
          },
          temperature_limit: {
            max_c: 250,
            unit: "C"
          },
          rheology: {
            pv_cp: "N/A",
            yp_lb100ft2: "N/A"
          },
          compatibility: {
            steels: "Chemically inert. Highly abrasive at high concentrations and shear rates.",
            elastomers: "Inert to elastomers, but solid particles can cause mechanical wear on sliding seals."
          },
          applications: [
            "Mud weighting (increasing density)",
            "Kill fluids formulation",
            "Weighted spacers"
          ],
          advantages: [
            "High specific gravity (4.20) requires less solid volume",
            "Insoluble in water and hydrocarbons",
            "Highly stable under extreme HPHT downhole conditions"
          ],
          limitations: [
            "Increases plastic viscosity and solids loading of mud",
            "Prone to settling (sagging) in static fluids",
            "Abrasive on pumps and tubular surfaces"
          ],
          sources: [
            "API Spec 13A",
            "Drilling Fluids Engineering Manual"
          ],
          description_ru: "\u041F\u043E\u0440\u043E\u0448\u043E\u043A \u0441\u0443\u043B\u044C\u0444\u0430\u0442\u0430 \u0431\u0430\u0440\u0438\u044F, \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u043C\u044B\u0439 \u0434\u043B\u044F \u0443\u0432\u0435\u043B\u0438\u0447\u0435\u043D\u0438\u044F \u043F\u043B\u043E\u0442\u043D\u043E\u0441\u0442\u0438 \u0431\u0443\u0440\u043E\u0432\u044B\u0445 \u0440\u0430\u0441\u0442\u0432\u043E\u0440\u043E\u0432, \u0440\u0430\u0441\u0442\u0432\u043E\u0440\u043E\u0432 \u0433\u043B\u0443\u0448\u0435\u043D\u0438\u044F \u0438 \u0446\u0435\u043C\u0435\u043D\u0442\u043D\u044B\u0445 \u0441\u043C\u0435\u0441\u0435\u0439.",
          compatibility_ru: {
            steels: "\u0425\u0438\u043C\u0438\u0447\u0435\u0441\u043A\u0438 \u0438\u043D\u0435\u0440\u0442\u0435\u043D. \u041E\u0431\u043B\u0430\u0434\u0430\u0435\u0442 \u0430\u0431\u0440\u0430\u0437\u0438\u0432\u043D\u044B\u043C \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435\u043C \u043F\u0440\u0438 \u0432\u044B\u0441\u043E\u043A\u0438\u0445 \u043A\u043E\u043D\u0446\u0435\u043D\u0442\u0440\u0430\u0446\u0438\u044F\u0445 \u0438 \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044F\u0445 \u0441\u0434\u0432\u0438\u0433\u0430.",
            elastomers: "\u0418\u043D\u0435\u0440\u0442\u0435\u043D \u043A \u044D\u043B\u0430\u0441\u0442\u043E\u043C\u0435\u0440\u0430\u043C, \u043D\u043E \u0442\u0432\u0435\u0440\u0434\u044B\u0435 \u0447\u0430\u0441\u0442\u0438\u0446\u044B \u043C\u043E\u0433\u0443\u0442 \u0432\u044B\u0437\u0432\u0430\u0442\u044C \u043C\u0435\u0445\u0430\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0438\u0437\u043D\u043E\u0441 \u043F\u043E\u0434\u0432\u0438\u0436\u043D\u044B\u0445 \u0443\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u0439."
          },
          applications_ru: [
            "\u0423\u0442\u044F\u0436\u0435\u043B\u0435\u043D\u0438\u0435 \u0431\u0443\u0440\u043E\u0432\u043E\u0433\u043E \u0440\u0430\u0441\u0442\u0432\u043E\u0440\u0430 (\u043F\u043E\u0432\u044B\u0448\u0435\u043D\u0438\u0435 \u043F\u043B\u043E\u0442\u043D\u043E\u0441\u0442\u0438)",
            "\u041F\u0440\u0438\u0433\u043E\u0442\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u0442\u044F\u0436\u0435\u043B\u044B\u0445 \u0436\u0438\u0434\u043A\u043E\u0441\u0442\u0435\u0439 \u0433\u043B\u0443\u0448\u0435\u043D\u0438\u044F",
            "\u0423\u0442\u044F\u0436\u0435\u043B\u0435\u043D\u0438\u0435 \u0431\u0443\u0444\u0435\u0440\u043D\u044B\u0445 \u0441\u043C\u0435\u0441\u0435\u0439"
          ],
          advantages_ru: [
            "\u0412\u044B\u0441\u043E\u043A\u0438\u0439 \u0443\u0434\u0435\u043B\u044C\u043D\u044B\u0439 \u0432\u0435\u0441 (4.20) \u0442\u0440\u0435\u0431\u0443\u0435\u0442 \u043C\u0435\u043D\u044C\u0448\u0435\u0433\u043E \u043E\u0431\u044A\u0435\u043C\u0430 \u0442\u0432\u0435\u0440\u0434\u043E\u0439 \u0444\u0430\u0437\u044B",
            "\u041D\u0435 \u0440\u0430\u0441\u0442\u0432\u043E\u0440\u044F\u0435\u0442\u0441\u044F \u0432 \u0432\u043E\u0434\u0435 \u0438 \u0443\u0433\u043B\u0435\u0432\u043E\u0434\u043E\u0440\u043E\u0434\u0430\u0445",
            "\u0412\u044B\u0441\u043E\u043A\u0430\u044F \u0441\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u0432 \u044D\u043A\u0441\u0442\u0440\u0435\u043C\u0430\u043B\u044C\u043D\u044B\u0445 \u0443\u0441\u043B\u043E\u0432\u0438\u044F\u0445 HPHT"
          ],
          limitations_ru: [
            "\u041F\u043E\u0432\u044B\u0448\u0430\u0435\u0442 \u043F\u043B\u0430\u0441\u0442\u0438\u0447\u0435\u0441\u043A\u0443\u044E \u0432\u044F\u0437\u043A\u043E\u0441\u0442\u044C \u0438 \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u043D\u0438\u0435 \u0442\u0432\u0435\u0440\u0434\u043E\u0439 \u0444\u0430\u0437\u044B",
            "\u0421\u043A\u043B\u043E\u043D\u0435\u043D \u043A \u043E\u0441\u0430\u0436\u0434\u0435\u043D\u0438\u044E (\u043E\u0441\u0435\u0434\u0430\u043D\u0438\u044E \u0431\u0430\u0440\u0438\u0442\u0430) \u0432 \u0441\u0442\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0445 \u0443\u0441\u043B\u043E\u0432\u0438\u044F\u0445",
            "\u0410\u0431\u0440\u0430\u0437\u0438\u0432\u043D\u044B\u0439 \u0438\u0437\u043D\u043E\u0441 \u043D\u0430\u0441\u043E\u0441\u043E\u0432 \u0438 \u0442\u0440\u0443\u0431"
          ]
        },
        {
          id: "fluid_acid_hcl_15",
          type: "WellboreFluid",
          category: "acid",
          name: "15% HCl Acidizing System (15% \u0421\u043E\u043B\u044F\u043D\u043E\u043A\u0438\u0441\u043B\u043E\u0442\u043D\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430)",
          aliases: [
            "hcl",
            "acid",
            "\u043A\u0438\u0441\u043B\u043E\u0442\u0430",
            "\u0441\u043E\u043B\u044F\u043D\u0430\u044F \u043A\u0438\u0441\u043B\u043E\u0442\u0430",
            "\u043E\u043F\u0437"
          ],
          description: "Standard hydrochloric acid solution used for carbonate stimulation (acidizing) to dissolve calcite and dolomite and create conductive channels.",
          standards: [
            "API RP 41",
            "NACE SP0599"
          ],
          density: {
            min_sg: 1.07,
            max_sg: 1.1,
            unit: "SG"
          },
          temperature_limit: {
            max_c: 120,
            unit: "C"
          },
          rheology: {
            pv_cp: "1.2",
            yp_lb100ft2: "0"
          },
          compatibility: {
            steels: "Highly corrosive. Requires corrosion inhibitors (alkyl pyridines) above 50\xB0C to protect casing and tubing.",
            elastomers: "Highly compatible with FKM (Viton) and Teflon (PTFE). Causes hardening and cracking in NBR and EPDM."
          },
          applications: [
            "Carbonate matrix acidizing",
            "Borehole cleanup (removing calcium carbonate scale)",
            "Acid fracturing"
          ],
          advantages: [
            "Extremely high dissolving capacity for calcium carbonate",
            "Low cost and widely available",
            "Fully soluble reaction products (calcium chloride)"
          ],
          limitations: [
            "Rapid reaction rate limits penetration depth in high temperatures",
            "High corrosion rate on carbon steel without inhibitors",
            "Can cause asphaltic sludge formation in heavy oils"
          ],
          sources: [
            "Stimulation Engineering Manual",
            "NACE SP0599"
          ],
          description_ru: "\u0421\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u044B\u0439 \u0440\u0430\u0441\u0442\u0432\u043E\u0440 \u0441\u043E\u043B\u044F\u043D\u043E\u0439 \u043A\u0438\u0441\u043B\u043E\u0442\u044B, \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u043C\u044B\u0439 \u0434\u043B\u044F \u0441\u0442\u0438\u043C\u0443\u043B\u044F\u0446\u0438\u0438 \u043A\u0430\u0440\u0431\u043E\u043D\u0430\u0442\u043D\u044B\u0445 \u043A\u043E\u043B\u043B\u0435\u043A\u0442\u043E\u0440\u043E\u0432 (\u043A\u0438\u0441\u043B\u043E\u0442\u043D\u043E\u0439 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0438) \u0441 \u0446\u0435\u043B\u044C\u044E \u0440\u0430\u0441\u0442\u0432\u043E\u0440\u0435\u043D\u0438\u044F \u043A\u0430\u043B\u044C\u0446\u0438\u0442\u0430 \u0438 \u0434\u043E\u043B\u043E\u043C\u0438\u0442\u0430 \u0438 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u043F\u0440\u043E\u0432\u043E\u0434\u044F\u0449\u0438\u0445 \u043A\u0430\u043D\u0430\u043B\u043E\u0432.",
          compatibility_ru: {
            steels: "\u0412\u044B\u0441\u043E\u043A\u043E\u0430\u043A\u0442\u0438\u0432\u043D\u0430\u044F \u043A\u043E\u0440\u0440\u043E\u0437\u0438\u043E\u043D\u043D\u0430\u044F \u0441\u0440\u0435\u0434\u0430. \u041F\u0440\u0438 \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0435 \u0432\u044B\u0448\u0435 50\xB0C \u0442\u0440\u0435\u0431\u0443\u0435\u0442 \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u0432\u0432\u043E\u0434\u0430 \u0438\u043D\u0433\u0438\u0431\u0438\u0442\u043E\u0440\u043E\u0432 \u043A\u043E\u0440\u0440\u043E\u0437\u0438\u0438 (\u0430\u043B\u043A\u0438\u043B\u043F\u0438\u0440\u0438\u0434\u0438\u043D\u043E\u0432) \u0434\u043B\u044F \u0437\u0430\u0449\u0438\u0442\u044B \u0442\u0440\u0443\u0431.",
            elastomers: "\u041E\u0442\u043B\u0438\u0447\u043D\u0430\u044F \u0441\u043E\u0432\u043C\u0435\u0441\u0442\u0438\u043C\u043E\u0441\u0442\u044C \u0441 FKM (Viton) \u0438 PTFE (\u0422\u0435\u0444\u043B\u043E\u043D). \u0412\u044B\u0437\u044B\u0432\u0430\u0435\u0442 \u043E\u0445\u0440\u0443\u043F\u0447\u0438\u0432\u0430\u043D\u0438\u0435 \u0438 \u0440\u0430\u0441\u0442\u0440\u0435\u0441\u043A\u0438\u0432\u0430\u043D\u0438\u0435 NBR \u0438 EPDM."
          },
          applications_ru: [
            "\u041C\u0430\u0442\u0440\u0438\u0447\u043D\u0430\u044F \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u043A\u0430\u0440\u0431\u043E\u043D\u0430\u0442\u043D\u044B\u0445 \u043A\u043E\u043B\u043B\u0435\u043A\u0442\u043E\u0440\u043E\u0432",
            "\u041E\u0447\u0438\u0441\u0442\u043A\u0430 \u0441\u0442\u0432\u043E\u043B\u0430 \u0441\u043A\u0432\u0430\u0436\u0438\u043D\u044B (\u0440\u0430\u0441\u0442\u0432\u043E\u0440\u0435\u043D\u0438\u0435 \u043A\u0430\u043B\u044C\u0446\u0438\u0435\u0432\u043E\u0439 \u043D\u0430\u043A\u0438\u043F\u0438)",
            "\u041A\u0438\u0441\u043B\u043E\u0442\u043D\u044B\u0439 \u0433\u0438\u0434\u0440\u043E\u0440\u0430\u0437\u0440\u044B\u0432 \u043F\u043B\u0430\u0441\u0442\u0430"
          ],
          advantages_ru: [
            "\u0418\u0441\u043A\u043B\u044E\u0447\u0438\u0442\u0435\u043B\u044C\u043D\u043E \u0432\u044B\u0441\u043E\u043A\u0430\u044F \u0440\u0430\u0441\u0442\u0432\u043E\u0440\u044F\u044E\u0449\u0430\u044F \u0441\u043F\u043E\u0441\u043E\u0431\u043D\u043E\u0441\u0442\u044C \u043F\u043E \u043E\u0442\u043D\u043E\u0448\u0435\u043D\u0438\u044E \u043A \u043A\u0430\u0440\u0431\u043E\u043D\u0430\u0442\u0443 \u043A\u0430\u043B\u044C\u0446\u0438\u044F",
            "\u041D\u0438\u0437\u043A\u0430\u044F \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u0438 \u0448\u0438\u0440\u043E\u043A\u0430\u044F \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E\u0441\u0442\u044C \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0430",
            "\u041F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E \u0440\u0430\u0441\u0442\u0432\u043E\u0440\u0438\u043C\u044B\u0435 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u044B \u0440\u0435\u0430\u043A\u0446\u0438\u0438 (\u0445\u043B\u043E\u0440\u0438\u0434 \u043A\u0430\u043B\u044C\u0446\u0438\u044F)"
          ],
          limitations_ru: [
            "\u0412\u044B\u0441\u043E\u043A\u0430\u044F \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u0440\u0435\u0430\u043A\u0446\u0438\u0438 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0438\u0432\u0430\u0435\u0442 \u0433\u043B\u0443\u0431\u0438\u043D\u0443 \u043F\u0440\u043E\u043D\u0438\u043A\u043D\u043E\u0432\u0435\u043D\u0438\u044F \u043F\u0440\u0438 \u0432\u044B\u0441\u043E\u043A\u0438\u0445 \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430\u0445",
            "\u041E\u0447\u0435\u043D\u044C \u0432\u044B\u0441\u043E\u043A\u0430\u044F \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u043A\u043E\u0440\u0440\u043E\u0437\u0438\u0438 \u0441\u0442\u0430\u043B\u0438 \u0431\u0435\u0437 \u0438\u043D\u0433\u0438\u0431\u0438\u0442\u043E\u0440\u043E\u0432",
            "\u041C\u043E\u0436\u0435\u0442 \u0432\u044B\u0437\u044B\u0432\u0430\u0442\u044C \u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \u0430\u0441\u0444\u0430\u043B\u044C\u0442\u0435\u043D\u043E\u0432\u043E\u0433\u043E \u043E\u0441\u0430\u0434\u043A\u0430 \u0432 \u0442\u044F\u0436\u0435\u043B\u044B\u0445 \u043D\u0435\u0444\u0442\u044F\u0445"
          ]
        },
        {
          id: "fluid_acid_mud_acid",
          type: "WellboreFluid",
          category: "acid",
          name: "Mud Acid / \u0413\u043B\u0438\u043D\u043E\u043A\u0438\u0441\u043B\u043E\u0442\u0430 (12% HCl / 3% HF)",
          aliases: [
            "mud acid",
            "hf",
            "\u0433\u043B\u0438\u043D\u043E\u043A\u0438\u0441\u043B\u043E\u0442\u0430",
            "\u0444\u0442\u043E\u0440\u0438\u0441\u0442\u0430\u044F \u043A\u0438\u0441\u043B\u043E\u0442\u0430"
          ],
          description: "A synergistic blend of hydrochloric and hydrofluoric acids, specifically formulated to dissolve silicate minerals (clay, quartz, feldspar) in sandstone reservoirs.",
          standards: [
            "API RP 41"
          ],
          density: {
            min_sg: 1.08,
            max_sg: 1.12,
            unit: "SG"
          },
          temperature_limit: {
            max_c: 110,
            unit: "C"
          },
          rheology: {
            pv_cp: "1.3",
            yp_lb100ft2: "0"
          },
          compatibility: {
            steels: "Extremely corrosive. Attacks steel casing and requires strong organic inhibitors.",
            elastomers: "Attacks standard NBR. Requires FKM (Viton) or FFKM seals."
          },
          applications: [
            "Sandstone matrix stimulation",
            "Removal of drilling mud filter cakes containing clay",
            "Silicate mineral scale dissolution"
          ],
          advantages: [
            "Only acid mixture capable of dissolving silica and clay minerals",
            "Highly effective in restoring permeability in sandstone zones"
          ],
          limitations: [
            "Dangerous to handle (hydrofluoric acid toxicity)",
            "Prone to secondary precipitation of calcium fluoride if not pre-flushed with HCl"
          ],
          sources: [
            "Sandstone Acidizing Guidelines"
          ],
          description_ru: "\u0421\u0438\u043D\u0435\u0440\u0433\u0435\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0441\u043C\u0435\u0441\u044C \u0441\u043E\u043B\u044F\u043D\u043E\u0439 \u0438 \u0444\u0442\u043E\u0440\u0438\u0441\u0442\u043E\u0432\u043E\u0434\u043E\u0440\u043E\u0434\u043D\u043E\u0439 \u043A\u0438\u0441\u043B\u043E\u0442, \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u044C\u043D\u043E \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u043D\u0430\u044F \u0434\u043B\u044F \u0440\u0430\u0441\u0442\u0432\u043E\u0440\u0435\u043D\u0438\u044F \u0441\u0438\u043B\u0438\u043A\u0430\u0442\u043D\u044B\u0445 \u043C\u0438\u043D\u0435\u0440\u0430\u043B\u043E\u0432 (\u0433\u043B\u0438\u043D\u044B, \u043A\u0432\u0430\u0440\u0446\u0430, \u043F\u043E\u043B\u0435\u0432\u043E\u0433\u043E \u0448\u043F\u0430\u0442\u0430) \u0432 \u043F\u0435\u0441\u0447\u0430\u043D\u0438\u043A\u0430\u0445.",
          compatibility_ru: {
            steels: "\u0427\u0440\u0435\u0437\u0432\u044B\u0447\u0430\u0439\u043D\u043E \u0430\u0433\u0440\u0435\u0441\u0441\u0438\u0432\u0435\u043D. \u0411\u044B\u0441\u0442\u0440\u043E \u0440\u0430\u0437\u0440\u0443\u0448\u0430\u0435\u0442 \u0441\u0442\u0430\u043B\u044C\u043D\u0443\u044E \u043E\u0431\u0441\u0430\u0434\u043D\u0443\u044E \u043A\u043E\u043B\u043E\u043D\u043D\u0443 \u0438 \u0442\u0440\u0435\u0431\u0443\u0435\u0442 \u044D\u0444\u0444\u0435\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u043E\u0440\u0433\u0430\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0445 \u0438\u043D\u0433\u0438\u0431\u0438\u0442\u043E\u0440\u043E\u0432.",
            elastomers: "\u0420\u0430\u0437\u0440\u0443\u0448\u0430\u0435\u0442 \u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u044B\u0439 NBR. \u0422\u0440\u0435\u0431\u0443\u0435\u0442 \u0443\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u0439 \u0438\u0437 FKM (Viton) \u0438\u043B\u0438 FFKM."
          },
          applications_ru: [
            "\u041C\u0430\u0442\u0440\u0438\u0447\u043D\u0430\u044F \u0441\u0442\u0438\u043C\u0443\u043B\u044F\u0446\u0438\u044F \u043F\u0435\u0441\u0447\u0430\u043D\u044B\u0445 \u043A\u043E\u043B\u043B\u0435\u043A\u0442\u043E\u0440\u043E\u0432",
            "\u0423\u0434\u0430\u043B\u0435\u043D\u0438\u0435 \u0433\u043B\u0438\u043D\u0438\u0441\u0442\u043E\u0439 \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u043E\u043D\u043D\u043E\u0439 \u043A\u043E\u0440\u043A\u0438 \u0431\u0443\u0440\u043E\u0432\u043E\u0433\u043E \u0440\u0430\u0441\u0442\u0432\u043E\u0440\u0430",
            "\u0420\u0430\u0441\u0442\u0432\u043E\u0440\u0435\u043D\u0438\u0435 \u0441\u0438\u043B\u0438\u043A\u0430\u0442\u043D\u043E\u0439 \u043D\u0430\u043A\u0438\u043F\u0438"
          ],
          advantages_ru: [
            "\u0415\u0434\u0438\u043D\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043A\u0438\u0441\u043B\u043E\u0442\u043D\u0430\u044F \u0441\u043C\u0435\u0441\u044C, \u0441\u043F\u043E\u0441\u043E\u0431\u043D\u0430\u044F \u0440\u0430\u0441\u0442\u0432\u043E\u0440\u044F\u0442\u044C \u043A\u0432\u0430\u0440\u0446 \u0438 \u0433\u043B\u0438\u043D\u0438\u0441\u0442\u044B\u0435 \u043C\u0438\u043D\u0435\u0440\u0430\u043B\u044B",
            "\u0412\u044B\u0441\u043E\u043A\u043E\u044D\u0444\u0444\u0435\u043A\u0442\u0438\u0432\u043D\u0430 \u0434\u043B\u044F \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u043F\u0440\u043E\u043D\u0438\u0446\u0430\u0435\u043C\u043E\u0441\u0442\u0438 \u0432 \u043F\u0440\u0438\u0437\u0430\u0431\u043E\u0439\u043D\u043E\u0439 \u0437\u043E\u043D\u0435 \u043F\u0435\u0441\u0447\u0430\u043D\u0438\u043A\u043E\u0432"
          ],
          limitations_ru: [
            "\u0412\u044B\u0441\u043E\u043A\u0430\u044F \u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u044C \u043F\u0440\u0438 \u043E\u0431\u0440\u0430\u0449\u0435\u043D\u0438\u0438 (\u0442\u043E\u043A\u0441\u0438\u0447\u043D\u043E\u0441\u0442\u044C \u043F\u043B\u0430\u0432\u0438\u043A\u043E\u0432\u043E\u0439 \u043A\u0438\u0441\u043B\u043E\u0442\u044B)",
            "\u0421\u043A\u043B\u043E\u043D\u043D\u043E\u0441\u0442\u044C \u043A \u0432\u0442\u043E\u0440\u0438\u0447\u043D\u043E\u043C\u0443 \u0432\u044B\u043F\u0430\u0434\u0435\u043D\u0438\u044E \u0444\u0442\u043E\u0440\u0438\u0434\u0430 \u043A\u0430\u043B\u044C\u0446\u0438\u044F \u0432 \u043E\u0441\u0430\u0434\u043E\u043A \u0431\u0435\u0437 \u043F\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u043F\u0440\u043E\u043C\u044B\u0432\u043A\u0438 \u0441\u043E\u043B\u044F\u043D\u043E\u0439 \u043A\u0438\u0441\u043B\u043E\u0442\u043E\u0439"
          ]
        },
        {
          id: "fluid_inhibitor_h2s",
          type: "WellboreFluid",
          category: "corrosion_control",
          name: "Triazine H2S Scavenger (\u041D\u0435\u0439\u0442\u0440\u0430\u043B\u0438\u0437\u0430\u0442\u043E\u0440 \u0441\u0435\u0440\u043E\u0432\u043E\u0434\u043E\u0440\u043E\u0434\u0430)",
          aliases: [
            "scavenger",
            "h2s scavenger",
            "\u043D\u0435\u0439\u0442\u0440\u0430\u043B\u0438\u0437\u0430\u0442\u043E\u0440",
            "\u0441\u0435\u0440\u043E\u0432\u043E\u0434\u043E\u0440\u043E\u0434"
          ],
          description: "Amine-aldehyde condensate (triazine) designed to chemically bind H2S into a non-toxic, water-soluble byproduct.",
          standards: [
            "NACE MR0175",
            "API RP 55"
          ],
          density: {
            min_sg: 1.02,
            max_sg: 1.06,
            unit: "SG"
          },
          temperature_limit: {
            max_c: 150,
            unit: "C"
          },
          rheology: {
            pv_cp: "5 - 15",
            yp_lb100ft2: "N/A"
          },
          compatibility: {
            steels: "Helps protect steel casing and drill string from Sulfide Stress Cracking (SSC).",
            elastomers: "Fully compatible with standard elastomers."
          },
          applications: [
            "Drilling in sour zones (H2S hazard)",
            "Completion fluids treatement",
            "Production fluid stripping"
          ],
          advantages: [
            "Fast reaction rate with H2S",
            "Byproducts are non-hazardous and water-soluble",
            "Thermally stable up to 150\xB0C"
          ],
          limitations: [
            "Consumable product (requires stoichiometry-based dosing)",
            "High concentrations can increase pH and carbonate scaling risk"
          ],
          sources: [
            "NACE MR0175",
            "Corrosion Scavengers Manual"
          ],
          description_ru: "\u0410\u043C\u0438\u043D\u043E-\u0430\u043B\u044C\u0434\u0435\u0433\u0438\u0434\u043D\u044B\u0439 \u043A\u043E\u043D\u0434\u0435\u043D\u0441\u0430\u0442 (\u0442\u0440\u0438\u0430\u0437\u0438\u043D), \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u043D\u044B\u0439 \u0434\u043B\u044F \u0445\u0438\u043C\u0438\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u0441\u0432\u044F\u0437\u044B\u0432\u0430\u043D\u0438\u044F \u0441\u0435\u0440\u043E\u0432\u043E\u0434\u043E\u0440\u043E\u0434\u0430 H2S \u0432 \u043D\u0435\u0442\u043E\u043A\u0441\u0438\u0447\u043D\u044B\u0435 \u0432\u043E\u0434\u043E\u0440\u0430\u0441\u0442\u0432\u043E\u0440\u0438\u043C\u044B\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u044F.",
          compatibility_ru: {
            steels: "\u041F\u0440\u0435\u0434\u043E\u0442\u0432\u0440\u0430\u0449\u0430\u0435\u0442 \u0441\u0443\u043B\u044C\u0444\u0438\u0434\u043D\u043E\u0435 \u0440\u0430\u0441\u0442\u0440\u0435\u0441\u043A\u0438\u0432\u0430\u043D\u0438\u0435 \u043F\u043E\u0434 \u043D\u0430\u043F\u0440\u044F\u0436\u0435\u043D\u0438\u0435\u043C (SSC) \u043E\u0431\u0441\u0430\u0434\u043D\u044B\u0445 \u043A\u043E\u043B\u043E\u043D\u043D \u0438 \u0431\u0443\u0440\u0438\u043B\u044C\u043D\u044B\u0445 \u0442\u0440\u0443\u0431.",
            elastomers: "\u041F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E \u0441\u043E\u0432\u043C\u0435\u0441\u0442\u0438\u043C \u0441\u043E \u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u044B\u043C\u0438 \u044D\u043B\u0430\u0441\u0442\u043E\u043C\u0435\u0440\u0430\u043C\u0438."
          },
          applications_ru: [
            "\u0411\u0443\u0440\u0435\u043D\u0438\u0435 \u0432 \u0437\u043E\u043D\u0430\u0445 \u0441 \u0440\u0438\u0441\u043A\u043E\u043C \u0432\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u044F H2S",
            "\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0436\u0438\u0434\u043A\u043E\u0441\u0442\u0435\u0439 \u0437\u0430\u043A\u0430\u043D\u0447\u0438\u0432\u0430\u043D\u0438\u044F",
            "\u041E\u0447\u0438\u0441\u0442\u043A\u0430 \u0434\u043E\u0431\u044B\u0432\u0430\u0435\u043C\u044B\u0445 \u0444\u043B\u044E\u0438\u0434\u043E\u0432 \u043E\u0442 H2S"
          ],
          advantages_ru: [
            "\u0412\u044B\u0441\u043E\u043A\u0430\u044F \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u0440\u0435\u0430\u043A\u0446\u0438\u0438 \u0441 \u0441\u0435\u0440\u043E\u0432\u043E\u0434\u043E\u0440\u043E\u0434\u043E\u043C",
            "\u041F\u0440\u043E\u0434\u0443\u043A\u0442\u044B \u0440\u0435\u0430\u043A\u0446\u0438\u0438 \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u044B \u0438 \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E \u0440\u0430\u0441\u0442\u0432\u043E\u0440\u0438\u043C\u044B \u0432 \u0432\u043E\u0434\u0435",
            "\u0422\u0435\u0440\u043C\u043E\u0441\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u0434\u043E 150\xB0C"
          ],
          limitations_ru: [
            "\u0420\u0430\u0441\u0445\u043E\u0434\u043D\u044B\u0439 \u0440\u0435\u0430\u0433\u0435\u043D\u0442 (\u0442\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F \u0434\u043E\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0441\u0442\u0440\u043E\u0433\u043E \u043F\u043E \u0441\u0442\u0435\u0445\u0438\u043E\u043C\u0435\u0442\u0440\u0438\u0438 H2S)",
            "\u0412\u044B\u0441\u043E\u043A\u0438\u0435 \u043A\u043E\u043D\u0446\u0435\u043D\u0442\u0440\u0430\u0446\u0438\u0438 \u043C\u043E\u0433\u0443\u0442 \u0443\u0432\u0435\u043B\u0438\u0447\u0438\u0442\u044C pH \u0438 \u0440\u0438\u0441\u043A \u043A\u0430\u0440\u0431\u043E\u043D\u0430\u0442\u043D\u044B\u0445 \u043E\u0442\u043B\u043E\u0436\u0435\u043D\u0438\u0439"
          ]
        },
        {
          id: "fluid_inhibitor_amine",
          type: "WellboreFluid",
          category: "corrosion_control",
          name: "Filming Amine Corrosion Inhibitor (\u041F\u043B\u0435\u043D\u043A\u043E\u043E\u0431\u0440\u0430\u0437\u0443\u044E\u0449\u0438\u0439 \u0438\u043D\u0433\u0438\u0431\u0438\u0442\u043E\u0440 \u043A\u043E\u0440\u0440\u043E\u0437\u0438\u0438)",
          aliases: [
            "corrosion inhibitor",
            "inhibitor",
            "\u0438\u043D\u0433\u0438\u0431\u0438\u0442\u043E\u0440 \u043A\u043E\u0440\u0440\u043E\u0437\u0438\u0438"
          ],
          description: "Oil-soluble, water-dispersible surfactant that forms a persistent hydrophobic protective film on steel surfaces, blocking CO2 and acid attack.",
          standards: [
            "NACE SP0106",
            "API RP 13B-1"
          ],
          density: {
            min_sg: 0.89,
            max_sg: 0.95,
            unit: "SG"
          },
          temperature_limit: {
            max_c: 200,
            unit: "C"
          },
          rheology: {
            pv_cp: "10 - 25",
            yp_lb100ft2: "N/A"
          },
          compatibility: {
            steels: "Protects carbon steel casing, tubing and tools by forming a chemical barrier.",
            elastomers: "Can swell standard NBR at high concentrations. Viton or HNBR recommended."
          },
          applications: [
            "Continuous treatment in production strings",
            "Batch treatment in packer fluids",
            "Additive for high-corrosive drilling and completion fluids"
          ],
          advantages: [
            "Provides >95% protection efficiency at low concentrations",
            "High temperature stability up to 200\xB0C",
            "Protects against sweet (CO2) corrosion"
          ],
          limitations: [
            "Requires constant replenishment",
            "Can cause emulsification issues if mixed with some hydrocarbon-based fluids"
          ],
          sources: [
            "NACE SP0106",
            "Well Integrity Handbook"
          ],
          description_ru: "\u041C\u0430\u0441\u043B\u043E\u0440\u0430\u0441\u0442\u0432\u043E\u0440\u0438\u043C\u044B\u0439, \u0432\u043E\u0434\u043E\u0434\u0438\u0441\u043F\u0435\u0440\u0433\u0438\u0440\u0443\u0435\u043C\u044B\u0439 \u043F\u043E\u0432\u0435\u0440\u0445\u043D\u043E\u0441\u0442\u043D\u043E-\u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u0440\u0435\u0430\u0433\u0435\u043D\u0442, \u0444\u043E\u0440\u043C\u0438\u0440\u0443\u044E\u0449\u0438\u0439 \u0443\u0441\u0442\u043E\u0439\u0447\u0438\u0432\u0443\u044E \u0433\u0438\u0434\u0440\u043E\u0444\u043E\u0431\u043D\u0443\u044E \u0437\u0430\u0449\u0438\u0442\u043D\u0443\u044E \u043F\u043B\u0435\u043D\u043A\u0443 \u043D\u0430 \u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0445 \u043F\u043E\u0432\u0435\u0440\u0445\u043D\u043E\u0441\u0442\u044F\u0445, \u0431\u043B\u043E\u043A\u0438\u0440\u0443\u044F \u0430\u0442\u0430\u043A\u0443 CO2 \u0438 \u043A\u0438\u0441\u043B\u043E\u0442.",
          compatibility_ru: {
            steels: "\u0417\u0430\u0449\u0438\u0449\u0430\u0435\u0442 \u043E\u0431\u0441\u0430\u0434\u043D\u0443\u044E \u043A\u043E\u043B\u043E\u043D\u043D\u0443, \u041D\u041A\u0422 \u0438 \u0441\u043A\u0432\u0430\u0436\u0438\u043D\u043D\u044B\u0439 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442 \u0437\u0430 \u0441\u0447\u0435\u0442 \u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u044F \u0441\u043F\u043B\u043E\u0448\u043D\u043E\u0433\u043E \u0445\u0438\u043C\u0438\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u0431\u0430\u0440\u044C\u0435\u0440\u0430.",
            elastomers: "\u041C\u043E\u0436\u0435\u0442 \u0432\u044B\u0437\u044B\u0432\u0430\u0442\u044C \u043D\u0430\u0431\u0443\u0445\u0430\u043D\u0438\u0435 \u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u043E\u0433\u043E NBR \u043F\u0440\u0438 \u0432\u044B\u0441\u043E\u043A\u0438\u0445 \u043A\u043E\u043D\u0446\u0435\u043D\u0442\u0440\u0430\u0446\u0438\u044F\u0445. \u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u0442\u0441\u044F Viton \u0438\u043B\u0438 HNBR."
          },
          applications_ru: [
            "\u041F\u043E\u0441\u0442\u043E\u044F\u043D\u043D\u043E\u0435 \u0434\u043E\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0432 \u044D\u043A\u0441\u043F\u043B\u0443\u0430\u0442\u0430\u0446\u0438\u043E\u043D\u043D\u0443\u044E \u043A\u043E\u043B\u043E\u043D\u043D\u0443",
            "\u041F\u0435\u0440\u0438\u043E\u0434\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u043F\u0430\u043A\u0435\u0440\u043D\u044B\u0445 \u0436\u0438\u0434\u043A\u043E\u0441\u0442\u0435\u0439",
            "\u0414\u043E\u0431\u0430\u0432\u043A\u0430 \u043A \u0430\u0433\u0440\u0435\u0441\u0441\u0438\u0432\u043D\u044B\u043C \u0431\u0443\u0440\u043E\u0432\u044B\u043C \u0440\u0430\u0441\u0442\u0432\u043E\u0440\u0430\u043C \u0438 \u0436\u0438\u0434\u043A\u043E\u0441\u0442\u044F\u043C \u0437\u0430\u043A\u0430\u043D\u0447\u0438\u0432\u0430\u043D\u0438\u044F"
          ],
          advantages_ru: [
            "\u041E\u0431\u0435\u0441\u043F\u0435\u0447\u0438\u0432\u0430\u0435\u0442 \u0441\u0442\u0435\u043F\u0435\u043D\u044C \u0437\u0430\u0449\u0438\u0442\u044B \u0441\u0442\u0430\u043B\u0438 \u0431\u043E\u043B\u0435\u0435 95% \u043F\u0440\u0438 \u043D\u0438\u0437\u043A\u0438\u0445 \u043A\u043E\u043D\u0446\u0435\u043D\u0442\u0440\u0430\u0446\u0438\u044F\u0445",
            "\u0412\u044B\u0441\u043E\u043A\u0430\u044F \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u043D\u0430\u044F \u0441\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u0434\u043E 200\xB0C",
            "\u042D\u0444\u0444\u0435\u043A\u0442\u0438\u0432\u043D\u043E \u0437\u0430\u0449\u0438\u0449\u0430\u0435\u0442 \u043E\u0442 \u0443\u0433\u043B\u0435\u043A\u0438\u0441\u043B\u043E\u0439 (CO2) \u043A\u043E\u0440\u0440\u043E\u0437\u0438\u0438"
          ],
          limitations_ru: [
            "\u0422\u0440\u0435\u0431\u0443\u0435\u0442 \u043F\u043E\u0441\u0442\u043E\u044F\u043D\u043D\u043E\u0433\u043E \u0432\u043E\u0441\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u044F \u043A\u043E\u043D\u0446\u0435\u043D\u0442\u0440\u0430\u0446\u0438\u0438 \u0440\u0435\u0430\u0433\u0435\u043D\u0442\u0430",
            "\u041C\u043E\u0436\u0435\u0442 \u0432\u044B\u0437\u044B\u0432\u0430\u0442\u044C \u044D\u043C\u0443\u043B\u044C\u0433\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043F\u0440\u0438 \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u0435 \u0441 \u043D\u0435\u043A\u043E\u0442\u043E\u0440\u044B\u043C\u0438 \u0443\u0433\u043B\u0435\u0432\u043E\u0434\u043E\u0440\u043E\u0434\u043D\u044B\u043C\u0438 \u0441\u0440\u0435\u0434\u0430\u043C\u0438"
          ]
        }
      ]
    };
  }
});

// scratch/run_formula_tests.js
var mockLocalStorage = /* @__PURE__ */ (() => {
  let store2 = {};
  return {
    getItem: (key) => store2[key] || null,
    setItem: (key, value) => {
      store2[key] = String(value);
    },
    removeItem: (key) => {
      delete store2[key];
    },
    clear: () => {
      store2 = {};
    },
    getLength: () => Object.keys(store2).length
  };
})();
Object.defineProperty(globalThis, "localStorage", {
  value: mockLocalStorage,
  writable: false,
  configurable: true
});
Object.defineProperty(globalThis, "window", {
  value: globalThis,
  configurable: true
});
globalThis.matchMedia = () => ({
  matches: false,
  addEventListener: () => {
  },
  removeEventListener: () => {
  }
});
globalThis.dispatchEvent = () => {
};
Object.defineProperty(globalThis, "document", {
  value: {
    documentElement: {
      style: {
        setProperty: () => {
        }
      },
      classList: {
        toggle: () => {
        }
      }
    },
    getElementsByTagName: () => [],
    querySelector: () => null
  },
  configurable: true
});
Object.defineProperty(globalThis, "navigator", {
  value: { userAgent: "NodeJS-Architecture-Test-Runner", language: "en-US" },
  configurable: true
});
var deepFreeze2 = (obj) => {
  if (obj === null || typeof obj !== "object") return obj;
  const propNames = Object.getOwnPropertyNames(obj);
  for (const name of propNames) {
    const value = obj[name];
    if (value && typeof value === "object") {
      deepFreeze2(value);
    }
  }
  return Object.freeze(obj);
};
async function runTestExecutionPlan() {
  console.log("Running HADALBORE_LAB Formula and Validation Tests...");
  console.log("======================================================================");
  try {
    const { formulas: formulas2 } = await Promise.resolve().then(() => (init_formulas(), formulas_exports));
    const { mockDb: mockDb2, populateMockDb: populateMockDb2, compareQueue: compareQueue2 } = await Promise.resolve().then(() => (init_mockDb(), mockDb_exports));
    const rawDb = await Promise.resolve().then(() => __toESM(require_mock_db(), 1));
    populateMockDb2(rawDb.default || rawDb);
    let passed = 0;
    let failed = 0;
    const assertTest = (description, condition) => {
      if (condition) {
        console.log(`\u{1F7E2} [PASS] ${description}`);
        passed++;
      } else {
        console.error(`\u{1F534} [FAIL] ${description}`);
        failed++;
      }
    };
    const p_hydro = formulas2.calculateHydrostatic(1200, 3e3);
    assertTest("#01: Hydrostatic Pressure Engine (Metric)", Math.abs(p_hydro - 35316) <= 100);
    const bf = formulas2.calculateBuoyancy(1200);
    assertTest("#02: Buoyancy Factor Module (Metric)", Math.abs(bf - 0.847) <= 0.01);
    const dv = formulas2.calculateThermalExpansion(100, 18e-5, 40);
    assertTest("#03: Thermal Expansion Algorithm", Math.abs(dv - 0.72) <= 0.01);
    const volume = formulas2.calculateVolume(0.152, 2500);
    assertTest("#04: Internal Capacity & Volume Calculation", Math.abs(volume - 45.36) <= 0.5);
    const vme = formulas2.calculateVonMisesStress(1e6, 3e7, 1e7, 0.1778, 0.1524);
    assertTest("#05: Triaxial Stress (Von Mises) Calculation", Math.abs(vme - 1684482273e-1) <= 1);
    const hb = formulas2.calculateHerschelBulkley(50, 30, 23, 15, 5, 3);
    assertTest("#06: Herschel-Bulkley Rheology Parameters", Math.abs(hb.tau0 - 0.511) <= 1e-3 && Math.abs(hb.n - 0.738) <= 0.01 && Math.abs(hb.K - 0.148) <= 0.01);
    const pw = formulas2.calculateBreakoutPressure(7e7, 5e7, 35e6, 4e7, 30);
    assertTest("#07: Borehole Breakout Pressure (Mohr-Coulomb)", Math.abs(pw - 475e5) <= 1);
    const frozenDb = deepFreeze2(mockDb2);
    try {
      frozenDb.equipment[0].maxPressure = 99999;
    } catch (e) {
    }
    assertTest("#10: Database Immutability Guard (Test A)", frozenDb.equipment[0].maxPressure !== 99999);
    const frozenQueue = deepFreeze2(compareQueue2);
    try {
      frozenQueue.push({ id: "corrupted_item" });
    } catch (e) {
    }
    assertTest("#11: Compare Queue Immutability Guard (Test B)", frozenQueue.length === 0 || !frozenQueue.some((i) => i.id === "corrupted_item"));
    const expectedKeys = ["equipment", "fluids", "metadata"];
    const hasValidSchema = expectedKeys.every((key) => Object.hasOwn(mockDb2, key));
    assertTest("#12: Schema Drift Detection (Test C)", hasValidSchema);
    const hasOldIdentity = JSON.stringify(mockDb2).includes("omnilab") || JSON.stringify(mockDb2).includes("nikolai");
    assertTest("#16: Database Integrity Seal Check (Test G)", !hasOldIdentity);
    console.log("======================================================================");
    console.log(`>> Validation Report Summary: ${failed === 0 ? "PASS" : "FAIL"}`);
    console.log(`>> Execution Metrics: Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
    console.log("======================================================================");
    process.exit(failed === 0 ? 0 : 1);
  } catch (error) {
    console.error("\u{1F4A5} Critical failure inside Test Execution Suite:");
    console.error(error);
    process.exit(1);
  }
}
runTestExecutionPlan();
