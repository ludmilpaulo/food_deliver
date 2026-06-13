import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext()).newPage();

const logs = [];
page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
page.on("requestfailed", (req) =>
  logs.push(`[requestfailed] ${req.url()} -> ${req.failure()?.errorText}`),
);
page.on("response", (res) => {
  if (res.url().includes("home-modules")) {
    logs.push(`[home-modules] status=${res.status()}`);
  }
});

await page.goto("http://localhost:3000/HomeScreen", { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(2000);

const sectionHtml = await page.locator("section").first().innerHTML().catch(() => "none");
const bodySnippet = await page.locator("body").innerText();
console.log("contains 'What do you need today':", bodySnippet.includes("What do you need today"));
console.log("section snippet:", sectionHtml.slice(0, 500));
console.log("logs:");
for (const line of logs.slice(-20)) console.log(line);

await browser.close();
