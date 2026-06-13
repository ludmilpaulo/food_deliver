import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext()).newPage();

await page.goto("http://localhost:3000/HomeScreen", { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(2000);

const hrefs = await page.locator("section .grid a").evaluateAll((els) =>
  els.map((e) => ({ href: e.getAttribute("href"), text: e.textContent?.trim() })),
);
console.log("modules:", JSON.stringify(hrefs, null, 2));

if (hrefs[0]?.href) {
  const target = hrefs[0].href.startsWith("/") ? hrefs[0].href : `/${hrefs[0].href}`;
  const resp = await page.goto(`http://localhost:3000${target}`, { waitUntil: "load", timeout: 60000 });
  console.log(`first module navigates to ${target} -> status ${resp?.status()}, final ${page.url()}`);
}

await browser.close();
