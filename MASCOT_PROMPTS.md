# Trundle — mascot direction and image prompts

Product source of truth: [GAME_PLAN.md](GAME_PLAN.md).

## Established character

A chunky faceted grey rock with thick dark outlines, cel-shaded planes, two black
oval eyes, a small smile, moss and a leaf sprout. Preserve the existing reference
at `assets/mascot/trundle-reference.png` and the implemented stone limbs. Trundle
can rest with limbs tucked away, stand, and walk; he is not restricted to rolling.

Moss is part of his identity, not a meter that withers when the user scrolls.
Do not generate neglect, damage, death, or punishment states.

## Priority state sheet

Attach the existing reference and use:

```
Keep the attached character's rock silhouette, facets, moss, sprout, face, dark
outline and cel shading. Use the existing stubby stone arms and legs when standing
or walking; tuck them away when resting. Do not redesign the character.

Create five equally sized poses on a plain dark charcoal background:
1) asleep, resting comfortably, eyes gently closed;
2) stirring, sleepy half-open eyes;
3) stretching awake, short stone arms raised;
4) walking, one small stone foot forward, cheerful expression;
5) awake and standing, relaxed smile.

Keep body proportions and plant details consistent across all poses. No phone,
extra cracks, dried moss, cobwebs, text, labels, or background scenery.
```

These states support bedtime blocking and the morning 200-step wake-up. They do
not represent earning timed unlock windows or a pet suffering from screen time.

## Single assets

```
Keep exactly the same character as the attached reference and approved state sheet.
Give me only [chosen pose], a single character centered, large in frame, transparent
background, no ground shadow, no text. Preserve the existing design and proportions.
```

## Animation notes

The current app uses a raster body with separately animated facial features and
stone limbs. Preserve that working approach unless a deliberate change is needed.
Concept sheets are references, not a promise to replace the character with video or
redraw everything as vectors. Prioritize coherent sleep, wake, and idle transitions.
