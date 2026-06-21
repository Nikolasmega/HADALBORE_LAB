import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  try {
    console.log('Navigating to http://localhost:5173/...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    
    // Set localStorage settings to force Russian and Engineering mode
    await page.evaluate(() => {
      localStorage.setItem('lang', 'ru');
      localStorage.setItem('hadalbore_view_mode', 'engineering');
      localStorage.setItem('hadalbore_field_mode', 'false');
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('hadalbore_user_registered', 'true');
      localStorage.setItem('hadalbore_lab_accepted_notice', 'true');
    });

    console.log('Reloading page with settings...');
    await page.reload({ waitUntil: 'networkidle2' });

    // Wait for the app content
    await page.waitForSelector('#app-content');
    await new Promise(r => setTimeout(r, 1000));

    // Accept notice dialog if visible
    const noticeDialogExists = await page.evaluate(() => !!document.getElementById('login-notice-dialog'));
    if (noticeDialogExists) {
      console.log('Notice dialog found, accepting consent...');
      await page.click('#login-consent-checkbox');
      await page.click('#login-consent-continue-btn');
      await new Promise(r => setTimeout(r, 500));
    }

    // Click on the Tubulars tab in the sidebar
    console.log('Clicking on Tubulars tab...');
    await page.click('#sidebar-nav-tubulars');
    await new Promise(r => setTimeout(r, 1000));

    // Let's find the L80 Casing row in the table and click it
    console.log('Clicking on L80 Casing row...');
    const rows = await page.$$('tbody tr[data-record-id]');
    let clicked = false;
    for (const row of rows) {
      const text = await page.evaluate(el => el.textContent, row);
      if (text.includes('L80') && text.includes('Casing')) {
        await row.click();
        clicked = true;
        break;
      }
    }
    
    if (!clicked) {
      console.log('L80 Casing row not found, clicking the first row instead...');
      if (rows.length > 0) {
        await rows[0].click();
      }
    }
    
    await new Promise(r => setTimeout(r, 1000));

    // Now extract the rendered content from the details card
    const cardContent = await page.evaluate(() => {
      // Find advantages list items
      const sections = Array.from(document.querySelectorAll('h4'));
      const result = {};
      
      sections.forEach(sec => {
        const title = sec.textContent.trim();
        const nextEl = sec.nextElementSibling;
        if (nextEl) {
          if (nextEl.tagName === 'UL') {
            result[title] = Array.from(nextEl.querySelectorAll('li')).map(li => li.textContent.trim());
          } else {
            result[title] = nextEl.textContent.trim();
          }
        }
      });
      
      // Also look for Standard Classification
      const classificationHeader = Array.from(document.querySelectorAll('span')).find(el => el.textContent.includes('Классификация стандартов'));
      if (classificationHeader) {
        const grid = classificationHeader.nextElementSibling;
        if (grid) {
          result['Классификация стандартов'] = Array.from(grid.querySelectorAll('div')).map(el => el.textContent.trim().replace(/\s+/g, ' '));
        }
      }
      
      return result;
    });

    console.log('\n--- Rendered Details Card Content ---');
    console.log(JSON.stringify(cardContent, null, 2));

  } catch (err) {
    console.error('Error during scraping:', err);
  } finally {
    await browser.close();
  }
})();
