# Trundle — current game plan

Updated September 21, 2026. This is the source of truth for product direction.
It supersedes earlier brainstorms about proving arbitrary goals, earning short
unlock windows, and a pet that deteriorates with screen time.

## The product

Put your phone down. Let Trundle rest. Trundle is a sleepy raccoon companion you make time to care for through shared bedtimes and scheduled naps. He goes to sleep at
your chosen bedtime and blocks selected distracting apps. In the morning, walk
200 steps to wake him and unlock those apps for the day. A separate always-blocked
list stays blocked even while he is awake.

The user controls their schedule and app choices. Normal blocking happens
automatically; walking is a morning ritual, not a currency spent on each unlock.
Only selected apps are blocked, not the whole phone.

## Core daily loop

1. Choose a bedtime, a morning start time, and the apps that follow this schedule.
2. At bedtime, Trundle falls asleep and the scheduled apps block automatically.
3. At the chosen morning start time, the wake-up step counter begins. Scheduled
   apps remain blocked while Trundle is waking up.
4. Walk 200 steps. Count eligible steps from the morning start time, including steps
   taken before opening Trundle; opening the app should not start the count.
5. At the target, Trundle wakes and scheduled apps unlock until the next bedtime.
6. Apps on the always-blocked list remain blocked throughout every state.

The step count resets for each new morning. Steps from the previous day or before
the morning start time do not carry over. Reopening the app must not reset progress.
If the target is not reached, scheduled apps remain blocked. Bedtime takes precedence:
completing steps during the night must not unlock the apps.

200 steps is the initial default to test, not a validated ideal threshold.

## Naps

- Schedule daily naps with a start and end time. Naps end automatically without a
  step requirement; the 200-step walk remains the morning ritual.
- Use “Tuck him in for a nap” for an immediate 15-, 30-, or 60-minute rest.
- Daily naps cannot overlap each other or bedtime. Bedtime takes precedence over
  an immediate nap; it never unlocks overnight apps when that nap timer expires.
- Naps use the same selected app list as bedtime. The always-blocked list remains
  independent. Native enforcement is still pending.
- Keep the tone affectionate and unpressured: sleepy eyes, tucked limbs, quiet
  breathing, and a peaceful wake-up. No guilt or punishment for needing the phone.

## User control

- Users choose the normal bedtime and morning start time.
- Users manage scheduled and always-blocked app lists separately. If an app belongs
  to both, the always-blocked rule wins.
- “Always blocked” means independent of Trundle's daily routine, not an irreversible
  restriction. The user can manage that list explicitly.
- Support putting Trundle to bed early for a deliberate break. Before implementing
  this flow, decide how an early/manual block ends and whether it joins the next
  overnight schedule; do not assume another 200-step unlock.
- Plan for an adjustable step target, an accessible non-walking alternative, and an
  intentional emergency bypass. Exact interactions and bypass duration are still
  open. Waking Trundle or bypassing a scheduled block must not silently clear the
  always-blocked list.

## Dashboard

The dashboard should answer: Is Trundle asleep or awake? What is blocked? What
happens next?

- **Night:** sleeping Trundle, “Trundle is asleep,” the morning start time, and a
  summary of blocked apps.
- **Morning:** “Walk 200 steps to wake Trundle,” clear progress such as “84 / 200,”
  and the apps that will unlock. Trundle stirs, stretches, then stands as progress
  increases.
- **Day:** awake Trundle, the next bedtime, the status of both app lists, and the
  option to put him to bed early once its behavior is defined.
- Keep the dark, spacious dashboard direction, with Trundle as the centerpiece.
  His state should communicate the blocking state.
- Screen-time charts and routine history are secondary. “Time reclaimed,” virtual
  distance, and the lighthouse journey are not the main dashboard or core loop.
- Do not display sample statistics as real tracking, or imply protection is active
  before native blocking is connected.

## Character and animation

**Mascot change (September 23, 2026):** Trundle is becoming a tired, sassy raccoon
with a sleep mask. See [docs/MASCOT_DIRECTION.md](docs/MASCOT_DIRECTION.md). The rebuild
starts with the raccoon; the old rock art is archived at the `rock-prototype` tag.

Prioritize sleeping, stirring/stretching, walking, and awake idle states. Animation
should make the daily routine understandable. Trundle does not die, lose progress,
crack, or lose his moss as punishment for app use or a bypass.

## Implementation order

1. Define and persist the routine state, schedule, both app lists, and wake progress.
   Resolve manual sleep, accessibility, and bypass behavior before those flows ship.
2. Build the state-driven dashboard and setup/settings flows. Clearly label any
   simulated states while native services are unavailable.
3. Validate native iOS blocking and step counting on a real device: permissions,
   scheduled transitions while the app is closed, counting from the morning start,
   and applying an unlock after the target. Verify background limitations rather
   than promising immediate automatic unlocking before it is demonstrated.
4. Connect the interface to those services and handle denied/revoked permissions,
   missing step data, app restarts, missed transitions, time-zone changes, daylight
   saving changes, and schedule edits. Surface failures honestly.
5. Test the daily loop over several days, including bedtime, mornings without
   opening the app, incomplete goals, always-blocked precedence, and recovery paths.
6. Refine animation and tune the default target based on use.

## Research

Market, competitor, iOS-feasibility, monetization and validation research lives in
[docs/VALIDATION_RESEARCH.md](docs/VALIDATION_RESEARCH.md) (September 23, 2026).
It informs decisions; this game plan stays the source of truth. Key constraints from
it: request the Family Controls distribution entitlement for the app and every
extension early; the dependable morning unlock is a shield tap that checks
CMPedometer steps, not a guaranteed automatic unlock; prove D30 "blocking still
active" retention before spending launch distribution.

## Not part of the current plan

- Repeated walking to purchase 10–15-minute app-access windows.
- AI/photo verification of arbitrary goals or an AI gatekeeper.
- Feeding a pet to unlock apps, neglect/punishment states, or bypass penalties.
- Squads, leaderboards, money stakes, NFC unlocks, and a cosmetic economy.
- Virtual distance earned from estimated time saved as the primary progression.
- A committed subscription price, hard paywall, or launch monetization model.

Optional future features must support this routine, not quietly replace it.

## Current implementation status

**Rebuilding from scratch (September 24, 2026).** The repository has no app code.
The earlier Expo prototype (rock mascot, state-driven dashboard, bedtime and nap
preferences, both app lists, and the 14-page onboarding preview) is preserved at the
git tag `rock-prototype`. Browse it with `git show rock-prototype:<path>` or restore
a file with `git checkout rock-prototype -- <path>`. Reuse its logic only where it
still fits this plan; do not carry over the rock art.

The research in `docs/` still applies. Onboarding, HIG and validation findings hold
for the rebuild; their file paths refer to the `rock-prototype` tag.
