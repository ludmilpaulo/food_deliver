import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext()).newPage();
await page.goto("http://localhost:3000/HomeScreen", { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(4000);
console.log("grid links", await page.locator("section .grid a").count());
console.log("food link", await page.locator('a[href="/food"]').count());
console.log("module section text", (await page.locator("section").first().innerText()).slice(0, 200));
await browser.close();
