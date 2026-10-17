// PLAYWRIGHT_MODULE may name a locally installed Playwright module.
// Run against a local server; block all external requests and never submit forms.
import {strict as assert} from 'node:assert';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.argv[2] || 'http://127.0.0.1:8778';
const browser = await chromium.launch({headless:true});
const pages = [
  '2026-archive.html', 'bus-tickets.html', 'art-grants.html', 'werkhaus.html',
  'local-residents-discount.html', 'low-income-tickets.html', 'weather-alerts.html',
  'getting-there.html', 'barrios.html', 'rideshare.html', 'survival-guide.html',
  'faq.html', 'working-groups.html', 'purchasing.html', 'volunteering.html',
  'inclusion.html', 'consent.html', 'speaking-about-elsewhere.html',
  ...['barrio-guide','survival-guide'].flatMap(p =>
    ['en','es','fr','it','de'].map(lang => `${p}-${lang}.html`))
];
try {
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  await page.route('**/*', route => new URL(route.request().url()).origin === base
    ? route.continue() : route.fulfill({status:200,contentType:'text/plain',body:''}));
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  for (const name of ['index.html', ...pages]) {
    errors.length = 0;
    const response = await page.goto(`${base}/${name}`, {waitUntil:'load'});
    assert.equal(response.status(),200,name);
    const buttons = page.locator('.lang-toggle button');
    for (let i=0; i<await buttons.count(); i++) {
      const button = buttons.nth(i);
      const lang = await button.getAttribute('data-lang');
      await button.click();
      assert.ok(await page.locator(`.lang-content[data-lang="${lang}"]`).isVisible(),`${name}: ${lang}`);
      if (await page.locator('.edition-notice').count()) {
        assert.ok(await page.locator(`.lang-content[data-lang="${lang}"] .edition-notice`).isVisible(),`${name}: ${lang} notice`);
      }
    }
    if (['index.html','2026-archive.html','bus-tickets.html','local-residents-discount.html'].includes(name)) {
      for (const width of [1440,390]) {
        await page.setViewportSize({width,height:900});
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),`${name}: overflow ${width}`);
      }
      await page.setViewportSize({width:1440,height:1000});
    }
    assert.deepEqual(errors,[],`${name}: JS errors`);
    console.log(`PASS ${name}: language switching and page JS`);
  }
  await page.goto(`${base}/weather-alerts.html`);
  assert.ok(await page.locator('.day-chip').count() > 0);
  assert.match(await page.locator('h1').innerText(),/2026.*Archive/);
  await page.goto(`${base}/red-alert-plus.html`);
  await page.waitForURL('**/weather-alerts.html');
  await page.goto(`${base}/index.html`);
  assert.equal(await page.locator('a[href*="tickets.nobodies.team/events/nobodiescollective/2089167"]').count(),0);
  console.log('PASS historical tracker, redirect and closed homepage ticket sales');
} finally {
  await browser.close();
}
