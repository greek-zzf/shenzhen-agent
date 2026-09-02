# Shenzhen Copilot 产品规格

**工作名：** Shenzhen Copilot  
**形态：** 英文优先的 Web Agent（办事 copilot）  
**日期：** 2026-09-02  
**读者：** 将动手做产品和内容的创始人（中文）  
**证据基线：** `/workspace/r-shenzhen-research.md`（r/shenzhen 抓取 2026-09-02 02:09 CST）、`/workspace/shenzhen-expat-landscape.md`（格局检索截至 2026-09-02）。本文不发明统计、公司名、帖名或 URL；抓取未核验处标 **未知**；推断标 **假设**。

---

## 0. One-liner + thesis

**一句话：** Shenzhen Copilot 是给「正在来 / 刚到 / 已在深圳的外国人」用的英文 Web 办事代理——先用对话诊断你卡在哪，再给你一份可现场执行的 live playbook（清单 + 官方引用 + 窗口中文话术 + App 截图点击路径）。

它不是生活方式杂志，不是 Internations，不是微信克隆，也不是一个空白 ChatGPT 框。它是中文政务/生活系统与护照用户之间缺失的 **execution layer**。

为什么现在做、相对现有东西差在哪：

- **HeyShenzhen / HiShenzhen** 是 2026 落地指南（住宿登记、银行、租房、支付 walkthrough），文章会过期。r/shenzhen VOA 帖原话：「I did a lot of googling… the information on the Internet was all over the place. Some information was flat out wrong and out of date.」来源：[1ptwzwe](https://www.reddit.com/r/shenzhen/comments/1ptwzwe/shenzhen_5day_visa_on_arrival_tips_and_tricks/)。指南解决「读懂」，不解决「我这个护照、这个口岸、今天下午窗口还开不开」。
- **i深圳** 是市政府超级 App，卖家深圳市电子政务资源中心，**语言仅简体中文**，8000+ 项服务。公积金官方答：持外国人永久居留身份证可用 i深圳/支付宝市民中心刷脸；**持外国护照不能刷脸**。来源：[住建局 FAQ](https://zjj.sz.gov.cn/hdjl/ywzs/gjj/content/post_12654878.html)、[App Store](https://apps.apple.com/us/app/i%E6%B7%B1%E5%9C%B3-%E6%B7%B1%E5%9C%B3%E5%B8%82%E7%BB%9F%E4%B8%80%E6%94%BF%E5%8A%A1%E6%9C%8D%E5%8A%A1app/id1363830499)。给护照用户做英文壳过不了登录身份模型。r/shenzhen 游泳馆帖直接写：跳过 i深圳/小程序，「nightmare to verify with a foreign passport」。来源：[1srgutv](https://www.reddit.com/r/shenzhen/comments/1srgutv/want_to_swim_at_baoan_stadium_but_dont_speak/)。
- **Reddit（r/shenzhen，32,680 订阅，2026-09-01 18:09 UTC `about.json`）** 是英语匿名问答。Wiki 关闭、无 flair、无结构化版规、侧边栏明确 **No advertisements services, websites, or blogs**。高票指南写得出场景表，但不能自我更新、不能按护照分流、不能过窗口。版规把招聘赶到 r/chinajobs，本板几乎看不到正规招工，但签证/被裁仍会出现。
- **FESCO / CIIC / Hongda / STAN-VISA 等** 是雇主买单的工签操作系统。官方入口是用人单位系统：国家 [fwp.safea.gov.cn](https://fwp.safea.gov.cn/lhgzweb/)、深圳 [wgfw.ga.sz.gov.cn](https://wgfw.ga.sz.gov.cn/user/wgrfwpt)。个人几乎无法绕过雇主。HeyShenzhen 写商业全包工签+居留大约 ¥8,000–20,000（不含规费），并警告「100% 批准」是红旗。Copilot 做个人侧清单和 HR 打脸材料，**不代提交**。

格局简报的一句话仍然成立：官方已经堆了中心 + 手册 + iFutian + 并联许可平台 + 口岸一站式；商业中介覆盖肯付钱的人；微信群覆盖有朋友的人。**没被产品化的是：护照用户在中文政务/生活系统里的逐步执行。**

北星形态不是一篇 README，而是宝安体育中心游泳馆那帖：逐步、带图、带付款方式、带窗口中文句子、明确写「跳过护照验证地狱的 App」。来源：[1srgutv](https://www.reddit.com/r/shenzhen/comments/1srgutv/want_to_swim_at_baoan_stadium_but_dont_speak/)。把这个格式做成引擎，覆盖支付、VOA、住宿登记、SIM、地铁码，而不是再写一次游泳。

---

## 1. Problem

外国人在深圳办事，卡的不是「中国有多数字」这篇作文，而是 **我的护照 + 我的签证类型 + 我今天所在的区 + 这个 App 的这一屏，下一步点哪**。失败代价是硬截止日期（24 小时住宿登记、T 签到期、狂犬疫苗针次），不是「体验不佳」。

### 1.1 Jobs-to-be-done（来自 Reddit 证据，不是头脑风暴）

下列频率是 **本次抓取**（listing 去重 225 帖 + 主题搜索每年最多 25 条触顶 + 66 个评论树），**不是全站普查**。search `limit=25` 触顶只说明「至少 25」。

| # | JTBD | 体量（本次） | 紧急度 | 证据 |
|---|---|---|---|---|
| 1 | 落地当天能付钱（地铁/出租/小店/医院/景点小程序） | listing 词典 20/225；search year 触顶 25；高票指南 97 分 | **最高之一** | [1t9yeli](https://www.reddit.com/r/shenzhen/comments/1t9yeli/i_live_in_shenzhen_heres_what_actually_works_for/)：「The #1 thing that trips them up isn't the language barrier or the food — it's payments.」 |
| 2 | 从香港走对口岸拿 5 日 VOA | listing 签证 11/225（词典低估）；search 触顶 25 | 高（当天窗口） | [1ptwzwe](https://www.reddit.com/r/shenzhen/comments/1ptwzwe/shenzhen_5day_visa_on_arrival_tips_and_tricks/)：西九龙去程不行；罗湖办公室自称 6:30–24:00、130 RMB；网上仍说 17:00 关门 |
| 3 | 入境 24h 内办临时住宿登记；去香港再回来要重办 | 住房/官僚交叉；指南共识第一周第一步 | **法律硬约束** | 格局 §2.3：《出境入境管理法》第 39 条；酒店自动登记，公寓/朋友家必须自己登记 |
| 4 | 外卡能买东西，但地铁小程序失败 | 支付交叉 | 高（落地第一程） | [1vpsd0z](https://www.reddit.com/r/shenzhen/comments/1vpsd0z/buying_metro_tickets_using_wechatalipay_with_data/)：评论「Just click transport on the actual Alipay app」 |
| 5 | 选得到吃护照的 SIM 营业厅；eSIM 不够绑美团 | search SIM 13 | 高（钥匙，不是商品） | [1rl20xy](https://www.reddit.com/r/shenzhen/comments/1rl20xy/sim_card/)：「not every branch can handle foreigner service」；[1tf6pfg](https://www.reddit.com/r/shenzhen/comments/1tf6pfg/best_local_number_esim_option/)：美号过不了美团 |
| 6 | 工作/居留材料对齐；打脸错误 HR（住宿登记单 vs 6 个月租约） | 签证搜索触顶；单帖评论最高之一 92 | 高（许可进度） | [1upmequ](https://www.reddit.com/r/shenzhen/comments/1upmequ/serviced_apartment_recommendations_please/) |
| 7 | 被裁/许可取消后下一步（城市×雇主不一致） | 低频 | **极高** | [1q07ak8](https://www.reddit.com/r/shenzhen/comments/1q07ak8/got_screwed_over_by_my_previous_employer_and_im/) |
| 8 | T 签到期前完成民政/认证 | 低频 | **截止日期硬** | [1vwzozf](https://www.reddit.com/r/shenzhen/comments/1vwzozf/urgent_t_stay_permit_expires_29_aug_ghana/) |
| 9 | 看懂 58/安居客 → 签约；避开假房 | listing 17；search 触顶 25 | 中高 | [1tbtcze](https://www.reddit.com/r/shenzhen/comments/1tbtcze/moving_to_shenzhen_in_august_how_does_apartment/)：6 条评论几乎没回答清单；[1ui6rik](https://www.reddit.com/r/shenzhen/comments/1ui6rik/rent_enquiry_apartment/) 重复提问被嘲 |
| 10 | 被抓伤/生病：去哪家医院、怎么挂号、垫付还是直付 | listing 6；search 触顶 25 | **急诊高** | [1vxlro8](https://www.reddit.com/r/shenzhen/comments/1vxlro8/in_search_of_english_speaking_medical_clinic_that/)：OP「I didn’t know where to go」 |
| 11 | 港深口岸选线 + 机场时间 + 北站上车点 | listing 跨境 24 | 中高 | [1w2aifm](https://www.reddit.com/r/shenzhen/comments/1w2aifm/advice_regarding_getting_to_hk_airport/) 等 |
| 12 | 今晚有人吗 / 语言交换 / 活动日历 | listing 30；search 触顶 25；hot/new 几乎每天 | **体量最高、紧急度低** | [1vivrbw](https://www.reddit.com/r/shenzhen/comments/1vivrbw/loneliness_in_shenzhen/)；[1v7p5eh](https://www.reddit.com/r/shenzhen/comments/1v7p5eh/finally_settled_downish_after_moving_here_how_do/)：微信群「there is no searchable mechanism or directory」 |

支付帖的失败模式已经具体到产品决策树，不是「教绑 Visa」：

- 有人 WeChat 超简单、Alipay 从美国验证 **超过一个月**。[1t9yeli 评论 ol5j4n1](https://www.reddit.com/r/shenzhen/comments/1t9yeli/i_live_in_shenzhen_heres_what_actually_works_for/ol5j4n1/)
- 有人 WeChat 完全失败，「unless you have a good friend or relative willing to tie your identity to theirs」。[ol5zl1w](https://www.reddit.com/r/shenzhen/comments/1t9yeli/i_live_in_shenzhen_heres_what_actually_works_for/ol5zl1w/)
- 地铁码藏在 Alipay 的 Transport tab，不是商户码。[1vpsd0z](https://www.reddit.com/r/shenzhen/comments/1vpsd0z/buying_metro_tickets_using_wechatalipay_with_data/)
- 外号微信付只能给商户、不能个人转账/发红包（HiShenzhen 2026）。完整钱包仍偏向境内号 + 境内卡。

### 1.2 体量 ≠ 紧急度（产品排序用这个，不用 top 票）

调研明确：top/year 高票多为城市摄影、华强北攻略、支付/入境经验贴；hot/new 则大量 looking for friends 与 how do I。Listing 225 帖启发式分类：media_share 82 · recommendation/howto 60 · practical_howto 33 · social hangout 22 · rant 19 · other 9。**高票区被风景照稀释；真正需求藏在 0–5 分问贴和搜索结果里。**

排序原则（调研原文）：可见重复度 + 评论里是否出现截止日期 / 付不了款 / 进不了医院 / 身份不合法。

对本产品：社交孤独是板上最高频行为，但 workaround 是 DM + 微信群口口相传，紧急度低，放 P2（见 §5 末）。P0 必须是会让人当天站在闸机前或错过法定期限的事。

### 1.3 Reddit 偏差（写进产品假设，否则会建错）

1. **英语、偏西方护照。** 宝安工厂工人、非洲商人、韩国/日本社群在板上弱可见。龙岗/宝安帖本身在喊 where is everyone hiding（[1vwbmqb](https://www.reddit.com/r/shenzhen/comments/1vwbmqb/new_to_shenzhen_baoan_district/)、[1vzot8b](https://www.reddit.com/r/shenzhen/comments/1vzot8b/any_foreigners_in_longgang/)）。
2. **生命周期：大量 arriving / leaving。** 长期定居者更可能已转到微信，不再发帖。产品若只服务「已有完整微信钱包的老外」，会错过真正窗口期。
3. **招聘被赶到 r/chinajobs。** 本板低估找工作，高估「已经被雇、在办证/租房」。不要做招聘板。
4. **蛇口叙事过时，评论自己承认。** 多条说疫情后外国人变少、Shekou/Coco 不再是当年。用 2017 侧边栏做产品假设会错。
5. **法律/医疗评论不是专业意见。** T 签、税务灰区、狂犬病必须接官方源。Reddit **永远不是**法律出处。
6. **版规禁广告、无 wiki。** 本板不会自己长成知识库；外部产品没有「官方 wiki」可抢，因为 wiki 是关的。
7. **对重复新手问不耐烦。** [1ui6rik](https://www.reddit.com/r/shenzhen/comments/1ui6rik/rent_enquiry_apartment/)：「If you cannot read the information already provided to you, you are going to absolutely struggle in China.」产品必须不像这块板：不嘲讽、按档案分流、给可执行步骤。

游客「第一周」体量最大但紧急度分化：游客要 3 日行程，居民要「不是景区的深圳」。共同痛：Google Maps 过时、Amap 中文、Dianping 中文。代表帖 [1t77wha](https://www.reddit.com/r/shenzhen/comments/1t77wha/visited_shenzen_for_the_1st_time_this_is_what_i/)（143 分）、[1onm4nu](https://www.reddit.com/r/shenzhen/comments/1onm4nu/first_time_to_shenzhen_need_some_help_with/)（一家六口含轮椅，任务捆绑：SIM+酒店+包车+支付+VOA）。

---

## 2. Users

五个 segment，**playbook 不同，不是同一篇 handbook 换封面。** 触发、成功、现有渠道为何失败，全部对齐证据。

### 2.1 Visitor / VOA / HK day-tripper

- **触发：** 人在香港或飞机上，本周要过罗湖/福田/深圳湾；或已在闸机前发现 Visa/Apple Pay 没用。
- **成功：** 5 日内付得了地铁和午餐、走对口岸拿到 VOA、不用在窗口用英语解释自己的护照。
- **Reddit 失败：** 信息半衰期短。VOA 办公时间网上互相矛盾；支付指南评论当场打脸（WeChat 易 vs Alipay 美国验证一个月）。[1ptwzwe](https://www.reddit.com/r/shenzhen/comments/1ptwzwe/shenzhen_5day_visa_on_arrival_tips_and_tricks/)、[1t9yeli](https://www.reddit.com/r/shenzhen/comments/1t9yeli/i_live_in_shenzhen_heres_what_actually_works_for/)。
- **微信群失败：** 还没有微信，或支付层没过。群不可搜索，出发前加不进去。
- **官方：** 2025-01 机场 T3 + 深圳湾「外籍人员一站式综合服务中心」可协助支付、SIM、交通卡、移民咨询。官方稿**没有**同等力度承诺当场开出银行卡。HeyShenzhen 写成可当场开户（招行、工行）——两条口径冲突，产品不得把「机场开户」当 SLA。来源：[深圳新闻网 2025-01-25](https://www.sznews.com/news/content/mb/2025-01/25/content_31448742.htm)、[坪山英文转载](https://www.szpsq.gov.cn/English/SERVICES/Checkpoints/content/post_12325911.html)、[HeyShenzhen bank](https://heyshenzhen.com/bank-account)。

### 2.2 New hire arriving on Z / work permit（主战场）

- **触发：** offer 已签，抵达日 ±14 天。HR 丢来中文材料清单；本人要在 24h 内登记住宿，再办 SIM、尝试开户、绑支付。
- **成功：** 派出所/线上登记完成；有中国号；支付至少一条通路能用；HR 不再坚持「必须先有 6 个月租约才能办居留」——出示住宿登记单即可。评论原话：「You don't need a rental contract for the visa/residence permit, period. … The proof of stay from a hotel/ police station works perfectly fine」vs 公司对接人「a rental contract for at least 6 months must be provided。」OP：「I just need a way to gently tell him he's wrong.」[1upmequ](https://www.reddit.com/r/shenzhen/comments/1upmequ/serviced_apartment_recommendations_please/)。
- **Reddit 失败：** 答案进 DM；政策与中介口口径冲突（幼儿园外教 2 年教龄，网上找不到法规：[1vapys2](https://www.reddit.com/r/shenzhen/comments/1vapys2/have_there_been_recent_policy_changes_in_2026_to/)）。
- **微信群失败：** 进群路径是 HR/同事；第一周还没有。
- **FESCO 失败：** 雇主系统不服务「个人今晚去哪个派出所」。工作许可提交权在单位（[stic FAQ](https://stic.sz.gov.cn/xxgk/ztzl/wzyw/wtjd/content/post_10419503.html)）。
- **第一周顺序（指南共识，HeyShenzhen）：** 派出所住宿登记 → SIM → 银行卡 → 绑支付 → 租房。[heyshenzhen.com/moving-to-shenzhen](https://heyshenzhen.com/moving-to-shenzhen)

### 2.3 Student (X)

- **触发：** 深大粤海等，学校不提供宿舍；X1 居留体检；开户要地址+护照+手机号。
- **成功：** 4 个月短租能签（房东不愿接是已知摩擦）；体检去指定机构而不是 Reddit 医学意见；银行卡开下来。
- **证据：** [1v9vxcu](https://www.reddit.com/r/shenzhen/comments/1v9vxcu/title_language_student_starting_at_szu_yuehai/)、[1v2jfs6](https://www.reddit.com/r/shenzhen/comments/1v2jfs6/tips_for_4_months_rental_in_shenzhen/)、[1vary8s](https://www.reddit.com/r/shenzhen/comments/1vary8s/places_to_do_medical_checkups_in_shenzhen/)、[1v7uhw7](https://www.reddit.com/r/shenzhen/comments/1v7uhw7/syphilis_testing_policy_for_residence_permit/)（敏感医疗+移民，Reddit 不适合）。[1uufprp](https://www.reddit.com/r/shenzhen/comments/1uufprp/bank_account/) 学生开户材料与居留地址绑死。

### 2.4 Trailing spouse / family

- **触发：** 一家从北京迁来或随 Z 签抵达；要蛇口/后海/OCT/前海、18–25k/月、国际学校、可信中介。
- **成功：** 住进校车能到的片区；合同能读懂；小孩入学走学校招生办而不是 agent 承诺。
- **证据：** [1vcnf6y](https://www.reddit.com/r/shenzhen/comments/1vcnf6y/nanshan_housing_agent/) OP 要 WeChat connections for agents；[1vku60l](https://www.reddit.com/r/shenzhen/comments/1vku60l/what_kind_of_lifestyle_can_an_expat_family_expect/) 70 评：国际学校贵得像美国私立，推荐南山/蛇口，外国小孩大概率上不了公立，QSI 仅被提及。SIS（蛇口国际学校）有公开学费/wait pool，招生办已英文——不适合当 web agent 第一刀。格局 §3.6。
- **微信群失败：** 家长群靠学校发，搬家前加不进。

### 2.5 Already-here resident

- **触发：** 支付突然坏了；要挂号；租约到期；每天过关；水电/公积金护照登录失败；12306 姓名与护照不一致。
- **成功：** 当天修好一条支付通路；医院窗口不用同事陪；过关预留了真实排队时间；公积金查得到（或明确告知必须去窗口）。
- **证据：** 港人住深/深人持港工签两套规则互相打架：[1sv1rxg](https://www.reddit.com/r/shenzhen/comments/1sv1rxg/working_in_hong_kong_but_living_in_shenzhen_us/) 高赞「You don’t have a visa for China so you cannot rent somewhere long term」vs [1vznz6l](https://www.reddit.com/r/shenzhen/comments/1vznz6l/live_in_sz_work_in_hk_on_mainland_permit/) 回乡证/旅行证是另一套。港大深圳医院微信小程序**尚不支持外国证件**。[HKU-SZH](https://www.hku-szh.org/en/MakeanAppointment(HK-Macao-Residents)/PatientInfo/HospitalizationProcedures/content/post_1574914.html)。公积金护照不能刷脸，见上。

### 2.6 主战场（beachhead）

**选：新移民到岸 72 小时 + 搬家者第一周。** 游客作获客，已住居民作留存。不重开。

理由（证据，不是口号）：

1. **几乎每个新移民都撞一次。** 格局 §4 P0 四件套：住宿登记、SIM 路由、支付排障、开户选点。HeyShenzhen 第一周清单与此同序。
2. **紧急度可测。** 24h 法律、当天 VOA 窗口、落地付不了地铁——比「找朋友」更适合转化和口碑。
3. **游客是漏斗顶部。** HK day-tripper / VOA 搜索意图公开（「shenzhen visa on arrival hours」），SEO 进得来；其中一部分会变成 mover。游客任务捆绑见 [1onm4nu](https://www.reddit.com/r/shenzhen/comments/1onm4nu/first_time_to_shenzhen_need_some_help_with/)。
4. **居民是留存，不是冷启动。** 水电/公积金/换驾照客单价低、频率高，但他们已经有微信群和 HR。先把 72h 做对，再把同一档案续到医院、网签、口岸。
5. **家庭/学校/社交不做第一刀。** 格局写明：国际学校低频且招生办已英文；Internations 深圳社群页显示 10766 members from 173 countries（抓取当日），定位付费外派社交不是办事工具；Meetup 在深圳不是主场。

不要把 beachhead 做成「所有外国人」。龙岗工厂与蛇口家庭的 playbook 第 0 步就不同；v1 只服务「本周落地的访客 + 14 天内的搬家者」。

---

## 3. What it is / is not

| 是 | 不是 |
|---|---|
| 办事 copilot：诊断 → 挂上 playbook → 逐步执行 | 空白 ChatGPT「问深圳」 |
| 英文 UI，生成中文给窗口/合同/小程序 | 给 i深圳做英文壳（护照登录过不去） |
| Live playbook：checklist + 引用 + 窗口口语 + 截图点击路径 | 再一本 handbook（市外办 2026 九语手册、蛇口 MSCE 第三版、iFutian、Hey/HiShenzhen 已过剩） |
| 官方源优先（sz.gov / 公安 / 出入境）；冲突时两份都展示 | 把 Reddit 当法律；把中介口当法规 |
| 材料预填，用户本人提交 | 代登录微信/支付宝/i深圳/公安；代签字 |
| 支付**排障决策树** | 支付钱包、TourCard 发行、收单 |
| 银行**网点选择 + 材料包** | 代开户、出租账户 |
| 租约双语对照 + 网签提醒 + 58 假房警告 | Wellcee（英文找房、库存小于贝壳）；不是再做一个 58；不是 SmartShanghai 搬来深圳（检索不到深圳房源） |
| 医院路由 + 中文主诉 + 排号话术 | 诊疗、处方、保险理赔决策；不是 Trip.com |
| 工签/居留**个人清单 + HR one-pager** | FESCO/Hongda；不承诺获批；提交按钮在雇主端 |
| 活动目录（P2） | Internations；不是微信克隆 |
| Web 先用，邮箱/Google 登录 | 要求中国手机号才能开始 |

一句话对照：

- **不是 i深圳英文壳。** 身份模型是身份证/永居/港澳台；普通护照经常要现场。
- **不是 Wellcee。** Wellcee 解决英文找房；我们解决签约后的网签、住宿登记字段、假房警告。v1 甚至不做房源。
- **不是 Trip.com。** 出票已有 12306 英文 + Trip.com（¥10–30 服务费换稳定性）。我们做核验失败修复和口岸决策，不做票务代理。
- **不是 Internations。** 10766 人的付费外派社交。板上本次抓取未见 Internations 活动组织帖。
- **不是 iFutian。** 2025-03 英文一站式 App，EyeShenzhen 运营，News/Services/Guide/Useful Apps。报道描述的是信息架构，**没有说可以在 App 里提交居留或住宿登记**。[深圳日报 2025-03-20](http://www.szdaily.com/content/2025-03/20/content_31493200.htm)

公开检索没有一个已验证的、面向在深长期外籍的「城市 OS / 办事 agent」。微信小程序 AI 是平台能力，不是外籍产品。

---

## 4. Core loop

六步，全部围绕「现场能办成」，不是「聊得明白」。

### 4.1 Intake（结构化档案，不是闲聊）

对话只为填档。必填：

| 字段 | 为何要 |
|---|---|
| 护照国 | VOA 资格、支付风控、使领馆认证路径不同 |
| 签证类型 | VOA / L / Z / X / Q / S / T / 已有居留 / 港工签无内地签——playbook 分叉点 |
| 区 | 派出所、SIM 营业厅、银行外籍网点、医院国际部都按区 |
| 抵达日 / 口岸 | VOA 西九龙 vs 罗湖；24h 登记倒计时；机场一站式是否还来得及 |
| 什么坏了 | 多选：付不了 / 没号 / 没地铁码 / 没登记 / 要 VOA / HR 材料 / 医院 / 其他 |
| 支付现状 | WeChat：未装 / 有号无付 / 外卡可用 / 完整钱包 / 失败。Alipay 同。美国验证「超过一个月」必须进决策树 |
| 有无中国号 / 境内卡 / 雇主 HR | 决定走游客栈还是居民栈 |

**不要求中国手机号才能开始。** 人在飞机上、香港酒店、或支付还没过时就必须能用。邮箱或 Google 登录。微信登录是后期，且不能作为 v1 门槛。

### 4.2 Diagnose → 挂上一条（或一组）playbook

规则引擎先于 LLM。例：签证=VOA 且口岸意图=西九龙 → 挂「5-day VOA」并立刻警告去程西九龙不行（[1ptwzwe](https://www.reddit.com/r/shenzhen/comments/1ptwzwe/shenzhen_5day_visa_on_arrival_tips_and_tricks/) 2025-11 实地）。抵达<24h 且非酒店 → 强制置顶住宿登记。支付失败 → 先跑支付决策树，再谈地铁码。

### 4.3 Run：每一步带 live 官方源

Playbook 逐步展开。每步显示：你现在做的事、带什么、去哪（POI）、对窗口说的中文、App 第几屏点哪、**这条 SOP 上次核验日期**、官方 URL。

拉官方页（sz.gov / 深圳公安 / 出入境 / 口岸办）。VOA 办公时间过期是 **#1 信任杀手**——板上已经发生过：办公室自称 6:30–24:00，票务员/网上仍说 17:00 关门；另一人工作日 11:00 排 2 小时含午餐停办。**未知（需每次 live fetch）：** 2026-09-02 当下罗湖 VOA 窗口的确切时段，不得把 2025-11 实地写成「现在就是这样」。

### 4.4 Failure → 决策树（产品灵魂）

调研里已经长好的树，必须写成代码，不要让模型临场编：

| 失败 | 下一跳 |
|---|---|
| WeChat Pay 完全起不来 | 改 Alipay；充值余额；不要建议「找朋友绑身份」（原声是用户无奈，产品若推荐即协助绕过实名） |
| Alipay 美国验证超过一个月 | 标明耗时；起飞前就开始；备 Tour Pass / 外卡直连（评论有人直连成功、有人仍要 TourCard——**冲突，两说都展示**） |
| 外卡能买东西，地铁小程序失败 | 「打开 Alipay 本体 → Transport tab → 乘车码」，配截图。不要让用户在小程序里找 |
| 美团/小程序要中国号 | 路由：饿了么 workaround、酒店前台号（板上有人提）、或「必须办实体 SIM」；eSIM 纯流量不够 |
| VPN 开着触发支付风控 | 只提示「指南称 VPN 会触发风控，请关闭后再试」。**不教、不卖、不集成 VPN** |
| 地铁闸机仍失败 | 现金购票机；Octopus 自 2023 可刷（支付帖场景表）；机场/口岸交通卡 |
| 住宿登记手输地址失败 | 必须扫门框房屋码；失败则所属派出所或蛇口境外人员管理服务中心 |
| i深圳 / 粤省事护照刷脸失败 | 不声称打通；绕到微信「深圳公安」、窗口、纸质盖章条 |
| 银行小区网点拒护照 | 换外籍见得多的网点（指南共识：福田 Coco Park、蛇口、高新）；L 签个人户通常被拒——提前预判 |
| 微信医院小程序不认外国证件 | 电话/窗口/91160；港大深圳医院病历复印外籍必须柜台 |

### 4.5 Output artifacts（每次跑完留下可带走的东西）

- 双语 checklist（PDF/页面，可离线）
- 窗口口语 card：拼音 + 汉字 + 英语对照。游泳馆：「你好，买一张成人票。」
- HR one-pager：住宿登记单 vs 6 个月租约；引用官方材料路径，语气「gently tell him he's wrong」
- 地图/POI：派出所、罗湖 VOA 办公室、吃护照的营业厅、港大深圳医院国际医疗中心（电话 0755-86913388 / 普通门诊英文热线 0755-86913366）
- 材料包：护照页、签证页、住宿登记 PDF、签证照片——docs wallet
- 到期提醒：24h 登记、从港再入境重登、T 签/居留到期、狂犬疫苗第 2 针

### 4.6 Citation 永远可见

页脚固定：官方 URL + 抓取时间 + SOP 版本。Reddit 只可作「他人踩坑」旁注，标签 **非法律来源**。冲突时并排：「窗口 2025-11 自称 6:30–24:00」vs「网上/票务员 17:00」——让用户按现场，不让模型选边。

---

## 5. Playbook catalog（全产品，12–18 个月）

每条含：名称、用户、触发、步骤大纲、已知官方源、agent 动作、**绝对不做**、优先级。Agent 动作限定为：search / fill / translate / book（仅公开可订入口）/ walkthrough。v1 不登录用户的微信/支付宝/i深圳。

### P0

#### PB-01 支付矩阵 + 排障

- **用户：** 访客 + 新移民 + 支付突然坏了的居民  
- **触发：** intake 里 WeChat/Alipay 任一失败；或「明天落地」  
- **步骤大纲：** 起飞前核身（不要 2AM 在机场开始）→ 先 Alipay 还是 WeChat（因护照国/银行而异，禁止写死「Alipay 一定更容易」）→ 外卡直连 vs Tour Pass/TourCard 额度 → 场景表（地铁/出租/小店/医院/景点小程序）→ 失败树（§4.4）→ 现金兜底（¥10/¥20；支付帖称商户依法应收现金）→ 长期居民：何时必须开境内户才能转账/房租/工资  
- **官方/指南源：** 支付帖自称对照 sz.gov.cn、MTR、商户政策；HiShenzhen 2026：[hishenzhen.com/how-to-set-up-alipay-and-wechat-pay-in-shenzhen-2026-guide](https://hishenzhen.com/how-to-set-up-alipay-and-wechat-pay-in-shenzhen-2026-guide/)；无现金程度：[shenzhendecoded.com/en/guides/payment-shenzhen](https://www.shenzhendecoded.com/en/guides/payment-shenzhen)。**未知：** 当下 TourCard 是否仍必要（评论已质疑）。  
- **Agent：** search 官方支付指引；walkthrough 截图；fill 实名字段对照护照逐字；**不 book 支付产品**  
- **Never：** 做钱包；协助他人绑身份过实名；卖/教 VPN；承诺「外卡处处能用」  
- **P0。** 游客路径 2023–2026 已打穿绑卡——产品差异是**排障**，不是再写绑 Visa。不付费墙。

#### PB-02 24 小时临时住宿登记（含从港再入境）

- **用户：** 非酒店住宿的新移民、短租、每次从港回深的居民  
- **触发：** 抵达非酒店；或档案记录一次出境香港  
- **步骤大纲：** 判断酒店是否已代登记 → 关注「深圳公安」→ 政务服务 → 出入境业务 → 境外人员临时住宿登记 → **扫门框房屋码**（手输常失败）→ 失败则所属派出所或蛇口境外人员管理服务中心（公安授权，效力等同）→ 部分场景仍要纸质盖章条 → 提醒：全国线上试点 2026 年不含广东（HiShenzhen；**需 live 复核是否仍真**）  
- **官方源：** 《出境入境管理法》第 39 条；HeyShenzhen [registered-address](https://heyshenzhen.com/registered-address)；HiShenzhen [temporary-accommodation-registration](https://hishenzhen.com/how-to-get-temporary-accommodation-registration-shenzhen/)；蛇口 MSCE：[nowshenzhen.com/directory/shekou-msce](https://nowshenzhen.com/directory/shekou-msce/)  
- **Agent：** 按区识别派出所 POI；对照租约逐字抄地址；translate 窗口话术；提醒引擎；fill 表单预填。**不提交公安系统。**  
- **Never：** 假地址、代提交、代签字、声称「我们打通了线上登记」  
- **P0。** 不付费墙。

#### PB-03 5 日 VOA：罗湖 vs 西九龙

- **用户：** 访客 / HK day-tripper，护照需 VOA  
- **触发：** 签证类型=VOA 或「从香港来、没有中国签」  
- **步骤大纲：** 核护照国是否在 VOA 范围（**每次 fetch 国家移民管理局，不写死名单**）→ 去程不要走西九龙高铁办 VOA（2025-11 实地不行）→ 罗湖：拍照 → 填表 → 取号；费用帖写 130 RMB → 单次入境，当天往返即耗尽 → 排队缓冲（有人工作日 11:00 排 2 小时含午餐停办）→ 办公时间冲突并排展示  
- **官方源：** 必须 live 拉出入境/移民局/i口岸。i口岸英文页有签证跳转国家移民管理局：[szpsq.gov.cn … i口岸](https://www.szpsq.gov.cn/English/SERVICES/Checkpoints/content/post_11674450.html)。Reddit 只作踩坑旁注。  
- **Agent：** search 现行时段与口岸；walkthrough 四步；fill 中英表格字段；POI。不 book 签证。  
- **Never：** 保证获批；教签证 run 漏洞；把过期博客当现行  
- **P0。** 不付费墙。

#### PB-04 SIM / eSIM 营业厅路由

- **用户：** 访客要流量；新移民要中国号（美团/银行短信/微信验证）  
- **触发：** 无中国号，或 eSIM 过不了小程序  
- **步骤大纲：** 先分流「只要数据」vs「要内地号」→ 数据：板上出现 Nomad / Holafly / Trip eSIM / Airalo（搜索提及）；出境 eSIM 常自带翻墙——**产品只陈述「部分旅游 eSIM 在境外可访问国际服务」，不卖 VPN** → 内地号：本人持护照去**吃护照的营业厅**（工信部实名+人脸）；小店常拒 → 按区列官方厅；套餐中英对照（帖有市内 20G/99 RMB，**当用户报告而非价目**）→ 机场一站式可协助 SIM  
- **官方源：** 龙华英文 2026-03-19：[szlhq.gov.cn … post_12692962](https://www.szlhq.gov.cn/english/licc/newsevents/newsevent/content/post_12692962.html)；福田双语：[szft.gov.cn … post_10936751](https://www.szft.gov.cn/xxgk/ztbd/yshj/yszx/content/post_10936751.html)；HiShenzhen 提 Nihao Mobile 英文网申+邮寄。  
- **Agent：** 路由营业厅；walkthrough 材料；translate 套餐。不自营号卡。  
- **Never：** 黄牛号、非实名、买卖已实名号  
- **P0。**

#### PB-05 地铁 / Alipay 乘车码

- **用户：** 落地第一程  
- **触发：** 外卡能付款但闸机不行；或 intake「怎么坐地铁」  
- **步骤大纲：** Alipay 本体 Transport tab → 电子乘车码（不是商户扫码）→ WeChat 同类入口若有则并排 → 失败：购票机现金；Octopus（支付帖：地铁自 2023 可刷）→ 漫游/VPN 再踩一次的警告（只警告组合，不给翻墙方案）  
- **源：** [1vpsd0z](https://www.reddit.com/r/shenzhen/comments/1vpsd0z/buying_metro_tickets_using_wechatalipay_with_data/)；支付场景表 [1t9yeli](https://www.reddit.com/r/shenzhen/comments/1t9yeli/i_live_in_shenzhen_heres_what_actually_works_for/)  
- **Agent：** 截图点击路径（北星格式）  
- **Never：** 做交通卡发行  
- **P0。**

### P0 / P1

#### PB-06 银行网点选择 + 材料包

- **用户：** Z/X/居留新移民；L 签要提前告知大概率被拒  
- **触发：** 住宿登记+中国号已有，要开户  
- **步骤大纲：** 按签证预判能否开 → 列外籍友好网点（指南共识：福田 Coco Park、蛇口、高新；小区网点劝退）→ 材料：护照、签证/居留、住宿登记、境内号 → 表单预填 → 招行 App 英文较好、中行国际汇款、工行网点密（指南共识，**非官方排名**）→ 机场一站式「开户」口径冲突：官方强调支付协助，HeyShenzhen 写招行/工行当场开户——并排，不当 SLA  
- **源：** [HiShenzhen 开户](https://hishenzhen.com/how-to-open-bank-account-shenzhen/)；[HeyShenzhen bank](https://heyshenzhen.com/bank-account)  
- **Agent：** 选点、材料包、walkthrough 绑 App。开户必须本人到场。  
- **Never：** 代开户、协助地下汇兑  
- **P0/P1。** v1 可先做「材料清单 + 拒签预判」，不做网点实时排队。

#### PB-07 住房：双语合同 + 网签提醒 + 58 假房

- **用户：** 搬家者、学生短租、家庭 18–25k  
- **触发：** 开始看房或拿到中文合同  
- **步骤大纲：** 渠道分层——Wellcee 英文但库存小；贝壳/链家库存最大（租客佣金：HiShenzhen 写半月、HeyShenzhen 写一月，**口径不一，标未知**）；安居客更杂；**58 当假房陷阱**（HiShenzhen 明确不建议；Reddit 中文回复「不要选 58，选泊寓」）→ 识别「外籍可租」→ 2025-09-15《住房租赁条例》实名合同；深圳住房租赁监管服务平台网签备案 1–3 工作日，界面中文；未备案可能影响居留 → 生成派出所登记所需地址字段 → 短租 4 个月房东不愿接、宠物（德牧）条款  
- **源：** [条例](https://www.sz.gov.cn/ztfw/zfly/wyk_184880/content/post_12341639.html)；[平台英文说明](http://www.sz.gov.cn/en_szgov/services/personal/accommodation/platform/)；[HiShenzhen 租房](https://hishenzhen.com/renting-apartment-shenzhen-foreigner-guide/)；[Wellcee SZ](https://www.wellcee.com/shenzhen/m/rent-apartment)  
- **Agent：** translate 合同对照；提醒 15 日内备案；警告 58。不做无证撮合，v1 不做 marketplace。  
- **Never：** 假居住证明；绕过网签  
- **P0/P1。**

#### PB-08 公立医院 / 港大深圳医院路由 + 排号话术（狂犬病作急诊例）

- **用户：** 居民、访客急诊  
- **触发：** 症状/受伤；或「要英语医院」  
- **步骤大纲：** 急诊（猫抓/狂犬）→ **最近能打疫苗的公立，不要等英语诊所**。板上：「You should have gone yesterday… Just go to the next hospital and use a translation app」；国际医院被说浪费钱；OP $100 USD/针；原声「I didn’t know where to go。」→ 非急诊：国际部 vs 普通门诊 vs 发热门诊路由；保险直付 vs 全额垫付；港大深圳医院 IMC 0755-86913388，英文热线 0755-86913366，微信 hkuszh，91160；**微信小程序不支持外国证件**，病历复印柜台 → 生成中文主诉 + 窗口排号话术 + 证件清单；后续针次+离境衔接提醒  
- **其他已出现机构：** 北大深圳医院国际/VIP；中山大学附属第八医院国际医疗中心 2026-01-27 开业（福田）；康宁（精神卫生）；私立 Vista-SK、International SOS（蛇口，需 clinic plan）、和睦家。评论「几乎只有港大深圳医院」——产品要打破单一推荐，但急诊仍近优先。  
- **源：** [HKU-SZH IMC](https://www.hku-szh.org/en/imc/index.html)；[预约须知](https://www.hku-szh.org/en/PatientInfo/BookingService/BookingGuidelines/content/post_818462.html)；[外籍证件限制](https://www.hku-szh.org/en/MakeanAppointment(HK-Macao-Residents)/PatientInfo/HospitalizationProcedures/content/post_1574914.html)；[1vxlro8](https://www.reddit.com/r/shenzhen/comments/1vxlro8/in_search_of_english_speaking_medical_clinic_that/)；[1tcu94o](https://www.reddit.com/r/shenzhen/comments/1tcu94o/can_anyone_recommend_good_english_speaking/)  
- **Agent：** 路由 POI；translate 主诉；walkthrough 挂号脚本；提醒第 2 针。可生成号票中文。v1 **不**在微信里 RPA 挂号。  
- **Never：** 诊断、处方、理赔决策；ADHD/哌甲酯等管控制剂跨境建议（板上有帖，产品只说「去正规医院，不在此开药」）  
- **P0/P1。** 狂犬病路径不付费墙。

#### PB-09 工作许可 / 居留许可个人清单

- **用户：** Z 新移民；续签；雇主城市与工作城市不一致者  
- **触发：** HR 启动办理；或 2026 年龄政策（B/C 类续签男 60 / 女 55）突然撞上  
- **步骤大纲：** 声明「提交在雇主端」→ 个人材料状态机：无犯罪记录、学位认证、体检、住宿登记、照片 → 非中文材料需单位盖章译文 → 深圳并联平台窗口收件后约 7 个工作日 → 进度解读（短信/HR 截图翻译）→ 被裁/许可取消：不给「飞泰国再办」当产品步骤，只给官方下一步（打属地出入境、12345 英语——评论提及，**需核验 12345 英语时段**）  
- **源：** [wgfw.ga.sz.gov.cn](https://wgfw.ga.sz.gov.cn/user/wgrfwpt)；[FAQ](https://stic.sz.gov.cn/xxgk/ztzl/wzyw/wtjd/content/post_10419503.html)；[国家系统](https://fwp.safea.gov.cn/lhgzweb/)；[材料说明](https://www.sz.gov.cn/en_szgov/news/infocus/SZCitywalk/Explore/Plan/content/post_11845338.html)；[2026 年龄](https://www.china-briefing.com/news/work-permit-renewal-shenzhen-age-policy-update/)；市就业与居留服务中心（市民中心）  
- **Agent：** 清单+质检扫描件清晰度；translate；预约短信解读。  
- **Never：** 代办、保证获批、挂靠无实体雇主、买工作许可  
- **P0/P1。**

#### PB-10 HR myth-buster one-pager

- **用户：** 新移民 vs 错误 HR  
- **触发：** HR 要 6 个月租约才肯推进居留  
- **步骤大纲：** 一页 PDF：酒店/派出所住宿登记单即可；「In no part of the Work Permit / Residence Permit process do they ask to see an accommodation rental contract」（评论，**非法律，必须并排官方材料清单 URL**）→ 温和中文封面信可转发给对接人 → 链到 PB-02 如何拿到盖章条  
- **源：** [1upmequ](https://www.reddit.com/r/shenzhen/comments/1upmequ/serviced_apartment_recommendations_please/) + 官方材料页  
- **Agent：** 生成双语一页纸。  
- **Never：** 伪造登记；教对抗公安  
- **P0/P1。** v1 必做，内容薄、口碑厚。

### P1

#### PB-11 港深口岸 + 机场时间

- **用户：** 访客去 HKIA；居民通勤；节假日  
- **触发：** 「最快去香港机场」「国庆福田口岸」  
- **步骤大纲：** 西九龙–福田高铁约 14 分钟；罗湖 / 落马洲–福田地铁；皇岗 24 小时 → 按时段/行李/轮椅选口岸 → 缓冲排队（Reddit 做不到实时）→ 北站 Didi 上车点混乱，改 Amap（[1vlcob2](https://www.reddit.com/r/shenzhen/comments/1vlcob2/never_order_didi_in_shenzen_north_railway_station/)）→ 签证层：大陆居留不能在港工作，港工签不能自动给内地长租（GEP 等独立：[immd.gov.hk GEP](https://www.immd.gov.hk/eng/services/visas/GEP.html)）  
- **源：** [chinafortravelers HK–SZ](https://chinafortravelers.com/guides/hong-kong-to-shenzhen/)；i口岸客流  
- **Agent：** 决策+POI；有公开客流则 fetch。不做出租车调度。  
- **Never：** 教「用大陆身份在港工作」或相反  
- **P1。**

#### PB-12 12306 护照姓名不一致

- **用户：** 买高铁去港/国内  
- **触发：** 核验队列、外卡失败、闸机姓名  
- **步骤大纲：** 护照可邮箱注册；核验失败修复；姓名/护照号与闸机一致（英文拼写空格、中间名）→ 修不好则 Trip.com / 柜台（服务费 ¥10–30 是指南说法）→ 不做出票代理除非有牌  
- **源：** [12306 English](https://chinafortravelers.com/guides/12306-english/)；[passport verification](https://chinatransit.guide/guide/apps/fix-12306-passport-verification)  
- **Agent：** walkthrough 核验；translate 错误码  
- **P1。**

#### PB-13 境外驾照换证

- **用户：** 已有居留的居民  
- **触发：** 「要开车」  
- **步骤大纲：** 罗湖英文页：网申走交警平台或「深圳公安」微信；驾照公证翻译 + 体检；科目一。HiShenzhen：居留剩余 ≥90 天。翻译社名单、体检医院、题库语言  
- **源：** [szlh.gov.cn 换证](https://www.szlh.gov.cn/English/Luohu-International-Block/Luohu-Services-Center/Resident/content/post_9623969.html)；[HiShenzhen license](https://hishenzhen.com/get-drivers-license-shenzhen-foreigner/)  
- **Agent：** 完整办事流（预约、材料、walkthrough）  
- **Never：** 免试承诺、伪造翻译  
- **P1。**

#### PB-14 水电燃气 / 公积金查询（护照登录失败）

- **用户：** 已租房居民  
- **触发：** 绑卡改名失败；i深圳刷脸失败  
- **步骤大纲：** 预判护照刷脸不可用 → 粤省事账号密码路径（先签自助协议、绑联名卡——住建局 FAQ）→ 仍失败则窗口话术 + 联名卡材料 → 低客单价、高频留存  
- **源：** [住建局公积金](https://zjj.sz.gov.cn/hdjl/ywzs/gjj/content/post_12654878.html)  
- **Agent：** 点击路径；不声称打通 i深圳  
- **P1。**

#### PB-15 大湾区境外人才个税补贴（只解释）

- **用户：** 有境内工资的外籍人才  
- **触发：** 每年申报窗  
- **步骤大纲：** 走广东省政务服务网；工资薪金类要单位审核 → 资格解释、材料包、etax 授权英文 walkthrough → 政策金额（超额超 15% 部分、上限 500 万）来自官方通知的转述（china-briefing），**产品不得自行计算承诺返税**  
- **源：** [2026 GBA IIT](https://www.china-briefing.com/news/2026-gba-iit-subsidy-kickstarted-in-shenzhen/)  
- **Agent：** explain + 材料清单  
- **Never：** 税务意见、承诺到账金额  
- **P1。** v1 不做。

### P2

#### PB-16 活动 / 群目录

- **用户：** 已住下来、lonely  
- **触发：** 「how do you keep up with what's what」  
- **步骤大纲：** 按区（宝安/龙岗 vs 蛇口）可搜索的局；标明来源（公众号/学校/MSCE）；不爬取私人微信群成员  
- **板上出现：** Amazing Shenzhen / That's Shenzhen 公众号（评论称基本是付费活动）；Baoan English corner 周六；Craft Head；ActiveSZexpats（Now Shenzhen 2026-07-17，梧桐山徒步长出，一周内过百人）；meetup.com 近空  
- **Never：** 做大号「外国人总群」（板上「I've only heard bad things about large city-specific foreigner chats」）；不把 Reddit hangout 帖当实时日历  
- **P2。** 见下节为什么社交不做 P0。

#### PB-17 汉语学校比价

- **用户：** 在职晚班，不要大学长期项目  
- **触发：** 「best Mandarin schools for working professionals」  
- **步骤大纲：** 公开班表/价格/区/能否午间或晚班；可预约试听。板上出现：**Co-Talk**（世界之窗，商务汉语，约 5500/30h 1-on-1，cotalkchina.com）；**CTA** 南山+福田（教师微信走 DM）；**That's Mandarin** HSK1，班课+一对一。That's Mandarin 蛇口兴华路校区另见其官网，提供课程 + 签证/住宿/支付宝协助类入学服务。  
- **源：** [1vt63nj](https://www.reddit.com/r/shenzhen/comments/1vt63nj/best_mandarin_schools_for_working_professionals/)；[thatsmandarin.com/learn-chinese-shenzhen](https://www.thatsmandarin.com/learn-chinese-shenzhen/)  
- **Agent：** 比较表；外链预约。价格以学校为准，帖上 5500 当用户报告。  
- **P2。** 可作 GTM 伙伴（§9）。

#### PB-18 华强北公允价 / 京东代下单

- **用户：** 游客买电子；采购者找原型  
- **触发：** 华强北攻略高互动（[1sdo8ux](https://www.reddit.com/r/shenzhen/comments/1sdo8ux/huaqiangbei_ultimate_shopping_guide_for_foreign/) 248 分）  
- **步骤大纲：** 高赞 workaround：window shop、拍照、JD 买；游客开不了京东/淘宝；「Don't know Chinese mate and ai translation doesn't help」→ 代下单代退货是 ops 重  
- **Never：** 担保微信卖家；做供应链撮合当可信工厂（Reddit 不可验证）  
- **P2，偏后。** 运营重，不像 SOP。

#### PB-19 家庭择校地理（蛇口 vs 南山）

- **用户：** trailing family  
- **触发：** 入学季、搬家选址  
- **步骤大纲：** SIS 校车/wait pool 绑居住地；QSI 在家庭帖作锚点；公立对外国小孩「大概率上不了，幼儿园或许可以，guanxi」——**不当通道**  
- **源：** [SIS admissions](https://www.sis-shekou.org.cn/admissions/)；[1vku60l](https://www.reddit.com/r/shenzhen/comments/1vku60l/what_kind_of_lifestyle_can_an_expat_family_expect/)  
- **Never：** 绕过外籍子女学校资格或公立学位政策  
- **P2。** 学校招生办已英文。

### 为什么社交体量最高却是 P2

板上 listing 交友 30、search meetup/friends 触顶 25，hot/new 几乎每天有。但：

1. **紧急度低。** 付不了款、错过 24h 登记、狂犬疫苗延误，会让人当天出事。lonely 不会。
2. **需求是可约的人，不是文章。** Reddit 延迟高、DM 随机、地点分散。产品若做社交，要对抗微信群网络效应，且板上明确反对大号外国人城市群。
3. **供给已占。** Internations 付费社交；ActiveSZexpats；That's Mandarin / Tandem（深圳页写 4,935 名英语使用者在找语伴）/ HelloTalk；微信群靠人传人。格局 §4：「纯社交：Internations、微信群、ActiveSZexpats 已占。」
4. **本产品的信任来自窗口办成。** 社交做砸会变成又一个冷清 listing，伤害办事品牌。
5. **获客可以借用社交意图，产品不要做成社交。** SEO/合作可以出现在 language partner 场景，落地后立刻转支付/登记 playbook。

华强北、夜店（COCO 附近「Almost impossible to find online」）、电瓶车占道：情绪高、产品空间弱或 ops 重，不进 v1。

---

## 6. Agent capabilities & system design

### 6.1 Intake schema（结构化 profile）

```text
UserProfile
  passport_country: ISO 3166-1
  visa_type: voa_5 | L | F | Z | X1 | X2 | Q | S | T | residence | hk_work_no_mainland | unknown
  district: nanshan | futian | luohu | baoan | longgang | shekou | qianhai | other | unknown
  arrival_date: date
  arrival_port: baoan_t3 | luohu | west_kowloon | shenzhen_bay | futian | huanggang | other
  broken: [payments, sim, metro_qr, accommodation_reg, voa, housing, hospital, bank, work_permit, other]
  wechat_pay: not_installed | registered_no_pay | foreign_card_ok | full_wallet | failed
  alipay: 同上 + us_verification_pending
  has_cn_phone: bool
  has_cn_bank: bool
  has_employer_hr: bool
  stay_type: hotel | serviced_apt | private_lease | friend | unknown
  language_ui: en
```

对话层只是表单的自然语言壳。每次回答回写字段。缺字段不让模型猜签证类型。

### 6.2 Playbook engine

- SOP 版本化（semver）。每步：`id, title_en, action, poi, speech_card_zh, screenshot_ids[], official_urls[], last_verified_at, on_fail[]`
- `last_verified_at` 超 14 天（VOA/口岸时段）或 30 天（银行/SIM）→ UI 黄标「可能过期，正在拉官方页」
- 内容与模型分离：模型负责填槽和翻译，**不许改步骤顺序**
- 同一 playbook 按签证/区 fork，不要写「外国人都这样」

### 6.3 Live fetch

抓：国家移民管理局 VOA、深圳出入境公告、深圳公安住宿登记说明、i口岸客流、港大医院预约须知、住建局公积金 FAQ。哈希正文，变了就告警编辑。VOA 小时是信任矿场，宁可显示「官方页此时写 XX，Reddit 2025-11 实地写 YY」，不可静默选一个。

**假设：** 第一期可用受控 fetch + 人工确认，不必一上线全自动改 SOP。

### 6.4 Screenshot / click-path library

按 App 版本存：Alipay Transport tab、WeChat Pay 外卡绑卡失败码、深圳公安小程序房屋码扫描、粤省事密码登录、91160/港大微信「证件类型」灰掉的屏。北星是游泳馆评论里自助机截图：点「点击购票」→ 时段 →「去支付」。每条路径要能离线看——窗口经常没国际漫游。

### 6.5 中文口语 card

汉字 + 拼音 + 英语。短。窗口场景：买票、住宿登记、银行开户、医院挂号、SIM 实名。生成后可放大屏幕给柜员看（游泳馆帖已证明这招）。

### 6.6 Form prefill

输出用户可复制的字段/PDF。住宿登记地址从租约抄；VOA 表国籍/护照号；银行开户申请。**我们不提交公安/出入境。** 复制按钮比「帮你点提交」更合法。

### 6.7 Reminder engine

| 事件 | 时点 |
|---|---|
| 临时住宿登记 | 抵达后 T+12h 仍未标记完成则催；从港回深当天再催 |
| T 签 / 居留到期 | T-30 / T-14 / T-7 |
| 狂犬疫苗第 2 针 | 按医院医嘱间隔，产品只提醒不去改医嘱 |
| 网签 15 日 | 签约日起算 |
| 工签年龄政策 | 仅展示官方门槛，不做个例预测 |

通道：邮件先；WhatsApp 给「还没有微信」的人；Web push。不要把关键催办只放在微信——循环依赖。

### 6.8 Confidence

官方互斥 → 并排 + 「以窗口当场为准」。官方 vs HR → 官方优先，给 HR one-pager。官方 vs Reddit → 官方，Reddit 作失败模式。模型不得调和成一句假确定。

### 6.9 语言

UI 英语。所有给真实世界的字（合同批注、窗口、小程序字段）出中文。用户可一键「show this to the clerk」。不做九语——市外办手册已经九语，我们不是手册。

### 6.10 Auth

v1：邮箱 / Google。必须在 WeChat Pay 还没完全开通时能用。不要求中国手机号。微信登录后期，且登录≠支付实名。Docs wallet 存护照/签证/住宿登记 PDF，加密，默认不把证件图送给模型供应商——**假设：v1 只在用户触发「预填」时抽字段。**

### 6.11 v1 不做 RPA 进微信；后期 computer-use 单独风险

护照核身是墙。v1 引导、生成话术、拉官方源、排障。后期若做 computer-use（操作用户已登录的桌面）：

- 风险：支付/政务账号凭证、违反微信 ToS、替用户提交等同「代办」
- 前提：用户本机、显式逐步授权、审计日志、仍不碰出入境提交
- 与 v1 隔离发版，不在同一 SLA

微信开放平台小程序 AI 可订票支付原子化，但「不能绕过实名支付和出入境」。不要把平台 SKILL 当成已接通的外籍 OS。

---

## 7. Trust, compliance, legal

照抄格局简报 §5 的不该做，写成工程约束。

### 7.1 已经够用、再做是重复

- 游客支付绑卡 / TourCard / 机场一站式支付协助：不要做钱包  
- 打车：滴滴有英文  
- 高铁出票：12306 英文 + Trip.com；可做核验排障，无牌不做票务代理  
- 英文生活方式媒体：That's / Now Shenzhen / EyeShenzhen / iFutian  
- 付费外派社交：Internations  
- 语伴：HelloTalk、Tandem、That's Mandarin  
- 上海式分类广告：不要再做一个 58；SmartShanghai 不去深圳有原因，库存在贝壳

### 7.2 法律 / 合规红线

- **VPN / 翻墙 / 跨境网络绕过。** 指南会提到支付时关 VPN；产品不卖、不集成、不教安装。  
- **灰市户口、积分入户造假、假居住证明、假社保证明。**  
- **承诺工签/居留 100% 批准、买工作许可、挂靠无实体雇主。** 无人力许可不碰代办。  
- **黄牛号卡、非实名 SIM、买卖已实名号码。**  
- **代开银行账户、出租账户、协助地下汇兑。**  
- **医疗诊断、处方、保险理赔决策。** 最多导航和翻译。  
- **代替外国人做公安住宿登记或出入境申请**（代提交、代签字、假地址）。只能指导本人。  
- **儿童：不绕过外籍子女学校资格或公立学位政策。**  
- **港深「用大陆身份在港工作」或相反。** 两地许可独立。  
- **不在 r/shenzhen 打广告。** 版规 No advertisements services, websites, or blogs。置顶帖是「New Shenzhen subreddit for advertising」（2026-03-29）——那是板块迁广告，不是允许你去发站。

### 7.3 能力边界（技术能做、文案不能装已接通）

- i深圳 / 粤省事护照登录和刷脸，不是产品能修的身份体系。绕到微信公安、窗口预约、英文手册。  
- 工作许可提交权在单位。面对个人是 copilot 不是申报端。  
- 始终：「核对窗口当场口径 / verify at the window」。VOA 小时、银行是否收 L 签、房屋码是否可扫，都以现场为准。  
- 移民：清单不是 representation。不在任何国家当移民律师。  
- 医疗：路由不是诊断。狂犬病给最近点+开放时间+「昨天就该去」，不给针剂方案。

免责声明放每条 playbook 顶上，短，英文：*This is a procedure guide, not legal, medical, or immigration advice. Rules change. Confirm at the counter. Official sources linked below.*

---

## 8. UX surfaces

**Web app，desktop + mobile。** 主路径是手机——窗口前单手。不要求装 APK（外国人应用商店摩擦自己就是痛点）。

### 8.1 主屏：chat + playbook 分栏

左（或上，移动端）：intake 对话。右（或下）：当前 playbook 的 checklist，当前步高亮，引用和截图钉在步骤上。**Hybrid，不是 chat-only。** 聊完诊断后，用户主要戳清单，不是继续打字。

北星对照游泳馆帖的信息架构：

| 游泳馆帖 | Copilot 步骤组件 |
|---|---|
| Getting There（几号线、哪个出口、走几分钟） | POI + 地铁出口 |
| What to Bring | 材料清单 |
| Skip i深圳/小程序 | 「护照验证会失败，走窗口」警告 |
| 窗口中文句子 | speech card |
| 自助机点击购票 / 时段 / 去支付 | screenshot click-path |
| 押金手环等易漏步骤 | 强制 checkbox 才能标 complete |

### 8.2 其他屏

- **Playbook library：** 按生命周期（落地 72h / 第一周 / 住下来 / 家庭），不是按政府部门。每条显示 last verified。  
- **My profile / docs wallet：** 护照、签证页、签证照片、住宿登记 PDF。用于预填，不是社交资料。  
- **Saved POIs：** 派出所、营业厅、银行网点、医院国际部。  
- **Run history：** 哪条 playbook 哪一步失败——用于改进决策树。

### 8.3 后期可选

- 微信公众号：给**中文侧**（HR、房东、柜员）看 one-pager；不是把用户锁进微信才给办事。  
- WhatsApp：抵达前、WeChat Pay 未通时的提醒通道。  
- 不做微信小程序当主产品：护照登录/支付循环依赖。

### 8.4 明确不做的 UX

不要中国手机号才能注册。不要强制微信登录。不要把首页做成城市杂志。不要 Internations 式活动 feed 当首页。

---

## 9. Go-to-market

### 9.1 不能做

**不能在 r/shenzhen 发产品、发网站、发「我们做了个工具」。** 版规写死。32,680 订阅是**意识基数不是客户名单**。版子对重复新手问已经不耐烦；产品若被当成又一个引流帖，会永久敌对。

### 9.2 可以做：SEO 对准已在搜的句子

板上和指南反复出现的 query（用这些写落地页，不要发明新黑话）：

- shenzhen visa on arrival hours  
- alipay metro foreigner / WeChat pay Shenzhen metro  
- temporary accommodation registration Shenzhen  
- Shenzhen SIM card foreigner passport  
- open bank account Shenzhen foreigner  
- HKU Shenzhen hospital appointment foreigner  
- Shenzhen work permit rental contract  

每页 = 一条 playbook 的公开只读版 + 官方引用 + last verified。这就是和 HeyShenzhen 文章的差别：页脚有核验日期，点进去能进自己的档案跑决策树。

### 9.3 合作（假设，需 BD 验证）

| 对象 | 为何 | 证据 |
|---|---|---|
| That's Mandarin / Co-Talk / CTA | 在职外籍每周出现；学校已在帮签证/住宿/支付宝 | Reddit 比价帖 + That's Mandarin 官网服务描述 |
| 服务式公寓（板上出现 Apartment One 招商伊敦） | 入住即触发住宿登记+支付 | [1upmequ](https://www.reddit.com/r/shenzhen/comments/1upmequ/serviced_apartment_recommendations_please/) |
| 蛇口 MSCE | 全市第一家境外人员管理服务中心，出过双语 Handbook，称调研 3000+ 外籍居民 | [nowshenzhen MSCE](https://nowshenzhen.com/news/shekoumscenew-edition-of-handbook-published/) |
| HeyShenzhen | **内容伙伴不是竞品**：他们是指南+拉群，我们是执行层。互相链 SOP 比互相抢 SEO 更诚实 | 格局把 Hey 写成落地指南，不是 agent |
| 持牌中介（FESCO/CIIC/STAN-VISA/SFBC 等） | 后期 concierge 分发；v1 不绑 | 格局 §3.1 |

微信群：只能**人**进群，产品不爬群、不 spam。HR、语言学校老师、MSCE 工作人员是种子。

### 9.4 买不到的渠道

机场 T3 / 深圳湾一站式综合服务中心是官方共建（市委外办、机场、口岸办、人行深圳分行等），**不是你可以买的分发位**。最多：内容质量高到工作人员愿意口头推荐——**假设，不写进 v1 增长模型。**

Facebook 群（Shenzhen Expats Social Group、Expat Rent Shenzhen）大陆访问不稳定，更像出发前信息板。可发有用 SOP，不要硬广。

Internations 活动现场发名片 = 假设；不要把 10766 members 当成可触达邮件列表。

### 9.5 诚实的预期

r/shenzhen 3.2 万订阅、英语、游客与居民混杂、招聘被赶走。它证明需求存在，不证明付费人数。冷启动靠 SEO + 学校/公寓 + 把游泳馆那种帖写成产品，让用户在窗口办成后把链接私发给下一个新人——**私下分享不是在板上打广告**。

---

## 10. Monetization（全部标 假设）

**假设 1 — 信任漏斗：** P0 playbook（支付排障、VOA、住宿登记、SIM 路由、地铁码、狂犬病路由）免费、无登录也可读公开版。登录只为保存档案和提醒。**不要付费墙支付/VOA/狂犬病。** 死人/滞留/漏登记会毁品牌。

**假设 2 — 付钱的是「材料要过关、时间比钱贵」的搬家者：**

| 产品 | 谁买 | 为何像钱 |
|---|---|---|
| Docs pack（开户+居留材料预填+扫描质检） | 新移民 | 替代自己死磕中文表 |
| HR letter / myth-buster 带官方摘录的 PDF | 新移民 | 已经有人要「gently tell him he's wrong」 |
| 医院陪诊脚本（非急诊）+ 保险直付对照 | 家庭、雇主 | 私立溢价 vs 公立迷宫；陪诊在板上是人肉 API |
| Family playbooks（择校地理、合同宠物条款） | trailing spouse | 低频高客单 |
| Concierge 转介持牌中介 | 雇主/个人 | 分账，**不是无证代办**。HeyShenzhen 写全包 ¥8,000–20,000 是市场锚，我们只拿介绍费 |

**假设 3 — 不收：** 招聘（版规赶走了，且 FESCO 在那儿）；房源抽佣（无证中介红线，且贝壳/Wellcee 在那儿）；支付手续费（无牌）。

**假设 4 — 不做广告污染 SOP。** 营业厅路由可以链三大运营商官方厅，不卖黄牛。语言学校比价可收展示，但 v1 不必。

价格数字除 HeyShenzhen 已写的中介包和 Reddit 用户报告（Co-Talk ~5500/30h、狂犬 $100/针、SIS 学费公开表）外，**本 spec 不编定价。** 创始人用成本+访谈定。

---

## 11. V1 slice（创始人先做这个，其余当噪音）

### 11.1 用户

- **访客：本周落地**（HK 过来 VOA / 机场 T3）  
- **搬家者：抵达后 14 天内**（Z/工作许可已在办或 HR 已联系）

不做：已住两年只找桌游的人；家庭择校；华强北采购。

### 11.2 Playbooks in

1. 支付矩阵 + 排障（PB-01）  
2. 5 日 VOA 罗湖 vs 西九龙（PB-03）  
3. 24h 住宿登记含再入境提醒（PB-02）  
4. SIM/eSIM 营业厅路由（PB-04）  
5. 地铁 Alipay Transport 乘车码（PB-05）  
6. HR 住宿登记单 vs 6 个月租约 one-pager（PB-10）

### 11.3 Playbooks out

住房 marketplace、医院挂号 RPA、社交/活动、华强北、学校、个税补贴、驾照、公积金、12306 出票、开户代办。

医院：v1 最多在支付/登记的「失败树」里放一张「被动物抓伤 → 去最近公立急诊」静态卡，不做成完整 PB-08。完整医院是 P0/P1 但不是 v1 切片——内容要实地核验开放时间和疫苗，4–6 周做不完。

### 11.4 成功指标

- **主指标：** 用户在真实窗口/闸机/App 里把一条 playbook 跑完，**没有去 r/shenzhen 发 how do I。** 用结束页一题：「Did you finish this at the counter/app without posting on Reddit?」  
- **定性金句：** 「this was the swimming-pool post, but for my case.」  
- **过程：** SOP last_verified 在 14 日内；官方冲突有并排展示；至少 3 条支付失败树有截图。  
- **不看：** 注册数、聊天轮次、Reddit 提及（提及还可能是被骂广告）。

### 11.5 建造顺序（4–6 周，偏内容不偏模型）

| 周 | 交付 |
|---|---|
| 0–1 | Intake schema + 档案页 + 空 playbook 渲染器（checklist + citation + speech card + 截图槽） |
| 1–3 | **三条：** 支付排障、VOA、住宿登记。每条先写死 SOP（YAML）+ 人工截图 + 官方 URL。模型只做填槽和中英话术 |
| 3–4 | Source freshness：VOA/公安页 fetch + last_verified 黄标。这是信任，不是功能彩蛋 |
| 4–5 | SIM 路由 + 地铁 QR（大量复用支付截图组件） |
| 5–6 | HR one-pager 生成 PDF；提醒引擎最小集（邮件，24h 登记）；着陆 SEO 三页（VOA hours / Alipay metro / accommodation registration） |

模型：用现成 LLM。护栏：playbook 步骤不可被模型改写；移民/医疗句子只许从 SOP 取出。**不要**这 6 周训练模型、不要 computer-use、不要微信登录。

### 11.6 v1 非目标

- 中文 UI  
- 微信/支付宝/i深圳代登录  
- 实时口岸排队（没有稳定数据源就不要假装）  
- 多城市（广州/上海会稀释 SOP 核验）  
- App Store  
- 社区 feed、积分、邀请码病毒（先让窗口办成）  
- 在 r/shenzhen 做任何增长实验

### 11.7 内容比模型重

v1 失败模式是 SOP 错，不是 GPT 不够聪明。游泳馆帖 25 分就胜过一堆 0 分 how-do-I，因为它可执行。创始人（中文）的工作是：去罗湖看一次 VOA 窗口、走一遍深圳公安小程序房屋码、用一张外卡把 Alipay Transport 录成截图。工程师的工作是让这些步骤版本化、可刷新、按护照分流。

---

## 12. Risks & open questions

### 12.1 已知风险

| 风险 | 为何真实 | 缓解 |
|---|---|---|
| **SOP 过期** | VOA 小时已在板上打过脸；支付「先 Alipay」也被美国用户打脸 | live fetch + 冲突并排 + last_verified；14 天黄标 |
| **像 r/shenzhen 一样厌新手** | 重复租房问被嘲 | 档案分流，不显示「这题问过了」；语气冷静、可执行 |
| **微信政策** | 后期公众号/登录；RPA 进微信可能违规 | v1 不碰；computer-use 独立评估 |
| **责任** | 用户按过期 VOA 小时错过窗口；按错误医院延误疫苗 | 免责+官方链+「verify at the window」；医疗只路由 |
| **双语人才** | 窗口话术需要像当地人，不是翻译腔 | 创始人中文审每一张 speech card；外籍试用者读英语侧 |
| **护照身份体系修不了** | i深圳刷脸、医院小程序、公积金、部分商户码 | 产品策略是绕，不是打通；文案禁止「我们接入了 i深圳」 |
| **增长渠道敌对** | 板上禁广告；一发就死 | SEO + 私下分享 + 学校/公寓；永不发帖推链接 |
| **样本偏差建错客群** | Reddit 弱可见非洲商人、日韩社群、工厂 | v1 承认服务英语护照访客/搬家者；其他语言不假装覆盖 |
| **Computer-use 诱惑** | 技术上能点微信 | 单独风险章节；v1 禁止 |

### 12.2 必须标未知、上线前要核的

1. **罗湖 VOA 此刻办公时间与是否仍 130 RMB。** 2025-11 实地 vs 网上 17:00，以 live 官方为准。  
2. **西九龙去程办 VOA 是否仍不行。** 单点实地，可能变。  
3. **全国住宿登记线上试点 2026 不含广东** 是否仍真。  
4. **机场一站式能否当场开银行卡。** 官方稿 vs HeyShenzhen，产品不当 SLA。  
5. **租客佣金半月还是一月。** Hi vs Hey，未用工商价目交叉。  
6. **12345 英语服务时段。** 仅 Reddit 评论提及。  
7. **幼儿园外教 2 年教龄** 是中介口还是公开文本。板上找不到法规。  
8. **TourCard 是否仍必要。** 评论分裂。  
9. **吃护照的具体营业厅名单。** 指南说「不是每家」，我们没有已核验地址表——v1 先链龙华/福田官方英文页，再实地补。  
10. **r/shenzhen 版主列表。** 本次 `/about/moderators.json` 403。  
11. **That's Mandarin / Co-Talk / MSCE / HeyShenzhen 是否愿当渠道。** 假设，未接触。  
12. **GBA 补贴个例金额。** 有官方通知转述，产品只解释不计算。

### 12.3 开放问题（不阻塞 v1）

- WhatsApp vs 邮件作为抵达前提醒，哪个到达率高？  
- Docs wallet 是否必须做端侧加密才能让人传护照扫描？  
- HR one-pager 会不会被公司法务反感？先做「官方材料摘录 + 链接」，少做指责语气。  
- 游客 SEO 流量会不会把客服拖死？公开页自助，登录才允许对话。  
- 要不要深港通勤者当第二 beachhead？法律分叉多（回乡证 vs 美国护照），v1 只给口岸时间，不给「住福田持港工签」方案。

---

## 附录 A — 北星帖结构（工程对照）

帖：[Want to swim at Bao'an Stadium but don't speak Chinese?](https://www.reddit.com/r/shenzhen/comments/1srgutv/want_to_swim_at_baoan_stadium_but_dont_speak/)（25 分，7 评）

作者给出：室内 35 RMB / 室外 20 RMB、深浅分区、1 号线宝体 A 出口、强制泳帽、**跳过 i深圳**、窗口或自助机、句子「你好，买一张成人票。」、先窗口拿 20 RMB 押金手环再过闸。评论补自助机截图与时段。

v1 每条 playbook 必须能映射到这些槽。缺截图就标「缺图」，不要用散文顶上。

## 附录 B — 证据与偏差备忘

- 订阅数 **32,680** 来自 `about.json`，不以 RedPulse 27,550 为准。  
- 抓取：hot/new/top 去重 225；评论 66 树；search 每主题最多 25。  
- 本次 listing **未作为主帖出现**（故不写成「板上推荐」）：Internations、szdaily、That's PRD、HeyShenzhen、SmartShanghai、Timeout、具体 Facebook 群名。这些在格局简报里作为外部产品存在，GTM 可以用，不要谎称 Reddit 用户在用。  
- 招聘去向：r/chinajobs。eSIM 有人让去 r/chinatravel 搜。  
- 法律条文以政府网站为准；Reddit 与英文指南只作摩擦证据。

## 附录 C — 创始人开工清单（v1）

1. 把 PB-01/02/03 写成 YAML SOP，每步带 `official_urls` 空也要留字段。  
2. 用外卡走一遍 Alipay：绑卡、商户码、**Transport 乘车码**，录屏切图。  
3. 走一遍「深圳公安」住宿登记到房屋码失败为止，记录失败文案。  
4. 罗湖口岸看 VOA 办公室门上的时间牌，拍照进库，写 last_verified。  
5. 英文着陆三页 + 邮箱登录 + 分栏 UI。  
6. 不要建 Discord 当产品，不要去 r/shenzhen 发帖。

— 完 —
