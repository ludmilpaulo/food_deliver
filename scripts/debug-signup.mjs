import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext()).newPage();
const requests = [];
page.on("request", (req) => {
  if (req.url().includes("127.0.0.1:8000") || req.url().includes("platform")) {
    requests.push(req.url());
  }
});

await page.goto("http://localhost:3000/SignupScreen", { waitUntil: "networkidle", timeout: 120000 });
await page.locator('input[value="store"]').click({ force: true });
await page.waitForTimeout(5000);

console.log("API requests:", requests.filter((u) => u.includes("platform")).join("\n") || "none");
const selectVisible = await page.locator('select[name="business_category"]').isVisible();
console.log("select visible:", selectVisible);
const opts = await page.locator('select[name="business_category"] option').evaluateAll((els) =>
  els.map((e) => ({ value: e.getAttribute("value"), text: e.textContent?.trim() })),
);
console.log("options:", JSON.stringify(opts, null, 2));

await browser.close();
