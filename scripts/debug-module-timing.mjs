import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext()).newPage();
await page.goto("http://localhost:3000/HomeScreen", { waitUntil: "domcontentloaded", timeout: 90000 });
for (const wait of [1000, 2000, 3000, 5000, 8000]) {
  await page.waitForTimeout(wait);
  const n = await page.locator("section .grid a[href^='/']").count();
  console.log(`after ${wait}ms cumulative wait: ${n} cards`);
  if (n > 0) break;
}
const html = await page.locator("section").first().innerHTML().catch(() => "none");
console.log("section snippet:", html.slice(0, 300));
await browser.close();
