
import React from 'react';
import { ScheduleBlock, Day, BlockType } from '../types.ts';
import { DAYS_OF_WEEK, START_HOUR, END_HOUR, getGridPosition } from '../constants.ts';

interface TimetableGridProps {
  blocks: ScheduleBlock[];
  onAddBlock?: (day: Day, hour: number) => void;
  onEditBlock?: (block: ScheduleBlock) => void;
  onFetchInsights?: (block: ScheduleBlock) => void;
  readOnly?: boolean;
}

const TimetableGrid: React.FC<TimetableGridProps> = ({ 
  blocks, 
  onAddBlock, 
  onEditBlock, 
  onFetchInsights,
  readOnly = false 
}) => {
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
  const rowHeight = 80; // pixels per hour
  const mobileColumnWidth = 160; // minimum width for columns on mobile

  const getGoogleCalendarUrl = (block: ScheduleBlock) => {
    const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const text = encodeURIComponent(block.subject || 'Class');
    const location = encodeURIComponent(block.room || '');
    const details = encodeURIComponent(block.teacher ? `Teacher: ${block.teacher}` : '');
    
    const now = new Date();
    const dayIndex = Object.values(Day).indexOf(block.day) + 1; // 1 = Monday
    const currentDay = now.getDay();
    const diff = dayIndex - currentDay;
    const eventDate = new Date(now);
    eventDate.setDate(now.getDate() + diff);
    
    const dateStr = eventDate.toISOString().split('T')[0].replace(/-/g, '');
    const startStr = block.startTime.replace(':', '') + '00';
    const endStr = block.endTime.replace(':', '') + '00';
    
    return `${baseUrl}&text=${text}&location=${location}&details=${details}&dates=${dateStr}T${startStr}/${dateStr}T${endStr}`;
  };

  return (
    <div className="flex flex-col min-w-max sm:min-w-full bg-white dark:bg-zinc-900 transition-colors">
      {/* Header */}
      <div className="flex border-b border-gray-100 dark:border-zinc-800">
        <div className="w-12 sm:w-20 bg-gray-50/50 dark:bg-zinc-950/30"></div>
        {DAYS_OF_WEEK.map(day => (
          <div 
            key={day} 
            className="flex-1 py-4 text-center font-bold text-[11px] sm:text-sm text-gray-600 dark:text-zinc-400 uppercase tracking-widest sm:tracking-normal"
            style={{ minWidth: mobileColumnWidth }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid Content */}
      <div className="relative flex">
        {/* Time Labels */}
        <div className="w-12 sm:w-20 flex-shrink-0 bg-gray-50/50 dark:bg-zinc-950/30 border-r border-gray-100 dark:border-zinc-800">
          {hours.map(hour => (
            <div key={hour} style={{ height: rowHeight }} className="relative">
              <span className="absolute -top-3 right-2 sm:right-4 text-[9px] sm:text-[10px] font-bold text-gray-400 dark:text-zinc-600">
                {hour.toString().padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>

        {/* Columns */}
        <div className="flex-grow flex relative">
          {DAYS_OF_WEEK.map(day => (
            <div 
              key={day} 
              className="flex-1 border-r border-gray-50 dark:border-zinc-800 last:border-r-0 relative group"
              style={{ height: hours.length * rowHeight, minWidth: mobileColumnWidth }}
            >
              {/* Hourly Slot Cells for clicking */}
              {!readOnly && hours.slice(0, -1).map(hour => (
                <div 
                  key={hour}
                  onClick={() => onAddBlock?.(day, hour)}
                  className="absolute left-0 right-0 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 cursor-pointer transition-colors"
                  style={{ 
                    top: (hour - START_HOUR) * rowHeight, 
                    height: rowHeight,
                    zIndex: 1
                  }}
                />
              ))}

              {/* Grid Lines */}
              {hours.map(hour => (
                <div 
                  key={hour}
                  className="absolute left-0 right-0 border-b border-gray-50 dark:border-zinc-800 pointer-events-none"
                  style={{ top: (hour - START_HOUR) * rowHeight }}
                />
              ))}

              {/* Blocks */}
              {blocks
                .filter(b => b.day === day)
                .map(block => {
                  const startPos = getGridPosition(block.startTime);
                  const endPos = getGridPosition(block.endTime);
                  const duration = endPos - startPos;

                  return (
                    <div
                      key={block.id}
                      className={`block-item absolute left-1 right-1 rounded-xl p-2.5 shadow-sm border overflow-hidden transition-all z-10 group/block ${
                        block.type === BlockType.BREAK 
                        ? 'border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800/30' 
                        : `${block.color} ${!readOnly ? 'hover:shadow-md' : ''} dark:opacity-90`
                      }`}
                      style={{
                        top: startPos * rowHeight + 4,
                        height: duration * rowHeight - 8,
                      }}
                      onClick={() => !readOnly && onEditBlock?.(block)}
                    >
                      <div className="flex flex-col h-full relative">
                        <span className={`text-[10px] sm:text-[11px] font-bold opacity-70 mb-0.5 ${block.type === BlockType.BREAK ? 'text-gray-400 dark:text-zinc-500' : 'text-gray-800'}`}>
                          {block.startTime} - {block.endTime}
                        </span>
                        <h4 className={`text-xs sm:text-xs font-bold truncate leading-tight pr-8 ${block.type === BlockType.BREAK ? 'text-gray-500 dark:text-zinc-400' : 'text-gray-900'}`}>
                          {block.type === BlockType.BREAK ? 'Study Break' : block.subject}
                        </h4>
                        {block.room && (
                          <div className="mt-auto flex items-center gap-1 opacity-80">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8,0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span className="text-[9px] sm:text-[10px] font-medium truncate">{block.room}</span>
                          </div>
                        )}

                        {/* Google Integration Buttons - Made more visible on touch */}
                        {block.type === BlockType.CLASS && !readOnly && (
                          <div className="absolute top-0 right-0 flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover/block:opacity-100 transition-opacity no-print">
                            <button 
                              onClick={(e) => { e.stopPropagation(); onFetchInsights?.(block); }}
                              className="p-1.5 sm:p-1 bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 rounded-md shadow-sm border border-gray-100 dark:border-zinc-700 text-indigo-600 dark:text-indigo-400 transition-colors"
                              title="Smart Insights"
                            >
                               <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                            </button>
                            <a 
                              href={getGoogleCalendarUrl(block)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 sm:p-1 bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 rounded-md shadow-sm border border-gray-100 dark:border-zinc-700 text-blue-600 dark:text-blue-400 transition-colors"
                              title="Sync Google Calendar"
                            >
                               <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z"/></svg>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimetableGrid;
