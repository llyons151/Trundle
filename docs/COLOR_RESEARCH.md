# Color scheme research

September 24, 2026. This covers three questions: what fits Trundle, what comparable
high-quality apps use, and what the evidence says about color and conversion. It
informs design. GAME_PLAN.md stays the source of truth for product. Every palette
here works flat, because of the project's no-glow rule.

## Recommendation

**"Den":** a warm charcoal night, a berry-pink satin sleep mask as the brand color
Trundle owns, and an apricot-to-gold sunrise for the morning walk and the day state.

| Role | Token | HEX | Notes |
|---|---|---|---|
| Night background | `bg` | `#15110F` | Warm near-black. Not `#000`, which smears on OLED, and not navy |
| Surface | `surface` | `#1F1A17` | Cards and rows |
| Elevated surface | `surfaceElevated` | `#2A2420` | Sheets. Also a flat "spotlight" disc behind Trundle |
| Primary text | `text` | `#F2E8DC` | Warm off-white. Pure white on black causes halation |
| Secondary text | `textSecondary` | `#B3A698` | |
| **Brand / mask / CTA** | `brand` | `#FF6B8B` | Berry-pink satin mask. The same hue for the icon, primary button, shield and share cards |
| Text on brand | `onBrand` | `#1A0A0F` | Dark ink. White text on pink fails contrast |
| Dawn (progress start) | `dawn` | `#FFA66B` | Apricot. The step ring starts here |
| Sun (progress end, unlocked) | `sun` | `#FFD27A` | Gold at 200 steps; marks "awake/unlocked" |
| Progress track | `track` | `#3A322B` | |
| Fur: mid / dark / cream | art only | `#8C8C94` / `#2B2A2E` / `#EDE3D3` | |
| Light surface (paywall/settings test) | `paper` | `#F6EFE6` | Text `#2A211C`, secondary `#6B5E54` |

**State colors by screen:**
- **Night:** mostly dark, with the pink mask as the only saturated element and little lit area.
- **Morning:** the step ring fills from apricot to gold, and the background can warm slightly as steps accumulate.
- **Day:** gold accent, with the mask pushed up on his forehead.

"Blocked" gets no red at all. It uses neutral text with a lock glyph, which avoids a
punishment feel and any red/green color-blindness problem.

### Measured contrast (WCAG 2.x)

| Pair | Ratio | Passes |
|---|---|---|
| text on bg / on elevated | 15.5 / 12.7 | AAA |
| textSecondary on bg / on elevated | 7.9 / 6.4 | AA (AAA on bg) |
| brand on bg / on elevated | 6.9 / 5.6 | AA text, UI 3:1 |
| onBrand on brand (CTA label) | 7.1 | AAA |
| dawn on bg / on track | 9.8 / 6.5 | UI 3:1 |
| sun on bg; dark ink on sun | 13.2 / 13.0 | AAA |
| fur grey on bg; cream on bg | 5.6 / 14.8 | Mascot reads |
| paper text / secondary | 13.8 / 5.5 | AA+ |

**Measured pitfalls for the art brief:**
- **Dark fur on bg is 1.3:1.** Trundle's charcoal patches disappear on a night
  background. Keep him readable with his cream face and chest, a mid-grey body, and
  the flat elevated disc behind him (a solid shape, not a halo).
- **Pink mask vs grey fur is 1.2:1.** The hues differ but their lightness is the
  same, so the mask vanishes in grayscale and for some color-blind viewers. Give the
  mask a dark strap or outline; dark fur against the mask measures 5.3:1.

### Why pink over amber

Two palettes were real contenders. The fit research favored a marigold/amber mask
("Ember"); the competitor audit found pink more ownable.

- **For pink:**
  - No sleep, blocker or mascot app uses a warm berry-pink as its *night* brand color.
  - Orange/amber is already the primary color for Headspace, Sleep Cycle's icon and
    WeWard, and it sits near Unpluq's yellow.
  - Appbot found pink underused on the App Store top charts. A Pinterest study of
    1M images found red, pink and purple images re-shared more (observational).
  - A pink satin sleep mask is funny on a tired diva raccoon, which suits his
    personality. It also keeps amber free for the sunrise, so the brand color and
    the state color never compete.
- **For amber:**
  - It is the most bedtime-friendly vivid hue and the strict complement of grey fur.
  - It scores slightly higher on contrast.
- **Why that doesn't decide it:** the sleep argument is weak. Brightness and lit area
  affect melatonin far more than hue, and Night Shift showed no sleep benefit
  (section 3).

**Fallback: "Ember".** Swap only the brand token: mask/CTA `#FFB547` with ink
`#1A1206` (10.6:1), dawn coral `#FF8A5B`, sun `#FFD166`. The rest of the system is
unchanged. Choosing between the two is worth a quick mockup of the raccoon on
`#15110F` in both masks before committing. Both options avoid the current template
teal (`#17B3A0` in `src/constants/theme.ts`), which is in overused territory.

### Rules that come with it

1. **One saturated CTA per screen.** Only the primary button is a large block of
   `brand`. Trundle's mask is small enough to share the hue, as Duolingo's owl
   shares green with its buttons.
2. **Never encode state by hue alone.** Every state has a glyph, a text label
   ("Apps blocked" / "Apps unlocked") and a mascot pose.
3. **Night stays dim.** Avoid large lit areas, bright full-bleed cards, and blue or
   cyan in the night state. Don't claim in marketing that the colors improve sleep.
4. **No icy blues, cyan, frost or crystal motifs.** League of Legends' Trundle is a
   Freljord ice troll, and a warm palette keeps Trundle clearly separate from him.
5. **Icon:** a big raccoon face with the pink mask on a flat, simple background,
   with no gradient. Test two background colors with App Store Product Page
   Optimization once there is traffic.
6. **Shield screen = poster.** Use the brand background or the deep background, a
   big Trundle and one sassy line. A cropped screenshot should read as Trundle
   instantly in a TikTok feed.
7. **Paywall:** keep text very readable at low brightness. A/B test dark vs the
   `paper` light surface later. Offers and trial length move conversion far more
   than color does.

---

## 1. What comparable apps use

Hex values are from official brand kits where available. Otherwise they were
sampled from current App Store icons and screenshots, so they are approximate
(marketing art can differ from the in-app UI).

| App | Background | Brand / accent | Day/night behavior |
|---|---|---|---|
| Opal | Pure black `#000000` (official) | None. Pastel gradients only on milestone gems | Always black |
| one sec | Slate navy `#1C1E28` | Hot pink-red `#FF0045` | Always dark |
| Brick | Light grey → charcoal `#2B2B2B` | Monochrome | **Switches by state**: dark when bricked |
| ScreenZen | Navy `#10133C` | Periwinkle `#6671FF` | None |
| Jomo / BePresent | Light | Electric blue `#2E7FFA` / cobalt `#013BFF` | None |
| Freedom / Forest | Sage / mint | Forest green / `#4AAE91` | None |
| QUITTR / Unpluq | Black | Purple `#BD5CFC` / yellow `#FFE606` | None |
| Rise | Aubergine `#2A204A` | Violet `#7D00FE`, rainbow sunrise icon | Always dark purple |
| Sleep Cycle | Teal-navy `#173539` | Orange icon `#FF7E00` | 2025 rebrand states a "night-to-day concept" in its gradients |
| Calm | Sky-blue gradient; navy `#101C3D` for sleep | `#6282E3` | Darker for sleep content |
| Headspace | Warm white / yellow | Orange `#FF7300` | Switches to deep indigo for Sleep |
| BetterSleep / Hatch / Eight Sleep | Navy `#031433` / `#0A1A34` / `#0A1629` | Blues, periwinkle | Always night |
| Oura | Pure black | Steel blue `#276E8E` | Colors parts of the app by biometrics |
| Loftie | Oxblood `#482B27` | Deep red; butter-yellow icon | **The only warm-dark app** |
| Pokémon Sleep | Light, cream, grass green | Sky blue, green | Night/morning/afternoon game logic; the UI stays bright |
| Duolingo | White | Feather Green `#58CC02` (official) | System dark mode only |
| Finch | Sky blue `#9FD9FF` | Royal blue, pink, yellow | No dark menus (users complain) |
| Habitica | Light | Purple `#6133B4` | None |
| Pikmin Bloom | Bright map | Leaf green `#57D75E` | **Deliberately always sunny** |
| Pengu / Bears / Focus Friend | Cream / pastels / peach | Candy pink, salmon, terracotta | None |
| STEPN / WeWard / Sweatcoin | Mint / orange / plum | Neon green / orange `#FF762F` / violet | None |
| Apple Fitness | Black | Rings red-pink / green / cyan | Follows the system setting |

**Crowded territory, where Trundle would blend in:**
- Navy-to-purple night gradients with a moon and stars. This is the most crowded
  look of all: Calm, BetterSleep, Hatch, Rise, Headspace Sleep and one sec use it.
- Violet as the brand color.
- Electric or iOS blue.
- Mint, teal and cyan.
- Premium pure black with a hairline accent (Opal, Oura, Brick). It would bury a
  cartoon mascot's warmth.
- Rainbow sunrise gradients (Rise, Sleep Cycle).
- Orange as the primary brand color (Headspace, Sleep Cycle, WeWard).

**Territory nobody owns:**
- **Warm brown-black darks.** Every sleep app's night is cool; only Loftie is warm,
  and it is a luxury hardware brand. A warm dark reads as "cozy den" and frames grey
  fur better than navy does.
- **A palette taken from the mascot's own markings,** the way Duolingo did with green.
- **A berry or rose pink as the night accent.** Pink only appears as a secondary
  color in bright pastel apps. Keep it warmer or dustier than one sec's `#FF0045`
  and Apple's Move ring.
- **A flat apricot/gold dawn** instead of a rainbow gradient.
- **A whole home screen and mascot that move through night, morning and day with the
  user's real schedule.** No major app does this. Pokémon Sleep comes closest but
  keeps its UI bright; Brick switches only between light and dark.

The tail rings could also become the step progress motif, instead of Apple-style rings.

## 2. What converts (evidence-weighted)

- **The contrast of the button matters, not its hue.** HubSpot's "red beat green by
  21%" test (about 2,000 visits) ran on a page that was otherwise green. The effect
  was isolation (the Von Restorff effect), which is well established in memory
  research. Google's "41 shades of blue" was real but under 1% of revenue at
  billions of impressions. Superwall says button color tests don't move small apps.
  Test offers (10–40% lift), headlines and social proof first.
- **App Store icon.** SplitMetrics data (200 apps, 3,500+ tests): icon changes lifted
  conversion up to about 25%, and simple, clear backgrounds did about 26% better.
  Appbot's 2022 top-chart study found blue and red common and pink underused. Sleep
  icons cluster in navy and purple. Faces capture attention automatically (strong lab
  evidence); the store-specific evidence for mascot icons is mixed. Apple's Product
  Page Optimization can test icons natively.
- **Paywall.** There is no published benchmark for dark vs light. RevenueCat reports
  one team (Golf GameBook) whose switch to light "boosted trials" because the dark
  paywall was hard to read at low brightness. Pricing and trial structure dominate:
  in RevenueCat's 2025 data, 17–32-day trials convert about 42.5% vs about 25.5% for
  trials under 4 days, and the Health & Fitness median trial-to-paid is 39.9%.
- **Dark vs light mode.** Dark text on light is more legible for small text
  (Piepenbrock 2013), and light mode also did better for glanceable reading at night
  (Dobres 2017). "82% use dark mode" comes from a self-selected enthusiast poll.
- **Owning a color works as a pattern, though no study isolates it.** Duolingo's
  green belongs to its mascot. Headspace picked orange against a field of calm blues
  and kept it through its rebrand.
- **Short-form video.** Salience research supports a saturated subject on a darker or
  muted background, which suits TikTok's dark interface. The "+23% CTR for red
  thumbnails" statistics have no stated method.
- **Accessibility.**
  - WCAG AA: 4.5:1 for text, 3:1 for UI components.
  - Apple prefers 7:1 for small custom-colored text.
  - About 8% of men have red/green color blindness, so red "locked" vs green
    "unlocked" fails for about 1 in 12 men.

**Myths not to design by:**
- "Color increases brand recognition 80%." It traces to a Xerox leaflet
  misquoting a study on documents.
- "62–90% of snap judgments are color." This comes from a literature review, not an
  experiment.
- Mehta & Zhu's "red = detail, blue = creativity" failed replication with n=263.
- The "red romance" effect mostly failed in preregistered replications.
- Blue = trust / orange = energy tables are folklore.

Sources: [HubSpot](https://blog.hubspot.com/blog/tabid/6307/bid/20566/the-button-color-a-b-test-red-beats-green.aspx),
[CXL](https://cxl.com/blog/which-color-converts-the-best/),
[Superwall A/B testing](https://superwall.com/blog/how-to-ab-test-a-paywall),
[SplitMetrics icon research](https://www.internationalaccountingbulletin.com/news/splitmetrics-research-finds-app-icon-optimisation-lands-up-to-25-more-users/),
[Appbot 2022](https://appbot.co/blog/colors-of-an-app-icon-2022/),
[RevenueCat paywalls](https://www.revenuecat.com/blog/growth/ugly-paywalls-conversion-testing),
[RevenueCat State of Subscription Apps 2025](https://www.revenuecat.com/state-of-subscription-apps-2025),
[NN/g dark mode](https://www.nngroup.com/articles/dark-mode/),
[Labrecque & Milne 2012](https://link.springer.com/article/10.1007/s11747-010-0245-y),
[Bakhshi & Gilbert 2015](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0117148),
[Steele 2014 replication](https://link.springer.com/article/10.3758/s13423-013-0548-3),
[80% myth](https://www.insights4print.ceo/2019/02/color-increases-brand-recognition-by-80-the-real-contents-of-the-loyola-study-revealed/),
[Duolingo brand](https://www.canny-creative.com/brand-breakdown/brand/duolingo/),
[Headspace rebrand](https://www.itsnicethat.com/articles/italic-studio-headspace-graphic-design-project-250424),
[ShieldConfiguration](https://developer.apple.com/documentation/managedsettingsui/shieldconfiguration).

## 3. What fits: sleep science, dawn, the raccoon

- **Night screens.**
  - Melanopsin peaks around 480 nm.
  - Reading on a lit screen before bed suppressed melatonin by about 55%
    ([Chang 2015](https://www.pnas.org/doi/10.1073/pnas.1418490112)), and lower
    melanopic screen light helped sleep in a dose-dependent way
    ([Schöllhorn 2023](https://www.nature.com/articles/s42003-023-04598-4)).
  - Hue changes alone are weak: iPhone Night Shift gave no sleep benefit, and not
    using the phone did best
    ([BYU 2021](https://www.macrumors.com/2021/05/05/night-shift-mode-phones-do-not-help-sleep/)).
  - Practically: keep lit area and brightness low, use warm long-wavelength accents,
    use off-white text on near-black warm grey, and get depth from lighter surfaces
    ([Apple HIG, Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode)).
- **Dawn.**
  - Dawn light runs from indigo through pink to orange and gold.
  - Dawn simulation (gradually rising light before waking) improved alertness and
    mood after waking ([PubMed 24509892](https://pubmed.ncbi.nlm.nih.gov/24509892/)).
  - Brighter light is fine in the morning, so the UI can brighten as steps accumulate.
- **The raccoon.**
  - Real raccoons have grizzled grey fur, a black mask with cream borders, and 5–7
    dark tail rings.
  - Successful cartoon raccoons and tanuki (Rocket Raccoon, Tom Nook, Rigby) pair a
    neutral grey or brown body with **one saturated prop color**. Trundle's sleep
    mask is that prop.
- **Avoid LoL Trundle.** Riot's Trundle is an ice troll with frost blue, cyan and a
  pale blue-grey skin ([LoL Wiki](https://wiki.leagueoflegends.com/en-us/Trundle)).
  A warm-dominant palette keeps Trundle clearly apart.

Other palettes considered:
- **"Dusk":** a plum background `#16111C` with an apricot mask `#FF9E7A`. Rejected
  because plum and violet night is the category's most crowded territory.
- **"Pajama":** an ink background `#0F1218` with a tomato mask `#FF5F4A`. Rejected
  because the cool base drifts toward LoL's blues and toward the crowded navy sleep
  apps. The red also reads as alarm or punishment, and it measured 1.05:1 against
  grey fur.

## 4. Ten candidate palettes

Added September 24, 2026. Every palette is dark-first, glow-free and avoids icy blue.
All text pairs pass WCAG AA, and nearly all pass AAA. A live preview on the night,
morning, day and blocked-app screens was published as a private artifact, "Trundle
Palette Lab". Every mask needs the dark strap outline.

| # | Name | Night bg | Mask / brand (label ink) | Dawn → sun | Brand on bg | Main caution |
|---|---|---|---|---|---|---|
| 1 | Den (research pick) | `#15110F` | `#FF6B8B` (`#1A0A0F`) | `#FFA66B` → `#FFD27A` | 6.9 | Mask matches fur lightness |
| 2 | Ember | `#14110F` | `#FFB547` (`#1A1206`) | `#FF8A5B` → `#FFD166` | 10.7 | Near Headspace / Sleep Cycle orange |
| 3 | Lavender Pillow | `#151315` | `#B8A4FF` (`#15102A`) | `#FFB08A` → `#FFD98A` | 8.6 | Next to crowded violet |
| 4 | Forest Night | `#0F1512` | `#FFAA8C` (`#2A120A`) | `#FFC48A` → `#F2E27A` | 10.0 | Can read as generic nature |
| 5 | Plum Pudding | `#1A1216` | `#FFE08A` (`#241A08`) | `#FF9A7A` → mint `#9FE0B0` | 14.3 | Yellow reads sunny, not sleepy |
| 6 | Alley Cat | `#131416` | `#FF7A45` (`#1F0C04`) | `#FFB15C` → `#FFE066` | 7.1 | Close to WeWard orange; cooler base |
| 7 | Dusk | `#16111C` | `#FF9E7A` (`#2A1210`) | `#FFC98B` → `#F5C451` | 9.2 | Plum night is the most crowded territory |
| 8 | Bubblegum Diva | `#170F14` | `#FF5FB5` (`#22061A`) | `#FF9E6B` → `#FFD66B` | 6.8 | Least calm; more blue light |
| 9 | Linen Mornings | `#181411`, day `#F6EFE6` | `#FF6B8B`, day `#C8345A` (white) | `#FFA66B` → `#FFD27A` | 6.8 | Two looks to maintain |
| 10 | Pistachio | `#131412` | `#C8E27A` (`#161C06`) | `#FFB07A` → `#FFD978` | 12.9 | Green hints at "unlocked" |

## 5. Direction change: "Nocturne" (the color lives in the art)

September 24, 2026. The user rejected the ten palettes in section 4 as "vibe coded".
They all followed one formula: a dark background with a single accent, swapped hue by
hue. The user then shared three references:
- a dark art-events app with oil-painting cards, a bold italic slab-serif display face
  and a white "Buy ticket" pill
- a dark travel app with full-bleed photography and frosted chips
- Opal's frosted-glass routine cards and thin score arc

What the references share, and what Trundle now adopts:

- **A monochrome interface with no brand accent hue.**
  - Background `#0B0B0C`, surface `#161617`, raised `#202022`.
  - Text white, secondary `#A1A1A6` (7.6:1), tertiary `#7C7C82` (4.7:1), track `#2A2A2D`.
  - Frosted chips: white at 12% plus a background blur.
- **The primary action is a white pill with dark text.** It wins by contrast, which
  matches the conversion evidence in section 2.
- **Color comes from full-bleed scene art, one scene per state.** The stand-in
  palettes were measured from public-domain paintings:
  - Night: ink `#1C3043`, cobalt `#2F7CC0`, lamp gold `#E3C04F`
  - Morning: fog `#53645A`, slate `#827666`, sun red `#CE5146`
  - Day: sky `#DDD9CB`, straw `#A19375`, poppy `#A64A23`
  - Trundle: umber `#2B201A`, bark `#66533E`, cream `#E5DFD4`
- **Type:** a heavy italic serif (Bitter in the mockup) for Trundle's voice, and a
  clean sans for UI.
- **Consequence:** the mascot and scene art is now the brand, and it needs to be
  painterly and textured, not flat vector. That is the next brief. Keep night art
  lit by warm lamps so it never reads as LoL Trundle's ice.

Mockup: private artifact "Trundle Nocturne" (it replaced the Palette Lab page at the same URL).

**Correction on the blocked-app screen:** iOS `ShieldConfiguration` only supports a
background color or blur, a small icon, a title, a subtitle and buttons. The
full-bleed painted shield in the mockup can't be built natively. Use it for share
cards; the real shield uses a painted head icon, a dark background and his line
as the title. See docs/MASCOT_DIRECTION.md, "Surfaces".
