import React, { useState } from 'react';
import { Plus, User, MapPin, Calendar, FileText } from 'lucide-react';
import { NodeType } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface InputPanelProps {
  onAddNode: (data: any) => void;
}

const InputPanel = ({ onAddNode }: InputPanelProps) => {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [bulkData, setBulkData] = useState('');
  const [formData, setFormData] = useState({
    label: '',
    type: 'person' as NodeType,
    time: '',
    location: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label || !formData.description) return;
    onAddNode(formData);
    setFormData({
      label: '',
      type: 'person',
      time: '',
      location: '',
      description: '',
    });
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(bulkData);
      if (Array.isArray(parsed)) {
        parsed.forEach(node => onAddNode(node));
        setBulkData('');
        setMode('single');
      }
    } catch (err) {
      alert("Invalid JSON format for bulk upload.");
    }
  };

  return (
    <div className="h-full bg-zinc-950 p-6 flex flex-col gap-6 overflow-y-auto">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-amber-500 uppercase italic tracking-tighter">New Intel</h2>
          <div className="flex bg-zinc-900 rounded p-1">
            <button 
              onClick={() => setMode('single')}
              className={cn("px-2 py-1 text-[8px] font-black uppercase rounded transition-all", mode === 'single' ? "bg-amber-500 text-black" : "text-zinc-500 hover:text-zinc-300")}
            >
              Manual
            </button>
            <button 
              onClick={() => setMode('bulk')}
              className={cn("px-2 py-1 text-[8px] font-black uppercase rounded transition-all", mode === 'bulk' ? "bg-amber-500 text-black" : "text-zinc-500 hover:text-zinc-300")}
            >
              Bulk
            </button>
          </div>
        </div>
        <p className="text-xs text-zinc-500 font-mono lowercase">Add evidence to the board</p>
      </div>

      {mode === 'single' ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(['person', 'location', 'event', 'evidence'] as NodeType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type }))}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded border text-xs font-bold uppercase transition-all",
                    formData.type === type 
                      ? "bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                      : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600"
                  )}
                >
                  {type === 'person' && <User size={14} />}
                  {type === 'location' && <MapPin size={14} />}
                  {type === 'event' && <Calendar size={14} />}
                  {type === 'evidence' && <FileText size={14} />}
                  {type}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Label</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={formData.label}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Time (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 10:45 PM"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Location (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Warehouse A"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Description</label>
              <textarea
                placeholder="Details found or testimony..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black uppercase py-3 rounded-sm transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus size={18} strokeWidth={3} />
            Pin to Board
          </button>
        </form>
      ) : (
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">JSON Array of Evidence</label>
            <textarea
              placeholder='[{"label": "Suspect A", "type": "person", "description": "Seen at..."}]'
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              rows={12}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-2.5 text-[10px] font-mono text-zinc-200 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black uppercase py-3 rounded-sm transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus size={18} strokeWidth={3} />
            Bulk Process Intel
          </button>
        </form>
      )}
    </div>
  );
};

export default InputPanel;
