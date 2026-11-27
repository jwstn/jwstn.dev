// Last.fm read-only client for the /music page.
//
// The API key and username are read from server env vars:
//   LASTFM_API_KEY   — free key from https://www.last.fm/api/account/create
//   LASTFM_USERNAME  — defaults to "jwstn"
//
// Responses are cached in memory for a few minutes so visitors never hammer
// the Last.fm API; the page also sets a CDN cache header.

const API_ROOT = "https://ws.audioscrobbler.com/2.0/";
const CACHE_TTL_MS = 5 * 60 * 1000;

export interface LastfmImage {
  size: string;
  "#text": string;
}

export interface LastfmArtist {
  name: string;
  playcount: string;
  listeners?: string;
  url: string;
  image: LastfmImage[];
}

export interface LastfmTrack {
  name: string;
  artist: { "#text": string };
  album?: { "#text": string };
  url: string;
  image: LastfmImage[];
  date?: { uts: string; "#text": string };
  "@attr"?: { nowplaying?: string };
}

function envVar(name: string): string | undefined {
  const viteEnv = import.meta.env as Record<string, string | undefined>;
  if (viteEnv[name]) return viteEnv[name];
  const g = globalThis as { process?: { env?: Record<string, string | undefined> } };
  return g.process?.env?.[name];
}

export function lastfmUsername(): string {
  return envVar("LASTFM_USERNAME") ?? "jwstn";
}

export function isLastfmConfigured(): boolean {
  return Boolean(envVar("LASTFM_API_KEY"));
}

interface CacheEntry {
  at: number;
  data: unknown;
}

const cache = new Map<string, CacheEntry>();

interface LastfmError {
  error?: number;
  message?: string;
}

async function request<T>(method: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = envVar("LASTFM_API_KEY");
  if (!apiKey) throw new Error("missing-key");

  const url = new URL(API_ROOT);
  url.searchParams.set("method", method);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("format", "json");
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  const cacheKey = url.toString().replace(apiKey, "KEY");
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data as T;

  try {
    const res = await fetch(url, {
      headers: { "user-agent": "jwstn.dev music page (https://jwstn.dev)" },
    });
    if (!res.ok) throw new Error(`lastfm-http-${res.status}`);

    const data = (await res.json()) as T & LastfmError;
    if (data.error) throw new Error(data.message ?? `lastfm-error-${data.error}`);

    cache.set(cacheKey, { at: Date.now(), data });
    return data;
  } catch (cause) {
    // Last.fm has had multi-hour read outages; serve the last good response
    // rather than showing an error page while the cache still holds data.
    if (hit) return hit.data as T;
    throw cause;
  }
}

export async function getTopArtists(period = "1month", limit = 3): Promise<LastfmArtist[]> {
  const data = await request<{ topartists?: { artist?: LastfmArtist | LastfmArtist[] } }>("user.getTopArtists", {
    user: lastfmUsername(),
    period,
    limit: String(limit),
  });
  const artist = data.topartists?.artist;
  if (!artist) return [];
  return Array.isArray(artist) ? artist : [artist];
}

export async function getRecentTracks(limit = 12): Promise<LastfmTrack[]> {
  const data = await request<{ recenttracks?: { track?: LastfmTrack | LastfmTrack[] } }>("user.getRecentTracks", {
    user: lastfmUsername(),
    limit: String(limit),
  });
  const track = data.recenttracks?.track;
  if (!track) return [];
  return Array.isArray(track) ? track : [track];
}
