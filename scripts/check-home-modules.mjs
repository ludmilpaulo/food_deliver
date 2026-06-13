import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext()).newPage();
await page.goto("http://localhost:3000/HomeScreen", { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(3000);

const hrefs = await page.locator("section a[href^='/']").evaluateAll((els) =>
  els.map((e) => e.getAttribute("href")),
);
const texts = await page.locator("section a[href^='/']").allTextContents();

console.log("module count:", hrefs.length);
console.log("hrefs:", hrefs.join(", "));
console.log("has rides:", hrefs.includes("/rides"));
console.log("sample:", texts.slice(0, 3));

await browser.close();
