
import React, { useState } from 'react';
import { Timetable, User, Language } from '../types.ts';

interface NavbarProps {
  onOpenAI: () => void;
  onOpenPro: () => void;
  onOpenDonation: () => void;
  timetable: Timetable;
  setTimetable: (t: Timetable) => void;
  user: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
  onPrint: () => void;
  onOpenNoteMaker: () => void;
  onOpenBookPro: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onOpenAI, 
  onOpenPro, 
  onOpenDonation,
  timetable, 
  setTimetable, 
  user, 
  onLogin, 
  onLogout, 
  onPrint,
  onOpenNoteMaker,
  onOpenBookPro
}) => {
  const [showShare, setShowShare] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);

  const togglePublic = () => {
    setTimetable({ ...timetable, isPublic: !timetable.isPublic });
  };

  const copyLink = () => {
    const url = `${window.location.origin}/#/share/${timetable.shareSlug}`;
    navigator.clipboard.writeText(url);
    alert("Share link copied to clipboard!");
  };

  const simulateGoogleLogin = () => {
    const mockUser: User = {
      id: 'google-123',
      email: 'alex.student@gmail.com',
      name: 'Alex Student',
      given_name: 'Alex',
      picture: 'https://picsum.photos/seed/alex/100/100'
    };
    onLogin(mockUser);
  };

  return (
    <nav className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 sticky top-0 z-30 no-print transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black dark:bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight dark:text-white hidden xs:block">SmartClass</h1>
            </div>

            <button 
              onClick={onOpenDonation}
              className="px-2.5 sm:px-4 py-1.5 bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 rounded-xl text-[10px] sm:text-xs font-black hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-all flex items-center gap-1.5 border border-amber-100 dark:border-amber-800/30 active:scale-95 group snow-cap"
            >
              <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
              Donation
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowLanguages(!showLanguages)}
                className="px-2.5 sm:px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] sm:text-xs font-black hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-all flex items-center gap-1.5 border border-indigo-100 dark:border-indigo-800/30 active:scale-95 group snow-cap"
              >
                <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                Languages
              </button>

              {showLanguages && (
                <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl py-2 z-50">
                  {Object.values(Language).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setTimetable({ ...timetable, language: lang });
                        setShowLanguages(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-xs font-bold transition-colors flex items-center justify-between ${
                        timetable.language === lang 
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                          : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {lang}
                      {timetable.language === lang && (
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button 
              onClick={onOpenPro}
              className="p-1.5 sm:px-3 sm:py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-black hover:opacity-90 transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 active:scale-95 snow-cap"
              title="Pro Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M232,128a104,104,0,1,1-104-104A104.11,104.11,0,0,1,232,128Zm-24,0a80,80,0,1,0-80,80A80.09,80.09,0,0,0,208,128Zm-72-56V128a8,8,0,0,1-16,0V72a8,8,0,0,1,16,0Zm56,56a8,8,0,0,1-8,8H128a8,8,0,0,1,0-16h56A8,8,0,0,1,192,128Z"></path></svg>
              <span className="hidden md:inline">Pro Settings</span>
            </button>

            <button 
              onClick={onOpenAI}
              className="p-1.5 sm:px-3 sm:py-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 rounded-xl text-xs font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors flex items-center gap-1.5 border border-indigo-100 dark:border-indigo-900 snow-cap"
              title="AI Extract"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M216,40V216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8H208A8,8,0,0,1,216,40ZM192,56H64V200H192ZM160,112a12,12,0,1,1-12-12A12,12,0,0,1,160,112Zm-52,0a12,12,0,1,1-12-12A12,12,0,0,1,108,112Zm44,48a40,40,0,0,1-48,0,8,8,0,0,1,8.48-13.54,24,24,0,0,0,31,0A8,8,0,1,1,152,160Z"></path></svg>
              <span className="hidden md:inline">AI Extract</span>
            </button>

            <button 
              onClick={onOpenNoteMaker}
              className="p-1.5 sm:px-3 sm:py-1.5 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 rounded-xl text-xs font-medium hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors flex items-center gap-1.5 border border-orange-100 dark:border-orange-900 snow-cap"
              title="AI Note Maker"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M11,5H6a2,2,0,0,0-2,2v11a2,2,0,0,0,2,2h11a2,2,0,0,0,2-2v-5m-1.414-9.414a2,2,0,1,1,2.828,2.828L11.828,15H9v-2.828l8.586-8.586z"></path></svg>
              <span className="hidden md:inline">Note Maker</span>
            </button>

            <button 
              onClick={onOpenBookPro}
              className="p-1.5 sm:px-3 sm:py-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 rounded-xl text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors flex items-center gap-1.5 border border-blue-100 dark:border-blue-900 snow-cap"
              title="AI Book Pro"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              <span className="hidden md:inline">Book Pro</span>
            </button>

            <button 
              onClick={onPrint}
              className="p-2 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors hidden sm:block"
              title="Print Timetable"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M200,80H168V48a8,8,0,0,0-8-8H96a8,8,0,0,0-8,8V80H56a16,16,0,0,0-16,16v80a16,16,0,0,0,16,16h24v24a8,8,0,0,0,8,8h80a8,8,0,0,0,8-8V192h24a16,16,0,0,0,16-16V96A16,16,0,0,0,200,80ZM104,56h48V80H104Zm48,160H104V160h48Zm48-40H176V152a8,8,0,0,0-8-8H88a8,8,0,0,0-8,8v24H56V96H200v80Zm-12-52a12,12,0,1,1-12-12A12,12,0,0,1,188,124Z"></path></svg>
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowShare(!showShare)}
                className="p-2 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                title="Share Timetable"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M216,120v88a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V120a16,16,0,0,1,16-16h40a8,8,0,0,1,0,16H56v88H200V120H160a8,8,0,0,1,0-16h40A16,16,0,0,1,216,120ZM120,43.31V152a8,8,0,0,0,16,0V43.31l26.34,26.35a8,8,0,0,0,11.32-11.32l-40-40a8,8,0,0,0-11.32,0l-40,40a8,8,0,0,0,11.32,11.32Z"></path></svg>
              </button>
              
              {showShare && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl p-4 z-50">
                  <h3 className="text-sm font-semibold mb-3 dark:text-white">Share Settings</h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-gray-600 dark:text-zinc-400">Public Access</span>
                    <button 
                      onClick={togglePublic}
                      className={`w-10 h-5 rounded-full relative transition-colors ${timetable.isPublic ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-zinc-700'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${timetable.isPublic ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                  {timetable.isPublic && (
                    <button 
                      onClick={copyLink}
                      className="w-full py-2 bg-gray-900 dark:bg-indigo-600 text-white rounded-xl text-xs font-medium hover:bg-gray-800 dark:hover:bg-indigo-700 transition-colors"
                    >
                      Copy Link
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-gray-200 dark:bg-zinc-800 mx-1 hidden sm:block" />

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-gray-200 dark:border-zinc-700" />
                </button>
                {showProfile && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-50 dark:border-zinc-800 mb-1">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Signed in as</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-gray-500 dark:text-zinc-500 truncate">{user.email}</p>
                    </div>
                    <button 
                      onClick={onLogout}
                      className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={simulateGoogleLogin}
                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all shadow-sm snow-cap"
              >
                <svg width="16" height="16" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.49h4.84c-.21 1.12-.84 2.07-1.79 2.7l2.86 2.22c1.67-1.55 2.63-3.81 2.63-6.57z" fill="#4285F4"/><path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.86-2.22c-.8.53-1.82.85-3.1.85-2.39 0-4.41-1.6-5.13-3.76H.95v2.33C2.43 15.89 5.5 18 9 18z" fill="#34A853"/><path d="M3.87 10.69c-.19-.53-.3-1.1-.3-1.69s.11-1.16.3-1.69V4.98H.95C.35 6.19 0 7.56 0 9s.35 2.81.95 4.02l2.92-2.33z" fill="#FBBC05"/><path d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.47C13.47.96 11.43 0 9 0 5.5 0 2.43 2.11.95 4.98l2.92 2.33c.72-2.16 2.74-3.76 5.13-3.76z" fill="#EA4335"/></svg>
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
