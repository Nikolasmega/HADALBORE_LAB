// usageStats.js
// Tracks local PWA usage parameters offline without external analytics

export class UsageStats {
  static init() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    
    const now = new Date();
    
    // 1. Installed since (first run)
    let installedSince = localStorage.getItem('hadalbore_installed_since');
    if (!installedSince) {
      installedSince = now.toISOString();
      localStorage.setItem('hadalbore_installed_since', installedSince);
    }
    
    // 2. Launches count
    let launches = parseInt(localStorage.getItem('hadalbore_launches') || '0', 10);
    launches += 1;
    localStorage.setItem('hadalbore_launches', launches.toString());
    
    // 3. Session count (using sessionStorage to define sessions)
    let sessions = parseInt(localStorage.getItem('hadalbore_sessions') || '0', 10);
    if (!sessionStorage.getItem('hadalbore_session_active')) {
      sessions += 1;
      localStorage.setItem('hadalbore_sessions', sessions.toString());
      sessionStorage.setItem('hadalbore_session_active', 'true');
    }
    
    // 4. Days active
    let daysActiveStr = localStorage.getItem('hadalbore_days_active_dates') || '[]';
    let daysActiveArray = [];
    try {
      daysActiveArray = JSON.parse(daysActiveStr);
    } catch (e) {
      daysActiveArray = [];
    }
    const todayDateStr = now.toISOString().split('T')[0];
    if (!daysActiveArray.includes(todayDateStr)) {
      daysActiveArray.push(todayDateStr);
      localStorage.setItem('hadalbore_days_active_dates', JSON.stringify(daysActiveArray));
    }
    
    // 5. Unique Device ID (short - 8 chars)
    let deviceId = localStorage.getItem('hadalbore_device_id');
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2, 10).toUpperCase();
      localStorage.setItem('hadalbore_device_id', deviceId);
    }
  }
  
  static getStats() {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {
        launches: 0,
        daysActive: 0,
        installedSince: '—',
        deviceId: '—',
        sessions: 0
      };
    }
    
    const installed = localStorage.getItem('hadalbore_installed_since');
    let daysCount = 0;
    try {
      daysCount = JSON.parse(localStorage.getItem('hadalbore_days_active_dates') || '[]').length;
    } catch (e) {}
    
    return {
      launches: parseInt(localStorage.getItem('hadalbore_launches') || '0', 10),
      daysActive: daysCount || 1,
      installedSince: installed ? new Date(installed).toLocaleDateString() : '—',
      deviceId: localStorage.getItem('hadalbore_device_id') || '—',
      sessions: parseInt(localStorage.getItem('hadalbore_sessions') || '0', 10)
    };
  }
}

export default UsageStats;
