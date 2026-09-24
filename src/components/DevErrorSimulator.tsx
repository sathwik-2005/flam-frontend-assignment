import React from 'react';
import { Bug, Sparkles, AlertOctagon, FileCode, Clock, Server, Ban } from 'lucide-react';

export type SimulationMode = 'none' | 'malformed' | 'wrong_shape' | 'slow' | 'empty' | 'failed';

interface DevErrorSimulatorProps {
  currentMode: SimulationMode;
  onSelectMode: (mode: SimulationMode) => void;
}

export const DevErrorSimulator: React.FC<DevErrorSimulatorProps> = ({ currentMode, onSelectMode }) => {
  const modes: { mode: SimulationMode; label: string; icon: any; color: string }[] = [
    { mode: 'none', label: 'Normal AI Response', icon: Sparkles, color: 'hover:text-emerald-400' },
    { mode: 'malformed', label: 'Malformed JSON', icon: FileCode, color: 'hover:text-rose-400' },
    { mode: 'wrong_shape', label: 'Wrong Schema Shape', icon: AlertOctagon, color: 'hover:text-amber-400' },
    { mode: 'empty', label: 'Empty Response', icon: Ban, color: 'hover:text-purple-400' },
    { mode: 'slow', label: 'Slow / Timeout (15s)', icon: Clock, color: 'hover:text-blue-400' },
    { mode: 'failed', label: '500 Server Error', icon: Server, color: 'hover:text-red-400' },
  ];

  return (
    <div className="w-full bg-slate-900/90 border-b border-indigo-500/20 px-4 py-2.5 text-xs">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-indigo-300 font-semibold uppercase tracking-wider">
          <Bug className="w-3.5 h-3.5 text-indigo-400" />
          <span>Evaluator Testing Bar — Failure Mode Simulator:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto py-1">
          {modes.map(({ mode, label, icon: Icon, color }) => {
            const isActive = currentMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => onSelectMode(mode)}
                className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-600/50'
                    : `bg-slate-800/80 text-slate-300 ${color} hover:bg-slate-800`
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
