const BASE = process.env.BASE ?? "http://localhost:3000";
let failed = false;

const check = async (path, expected, verify) => {
  const response = await fetch(new URL(path, BASE), { redirect: "manual" });
  let ok = response.status === expected;

  if (ok && verify) {
    try {
      ok = await verify(response);
    } catch (error) {
      console.error(`FAIL ${path}: ${error.message}`);
      failed = true;
      return;
    }
  }

  console.log(`${ok ? "ok  " : "FAIL"} ${path} -> ${response.status}`);
  if (!ok) failed = true;
};

const text = async (response) => response.text();
const header = (response, name) => response.headers.get(name);

await check("/", 200, async (response) => (await text(response)).includes("Parts list"));
await check("/blog/", 200, async (response) => (await text(response)).includes("Nothing has been plotted"));
await check("/projects/", 200, async (response) => (await text(response)).includes("MyVinylCollection"));
await check("/projects/spotui/", 200, async (response) => (await text(response)).includes("View live assembly"));
await check("/gallery/", 200, async (response) => (await text(response)).includes("Pictures of JW"));
await check("/gallery/japan-2026/", 200, async (response) => (await text(response)).includes("iso-plate"));
await check(
  "/music/",
  200,
  async (response) => header(response, "cache-control") === "public, s-maxage=300, stale-while-revalidate=600",
);
await check("/music", 307, async (response) => header(response, "location") === "/music/");
await check("/projects/nope/", 404);
await check("/gallery/fall-2026/", 301, async (response) => header(response, "location") === "/gallery/japan-2026/");

for (const feed of ["rss.xml", "blog.xml", "projects.xml", "gallery.xml"]) {
  await check(`/${feed}`, 200, async (response) => (await text(response)).includes("<rss"));
}

await check("/projects.xml", 200, async (response) => {
  const xml = await text(response);
  return xml.includes("https://www.jwstn.dev/projects/spotui/") && !xml.includes("/project/");
});

await check("/gallery.xml", 200, async (response) => {
  const xml = await text(response);
  return xml.includes("https://www.jwstn.dev/gallery/japan-2026/") && !xml.includes("/gallery/fall-2026/");
});

await check("/sitemap-index.xml", 200, async (response) =>
  (await text(response)).includes("https://www.jwstn.dev/sitemap-0.xml"),
);

await check("/sitemap-0.xml", 200, async (response) => {
  const xml = await text(response);
  return xml.includes("https://www.jwstn.dev/projects/spotui/") && (xml.match(/<loc>/g) ?? []).length >= 12;
});

if (failed) process.exit(1);
console.log("smoke: all checks passed");
