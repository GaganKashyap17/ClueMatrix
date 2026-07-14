import React, { useState, useEffect } from 'react';
import { FolderOpen, Save, Trash2, LogOut, User as UserIcon } from 'lucide-react';
import { getCases, saveCase, deleteCase } from '../services/caseService';
import { Case } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface CaseManagerProps {
  currentNodes: any[];
  currentEdges: any[];
  user: { badgeId: string } | null;
  onLoadCase: (c: Case) => void;
  onNewCase: () => void;
  onLogout: () => void;
}

const CaseManager = ({ currentNodes, currentEdges, user, onLoadCase, onNewCase, onLogout }: CaseManagerProps) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [caseTitle, setCaseTitle] = useState('');
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      refreshCases();
    }
  }, [user]);

  const refreshCases = async () => {
    if (!user) return;
    const res = await getCases(user.badgeId);
    if (res) setCases(res);
  };

  const handleSave = async () => {
    if (!user) return;
    const title = caseTitle || `Case ${new Date().toLocaleDateString()}`;
    const id = await saveCase({
      title,
      nodes: currentNodes,
      edges: currentEdges,
    }, user.badgeId, activeCaseId || undefined);
    
    if (id) {
      setActiveCaseId(id);
      setCaseTitle(title);
      refreshCases();
      alert("Case filed successfully.");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Evidence will be permanently erased. Proceed?")) {
      await deleteCase(id);
      if (activeCaseId === id) {
        onNewCase();
        setActiveCaseId(null);
        setCaseTitle('');
      }
      refreshCases();
    }
  };

  return (
    <div className="p-6 border-b border-zinc-900 space-y-4">
      <div className="flex items-center justify-between">
        {user && (
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full border border-amber-500/50 p-0.5 overflow-hidden flex items-center justify-center bg-zinc-900">
               <UserIcon className="text-zinc-500" size={16} />
             </div>
             <div className="hidden lg:block">
               <p className="text-[10px] text-zinc-500 font-mono tracking-tighter uppercase leading-none">Investigator</p>
               <p className="text-xs font-bold text-zinc-200 uppercase truncate max-w-[120px]">{user.badgeId}</p>
             </div>
             <button onClick={onLogout} className="p-1.5 text-zinc-500 hover:text-red-500 transition-colors">
               <LogOut size={14} />
             </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <input 
            placeholder="Case Title..."
            value={caseTitle}
            onChange={(e) => setCaseTitle(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
          />
          <button 
            onClick={handleSave}
            disabled={!user}
            className="p-2 bg-amber-500 text-zinc-950 rounded hover:bg-amber-600 disabled:opacity-30 transition-all"
          >
            <Save size={16} strokeWidth={3} />
          </button>
        </div>

        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-2 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-black uppercase text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
        >
          <span className="flex items-center gap-2">
            <FolderOpen size={14} />
            Case Archives
          </span>
          <span className="bg-zinc-800 px-1.5 rounded">{cases.length}</span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-1"
            >
              {cases.map((c) => (
                <div 
                  key={c.id}
                  onClick={() => {
                    onLoadCase(c);
                    setActiveCaseId(c.id!);
                    setCaseTitle(c.title);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "group flex items-center justify-between p-3 rounded cursor-pointer transition-all",
                    activeCaseId === c.id ? "bg-amber-500/10 border border-amber-500/30" : "bg-zinc-900/50 hover:bg-zinc-900 border border-transparent"
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-200 truncate">{c.title}</p>
                    <p className="text-[9px] text-zinc-500 font-mono italic">
                      {c.updatedAt?.toDate?.().toLocaleDateString() || 'Recently'}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => handleDelete(c.id!, e)}
                    className="p-1.5 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {cases.length === 0 && (
                <p className="text-center py-4 text-[10px] text-zinc-600 font-mono italic">No archived files found.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CaseManager;
