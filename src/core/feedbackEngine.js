// feedbackEngine.js
// Collects and sends feedback, generating diagnostic packages if offline

import { DiagnosticExport } from './diagnosticExport.js';
import AppLogger from './AppLogger.js';

export class FeedbackEngine {
  /**
   * Processes feedback submission.
   * 
   * @param {string} feedbackText - The user-provided issue details.
   * @returns {Promise<{ success: boolean, mode: 'online' | 'offline', reason?: string }>}
   */
  static async sendFeedback(feedbackText) {
    if (!feedbackText || !feedbackText.trim()) {
      return { success: false, mode: 'online', reason: 'Feedback text is empty' };
    }

    const isOnline = typeof navigator !== 'undefined' && navigator.onLine;

    // Collect feedback details with system snapshot metadata
    const snapshot = await DiagnosticExport.generateSnapshot();
    const payload = {
      feedback: feedbackText,
      timestamp: new Date().toISOString(),
      metadata: {
        appVersion: snapshot.appVersion,
        schemaVersion: snapshot.schemaVersion,
        cacheVersion: snapshot.cacheVersion,
        indexedDbStatus: snapshot.indexedDbStatus,
        activeModule: snapshot.module,
        deviceId: typeof window !== 'undefined' ? localStorage.getItem('hadalbore_device_id') || '—' : '—'
      }
    };

    AppLogger.info('Feedback submission initiated.', { isOnline });

    if (isOnline) {
      try {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok || response.status === 200 || response.status === 201) {
          AppLogger.info('Feedback sent successfully to server.');
          return { success: true, mode: 'online' };
        } else {
          // If server returned error code, treat as online delivery failure but log it
          AppLogger.warn(`Feedback POST returned status ${response.status}. Triggering fallback diagnostic download.`);
          await DiagnosticExport.exportJson();
          return { success: true, mode: 'offline', reason: `Server error: ${response.status}. Diagnostics downloaded.` };
        }
      } catch (err) {
        // Fetch failed (e.g. no backend on static hosting). Fallback to offline diagnostics download.
        AppLogger.warn('Feedback POST failed due to connection error. Triggering offline diagnostic download.', {}, err);
        await DiagnosticExport.exportJson();
        return { success: true, mode: 'offline', reason: 'Connection failed. Diagnostics downloaded.' };
      }
    } else {
      // Hard offline mode
      AppLogger.info('Device is offline. Packaging feedback into local diagnostic download.');
      
      // We can append the feedback text to the log history so it appears in the downloaded TXT report!
      AppLogger.info(`Offline Feedback User Input: "${feedbackText}"`);
      
      // Trigger download
      await DiagnosticExport.exportJson();
      return { success: true, mode: 'offline' };
    }
  }
}

export default FeedbackEngine;
