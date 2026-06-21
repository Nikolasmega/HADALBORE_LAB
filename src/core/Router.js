import { store } from './State.js';

class Router {
  constructor() {
    this.routes = ['home', 'tubulars', 'threads', 'elastomers', 'steel-grades', 'standards', 'running-data', 'system-health', 'failures', 'notes'];
    
    // Sync hash with store changes
    store.subscribe((state) => {
      const currentHash = window.location.hash.replace('#/', '');
      const targetHash = state.activeModule === 'home' ? '' : `/${state.activeModule}`;
      
      if (currentHash !== targetHash.replace('/', '')) {
        window.location.hash = targetHash;
      }
    });

    // Sync store with hash changes
    window.addEventListener('hashchange', () => this.handleHashChange());
  }

  init() {
    this.handleHashChange();
  }

  handleHashChange() {
    const rawHash = window.location.hash.replace('#/', '') || 'home';
    const cleanHash = rawHash.split('?')[0]; // discard query params if any
    
    if (this.routes.includes(cleanHash)) {
      store.setState({ activeModule: cleanHash });
    } else {
      window.location.hash = '';
      store.setState({ activeModule: 'home' });
    }
  }
}

export const router = new Router();
export default router;
