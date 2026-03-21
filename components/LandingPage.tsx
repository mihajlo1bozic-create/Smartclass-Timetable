
import React, { useState } from 'react';
import { User } from '../types.ts';
import { verifyGoogleCredentials } from '../services/authService.ts';

interface LandingPageProps {
  onLogin: (user: User) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    const steps = [
      "Establishing secure connection...",
      "Handshaking with Google Identity...",
      "Validating credentials...",
      "Synchronizing profile data..."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setStatusText(steps[currentStep]);
        currentStep++;
      }
    }, 600);

    try {
      const user = await verifyGoogleCredentials(email, password);
      clearInterval(interval);
      setStatusText("Authentication Successful!");
      setTimeout(() => onLogin(user), 500);
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || "Could not verify account. Please check your connection.");
    } finally {
      setIsLoading(false);
      setStatusText("");
    }
  };

  const simulateGoogleExpress = () => {
    // Legacy support for the quick one-tap feel
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
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 flex flex-col items-center justify-center p-6 font-sans transition-colors relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
      
      <div className="max-w-md w-full text-center relative z-10">
        <div className="mb-8 flex justify-center">
          <div className="w-16 h-16 bg-black dark:bg-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-black/10 transition-transform hover:scale-110 duration-500">
            <span className="text-white font-black text-3xl">S</span>
          </div>
        </div>
        
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">SmartClass</h1>
        <p className="text-gray-500 dark:text-zinc-400 mb-8 text-sm font-bold uppercase tracking-[0.2em] opacity-60">
          Academic OS • Next Gen
        </p>

        <div className="bg-white dark:bg-zinc-900 p-8 sm:p-10 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-zinc-800 flex flex-col items-stretch">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Sign in to SmartClass</h2>
          <p className="text-xs text-gray-400 mb-8 font-medium">Use your Google Account for seamless sync</p>
          
          <form onSubmit={handleFormLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-2">Google Email</label>
              <input 
                type="email"
                required
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white"
              />
            </div>

            <div className="relative">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-2">Password</label>
              <input 
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 bottom-3.5 text-gray-400 hover:text-indigo-500 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 rounded-xl text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-tight flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl font-black text-base shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
                isLoading 
                  ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 cursor-wait' 
                  : 'bg-black dark:bg-indigo-600 text-white hover:opacity-90'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
                  {statusText || "Authenticating..."}
                </>
              ) : (
                "Sign In with Google"
              )}
            </button>
          </form>
        </div>
        
        <p className="mt-10 text-[10px] text-gray-400 font-bold uppercase tracking-widest px-12 leading-loose">
          Secure Identity Verification provided by <span className="text-gray-900 dark:text-zinc-500">Google Auth Services v2.1</span>
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
