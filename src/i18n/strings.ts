export const strings = {
  zh: {
    pageTitle: 'ArgoMap — 探索 Argo 的地图',
    heroTitle: '探索 ARGO 的地图',
    heroSubtitle: '成长与探索的旅程',
    loading: '正在加载地球...',
    loadingSlow: '加载较慢，请稍候或刷新重试。',
    refresh: '刷新页面',
    memories: '回忆',
    diary: '📔 日记',
    photos: '🌅 照片墙',
    mood: '🤩 情绪记录',
    topPicks: '⭐ 热门推荐',
    unlockLanguages: '解锁更多语言！',
    homeVisit: '家 🏠',
  },
  en: {
    pageTitle: "ArgoMap — Explore Argo's Map",
    heroTitle: "EXPLORE ARGO'S MAP",
    heroSubtitle: 'A journey of growth and exploration',
    loading: 'Loading globe...',
    loadingSlow: 'Loading slowly, please wait or refresh.',
    refresh: 'Refresh',
    memories: 'MEMORIES',
    diary: '📔 Diary',
    photos: '🌅 Photo Gallery',
    mood: '🤩 Mood Tracker',
    topPicks: '⭐ Top Picks',
    unlockLanguages: 'Unlock new languages!',
    homeVisit: 'Home 🏠',
  },
} as const;

export type Lang = keyof typeof strings;
