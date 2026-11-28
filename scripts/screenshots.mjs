import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3000";
const OUT = process.env.OUT ?? "docs/screenshots-tanstack";

const ROUTES = [
  { name: "home", path: "" },
  { name: "projects", path: "projects/" },
  { name: "project", path: "projects/spotui/" },
  { name: "project-signlanguage", path: "projects/signlanguage/" },
  { name: "blog", path: "blog/" },
  { name: "gallery", path: "gallery/" },
  { name: "album", path: "gallery/spring-2026/" },
  { name: "music", path: "music/" },
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 375, height: 812 },
];

const prepare = async (page) => {
  await page.evaluate(async () => {
    for (const image of document.images) image.loading = "eager";
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode().catch(() => undefined)));
  });
  await page.waitForTimeout(2500);
};

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

try {
  for (const route of ROUTES) {
    for (const viewport of VIEWPORTS) {
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
      });
      await page.goto(`${BASE}/${route.path}`, { waitUntil: "load" });
      await prepare(page);
      await page.screenshot({
        path: `${OUT}/${route.name}-${viewport.name}.png`,
        fullPage: true,
      });
      await page.close();
      console.log(`done ${route.name}-${viewport.name}`);
    }
  }

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
  });
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await prepare(page);
  await page.screenshot({ path: `${OUT}/home-dark.png`, fullPage: true });
  await page.close();
  console.log("done home-dark");
} finally {
  await browser.close();
}
