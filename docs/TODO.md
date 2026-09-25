# Trundle: everything left to do

Compiled September 24, 2026 from [GAME_PLAN.md](../GAME_PLAN.md),
[ONBOARDING_CONVERSION.md](ONBOARDING_CONVERSION.md),
[MORNING_ANGLE.md](MORNING_ANGLE.md), [DESIRE_VALIDATION.md](DESIRE_VALIDATION.md)
and the onboarding rating (7.5/10). GAME_PLAN stays the source of truth. Anything
marked *idea* isn't adopted until it's copied into GAME_PLAN.

Tick items off here as they're done.

## 1. Decisions only you can make

- [ ] **Moving the goalposts:** should schedule changes made after bedtime only take
  effect the next night? That's how Erly handles it. It conflicts with GAME_PLAN's
  rule that "the user controls the schedule at all times."
  ([MORNING_ANGLE.md](MORNING_ANGLE.md) #6)
- [ ] **Stay-up rule:** do we build the two-part wake-up for v1 (100 steps, then 100
  more after about 10 minutes), or wait for concierge data?
- [ ] **Lead hook:** "My phone won't work until I get out of bed" or "I have to walk
  200 steps before TikTok works"? Settle it with concept videos.
- [ ] **Passes:** how many a month, and how long each one lasts.
- [ ] **Accessible alternative:** a non-walking way to wake him (not designed yet).
- [ ] **Step target:** is 200 right? It's a default to test, not a validated number.

## 2. Step 0: accounts and IDs (blocking everything native)

- [ ] Finish Apple Developer Program enrollment. The team ID error is still open.
- [ ] Register the App ID, the three extension IDs and the App Group.
- [ ] Request Family Controls (Distribution) for each ID. Follow
  [ENTITLEMENT_SETUP.md](ENTITLEMENT_SETUP.md). Approval can take weeks, so do
  this first.
- [ ] Set `ios.bundleIdentifier` in `app.json`.
- [ ] Set up EAS Build for native extensions (dev is on Linux, with no Mac).
- [ ] Before launch: a USPTO class 9 trademark check on "Trundle", and a check that
  the social handles are free.

## 3. Step 1: device spike (about 2 weeks, before any more UI)

On a real iPhone, prove:
- [ ] Blocks apply at bedtime and hold for 3+ nights with the app closed.
  DeviceActivity schedules are chained in intervals under about 45 minutes.
- [ ] The morning count (CMPedometer, not HealthKit) unlocks at 200 steps, from the
  shield tap or from opening the app.
- [ ] Revoked Screen Time access is detected and shown plainly.
- [ ] A nightly self-check confirms the shields actually applied.
- [ ] Light anti-shake checks.

If any of these fail, stop and redesign.

## 4. Onboarding (the preview in `src/features/onboarding/`)

Fixes that are still open from the rating:
- [ ] **Open the quiz with a morning question,** e.g. "When your alarm goes off,
  what do you grab first?" Present bedtime as the reason the morning works.
- [ ] **A live 20-step walk before the paywall,** with the Motion permission request
  framed around it, and showing that shaking the phone doesn't count. It replaces
  or follows the animated `tomorrow` demo.
- [ ] **End onboarding on tomorrow morning:** "Tomorrow 7:00, TikTok stays asleep
  until you're up."
- [ ] **Make the reveal hit harder.** The 394-square grid is dense. Consider a
  separate morning number ("N minutes before your feet touch the floor").
- [ ] **Morning-first paywall timeline:** Tonight / Tomorrow 7:00 first walk /
  Day 5 reminder / Day 7 charge. Morning-first headline.
- [ ] *Idea:* a "what do you need before you're up?" step (authenticator, Slack,
  Maps, baby monitor), plus the line "Calls and texts still work. Your feeds don't."
- [ ] *Idea:* one if-then line in his voice: "When the alarm goes, you get up. Then
  we talk about TikTok."
- [ ] Less text-only: replace the text-only `deal` screen with a real screen
  recording of the lock and unlock once one exists.
- [ ] The "What have you tried?" answer only feeds the next screen. Use it again
  or accept that.

Needs the real app:
- [ ] StoreKit prices and intro-offer eligibility (all trial strings depend on it).
- [ ] Real Restore, and live Terms and Privacy URLs.
- [ ] Real FamilyControls, CMPedometer and notification prompts.
- [ ] Apple's `FamilyActivityPicker` in place of the preview chips.
- [ ] Show "Armed" only once tonight's schedule is confirmed. If it can't be set,
  say so.
- [ ] Real day-5 trial reminders, plus an in-app fallback when notifications are off.
- [ ] Teen child accounts, which need a parent to authorize Screen Time.
- [ ] The declined path: save the setup, arm nothing, and make at most one
  follow-up offer.
- [ ] A VoiceOver pass on a real device.

## 5. Step 2: v1 app

- [ ] Home states for night, morning and day.
- [ ] Morning walk screen: live count with his lines.
- [ ] **A first-morning script for him,** plus a notification at the morning start
  time on day 1.
- [ ] Custom shield text (small icon plus his line as the title).
- [ ] Always-blocked list (wins over the bedtime list).
- [ ] Passes, the emergency unlock, and the accessible alternative.
- [ ] Reliability checks and honest status ("Until then I'm just a raccoon").
- [ ] Morning share card ("Bed 11:41. Up 7:02. 213 steps. Still disappointed.").
- [ ] Settings: schedule, both app lists, step target.
- [ ] A rating prompt after the first successful 200-step unlock (never in
  onboarding).
- [ ] Analytics: D1, D7 and D30 walk completion, **the share of trial starters who
  complete a first walk** (the key activation metric), missed-block nights, and
  back-to-bed rate.

## 6. v1.1 (only after real users)

- [ ] A real alarm (AlarmKit) to lead with the morning.
- [ ] Streak widget and a bedtime Live Activity.
- [ ] Buddy/couples mode (a message to a partner, no money).
- [ ] Naps, and "put him to bed early".
- [ ] An opt-in "went to bed earlier" dataset.
- [ ] Viral ideas to test: his voice as real audio, roasts when the anti-shake check
  catches cheating, "excuse court" for passes, and a falling-asleep goodnight.

## 7. Marketing (runs alongside the build, starting now)

- [ ] A waitlist page.
- [ ] 20–30 concept videos across angles, morning-first. Watch for "what app is
  this?" comments and sign-ups.
- [ ] Safe stats for hooks: 85% check their phone within 10 minutes of waking, and
  60% of under-30s do so always or often. Use the "47 seconds" and "68% override"
  stats only in hooks, attributed, never in the store listing.
- [ ] App Store copy says "your apps", not "your phone", and makes no health claims.
- [ ] At launch: daily founder videos on 2–3 accounts, plus paid niche creators at
  $2–3 CPM. Measure payers per 1K views.

## 8. Launch gates (TestFlight, 100–300 users)

- [ ] D30: at least 20% still have blocking active.
- [ ] Fewer than 1 in 50 nights with a missed block.
- [ ] About 30% or more of trials become paid subscriptions.
- [ ] Then the A/B tests, in order: trial vs none, price ($34.99 / $39.99 / $44.99),
  the loader, notifications before vs after the paywall, personalized headline.

## 9. Doc housekeeping

- [ ] GAME_PLAN says "Early"; the app is **Erly**.
- [ ] [SETUP.md](../SETUP.md) says "there is no app code yet", which is out of date.
