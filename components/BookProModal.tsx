
import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { getBookProInsights } from '../services/geminiService.ts';
import { Language } from '../types.ts';

interface BookProModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const BookProModal: React.FC<BookProModalProps> = ({ isOpen, onClose, language }) => {
  const [bookName, setBookName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; sources: any[] } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookName.trim()) return;

    setIsLoading(true);
    setResult(null);
    try {
      const data = await getBookProInsights(bookName, language);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Failed to research the book. Please check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight leading-none">AI Book Pro</h2>
                <p className="text-white/70 text-sm font-medium mt-1">Deep research on any literary work</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              placeholder="Enter book title and author..."
              className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-6 pr-16 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
            />
            <button 
              type="submit"
              disabled={isLoading || !bookName.trim()}
              className="absolute right-2 top-2 bottom-2 px-4 bg-white text-indigo-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : 'Search'}
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50 dark:bg-zinc-950">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-900/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Consulting the Archives...</p>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">Searching Google for book insights</p>
            </div>
          ) : result ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="markdown-body prose prose-sm dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-p:font-medium prose-p:leading-relaxed prose-li:font-medium text-gray-800 dark:text-zinc-200">
                <Markdown>{result.text}</Markdown>
              </div>

              {result.sources.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-zinc-800">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Verification Sources</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.sources.map((source, idx) => (
                      <a 
                        key={idx}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all flex items-center gap-2"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 00-2 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-900 rounded-[2rem] flex items-center justify-center text-gray-400 mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Ready to Research</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2 max-w-xs">
                Type a book name above to get a deep AI analysis powered by real-time web search.
              </p>
            </div>
          )}
        </div>

        <div className="p-8 pt-0 mt-auto border-t border-gray-50 dark:border-zinc-800 pt-6 bg-gray-50 dark:bg-zinc-950">
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl font-black text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white border border-gray-100 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all active:scale-95"
          >
            Close
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

export default BookProModal;
