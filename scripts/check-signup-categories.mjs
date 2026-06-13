import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext()).newPage();

page.on("requestfailed", (req) => {
  if (req.url().includes("business-categories")) {
    console.log("business-categories failed:", req.url(), req.failure()?.errorText);
  }
});
page.on("response", (res) => {
  if (res.url().includes("business-categories")) {
    console.log("business-categories status:", res.status());
  }
});

await page.goto("http://localhost:3000/SignupScreen", { waitUntil: "networkidle", timeout: 90000 });
await page.locator('input[value="store"]').check();
await page.waitForTimeout(2500);

const options = await page.locator('select[name="business_category"] option').evaluateAll((els) =>
  els.map((e) => ({ value: e.getAttribute("value"), text: e.textContent?.trim() })),
);
console.log("store signup categories:", JSON.stringify(options, null, 2));

await browser.close();
