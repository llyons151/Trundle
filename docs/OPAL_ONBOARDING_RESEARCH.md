# Longer onboarding for Trundle: Opal research and implementation

> **Archived context:** this describes the rock-mascot prototype removed on September 24, 2026. File paths refer to the git tag `rock-prototype`. The findings still inform the rebuild.

Researched September 21, 2026. This document supersedes the **five-page recommendation** in ONBOARDING_RESEARCH.md. The earlier accessibility, permission, storage, and native-service limitations still apply.

## Decision

Ship a 14-page, full-screen onboarding preview as a candidate for future conversion testing. It builds relevance before configuration: personal goal → scrolling moment → tailored explanation → bedtime and morning → app boundaries → evening ritual → personal plan → review. Four named chapters make progress legible. Every page has Back (after the first), Explore first, and a fixed primary action. There are no scrolling onboarding containers.

This is not a proven optimum or a claim of matching Opal's conversion. The earlier research over-weighted tutorial usability and setup completion relative to subscription purchase intent. A person buying a behavior-change product may need to understand and value the proposed routine before wanting to configure it. We should test that proposition rather than assume minimal screen count wins.

## What we could verify about Opal

1. **First-party setup description.** [Opal's help center](https://opalapp.com/help/what-is-opal) says onboarding asks about screen habits and requests access to Apple's Screen Time API. It describes distinct user motivations including focus, presence, and sleep. This supports relevance and permissions as parts of the experience; it does not disclose conversion performance.
2. **Recent public capture.** [Lazyweb's August 2026 capture](https://www.lazyweb.com/flow/opal/onboarding) lists 21 screens, with only five publicly visible. I downloaded and visually inspected its third screen: a name question beneath a gem illustration with one primary action. The public capture confirms a conversational, one-question presentation. I did **not** view the other 16 gated screens. Twenty-one is that capture's count, not a universal count across Opal versions, platforms, and experiments.
3. **Independent walkthrough.** [Jacob Rushfinn's June 18, 2026 walkthrough](https://www.retention.blog/p/chat-based-onboarding) describes a conversational redesign: an interactive opening, questions about identity, goals and usage, permissions, app selection, a personalized benefit summary, and a multi-stage trial offer. Selected goals also appear after the offer. The author criticizes unclear customization after blocking starts. This is an observed journey and the author's interpretation, not Opal's randomized experiment results. Trundle adopts the question-to-personal-summary pattern and keeps configuration explicit. We do not copy the author's price examples into our product or assume they remain current.
4. **First-party opportunity framing.** [Opal's screen-time calculator](https://screentimecalculator.opal.so/) asks for age and daily screen time, then frames use over a lifetime. It is a marketing web experience, not proof of the native onboarding's current sequence. Trundle uses a concrete daily ritual instead of extrapolating years lost or making unverifiable time-saving promises.
5. **Returning users need a different route.** [Opal's App Store release notes](https://apps.apple.com/ag/app/opal-screen-time-control/id1497465230) describe shorter re-onboarding, skipping known answers and prioritizing returning-user sign-in. This supports preserving progress and letting existing Trundle users retain their routine; it does not establish the ideal first-run length.

No public source reviewed supplies an Opal randomized comparison isolating onboarding length, cohort sizes, confidence intervals, refund-adjusted revenue, or retention. Revenue estimates from screenshot directories were not treated as verified business performance. “Opal is successful” and “this flow causes success” are different claims.

## Evidence for testing a longer flow

[RevenueCat's interview-based article](https://www.revenuecat.com/blog/growth/why-your-onboarding-experience-might-be-too-short) reports that Lose It! tested longer onboarding and saw double-digit increases in trial starts before diminishing returns. The article also describes RISE's emphasis on explaining product value and recommends evaluating realized lifetime value, not only starts. The published summary does not provide enough experimental detail to derive an expected uplift for Trundle.

[RevenueCat's later practitioner account](https://www.revenuecat.com/blog/growth/fix-onboarding-funnels) relays QUITTR's observation that people spending longer in onboarding convert more often. That association can reflect both investment in the process and pre-existing intent; it does not establish that adding arbitrary waiting or pages increases purchases.

Our working explanations are personal relevance, understanding, ownership of a chosen routine, and commitment to a concrete next action. Those are hypotheses about mechanisms, not a measured psychological diagnosis of our users. The implementation has no artificial processing delay, required pledge, fabricated testimonial, fake baseline statistics, or claim that 200 steps is clinically validated.

## The implemented sequence

| # | Screen | What it does / why it appears here |
|---|---|---|
| 1 | Welcome | Introduces Trundle and the benefit; discloses preview status before investing time. |
| 2 | Personal goal | Asks what the user wants more room for. Answer labels the personal plan. |
| 3 | Scrolling moment | Asks when scrolling pulls them in: bedtime, morning, or both. |
| 4 | Tailored response | Immediately reflects that answer with a relevant boundary or morning ritual explanation. |
| 5 | Bedtime explanation | Shows the sleeping character and explains which apps pause, before asking for a time. |
| 6 | Bedtime choice | One time decision. Persists the actual bedtime preference on completion. |
| 7 | Morning start | Separate time decision; explicitly distinguishes counting start from alarm or unlock. |
| 8 | Morning demo | Lets the user simulate 0 → 84 → 200 steps. Demo steps never become real progress. |
| 9 | Bedtime apps | Paginated example selections for the scheduled list. No device inventory is implied. |
| 10 | Always-blocked apps | Optional independent list with its precedence explained. Empty is a valid choice. |
| 11 | Access explanation | Explains Screen Time and motion needs. Explicitly says this preview requests neither. |
| 12 | Evening ritual | Asks what to do instead: read, stretch, or have a quiet moment. |
| 13 | Personal plan | Combines goal, ritual, actual times and app count. Goal and ritual remain editable. |
| 14 | Review | Edits either time or either list, then saves and opens the preview. |

Personal questions are optional: Continue becomes Choose later when unanswered. “I'm not sure yet” clears a selection. Skipping uses neutral copy, never an invented answer. We do not ask for age, occupation, a lifetime usage estimate, or acquisition attribution because those inputs do not currently improve this routine.

The evening ritual survives completion and appears on Home. Answers persist separately from blocking preferences, so personal copy cannot alter restriction behavior. Existing version-1 drafts and completed records remain readable without resetting choices. New question pages do not force completed users through setup again.

## Conversion measurement and next experiment

This repository has no subscription product, billing backend, production analytics provider, or assigned experiment cohorts. This change therefore implements a **candidate flow**, not a live monetization experiment. There is no trial or price invented at the end. GAME_PLAN.md explicitly leaves monetization undecided.

Before a purchase-conversion experiment:

- Decide the real offer, price, trial policy, cancellation terms and free access. Make the offer equally available in each variant.
- Randomly assign new users once to a concise baseline or this 14-step variant, retain that assignment, and exclude developer replay sessions. Keep acquisition mix and the offer comparable.
- Record onboarding entry, screen viewed, Continue/Back/Explore, setup committed, paywall shown, trial started, first paid transaction, refund and cancellation. Join purchase events server-side; do not infer payment from a client click. Record stable screen ID, variant and timestamps rather than personal-answer text.
- Primary denominator: **all assigned onboarding entrants**, including those who leave early. Track paid conversion in a fixed window and net realized revenue per entrant. Paywall-to-purchase conversion alone is insufficient.
- Track each step's exits and elapsed active time, distinguishing background time, revisit time and storage errors. Do not optimize toward time spent for its own sake.
- Guardrails: trial-to-paid, refunds, cancellations, and day-7/day-30 retention with a predeclared definition. Once native blocking exists, measure first verified bedtime block and morning unlock separately from preview completion.
- Choose sample size and duration from actual baseline traffic, conversion and a minimum detectable effect. Report uncertainty and avoid repeated early significance checks. Wait for equal conversion/refund observation windows across cohorts.

Keep the 14-screen sequence constant initially; test content or sequencing only after establishing a baseline. Subsequent hypotheses: stronger goal-specific response, demonstration placement, and deferring optional always-blocked setup. Preserve an exit and accurate progress in each treatment.

## Engineering and verification

The implementation uses the existing theme and React Native components, preserves native time-picker panels, and adds no dependencies. [Expo SDK 57 documentation](https://docs.expo.dev/versions/v57.0.0/) was read before code changes.

Automated verification and device limits are recorded below after the rendered checks. Native blocking and motion integration remain pending; browser checks do not validate native VoiceOver, Dynamic Type, hardware navigation, or background enforcement.

Verification completed:

- TypeScript check passes; 20 onboarding storage/recovery tests and 18 existing schedule assertions pass.
- Browser traversal of all 14 pages at 320×568, 375×667, 390×760, 390×844 and 768×1024 checks content overflow, scrolling containers and footer position. All pass. The small app-list layouts were tightened in response to actual overflow measurements.
- Browser checks cover both alternate habit responses, unanswered questions, time editing/equal-time rejection, walking explanation panels, editing from plan/review, reload/resume, failed answer writes and completion-marker retry, and preservation of routine preferences during replay.
- Saved evening ritual is editable from Home, reopening directly at the ritual question. Personal-plan previews and Home reflect the new answer.
- Representative screenshots: `output/playwright/long-*-320.png` and `long-*-390.png`. Browser scripts: `check-onboarding-long.cjs`, `check-onboarding-long-recovery.cjs`, `check-onboarding-ritual-edit.cjs` in the same directory. Console had no runtime errors; existing React Native Web deprecation warnings remain.
- No iOS/Android device test was available. Native Dynamic Type/VoiceOver and safe-area behavior still need physical-device validation. These viewport results are not a claim that every accessibility scale or landscape configuration has been validated.
