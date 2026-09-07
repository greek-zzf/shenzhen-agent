# Field-verification volunteer kit

One-page briefing for a **foreign-passport** volunteer. A Chinese-ID founder cannot finish these launch blockers: the wrong hall, the wrong WeChat identity, and the wrong Alipay KYC all produce the wrong photos.

This is **not** a city guide. Shenzhen Copilot ships **execution playbooks** (window / app / gate). Transcribe what you see. Do not invent hours or fees. Editors — not volunteers — write SOP YAML. **Never set `last_verified`** unless the packet has a photo **and** a date **and** a location. Stock / Xiaohongshu frames already in the repo are substitutes only; rights are **not** cleared.

Tick sheet: [`field-research/volunteer-checklist.csv`](./field-research/volunteer-checklist.csv).

## What to capture

### A) Luohu Port / SEZ 5-day VOA — `pb-03`

You want **口岸签证 / 签证办公室** (port visa / visa office), not the Chinese-passport **出入境** hall, and not West Kowloon **240小时过境免签**. Those three look similar in photos and are different procedures.

| Photo | Notes to write |
| --- | --- |
| Door **办公时间** board on the visa office (not port-operation copy) | Transcribe every line. Do not round. Call **+86 755 82324022** and write what they said today. |
| 取号 / ticket booth / 售票 | Languages on the screen or plaque. Cash vs card if posted. **Do not invent a fee.** If a clerk quotes an amount, write “clerk said …”, date, and whether you have a receipt photo. |
| Form in the hand / on the desk | 中文 / English / bilingual? Field names only — no filled passport numbers. |
| Queue signs | 口岸签证 vs 中国护照 vs 港澳证件. Arrow text as posted. |

**Reject:** 罗湖出入境大厅 shots for Chinese ID / 逗留签. **West Kowloon** (only if you are already there): look for a VOA window; photograph 240h-transit signs if present; write “no VOA desk seen” if none. Do not assume one exists.

### B) 房屋码 — `pb-02`

Path volunteers will see: 微信 **深圳公安** → **政务服务** → **出入境业务** → **境外人员临时住宿登记**. Scan the door **房屋码**. Do not type a street address.

| Photo | Notes to write |
| --- | --- |
| Scan UI (camera / 扫一扫 over the grid QR) | App version if shown. Foreign WeChat if you have one. |
| **Success toast** and **failure toast** | Exact Chinese (and English if bilingual). Stock bilingual form ≠ a toast. |
| Landlord QR on the doorframe | District + building type (hotel / apartment / friend). Ask before shooting a private door. |

Do **not** file a fake 住宿登记. Hotel stay: ask the desk if they already registered you; photograph only with permission; do not submit a second false record. Real apartment stay: a real registration is fine.

### C) Transport 乘车码 — `pb-05` / `pb-01`

Alipay app (not a metro mini-program): **出行 / Transport** → **乘车码**. WeChat 乘车码 only as a second path.

| Photo | Notes to write |
| --- | --- |
| City = **深圳 / Shenzhen** (header + picker) | Stock in-repo is **武汉 / Beijing** demo. A Wuhan obtain screen is a miss. |
| Live QR at a named Shenzhen gate | Station + line + gate type. Grey / error code if it fails. Cash-token machine only if the QR fails. |

### D) Foreign-card Alipay bind / Tour Card — `pb-01`

Two different products. Do not pick a winner.

| Photo | Notes to write |
| --- | --- |
| Search **Tour Card / 旅游卡** | New **开通 / 激活** still offered, grey, or gone? |
| Direct bind: **我的 → 银行卡 → 添加银行卡** | Success, SMS fail, or risk-control code. Card country optional. |

### E) SIM / bank plaques — `pb-04` / `pb-06`

Public **外国人 / 护照 / 外籍** window plaques only. Hall name as posted. **No invented street numbers.** No staff faces. No covert recording.

## Safety / legal

- No VPN teaching (product already says VPN-off only).
- No fake registration, no fake 居住证明, no 挂靠, no bribes, no yellow-cow SIM.
- No secret filming in 边检 / inspection channels or other restricted zones. Public hall boards and your own phone UI are the job.
- Ask hotel or staff before photographing doors, desks, or forms.
- Crop other people’s documents and faces.

## Upload / handoff

Filename (Asia/Shanghai calendar date):

```
YYYY-MM-DD_<site>_<gap>_<nn>.jpg
```

Examples: `2026-09-10_luohu-voa_hours-board_01.jpg` · `2026-09-10_futian-apt_house-qr-fail-toast_01.png`

One folder per outing. Fill the CSV row or a `HANDOFF.md`:

| Field | Example |
| --- | --- |
| Date | `2026-09-10` (Asia/Shanghai) |
| Location | `罗湖口岸签证办公室` door, not “Luohu mall” |
| Passport nationality | optional |
| Conflicts observed | board vs phone vs a guide, quoted — no winner |

Send originals (no heavy filters). Volunteer captures; maintainers review before any `last_verified` write.
