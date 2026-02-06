import type { LanguageProfileMap, LanguageVisualProfile } from '@/src/types.js';

const MANUAL_MEMORY: LanguageVisualProfile = {
  memoryModel: 'manual',
  pointerVisual: 'arrow',
  collectionMeta: 'contiguous',
  codeStyle: 'strict',
  concurrencyVisual: false
};

const MANAGED_OO: LanguageVisualProfile = {
  memoryModel: 'managed',
  pointerVisual: 'line',
  collectionMeta: 'linked',
  codeStyle: 'strict',
  concurrencyVisual: false
};

const SCRIPT_DYNAMIC: LanguageVisualProfile = {
  memoryModel: 'abstract',
  pointerVisual: 'none',
  collectionMeta: 'dynamic',
  codeStyle: 'script',
  concurrencyVisual: false
};

const GO_PROFILE: LanguageVisualProfile = {
  memoryModel: 'managed',
  pointerVisual: 'arrow',
  collectionMeta: 'contiguous',
  codeStyle: 'strict',
  concurrencyVisual: true
};

export const LANGUAGE_REGISTRY: LanguageProfileMap = {
  'c': MANUAL_MEMORY,
  'cpp': MANUAL_MEMORY,
  'c++': MANUAL_MEMORY,
  'go': GO_PROFILE,
  'golang': GO_PROFILE,
  'java': MANAGED_OO,
  'python': SCRIPT_DYNAMIC,
  'py': SCRIPT_DYNAMIC,
  'javascript': SCRIPT_DYNAMIC,
  'js': SCRIPT_DYNAMIC,
  'typescript': SCRIPT_DYNAMIC,
  'ts': SCRIPT_DYNAMIC
};

export const DEFAULT_PROFILE: LanguageVisualProfile = SCRIPT_DYNAMIC;

export function getLanguageProfile(lang: string): LanguageVisualProfile {
  if (!lang) return DEFAULT_PROFILE;
  const normalizedKey = lang.toLowerCase().trim();
  return LANGUAGE_REGISTRY[normalizedKey] || DEFAULT_PROFILE;
}
