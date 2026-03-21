
import React, { useState, useEffect } from 'react';
import { Exam } from '../types.ts';
import { PASTEL_COLORS } from '../constants.ts';

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exam: Exam) => void;
  onDelete: (id: string) => void;
  initialData: Exam | null;
}

const ExamModal: React.FC<ExamModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData }) => {
  const [formData, setFormData] = useState<Exam>({
    id: '',
    name: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '11:00',
    room: '',
    color: 'bg-rose-100'
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        id: '',
        name: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '11:00',
        room: '',
        color: 'bg-rose-100'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden p-8 border border-gray-100 dark:border-zinc-800 transform transition-all animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{formData.id ? 'Edit Exam' : 'New Exam'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 mb-1.5 uppercase tracking-widest">Exam Name</label>
            <input 
              type="text" 
              placeholder="e.g. Advanced Calculus Finals"
              value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 mb-1.5 uppercase tracking-widest">Exam Date</label>
            <input 
              type="date" 
              value={formData.date || ''}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 mb-1.5 uppercase tracking-widest">Start Time</label>
              <input 
                type="time" 
                value={formData.startTime || ''}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 mb-1.5 uppercase tracking-widest">End Time</label>
              <input 
                type="time" 
                value={formData.endTime || ''}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 mb-1.5 uppercase tracking-widest">Location / Room</label>
            <input 
              type="text" 
              placeholder="Great Hall - Zone B"
              value={formData.room || ''}
              onChange={e => setFormData({ ...formData, room: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 mb-1.5 uppercase tracking-widest">Theme Color</label>
            <div className="flex flex-wrap gap-3 mt-2">
              {PASTEL_COLORS.map(color => (
                <button
                  key={color.bg}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.bg })}
                  className={`w-9 h-9 rounded-xl border-2 transition-all ${color.bg} ${formData.color === color.bg ? 'border-gray-900 dark:border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'}`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            {formData.id && (
              <button 
                onClick={() => onDelete(formData.id)}
                className="px-6 py-3 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-sm font-bold hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                Delete
              </button>
            )}
            <div className="flex-grow" />
            <button 
              onClick={() => onSave(formData)}
              disabled={!formData.name || !formData.date}
              className="px-8 py-3 bg-gray-900 dark:bg-indigo-600 text-white rounded-2xl text-sm font-black hover:opacity-90 shadow-xl shadow-black/10 dark:shadow-indigo-500/20 transition-all disabled:opacity-30 active:scale-95"
            >
              {formData.id ? 'Update Exam' : 'Create Exam'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamModal;
