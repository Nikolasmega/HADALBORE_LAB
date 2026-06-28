import en from '../i18n/en.json';
import ru from '../i18n/ru.json';
import { store } from '../core/State.js';

const dictionaries = { en, ru };

class I18nManager {
  /**
   * Translates a key path using the active language dictionary.
   * Supports nested paths (e.g. 'nav.tubulars') and placeholder interpolation.
   * 
   * @param {string} path - The dictionary path (e.g., 'nav.tubulars' or 'calcs.result')
   * @param {Object} [params] - Optional variables for template interpolation (e.g., { val: 123 })
   * @returns {string|any} Resolved translation string or the original path as a fallback
   */
  t(path, params = {}) {
    const { lang, localizationDebugMode } = store.getState();
    const isDebug = localizationDebugMode;
    const dictionary = dictionaries[lang] || dictionaries.en;

    // Resolve nested paths (e.g. "columns.wall_thickness")
    const value = path.split('.').reduce((accumulator, part) => {
      return accumulator && accumulator[part] !== undefined ? accumulator[part] : null;
    }, dictionary);

    if (value === null) {
      // Fallback: search English dictionary as a safety net
      if (dictionary !== dictionaries.en) {
        const enValue = path.split('.').reduce((accumulator, part) => {
          return accumulator && accumulator[part] !== undefined ? accumulator[part] : null;
        }, dictionaries.en);
        if (enValue !== null) {
          const res = this.interpolate(enValue, params);
          return isDebug ? `🌐[${res}]` : res;
        }
      }
      return isDebug ? `⚠️[${path}]⚠️` : path;
    }

    if (typeof value !== 'string') {
      return value;
    }

    const res = this.interpolate(value, params);
    return isDebug ? `🌐[${res}]` : res;
  }

  /**
   * Helper to replace {placeholder} with values.
   */
  interpolate(template, params) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }
}

export const i18n = new I18nManager();
export default i18n;
