# Spotify 30-second previews: availability, terms, and cover art

Research for [#22](https://github.com/jwstn/personal-website/issues/22), part of the
[isometric cassette player map](https://github.com/jwstn/personal-website/issues/12).
All sources checked **26 November 2026**. Figures marked "measured" were taken in this
worktree's environment on that date and will drift as Spotify, Apple and Deezer change
their platforms.

## Bottom line

**No — do not build the mixtape on Spotify previews.** A Spotify app created now cannot
get 30-second preview URLs. Spotify withdrew them for new Web API use cases on
**27 November 2024**, left `preview_url` in the schema as **Deprecated / Nullable**, and
has shipped no replacement. In practice the field is `null` for apps created after that
date, including single-track `GET /tracks/{id}` responses, not just the "multi-get
responses" named in the announcement.

The other answers, in order:

1. **Availability:** legacy extended-quota apps created before 27 Nov 2024 may still
   receive a preview URL for some tracks, and old `p.scdn.co` MP3 URLs still play. That
   does not help this project: a new personal app is in Development Mode, and
   Development Mode was explicitly included in the 2024 cut-off.
2. **Playback:** where a legacy URL exists, it is a plain 30-second MP3 with
   `Access-Control-Allow-Origin: *`, so it plays in a bare `<audio>` element and can be
   hotlinked. No proxy is needed. Spotify's terms forbid caching or redistributing the
   audio, and require a link back to the track — the clip cannot be a standalone service.
3. **Auth:** a catalog search uses the Client Credentials flow (server-to-server, no user
   login, no scopes). Tokens last 3,600 s. Search is capped at `limit=10` since February
   2026. Spotify's rate limit is a rolling 30-second window with `429` + `Retry-After`;
   Development Mode also has quota buckets. Only organizations with 250k+ MAU can get
   Extended Quota Mode, so a personal site is permanently in the Development sandbox.
4. **Cover art:** `i.scdn.co` is hotlinkable and sends `Access-Control-Allow-Origin: *`,
   so a build script *can* fetch it. The terms do **not** permit using it to extract a
   dominant colour: cover art may not be downloaded, must stay in its original form, and
   Spotify content may not be analysed or used to create derivative works. CORS is not
   the blocker — the licence is.
5. **Fallback:** **Apple's iTunes Search API** is the only one of the three that is
   usable, and only under Apple's promo rules: stream the 30-second AAC preview, do not
   download/cache it, show an Apple-supplied "Listen on Apple Music" badge next to the
   player, link each track to its Apple Music page, and credit "provided courtesy of
   iTunes". **Deezer is ruled out**: its current terms require approval, forbid combining
   content with visual media, allow sound recordings only through the Deezer widget, and
   its preview URLs are signed and expire in **15 minutes** — unusable at build time.

For the cassette player that means: Apple previews in a plain `<audio>` element, a
hand-picked accent colour per tape (not sampled from artwork), and an Apple Music badge
and link in the player UI. If the badge/promo framing is unacceptable for a decorative
hero, the honest fallback is a silent cassette that links out, or the YouTube route from
[#14](https://github.com/jwstn/personal-website/issues/14) with its visible-player
constraint.

## 1. Does Spotify still return `preview_url` in 2026?

### The short version

- The field still exists in the API reference but is marked **Deprecated** and
  **Nullable**: "A link to a 30 second preview (MP3 format) of the track. Can be `null`"
  ([Get Track](https://developer.spotify.com/documentation/web-api/reference/get-track),
  [Search](https://developer.spotify.com/documentation/web-api/reference/search)).
- The reference also carries the policy note: **"Spotify Audio preview clips can not be a
  standalone service"** (same pages).
- The 2024 announcement is explicit that the change applies to new use cases, including
  existing Development Mode apps:

  > Effective today, ***new*** Web API use cases will no longer be able to access or use
  > the following endpoints and functionality in their third-party applications.
  > Applications with existing extended mode Web API access that were relying on these
  > endpoints remain unaffected by this change.
  >
  > […]
  >
  > 7. [30-second preview URLs](https://developer.spotify.com/documentation/web-api/reference/get-track),
  >    in multi-get responses (`SimpleTrack` object)
  >
  > These changes will impact the following Web API applications:
  >
  > - Existing apps that are still in [development mode](https://developer.spotify.com/documentation/web-api/concepts/quota-modes)
  >   without a pending extension request
  > - New apps that are registered on or after today's date
  >
  > — [Spotify, "Introducing some changes to our Web API", 27 Nov 2024](https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api)

  Note the scoping: the blog names **multi-get responses / `SimpleTrack`**. Spotify did
  not publish a second announcement saying single-track `GET /tracks/{id}` was included.
  But the field is now deprecated, and developer reports from the same week show
  `GET /tracks/{id}` returning `preview_url: null` for a new app
  ([Stack Overflow, 29 Nov 2024](https://stackoverflow.com/questions/79237053/android-spotify-api-preview-url-for-tracks-is-suddenly-being-returned-as-null)).
  Projects built in 2026 state the same conclusion plainly — e.g. "`preview_url`, which
  is null for apps created after 2024-11-27"
  ([liner-notes #24](https://github.com/josefdc/liner-notes/issues/24)) and "Spotify's
  `preview_url` is null for newer apps"
  ([lyrics-guesser #5](https://github.com/daniolsk/lyrics-guesser/pull/5)).
  Treat the single-track field as unavailable too; the official schema no longer promises
  it.

### Timeline

| Date | What changed | Source |
| --- | --- | --- |
| **27 Nov 2024** | New Web API use cases lose Related Artists, Recommendations, Audio Features, Audio Analysis, Featured/Category Playlists, **30-second preview URLs in multi-get responses**, and algorithmic playlists. Existing Extended Quota apps keep access. | [Spotify blog](https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api), [forum announcement](https://community.spotify.com/t5/Spotify-for-Developers/Changes-to-Web-API/td-p/6540414) |
| **15 May 2025** | Developer Terms v10 define "Audio Preview Clips" as 30-second clips and permit them under conditions (see §2), but Extended Quota access is restricted to organizations with 250k+ MAU. | [Developer Terms](https://developer.spotify.com/terms), [Quota modes](https://developer.spotify.com/documentation/web-api/concepts/quota-modes) |
| **11 Feb 2026** | New Development Mode apps restricted: Premium required, 1 Client ID, 5 users, smaller endpoint set. | [Spotify blog, 6 Feb 2026](https://developer.spotify.com/blog/2026-02-06-update-on-developer-access-and-platform-security) |
| **9 Mar 2026** | Existing Development Mode apps migrated to the same restrictions (endpoint changes were later postponed for existing integrations, but the account limits took effect). | same blog; [migration guide](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide) |
| **Jul 2026** | Client IDs per developer raised from 1 to 25. | [July 2026 changelog](https://developer.spotify.com/documentation/web-api/references/changes/july-2026) |
| **26 Nov 2026** | `preview_url` still documented as Deprecated/Nullable; the Feb/Mar/May/Jul 2026 changelogs do not restore it. | [Get Track](https://developer.spotify.com/documentation/web-api/reference/get-track), [changelog index](https://developer.spotify.com/documentation/web-api/references/changes/july-2026) |

The February 2026 field-removal list for Track is `available_markets`, `external_ids`
(reverted), `linked_from`, and `popularity` — **`preview_url` is not in that list**
([February 2026 changelog](https://developer.spotify.com/documentation/web-api/references/changes/february-2026)).
That is not a reprieve: it means the field remains in the schema as an optional, nullable,
deprecated value, not that new apps receive one.

### Is there a replacement?

No documented one. The 2024 change was a reduction in third-party access, not a migration
to a new preview endpoint. Spotify's own clients and embeds play full tracks; the Web
Playback SDK requires a Premium user and OAuth. Nothing in the 2025–2026 developer blog or
changelog introduces a replacement preview API.

## 2. If a preview URL exists, can it play in `<audio>`?

Yes. Legacy `p.scdn.co/mp3-preview/...` URLs are still live and behave like ordinary MP3
files.

Measured on 26 Nov 2026 against four preview URLs found in public example code:

| Check | Result |
| --- | --- |
| HTTP status | `200 OK` for all four |
| `Content-Type` | `audio/mpeg` |
| `Access-Control-Allow-Origin` | `*` |
| `Accept-Ranges` | `bytes` |
| `Cache-Control` | `max-age=604800, no-transform` (7 days) |
| Codec / duration (`ffprobe`) | MP3, **30.000 s** |

So:

- **A plain `<audio src="https://p.scdn.co/mp3-preview/…">` works.** CORS is open, range
  requests work, and no token or Referer is required. The URL is not signed and has no
  short expiry parameter; the public examples tested still work.
- **Hotlink it; do not proxy it.** A proxy adds no capability (CORS is already `*`) and
  turns a direct stream into something that looks like redistribution. Spotify's terms
  allow streaming, not copying.
- **Do not cache the audio.** The Developer Terms allow temporary local caching only of
  "metadata and cover art" (and Conditional Downloads for Premium subscribers); sound
  recordings are not included:

  > **Local caching.** Do not locally cache any Spotify Content, except as strictly
  > necessary to enhance the performance of your SDA and its functionality, and limited
  > to the temporary caching of: (1) metadata and cover art; or (2) Conditional Downloads
  > of sound recordings. […]
  >
  > — [Developer Terms §IV.3.2](https://developer.spotify.com/terms)

- **Link back and keep it non-standalone.** If Audio Preview Clips are used at all:

  > - You may only make Audio Preview Clips available for streaming in the territories in
  >   which the corresponding full length track is available.
  > - Audio Preview Clips may only be used to promote the underlying content and not for
  >   personalization or messaging products, podcasts or similar products.
  > - Audio Preview Clips must be accompanied by a link back to the applicable content or
  >   playlist on the Spotify Service.
  > - You must not offer Audio Preview Clips as a standalone service or product.
  >
  > — [Developer Policy §V](https://developer.spotify.com/policy)

  The API reference repeats the last point as "Spotify Audio preview clips can not be a
  standalone service" ([Get Track](https://developer.spotify.com/documentation/web-api/reference/get-track)).

- **"Promote the underlying content" is doing real work in that sentence.** A cassette
  player whose main purpose is the listening experience, with the Spotify link buried, is
  a weaker fit than a player that visibly drives traffic to the track. This matters for
  the Apple fallback too.

None of this is a path forward for a new app, because there is no URL to hotlink. It
matters only if the project ever inherits a pre-2024 Extended Quota app.

## 3. Auth and rate limits for a simple track search

If the project ever needed Spotify metadata (not previews), the minimum is:

1. **Create an app** in the [developer dashboard](https://developer.spotify.com/dashboard).
   Development Mode requires the app owner to have an active Spotify Premium
   subscription, allows 5 authenticated users, and (since July 2026) up to 25 Client IDs
   ([Quota modes](https://developer.spotify.com/documentation/web-api/concepts/quota-modes)).
2. **Get a token** with the Client Credentials flow:

   ```http
   POST https://accounts.spotify.com/api/token
   Authorization: Basic base64(client_id:client_secret)
   Content-Type: application/x-www-form-urlencoded

   grant_type=client_credentials
   ```

   The response contains `access_token`, `token_type: "Bearer"`, and `expires_in: 3600`
   ([Client Credentials Flow](https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow)).
   This flow is server-to-server and cannot access user data, which is exactly what a
   catalog search needs. No scopes are involved.

3. **Search** with `GET https://api.spotify.com/v1/search?q=…&type=track&limit=10&market=…`.
   Since February 2026 the maximum `limit` is **10** (default 5), down from 50; paginate
   with `offset` if needed
   ([February 2026 changelog](https://developer.spotify.com/documentation/web-api/references/changes/february-2026)).
   Supply `market`, otherwise Spotify treats the content as unavailable for the client
   ([Search reference](https://developer.spotify.com/documentation/web-api/reference/search)).

**Rate limits:** Spotify calculates a limit over a rolling **30-second window**. The
number varies by app mode and is not published as a fixed figure. Exceeding it returns
`429`, normally with a `Retry-After` header. Development Mode apps also have separate
quota buckets counted per developer account, returning `429` with
`"reason": "QUOTA_EXCEEDED"`
([Rate limits](https://developer.spotify.com/documentation/web-api/concepts/rate-limits),
[Quota modes](https://developer.spotify.com/documentation/web-api/concepts/quota-modes)).

For a curated mixtape of 5–8 tracks, a build-time token + one search/lookup per track is
trivially inside any limit. Do not call Spotify per visitor from the browser: the Client
Secret cannot be exposed, and a public site would burn the Development quota.

**Can a personal site get a higher quota?** Practically no. Since 15 May 2025 Extended
Quota Mode is only open to organizations (not individuals) with a launched service,
250k+ MAU, presence in key markets, and commercial viability
([Quota modes](https://developer.spotify.com/documentation/web-api/concepts/quota-modes);
[2025 criteria update](https://developer.spotify.com/blog/2025-04-15-updating-the-criteria-for-web-api-extended-access)).
A personal portfolio stays in Development Mode, which is explicitly "for learning,
experimentation, and personal projects for non-commercial use"
([Feb 2026 blog](https://developer.spotify.com/blog/2026-02-06-update-on-developer-access-and-platform-security)).
That is another reason not to make Spotify a production dependency.

## 4. Cover art and the dominant-colour idea

### What the CDN allows

`i.scdn.co` serves album art without auth and with permissive CORS. Measured on
26 Nov 2026:

```http
HTTP/2 200
content-type: image/jpeg
cache-control: max-age=15780000
access-control-allow-origin: *
access-control-allow-methods: GET
access-control-allow-headers: range
```

`max-age=15780000` is about six months. So a browser-side `fetch`/canvas colour sampler
would not be blocked by CORS, and a build-time Node script could download the image
trivially. **CORS is not the constraint.**

### What the terms allow

The terms do not permit using the artwork as raw material for a colour palette:

- The API reference's policy notes for [Get Track](https://developer.spotify.com/documentation/web-api/reference/get-track)
  say: **"Spotify content may not be downloaded"**, **"Keep visual content in its original
  form"**, **"Ensure content attribution"**, and **"Spotify content may not be used to
  train machine learning or AI model"**.
- The Developer Terms prohibit derivative works, with only a narrow sizing exception:

  > **Misuse of the Spotify Platform.** Do not misuse the Spotify Platform, including by
  > […] modifying, editing, altering, creating derivative works, disassembling,
  > decompiling, reverse-engineering, or extracting source code from the Spotify Platform
  > […], Spotify Service, or Spotify Content (except to the extent such restrictions are
  > expressly prohibited by law). **You may adjust the size of metadata or cover art as
  > necessary[.]**
  >
  > — [Developer Terms §IV.2.1.2](https://developer.spotify.com/terms)

- The Developer Policy is broader still:

  > **Do not analyze the Spotify Content or the Spotify Service for any purpose**,
  > including without limitation, creating new or derived listenership metrics,
  > benchmarking, functionality, usage statistics, user metrics, or building profiles of
  > users […]
  >
  > — [Developer Policy §III](https://developer.spotify.com/policy)

- If the art is displayed at all, it must be attributed and linked back, and must not be
  offered as a standalone product:

  > Metadata, cover art and Audio Preview Clips must be accompanied by a link back to the
  > applicable album, content or playlist on the Spotify Service.
  >
  > You must not offer metadata, cover art, and/or Audio Preview Clips as a standalone
  > service or product.
  >
  > — [Developer Policy §II](https://developer.spotify.com/policy)

**Verdict:** technically yes, contractually no. Downloading Spotify art at build time to
compute a dominant colour is exactly the kind of "download + analyse + derivative" the
terms prohibit, even though the resulting hex value is not itself a copy of the image.
Do not ship it.

### What to do instead

- Store a **hand-picked `accent` hex per track** in the mixtape config. That is a design
  decision, not an automated derivative of the artwork.
- If the cassette should show the cover, show it **unmodified**, small, with attribution
  and a link back to the track. Don't blur it, tint it, or run it through a filter if you
  want to stay inside "keep visual content in its original form".
- If the design needs an automatic palette, source the image from a work whose licence
  clearly permits reuse and modification — not from Spotify or Apple artwork.

## 5. Fallbacks if Spotify previews are unavailable

### Comparison

| | **Spotify Web API** | **Apple iTunes Search API** | **Deezer API** |
| --- | --- | --- | --- |
| Key / approval | Client ID + secret; app in Development Mode; owner needs Premium | **No key**; public endpoint | Current terms require an approved developer account; simple search is currently reachable without a key, but the terms assume approval |
| Preview format | MP3, 30 s (legacy URLs only) | AAC in `.m4a`, ~30 s | MP3, 30 s |
| Preview URL lifetime | Legacy URLs long-lived, unsigned | Unsigned; no documented expiry | **Signed, 15 minutes** (measured) |
| CORS | `*` | `*` | `*` |
| Rate limit | Rolling 30 s window; Development quota | **~20 calls/min** | Quotas set by Deezer; not published on the public pages we could read without login |
| Terms fit for this hero | **No** — no previews for new apps | **Yes, with conditions** — promo only, badge, attribution, stream only, no caching | **No** — no visual combination, widget-only audio, no local copies |
| Verdict | Rule out | **Recommended fallback** | Rule out |

### Apple iTunes Search API (recommended)

**What it is:** a public JSON search/lookup API with no key and no OAuth. A track result
includes a 30-second `previewUrl` and artwork URLs
([Apple Search API documentation](https://performance-partners.apple.com/search-api);
the older [iTunes Search API archive](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html)
documents the same fields).

Example measured on 26 Nov 2026:

```json
{
  "trackName": "Creep (Acoustic)",
  "artistName": "Radiohead",
  "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/…/….plus.aac.p.m4a",
  "artworkUrl100": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/…/100x100bb.jpg",
  "trackViewUrl": "https://music.apple.com/us/album/creep-acoustic/1679849414?i=1679849823&uo=4"
}
```

Measured headers on the preview URL:

| Check | Result |
| --- | --- |
| HTTP status | `200 OK` |
| `Content-Type` | `audio/x-m4p` |
| `Access-Control-Allow-Origin` | `*` |
| `Accept-Ranges` | `bytes` |
| `Cache-Control` | `private` |
| Codec / duration (`ffprobe`) | AAC, **30.015 s**, unencrypted |

So it plays in `<audio>` and can be hotlinked. The `audio/x-m4p` MIME type looks alarming
but the file is plain AAC in an MP4 container; `ffprobe` reports `codec_name=aac` and no
encryption. AAC/MP4 playback is supported by current Safari, Chrome, Edge and Firefox
(Firefox relies on the platform decoder; test the target browsers if Linux Firefox is a
priority).

**The catch is the licence, not the technology.** Apple's Search API legal text:

> Developers may use certain promotional content as may be provided by Apple, including
> previews of songs and music videos, album art, and App icons ("**Promo Content**"), for
> the purposes of promoting the subject of the Promo Content; provided such Promo
> Content: (i) is placed only on pages that promote the content on which the Promo Content
> is based; (ii) is proximate to a "Download on iTunes", "Download on App Store" or
> "Download on iBooks Store" badge (as approved by Apple) that acts as a link directly to
> pages within iTunes or the App Store where consumers can purchase the promoted content;
> (iii) includes attribution indicating the Promo Content was "provided courtesy of
> iTunes" if such Promo Content includes song or music video previews; (iv) is streamed
> only, and not downloaded, saved, cached, or synchronized with video, if such Promo
> Content includes song or music video previews; (v) is not used for independent
> entertainment value apart from its promotional purpose; and (vi) is not used to promote
> any other goods or services.
>
> — [Apple Search API, Legal](https://performance-partners.apple.com/search-api)

Practical checklist for the cassette player:

- **Stream only.** Put the `previewUrl` straight in `<audio src>`; no download, no
  transcode, no committed audio file, no service-worker/offline cache. A normal browser
  HTTP cache is unavoidable, but don't add another one.
- **Badge.** Use Apple's current **"Listen on Apple Music"** badge, unmodified, from
  Apple's identity guidelines; minimum 30 px, one badge, not dominant, clear space around
  it. The badge must link to Apple Music
  ([Apple Music Identity Guidelines §1](https://www.apple.com/itunes/marketing-on-music/identity-guidelines.html)).
  The Search API legal text names the older "Download on iTunes" badge; the current Apple
  Music badge is the approved equivalent for music links. Don't draw your own.
- **Link each tape to its store page.** The result's `trackViewUrl` is the direct Apple
  Music link; keep the badge and the link proximate to the player and to the track being
  previewed. Apple requires the page to *promote* the content, not just host a player.
- **Attribution.** Include the exact phrase **"provided courtesy of iTunes"** for the song
  previews. Put it in the player's small print, visible without a tooltip.
- **No other goods/services.** Don't wrap the player in advertising, affiliate offers, or
  unrelated promotion. The portfolio itself is fine; a sponsor block next to the cassette
  would not be.
- **Artwork.** `artworkUrl100` is hotlinkable and CORS-open, but it is also Promo Content
  and subject to the same "promote the content" limit. Display it unmodified next to the
  badge/link if wanted; do not download it to sample a colour. The manual `accent` colour
  approach from §4 avoids the question entirely.
- **Rate limit.** About **20 calls per minute** (documented, "subject to change"). A
  build-time lookup of 5–8 curated tracks is fine. Don't call it per visitor; cache the
  metadata (Apple explicitly suggests caching search/lookup requests for large sites) and
  re-fetch at build time.

**Compliance caveat.** The phrase "not for entertainment purposes" / "not used for
independent entertainment value apart from its promotional purpose" is the weak point for
a decorative cassette hero. A player whose main job is to look and sound nice, with the
Apple Music link treated as a footnote, is arguably independent entertainment. To stay on
the right side of the terms, make the store link and badge a visible part of the
interaction ("listen to the preview, then hear the full track on Apple Music"), not a
hidden legal afterthought. If that compromises the design, choose the silent-cassette
option instead.

**Heavier alternative:** the [Apple Music API](https://developer.apple.com/documentation/applemusicapi/)
(through MusicKit) has documented preview attributes and a proper developer agreement,
but requires an Apple Developer Program membership, a MusicKit identifier and a signed
developer token. That is more setup than a personal hero justifies, and the content-use
terms are still Apple's.

### Deezer API (ruled out)

Deezer looks tempting: a search returns a 30-second MP3 `preview`, no key is needed today,
and the CDN sends `Access-Control-Allow-Origin: *`. Two problems kill it.

**1. The preview URLs expire in 15 minutes.** Measured on 26 Nov 2026, the `hdnea` query
string carries `exp=` exactly 900 seconds ahead of the request time:

```text
https://cdnt-preview.dzcdn.net/api/1/1/b/9/c/0/….mp3?hdnea=exp=1795721145~acl=…~hmac=…
```

A static Astro build cannot embed that URL: it is dead before the deploy finishes. You
would have to fetch a fresh URL server-side at play time, which turns a static site into a
runtime service and still does not solve the terms problem.

**2. The current terms forbid this exact use.** The Deezer developer terms were last
updated **27 October 2026** and are much stricter than the old "simple API":

> **III.2 No combination with visual or audiovisual content**: The Developer shall not
> combine any Content with visual or audiovisual images.
>
> **III.3 No access or use of sound recordings outside of the widget.** Access by users to
> sound recordings (whether excerpts or full-length sound recordings) through the
> Developer's Webpages and/or Applications is only authorised through the Deezer Widget,
> to the exclusion of any other use or access.
>
> **III.4 No creation of Content database, no local copy.** […] The Developer is not
> authorised either to make any local copy of any Content […]
>
> **III.10 No modification.** The Developer is not authorised to modify, edit, disassemble,
> decompile, create derivative works or reverse-engineer the Services or the Content […]
>
> — [Deezer Terms of Use](https://developers.deezer.com/termsofuse)

Access is also described as selective and subject to approval (Section II), and the
guidelines repeat that local/offline storage of audio is "strictly forbidden"
([Deezer guidelines](https://developers.deezer.com/guidelines)). A cassette player is
visual content, plays audio outside the Deezer widget, and would use the artwork — three
separate violations. **Do not use Deezer for this.**

### What about the Spotify embed or YouTube?

- A **Spotify embed** is the compliant way to put Spotify audio on a page, but it is an
  iframe with Spotify's own player chrome, not a URL you can feed to `<audio>`. It would
  have to be visible in the hero, which fights the cassette design; and its preview/full
  track behaviour for logged-out listeners would need separate verification. Treat it as
  a different product decision, not a preview-URL fallback.
- The **YouTube IFrame** route from [#14](https://github.com/jwstn/personal-website/issues/14)
  is known to work, but it reintroduces a visible video player and the autoplay/gesture
  constraints documented there. It is the fallback if "video-free" is negotiable and
  Apple's promo framing is not.

## 6. Recommendation for the cassette player

**Use Apple iTunes Search API previews, with a curated, build-time data file and a manual
palette.**

Suggested shape:

```ts
// mixtape.config.ts — authored by hand
export const tracks = [
  {
    title: "…",
    artist: "…",
    appleTrackId: 1679849823,   // find once via /search, verify by ear
    accent: "#b4462f",          // hand-picked; do not sample the artwork
  },
  // …
];
```

At build time (Astro frontmatter or an integration):

1. For each `appleTrackId`, call
   `https://itunes.apple.com/lookup?id=<id>&country=<market>` (one request per track, or a
   comma-separated `id` list) and read `previewUrl`, `artworkUrl100`, `trackViewUrl`,
   `trackName`, `artistName`.
2. Fail the build (or mark the tape "preview unavailable") if `previewUrl` is missing;
   don't let a null slip into the player.
3. Render `<audio src={previewUrl} preload="none">` behind the cassette's play control.
   Hotlink; do not download, transcode, or commit the audio.
4. Show the **"Listen on Apple Music"** badge (Apple-supplied SVG, ≥30 px) next to or
   below the player, linking to `trackViewUrl`; add "Song previews provided courtesy of
   iTunes" in the player's small print.
5. Use `accent` for the tape shell/glow. If cover art is shown, show it unmodified, small,
   beside the badge — not blurred or tinted.
6. Handle the failure state: if the preview 404s or the browser can't decode AAC, show
   "Preview unavailable — listen on Apple Music" and keep the tape interaction working.
7. Rebuild periodically (or on deploy) so the preview URLs and artwork stay fresh; don't
   build a runtime proxy just to refresh them.

**Decision summary for the map:**

- Spotify previews: **no** for a new app. The 2024 cut-off is permanent for this project,
  and the field is deprecated even where legacy apps still see it.
- Apple previews: **yes, conditionally** — stream-only, badge + attribution + store link,
  no caching, page must be promotional. This is the recommended fallback.
- Deezer: **no** — 15-minute signed URLs and terms that forbid visual pairing and
  non-widget audio.
- Colour extraction: **no** from Spotify/Apple artwork. Store a hand-picked accent per
  tape instead.
- If Apple's promo requirements don't fit the design: ship the cassette as a silent,
  links-only object, or revisit the YouTube route with its visible-player constraint.

## References

Primary sources:

- Spotify, "Introducing some changes to our Web API", 27 Nov 2024 —
  <https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api>
- Spotify, "Update on Developer Access and Platform Security", 6 Feb 2026 —
  <https://developer.spotify.com/blog/2026-02-06-update-on-developer-access-and-platform-security>
- Spotify Web API, Get Track — <https://developer.spotify.com/documentation/web-api/reference/get-track>
- Spotify Web API, Search — <https://developer.spotify.com/documentation/web-api/reference/search>
- Spotify Web API, Quota modes — <https://developer.spotify.com/documentation/web-api/concepts/quota-modes>
- Spotify Web API, Rate limits — <https://developer.spotify.com/documentation/web-api/concepts/rate-limits>
- Spotify Web API, Client Credentials Flow —
  <https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow>
- Spotify Developer Terms (v10, effective 15 May 2025) — <https://developer.spotify.com/terms>
- Spotify Developer Policy — <https://developer.spotify.com/policy>
- Spotify Web API, February 2026 migration guide —
  <https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide>
- Spotify Web API, February 2026 changelog —
  <https://developer.spotify.com/documentation/web-api/references/changes/february-2026>
- Spotify Web API, July 2026 changelog —
  <https://developer.spotify.com/documentation/web-api/references/changes/july-2026>
- Apple, iTunes Search API —
  <https://performance-partners.apple.com/search-api>
- Apple, iTunes Search API (archive) —
  <https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html>
- Apple Music Identity Guidelines —
  <https://www.apple.com/itunes/marketing-on-music/identity-guidelines.html>
- Deezer, Terms of Use (last updated 27 Oct 2026) —
  <https://developers.deezer.com/termsofuse>
- Deezer, Developer Guidelines — <https://developers.deezer.com/guidelines>

Secondary corroboration (not relied on for the conclusion, but consistent):

- Stack Overflow, "Android: Spotify API preview_url for tracks is suddenly being returned
  as null", 29 Nov 2024 —
  <https://stackoverflow.com/questions/79237053/android-spotify-api-preview-url-for-tracks-is-suddenly-being-returned-as-null>
- `josefdc/liner-notes` #24, "resolve tracks by ISRC — Spotify identity, Deezer preview by
  ISRC" (2026) — <https://github.com/josefdc/liner-notes/issues/24>
- `daniolsk/lyrics-guesser` #5, "Play a song preview from the cover art" (2026) —
  <https://github.com/daniolsk/lyrics-guesser/pull/5>

Measured in this worktree on 26 Nov 2026:

- `curl -sIL -H 'Origin: https://example.com'` against Spotify `p.scdn.co` preview URLs,
  Spotify `i.scdn.co` artwork, Apple `audio-ssl.itunes.apple.com` previews, Apple
  `is1-ssl.mzstatic.com` artwork, Deezer `cdnt-preview.dzcdn.net` previews, and Deezer
  `cdn-images.dzcdn.net` artwork.
- `ffprobe` on a Spotify preview (MP3, 30.000 s) and an Apple preview (AAC, 30.015 s).
- Deezer `preview` URL `exp=` parameter compared with the request time (900 s).
