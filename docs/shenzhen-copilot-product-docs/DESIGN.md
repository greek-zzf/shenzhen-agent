# Shenzhen Copilot — 页面设计说明（v1）

给在本地做视觉 / 页面设计用。产品决策以 `shenzhen-copilot-spec.md` 为准，屏和路由以 `shenzhen-copilot-v1-ia.md` 为准。本文只抽设计需要的部分。

**产品一句话：** 英文 Web 办事代理。对话只诊断，交付是带到窗口的 live playbook（清单、官方链接、中文话术、App 第几屏点哪）。

**不是：** 城市杂志、AI 聊天大圆球、Internations、i深圳英文壳、空白 ChatGPT。

---

## 气质

窗口前能亮给柜员看的卡片。高对比、字大、冷静、可执行。不要旅游站大图，不要渐变英雄区，不要活动 feed。

- UI 铬（导航、按钮、标签）英文
- 中文只出现在 SpeechCard、可复制的地点名、合同/表单预填
- 永不嘲讽新手（板上已经有人嘲过）
- `last_verified` / Draft SOP 黄标每条 playbook 都要能看见
- 护照验证失败是一等公民：依赖小程序的步骤前先出警告，再给窗口替代路径

---

## 路由（设计要覆盖的屏）

公开：

| 路径 | 屏 |
|---|---|
| `/` | 薄转化首页 |
| `/p/voa-hours` | VOA 只读 SOP |
| `/p/alipay-metro` | 地铁码只读 SOP |
| `/p/accommodation-registration` | 住宿登记只读 SOP |
| `/login` | 已有 ShipAny 登录，Copilot 不要再造一套 |
| `/disclaimer` | 短免责 |

登录后：

| 路径 | 屏 |
|---|---|
| `/intake` | 短对话 + 可见档案芯片 |
| `/library` | 生命周期分组（72h / 第一周 / Later 灰卡） |
| `/run/:id` | **主屏** playbook 运行 |
| `/run/pb-10/hr-letter` | HR 一页纸预览 |
| `/me` | 档案 + 证件夹，不是社交主页 |
| `/unsupported-city` | 写了广州等 |

移动底栏三项：Home / Library / Me。不要 Chat tab、不要积分。

---

## 首页 `/`

一屏说完：你是办事代理、你卡在哪、用护照开跑。

```
┌──────────────────────────────────────┐
│  Shenzhen Copilot          Log in    │
├──────────────────────────────────────┤
│                                      │
│  English playbooks for the window,   │
│  not another Shenzhen guidebook.     │
│                                      │
│  ┌────────┐ ┌────────┐ ┌─────────┐  │
│  │ Can't  │ │ 5-day  │ │ 24h     │  │
│  │ pay    │ │ VOA    │ │ register│  │
│  └────────┘ └────────┘ └─────────┘  │
│                                      │
│      [ Start with my passport ]      │
│                                      │
│  Confirm at the counter.             │
└──────────────────────────────────────┘
```

芯片进 `/p/*`。主按钮进登录再 `/intake`。没有文章流。

---

## 运行页 `/run/:id`（北星）

对照宝安游泳馆 Reddit 帖的信息槽：

| 帖子槽 | 组件 |
|---|---|
| Getting there | POI + 地铁出口 + 复制中文名 |
| What to bring | 材料勾选 |
| Skip 小程序 | PassportFailWarning（警告条，不是 tooltip） |
| 窗口句子 | SpeechCard：汉字 + 拼音 + 英语；Copy；Show clerk 全屏 |
| 自助机点击 | ClickPath 编号；截图可空，显示 missing art |
| 易漏步骤 | 必勾 checkbox，不勾不能完成 |

主 CTA 同时只有一个实心按钮。次按钮永远有 I'm stuck（打开失败树，不是再聊一轮）。

**Show clerk 全屏：** 去掉底栏和链接，柜员只应看见大号汉字（≥32px），可截图离线用。

公开 `/p/*` 用同一套组件，但不按护照分叉；个人分叉要登录。

---

## Intake

不是长表，也不是无限聊。桌面：左对话 / 右档案卡。移动：芯片托盘始终可见。三字段就能开跑（护照、坏了什么、签证或 unknown）。区可以 I don't know。

空状态第一句：

> Tell me which passport and what is stuck. I'll attach a playbook — this is not a chat with a travel writer.

挂上 playbook 后不要继续聊天，去运行页。

---

## 文案语气（英文铬）

Calm, executable. 禁止：this has been asked / you will struggle / just use WeChat like everyone else.

免责（每条 playbook 顶上，短）：

> This is a procedure guide, not legal, medical, or immigration advice. Rules change. Confirm at the counter.

冲突小时：并排两源，不要合成一句假确定。

---

## 不要画进 v1

社区 feed、积分、微信登录、中文导航、实时口岸排队、大地图、语言切换、城市切换、华强北、活动日历。不要把首页画成 ShipAny 默认着陆页。

---

## 现有实现

代码在 `src/routes/(copilot)/`、`src/routes/p/`、`src/components/copilot/`。设计可以改视觉，不要改路由名和槽的数据结构。
