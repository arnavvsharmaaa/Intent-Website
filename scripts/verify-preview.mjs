import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

await mkdir('review-output', { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [];
for (const [label, width, height] of [['desktop',1440,1000], ['mobile',390,844]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:4322/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => getComputedStyle(document.querySelector('#scene-fallback')).display === 'none');
  const pixels = await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => {
    const source = document.querySelector('#kero-world canvas');
    const canvas = document.createElement('canvas'); canvas.width = source.width; canvas.height = source.height;
    const ctx = canvas.getContext('2d'); ctx.drawImage(source,0,0);
    const data = ctx.getImageData(0,0,canvas.width,canvas.height).data;
    let green = 0;
    for (let i=0;i<data.length;i+=4) if(data[i+1]>data[i]*1.2 && data[i+1]>80 && data[i+3]>100) green++;
    resolve(green);
  })));
  assert(pixels>100, `Kero canvas should contain green pixels, got ${pixels}`);
  const canvas = page.locator('#kero-world canvas');
  const first = await canvas.screenshot();
  await page.waitForTimeout(450);
  assert(!first.equals(await canvas.screenshot()), 'Scene should animate');
  for (const state of ['pause','break','snooze','focus']) {
    await page.locator(`[data-state="${state}"]`).click();
    assert.equal(await page.locator(`[data-state="${state}"]`).getAttribute('aria-pressed'),'true');
  }
  const bounds = await canvas.boundingBox();
  const beforeDrag = await canvas.screenshot();
  await page.mouse.move(bounds.x+bounds.width/2,bounds.y+bounds.height/2);
  await page.mouse.down(); await page.mouse.move(bounds.x+bounds.width/2+90,bounds.y+bounds.height/2,{steps:10}); await page.mouse.up();
  assert(!beforeDrag.equals(await canvas.screenshot()));
  await page.getByRole('button',{name:'Reset Kero view'}).click();
  assert(await page.locator('.video-placeholder').isVisible());
  await page.locator('.faq-list summary').first().click();
  assert(await page.locator('.faq-list details').first().getAttribute('open') !== null);
  if(label==='mobile') {
    await page.locator('.mobile-nav summary').click();
    await page.locator('.mobile-nav a').first().click();
    assert.equal(await page.locator('.mobile-nav').getAttribute('open'),null);
  }
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.waitForTimeout(300);
  await page.screenshot({path:`review-output/${label}.png`,fullPage:true});
  console.log(`${label}: rendered ${pixels} green pixels; animation, state controls, rotation, FAQ and layout passed`);
  await page.close();
}
assert.deepEqual(errors,[]);
const fallbackPage = await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
await fallbackPage.addInitScript(() => {
  const getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(type,...args) {
    if(type==='webgl' || type==='webgl2') return null;
    return getContext.call(this,type,...args);
  };
});
await fallbackPage.goto('http://127.0.0.1:4322/',{waitUntil:'networkidle'});
assert(await fallbackPage.locator('#scene-fallback').isVisible());
await fallbackPage.locator('[data-state="snooze"]').click();
assert((await fallbackPage.locator('#kero-message').textContent()).includes('Quiet time'));
console.log('Non-WebGL fallback and controls passed');
await browser.close();
