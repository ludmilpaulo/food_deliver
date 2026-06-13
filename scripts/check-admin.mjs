import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext()).newPage();
let adminError = false;
page.on("pageerror", (err) => {
  if (String(err).includes("next/image")) adminError = true;
});

const resp = await page.goto("http://localhost:3000/AdminDashboard", {
  waitUntil: "load",
  timeout: 90000,
});
await page.waitForTimeout(1500);

const body = await page.locator("body").innerText();
console.log("AdminDashboard status:", resp?.status());
console.log("AdminDashboard crash:", /Application error/i.test(body) || adminError);

await browser.close();
