# Pocket Rain — art handoff for GPT

You're making the art for **Pocket Rain**, a phone-first, scroll story for the
Diocesan Girls' School (DGS) GX Club. The audience is **high-school girls in Hong
Kong** who scan a QR code at the club's stall. They should come away feeling
*"this is so cute, and the drop in my bag means something."*

The site is already built (`index.html`, `style.css`, `app.js` in this folder).
**Every illustration on the page is a named slot.** When a file with that exact
name appears in `assets/`, the page uses it automatically and the
temporary vector drawing steps aside. You never need to touch the code.

- Check progress: open the site with `?assets` on the end of the address
  (e.g. `https://dgs-pocket-rain.vercel.app/?assets`). A checklist shows ✅ / ⬜ for every slot.
- Wrong file name = the slot stays empty. Names are lowercase and exact.
- If you can, run any test page on a phone screen. The page is made for phones first.

You have the club's reference photos. Use them as the source of truth for what
things really look like (see **Reference photos** at the bottom).

---

## 1 · Style bible (applies to every illustrated asset)

> **Soft Japanese-picture-book watercolor on cold-press paper.** Gentle wet-on-wet
> washes, visible paper grain, soft blooms and backruns at the edges, fine
> hand-drawn pencil/ink linework in warm grey (never black outlines). Pastel
> palette: sky blue `#86b9ee`, cornflower `#7f98de`, powder blue `#aac6dc`,
> seafoam `#c3e2df`, blush pink `#ffc4d3`, butter `#fff0b8`, warm cream paper
> `#fff6ec`. Light comes from the upper left. Cosy, hopeful, never sad or
> poverty-porn. Children and families look dignified, healthy and happy, and act
> for themselves (they fetch, pour and share water; nobody is a passive recipient).
> Kawaii touches are welcome (tiny sparkles, rosy cheeks on objects), but the
> people are drawn naturally, not chibi.

Rules for every image:
- **No text, letters, numbers or logos inside the art** unless the slot asks for it.
  The site adds all words in English and 繁體中文 itself.
- "Transparent" means a real alpha channel. No fake checkerboard, no white box.
  Leave ~4% empty margin so nothing touches the edge.
- No GX Foundation or DGS logos inside illustrations. Real photos keep whatever
  is really in them.
- Export at the size given, then compress. WebP quality 80–85 for scenes, and
  PNG or WebP with alpha for cut-outs. Aim for < 250 KB per scene and < 120 KB per cut-out.

---

## 2 · The story (so the art matches the beat it sits in)

| # | Chapter | What happens | Feeling |
|---|---|---|---|
| 0 | **Hello** | You meet **Pip**, a crocheted raindrop keychain. Tap, drag and pet her. "They could have crocheted me into any shape. So why a drop?" | giggly, curious |
| 1 | **Two cups** | At the stall: two paper cups, *Filtered* and *Tap water*. You pick one, and the club's TDS meters come out. In Hong Kong, either cup is fine. | playful |
| 2 | **Here, rain is just weather** | Tap smiling clouds to make Hong Kong rain fall on grass. "Twist a tap and water appears: the most boring magic trick in the world." | cosy |
| 3 | **South, and further south** | Pip unravels her yarn and travels ~3,600 km from Hong Kong to Timor-Leste on a map. | adventure |
| 4 | **Water you have to wonder about** | In Timor-Leste, 70% of surface water is polluted (GX). A murky jar goes through a purifier and comes out clear. | wondering, then relief |
| 5 | **Someone is waiting** | A child holds out a cup at a water point. Press and hold to fill it. | tender |
| 6 | **One, then another** | 100 drops = 100 purification machines (July 2024, all churches, all hospitals and some schools as pilot sites). Projected 400,000 gallons a year, ~US$800k saved, ~3 million plastic bottles avoided. | proud, hopeful |
| 7 | **Why a drop?** | "Because a drop is the smallest piece of something very big." The real box of crocheted drops. | warm |
| 8 | **Back to the schoolbag** | Pick a yarn shade, name your drop, and it hops onto a schoolbag. "Next time you reach for your schoolbag, remember the hand that held out a cup." | glowy ending |

---

## 3 · Slots: what to make

Legend: **T** = transparent background · **S** = full scene (soft vignette edges into cream paper `#fff6ec`, no hard rectangle).

### A. Pip, the star: **PRIORITY #1, please redo**

The current `pip-*.webp` files are a quick stand-in that Claude cut out of an old
photo. They work, but the edges are rough (fuzzy fringe, a faint shadow ghost).
Please replace all eight with clean, high-quality versions. She's on screen
the whole time, so she's the most important asset on the page.

Prompt (start from the close-up reference photo of the single blue drop):
> *Studio product cut-out of this exact crocheted amigurumi raindrop keychain:
> sky-blue acrylic yarn in single-crochet rounds, two small glossy black safety-bead
> eyes, the little curled tip at the top with a tiny silver jump ring. Front view,
> standing upright, soft even light from the upper left, a gentle 3D volume,
> crisp yarn texture with a very light halo of natural fuzz (not ragged). Fully
> transparent background, no shadow, no puddle. Keep its real proportions: a
> rounded teardrop, slightly wider at the bottom.*

Then, for the colour set, use **the same image** recoloured (don't regenerate,
or her shape will change between shades): sky `#86b9ee`, cornflower `#7f98de`,
powder `#aac6dc`, seafoam `#c3e2df`. For the happy frames, edit only the face:
replace the bead eyes with closed happy `^ ^` arcs in black yarn and add soft
pink blush under them. Change nothing else.

| File | Spec | Notes |
|---|---|---|
| `pip-sky.webp` `pip-cornflower.webp` `pip-powder.webp` `pip-seafoam.webp` | **T**, 480×566 (200:236 ratio), plush bottom-centred, standing, front view | Cut out of the real crochet photo, then recoloured into the 4 real yarn shades. The bottom of the plush touches the bottom margin. Physics squash and stretch her from the bottom-centre. |
| `pip-<shade>-happy.webp` (×4) | same framing, **pixel-identical position** | The same plush with eyes closed in happy `^ ^` arcs (black yarn stitches) and soft pink blush. Used for squish, pet and blink. If the framing shifts even slightly, she'll "jump". |

If you redo them, start from the club's close-up photo of the single blue drop
(the one sitting in front of a laptop): cut it out cleanly, keep the real
stitches, the black bead eyes and the little top curl/loop, remove the shadow,
and add a tiny silver keyring at the top.

### B. Hero + atmosphere

| File | Spec | Prompt |
|---|---|---|
| `hero-wash.webp` | **S**, 1600×1100 | *Watercolor sky wash for a title page: pale blush-pink to sky-blue gradient, a few soft smiling cumulus clouds near the top corners, tiny falling raindrop sparkles, a faint puddle reflection at the bottom centre. Lots of empty calm space in the middle for a title and a character. Style bible.* |
| `paper-texture.webp` | seamless tile, 900×900 | *Seamless tileable warm cream cold-press watercolor paper texture, very subtle, no stains, no vignette, even lighting.* (Keep it faint: the page multiplies it over cream.) |
| `og-card.png` | 1200×630, opaque | *Social share card: Pip, a crocheted sky-blue raindrop plush with bead eyes, sitting in a little watercolor puddle on cream paper, soft rain sparkles. Leave the left 45% empty for a title.* Then add the words **Pocket Rain** and **袋裡的小水滴** in a rounded, friendly hand-lettered style. (This is the one slot that may contain text.) |

### C. Chapter 1: Two cups

| File | Spec | Prompt |
|---|---|---|
| `cup-filtered.png` | **T**, 600×750, cup upright, slightly from above | *Watercolor of a double-wall kraft-brown paper cup with a white rim, filled with clear water that catches a highlight, a tiny sparkle. On the kraft sleeve, a blank cream paper label about 60% as wide as the cup, centred vertically (leave it empty; the site writes the word). Style bible, isolated on transparent.* Reference: the club's photo of the two cups. |
| `cup-tap.png` | same | Same cup, a slightly different tilt so the two feel hand-made, not copy-pasted. |

### D. Chapter 2: Rain

| File | Spec | Prompt |
|---|---|---|
| `cloud-1.png` `cloud-2.png` `cloud-3.png` | **T**, 600×350 | *A fluffy white watercolor cloud with a tiny kawaii face (two dot eyes, a small smile, pink cheeks), soft blue shadow on its belly.* Make three expressions: 1 happy, 2 sleepy (closed eyes), 3 surprised `o`. |
| `sticker-umbrella.png` | **T**, 500×500 | *Watercolor sticker of a small pastel-blue umbrella with raindrops sliding off, white sticker border.* |

### E. Chapter 3: The journey map (the most important composition rule)

| File | Spec | Prompt |
|---|---|---|
| `map-journey.webp` | **4:3, 1600×1200, opaque** | *Hand-painted watercolor storybook map of East and Southeast Asia's seas: the South China Sea in soft blue washes with tiny wave strokes, coastlines in sage green with pencil edges. Include the south China coast, the Philippines, Borneo, Sulawesi, and the island of Timor (warm peach-sand colour). Tiny cute details: a little paper boat, a whale tail, a few clouds. No labels, no text, no route line.* |

The site draws Pip's yarn route on top using fixed positions, so the geography must sit where the route expects:
- **Hong Kong** (on the south China coast): **x = 42%, y = 10%** of the image.
- **Dili, Timor-Leste** (north coast of Timor): **x = 76%, y = 85%**.
- The route bends down through the middle: open sea at about (49%, 38%), then past Borneo's east side at about (42%, 57%), then (62%, 70%).
- Keep Borneo roughly in the area x 30–50%, y 48–72%, and Timor as a long thin island around x 66–88%, y 82–88%.

### F. Chapter 4: Murky to clear

| File | Spec | Prompt |
|---|---|---|
| `jar-murky.png` | **T**, 600×720 | *Watercolor glass mason jar with a pastel-pink lid, filled 75% with cloudy tan-brown water with tiny floating specks and a leaf. Slightly gloomy but still cute.* |
| `jar-clear.png` | **T**, **identical size and position** | *The exact same jar, now with crystal-clear pale-blue water, light refracting, two sparkles.* (The site cross-fades murky to clear, so outlines must match.) |
| `murky-river.webp` | **S**, 1600×900 | *Gentle watercolor of a rural stream in Timor-Leste in the dry season: palm and eucalyptus trees, green hills, a woman and a girl carrying jerrycans along the bank, looking thoughtfully at the water. Calm, dignified, not tragic.* |

### G. Chapter 5: The cup

| File | Spec | Prompt |
|---|---|---|
| `glass-empty.png` | **T**, 600×800 | *Watercolor of a simple blue enamel camping cup / tumbler, front view, empty, with a highlight.* |
| `glass-full.png` | **T**, **identical size and position** | *The exact same cup, filled to just below the rim with clear water (visible through a transparent upper part, or shown as a water surface at the top).* The site reveals this image from the bottom up as you hold the button, so the water level rises. |
| `sticker-flower.png` | **T**, 500×500 | *Watercolor sticker of a frangipani flower (white and yellow), white sticker border.* |

### H. Chapter 6: 100 machines

| File | Spec | Prompt |
|---|---|---|
| `grid-drop-1.png` … `grid-drop-5.png` | **T**, 240×320 each | *A tiny crocheted raindrop keychain with two black bead eyes, front view.* Make one each in sky, cornflower, powder, seafoam and pale periwinkle. The page shows unlit drops in grayscale and lit drops in colour. |
| `icon-water.png` | **T**, 400×400 | *Watercolor icon: a big friendly water drop with a gallon jug.* |
| `icon-coins.png` | **T**, 400×400 | *Watercolor icon: a small stack of gold coins with a sparkle.* (No $ sign needed.) |
| `icon-bottles.png` | **T**, 400×400 | *Watercolor icon: three plastic bottles with a soft pink "no" circle, cute not preachy.* |
| `water-machine.webp` | **S**, 1600×1000 | *Watercolor: in the shaded courtyard of a small whitewashed church in Timor-Leste, a sleek stainless-steel drinking-water purification station with two taps. A nurse in scrubs, a grandmother and three schoolchildren in uniform queue happily with cups and bottles. A bougainvillea and a mango tree. Warm afternoon light.* (Reference: the stall's banner illustration of the machine.) |

### I. Chapter 8: Schoolbag + ending

| File | Spec | Prompt |
|---|---|---|
| `schoolbag.png` | **T**, 780×900 (260:300) | *Watercolor of a navy-blue school backpack, front view, slightly worn and loved, with a few small pins. Leave the right shoulder-strap area clear: the site hangs Pip's keychain at x = 76%, y = 38% of the image.* |
| `sticker-yarn.png` | **T**, 500×500 | *Watercolor sticker of a ball of sky-blue yarn with a crochet hook, white sticker border.* |
| `ending-hands.webp` | **S**, 1600×900 | *Split-composition watercolor: on the left, a Hong Kong schoolgirl's hand (navy uniform sleeve) reaching for a schoolbag strap with a little crocheted blue raindrop keychain; on the right, in Timor-Leste, a child's hand holding out a blue cup under a tap. The two halves blend through a soft watercolor wash in the middle, and a thread of blue yarn connects the two hands.* |

---

## 4 · Real photos (`assets/photos/`)

These are the club's own booth photos. **Edit them lightly. Don't regenerate them**:
crop, straighten, warm the white balance slightly, lift shadows, and remove clutter
at the frame edges (other brands' leaflets, bags, tissue boxes). Keep the real
crochet stitches and real colours. Export as JPG, about 1600 px on the long side, quality 82.
They show as polaroids on the page.

| File | Source photo | Crop |
|---|---|---|
| `photos/cups.jpg` | the two kraft cups labelled *Filtered* and *Tap water* | 4:3, both cups centred |
| `photos/tds.jpg` | the two TDS-3 meters | 4:3 |
| `photos/banner-stats.jpg` | GX banner with 100台 / 40萬加侖 / 80萬美元 / 300萬 | 4:3; crop out the USANA leaflet on the right |
| `photos/banner-habitat.jpg` | GX "人居環境 Habitat" banner text | 4:3 |
| `photos/drops-crowd.jpg` | close-up of the box packed with blue drops | **wide 16:9 or taller**: this one is shown full-bleed and cinematic, edge to edge |
| `photos/stall-sign.jpg` | "DGS GX Club · Water Droplet Plushies $50" sign with the box | 4:3. Tidy it up: straighten, even out the glare on the plastic, keep the sign readable |
| `photos/crest.jpg` | the framed crocheted DGS crest with two drops hanging from the frame | 4:3. Optional extra: a version with the background removed (`photos/crest-cut.png`, **T**) |

---

## 5 · Reference photos GPT has

- Single blue drop close-up in front of a laptop (best Pip reference).
- Box of ~70 drops in tinsel, in 4 shades (sky, cornflower, powder, seafoam); a few are rounder, some pointy.
- The stall sign: "DGS GX Club / Water Droplet Plushies / $50", with the GX Club round logo.
- The framed crocheted DGS crest, navy and white, with two drops hanging from it.
- Two kraft cups, *Filtered* and *Tap water*.
- Two TDS-3 meters.
- GX Foundation banners (stats and Habitat text).
- `assets/stall.webp`, `assets/next-cup.webp` and `assets/after-rain.webp` (existing watercolors): match their softness.

## 6 · Facts used on the page (don't contradict them in art)

From GX Foundation's banner and website: the Direct Potable Water Project
launched in July 2024 in Timor-Leste, with all churches, all hospitals and some
schools as pilot sites. 100 nanotechnology water purification machines were donated to
hospitals, medical institutions, churches and schools. The projected yearly figures are
400,000 gallons of free direct-drinking water, about USD 800,000 saved on buying
drinking water, and about 3 million fewer plastic bottles. 70% of surface water in Timor-Leste
is polluted (GX website).
