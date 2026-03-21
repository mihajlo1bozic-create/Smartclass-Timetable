
import React, { useState, useEffect } from 'react';
import { ScheduleBlock, Day, BlockType } from '../types.ts';
import { PASTEL_COLORS } from '../constants.ts';

interface BlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (block: ScheduleBlock) => void;
  onDelete: (id: string) => void;
  initialData: ScheduleBlock | null;
}

const BlockModal: React.FC<BlockModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData }) => {
  const [formData, setFormData] = useState<ScheduleBlock>({
    id: '',
    day: Day.MONDAY,
    startTime: '09:00',
    endTime: '10:00',
    type: BlockType.CLASS,
    subject: '',
    teacher: '',
    room: '',
    color: PASTEL_COLORS[0].bg
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{formData.id ? 'Edit Block' : 'Add New Block'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button 
              onClick={() => setFormData({ ...formData, type: BlockType.CLASS })}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${formData.type === BlockType.CLASS ? 'bg-white shadow-sm' : 'text-gray-500'}`}
            >
              Class
            </button>
            <button 
              onClick={() => setFormData({ ...formData, type: BlockType.BREAK })}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${formData.type === BlockType.BREAK ? 'bg-white shadow-sm' : 'text-gray-500'}`}
            >
              Study Break
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Start Time</label>
              <input 
                type="time" 
                value={formData.startTime || ''}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">End Time</label>
              <input 
                type="time" 
                value={formData.endTime || ''}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {formData.type === BlockType.CLASS && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Subject</label>
                <input 
                  type="text" 
                  placeholder="e.g. Physics 101"
                  value={formData.subject || ''}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Room</label>
                  <input 
                    type="text" 
                    placeholder="B-402"
                    value={formData.room || ''}
                    onChange={e => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Teacher</label>
                  <input 
                    type="text" 
                    placeholder="Dr. Smith"
                    value={formData.teacher || ''}
                    onChange={e => setFormData({ ...formData, teacher: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Theme Color</label>
                <div className="flex gap-2 mt-2">
                  {PASTEL_COLORS.map(color => (
                    <button
                      key={color.bg}
                      onClick={() => setFormData({ ...formData, color: color.bg })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${color.bg} ${formData.color === color.bg ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-6">
            {formData.id && (
              <button 
                onClick={() => onDelete(formData.id)}
                className="px-4 py-2 border border-red-100 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            )}
            <div className="flex-grow" />
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-gray-50 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => onSave(formData)}
              disabled={formData.type === BlockType.CLASS && !formData.subject}
              className="px-6 py-2 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-30"
            >
              {formData.id ? 'Save Changes' : 'Add Block'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockModal;
