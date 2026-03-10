# ArgoMap — 项目规划书 / Project Blueprint

> **"A little explorer's journey, mapped across the world."**
> 一个小探险家的旅程，绘制在世界的每一个角落。

---

## 1. 项目概览 / Project Overview

**ArgoMap** (argomap.com) 是一个为 8 岁半的 Argo 打造的交互式个人旅行地图网站。首页以一颗跳动的 3D 地球为核心视觉，标记 Argo 从出生至今到过的所有国家与城市。每个地点可展开查看日记、照片、情绪记录和推荐内容。网站同时包含一个 Gallery 区域，展示 Argo 的绘画和摄影作品。

**阶段愿景：**
- **Phase 1（当前）**：Argo 的个人品牌展示站，完整可部署
- **Phase 2（未来）**：开放为 SaaS 工具，任何人可一键创建自己的 `***map.com`

---

## 2. 技术栈推荐 / Tech Stack

### 核心框架：Astro + React Islands

| 层级 | 技术选型 | 选择理由 |
|------|---------|---------|
| **框架** | Astro 4.x | 静态优先、零 JS 默认、Cloudflare Pages 原生支持、Islands 架构按需加载 React |
| **交互组件** | React 18 + react-three-fiber | 3D 地球和交互面板用 React Islands，其余页面纯静态 |
| **3D 地球** | Three.js (via @react-three/fiber + @react-three/drei) | 完全自定义的地球渲染、heartbeat 动画、zoom-in 交互 |
| **样式** | Tailwind CSS 4.x | 明亮清新主题、响应式、快速开发 |
| **内容管理** | Astro Content Collections (Markdown/MDX + JSON) | 文件即数据库，新增地点只需添加文件，Git 版本控制 |
| **国际化** | astro-i18n + 自定义方案 | 中英双语基础 + 按国家动态加载语种 |
| **动效** | Framer Motion + GSAP | 页面过渡、面板展开、滚动动画 |
| **部署** | GitHub → Cloudflare Pages | 全球 CDN、自动部署、免费额度充足 |

### 为什么不选其他方案？

- **Next.js**：功能强大但对纯静态站过重，Cloudflare Pages 支持不如 Astro 原生
- **纯 HTML + Three.js**：无法享受组件化开发和内容管理的便利，后续 SaaS 化困难
- **Vue/Nuxt**：生态可行但 react-three-fiber 是 3D Web 最成熟的 React 生态，切换成本高
- **globe.gl**：封装度高但自定义受限，无法实现 heartbeat 等细腻动效

---

## 3. 信息架构 / Site Architecture

```
argomap.com
│
├── / (首页 - 跳动地球)
│   ├── 3D 地球（可旋转、可缩放）
│   ├── 已访问国家高亮标记
│   ├── 点击国家 → zoom in 到城市级别
│   └── 右侧/底部滑出详情面板
│
├── /gallery (画廊)
│   ├── 绘画作品集
│   ├── 摄影作品集
│   └── 按国家/时间线筛选
│
├── /about (关于 Argo)
│   ├── Argo 的简介
│   ├── 旅行统计数据
│   └── 时间线视图
│
└── /[lang] (语言切换)
    ├── /zh (中文)
    ├── /en (English)
    ├── /ja (日本語) — 因为去过日本
    └── ... (每到一个新国家，增加一种语言)
```

---

## 4. 页面详细设计 / Page Design

### 4.1 首页 — 跳动的地球

**视觉基调：** 明亮清新 + 童趣感，白色/浅灰底色，彩色点缀

**背景层：**
- 浅色渐变底（#F0F4FF → #FFFFFF）
- 轻柔的几何粒子/气泡浮动动效（明亮版粒子流）
- 微妙的光晕效果

**地球核心：**
- 3D 地球居中展示，材质明亮清新（浅蓝海洋 + 浅绿/米白陆地）
- **Heartbeat 动画**：地球以心跳节奏轻微缩放（scale: 1.0 → 1.03 → 1.0），伴随柔和光环脉冲
- 地球缓慢自转（约 60s 一圈）
- 已访问国家/城市用标记点显示：
  - 未访问区域：默认浅色
  - 已访问国家：亮蓝色区域高亮（#3B82F6）
  - 已访问城市：彩色跳动光点 + hover 时显示城市名

**交互流程：**
```
地球自转展示 → 用户点击某个高亮国家
  → 相机 zoom in + 地球旋转到该区域
    → 显示该国家的城市标记点
      → 点击城市标记
        → 右侧面板滑出，展示详情内容
```

**详情面板（右侧抽屉）：**
- 城市名称（中英双语 + 当地语种）
- 访问日期
- Argo 的日记摘录
- 照片轮播（3-5 张精选）
- 情绪标签（如：😊 开心、🤩 惊喜、🎨 创作灵感）
- 热门推荐（Argo 推荐的当地美食/景点/体验）
- 语言小知识（该国家的一句当地语言，如"ありがとう = 谢谢 = Thank you"）

**顶部导航栏：**
- Logo：ArgoMap（手写体 + 地球图标）
- 导航：Home | Gallery | About
- 语言切换器：🌐 中/EN/日...
- 旅行计数器："3 Countries · 6 Cities · ∞ Stories"

### 4.2 Gallery — 小艺术家的作品集

**布局：** 瀑布流 / Masonry Grid

**分类方式：**
- 按类型：🎨 绘画 | 📷 摄影
- 按地点：哪个国家/城市创作的
- 按时间：时间线浏览

**单作品卡片：**
- 作品图片（支持点击放大 Lightbox）
- 作品名称（中英双语）
- 创作地点 + 日期
- Argo 的创作感言（一两句话）
- 作品使用的媒介（水彩/蜡笔/iPad/相机等）

**特色功能：**
- 作品关联地图：点击某幅画可以在小地图上看到创作地
- "环球艺术家"统计：已在 X 个国家创作过作品

### 4.3 About — 关于 Argo

- Argo 的头像/插画形象
- 一段简短的自我介绍（童趣语气，中英双语）
- 旅行数据可视化：
  - 去过的国家数
  - 去过的城市数
  - 飞行总里程（估算）
  - 学会说的语言数
- 旅行时间线（垂直滚动，每个节点是一次旅行）

---

## 5. 数据结构设计 / Data Schema

### 5.1 目录结构

```
src/
├── content/
│   ├── countries/
│   │   ├── china.json
│   │   ├── japan.json
│   │   └── ...
│   ├── cities/
│   │   ├── beijing.mdx
│   │   ├── shanghai.mdx
│   │   ├── hong-kong.mdx
│   │   ├── macau.mdx
│   │   ├── osaka.mdx
│   │   ├── kyoto.mdx
│   │   └── ...
│   ├── gallery/
│   │   ├── painting-001.mdx
│   │   ├── photo-001.mdx
│   │   └── ...
│   └── i18n/
│       ├── zh.json
│       ├── en.json
│       └── ja.json
├── data/
│   └── globe-markers.json  ← 地球标记点坐标
```

### 5.2 国家数据 (countries/*.json)

```json
{
  "id": "japan",
  "name": {
    "zh": "日本",
    "en": "Japan",
    "ja": "日本"
  },
  "code": "JP",
  "flag": "🇯🇵",
  "localLanguage": "ja",
  "localGreeting": {
    "text": "こんにちは",
    "pronunciation": "Konnichiwa",
    "meaning": {
      "zh": "你好",
      "en": "Hello"
    }
  },
  "coordinates": {
    "lat": 36.2048,
    "lng": 138.2529
  },
  "zoomLevel": 5,
  "visitedDate": {
    "first": "2024-03",
    "last": "2024-03"
  },
  "cities": ["osaka", "kyoto"],
  "color": "#3B82F6"
}
```

### 5.3 城市内容 (cities/*.mdx)

```mdx
---
id: "osaka"
country: "japan"
name:
  zh: "大阪"
  en: "Osaka"
  ja: "大阪"
coordinates:
  lat: 34.6937
  lng: 135.5023
visitedDate: "2024-03-15"
mood: ["excited", "yummy", "adventurous"]
coverPhoto: "/images/cities/osaka/cover.jpg"
photos:
  - src: "/images/cities/osaka/01.jpg"
    caption:
      zh: "道顿堀的夜晚"
      en: "Night at Dotonbori"
  - src: "/images/cities/osaka/02.jpg"
    caption:
      zh: "章鱼小丸子！"
      en: "Takoyaki time!"
tags: ["food", "culture", "neon"]
---

## Argo 的日记 / Argo's Diary

### 🇨🇳 中文
大阪太好玩了！道顿堀的灯光好亮好漂亮，我吃了三个章鱼小丸子，
好烫但是好好吃！妈妈说我像一只小章鱼一样开心地跳来跳去。

### 🇬🇧 English
Osaka was so much fun! The lights at Dotonbori were super bright and pretty.
I ate three takoyaki balls — they were hot but so yummy!
Mom said I was jumping around like a happy little octopus.

## Argo 推荐 / Argo Recommends

- 🍢 **章鱼小丸子** — 道顿堀那家排长队的最好吃
- 🏯 **大阪城** — 可以假装自己是武士！
- 🎡 **天保山摩天轮** — 可以看到整个大阪

## 语言角 / Language Corner

| 日本語 | 发音 | 中文 | English |
|--------|------|------|---------|
| ありがとう | Arigatou | 谢谢 | Thank you |
| おいしい | Oishii | 好吃 | Delicious |
| すごい | Sugoi | 厉害 | Amazing |
```

### 5.4 Gallery 数据 (gallery/*.mdx)

```mdx
---
id: "painting-001"
type: "painting"
title:
  zh: "大阪的章鱼"
  en: "Osaka Octopus"
medium: "watercolor"
date: "2024-03-16"
city: "osaka"
country: "japan"
image: "/images/gallery/osaka-octopus.jpg"
thumbnail: "/images/gallery/osaka-octopus-thumb.jpg"
---

一只快乐的章鱼在道顿堀跳舞！/ A happy octopus dancing in Dotonbori!
```

### 5.5 地球标记数据 (globe-markers.json)

```json
{
  "countries": [
    {
      "id": "china",
      "geoJsonId": "CHN",
      "highlightColor": "#3B82F6",
      "cities": [
        { "id": "beijing", "lat": 39.9042, "lng": 116.4074, "markerColor": "#F59E0B" },
        { "id": "shanghai", "lat": 31.2304, "lng": 121.4737, "markerColor": "#F59E0B" },
        { "id": "hong-kong", "lat": 22.3193, "lng": 114.1694, "markerColor": "#F59E0B" },
        { "id": "macau", "lat": 22.1987, "lng": 113.5439, "markerColor": "#F59E0B" }
      ]
    },
    {
      "id": "japan",
      "geoJsonId": "JPN",
      "highlightColor": "#3B82F6",
      "cities": [
        { "id": "osaka", "lat": 34.6937, "lng": 135.5023, "markerColor": "#EF4444" },
        { "id": "kyoto", "lat": 35.0116, "lng": 135.7681, "markerColor": "#EF4444" }
      ]
    }
  ]
}
```

---

## 6. 多语言策略 / i18n Strategy

**核心规则：** 中英双语为基础，每去一个国家就新增一种语言

| 国家 | 新增语种 | 语言代码 |
|------|---------|---------|
| 基础 | 中文 + English | zh, en |
| 日本 | 日本語 | ja |
| *(未来) 法国* | *Français* | *fr* |
| *(未来) 韩国* | *한국어* | *ko* |

**实现方式：**
- UI 文案：`/src/content/i18n/{lang}.json`
- 内容文案：每个 MDX 文件内嵌中英+当地语
- 语言切换器显示 Argo 会说的所有语言

---

## 7. 视觉设计规范 / Design System

### 色彩方案（明亮清新 / Bright & Fresh）

```
主色 Primary:      #3B82F6 (明亮蓝 — 海洋、天空、探索)
强调 Accent:       #F59E0B (暖阳橙 — 活力、童趣)
次强调 Secondary:   #10B981 (清新绿 — 大自然、成长)
背景 Background:   #F8FAFC → #FFFFFF (极浅蓝白渐变)
文字 Text:         #1E293B (深蓝灰)
副文字 Subtext:    #64748B (中灰)
地球已访问:        #3B82F6 (蓝色高亮)
地球未访问:        #E2E8F0 (浅灰)
城市标记:          #F59E0B (橙色跳动点)
```

### 字体方案

```
标题: "Nunito" (圆润友好，带童趣)
正文: "Inter" (清晰易读)
中文: "Noto Sans SC" (与 Inter 搭配和谐)
日文: "Noto Sans JP"
手写/装饰: "Caveat" (Argo 的日记风格)
```

### 动效规范

```
地球自转:      60s/圈, ease-in-out
心跳脉冲:      1.2s 周期, scale 1.0→1.03→1.0
城市标记跳动:   0.8s 周期, 错开 stagger
面板展开:      0.4s, ease-out, 从右侧滑入
页面过渡:      0.3s, fade + slight slide
Hover 效果:    0.2s, scale 1.05 + 发光
```

---

## 8. 开发里程碑 / Development Milestones

### Phase 1: 基础框架搭建 (Day 1-2)
- [ ] Astro 项目初始化 + Tailwind + React 集成
- [ ] GitHub 仓库创建 + Cloudflare Pages 连接
- [ ] 基础布局组件（Header, Footer, Layout）
- [ ] 路由结构搭建
- [ ] 部署流水线验证

### Phase 2: 3D 地球核心 (Day 3-5)
- [ ] Three.js 地球渲染（明亮材质）
- [ ] 心跳脉冲动画
- [ ] 国家高亮着色（GeoJSON 数据）
- [ ] 城市标记点 + 跳动动效
- [ ] 相机 zoom-in 交互
- [ ] 背景粒子/气泡动效

### Phase 3: 内容系统 (Day 6-8)
- [ ] Content Collections 配置
- [ ] 城市详情面板组件
- [ ] 日记 + 照片 + 情绪 + 推荐内容渲染
- [ ] 填入真实数据（6 个城市）
- [ ] 中英双语 + 日语内容

### Phase 4: Gallery (Day 9-10)
- [ ] 瀑布流布局
- [ ] 作品分类筛选
- [ ] Lightbox 放大查看
- [ ] 作品 ↔ 地图关联

### Phase 5: About + 多语言 + 打磨 (Day 11-13)
- [ ] About 页面 + 旅行数据可视化
- [ ] 完整 i18n 系统
- [ ] 响应式适配（移动端/平板）
- [ ] 性能优化（图片懒加载、3D 降级）
- [ ] SEO + Open Graph

### Phase 6: 部署上线 (Day 14)
- [ ] 最终测试
- [ ] argomap.com DNS 配置 → Cloudflare Pages
- [ ] 上线！🚀

---

## 9. 部署方案 / Deployment

```
开发流程:
  本地开发 → git push → GitHub Actions(可选) → Cloudflare Pages 自动构建

Cloudflare Pages 配置:
  Framework preset:  Astro
  Build command:     npm run build
  Build output:      dist/
  Node version:      18+

域名配置:
  argomap.com → Cloudflare Pages Custom Domain
  DNS: CNAME → *.pages.dev
```

---

## 10. 未来 SaaS 扩展路径 / Future SaaS Roadmap

当 Argo 的站点验证了产品形态后，可按以下路径扩展：

```
Phase 2 架构演进:

argomap.com (主站/Landing)
├── argomap.com/create    → 创建自己的地图
├── [name].argomap.com    → 用户子域名
│   或 argomap.com/u/[name]
│
├── 后端: Cloudflare Workers + D1(SQLite) + R2(图片存储)
├── 认证: Cloudflare Access 或 Auth0
└── 付费: Stripe
```

**SaaS 化需要的改动：**
- 将 Argo 的数据结构抽象为通用模板
- 添加可视化编辑器（拖拽上传照片、编辑日记）
- 用户认证 + 数据隔离
- 模板系统（不同视觉主题）
- 自定义域名支持

**定位参考：** 类似 creader.io 的极简创作工具，但专注于旅行地图这个垂直场景。

---

## 11. 已收集的数据清单 / Initial Data

### 已确认的旅行数据

| 国家 | 城市 | 新增语种 |
|------|------|---------|
| 🇨🇳 中国 China | 北京 Beijing, 上海 Shanghai, 香港 Hong Kong, 澳门 Macau | — (基础语种) |
| 🇯🇵 日本 Japan | 大阪 Osaka, 京都 Kyoto | 日本語 |

### 待补充

- 中国的其他城市
- "其他"国家及城市
- 每个城市的照片素材
- Argo 的日记/文字内容
- Gallery 作品素材
- Argo 的头像/形象素材

---

## 12. 下一步行动 / Next Steps

1. **确认规划** — 审阅本文档，确认方向无误
2. **补充数据** — 提供其他国家/城市信息 + 照片素材
3. **开始开发** — 从 Phase 1 基础框架开始搭建
4. **迭代内容** — 框架搭好后逐步填入真实内容

---

*ArgoMap — Where every step tells a story. 🌍*
*ArgoMap — 每一步，都是一个故事。*