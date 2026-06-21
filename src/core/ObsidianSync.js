import AppLogger from './AppLogger.js';

function openVaultDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HadalboreVaultDB', 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('handles')) {
        db.createObjectStore('handles');
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Saves the Directory Handle to IndexedDB.
 */
export async function saveDirectoryHandle(handle) {
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('handles', 'readwrite');
    const store = tx.objectStore('handles');
    const req = store.put(handle, 'obsidian_vault_handle');
    req.onsuccess = () => {
      AppLogger.info('Obsidian directory handle saved to IndexedDB.');
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Loads the Directory Handle from IndexedDB.
 */
export async function loadDirectoryHandle() {
  if (typeof window === 'undefined' || !window.indexedDB) return null;
  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('handles', 'readonly');
      const store = tx.objectStore('handles');
      const req = store.get('obsidian_vault_handle');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    AppLogger.error('Failed to load directory handle:', {}, err);
    return null;
  }
}

/**
 * Clears the Directory Handle from IndexedDB.
 */
export async function clearDirectoryHandle() {
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('handles', 'readwrite');
    const store = tx.objectStore('handles');
    const req = store.delete('obsidian_vault_handle');
    req.onsuccess = () => {
      AppLogger.info('Obsidian directory handle cleared.');
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Verifies read permission for a directory handle.
 */
export async function verifyPermission(handle, opts = { mode: 'read' }) {
  if (!handle) return false;
  try {
    const state = await handle.queryPermission(opts);
    if (state === 'granted') return true;
    
    const requestState = await handle.requestPermission(opts);
    return requestState === 'granted';
  } catch (err) {
    AppLogger.error('Permission verification failed:', {}, err);
    return false;
  }
}

/**
 * Recursively scans a Directory Handle and extracts notes metadata/content.
 */
export async function scanDirectory(dirHandle, path = '') {
  const notes = [];
  try {
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file') {
        if (entry.name.endsWith('.md')) {
          const file = await entry.getFile();
          const content = await file.text();
          
          // Extract YAML frontmatter
          let frontmatter = {};
          let bodyContent = content;
          const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
          if (frontmatterMatch) {
            bodyContent = content.slice(frontmatterMatch[0].length).trim();
            const yamlStr = frontmatterMatch[1];
            yamlStr.split('\n').forEach(line => {
              const colonIdx = line.indexOf(':');
              if (colonIdx !== -1) {
                const key = line.slice(0, colonIdx).trim();
                let val = line.slice(colonIdx + 1).trim();
                // strip quotes
                if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                  val = val.slice(1, -1);
                } else if (val === 'true') {
                  val = true;
                } else if (val === 'false') {
                  val = false;
                } else if (!isNaN(val) && val !== '') {
                  val = Number(val);
                }
                frontmatter[key] = val;
              }
            });
          }

          // Extract note title from first markdown header, or fallback to file name
          let title = entry.name.replace(/\.md$/i, '');
          const headingMatch = bodyContent.match(/^#\s+(.+)$/m);
          if (headingMatch) {
            title = headingMatch[1].trim();
          }
          if (frontmatter.name) {
             title = frontmatter.name;
          }

          const relativePath = path ? `${path}/${entry.name}` : entry.name;
          const isDatabaseRecord = path.includes('Data') || path.includes('База_данных');
          
          notes.push({
            id: frontmatter.id || entry.name.replace(/\.md$/i, '').toLowerCase().replace(/\s+/g, '_'),
            name: title, // Used as title fallback
            title,
            path: relativePath,
            content: bodyContent,
            rawContent: content,
            frontmatter,
            isDatabaseRecord
          });
        }
      } else if (entry.kind === 'directory') {
        // Skip hidden folders (e.g. .obsidian, .git)
        if (entry.name.startsWith('.')) continue;
        
        const subDirNotes = await scanDirectory(entry, path ? `${path}/${entry.name}` : entry.name);
        notes.push(...subDirNotes);
      }
    }
  } catch (err) {
    AppLogger.error(`Error scanning directory at path "${path}":`, {}, err);
  }
  return notes;
}
