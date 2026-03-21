
import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { generateImportantNotes, generateSpeech } from '../services/geminiService.ts';
import { Language } from '../types.ts';

interface NoteMakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const AudioVisualizer: React.FC<{ stream: MediaStream | null }> = ({ stream }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);

  useEffect(() => {
    if (!stream || !canvasRef.current) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#f43f5e'); // rose-500
        gradient.addColorStop(1, '#fb7185'); // rose-400

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      audioContext.close();
    };
  }, [stream]);

  return <canvas ref={canvasRef} width={300} height={60} className="w-full h-16 rounded-xl" />;
};

const NoteMakerModal: React.FC<NoteMakerModalProps> = ({ isOpen, onClose, language }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [notes, setNotes] = useState<string | null>(null);
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [recordingTime, setRecordingTime] = useState(0);
  
  const voices = [
    { id: 'Kore', name: 'Kore (Female, Clear)', color: 'bg-rose-500' },
    { id: 'Zephyr', name: 'Zephyr (Male, Warm)', color: 'bg-indigo-500' },
    { id: 'Puck', name: 'Puck (Playful)', color: 'bg-emerald-500' },
    { id: 'Charon', name: 'Charon (Deep)', color: 'bg-zinc-700' },
    { id: 'Fenrir', name: 'Fenrir (Strong)', color: 'bg-amber-600' }
  ];

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<string[]>([]);
  const currentChunkIndexRef = useRef<number>(0);

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setIsRecording(false);
    setAudioStream(null);
    setAudioBase64(null);
    setImages([]);
    setNotes(null);
    setContext('');
    setIsLoading(false);
    setIsSpeaking(false);
    setIsFullscreen(false);
    setSelectedVoice('Kore');
    setRecordingTime(0);
    currentChunkIndexRef.current = 0;
    chunksRef.current = [];
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          setAudioBase64(base64);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileList = Array.from(files);
    const newImages = await Promise.all(
      fileList.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve((reader.result as string).split(',')[1]);
          };
          reader.readAsDataURL(file);
        });
      })
    );

    setImages(prev => [...prev, ...newImages]);
  };

  const handleGenerateNotes = async () => {
    if (!audioBase64 && images.length === 0) {
      alert("Please provide some audio or images first.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateImportantNotes(audioBase64 || undefined, images, language, context);
      setNotes(result);
    } catch (err) {
      console.error(err);
      alert("Failed to generate notes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleListen = async () => {
    if (!notes) return;
    
    if (isSpeaking) {
      audioPlayerRef.current?.pause();
      setIsSpeaking(false);
      currentChunkIndexRef.current = 0;
      return;
    }

    // Split notes into chunks (by paragraph or sentence)
    // We'll use paragraphs for better flow
    const rawChunks = notes.split(/\n\n+/).filter(c => c.trim().length > 0);
    
    // Further split long chunks if needed
    const finalChunks: string[] = [];
    rawChunks.forEach(chunk => {
      if (chunk.length > 800) {
        const subChunks = chunk.match(/[^.!?]+[.!?]+/g) || [chunk];
        finalChunks.push(...subChunks);
      } else {
        finalChunks.push(chunk);
      }
    });

    chunksRef.current = finalChunks.filter(c => c.trim().length > 2);
    currentChunkIndexRef.current = 0;
    
    if (chunksRef.current.length === 0) return;

    setIsSpeaking(true);
    playNextChunk();
  };

  const playNextChunk = async () => {
    if (!isSpeaking || currentChunkIndexRef.current >= chunksRef.current.length) {
      setIsSpeaking(false);
      currentChunkIndexRef.current = 0;
      return;
    }

    const chunk = chunksRef.current[currentChunkIndexRef.current];
    
    try {
      const base64Audio = await generateSpeech(chunk, selectedVoice);
      if (base64Audio && isSpeaking) {
        const audioUrl = `data:audio/wav;base64,${base64Audio}`;
        
        const audio = new Audio(audioUrl);
        audioPlayerRef.current = audio;
        
        audio.onended = () => {
          currentChunkIndexRef.current++;
          playNextChunk();
        };

        audio.onerror = (e) => {
          console.error("Audio chunk error:", e);
          currentChunkIndexRef.current++;
          playNextChunk();
        };

        audio.play().catch(e => {
          console.error("Playback failed:", e);
          setIsSpeaking(false);
        });
      } else {
        // Skip empty or failed chunks
        currentChunkIndexRef.current++;
        playNextChunk();
      }
    } catch (err) {
      console.error("Chunk speech generation failed:", err);
      currentChunkIndexRef.current++;
      playNextChunk();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-zinc-950 w-full max-w-3xl h-[85vh] rounded-[3rem] shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 p-8 text-white shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight leading-none">AI Important Note Maker</h2>
                <p className="text-white/70 text-sm font-medium mt-1">Convert lectures & conversations into structured notes</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {!notes ? (
            <div className="space-y-8">
              {/* Context Input */}
              <div className="bg-gray-50 dark:bg-zinc-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-zinc-800">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-3 ml-2">Lecture Context (Optional)</label>
                <input 
                  type="text" 
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g. Advanced Calculus - Integration by Parts"
                  className="w-full px-6 py-4 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Microphone Section */}
              <div className="p-8 bg-gray-50 dark:bg-zinc-900/50 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center space-y-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${isRecording ? 'bg-rose-500 animate-pulse scale-110 shadow-xl shadow-rose-500/20' : 'bg-white dark:bg-zinc-800 shadow-sm'}`}>
                  <svg className={`w-10 h-10 ${isRecording ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">Conversation Listener</h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-500 font-medium mt-1">Record lectures or discussions</p>
                </div>
                
                {isRecording ? (
                  <div className="flex flex-col items-center gap-4 w-full px-4">
                    <AudioVisualizer stream={audioStream} />
                    <span className="text-2xl font-black font-mono text-rose-500">{formatTime(recordingTime)}</span>
                    <button 
                      onClick={stopRecording}
                      className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-500/20"
                    >
                      Stop & Process
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={startRecording}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                  >
                    {audioBase64 ? 'Re-record Audio' : 'Start Listening'}
                  </button>
                )}
                {audioBase64 && !isRecording && (
                  <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    Audio Captured
                  </div>
                )}
              </div>

              {/* Image Section */}
              <div className="p-8 bg-gray-50 dark:bg-zinc-900/50 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">Lection Visualizer</h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-500 font-medium mt-1">Upload pictures of lections</p>
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                />
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-3 bg-amber-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-700 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
                >
                  Upload Photos
                </button>

                {images.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {images.map((img, i) => (
                      <div key={i} className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white shadow-sm">
                        <img src={`data:image/jpeg;base64,${img}`} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">{images.length} Photos</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] border border-gray-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                
                <div className="flex justify-between items-center mb-10 relative z-10">
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">Study Manuscript</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Synthesized by SmartClass AI</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl">
                      {voices.map(v => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVoice(v.id)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                            selectedVoice === v.id 
                              ? `${v.color} text-white shadow-lg` 
                              : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-white'
                          }`}
                        >
                          {v.id}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={handleListen}
                      disabled={isLoading}
                      className={`p-3 rounded-2xl transition-all active:scale-95 flex items-center gap-2 ${
                        isSpeaking 
                          ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400' 
                          : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'
                      }`}
                      title={isSpeaking ? "Stop Listening" : "Listen to Notes"}
                    >
                      {isSpeaking ? (
                        <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
                      )}
                      <span className="text-[10px] font-black uppercase tracking-widest">{isSpeaking ? 'Stop' : 'Listen'}</span>
                    </button>
                    <button 
                      onClick={() => setIsFullscreen(true)}
                      className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-2xl hover:bg-indigo-100 transition-all active:scale-95"
                      title="Fullscreen View"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"/></svg>
                    </button>
                    <button 
                      onClick={() => {
                        const blob = new Blob([notes], { type: 'text/markdown' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Important_Notes_${Date.now()}.md`;
                        a.click();
                      }}
                      className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-2xl hover:bg-indigo-100 transition-all active:scale-95"
                      title="Download Markdown"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    </button>
                  </div>
                </div>

                <div className="markdown-body prose prose-sm dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-p:font-medium prose-p:leading-relaxed prose-li:font-medium text-gray-800 dark:text-zinc-200">
                  <Markdown>{notes}</Markdown>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen Overlay */}
        {isFullscreen && (
          <div className="fixed inset-0 z-[100] bg-white dark:bg-zinc-950 flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-950">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">Study Manuscript (Fullscreen)</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SmartClass AI Reader</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl">
                  {voices.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVoice(v.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        selectedVoice === v.id 
                          ? `${v.color} text-white shadow-lg` 
                          : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-white'
                      }`}
                    >
                      {v.id}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={handleListen}
                  className={`px-6 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-2 text-xs font-black uppercase tracking-widest ${
                    isSpeaking 
                      ? 'bg-rose-500 text-white' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isSpeaking ? 'Stop Audio' : 'Listen'}
                </button>
                <button 
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto p-10 custom-scrollbar">
              <div className="max-w-4xl mx-auto">
                <div className="markdown-body prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-p:font-medium prose-p:leading-relaxed prose-li:font-medium text-gray-800 dark:text-zinc-200">
                  <Markdown>{notes}</Markdown>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-8 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
          {!notes ? (
            <button 
              onClick={handleGenerateNotes}
              disabled={isLoading || (!audioBase64 && images.length === 0)}
              className={`w-full py-5 rounded-[1.75rem] font-black text-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
                isLoading || (!audioBase64 && images.length === 0)
                  ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 cursor-not-allowed'
                  : 'bg-black dark:bg-indigo-600 text-white hover:opacity-90 shadow-xl shadow-black/10'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  AI is Synthesizing Notes...
                </>
              ) : (
                <>
                  Generate Important Notes
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </>
              )}
            </button>
          ) : (
            <button 
              onClick={resetState}
              className="w-full py-5 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-[1.75rem] font-black text-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all active:scale-95"
            >
              Create New Notes
            </button>
          )}
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

export default NoteMakerModal;
