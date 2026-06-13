import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto('http://localhost:3000/LoginScreenUser', { waitUntil: 'networkidle', timeout: 120000 });
await page.fill('input[autocomplete="username"]', 'admin@kudya.shop');
await page.fill('input[autocomplete="current-password"]', 'seedpass123');

const [loginRes] = await Promise.all([
  page.waitForResponse((r) => r.url().includes('/api/auth/login/')),
  page.click('button[type="submit"]'),
]);

const loginJson = await loginRes.json();
console.log('API role:', loginJson.role, 'is_platform_admin:', loginJson.is_platform_admin);

await page.waitForTimeout(3000);
const token = await page.evaluate(() => localStorage.getItem('auth_token'));
console.log('localStorage auth_token:', token ? 'present' : 'missing');
console.log('URL after 3s:', page.url());

try {
  await page.waitForURL(/AdminDashboard/, { timeout: 10000 });
  console.log('Navigated to AdminDashboard');
} catch {
  console.log('No navigation to AdminDashboard');
}

await browser.close();
