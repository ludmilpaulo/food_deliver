import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext()).newPage();
const consoleLogs = [];
page.on("console", (m) => consoleLogs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => consoleLogs.push(`[pageerror] ${e}`));

await page.goto("http://localhost:3000/HomeScreen", { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(5000);

const body = await page.locator("body").innerText();
console.log("has What do you need:", /What do you need|O que precisa|need today/i.test(body));
console.log("has Kudya section label:", body.includes("Kudya"));
console.log("links in page", await page.locator("a[href^='/']").count());
console.log("all sections", await page.locator("section").count());

for (const line of consoleLogs.filter((l) => /error|Error|fail/i.test(l)).slice(0, 15)) {
  console.log(line);
}

await browser.close();
