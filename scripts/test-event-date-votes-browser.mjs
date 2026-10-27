// Run against a local static server. PLAYWRIGHT_MODULE may name a local install.
// node scripts/test-event-date-votes-browser.mjs http://127.0.0.1:8773
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
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
    assert.match(await page.locator('#napif-total-chart').textContent(),/1 June–15 October, all years/);
    assert.doesNotMatch(await page.locator('#napif-total-chart').textContent(),/partial|2026\*|18 Sep/);
    const totalCells=await page.locator('#napif-weekly-body .total-row td').allTextContents();
    for(const counts of totalCells.slice(1,5)) {
        assert.equal(counts.split('/').map(Number).reduce((sum,n)=>sum+n,0),137);
    }
    const weekly2026=await page.locator('#napif-weekly-body tr:not(.total-row) td:nth-child(5)').allTextContents();
    assert.equal(weekly2026.reduce((sum,cell)=>{
        const counts=cell.match(/^\d+\/\d+\/\d+\/\d+\/\d+/);
        return sum+(counts ? counts[0].split('/').map(Number).reduce((a,b)=>a+b,0) : 0);
    },0),138);
    const finalWeek=page.locator('#napif-weekly-body tr').filter({hasText:'11 Oct–17 Oct'});
    assert.match(await finalWeek.locator('td').nth(4).textContent(),/\(6\/7 days\)/);
    assert.match(await finalWeek.locator('td').nth(5).textContent(),/11 days after 16 October/);
    assert.doesNotMatch(await page.locator('#napif-weekly-body').textContent(),/ Est|Estimate uses|No data available yet/);
    for(const year of [2023,2024,2025,2026]) {
        const lastDay=page.locator(`#napif-week-chart rect[aria-label*="15 October ${year}:"]`);
        assert.equal(await lastDay.count(),1);
        assert.doesNotMatch(await lastDay.getAttribute('aria-label'),/No comparable|Outside|yet/);
        for(const day of (year===2026 ? [17] : [16,17])) {
            const outside=page.locator(`#napif-week-chart rect[aria-label*="${day} October ${year}:"]`);
            assert.equal(await outside.count(),1);
            assert.match(await outside.getAttribute('aria-label'),/No report in this comparison/);
        }
    }
    assert.match(await page.locator('#napif-week-chart rect[aria-label*="16 October 2026:"]').getAttribute('aria-label'),/: Green$/);
    const septemberWeek=page.locator('#napif-weekly-body tr').filter({hasText:'20 Sep–26 Sep'});
    assert.doesNotMatch(await septemberWeek.locator('td').nth(5).textContent(),/n\/a|Est/);
    const juneWeek=page.locator('#napif-weekly-body tr').filter({hasText:'7 Jun–13 Jun'});
    assert.match(await juneWeek.locator('td').nth(5).textContent(),/n\/a/);
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
