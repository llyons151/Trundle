# Trundle — idea log

Twists on the basic iOS app blocker, ranked by how much money I think each could make
for a solo/small team. Rankings are judgment calls, not data: they weigh willingness to
pay, retention, how well the idea demos in a 10-second video (this category is sold
almost entirely through TikTok/Reels), crowding, and App Review risk.

Comparables are from memory of public reporting — verify before relying on any number.

## Ranking

### 1. Pet that lives or dies by your screen time (+ goals to feed it)
A creature ("Trundle") that thrives when you hit goals and visibly suffers when you
bypass a block. Completing goals feeds it / unlocks apps.
- Why it makes money: the #1 killer of blockers is uninstalling the moment it annoys
  you. Emotional attachment fixes retention, and retention is what subscriptions are
  made of. Adds a second revenue line: cosmetics.
- Comps: Focus Friend hit #1 on the App Store (2025); Finch is one of the top-grossing
  self-care apps; Forest has sold for a decade on a much weaker version of this.
- Risk: art/animation quality matters a lot. A mediocre pet is worse than no pet.

### 2. Vertical "quit" blocker (gambling, porn, a specific app)
Same tech, positioned at one painful problem, with strict no-bypass mode, streaks,
accountability partner, panic button.
- Why: highest willingness to pay in the category. People with a real problem pay
  $50–100/yr without blinking and don't churn while it's working.
- Comps: Quittr (porn) reportedly reached very high monthly revenue with a tiny team;
  Gamban is a paid gambling blocker.
- Risk: sensitive audience, needs to be done responsibly; ad platforms restrict some
  of these verticals.

### 3. "Prove it" — AI-verified custom goals to unlock
User writes any goal in plain English ("make my bed", "read 10 pages", "be at the
gym"). To unlock, they snap a photo and a vision model verifies it.
- Why: this is the general form of "goals to unlock" and nobody owns it. Touch Grass
  went viral on a single hard-coded goal. Extremely demoable. Per-check AI cost is
  fractions of a cent.
- Risk: cheating (photo of a photo) — mitigations exist but it's an arms race; mostly
  users only cheat themselves.

### 4. Squads / social accountability
Friends see your bypasses, a friend must approve an unlock, group streaks, leaderboard,
"shame ping" when you cave.
- Why: not the biggest revenue on its own, but the best growth loop — every user has a
  reason to invite 2–5 people, which cuts acquisition cost toward zero. Best as a layer
  on top of another idea rather than the whole product.
- Comps: Clearspace and Opal both added social features for this reason.

### 5. Money on the line
Stake real money; bypassing the block costs you (to charity, a friend, or an
anti-charity). App takes a cut or charges a subscription.
- Why: loss aversion is the strongest behavioral lever there is; highest ARPU potential.
- Comps: Forfeit, Beeminder, stickK.
- Risk: the big one is App Review / in-app purchase rules and payments compliance.
  Could be rejected or forced through IAP at 30%. High ceiling, real chance of zero.

### 6. Morning lock ("Alarmy for screen time")
Phone stays locked every morning until the routine is done: out of bed, scan a QR in
the bathroom, sunlight photo, 10 minutes of whatever.
- Why: tight positioning beats a general blocker; "no phone for the first hour" is a
  huge self-improvement trend. Alarmy has made millions on mission-based alarms.
- Risk: narrower use window means it may feel less worth a subscription — pairs well
  with #3.

### 7. Ritual-before-unlock for a community (faith, stoicism, recovery, etc.)
Pray / read a verse / journal before the apps open.
- Why: proven — prayer-lock style apps have done very well, with community distribution
  that doesn't depend on paid ads.
- Risk: the Christian version is already crowded in 2026. Other communities are open.

### 8. Learn to unlock — parent pays
Kid must do math/reading/vocab to earn TikTok time. Adult variant: flashcards, LSAT/MCAT
questions, language reps.
- Why: parents have far higher willingness to pay than the students themselves, and the
  value prop sells itself.
- Risk: parental controls on iOS are a harder technical setup (child authorization via
  Family Sharing); content quality becomes your problem.

### 9. Argue with the AI gatekeeper
To unlock, you have to convince an AI that knows your goals and schedule. It grants
5 minutes or roasts you.
- Why: screenshots are inherently shareable; great launch hook.
- Risk: novelty wears off; typing is friction people come to hate. Better as a mode
  than a product.

### 10. Physical unlock (NFC tag / object in another room)
Tap a tag on the fridge to unblock. Brick built a large business on a $59 piece of
plastic.
- Why: hardware margin with no subscription resistance.
- Risk: inventory, shipping, returns, and several clones already exist. The
  software-only version (bring your own $0.30 NFC sticker) is a nice feature but hard
  to charge for.

### 11. Earn screen time with steps/workouts (HealthKit)
- Proven but crowded (Steppin, Clearspace pushups, others). Fine as one goal type
  inside #1 or #3; weak as the headline.

### 12. Schools / teams (software Yondr)
- Big contracts exist (Yondr), but long sales cycles, and iOS gives you no way to stop
  a student from revoking permission. Not a solo first product.

### 13. Replacement feed
Open Instagram, get one page of your book / your reading list instead.
- iOS shield screens are very restricted (title, subtitle, icon, two buttons — no
  custom UI, can't deep-link straight into your app). The good version of this idea
  isn't buildable today.

### 14. Brand rewards for staying off your phone
- Needs scale and B2B sales before it pays anything. Skip.

### 15. Breathing delay / friction screen
- One Sec owns it and ScreenZen gives it away free. Table stakes feature, not a product.

## Recommended combination

Core loop: **#3 (set any goal, prove it to unlock)**
Retention: **#1 (Trundle the pet is fed by completed goals, suffers on bypass)**
Growth: **#4 (squads)** added after launch
Modes to add later: #6 morning lock, #9 AI gatekeeper, #10 bring-your-own NFC tag

Monetization that works in this category: onboarding quiz → personalized "you'll get
back X hours/week" → hard paywall with free trial, roughly $40–60/yr with a weekly
option. Cosmetics for the pet as a second line.

## Deep dive: how the pet (#1) would work

**Concept:** "trundle" means to move along slowly and steadily, so the pet is a
traveller, not a Tamagotchi in a room. Trundle walks a trail whenever you're off the
blocked apps and stops when you're on them. Distance = time you got back. The trail
has places to reach, things to find, and seasons.

**What existing ones do (as far as I know — verify):**
- Focus Friend, Forest: timer-based. You start a session, the bean knits / tree grows,
  leaving the app interrupts it. Nothing happens if you never start a session.
- Finch: pet + self-care goals, no blocking at all. Never punishes.
- Opal, ScreenZen, One Sec: real blocking, no character.
Nobody combines always-on blocking, a character, and real-world goals.

**What would separate it:**
1. *Always on, not session-based.* Pet reacts to actual all-day usage, via
   `DeviceActivity` threshold events (fire every N minutes of use of the chosen apps)
   writing to shared state. No timer to remember to start.
2. *The pet shows up at the moment of temptation.* The shield screen allows a custom
   icon + title + subtitle, so opening Instagram shows Trundle and a line like
   "Trundle was 200m from the lighthouse." Plus home-screen widget and lock screen.
   Competitors' pets live inside an app you have to choose to open.
3. *Mirror, not victim.* A pet that dies creates shame, and shame makes people avoid
   the app, then delete it. Instead Trundle copies you: when you doomscroll he pulls
   out a tiny phone and glazes over; after a bad week he's hunched with eye bags;
   after a good week he's spry and bringing things back. Funny, shareable, no guilt
   spiral. He never dies — he just stops getting anywhere.
4. *Goals become his world (ties in #3).* Prove you went to the gym → he gets a
   sweatband; read 10 pages → he's carrying a book; proof photos become postcards in
   a scrapbook. The pet's stuff is a record of your real life, not a coin shop.
5. *Trail seasons.* A finite map per season gives a content cadence, collectibles, and
   a reason to stay subscribed.
6. *Squads walk together (ties in #4).* Friends' pets share a trail; scroll and you
   fall behind the group.

**Unlock loop:** blocked app → shield with Trundle → "Earn it" button → notification
opens the app (shield buttons can't deep-link directly) → complete a goal → apps open
for a window, Trundle sits down to wait → shield returns. Emergency bypass always
exists, costs the day's distance, never the pet.

**Money:** pet and one blocked app free (growth, sharing); subscription for unlimited
apps, schedules, strict mode, squads; cosmetics and seasons on top.

**Biggest risk:** art. Mitigation: a very simple body (bean/blob/snail level), animated
with a state machine (e.g. Rive) rather than hand-drawn frames.

## Character concepts

Requirements: readable at block-screen icon size, very few moving parts, clear
silhouette, fits "trundle" (slow, steady travel), can visibly mirror scrolling, can
wear/carry items from goals, not already taken (bean = Focus Friend, bird = Finch,
owl = Duolingo, tree = Forest, gem = Opal).

### A. The rolling stone (top pick)
A small round boulder with stubby legs and big eyes. "A rolling stone gathers no moss."
- Mirror mechanic is an escalating gag tied to usage thresholds: 10 min scrolling → he
  sits down with his tiny phone; 30 min → moss; 1 hr → mushrooms; 2 hr → a bird nests
  on him; 3 hr → a hiker is sitting on him. Off your phone → he shakes it off, rolls
  on, ends up polished and shiny after a good week.
- Personality: deadpan, patient, unbothered. Says very little. Dry one-liners.
- Why: easiest possible thing to draw and animate; circle silhouette works at any
  size; every threshold is its own video; "the pet rock that blocks your apps" is a
  ready-made hook. Goal items just sit on or strap to him.
- Risk: a rock has to earn its warmth entirely through eyes and timing.

### B. Hermit crab (runner-up — best for cosmetics)
- Retreats into his shell to scroll; phone glow leaks out of the opening. Has claws to
  hold the phone.
- Shells are the cosmetic shop with zero explanation needed: teacup, tin can, tiny
  lighthouse, seasonal shells. Reaching trail landmarks unlocks new homes.
- Personality: anxious homebody who's braver than he thinks.
- Risk: more parts to animate; scuttles rather than trundles.

### C. Pill bug (roly-poly)
- Curls into a ball around his phone, glow coming from inside — the single best image
  of being absorbed in a screen. Uncurls and rolls along when you're off it.
- Personality: shy, earnest, easily startled.
- Risk: it's a bug; needs very careful cute-ification (four nubs, not fourteen legs).

### D. Snail with a backpack shell
- Shell is his pack; postcards, stickers and goal items hang off it. Eye stalks droop
  as the week gets worse — expressive with almost no rig.
- Personality: cheerful slow-travel tourist, journals everything.
- Risk: slime factor for some people; "slow" can read as "sluggish app"; no hands.

### E. Wind-up tin toy
- Key on his back: off-phone time winds him, scrolling runs him down until he stops
  mid-step. Energy is visible without any UI.
- Personality: old-fashioned, polite, a bit formal.
- Risk: colder than a living creature; robots are a crowded mascot space.

### Core poses needed for launch (any concept)
1. Trundling (walk/roll loop) — default, widget.
2. Spotted you — looks up at the camera; block screen.
3. On his tiny phone — glazed eyes; mirror state.
4. Neglected stages 1–3 — the escalating gag.
5. Celebrating — goal proven.
6. Waiting — sitting while your unlock window runs.
7. Asleep — night.

## Feature idea: Trundle in the Dynamic Island

Use an iOS Live Activity so Trundle sits in the Dynamic Island (and on the Lock Screen)
while it matters — not as permanent decoration.
- Best use: during an unlock window. You're inside Instagram, and he's at the top of
  the screen next to a countdown, watching. The countdown text ticks on its own without
  the app sending updates. Swaps to the "on his phone" pose as time runs low.
- Also: focus sessions, morning lock, "X min until next level".
- Precedent: Pixel Pals put pets in the Dynamic Island and people loved it.
- Limits: tiny (a few dozen points tall), static images with short system transitions
  only, no free-running animation; Live Activities end after about 8 hours and must be
  restarted; iPhone 14 Pro and later only (others see the Lock Screen version).
- App Review expects Live Activities to track something with a start and end, which is
  why it should be tied to sessions rather than always on.
- Build cost: a separate SwiftUI widget extension (not React Native). To verify:
  whether the background monitor extension can update it, or only the app / push.
- Priority: right after basic blocking works. Very strong video material.

## Open questions
- Who is the first audience? (students / ADHD / gym crowd / parents) — decides tone,
  pet design, and which creators to seed.
- How strict is "strict mode"? Truly unbypassable blocks convert better but generate
  angry reviews.
