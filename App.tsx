
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, useParams, Navigate } from 'react-router-dom';
import { Timetable, ScheduleBlock, Day, BlockType, User, Exam, Grade, ChatMessage, Language } from './types.ts';
import { DAYS_OF_WEEK, START_HOUR, END_HOUR } from './constants.ts';
import Navbar from './components/Navbar.tsx';
import TimetableGrid from './components/TimetableGrid.tsx';
import BlockModal from './components/BlockModal.tsx';
import AIUploadModal from './components/AIUploadModal.tsx';
import PrinterModal from './components/PrinterModal.tsx';
import ProSettingsModal from './components/ProSettingsModal.tsx';
import DonationModal from './components/DonationModal.tsx';
import GradeModal from './components/GradeModal.tsx';
import GradeList from './components/GradeList.tsx';
import LandingPage from './components/LandingPage.tsx';
import ExamModal from './components/ExamModal.tsx';
import ExamList from './components/ExamList.tsx';
import StudyCopilotModal from './components/StudyCopilotModal.tsx';
import NoteMakerModal from './components/NoteMakerModal.tsx';
import BookProModal from './components/BookProModal.tsx';
import { getSubjectInsights, getAIGradeSupport, getGeneralStudySupport, generateGlobalStudyPlan } from './services/geminiService.ts';

const INITIAL_TIMETABLE: Timetable = {
  id: 'default',
  name: 'My Semester Schedule',
  userId: 'user-1',
  isPublic: false,
  shareSlug: 'my-schedule-2024',
  blocks: [],
  exams: [],
  grades: [],
  chatHistory: [],
  language: Language.ENGLISH
};

const Dashboard: React.FC<{ user: User | null; onLogin: (u: User) => void; onLogout: () => void }> = ({ user, onLogin, onLogout }) => {
  const [activeTimetableId, setActiveTimetableId] = useState<number>(() => {
    const saved = localStorage.getItem('smartclass_active_timetable');
    return saved ? parseInt(saved) : 1;
  });

  const [timetable, setTimetable] = useState<Timetable>(() => {
    const activeId = localStorage.getItem('smartclass_active_timetable') || '1';
    const saved = localStorage.getItem(`smartclass_timetable_${activeId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.exams) parsed.exams = [];
      if (!parsed.grades) parsed.grades = [];
      if (!parsed.chatHistory) parsed.chatHistory = [];
      return parsed;
    }
    return { ...INITIAL_TIMETABLE, id: `timetable-${activeId}`, name: `Schedule ${activeId}` };
  });

  const handleSwitchTimetable = (id: number) => {
    if (id === activeTimetableId) return;
    // Save current
    localStorage.setItem(`smartclass_timetable_${activeTimetableId}`, JSON.stringify(timetable));
    localStorage.setItem('smartclass_active_timetable', id.toString());
    
    // Load new
    const saved = localStorage.getItem(`smartclass_timetable_${id}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.exams) parsed.exams = [];
      if (!parsed.grades) parsed.grades = [];
      if (!parsed.chatHistory) parsed.chatHistory = [];
      setTimetable(parsed);
    } else {
      setTimetable({ ...INITIAL_TIMETABLE, id: `timetable-${id}`, name: `Schedule ${id}` });
    }
    setActiveTimetableId(id);
  };
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [isProSettingsOpen, setIsProSettingsOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isStudyCopilotOpen, setIsStudyCopilotOpen] = useState(false);
  const [isNoteMakerOpen, setIsNoteMakerOpen] = useState(false);
  const [isBookProOpen, setIsBookProOpen] = useState(false);
  
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem('notifications') === 'true');
  const [lowGradeAlerts, setLowGradeAlerts] = useState(() => localStorage.getItem('lowGradeAlerts') === 'true');
  
  const [insightData, setInsightData] = useState<{ text: string, sources: any[], subject: string } | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  const [studyHelpData, setStudyHelpData] = useState<{ text: string; sources: any[]; subject: string; grade: number } | null>(null);
  const [isStudyHelpLoading, setIsStudyHelpLoading] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem(`smartclass_timetable_${activeTimetableId}`, JSON.stringify(timetable));
  }, [timetable, activeTimetableId]);

  const filteredBlocks = useMemo(() => {
    if (!searchTerm.trim()) return timetable.blocks;
    const term = searchTerm.toLowerCase().trim();
    return timetable.blocks.filter(block => 
      block.subject?.toLowerCase().includes(term) ||
      block.teacher?.toLowerCase().includes(term) ||
      block.room?.toLowerCase().includes(term)
    );
  }, [timetable.blocks, searchTerm]);

  const handleUpdateHistory = (newHistory: ChatMessage[]) => {
    setTimetable(prev => ({ ...prev, chatHistory: newHistory }));
  };

  const handleClearHistory = () => {
    setTimetable(prev => ({ ...prev, chatHistory: [] }));
    setStudyHelpData(null);
  };

  const handleSaveBlock = (block: ScheduleBlock) => {
    const newBlock = block.id ? block : { ...block, id: Math.random().toString(36).substr(2, 9) };
    setTimetable(prev => ({
      ...prev,
      blocks: block.id 
        ? prev.blocks.map(b => b.id === block.id ? newBlock : b)
        : [...prev.blocks, newBlock]
    }));
    setIsModalOpen(false);
    setEditingBlock(null);
  };

  const handleGetStudyHelp = async (subject: string, value: number) => {
    if (!isOnline) {
      alert("Study AI requires internet to research resources.");
      return;
    }
    setStudyHelpData({ text: '', sources: [], subject, grade: value });
    setIsStudyCopilotOpen(true);
    setIsStudyHelpLoading(true);
    try {
      const data = await getAIGradeSupport(subject, value, timetable.language || Language.ENGLISH);
      setStudyHelpData({ ...data, subject, grade: value });
    } catch (error) {
      alert("AI Study Support encountered an error. Please try again later.");
      setIsStudyCopilotOpen(false);
    } finally {
      setIsStudyHelpLoading(false);
    }
  };

  const handleStartGlobalStudyPlan = async () => {
    if (!isOnline) {
      alert("Strategic planning requires an internet connection.");
      return;
    }
    setStudyHelpData({ text: '', sources: [], subject: 'Holistic Academic Strategy', grade: 100 });
    setIsStudyCopilotOpen(true);
    setIsStudyHelpLoading(true);
    try {
      const data = await generateGlobalStudyPlan(timetable, timetable.language || Language.ENGLISH);
      setStudyHelpData({ ...data, subject: 'Strategic Master Plan', grade: 100 });
    } catch (error) {
      console.error(error);
      alert("Failed to generate master plan. Check your internet.");
      setIsStudyCopilotOpen(false);
    } finally {
      setIsStudyHelpLoading(false);
    }
  };

  const handleFetchInsights = async (block: ScheduleBlock) => {
    if (!block.subject) return;
    if (!isOnline) {
      alert("Search insights are unavailable while offline.");
      return;
    }
    setIsInsightLoading(true);
    try {
      const data = await getSubjectInsights(block.subject, block.teacher, timetable.language || Language.ENGLISH);
      setInsightData({ ...data, subject: block.subject });
    } catch (error) {
      alert("Failed to get insights. Try again later.");
    } finally {
      setIsInsightLoading(false);
    }
  };

  const handleImportBlocks = (newBlocks: Partial<ScheduleBlock>[]) => {
    const blocksWithIds = newBlocks.map(b => ({
      ...b,
      id: Math.random().toString(36).substr(2, 9),
      color: b.type === BlockType.BREAK ? 'bg-slate-100' : 'bg-blue-100'
    })) as ScheduleBlock[];
    
    setTimetable(prev => ({
      ...prev,
      blocks: [...prev.blocks, ...blocksWithIds]
    }));
  };

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen pb-12 transition-colors bg-gray-50 dark:bg-zinc-950">
      <Navbar 
        onOpenAI={() => setIsAIModalOpen(true)} 
        onOpenPro={() => setIsProSettingsOpen(true)}
        onOpenDonation={() => setIsDonationModalOpen(true)}
        onOpenNoteMaker={() => setIsNoteMakerOpen(true)}
        onOpenBookPro={() => setIsBookProOpen(true)}
        timetable={timetable}
        setTimetable={setTimetable}
        user={user}
        onLogin={onLogin}
        onLogout={onLogout}
        onPrint={() => setIsPrinterModalOpen(true)}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-8">
        <div className="mb-6 flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="flex-grow order-2 lg:order-1">
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between no-print">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-10 py-3 sm:py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl leading-5 text-sm placeholder-gray-400 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                  placeholder="Search schedule..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-4 py-2 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm self-end sm:self-auto">
                <span className="font-bold text-gray-900 dark:text-white">{filteredBlocks.length}</span>
                <span>items</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-x-auto timetable-scroll-container timetable-container mb-8">
              <TimetableGrid 
                blocks={filteredBlocks} 
                onAddBlock={(day, hour) => {
                  setEditingBlock({ id: '', day, startTime: `${hour}:00`, endTime: `${hour+1}:00`, type: BlockType.CLASS, color: 'bg-blue-100' });
                  setIsModalOpen(true);
                }}
                onEditBlock={(b) => { setEditingBlock(b); setIsModalOpen(true); }}
                onFetchInsights={handleFetchInsights}
              />
            </div>
          </div>

          <aside className="w-full lg:w-80 space-y-6 lg:space-y-8 flex-shrink-0 order-1 lg:order-2">
            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-gray-100 dark:border-zinc-800 shadow-sm p-5 sm:p-6 no-print">
               <h3 className="text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Strategic Center</h3>
               
               <div className="flex gap-2 mb-4">
                 {[1, 2].map(id => (
                   <button
                    key={id}
                    onClick={() => handleSwitchTimetable(id)}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all border ${
                      activeTimetableId === id 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none' 
                        : 'bg-white dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 border-gray-100 dark:border-zinc-700 hover:bg-gray-50'
                    }`}
                   >
                     TIMETABLE {id}
                   </button>
                 ))}
               </div>

               <button 
                onClick={handleStartGlobalStudyPlan}
                className="w-full flex items-center gap-4 p-4 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900 hover:bg-indigo-100 transition-all group mb-3"
               >
                 <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center shadow-sm text-indigo-600 group-hover:scale-110 transition-transform">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                 </div>
                 <div className="text-left">
                   <p className="text-sm font-black">Holistic Plan</p>
                   <p className="text-[10px] opacity-70">Analyze all grades</p>
                 </div>
               </button>

               <button 
                onClick={() => setIsPrinterModalOpen(true)}
                className="w-full flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-900 hover:bg-emerald-100 transition-all group"
               >
                 <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center shadow-sm text-emerald-600 group-hover:scale-110 transition-transform">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                 </div>
                 <div className="text-left">
                   <p className="text-sm font-black">Print Schedule</p>
                   <p className="text-[10px] opacity-70">Generate PDF View</p>
                 </div>
               </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-gray-100 dark:border-zinc-800 shadow-sm p-5 sm:p-6 no-print">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Exams</h3>
                <button onClick={() => { setEditingExam(null); setIsExamModalOpen(true); }} className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg></button>
              </div>
              <ExamList exams={timetable.exams} onEditExam={(e) => { setEditingExam(e); setIsExamModalOpen(true); }} />
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-gray-100 dark:border-zinc-800 shadow-sm p-5 sm:p-6 no-print">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Grades</h3>
                <button onClick={() => { setEditingGrade(null); setIsGradeModalOpen(true); }} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg></button>
              </div>
              <GradeList 
                grades={timetable.grades} 
                onEditGrade={(g) => { setEditingGrade(g); setIsGradeModalOpen(true); }} 
                onGetStudyHelp={handleGetStudyHelp}
              />
            </div>
          </aside>
        </div>
      </main>

      <BlockModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveBlock} onDelete={(id) => setTimetable(p => ({ ...p, blocks: p.blocks.filter(b => b.id !== id) }))} initialData={editingBlock} />
      <AIUploadModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} onConfirm={handleImportBlocks} />
      <PrinterModal isOpen={isPrinterModalOpen} onClose={() => setIsPrinterModalOpen(false)} onConfirmPrint={() => window.print()} timetable={timetable} />
      <ProSettingsModal isOpen={isProSettingsOpen} onClose={() => setIsProSettingsOpen(false)} isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} notificationsEnabled={notificationsEnabled} setNotificationsEnabled={setNotificationsEnabled} lowGradeAlerts={lowGradeAlerts} setLowGradeAlerts={setLowGradeAlerts} onStartAIStudy={handleStartGlobalStudyPlan} onOpenNoteMaker={() => setIsNoteMakerOpen(true)} onOpenBookPro={() => setIsBookProOpen(true)} />
      <DonationModal isOpen={isDonationModalOpen} onClose={() => setIsDonationModalOpen(false)} />
      <ExamModal isOpen={isExamModalOpen} onClose={() => setIsExamModalOpen(false)} onSave={(e) => setTimetable(p => ({ ...p, exams: e.id ? p.exams.map(ex => ex.id === e.id ? e : ex) : [...p.exams, { ...e, id: Math.random().toString(36).substr(2, 9) }] }))} onDelete={(id) => setTimetable(p => ({ ...p, exams: p.exams.filter(ex => ex.id !== id) }))} initialData={editingExam} />
      <GradeModal isOpen={isGradeModalOpen} onClose={() => setIsGradeModalOpen(false)} onSave={(g) => setTimetable(p => ({ ...p, grades: g.id ? p.grades.map(gr => gr.id === g.id ? g : gr) : [...p.grades, { ...g, id: Math.random().toString(36).substr(2, 9) }] }))} onDelete={(id) => setTimetable(p => ({ ...p, grades: p.grades.filter(gr => gr.id !== id) }))} initialData={editingGrade} subjects={Array.from(new Set(timetable.blocks.map(b => b.subject || '').filter(Boolean)))} />

      <StudyCopilotModal 
        isOpen={isStudyCopilotOpen} 
        onClose={() => setIsStudyCopilotOpen(false)} 
        subject={studyHelpData?.subject || ''} 
        grade={studyHelpData?.grade || 0} 
        data={studyHelpData} 
        isLoading={isStudyHelpLoading} 
        history={timetable.chatHistory || []}
        onUpdateHistory={handleUpdateHistory}
        onClearHistory={handleClearHistory}
        timetableContext={timetable}
      />

      <NoteMakerModal 
        isOpen={isNoteMakerOpen}
        onClose={() => setIsNoteMakerOpen(false)}
        language={timetable.language || Language.ENGLISH}
      />

      <BookProModal 
        isOpen={isBookProOpen}
        onClose={() => setIsBookProOpen(false)}
        language={timetable.language || Language.ENGLISH}
      />
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smartclass_user');
    return saved ? JSON.parse(saved) : null;
  });

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard user={user} onLogin={(u) => { setUser(u); localStorage.setItem('smartclass_user', JSON.stringify(u)); }} onLogout={() => { setUser(null); localStorage.removeItem('smartclass_user'); }} />} />
        <Route path="/login" element={!user ? <LandingPage onLogin={(u) => { setUser(u); localStorage.setItem('smartclass_user', JSON.stringify(u)); }} /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
