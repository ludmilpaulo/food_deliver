/**
 * Quick admin login smoke test — run: node scripts/test-admin-login.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const API = process.env.API_URL || 'http://localhost:8001';

async function main() {
  console.log('API check:', API);
  const apiRes = await fetch(`${API}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username: 'admin@kudya.shop', password: 'seedpass123' }),
  });
  const apiBody = await apiRes.json();
  console.log('API login status:', apiRes.status, 'role:', apiBody.role, 'is_platform_admin:', apiBody.is_platform_admin);
  if (!apiRes.ok) {
    console.error('API login failed:', apiBody);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`${BASE}/LoginScreenUser`, { waitUntil: 'domcontentloaded', timeout: 60000 });

  await page.locator('input[autocomplete="username"]').fill('admin@kudya.shop');
  await page.locator('input[autocomplete="current-password"]').fill('seedpass123');

  await page.locator('button[type="submit"]').click();

  await page.waitForURL(/AdminDashboard/, { timeout: 30000 });
  const url = page.url();
  console.log('Final URL:', url);

  await browser.close();

  if (!url.includes('AdminDashboard')) {
    console.error('Expected redirect to /AdminDashboard');
    process.exit(1);
  }
  console.log('Admin login OK');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
