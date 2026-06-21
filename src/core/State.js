import { freezeCompareInput } from './LibraryFreezeGuard.js';
import versionJson from '../data/version.json';

// Centralized state manager for HADALBORE LAB SPA
class State {
  constructor() {
    this.listeners = [];
    
    // Set initial state from localStorage or system defaults
    const initialLang = localStorage.getItem('lang') || (navigator.language.startsWith('ru') ? 'ru' : 'en');
    const initialTheme = localStorage.getItem('theme') || 'system';
    const initialUnit = localStorage.getItem('unit_system') || (initialLang === 'ru' ? 'metric' : 'imperial');

    // Defensively load compare queue to prevent corruptions or mixed categories
    let initialCompareQueue = [];
    try {
      const parsed = JSON.parse(localStorage.getItem('hadalbore_compare_queue') || '[]');
      if (Array.isArray(parsed)) {
        const ids = new Set();
        const cleaned = parsed.filter(item => {
          if (!item || !item.id || !item.module) return false;
          if (ids.has(item.id)) return false;
          ids.add(item.id);
          return true;
        });
        if (cleaned.length > 0) {
          const firstModule = cleaned[0].module;
          initialCompareQueue = cleaned.filter(item => item.module === firstModule).slice(0, 4);
        }
      }
    } catch (e) {
      initialCompareQueue = [];
    }

    const storedMode = localStorage.getItem('hadalbore_view_mode');
    const storedFieldMode = localStorage.getItem('hadalbore_field_mode') === 'true';
    // If field mode was active on last session, restore 'field' viewMode; else default to 'engineering'
    const initialViewMode = storedFieldMode
      ? 'field'
      : (storedMode === 'reference' ? 'engineering' : storedMode) || 'engineering';

    // Expanded properties for Sprint 1.2
    this.state = {
      lang: initialLang,
      theme: initialTheme,
      unitSystem: initialUnit,
      viewMode: initialViewMode, // field (Field View) | engineering (Technical View)
      activeModule: 'home',
      searchQuery: '',
      feedbacks: JSON.parse(localStorage.getItem('feedback_requests') || '[]'),
      updateAvailable: false,
      
      // Reactive state variables for local analytics
      favorites: JSON.parse(localStorage.getItem('hadalbore_favorites') || '[]'),
      recentlyViewed: JSON.parse(localStorage.getItem('hadalbore_recently_viewed') || '[]'),
      pinnedModules: JSON.parse(localStorage.getItem('hadalbore_pinned_modules') || '[]'),
      releaseNotesRead: localStorage.getItem('hadalbore_release_notes_read') === 'true',
      searchHistory: JSON.parse(localStorage.getItem('hadalbore_search_history') || '[]'),
      preferredCategories: JSON.parse(localStorage.getItem('hadalbore_preferred_categories') || '[]'),
      offlineMode: localStorage.getItem('hadalbore_offline_mode') === 'true',
      sidebarCollapsed: localStorage.getItem('hadalbore_sidebar_collapsed') === 'true',
      mostOpened: JSON.parse(localStorage.getItem('hadalbore_most_opened') || '{}'),
      compareQueue: initialCompareQueue,
      schemaCorrupted: false,
      dbHash: '',
      currentVersion: versionJson.buildVersion,
      fieldMode: localStorage.getItem('hadalbore_field_mode') === 'true',
      bootStatus: 'BOOT_OK',
      fontScale: parseFloat(localStorage.getItem('hadalbore_font_scale') || '1.0'),
      obsidianNotes: JSON.parse(localStorage.getItem('hadalbore_obsidian_notes') || '[]'),
      obsidianConnected: localStorage.getItem('hadalbore_obsidian_connected') === 'true',
      obsidianPermissionRequired: false
    };

    // Keep localStorage synchronized
    localStorage.setItem('lang', this.state.lang);
    localStorage.setItem('theme', this.state.theme);
    localStorage.setItem('unit_system', this.state.unitSystem);
    localStorage.setItem('hadalbore_view_mode', this.state.viewMode);
    localStorage.setItem('hadalbore_field_mode', this.state.fieldMode.toString());

    this.initSystemThemeListener();
    this.applyTheme(this.state.theme);
    this.applyFontScale(this.state.fontScale);
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  setState(updates) {
    if (updates && updates.viewMode === 'reference') {
      updates.viewMode = 'engineering';
    }

    // Guard: Prevent redundant updates if no state variables changed
    let hasChanges = false;
    for (const key in updates) {
      if (this.state[key] !== updates[key]) {
        hasChanges = true;
        break;
      }
    }
    if (!hasChanges) return;

    this.state = { ...this.state, ...updates };

    // Persist values
    if ('lang' in updates) localStorage.setItem('lang', this.state.lang);
    if ('theme' in updates) {
      localStorage.setItem('theme', this.state.theme);
      this.applyTheme(this.state.theme);
    }
    if ('unitSystem' in updates) localStorage.setItem('unit_system', this.state.unitSystem);
    if ('viewMode' in updates) localStorage.setItem('hadalbore_view_mode', this.state.viewMode);
    if ('fieldMode' in updates) localStorage.setItem('hadalbore_field_mode', this.state.fieldMode.toString());
    if ('fontScale' in updates) {
      localStorage.setItem('hadalbore_font_scale', this.state.fontScale.toString());
      this.applyFontScale(this.state.fontScale);
    }
    if ('feedbacks' in updates) localStorage.setItem('feedback_requests', JSON.stringify(this.state.feedbacks));
    if ('obsidianNotes' in updates) localStorage.setItem('hadalbore_obsidian_notes', JSON.stringify(this.state.obsidianNotes));
    if ('obsidianConnected' in updates) localStorage.setItem('hadalbore_obsidian_connected', this.state.obsidianConnected.toString());
    
    // Persist analytics parameters
    if ('favorites' in updates) localStorage.setItem('hadalbore_favorites', JSON.stringify(this.state.favorites));
    if ('recentlyViewed' in updates) localStorage.setItem('hadalbore_recently_viewed', JSON.stringify(this.state.recentlyViewed));
    if ('pinnedModules' in updates) localStorage.setItem('hadalbore_pinned_modules', JSON.stringify(this.state.pinnedModules));
    if ('releaseNotesRead' in updates) localStorage.setItem('hadalbore_release_notes_read', this.state.releaseNotesRead.toString());
    if ('searchHistory' in updates) localStorage.setItem('hadalbore_search_history', JSON.stringify(this.state.searchHistory));
    if ('preferredCategories' in updates) localStorage.setItem('hadalbore_preferred_categories', JSON.stringify(this.state.preferredCategories));
    if ('offlineMode' in updates) localStorage.setItem('hadalbore_offline_mode', this.state.offlineMode.toString());
    if ('sidebarCollapsed' in updates) localStorage.setItem('hadalbore_sidebar_collapsed', this.state.sidebarCollapsed.toString());
    if ('mostOpened' in updates) localStorage.setItem('hadalbore_most_opened', JSON.stringify(this.state.mostOpened));
    if ('compareQueue' in updates) localStorage.setItem('hadalbore_compare_queue', JSON.stringify(this.state.compareQueue));

    // Notify all subscribers
    this.listeners.forEach(listener => listener(this.state));
  }

  // Compare Actions
  addToCompare(record, moduleType) {
    const queue = [...this.state.compareQueue];
    
    // Check if the item belongs to the same module/type as existing items
    if (queue.length > 0 && queue[0].module !== moduleType) {
      this.triggerToast({
        en: "Can only compare items of the same type",
        ru: "Можно сравнивать только элементы одного типа"
      });
      return false;
    }

    // Check if queue has reached maximum capacity of 4
    if (queue.length >= 4) {
      this.triggerToast({
        en: "Maximum 4 items can be compared",
        ru: "Можно сравнивать максимум 4 элемента"
      });
      return false;
    }

    // Check for duplicates
    if (queue.some(item => item.id === record.id)) {
      return false;
    }

    const frozenRecord = freezeCompareInput({ ...record, module: moduleType });
    queue.push(frozenRecord);
    this.setState({ compareQueue: queue });
    return true;
  }

  removeFromCompare(recordId) {
    const queue = this.state.compareQueue.filter(item => item.id !== recordId);
    this.setState({ compareQueue: queue });
  }

  clearCompare() {
    this.setState({ compareQueue: [] });
  }

  triggerToast(messages) {
    const event = new CustomEvent('hadalbore-toast', { detail: messages });
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
    // Remove duplicate to put the latest view at the top
    recentlyViewed = recentlyViewed.filter(item => item.id !== recordId);
    recentlyViewed.unshift({ id: recordId, module: moduleType, timestamp: new Date().toISOString() });
    recentlyViewed = recentlyViewed.slice(0, 5); // store last 5 views
    this.setState({ recentlyViewed });
  }

  trackSearch(query) {
    if (!query || !query.trim()) return;
    if (this.state.searchHistory[0] === query) return;
    let searchHistory = [...this.state.searchHistory];
    searchHistory = searchHistory.filter(q => q !== query);
    searchHistory.unshift(query);
    searchHistory = searchHistory.slice(0, 10);
    this.setState({ searchHistory });
  }

  initSystemThemeListener() {
    const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
    darkMedia.addEventListener('change', () => {
      if (this.state.theme === 'system') {
        this.applyTheme('system');
      }
    });
  }

  applyTheme(theme) {
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    
    const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
    if (metaColorScheme) {
      metaColorScheme.content = isDark ? 'dark' : 'light';
    }
  }

  applyFontScale(scale) {
    const validScale = [0.9, 1.0, 1.1, 1.25].includes(scale) ? scale : 1.0;
    // Apply as a CSS custom property so all rem-based values scale proportionally
    document.documentElement.style.setProperty('--font-scale', validScale.toString());
    document.documentElement.style.fontSize = `${validScale * 100}%`;
  }
}


export const store = new State();
export default store;
