import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { allBlogs, allGalleries, allProjects } from "../.content-collections/generated/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = JSON.parse(await readFile(path.join(root, "site.config.json"), "utf8"));
const publicDir = path.join(root, "public");

const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const byNewest = (items) => [...items].sort((a, b) => new Date(b.pubDate).valueOf() - new Date(a.pubDate).valueOf());

const feed = (items) => {
  const entries = items
    .map(
      ({ title, description, link, pubDate }) => `<item>
  <title>${escapeXml(title)}</title>
  <link>${escapeXml(link)}</link>
  <guid isPermaLink="true">${escapeXml(link)}</guid>
  <pubDate>${new Date(pubDate).toUTCString()}</pubDate>
  <description>${escapeXml(description ?? "")}</description>
</item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.title)}</title>
    <link>${escapeXml(site.url)}</link>
    <description>${escapeXml(site.description)}</description>
    <language>en</language>
    <atom:link href="${escapeXml(`${site.url}/rss.xml`)}" rel="self" type="application/rss+xml" />
${entries}
  </channel>
</rss>
`;
};

const blogItems = byNewest(allBlogs).map((post) => ({
  title: post.title,
  description: post.description,
  pubDate: post.pubDate,
  link: `${site.url}/blog/${post._meta.path}/`,
}));

const projectItems = byNewest(allProjects).map((project) => ({
  title: project.title,
  description: project.description,
  pubDate: project.pubDate,
  link: `${site.url}/projects/${project._meta.path}/`,
}));

const galleryItems = byNewest(allGalleries).map((album) => ({
  title: album.title,
  description: `${album.title} — ${album.photos.length} photographic plates by JW.`,
  pubDate: album.pubDate,
  link: `${site.url}/gallery/${album.slug}/`,
}));

const urls = [
  "/",
  "/blog/",
  "/projects/",
  "/gallery/",
  "/music/",
  ...allBlogs.map((post) => `/blog/${post._meta.path}/`),
  ...allProjects.map((project) => `/projects/${project._meta.path}/`),
  ...allGalleries.map((album) => `/gallery/${album.slug}/`),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${escapeXml(new URL(url, site.url).toString())}</loc></url>`).join("\n")}
</urlset>
`;

const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${escapeXml(`${site.url}/sitemap-0.xml`)}</loc></sitemap>
</sitemapindex>
`;

const blogFeed = feed(blogItems);

await Promise.all([
  writeFile(path.join(publicDir, "rss.xml"), blogFeed),
  writeFile(path.join(publicDir, "blog.xml"), blogFeed),
  writeFile(path.join(publicDir, "projects.xml"), feed(projectItems)),
  writeFile(path.join(publicDir, "gallery.xml"), feed(galleryItems)),
  writeFile(path.join(publicDir, "sitemap-0.xml"), sitemap),
  writeFile(path.join(publicDir, "sitemap-index.xml"), sitemapIndex),
]);
