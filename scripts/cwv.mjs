import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3000";
const ROUTES = ["/", "/blog/", "/projects/", "/projects/spotui/", "/gallery/", "/gallery/spring-2026/", "/music"];
const LCP_LIMIT = Number(process.env.LCP_LIMIT ?? "2500");
const CLS_LIMIT = Number(process.env.CLS_LIMIT ?? "0.1");

const browser = await chromium.launch();
let failed = false;

try {
  for (const route of ROUTES) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    await page.addInitScript(() => {
      window.__cwv = { lcp: 0, cls: 0 };
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) window.__cwv.lcp = entry.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__cwv.cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });

    await page.goto(`${BASE}${route}`, { waitUntil: "load" });
    await page.waitForTimeout(3000);

    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      const fcp = performance.getEntriesByName("first-contentful-paint")[0];
      return {
        lcp: window.__cwv.lcp,
        cls: window.__cwv.cls,
        ttfb: nav?.responseStart ?? 0,
        fcp: fcp?.startTime ?? 0,
      };
    });

    const lcp = Math.round(metrics.lcp);
    const cls = Number(metrics.cls.toFixed(4));
    const ok = lcp <= LCP_LIMIT && cls <= CLS_LIMIT;
    failed ||= !ok;
    console.log(
      `${ok ? "ok  " : "FAIL"} ${route.padEnd(24)} lcp=${lcp}ms cls=${cls} fcp=${Math.round(metrics.fcp)}ms ttfb=${Math.round(metrics.ttfb)}ms`,
    );
    await page.close();
  }
} finally {
  await browser.close();
}

if (failed) process.exit(1);
console.log("cwv: within budget");
