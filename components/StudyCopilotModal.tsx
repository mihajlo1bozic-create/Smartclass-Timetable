import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
// Fix: Import sendStudyChatMessage only, ChatMessage is not exported from geminiService
import { sendStudyChatMessage, analyzeStudyPages } from '../services/geminiService.ts';
// Fix: Import ChatMessage and Timetable from types
import { Timetable, ChatMessage, SearchSource } from '../types.ts';

interface StudyCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  grade: number;
  data: { text: string; sources: any[] } | null;
  isLoading: boolean;
  history: ChatMessage[];
  onUpdateHistory: (history: ChatMessage[]) => void;
  onClearHistory: () => void;
  timetableContext: Timetable;
}

const StudyCopilotModal: React.FC<StudyCopilotModalProps> = ({ 
  isOpen, onClose, subject, grade, data, isLoading, history, onUpdateHistory, onClearHistory, timetableContext 
}) => {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [sourceFocus, setSourceFocus] = useState<SearchSource>(SearchSource.GOOGLE);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize/Update with AI result if it's a new trigger
  useEffect(() => {
    if (isOpen && data && data.text) {
      // Check if this specific response is already in history to avoid duplicates
      const exists = history.some(m => m.text === data.text);
      if (!exists) {
        const aiMsg: ChatMessage = {
          role: 'model',
          text: data.text,
          sources: data.sources,
          timestamp: Date.now()
        };
        onUpdateHistory([...history, aiMsg]);
      }
    }
  }, [isOpen, data]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isSending]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    const newHistory = [...history, userMsg];
    onUpdateHistory(newHistory);
    setInput('');
    setIsSending(true);

    try {
      const response = await sendStudyChatMessage(newHistory, subject, timetableContext, sourceFocus, timetableContext.language);
      const aiMsg: ChatMessage = {
        role: 'model',
        text: response.text,
        sources: response.sources,
        timestamp: Date.now()
      };
      onUpdateHistory([...newHistory, aiMsg]);
    } catch (err) {
      console.error(err);
      onUpdateHistory([...newHistory, { 
        role: 'model', 
        text: "My neural link to the library is unstable. Let's try rephrasing that.", 
        timestamp: Date.now() 
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const generatePDF = (content: string, title: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxLineWidth = pageWidth - margin * 2;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Study Summary: " + title, margin, 20);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    const splitText = doc.splitTextToSize(content, maxLineWidth);
    let cursorY = 30;

    splitText.forEach((line: string) => {
      if (cursorY > 280) {
        doc.addPage();
        cursorY = 20;
      }
      doc.text(line, margin, cursorY);
      cursorY += 7;
    });

    doc.save(`Study_Summary_${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsScanning(true);
    const base64Images: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.readAsDataURL(file);
        });
        base64Images.push(base64);
      }

      const summary = await analyzeStudyPages(base64Images, timetableContext.language);
      
      const aiMsg: ChatMessage = {
        role: 'model',
        text: "I've analyzed your study pages! Here's the summary. I'm also generating a PDF for you to keep.",
        timestamp: Date.now()
      };
      
      const summaryMsg: ChatMessage = {
        role: 'model',
        text: summary,
        timestamp: Date.now()
      };

      onUpdateHistory([...history, aiMsg, summaryMsg]);
      generatePDF(summary, subject || "New Scan");

    } catch (err) {
      console.error(err);
      alert("Failed to analyze pages. Please try again.");
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-zinc-950 w-full max-w-3xl h-[85vh] rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white relative shrink-0">
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight leading-none">Copilot Memory Center</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Grounded Context: {subject}</span>
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); if(confirm("Clear all session memory?")) onClearHistory(); }}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2"
                title="Clear Memory"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                Reset
              </button>
              <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50/30 dark:bg-zinc-900/10"
        >
          {history.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
              <div className="w-20 h-20 bg-gray-200 dark:bg-zinc-800 rounded-[2rem] flex items-center justify-center mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              </div>
              <p className="font-black text-sm uppercase tracking-widest">Memory Bank Empty</p>
              <p className="text-xs font-medium">Ask a question to begin persistent learning.</p>
            </div>
          )}

          {history.map((msg, i) => (
            <div 
              key={i} 
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div 
                className={`max-w-[85%] p-5 rounded-[2rem] text-sm font-medium leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 rounded-tl-none border border-gray-100 dark:border-zinc-700'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-700">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-2">Grounded Resources</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((s, idx) => (
                        <a 
                          key={idx}
                          href={s.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-gray-50 dark:bg-zinc-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-gray-200 dark:border-zinc-700 rounded-xl text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 transition-all"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                          {s.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {(isSending || isLoading) && (
            <div className="flex items-start animate-in fade-in duration-300">
              <div className="bg-white dark:bg-zinc-800 p-5 rounded-[2rem] rounded-tl-none border border-gray-100 dark:border-zinc-700 flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Processing Academic Data...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-6 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              multiple 
              accept="image/*" 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning || isSending || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-fuchsia-200 transition-all disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              Scan Study Pages
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowSourceMenu(!showSourceMenu)}
                disabled={isScanning || isSending || isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-200 transition-all disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                Source: {sourceFocus}
              </button>
              
              {showSourceMenu && (
                <div className="absolute bottom-full mb-2 left-0 w-48 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-700 overflow-hidden z-[80] animate-in fade-in slide-in-from-bottom-2">
                  {Object.values(SearchSource).map((source) => (
                    <button
                      key={source}
                      onClick={() => {
                        setSourceFocus(source);
                        setShowSourceMenu(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors ${
                        sourceFocus === source ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-gray-600 dark:text-zinc-400'
                      }`}
                    >
                      {source}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isScanning && (
              <div className="flex items-center gap-2 text-[10px] font-black text-fuchsia-500 animate-pulse uppercase tracking-widest">
                <div className="w-2 h-2 bg-fuchsia-500 rounded-full" />
                AI is Reading...
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask anything about your schedule or learning...`}
              disabled={isSending || isLoading || isScanning}
              className="w-full pl-6 pr-16 py-4 bg-gray-100 dark:bg-zinc-900 border-none rounded-[2rem] text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none dark:text-white transition-all disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isSending || isLoading || isScanning}
              className={`absolute right-2 p-3 rounded-full transition-all active:scale-90 ${
                !input.trim() || isSending || isLoading || isScanning
                  ? 'bg-gray-200 text-gray-400 dark:bg-zinc-800 dark:text-zinc-600' 
                  : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9-7-9-7v14z"/></svg>
            </button>
          </form>
          <div className="flex justify-center mt-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-300 dark:text-zinc-700">Holistic context is enabled • Conversations are persisted</p>
          </div>
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

export default StudyCopilotModal;