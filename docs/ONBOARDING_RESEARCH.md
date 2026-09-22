# Trundle onboarding: research, decisions, and validation plan

Research date: September 21, 2026. Historical baseline: five-screen local preview.

**Updated recommendation and implementation:** [Opal research and the 14-page flow](OPAL_ONBOARDING_RESEARCH.md) supersede the screen-count recommendation below. This original review emphasized usability over subscription conversion; its original five-screen claims and checks are retained as historical context.
Product authority: [GAME_PLAN.md](../GAME_PLAN.md).

## Recommendation

Use a short, editable setup flow: **welcome → schedule → app selection → morning walk → review**. Let people explore first and return to their draft. Explain access where it will be needed, and distinguish saving a plan from activating protection.

**Layout requirement from the user:** every onboarding page fills the screen and is non-scrollable. The implementation uses a fixed page shell with a visible bottom action, paginated app choices (two to four per page depending on usable height, one with larger text), and optional native panels for time editing and explanations. Those panels have bounded, non-scrolling content too. Catalog pagination does not add mandatory onboarding steps: users can proceed without inspecting every app. Sizing accounts for safe-area insets. This requirement takes precedence over the earlier suggestion of a scrolling screen shell.

Five screens is a design hypothesis for Trundle, **not a scientifically established optimum**. I found no credible comparative evidence establishing a universally best screen count, compulsory questionnaire length, or completion-time threshold for apps like this. The strongest applicable evidence favors relevant actions, understandable effort, contextual help, and user control. A long persuasive quiz would collect information Trundle cannot presently use.

This review covered published experiments and meta-analyses, first-party usability research, platform/accessibility guidance, and first-party product documentation. It is a broad practical literature review, not an exhaustive systematic review. Public information does not reveal competitors’ complete current onboarding variants, traffic allocation, or conversion data. No live competitor app was installed or tested as part of this research.

## What the evidence actually says

The following distinctions matter: experimental evidence within a product is stronger than an attractive competitor screen, but neither automatically transfers to Trundle. Behavioral theory helps formulate hypotheses; it cannot predict a retention lift here.

### 1. Promotional tutorial cards are not a dependable shortcut to understanding

NN/g tested 70 people using four relatively simple iPhone apps. Tutorial readers and skippers had comparable task success: 91% versus 94%, a nonsignificant difference. Readers perceived tasks as harder; task time did not significantly improve. This measures usability in those apps, not long-term retention or necessary permission setup. **Decision:** one welcome screen, then actual setup; no tour of tabs or ordinary buttons. [Kendrick, 2020](https://www.nngroup.com/articles/mobile-tutorials/).

An experiment spanning over 45,000 players and three games found that tutorial benefits depended on complexity. Tutorials helped the most complex game but did not significantly improve engagement in the two simpler games. Context-sensitive teaching helped in the complex case. **Decision:** teach Trundle’s unfamiliar morning rule with an optional, clearly labeled demonstration. Do not force practice of familiar controls. Games are an adjacent domain, not direct proof for this app. [Andersen et al., CHI 2012](https://grail.cs.washington.edu/wp-content/uploads/2015/08/andersen2012tio.pdf).

NN/g distinguishes setup/customization from instruction and promotion. Information that makes the initial experience useful may belong in onboarding; cosmetic customization usually can wait. **Decision:** ask for routine times and apps, not a theme, avatar, or preferred decorative style. [Mobile-App Onboarding, 2020](https://www.nngroup.com/articles/mobile-app-onboarding/).

### 2. Progress indicators orient people; conversion improvement is not guaranteed

A meta-analysis of 32 randomized web-survey experiments found no significant overall drop-off reduction from constant progress indicators. Effects varied with how progress was displayed. Surveys differ from app setup. **Decision:** show an honest step count and completed segments for orientation. Do not use fake head starts, a fabricated “80% complete,” or a loading animation pretending to prepare a personalized plan. [Villar, Callegaro, and Yang, 2013](https://research.google/pubs/where-am-i-a-meta-analysis-of-experiments-on-the-effects-of-progress-indicators-for-web-surveys/).

W3C’s multi-page-form guidance supports logical stages, visible progress, and access to previously completed steps. **Decision:** explicit Back actions, retained answers, accessible progress text, and review links. This is accessibility guidance, not a conversion experiment. [W3C WAI: Multi-page Forms](https://www.w3.org/WAI/tutorials/forms/multi-page/).

### 3. “Fewer choices always wins” is too simplistic

A 2010 meta-analysis of 50 experiments found an average choice-overload effect near zero with substantial variation. A later synthesis of 99 observations identified decision difficulty, option complexity, preference uncertainty, and decision goal as moderators. **Decision:** simplify the task, not arbitrarily limit people to three apps. Keep bedtime selection separate from the optional always-blocked list; label the difference clearly. These are consumer-choice findings, not proof of a particular app-picker layout. [Scheibehenne et al., 2010](https://doi.org/10.1086/651235); [Chernev et al., 2015](https://www.sciencedirect.com/science/article/pii/S1057740814000916).

### 4. Concrete planning is more useful here than asking for promises

Gollwitzer and Sheeran’s synthesis of 94 tests found a medium-to-large aggregate effect of implementation intentions on goal attainment. Those interventions connect a situation with a specific action; selecting a time in an app is not necessarily equivalent. **Decision:** help people construct an understandable daily sequence and repeat their actual selected times in the explanation and review. Do not claim that pressing Continue establishes a habit. A future optional “after I do X, I’ll walk” prompt is testable only if the app meaningfully uses it. [Gollwitzer and Sheeran, 2006](https://www.researchgate.net/publication/37367696_Implementation_Intentions_and_Goal_Achievement_A_Meta-Analysis_of_Effects_and_Processes).

The Fogg Behavior Model frames behavior around motivation, ability, and a prompt. **Inference:** make setup easy to carry out while the user already has an interest in trying Trundle, rather than trying to manufacture motivation through many questions. This is a design model, not comparative evidence for five slides. [BJ Fogg: Behavior Model](https://www.behaviormodel.org/).

### 5. Agency belongs in the interaction, not just the copy

Self-determination theory emphasizes autonomy, competence, and relatedness. **Inference:** editable choices, an understandable demonstration, and an affectionate companion are compatible with those principles. The theory does not establish that a rock mascot increases retention. Avoid guilt, punishment, forced pledges, streak-loss threats, or language treating a user’s phone use as a moral failure. [Ryan and Deci, 2000](https://selfdeterminationtheory.org/SDT/documents/2000_RyanDeci_SDT.pdf).

Duolingo reported a 3.3% increase in day-14 retention after separating its streak from its daily goal, making a single lesson sufficient to maintain the streak. **Inference:** an approachable starting task can matter more than maximizing initial commitment. It does not validate Trundle’s 200-step threshold, justify copying streaks, or establish onboarding length. [Duolingo: Improving the Streak, 2020](https://blog.duolingo.com/improving-the-streak/).

### 6. Permission timing is a trust and comprehension problem

Apple recommends requesting permission in the context of the feature that needs it. **Decision:** explain Screen Time at app selection and motion access at the morning step. Actual system requests must follow deliberate user action once those features exist. Permission grants must never be faked or inferred from onboarding completion. [Apple HIG: Privacy](https://developer.apple.com/design/human-interface-guidelines/privacy).

A 36-person Android field study found frequent mismatches between resource access and user expectations. At least 80% of participants wanted to deny at least one request. This is older Android research about contextual integrity, not a measured benefit of a particular iOS pre-permission screen. **Decision:** state purpose, scope, current availability, and what happens if access is declined. [Wijesekera et al., USENIX Security 2015](https://www.usenix.org/conference/usenixsecurity15/technical-sessions/presentation/wijesekera).

Android’s guidance also emphasizes requests in context and handling denial or revocation. **Decision:** future native integration needs explicit unavailable, not-requested, denied, granted, and revoked states; completing setup is a separate state. [Android: App permissions best practices](https://developer.android.com/training/permissions/usage-notes).

### 7. Ask only questions whose answers change the experience

GOV.UK’s question-page guidance asks designers to justify each question and label optional inputs. **Decision:** make each page one coherent task. Bedtime and morning are paired because they define the same interval; splitting them purely to increase “micro-commitments” is unjustified. Do not ask for age, occupation, addiction severity, or daily phone hours without a concrete product need. This is service-design guidance, not a consumer-app A/B result. [GOV.UK: Question pages](https://design-system.service.gov.uk/patterns/question-pages/).

Its review-page guidance recommends showing answers and making correction easy before submission. **Decision:** review real selections, provide specific accessible edit actions, and return directly to review after an edit. [GOV.UK: Check answers](https://design-system.service.gov.uk/patterns/check-answers/).

### 8. Optimize for the later result, not just getting through setup

Duolingo describes an experiment where a promotion increased subscription purchases but harmed retention, leading the team to stop it. **Decision:** completion and permission opt-in alone are insufficient success criteria. Later routine usefulness, control, and reliable enforcement matter. [Duolingo: Improving one experiment at a time](https://blog.duolingo.com/improving-duolingo-one-experiment-at-a-time/).

Intercom ran a 28-day split experiment removing in-product help links for half of new self-serve workspaces. Its report distinguishes observed help-use correlations from testing the help itself. **Inference:** keep explanations available where users encounter uncertainty, and test their effect; fewer help interactions do not necessarily mean better understanding. This is company-reported B2B evidence with limited transfer to Trundle. [Intercom: Proactive support experiment](https://www.intercom.com/blog/proactive-support-experiment/).

## Comparable products: useful patterns, not proof

| Product and first-party source | What was observed in the documentation | What Trundle takes from it |
| --- | --- | --- |
| [Freedom iOS setup](https://support.freedom.to/en/articles/4523633-how-to-install-freedom-for-iphone-or-ipad) | Screen Time setup, optional tools, and instructions for enabling tools after skipping onboarding. | Treat permission recovery as part of the product; keep a return path. Do not copy VPN or tracking requests that Trundle does not need. |
| [Opal: Screen Time permission](https://help.opalapp.com/article/why-do-i-need-to-grant-screen-time-permission) | Explains why blocking needs access and how that access can be changed. | Connect permission to app blocking in plain language. Avoid broad privacy claims beyond what Trundle actually implements. |
| [one sec 6.0 announcement](https://one-sec.app/blog/one-sec-6.0/) | The September 14, 2026 announcement identifies a former ten-step technical setup as a user and research-recruitment bottleneck. It reports simplifying setup, without a controlled conversion estimate. | Reducing technical setup burden can be more consequential than adding persuasive slides. Recheck current integrations instead of copying old competitor teardowns. |
| [one sec research, 2023](https://pubmed.ncbi.nlm.nih.gov/36795756/) | A six-week field study and separate preregistered experiment studied interventions at app opening. A coauthor created the product. | Useful evidence that intervention design deserves testing. These results do not validate onboarding, bedtime blocking, 200 steps, or a promise that Trundle will reduce use by the same amount. |

## Screen-by-screen specification and psychological rationale

### 1 of 5 — Welcome

**User’s question:** What is this, and why should I try it?

Show Trundle resting, the calmer-routine benefit, and the actual product exchange: selected apps rest at bedtime; a 200-step morning walk wakes him. State immediately that this build saves a setup but does not enforce blocks or count real steps. Keep the character in the flexible middle area and the primary action visible at the bottom.

Primary action: **Set up our routine**. Secondary: **Explore first**.

Rationale: establish an accurate mental model before asking for effort. The character introduces the relationship without requiring a pet name or a promise to care for him. No forced animation, signup, permission dialog, time-saved statistic, or health claim. Do not promise “one minute” until real usability sessions establish it.

### 2 of 5 — Schedule

**Question:** When shall we rest?

Ask for bedtime and morning start. Prepopulate from existing preferences, using the project’s 10 PM / 7 AM defaults only for a new routine. These are editable starting values, not recommended sleep advice. Show the interval and clarify that morning starts step eligibility, not an automatic unlock or alarm. Permit overnight and daytime intervals; reject equal endpoints and conflicts with existing naps without deleting those naps.

Primary action: **Choose bedtime apps**.

Rationale: the first task produces an actual plan with low typing effort. Both inputs belong together. This is useful customization, not an investment trap. Existing preferences survive replay and exploration.

### 3 of 5 — Apps

**Question:** What can wait until morning?

Show recognizable example apps with explicit selection state and count. Explain that the catalog is a preview, not a scan of installed apps. Allow an empty selection and explain that apps can be chosen later. Use Previous / More apps controls rather than a scrollable list. The “Always-blocked list & access” action opens optional access details and a separate paginated always-blocked editor. If an app is in both lists, show that the always-blocked rule takes priority.

Primary action: **Meet your morning**.

Rationale: connect the plan to the distractions the user chooses. No prechecked apps, “select all” pressure, or invented personalization. The optional list is additional depth, not another required page. In a native build, contextual Screen Time authorization and the system picker belong here; rejected authorization leaves exploration available.

### 4 of 5 — Morning

**User’s question:** What must I do, and what will happen?

Show the default 200-step target and the selected morning start. Offer a small optional demo of 0 → 84 → 200 steps with resting, stirring/walking, and awake character states. Labels repeatedly identify it as a demo; sample steps never enter saved progress or preferences. Continue does not require playing the demo.

The **How it works & walking alternatives** action explains that the intended count includes eligible steps before opening the app; bedtime takes priority, and always-blocked apps stay separate. Within this panel, **What if walking doesn’t work for me?** explains the present limitation without requesting disability or health information.

Primary action: **Review our routine**.

Rationale: make the unfamiliar condition understandable before saving. The demo can support perceived competence, but that is a hypothesis to evaluate. Do not ask users to walk during setup. Do not sell 200 as a scientifically validated target. The accessible alternative and emergency bypass remain unresolved product work; this preview cannot activate any restriction.

### 5 of 5 — Review

**User’s question:** Is this what I chose, and what happens if I continue?

Summarize actual bedtime, morning, bedtime apps, and always-blocked apps. Every editable row has a descriptive accessible action. Editing returns directly to review rather than making the user repeat the remaining flow. Explicitly distinguish the saved plan from active protection.

Primary action: **Save & explore the preview**.

Rationale: support recognition and correction. This is a final check of user choices, not a contractual pledge, fake celebration, or surprise paywall. Only after preferences save successfully is setup marked complete.

## Question protocol

| Candidate question | Include now? | Reason / actual use |
| --- | --- | --- |
| What time should bedtime begin? | Yes | Defines the scheduled rest interval. |
| When should morning steps start counting? | Yes | Defines the morning boundary. |
| Which apps should follow the routine? | Yes, empty allowed in preview | Saves the bedtime/nap list. |
| Any apps that should always be blocked? | Optional editor | Saves an independent list with explicit precedence. |
| Does walking work for you? | Offer help, not a compulsory answer | Explain the limitation; do not collect unused health information. |
| What should we call you? | Later, existing profile | Friendly but not necessary for the first useful setup. |
| Why are you here? Sleep, focus, or relationships? | Not yet | No functioning goal-specific routine or recommendations depend on it. |
| How many hours do you use your phone? | No | Self-estimates do not configure this loop; no baseline measurement is connected. |
| Age, gender, occupation, diagnoses? | No | No current functionality needs them. |
| Where did you hear about us? | Not in setup | Acquisition research should not obstruct initial value. |
| Will you commit / sign a pledge? | No | Adds pressure without configuring anything. |
| Allow notifications? | Later, if a reminder is requested | Notifications are not needed to explore the routine. |
| Rate us / subscribe / create an account? | No | No account requirement or approved monetization model in the game plan. |

If a future motivation question is proposed, specify the downstream behavior first, then test its benefit against the effort and data it adds. Merely inserting the answer into a heading is weak justification.

## Native permission and activation contract

This implementation requests **no new permissions**. There is no native service to connect honestly. Educational access text occupies the relevant place without inert “Enable” buttons or fabricated success states.

Future production sequence:

1. At app selection, explain the blocking purpose; request individual authorization through the native integration; use the actual system app picker after authorization.
2. At the morning step, check sensor availability and access state before asking for permission. Denial must preserve setup and show the available recovery action. Never trigger repeated prompts merely by rendering a screen.
3. Before claiming protection is active, verify selection, permission, schedule registration, and native enforcement independently. A saved boolean cannot prove any of those.
4. Treat steps since the chosen morning time, app restarts, background execution, timezone changes, and revoked access as separate integration tests. Do not promise immediate background unlocking from an on-screen demo.
5. Resolve non-walking access and emergency behavior before shipping enforcement. A bedtime bypass or completed walk must not clear the always-blocked list.

The implementation uses the installed Expo SDK 57 UI primitives via existing components. [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/), [Expo UI](https://docs.expo.dev/versions/v57.0.0/sdk/ui/), and its [DateTimePicker reference](https://docs.expo.dev/versions/v57.0.0/sdk/ui/drop-in-replacements/datetimepicker/) were checked before coding. Expo’s [pedometer documentation](https://docs.expo.dev/versions/latest/sdk/pedometer/) warns that updates are not delivered in the background; the exact versioned pedometer URL timed out during research, so the current documentation was used only to identify that limitation, not to implement a step service. Apple documents individual authorization in [Family Controls](https://developer.apple.com/documentation/familycontrols).

## What should count as success?

### Preview phase

Test whether a new person can configure and explain the loop. Completion is secondary to comprehension. No analytics SDK or tracking endpoint was added.

Suggested moderated sessions: start with 5–8 participants with varied technical familiarity and schedules, including people for whom walking is unsuitable. This is an exploratory research sample, not a representative estimate or an A/B test. Ask participants to think aloud, but let them use the interface before explaining it.

Tasks:

1. Create a routine with a chosen bedtime, morning, and two bedtime apps.
2. Put one app in the always-blocked list and explain what happens after morning steps.
3. Change a time from review, then save.
4. Explore first, change a setting in the app, close/reopen, and resume setup.
5. Find out whether real apps are currently blocked and whether the demo counts real steps.
6. Find the walking limitation and explain the available choices.

Ask neutral comprehension questions: “What happens at the morning time?”, “What if you haven’t finished the steps?”, “What is different about this app list?”, and “What changed on your phone after saving?” Avoid leading questions such as “Was that easy?” Record errors, hesitation, misunderstood promises, and whether recovery was discoverable.

### Native pilot

Define activation as the **first verified bedtime block followed by a verified next-morning recovery/unlock**, with independent always-blocked enforcement intact. Track app-opening retention separately: successful scheduled blocking may reduce app visits, so DAU alone is an especially poor outcome for this product.

Candidate metrics: setup started/completed/deferred; step abandonment; active completion time excluding background time; saved routine validity; permission outcomes; first native schedule registered; first verified bedtime block; morning target reached; unlock actually applied; permission revocation; emergency/accessibility recovery success; user-reported usefulness after several days. Keep permission approval separate from permission request and enforcement success.

If event collection is later introduced, define its purpose and privacy handling first. Do not attach app names, diagnoses, or routine times to an onboarding funnel just because they are available. Native events must come from native observations, not button taps.

### First experiments, in order

| Experiment | Hypothesis | Primary outcome and guardrails |
| --- | --- | --- |
| Five screens vs. four with welcome merged into schedule | One fewer transition may improve useful setup without sacrificing understanding. | Completed valid setup plus comprehension; guard against preview/activation confusion. |
| Optional morning demo vs. concise static illustration | Trying the state change may improve understanding of the step gate. | Correct explanation of unlock timing; setup time and accessibility as guardrails. |
| Schedule-first vs. app-first | Some users may understand the schedule better after choosing distractions. | Valid setup and first native routine success; permission abandonment. |
| Always-blocked editor in setup vs. deferred to Apps | Deferral may simplify initial setup without hiding an important distinction. | Comprehension and later discovery, not just clicks. |

Use a stable randomized assignment, one prespecified primary metric, a fixed analysis plan, and a meaningful minimum detectable effect. Estimate sample size from observed baseline data; do not invent a universal sample requirement. Keep return visits in their original group and distinguish new installs from existing users. Do not stop the moment a result turns favorable. At low traffic, prioritize observed usability problems over underpowered percentage comparisons.

## Implementation map

- `src/screens/onboarding/onboarding-flow.tsx`: flow order, review edits, validation, Android Back handling.
- One screen file per stage; local `components/` for the shell and example app choices.
- `src/state/onboarding-model.ts`: versioned records, serialized/coalesced draft persistence, resume reconciliation, completion ordering, and recovery.
- `src/state/onboarding.ts`: AsyncStorage/React adapter.
- `App.tsx`: load preferences and onboarding before choosing the first screen.
- Home and profile: resume a deferred setup. Development profile: replay without erasing saved preferences.
- Existing `src/state/preferences.ts` remains the source for the committed routine and both lists.

## Boundaries

This flow is an evidence-informed baseline, not a proven conversion winner. Native blocking, real steps, permission dialogs, background unlock reliability, accessibility alternatives, and emergency bypass are still pending. The app retains its existing light Moss & Stone theme and existing character behavior. A theme or navigation-system migration is outside this change.

## Verification completed

- `npm run typecheck`: passed.
- `npm run test:onboarding`: 15 passing tests covering loading, malformed records, concurrent/failed writes, retry, resume reconciliation, ordered completion, replay, and preservation of existing settings.
- Existing `node scripts/test-routine.cjs`: 18 schedule assertions passed.
- Browser walkthroughs of all five stages at **320 × 568, 375 × 667, 390 × 760, 390 × 844, and 768 × 1024** checked content fit, absence of scrolling, visible primary actions, completion, and reload persistence.
- Browser recovery checks exercised time edits, equal-time validation, optional always-blocked pagination, overlapping lists, morning details/alternatives, review edits, deferred setup, development replay, corrupted progress, and injected storage failures for both draft saving and the completion marker.
- Browser console: no runtime errors in these walkthroughs. Existing development warnings about shadow properties and pointer events remain.
- Screenshots and repeatable browser scripts are under `output/playwright/onboarding-*` and `output/playwright/check-onboarding*.cjs`. Run the latter through `playwright-cli run-code --filename`, in an isolated browser session: they intentionally replace that session’s Trundle test preferences.

**Not verified here:** physical iOS/Android rendering, VoiceOver/TalkBack, native sheets/time controls, large native Dynamic Type sizes, hardware Back behavior, or real native services. Browser sizes are layout checks, not a substitute for those device checks. No usability participants or conversion experiment were run; the research plan above remains future validation.

To revisit the flow in development, open **You → Replay onboarding**. This starts a fresh setup draft from the current saved routine without deleting preferences.
