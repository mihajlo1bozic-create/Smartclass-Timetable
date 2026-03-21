
import React, { useState, useRef } from 'react';
import { extractTimetableFromImage } from '../services/geminiService.ts';
import { ScheduleBlock } from '../types.ts';

interface AIUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (blocks: Partial<ScheduleBlock>[]) => void;
}

const AIUploadModal: React.FC<AIUploadModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Partial<ScheduleBlock>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const handleExtract = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      const base64 = preview.split(',')[1];
      const extracted = await extractTimetableFromImage(base64);
      setResults(extracted);
    } catch (error) {
      alert("Failed to process image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    onConfirm(results);
    onClose();
    setResults([]);
    setPreview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50/30">
          <div>
            <h2 className="text-xl font-bold text-indigo-900">AI Schedule Scan</h2>
            <p className="text-xs text-indigo-700 font-medium">Extract events from photos of your timetable</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-indigo-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6">
          {!results.length ? (
            <div className="flex flex-col items-center justify-center py-12">
              {preview ? (
                <div className="relative group max-w-xs mb-8">
                  <img src={preview} alt="Preview" className="rounded-2xl shadow-lg border-4 border-white" />
                  {!loading && (
                    <button 
                      onClick={() => { setPreview(null); }}
                      className="absolute -top-3 -right-3 p-1.5 bg-red-500 text-white rounded-full shadow-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M165.66,101.66,139.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32Z"></path></svg>
                    </button>
                  )}
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full max-w-sm border-2 border-dashed border-indigo-200 bg-indigo-50/20 rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 transition-colors group"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <span className="text-sm font-semibold text-indigo-900">Upload Timetable Image</span>
                  <span className="text-xs text-indigo-400 mt-1">Supports PNG, JPG</span>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>
              )}

              {preview && !loading && (
                <button 
                  onClick={handleExtract}
                  className="px-12 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-3"
                >
                  Start Extraction
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </button>
              )}

              {loading && (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-indigo-900 font-bold animate-pulse">Gemini is parsing your schedule...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Detected Classes ({results.length})</h3>
              <div className="space-y-3">
                {results.map((res, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-md uppercase">{res.day}</span>
                        <span className="text-xs font-bold text-gray-400">{res.startTime} - {res.endTime}</span>
                      </div>
                      <h4 className="font-bold text-gray-900">{res.subject}</h4>
                      <p className="text-xs text-gray-500 font-medium">{res.room} • {res.teacher}</p>
                    </div>
                    <button 
                      onClick={() => setResults(results.filter((_, idx) => idx !== i))}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="p-6 border-t border-gray-100 flex gap-4 bg-white">
            <button 
              onClick={() => setResults([])}
              className="px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
            >
              Discard
            </button>
            <button 
              onClick={handleFinish}
              className="flex-grow px-6 py-3 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-colors"
            >
              Add to Timetable
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIUploadModal;
