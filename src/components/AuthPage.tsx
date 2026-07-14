import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { Shield, ShieldAlert, Key, User, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthPageProps {
  onLogin: (badgeId: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [badgeId, setBadgeId] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const id = badgeId.trim().toLowerCase();
    const code = accessCode.trim();

    if (id.length < 3) {
      setError("Badge ID must be at least 3 characters.");
      setLoading(false);
      return;
    }
    if (code.length < 4) {
      setError("Access Code must be at least 4 characters.");
      setLoading(false);
      return;
    }

    try {
      const detectiveRef = doc(db, 'detectives', id);
      const detectiveSnap = await getDoc(detectiveRef);

      if (isRegister) {
        if (detectiveSnap.exists()) {
          setError("Badge ID already in use. Try logging in.");
          setIsRegister(false);
        } else {
          await setDoc(detectiveRef, {
            badgeId: id,
            accessCode: code,
            createdAt: new Date().toISOString()
          });
          onLogin(id);
        }
      } else {
        if (detectiveSnap.exists()) {
          const data = detectiveSnap.data();
          if (data.accessCode === code) {
            onLogin(id);
          } else {
            setError("Incorrect Access Code.");
          }
        } else {
          setError("Badge ID not recognized. Please register first.");
          setIsRegister(true);
        }
      }
    } catch (err: any) {
      console.error("System Error:", err);
      setError("Database connection error. Check your Firebase config.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex items-center justify-center p-6 overflow-hidden">
      {/* Ambience */}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#18181b_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <div className="inline-flex p-3 bg-zinc-900 border border-zinc-800 rounded-lg mb-4 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Shield size={32} />
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">ClueMatrix</h1>
          <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Investigation Portal • Demo Mode</p>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 p-6 rounded shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-2">
                  <User size={10} />
                  Badge ID
                </label>
                <input 
                  type="text"
                  required
                  value={badgeId}
                  disabled={loading}
                  onChange={(e) => setBadgeId(e.target.value)}
                  placeholder="e.g. det_holmes"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-amber-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-2">
                  <Key size={10} />
                  Access Code
                </label>
                <input 
                  type="password"
                  required
                  value={accessCode}
                  disabled={loading}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-amber-500 transition-all font-mono"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-red-500/10 border border-red-500/30 p-3 rounded text-red-500 text-[10px] font-bold uppercase italic"
                >
                  <div className="flex gap-2">
                    <ShieldAlert size={14} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:from-zinc-800 disabled:to-zinc-800 text-zinc-950 font-black uppercase py-3 rounded text-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  {isRegister ? 'Register Badge' : 'Authorization Entry'}
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 hover:text-amber-500 transition-colors"
            >
              {isRegister ? 'Back to Login' : 'First Time? Create Case ID'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
