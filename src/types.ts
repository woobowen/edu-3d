export interface LanguageVisualProfile {
  memoryModel: 'manual' | 'managed' | 'abstract';
  pointerVisual: 'arrow' | 'line' | 'none';
  collectionMeta: 'contiguous' | 'linked' | 'dynamic';
  codeStyle: 'strict' | 'script';
  concurrencyVisual: boolean;
}

export type LanguageProfileMap = Record<string, LanguageVisualProfile>;

export interface UserProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  programmingLanguage: 'C' | 'C++' | 'Python' | 'Java' | 'Go' | string;
  studyCycle: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  learningGoal: string;
}
