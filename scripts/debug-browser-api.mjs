import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext()).newPage();
const logs = [];
page.on("requestfailed", (r) => logs.push(`FAIL ${r.url()} ${r.failure()?.errorText}`));
page.on("response", (r) => {
  if (r.url().includes("home-modules") || r.url().includes("auth/login") || r.url().includes("business-categories")) {
    logs.push(`RESP ${r.status()} ${r.url()}`);
  }
});

await page.goto("http://localhost:3000/HomeScreen", { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(2000);
console.log("cards", await page.locator("section .grid a").count());
console.log("env chunk check - page loaded");

await page.goto("http://localhost:3000/LoginScreenUser", { waitUntil: "networkidle", timeout: 120000 });
page.on("dialog", (d) => d.accept());
await page.locator('input[autocomplete="username"]').fill("customer@kudya.shop");
await page.locator('input[type="password"]').fill("seedpass123");
await page.locator('form button[type="submit"]').click();
await page.waitForTimeout(4000);
console.log("after login url", page.url());

for (const line of logs) console.log(line);
await browser.close();
