
import React, { useState, useEffect } from 'react';
import { Grade } from '../types.ts';

interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (grade: Grade) => void;
  onDelete: (id: string) => void;
  initialData: Grade | null;
  subjects: string[];
}

const GradeModal: React.FC<GradeModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData, subjects }) => {
  const [formData, setFormData] = useState<Grade>({
    id: '',
    subject: '',
    value: 0,
    weight: 1,
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        id: '',
        subject: subjects[0] || '',
        value: 0,
        weight: 1,
        date: new Date().toISOString().split('T')[0],
        note: ''
      });
    }
  }, [initialData, isOpen, subjects]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8 border border-gray-100 dark:border-zinc-800 transform transition-all animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{formData.id ? 'Edit Grade' : 'Add New Grade'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 mb-2 uppercase tracking-[0.2em]">Subject</label>
            {subjects.length > 0 ? (
              <select 
                value={formData.subject || ''}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white appearance-none cursor-pointer"
              >
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="Other">Other</option>
              </select>
            ) : (
              <input 
                type="text" 
                placeholder="Subject Name"
                value={formData.subject || ''}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white"
              />
            )}
            {formData.subject === 'Other' && (
               <input 
                type="text" 
                placeholder="Enter subject name"
                className="w-full px-5 py-4 mt-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white"
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 mb-2 uppercase tracking-[0.2em]">Grade / Score</label>
              <input 
                type="number" 
                placeholder="0-100"
                value={formData.value ?? ''}
                onChange={e => setFormData({ ...formData, value: Number(e.target.value) })}
                className="w-full px-5 py-4 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white font-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 mb-2 uppercase tracking-[0.2em]">Weight (%)</label>
              <input 
                type="number" 
                placeholder="100"
                value={formData.weight ?? ''}
                onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })}
                className="w-full px-5 py-4 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white font-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 mb-2 uppercase tracking-[0.2em]">Date Obtained</label>
            <input 
              type="date" 
              value={formData.date || ''}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-5 py-4 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 mb-2 uppercase tracking-[0.2em]">Note (Optional)</label>
            <input 
              type="text" 
              placeholder="Midterm, Assignment, etc."
              value={formData.note || ''}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
              className="w-full px-5 py-4 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white"
            />
          </div>

          <div className="flex gap-4 pt-6">
            {formData.id && (
              <button 
                onClick={() => onDelete(formData.id)}
                className="px-6 py-4 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-sm font-black hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                Delete
              </button>
            )}
            <div className="flex-grow" />
            <button 
              onClick={() => onSave(formData)}
              disabled={!formData.subject || formData.value === undefined}
              className="px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-30 active:scale-95"
            >
              {formData.id ? 'Update Grade' : 'Log Grade'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeModal;
