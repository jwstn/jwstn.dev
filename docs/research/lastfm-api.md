# Last.fm API for a public "listening stats" page

Research for [#24](https://github.com/jwstn/personal-website/issues/24) — the `/music` route
showing the top three artists of the last month and a list of recent scrobbles with a
"now playing" state. All sources checked **27 November 2026**.

No Last.fm API key was available in this worktree, so the API could not be exercised with a
valid key. Successful response shapes below are quoted from JSON captures posted on Last.fm's
own support forum; error responses, CORS headers, CDN headers and the `/resources` 404 were
measured live with `curl`. Anything marked "measured" will drift.

## Bottom line

**The API fits this page almost exactly, but the access terms changed four days before this
research.** Two ordinary read calls do the job — `user.getTopArtists?period=1month&limit=3`
and `user.getRecentTracks?limit=10` — using a plain `api_key` query parameter, with no OAuth
and no user session. But from **1 December 2026** the account that owns the key must have
**Last.fm Pro** (displayed as €4.99/month or €49.99/year on 27 Nov 2026); without it, "all API
methods other than those required for scrobbling will stop working until you subscribe"
([announcement](https://support.last.fm/t/121030),
[update](https://support.last.fm/t/121188)). Existing keys are affected too.

Cache the responses server-side. Last.fm's own guidance is explicit: "if you're making a web
application, try not to hit the API on page load", and an application "continuously making
several calls per second" risks suspension ([API introduction](https://www.last.fm/api/intro)).
Two calls per cache window is effectively free; calling per visitor is not.

Attribution is mandatory, but the asset the terms prescribe is gone. The API TOS requires a
button "saying 'powered by AudioScrobbler'" from `last.fm/resources`, which now returns **404**
(measured). Use a visible text credit linking to the Last.fm profile plus per-item links to
Last.fm catalogue pages, and treat logo use as needing written approval. Also do **not** design
the page around Last.fm artwork: artist images are not available through the API by design,
album art is frequently a placeholder or an empty string, and the TOS expressly excludes
images and artwork from the data licence (clause 5.1.8).

## Method and sources

Primary sources (Last.fm's own documentation and legal pages):

- [Last.fm API home](https://www.last.fm/api), [Introduction](https://www.last.fm/api/intro),
  [REST Requests](https://www.last.fm/api/rest), [Authentication](https://www.last.fm/api/authentication),
  [Authentication spec](https://www.last.fm/api/authspec)
- Method pages: [user.getInfo](https://www.last.fm/api/show/user.getInfo),
  [user.getRecentTracks](https://www.last.fm/api/show/user.getRecentTracks),
  [user.getTopArtists](https://www.last.fm/api/show/user.getTopArtists),
  [user.getTopAlbums](https://www.last.fm/api/show/user.getTopAlbums),
  [user.getTopTracks](https://www.last.fm/api/show/user.getTopTracks),
  [artist.getInfo](https://www.last.fm/api/show/artist.getInfo),
  [album.getInfo](https://www.last.fm/api/show/album.getInfo),
  [track.getInfo](https://www.last.fm/api/show/track.getInfo)
- [API Terms of Service](https://www.last.fm/api/tos) (current page, fetched 27 Nov 2026)
- [Last.fm Pro](https://www.last.fm/pro) (price as displayed 27 Nov 2026)
- Official support announcements: [API keys will require Pro from 1st December](https://support.last.fm/t/121030),
  [API Update: Pro will not be required to use scrobbling methods](https://support.last.fm/t/121188)

Secondary / captured responses (used only where the docs are silent, and labelled as such):

- Forum JSON captures: [recent tracks + now playing + image sizes](https://support.last.fm/t/71447),
  [placeholder artwork and empty image strings](https://support.last.fm/t/56953),
  [broken/wrong album art in 2026](https://support.last.fm/t/118797),
  [large page sizes truncate artwork](https://support.last.fm/t/40482),
  [limit bounds observed as 1–1000](https://support.last.fm/t/50866),
  [error 8 outage of user methods, 26 Nov 2026](https://support.last.fm/t/121174),
  [same outage, now-playing widget](https://support.last.fm/t/121183)
- Recorded real responses in the `pylast` test cassettes (`userplaycount`, `no such page`) —
  useful as evidence of field names, not as policy.
- Wayback snapshots of the TOS showing the old numeric rate limit:
  [15 Apr 2017](https://web.archive.org/web/20170415091018/https://www.last.fm/api/tos),
  [13 May 2020](https://web.archive.org/web/20200513105707/https://www.last.fm/api/tos)

Measured live on 27 Nov 2026:

- `curl -I` against `https://ws.audioscrobbler.com/2.0/` with an invalid key and with no key.
- `curl -I` against a `lastfm.freetls.fastly.net` artwork URL.
- `curl` against `https://www.last.fm/resources` (404).

## 1. Base URL, response format, authentication

| Item | Answer |
| --- | --- |
| API root | `https://ws.audioscrobbler.com/2.0/` |
| Transport | `GET` with query parameters for read methods; `POST` for write methods |
| Default format | XML (`<lfm status="ok">…</lfm>`) |
| JSON | add `format=json`; response is `application/json` |
| JSONP | add `callback=fn`; response becomes `text/javascript` (documented, legacy) |
| Auth for reads | `api_key` query parameter only — **no OAuth, no session key, no signature** |
| Secret | only used to sign authenticated/write calls (`api_sig`, MD5 of sorted params + secret) |
| User-Agent | an identifiable one is requested by Last.fm |

The docs still give the root as `http://ws.audioscrobbler.com/2.0/`
([REST Requests](https://www.last.fm/api/rest)), but HTTPS works and returns the same JSON
error envelope (measured). Use `https://` explicitly.

Every call needs `method` and `api_key`:

```http
GET https://ws.audioscrobbler.com/2.0/?method=user.getTopArtists&user=jwstn&period=1month&limit=3&api_key=…&format=json
```

The method pages say, for each read method: **"This service does not require
authentication."** The authentication guide adds that "All write services require
authentication" ([Authentication](https://www.last.fm/api/authentication)). So a public
profile page needs one key and nothing else. Read calls are not signed: the `api_sig` MD5
construction in the [auth spec](https://www.last.fm/api/authspec) applies to authenticated
calls (`auth.getSession`, scrobbling, love/unlove, tag edits).

**Pro requirement.** The docs still say "Our API is available to anyone"
([API home](https://www.last.fm/api)), which is now out of date. The official announcement is
authoritative:

> From the 1st December, holding a Last.fm API key will require a Last.fm Pro subscription.
> Creating a new key will require a Pro account, and without it all API methods other than
> those required for scrobbling will stop working until you subscribe. This applies to whoever
> owns the key in the app or service.
>
> — [Last.fm, 18 Nov 2026](https://support.last.fm/t/121030)

The 26 Nov follow-up keeps only these methods free of Pro: `track.scrobble`,
`track.updateNowPlaying`, `track.removeNowPlaying`, `auth.getSession`, `auth.getToken`. It also
confirms that "if you want to use any API methods other than the above, or you want to create a
new API key, a Pro account will be required"
([update](https://support.last.fm/t/121188)). Read methods such as `user.getTopArtists` and
`user.getRecentTracks` are therefore Pro-only from 1 Dec 2026. Visitors to the site do not need
Pro; only the account that owns the key does. The displayed price on 27 Nov 2026 was
**€4.99/month or €49.99/year** ([Last.fm Pro](https://www.last.fm/pro)); pricing is localised.

The API account page (`/api/account/create`) requires a Last.fm login, and from 1 Dec 2026 a
Pro account.

## 2. Endpoints

| Need | Method | Required params | Optional params | Returns |
| --- | --- | --- | --- | --- |
| Profile / total scrobbles | `user.getInfo` | `api_key` (and `user` in practice) | — | `name`, `realname`, `url`, `image`, `country`, `playcount`, `registered`, `subscriber` |
| Recent scrobbles + now playing | `user.getRecentTracks` | `user`, `api_key` | `limit`, `page`, `from`, `to`, `extended` | `recenttracks.track[]`, `recenttracks.@attr` |
| Top artists | `user.getTopArtists` | `user`, `api_key` | `period`, `limit`, `page` | `topartists.artist[]` |
| Top albums | `user.getTopAlbums` | `user`, `api_key` | `period`, `limit`, `page` | `topalbums.album[]` |
| Top tracks | `user.getTopTracks` | `user`, `api_key` | `period`, `limit`, `page` | `toptracks.track[]` |
| Per-item detail | `artist.getInfo` / `album.getInfo` / `track.getInfo` | names or `mbid`, `api_key` | `username`, `autocorrect`, `lang` | item + `userplaycount` when `username` given |

All five user methods are documented as not requiring authentication. `user.getInfo` with no
`user` defaults to the authenticated user, which is not useful here — always pass `user`.

### Periods

`user.getTopArtists`, `user.getTopAlbums` and `user.getTopTracks` accept:

```
overall | 7day | 1month | 3month | 6month | 12month
```

`overall` is the default. There is no `30day` value; `1month` is the only match for a "last 30
days" stat. Last.fm does not document the exact start/end boundary of `1month` — treat it as a
rolling period ending at request time, not a fixed calendar month. If a precise 30×24-hour
window is a hard requirement, the only API route is to page through `user.getRecentTracks` with
`from`/`to` and aggregate locally; that is many requests and loses Last.fm's per-item
`playcount`.

### Pagination and limits

`user.getRecentTracks`:

- `limit` defaults to **50**, documented maximum **200**; `page` defaults to 1.
- `from` / `to` are UNIX timestamps in **UTC seconds**; `from` is exclusive-ish ("only display
  scrobbles after this time"), `to` before.
- `extended=1` adds extended artist data and a `loved` flag per track.
- The response's `recenttracks.@attr` carries `user`, `page`, `perPage`, `totalPages`, `total`.

`user.getTopArtists` / `getTopAlbums` / `getTopTracks`:

- `limit` defaults to **50**; **no maximum is documented** on the method pages.
- `page` defaults to 1.
- In practice the API has accepted `limit` up to 1000 (`limit param out of bounds (1-1000)`
  reported in 2021, [forum](https://support.last.fm/t/50866)), but large pages are unreliable:
  advice quoted in a related thread was to request "10 pages of 100" rather than "1 page of
  1000", and artwork frequently comes back empty at high limits
  ([forum](https://support.last.fm/t/40482)). For this page just use `limit=3`; for a longer
  list, page at ≤200.

Pagination is the same for all list methods: increment `page`, stop when `page > totalPages`.
Numbers in JSON are strings.

### "Now playing"

`user.getRecentTracks` includes the currently playing track as the first item with
`"@attr": { "nowplaying": "true" }` and **no `date` object**. The method description says it
"includes the currently playing track with the `nowplaying="true"` attribute if the user is
currently listening" ([docs](https://www.last.fm/api/show/user.getRecentTracks)). A captured
response confirms the shape ([forum](https://support.last.fm/t/71447)):

```json
{
  "recenttracks": {
    "track": [
      {
        "artist": { "mbid": "…", "#text": "Tunturia" },
        "streamable": "0",
        "image": [
          { "size": "small", "#text": "https://lastfm.freetls.fastly.net/i/u/34s/….jpg" },
          { "size": "medium", "#text": "https://lastfm.freetls.fastly.net/i/u/64s/….jpg" },
          { "size": "large", "#text": "https://lastfm.freetls.fastly.net/i/u/174s/….jpg" },
          { "size": "extralarge", "#text": "https://lastfm.freetls.fastly.net/i/u/300x300/….jpg" }
        ],
        "mbid": "a70d6d7a-e0e8-3bcc-9d6b-e01f97e2217f",
        "album": { "mbid": "…", "#text": "Invisible City" },
        "name": "Discovery",
        "@attr": { "nowplaying": "true" },
        "url": "https://www.last.fm/music/Tunturia/_/Discovery"
      },
      {
        "artist": { "mbid": "", "#text": "Pink Floyd" },
        "name": "Shine on You Crazy Diamond",
        "url": "https://www.last.fm/music/Pink+Floyd/_/Shine+on+You+Crazy+Diamond",
        "date": { "uts": "1332833163", "#text": "27 Mar 2012, 07:26" }
      }
    ],
    "@attr": { "user": "People20", "totalPages": "189701", "page": "189701", "perPage": "1", "total": "189701" }
  }
}
```

`nowplaying` is the string `"true"`, not a boolean. The now-playing item has no `date.uts`.

## 3. Rate limits and caching

**There is no current published numeric limit.** The API introduction says only:

> Please use an identifiable User-Agent header on all requests. … Be reasonable in your usage
> of the API and ensure you don't make an excessive number of calls … if you're making a web
> application, try not to hit the API on page load. Your account may be suspended if your
> application is continuously making several calls per second or if you're making excessive
> calls.
>
> — [API Introduction](https://www.last.fm/api/intro)

The current TOS repeats that limits are discretionary:

> Last.fm sets and enforces limits on use of the API to prevent abuse and ensure reliability of
> service (e.g. limiting the number of API requests that you may make or the number of users
> you may serve), in our sole discretion.
>
> — [API TOS §4.4](https://www.last.fm/api/tos)

The widely quoted **5 requests per second, averaged over 5 minutes** is historical. The 2011,
2014 and 2017 TOS snapshots said:

> You will not make more than 5 requests per originating IP address per second, averaged over a
> 5 minute period, without prior written consent. You agree to cache similar artist and any
> chart data (top tracks, top artists, top albums) for a minimum of one week.
>
> — [TOS, 15 Apr 2017](https://web.archive.org/web/20170415091018/https://www.last.fm/api/tos)

By the [May 2020 snapshot](https://web.archive.org/web/20200513105707/https://www.last.fm/api/tos)
that clause had been replaced by the discretionary wording above, and the one-week chart cache
requirement was gone. Do not build to 5/s as if it were a guaranteed allowance; build well
under it and cache.

Rate-limit responses use error code **29** ("Rate limit exceeded — Your IP has made too many
requests in a short period"), listed on every method page. A user report shows the HTTP status
as **429** ([forum](https://support.last.fm/t/43159)); the docs themselves do not state the HTTP
status.

**Caching is contractually expected.** The TOS requires it, and caps stored data:

> … the licence granted to You is temporary and restricted to a small portion of Last.fm Data
> available via the API, not to exceed the Reasonable Usage Cap in total at any time. … The
> "Reasonable Usage Cap" is a maximum of 100 MB … You will implement suitable caching in
> accordance with the HTTP headers sent with web service responses.
>
> — [API TOS §4.3.4](https://www.last.fm/api/tos)

The API's error responses carried no `Cache-Control` header in the live checks, so "in
accordance with the HTTP headers" gives little guidance on the API host. Treat the requirement
as: cache, don't poll, and don't mirror the database.

For this page the budget is tiny. Two requests per refresh at a 5-minute edge cache is
**576 requests/day**; at 15 minutes it is 192/day. A per-visitor call pattern grows with
traffic and quickly becomes the dominant call pattern, which is exactly what the intro warns
against.

## 4. Images, links, play counts

### Image data

Every list item carries an `image` **array** of `{ "size": …, "#text": … }` objects. Sizes seen
in captured responses: `small` (34 px), `medium` (64 px), `large` (174 px), `extralarge`
(300×300). Last.fm's own [`liblastfm` client](https://github.com/lastfm/liblastfm/blob/master/src/Artist.cpp)
also looks for a `mega` size, so treat the set as open-ended and select by `size` rather than
array index.

Artwork URLs are on `https://lastfm.freetls.fastly.net/i/u/…`. Measured headers on a 300×300
image:

```http
HTTP/2 200
content-type: image/jpeg
cache-control: max-age=311040000; public
access-control-allow-origin: *
access-control-allow-methods: GET,POST
```

That is about **ten years** of cache and open CORS, so the CDN is technically hotlinkable. The
licence is the problem, not the transport (see below).

**Availability is poor and inconsistent:**

- `user.getTopTracks` commonly returns the grey-star placeholder
  `…/2a96cbd8b46e442fc41c2b86b821562f.png` for every track
  ([forum capture](https://support.last.fm/t/56953)). In the same thread a Last.fm forum
  moderator stated flatly: "This is by design, artist images cannot be retrieved by the api" —
  so don't expect artist portraits from any endpoint.
- `user.getRecentTracks` sometimes returns the real album cover and sometimes an **empty
  string** in every size slot ([same thread](https://support.last.fm/t/56953)).
- `user.getTopAlbums` usually has album art but can return it empty at large `limit` values,
  and wrong covers are a long-standing, still-reported problem in 2026
  ([forum](https://support.last.fm/t/118797), [forum](https://support.last.fm/t/40482)).
- `track.getInfo` is the community workaround for a track's album cover; it returns the album
  `image` array reliably enough to be useful ([forum](https://support.last.fm/t/56953)).

**Licensing:** the API TOS excludes images outright:

> You will not use any audio, audiovisual, images and/or artwork, whether or not accessible
> through the API, and all such content is expressly excluded from this Agreement.
>
> — [API TOS §5.1.8](https://www.last.fm/api/tos)

So the API returns image URLs, but the API licence does not cover them. For a portfolio the
risk is low, but it is real, and it is another reason not to make artwork a load-bearing part of
the design. If artwork is shown, hotlink it unmodified (the CDN allows it), do not rehost it in
the repo, and accept that it may be missing or wrong.

### Links

Every artist, album and track object has a `url` to its Last.fm catalogue page, and
`user.getInfo` has the profile `url`. Use them verbatim. JSON responses use absolute
`https://www.last.fm/music/...` URLs; the older XML samples omit the scheme, so normalise with
`url.startsWith("http") ? url : "https://" + url`. The TOS requires these links (see §5).

### Play counts

| Field | Where | Meaning |
| --- | --- | --- |
| `playcount` | `user.getTopArtists` / `getTopAlbums` / `getTopTracks` items | **The user's plays** for the selected `period` (not global) |
| `playcount` | `user.getInfo` | The user's all-time scrobble total |
| `userplaycount` | `artist.getInfo` / `album.getInfo` / `track.getInfo` **with `username`** | The user's plays of that item; artist responses nest it under `stats` |
| `listeners`, `playcount` | `artist.getInfo` / `album.getInfo` / `track.getInfo` | Global Last.fm totals — do not confuse with the user's |

The method docs describe the `username` parameter as: "If supplied, the user's playcount for
this artist is included in the response" ([artist.getInfo](https://www.last.fm/api/show/artist.getInfo));
track and album have the same wording. Recorded responses confirm the field name
`userplaycount` and that `track.getInfo` returns it at the top level
(`pylast` cassette `test_user_play_count_in_track_info.yaml`); the official Android client reads
it from `stats` for artists
([`ArtistBuilder.java`](https://github.com/lastfm/lastfm-android/blob/master/library/src/fm/last/api/impl/ArtistBuilder.java)).

For the `/music` page you do not need `userplaycount`: the `playcount` on each item from
`user.getTopArtists` is already the user's count for the period.

### JSON quirks

The REST docs describe the XML→JSON conversion: attributes become string members, child nodes
become keys, text becomes `#text` when attributes are present, and repeated nodes become arrays
([REST Requests](https://www.last.fm/api/rest)). Consequences:

- `@attr.nowplaying` is the string `"true"`; `date.uts`, `playcount`, `rank`, `totalPages` are
  strings.
- A list with exactly one item may arrive as an object rather than an array. Normalise:
  `const tracks = Array.isArray(raw) ? raw : [raw]`.
- `image` is an array on list items in the captured responses; don't assume a fixed length or
  order, and don't index by position.
- `#text` is the actual value for `image` entries and for `artist`/`album` when they carry an
  `mbid`.

## 5. Attribution

The API TOS requires credit and links in three places.

**Nutshell:**

> You must credit Last.fm and include links to the Last.fm site when You use the Last.fm Data.
> You must comply with the Last.fm Brand Guidelines that can be downloaded from
> http://www.last.fm/resources/
>
> — [API TOS](https://www.last.fm/api/tos)

**The specific requirement (clause 2.7):**

> You agree to use one of the buttons saying "powered by AudioScrobbler" from the page located
> at http://www.last.fm/resources, such button linking back to Last.fm. All links to Last.fm
> from pages with profile information for a Last.fm User account should link to the appropriate
> Last.fm User page (example: http://www.last.fm/user/<username>). All links to Last.fm from
> pages displaying information on an artist, album or track should link to the appropriate
> catalogue page on Last.fm. For example: http://www.last.fm/music/<artistname>,
> http://www.last.fm/music/<artistname>/<albumname>,
> http://www.last.fm/music/<artistname>/_/<trackname>.
>
> All button/link placements are subject to approval by Last.fm and Last.fm can suggest the use
> of a button/link of its choice for You to use if Last.fm deems necessary. You agree to only
> give public access to pages using Last.fm's web services that have been previously approved
> by Last.fm in writing.
>
> — [API TOS §2.7](https://www.last.fm/api/tos)

**Marks/logos (clause 7.1):**

> Subject to the prior written approval of Last.fm in each case, Last.fm may make available to
> You certain trade marks, logos or graphics ("Marks") for use in conjunction with Your use of
> the Last.fm Data. You must comply with the Last.fm Brand Guidelines that can be downloaded
> from http://www.last.fm/resources/.
>
> — [API TOS §7.1](https://www.last.fm/api/tos)

**The prescribed page is dead.** `https://www.last.fm/resources` returns **404** (measured
27 Nov 2026; Wayback also records 404s in 2025 and 2026). The 2013 archived version was a
"Design Resources" page offering a Last.fm logo pack and badge GIFs (`lastfm_red.gif`,
`lastfm_grey.gif`, `lastfm_black.gif`) — not a live "powered by AudioScrobbler" button
([Wayback](https://web.archive.org/web/20130627070848/http://www.last.fm/resources)). So the
literal clause cannot be satisfied as written today, and the Brand Guidelines it points to are
not retrievable from the advertised URL.

Practical compliance for this site, in decreasing order of confidence:

1. **Visible text credit with a link**, e.g. "Listening data from Last.fm" linking to
   `https://www.last.fm/user/jwstn`, placed in the page footer or under the stats — not hidden
   in a tooltip. This satisfies the "credit Last.fm and include links" nutshell and the
   profile-link part of 2.7.
2. **Link every artist/album/track** to its `url` from the API. This is the part of 2.7 that is
   unambiguous and still fully actionable.
3. **Do not ship the Last.fm logo** without written approval. Clause 7.1 conditions mark use on
   prior written approval and brand guidelines that are currently unfindable. A text credit is
   safer than a copied footer logo.
4. If strict compliance matters, email `partners@last.fm` and ask for the current badge/brand
   assets and approval. The announcement says commercial/research enquiries get a reply
   "typically within 10 business days" ([announcement](https://support.last.fm/t/121030)).

Also note the literal approval clause: "only give public access to pages … previously approved
by Last.fm in writing." In practice almost no hobby site does this, but it is in the terms and
should be a conscious risk decision, not an oversight.

## 6. Practical notes

### Username lookup

There is no `user.search` method. The username must be known ahead of time (config/env). For
this project it is `jwstn`, as recorded in [#24](https://github.com/jwstn/personal-website/issues/24).
`user.getInfo?user=jwstn` confirms the profile and returns the all-time `playcount`, `url`,
`registered.unixtime` and `subscriber`. Pass the configured spelling and URL-encode it; don't
rely on the API normalising case.

### Error responses

JSON errors are a flat object, not the success envelope:

```json
{ "error": 10, "message": "Invalid API key - You must be granted a valid key by last.fm" }
```

Codes listed on every method page ([example](https://www.last.fm/api/show/user.getRecentTracks)):

| Code | Meaning | HTTP observed |
| --- | --- | --- |
| 2 | Invalid service | — |
| 3 | Invalid method | — |
| 4 | Authentication failed | — |
| 5 | Invalid format | — |
| 6 | Invalid parameters (also used for a missing user/page) | **400** measured for a missing parameter; `no such page` recorded for a missing user |
| 7 | Invalid resource specified | — |
| 8 | Operation failed / backend failure | **500** observed during the 26 Nov 2026 outage |
| 9 | Invalid session key | — |
| 10 | Invalid API key | **403** measured |
| 11 | Service offline | — |
| 13 | Invalid method signature | — |
| 16 | Temporary error, retry | — |
| 26 | Suspended API key | — |
| 29 | Rate limit exceeded | **429** reported ([forum](https://support.last.fm/t/43159)) |

Code 6 is overloaded: missing parameter, out-of-bounds `limit`, and a non-existent user/page
all use it. A recorded response for a missing page is `<error code="6">no such page</error>`
(`pylast` cassette `TestPyLastUser.test_cacheable_user.yaml`), so branch on the message as well
as the code. Handle 8/11/16/29 with a retry/backoff and, on the site, serve the last good cached
snapshot rather than an error page.

The 26 Nov 2026 incident matters for expectations: `user.getRecentTracks`, `user.getTopAlbums`
and `user.getTopArtists` returned error 8 / HTTP 500 for hours while `user.getInfo` stayed up
([forum](https://support.last.fm/t/121174)). Recovery was described as "starting" at 09:04
(forum time) and was not confirmed in the thread. A stats page needs a stale-cache fallback.

### CORS and JSONP

The API sends `Access-Control-Allow-Origin: *` (measured on an error response), plus
`Access-Control-Allow-Methods: POST, GET, OPTIONS` and `Access-Control-Max-Age: 86400`. JSONP is
also documented via `callback`, with the response served as `text/javascript`
([REST Requests](https://www.last.fm/api/rest)). So a browser *could* call the API directly.
Don't: it exposes the key (tied to a paid Pro account and its quota), it violates the "don't hit
the API on page load" guidance, and it makes caching impossible. Server-side only.

### Data volume

The 100 MB "Reasonable Usage Cap" is about stored Last.fm Data. Two JSON responses per cache
window are a few kilobytes; a build-time snapshot of top artists plus recent tracks is far
inside it. Do not build a local mirror of the user's scrobble history.

## 7. "Most listened in the last 30 days"

`1month` is the best and only API match. For the issue's design:

```
GET https://ws.audioscrobbler.com/2.0/?method=user.getTopArtists&user=jwstn&period=1month&limit=3&api_key=…&format=json
GET https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=jwstn&limit=10&api_key=…&format=json
```

- Top three artists: `topartists.artist[]`, each with `name`, `playcount`, `url`, `image`.
- Recent scrobbles: `recenttracks.track[]`; the first item is the now-playing track when
  `@attr.nowplaying === "true"`.
- If the design later needs "top albums" or "top tracks", swap the method and keep
  `period=1month`; the response key changes to `topalbums.album[]` / `toptracks.track[]`.
- Album art for an artist card is not available: artist images are placeholder/empty by design.
  Either design the artist cards without photos (isometric tiles, initials, typography) or use
  `artist.getTopAlbums?artist=…&limit=1` and show the top album cover instead (three extra
  requests, still unreliable art).
- Album art for a track: `user.getRecentTracks` art is often present but sometimes `""`; if a
  particular list needs reliable covers, `track.getInfo?artist=…&track=…&username=jwstn` returns
  the album `image` array. That is one extra request per track, so only for a short list.
- "Last 30 days" is `1month`, not an exact 30-day window. If the copy says "last 30 days" and
  precision matters, say "last month" or verify the boundary against Last.fm's own profile
  page.

## Practical implications for this Astro site

The site uses `@astrojs/vercel` and Astro 7 (`astro.config.mjs`). The `/music` route can be
prerendered at build time or rendered on demand; either fits, but the data needs a cache.

1. **Decide the access model first.** A read-only key is still the right design (no OAuth), but
   from 1 Dec 2026 it needs Pro on the owning account. Budget €49.99/year (or €4.99/month) or
   drop the feature. If the portfolio is judged "commercial" (it advertises paid work), the TOS
   requires a commercial licence instead: "You are permitted to use the Last.fm Data solely for
   non-commercial purposes" ([TOS §3.1](https://www.last.fm/api/tos)); contact
   `partners@last.fm`. Pro is described as covering "personal use"
   ([announcement](https://support.last.fm/t/121030)). This is a call for the site owner, not
   something the code can settle.

2. **Keep the key server-side.** `LASTFM_API_KEY` in the Vercel environment, read via
   `process.env.LASTFM_API_KEY` (or `import.meta.env.LASTFM_API_KEY` on the server). Never a
   `PUBLIC_` variable, never in client JS. The key is not an OAuth secret, but it is tied to a
   paid account and a quota.

3. **Prefer one on-demand route with an edge cache.** Render `/music` on the server
   (`export const prerender = false`) and set:

   ```ts
   Astro.response.headers.set(
     "Cache-Control",
     "public, s-maxage=300, stale-while-revalidate=600",
   );
   ```

   Vercel's CDN can serve one upstream render per cache window instead of one per visitor;
   visitors never touch Last.fm. Five minutes is fresh enough for "now playing" on a portfolio. If the now-playing
   state must feel live, poll a separate tiny endpoint every 60 s and cache that for 60 s; do
   not shorten the whole page's cache.

4. **Or prerender and rebuild on a schedule.** Fetch at build time and commit/emit a JSON
   snapshot, then rebuild hourly with a GitHub Actions cron or a Vercel deploy hook. This has
   zero runtime key exposure and zero per-visitor calls, but "now playing" is stale by design.
   For a portfolio, a 5-minute SSR cache is the better trade; for a purely static deploy, the
   snapshot is simpler.

5. **Make two calls, not N.** One `user.getTopArtists?period=1month&limit=3`, one
   `user.getRecentTracks?limit=10`. Do not loop over artists for images. Avoid `extended=1`
   unless you actually render the loved flag; it makes responses bigger for no benefit.

6. **Normalise defensively.**

   ```ts
   const asArray = <T>(v: T | T[] | undefined): T[] =>
     v == null ? [] : Array.isArray(v) ? v : [v];

   const tracks = asArray(json.recenttracks?.track);
   const nowPlaying = tracks.find((t) => t["@attr"]?.nowplaying === "true");
   const recent = tracks.filter((t) => t !== nowPlaying);
   ```

   Parse `playcount` with `Number(...)`; treat `""` image URLs as missing.

7. **Fallback states are part of the acceptance criteria.** If the key is unset, render the
   designed "not configured" state. If Last.fm returns 8/29/500, serve the last cached snapshot
   (in-memory `let cache` in the module, or Vercel KV) and never block the page on the API. A
   portfolio should not show a stack trace because a third party had an outage.

8. **Attribution component.** A small footer under the stats: "Listening data from Last.fm" →
   `https://www.last.fm/user/jwstn`, plus each artist/track name linked to its API `url`. No
   logo unless approval is obtained. This is visible, not a tooltip.

9. **Design without artist photos.** The isometric theme is an advantage here: draw the top
   three as tiles/objects with names and play counts. Artist images are the least reliable data
   in the API. If you want art, use album covers from `user.getRecentTracks` and fall back to a
   designed placeholder when `#text` is empty or the hash is `2a96cbd8b46e442fc41c2b86b821562f`.

10. **Budget and monitoring.** 2 requests / 5 min = 576/day; well inside any plausible limit
    and far inside the 100 MB storage cap. Log non-200 responses and error codes; alert on a
    run of 8/29 so a silent outage doesn't leave the page stale for days.

Minimal fetch helper:

```ts
const API = "https://ws.audioscrobbler.com/2.0/";
const USER = "jwstn";

async function lastfm(method: string, params: Record<string, string> = {}) {
  const key = process.env.LASTFM_API_KEY;
  if (!key) throw new Error("LASTFM_API_KEY is not configured");

  const url = new URL(API);
  url.search = new URLSearchParams({
    method,
    user: USER,
    api_key: key,
    format: "json",
    ...params,
  }).toString();

  const res = await fetch(url, {
    headers: { "User-Agent": "jwstn.dev/1.0 (+https://www.jwstn.dev)" },
  });
  const json = await res.json();
  if (json.error) throw new Error(`Last.fm ${json.error}: ${json.message}`);
  return json;
}

const [top, recent] = await Promise.all([
  lastfm("user.getTopArtists", { period: "1month", limit: "3" }),
  lastfm("user.getRecentTracks", { limit: "10" }),
]);
```

## Open questions / risks

- **Pro is now mandatory for this use case.** Confirm the subscription is active on the account
  that owns `LASTFM_API_KEY` before 1 Dec 2026, or the read calls stop. Creating a replacement
  key after that date also needs Pro. The enforcement error code is not documented; forum users
  asked and got no answer ([thread](https://support.last.fm/t/121188)). Handle any 10/26/8
  gracefully.
- **Commercial classification.** A personal portfolio is probably non-commercial, but if it
  promotes paid services the TOS's non-commercial restriction may not fit. Only Last.fm can
  answer; `partners@last.fm` is the route, with a ~10-business-day turnaround.
- **Written approval clause.** TOS 2.7 literally requires prior written approval for public
  pages using the API. This is widely ignored, but it is a real term. Decide whether to seek
  approval or accept the risk.
- **Image licence.** TOS 5.1.8 excludes images/artwork from the API licence, while the API
  returns image URLs. Showing covers is common practice but not clearly licensed. Keeping
  artwork non-essential (with a designed fallback) reduces both legal and visual risk.
- **Exact `1month` boundary.** Undocumented. If the copy says "last 30 days", either soften it
  to "last month" or verify against the profile UI at implementation time.
- **API reliability.** The 26 Nov 2026 outage of all `user.*` read methods is a reminder that
  this is a third-party dependency. Cache and stale-serve.
- **Pricing/currency.** €4.99/€49.99 was the 27 Nov 2026 display; Last.fm localises and can
  change it.
- **Key rotation/suspension.** Error 26 means the key is suspended; the site should degrade, not
  retry in a loop.

## References

Primary:

- Last.fm API home — <https://www.last.fm/api>
- Last.fm API introduction — <https://www.last.fm/api/intro>
- Last.fm REST requests — <https://www.last.fm/api/rest>
- Last.fm authentication — <https://www.last.fm/api/authentication>
- Last.fm authentication spec (signing) — <https://www.last.fm/api/authspec>
- user.getInfo — <https://www.last.fm/api/show/user.getInfo>
- user.getRecentTracks — <https://www.last.fm/api/show/user.getRecentTracks>
- user.getTopArtists — <https://www.last.fm/api/show/user.getTopArtists>
- user.getTopAlbums — <https://www.last.fm/api/show/user.getTopAlbums>
- user.getTopTracks — <https://www.last.fm/api/show/user.getTopTracks>
- artist.getInfo — <https://www.last.fm/api/show/artist.getInfo>
- album.getInfo — <https://www.last.fm/api/show/album.getInfo>
- track.getInfo — <https://www.last.fm/api/show/track.getInfo>
- API Terms of Service — <https://www.last.fm/api/tos>
- Last.fm Pro — <https://www.last.fm/pro>
- "API keys will require Pro from 1st December", 18 Nov 2026 — <https://support.last.fm/t/121030>
- "API Update: Pro will not be required to use scrobbling methods", 26 Nov 2026 — <https://support.last.fm/t/121188>

Official-forum captures and reports (secondary):

- Recent-tracks JSON with now playing and image sizes — <https://support.last.fm/t/71447>
- Placeholder artwork, empty image strings, "artist images cannot be retrieved" —
  <https://support.last.fm/t/56953>
- Wrong/missing album art, 2026 — <https://support.last.fm/t/118797>
- Large page sizes and missing artwork — <https://support.last.fm/t/40482>
- Observed limit bounds 1–1000 — <https://support.last.fm/t/50866>
- Error 8 outage of user methods, 26 Nov 2026 — <https://support.last.fm/t/121174>,
  <https://support.last.fm/t/121183>
- Error 29 / HTTP 429 — <https://support.last.fm/t/43159>

Historical TOS (to date the rate-limit change):

- TOS, 15 Apr 2017 — <https://web.archive.org/web/20170415091018/https://www.last.fm/api/tos>
- TOS, 13 May 2020 — <https://web.archive.org/web/20200513105707/https://www.last.fm/api/tos>
- Archived "Design Resources" page with badges, 27 Jun 2013 —
  <https://web.archive.org/web/20130627070848/http://www.last.fm/resources>

Measured in this worktree on 27 Nov 2026:

- `curl -sI 'https://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&api_key=invalid&format=json'`
  → HTTP 403, `{"error":10,...}`, `Access-Control-Allow-Origin: *`.
- Same without `api_key` → HTTP 400, `{"error":6,...}`.
- `curl -sI 'https://lastfm.freetls.fastly.net/i/u/300x300/4596e1e389b14e95aeecb27567fddffe.jpg'`
  → HTTP 200, `image/jpeg`, `cache-control: max-age=311040000; public`,
  `access-control-allow-origin: *`.
- `curl -sL -o /dev/null -w '%{http_code}' https://www.last.fm/resources` → 404.
