# Onboarding QA pass (2026-09-24)

Web build driven with Playwright at 390×844 (iPhone 15) and 375×667 (iPhone SE),
plus a script over the estimate math. Native iOS was not run (Linux host).

## Covered

- Full walk, all 32 screens, both sizes: no runtime errors, every page fits without scrolling.
- Estimate math over every answer combination (5 × 5 × 4 nightly/morning/frequency buckets,
  8 ages): rolled number matches the sentence, a grid always fits, morning hours never
  exceed the total, `isInsideBedtime` around midnight and for night shifts.
- Under-13 gate (Back hidden, Exit only), "I work nights" presets, AM/PM warning.

## Fixed

| Bug | Fix |
| --- | --- |
| Pressing Back within 280 ms of picking an answer still advanced to the next question. | The advance timer lives in a ref; Back cancels it. |
| Back from the reveal landed on "Counting…", which auto-advanced straight back to the reveal. | Back steps over `AUTO_ADVANCE` screens (`math`). |
| Editing apps from "Tonight's lock is ready", deselecting all, then Back left 0 apps picked and let you continue. Back also kept half-made bedtime/wake edits. | `edit()` snapshots the answers; Back from an edit restores them. |
| Double-tapping a footer button hit the next page's button while it was still invisible, skipping a screen. | `FooterEnter` ignores touches until its fade-in starts (450 ms). |
| Terms/Privacy inside "See other plans" opened the preview prompt behind the sheet, so its Continue was unreachable. | The sheet shows its own notes inside its Modal (`PromptCard`). |

## Left as is

- `declined` is only reachable via `?step=declined`; the paywall has no decline path (hard paywall).
- On SE-width web the "11:30 pm" preset truncates; native uses `adjustsFontSizeToFit`.
- Scrolling the hour wheel from 11 to 12 doesn't flip AM/PM; the wake screen's "Check AM and PM" warning covers the resulting schedule.
- The paywall's "Today" row says "tonight … tomorrow" even for night-shift schedules.
