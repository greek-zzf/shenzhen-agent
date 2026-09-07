# Photo candidates — 2026-09 (temporary public stock)

Adapted catalog of **community / news** stills used as substitutes for founder
door photography in Shenzhen Copilot SOP visual slots.

**Status:** substitutes only. **Do not set `last_verified`.** Playbooks stay
`status: draft`. Rights are **not** cleared for commercial reuse.

Files live in [`public/copilot-stock/`](../../public/copilot-stock/). Attribution,
CDN dates, and the “must not set last_verified” rule are in
[`public/copilot-stock/ATTRIBUTION.md`](../../public/copilot-stock/ATTRIBUTION.md).

App-UI ClickPath frames recovered **2026-09-07** are catalogued separately in
[`clickpath-candidates-2026-09.md`](./clickpath-candidates-2026-09.md) (Alipay
Transport composites, 2021 深圳公安 menus, 2026 bind steps). This file is the
2026-09-04 door / gate / fee-board set.

Renderer: a non-null `click_path[].screenshot` still shows the step `note` as a
caption. Stock frames use **Stock photo — confirm at the window**. `screenshot:
null` still renders the missing-art placeholder.

## Candidates

| ID | File | Playbook slot | Why it is a substitute | Do not |
| --- | --- | --- | --- | --- |
| C1 | `pb03-voa-fee-board-sez-130.jpg` | **pb-03** `fee-user-report` click_path n=1 (primary) | Community photo of an SEZ 130 board from [r/shenzhen 1as71uf](https://www.reddit.com/r/shenzhen/comments/1as71uf/latest_visaonarrival_voa_prices) (~2024-02). Fills the fee / pay visual slot. | Treat as a tariff. Set `last_verified`. Claim the board is current (validity **ended 2024-12-31**). |
| C2 | `pb03-voa-fee-board-reciprocal-table.jpg` | **pb-03** `fee-user-report` click_path n=2 | Same post; reciprocal nationality table. Schema is one screenshot string per step, so C2 is a second numbered frame (also named in C1 `note`). | Invent a Luohu **hours-door** photo (none exists). Attach C1/C2 to `hours-conflict`. |
| C3 | `pb02-house-qr-doorframe.jpg` | **pb-02** `scan-house-code` click_path n=1 | 本地宝 doorframe 房屋码 / grid QR ([门上二维码](https://sz.bendibao.com/qinzi/2023413/918148.shtm); CDN 2022-09-20). | Claim this sticker matches the user's building. |
| C4 | `pb02-house-code-search-ui.jpg` | **pb-02** `wechat-click-path` n=1 (optional UI) | 本地宝 search UI, 2025-04-11 ([办事易 621065](http://bsy.sz.bendibao.com/bsyDetail/621065.html)). | Treat as today's 深圳公安 chrome. |
| C5 | `pb02-house-code-lookup-ui.jpg` | **pb-02** `wechat-click-path` n=2 (optional UI) | Same 2025-04-11 本地宝 lookup / 楼栋结构 UI. | Skip the scan-the-door rule because a UI shot exists. |
| C6 | `pb05-tap-to-ride-floor-gate.jpg` | **pb-05** `tap-to-ride-trial` n=1 and `cash-token` (gate backup) n=3 | [深圳新闻网 2026-06-30](https://www.sznews.com/news/content/2026-06/30/content_32107475.htm) floor marking at a Tap-to-Ride gate. | Replace the Alipay Transport click-path with Tap-to-Ride only. |
| C7 | `pb05-tap-to-ride-card-reader.jpg` | **pb-05** `tap-to-ride-trial` n=2 and `cash-token` n=4 | Same article; ordinary-gate card reader. | Fill Alipay Transport `screenshot` fields (no public Alipay UI recovered — those stay `null`). |
| C8 | `pb05-business-coach-tap-reader.jpg` | **pb-05** `tap-to-ride-trial` n=3 and `cash-token` n=5 **secondary** | Same article; Line 11 business-coach validator. Labeled secondary — **not** an ordinary gate. | Present as the everyday metro gate. |

## Wiring (2026-09-04)

Schema (`src/lib/playbooks/schema.ts`) allows `click_path.steps[]` of
`{ n, text_en, screenshot, note? }`. There is no `reference_photos` /
`artifacts` array. Multiple stills = multiple numbered steps.

| Playbook | What changed | What stayed empty |
| --- | --- | --- |
| pb-03 | `fee-user-report` (`slot: conflict` → `c-fee-130`) carries a `click_path` so C1+C2 render beside the NIA vs field-report sources. Step `why` + each `note` say community/news stock, not founder-verified, board may be expired. Renderer shows `click_path` whenever it is non-null. | `nia-list` official-page frames; **hours-conflict** (no hours-door photo); West Kowloon. `last_verified: null`. |
| pb-02 | `scan-house-code` n=1 → C3. WeChat path n=1/n=2 → optional C4/C5 UI notes. n=3 (scan in-form) stays missing art. | i深圳 skip path; Shekou window; HK re-register. `last_verified: null`. |
| pb-05 | `tap-to-ride-trial` conflict + gate-backup `cash-token` carry C6+C7; C8 is a labeled secondary frame. | **Alipay Transport** click_path screenshots remain `null`. Mini-program skip frames remain `null`. `last_verified: null`. |

## Gaps (do not invent)

- Luohu visa-office **hours door** — not in this set.
- Alipay app **Transport / 出行 / 乘车码** UI — not recovered.
- Cash ticket **machine** close-up — not in this set (`cash-token` n=1–2 stay missing art).
- Founder-shot door / window photography — still required before any SOP can leave draft.

## Fee-board date box

- Source: r/shenzhen **1as71uf**, ~2024-02.
- Board text (as posted) validity **ended 2024-12-31**.
- Using C1/C2 must **not** set `last_verified`.
