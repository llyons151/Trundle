# Trundle: interface audit and refinement

> **Archived context:** this describes the rock-mascot prototype removed on September 24, 2026. File paths refer to the git tag `rock-prototype`. The findings still inform the rebuild.

September 21, 2026. Scope: Home, Apps, Routine, Profile, shared controls, sheets,
navigation, character motion, preference storage, app configuration, and bundled
assets. Includes source review of the nap work arriving from a separate session;
those changes were preserved at the user's request.

## Assessment

Trundle's strongest visual asset is the rock companion. The moss, stone, and frost
palette is coherent, and the native sheets and SF Symbols already provide a useful
foundation. Professional polish here comes from readable type, calm hierarchy,
truthful status, predictable navigation, and reliable editing—not more decoration.

This pass improves the existing light prototype. GAME_PLAN.md still calls for a dark
spacious dashboard: reconciling that with the newer light palette is outstanding.
The appearance configuration now matches the rendered light interface instead of
forcing dark native surfaces around light content. This is not adaptive dark mode.

## Installed tools

- `apple-hig` skill: `~/.codex/skills/apple-hig` (Elevatormusic/apple-hig).
  Installed the portable skill and its references; Claude-specific commands/hooks
  were not installed into Codex. The skill is available on the next turn and its
  instructions were read directly for this audit.
- `hig-doctor` Codex plugin, version 2.0.3, from the `raintree` marketplace.
- `hig-doctor` 2.0.3 development dependency; run `npm run audit:hig`.
- `npm run typecheck` added for repeatable TypeScript validation.

HIG Doctor reported zero concerns initially. The final pass reports one moderate
`web/auto-focus` finding: intentional focus in the name editor after the user opens
its modal sheet. This is not page-load focus stealing; retain it and verify native
VoiceOver focus order on device. No serious or critical findings are reported. Its limited React Native
coverage and low-density warning mean this is **not** proof of HIG conformance.
Manual review found important issues despite the clean automated result.
The CLI declares Node 24; this machine ran it successfully on Node 26.9.

## Changes applied

| Area | Finding | Applied refinement |
| --- | --- | --- |
| Home hierarchy | Sample time-reclaimed totals, charts, and streak-like summaries competed with the routine. | Removed the sample-statistics dashboard. Made routine, separate app lists, and explicit preview status the content hierarchy. The other session subsequently added stateful nap copy and controls, which remain intact. |
| Navigation correctness | Profile → app lists passed a press event as the list identifier and could crash. | Explicit no-argument event boundary and scheduled-list navigation. Verified the flow. |
| Navigation continuity | Changing tabs destroyed search, scroll context, and unsaved name drafts. | Keep screen instances mounted and hide inactive screens from accessibility. Home gets an active flag to suspend character animation. |
| Typography | Body text was 15pt, section labels 10pt, and explanatory text 12–13pt. | Shared body 17pt, captions 15pt, notices 13pt, section labels 12pt; adjusted line heights and reduced tracking. The follow-up design pass uses the system font and retains the custom wordmark. |
| Contrast | White text on moss was 3.81:1; small moss text on frost was 3.44:1. | Darker action fill `#526F1B`: white labels 5.76:1. Green supporting text on frost now 5.21:1. Original moss remains in artwork/decorative accents. |
| Selection controls | Unselected checkbox boundaries were very faint. | Added a shared stronger control-border token and darker selected fill. State remains exposed to assistive technology. |
| Button meaning | Every button included a right arrow, even Save and Got it. | Removed the universal arrow. Navigation rows retain disclosure chevrons. |
| Home profile entry | A decorative sun did not clearly communicate profile navigation. | Replaced it with a recognizable profile symbol and retained the explicit accessible name. |
| Time editing | A 48-option wheel restricted editing to half-hour increments and always formatted US time. | Native Expo time picker with minute precision; locale-aware formatted times; working hour/minute dropdown fallback for web, where the Expo datetime picker renders nothing. |
| Compact layout | Side-by-side schedule times were fragile at narrow widths and large text sizes. | Stack times below 360px or with increased native font scale. App-list segments can wrap. |
| Sheets | Dismiss semantics were generic. | Explicit “Cancel editing” label, save guidance, modal accessibility hint, and keyboard-aware scrolling. |
| Navigation styling | Heavy floating-bar shadow competed with content. | Softer shadow, larger labels, large-content-viewer metadata, and an opaque Reduce Transparency fallback. |
| Character motion | Idle and gait work continued unnecessarily. | Live Reduce Motion/AppState handling, stable poses, no hop with reduced motion, gait only while walking, and suspension on inactive tabs. Sleeping behavior added by the other session is preserved. |

## Follow-up: make it feel native, not like a stack of boxes

After the user's feedback, the second pass changed the structure, not just colors:

- Removed repeated white rounded containers and colored icon tiles. Related rows
  now share the page background and fine separators.
- Adopted system UI typography (SF via the system on iOS); kept the custom logo
  and character. Removed the unused font-loading gate from app startup.
- Simplified screen headers to Apps, Routine, and You; removed repeated uppercase
  slogans and used normal section headings.
- Replaced the handmade app-list tabs with Expo's native segmented control.
- Home now has a compact bedtime/morning strip, a single nap action, and a small,
  explicitly labeled preview disclosure rather than another card.
- Name editing moved into a dedicated sheet. The profile no longer shows a form
  and disabled save button at all times.
- Routine's long explanation moved behind a “How your routine works” row.
- Preserved the other session's naps, schedule validation, and sleeping character.

Final screenshots: `output/playwright/native-{home,apps,routine,profile}-{390,320}.png`.
Name-sheet save, native segment switching, both new detail disclosures, and compact
layouts were rechecked after this pass. The native iOS bundle export passed again.

## Highest-value work still needed

| Priority | Recommendation | Why / completion evidence |
| --- | --- | --- |
| High | Deliver the actual bedtime → morning steps → awake state machine and native services. | A professional interface must reflect actual protection. The current preview does not block apps or count steps. Verify overnight scheduling while closed, morning backfill, restart persistence, bedtime precedence, and always-blocked precedence on a real iPhone. |
| High | Define and implement an accessible non-walking alternative and intentional emergency bypass. | GAME_PLAN.md leaves these interactions open. Do not add an improvised bypass that clears the always-blocked list. |
| High | Implement a complete dark appearance through the existing theme. | Reconcile the plan's dark direction with the current light palette; support native appearance consistently across text, controls, keyboard, sheets, artwork contrast, and glass. Avoid introducing a second token system. |
| High | Test VoiceOver and largest Dynamic Type sizes on device. | Browser rendering cannot verify iOS focus restoration, native picker announcements, accessibility-size clipping, or Large Content Viewer. Check all four tabs and every sheet with keyboard shown. |
| Medium | Move navigation onto native router tabs/stacks when establishing the app architecture. | Current tabs are a styled custom bar. Native navigation can supply title behavior, restoration, back gestures, and platform conventions. Preserved tab state fixes the immediate data-loss problem but is not a full navigation migration. |
| Medium | Tighten first-run setup. | Guide users through bedtime, morning, and both app lists, then contextual permissions once implemented. Show an honest ready/not-ready status before claiming protection. |
| Medium | Clarify save-in-flight sheet dismissal. | Current native sheet API allows gestures to dismiss while a save continues. Test and choose either protected dismissal or persistent completion/error feedback outside the sheet. Native crash/error recovery still needs device testing. |
| Medium | Finish web fallback accessibility. | Expo's universal dropdowns do not expose an accessible-label prop; the hour and minute fallback needs distinctly named controls if web becomes a supported product, rather than a preview surface. |
| Medium | Validate iPad, landscape policy, RTL, 24-hour locales, and long names. | iPad is enabled, the layout is capped at 480pt, and orientation is locked to portrait. Decide supported experiences deliberately. Browser width checks are not iPad multitasking validation. |
| Medium | Review binary assets and bundle imports. | The final iOS export no longer loads Nunito assets but still includes unused icon families through a barrel import. Import only the icon family used. Confirm app icons, splash presentation, and app catalog imagery before distribution. |
| Low | Retire unused prototype code when the concurrent feature work settles. | PlaceholderScreen, legacy profile store, older scene assets, and IOSSwitch are not current primary flows. Do not count unreachable prototype controls as active screen failures. |

Nap behavior was reviewed in source, but this pass does not claim end-to-end coverage
of the other session's new nap creation, overlap validation, sleep animations, or
timed transitions. The other session owns those changes. Its additions need to be
reflected in the product plan so future work does not contradict them.

## Verification

Passed:

- TypeScript `npm run typecheck`.
- HIG Doctor scan; evidence in `output/hig-audit/before.json` and `after.json`.
- iOS JavaScript/Hermes export with `npx expo export --platform ios` (not an Xcode
  build or native runtime test).
- Browser inspection at 390×844 and 320×568.
- Profile → app-list navigation; unsaved name survives tab changes.
- Save name, app selections, both list segments, always-blocked priority copy,
  filtered search, empty search, clear search, retained query across tabs.
- Equal bedtime/morning validation, saving 10:17 PM, persistence after reload,
  and restoring the original bedtime.
- Simulated storage write failure: visible error, draft retained, successful retry.
- Browser reduced-motion preference exercised; native preference transitions remain
  a device-test item.

The verification browser's temporary name/app/time edits were restored. Its
console has no runtime errors after fixes; a React Native Web pointerEvents
migration warning and the segmented-control web animation fallback warning remain. Screenshots are in `output/playwright/hig-*.png`.

Unverified: native VoiceOver, AX5, Reduce Transparency on iOS, hardware keyboard,
real device performance, Family Controls/Screen Time permissions, step counting,
background enforcement, App Store submission requirements. HIG is design guidance,
not App Store approval certification.

## References

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Apple accessibility guidance](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Expo SDK 57 reference](https://docs.expo.dev/versions/v57.0.0/)
- [Expo UI SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/ui/)
- [Apple HIG skill](https://github.com/Elevatormusic/apple-hig)
- [HIG Doctor](https://github.com/raintree-technology/hig-doctor)

Installed SDK 57.0.19 source was checked for actual datetime-picker and sheet APIs;
the skill's datetimepicker import spelling did not match this installed release.
