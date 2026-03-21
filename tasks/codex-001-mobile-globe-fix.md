# Codex 任务工单 #001：移动端修复 + 中英双语切换

## 状态
- ~~地球无法加载~~ ✅ 已修复（ErrorBoundary + WebGL 检测 + 面数降级 + SSR 超时）
- 移动端城市标记点击无响应 🔴 待修复
- 中英双语切换 🔴 待实现

---

## 任务 A：修复移动端城市标记点击无响应

### 问题描述
iPhone 上 3D 地球已正常渲染，但点击城市标记（亮色圆点）无任何反应，MemoriesPanel 不切换城市。桌面端正常。

### 根因分析
1. **OrbitControls 吞掉触摸事件**：触屏上 `touchstart → touchmove → touchend` 先被 OrbitControls 捕获为旋转手势，R3F 的 raycaster click 事件被拦截
2. **触摸目标太小**：城市标记球体半径 0.028~0.038（约 6-8px 屏幕像素），手指无法精确命中。Apple HIG 建议最小触摸目标 44pt

### 修复方案

#### 方案 1：增大移动端标记 hitbox + 添加城市选择列表（推荐）

**文件：`src/components/Globe.tsx` — CityMarker 组件**
- 移动端增大标记的 hitbox：在现有标记球体外包一个透明的大球体作为触摸区域
```tsx
// 在 CityMarker group 中增加一个隐形 hit area（仅在移动端）
{isMobile && (
  <mesh onClick={handleClick}>
    <sphereGeometry args={[0.12, 8, 8]} />
    <meshBasicMaterial visible={false} />
  </mesh>
)}
```
- 标记球体本身也从 0.028 增大到移动端 0.045

**文件：`src/components/MapExperience.tsx` — 移动端布局**
- 在地球下方添加一个城市选择器（水平滚动的城市名胶囊按钮列表）
- 点击胶囊 = 切换城市，作为触摸地球标记的备选交互
```tsx
{/* 移动端城市选择器 — Globe 下方 */}
<div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 16px', width: '100%' }}>
  {cities.map(city => (
    <button
      key={city.id}
      onClick={() => setSelectedCityId(city.id)}
      style={{
        flexShrink: 0,
        padding: '6px 14px',
        borderRadius: '999px',
        border: city.id === selectedCityId ? '1px solid rgba(255,255,255,0.5)' : '1px solid rgba(255,255,255,0.15)',
        background: city.id === selectedCityId ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
        color: city.id === selectedCityId ? '#fff' : 'rgba(255,255,255,0.6)',
        fontSize: '12px',
        fontFamily: "'Nunito', sans-serif",
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {city.nameZh || city.name}
    </button>
  ))}
</div>
```

**文件：`src/components/Globe.tsx` — Earth 组件**
- 需要把 `isMobile` prop 传递到 CityMarker，用于控制 hitbox 大小
- 在 Earth 的 props 中已有 `isMobile`，传给每个 CityMarker 即可

### 涉及文件
| 文件 | 修改内容 |
|------|---------|
| `src/components/Globe.tsx` | CityMarker 移动端增大 hitbox + 传递 isMobile |
| `src/components/MapExperience.tsx` | 移动端布局添加城市选择器胶囊列表 |

### 验收标准
1. iPhone Safari 点击地球上城市标记，MemoriesPanel 切换到对应城市
2. 移动端城市选择器胶囊可点击切换
3. 桌面端行为不变（不显示胶囊列表，标记大小不变）
4. OrbitControls 旋转功能不受影响

---

## 任务 B：中英双语切换（默认中文，点击 EN 切换英文）

### 问题描述
网站默认中文版本。Navbar 有 ZH/EN 按钮但仅改变内部 state，不影响任何页面内容。需要：
- 默认 `/` 为中文
- 点击 EN 跳转到 `/en`，内容切换为英文
- URL 反映当前语言

### 当前状态
- YAML 数据已有双语字段：`name/nameZh`, `country/countryZh`, `diary.en/diary.zh`
- Navbar 有 `activeLang` state 但不外传
- MemoriesPanel 写死同时显示中英两段日记
- 标题 "EXPLORE ARGO'S MAP" 硬编码英文
- 所有 section 标题硬编码双语格式（"📔 Diary (日记)"）

### 实现方案：Astro i18n 路由 + React Context

#### Step 1: Astro i18n 路由配置

**文件：`astro.config.mjs`**
```js
export default defineConfig({
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    routing: {
      prefixDefaultLocale: false, // / = 中文, /en = 英文
    },
  },
  // ... existing config
});
```

**文件：`src/pages/index.astro`** — 保持不动（中文默认页）

**文件：`src/pages/en/index.astro`** — 新建，英文版
- 复用同一个 Layout + 组件，传入 `lang="en"` prop
- 可以通过 `<MapExperience lang="en" ... />` 传入语言

#### Step 2: 语言 UI 字符串

**文件：`src/i18n/strings.ts`** — 新建
```ts
export const strings = {
  zh: {
    title: "探索 ARGO 的地图",
    subtitle: "成长与探索的旅程",
    loading: "正在加载地球...",
    diary: "📔 日记",
    photos: "🌅 照片墙",
    mood: "🤩 情绪记录",
    topPicks: "⭐ 热门推荐",
    memories: "回忆",
    refresh: "刷新页面",
    loadingSlow: "加载较慢，请稍候或刷新重试。",
  },
  en: {
    title: "EXPLORE ARGO'S MAP",
    subtitle: "A journey of growth and exploration",
    loading: "Loading globe...",
    diary: "📔 Diary",
    photos: "🌅 Photo Gallery",
    mood: "🤩 Mood Tracker",
    topPicks: "⭐ Top Picks",
    memories: "MEMORIES",
    refresh: "Refresh",
    loadingSlow: "Loading slowly, please wait or refresh.",
  },
} as const;

export type Lang = keyof typeof strings;
```

#### Step 3: 传递语言到 React 组件

**文件：`src/components/MapExperience.tsx`**
- 新增 `lang` prop（`'zh' | 'en'`，默认 `'zh'`）
- 从 `strings[lang]` 获取 UI 文案
- 传递 `lang` 给 MemoriesPanel

**文件：`src/components/MemoriesPanel.tsx`**
- 新增 `lang` prop
- 日记区域：`lang === 'zh' ? city.diary.zh : city.diary.en`（不再同时显示两段）
- 城市名：`lang === 'zh' ? city.nameZh : city.name`
- section 标题从 `strings[lang]` 获取

**文件：`src/components/Navbar.tsx`**
- ZH 按钮：`<a href="/">ZH</a>`（导航到中文首页）
- EN 按钮：`<a href="/en">EN</a>`（导航到英文版）
- 根据当前 URL path 高亮 active 语言（`window.location.pathname.startsWith('/en')` → EN active）
- 删除内部 `activeLang` state

#### Step 4: SSR Fallback 也要国际化

**文件：`src/pages/index.astro`** — 中文 fallback
- 标题改为 "探索 ARGO 的地图"
- Loading 文案改为 "正在加载地球..."

**文件：`src/pages/en/index.astro`** — 英文 fallback
- 保持 "EXPLORE ARGO'S MAP"
- Loading: "Loading globe..."

### 涉及文件
| 文件 | 操作 |
|------|------|
| `astro.config.mjs` | **修改** — 添加 i18n 配置 |
| `src/i18n/strings.ts` | **新建** — 中英 UI 字符串 |
| `src/pages/en/index.astro` | **新建** — 英文版首页（复用组件 + lang="en"） |
| `src/pages/index.astro` | **修改** — 传 lang="zh"，中文化 SSR fallback |
| `src/components/MapExperience.tsx` | **修改** — 接收 lang prop，传递给子组件 |
| `src/components/MemoriesPanel.tsx` | **修改** — 按 lang 显示对应语言内容 |
| `src/components/Navbar.tsx` | **修改** — ZH/EN 改为路由链接 |

### 验收标准
1. `/` 打开中文版：标题「探索 ARGO 的地图」，日记显示中文，section 标题中文
2. `/en` 打开英文版：标题 "EXPLORE ARGO'S MAP"，日记显示英文
3. Navbar ZH/EN 按钮点击跳转对应路由，active 状态正确高亮
4. 两个语言页面共享同一套 YAML 数据，无重复
5. 桌面端 + 移动端都正常工作

---

## 技术约束（全局）
- 框架：Astro 5.17 + React 19 + Three.js 0.183 + @react-three/fiber 9.5
- Globe 组件使用 `client:only="react"`（无 SSR）
- 纹理加载必须用 `useLoader` + `<Suspense>`（不可改为手动 load + useState）
- 材质必须用命令式 `useMemo(() => new THREE.MeshBasicMaterial({ map: texture }))`
- 渲染管线：`flat={true}` + `gl.outputColorSpace = THREE.LinearSRGBColorSpace`
- 部署：GitHub → Cloudflare Pages 自动部署

## 测试方法
1. `npm run dev` 本地测试 `/` 和 `/en` 路由
2. 手机访问本地 IP 测试触摸交互
3. `npm run build && npm run preview` 验证生产构建
4. Chrome DevTools 移动端模拟器测试触摸事件
