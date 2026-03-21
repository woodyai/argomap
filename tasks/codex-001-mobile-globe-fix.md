# Codex 任务工单 #001：修复 iPhone 首页地球无法加载问题

## 问题描述
iPhone 访问 argomap.com 首页，SSR fallback（"Loading globe..." spinner）永远不消失，地球从未渲染。
桌面端正常。

## 根因
`MapExperience` 使用 `client:only="react"` 异步加载，内部 import Three.js + R3F + drei（~1MB 包体）。
加载链条中任何一环失败（网络超时、WebGL 不可用、纹理 OOM、JS 运行时错误），组件不会挂载，SSR fallback 永远停留。
**当前代码没有任何错误边界或降级逻辑。**

## 修复方案（4 步）

### 1. 添加 React Error Boundary（新文件）
**文件：`src/components/ErrorBoundary.tsx`**
- 创建标准 React class component Error Boundary
- catch 到错误时渲染友好的降级 UI（显示标题 + 错误提示 + "点击刷新"按钮）
- 在 `MapExperience.tsx` 中用 `<ErrorBoundary>` 包裹 `<Globe>` 组件

### 2. 添加 WebGL 检测 + 静态降级
**文件：`src/components/Globe.tsx`**
- 在 `<Canvas>` 渲染前检测 WebGL 可用性：
```tsx
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch { return false; }
}
```
- 如果 WebGL 不可用，渲染静态地球图片（`/textures/earth_day.jpg` 做 CSS 圆形裁剪）替代 3D 地球
- 城市标记用绝对定位的 CSS 圆点叠加在静态图上

### 3. 移动端性能降级
**文件：`src/components/Globe.tsx`**
- 检测移动端（`/Mobi|Android/i.test(navigator.userAgent)` 或使用已有的 `useIsMobile`）
- 移动端降低面数：`sphereGeometry args` 从 `[RADIUS, 64, 64]` 降为 `[RADIUS, 32, 32]`
- 大气层球体同步降为 32 段
- 移动端纹理：考虑提供 1024×512 的缩小版纹理（减少内存占用），或保持现有纹理但做好 OOM 处理

### 4. SSR Fallback 超时机制
**文件：`src/pages/index.astro`**
- 给 SSR fallback 添加内联 `<script>`，设置 15 秒超时
- 超时后将 "Loading globe..." 改为 "加载较慢，请稍候..." 或提供刷新按钮
- 这确保即使 JS 完全加载失败，用户也不会看到永久 spinner

## 涉及文件
| 文件 | 操作 |
|------|------|
| `src/components/ErrorBoundary.tsx` | **新建** — React Error Boundary |
| `src/components/Globe.tsx` | **修改** — WebGL 检测 + 移动端面数降级 |
| `src/components/MapExperience.tsx` | **修改** — ErrorBoundary 包裹 Globe |
| `src/pages/index.astro` | **修改** — SSR fallback 超时脚本 |

## 技术约束
- 框架：Astro 5.17 + React 19 + Three.js 0.183 + @react-three/fiber 9.5
- Globe 组件使用 `client:only="react"`（无 SSR）
- 纹理加载必须用 `useLoader` + `<Suspense>`（不可改为手动 load + useState，见 MEMORY.md）
- 材质必须用命令式 `useMemo(() => new THREE.MeshBasicMaterial({ map: texture }))`（不可用声明式 JSX）
- 渲染管线：`flat={true}` + `gl.outputColorSpace = THREE.LinearSRGBColorSpace`

## 验收标准
1. iPhone Safari 打开 argomap.com，地球正常加载显示（或在 WebGL 不可用时显示静态降级）
2. 弱网环境下（Chrome DevTools 3G throttling），15 秒内若未加载完成，fallback 显示友好提示
3. 强制 WebGL 失败时，不出现白屏，显示静态地球降级
4. 桌面端行为不变，无视觉回归
5. 无 console 报错

## 测试方法
1. `npm run build && npm run preview` 后用手机访问本地 IP
2. Chrome DevTools → Performance → CPU 4x slowdown + 3G throttling
3. 使用 Chrome WebGL 扩展强制禁用 WebGL，验证降级路径
