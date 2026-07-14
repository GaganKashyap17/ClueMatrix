import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { User, MapPin, Calendar, FileText, AlertCircle } from 'lucide-react';
import { DetectiveNodeData } from '../types';
import { cn } from '../lib/utils';

const iconMap = {
  person: User,
  location: MapPin,
  event: Calendar,
  evidence: FileText,
};

const DetectiveNode = ({ data, selected }: NodeProps<DetectiveNodeData>) => {
  const Icon = iconMap[data.type] || FileText;

  return (
    <div
      className={cn(
        "px-4 py-3 shadow-2xl rounded-sm border-2 transition-all duration-300 min-w-[180px]",
        "bg-zinc-900/90 backdrop-blur-md",
        selected ? "border-amber-500 shadow-amber-500/20 scale-105" : "border-zinc-700",
        data.isContradicted && "border-red-600 animate-pulse shadow-red-600/30"
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={cn(
          "p-1.5 rounded-full",
          data.type === 'person' && "bg-blue-500/20 text-blue-400",
          data.type === 'location' && "bg-green-500/20 text-green-400",
          data.type === 'event' && "bg-purple-500/20 text-purple-400",
          data.type === 'evidence' && "bg-zinc-500/20 text-zinc-400"
        )}>
          <Icon size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">{data.label}</h3>
          <p className="text-[10px] text-zinc-500 font-mono uppercase">{data.type}</p>
        </div>
        {data.isContradicted && (
          <AlertCircle size={16} className="ml-auto text-red-500" />
        )}
      </div>

      <div className="space-y-1.5 border-t border-zinc-800 pt-2">
        {data.time && (
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <Calendar size={12} />
            <span>{data.time}</span>
          </div>
        )}
        {data.location && (
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <MapPin size={12} />
            <span>{data.location}</span>
          </div>
        )}
        <p className="text-[11px] text-zinc-300 italic line-clamp-2 mt-1">
          "{data.description}"
        </p>
      </div>

      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-zinc-600" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-zinc-600" />
    </div>
  );
};

export default memo(DetectiveNode);
