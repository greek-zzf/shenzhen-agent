# ClickPath candidates — 2026-09 (app UI stock)

Catalog of **public traveler-guide / Shenchuang** stills used as substitutes for
founder-shot ClickPath screenshots. Companion to
[`photo-candidates-2026-09.md`](./photo-candidates-2026-09.md) (door / gate /
fee-board stock from 2026-09-04).

**Status:** substitutes only. **Do not set `last_verified`.** Playbooks stay
`status: draft`. Rights are **not** cleared for commercial reuse.

Files live in [`public/copilot-stock/clickpath/`](../../public/copilot-stock/clickpath/).
Source URLs, CDN dates, and the “must not set last_verified” rule are in
[`public/copilot-stock/ATTRIBUTION.md`](../../public/copilot-stock/ATTRIBUTION.md).

Renderer: a non-null `click_path[].screenshot` still shows the step `note` as a
caption. Stock frames use **Stock photo — confirm at the window**. `screenshot:
null` still renders the missing-art placeholder.

Retrieved **2026-09-07**. Image CDN URLs may expire.

## Candidates

| ID | File | Playbook slot | Why it is a substitute | Do not |
| --- | --- | --- | --- | --- |
| P1 | `clickpath/alipay-metro-setup-guide-en.png` | **pb-05** `alipay-transport` n=1 | [StartChinaTravel metro guide](https://startchinatravel.com/china-metro-payment-guide/) 2026-01. Alipay home → Transport. | Treat the demo city (**Beijing**) as Shenzhen. Set `last_verified`. |
| P2 | `clickpath/alipay-metro-app-steps.png` | **pb-05** `alipay-transport` n=2 | Same article. Popular list includes **ShenZhen**. Get-now frame is **Transport-WuHan**. | Claim the obtain flow is a Shenzhen field shot. Ignore the Wuhan header. |
| P3 | `clickpath/alipay-metro-city-selection.png` | **pb-05** `alipay-transport` n=3 | Same article. Agree-and-obtain is **Wuhan Metro Code**. | Present Wuhan terms as Shenzhen chrome. |
| P4 | `clickpath/wechat-metro-steps-1-2-en.png` | Stored only (not wired) | Same article sibling. WeChat search 乘车码; activate demo is **Beijing**. | Wire onto pb-05 as the first hotspot. Playbook says skip metro mini-programs. |
| P5 | `clickpath/wechat-metro-activation-3-4-en.png` | Stored only (not wired) | Same article. Shenzhen subway activate + auto-deduction. | Replace Alipay Transport with WeChat mini-program. |
| P6 | `clickpath/wechat-metro-qr-checkin-en.png` | Stored only (not wired) | Same article sibling still **200**. Live QR; header **Shenz…**. | Screenshot a live ride QR as if it were reusable at the gate. |
| P7 | `clickpath/szpsb-wechat-follow-gov-services-2021.png` | **pb-02** `wechat-click-path` n=1 | [深窗 1601625](https://banshi.shenchuang.com/1601625.shtml) 2021-07-28. 关注 深圳公安 → 政务服务. [CDN](https://img1.shenchuang.com/2021/0728/ef0cd25ebca303951a429458e59de64f.png). | Treat 2021 chrome as today's menu. Call this a VOA port photo. |
| P8 | `clickpath/szpsb-wechat-exit-entry-menu-2021.png` | **pb-02** `wechat-click-path` n=2 | Same article. 出入境业务. [CDN](https://img1.shenchuang.com/2021/0728/fdcfb8dd8ff1d37139820bc87a5e1d08.png). | Treat 疫情防控 tiles as current. PSB hall ≠ VOA port. |
| P9 | `clickpath/szpsb-wechat-temp-stay-register-2021.png` | **pb-02** `wechat-click-path` n=3 | Same article. 境外人员临时住宿登记. Footer **Copyright 2021 深圳公安**. [CDN](https://img1.shenchuang.com/2021/0728/31f983dcc71b99a3b9b7f63b36067c44.png). | Hide the 2021 date. Invent a Luohu hours door. |
| P10 | `clickpath/szpsb-wechat-scan-house-qr-form-2021.png` | **pb-02** `wechat-click-path` n=4 | Same article. Start Declaring / Query landing — **not** the in-form 房屋码 scan. [CDN](https://img1.shenchuang.com/2021/0728/ae975e636b5fe2fbe77924ee09f9c9fa.png). | Call this the in-form scan. Call it a VOA window. |
| P11 | `clickpath/alipay-bind-realname-steps-2026.jpg` | **pb-01** `start-kyc` n=3 | [StartChinaTravel Alipay 2026](https://startchinatravel.com/how-to-use-alipay-in-china-2026/) numbered KYC. Similar 2026 bind-adjacent art. | Call this Tour Card. Claim chinafortravelers frames were recovered. |
| P12 | `clickpath/alipay-bind-foreign-card-steps-2026.jpg` | **pb-01** `bind-in-real-apps` n=1 | Same article. Me → Bank Cards → Add Bank Card. **Tour Card wind-down** — this is direct bind. | Treat as Tour Card open/activate. Set `last_verified`. |

House-code search / lookup stills from 2026-09-04 (`pb02-house-code-search-ui.jpg`,
`pb02-house-code-lookup-ui.jpg`) stay in `public/copilot-stock/` as PR #9 leftovers.
They are **no longer** on `wechat-click-path` — that slot now uses P7–P10.

## Wiring (2026-09-07)

Schema (`src/lib/playbooks/schema.ts`) allows `click_path.steps[]` of
`{ n, text_en, screenshot, note? }`. Multiple stills = multiple numbered steps.

| Playbook | What changed | What stayed empty |
| --- | --- | --- |
| pb-05 | `alipay-transport` n=1–3 → P1–P3. Notes say Beijing / ShenZhen-in-list / Wuhan obtain. `tap-to-ride-trial` and `cash-token` gate photos stay; their captions no longer say Alipay UI was missing. | `skip-miniprogram` (WeChat metro P4–P6 stored, not wired). Cash-machine close-ups n=1–2. `last_verified: null`. |
| pb-02 | `wechat-click-path` n=1–4 → P7–P10. Notes say 2021 Shenchuang may be stale; PSB hall ≠ VOA port. | i深圳 skip; Shekou window; HK re-register; in-form 房屋码 scan. `last_verified: null`. |
| pb-01 | `start-kyc` n=3 → P11. `bind-in-real-apps` n=1 → P12. Tour Card wind-down labeled. | WeChat bind n=2; helper-kiosk n=3; `metro-transport-tab` (same Alipay path lives in pb-05). `last_verified: null`. |
| pb-03 | Unchanged. | **hours-conflict** still has no hours-door photo. Do not invent one. |

## Gaps (do not invent)

- Luohu visa-office **hours door** — still not in this set.
- **chinafortravelers** 2026 numbered bind frames — origin Cloudflare 403 from this
  environment; no stable image URL recovered. Used StartChinaTravel 2026 numbered
  steps instead.
- WeChat **Bank cards** bind UI — not recovered.
- Founder-shot door / window / in-app photography — still required before any SOP
  can leave draft.
- Xiaohongshu research-box notes (no binaries):
  [`clickpath-xhs-2026-09.md`](./clickpath-xhs-2026-09.md).

## Honest labels

- Wuhan demo city on Alipay metro obtain. Confirm Shenzhen at the gate.
- 2021 Shenchuang 深圳公安 menus — label outdated risk.
- PSB hall / WeChat 政务服务 ≠ VOA port.
- Bind art is direct foreign-card bind under Tour Card wind-down — verify in-app.
