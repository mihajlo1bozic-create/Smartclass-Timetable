
export enum Day {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday'
}

export enum BlockType {
  CLASS = 'class',
  BREAK = 'break',
  EXAM = 'exam'
}

export enum SearchSource {
  GOOGLE = 'Google',
  WIKIPEDIA = 'Wikipedia',
  BING = 'Bing',
  REDDIT = 'Reddit'
}

export enum Language {
  ENGLISH = 'English',
  SERBIAN_LATIN = 'Srpski Latinica',
  GERMAN = 'Deutsch',
  FRENCH = 'Français',
  SPANISH = 'Español',
  ITALIAN = 'Italiano',
  RUSSIAN = 'Русский',
  CHINESE = '中文',
  JAPANESE = '日本語'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: { title: string; uri: string }[];
  timestamp: number;
}

export interface ScheduleBlock {
  id: string;
  day: Day;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  type: BlockType;
  subject?: string;
  teacher?: string;
  room?: string;
  color?: string; // Hex or tailwind class
}

export interface Exam {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  room?: string;
  color?: string;
}

export interface Grade {
  id: string;
  subject: string;
  value: number;
  weight?: number;
  date: string;
  note?: string;
}

export interface Timetable {
  id: string;
  name: string;
  userId: string;
  isPublic: boolean;
  shareSlug: string;
  blocks: ScheduleBlock[];
  exams: Exam[];
  grades: Grade[];
  chatHistory?: ChatMessage[];
  language?: Language;
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
}

export interface UsageStats {
  extract: number;
  notes: number;
  study: number;
  bookPro: number;
}
