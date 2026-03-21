
import { Day } from './types';

export const DAYS_OF_WEEK = [
  Day.MONDAY,
  Day.TUESDAY,
  Day.WEDNESDAY,
  Day.THURSDAY,
  Day.FRIDAY
];

export const START_HOUR = 8;
export const END_HOUR = 20;

export const PASTEL_COLORS = [
  { name: 'Sky', bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-800' },
  { name: 'Rose', bg: 'bg-rose-100', border: 'border-rose-200', text: 'text-rose-800' },
  { name: 'Emerald', bg: 'bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-800' },
  { name: 'Amber', bg: 'bg-amber-100', border: 'border-amber-200', text: 'text-amber-800' },
  { name: 'Violet', bg: 'bg-violet-100', border: 'border-violet-200', text: 'text-violet-800' },
  { name: 'Slate', bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-800' },
];

export const DEFAULT_COLOR = PASTEL_COLORS[0];

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const formatMinutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const getGridPosition = (time: string) => {
  const minutes = timeToMinutes(time);
  const startMinutes = START_HOUR * 60;
  return (minutes - startMinutes) / 60;
};
