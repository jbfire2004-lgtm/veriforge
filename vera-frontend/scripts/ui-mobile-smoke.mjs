import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const base = process.env.UI_SMOKE_BASE_URL ?? "http://127.0.0.1:3000";

try {
  await page.goto(`${base}/login`, { waitUntil: "domcontentloaded" });
  const email = page
    .locator('input[type="email"], input[name="email"], input[placeholder*="Email" i]')
    .first();
  const password = page.locator('input[type="password"]').first();
  await email.fill("aurora_supervisor@vera.com");
  await password.fill("hashedpassword123");
  const submit = page
    .locator('button:has-text("Sign"), button:has-text("Log"), button[type="submit"]')
    .first();
  await submit.click();
  await page.waitForTimeout(2000);

  const routes = ["/core/training-ingest", "/core/readiness", "/pm/safety-forms", "/wallet"];
  for (const route of routes) {
    await page.goto(`${base}${route}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    const currentUrl = page.url();
    const data = await page.evaluate(() => {
      const overflow = document.documentElement.scrollWidth > window.innerWidth + 1;
      const interactive = [...document.querySelectorAll('button,a,input,select,textarea,[role="button"]')].filter(
        (el) => {
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.visibility !== "hidden" &&
            style.display !== "none"
          );
        },
      );
      const tooSmall = interactive.filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width < 44 || rect.height < 44;
      }).length;
      const labels = document.querySelectorAll("label").length;
      const loadingText = document.body.innerText.toLowerCase().includes("loading");
      return { overflow, interactive: interactive.length, tooSmall, labels, loadingText };
    });
    console.log(`UI_MOBILE ${route} ${JSON.stringify({ currentUrl, ...data })}`);
  }
} finally {
  await browser.close();
}
