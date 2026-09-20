# Trundle — mascot image prompts

For ChatGPT image generation.

**Chosen direction:** a chunky faceted grey rock, thick dark outline, cel-shaded flat
planes, simple face (two black oval eyes, small smile), no limbs — he rolls. Moss and
plants growing on him = progress (levels). Scrolling = he stares at a tiny phone, moss
dries brown, cracks and cobwebs appear. He never dies.

**Rejected:** round 1 (grey kawaii domes with blush and a stripe that read as a
bandage); round 2 (terracotta, heavy eyelids, backpack — came out as grumpy potatoes).

The chosen design lives at `assets/mascot/trundle-reference.png`. Attach it to every
prompt below and run them in the same chat.

## 1. Character sheet

```
Keep exactly the same character as the attached image — same rock shape, facets,
cracks, moss, face, outline thickness and shading style. Do not redesign him.

Make a character reference sheet on a plain dark charcoal background. Top row, all the
same size: front view, three-quarter view, side view, back view. Bottom row, front view
only, six expressions using just the eyes and mouth: happy (default smile), very happy
(eyes closed as curved lines, bigger smile), unimpressed (flat straight mouth, eyes
unchanged), surprised (small round open mouth, slightly bigger eyes), sad (small
downturned mouth), sleepy (eyes half closed). 2D game-asset style, thick dark outline,
cel shading. No text, no labels.
```

## 2. Growth levels

```
Keep exactly the same character as the attached image — same rock shape, facets, face,
outline thickness and shading style. Do not redesign him.

Show him six times in one row on a plain dark charcoal background as a growth
progression, left to right: 1) bare stone with no moss at all, 2) one small moss patch,
3) several moss patches, 4) moss covering the top with tiny pebbles at his base,
5) mostly covered in lush moss with one small flower, 6) fully lush with a leaf sprout
on top and a tiny mushroom. Same size, same pose and same smile in every stage — only
the plant growth changes. Evenly spaced. No text, no labels, no level numbers.
```

## 3. States

```
Keep exactly the same character as the attached image — same rock shape, facets, face,
outline thickness and shading style. Do not redesign him.

Show him five times in one row on a plain dark charcoal background, evenly spaced:
1) rolling — tilted forward mid-roll with small curved motion lines behind him, happy;
2) caught you — stopped, facing the viewer dead-on with a flat straight unimpressed
mouth; 3) on his phone — staring down at a tiny glowing smartphone propped on the
ground in front of him, eyes half closed and glazed, mouth slightly open, blue glow on
his face; 4) neglected — his moss dried brown and patchy, extra cracks, a small cobweb
on one side, duller grey, tired eyes, small frown; 5) asleep — eyes as curved lines,
small sleep bubble. No text, no labels.
```

## Then: single clean assets

Once the sheets look right, get each pose on its own for use in videos and the app:

```
Keep exactly the same character as the attached images. Give me only [pose 3 from the
states sheet], single character centred, large in frame, transparent background, no
ground shadow, no text.
```

## Tips
- If he drifts (different shape, new face, extra limbs), don't describe him again —
  re-attach the reference and repeat "keep exactly the same character, do not redesign
  him".
- If one panel in a sheet is wrong, ask for just that panel again rather than the
  whole sheet.
- If "transparent background" comes back with a backdrop, reply "same image,
  transparent background".
- These are concept art and placeholders. For animation he'll be redrawn as separate
  vector parts (body, eyes, mouth, moss layers, cracks) so each can move or swap.
