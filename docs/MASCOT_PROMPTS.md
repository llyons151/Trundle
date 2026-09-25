# Midjourney prompts for the raccoon mascot

Written September 24, 2026. Based on [MASCOT_DIRECTION.md](MASCOT_DIRECTION.md).
Run the rounds in order: pick a style first, then a shape, then build a character
sheet from the winner.

## Rules for every prompt

- Don't put "Trundle" in a prompt. Midjourney knows the League of Legends troll
  and will pull toward it.
- Always ask for a plain background and a full body, so you judge the character
  and not the scene.
- Never ask for glow, neon or rim light. The `--no` list below blocks them.
- Check each result against existing raccoons: Rigby (Regular Show), Rocket
  Raccoon, Meeko (Pocahontas) and Tom Nook (a tanuki, but people will compare).
  If it looks like one of them, throw it out.
- Parameters: `--style raw` stops Midjourney from adding its own polish.
  A low `--s` (stylize) keeps shapes simple, and `--chaos` gives you more
  variety across the four images in a grid.

The `--no` list used below:

```
--no glow, neon, rim light, bloom, text, watermark, background scenery
```

## Round 1: style (same raccoon, different art styles)

Each prompt is the character block followed by one style line.

**Character block:**

```
mascot character design of a chubby round raccoon, permanently tired and sassy, dark fur markings around the eyes that look like tired dark circles, droopy half-lidded unimpressed eyes, a soft sleeping eye cover pushed up on his forehead, thick striped tail, small pointy ears, simple bold silhouette, full body, standing, plain off-white background
```

| # | Style | Line to add after the character block |
|---|---|---|
| A | Flat app mascot (Duolingo-like) | `flat vector app mascot, thick rounded shapes, no outlines, limited palette, minimal shading, clean and iconic --style raw --s 50` |
| B | 3D soft toy | `3D rendered character, soft matte clay-like materials, subtle fur texture, studio lighting with neutral soft shadows, Pixar-style appeal --s 150` |
| C | Sticker line art | `die-cut sticker illustration, bold black outlines, flat colors, slight offset print feel, expressive cartoon --style raw --s 75` |
| D | 90s TV cartoon | `2D cartoon in the style of 1990s TV animation, rubber-hose limbs, flat cel colors, exaggerated grumpy expression --style raw --s 100` |
| E | Plush toy photo | `photo of a real plush toy, minky fabric, embroidered eyes, stitched seams, product photography on white --s 100` |
| F | Japanese mascot / yuru-chara | `Japanese mascot character, very simple shapes, oversized head, tiny limbs, deadpan face, pastel flat colors --style raw --s 50` |
| G | Risograph editorial | `risograph print illustration, two-color grain texture, hand-drawn, slightly wonky shapes --style raw --s 100` |

Add `--ar 1:1 --chaos 20` to each, then the `--no` list.

**Full example (style A):**

```
mascot character design of a chubby round raccoon, permanently tired and sassy, dark fur markings around the eyes that look like tired dark circles, droopy half-lidded unimpressed eyes, a soft sleeping eye cover pushed up on his forehead, thick striped tail, small pointy ears, simple bold silhouette, full body, standing, plain off-white background, flat vector app mascot, thick rounded shapes, no outlines, limited palette, minimal shading, clean and iconic --style raw --s 50 --ar 1:1 --chaos 20 --no glow, neon, rim light, bloom, text, watermark, background scenery
```

Pick one or two styles. Save the best image's URL; it becomes your style
reference (`--sref`) for every later round.

## Round 2: shape and direction (in the chosen style)

Swap the start of the character block for one of these, keep the style line, and
add `--sref <URL of your round 1 pick>`.

| # | Direction | Replace "a chubby round raccoon" with |
|---|---|---|
| 1 | Bean | `a bean-shaped raccoon, almost no neck, tiny feet, body and head one shape` |
| 2 | Big head | `a raccoon with an oversized head and small body, like a chibi` |
| 3 | Lanky | `a tall lanky raccoon, slouching, long arms hanging, bad posture` |
| 4 | Burrito | `a raccoon wrapped in his own tail like a blanket, only face and ears showing` |
| 5 | Loaf | `a raccoon sitting in a loaf pose, low and wide, arms hidden` |

Color tests (add to any direction):

- `grey fur with a soft lilac tint, pale peach sleep mask`
- `warm brown-grey fur, navy sleep mask with a small moon`
- `classic grey and black raccoon, cream sleep mask`

## Round 3: expressions (the app's key moments)

Once you have a winner, keep him consistent with an omni/character reference
(`--oref <URL>` in V7; `--cref <URL>` in V6) plus your `--sref`. Keep the
reference weight high (for example `--ow 200` or `--cw 100`).

| Moment | Prompt (after the reference raccoon) |
|---|---|
| Asleep | `the same raccoon fast asleep, sleep mask pulled down over his eyes, curled up in his tail, tiny snore bubble` |
| Opening a blocked app ("Shh.") | `the same raccoon half asleep in bed, one paw raised to shush, sleep mask down over one eye, annoyed` |
| 0 steps ("No.") | `the same raccoon buried under a blanket, one arm sticking out doing a stop gesture` |
| 160 steps ("Fine. Fine.") | `the same raccoon sitting up in bed, extremely reluctant, hair messy, glaring at the viewer` |
| 200 steps (betrayal) | `the same raccoon pushing his sleep mask up, squinting at bright sunlight with a look of pure betrayal` |
| Daytime | `the same raccoon standing, sleep mask on forehead, holding a coffee mug, awake technically` |

## Round 4: sheets for handoff

**Character turnaround:**

```
character turnaround sheet of the same raccoon, front view, three-quarter view, side view, back view, same pose in each, evenly spaced, plain white background --ar 16:9 --style raw
```

**Expression sheet:**

```
expression sheet of the same raccoon, six head-only expressions in a grid: asleep, groggy, annoyed, betrayed, smug, reluctantly proud, plain white background --ar 3:2 --style raw
```

**App icon test:**

```
app icon of the same raccoon's face only, sleep mask on forehead, centered, bold simple shapes, flat solid background, readable at small size --ar 1:1 --style raw --s 50
```

Add the `--oref`/`--cref`, `--sref` and `--no` list to each.

## Tips

- If he looks too cute, add `unimpressed, deadpan, heavy eyelids, slight frown`.
  If he looks mean, add `endearing, soft, round`.
- If Midjourney adds scenery, move `plain off-white background` to the start of
  the prompt.
- Use Vary (Subtle) to refine a good image; use Vary (Strong) or a higher
  `--chaos` for new ideas.
- Midjourney art is a direction, not the final asset. The final mascot will
  probably need to be redrawn as clean vectors for animation (Rive or Lottie).

## Moderation

Midjourney's AI moderator flagged the first version of the base prompt. The likely
triggers were "black eye" (reads as an injury), "weapon" in the `--no` list, and
"mask". These were rephrased. If a prompt is still flagged, write "sleeping eye cover"
or "night eye cover" instead of "sleep mask", and drop any word that could suggest
violence or injury, even inside `--no`.

## Avoiding the "AI generated" look

Things that make an image look AI generated: glossy plastic shading, overly detailed
fur, cinematic lighting, smooth gradients everywhere, perfect symmetry, too many small
details, and Midjourney's default polish. The fix is to name a specific way a person
would make the image, keep the palette small, ask for small flaws, and keep stylize
very low.

**Designer vector (for the app):**

```
character design of a chubby round raccoon mascot, tired and sassy, dark fur markings around the eyes like tired dark circles, droopy half-lidded unimpressed eyes, soft sleeping eye cover pushed up on his forehead, thick striped tail, full body, drawn by a graphic designer in Illustrator, flat shapes with no gradients, three colors plus black, slightly asymmetrical, simple geometric construction, a few deliberate details only, plain off-white background --style raw --s 0 --ar 1:1 --no gradient, glossy, shiny, 3D render, realistic fur, cinematic lighting, glow, bloom, depth of field, hyperdetailed, text
```

**Hand-drawn (for a warmer feel):**

```
character sketch of a chubby round raccoon mascot, tired and sassy, dark fur markings around the eyes like tired dark circles, droopy unimpressed eyes, soft sleeping eye cover pushed up on his forehead, thick striped tail, full body, drawn with a brush pen and flat gouache fill on paper, visible brush strokes, uneven line weight, slightly off-register color, paper texture, limited palette of four colors, plain paper background --style raw --s 0 --ar 1:1 --no gradient, glossy, 3D render, realistic fur, cinematic lighting, glow, hyperdetailed, digital painting, text
```

Also: `--s 0` removes most of Midjourney's polish, so go up to 25 or 50 only if the
images look lifeless. Try a Vary (Subtle) pass on the best image. For the final
mascot, have a person redraw the pick as vectors. That is the only reliable way to
lose the AI look, and the app will need vectors for animation anyway.

## Plush photo set (placeholder art for onboarding)

Added September 24, 2026. A faked "photo of a real plush" in one bed nook, used
until illustrator art exists. Make one hero image, then reuse it with `--oref`
for every other state.

**Hero (night, mask down):**

```
35mm film photo of a handmade plush raccoon toy tucked into a small unmade bed, soft grey faux fur with black eye-mask markings, round chubby body, small pointy ears, thick striped tail curled over him like a blanket, a dusty rose fabric sleep mask pulled down over his eyes, rumpled linen sheets, dim warm bedside lamp light from the left, deep shadows, shallow depth of field, slight film grain, muted colors, quiet and cozy --ar 3:4 --style raw --s 75 --no glow, neon, rim light, bloom, bokeh lights, text, watermark, cartoon, 3D render
```

**Other states:** add `--oref <hero URL> --ow 400`, keep the bed, sheets and
camera angle, and change only the pose, mask and light.

| State | Swap in |
|---|---|
| Dawn | `sleep mask pushed halfway up, one tired eye open, cool blue window light before sunrise` |
| Day | `sleep mask pushed up on his forehead, sitting up, unimpressed half-lidded stare, bright flat daylight from a window` |
| Betrayed (200 steps) | `sleep mask just lifted, eyes wide in betrayal, harsh morning sun across his face` |
| Paywall | `fast asleep on his side, mask down, tail hugged like a pillow, dim warm lamp light` |

Keep the mask color word identical in every prompt. Fix drift with Vary Region
instead of rerolling.
