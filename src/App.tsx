import React, { useState, useCallback, useEffect } from 'react';
import { useNodesState, useEdgesState, addEdge, Connection, Edge } from 'reactflow';
import confetti from 'canvas-confetti';
import { DetectiveNode, AnalysisResult, Case } from './types';
import DetectiveBoard from './components/DetectiveBoard';
import InputPanel from './components/InputPanel';
import TheoryDisplay from './components/TheoryDisplay';
import CaseManager from './components/CaseManager';
import AuthPage from './components/AuthPage';
import { analyzeCaseData } from './lib/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2 } from 'lucide-react';

const initialNodes: DetectiveNode[] = [
  {
    id: 'sherlock-1',
    type: 'detective',
    position: { x: 100, y: 150 },
    data: { 
      label: 'Sherlock Holmes', 
      type: 'person', 
      description: 'The consulting detective. Currently analyzing the vault prints.' 
    },
  },
  {
    id: 'ruby-1',
    type: 'detective',
    position: { x: 400, y: 50 },
    data: { 
      label: 'Ruby of India', 
      type: 'evidence', 
      description: 'The 500-carat crimson gem. Reportedly stolen between 11 PM and 1 AM.' 
    },
  },
  {
    id: 'vault-1',
    type: 'detective',
    position: { x: 400, y: 250 },
    data: { 
      label: 'The North Vault', 
      type: 'location', 
      description: 'The secure chamber. Lock was picked with surgical precision.' 
    },
  },
  {
    id: 'blackwood-1',
    type: 'detective',
    position: { x: 700, y: 150 },
    data: { 
      label: 'Lord Blackwood', 
      type: 'person', 
      description: 'Seen arguing with the curator earlier that evening.' 
    },
  },
  {
    id: 'testimony-1',
    type: 'detective',
    position: { x: 900, y: 250 },
    data: { 
      label: 'Alibi Check', 
      type: 'event', 
      time: '12:00 AM',
      location: 'Diogenes Club',
      description: 'Blackwood claims he was playing whist at the club.' 
    },
  },
  {
    id: 'watch-1',
    type: 'detective',
    position: { x: 400, y: 450 },
    data: { 
      label: 'Broken Watch', 
      type: 'evidence', 
      time: '11:55 PM',
      description: 'A pocket watch found in the vault mud. Stopped at shortly before midnight.' 
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'sherlock-1', target: 'vault-1' },
  { id: 'e2-3', source: 'vault-1', target: 'ruby-1' },
  { id: 'e3-4', source: 'ruby-1', target: 'blackwood-1' },
  { id: 'e4-5', source: 'blackwood-1', target: 'testimony-1' },
  { id: 'e5-6', source: 'vault-1', target: 'watch-1' },
];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<{ badgeId: string } | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 2000);
    
    // Check local storage for session
    const savedBadge = localStorage.getItem('clue_matrix_session');
    if (savedBadge) {
      setUser({ badgeId: savedBadge });
    }
    setAuthReady(true);

    return () => clearTimeout(splashTimer);
  }, []);

  const handleLogin = (badgeId: string) => {
    localStorage.setItem('clue_matrix_session', badgeId);
    setUser({ badgeId });
  };

  const handleLogout = () => {
    localStorage.removeItem('clue_matrix_session');
    setUser(null);
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleAddNode = useCallback((data: any) => {
    const newNode: DetectiveNode = {
      id: `node-${Date.now()}`,
      type: 'detective',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: { ...data },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const handleLoadCase = useCallback((c: Case) => {
    setNodes(c.nodes.map(n => ({
      ...n,
      selected: false,
      dragging: false
    })));
    setEdges(c.edges.filter(e => !e.id.startsWith('contra-')));
    setAnalysis(null);
  }, [setNodes, setEdges]);

  const handleNewCase = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setAnalysis(null);
  }, [setNodes, setEdges]);

  const runAnalysis = async () => {
    if (nodes.length < 2) return;
    setLoading(true);
    try {
      const result = await analyzeCaseData(nodes, edges);
      setAnalysis(result);
      
      setNodes((nds) => 
        nds.map((n) => ({
          ...n,
          data: {
            ...n.data,
            isContradicted: result.contradictions.some(
              (c) => c.sourceId === n.id || c.targetId === n.id
            ),
          },
        }))
      );

      const newContradictionEdges: Edge[] = result.contradictions.map((c, i) => ({
        id: `contra-${Date.now()}-${i}`,
        source: c.sourceId,
        target: c.targetId,
        data: { isContradicted: true, reason: c.reason },
        label: "CONFLICT",
        labelStyle: { fill: '#ef4444', fontWeight: 700, fontSize: 8 },
        animated: true,
      }));

      setEdges((eds) => {
        const filteredEds = eds.filter(e => !e.id.startsWith('contra-'));
        return filteredEds.concat(newContradictionEdges);
      });

      if (result.theories.some(t => t.confidence > 80)) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#71717a', '#000000']
        });
      }
    } catch (error) {
      console.error("Investigation Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!authReady) return (
    <div className="h-screen w-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-amber-500" size={32} />
    </div>
  );

  if (!user) return <AuthPage onLogin={handleLogin} />;

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-200 overflow-hidden font-sans selection:bg-amber-500 selection:text-black">
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center gap-4"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-amber-500"
            >
              <Search size={64} strokeWidth={3} />
            </motion.div>
            <div className="text-center">
               <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">ClueMatrix</h1>
               <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mt-2">Initializing Cognitive Link Engine...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-[320px] shrink-0 border-r border-zinc-900 border-dashed overflow-y-auto">
        <CaseManager 
          currentNodes={nodes} 
          currentEdges={edges} 
          user={user}
          onLoadCase={handleLoadCase}
          onNewCase={handleNewCase}
          onLogout={handleLogout}
        />
        <InputPanel onAddNode={handleAddNode} />
      </div>

      <div className="flex-1 relative overflow-hidden">
        <DetectiveBoard 
          nodes={nodes} 
          edges={edges} 
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        />

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4">
           {loading && (
             <div className="bg-zinc-900/90 backdrop-blur border border-zinc-800 px-6 py-3 rounded shadow-2xl flex items-center gap-3">
               <Loader2 className="animate-spin text-amber-500" size={18} />
               <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Evaluating Evidence Corridors...</span>
             </div>
           )}
        </div>
      </div>

      <div className="w-[350px] shrink-0">
        <TheoryDisplay 
          data={analysis} 
          loading={loading} 
          onAnalyze={runAnalysis} 
        />
      </div>
    </div>
  );
}


