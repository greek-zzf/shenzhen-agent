# Field verification

Draft SOPs only. `last_verified` stays `null` until a door photo or live window check. A remote fetch is not field verification.

**Foreign-passport live capture:** [volunteer kit](./field-verification-volunteer-kit.md) · [tick CSV](./field-research/volunteer-checklist.csv). Stock / XHS frames never set `last_verified`. Rights are **not** cleared.

## 2026-09-05 远程已补

Remote research batch of 2026-09-04 / 2026-09-05. Conflicts were expanded, not deleted. No winner was picked. Playbook YAML `version` is 2. `status` remains `draft`.

### Remote-settled vs still need a door photo

Who: **volunteer** = foreign-passport field kit. **stock** = public substitute already in `public/copilot-stock/` (rights **not** cleared; never sets `last_verified`).

| Topic | Remote batch (2026-09-04/05) | Still need live / door photo | Who |
|---|---|---|---|
| NIA 2026 online registration pilot | Official page: seven provinces from 2026-03-20. Guangdong is not listed. HiShenzhen stays as the local-path secondary. | Whether a Guangdong address is accepted on any live form the day you file. | Volunteer (kit §B) if a live form is opened. |
| NIA EN FAQ / Instructions | Ordinary passport + urgent need. No nationality roster published (fetched 2026-09-04). Fees follow State standards only — no 130 figure. | Same-day list at the window. Cash amount the clerk quotes. | Volunteer at the VOA window (kit §A). |
| Luohu VOA hours | ConflictCallout kept. Added sz.gov.cn 罗湖 6:00–24:00 *port-operation* framing (2025-06-30); archived 9:00–17:00 (2024-07-25); Reddit ~09:00 desk (2024-08); szpsq English phones only, no timetable (fetched 2026-09-04); Luohu +86 755 82324022. | Door photo of the visa-office board. Do not treat any of these as settled hours. | **Volunteer required** (kit §A). No hours-door stock. Do not use Chinese-passport 出入境 hall shots. |
| West Kowloon | China News 2025-11-05 + MTR 240h visa-free transit. No confirmed VOA desk. **240h transit ≠ 5-day SEZ VOA.** | Whether any VOA window exists at West Kowloon the day you go. | **Volunteer** if already there (kit §A). No stock. |
| ~130 RMB SEZ fee | Reddit 1ehxb25 / 1em2zn3 / 1eot29d (~130 SEZ). NIA English Instructions publish no figure. | Receipt / window quote. | Volunteer quote/receipt (kit §A). **Stock C1/C2** exist as expired-board substitutes (validity ended 2024-12-31) — not a tariff. |
| Tour Card vs foreign-card direct | Reddit 1dhkk9w (direct bind). chinaguidelines.com Tour Card wind-down (~2026-05 Alipay new open/activate stop). HiShenzhen kept. | In-app check: can you still open or activate Tour Card today? | **Volunteer required** (kit §D). **Stock P11/P12** = direct bind only, not Tour Card open/activate. |
| Airport English one-stop | Pingshan English page reachable 2026-09-04. | Desk open / what they will actually do. | Volunteer or any visitor at T3 / Shenzhen Bay — photograph the desk offer, not an SLA. |
| Metro Transport tab | Reddit 1htndt5 and 18xi3iv added. Alipay Transport path **not** deleted. | Gate that day. | **Volunteer required** (kit §C): 深圳 selected + live QR. **Stock P1–P3** are Beijing/Wuhan demos. |
| Tap-to-ride trial | gba.net.cn 2026-06-30 trial + official 2024 metro notice. | Whether that gate accepts tap-to-ride on your card. | Volunteer confirms own card. **Stock C6–C8** = news gate stills (not Alipay UI). |
| SIM halls | Longhua / Futian official English URLs fetched 2026-09-04T16:45:30Z. No street addresses invented. | Which window takes a foreign passport today. | **Volunteer** plaques only (kit §E). No stock. |
| HR / official materials | Remote check lists Registration Form of Temporary Residence; lease not listed (as of 2026-09-04). | What HR will accept. | Not a door photo. Live-fetch / employer — not the volunteer kit. |
| Xiaohongshu residence-window hours | 非法律/含 AI. Prerequisite lodging registration. **Not** Luohu port VOA hours. | Do not copy those hours onto PB-03. | Neither. Do not treat XHS 居留 hours as VOA. |
| 房屋码 success / fail toasts | XHS bilingual 境外人员临时住宿登记 form is a substitute form shot only (2026-09-07). | Exact toast text on a foreign WeChat + doorframe QR. | **Volunteer required** (kit §B). **Stock C3** = generic doorframe. Form ≠ toast. |

### New live checklist

Use the [volunteer kit](./field-verification-volunteer-kit.md) for capture rules. Tick rows in [`field-research/volunteer-checklist.csv`](./field-research/volunteer-checklist.csv).

- [ ] Call Luohu VOA phone **+86 755 82324022** and ask today's visa-office hours. Photograph the door board. **Volunteer** — not 出入境 hall stock.
- [ ] Tour Card in-app check: new open / activate still offered or stopped. **Volunteer** (stock P11/P12 is direct bind).
- [ ] Alipay 出行 → 乘车码 with **深圳** selected + QR at a named gate. **Volunteer** (stock P1–P3 is Wuhan/Beijing).
- [ ] 房屋码 scan UI + success/fail toasts on foreign WeChat. **Volunteer** (XHS form is not a toast).
- [ ] Tap-to-Ride at a real gate — does it work, or stay on Alipay Transport / cash token. Stock C6–C8 OK as gate art; volunteer still confirms the card.
- [ ] West Kowloon: confirm 240-hour visa-free transit vs 5-day SEZ VOA as two different things. Look for a VOA desk; do not assume one.
- [ ] Do not mix residence-permit window hours (Xiaohongshu / 居留) with port VOA hours.

Until those live checks land, every playbook stays `last_verified: null`.

## 2026-09-07 XHS ClickPath stock (substitute only)

Xiaohongshu bilingual 境外人员临时住宿登记 form is now in
`public/copilot-stock/clickpath/xhs-szga-foreigner-temp-registration-bilingual.jpg`
(wired onto pb-02 `wechat-click-path` n=4 as a **substitute only**). Alipay Guide
for Foreigners pages `xhs-alipay-foreigners-guide-0{1..5}.webp` are stocked but
not playbook-wired. Rights **NOT cleared.** `last_verified` stays null.

### Still empty / still required (do not invent)

| Gap | Status | Who |
| --- | --- | --- |
| Luohu VOA **door hours** photo | Still empty. Call +86 755 82324022; photograph the visa-office board. Do **not** treat Luohu PSB / 出入境 hall (Chinese passport) shots as 5-day SEZ VOA. | **Volunteer** kit §A. No stock. |
| 房屋码 **success / fail toasts** | Still empty. XHS bilingual form is not a toast. | **Volunteer** kit §B. Form / C3 doorframe are substitutes only. |
| Alipay 乘车码 **深圳** + gate QR | Stock P1–P3 are Beijing/Wuhan demos. | **Volunteer** kit §C. |
| Tour Card open/activate today | Stock P11/P12 are direct bind. | **Volunteer** kit §D. |
| SIM / bank **护照** plaques | Still empty. No staff faces. | **Volunteer** kit §E. |
| Rights clearance | Still **NOT cleared** for all XHS / community / news stock. Do not claim they are. | Maintainers — not a volunteer job. |
| Foreign volunteer (live field) | Briefing: [field-verification-volunteer-kit.md](./field-verification-volunteer-kit.md). Still required before any playbook leaves `draft` / before setting `last_verified`. | Volunteer captures; maintainers write `last_verified`. |
| Nationality lists / fee figures / hours | Do not invent. | Neither. |

