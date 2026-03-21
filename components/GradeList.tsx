
import React from 'react';
import { Grade } from '../types.ts';

interface GradeListProps {
  grades: Grade[];
  onEditGrade?: (grade: Grade) => void;
  onGetStudyHelp?: (subject: string, value: number) => void;
  readOnly?: boolean;
}

const GradeList: React.FC<GradeListProps> = ({ grades, onEditGrade, onGetStudyHelp, readOnly = false }) => {
  const sortedGrades = [...grades].sort((a, b) => b.date.localeCompare(a.date));

  if (sortedGrades.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
        <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-gray-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/></svg>
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">No grades recorded</p>
      </div>
    );
  }

  const getGradeColor = (val: number) => {
    if (val >= 80) return 'text-emerald-500 dark:text-emerald-400';
    if (val >= 50) return 'text-amber-500 dark:text-amber-400';
    return 'text-rose-500 dark:text-rose-400';
  };

  return (
    <div className="space-y-3">
      {sortedGrades.map((grade) => (
        <div 
          key={grade.id}
          className={`group relative p-4 bg-white dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800/50 rounded-2xl transition-all ${!readOnly ? 'hover:shadow-md' : ''}`}
        >
          <div className="flex justify-between items-center" onClick={() => !readOnly && onEditGrade?.(grade)}>
            <div className="min-w-0 flex-grow cursor-pointer">
              <h4 className="text-sm font-black text-gray-900 dark:text-white truncate tracking-tight">{grade.subject}</h4>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest">{grade.note || 'General Grade'}</p>
            </div>
            <div className="flex flex-col items-end cursor-pointer">
                <span className={`text-lg font-black ${getGradeColor(grade.value)}`}>
                  {grade.value}
                </span>
                <span className="text-[9px] font-black text-gray-300 dark:text-zinc-600 uppercase">
                  {grade.weight}% Weight
                </span>
            </div>
          </div>
          
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[9px] font-bold text-gray-400 dark:text-zinc-600">{grade.date}</span>
            {grade.value < 50 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onGetStudyHelp?.(grade.subject, grade.value);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 dark:bg-rose-950/30 rounded-lg group/ai hover:bg-rose-100 dark:hover:bg-rose-900 transition-all active:scale-95"
                >
                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                    <span className="text-[9px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-tighter">Needs Review • Get AI Help</span>
                </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GradeList;
