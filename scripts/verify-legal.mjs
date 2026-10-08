import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel:'msedge', headless:true });
const errors = [];
for (const width of [1440,390]) {
  const page = await browser.newPage({viewport:{width,height:900}});
  page.on('pageerror',e=>errors.push(e.message));
  for (const route of ['privacy','terms']) {
    await page.goto(`http://127.0.0.1:4322/${route}/`,{waitUntil:'networkidle'});
    assert.equal(await page.locator('.legal-body section').count(),route === 'privacy' ? 10 : 15);
    assert.equal(await page.locator('.legal-tabs [aria-current=page]').count(),1);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    if(width===390){
      await page.locator('.legal-mobile-toc summary').click();
      await page.locator('.legal-mobile-toc a').last().click();
      assert.equal(await page.locator('.legal-mobile-toc').getAttribute('open'),null);
      assert(page.url().endsWith('#contact'));
    }
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
    await page.screenshot({path:`review-output/${route}-${width}.png`});
  }
  await page.goto('http://127.0.0.1:4322/',{waitUntil:'networkidle'});
  const card=page.locator('.benefit-grid article').first();
  await card.scrollIntoViewIfNeeded();
  await card.focus();
  await page.waitForTimeout(300);
  assert.notEqual(await card.evaluate(el=>getComputedStyle(el).transform),'none');
  await page.locator('.benefit-grid').screenshot({path:`review-output/cards-${width}.png`});
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await card.evaluate(el=>getComputedStyle(el).transform),'none');
  console.log(`${width}px: legal pages, mobile navigation, overflow, card focus and reduced motion passed`);
  await page.close();
}
await browser.close();
assert.deepEqual(errors,[]);
