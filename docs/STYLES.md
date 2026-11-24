# A field guide to the styles behind the themes

This is a companion to [`SCREENSHOTS.md`](SCREENSHOTS.md). It explains where each style comes
from, what defines it, how to recognise it, and what it's actually good for — plus the failure
modes to watch for. Every style below is implemented somewhere on this branch; the theme id is
listed at the end of each entry.

## How to read style names

These labels come from two very different places, and knowing which is which explains a lot:

1. **Art-historical movements** with manifestos, schools and textbooks — Surrealism, Swiss
   Design, Minimalism, Victorian, Bohemian, Wabi-Sabi. Their rules were argued over by people
   who wrote letters to each other. They usually describe a *philosophy*, and the visuals
   follow from it.
2. **Internet-era aesthetic labels**, coined by designers and communities in the 2010s–2020s,
   often with the "-ism" or "-core" suffix — Neumorphism, Glassmorphism, Claymorphism,
   Neo-Brutalism, Cybercore, Y2K, Synthwave, Pixel Art, Bento. These usually describe a *look*
   first; the philosophy is retrofitted. They rise on Dribbble and die on Dribbble, and knowing
   their age is knowing their expiry date.

A few are technical conventions rather than styles at all (Bento is a layout; Pixel Art is a
rendering constraint; Synthwave is a music genre that grew visuals). Treat the boundaries as
useful, not sacred — real work mixes them.

## The quick map

```
Print heritage        Swiss · Editorial · Victorian · Risograph · Conceptual Sketch · Isometric
Quiet modernism       Minimalism · Luxury Typography · Wabi-Sabi · Ethereal
Digital material      Glassmorphism · Neumorphism · Claymorphism
Loud & expressive     Neo-Brutalism · Maximalism · Surrealism · Kinetic · Sticker
Retro-tech            Cyberpunk · Cybercore · Synthwave · Y2K · Pixel Art · Terminal · Retro-OS
Human & handmade      Scrapbook · Bohemian
Structure-first       Bento Grid
```

Roughly chronological, the lineages run: 19th-century print and ornament (Victorian) → early
modernism and the grid (Swiss, Minimalism) → 1960s–80s counterculture and print revival
(Bohemian, Risograph's 1980s tooling) → 1980s technology culture (Cyberpunk, Pixel Art,
Retro-OS) → 1990s–2000s consumer tech (Y2K) → 2010s skeuomorphism and flat design → 2019+
internet aesthetics (Neumorphism, Glassmorphism, Claymorphism, Neo-Brutalism, Cybercore) →
2020s nostalgia cycles (Synthwave, Y2K revival, Win95 revival, scrapbook/analog revival).

---

# A–Z entries

## Bento Grid — *structure-first*

**Where it comes from.** Named after the Japanese bento box — compartments of different sizes
sharing one tray. As a web trend it crystallised around 2021–2023, most visibly in Apple's
product pages and widget-heavy operating-system UI (macOS Sonoma, 2023). Designers had built
modular grids for decades; what's new is the *aesthetic* of visible modularity.

**What defines it.** A dense but orderly grid of cards with mixed spans (2×2, 2×1, 1×1) that
tile into a rectangle; rounded corners; generous gaps; clear hierarchy by size — the biggest
cell is the most important content. Content is chunked into independent, scannable modules.

**How to spot it.** Look at the layout before the styling: if the page would still make sense
as a board of resizable tiles, it's bento. The tell is *asymmetric but ordered* — no ragged
edges, no empty holes.

**When to use it.** Feature overviews, dashboards, portfolio homepages, "everything at a
glance" pages, product marketing where many small facts must coexist. **When not to:** long-form
reading (boxes interrupt narrative flow) and mobile-first content where stacking destroys the
grid's meaning.

**On this site:** `bento`.

## Bohemian — *human & handmade*

**Where it comes from.** "Bohemian" originally described Roma people in France and became, in
19th-century Paris, a label for artists living outside bourgeois convention. It was revived as
a lifestyle aesthetic by the 1960s counterculture and again as "boho-chic" in 2000s fashion
and interiors (Coachella, Sienna Miller era), then flowed into digital branding for craft and
wellness products.

**What defines it.** Earthy, sun-baked palettes (terracotta, sage, sand, clay rose), textile
patterns as graphic language (kilim bands, weaving, tassels), arches and organic shapes, serif
type with warmth, an emphasis on the handmade and imperfect over the industrial and precise.

**How to spot it.** Warm earth colours + textile geometry + arches. If it feels like it smells
of dust and incense, it's boho. The digital version is usually *tasteful* boho — the risk is
sliding into kitsch.

**When to use it.** Lifestyle, craft, food, travel, wellness, personal brands with warmth and
slow-living values. **When not to:** anything that needs to signal speed, precision or
technology.

**On this site:** `bohemian`.

## Claymorphism — *digital material*

**Where it comes from.** Coined around 2022 (the term is attributed to designer Michal
Malewicz, who also popularised Neumorphism and Glassmorphism), riding the wave of soft 3D "clay
render" illustrations that filled Dribbble from roughly 2020. It's the cheerful cousin of
Neumorphism: same dual-shadow trick, but with colour and personality.

**What defines it.** Inflated, pillowy rounded shapes; every surface looks pressable. The
signature is a *two-layer shadow*: a soft dark shadow below-right plus a light inner highlight
at the top-left, which reads as a thickness of clay. Pastel or candy palettes, generous radii
(≥ 1.5rem), squishy press states.

**How to spot it.** Ask: could I squish it? If the button looks like a gummy candy and the card
looks moulded rather than cut, it's clay.

**When to use it.** Playful consumer products, kids' apps, onboarding flows, community
platforms — anywhere friendliness is a feature. **When not to:** dense professional tools;
clay wants breathing room, and every element competing to look pressable flattens hierarchy.

**On this site:** `claymorphism`.

## Conceptual Sketch — *print heritage / process*

**Where it comes from.** Designers have always thought on paper — napkins, whiteboards,
blueprints (technical drawing formalised in the 19th century). The *digital* version became a
deliberate aesthetic with rough-wireframe tools (Balsamiq, 2008; Excalidraw, 2020) and the
"show your working" culture of design studios. Its charm is honesty: the sketch admits it is
unfinished.

**What defines it.** Wobbly hand-drawn borders, hatching instead of fills, dimension lines and
annotation arrows, graph or blueprint paper, red-pencil corrections, labels in technical
monospace, "v4 FINAL final" margin jokes.

**How to spot it.** Nothing is perfectly straight, and the page talks to you in marginalia.
If removing the annotations would remove the design, it's sketch.

**When to use it.** Creative portfolios, process write-ups, early-stage products that want to
signal "in progress, join us", educational and workshop material. **When not to:** trust-
critical interfaces — hand-drawn affordances read as unfinished, which is the opposite of what
banking, health or enterprise software needs.

**On this site:** `sketch`.

## Cybercore — *retro-tech*

**Where it comes from.** A 2020s internet-aesthetic label (part of the "-core" naming wave)
for industrial-technological imagery: military HUDs, techwear, glitch art, data overlays,
hazard signage. It's the colder, more utilitarian sibling of Cyberpunk — less neon city, more
server room and satellite feed. Glitch art itself dates to the 1990s and 2000s net-art scenes.

**What defines it.** Black/charcoal with acid-green, cyan and hazard-yellow accents; corner-
bracket HUD frames; monospaced data readouts; scanlines and subtle RGB-split glitch; stencil
type; warning stripes; status language ("[ACTIVE]", "MISSION FILE").

**How to spot it.** It looks like equipment, not a city. If the page would be at home on a
rugged laptop in a bunker, it's cybercore.

**When to use it.** Security, developer tooling, gaming hardware, esports, anything that wants
to feel technical and slightly dangerous. **When not to:** warmth-dependent brands; the
industrial voice gets exhausting on long text.

**On this site:** `cybercore`.

## Cyberpunk — *retro-tech*

**Where it comes from.** A literary movement of the 1980s — William Gibson's *Neuromancer*
(1984), Bruce Sterling's anthologies — indebted to *Blade Runner* (1982). Its thesis was "high
tech, low life": advanced technology inside decaying, unequal cities. The visual language —
neon signage in rain, dense multilingual shopfronts, CRT interfaces, bodily augmentation —
came to dominate games, film and eventually web design.

**What defines it.** Dark grounds with saturated neon (magenta, cyan, acid green), glow that
bleeds, layered signage, glitch and scanline artefacts, terminal windows, a mood of night-city
density and corporate dystopia.

**How to spot it.** Neon glow on black *plus a story of urban density*. Synthwave borrows the
colours but is nostalgic; cyberpunk is grimy, crowded and cynical.

**When to use it.** Games, music, nightlife, edgy tech brands, event microsites. **When not
to:** as a default for professional products — the trope is decades old now, and glow fights
text legibility and accessibility hard.

**On this site:** `neon`.

## Editorial Design — *print heritage*

**Where it comes from.** Magazines and newspapers — a print tradition going back centuries,
industrialised in the 19th and 20th. Its digital life runs from early web magazines to Medium
(2012) and the current independent-publication boom. Editorial design is the craft of making
long content navigable and credible.

**What defines it.** Strong typographic hierarchy: kickers, headlines, standfirsts, bylines,
datelines, pull quotes; a grid that supports multi-column reading; images treated as plates
with captions; rules and hairlines as punctuation. Often a serif/sans pairing.

**How to spot it.** It reads in layers — you can tell what to read first, second, third without
colour. The furniture (dates, credits, captions) is styled, not incidental.

**When to use it.** Blogs, magazines, documentation with narrative, case studies, anything
where reading is the primary activity. **When not to:** product UI — editorial furniture adds
noise to task flows.

**On this site:** `editorial` (Swiss-inflected) and `riso` (a zine-print relative).

## Ethereal — *quiet modernism*

**Where it comes from.** More atmosphere than movement. It inherits Romanticism's mist and
light, impressionist softness, and the dreamy pastel gradients of 2010s–2020s "dreamcore" and
wellness branding. It's what a brand reaches for when it wants calm without coldness.

**What defines it.** Mist-like layered gradients, low-contrast pastels, soft blur, generous
space, airy serif or light sans type, elements that seem to float rather than sit. Motion is
slow drift, never bounce.

**How to spot it.** Everything feels slightly out of focus except the type. If the page could
be described as "a sigh", it's ethereal.

**When to use it.** Wellness, beauty, music, meditation, storytelling that wants dreaminess.
**When not to:** contrast-heavy accessibility requirements or information density — the
softness is literally low contrast and needs careful dark/light design to stay legible.

**On this site:** `ethereal`.

## Glassmorphism — *digital material*

**Where it comes from.** Frosted-glass UI has existed since Windows Vista's Aero (2006) and
iOS 7 (2013), but the *term* was coined around 2020 (again Michal Malewicz), the same year
macOS Big Sur made translucent, blurred layers a mainstream default. It's the visual language
of "depth without heaviness".

**What defines it.** Translucent panels that blur whatever sits behind them (`backdrop-filter`),
a hairline light border that catches the edge, layered depth, and a colourful background for
the glass to refract. Often accompanied by soft gradient "sky" backdrops.

**How to spot it.** Move content behind a panel: if it blurs and the panel glows at its edges,
it's glass.

**When to use it.** Premium tech, dashboards that benefit from context-preserving layers,
operating-system-like interfaces, media players. **When not to:** dense text on busy
backgrounds (blur can't rescue contrast) and low-powered devices (blur is expensive per frame).

**On this site:** `aurora`.

## Isometric — *print heritage / technical*

**Where it comes from.** Isometric projection is a drafting convention: parallel axes at 30°,
no vanishing point, so measurements stay true. It predates digital games but became iconic
through them — *Zaxxon* (1982), *Q*bert* (1982), *SimCity* (1989) — and returned as an
illustration trend around 2017 when 2.5D scenes became easy to render and impossible to avoid
on Dribbble.

**What defines it.** A fixed 30° grid, cuboid objects drawn with three visible faces, no
perspective convergence, technical furniture (dimension lines, coordinates, labels), and the
pleasing illusion of depth on a flat page.

**How to spot it.** Parallel edges never meet. If the drawing could be a technical diagram
*and* a city, it's isometric.

**When to use it.** Explaining systems, dashboards with a playful-technical tone, product
architecture diagrams, portfolios for engineers. **When not to:** content where text must
dominate — isometric scenes compete spatially with reading.

**On this site:** `isometric`.

## Kinetic (typography) — *loud & expressive*

**Where it comes from.** Kinetic art (1920s–60s) and Bauhaus experiments with type in motion;
then film title sequences (Saul Bass, 1950s–60s), television idents (MTV, 1981), and finally
the web's scroll-driven animation era (2010s–2020s). The style treats type as architecture and
animation as the layout.

**What defines it.** Oversized display type, marquees and tickers, words that slide, clip and
reveal, scroll-linked movement, posters rather than pages. The homepage is a title sequence.

**How to spot it.** If the type would still work printed as a poster at 2 metres wide, and it
moves the moment you arrive, it's kinetic.

**When to use it.** Portfolios, agencies, events, culture and music campaigns — anywhere the
first three seconds matter. **When not to:** reading-heavy content, and never without a
`prefers-reduced-motion` path; motion is a privilege, not a requirement.

**On this site:** `kinetic`.

## Luxury Typography — *quiet modernism*

**Where it comes from.** Not a movement but a branding tradition: fashion houses and
magazines built a visual language from high-contrast Didone serifs (Bodoni, Didot, 18th–19th
century), letterspaced small caps, and the confidence of empty space. Swatch and space are the
luxury signalling devices; the type does the talking.

**What defines it.** Enormous whitespace, a display serif at large optical sizes, wide tracking
on labels, restrained monochrome palettes with a single metallic accent, images treated like
gallery plates, and almost no interface furniture.

**How to spot it.** If the page feels expensive before you've read a word, it's luxury
typography. The give-away is *restraint pushed beyond usefulness*.

**When to use it.** Fashion, hospitality, jewellery, premium portfolios, brand sites with
little content and a lot of confidence. **When not to:** products with many features or dense
information — luxury minimalism makes functionality invisible.

**On this site:** `luxe`.

## Maximalism — *loud & expressive*

**Where it comes from.** A persistent counter-current to modernism: Baroque and Victorian
horror vacui, 1980s postmodernism (Memphis Group, 1981), and the 2010s–2020s backlash against
flat minimalism, which trend reports began naming "maximalism" around 2019. It argues that
ornament is information: density signals abundance, personality and generosity.

**What defines it.** Layered patterns under layered type, clashing colour and type voices on
purpose, overlapping elements, ornaments everywhere, stickers, ribbons, bursts, marquees — the
page is a party, and nothing is allowed to be empty.

**How to spot it.** Count the decorative elements. If you can't, it's maximalism.

**When to use it.** Fashion, music, culture, youth brands, festival and event sites, personal
brands with big personality. **When not to:** when cognitive load matters — density must be
choreographed, or the page becomes hostile to use.

**On this site:** `maximalism`.

## Minimalism — *quiet modernism*

**Where it comes from.** A 1960s art movement (Donald Judd, Frank Stella) with roots in
architecture ("less is more", Mies van der Rohe) and industrial design (Dieter Rams at Braun,
whose ten principles became a design bible). The web's version arrived via 2010s flat design
and the "calm technology" ideal.

**What defines it.** Few elements, lots of whitespace, limited palette, restrained type scale,
no ornament. Every element must earn its place; hierarchy comes from position and size, not
decoration.

**How to spot it.** Remove one more thing and the page would break. Minimalism is *edited*,
not empty.

**When to use it.** Focus-driven products, premium brands, writing, portfolios. **When not
to:** when it becomes an excuse to hide functionality — minimalism is a discipline, not the
absence of design.

**On this site:** `luxe` and the quieter corners of `wabi-sabi`.

## Neo-Brutalism — *loud & expressive*

**Where it comes from.** Architectural Brutalism (1950s–70s concrete modernism) lent its name
to a web aesthetic that exploded around 2019–2021, popularised by the Gumroad redesign (2021)
and the Brutalist Websites gallery. It was a direct rebellion against the rounded,
gradient-soft, corporate SaaS look: webbiness as honesty.

**What defines it.** Thick black borders (2–4px), flat saturated or acid colours, hard offset
shadows with no blur, chunky display type, visible structure, raw grid, occasional deliberate
"ugliness" as confidence.

**How to spot it.** Every box is outlined like a cartoon and the shadow is a solid block. If
hovering makes the element *press into* the page, it's neo-brutalist.

**When to use it.** Startups and tools that need to stand out in a sea of pastel SaaS, indie
products, portfolios, playful communities. **When not to:** contexts where "raw" reads as
untrustworthy — though done well it's the opposite of careless.

**On this site:** `brutalist`.

## Neumorphism — *digital material*

**Where it comes from.** Coined around 2019 ("new skeuomorphism"), descended from Apple's
skeuomorphic era (2007–2012) and thriving on Dribbble concept shots. It burned bright and
short: stunning for a toggle, notorious for accessibility. Its best legacy is the vocabulary of
dual-shadow "soft UI" that Claymorphism later made usable.

**What defines it.** One background colour, and elements *carved out of it*: raised states use
a light shadow top-left plus a dark shadow bottom-right; pressed states invert them. No borders,
no fills, minimal colour — depth is the only signal.

**How to spot it.** If the buttons and the background are the same colour, it's neumorphism.

**When to use it.** Physical metaphors — knobs, toggles, media controls, hardware companion
apps, ambient devices. **When not to:** almost anywhere text-heavy or state-critical. The
known failure mode is state ambiguity and low contrast: a raised button and a disabled one can
look identical. Treat it as a spice, not a base.

**On this site:** `neumorphism`.

## Pixel Art — *retro-tech*

**Where it comes from.** Not a style choice originally: it was what 1970s–80s hardware could
display (Atari, NES, arcades). Once constraint disappeared, the grid became a language —
kept alive by indie game culture (2000s+) and the 8-bit/16-bit nostalgia industry. "Pixel
perfect" is the core value: every edge lands on the pixel grid.

**What defines it.** Visible pixels and aliased edges, limited palettes, sprite icons, bitmap
typefaces, stepped two-frame animation, chunky UI chrome. 8-bit reads as NES; 16-bit reads as
SNES/Genesis with more colours and detail.

**How to spot it.** Zoom in: if the edges are intentional staircases, it's pixel art. If they
are just low-resolution images, it's not.

**When to use it.** Games, dev tools, playful communities, events. **When not to:** long-form
reading — pixel fonts are a display face, never a body face.

**On this site:** `pixel` (with a nod to `retro-os` and `terminal`).

## Retro-OS (Windows 95 / classic desktop) — *retro-tech*

**Where it comes from.** The skeuomorphic desktop era: Mac System 1 (1984) through Windows 95
(1995) and 98 — beveled grey chrome, window title bars, taskbars, pixel icons. The nostalgia
cycle turned it into an aesthetic around 2019 ("Windows 95 aesthetic", vaporwave's
neighbour), helped by the longing for interfaces that felt *physical*.

**What defines it.** 3D bevels (light top-left, dark bottom-right), grey/silver chrome, title
bars with gradient fills, window controls, taskbar navigation, dialogs, status bars, pixel
icons, instant (zero-duration) interactions.

**How to spot it.** If the UI looks like something you had to install from a CD, it's retro-OS.
The tell is the *chrome*, not the colours.

**When to use it.** Nostalgia-forward brands, dev communities, games, campaigns with an OS
metaphor. **When not to:** serious utility — unless the irony is the point, the metaphor
becomes a usability tax.

**On this site:** `retro-os` (reworked with 8bitcn/ui chrome).

## Risograph — *print heritage / handmade*

**Where it comes from.** The Risograph is a Japanese stencil duplicator (Riso Kagaku, 1980s;
the Risograph itself arrived in 1986) that prints one ink colour per pass with soy-based inks.
Cheap for small runs and beloved by zine makers and indie publishers in the 2010s, its
"flaws" — misregistration, grain, overprint blending — became the aesthetic.

**What defines it.** Two or three spot inks (fluorescent pink, blue, black) overlapping into
new colours, visible misregistration offsets, paper grain, halftone dots, registration and
crop marks, hand-assembled typography.

**How to spot it.** The colours don't look mixed; they look *stamped*. If the pink and blue
meet in a third colour at the edges, it's riso.

**When to use it.** Indie publishing, music, community projects, art portfolios — anything
that benefits from "printed by humans, in small numbers". **When not to:** digital-native
products where the imperfections read as errors.

**On this site:** `riso`.

## Scrapbook — *human & handmade*

**Where it comes from.** Scrapbooking is a centuries-old domestic craft, but its digital
revival is 2010s–2020s: Pinterest culture, "junk journaling", the polaroid comeback, cottagecore
and analog nostalgia. It answers the polished-grid web with glue and handwriting.

**What defines it.** Polaroid frames with handwritten captions, washi tape, torn paper edges,
ruled or graph paper, doodles, stamps, layered ephemera, slightly rotated elements.

**How to spot it.** If the layout looks *assembled* rather than *composed* — taped, not aligned —
it's scrapbook.

**When to use it.** Photo-heavy personal sites, travel and wedding stories, memory projects,
brands built on nostalgia. **When not to:** scalable professional systems; the aesthetic
depends on one-off craft, and repetition ruins it.

**On this site:** `scrapbook`.

## Sticker (kawaii) — *loud & expressive*

**Where it comes from.** Japanese kawaii culture (Sanrio's rise from the 1960s; Hello Kitty,
1974), skate and surf sticker culture of the 1980s, then the die-cut sticker boom of the
2010s (Redbubble, Instagram sticker culture, iMessage stickers in 2016). Cuteness became a
communication layer.

**What defines it.** Chunky rounded shapes with thick white "die-cut" borders, bold outlines,
pastel or candy palettes, bouncy motion with overshoot, blob backgrounds, starbursts, playful
type with rounded terminals.

**How to spot it.** If elements look like they could be peeled off the page, it's sticker.

**When to use it.** Community platforms, consumer apps, creators, anything where warmth and
fun are conversion drivers. **When not to:** dense or serious domains; cuteness does not scale
to complexity.

**On this site:** `sticker`.

## Surrealism — *loud & expressive*

**Where it comes from.** The art movement launched by André Breton's manifesto (1924): Dali,
Magritte, Ernst, Tanguy — dream logic, unconscious desire, the uncanny. Digital design
rediscovered it around 2018–2021, when Mailchimp-style illustration and the 3D-render boom
made impossible scenes cheap to produce.

**What defines it.** Juxtaposition and scale shifts (a door in a horizon, a fish in a frame),
floating objects, dreamlike palettes, elegant typography holding genuinely strange imagery
together. The uncanny is *composed*, not chaotic.

**How to spot it.** The image is impossible but the layout is calm. If the scene makes sense
only in a dream, it's surrealist.

**When to use it.** Creative agencies, campaigns that need to be remembered, brand
storytelling with a wink. **When not to:** utility interfaces — the uncanny unsettles trust.

**On this site:** `surrealism`.

## Swiss Design (International Typographic Style) — *print heritage*

**Where it comes from.** 1950s Switzerland — the Basel and Zurich schools, Josef
Müller-Brockmann, Armin Hofmann, and the typefaces Helvetica (1957) and Univers. It argued for
objectivity: mathematical grids, sans-serif type, asymmetric composition, photography instead
of ornament, clarity as an ethic. It shaped corporate identity and information design
worldwide.

**What defines it.** A visible mathematical grid, flush-left ragged-right text, Helvetica-like
neutrals, generous white space, restrained palettes, content-first hierarchy, no decoration
that doesn't inform.

**How to spot it.** The grid is almost visible through the design. If you could redraw the
layout on graph paper, it's Swiss.

**When to use it.** Information-dense clarity, institutions, museums, technical products,
editorial systems. **When not to:** brands that need warmth or memorability — Swiss design is
confident but deliberately personality-free.

**On this site:** `editorial` is the Swiss-inflected variant.

## Synthwave — *retro-tech*

**Where it comes from.** A music genre and aesthetic reviving 1980s synth soundtracks —
Kavinsky and the Ed Banger scene from the mid-2000s, "outrun" compilations in the 2010s,
then *Drive* (2011) and *Stranger Things* (2016) pushed the visuals mainstream. It's
retro-*futurism*: the 1980s imagining of a chrome tomorrow.

**What defines it.** Purple-to-black skies, a gradient sun sliced with scanlines, a
perspective grid horizon, chrome or neon script type, palm silhouettes, magenta/cyan lighting,
slow shimmer.

**How to spot it.** The horizon is the composition. If the page has a vanishing-point grid and
a sunset, it's synthwave — not cyberpunk (which is a city) and not vaporwave (which is ironic
consumer nostalgia).

**When to use it.** Music, gaming, events, retro campaigns, merch. **When not to:** everyday
product interfaces — the aesthetic is a strong flavour that overwhelms content.

**On this site:** `synthwave`.

## Terminal / CRT — *retro-tech*

**Where it comes from.** 1970s–80s computer terminals (the VT100 and phosphor-green monitors),
DOS and early Unix culture, and the hacker imaginary of the 1990s. Digital nostalgia for the
command line has never really left developer culture; it resurfaces every few years as a UI
language.

**What defines it.** Monospace everything, green (or amber) on black, prompts and command
output, ASCII art and box-drawing characters, scanlines and phosphor glow, boot sequences,
cursor blink.

**How to spot it.** The page talks like a shell: prompts, outputs, exit codes.

**When to use it.** Developer tools, security products, docs for technical audiences, playful
campaigns for engineers. **When not to:** mainstream consumer access — command-line metaphors
are a password, not a welcome mat.

**On this site:** `terminal` (reworked with 8bitcn/ui chrome).

## Victorian — *print heritage*

**Where it comes from.** Britain 1837–1901 and broadly 19th-century print culture: letterpress
and engraved illustration, ornamental type, elaborate borders, catalogues and newspapers. The
2020s "dark academia" revival brought it back as a digital aesthetic of heritage and craft.

**What defines it.** High-contrast engraved serifs, double rules and flourishes, drop caps,
roman numerals, letterpress texture, muted paper tones, oxblood or gold accents, catalogue and
plate language.

**How to spot it.** The page has *furniture*: rules, frames, corners, ornaments. If a printer
could have set it in 1890, it's Victorian.

**When to use it.** Heritage brands, publishing, craft products, storytelling with gravitas,
portfolios that want old-world confidence. **When not to:** modern utility interfaces;
ornament competes with function, and readability suffers at small sizes.

**On this site:** `victorian`.

## Wabi-Sabi — *quiet modernism*

**Where it comes from.** A Japanese aesthetic worldview rooted in Zen Buddhism and codified in
the tea ceremony (Sen no Rikyū, 16th century): beauty in imperfection, impermanence and
incompleteness — the repaired bowl, the uneven glaze, *ma* (the meaningful void). It entered
Western design vocabulary through 1990s–2000s craft and interior movements.

**What defines it.** Deliberate asymmetry, muted natural palettes, raw textures, generous
empty space, imperfect alignment, handmade-feeling type (humanist serifs), restraint without
sterility.

**How to spot it.** Nothing is centred, and nothing feels neglected. If the imperfection feels
*chosen*, it's wabi-sabi; if it feels sloppy, it's just messy.

**When to use it.** Craft, wellness, hospitality, personal work with contemplative values.
**When not to:** where precision is the product (fintech, medical); and beware the trap of
using "imperfection" to skip craft.

**On this site:** `wabi-sabi`.

## Y2K Aesthetic — *retro-tech*

**Where it came from.** The look of consumer technology around 1995–2003: translucent iMacs
(1998), chrome and liquid-metal type, bubbly plastic forms, holographic materials, and
techno-optimism before the dot-com crash. Gen Z revived it around 2019–2021 as a fashion and
web aesthetic; its sibling is "Frutiger Aero" (the 2004–2013 glossy-sky era).

**What defines it.** Chrome gradients and metallic highlights, translucent frosted plastics,
bubble and pill shapes, pastel-to-silver palettes, holographic gradient borders, sparkle
twinkles, optimistic microcopy, early-internet motifs.

**How to spot it.** If it looks like a 2001 product launch and *enjoys* it, it's Y2K — not
synthwave (80s sunset) and not vaporwave (ironic, degraded).

**When to use it.** Fashion, music, youth brands, campaigns, nostalgic tech products. **When
not to:** anything where the aesthetic's irony would undermine credibility.

**On this site:** `y2k`.

---

# Spotter's table

| If you see… | It's probably… |
|---|---|
| Same-colour buttons carved from one surface | Neumorphism |
| Frosted translucent panels over a colourful sky | Glassmorphism |
| Puffy pastel shapes with inner highlights | Claymorphism |
| Thick black outlines + hard solid shadows | Neo-Brutalism |
| Mixed-size rounded cards in an exact rectangle | Bento Grid |
| Serif drop caps, double rules, fleurons | Victorian |
| Hairline grid, Helvetica, flush-left text | Swiss Design |
| Kickers, standfirsts, pull quotes, captions | Editorial |
| Two spot inks with visible misregistration | Risograph |
| 30° parallel lines, no vanishing point | Isometric |
| Graph paper, hatching, red-pencil notes | Conceptual Sketch |
| Polaroids, tape, torn paper, handwriting | Scrapbook |
| Rounded die-cut shapes with white borders | Sticker / kawaii |
| Green monospace, prompts, scanlines | Terminal / CRT |
| Grey bevels, title bars, taskbar | Retro-OS |
| Neon glow over a crowded night city | Cyberpunk |
| HUD brackets, hazard stripes, glitch | Cybercore |
| Sunset grid horizon, chrome script | Synthwave |
| Chrome bubbles, translucent plastic, sparkles | Y2K |
| Visible pixel grid, stepped animation | Pixel Art |
| Huge moving type, marquees, poster scale | Kinetic |
| Impossible scenes, floating objects | Surrealism |
| Dense ornament, clashing type voices | Maximalism |
| Whitespace, one serif, almost nothing else | Luxury Typography / Minimalism |
| Off-centre, raw textures, muted earth tones | Wabi-Sabi |
| Mist, soft gradients, floating elements | Ethereal |
| Terracotta, weaving, arches, sun motifs | Bohemian |

# Frequently confused pairs

- **Glassmorphism vs. Neumorphism vs. Claymorphism.** All three fake material with shadows.
  Glass is *translucent and behind-filtered*; neumorphism is *carved from one colour*; clay is
  *inflated colour with two-layer shadows*. Glass has background blur; clay has pastels; neumorphism
  has neither.
- **Synthwave vs. Cyberpunk vs. Cybercore.** Era and mood: synthwave is 1980s retro-futurist
  nostalgia (sunset grid); cyberpunk is 1980s dystopian night city (neon, rain, density);
  cybercore is 2020s industrial-tech (HUD, hazard, glitch). Cyberpunk tells a story about
  society; cybercore tells a story about hardware.
- **Editorial vs. Swiss.** Swiss is a philosophy of grids and objectivity; editorial is the craft
  of presenting content. A Swiss layout can be editorial; an editorial page is not necessarily
  Swiss (it may be ornate or expressive).
- **Minimalism vs. Luxury Typography vs. Wabi-Sabi vs. Ethereal.** Four quiet styles with
  different engines: minimalism removes; luxury *prices* (serif confidence, metallic accent);
  wabi-sabi *ages* (raw, asymmetric); ethereal *softens* (mist, blur). Minimalism is the
  absence of ornament; the others are ornament of a subtler kind.
- **Neo-Brutalism vs. Maximalism.** Both are loud, but brutalism is *structural* (borders,
  blocks, function exposed) while maximalism is *decorative* (layers, patterns, voices).
  Brutalist pages are usually sparse; maximalist pages are dense.
- **Retro-OS vs. Pixel Art vs. Terminal.** Retro-OS is *chrome* (window furniture), Pixel Art
  is a *rendering constraint* (everything on a pixel grid), Terminal is *language* (commands
  and output). They co-occur often, but each can exist without the others.
- **Y2K vs. Frutiger Aero vs. Vaporwave.** Y2K is 1995–2003 optimism (chrome, translucent
  plastic); Frutiger Aero is 2004–2013 corporate nature-tech (glossy skies, bubbles, Windows
  Aero); vaporwave is ironic, sun-bleached consumer nostalgia. The Y2K revival usually borrows
  from the first two and forgets the third's irony.

# Choosing a style

A practical decision order:

1. **What does the page need to do?** Read (editorial, Swiss, Victorian), sell a feeling
   (luxury, ethereal, wabi-sabi, boho), show off (brutalist, maximalism, kinetic, surrealism),
   explain (bento, isometric, sketch, terminal), or be *used* (any style, but hierarchy first)?
2. **Who is it for?** Peers reward personality; recruiters reward clarity; consumers reward
   warmth; enterprises reward predictability. Match the voice to the audience's tolerance for
   novelty.
3. **How much content?** Dense content needs a system (bento, editorial, Swiss); sparse content
   can afford atmosphere (luxury, ethereal, surrealism).
4. **What must never fail?** If accessibility, contrast, or state clarity are critical, the
   softest material styles (neumorphism, glassmorphism, low-contrast ethereal) need the most
   care; if motion is present, reduced-motion support is non-negotiable.
5. **How long must it live?** Internet aesthetics age in cycles of roughly 5–10 years; print
   traditions age in decades. Choose the trendier style when the product itself is trend-
   adjacent; choose the print-derived one when longevity matters.

Two honest rules of thumb:

- **A style is a grammar, not a costume.** The best executions derive decisions from the
  style's logic (Swiss → grid and objectivity; brutalist → exposed structure; wabi-sabi →
  chosen imperfection), not from copying its surface motifs.
- **One strong style beats three weak ones.** Pick a primary direction and let a second appear
  only where it solves a specific problem — e.g. an editorial content system with bento
  dashboards.

# Accessibility and performance notes by style

| Style | Main risk | Mitigation |
|---|---|---|
| Glassmorphism | Contrast over blurred/colourful backdrops | Solid backplates for text, test both modes, cap blur layers |
| Neumorphism | State ambiguity, low contrast | Add explicit state colours/labels; don't rely on shadow alone |
| Claymorphism | Everything looks pressable | Reserve the "press" affordance for real controls |
| Ethereal | Low-contrast text, heavy blur | Minimum contrast checks, blur only on decoration |
| Pixel Art | Illegible body text | Pixel fonts for display only; readable body face |
| Terminal | Small mono text, low density | Size floors, contrast, real focus styles |
| Kinetic | Motion sickness, distraction | `prefers-reduced-motion`, pause-on-focus for marquees |
| Maximalism | Cognitive overload | Choreograph density: one focal point per region |
| Surrealism | Unsettling imagery in task flows | Keep the weirdness decorative, not in controls |
| Retro-OS | Metaphor tax (users must decode Windows) | Keep familiar affordances and labels |
| Victorian | Ornament competing with legibility | Ornament in margins; type at generous sizes |
| Scrapbook/Riso | Photos and grain cost weight | Compressed images, lazy loading, CSS-generated texture |

# Further reading

- Josef Müller-Brockmann, *Grid Systems in Graphic Design* — the Swiss method, from the source.
- Jan Tschichold, *The Form of the Book* — print tradition and page architecture.
- Robert Bringhurst, *The Elements of Typographic Style* — the typographer's bible.
- Ellen Lupton, *Thinking with Type* — accessible history and practice.
- Dieter Rams' ten principles of good design — the minimalism ethos in one page.
- Donald Norman, *The Design of Everyday Things* — affordances and signifiers, the theory
  behind neumorphism's failures.
- W3C WCAG 2.2 — the accessibility floor every style must meet.
- The Brutalist Websites archive and Awwwards collections — primary sources for how these
  styles actually age.
- Michal Malewicz's writing — the origin of the "morphism" naming wave (glass, neo, clay).

---

*This guide is opinionated on purpose: it describes families and failure modes, not rules.
The themes on this branch are the guide's examples — open `SCREENSHOTS.md` for the visuals,
and toggle the site through them to feel the differences in motion and hierarchy.*
