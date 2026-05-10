# La Table du Temps · 时间的餐桌

**法国菜系历史图谱 · 料理鼠王主题**
产品设计与技术文档 · 版本 1.4 · 2026年5月

> *"Anyone can cook — but only the fearless can be great."*
> — Gusteau's, Ratatouille (2007)

---

## 目录

1. [项目概述](#1-项目概述)
2. [叙事框架](#2-叙事框架)
3. [图谱数据结构](#3-图谱数据结构)
4. [交互设计](#4-交互设计)
5. [数据来源与采集](#5-数据来源与采集)
6. [技术架构](#6-技术架构)
7. [MVP 范围与里程碑](#7-mvp-范围与里程碑)
8. [后续规划](#8-后续规划)

---

## 1. 项目概述

### 1.1 核心定位

La Table du Temps（时间的餐桌）是一个法国菜系历史关系图谱，以《料理鼠王》电影的叙事框架展开——由 Remy 作为导游，带领用户穿越五个历史时期，探索法国菜五个世纪的演变脱变。

图谱的信息层是客观的历史数据，Remy 的旁白是主观的情绪锚点——两者分离，各司其职。用户看到的是一张可信的历史地图，感受到的是一个局外人用鼻子提出的问题。

### 1.2 目标用户

- **法国菜 / 饮食爱好者（核心用户）：** 对法国菜历史感兴趣，希望超越菜谱了解"这道菜从哪里来"的人。
- **《料理鼠王》电影粉丝（情感入口用户）：** 因电影而来，被 Remy 的叙事观点吸引，对历史知识的兴趣是附带的。
- **食物内容创作者：** 需要具有可信度、有视觉吸引力的参考资料源。

### 1.3 与其他项目的关系

La Table du Temps 与 Scentscape（香水可视化平台）共同构成一个产品家族——两者都在尝试把"无法直接感知"的东西可视化：一个射向气味，一个射向历史。共享基础设施：D3.js 组件库、Python 抓取工具链、设计系统。

---

## 2. 叙事框架

### 2.1 Remy 作为导游的逻辑

电影里的 Remy 是一个局外人闯入精英世界、重新发现食物本质的角色。这个结构和法国菜历史有一个天然的呼应：法国菜历史本身就是一部"谁有资格定义好食物"的斗争史。每个时期都有一个"规则被打破"的故事，Remy 的局外人视角恰好就是旨在指出这种打破。

每个历史时期，Remy 用语气 A（活泼充满的电影语气）开场：用情绪调动用户进入这个时期的核心矛盾。每道菜肴节点内，默认显示语气 B（史实信息），用户点击"听 Remy 说"后展开语气 C（感官旁白）。

**三套语气内容均已完成（2026-05-05）：**
- **语气 A**：`eras.json` → `remyMonologue` 字段，5 段纯中文 Remy 开场白，每段以悬念或反问收尾，引导用户进入时期核心矛盾
- **语气 B**：`dishes.json` → `description` 字段，28 道菜肴史实描述（80–120 字）
- **语气 C**：`dishes.json` → `remySensory` 字段，28 道菜肴 Remy 第一人称感官旁白（80–120 字）

### 2.2 五个历史时期与开场白框架

以下是五个时期的核心矛盾和 Remy 开场白，与 `eras.json` 中 `coreConflict` / `remyMonologue` 字段保持一致（2026-05-07 人性化修订版）。

---

#### 时期一：中世纪宫廷菜（1300s–1600s）

**核心矛盾：** 食物是权力的展示。香料越昂贵，主人越有地位——但代价是，味道往往被盖住了。

**Remy 开场白**

> 等等等等——你知道他们在肉上面放糖吗？糖！放在肉上！我第一次听到这个的时候，胡须都竖起来了。但后来我仔细想了想：这里的食物根本不是给你吃的，是给你看的。香料越贵，主人越有地位。那道菜先在眼里，才在嘴里。所以问题来了：如果一道菜首先是证明，其次才是食物，那它还算料理吗？

---

#### 时期二：古典法餐诞生（1780s–1850s）

**核心矛盾：** Carême 给法餐写了第一份规则手册：哪种酱汁配哪类肉，摆盘要达到什么形态。规则是真的，但那个厨房只在贵族家里开放。

**Remy 开场白**

> 好，画面是这样的：一个人，穿着白色厨师服，在厨房里造……大教堂。我没在开玩笑。Carême 用糖和奶油建造的东西，需要一把卷尺才能做完。但有一个问题——你能吃大教堂吗？这个时代，法餐第一次有了真正的规则。哪道菜先上，哪种酱汁配什么，摆盘的高度和对称——但这些规则，只在贵族的餐桌上运转。

---

#### 时期三：大饭店时代（1880s–1930s）

**核心矛盾：** Escoffier 把规则写进了手册，大饭店的厨师可以按步骤出品高级法餐。中产阶级第一次坐进那种餐厅，但巴黎和伦敦的菜，越来越难区分了。

**Remy 开场白**

> 规则。规则。还是规则。Escoffier 写了一本书，把每一款酱汁、每一道汤都标准化了。全球大饭店的厨房都在照着同一本书做菜——这一点我真的很佩服他。终于，不只是贵族才能吃到高级法餐了。但我一直有个问题：当所有人都用同一个配方，厨师还剩下什么？

---

#### 时期四：Nouvelle Cuisine（1960s–1980s）

**核心矛盾：** Paul Bocuse 他们厌倦了 Escoffier 那套厚重的酱汁和繁复的摆盘。新主张是：食材够好的话，别多碰它。蔬菜第一次可以当主角，不需要解释理由。

**Remy 开场白**

> 终于有人说了！「够了，Escoffier，我们不需要你的三十六种酱汁。」我简直想为 Bocuse 他们鼓掌。少放一点，但要更好——这是他们的规矩，不是宣言。蔬菜第一次不需要理由就可以站到菜单中间。我真希望我当时在那个厨房里，去闻一闻那天的橄榄油是怎么加进去的。

---

#### 时期五：当代法餐（2000s—至今）

**核心矛盾：** 顶级餐厅用液氮和低温慢煮重新定义食物，小馆子翻出了祖母留下的食谱。两件事同时发生，不是巧合，是同一个问题在两个方向上找答案。

**Remy 开场白**

> 你知道现在的顶级厨师在做什么吗？他们用液氮冻土豆，然后……然后回头去重新发现 Ratatouille。我不是在抱怨，我只是觉得这件事有点好笑。绕了那么大一圈，最后把普罗旺斯农家菜放在了米其林菜单上。分子料理、乡土食材、记忆与技法——好吧，同一张菜单什么都有了。但我有个问题一直没想通：你到底在为谁做菜？

---

## 3. 图谱数据结构

### 3.1 节点类型

图谱有两种节点类型，在视觉上应有明确区分：

| 节点类型 | 字段 | 说明 |
|---------|------|------|
| 历史时期（Era） | id, label, period, coreConflict, remyMonologue, color | 共 5 个，作为时间轴分区维度，不与菜肴连线 |
| 菜肴（Dish） | id, name_fr, name_zh, era, origin, description, remySensory, keyIngredients[], chef | 每个时期 5–8 道，共 ~35 个节点 |

### 3.2 边类型

MVP 阶段只实现两种边类型，视觉展示形式应有区分：

| 边类型 | 连接对象 | 语义 | 建议视觉样式 |
|-------|---------|------|------------|
| 演化自（evolved_from） | Dish → Dish | 某道菜肴在历史上演变自另一道菜肴 | 实线带箭头，暗黄色 |
| 同时期代表作（era_sibling） | Dish → Dish | 同一时期内共同代表这个时代的菜肴群 | 虚线，浅棕色 |

### 3.3 数据对象结构

**Era 对象**

```json
{
  "id": "medieval | careme | escoffier | nouvelle | contemporary",
  "label": "Nouvelle Cuisine (1960s–1980s)",
  "period": "1960–1985",
  "coreConflict": "该时期的核心矛盾（一句话）",
  "remyMonologue": "Remy 语气 A 开场白（法语）",
  "color": "#8B6914"
}
```

**Dish 对象**

```json
{
  "id": "string",
  "name_fr": "Bouillabaisse",
  "name_zh": "马赛鱼汤",
  "era": "escoffier",
  "origin": "普罗旺斯，18世纪",
  "description": "语气 B：80–120字历史描述",
  "remySensory": "语气 C：Remy 第一人称感官旁白（80–120字）",
  "keyIngredients": ["藏红花", "海鲜", "橄榄油"],
  "chef": "相关厨师（可空）"
}
```

### 3.4 MVP 菜肴节点列表

每个时期 6–8 道，MVP 共 ~35 个节点。以下为各时期的代表菜肴及其主要演化关系。

| 时期 | 菜肴（法语 / 中文） | 演化关系 |
|------|-------------------|---------|
| 中世纪 | Hypocras / 香料葡萄酒 | → 影响后期酒醅类饮品 |
| 中世纪 | Blanc manger / 白色冻糕 | → 演化为近代 Blancmange |
| 中世纪 | Potage / 浓汤 | → 受 Carême 精化为 Consommé |
| 中世纪 | Oublie / 薄脆饼 | → 演化为 Gaufrette 华夫饼 |
| Carême | Consommé / 清汤 | 演化自 Potage；→ 影响 Escoffier 对高汤的定义 |
| Carême | Vol-au-vent / 酥皮盒 | → 演化为当代 Feuilleté |
| Carême | Charlotte russe / 俄式夏洛特 | 同期代表作；→ 影响后世 Charlotte 系列 |
| Carême | Béchamel / 白酱 | 同期代表作；→ Escoffier 五母酱基础 |
| Escoffier | Sauce béchamel / 白酱（标准化） | 演化自 Carême；→ Nouvelle Cuisine 的反叛对象 |
| Escoffier | Pêche Melba / 蜜桃梅尔芭冰淇淋 | 同期代表作 |
| Escoffier | Tournedos Rossini / 罗西尼牛柳 | 同期代表作；→ Nouvelle 简化版升起 |
| Escoffier | Bouillabaisse / 马赛鱼汤 | 演化自民间传统；→ Nouvelle 以其为回归第一原则 |
| Nouvelle | Ratatouille / 普罗旺斯式烧蔬菜 | 演化自民间版本；同期代表作 |
| Nouvelle | Salade niçoise / 尼斯沙拉 | 同期代表作；→ 影响当代轻食沙拉文化 |
| Nouvelle | Mousse au chocolat / 巧克力慕斯 | 同期代表作；→ 当代分子料理重构的祖先 |
| 当代 | Ratatouille（当代重读） | 演化自 Nouvelle 版；同期代表作 |
| 当代 | Brioche perdue / 法式吐司 | 演化自民间传统；同期代表作 |

---

## 4. 交互设计

### 4.1 整体布局

产品分为两个路由：

**首页（`/`）：** 叙事入口。不直接展示图谱，而是通过 Remy 的引言和标题动画建立情绪基调。布局为非对称两栏（62/38），左侧为断行超大标题（"La / Table / du / Temps"，最大字号 `clamp(120px, 22vw, 320px)`，"Temps" 有意越出列边界），右侧为中文副标题、Remy 开场引言、元信息和下行 CTA。顶部左对齐五时代色彩圆点（7px）作为视觉索引。

**探索页（`/explore`）：** 三栏固定布局：左侧时间轴导航栏（`EraTimeline`，224px）+ 中央图谱（`DishGraph`，弹性宽度）+ 右侧菜肴详情面板（`DishPanel`，384px）。用户点击左侧时期导航栏，图谱中该时期的节点和边高亮，其余时期节点降低透明度（所有节点始终可见，不做过滤）。

### 4.2 菜肴节点展开逻辑

点击任意菜肴节点，弹出详情面板，分两层展示：

| 层次 | 内容 | 语气 |
|------|------|------|
| 默认展开 | 菜肴法语/中文名、年代、起源、80–120字历史描述、关键食材 | 语气 B：信息密度为主 |
| 点击"听 Remy 说" | Remy 第一人称感官旁白（80–120字），展开动画 0.3s ease-out | 语气 C：感官为主，几乎无显性历史信息 |

"听 Remy 说"这个动作设计为类似小鼠偏头嗅闻的简单图标＋文字，点击后文字区域向下滑动展开。再次点击可收起。

### 4.3 时期入场交互

- 用户点击左侧时期导航栏
- Remy 动画出场（巴黎屋顶飞入画面），开始念开场白（法语已附中译字幕）
- 开场白完毕后图谱右侧平滑过滤进入该时期的菜肴页面
- 时期导航栏高亮当前时期，其他时期可点击切换

### 4.4 图谱交互细节

- **缩放：** 支持鼠标滚轮 / 触屏捏合放大；最小缩放锁定为初始铺满比例（scale=1），不可缩小至容器以下
- **拖拽：** 可拖拽画布检视不同节点
- **节点 hover（已实现）：** 与该节点有连边的节点保持高亮，其余节点降低透明度至 0.15；标签颜色同步加深；连边高亮（`evolved_from` opacity 0.95 / `era_sibling` opacity 0.7），其余边淡出至 0.04。鼠标离开时正确恢复当前时期筛选状态（而非全局默认值）。
- **节点高亮：** 当前选中节点显示发光光环（`node-glow`），描边加粗
- **边 hover：** 鼠标悬停在边上，边加粗高亮（cursor 变为 pointer）
- **边点击：** 点击任意边，弹出 **EdgePopup** 浮窗，展示两端菜肴名称（法文+中文）、关系类型图标、以及该条演化/关联关系的历史叙述（`reason`）；点击浮窗外部或按 Escape 关闭
- **时期选中 → coreConflict 展开（已实现）：** 点击左侧时期导航栏时，该时期的 `coreConflict` 文字以动画滑入展示于时期标签下方，切换时期或取消选中时自动收起
- **节点选中描边：** 选中节点描边改为该节点所属时代色（非黑色），宽度 2px；点击后不产生浏览器默认 focus outline（CSS `outline: none` 覆盖）
- **缩放重置：** 图谱右上角提供"↺ 重置视图"按钮；双击画布同样触发 320ms 平滑归位（`easeQuadOut`）

### 4.5 边详情弹窗（EdgePopup）

点击图谱中任意连线后弹出，内容结构：

| 区域 | 内容 |
|------|------|
| 标题行 | `源菜肴法文名 → 目标菜肴法文名`（evolved_from 用 →，era_sibling 用 ⟷） |
| 副标题 | 两端菜肴中文名 |
| 关系徽章 | 边类型图标（实线箭头 / 虚线）+ "演化自" 或 "同时期代表作" 标签 |
| 历史叙述 | `reason` 字段内容，详述两道菜之间的历史关联；若暂缺则显示占位提示 |
| 关闭按钮 | 右下角 ✕ 关闭 |

弹窗位置跟随点击坐标，自动夹紧至视口边界内；使用 Framer Motion 淡入/缩放动画（0.2s）。

---

## 5. 数据来源与采集

### 5.1 主要来源

| 数据源 | 类型 | 可获取内容 | 访问方式 |
|-------|------|----------|---------|
| Larousse Gastronomique | 权威工具书 | 菜肴起源、年代、身份、厨师谱系 | 图书馆 / 数字版购买 |
| Wikipedia 法语版 | 结构化百科 | 菜肴历史词条，质量远高于英语版 | 网页抓取 / Wikidata SPARQL |
| Wikidata | 结构化数据库 | 实体关系查询（菜肴→厨师→时期） | SPARQL 端点，免费公开 API |
| Oxford Companion to Food | 学术工具书 | 食物文化及历史的深度条目 | 图书馆 / 权限访问 |
| Gallica（法国国家图书馆） | 历史文献 | 近代法语食谱原件，网站可搜索 | 免费公开，部分文献全文可下载 |
| UNESCO 非遗名录 | 官方认定 | 申遗法式美食条目，质量高 | 公开数据库 API |

### 5.2 数据采集策略

MVP 阶段采集策略为：以 Wikidata SPARQL + Wikipedia 法语版构建骨架，以 Larousse Gastronomique 人工校准关键节点。**已实现为五步自动化流水线（`scripts/collect/`）：**

| 脚本 | 功能 |
|------|------|
| `00_search_qids.py` | 以法文菜名调用 Wikidata `wbsearchentities` API，输出候选 QID 列表供人工确认 |
| `01_wikidata_fetch.py` | 按 `dish_qids.json` 批量抓取每道菜的 Wikidata 结构化字段（创作年份、食材、厨师、起源地） |
| `02_wikipedia_enrich.py` | 抓取 Wikipedia 法语版对应词条 extract，并交叉验证 QID 一致性 |
| `03_crosscheck.py` | 比对 dishes.json 现有字段与 Wikidata/Wikipedia 数据，输出差异报告（NEEDS_REVIEW / NEEDS_CORRECTION） |
| `04_build_candidates.py` | 合并差异，生成 `candidates_annotated`（含溯源注释）和 `candidates_clean`（可直接替换 dishes.json 的净版本） |

**QID 校准结果（2026-05-05）：** 28 道菜肴全部完成 QID 人工核对，23 条更新、5 条保留，3 条错误 QID（Q83620/Q3490985/Q14947524）通过 Wikipedia 交叉验证纠正。`dish_qids.json` 为权威 QID 锚定文件。

**时代字段说明：** 本项目以叙事主题而非严格创作年份分配时代。部分菜肴 Wikidata 创作年份与项目时代分配不符（如 `soupe-de-truffe` 创作于 1975 年属 nouvelle，但叙事上作为当代符号归入 `contemporary`）；此类情形在 `dish_qids.json` 中以 `ERA INTENTIONAL OVERRIDE` 注记，流水线不应自动覆盖。

### 5.3 演化关系边的建立

节点数据可以自动化获取，但菜肴之间的"演化自"边目前没有现成结构化数据源，需要人工从文献中提炼。建议劳动分配如下：

- **自动化（一周）：** 通过 Wikidata 和 Wikipedia 批量获取全部节点的基础信息
- **人工标注（两周）：** 逐一阅读对应条目（Larousse 等），确定演化关系，填充 evolved_from 字段
- **Remy 旁白写作（三周）：** 对 35 个菜肴节点各写一容 B+C 双层内容，5 个时期各写一段 A 开场白

---

## 6. 技术架构

### 6.1 技术选型

| 模块 | 技术选型 | 选用理由 |
|------|---------|---------|
| 前端框架 | React + TypeScript | 组件化便于分层视图管理 |
| 图谱渲染 | D3.js 分层静态布局 | 节点按时代分5行排列，位置固定可预期；保留缩放/拖拽；与 Scentscape 共享组件库 |
| 字体 | Cormorant Garamond（next/font/google） | 法式高端菜单字体，CSS 变量 `--font-cormorant`，仅加载 400/500 字重 |
| 动画 | Framer Motion | Remy 出场动画、节点展开动画 |
| 时间轴 | 自定义 SVG 导航栏 | 五个时期的垂直分区导航 |
| 后端 | Next.js API Routes | 数据接口，可与 Scentscape 共享部署 |
| 数据库 | JSON 静态文件（MVP） | MVP 阶段无需数据库，直接读取静态文件 |
| 数据抓取 | Python Scrapy + Wikidata API | 与 Scentscape 共享抓取工具链 |
| 部署 | Vercel | MVP 阶段内容量小，静态展开即可 |

### 6.2 前端组件结构

- `app/page.tsx` — 首页叙事入口，非对称两栏标题动画布局，Framer Motion stagger 入场
- `app/explore/page.tsx` — 探索页，三栏固定布局（EraTimeline + DishGraph + DishPanel）
- `lib/store.tsx` — Context + useReducer，5 个 Action：SET_ERA / SET_DISH / SET_EDGE / HIDE_REMY / TOGGLE_SENSORY；状态包含 `selectedEdge: SelectedEdge | null`；SET_DISH 同步重置 `remyVisible: false` 防止双 Remy 并存
- `lib/types.ts` — `SelectedEdge` 接口（sourceId / targetId / type / reason / x / y），`AppState` 含 `selectedEdge`
- `lib/utils.ts` — `ERA_COLORS` 为唯一色值真值源，`getEraColor(eraId)` / `getNodeRadius()` / `getEdgeDash()`；`eras.json` 与首页 `ERA_COLORS` 数组均与此处对齐
- `components/EraTimeline` — 左侧时期导航栏；时期圆点改为 `motion.div`（pulse 动画），激活状态用完整边框替代左边线 AI slop tell；入场动画 class `explore-panel-left`
- `components/DishGraph` — D3 分层图主体，分 3 个 useEffect（建图 / 时代高亮 / 节点选中）；新增"↺ 重置视图"按钮 + 图例节点大小行；入场动画 class `explore-panel-center`
- `components/DishGraph/useDishGraph.ts` — `resetZoomRef` 模式暴露 `resetZoom()`；era/dish 选中变化通过 D3 `.transition().duration().ease()` 平滑过渡（非瞬变）；节点 click focus outline 在 CSS 层消除
- `components/EdgePopup` — 点击边后的浮动弹窗（详见 4.5 节）；占位文案改为 Remy 语气
- `components/RemyMonologue` — Remy 开场白层（Framer Motion 动画），挂载于 layout 层
- `components/OrnamentalDivider` — 点线装饰分隔线（`lineColor` / `dotColor` props），供 EraTimeline 与 DishInfo 复用
- `components/DishPanel` — 菜肴详情面板，入场动画 class `explore-panel-right`；包含：
  - `DishInfo` — 语气 B 史实信息
  - `RemySensory` — 语气 C 感官旁白，点击展开
- `app/globals.css` — 三栏 CSS keyframe 入场动画（`enter-from-left` / `enter-fade` / `enter-from-right`）；`prefers-reduced-motion` 无障碍覆盖；SVG focus outline 消除

### 6.3 数据文件结构

MVP 阶段全部数据存为静态 JSON，目录结构如下：

```
/data
  eras.json       // 5 个时期节点
  dishes.json     // ~35 道菜肴节点（含 remySensory）
  edges.json      // evolved_from + era_sibling 两种边，每条边含 reason 字段（历史关联叙述）
```

---

## 7. MVP 范围与里程碑

### 7.1 MVP 边界

| 功能 | MVP 包含 | 理由 |
|------|---------|------|
| 五个历史时期导航栏 | 是 | 叙事主轴，必须完整 |
| ~35 道菜肴节点 | 是 | 每期 6–8 道，覆盖主要演化路径 |
| evolved_from + era_sibling 两种边 | 是 | MVP 边类型上限 |
| Remy 语气 A 开场白（5 段） | 是 | 情绪入场核心 |
| Remy 语气 B+C 菜肴旁白 | 是 | 节点双层内容 |
| 用户收藏 / 账号 | 否 | 验证内容价值前不做社交功能 |
| 菜肴搜索 | 否 | 二期功能，MVP 通过时期导航栏浏览 |
| 语言切换（中/英） | 否 | 中文优先，法语菜肴名保留原文 |

### 7.2 开发里程碑

| 阶段 | 时间 | 交付物 |
|------|------|-------|
| Phase 0：数据准备 | 第 1–3 周 | **已完成（2026-05-05）**：五步采集流水线（scripts/collect/00–04）+ 28 道菜肴 QID 人工核查 + eras/dishes/edges.json 数据完整 |
| Phase 0.5：Remy 内容写作 | 第 3–5 周 | **已完成（2026-05-05）**：5 段纯中文语气 A 开场白 + 28 道菜肴语气 B 史实描述 + 28 道菜肴语气 C 感官旁白 |
| Phase 1：静态原型 | 第 5–7 周 | **已完成（2026-05-05）**：分层图谱布局 + 时期导航栏 + 边详情弹窗（EdgePopup）+ 所有边 reason 数据 |
| Phase 1.5：交互补完 | — | **已完成（2026-05-05）**：节点 hover 邻居高亮（含时期筛选状态恢复修复）+ 时期 coreConflict 展开 + DishPanel 双层语气 B/C 交互 |
| Phase 1.6：视觉品质 | — | **已完成（2026-05-10）**：首页叙事入口（`/`）+ 探索路由（`/explore`）拆分；全站动画系统；色值统一；图谱交互细节（见 v1.4 变更记录） |
| Phase 2：交互层 | 第 7–9 周 | 待完成：Remy 动画出场优化（真实角色资源）+ 移动端布局适配 |
| Phase 3：联调上线 | 第 9–12 周 | 待完成：性能优化、SEO/元数据、Vercel 公开上线 |

### 7.3 成功指标（MVP 验证标准）

- 用户平均停留时长 ≥ 4 分钟（内容深度足够，与 Scentscape 的 3 分钟标准略高）
- 节点点击率 ≥ 70%（用户进入图谱后主动探索菜肴节点）
- "听 Remy 说"展开率 ≥ 50%（语气 C 内容被实际使用）
- 至少 1 个法国食物内容创作者主动联系合作（验证 B 端教育 / 内容合作潜力）

---

## 8. 后续规划

### 8.1 功能迭代路线

**V1.1（上线后 1–2 个月）**

- 菜肴搜索：支持搜索法语 / 中文名
- 厨师节点：为每个时期的代表厨师（Carême、Escoffier、Bocuse）增加人物节点，与菜肴连线
- "菜肴对比"：并排展示两道菜肴的演化路径和 Remy 旁白

**V1.2（上线后 3–4 个月）**

- 法国大区维度：为菜肴节点增加起源大区标注，支持按大区过滤
- 追加边类型：技法传承（如 roux 酱汁体系串联多道菜肴）
- Remy 语音旁白：如果能获得配音授权，加入 Remy 配音（公开版权来自 2007 年电影）

**V2.0（上线后 6 个月）**

- 展射到其他菜系：意大利、西班牙等有深度历史跟踪的菜系
- B 端内嵌：法国餐厅 / 食物展览可嵌入图谱展示组件
- 社区功能：用户可提交自己知道的菜肴历史轶事，经编辑后入库

### 8.2 与 Scentscape 协同

两个项目共同构成一个产品家族——都在尝试把"无法直接感知"的东西可视化。建议共享：

- **D3.js 组件库：** 香调轮（极坐标环形图）与菜系图谱（力导向图）共享封装
- **数据抓取工具链：** Python Scrapy 框架可复用
- **设计系统：** 视觉语言保持一致，便于未来整合为同一产品家族
- **部署基础设施：** Vercel + Next.js API Routes 共享，降低运维成本

---

---

## 9. 变更记录

### v1.4 · 2026-05-10

**首页叙事入口 + 路由拆分**

- 新增 `app/page.tsx`：叙事入口页，非对称两栏布局（62/38），左侧超大标题（"Temps" 越出列边界），右侧 Remy 引言 + CTA；Framer Motion stagger 逐词入场动画
- 新增 `app/explore/page.tsx`：图谱体验迁移至 `/explore` 路由，三栏固定布局
- 首页顶部彩色条改为左对齐七像素圆点（五时代色，scale 入场动画）

**全站色值统一**

- 以 `lib/utils.ts` `ERA_COLORS` 为唯一真值源；`data/eras.json` 与首页 `ERA_COLORS` 数组同步更新，消除三处色值不一致

**动画系统**

- `app/globals.css` 新增三栏入场 keyframe（左滑 / 淡入 / 右滑），`explore-panel-left/center/right` class 自动触发，delay 依次错开 0.07s
- `useDishGraph.ts`：时代高亮与节点选中改为 D3 `.transition().duration().ease(d3.easeCubicOut)` 平滑过渡（原为瞬变）
- `EraTimeline` 时代圆点改为 `motion.div`，激活时执行 pulse scale 动画

**图谱交互细节**

- 新增"↺ 重置视图"按钮（右上角）；双击画布触发 320ms 平滑归位（`easeQuadOut`）
- 图谱图例新增节点大小说明行（大圆 = 主厨代表作）
- 节点选中描边：从深黑 `rgba(28,20,16,0.90)` 改为该节点所属时代色；点击后 browser focus outline 消除（CSS `outline: none`）

**Bug 修复**

- 修复 7 处 React `className` 双写 bug（同一元素两个 `className` 属性，后者静默覆盖前者），受影响组件：`DishInfo`（菜肴法文名丢失 `text-2xl`）、`RemySensory`（2 处）、`RemyMonologue`（1 处）、`EdgePopup`（2 处）
- `EraTimeline` 激活状态从 `borderLeft` 左边线改为完整 `border` 1px（消除 AI slop tell）；`coreConflict` 展开内容去除左色条
- `EraTimeline` 标题层级修正："La Table du Temps" 为主（14px / weight 500），"时间的餐桌" 为副（12px / opacity 0.38）
- `EraTimeline` 时代连接线改为 `self-stretch` + `minHeight: 16px`（消除固定高度导致的长度不足）
- `EdgePopup` 占位文案从开发临时文字改为 Remy 语气提示
- `lib/store.tsx`：`SET_DISH` action 增加 `remyVisible: false`，防止切换菜肴时 Remy 旁白意外保持展开
- `prefers-reduced-motion` 无障碍覆盖：所有动画在系统减弱动画设置下缩减至 0.01ms

---

### v1.3 · 2026-05-10

**视觉重设计：米其林餐厅菜单风格**

整体从黑色深色主题切换为暖色调浅色主题，视觉基调参照法式高端餐厅菜单。

- **背景与面板：** `#0f0c07`（近黑）→ `#F7F3EA`（羊皮纸/象牙色）；面板改为 `rgba(247,243,234,0.88)` 半透明奶油色 + backdrop-filter 毛玻璃
- **文字：** 奶油色 `#f0e8d0` → 深浓缩咖啡棕 `#1C1410`（非纯黑，保留温度）
- **时代配色**（调整为在浅色背景上可读的饱和色）：

  | 时代 | 旧色 | 新色 |
  |---|---|---|
  | 中世纪 | `#C8742A` | `#8C4A1F` 赭石棕 |
  | 古典法餐 | `#B5943E` | `#9B7A2E` 古铜金 |
  | 大饭店时代 | `#7A9B3E` | `#4A7A54` 森林绿 |
  | Nouvelle Cuisine | `#3E8FA6` | `#2A5F82` 石板蓝 |
  | 当代法餐 | `#7A5AAA` | `#8B1A2B` 米其林勃艮第红 |

- **字体：** 引入 `Cormorant Garamond`（`next/font/google`，CSS 变量 `--font-cormorant`），应用于菜肴名称、Remy 旁白、引言等显示级文字；正文保留 Georgia 衬线体
- **细节装饰：** 标题区域与菜肴信息面板添加点线分隔线（线·点·线）；Remy 开场白气泡改为暖色调卡片；CSS `body::before` 纸张噪点纹理叠加（SVG feTurbulence）
- **阴影：** 所有弹窗/面板阴影从 `rgba(0,0,0,0.6–0.7)` 改为 `rgba(28,20,16,0.12–0.15)` 暖棕色调

**图谱缩放约束**

- `scaleExtent` 最小值 `0.3` → `1`：图谱初始状态按容器尺寸铺满（scale=1），禁止向外缩小，只允许放大

**代码清理（/simplify）**

- `fontFamily: 'var(--font-cormorant)...'` 内联样式重复 9 次 → 提取为 `globals.css` `.font-display` class，全组件用 `className="font-display"` 替换
- 点线装饰在 `EraTimeline` 与 `DishInfo` 中各自内联 → 提取为 `components/OrnamentalDivider.tsx` 共享组件（`lineColor` / `dotColor` props）
- `Cormorant_Garamond` 加载字重从 300/400/500/600/700 精简为仅 400/500，减少 3 个字体变体下载
- `${era.color}0E` 非标准十六进制透明度 → 统一为 `10`（与全库 `10/12/18/20/…` 命名一致）
- `style={{ opacity: 0.18 }}` 内联样式 → `opacity-[0.18]` Tailwind 任意值语法

---

### v1.2 · 2026-05-07

**内容人性化修订（/humanizer-zh 全量过滤）**

- `eras.json` `coreConflict`（5条）：去除"香料是财富的语言"等比喻套语，改为直陈事实
- `eras.json` `remyMonologue`（5条）：删除金句式结尾（"食材本身就是答案""走得那么远最后发现终点还在起点旁边"等），换成 Remy 具体的疑问和细节观察
- `dishes.json` `description`（28条）：删除"彰显了……的时代审美""体现了……的趋势""是……的证明"等 AI 套语，改为具体事实陈述
- `dishes.json` `remySensory`（28条）：去掉金句收尾（"最好的气味总是复数的""这是烹饪的另一种语言"等），结尾改为具体观察或 Remy 式追问
- `edges.json` `reason`（34条）：集中清理否定式排比（"不仅是……更是……"）、宣言式金句（"完成了它的历史使命""完成了从X到Y的跨越"）、宣传性大词（"美学宣言""精神""历史使命"），全部换成逻辑推导和直接陈述
- 本文档 2.2 节同步更新至 `eras.json` 最新版本，并移除"最终文案需经内容优化后确定"的过时备注

---

### v1.1 · 2026-05-05

**数据流水线**
- 实现五步采集脚本（`scripts/collect/00–04`），覆盖 Wikidata 搜索、结构化抓取、Wikipedia 富化、交叉校验、候选合并
- 完成 28 道菜肴全量 QID 人工核查：23 条更新，3 条错误 QID 通过 Wikipedia 交叉验证纠正（`foie-gras-contemporary` Q83620→Q34807；`soupe-de-truffe` Q3490985→Q16677587；`gelee-royale` Q14947524→Q25383981）
- `dish_qids.json` 建立为权威 QID 锚定文件，含置信度标注与叙事时代覆盖注记

**内容**
- `eras.json` `remyMonologue` 全部重写为纯中文语气 A，每段以悬念/反问收尾
- `soupe-de-truffe` 时代从 `nouvelle` 回撤为 `contemporary`（创作于 1975 年，但叙事定位为当代符号；`dish_qids.json` 标注 `ERA INTENTIONAL OVERRIDE`）

**UI 交互**
- `EraTimeline`：时期选中时以动画滑入展示 `coreConflict`，带时期色左边线，取消选中自动收起
- `useDishGraph`：修复节点 `mouseout` 在时期已选中状态下错误重置 opacity 的 bug——现在 mouseout 读取 `optionsRef.current.selectedEra` 恢复正确的时期筛选态（节点 0.18 / 边 0.04 淡出保持）

**待处理**
- 节点总数 28，未达规划 ~35 的目标，可补充 7 道（建议：Canard à l'orange、Vichyssoise、Confit de canard、Soufflé、Brioche 等）
- Remy 动画出场目前为 emoji + Framer Motion，待替换为真实角色资源
- 移动端布局未适配（三栏固定宽度）
- 未完成 Vercel 部署与 SEO 元数据配置

---

*文档结束 · La Table du Temps v1.4 · 如有更新请以最新版本为准*
