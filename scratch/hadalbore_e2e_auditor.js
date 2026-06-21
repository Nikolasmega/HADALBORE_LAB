import puppeteer from 'puppeteer';

const url = 'http://localhost:5173/';

console.log('Starting Headless E2E Visual, Performance & Readability Audit...');
console.log('===================================================================');

// Helper to calculate contrast ratio according to WCAG AA guidelines
function getLuminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

async function runE2EAudit() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  let passed = 0;
  let failed = 0;
  const consoleErrors = [];

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const txt = msg.text();
      if (!txt.includes('net::ERR_INTERNET_DISCONNECTED') && !txt.includes('net::ERR_CONNECTION_REFUSED')) {
        consoleErrors.push(txt);
      }
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
  });

  function assertCheck(description, condition) {
    if (condition) {
      console.log(`🟢 [PASS] ${description}`);
      passed++;
    } else {
      console.error(`🔴 [FAIL] ${description}`);
      failed++;
    }
  }

  try {
    // 1. Load page and set to engineering and dark theme mode in localStorage
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.setItem('hadalbore_view_mode', 'engineering');
      localStorage.setItem('hadalbore_field_mode', 'false');
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('hadalbore_user_registered', 'true');
      localStorage.setItem('hadalbore_lab_accepted_notice', 'true');
    });
    // Reload page to apply engineering and dark modes
    await page.reload({ waitUntil: 'networkidle2' });

    // Wait for the app-content container to be populated
    await page.waitForSelector('#app-content');
    
    // Give some time for DB initialization
    await new Promise(r => setTimeout(r, 2000));

    const loadTime = await page.evaluate(() => {
      const perf = window.performance.timing;
      return perf.loadEventEnd - perf.navigationStart;
    });
    
    assertCheck(`Page loaded successfully in ${loadTime}ms`, loadTime < 8000);
    assertCheck('No initial console errors or exceptions', consoleErrors.length === 0);

    // Accept notice dialog if visible
    const noticeDialogExists = await page.evaluate(() => {
      const dialog = document.getElementById('login-notice-dialog');
      return dialog && dialog.open && !!document.getElementById('login-consent-checkbox');
    });
    if (noticeDialogExists) {
      console.log('  - Notice dialog found, accepting consent...');
      await page.click('#login-consent-checkbox');
      await page.click('#login-consent-continue-btn');
      await new Promise(r => setTimeout(r, 500));
    }

    // 2. Tab Navigation & Click-Through
    // Sidebar modules: home, tubulars, threads, elastomers, running-data, system-health
    const modules = ['home', 'tubulars', 'threads', 'elastomers', 'running-data', 'system-health'];
    let tabSwitchIssue = false;
    
    for (const mod of modules) {
      const tabId = `#sidebar-nav-${mod}`;
      const tabExists = await page.evaluate((selector) => !!document.querySelector(selector), tabId);
      if (tabExists) {
        const clickStart = Date.now();
        await page.click(tabId);
        await new Promise(r => setTimeout(r, 500)); // wait for transition
        const clickLatency = Date.now() - clickStart - 500;
        
        if (clickLatency > 200) {
          console.warn(`  - Performance warning: Tab "${mod}" click latency is ${clickLatency}ms`);
        }
        
        // Check if active view is rendered
        const viewRendered = await page.evaluate(() => {
          const content = document.getElementById('app-content');
          return content && content.innerHTML.trim().length > 0;
        });
        
        if (!viewRendered) {
          console.error(`  - Rendering error: Tab "${mod}" content is empty`);
          tabSwitchIssue = true;
        }
      } else {
        console.error(`  - Tab not found: ${tabId}`);
        tabSwitchIssue = true;
      }
    }
    assertCheck('Sidebar navigation and tab-switching latency', !tabSwitchIssue);

    // 3. Contrast & Accessibility Audit (WCAG AA Compliance)
    const wcagAudit = await page.evaluate(() => {
      function getLuminance(r, g, b) {
        const a = [r, g, b].map(v => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
      }

      function colorToRGBA(color) {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        return Array.from(ctx.getImageData(0, 0, 1, 1).data);
      }

      function getContrast(rgba1, rgba2) {
        const l1 = getLuminance(rgba1[0], rgba1[1], rgba1[2]);
        const l2 = getLuminance(rgba2[0], rgba2[1], rgba2[2]);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      }

      function getActualBackgroundColor(el) {
        let currentEl = el;
        while (currentEl) {
          const bg = window.getComputedStyle(currentEl).backgroundColor;
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
            return bg;
          }
          currentEl = currentEl.parentElement;
        }
        const isDark = document.documentElement.classList.contains('dark');
        return isDark ? 'rgb(24, 24, 27)' : 'rgb(255, 255, 255)';
      }

      const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, span, td, button, select'));
      const criticalFailuresList = [];
      const moderateFailuresList = [];
      let criticalContrastFailures = 0;
      let moderateContrastWarnings = 0;
      let fontNameIssue = false;
      let rawColorIssue = false;

      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const bg = getActualBackgroundColor(el);

        const rgba1 = colorToRGBA(color);
        const rgba2 = colorToRGBA(bg);
        const ratio = getContrast(rgba1, rgba2);
        
        if (el.offsetWidth > 0 && el.offsetHeight > 0 && el.innerText.trim().length > 0) {
          if (ratio < 3.0) {
            criticalContrastFailures++;
            criticalFailuresList.push({
              tag: el.tagName,
              text: el.innerText.substring(0, 30),
              classes: el.className,
              color,
              bg,
              ratio: ratio.toFixed(2)
            });
          } else if (ratio < 4.5) {
            moderateContrastWarnings++;
            moderateFailuresList.push({
              tag: el.tagName,
              text: el.innerText.substring(0, 30),
              classes: el.className,
              color,
              bg,
              ratio: ratio.toFixed(2)
            });
          }

          // Font family check
          const font = styles.fontFamily.toLowerCase();
          if (!font.includes('outfit') && !font.includes('inter') && !font.includes('roboto') && !font.includes('mono')) {
            fontNameIssue = true;
          }

          // Generic pure colors check
          const rgb = rgba1;
          if ((rgb[0] === 255 && rgb[1] === 0 && rgb[2] === 0) || (rgb[0] === 0 && rgb[1] === 0 && rgb[2] === 255)) {
            if (!el.className.includes('red') && !el.className.includes('rose') && !el.className.includes('alert')) {
              rawColorIssue = true;
            }
          }
        }
      });

      return { criticalContrastFailures, criticalFailuresList, moderateContrastWarnings, moderateFailuresList, fontNameIssue, rawColorIssue };
    });

    if (wcagAudit.criticalContrastFailures > 0) {
      console.log('  - Detailed critical contrast failures (<3.0:1):');
      wcagAudit.criticalFailuresList.slice(0, 15).forEach((f, i) => {
        console.log(`    [${i+1}] Tag: <${f.tag}>, Text: "${f.text}", Classes: "${f.classes}", Color: ${f.color}, BG: ${f.bg}, Ratio: ${f.ratio}:1`);
      });
    }

    if (wcagAudit.moderateContrastWarnings > 0) {
      console.log('  - Detailed moderate contrast warnings (3.0-4.5:1):');
      wcagAudit.moderateFailuresList.forEach((f, i) => {
        console.log(`    [${i+1}] Tag: <${f.tag}>, Text: "${f.text.replace(/\s+/g, ' ')}", Classes: "${f.classes}", Color: ${f.color}, BG: ${f.bg}, Ratio: ${f.ratio}:1`);
      });
    }

    assertCheck(`WCAG Critical Contrast audit (<3.0:1 failures: ${wcagAudit.criticalContrastFailures})`, wcagAudit.criticalContrastFailures === 0);
    console.log(`  - Info: WCAG Moderate Contrast warnings (3.0-4.5:1): ${wcagAudit.moderateContrastWarnings}`);
    assertCheck('Font consistency check (Outfit, Inter, Roboto present)', !wcagAudit.fontNameIssue);
    assertCheck('No browser generic pure colors in non-badge texts', !wcagAudit.rawColorIssue);

    // 4. Visual Overlap & Layout Check
    const layoutAudit = await page.evaluate(() => {
      const children = Array.from(document.querySelectorAll('#app-content *'));
      let clippedOrOverlapped = false;
      children.forEach(el => {
        if (el.scrollWidth > el.clientWidth && el.style.overflow !== 'auto' && el.style.overflow !== 'scroll') {
          if (el.tagName === 'P' || el.tagName === 'H3') {
            clippedOrOverlapped = true;
          }
        }
      });
      return { clippedOrOverlapped };
    });
    assertCheck('No clipped/overlapped text elements', !layoutAudit.clippedOrOverlapped);

    // 5. Responsiveness Check
    const viewports = [375, 768, 1280];
    let responsiveIssue = false;
    for (const w of viewports) {
      await page.setViewport({ width: w, height: 800 });
      await new Promise(r => setTimeout(r, 200));
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      if (hasHorizontalScroll && w < 1280) {
        responsiveIssue = true;
      }
    }
    assertCheck('Responsive viewport width consistency (no horizontal scroll)', !responsiveIssue);

    // Reset viewport to default
    await page.setViewport({ width: 1280, height: 800 });

    // 6. Keyboard navigation (A11y check)
    const canFocus = await page.evaluate(() => {
      const btn = document.getElementById('sidebar-nav-tubulars');
      if (btn) {
        btn.focus();
        return document.activeElement === btn;
      }
      return false;
    });
    assertCheck('Keyboard focus navigation validation', canFocus);

    // 7. Offline resiliency test
    await page.setOfflineMode(true);
    let offlineIssue = false;
    try {
      // Simulate tab switch while offline
      await page.click('#sidebar-nav-threads');
      await new Promise(r => setTimeout(r, 500));
      const text = await page.evaluate(() => document.getElementById('app-content').innerText);
      if (text.includes('Error') || text.includes('failed') || text.trim().length === 0) {
        offlineIssue = true;
      }
    } catch (e) {
      offlineIssue = true;
    }
    assertCheck('Offline database recovery and rendering support', !offlineIssue);

    // Turn offline mode off
    await page.setOfflineMode(false);

    // 8. Manual Database Recovery & Re-sync click validation
    console.log('  - Testing manual database recovery and re-sync...');
    let resyncIssue = false;
    try {
      await page.click('#sidebar-nav-system-health');
      await new Promise(r => setTimeout(r, 500));
      await page.click('#health-tab-offline');
      await new Promise(r => setTimeout(r, 500));
      await page.click('#re-sync-db-btn');
      await new Promise(r => setTimeout(r, 2000)); // wait for recovery & render
    } catch (e) {
      console.error('  - Failed to click re-sync button:', e);
      resyncIssue = true;
    }
    if (consoleErrors.length > 0) {
      console.error('  - Captured E2E console errors during run:', consoleErrors);
    }
    assertCheck('Manual database recovery and sync execution', !resyncIssue && consoleErrors.length === 0);

  } catch (err) {
    console.error('Audit execution error:', err);
    failed++;
  } finally {
    await browser.close();
  }

  console.log('===================================================================');
  console.log(`E2E visual & performance audit summary: passed: ${passed}, failed: ${failed}`);
  process.exit(failed === 0 ? 0 : 1);
}

runE2EAudit();
