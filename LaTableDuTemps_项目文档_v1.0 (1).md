# La Table du Temps · 时间的餐桌

**法国菜系历史图谱 · 料理鼠王主题**
产品设计与技术文档 · 版本 1.0 · 2026年5月

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

### 2.2 五个历史时期与开场白框架

以下是五个时期的核心矛盾和 Remy 开场白的参考框架，最终文案需经内容优化后确定。

---

#### 时期一：中世纪宫廷菜（1300s–1600s）

**核心矛盾：** 食物是权力的展示，香料是财富的语言。讽刺：越贵的食材有时反而掩盖了食物本身的味道。

**Remy 开场白方向**

> *"You know what they used to put on meat back then? Sugar. SUGAR. On meat. I don't totally get it… but the smell? The smell was honest."*
>
> 你知道那个年代的人往肉上放什么吗？糖。糖！放在肉上。我到现在都没完全想明白……但那个气味？那个气味是诚实的。

---

#### 时期二：古典法餐诞生（1780s–1850s）

**核心矛盾：** Antonin Carême 把宫廷菜变成艺术，但艺术是属于贵族的。讽刺：菜肴第一次有了自己的"语法"，但这门语言不是所有人都能说的。

**Remy 开场白方向**

> *"Carême built pastries the way other people build cathedrals. Impressive. But sometimes I wonder — were they actually eating the food, or just… looking at it?"*
>
> Carême 造糕点，就像别人造大教堂一样。壮观。但有时候我会想——他们究竟是在吃东西，还是只是在……看？

---

#### 时期三：大饭店时代（1880s–1930s）

**核心矛盾：** Escoffier 把宫廷菜带进大饭店，首次让中产阶级吃到"高级法餐"。讽刺：普及是好事，但标准化也意味着个性的消失。

**Remy 开场白方向**

> *"Escoffier put haute cuisine into hotels. Finally, everyone could taste it. But when everyone makes the same béchamel the same way — is that still cooking? Or just… copying?"*
>
> Escoffier 把高级法餐带进了大饭店。终于，所有人都能尝到了。但当所有人都用同样的方式做同一款白酱——那还算是在烹饪吗？还是只是……在复制？

---

#### 时期四：Nouvelle Cuisine（1960s–1980s）

**核心矛盾：** Paul Bocuse 等人宣布反叛 Escoffier 的繁复，回归食材本味。讽刺：这一次，"少就是多"第一次成为了高级餐厅的哲学。

**Remy 开场白方向**

> *"Finally! Someone said: enough with the heavy sauces, let the vegetables speak! I would have loved to be there. Not to cook — just to smell the moment everything changed."*
>
> 终于！有人说：够了，别再堆那些厚重的酱汁了，让蔬菜自己说话！我真希望我当时在场。不是去做菜——只是去闻一闻，那个一切都改变了的瞬间。

---

#### 时期五：当代法餐（2000s—至今）

**核心矛盾：** 全球化与地方性的对话——高级餐厅用分子料理解构食物，小餐馆重新发现乡土食材。讽刺：周期回到了起点，马赛鱼汤和 Ratatouille 重新被重视。

**Remy 开场白方向**

> *"Today, the great chefs are molecularizing potatoes and rediscovering ratatouille. That's the paradox: the further you go, the more you come back to the beginning. I think I always knew that."*
>
> 现在，大厨们把土豆分子化，然后重新发现了 Ratatouille。这就是悖论：走得越远，越是回到起点。我想我一直都知道这件事。

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

页面分为左右两栏：左侧是时间轴（五个时期的垂直分区导航栏），右侧是以力导向图展示的菜肴关系图谱主体。用户点击左侧时期导航栏时，Remy 出现并念开场白，同时图谱右侧过滤展示该时期的菜肴节点。

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

- **缩放：** 支持鼠标滚轮 / 触屏捏合放大缩小
- **拖拽：** 可拖拽画布检视不同节点
- **边 hover：** 鼠标悬停在边上，显示关系类型标签（"演化自"）
- **节点 hover：** 显示菜肴名称和时期预览，不需点击
- **节点高亮：** 当前选中节点的直接前身/演化后裔一并高亮，帮助用户看清演化链条

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

MVP 阶段采集策略为：以 Wikidata SPARQL + Wikipedia 法语版构建骨架，以 Larousse Gastronomique 人工校准关键节点。合计三个步骤：

1. Wikidata SPARQL 批量查询法国菜肴实体，导出菜肴名、创作年代、厨师谱系等字段
2. 抓取 Wikipedia 法语版对应词条，提取 description 和 origin 字段
3. 对照 Larousse Gastronomique 校验年代和起源数据，人工修正不一致的条目

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
| 图谱渲染 | D3.js 力导向图 | 自动布局，交互流畅，与 Scentscape 共享组件库 |
| 动画 | Framer Motion | Remy 出场动画、节点展开动画 |
| 时间轴 | 自定义 SVG 导航栏 | 五个时期的垂直分区导航 |
| 后端 | Next.js API Routes | 数据接口，可与 Scentscape 共享部署 |
| 数据库 | JSON 静态文件（MVP） | MVP 阶段无需数据库，直接读取静态文件 |
| 数据抓取 | Python Scrapy + Wikidata API | 与 Scentscape 共享抓取工具链 |
| 部署 | Vercel | MVP 阶段内容量小，静态展开即可 |

### 6.2 前端组件结构

- `App.tsx` — 全局状态（当前时期、选中菜肴、Remy 动画状态）
- `EraTimeline` — 左侧时期导航栏（SVG），点击触发 Remy 开场白
- `DishGraph` — D3.js 力导向图主体，渲染菜肴节点和两种边
- `RemyMonologue` — Remy 开场白层（Framer Motion 动画）
- `DishPanel` — 菜肴详情面板，包含：
  - `DishInfo` — 语气 B 史实信息
  - `RemySensory` — 语气 C 感官旁白，点击展开

### 6.3 数据文件结构

MVP 阶段全部数据存为静态 JSON，目录结构如下：

```
/data
  eras.json       // 5 个时期节点
  dishes.json     // ~35 道菜肴节点（含 remySensory）
  edges.json      // evolved_from + era_sibling 两种边
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
| Phase 0：数据准备 | 第 1–3 周 | Wikidata 批量抓取 + 人工标注演化关系 + 完成 eras/dishes/edges.json |
| Phase 0.5：Remy 内容写作 | 第 3–5 周 | 5 段开场白（语气 A）+ 35 道菜肴双层内容（B+C） |
| Phase 1：静态原型 | 第 5–7 周 | 图谱布局 + 时期导航栏，无动画，用假数据验证 UI |
| Phase 2：交互层 | 第 7–9 周 | Remy 动画出场 + 节点详情面板 + 双层展开交互 |
| Phase 3：联调上线 | 第 9–12 周 | 接入真实数据、性能优化、移动端适配、公开上线 |

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

*文档结束 · La Table du Temps v1.0 · 如有更新请以最新版本为准*
