import React from 'react';
import { Search, Brain, Trophy, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AnalysisResult } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface TheoryDisplayProps {
  data: AnalysisResult | null;
  loading: boolean;
  onAnalyze: () => void;
}

const TheoryDisplay = ({ data, loading, onAnalyze }: TheoryDisplayProps) => {
  return (
    <div className="h-full bg-zinc-950 p-6 flex flex-col gap-6 overflow-y-auto border-l border-zinc-900">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-amber-500 uppercase italic tracking-tighter">AI Case Log</h2>
          <p className="text-xs text-zinc-500 font-mono lowercase">Predictive Analysis</p>
        </div>
        <button
          onClick={onAnalyze}
          disabled={loading}
          className={cn(
            "p-3 rounded-full transition-all active:scale-90",
            loading ? "bg-amber-500/20 text-amber-500 animate-spin" : "bg-amber-500 text-zinc-950 hover:bg-amber-600"
          )}
        >
          <Brain size={20} />
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-amber-500/20 rounded-full animate-ping" />
            <Brain className="absolute inset-0 m-auto text-amber-500" />
          </div>
          <p className="text-xs text-zinc-500 font-mono animate-pulse uppercase">Correlating Evidence...</p>
        </div>
      )}

      {!loading && !data && (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
          <Search size={48} className="text-zinc-600 mb-4" />
          <p className="text-xs text-zinc-600 font-mono uppercase">Waiting for input correlation</p>
        </div>
      )}

      {!loading && data && (
        <div className="space-y-8 pb-10">
          {/* Contradictions */}
          {data.contradictions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle size={16} />
                <h3 className="text-xs font-black uppercase tracking-widest">Contradictions Found</h3>
              </div>
              <div className="space-y-3">
                {data.contradictions.map((c, i) => (
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    key={i}
                    className="p-3 bg-red-500/5 border border-red-500/30 rounded"
                  >
                    <p className="text-[11px] text-red-400 font-medium">{c.reason}</p>
                    <div className="flex gap-2 mt-2">
                       <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded uppercase font-bold">
                         {c.severity} RISK
                       </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Theories */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-cyan-500">
                <CheckCircle2 size={16} />
                <h3 className="text-xs font-black uppercase tracking-widest">Case Theories</h3>
              </div>
              <div className="space-y-4">
                {data.theories.map((t, i) => (
                  <motion.div
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: i * 0.1 + 0.3 }}
                     key={i}
                     className="p-4 bg-zinc-900 border border-zinc-800 rounded-sm relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
                       <Trophy size={40} className="text-amber-500" />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-zinc-100 uppercase tracking-tight">{t.title}</h4>
                      <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        {t.confidence}% CONFIDENCE
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed italic mb-3">"{t.explanation}"</p>
                    <div className="flex flex-wrap gap-1.5">
                      {t.supportingEvidence.map((ev, j) => (
                        <span key={j} className="text-[9px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded uppercase font-bold">
                          #{ev}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TheoryDisplay;
