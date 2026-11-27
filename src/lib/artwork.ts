// Keyless artwork lookups for the /music page.
//
// - Artist photos: Wikimedia Commons (CC / public domain only), with the
//   author + licence returned so the page can show the required credit.
// - Album covers: MusicBrainz release search -> Cover Art Archive front image.
//
// Everything is cached in memory and MusicBrainz calls are serialised to one
// request per second (their published rate limit).

const UA = "jwstn.dev music page (https://jwstn.dev)";
const PHOTO_TTL = 7 * 24 * 60 * 60 * 1000;
const COVER_TTL = 7 * 24 * 60 * 60 * 1000;
const MISS_TTL = 6 * 60 * 60 * 1000;

export interface ArtworkCredit {
  text: string;
  href: string;
}

export interface Artwork {
  url: string;
  credit?: ArtworkCredit;
  source: "commons" | "caa";
}

interface CacheEntry {
  at: number;
  value: Artwork | null;
}

const cache = new Map<string, CacheEntry>();

function cached(key: string): CacheEntry | undefined {
  return cache.get(key);
}

function fresh(hit: CacheEntry, ttl: number) {
  return Date.now() - hit.at < ttl;
}

function store(key: string, value: Artwork | null) {
  cache.set(key, { at: Date.now(), value });
  return value;
}

// ---------- MusicBrainz (1 request/second) ----------

let mbChain: Promise<unknown> = Promise.resolve();
let mbLastCall = 0;

function musicbrainz(url: string): Promise<Response> {
  const run = async () => {
    const wait = Math.max(0, 1100 - (Date.now() - mbLastCall));
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    mbLastCall = Date.now();
    return fetch(url, { headers: { "user-agent": UA } });
  };
  const next = mbChain.then(run, run);
  mbChain = next.catch(() => undefined);
  return next;
}

interface MbRelease {
  id: string;
  title: string;
  score: number;
  "artist-credit"?: Array<{ name?: string }>;
}

function normalise(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number} ]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function baseTitle(value: string) {
  return normalise(value.replace(/\s*[([].*$/u, ""));
}

async function coverExists(releaseId: string) {
  try {
    // CAA rejects HEAD; a ranged GET cheaps out of downloading the image.
    const res = await fetch(`https://coverartarchive.org/release/${releaseId}/front-250`, {
      headers: { range: "bytes=0-0" },
      redirect: "follow",
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function findCover(artist: string, album: string): Promise<Artwork | null> {
  const key = `cover:${artist.toLowerCase()}:${album.toLowerCase()}`;
  const hit = cached(key);
  if (hit && fresh(hit, COVER_TTL)) return hit.value;

  const variants = [album];
  const base = baseTitle(album);
  if (base && base !== normalise(album)) variants.push(base);

  try {
    for (const variant of variants) {
      const query = `release:"${variant.replace(/"/g, "")}" AND artist:"${artist.replace(/"/g, "")}"`;
      const url = `https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&fmt=json&limit=5`;
      let res = await musicbrainz(url);
      if (res.status === 503 || res.status === 429) {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        res = await musicbrainz(url);
      }
      // Rate limiting/outage is not "this album has no cover" — never cache it.
      if (!res.ok) return hit?.value ?? null;
      const data = (await res.json()) as { releases?: MbRelease[] };
      const candidates = (data.releases ?? []).filter((release) => {
        if (release.score < 90) return false;
        const credited = (release["artist-credit"] ?? []).map((c) => c.name ?? "").join(" & ");
        const artistOk = normalise(credited).includes(normalise(artist));
        const titleOk = normalise(release.title) === normalise(variant) || baseTitle(release.title) === base;
        return artistOk && titleOk;
      });

      for (const candidate of candidates) {
        if (await coverExists(candidate.id)) {
          const artwork: Artwork = {
            url: `https://coverartarchive.org/release/${candidate.id}/front-500`,
            source: "caa",
          };
          store(key, artwork);
          return artwork;
        }
      }
    }
  } catch {
    // fall through to the miss below
  }

  store(key, null);
  return null;
}

// ---------- Wikimedia Commons (free images only) ----------

interface CommonsPage {
  title?: string;
  categories?: Array<{ title?: string }>;
  imageinfo?: Array<{
    url?: string;
    thumburl?: string;
    descriptionurl?: string;
    width?: number;
    mime?: string;
    extmetadata?: Record<string, { value?: string }>;
  }>;
}

const ALLOWED_MIME = /^image\/(jpeg|png|webp)$/;
const FREE_LICENCE = /^(cc|public domain|pd)/i;
const MUSIC_CATEGORY = /music|musician|band|singer|rapper|composer|concert|disc jockey/i;

function plainText(html: string | undefined) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function findArtistPhoto(artist: string): Promise<Artwork | null> {
  const key = `photo:${artist.toLowerCase()}`;
  const hit = cached(key);
  if (hit && fresh(hit, PHOTO_TTL)) return hit.value;

  const words = normalise(artist)
    .split(" ")
    .filter((word) => word.length >= 2);
  try {
    const url = new URL("https://commons.wikimedia.org/w/api.php");
    url.searchParams.set("action", "query");
    url.searchParams.set("generator", "search");
    url.searchParams.set("gsrsearch", artist);
    url.searchParams.set("gsrnamespace", "6");
    url.searchParams.set("gsrlimit", "10");
    url.searchParams.set("prop", "imageinfo|categories");
    url.searchParams.set("clshow", "!hidden");
    url.searchParams.set("cllimit", "50");
    url.searchParams.set("iiprop", "url|mime|size|extmetadata");
    url.searchParams.set("iiurlwidth", "600");
    url.searchParams.set("format", "json");

    const res = await fetch(url, { headers: { "user-agent": UA } });
    if (!res.ok) throw new Error("commons");
    const data = (await res.json()) as { query?: { pages?: Record<string, CommonsPage> } };
    const pages = Object.values(data.query?.pages ?? {});

    const scored = pages
      .map((page) => {
        const info = page.imageinfo?.[0];
        if (!info?.thumburl || !info.mime || !ALLOWED_MIME.test(info.mime)) return null;
        if ((info.width ?? 0) < 300) return null;

        const metadata = info.extmetadata ?? {};
        const licence = metadata.LicenseShortName?.value ?? "";
        if (!FREE_LICENCE.test(licence)) return null;

        const categories = (page.categories ?? []).map((category) => category.title ?? "").join(" ");
        // Accept music categories, or a category named after the artist
        // (e.g. "Chrissy Costanza in 2017"). Padded-phrase test avoids
        // substring traps like artist "Light" vs category "Lighthouse".
        const meaning = ` ${normalise(categories)} `;
        const artistPhrase = ` ${normalise(artist)} `;
        if (!MUSIC_CATEGORY.test(categories) && !meaning.includes(artistPhrase)) return null;

        const title = normalise((page.title ?? "").replace(/^File:/, ""));
        // Require the full artist name as a contiguous phrase — otherwise
        // "Porch Light" matches a lighthouse porch, "Movements" fetal motion, etc.
        if (!title.includes(normalise(artist))) return null;

        const starts = title.startsWith(normalise(artist));
        const score = (starts ? 5 : 0) + (title.includes("band") ? 1 : 0) + Math.min((info.width ?? 0) / 1000, 2);

        const author = plainText(metadata.Artist?.value) || "Wikimedia Commons contributor";
        const credit: ArtworkCredit = {
          text: `${author} · ${licence}`,
          href: info.descriptionurl ?? "https://commons.wikimedia.org/",
        };
        return { score, artwork: { url: info.thumburl, credit, source: "commons" as const } };
      })
      .filter((entry): entry is { score: number; artwork: Artwork } => entry !== null)
      .sort((a, b) => b.score - a.score);

    const artwork = scored[0]?.artwork ?? null;
    store(key, artwork);
    return artwork;
  } catch {
    store(key, null);
    return null;
  }
}

export function getArtistPhoto(artist: string) {
  return findArtistPhoto(artist);
}

export function getAlbumCover(artist: string, album: string) {
  return findCover(artist, album);
}
