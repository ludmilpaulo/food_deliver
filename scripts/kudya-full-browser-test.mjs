import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOT_DIR = path.join(__dirname, 'kudya-browser-report');
const API = 'http://127.0.0.1:8000';

const tests = [];

function note(name, ok, detail = '') {
  tests.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name}${detail ? ` — ${detail}` : ''}`);
}

async function snap(page, name) {
  await page.screenshot({ path: path.join(SHOT_DIR, `${name}.png`), fullPage: true });
}

async function testParceiroDoctorLogin(page) {
  const BASE = 'http://localhost:8091';
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 120000 });
  await snap(page, 'parceiro-01-join');

  const joinSignIn = page.getByRole('button', { name: /^Sign in$|^Entrar$|^Se connecter$|^Iniciar sesión$/i });
  if (await joinSignIn.count()) await joinSignIn.first().click();
  await page.waitForTimeout(1200);

  const fillBtn = page.getByText('Fill test doctor login', { exact: false });
  if (await fillBtn.count()) {
    await fillBtn.click();
  } else {
    await page.locator('input').nth(0).fill('doctor@kudya.shop');
    await page.locator('input').nth(1).fill('seedpass123');
  }
  await snap(page, 'parceiro-02-login-filled');

  await page.locator('div').filter({ hasText: /^Sign in$/ }).last().click({ force: true });
  await page.waitForTimeout(5000);
  await snap(page, 'parceiro-03-dashboard');

  const body = await page.locator('body').innerText();
  const ok = /Doctor Dashboard|Healthcare|Clínica Kudya/i.test(body) && !/Welcome back/i.test(body);
  note('KudyaParceiro doctor login (8091)', ok, ok ? 'Doctor Dashboard' : 'still on login');
  return ok;
}

async function testClientDoctors(page) {
  const BASE = 'http://localhost:8081';
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForFunction(
    () => document.body?.innerText?.includes('Doctors') || document.body?.innerText?.includes('Médicos') || document.body?.innerText?.includes('What do you need'),
    { timeout: 90000 },
  ).catch(() => null);
  await page.waitForTimeout(2000);
  await snap(page, 'client-01-home');

  const doctorsTile = page.locator('div').filter({ hasText: /Book consultations|Marcar consultas|Book consultations/i }).first();
  if (await doctorsTile.count()) {
    await doctorsTile.click({ force: true });
    await page.waitForTimeout(4000);
    await snap(page, 'client-02-doctors');
    const after = await page.locator('body').innerText();
    const ok = /Find a Doctor|Encontrar|doctor found|médico/i.test(after) && !/Coming Soon|launching soon/i.test(after);
    note('kudya-client Doctors tile (8081)', ok, ok ? 'Find a Doctor' : 'Coming Soon or error');
    return ok;
  }
  note('kudya-client Doctors tile (8081)', false, 'Doctors tile not found on home');
  return false;
}

async function testWebDoctors(page) {
  const BASE = 'http://localhost:3000';
  await page.goto(`${BASE}/HomeScreen`, { waitUntil: 'networkidle', timeout: 120000 });
  await snap(page, 'web-01-home');

  await page.goto(`${BASE}/Doctors`, { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForTimeout(2000);
  await snap(page, 'web-02-doctors');
  const body = await page.locator('body').innerText();
  const ok = /Find a Doctor|doctor|médico|consultation/i.test(body) && !/404|Coming Soon/i.test(body);
  note('food_deliver /Doctors page (3000)', ok, page.url());
  return ok;
}

async function testApi() {
  try {
    const res = await fetch(`${API}/api/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'doctor@kudya.shop', password: 'seedpass123' }),
    });
    const data = await res.json();
    note('Django API doctor login (8000)', res.ok && data.role === 'doctor', `role=${data.role}`);
    return res.ok;
  } catch (e) {
    note('Django API doctor login (8000)', false, e.message);
    return false;
  }
}

async function main() {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  console.log('\n=== Kudya full browser test ===\n');

  await testApi();

  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();

  await testParceiroDoctorLogin(page);
  await testClientDoctors(page);
  await testWebDoctors(page);

  await browser.close();

  const passed = tests.filter((t) => t.ok).length;
  const report = { at: new Date().toISOString(), passed, total: tests.length, tests, screenshots: SHOT_DIR };
  fs.writeFileSync(path.join(SHOT_DIR, 'report.json'), JSON.stringify(report, null, 2));

  console.log(`\n=== ${passed}/${tests.length} passed ===`);
  console.log('Report:', path.join(SHOT_DIR, 'report.json'));
  console.log('Screenshots:', SHOT_DIR);

  if (passed < tests.length) process.exit(1);
}

main().catch((e) => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
