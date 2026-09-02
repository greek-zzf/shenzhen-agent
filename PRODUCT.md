# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users (confirmed): people landing in Shenzhen **this week**, and **movers in their first 14 days**.

- **Visitor / VOA / HK day-tripper.** Trigger: in Hong Kong, on a plane, or already at Luohu / Futian / Shenzhen Bay, often discovering Visa or Apple Pay will not pay the metro. Success: pay for metro and lunch within five days, take the right port for a 5-day VOA, show the clerk a Chinese sentence instead of explaining the passport in English.
- **New hire arriving on Z / a work permit.** Trigger: offer signed, arrival ±14 days. HR has sent a Chinese document list. Success: temporary accommodation registration within 24 hours if not in a hotel; a mainland number; at least one working payment path; an HR one-pager that a hotel or police registration slip is enough — a six-month lease is not required to proceed.

Tourists are the top of the acquisition funnel. Long-term residents are later retention, not the v1 design audience. Trailing families, students as a primary segment, Bao'an / Longgang factory communities, and “already here two years, looking for friends” are out of v1.

## Product Purpose

Shenzhen Copilot is an English-first **web errand agent** for foreigners who are coming to, just arriving in, or already in Shenzhen. A short intake diagnoses what is stuck. The deliverable is a **live playbook** the user can execute at the window or in an app: checklist, official citations, Chinese speech for the clerk, and numbered screenshot click-paths.

It exists because the failure is not “China is digital.” The failure is **this passport + this visa + this district today + this screen of this app — what do I tap next.** Missed 24-hour registration, a closed VOA window, or a metro gate that will not take a foreign card are hard deadlines, not a weak reading experience.

Success is a playbook finished at a real counter, gate, or app **without posting “how do I” on r/shenzhen.** The qualitative test: “this was the swimming-pool post, but for my case.” Registration counts, chat turns, and Reddit mentions are not the goal.

## Positioning

The missing product is the **execution layer** between Chinese civic/life systems and a foreign-passport holder. Neighboring things cannot honestly copy that job:

- HeyShenzhen / HiShenzhen are landing guides. Articles expire. They explain; they do not fork on this passport at this port this afternoon.
- i深圳 is the municipal super-app, Simplified Chinese only. Foreign passports often cannot face-login. An English shell does not fix the identity model.
- r/shenzhen is English Q&A with no wiki, no structured SOP, and a ban on advertising services/websites/blogs.
- FESCO / CIIC and similar are employer-paid work-permit ops. The individual cannot file around the employer. Copilot produces personal checklists and an HR one-pager; it does not submit.

Not a city magazine, not Internations, not a WeChat clone, not a blank ChatGPT about Shenzhen, not Wellcee, not Trip.com ticketing, not iFutian.

## Operating Context

Used on a phone, often one-handed, in a queue, at a gate, in a Hong Kong hotel, or on a plane — frequently **without a mainland number, WeChat Pay, or international roaming**. Screenshot click-paths and speech cards must remain usable offline once opened.

Intake is a short diagnosis that writes a structured profile (passport country, visa or explicit unknown, what is broken). After a playbook attaches, the user ticks steps; they do not keep chatting. `I'm stuck` opens a coded failure tree, not a new conversation.

Chrome is English. Chinese is generated for the clerk, the form, and the HR letter. Email or Google sign-in; a mainland mobile number is not required to start.

v1 is **Shenzhen-only**. Other cities route to an unsupported-city screen. There is no city switcher.

## Capabilities and Constraints

**v1 playbooks in (YAML SOPs, currently `status: draft`, `last_verified: null`):**

- PB-01 payments matrix and troubleshooting
- PB-02 24-hour temporary accommodation registration (including re-entry from Hong Kong)
- PB-03 5-day VOA, Luohu vs West Kowloon
- PB-04 SIM / eSIM branch routing
- PB-05 metro / Alipay Transport QR
- PB-10 HR myth-buster one-pager (registration slip vs six-month lease)

**v1 does not:** housing marketplace, hospital booking RPA, social/events, Huaqiangbei, schools, IIT subsidy calculator, driver's license, housing fund, 12306 ticketing, bank-account opening as a walkthrough, WeChat/Alipay/i深圳 login or RPA, computer-use, Chinese UI, App Store, community feed, credits, or live border queues.

**Engine rules already in the SOP schema:** an LLM must not rewrite, reorder, or invent steps. Official vs field conflicts display side by side with resolution `verify_at_window` — the model does not pick a winner. Reddit and English guides are labeled non-legal. Passport face-login failure is a first-class warning plus a window bypass, not a claim that Copilot “connected i深圳.”

**Auth and PII:** email / Google. Three intake fields are enough to start; document upload is optional and not the door. Prefill extracts fields only when the user asks. Docs-wallet encryption (on-device vs server) is **undecided** — do not imply end-to-end encryption in the UI.

**Legal / ops red lines (from the product spec; do not implement as features):** no VPN teaching or selling; no fake address or ghost-written police registration; no submitting immigration or police forms on the user's behalf; no yellow-cow SIMs; no proxy bank accounts; no medical diagnosis or prescriptions; no “100% work-permit approval”; no advertising on r/shenzhen.

**Monetization:** undecided. The spec's working hypothesis is that P0 playbooks that can strand someone (payments, VOA, registration, rabies routing) stay ungated; paid work, if any, would be later packs for movers. No price is committed.

**Interview lock:** the only constraint explicitly marked inviolable in init is English chrome / Chinese for the real world (see Brand Commitments). Other spec rules above remain current product record unless later revoked.

## Brand Commitments

- **Name:** Shenzhen Copilot (confirmed). Wordmark in copilot chrome; do not fall back to the ShipAny template name on copilot surfaces.
- **Language (confirmed):** UI chrome, navigation, errors, and step titles stay English. Chinese appears only on speech cards, copyable place names, and contract/form/HR prefill.
- **Voice (from spec):** calm, executable, short. Never mock the newcomer. Do not use “this has been asked,” “you will struggle,” or “just use WeChat like everyone else.”
- **Disclaimer (every playbook):** “This is a procedure guide, not legal, medical, or immigration advice. Rules change. Confirm at the counter.”

No logo, color, or type system is committed here. `public/logo.png` and default `VITE_APP_NAME` still reflect the ShipAny template and are not brand assets for this product.

## Evidence on Hand

- Product spec: `docs/shenzhen-copilot-product-docs/shenzhen-copilot-spec.md` (2026-09-02). IA: `docs/shenzhen-copilot-product-docs/shenzhen-copilot-v1-ia.md`. Page-design notes in that folder are not this file and are not a visual system of record.
- Playbook YAML: `src/content/sops/pb-01-payments.yaml`, `pb-02-accommodation.yaml`, `pb-03-voa.yaml`, `pb-04-sim.yaml`, `pb-05-metro.yaml`, `pb-10-hr-letter.yaml`. Schema: `src/content/sops/schema.yaml`. All six are drafts; **no SOP is field-verified**.
- North-star format (information slots, not content to clone): [Want to swim at Bao'an Stadium but don't speak Chinese?](https://www.reddit.com/r/shenzhen/comments/1srgutv/want_to_swim_at_baoan_stadium_but_dont_speak/).
- Official and guide URLs live on each YAML playbook. Reddit links are user reports, labeled non-legal.
- Spec-cited research files (`r-shenzhen-research.md`, `shenzhen-expat-landscape.md`) are **not in this repo**. Do not invent subscriber counts, testimonials, field-verified hours, branch addresses, or “live” wait times. Missing click-path screenshots must show as missing art, not prose.

## Product Principles

1. **Design for this week's arrival, not the settled city.** If a surface helps someone browse Shenzhen, it is the wrong surface.
2. **The playbook is the product.** Chat only fills the file. After attach, the user executes steps at the window.
3. **English in the chrome, Chinese in the world.** The clerk, the form, and the landlord see Chinese; the user never has to operate a Chinese nav to get there.
4. **Unknown beats a fake certain.** Conflicting hours, fees, and “Alipay is easier” claims sit side by side. Confirm at the counter.
5. **Do not become the forum you are replacing.** No mocking repeat questions, no r/shenzhen growth posts, no paywall on a legal or medical clock.

## Accessibility & Inclusion

No WCAG target was set. Product-specific needs from the window-use situation:

- Speech-card “show clerk” mode: large high-contrast Hanzi, screenshot-friendly, usable without a network.
- Primary action in the mobile thumb zone; click-path numbers printed on the image, not hover-only.
- Do not require a mainland phone number, WeChat, or an APK to start.
- v1 serves English-speaking passport visitors and movers; it does not pretend to cover other languages or communities weakly visible in the English Reddit sample.
