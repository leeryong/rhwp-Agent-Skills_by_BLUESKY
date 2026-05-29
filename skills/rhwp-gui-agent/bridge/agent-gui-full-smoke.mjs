import { mkdir, writeFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer-core';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = resolve(ROOT, 'output/agent-gui');
const DOWNLOADS = resolve(OUT, 'downloads');
const URL = process.env.RHWP_URL || 'http://127.0.0.1:8765/?agent=1';
const CHROME = process.env.CHROME_PATH
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function ensureDirs() {
  await mkdir(OUT, { recursive: true });
  await mkdir(DOWNLOADS, { recursive: true });
}

async function writeJson(name, data) {
  await writeFile(resolve(OUT, name), `${JSON.stringify(data, null, 2)}\n`);
}

async function clickCmd(page, cmd) {
  await page.click(`[data-cmd="${cmd}"]`);
  await page.evaluate(() => new Promise(r => setTimeout(r, 250)));
}

async function openMenu(page, menu) {
  await page.click(`#menu-bar .menu-item[data-menu="${menu}"] .menu-title`);
  await page.evaluate(() => new Promise(r => setTimeout(r, 150)));
}

async function clickCanvas(page, y = 140) {
  const canvas = await page.$('#scroll-container canvas');
  if (!canvas) throw new Error('No editor canvas found');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('No canvas bounding box');
  await page.mouse.click(box.x + box.width / 2, box.y + y);
  await page.evaluate(() => new Promise(r => setTimeout(r, 200)));
}

async function run() {
  await ensureDirs();

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      `--user-data-dir=${resolve(OUT, 'chrome-profile')}`,
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  await page._client().send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: DOWNLOADS,
  });

  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', err => {
    consoleMessages.push({ type: 'pageerror', text: err.message });
  });

  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction(() => window.__rhwpAgent, { timeout: 30000 });
  await page.evaluate(() => window.__rhwpAgent.ready());

  const catalog = await page.evaluate(() => {
    const menuItems = [...document.querySelectorAll('#menu-bar .menu-item')].map(menu => ({
      menu: menu.dataset.menu,
      title: menu.querySelector('.menu-title')?.textContent?.trim(),
      items: [...menu.querySelectorAll('[data-cmd]')].map(item => ({
        cmd: item.dataset.cmd,
        label: item.querySelector('.md-label')?.textContent?.trim() || item.textContent?.trim(),
        shortcut: item.querySelector('.md-shortcut')?.textContent?.trim() || '',
        initiallyDisabled: item.classList.contains('disabled'),
      })),
    }));
    const toolbar = [...document.querySelectorAll('.tb-btn[data-cmd], .tb-split-item[data-cmd], .sb-dropdown-item[data-format]')].map(el => ({
      cmd: el.dataset.cmd || (el.dataset.format ? `format:${el.dataset.format}` : ''),
      label: el.textContent?.replace(/\s+/g, ' ').trim() || el.getAttribute('title') || '',
      title: el.getAttribute('title') || '',
    }));
    return { menuItems, toolbar, commands: window.__rhwpAgent.commands() };
  });
  await writeJson('menu-command-catalog.json', catalog);

  const results = [];
  const step = async (name, fn) => {
    try {
      const value = await fn();
      results.push({ name, ok: true, value });
    } catch (error) {
      results.push({ name, ok: false, error: error.message || String(error) });
    }
  };

  await step('file-new-via-menu', async () => {
    await openMenu(page, 'file');
    await clickCmd(page, 'file:new-doc');
    await page.waitForFunction(() => window.__rhwpAgent.pageCount() > 0, { timeout: 10000 });
    return await page.evaluate(() => window.__rhwpAgent.context());
  });

  await step('text-format-and-input-via-toolbar', async () => {
    await clickCanvas(page);
    await page.click('#btn-bold');
    await page.click('#btn-italic');
    await page.click('#btn-underline');
    await page.click('#btn-align-center');
    await page.keyboard.type('rhwp agent GUI smoke test\n', { delay: 15 });
    await page.click('#btn-bold');
    return await page.evaluate(() => window.__rhwpAgent.context());
  });

  await step('table-create-via-toolbar-grid', async () => {
    await clickCmd(page, 'table:create');
    await page.waitForSelector('div[style*="z-index: 9999"], div[style*="z-index:9999"]', { timeout: 5000 });
    const popup = await page.$('div[style*="z-index: 9999"], div[style*="z-index:9999"]');
    const box = await popup.boundingBox();
    await page.mouse.move(box.x + 55, box.y + 62);
    await page.mouse.click(box.x + 55, box.y + 62);
    await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
    return await page.evaluate(() => window.__rhwpAgent.context());
  });

  await step('shape-picker-via-toolbar', async () => {
    await clickCmd(page, 'insert:shape');
    await page.waitForSelector('.shape-picker-btn', { timeout: 5000 });
    await page.click('.shape-picker-btn[title="사각형"]');
    return await page.evaluate(() => window.__rhwpAgent.context());
  });

  await step('symbols-dialog-via-toolbar', async () => {
    await clickCmd(page, 'insert:symbols');
    await page.waitForSelector('.sym-dialog', { timeout: 5000 });
    await page.screenshot({ path: resolve(OUT, 'symbols-dialog.png') });
    await page.keyboard.press('Escape');
    return true;
  });

  await step('load-local-sample-via-file-input', async () => {
    const input = await page.$('#file-input');
    await input.uploadFile(resolve(ROOT, 'public/samples/basic/KTX.hwp'));
    await page.waitForFunction(() => window.__rhwpAgent.pageCount() > 0, { timeout: 15000 });
    return await page.evaluate(() => ({ pages: window.__rhwpAgent.pageCount(), fileName: window.__rhwpAgent.fileName() }));
  });

  await step('load-hwpx-sample-via-agent-observation-bridge', async () => {
    return await page.evaluate(() => window.__rhwpAgent.loadSample('form-002.hwpx'));
  });

  await step('load-picture-rich-sample-via-agent-observation-bridge', async () => {
    return await page.evaluate(() => window.__rhwpAgent.loadSample('BlogForm_BookReview.hwp'));
  });

  await step('save-new-hwp-via-menu-download', async () => {
    await page.evaluate(() => window.__rhwpAgent.createNewDocument());
    await openMenu(page, 'file');
    await clickCmd(page, 'file:save');
    await page.waitForSelector('.dialog-wrap input[type="text"]', { timeout: 5000 });
    await page.click('.dialog-wrap input[type="text"]', { clickCount: 3 });
    await page.keyboard.type('agent-created-document');
    await page.click('.dialog-btn-primary');
    await page.evaluate(() => new Promise(r => setTimeout(r, 1200)));
    const files = await readdir(DOWNLOADS);
    const entries = [];
    for (const file of files) {
      const s = await stat(resolve(DOWNLOADS, file));
      entries.push({ file, size: s.size });
    }
    return entries;
  });

  await page.screenshot({ path: resolve(OUT, 'final-editor.png'), fullPage: true });
  await writeJson('smoke-results.json', { url: URL, results, consoleMessages });

  const failed = results.filter(r => !r.ok);
  await browser.close();
  if (failed.length) {
    console.error(JSON.stringify({ failed, out: OUT }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, out: OUT, steps: results.length }, null, 2));
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
