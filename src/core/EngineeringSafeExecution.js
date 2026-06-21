import AppLogger from './AppLogger.js';

/**
 * EngineeringSafeExecution.js
 * Safety wrapper for running calculations. Catches errors, generates correlation IDs,
 * and logs details to AppLogger to prevent UI crashes.
 */
export class EngineeringSafeExecution {
  /**
   * Safely execute an engineering calculation function.
   * 
   * @param {Function} fn - Calculation function to execute
   * @param {*} fallbackValue - Fallback return value in case of error
   * @param {Object} context - Metadata about the calculation context (inputs, calcName)
   * @returns {{ value: *, error: string|null, correlationId: string, success: boolean }}
   */
  static execute(fn, fallbackValue = null, context = {}) {
    const correlationId = 'calc-' + Math.random().toString(36).substring(2, 11).toUpperCase();
    
    try {
      // Execute the calculation
      const result = fn();
      
      // Log successful calculation trace
      AppLogger.info(`Calculation executed successfully: ${context.calculatorName || 'unknown'}`, {
        correlationId,
        ...context
      });

      return {
        value: result,
        error: null,
        correlationId,
        success: true
      };
    } catch (err) {
      // Log the failure details
      AppLogger.error(`Calculation failed: ${context.calculatorName || 'unknown'}. ID: ${correlationId}`, {
        correlationId,
        ...context
      }, err);

      return {
        value: fallbackValue,
        error: err.message,
        correlationId,
        success: false
      };
    }
  }
}

export default EngineeringSafeExecution;
