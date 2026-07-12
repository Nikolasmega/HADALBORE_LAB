import { store } from './State.js';
import { EngineeringRules } from './EngineeringRules.js';
import AppLogger from './AppLogger.js';

/**
 * SkillsOrchestrator.js
 * Dynamically scans and executes rules and calculations defined in local Obsidian Vault markdown files.
 * Combines static compilation rules with live dynamic conditions without codebase changes.
 */
export class SkillsOrchestrator {
  /**
   * Helper to execute dynamic condition string safely
   */
  static safeEvalCondition(condition, context) {
    try {
      // Create a function that accepts inputs, outputs, and rec as parameters
      const evalFunc = new Function('inputs', 'outputs', 'rec', `
        try {
          return (${condition});
        } catch (e) {
          return false;
        }
      `);
      return evalFunc(context.inputs || {}, context.outputs || {}, context.rec || {});
    } catch (err) {
      AppLogger.error('Failed to parse dynamic condition: ' + condition, {}, err);
      return false;
    }
  }

  /**
   * Evaluates safety/design rules against a database record.
   * Merges static rules with dynamic Obsidian database rules.
   * 
   * @param {Object} rec - Database record 
   * @param {string} lang - Active language ('ru' | 'en')
   * @returns {Array<{type: string, text: string}>} Array of warnings/cautions/infos
   */
  static evaluateRecord(rec, lang) {
    // 1. Get static findings
    const findings = EngineeringRules.evaluateRecord(rec, lang) || [];
    if (!rec) return findings;

    // 2. Scan for dynamic rules in Obsidian
    const { obsidianNotes } = store.getState();
    const isRu = lang === 'ru';

    if (obsidianNotes && obsidianNotes.length > 0) {
      obsidianNotes.forEach(note => {
        const fm = note.frontmatter || {};
        if (fm.type === 'rules' && fm.condition) {
          // If condition is applicable to records (doesn't require outputs/inputs)
          if (fm.condition.includes('rec.')) {
            const matched = this.safeEvalCondition(fm.condition, { rec });
            if (matched) {
              findings.push({
                type: fm.severity || 'warning',
                text: isRu 
                  ? (fm.message_ru || fm.message_en || note.title)
                  : (fm.message_en || fm.message_ru || note.title)
              });
            }
          }
        }
      });
    }

    return findings;
  }

  /**
   * Evaluates safety/design rules against dynamic calculator outputs.
   * Merges static rules with dynamic Obsidian calculator rules.
   * 
   * @param {string} calcType - Calculator identifier (e.g. 'hydrostatic', 'corrosion')
   * @param {Object} inputs - Key-value pair of inputs
   * @param {Object} outputs - Key-value pair of calculated outputs
   * @param {string} lang - Active language ('ru' | 'en')
   * @returns {Array<{type: string, text: string}>} Array of warnings/cautions/infos
   */
  static evaluateCalculation(calcType, inputs, outputs, lang) {
    // 1. Get static findings
    const findings = EngineeringRules.evaluateCalculation(calcType, inputs, outputs, lang) || [];

    // 2. Scan for dynamic rules in Obsidian
    const { obsidianNotes } = store.getState();
    const isRu = lang === 'ru';

    if (obsidianNotes && obsidianNotes.length > 0) {
      obsidianNotes.forEach(note => {
        const fm = note.frontmatter || {};
        if (fm.type === 'rules' && fm.calc_type === calcType && fm.condition) {
          const matched = this.safeEvalCondition(fm.condition, { inputs, outputs });
          if (matched) {
            findings.push({
              type: fm.severity || 'warning',
              text: isRu
                ? (fm.message_ru || fm.message_en || note.title)
                : (fm.message_en || fm.message_ru || note.title)
            });
          }
        }
      });
    }

    return findings;
  }
}

export default SkillsOrchestrator;
