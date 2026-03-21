
import React, { useState, useEffect } from 'react';
import { UsageStats } from '../types.ts';

interface ProSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  lowGradeAlerts: boolean;
  setLowGradeAlerts: (enabled: boolean) => void;
  onStartAIStudy: () => void;
  onOpenNoteMaker: () => void;
  onOpenBookPro: () => void;
}

const ProSettingsModal: React.FC<ProSettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  toggleTheme,
  notificationsEnabled,
  setNotificationsEnabled,
  lowGradeAlerts,
  setLowGradeAlerts,
  onStartAIStudy,
  onOpenNoteMaker,
  onOpenBookPro,
}) => {
  const [activeTab, setActiveTab] = useState<'features' | 'usage'>('features');
  const [usage, setUsage] = useState<UsageStats>({ extract: 0, notes: 0, study: 0, bookPro: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('smartclass_usage');
    if (saved) {
      setUsage(JSON.parse(saved));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Pricing estimates (Gemini 2.0 Flash)
  // Input: $0.10 / 1M tokens, Output: $0.40 / 1M tokens
  // Average request cost estimates:
  const COSTS = {
    extract: 0.0003, // ~$0.10/1M * 1000 + $0.40/1M * 500
    notes: 0.0013,   // ~$0.10/1M * 5000 + $0.40/1M * 2000
    study: 0.0004,   // ~$0.10/1M * 2000 + $0.40/1M * 500
    bookPro: 0.0005  // ~$0.10/1M * 3000 + $0.40/1M * 500
  };

  const totalCost = (usage.extract * COSTS.extract) + (usage.notes * COSTS.notes) + (usage.study * COSTS.study) + (usage.bookPro * COSTS.bookPro);

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('notifications', 'true');
      } else {
        alert("Please enable notification permissions in your browser settings to use this feature.");
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('notifications', 'false');
    }
  };

  const handleToggleLowGradeAlerts = async () => {
    if (!lowGradeAlerts) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setLowGradeAlerts(true);
        localStorage.setItem('lowGradeAlerts', 'true');
      } else {
        alert("Please enable notification permissions to receive grade warnings.");
      }
    } else {
      setLowGradeAlerts(false);
      localStorage.setItem('lowGradeAlerts', 'false');
    }
  };

  const handleAIStudySession = () => {
    onClose();
    onStartAIStudy();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 no-print">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-8 text-white">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 256 256"><path d="M232,128a104,104,0,1,1-104-104A104.11,104.11,0,0,1,232,128Zm-24,0a80,80,0,1,0-80,80A80.09,80.09,0,0,0,208,128Z"></path></svg>
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight leading-none">Pro Settings</h2>
                <p className="text-white/70 text-sm font-medium mt-1">Enhance your SmartClass experience</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div className="flex p-1 bg-black/20 backdrop-blur-sm rounded-2xl">
            <button 
              onClick={() => setActiveTab('features')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'features' ? 'bg-white text-indigo-600 shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              Features
            </button>
            <button 
              onClick={() => setActiveTab('usage')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'usage' ? 'bg-white text-indigo-600 shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              Usage & Cost
            </button>
          </div>
        </div>

        <div className="p-8 space-y-4 overflow-y-auto max-h-[60vh] custom-scrollbar">
          {activeTab === 'features' ? (
            <>
              <div className="relative group overflow-hidden p-6 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 rounded-3xl border border-indigo-100 dark:border-indigo-900/50 mb-2">
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    </div>
                    <div>
                      <p className="font-black text-gray-900 dark:text-white">AI Study Partner</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">Launch a customized AI study session</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleAIStudySession}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                  >
                    Start AI Study
                  </button>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.45l8.27 14.3H3.73L12 5.45zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>
                </div>
              </div>

              <div className="relative group overflow-hidden p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-3xl border border-amber-100 dark:border-amber-900/50 mb-2">
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 dark:shadow-none">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </div>
                    <div>
                      <p className="font-black text-gray-900 dark:text-white">AI Important Note Maker</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">Convert audio & images into structured notes</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { onClose(); onOpenNoteMaker(); }}
                    className="px-6 py-2.5 bg-orange-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-md active:scale-95"
                  >
                    Launch Maker
                  </button>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                </div>
              </div>

              <div className="relative group overflow-hidden p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-3xl border border-blue-100 dark:border-blue-900/50 mb-2">
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                    <div>
                      <p className="font-black text-gray-900 dark:text-white">AI Book Pro</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">Deep research on any literary work</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { onClose(); onOpenBookPro(); }}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md active:scale-95"
                  >
                    Launch Pro
                  </button>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-zinc-800/50 rounded-3xl border border-gray-100 dark:border-zinc-800 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  </div>
                  <div>
                    <p className="font-black text-gray-900 dark:text-white">Exam Alerts</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">Get notified 15m before exams</p>
                  </div>
                </div>
                <button 
                  onClick={handleToggleNotifications}
                  className={`w-14 h-8 rounded-full relative transition-all duration-300 ${notificationsEnabled ? 'bg-rose-500' : 'bg-gray-200 dark:bg-zinc-700'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md ${notificationsEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-zinc-800/50 rounded-3xl border border-gray-100 dark:border-zinc-800 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div>
                    <p className="font-black text-gray-900 dark:text-white">Low Grade Alerts</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">Alerts when grades need improvement</p>
                  </div>
                </div>
                <button 
                  onClick={handleToggleLowGradeAlerts}
                  className={`w-14 h-8 rounded-full relative transition-all duration-300 ${lowGradeAlerts ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-zinc-700'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md ${lowGradeAlerts ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-zinc-800/50 rounded-3xl border border-gray-100 dark:border-zinc-800 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
                    {isDarkMode ? (
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    ) : (
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4-9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 12.728l-.707-.707M6.343 17.657l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    )}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 dark:text-white">Appearance</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">{isDarkMode ? 'Dark Mode Active' : 'Light Mode Active'}</p>
                  </div>
                </div>
                <button 
                  onClick={toggleTheme}
                  className={`w-14 h-8 rounded-full relative transition-all duration-300 ${isDarkMode ? 'bg-indigo-600' : 'bg-amber-400'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md ${isDarkMode ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-8 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-500/20">
                <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">Estimated Total Cost</p>
                <h3 className="text-4xl font-black tracking-tighter">${totalCost.toFixed(4)}</h3>
                <p className="text-[10px] mt-4 opacity-70 leading-relaxed">
                  Costs are estimated based on average token usage for Gemini 2.0 Flash. 
                  Actual costs may vary slightly depending on the length of your inputs and AI responses.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="p-6 bg-gray-50 dark:bg-zinc-800/50 rounded-3xl border border-gray-100 dark:border-zinc-800">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-black text-gray-900 dark:text-white">AI Extract</p>
                      <p className="text-[10px] text-gray-500 dark:text-zinc-400 uppercase tracking-widest">Schedule from photo</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{usage.extract}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">Requests</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-zinc-700">
                    <span className="text-xs font-bold text-gray-500">Est. Cost</span>
                    <span className="text-sm font-black text-gray-900 dark:text-white">${(usage.extract * COSTS.extract).toFixed(4)}</span>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-zinc-800/50 rounded-3xl border border-gray-100 dark:border-zinc-800">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-black text-gray-900 dark:text-white">AI Note Maker</p>
                      <p className="text-[10px] text-gray-500 dark:text-zinc-400 uppercase tracking-widest">Audio & Image to Notes</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{usage.notes}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">Requests</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-zinc-700">
                    <span className="text-xs font-bold text-gray-500">Est. Cost</span>
                    <span className="text-sm font-black text-gray-900 dark:text-white">${(usage.notes * COSTS.notes).toFixed(4)}</span>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-zinc-800/50 rounded-3xl border border-gray-100 dark:border-zinc-800">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-black text-gray-900 dark:text-white">AI Study Partner</p>
                      <p className="text-[10px] text-gray-500 dark:text-zinc-400 uppercase tracking-widest">Chat & Insights</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{usage.study}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">Requests</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-zinc-700">
                    <span className="text-xs font-bold text-gray-500">Est. Cost</span>
                    <span className="text-sm font-black text-gray-900 dark:text-white">${(usage.study * COSTS.study).toFixed(4)}</span>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-zinc-800/50 rounded-3xl border border-gray-100 dark:border-zinc-800">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-black text-gray-900 dark:text-white">AI Book Pro</p>
                      <p className="text-[10px] text-gray-500 dark:text-zinc-400 uppercase tracking-widest">Deep Literary Research</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{usage.bookPro}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">Requests</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-zinc-700">
                    <span className="text-xs font-bold text-gray-500">Est. Cost</span>
                    <span className="text-sm font-black text-gray-900 dark:text-white">${(usage.bookPro * COSTS.bookPro).toFixed(4)}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-amber-50 dark:bg-amber-950/20 rounded-3xl border border-amber-100 dark:border-amber-900/50">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-300 leading-relaxed">
                    Pricing is based on Google's Gemini API pay-as-you-go rates. These estimates help you track your budget while using your own API key.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 pt-0 mt-auto border-t border-gray-50 dark:border-zinc-800 pt-6">
          <button
            onClick={onClose}
            className="w-full py-5 rounded-[1.75rem] font-black text-lg bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 20px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
      `}</style>
    </div>
  );
};

export default ProSettingsModal;
