# ArgoMap — 项目状态看板

> 最后更新：2026-03-15
> PM：Claude Opus 4.6 ｜ 导演：Woody

## 协作模式（四 AI 流水线）

```
Woody（导演）── 方向 + 内容 + 最终拍板
       │
       ▼
Claude Opus 4.6（PM / CEO）── PRD、Spec、任务拆分、QA 审查
       │
       ├─ 设计简报 ──▶ Gemini 2.5 Pro（设计总监）
       │                  └─ UI 组件规格、Design Tokens、色彩/动效/断点
       │
       ├─ 任务工单 ──▶ Codex（工程师）
       │                  └─ Astro/React 代码、测试、PR、CI/CD
       │
       └─ 素材需求 ──▶ Nano Banana Pro（美术师）
                          └─ 地球纹理、城市插画、Gallery 占位图、Argo 形象
       │
       ▼
Claude Opus 4.6 ── QA 审查 ──▶ GitHub → Cloudflare Pages → argomap.com
```

**角色职责：**
- **Woody（导演）**：提供方向、内容素材、最终拍板
- **Opus 4.6（PM）**：把 Woody 的想法翻译成三份标准化交付物——给 Gemini 的设计简报、给 Codex 的任务工单、给 Nano Banana 的素材需求单。每轮产出回来后做 QA 审查
- **Gemini 2.5 Pro（设计总监）**：接收 UI 设计简报，输出组件规格（布局、色彩 token、动效参数、响应式断点）
- **Codex（工程师）**：接收技术 spec + Gemini 的设计产出，生成 Astro/React 代码、写测试、提 PR，直接推到 GitHub
- **Nano Banana Pro（美术师）**：接收素材简报，生成地球纹理、城市插画、Gallery 占位图、Argo 形象等视觉资产

> **当前阶段说明：** MVP 由 Opus 直接编码完成（兼任 PM + 工程师），后续功能迭代将按上述流水线分发任务

---

## 项目目标

为 8 岁半的 Argo 打造一个交互式个人旅行地图网站 argomap.com，首页是一颗在深空中缓慢跳动的写实地球，标记他去过的每一个地方。

---

## 当前状态

### 已完成 ✅

| 事项 | 备注 |
|------|------|
| 项目规划 + 技术栈选型 | Astro 5 + React 19 + Three.js 0.183 + Tailwind 4，Islands 架构 |
| GitHub 仓库 | `woodyai/argomap`，3 次提交，main 分支 |
| Cloudflare Pages 部署 | argomap.com 已上线，GitHub 推送自动部署 |
| Astro 项目脚手架 | React Islands、Tailwind 4.x、Content Collections (YAML)、Vite 优化配置 |
| 3D 地球组件 | R3F + Three.js，写实纹理贴图，心跳动效，大气层光晕，轨道控制 |
| 星海背景 | Canvas 动态星场 + 流星 + 星云光晕 |
| 城市标记系统 | 球面定位（latLng→Vec3），点击选择，hover 高亮 |
| 城市详情面板 | 右侧卡片：日记（中英）、照片占位、情绪 emoji、推荐列表 |
| 统计栏 | 动画计数器（国家/城市/地点），玻璃拟态风格 |
| 导航栏 | Logo + 语言切换按钮（ZH/EN）+ 响应式 |
| 装饰元素 | 热气球、飞机、闪电，CSS 动画 |
| 响应式布局 | 桌面（侧边栏）+ 移动端（纵向堆叠），768px 断点 |
| SSR 降级方案 | `client:only` 加载前显示标题 + loading spinner，React 挂载后隐藏 |
| 移动端白屏修复 | `useIsMobile` 初始化修正 + SSR fallback |
| 城市内容（4 城） | 北京、香港、京都、大阪，中英双语日记/情绪/推荐 |

### 进行中 🔄

| 事项 | 状态 |
|------|------|
| 视觉细节打磨 | Woody 反馈需要更精致的视觉效果 |

### 未完成 ⬜

| 事项 | 优先级 | 备注 |
|------|--------|------|
| 补充更多城市数据 | P0 | 目前只有 2 国 4 城，缺上海、澳门等已知城市 |
| 真实照片替换 | P1 | 当前照片区域为彩色占位块，需 Woody 提供 |
| 多语言内容切换 | P1 | 按钮已有，但切换不影响实际内容显示 |
| Gallery 页面 | P2 | 瀑布流照片/画作展示 |
| About 页面 | P2 | Argo 介绍、旅行时间线、统计卡片 |
| SEO + Open Graph | P2 | meta 标签、社交分享卡片 |
| 性能优化 | P3 | 低端设备 Three.js 降级、Lighthouse 优化 |

---

## 技术架构

```
src/
├── components/
│   ├── StarBackground.tsx   - Canvas 星场 + 流星
│   ├── Navbar.tsx           - 导航栏 + 语言切换
│   ├── Globe.tsx            - R3F 3D 地球 + 城市标记
│   ├── MapExperience.tsx    - 主布局编排（桌面/移动端）
│   ├── StatsCounter.tsx     - 动画统计栏
│   ├── MemoriesPanel.tsx    - 城市详情侧边栏
│   └── FloatingElements.tsx - 装饰动画元素
├── data/cities/             - YAML 城市内容集合
│   ├── beijing.yaml
│   ├── hong-kong.yaml
│   ├── kyoto.yaml
│   └── osaka.yaml
├── content.config.ts        - Astro 内容集合配置
├── types.ts                 - CityData TypeScript 接口
├── layouts/Layout.astro     - 根模板
├── pages/index.astro        - 首页入口
└── styles/global.css        - Tailwind 4.x 主题 + 动画
```

**关键技术决策：**
- 地球纹理用 `earth_day.jpg`（CDN 来源，亮度 121），不用 blue-marble（太暗）
- 材质用 `useMemo` + 命令式创建（R3F 声明式 JSX 在 null→texture 过渡时有 bug）
- 纹理加载必须用 `useLoader` + `<Suspense>`（手动 load + useState 会导致黑/白球）
- 渲染管线：`flat={true}` + 手动设 `LinearSRGBColorSpace`（R3F 当前版本不自动设）

---

## 待办清单

### P0 — 内容补全（阻塞丰富度）

| # | 任务 | 需要 Woody | 说明 |
|---|------|-----------|------|
| 1 | **补充城市数据** | ✅ | 上海、澳门等已知城市，以及其他国家/城市。提供：城市名 + 国家 + 时间 + 关键记忆点 |
| 2 | **提供真实照片** | ✅ | 每个城市 3-5 张旅行照，替换彩色占位块 |

### P1 — 功能完善（启动四 AI 流水线）

| # | 任务 | 执行者 | 需要 Woody | 说明 |
|---|------|--------|-----------|------|
| 3 | **输出三份 AI 协作工单** | Opus → Woody 执行 | ✅ 分发 | Opus 输出 Gemini 设计简报 + Codex 任务工单 + Nano Banana 素材需求，Woody 分发到各平台 |
| 4 | 视觉细节优化 | Gemini 设计 → Codex 实现 | ❌ | 根据 Woody 反馈，Gemini 出设计规格，Codex 编码落地 |
| 5 | 多语言内容切换 | Codex | ❌ | 让 ZH/EN 按钮实际切换面板内容 |
| 6 | 移动端体验优化 | Codex | ❌ | 地球触控交互、面板滑动、字体适配 |

### P2 — 新页面

| # | 任务 | 执行者 | 需要 Woody | 说明 |
|---|------|--------|-----------|------|
| 7 | Gallery 页面 | Gemini 设计 → Codex 实现 | ✅ 素材 | 瀑布流展示 Argo 画作/照片 |
| 8 | About 页面 | Gemini 设计 → Codex 实现 | ✅ 素材 | Argo 介绍 + 旅行时间线 |
| 9 | 地球纹理 / 城市插画 / Argo 形象 | Nano Banana | ❌ | 视觉资产生成，替换当前占位素材 |

### P3 — 上线打磨

| # | 任务 | 执行者 | 需要 Woody | 说明 |
|---|------|--------|-----------|------|
| 10 | SEO + Open Graph | Codex | ❌ | meta 标签、社交分享卡片、sitemap |
| 11 | 性能优化 | Codex | ❌ | 图片懒加载、Three.js 低端降级、Lighthouse 80+ |
| 12 | 最终 QA 审查 | Opus | ❌ | 全站走查，内容校对，交互验收 |

---

## Woody 行动清单

- [ ] **补充旅行数据** — 除北京/香港/京都/大阪外，Argo 还去过哪些城市？上海、澳门的记忆点？其他国家？
- [ ] **确认启动三份 AI 工单** — 告诉我「开始」，我立刻生成 Gemini / Codex / Nano Banana 三份 Prompt，你复制粘贴到各平台执行
- [ ] **准备照片素材** — 每个城市 3-5 张旅行照片
- [ ] **准备 Gallery 素材**（可后续）— Argo 的画作/摄影作品
- [ ] **准备 Argo 形象**（可后续）— About 页用的头像或插画风格

---

## 关键决策记录

| 日期 | 决策 | 理由 |
|------|------|------|
| 2026-03-15 | 技术栈 Astro 5 + React 19 + Three.js + Tailwind 4 | Cloudflare Pages 兼容，Islands 按需加载 3D |
| 2026-03-15 | 视觉方向「深空写实梦幻」 | Woody 参考图驱动，心跳 1.5s 慢节奏 |
| 2026-03-15 | 部署 GitHub → Cloudflare Pages | argomap.com 域名已绑定，自动部署 |
| 2026-03-15 | 四 AI 协作流水线 | Opus(PM) → Gemini(设计) + Codex(工程) + Nano Banana(素材)，MVP 阶段 Opus 兼任工程 |

---

## Git 历史

```
c025dde Fix mobile blank screen: add SSR fallback and fix useIsMobile init
1ffc09d Add content collections, city interactivity, and mobile responsive layout
e61337b Initial commit: ArgoMap homepage with 3D globe
```

---

## 风险与注意事项

| 风险 | 影响 | 缓解方案 |
|------|------|---------|
| 城市数据不完整 | 地球上标记太少，体验单薄 | 架构已设计为「加 YAML 即加城市」，补数据零开发成本 |
| 三个 AI 产出风格不一致 | 设计和代码脱节 | Opus 统一出 design brief，Codex 实现前先审 Gemini 产出 |
| 照片占位影响观感 | 面板看起来不真实 | 先保留彩色占位，真实照片到位后无缝替换 |
| Three.js 移动端性能 | 低端手机卡顿 | 已有响应式布局，后续可加低端设备 2D 降级 |
| 三方纹理 CDN 依赖 | 纹理加载失败 | 已下载到 `/public/textures/`，本地伺服 |

---

*这份文档是活的，每次推进后会更新状态。*
