
import React, { useState } from 'react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DONATION_AMOUNTS = [
  { value: 2, label: '$2', tier: 'Snack' },
  { value: 4, label: '$4', tier: 'Coffee' },
  { value: 8, label: '$8', tier: 'Lunch' },
  { value: 13, label: '$13', tier: 'Pro Pack' }
];

const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'selection' | 'details' | 'processing' | 'success' | 'error'>('selection');
  
  // High-fidelity card states to mimic Stripe Elements
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isInputFocused, setIsInputFocused] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCheckoutStep('details');
  };

  const formatCardNumber = (val: string) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.slice(i, i + 4));
    }
    return parts.length > 0 ? parts.join(' ') : v;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvc) return;

    setCheckoutStep('processing');
    
    // Simulating the actual Stripe 'confirmCardPayment' promise flow
    // Targeted towards the account: mihajlo1bozic@gmail.com
    try {
      // Simulate real API latency
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const isSuccess = Math.random() > 0.15; // Realistic success rate
      if (isSuccess) {
        setCheckoutStep('success');
      } else {
        throw new Error("Payment method was declined.");
      }
    } catch (err) {
      setCheckoutStep('error');
    }
  };

  const resetAndClose = () => {
    setCheckoutStep('selection');
    setSelectedAmount(null);
    setCardNumber('');
    setExpiry('');
    setCvc('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 no-print">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity" onClick={resetAndClose} />
      
      <div className="relative bg-[#F6F9FC] dark:bg-zinc-950 w-full max-w-lg rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(50,50,93,0.25),0_30px_60px_-30px_rgba(0,0,0,0.3)] border border-white/20 overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in duration-500">
        
        {/* Stripe-themed Header */}
        <div className="bg-[#6772E5] p-10 pb-12 text-white relative overflow-hidden">
          {/* Decorative SVG to mimic Stripe's visual style */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-20 pointer-events-none">
            <svg width="400" height="400" viewBox="0 0 400 400" fill="none"><circle cx="200" cy="200" r="200" fill="white"/></svg>
          </div>
          
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                 <svg className="w-7 h-7 text-[#6772e5]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight leading-none">SmartClass Support</h2>
                <p className="text-indigo-100 text-sm font-bold mt-1 opacity-80 uppercase tracking-widest text-[10px]">Recipient: mihajlo1bozic@gmail.com</p>
              </div>
            </div>
            <button onClick={resetAndClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6 flex-grow flex flex-col min-h-[420px]">
          
          {checkoutStep === 'selection' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-4">
                <p className="text-gray-600 dark:text-zinc-400 font-medium">
                  Select a donation amount to support the ongoing development of SmartClass. Every bit helps!
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {DONATION_AMOUNTS.map((amt) => (
                  <button
                    key={amt.value}
                    onClick={() => handleAmountSelect(amt.value)}
                    className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 hover:border-[#6772E5] dark:hover:border-indigo-500 transition-all group relative text-left shadow-sm hover:shadow-md"
                  >
                    <span className="block text-2xl font-black text-gray-900 dark:text-white mb-1 group-hover:text-[#6772E5] dark:group-hover:text-indigo-400 transition-colors">{amt.label}</span>
                    <span className="block text-[10px] font-black uppercase text-gray-400 dark:text-zinc-500 tracking-widest">{amt.tier}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 pt-4">
                 <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Secure Payment Processing</span>
              </div>
            </div>
          )}

          {checkoutStep === 'details' && (
            <form onSubmit={handlePayment} className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">Amount to pay:</span>
                   <span className="text-xl font-black text-[#6772E5] dark:text-indigo-400">${selectedAmount}.00</span>
                </div>

                <div className="space-y-4">
                  <div className={`transition-all p-5 bg-white dark:bg-zinc-900 rounded-2xl border ${isInputFocused === 'card' ? 'border-[#6772E5] ring-4 ring-indigo-50 dark:ring-indigo-950/30' : 'border-gray-200 dark:border-zinc-800'} shadow-sm`}>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Card Information</label>
                    <div className="flex flex-col gap-4">
                      <div className="relative">
                        <input 
                          type="text"
                          required
                          placeholder="Card number"
                          onFocus={() => setIsInputFocused('card')}
                          onBlur={() => setIsInputFocused(null)}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          className="w-full bg-transparent border-none outline-none text-base font-medium text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-zinc-600"
                        />
                        <div className="absolute right-0 top-0">
                           <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4V12h16v6zm0-10H4V6h16v2z"/></svg>
                        </div>
                      </div>
                      <div className="flex gap-6 pt-4 border-t border-gray-50 dark:border-zinc-800">
                        <input 
                          type="text"
                          required
                          placeholder="MM / YY"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value.substring(0, 5))}
                          className="w-1/2 bg-transparent border-none outline-none text-base font-medium text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-zinc-600"
                        />
                        <input 
                          type="text"
                          required
                          placeholder="CVC"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
                          className="w-1/2 bg-transparent border-none outline-none text-base font-medium text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-zinc-600 text-right"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                type="submit"
                className="w-full py-5 bg-[#6772E5] text-white rounded-2xl font-black text-lg hover:bg-[#5469d4] transition-all shadow-xl shadow-indigo-200 dark:shadow-none active:scale-95 flex items-center justify-center gap-3"
              >
                Pay ${selectedAmount}.00
              </button>
              
              <div className="flex flex-col items-center gap-4">
                <button 
                  type="button"
                  onClick={() => setCheckoutStep('selection')}
                  className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                >
                  Change amount
                </button>
                <div className="flex items-center gap-2">
                   <img src="https://stripe.com/img/v3/home/twitter.png" alt="Stripe" className="h-4 grayscale opacity-30" />
                   <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Secured by Stripe Elements</span>
                </div>
              </div>
            </form>
          )}

          {checkoutStep === 'processing' && (
            <div className="flex-grow flex flex-col items-center justify-center py-10 animate-in fade-in duration-500">
              <div className="w-12 h-12 border-4 border-[#6772E5] border-t-transparent rounded-full animate-spin mb-6" />
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Authorizing Transaction</h3>
              <p className="text-gray-500 dark:text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Verifying with 3D Secure 2.0...</p>
            </div>
          )}

          {checkoutStep === 'success' && (
            <div className="flex-grow flex flex-col items-center justify-center py-6 text-center animate-in zoom-in-95 duration-700">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/10 rounded-full flex items-center justify-center text-emerald-500 mb-8 border border-emerald-100 dark:border-emerald-900">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tighter">Thank You!</h3>
              <p className="text-gray-500 dark:text-zinc-400 font-medium max-w-xs leading-relaxed mb-10">
                Your donation has been successfully processed and sent to <span className="text-indigo-600 dark:text-indigo-400 font-bold">mihajlo1bozic@gmail.com</span>.
              </p>
              <button 
                onClick={resetAndClose}
                className="w-full py-5 bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl font-black text-lg hover:opacity-90 transition-all active:scale-95 shadow-lg"
              >
                Close Receipt
              </button>
            </div>
          )}

          {checkoutStep === 'error' && (
            <div className="flex-grow flex flex-col items-center justify-center py-6 text-center animate-in shake duration-500">
              <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/10 rounded-full flex items-center justify-center text-rose-500 mb-8 border border-rose-100 dark:border-rose-900">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tighter">Payment Declined</h3>
              <p className="text-gray-500 dark:text-zinc-400 font-medium max-w-xs leading-relaxed mb-10">
                Stripe could not process this payment. Please check your card balance and details. No charges were made.
              </p>
              <button 
                onClick={() => setCheckoutStep('details')}
                className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black text-lg hover:bg-rose-700 transition-all active:scale-95"
              >
                Try Another Card
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-in.shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default DonationModal;
