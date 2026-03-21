
import React from 'react';
import { Exam } from '../types.ts';

interface ExamListProps {
  exams: Exam[];
  onEditExam?: (exam: Exam) => void;
  readOnly?: boolean;
}

const ExamList: React.FC<ExamListProps> = ({ exams, onEditExam, readOnly = false }) => {
  const sortedExams = [...exams].sort((a, b) => a.date.localeCompare(b.date));

  if (sortedExams.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
        <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-gray-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">No exams scheduled yet</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  return (
    <div className="space-y-4">
      {sortedExams.map((exam) => {
        // Fallback for exams created before color selection was added
        const bgColorClass = exam.color || 'bg-rose-100';
        const borderClass = bgColorClass.replace('bg-', 'border-');

        return (
          <div 
            key={exam.id}
            onClick={() => !readOnly && onEditExam?.(exam)}
            className={`group relative p-5 ${bgColorClass} dark:opacity-90 border-2 ${borderClass} rounded-3xl transition-all ${!readOnly ? 'hover:shadow-lg cursor-pointer active:scale-[0.98]' : ''}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-600 dark:text-gray-900 uppercase tracking-widest mb-1 opacity-70">
                  {formatDate(exam.date)}
                </span>
                <h4 className="text-sm font-black text-gray-900 leading-tight group-hover:underline transition-all">
                  {exam.name}
                </h4>
              </div>
              <div className="flex flex-col items-end">
                  <span className="text-[11px] font-black text-gray-700">
                    {exam.startTime}
                  </span>
                  <span className="text-[11px] font-bold text-gray-600 opacity-60">
                    {exam.endTime}
                  </span>
              </div>
            </div>
            
            {exam.room && (
              <div className="flex items-center gap-1.5 text-gray-700 mt-2">
                <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8,0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span className="text-xs font-black">{exam.room}</span>
              </div>
            )}

            {!readOnly && (
               <div className="absolute -top-2 -right-2 w-7 h-7 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-full border-2 border-gray-100 dark:border-zinc-800 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
               </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ExamList;
