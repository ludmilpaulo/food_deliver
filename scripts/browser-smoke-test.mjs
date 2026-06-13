import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const NAV_TIMEOUT = 60000;

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

function isIgnoredError(text) {
  return IGNORE_CONSOLE.some((re) => re.test(text));
}

async function testRoute(browser, route) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error" && !isIgnoredError(msg.text())) {
      consoleErrors.push(msg.text());
    }
  });
  page.on("pageerror", (err) => {
    if (!isIgnoredError(String(err))) pageErrors.push(String(err));
  });

  let response = null;
  const notes = [];

  try {
    response = await page.goto(`${BASE_URL}${route}`, {
      waitUntil: "load",
      timeout: NAV_TIMEOUT,
    });
    await page.waitForTimeout(800);

    if (await page.locator("text=Unhandled Runtime Error").count()) {
      pageErrors.push("Next.js runtime error overlay detected");
    }

    const bodyText = await page.locator("body").innerText();
    if (/Application error: a client-side exception has occurred/i.test(bodyText)) {
      pageErrors.push("Client-side exception banner detected");
    }
    if (/Internal Server Error/i.test(bodyText)) {
      pageErrors.push("Internal Server Error text detected");
    }

    const finalPath = new URL(page.url()).pathname + new URL(page.url()).search;
    if (finalPath !== route && route !== "/") {
      notes.push(`final url: ${finalPath}`);
    }
  } catch (error) {
    pageErrors.push(error instanceof Error ? error.message : String(error));
  }

  const status = response ? response.status() : null;
  const errors = [...pageErrors, ...consoleErrors];
  const ok = (status === null || status < 500) && errors.length === 0;

  await context.close();

  return {
    route,
    status,
    ok,
    title: "",
    errors,
    notes,
  };
}

async function testHomeModules(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const notes = [];
  const errors = [];

  try {
    await page.goto(`${BASE_URL}/HomeScreen`, { waitUntil: "load", timeout: NAV_TIMEOUT });
    await page.waitForTimeout(2000);

    const cards = page.locator("section .grid a[href^='/']");
    const count = await cards.count();
    notes.push(`category cards found: ${count}`);

    const hrefs = [];
    for (let i = 0; i < Math.min(count, 15); i++) {
      hrefs.push(await cards.nth(i).getAttribute("href"));
    }
    notes.push(`routes: ${hrefs.filter(Boolean).join(", ")}`);

    if (hrefs.some((h) => h === "/rides")) {
      errors.push("Rides should be hidden on web but a /rides card was found");
    }
    if (count < 5) {
      errors.push("Expected at least 5 home module cards from API");
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  await context.close();
  return { route: "[interaction] HomeScreen modules", ok: errors.length === 0, errors, notes, status: 200 };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  results.push(await testHomeModules(browser));

  for (const route of ROUTES) {
    const result = await testRoute(browser, route);
    results.push(result);
    process.stdout.write(`${route} ... ${result.ok ? "OK" : "FAIL"}\n`);
  }

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  const passed = results.filter((r) => r.ok);

  console.log("\n=== BROWSER SMOKE TEST SUMMARY ===");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Passed: ${passed.length}/${results.length}`);
  console.log(`Failed: ${failed.length}/${results.length}`);

  if (failed.length) {
    console.log("\n--- Failures ---");
    for (const item of failed) {
      console.log(`\n${item.route}`);
      console.log(`  status: ${item.status}`);
      if (item.notes?.length) console.log(`  notes: ${item.notes.join("; ")}`);
      for (const err of item.errors.slice(0, 5)) {
        console.log(`  error: ${err.slice(0, 400)}`);
      }
    }
    process.exitCode = 1;
  } else {
    console.log("\nAll routes loaded without blocking runtime/console errors.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
