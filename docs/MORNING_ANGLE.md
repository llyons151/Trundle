# Trundle: using the morning angle to the fullest

Researched September 24, 2026. This builds on [DESIRE_VALIDATION.md](DESIRE_VALIDATION.md),
[VALIDATION_RESEARCH.md](VALIDATION_RESEARCH.md) and
[ONBOARDING_CONVERSION.md](ONBOARDING_CONVERSION.md), and tries not to repeat them.
[GAME_PLAN.md](../GAME_PLAN.md) is still the source of truth. Nothing here is
adopted until it's copied into GAME_PLAN.

**The question:** how should "your apps stay locked until you're physically out of
bed" drive positioning, onboarding, the paywall, marketing, retention and
features?

**Evidence tags:** [S] controlled study or large dataset. [M] vendor or operator
data with numbers. [W] teardown, anecdote, or a vendor stat with no published
method. [J] our judgement.

**Name correction:** the app GAME_PLAN calls "Early" is **Erly** ("Erly: Wake Up
Early", by Jake Glacer). It sells a free trial, then $29.99 a year or $9.99 a month.

## Recommendations, ranked by expected impact

1. **Make the first morning the "wow" moment, and design everything toward it.**
   Alarmy's product team found that the moment that matters is the first alarm
   going off the next morning. Before they fixed onboarding, 40% of new users left
   before that alarm ever rang. Making alarm setup mandatory, with no skip button,
   raised D1 retention by 15–20%, and D7 and D14 improved too [M]. For Trundle, the
   first morning walk happens inside the 7-day trial. So:
   - Onboarding should end on tomorrow morning, not on tonight: "Tomorrow at 7:00,
     TikTok stays asleep until you're up."
   - Write a special first-morning script for him, and send a notification at the
     morning start time on day 1.
   - Keep the rating prompt after the first successful unlock (already planned).
   - Track the share of trial starters who complete a first morning walk as the
     key activation metric. It's likely to predict trial conversion better than
     anything else [J].
2. **Add a 20-step demo inside onboarding, before the paywall.** The user stands
   up and walks while the live count ticks and he wakes up a little, with the
   request for Motion permission framed around it. Nothing in the category that
   converts leaves the mechanic abstract:
   - Alarmy has you set your first alarm within 15 seconds [W].
   - Wayk puts mission choice inside onboarding [W].
   - Erly's pitch is that you understand it within two seconds of seeing it [W].

   A demo also gives the IKEA effect already relied on in ONBOARDING_CONVERSION,
   and it's the natural place to show that walking in place or shaking the phone
   doesn't count. [J]
3. **Lead with the morning everywhere, and make the bedtime lock the reason the
   morning works.**
   - The hook, the App Store subtitle and the opening line should all be about
     getting out of bed.
   - Bedtime becomes "and it stops the 1am spiral that wrecks your 7am."
   - Opal's morning is one setting, off by default, that ends after an hour. No
     competitor with distribution owns "out of bed." [J, building on
     DESIRE_VALIDATION]
4. **Add a morning number to the reveal, and ask a morning question first.** The
   current number combines night and morning time. Split out a second line: "You
   spend about N minutes in bed on your phone before your feet touch the floor.
   That's X hours a year." Open the quiz with a morning question, such as "When
   your alarm goes off, what do you grab first?" Customers describe morning pain
   as being stuck, with consequences like being late or missing stand-ups. That's
   closer to "I need a fix" than night guilt is (DESIRE_VALIDATION). [J]
5. **Build a stay-up rule before launch, and treat it as a feature to sell, not a
   patch.** The back-to-bed hole is the main risk to the morning promise:
   - More than half of logged sleep sessions end in snoozing, for about 11 minutes
     on average [S].
   - Alarmy sells a premium "Wake Up Check" because people fall back asleep after
     completing a mission [M].

   Test the two-part wake-up from DESIRE_VALIDATION (100 steps, then 100 more
   after about 10 minutes). Market it as "he checks you're still up." [J]
6. **Stop the morning goalposts moving.** Erly locks your goal within 4 hours of
   your wake-up time, so "no moving the goalpost after you've overslept" [W].
   Trundle equivalent: schedule changes made after bedtime apply from the next
   night. Passes and the emergency unlock remain the exits. **This conflicts with
   GAME_PLAN's rule that "the user controls the schedule at all times,"** so the
   founder needs to decide. [J]
7. **Build the paywall and the trial timeline around mornings.** Headline from the
   Q7 answer: "Get your mornings back. Tomorrow 7:00 is your first one." Trial
   timeline:
   - Tonight: apps fall asleep.
   - Tomorrow 7:00: first walk.
   - Day 5: reminder.
   - Day 7: first charge.

   The price is in line with the category. Erly charges $29.99 a year, Alarmy
   $59.99, and Rise about $60, behind a hard paywall with a 7-day trial [W]. Keep
   $39.99. [J]
8. **Make "what you need before you're up" an explicit setup step.** Ask which
   apps must work in the morning: authenticator, Slack, Maps, messages, the
   baby monitor. Default the sleeping list to feeds and games. Say plainly:
   "Calls and texts still work. Your feeds don't." That handles the biggest
   objection from people who need their phone for work, and it keeps store copy
   accurate. [J]
9. **Morning-first video hooks, backed by stats we can safely cite** (see
   Marketing below). Stats: 85% check their phone within 10 minutes of waking [M];
   60% of under-30s do so always or often [M]; 42% of bed rotting happens in the
   morning [W]. Keep the "47 seconds" and "68% override their limits" stats for
   hooks only, and attribute them, because their method isn't published [W].
10. **Use the waking cue for habit framing and later features, not for health
    claims.** Morning-anchored habits formed faster in one small trial [S, small].
    If-then plans have a medium-to-large effect on follow-through [S]. Put one
    if-then line in onboarding, in his voice: "When the alarm goes, you get up.
    Then we talk about TikTok." Keep any health or mood claims out of the store
    and ads.

## Evidence

### 1. How people use their phone in the morning

| Finding | Source | Tag |
|---|---|---|
| 84.6% of US adults check their phone within 10 minutes of waking (80.6% in 2025). 49.6% sleep with their phone. About 1,000 US adults, Pollfish, Q4 2025 | Reviews.org 2026 | [M] |
| 44% of Americans, and 60% of under-30s, "always or often" use their phone to browse or use apps within 10 minutes of waking. n=1,148, July 15–17, 2025 | YouGov | [M] |
| Phones unlocked 47 seconds after waking on average. 52% check their phone while still lying in bed. 14 minutes of scrolling in the first hour (about 85 hours a year). 68% override their own screen-time limits within 2 minutes of waking. 74% want calmer, screen-free mornings. 1 in 5 scroll "with one eye closed." Attributed to Jolt (a screen-time app vendor) and CEOWORLD, March 2026, **with no sample or method published** | CEOWORLD; PhoneArena | [W] |
| Bed rotting: 49% of Gen Z and 41% of millennials do it often or sometimes. n=2,204 US adults, May 2025 | Morning Consult | [M] |
| 42% of bed rotting happens in the morning (6am–noon), compared with 22% in the evening. 53% feel guilty afterwards (61% of Gen Z). n=1,005; a mattress retailer's survey (the page gives March 2026) | Amerisleep | [W] |
| Snoozing: 55.6% of logged sleep sessions ended in snooze, an average of 2.4 presses and 10.8 minutes. 21,222 Sleep Cycle users, July–December 2022 | Scientific Reports 2025 | [S] |
| Decision-making can be at about 51% of normal in the first 3 minutes after waking, and still about 20% below optimum at 30 minutes. Sleep inertia usually lasts 15–30 minutes | Sleep Foundation summary of sleep-inertia research | [W], secondary |
| A 5-minute movement routine on waking (standing, arm rotations, 10 squats) reduced sleep inertia at 5 and 15 minutes compared with control (d≈0.7–0.8). The effect was clearest after short recovery sleep. n=42 RCT | Frontiers in Physiology 2026 | [S, small] |

**What this means.**
- The morning phone grab is close to universal. Among the young it is nearly the
  default.
- The first minutes are when judgement is at its worst. That's the strongest
  argument that the rule has to be set the night before (or in onboarding) and
  can't be negotiated from bed. It's also why "Ignore Limit" fails in the
  morning.
- Getting up and moving plausibly clears the grogginess faster. That's for our
  own reasoning only and **can't go in marketing** (VALIDATION_RESEARCH section
  12).

**Couldn't find:**
- A rigorous measure of how long people stay in bed on their phone after waking.
  The best numbers are the vendor's 14 minutes and Reddit anecdotes of about 40
  minutes.
- Any study showing that morning scrolling causes worse days.

### 2. How morning apps position and monetize

| App | What it leads with | Onboarding and paywall | Numbers | Tag |
|---|---|---|---|---|
| **Alarmy** | "Not just an alarm clock, your morning upgrade"; missions | 12 steps; first alarm set within about 15 seconds; soft paywall after alarm setup (monthly, yearly with 7-day trial, lifetime); $4.99/mo, $59.99/yr; ads plus subscriptions | 82M downloads; "2.2M+ users wake up every day"; $11.2M revenue in 2021; ScreensDesign estimates about $400K/mo | [M] company, [W] estimates |
| **Erly** | "Wake Up On Time. Every Time… the #1 accountability app for waking up early"; push-ups verified by camera; streaks ("each morning is a clear win or loss"); goal locks 4 hours before wake-up | Free trial, $29.99/yr or $9.99/mo; 4.8 from 16K ratings | About $50K/mo within 4 months; day-in-the-life creators at $2–3 CPM | [M] founder, [W] |
| **Wayk** | "Become a morning person" | About 11 questions (morning person? snooze habits, number of alarms, mood on waking, time to feel awake, time you get out of bed, ideal wake time), then mission choice and alarm setup, then a free-trial paywall with yearly and monthly plans | Estimated $75K/mo, 150K installs; launched February 2026 | [W] |
| **Rise** | Sleep debt and an energy schedule; "how long you'll be groggy" | A long quiz with scientific pop-ups, a "building your plan" screen, and an adjustable sleep need, then a **hard paywall** with a 7-day trial, about $60/yr | Claims "83% feel more energy in a week" | [W] |
| **Fabulous** | Guides you to commit to a morning routine (water, breakfast, exercise) in onboarding, with a signed "contract" | Long quiz, then paywall | Says onboarding customized for users invited by an accountability partner retained "2x" better | [M] vendor, weak attribution |
| **Hatch** | "Your phone doesn't belong on your nightstand"; hardware sunrise alarm | — | — | [W] |

**Patterns:**
- Winners make one promise about the morning: become a morning person, wake up on
  time, or have more energy.
- They get the user to set up tomorrow morning inside onboarding.
- Erly and Alarmy frame each morning as a clear, binary result (won or lost, woke
  or didn't).
- Nobody in the set leads with blocking apps. The "your feeds sleep until you're
  up" slot is open.

**Couldn't find:**
- Published trial-to-paid or retention rates for any morning app, beyond
  Alarmy's relative D1 lift.
- A detailed teardown of Rise's paywall copy. The Appllama and ScreensDesign
  pages are paywalled.

### 3. Do morning commitments hold better than bedtime ones?

**No study compares morning and bedtime commitment devices directly.** Here's
what's nearby:

- **Anchoring a habit to waking.** In an RCT of 48 students, a stretch done on
  waking became automatic in a mean of 106 days, compared with 154 days before
  bed (Fournier et al. 2017, cortisol hypothesis) [S, small].
- **Routine cues versus clock times.** A larger RCT (n=192) found that linking a
  behaviour to a daily routine and linking it to a clock time worked equally
  well. The median time to automaticity was 59 days (Keller et al. 2021) [S].
- **Implementation intentions.** A meta-analysis of 94 studies found d≈0.65 for
  if-then plans (Gollwitzer and Sheeran 2006) [S]. We saw it in secondary sources
  only; the original paper wasn't fetched.
- **Wake-up tasks.** In a 2-week study (n=36), a task required to dismiss the
  alarm, such as taking a photo, raised success at a target morning behaviour to
  94.2%, compared with 75.8% with a plain button. People started the behaviour
  after 84 seconds instead of 334. Most failures were people going back to sleep
  (Oh et al. 2022) [S, small].
- **Morning self-control.** The "morning morality effect" (more self-control in
  the morning) didn't replicate at n=1,006 [S]. Don't use it.
- **Fresh starts.** The fresh-start effect is documented for weeks, months and
  birthdays. Extending it to each morning is our inference [J].

**Our judgement [J]:**
- Structurally, the morning half should retain better than the bedtime half.
  Waking is a daily cue that can't be missed, and the unlock is a visible
  success event.
- A bedtime block succeeds invisibly: its success is something not happening.
- So the morning is where the daily "win" and the shareable artifact come from.
- The flip side: Alarmy's 2.2M daily users against 82M downloads is about 3%.
  Morning utilities are still leaky. Instrument D1, D7 and D30 walk completion.

### 4. Leading onboarding with the morning

Concrete proposal, changing ONBOARDING_CONVERSION as little as possible [J]:

1. **Opening line (his voice):** "You're going to grab your phone before your
   eyes open tomorrow. I'll be asleep on it." Alternative: "Your phone won't work
   until you get out of bed. Well, your apps won't."
2. **Q1, a morning question:** "When your alarm goes off, what happens?" Answers:
   snooze and scroll / scroll, then get up late / get up fine / I don't hear it.
   Wayk and Rise both open on the wake-up problem.
3. **Move Q4 (minutes in bed before getting up) ahead of the night questions.**
4. **The reveal:** keep the combined weekly number, and add a morning line under
   it: "N minutes a morning before your feet touch the floor." Also consider the
   reverse framing: "a year of mornings = X hours of reel."
5. **Setup:** wake time first, then bedtime, then the apps. Then a "what do you
   need before you're up?" screen for work apps.
6. **Demo:** "Wake me up a bit," a 20-step live count with Motion permission.
   Show that a shake doesn't count and have him roast it.
7. **If-then commitment:** one line: "When the alarm goes, I get up first."
   Hold to confirm. It's Fabulous-style, but don't overdo it.
8. **Paywall** (recommendation 7), then arm the lock, then a "see you at 7:00"
   end screen.

### 5. Marketing hooks built on the morning

Each hook needs to show the shield and state the rule within 3–7 seconds
(DESIRE_VALIDATION).

- "I unlock my phone 47 seconds after I wake up. Not anymore." Say "apparently
  the average is 47 seconds," and don't present it as a finding. [W stat]
- "POV: it's 7:01 and TikTok is still asleep."
- **The Mel Robbins frame.** The 5 Second Rule began as a way to beat the snooze
  button and get out of bed. The "launch yourself out of bed" story is already
  mainstream self-help. The video version: "the 5-second rule, but my phone
  enforces it."
- **Day 1 vs day 7.** Feet-on-floor times from the morning receipt, posted daily.
  This fits paid creators posting 2–4 times each.
- **"Morning routine but my raccoon runs it."** Hijacks #morningroutine and
  "that girl" content.
- **"No phone first hour" is too hard, so start with the first 200 steps.** This
  rides the phone-free morning and low-dopamine morning trend. TikTok has
  discover pages for "morning routine without phone." We didn't find view
  counts.
- **Partner POV at 7am:** they're up, you're lying there bargaining with a lock
  screen.

### 6. Retention and features that use the morning

- **The morning receipt** (already in GAME_PLAN) is the daily artifact. Add a
  "feet on floor" time and a comparison with yesterday. It's a clear daily result
  like Erly's, without streak shaming. [J]
- **Buddy mode, morning version:** optional "tell Sam when I'm up." It's a good
  moment to celebrate rather than a failure alert. It fits the no-punishment rule
  and Fabulous's accountability-partner result [M, weak]. [J]
- **The alarm (AlarmKit, v1.1).** AlarmKit alarms ring through Silent mode and
  Focus [W]. Keep Trundle's morning working **without** its own alarm (a start
  time), so the lock never depends on alarm reliability. The alarm can come later
  as an upsell. [J]
- **"I'm up early."** Steps count only from the morning start time. So someone
  who wakes at 6:30 with a 7:00 start walks around and stays locked out, which
  will feel broken. Offer an "I'm up" button that starts the count early, only
  within a set window before the start time (for example 90 minutes). [J]
- **Weekend and late-start mornings.** Different start times on different days
  cut the pressure to use passes. [J]

### 7. Risks

- **Back to bed after unlocking (high).** Snoozing is the norm, most wake-up-task
  failures in Oh 2022 were people falling back asleep, and Alarmy paywalls its
  wake-up check. Measure it in the concierge week. The candidate fix is the
  two-part wake-up. [S]/[M]
- **Alarm dependency (medium).** If users treat Trundle as their alarm before we
  ship AlarmKit, they'll blame us for sleeping in. Say in onboarding that Trundle
  is not an alarm yet. [J]
- **People who need the phone for work in the morning (medium).** Handled by the
  "needed before you're up" list, an on-call pass, and calls and texts always
  working. [J]
- **Early risers and shift workers (medium).** See "I'm up early," and keep the
  "I work nights" branch. [J]
- **App Store and FTC claims (medium).**
  - "My phone won't work" is hyperbole. The store listing should say "your apps."
  - No health, energy or mood claims (guideline 1.4.1). The sleep-inertia and
    habit research is internal only.
  - The "47 seconds" and "68%" stats have no published method. Never put them in
    the store listing.
  - Motion permission text must match the actual use (5.1.1). [J]
- **Morning utilities leak users (medium).** Alarmy's daily users are about 3% of
  its downloads. Price and the trial should assume heavy churn after the first
  weeks. [M, derived]
- **Copying (high, already known).** Wayk, Erly and Opal could add app blocking
  or a step unlock. The voice and the audience remain the moat.

## Sources

- Reviews.org, Cell Phone Usage Stats 2026: https://www.reviews.org/mobile/cell-phone-addiction/
- YouGov, July 2025, smartphone first and last thing: https://yougov.com/en-us/articles/53735-for-many-americans-their-smartphone-is-the-last-thing-they-see-at-night-and-the-first-thing-they-see-in-the-morning
- CEOWORLD, March 13, 2026 (Jolt data): https://ceoworld.biz/2026/03/13/inside-americas-first-60-seconds-how-morning-phone-habits-quietly-drain-time-focus-and-wealth/
- PhoneArena on the Jolt study: https://www.phonearena.com/news/americans-use-their-phone-first-thing-every-morning_id179038
- Morning Consult, "Half of Gen Z is bed rotting": https://pro.morningconsult.com/analysis/half-of-gen-z-is-bed-rotting
- Amerisleep bed rotting survey: https://amerisleep.com/blog/bed-rotting-survey/
- Snooze alarm use, Scientific Reports 2025: https://www.nature.com/articles/s41598-025-99563-y
- Sleep Cycle press release on the snooze study: https://sleepcycle.com/newsroom/press-release/sleep-cycle-co-authors-new-study-uncovering-global-trends-in-snooze-alarm-use
- Sleep Foundation, sleep inertia: https://www.sleepfoundation.org/how-sleep-works/sleep-inertia
- Hilditch et al. 2020, "Exercising Caution Upon Waking": https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2020.00254/full
- Frontiers in Physiology 2026, physiological dynamization and sleep inertia: https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2026.1855408/full
- Fournier et al. 2017, circadian cortisol and habit formation: https://www.researchgate.net/publication/317927404_Effects_of_Circadian_Cortisol_on_the_Development_of_a_Health_Habit
- Keller et al. 2021, routine versus time cues: https://bpspsychub.onlinelibrary.wiley.com/doi/10.1111/bjhp.12504
- Oh et al. 2022, wake-up tasks, JMIR Formative Research: https://pmc.ncbi.nlm.nih.gov/articles/PMC9529170/
- Morning morality effect non-replication, 2024: https://www.sciencedirect.com/science/article/pii/S0022103124001112
- DelightRoom, Alarmy onboarding experiment (April 2024): https://delightroom.com/blog/en/how-we-succeeded-with-our-onboarding-experiment-after-a-year
- DelightRoom, Alarmy missions part 2: https://delightroom.com/blog/en/deep-dive-into-alarmy-missions-part-2
- DelightRoom company page (82M downloads): https://alar.my/en/company
- Airbridge Alarmy case study (2.2M daily wakers): https://www.airbridge.io/en/case-studies/alarmy-roas-measurement
- Indie Hackers, Alarmy $11M: https://www.indiehackers.com/post/alarmy-the-11-million-alarm-clock-app-c74024c017
- ScreensDesign, Alarmy: https://screensdesign.com/showcase/alarmy-loud-alarm-clocksleep
- Alarmy Wake Up Check help: https://alarmy-ios.zendesk.com/hc/en-us/articles/900000085346
- Erly on the App Store: https://apps.apple.com/us/app/erly-wake-up-early/id6751428380
- Erly profile ($29.99/yr, creators, CPM): https://yespress.io/early-push-up-alarm-app-50000-month
- Indie Hackers, Erly $50K/mo: https://www.indiehackers.com/post/how-a-simple-alarm-clock-app-makes-50k-month-RYmogGgIR0fKfLDBl7a0
- ScreensDesign, Wayk: https://screensdesign.com/apps/wayk-alarm-clock-to-wake-up/
- ScreensDesign, Rise: https://screensdesign.com/showcase/rise-sleep-tracker
- Rise Science: https://www.risescience.com/
- Fabulous onboarding critique: https://www.thebehavioralscientist.com/articles/fabulous-app-product-critique-onboarding
- Firebase Fabulous case study: https://firebase.google.com/downloads/Firebase_Fabulous_Case_Study.pdf
- The Gadgeteer on Hatch, February 2026: https://the-gadgeteer.com/2026/02/16/a-sunrise-alarm-clock-designed-to-kill-your-phone-habit/
- MacRumors, AlarmKit in iOS 26: https://www.macrumors.com/2025/06/11/ios-26-third-party-alarm-apps/
- Refinery29, low-dopamine morning routine: https://www.refinery29.com/en-gb/low-dopamine-morning-routine
- TikTok discover page, "morning routine without phone": https://www.tiktok.com/discover/morning-routine-without-phone
- Mel Robbins, The 5 Second Rule: https://www.melrobbins.com/book/the-5-second-rule/
