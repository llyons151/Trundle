# App picker: how iOS blockers let you choose apps

September 25, 2026. Research behind the redesigned "Which apps keep you up?" screen
(`src/features/onboarding/app-picker.tsx`). The old screen was a 2×4 grid of text-only
buttons with app names. It looked unlike iOS, and it could never become the real
thing, because a Screen Time app never learns which apps are installed.

**Coverage caveat:** Mobbin and Appllama screenshots were behind a login, so we could not
see the pre-picker screens for Opal, Brick, Jomo, Clearspace, Freedom, Roots, Unpluq or
Bloom directly. Claims marked [unverified] are inferred.

## The pattern everyone uses

Every blocker we could check opens **Apple's FamilyActivityPicker as a sheet** from a
"Select apps" button or card. None of them build their own list of named apps.

- **ScreenZen:** after the Screen Time and notification permissions, a "Select Apps"
  button opens Apple's picker, which lists categories with disclosure arrows.
  [Diary of the Mind](https://diaryofthemind.com/screenzen-review-everything-you-need-to-know/)
- **Opal:** a quiz, then a schedule, then "Choose Activities", which is Apple's picker.
  [ScreensDesign](https://screensdesign.com/showcase/opal-screen-time-control),
  [retention.blog](https://www.retention.blog/p/chat-based-onboarding)
- **StepTok** (closest competitor): choose apps, then a step goal, then "locked until you walk".
  [App Store](https://apps.apple.com/us/app/steptok-walk-to-unlock-apps/id6756244374)
- **one sec:** has a help article on the stock picker crashing during search.
  [one sec help](https://tutorials.one-sec.app/en/articles/3036354)
- **After picking:** a row of icons drawn with `Label(token).labelStyle(.iconOnly)`, plus
  a count [unverified per app; the API supports it].

## What Apple's picker allows

- `headerText`, `footerText` and `selection`. It can be embedded inline or presented as a
  sheet with Cancel and Done. [Apple docs](https://developer.apple.com/documentation/familycontrols/familyactivitypicker)
- **The look can't be customised.** [Apple forum](https://developer.apple.com/forums/thread/724154)
- Picks come back as opaque tokens, with no names or bundle IDs. They can only be drawn with
  `Label(token)`. A picked category doesn't say how many apps it holds. The picker can't
  be pre-selected with "the usual suspects".
  [Lagerland](https://lagerland-apps.github.io/journal/what-an-iphone-app-can-actually-block/)
- It runs outside our process and can crash, so put a fallback view behind it.

No public A/B data on pre-selecting apps, real icons, or "most people pick" hints was found.

## What we built

1. **Card on the page:** empty, it reads as a button: a white "+" tile, "Add apps",
   "TikTok, Instagram, games…" and a chevron. (A first version with empty dashed icon
   slots looked like an empty grid, not something to tap.) Once apps are picked it
   becomes an iOS grouped list: a "3 APPS" header, one row per pick (icon and name, with
   "Category" on category rows), and an "Add or remove apps" row with a "+" tile and
   chevron. The real app draws the same rows with `Label(token)`, whose default style shows
   the icon and name. Past 6 rows (4 on short phones), the rest fold into "+N more". An
   earlier version showed overlapping icons with a count, which looked cramped.
2. **Stand-in sheet**, in iOS system colours rather than Nocturne, so the real picker
   swaps in without a visible change. It has Cancel / Choose Activities / Done, header text,
   search field, and a grouped list: "All Apps & Categories", then Social and Entertainment
   (with disclosure arrows opening to apps) and Games (a whole category). Check circles show
   a minus when only some of a category is picked. Changes apply on Done; Cancel discards them.
   The footer text says it's a preview.
3. **Examples, not a pre-selection:** the empty card names examples instead of pre-picking
   them. When nothing is picked, the primary button says "Add apps" and opens the picker.

Keep `HEADER` and `FOOTER` in `app-picker.tsx` identical to the real picker's
`headerText` and `footerText`.

## Avoid

- A custom grid of named apps as the real way of choosing.
- Implying we know what's installed, or counts that assume a category's size.
- Custom colours in the stand-in sheet.
- Leaning on search in the real build (it's where the picker crashes before iOS 26).
- Glows on selected icons. Use the plain check circle.
