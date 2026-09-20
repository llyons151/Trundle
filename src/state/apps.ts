import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

// Preview catalog until the native device app picker is connected.
export const APPS = [
  { id: 'instagram', name: 'Instagram', category: 'Social', icon: 'instagram' },
  { id: 'tiktok', name: 'TikTok', category: 'Entertainment', icon: 'music' },
  { id: 'youtube', name: 'YouTube', category: 'Entertainment', icon: 'youtube' },
  { id: 'reddit', name: 'Reddit', category: 'Social', icon: 'message-circle' },
  { id: 'x', name: 'X', category: 'Social', icon: 'at-sign' },
  { id: 'facebook', name: 'Facebook', category: 'Social', icon: 'facebook' },
  { id: 'snapchat', name: 'Snapchat', category: 'Social', icon: 'camera' },
  { id: 'threads', name: 'Threads', category: 'Social', icon: 'at-sign' },
  { id: 'discord', name: 'Discord', category: 'Social', icon: 'headphones' },
  { id: 'twitch', name: 'Twitch', category: 'Entertainment', icon: 'twitch' },
  { id: 'netflix', name: 'Netflix', category: 'Entertainment', icon: 'film' },
  { id: 'pinterest', name: 'Pinterest', category: 'Inspiration', icon: 'image' },
] as const;

const STORAGE_KEY = 'trundle.selected-apps.v1';
let selected: readonly string[] = [];
try {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (Array.isArray(saved)) {
      selected = APPS.filter(app => saved.includes(app.id)).map(app => app.id);
    }
  }
} catch { /* Selection still works when browser storage is unavailable. */ }

const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function setSelectedApps(ids: readonly string[]) {
  selected = APPS.filter(app => ids.includes(app.id)).map(app => app.id);
  try {
    if (Platform.OS === 'web') localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
  } catch { /* Keep the in-memory selection available. */ }
  listeners.forEach(listener => listener());
}

export function useSelectedApps() {
  return useSyncExternalStore(subscribe, () => selected, () => selected);
}

export type AppId = typeof APPS[number]['id'];
export const APP_FEATURES: Record<AppId, readonly { id: string; title: string; detail: string }[]> = {
  instagram: [
    { id: 'reels', title: 'Reels', detail: 'Short videos and the endless scroll.' },
    { id: 'feed', title: 'Home feed', detail: 'Posts in your home timeline.' },
    { id: 'explore', title: 'Explore', detail: 'Recommended posts and discovery.' },
    { id: 'stories', title: 'Stories', detail: 'Stories at the top of your feed.' },
  ],
  tiktok: [
    { id: 'for-you', title: 'For You feed', detail: 'The personalized video feed.' },
    { id: 'following', title: 'Following feed', detail: 'Videos from accounts you follow.' },
    { id: 'live', title: 'LIVE', detail: 'Live streams and live discovery.' },
  ],
  youtube: [
    { id: 'shorts', title: 'Shorts', detail: 'Short videos and the Shorts tab.' },
    { id: 'feed', title: 'Home feed', detail: 'Recommended videos on the home page.' },
    { id: 'related', title: 'Related videos', detail: 'Suggestions beside and after videos.' },
  ],
  reddit: [
    { id: 'feed', title: 'Home feed', detail: 'Posts from your communities.' },
    { id: 'popular', title: 'Popular & Explore', detail: 'Trending posts and recommendations.' },
  ],
  x: [
    { id: 'for-you', title: 'For You feed', detail: 'Recommended posts in your timeline.' },
    { id: 'following', title: 'Following feed', detail: 'Posts from accounts you follow.' },
    { id: 'explore', title: 'Explore & trends', detail: 'Trending topics and discovery.' },
  ],
  facebook: [
    { id: 'feed', title: 'Home feed', detail: 'Posts and recommendations.' },
    { id: 'reels', title: 'Reels', detail: 'The short-form video feed.' },
    { id: 'stories', title: 'Stories', detail: 'Updates at the top of your feed.' },
  ],
  snapchat: [
    { id: 'spotlight', title: 'Spotlight', detail: 'Recommended short videos.' },
    { id: 'discover', title: 'Discover', detail: 'Publisher and creator content.' },
    { id: 'stories', title: 'Stories', detail: 'Stories from friends and creators.' },
  ],
  threads: [
    { id: 'for-you', title: 'For You feed', detail: 'Recommended threads.' },
    { id: 'following', title: 'Following feed', detail: 'Threads from accounts you follow.' },
  ],
  discord: [
    { id: 'servers', title: 'Server channels', detail: 'Conversations inside servers.' },
    { id: 'discover', title: 'Discover', detail: 'Server and community discovery.' },
  ],
  twitch: [
    { id: 'live', title: 'Live streams', detail: 'Live channels and broadcasts.' },
    { id: 'clips', title: 'Clips', detail: 'Short highlights and the clips feed.' },
    { id: 'discover', title: 'Browse & discovery', detail: 'Recommended channels and categories.' },
  ],
  netflix: [
    { id: 'recommendations', title: 'Home recommendations', detail: 'Suggested shows and movies.' },
    { id: 'previews', title: 'Video previews', detail: 'Trailers and previews while browsing.' },
  ],
  pinterest: [
    { id: 'feed', title: 'Home feed', detail: 'Recommended pins on your home page.' },
    { id: 'related', title: 'Related pins', detail: 'More ideas beneath a pin.' },
  ],
};

export type AppRule = { mode: 'whole' | 'custom'; features: readonly string[] };
const RULES_KEY = 'trundle.app-rules.v1';
const DEFAULT_RULE: AppRule = { mode: 'whole', features: [] };
let rules: Partial<Record<AppId, AppRule>> = {};
try {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    const saved = JSON.parse(localStorage.getItem(RULES_KEY) ?? '{}');
    for (const app of APPS) {
      const rule = saved?.[app.id];
      if (rule && (rule.mode === 'whole' || rule.mode === 'custom') && Array.isArray(rule.features)) {
        const features = APP_FEATURES[app.id].filter(feature => rule.features.includes(feature.id)).map(feature => feature.id);
        rules[app.id] = { mode: rule.mode, features };
      }
    }
  }
} catch { /* Settings remain available in memory. */ }

export function saveAppRule(id: AppId, rule: AppRule) {
  rules = { ...rules, [id]: rule };
  try {
    if (Platform.OS === 'web') localStorage.setItem(RULES_KEY, JSON.stringify(rules));
  } catch { /* Settings remain available in memory. */ }
  listeners.forEach(listener => listener());
}

export function useAppRules() {
  return useSyncExternalStore(subscribe, () => rules, () => rules);
}

export function getAppRule(rulesByApp: Partial<Record<AppId, AppRule>>, id: AppId) {
  return rulesByApp[id] ?? DEFAULT_RULE;
}
