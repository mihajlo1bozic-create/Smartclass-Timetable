
import React, { useState, useEffect } from 'react';
import { Timetable } from '../types.ts';
import { getPrintOptimizedSummary } from '../services/geminiService.ts';

interface PrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPrint: () => void;
  timetable: Timetable;
}

const PrinterModal: React.FC<PrinterModalProps> = ({ isOpen, onClose, onConfirmPrint, timetable }) => {
  const [step, setStep] = useState<'idle' | 'scanning' | 'ready'>('idle');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [aiSummary, setAiSummary] = useState('');

  useEffect(() => {
    if (!isOpen) {
        setStep('idle');
        setProgress(0);
        setStatusText('');
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    setStep('scanning');
    
    const statusMessages = [
      "Analyzing timetable density...",
      "Extracting academic patterns...",
      "Applying AI visual optimizations...",
      "Generating strategic overview...",
      "Finalizing high-resolution PDF..."
    ];

    let currentMsg = 0;
    const interval = setInterval(() => {
      if (currentMsg < statusMessages.length) {
        setStatusText(statusMessages[currentMsg]);
        setProgress((prev) => Math.min(prev + 20, 95));
        currentMsg++;
      }
    }, 800);

    try {
      const summary = await getPrintOptimizedSummary(timetable);
      setAiSummary(summary);
      clearInterval(interval);
      setProgress(100);
      setStatusText("Generation Complete");
      setTimeout(() => setStep('ready'), 500);
    } catch (error) {
      console.error(error);
      clearInterval(interval);
      setStep('idle');
      alert("AI Scan failed. You can still print the basic view.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 no-print">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in duration-300">
        <div className="p-8 text-center">
            {step === 'idle' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-6">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">AI Print Engine</h2>
                    <p className="text-gray-500 dark:text-zinc-400 font-medium text-sm leading-relaxed mb-8">
                        Our AI will scan your timetable to optimize the layout and provide a strategic summary for your PDF.
                    </p>
                    
                    <button 
                        onClick={handleGenerate}
                        className="w-full py-4 bg-black dark:bg-indigo-600 text-white rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-500/10"
                    >
                        Scan & Generate PDF
                    </button>
                </div>
            )}

            {step === 'scanning' && (
                <div className="py-10 animate-in fade-in zoom-in-95">
                    <div className="relative w-24 h-24 mx-auto mb-8">
                        <div className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-900 rounded-full" />
                        <div 
                            className="absolute inset-0 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"
                            style={{ transition: 'all 0.5s ease' }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center font-black text-indigo-600 text-xl">
                            {progress}%
                        </div>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">{statusText}</h3>
                    <p className="text-xs text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest">Grounded in your timetable data</p>
                </div>
            )}

            {step === 'ready' && (
                <div className="animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-6 border border-emerald-100 dark:border-emerald-900">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">PDF Ready</h2>
                    <p className="text-gray-500 dark:text-zinc-400 font-medium text-sm leading-relaxed mb-8">
                        Your optimized timetable PDF has been generated with AI insights.
                    </p>

                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-2xl mb-8 text-left border border-gray-100 dark:border-zinc-800">
                         <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">AI Overview Attachment</p>
                         <p className="text-xs font-medium text-gray-600 dark:text-zinc-300 line-clamp-3 italic">"{aiSummary}"</p>
                    </div>
                    
                    <button 
                        onClick={() => {
                            // The actual "Download PDF" is the system print dialog set to "Save as PDF"
                            // We trigger it and the print styles in index.html/CSS handle the layout
                            onConfirmPrint();
                            onClose();
                        }}
                        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
                    >
                        Download PDF File
                    </button>
                </div>
            )}
            
            <button 
                onClick={onClose}
                disabled={step === 'scanning'}
                className="mt-4 text-sm font-bold text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 uppercase tracking-widest transition-colors disabled:opacity-30"
            >
                Cancel
            </button>
        </div>
      </div>
    </div>
  );
};

export default PrinterModal;
