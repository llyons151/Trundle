# Trundle: what makes people say "I need that"

Researched September 24, 2026. This adds to [VALIDATION_RESEARCH.md](VALIDATION_RESEARCH.md)
and [IDEA_SCORECARD.md](IDEA_SCORECARD.md), which cover market size, competitors, iOS
feasibility and revenue. This pass answers one question: **what makes someone see
Trundle and want it right now?** It had three parts:
- Viral hooks: what the videos showed and what the comments said.
- Customer quotes: Reddit threads and App Store reviews.
- A red team arguing against the idea.

[GAME_PLAN.md](../GAME_PLAN.md) is still the source of truth.

**Evidence tags:** [STRONG] = primary data or many consistent sources.
[MED] = secondary sources or search snippets. [WEAK] = inference or an absence of
evidence. [OPINION] = our judgement.

**Limits:**
- TikTok comments couldn't be fetched directly.
- Reddit was read through the Arctic Shift archive.
- r/nosurf has many AI-written or sponsored posts. Those are marked [suspect].

## Verdict

**Worth pursuing, but as a positioning, voice and distribution play, not a
feature play.** [OPINION]

- **The desire is real and specific.** It isn't "I scroll too much." It is:
  - "I bypass everything from bed."
  - "I can't make myself get out of bed."
- **Every tool people have tried can be beaten lying down:**
  - Ignore Limit
  - their own passcode
  - Alarmy's math missions
  - the phone across the room, which they fetch and carry back to bed
- **Walking is the one unlock you can't do lying down. That is the "I need that."**
- **The mechanic itself is a commodity.** Opal Sleep has a bedtime lock plus a
  one-hour morning lock. Awaken, Unbed, Sunbreak, Dozzi, UpDude, BedLock, Groggy and
  about 12 walk-to-unlock apps overlap.
  - None has traction.
  - None has a distribution engine or a character.
  - Opal could add a step unlock in a sprint; assume it will within 6–12 months.
- **The biggest open product question is new:** does walking 200 steps keep people
  up, or do they walk, unlock, climb back into bed and scroll? See risk 1.

## 1. The "I need that" trigger

### What the customer quotes say [STRONG]

The most common framing, in nearly every thread, is self-control failure:

> "I tap Ignore Limit for Today before I've even finished the thought… I tried
> putting a passcode on myself. Then I just typed my own passcode at 12:40am."
> ([r/iphone](https://reddit.com/r/iphone/comments/1w0pf83))

> "'put phone in another room.' I literally got up and went and got it lol."
> ([r/nosurf](https://reddit.com/r/nosurf/comments/1rrlg82))

> "i will literally solve the equations half asleep, turn the alarm off, and crawl
> right back into bed" ([r/getdisciplined](https://reddit.com/r/getdisciplined/comments/1rri6yc))

The second most common is "stuck in bed," and it comes with real consequences:

> "When my alarm goes off, I don't get up. I just lie there on my phone and scroll
> for as long as I possibly can. I'm awake, not tired, just stuck. Sometimes I even
> set my alarm earlier on purpose so I can scroll more."
> ([r/nosurf](https://reddit.com/r/nosurf/comments/1qb42xr))

> "I've missed morning stand-ups because of this. I've been late for work."
> ([r/getdisciplined](https://reddit.com/r/getdisciplined/comments/1wi5on8))

> "my mornings were 40 minutes of scrolling in bed before my feet even touched the
> floor… i didn't even enjoy it, it was just what my hands did." (444 upvotes,
> [r/getdisciplined](https://reddit.com/r/getdisciplined/comments/1vhtr1h))

**Night and morning are the same problem.** That is Trundle's exact pitch, in a
user's words:

> "nighttime scrolling and morning scrolling aren't two problems. they're the same
> problem feeding itself… the alarm goes off and what's the first thing I do? grab
> the same phone to 'turn it off' and somehow it's 7:40… and I haven't even peed
> yet." ([r/nosurf](https://reddit.com/r/nosurf/comments/1rrlg82))

**Night versus morning.** Posts about each draw similar numbers and upvotes.
[MED]
- Night pain comes out as guilt and resignation ("I am ruining my own life").
- Morning pain comes out as a stuck body plus consequences, which is closer to
  "I need a fix."
- Night already has many tools. Morning has almost none that reach people.
- **This supports the morning-first wedge in GAME_PLAN.**

**What people love about forced tasks.** Alarmy's best reviews follow one formula:
"I hate it, which is why it works."

> "I absolutely hate this app in the morning— which is exactly what I need. It
> forces you up… now that I'm up, I might as well make some coffee"
> ([Alarmy](https://apps.apple.com/us/app/id1163786766))

**Nobody objected to walking.** Walk-to-unlock apps die in reviews for two other
reasons: [STRONG]
- **Broken step sync:** "stopped syncing my step count and left me locked out of my
  apps".
- **Weekly pricing:** "$4.99 a week is a ridiculous charge… So I deleted it."

These reviews support two GAME_PLAN decisions: counting steps with CoreMotion
instead of HealthKit, and not offering weekly pricing.

**One objection to avoid.** When steps are framed as earning scroll time, people
push back:

> "it reinforces the idea that social media is a 'reward'… Why do all that when I
> can just delete the app in 5 seconds?" ([r/nosurf](https://reddit.com/r/nosurf/comments/1nve8jg))

Frame the walk as getting out of bed, not as earning TikTok.

### What the viral videos say [STRONG]

The apps that got "what app is this?" comments share one moment: **the phone
refuses a real person on camera until they do something physical.**

| App | Video | Result |
|---|---|---|
| Wayk (mission alarm) | "My alarm won't turn off until I do [X]", POV, raw reaction | 25M views, 100K+ downloads in 30 days ([First 1000](https://read.first1000.co/p/how-an-alarm-app-got-25-million-views)) |
| Early (push-up alarm) | Push-ups on camera inside a creator's day-in-the-life vlog | ~$50K/mo within 4 months, 2–4 posts per creator at $2–3 CPM ([Indie Hackers](https://www.indiehackers.com/post/how-a-simple-alarm-clock-app-makes-50k-month-RYmogGgIR0fKfLDBl7a0)) |
| Pushscroll (push-ups to scroll) | Fake demo video posted **before the app was built** | One ~8M-view video brought ~200K installs; $1M+ in year one ([Braavo](https://www.getbraavo.com/blog/from-0-to-1m-the-organic-growth-playbook-behind-pushscroll/)) |
| Touch Grass (photo of grass to unlock) | A meme turned literally into a feature | 50K downloads at launch ([Substack](https://rhyskentish.substack.com/p/touch-grass-my-app-that-stops-me)) |
| SGE roundup | "He's doing pushups to turn his alarm off"; a couple in bed | 5.2M and 4M views ([SGE](https://www.socialgrowthengineers.com/screen-time-app-goes-viral-by-filming-boredom)) |

Comment reactions:
- "Whoever invented an alarm that won't turn off until you complete a task clearly
  wanted me to suffer" [MED, search snippet]
- "it's annoying enough that it actually works" [MED, search snippet]

**Search demand is also evidence.** TikTok generates discover pages from what
people search, and it has pages titled "What is the app called where you have to do
push-ups to turn off your alarm." [STRONG as a signal]

**Views are not installs.**
- Pushscroll's 8M-view video out-earned a competitor's 50M-view attention-bait
  video, which made about $6K MRR.
- Videos that convert show the app screen, name a specific persona and state the
  rule within 7–10 seconds.
- Quittr's creator brief required showing the app.

### The trigger, in one line

> **"My phone won't work until I get out of bed."**

It combines three things:
- the strongest pain: bypassing everything from bed
- the strongest video pattern: the phone refusing you on camera
- a phrase everyone already says, made literal, as Touch Grass did

It beats "I have to walk 200 steps before TikTok works." That line reads as
earning a reward and leads with the number instead of the feeling. Test both.
[OPINION]

The 3-second difference from Opal:
- Opal's morning ends at a clock time.
- Trundle's ends when your feet hit the floor.
- The raccoon mocking you from the lock screen is what people screenshot.

## 2. Risks, ranked

1. **The back-to-bed hole (high, new).** A person walks to the bathroom and back,
   the apps unlock, and they climb back into bed and scroll. The unlock actually
   rewards getting back into bed.
   - Alarmy sells a paid "Wake Up Check" because finishing a mission doesn't stop
     people falling back asleep. [STRONG, indirect]
     ([Alarmy support](https://alarmy-ios.zendesk.com/hc/en-us/articles/900000085346))
   - On the other side, Alarmy reviewers say "now that I'm up, I might as well make
     some coffee." [MED]
   - No data exists either way. It's the first thing the concierge test should
     measure.
2. **Commodity mechanic, and Opal is the likely copier (high).** Plan for Opal to
   ship a step unlock. Only the brand, the voice and the audience stay yours.
3. **Walk-to-unlock has never broken out (high).** WalkLock has 29 ratings after
   four years. But none of those apps had distribution, which is the founder's real
   advantage. [WEAK: absence of evidence]
4. **People cycle off commitment devices (high).** Screen Time access can be revoked
   with Face ID. The one sec long-term study found users "took periodic breaks" and
   "quickly rebounded." ([CHI 2024](https://www.medien.ifi.lmu.de/pubdb/publications/pub/haliburton2024chi/haliburton2024chi.pdf))
   This hurts annual renewals more than installs.
5. **Cheating (medium).** Arm swings and a phone in a sock fool iPhone step counts.
   Anti-shake checks are already in GAME_PLAN. Showing cheats *failing* is also a
   good video.
6. **Apple (low for now).** iOS 27's Screen Time changes target parents and kids.
   AlarmKit helps every competitor equally.

**New competitors to watch** (none has traction):
- **Awaken (formerly DIAL):** an alarm plus a blocker, including one extra hour of
  blocking after the alarm, at $29.99.
- **Unbed:** apps stay locked until you get up and scan a physical block.
- **Sunbreak and Dozzi:** night blocks that end at sunrise or wake-up.
- **UpDude:** a step unlock.
- **Wayk:** a mission alarm with a strong short-form playbook.

## 3. Video concepts to test first

Every concept must show the lock screen and state the rule within 3–7 seconds.

1. **"My phone won't work until I get out of bed."** Tap TikTok, the lock screen
   shows his line, groggy hallway laps as the counter ticks to 200, then TikTok
   opens. Wayk's structure.
2. **The bedtime betrayal.** Mid-scroll at 11:00pm, the apps fall asleep, he says
   goodnight, and the creator stares at the ceiling.
3. **Cheating attempts.** Shaking the phone, putting it in a sock, taping it to the
   dog. Each fails and he roasts the attempt. This proves the lock is strict. Film
   only cheats that really fail.
4. **Partner POV.** "POV: my boyfriend has to walk 200 steps before Instagram
   works." The couple-in-bed format got 4M views.
5. **Caught in 4K.** Open on a real Screen Time total ("3 hours in bed before 9am"),
   then the fix.
6. **"I tried everything."** Ignore Limit, the phone across the room, Brick, each
   beaten from bed. Then the one lock you can't beat lying down. This uses the
   customers' own words.
7. **Day in the life, narrated by him.** Early's format, with his lines as the
   comedy.
8. **A seven-night challenge.** Daily check-ins, built for paid creators posting
   2–4 times each.

## 4. What must be true, and the cheapest test for each

| Must be true | Cheapest test | Kill or fix signal |
|---|---|---|
| The hook creates intent, not just views | Pushscroll's approach: 5–10 mockup videos before the app exists, linking to a waitlist. Compare "won't work until I get out of bed" with "walk 200 steps before TikTok" | Under ~0.5% of viewers join the waitlist, or no "what app is this?" comments |
| Getting up keeps people up | Concierge week with 10–20 people: Screen Time Downtime plus a walk-before-apps rule, with a daily report of whether they went back to bed | If most go back to bed, design a "stay up" rule before building the rest |
| Steps can't be trivially faked | A one-day CoreMotion spike trying arm-swing and sock cheats | Cheats pass; tighten checks (cadence, distance) |
| People keep it on | TestFlight group of about 30, tracking Screen Time revocations at days 7, 14 and 21 | More than ~40% revoke by day 21 |
| You launch before Opal copies it | Can't be tested; ship the smallest version fast | — |

## 5. Back-to-bed fix and viral features (September 24 follow-up)

**The wake-window rule is not a back-to-bed fix.** Steps only count from the
morning start time, which is already in GAME_PLAN. That rule stops people walking
at 3am to unlock early. It doesn't stop someone walking 200 steps at 7:00 and being
back in bed scrolling at 7:03.

**Candidate back-to-bed fix: the two-part wake-up.** [OPINION]
- 100 steps wakes him halfway, and he asks for the rest "in a bit."
- The last 100 steps count only after about 10 minutes. By then the user has been
  up long enough to make coffee, and the Alarmy reviews suggest people who have
  been up that long usually stay up.
- It uses only step timestamps from CMPedometer, so it needs no new permissions.
- Test it against a single 200 in the concierge week.

**Viral features, ranked by how shareable they are** [OPINION]:
1. **A voice people can hear.** Give him a voiced line on the walk screen and at
   bedtime. A recognizable voice can become a TikTok sound, as Duolingo's owl did.
   Every user video then advertises him.
2. **Roasts when he catches cheating.** When the anti-shake check fires, he calls
   it out ("that's a wrist, not a walk"). Cheat-attempt videos already work as a
   format.
3. **An excuse court for passes.** The user picks an excuse (sick, travel, baby
   asleep, "I'm just tired") and he rules on it in his voice. Real excuses get a
   pass. "Just tired" gets roasted. Rulings come from the line bank, not AI.
4. **A morning receipt.** The planned share card, formatted as a receipt: "Alarm
   7:00. Feet on floor 7:04. 213 steps. Time wasted in bed: 4 min (yesterday: 52)."
   It is built for screenshots and daily trend posts.
5. **A falling-asleep goodnight at bedtime.** He gets drowsier line by line,
   mid-sentence, then the apps go out. It's a 5-second clip that loops well.

All five fit GAME_PLAN: no punishments, no timed earned unlocks, no AI
verification, no glow.

## 6. Suggested changes to GAME_PLAN (not yet applied)

1. **Make "My phone won't work until I get out of bed" the lead hook**, and test the
   200-steps line against it.
2. **Position Trundle as "the one lock you can't beat from bed,"** and present the
   bedtime lock as preventing the 2am spiral that ruins the morning.
3. **Add a back-to-bed question to Step 1.** Measure it in the concierge week. If it
   fails, decide on a stay-up mechanic before v1.
4. **Add Awaken, Unbed, Sunbreak, Dozzi, UpDude and Wayk** to the competitor watch
   list.
