/**
 * Real-user local journey test (Playwright).
 * Run: node scripts/real-user-journey.mjs
 * Screenshots: test-results/journey/
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const PASSWORD = "seedpass123";
const SHOT_DIR = path.join(process.cwd(), "test-results", "journey");

/** @type {{ step: string, ok: boolean, detail?: string }[]} */
const log = [];

function note(step, ok, detail = "") {
  log.push({ step, ok, detail });
  console.log(`[${ok ? "PASS" : "FAIL"}] ${step}${detail ? ` — ${detail}` : ""}`);
}

async function snap(page, name) {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SHOT_DIR, `${name}.png`), fullPage: true });
}

async function dismissDialogs(page) {
  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });
}

async function login(page, email, expectPathPart) {
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.context().clearCookies();
  await page.goto(`${BASE}/LoginScreenUser`, { waitUntil: "networkidle", timeout: 120000 });
  await page.locator('input[autocomplete="username"]').fill(email);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.includes("LoginScreenUser"), { timeout: 30000 }).catch(() => null);
  await page.waitForTimeout(500);
  const url = page.url();
  const ok = url.includes(expectPathPart);
  await snap(page, `login-${email.split("@")[0]}`);
  note(`Login ${email}`, ok, url.replace(BASE, ""));
  return ok;
}

async function main() {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  console.log(`\n=== Real user journey @ ${BASE} ===\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  dismissDialogs(page);

  // 1. Guest browses homepage
  await page.goto(`${BASE}/HomeScreen`, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForSelector('a[href="/food"]', { timeout: 20000 });
  const moduleCount = await page.locator("section .grid a[href^='/']").count();
  await snap(page, "01-home-guest");
  note("Guest opens HomeScreen", moduleCount >= 5, `${moduleCount} service cards`);

  // 2. Guest clicks Food module
  const foodLink = page.locator('a[href="/food"]').first();
  if (await foodLink.count()) {
    await Promise.all([
      page.waitForURL((url) => url.pathname.includes("stores") || url.pathname.includes("food"), { timeout: 15000 }).catch(() => null),
      foodLink.click(),
    ]);
    await page.waitForTimeout(1500);
    await snap(page, "02-food-module");
    note("Guest taps Food", page.url().includes("/stores") || page.url().includes("/food"));
  } else {
    note("Guest taps Food", false, "Food card not found");
  }

  // 3. Guest browses properties
  try {
    await page.goto(`${BASE}/properties`, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(1500);
    const propText = await page.locator("body").innerText();
    await snap(page, "03-properties");
    note("Guest browses properties", !/Application error/i.test(propText));
  } catch (error) {
    note("Guest browses properties", false, error instanceof Error ? error.message : String(error));
  }

  // 4. Guest browses services
  try {
    await page.goto(`${BASE}/services`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(1500);
  await snap(page, "04-services");
  note("Guest browses services", page.url().includes("/services"));
  } catch (error) {
    note("Guest browses services", false, error instanceof Error ? error.message : String(error));
  }

  // 5. Customer login → dashboard/home
  await login(page, "customer@kudya.shop", "HomeScreen");

  // 6. Customer opens wallet redirect
  await page.goto(`${BASE}/wallet`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(1500);
  await snap(page, "05-customer-wallet");
  note("Customer wallet route", page.url().includes("UserDashboard") || page.url().includes("wallet"));

  // 7. Store owner login → restaurant dashboard
  await login(page, "store@kudya.shop", "dashboard");

  // 8. Grocery owner dashboard
  await login(page, "grocery@kudya.shop", "dashboard");

  // 9. Signup page store categories
  await page.goto(`${BASE}/SignupScreen`, { waitUntil: "networkidle", timeout: 120000 });
  await page.locator('input[value="store"]').click({ force: true });
  await page.waitForResponse((r) => r.url().includes("business-categories"), { timeout: 20000 }).catch(() => null);
  await page.waitForTimeout(500);
  const catCount = await page.locator('select[name="business_category"] option').count();
  await snap(page, "06-signup-store-categories");
  note("Store signup shows categories", catCount >= 5, `${catCount} options`);

  // 10. Admin dashboard (no login required for page shell)
  await page.goto(`${BASE}/AdminDashboard`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(1500);
  const adminBody = await page.locator("body").innerText();
  await snap(page, "07-admin-dashboard");
  note("Admin dashboard loads", !/Application error/i.test(adminBody));

  await browser.close();

  const passed = log.filter((x) => x.ok).length;
  const failed = log.filter((x) => !x.ok);
  console.log(`\n=== Journey summary: ${passed}/${log.length} passed ===`);
  if (failed.length) {
    failed.forEach((f) => console.log(`  FAIL: ${f.step} ${f.detail || ""}`));
    process.exitCode = 1;
  }
  console.log(`\nScreenshots saved to: ${SHOT_DIR}`);
  console.log("\nTest accounts (password: seedpass123):");
  console.log("  customer@kudya.shop  — shopper");
  console.log("  store@kudya.shop     — restaurant partner");
  console.log("  grocery@kudya.shop   — grocery partner");
  console.log("  doctor@kudya.shop    — doctor");
  console.log("  admin@kudya.shop     — admin");
  console.log(`\nOpen in Cursor Simple Browser: ${BASE}/HomeScreen`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
