# YouTube IFrame API constraints for the hero player

Research for [#14](https://github.com/jwstn/personal-website/issues/14), part of the
[isometric cassette player map](https://github.com/jwstn/personal-website/issues/12).
All sources checked **26 November 2026**. Figures marked "measured" were taken in this
repo's environment on that date and will drift with YouTube player versions.

## Bottom line

1. **The player cannot be hidden or played offscreen.** YouTube's Developer Policies
   prohibit playing content "from a background player, meaning a player that is not
   displayed in the page, tab, or screen that the user is viewing"
   ([Developer Policies I.9](https://developers.google.com/youtube/terms/developer-policies#i.-additional-prohibitions)).
   The "hidden 200×200 iframe" idea in the ticket is technically possible in some
   browsers but is **not permitted**. The hero needs a real, visible, unobstructed
   player (minimum 200×200) while audio plays.
2. **Audible autoplay needs a user gesture**, and on iPhone/iPad Safari the player and
   the IFrame API must already be **ready before the gesture**. Creating the iframe
   after the tap, or awaiting anything before `playVideo()`, loses the gesture.
   Prepare on the first tape interaction; call `playVideo()` synchronously on the
   insert/play action ([WebKit](https://webkit.org/blog/6784/new-video-policies-for-ios/),
   [WebKit bug 190794](https://bugs.webkit.org/show_bug.cgi?id=190794),
   [lite-youtube-embed #214](https://github.com/paulirish/lite-youtube-embed/pull/214)).
3. **Use privacy-enhanced mode** (`youtube-nocookie.com`) through a self-built
   `enablejsapi=1` iframe. It reduces personalisation but is **not** a consent-free
   embed: the request still sends IP and Referer to Google.
4. **Load lazily.** The API loader is tiny (993 B), but the player it injects is huge:
   ~27 KB widget API, ~140 KB embed document, and a ~2 MB player script (~670 KB
   gzipped). None of that belongs in the hero's initial load.
5. **Detect the end with player state `0`.** Errors are `100` (missing/private),
   `101`/`150` (embedding disallowed), `153` (missing Referer); there is **no
   documented region-block code**. Treat every error as "tape unavailable".
6. **Titles come from our mixtape config.** The documented API gives the URL,
   duration, state and time, but not the title. `getVideoData()` exists but is
   undocumented; don't build on it.

## 1. Autoplay policy and the gesture requirement

### What the browsers require

- Chrome: "Muted autoplay is always allowed." Sound is allowed if the user has
  interacted with the domain, has a high Media Engagement Index, installed the PWA,
  or the top frame delegates autoplay to the iframe
  ([Chrome autoplay policy](https://developer.chrome.com/blog/autoplay)).
  Chrome's cross-origin iframes need `allow="autoplay"`; the `YT.Player` widget adds
  `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope;
  picture-in-picture; web-share"` to the iframe it creates (verified in
  `www-widgetapi.js`, see below).
- Safari/WebKit: audible playback must result from a user gesture. Apple's rule is
  strict: "the JavaScript which resulted in the call to `video.play()` ... must have
  directly resulted from a handler for a `touchend`, `click`, `doubleclick`, or
  `keydown` event." `canplaythrough -> play()` does **not** count
  ([WebKit, 2016](https://webkit.org/blog/6784/new-video-policies-for-ios/)).
  Muted or audio-less media may autoplay; unmuting without a gesture pauses it.
- Firefox follows the same pattern; see MDN's summary that autoplay is allowed only
  if muted, after interaction, allowlisted, or delegated via Permissions Policy
  ([MDN autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)).
- Safari **does not honour `allow="autoplay"`**. A WebKit engineer states this
  explicitly and adds that an iframe created in a click handler will not autoplay
  because its document loads asynchronously, so the video is not created inside the
  active gesture ([WebKit bug 190794](https://bugs.webkit.org/show_bug.cgi?id=190794)).
  This is the core mobile constraint.

### Starting playback from the three.js tape interaction

The gesture that completes the tape insert (a `click` / `pointerup` / `touchend` on
the canvas or an accessible control) must be the one that calls `playVideo()`. Do not
`await` the insert animation, a fetch, or `onReady` before calling it.

This means the player must be **prepared earlier**:

- Begin loading the API and creating the player on the first `pointerdown` /
  `touchstart` / `keydown` that starts the tape interaction (or on focus), not on the
  drop itself.
- The drag gives you a preparation window on desktop. On a tap-to-insert phone it
  does not — the insert tap prepares, and the next tap (the explicit play control)
  plays. That is compatible with the map's "accessible play/pause control" decision
  but rules out guaranteed one-tap audio on iPhone Safari without preloading YouTube
  on page load.
- If preparation has not finished, show a visible "Play" state. The user's tap on it
  is a fresh gesture and will work once the player is ready. YouTube's own
  `onAutoplayBlocked` event fires when the browser rejects a programmatic start, so
  use it to switch to that state
  ([IFrame API events](https://developers.google.com/youtube/iframe_api_reference#Events)).

The "prepare the iframe and API before the tap, then call `playVideo()` on click"
pattern is what lite-youtube-embed adopted in November 2026 after real-device tests:
on iPadOS 26.7.3, both a post-tap plain iframe and a post-tap API player stopped at
YouTube's play button, while the prepared player played with sound from one tap
([PR #214](https://github.com/paulirish/lite-youtube-embed/pull/214),
[evidence notes](https://github.com/paulirish/lite-youtube-embed/blob/main/autoplay.md)).
The same double-tap symptom is reported for react-player on iOS 13/14
([react-player #1034](https://github.com/cookpete/react-player/issues/1034)) and for
lite-youtube-embed generally ([issue #6](https://github.com/paulirish/lite-youtube-embed/issues/6)).

### Autoplay and view counts

A playback only counts toward the video's view count if it is started from the
player's native play button, not from `playVideo()`
([IFrame API, `playVideo`](https://developers.google.com/youtube/iframe_api_reference#Playing_a_video)).
The Help Center also says autoplayed embeds do not increment views
([Embed videos & playlists](https://support.google.com/youtube/answer/171780)). This
is not a blocker for a personal mixtape, but it is worth knowing before optimising
for "plays".

## 2. Hidden / offscreen iframe: what works, and why we can't use it

### The policy

The Developer Policies say an API Client must not:

> create, include, or promote features that play content, including audio or video
> components, from a background player, meaning a player that is not displayed in the
> page, tab, or screen that the user is viewing

([Developer Policies, I. Additional Prohibitions, item 9](https://developers.google.com/youtube/terms/developer-policies#i.-additional-prohibitions)).
The same section also forbids modifying, building upon or blocking any portion of a
YouTube player, and separating/isolating the audio or video components
(items 6–8). The Help Center states that the API Terms and Developer Policies apply
to all use of the embedded player
([YouTube Help](https://support.google.com/youtube/answer/171780)).

So an offscreen, `display:none`, zero-size, or canvas-covered player that keeps
playing audio is a policy violation, even if it works technically. **The mixtape
needs a visible player.** If "audio only, no visible video" is a hard design
requirement, YouTube embeds are the wrong transport (local audio hosting is out of
scope in #12).

### The technical picture

- Minimum size: "Embedded players must have a viewport that is at least 200px by
  200px"; if controls are shown they must fit without going below that; 480×270 is
  recommended for 16:9
  ([IFrame API requirements](https://developers.google.com/youtube/iframe_api_reference#Requirements),
  [player parameters](https://developers.google.com/youtube/player_parameters)).
- Hiding a cross-origin iframe does not, by itself, pause its media: there is no
  standard pause-on-hide. A CSSWG issue asks for exactly that because today the only
  way to stop a hidden YouTube iframe is to remove it
  ([csswg-drafts #6468](https://github.com/w3c/csswg-drafts/issues/6468)). That is
  precisely the "background player" the policy forbids.
- On iOS, Apple documents that video playback "stops if the video element isn't
  visible onscreen or is out of the viewport"
  ([Delivering Video Content for Safari](https://developer.apple.com/documentation/webkit/delivering-video-content-for-safari)).
  That is written for `<video>`, but the YouTube player is a `<video>` inside the
  iframe, so offscreen playback is unreliable there too.
- Because the player is a cross-origin iframe, it cannot be used as a WebGL texture
  or drawn into the three.js canvas. It has to be a DOM element positioned over the
  scene (for example as the walkman's screen), and it must not be covered by the
  canvas or an overlay.
- Hiding it while **paused/stopped** is not "playing from a background player".
  A practical pattern is: show the player only while a tape is active, pause/stop and
  hide it on eject, and show a static label/poster when idle. That also avoids
  YouTube's end-of-video related-video wall.

### Restyling limits for the walkman screen

You can frame the iframe with your own CSS (position, border, 3D transform), but you
cannot cover or alter what YouTube renders. `controls=0` is a documented way to hide
the player chrome; `modestbranding` is deprecated and does nothing now
([player parameters](https://developers.google.com/youtube/player_parameters)).
`rel=0` no longer disables related videos — after playback ends it limits them to the
same channel, which is why pausing/hiding at `ENDED` is the cleaner hero behaviour.
Keep YouTube's links and branding visible; do not put the canvas or a shader over the
iframe.

## 3. Control surface

All from the [IFrame API reference](https://developers.google.com/youtube/iframe_api_reference):

| Need | Call | Notes |
| --- | --- | --- |
| Play | `player.playVideo()` | Final state playing (1). Gesture rules above apply. |
| Pause | `player.pauseVideo()` | Leaves state paused (2). Use this for the pause key. |
| Stop / eject | `player.stopVideo()` | Cancels loading. May land in ended, paused, cued or unstarted — do not assume a state. |
| Seek | `player.seekTo(seconds, allowSeekAhead)` | If paused, stays paused; otherwise plays. `allowSeekAhead=false` while scrubbing, `true` on release. |
| Load another tape | `player.loadVideoById(id)` / `cueVideoById(id)` | `load` plays; `cue` loads metadata and waits for play/seek. |
| Volume | `player.setVolume(0–100)`, `mute()`, `unMute()`, `isMuted()`, `getVolume()` | See iOS caveat below. |
| State | `player.getPlayerState()` | -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued. |
| Position | `getCurrentTime()`, `getDuration()` | `getDuration()` is 0 until metadata loads. |
| Tear down | `player.destroy()` | Removes the iframe. Use on view-transition navigation unless playback should persist. |

**iOS volume:** Apple's archived guidance is explicit: on iOS "the audio level is
always under the user's physical control. The `volume` property is not settable in
JavaScript. Reading the `volume` property always returns 1"
([Safari HTML5 Audio and Video Guide, iOS-Specific Considerations](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html)).
`setVolume()` drives the media element's volume, so expect it to be a no-op on iOS;
treat volume UI as desktop-only and let the hardware buttons do the work. Verify on a
current iPhone before shipping a volume slider.

**One stream at a time (legacy):** the same Apple guide notes iOS historically
allowed only one audio/video stream at a time. Keep a single player instance rather
than one per tape.

## 4. End of track, errors, unavailable videos

**End of track.** `onStateChange` fires with `data === 0` (`YT.PlayerState.ENDED`)
([events](https://developers.google.com/youtube/iframe_api_reference#Events)). That
is the reliable end signal. `getPlayerState()` also returns 0. Use it to stop the
reel animation and move to the "finished" state.

**Errors.** `onError` carries an integer
([IFrame API, `onError`](https://developers.google.com/youtube/iframe_api_reference#onError)):

| Code | Meaning |
| --- | --- |
| 2 | Invalid parameter (e.g. malformed video ID). |
| 5 | HTML5 player error. |
| 100 | Video not found — removed or private. |
| 101 | Owner disallows embedding. |
| 150 | Same as 101. |
| 153 | Request has no `HTTP Referer` / client identification. |

- **Region blocks have no documented code.** Do not write logic that distinguishes
  "blocked in DE" from "private"; treat any error as unavailable and fall back to the
  tape label. Curate the eight tracks from sources you can check, and re-check them
  when the list changes.
- **Error 153** is the one that bites deployments: YouTube requires embedders to send
  a Referer, and blocked playback shows an "error 153" screen
  ([YouTube Help](https://support.google.com/youtube/answer/171780),
  [Required Minimum Functionality](https://developers.google.com/youtube/terms/required-minimum-functionality)).
  Do not set `Referrer-Policy: no-referrer` on the site. The `YT.Player`-created
  iframe sets `referrerpolicy="strict-origin-when-cross-origin"` itself; if you build
  the iframe yourself, copy that attribute. (Verified in `www-widgetapi.js`.)
- **Age-restricted videos** "can't be watched on most 3rd party websites" and redirect
  viewers back to YouTube ([YouTube Help](https://support.google.com/youtube/answer/171780)).
  Don't include them.
- **Autoplay blocked** is separate from `onError`: listen for `onAutoplayBlocked`
  (it has no `data`), and switch to a visible play affordance.

A robust failure state is: `onError` **or** no `PLAYING` within a few seconds of the
gesture → show "tape unavailable / tap to retry", keep the label, never autoplay the
next tape.

## 5. Mobile behaviour, especially iOS Safari

- **Inline, not fullscreen.** Set the YouTube player parameter `playsinline: 1`.
  Without it, iPhone plays fullscreen; with it, playback stays inline (including in
  WebViews whose `allowsInlineMediaPlayback` is set)
  ([player parameters](https://developers.google.com/youtube/player_parameters#playsinline)).
- **The player must exist before the tap.** Post-tap creation is the failure mode:
  the iframe document loads asynchronously, so its `<video>` is created outside the
  gesture ([WebKit bug 190794](https://bugs.webkit.org/show_bug.cgi?id=190794)).
  A 2026 real-device test found the same for both a plain post-tap iframe and a
  post-tap API player on iPadOS 26.7.3, while a pre-prepared player worked
  ([lite-youtube-embed #214](https://github.com/paulirish/lite-youtube-embed/pull/214)).
- **`allow="autoplay"` is not a Safari fix.** WebKit does not honour it; the same
  bug comment says so. It is still needed for Chromium, and `YT.Player` adds it
  automatically.
- **The two-tap fallback is acceptable and expected.** For this design: first tap
  inserts the tape and prepares the player; the accessible play control is the second
  tap. If one-tap audio on iPhone is a requirement, the only reliable known approach
  is to load YouTube before the first tap — a real privacy and performance cost
  (lite-youtube-embed now does this only on detected iPhone/iPad Safari; see
  [autoplay.md](https://github.com/paulirish/lite-youtube-embed/blob/main/autoplay.md)).
- **Do not hide the player on iOS.** Apple documents that offscreen video stops
  playing; plus the policy in §2.
- **Volume is hardware-controlled** on iOS (§3).
- **Layout:** keep the iframe's layout box at least 200×200 and leave its pointer
  events intact. If you position it with CSS 3D transforms to sit in the walkman,
  test taps on the real device — transformed cross-origin iframes can be awkward to
  hit.

## 6. Privacy-enhanced mode and EU/Germany consent

**What `youtube-nocookie.com` does.** Google's privacy-enhanced mode is enabled by
changing the embed domain from `www.youtube.com` to `www.youtube-nocookie.com`. Google
describes the guarantee as: views "will not be used to personalize the YouTube
browsing experience", ads will be non-personalised, and the view will not personalise
ads outside the site
([YouTube Help, privacy-enhanced mode](https://support.google.com/youtube/answer/171780)).
It also says the mode is only for embedded players on websites (not apps/WebViews).

**What it does not do.** That page does **not** promise "no cookies" or "no data
transfer". The embed still contacts Google and sends the visitor's IP address,
User-Agent and Referer. Treat privacy-enhanced mode as "less personalisation", not as
an anonymising proxy.

**EU/Germany implications.**

- An IP address is personal data: GDPR Recital 30 lists "internet protocol addresses"
  among online identifiers
  ([GDPR](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679)),
  and the CJEU confirmed that a dynamic IP address is personal data in the hands of a
  provider with legal means to identify the user
  ([CJEU C-582/14, Breyer](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:62014CJ0582)).
- In Germany, §25 TDDDG requires prior consent for storing information on, or
  accessing information already stored on, the user's terminal equipment, unless it
  is strictly necessary for the service the user explicitly requested
  ([§25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html)). YouTube's player
  can write cookies/local storage inside its iframe once it runs.
- Google's own EU User Consent Policy requires end users in the EEA/UK/Switzerland to
  give legally valid consent to "the use of cookies or other local storage where
  legally required" and to "the collection, sharing, and use of personal data for
  personalization of ads"
  ([Google EU User Consent Policy](https://www.google.com/about/company/user-consent-policy/)).

**Practical position for a personal site.** The safest design is also the one this
hero already implies: **make no YouTube request until the visitor acts** — show a
locally hosted poster/facade, and create the player on the first tape interaction.
That makes the embed user-initiated (and avoids a page-load transfer), but it is not a
blanket legal exemption; add a short privacy note naming YouTube/Google and linking
their policies. If you preload the player on page load to get one-tap iPhone audio,
you are accepting a third-party request before any interaction — a materially weaker
privacy position for an EU/Germany audience. This is not legal advice; if in doubt,
get a consent gate or keep the preload off.

Note the `autoplay=1` parameter itself triggers playback data collection on load
([player parameters, `autoplay`](https://developers.google.com/youtube/player_parameters#autoplay)),
another reason to call `playVideo()` from the gesture instead of putting `autoplay=1`
in the initial iframe.

## 7. Cost of loading the IFrame API, and lazy loading

Measured on 26 Nov 2026 from this environment (compressed sizes are gzip):

| Resource | Uncompressed | Gzip |
| --- | ---: | ---: |
| `https://www.youtube.com/iframe_api` (loader) | 993 B | — |
| `www-widgetapi.js` (injected by the loader) | 27,034 B | 9,912 B |
| `/embed/VIDEO_ID?enablejsapi=1` document | 139,699 B | 61,543 B |
| `base.js` player script | 1,988,781 B | 672,649 B |

Add thumbnails, CSS, fonts and the media stream on top. lite-youtube-embed's earlier
measurement put the typical iframe payload at ~1 MB
([PR #109](https://github.com/paulirish/lite-youtube-embed/pull/109)); the exact
figure varies by player version and locale, but the order of magnitude is clear: the
loader is negligible, the player is not.

**Recommendations.**

- Never put `iframe_api` in the initial HTML or a `<script>` in the head. Inject it
  from a module when the visitor first touches a tape (or when the hero is about to
  be interacted with). Keep a single promise so it loads once.
- Do not preconnect to `youtube.com`/`youtube-nocookie.com` on page load if you care
  about the privacy story; connect after the interaction.
- Create one player and reuse it with `loadVideoById`. Call `destroy()` on
  view-transition navigation unless playback should continue across pages.
- Use a locally hosted poster/tape label as the idle state, so the hero's LCP never
  depends on YouTube.
- The API is a global (`window.YT`) with an `onYouTubeIframeAPIReady` callback; define
  the callback before injecting the script, or check for `window.YT` if it is already
  loaded ([IFrame API requirements](https://developers.google.com/youtube/iframe_api_reference#Requirements)).

Sketch (not production code):

```js
let apiPromise;
function loadApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  apiPromise ??= new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT); };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.append(s);
  });
  return apiPromise;
}

// on first pointerdown/touchstart/keydown on a tape:
const YT = await loadApi();
const player = new YT.Player(screenEl, {
  host: "https://www.youtube-nocookie.com", // supported by the widget, undocumented
  videoId: firstTapeId,
  playerVars: { controls: 0, playsinline: 1, rel: 0, origin: location.origin },
  events: { onReady, onStateChange, onError, onAutoplayBlocked },
});

// on the insert/play gesture — synchronously, no await:
player.loadVideoById(id);
player.playVideo();
```

`host` is not in the public IFrame reference, but the widget API reads
`options.host` and otherwise derives the host from an existing iframe's `src`
(verified in `www-widgetapi.js`). The documented alternative is to write the iframe
yourself with `src="https://www.youtube-nocookie.com/embed/VIDEO_ID?enablejsapi=1&origin=..."`,
`allow="autoplay; ..."` and `referrerpolicy="strict-origin-when-cross-origin"`, then
pass the element to `new YT.Player(element, {...})`
([Loading a video player](https://developers.google.com/youtube/iframe_api_reference#Loading_a_Video_Player)).
That path is easier to reason about and keeps the privacy-enhanced domain explicit.

## 8. What state/title information is available without extra calls

Documented and free:

- `getVideoUrl()` — the YouTube URL for the current video (parse `v=` to map back to
  the mixtape config).
- `getDuration()`, `getCurrentTime()`, `getPlayerState()`, `getVideoLoadedFraction()`.
- `getVideoEmbedCode()`, `getIframe()`.

Not documented: `getVideoData()` (commonly returns `{ video_id, author, title }`). It
is not in the current reference, so don't depend on it for the UI. Since the mixtape
is hand-curated, the cleanest design is to keep `title`, `artist`, and `label` in the
config keyed by video ID, and use `getVideoUrl()` only to confirm which tape is
loaded. If a runtime title is ever needed, YouTube's oEmbed endpoint
`https://www.youtube.com/oembed?url=...&format=json` returns `title`, `author_name`
and `thumbnail_url` without an API key (862 B in our test); it does not tell you
whether the video is embeddable or region-available, and it is an extra request. The
Data API can expose `status.embeddable`, but needs a key and quota — overkill for
eight tracks.

## 9. Recommended lifecycle for this hero

1. **Idle:** no YouTube script, no iframe, no third-party request. Show the cassette
   shelf and a locally drawn "screen" (poster).
2. **First tape interaction** (`pointerdown` / `touchstart` / `keydown` on a tape or
   the deck): load the API and create the player with the selected `videoId`,
   `controls: 0`, `playsinline: 1`, `rel: 0`, `origin`, privacy-enhanced host. Reveal
   the player as the walkman's screen (≥200×200, unobstructed). It is paused, so this
   is not background playback.
3. **Insert / play gesture:** call `loadVideoById(id)` + `playVideo()` synchronously.
   Start the reel animation from the `PLAYING` event, not optimistically.
4. **Pause:** `pauseVideo()`; stop the reels. **Eject:** `pauseVideo()` or
   `stopVideo()`, then hide the player and show the label.
5. **Ended (`0`):** stop the reels, mark the tape finished, show the label. Pause/hide
   the player so YouTube's related-video end screen isn't the hero.
6. **`onError` / `onAutoplayBlocked`:** mark the tape unavailable or show a visible
   "Play" control; never silently fail.
7. **Navigation:** `player.destroy()` on `astro:before-swap` unless cross-page
   playback is a deliberate feature.

Two open design consequences:

- The map says "tape labels are the only 'now playing' feedback". A visible YouTube
  player is now also feedback, and it must be visible. The walkman's screen is the
  natural place; the label still identifies the song.
- The player cannot be a WebGL texture. It is a DOM overlay that must track the
  screen's position through the three.js camera/orbit. Budget for that positioning
  logic and test it at mobile sizes.

## 10. Things to verify on hardware before implementation is locked

- iPhone Safari (not just iPad): prepared-player vs post-tap behaviour on the current
  iOS. The 2026 lite-youtube-embed tests covered iPadOS 26.7.3 and explicitly note
  no contemporary iPhone A/B test.
- Whether a CSS-3D-transformed cross-origin iframe still receives taps reliably in
  the walkman screen position.
- The deployed site's `Referrer-Policy` (must not be `no-referrer`) and whether
  Vercel/Astro sets anything unexpected → watch for error 153.
- Behaviour of a region-blocked track: whether it fires `onError` or only shows an
  in-player overlay. Do not build UI that assumes a specific code.
- Volume control on current iOS (expected no-op).

## Sources

Primary:

- [YouTube IFrame Player API reference](https://developers.google.com/youtube/iframe_api_reference)
- [YouTube embedded player parameters](https://developers.google.com/youtube/player_parameters)
- [YouTube Help — Embed videos & playlists (privacy-enhanced mode, error 153, age restriction)](https://support.google.com/youtube/answer/171780)
- [YouTube API Services Developer Policies](https://developers.google.com/youtube/terms/developer-policies)
- [YouTube API Services Terms of Service](https://developers.google.com/youtube/terms/api-services-terms-of-service)
- [YouTube Required Minimum Functionality](https://developers.google.com/youtube/terms/required-minimum-functionality)
- [Google EU User Consent Policy](https://www.google.com/about/company/user-consent-policy/)
- [MDN — Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- [Chrome — Autoplay policy](https://developer.chrome.com/blog/autoplay)
- [WebKit — New `<video>` Policies for iOS](https://webkit.org/blog/6784/new-video-policies-for-ios/)
- [Apple — Delivering Video Content for Safari](https://developer.apple.com/documentation/webkit/delivering-video-content-for-safari)
- [Apple — Safari HTML5 Audio and Video Guide, iOS-Specific Considerations (archived)](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html)
- [WebKit bug 190794 — `allow=autoplay` not honoured](https://bugs.webkit.org/show_bug.cgi?id=190794)
- [GDPR](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679) · [CJEU C-582/14 Breyer](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:62014CJ0582) · [§25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html)

Community/engineering evidence (clearly labelled above as such):

- [lite-youtube-embed PR #214 — one-tap audible playback on iPhone/iPad](https://github.com/paulirish/lite-youtube-embed/pull/214)
- [lite-youtube-embed autoplay evidence notes](https://github.com/paulirish/lite-youtube-embed/blob/main/autoplay.md)
- [lite-youtube-embed issue #6 — double-tap](https://github.com/paulirish/lite-youtube-embed/issues/6)
- [lite-youtube-embed PR #109 — iframe payload ~1 MB](https://github.com/paulirish/lite-youtube-embed/pull/109)
- [react-player #1034 — iOS double-tap](https://github.com/cookpete/react-player/issues/1034)
- [csswg-drafts #6468 — pause media in hidden iframes](https://github.com/w3c/csswg-drafts/issues/6468)
