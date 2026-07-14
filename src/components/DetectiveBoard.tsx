import React, { useCallback, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Connection, 
  addEdge, 
  MarkerType 
} from 'reactflow';
import 'reactflow/dist/style.css';
import DetectiveNode from './DetectiveNode';
import { DetectiveNode as DetectiveNodeType, Edge } from '../types';

const nodeTypes = {
  detective: DetectiveNode,
};

interface DetectiveBoardProps {
  nodes: DetectiveNodeType[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: (connection: Connection) => void;
}

const DetectiveBoard = ({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange, 
  onConnect 
}: DetectiveBoardProps) => {
  
  const connectionLineStyle = { stroke: '#d4d4d8', strokeWidth: 2 };
  const defaultEdgeOptions = {
    style: { stroke: '#52525b', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#52525b',
    },
  };

  const proEdges = useMemo(() => {
    return edges.map(edge => {
      if (edge.data?.isContradicted) {
        return {
          ...edge,
          animated: true,
          style: { stroke: '#ef4444', strokeWidth: 3 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' }
        };
      }
      return edge;
    });
  }, [edges]);

  return (
    <div className="w-full h-full relative group">
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="bg-zinc-950/80 backdrop-blur px-4 py-2 border border-zinc-800 rounded shadow-xl">
           <h1 className="text-xl font-black text-white italic tracking-tighter uppercase flex items-center gap-2">
             <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
             ClueMatrix Board
           </h1>
           <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">System Rev 4.0 // Active Analysis</p>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={proEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionLineStyle={connectionLineStyle}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeColor={(n) => {
            if (n.data.isContradicted) return '#ef4444';
            if (n.selected) return '#f59e0b';
            return '#3f3f46';
          }}
          maskColor="rgba(9, 9, 11, 0.7)"
          style={{ height: 120 }}
        />
      </ReactFlow>

      {/* Aesthetic Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
    </div>
  );
};

export default DetectiveBoard;
