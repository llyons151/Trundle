# Day picker references

September 25, 2026. For the onboarding step "Which nights does that happen?"
(`src/features/onboarding/day-picker.tsx`). The user said the screen looks bad.

## What's wrong with the current screen

- The serif "0 nights" floats alone in the middle of a big empty space. It is
  the only serif text in the flow, so it looks like a font failed to load.
- All seven circles look the same whether they are picked or not: dark fill,
  thin outline, white letter. Nothing on screen looks tappable or selected.
- "Every night, honestly" is an underlined web link. iOS doesn't use those.
- The controls aren't grouped. The row, the count and the link are all floating
  loose over the moon.

## References

1. **Apple Health, Sleep > Edit Your Schedule > Days Active** (saved at
   [design-references/apple-health-days-active.png](design-references/apple-health-days-active.png)).
   The seven days sit inside one rounded card. A picked day is a solid filled
   circle. An unpicked day is just the letter, with no circle or outline. It's
   the same question (which nights?), in Apple's own sleep app.
   Source: https://support.apple.com/en-us/108906
2. **Clock > Alarm > Repeat.** Seven full-width rows ("Every Monday" …) with a
   checkmark on the right. It's native but tall. It would match the list-style
   `Options` used on the questions just before this one.
3. **Screen Time > Downtime.** A segmented control (Every Day / Customize Days)
   with the per-day controls shown only under Customize. It puts "every night"
   first instead of in a link.
4. **Health and Battery weekly bar charts** (M T W T F S S under columns). Seven
   tall capsules the user taps to fill. It looks like data, which suits "I do
   math on your nights", but no Apple app uses it as an input.

## Recommendation

Copy reference 1: the Health "Days Active" card. It's the proven pattern for this
exact question, and it fixes all four problems. Move the count into the card
header ("5 nights"), in the flow's normal sans font. Replace the link with an
"Every night" chip or a segmented control, as in reference 3.
