import React, { useState } from 'react';
import { Sparkles, MessageSquarePlus } from 'lucide-react';

interface RefinementBarProps {
  onRefine: (instructions: string) => void;
  isLoading: boolean;
}

export const RefinementBar: React.FC<RefinementBarProps> = ({ onRefine, isLoading }) => {
  const [refineText, setRefineText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refineText.trim() || isLoading) return;
    onRefine(refineText.trim());
    setRefineText('');
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-xl p-4 border border-indigo-500/30 space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        AI Refinement Loop — Follow-up Prompts
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={refineText}
          onChange={(e) => setRefineText(e.target.value)}
          placeholder="e.g. 'Add 3 harder flashcards about stale closures', 'Make quiz questions more detailed'..."
          disabled={isLoading}
          className="flex-1 bg-slate-900/90 text-slate-100 placeholder-slate-500 rounded-lg px-3.5 py-2 text-xs border border-slate-700 focus:border-indigo-500 outline-none"
        />
        <button
          type="submit"
          disabled={!refineText.trim() || isLoading}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <MessageSquarePlus className="w-3.5 h-3.5" />
          Refine Set
        </button>
      </div>
    </form>
  );
};
