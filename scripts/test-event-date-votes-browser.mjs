// Run against a local static server. Uses the existing parent-directory Playwright install.
// node scripts/test-event-date-votes-browser.mjs http://127.0.0.1:8773
import {chromium} from 'playwright';
import {strict as assert} from 'node:assert';
const base=process.argv[2] || 'http://127.0.0.1:8773';
const browser=await chromium.launch({headless:true});
try {
    const page=await browser.newPage({viewport:{width:1440,height:1000}});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`${base}/event-dates-2027.html`,{waitUntil:'domcontentloaded'});
    await page.waitForSelector('#napif-week-chart svg');
    await page.waitForSelector('#napif-weekly-body tr td',{state:'attached'});
    assert.equal(await page.locator('.dates-result-card').count(),3);
    assert.ok(await page.evaluate(()=>Boolean(document.querySelector('#vote-results')
        .compareDocumentPosition(document.querySelector('#historical-review')) & Node.DOCUMENT_POSITION_FOLLOWING)));
    assert.match(await page.locator('#napif-total-chart').textContent(),/18 September/);
    assert.match(await page.locator('#napif-weekly-body').textContent(),/September 15, 2026/);
    for(const width of [1440,390,320]) {
        await page.setViewportSize({width,height:900});
        await page.waitForTimeout(200);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Landing page overflow at ${width}px`);
    }
    await page.locator('.dates-result-link').click();
    await page.waitForSelector('#vote-app:not([hidden])');
    await page.setViewportSize({width:1440,height:1000});
    await page.goto(`${base}/event-dates-2027-vote-results.html`);
    await page.waitForSelector('#vote-app:not([hidden])');
    assert.match(await page.locator('#official-summary').innerText(),/7-13 June 2027/);
    assert.equal(await page.locator('[data-pair]').count(),56);
    await page.locator('[data-pair="jul-5,sep-6"]').click();
    assert.match(await page.locator('#pair-detail').innerText(),/26 prefer 5–11 Jul/);
    assert.match(await page.locator('#pair-detail').innerText(),/64 prefer 6–12 Sep/);
    assert.match(await page.locator('#pair-detail').innerText(),/7 no preference/);
    await page.selectOption('#matrix-mode','percent');
    assert.match(await page.locator('[data-pair="jun-7,sep-6"]').innerText(),/57.6%/);
    await page.selectOption('#matrix-mode','margin');
    assert.match(await page.locator('[data-pair="jun-7,sep-6"]').innerText(),/\+14/);
    await page.selectOption('#focus-date','jul-5');
    assert.match(await page.locator('#matchups').innerText(),/wins 0 of 7/);
    for(const sort of ['calendar','first','rejected','borda','result']) await page.selectOption('#ranking-sort',sort);
    for(const mode of ['first','positions','borda','acceptance']) {
        await page.selectOption('#preference-mode',mode);
        for(const unit of ['percent','count']) {
            await page.selectOption('#value-mode',unit);
            assert.equal(await page.locator('.vote-chart-row').count(),8);
            assert.doesNotMatch(await page.locator('#preference-chart').innerText(),/NaN|undefined/);
        }
    }
    await page.selectOption('#ballot-date','jul-5');
    await page.selectOption('#ballot-condition','rejected');
    assert.match(await page.locator('#ballot-count').innerText(),/33 of 97/);
    await page.locator('#ballot-next').click();
    assert.equal(await page.locator('#ballot-page').innerText(),'Page 2 of 4');
    await page.selectOption('#ballot-condition','unranked');
    assert.match(await page.locator('#ballot-count').innerText(),/3 of 97/);
    await page.selectOption('#ballot-condition','any');
    await page.selectOption('#ballot-style','equal');
    assert.ok(await page.locator('.vote-ballot').count()>0);
    await page.selectOption('#ballot-style','all');

    await page.locator('.vote-scenario summary').click();
    await page.locator('input[value="jun-7"]').uncheck();
    assert.match(await page.locator('#scenario-status').innerText(),/Scenario winner: 6-12 September/);
    assert.equal(await page.locator('[data-pair]').count(),42);
    assert.match(await page.locator('#official-summary').innerText(),/7-13 June 2027/);
    for(const id of ['may-31','jun-14','jul-5','sep-6','sep-13']) await page.locator(`input[value="${id}"]`).uncheck();
    assert.equal(await page.locator('#candidate-controls input:disabled').count(),2);
    assert.equal(await page.locator('[data-pair]').count(),2);
    await page.locator('#reset-scenario').click();
    assert.equal(await page.locator('[data-pair]').count(),56);
    assert.equal(await page.locator('#scenario-status').innerText(),'');
    for(const type of ['json','csv']) {
        const download=page.waitForEvent('download');
        await page.locator(`.vote-downloads a[href$=".${type}"]`).click();
        assert.equal((await download).suggestedFilename(),`ballots.${type}`);
    }
    for(const width of [1440,768,390,320]) {
        await page.setViewportSize({width,height:900});
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${width}px`);
    }
    await page.screenshot({path:'/tmp/event-votes-mobile.png',fullPage:true});
    assert.deepEqual(errors,[]);
    const failure=await browser.newPage();
    await failure.route('**/data/event-dates-2027-vote/ballots.json',route=>route.fulfill({status:500,body:'Unavailable'}));
    await failure.goto(`${base}/event-dates-2027-vote-results.html`);
    await failure.waitForFunction(()=>document.querySelector('#load-status').textContent.includes('could not be loaded'));
    assert.equal(await failure.locator('.vote-downloads a').count(),2);
    console.log('PASS: landing summary and history, updated alert charts, results link, matrix modes, date focus, sorting, charts, filters, pagination, scenarios, resets, downloads, load errors, and 320–1440px layouts. No browser JS errors.');
} finally {
    await browser.close();
}
