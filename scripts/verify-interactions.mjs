import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext()).newPage();

await page.goto("http://localhost:3000/HomeScreen", { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForSelector("section .grid a[href^='/']", { timeout: 20000 }).catch(() => null);
const cards = await page.locator("section .grid a[href^='/']").evaluateAll((els) =>
  els.map((e) => e.getAttribute("href")),
);
console.log("HomeScreen cards:", cards.length, cards.join(", "));

await page.goto("http://localhost:3000/SignupScreen", { waitUntil: "domcontentloaded", timeout: 90000 });
await page.locator('input[value="store"]').check();
const apiResp = await page
  .waitForResponse((r) => r.url().includes("business-categories"), { timeout: 20000 })
  .catch(() => null);
console.log("Signup API status:", apiResp?.status() ?? "timeout");
await page.waitForTimeout(500);
const opts = await page.locator('select[name="business_category"] option').evaluateAll((els) =>
  els.map((e) => e.getAttribute("value")),
);
console.log("Signup options:", opts.join(", "));

for (const url of [
  "http://127.0.0.1:8000/store/stores/",
  "http://127.0.0.1:8000/customer/customer/stores/",
  "http://127.0.0.1:8000/management/stores/",
]) {
  const res = await fetch(url, { headers: { Accept: "application/json" } }).catch(() => null);
  console.log(`API ${url} -> ${res?.status ?? "error"}`);
}

await browser.close();
