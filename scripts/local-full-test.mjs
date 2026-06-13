import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://127.0.0.1:8000";
const NAV_TIMEOUT = 90000;

const ROUTES = [
  "/",
  "/HomeScreen",
  "/food",
  "/groceries",
  "/property",
  "/stay",
  "/services",
  "/doctors",
  "/car-rental",
  "/send-package",
  "/wallet",
  "/business",
  "/stores",
  "/properties",
  "/products",
  "/AllProducts",
  "/LoginScreenUser",
  "/SignupScreen",
  "/CartPage",
  "/Checkout",
  "/about",
  "/contact",
  "/careers",
  "/FAQ",
  "/TermsOfService",
  "/PrivacyPolicy",
  "/UserDashboard",
  "/AdminDashboard",
  "/RestaurantDashboad",
  "/PartnerDashboard",
  "/rides",
  "/dashboard/restaurant",
  "/StoreTypes",
  "/SuccessScreen",
];

const IGNORE_CONSOLE = [
  /favicon/i,
  /manifest/i,
  /mixpanel/i,
  /Failed to load resource/i,
  /ip2c\.org/i,
  /CORS policy/i,
  /detectUserCountry/i,
  /Error detecting country/i,
];

/** @type {{ section: string, name: string, ok: boolean, detail?: string }[]} */
const report = [];

function record(section, name, ok, detail = "") {
  report.push({ section, name, ok, detail });
  process.stdout.write(`[${ok ? "PASS" : "FAIL"}] ${section} :: ${name}${detail ? ` — ${detail}` : ""}\n`);
}

function isIgnoredError(text) {
  return IGNORE_CONSOLE.some((re) => re.test(text));
}

async function checkApis() {
  const endpoints = [
    { name: "home-modules (web)", url: `${API_URL}/api/platform/home-modules/?platform=web&lang=en`, expect: (d) => Array.isArray(d) && d.length >= 5 && d.every((m) => String(m.route).startsWith("/")) },
    { name: "home-modules no rides on web", url: `${API_URL}/api/platform/home-modules/?platform=web&lang=en`, expect: (d) => !d.some((m) => m.key === "rides") },
    { name: "home-modules (mobile) includes rides", url: `${API_URL}/api/platform/home-modules/?platform=mobile&lang=en`, expect: (d) => d.some((m) => m.key === "rides") },
    { name: "business-categories", url: `${API_URL}/api/platform/business-categories/?platform=web`, expect: (d) => Array.isArray(d) && d.length >= 5 },
    { name: "translations", url: `${API_URL}/api/translations/?lang=en`, expect: (d) => typeof d === "object" && Object.keys(d).length > 0 },
    { name: "stores list", url: `${API_URL}/store/stores/`, expect: (d) => d != null },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, { headers: { Accept: "application/json" } });
      if (!res.ok) {
        record("API", ep.name, false, `HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      record("API", ep.name, ep.expect(data), ep.expect(data) ? "" : "unexpected response shape");
    } catch (error) {
      record("API", ep.name, false, error instanceof Error ? error.message : String(error));
    }
  }
}

async function testRoute(browser, route) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error" && !isIgnoredError(msg.text())) consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => {
    if (!isIgnoredError(String(err))) pageErrors.push(String(err));
  });

  let response = null;
  let notes = "";

  try {
    response = await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT });
    await page.waitForTimeout(600);

    if (await page.locator("text=Unhandled Runtime Error").count()) {
      pageErrors.push("Next.js runtime error overlay");
    }
    const bodyText = await page.locator("body").innerText();
    if (/Application error: a client-side exception has occurred/i.test(bodyText)) {
      pageErrors.push("Client-side exception banner");
    }
    if (/Internal Server Error/i.test(bodyText)) {
      pageErrors.push("Internal Server Error");
    }

    const finalPath = new URL(page.url()).pathname + new URL(page.url()).search;
    if (finalPath !== route && route !== "/") notes = `→ ${finalPath}`;
  } catch (error) {
    pageErrors.push(error instanceof Error ? error.message : String(error));
  }

  const status = response?.status() ?? null;
  const errors = [...pageErrors, ...consoleErrors];
  const ok = (status === null || status < 500) && errors.length === 0;

  await context.close();
  record("Route", route, ok, ok ? notes || `HTTP ${status}` : errors[0]?.slice(0, 120));
  return ok;
}

async function testHomeModules(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  try {
    await page.goto(`${BASE_URL}/HomeScreen`, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT });
    await page.waitForSelector("section .grid a[href^='/']", { timeout: 20000 }).catch(() => null);
    await page.waitForTimeout(500);

    const hrefs = await page.locator("section .grid a[href^='/']").evaluateAll((els) =>
      els.map((e) => e.getAttribute("href")),
    );

    record("Interaction", "HomeScreen module count", hrefs.length >= 5, `${hrefs.length} cards`);
    record("Interaction", "HomeScreen no Rides card", !hrefs.includes("/rides"));
    record("Interaction", "HomeScreen routes are slash paths", hrefs.every((h) => h?.startsWith("/")));

    if (hrefs[0]) {
      const resp = await page.goto(`${BASE_URL}${hrefs[0]}`, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT });
      const ok = (resp?.status() ?? 500) < 400;
      record("Interaction", `First module link ${hrefs[0]}`, ok, `HTTP ${resp?.status()}`);
    }
  } catch (error) {
    record("Interaction", "HomeScreen modules", false, error instanceof Error ? error.message : String(error));
  }
  await context.close();
}

async function testSignupCategories(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  let apiStatus = 0;

  page.on("response", (res) => {
    if (res.url().includes("business-categories")) apiStatus = res.status();
  });

  try {
    await page.goto(`${BASE_URL}/SignupScreen`, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT });
    await page.locator('input[value="store"]').click({ force: true });
    const apiResp = await page
      .waitForResponse((r) => r.url().includes("business-categories"), { timeout: 20000 })
      .catch(() => null);
    apiStatus = apiResp?.status() ?? 0;
    await page.waitForTimeout(500);

    const options = await page.locator('select[name="business_category"] option').evaluateAll((els) =>
      els.map((e) => e.getAttribute("value")).filter(Boolean),
    );

    record("Interaction", "Signup business-categories API", apiStatus === 200, `HTTP ${apiStatus || "no request"}`);
    record("Interaction", "Signup category options loaded", options.length >= 5, options.join(", "));
  } catch (error) {
    record("Interaction", "Signup categories", false, error instanceof Error ? error.message : String(error));
  }
  await context.close();
}

async function main() {
  console.log(`\n=== Kudya local test run ===`);
  console.log(`Frontend: ${BASE_URL}`);
  console.log(`Backend:  ${API_URL}\n`);

  await checkApis();

  const browser = await chromium.launch({ headless: true });
  await testHomeModules(browser);
  await testSignupCategories(browser);
  for (const route of ROUTES) {
    await testRoute(browser, route);
  }
  await browser.close();

  const passed = report.filter((r) => r.ok).length;
  const failed = report.filter((r) => !r.ok);

  console.log(`\n=== SUMMARY ===`);
  console.log(`Passed: ${passed}/${report.length}`);
  console.log(`Failed: ${failed.length}/${report.length}`);

  if (failed.length) {
    console.log("\n--- Failed checks ---");
    for (const item of failed) {
      console.log(`  [${item.section}] ${item.name}${item.detail ? `: ${item.detail}` : ""}`);
    }
    process.exitCode = 1;
  } else {
    console.log("\nAll local checks passed.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
