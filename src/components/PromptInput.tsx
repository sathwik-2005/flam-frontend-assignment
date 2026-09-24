import React, { useState } from 'react';
import { Sparkles, BookOpen, Layers, Zap, Command } from 'lucide-react';

interface PromptInputProps {
  onSubmit: (prompt: string, difficulty: 'beginner' | 'intermediate' | 'advanced') => void;
  isLoading: boolean;
}

const PRESET_TOPICS = [
  { label: 'React Hooks & State', icon: '⚡', category: 'Web Dev' },
  { label: 'Quantum Physics 101', icon: '⚛️', category: 'Physics' },
  { label: 'Cellular Respiration & ATP', icon: '🧬', category: 'Biology' },
  { label: 'System Design & Caching', icon: '🌐', category: 'Computer Science' },
  { label: 'World War II Timeline', icon: '📜', category: 'History' },
];

export const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isLoading }) => {
  const [input, setInput] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSubmit(input.trim(), difficulty);
  };

  const handlePresetClick = (presetTopic: string) => {
    setInput(presetTopic);
    onSubmit(presetTopic, difficulty);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 shadow-2xl shadow-indigo-950/40 relative overflow-hidden">
        {/* Glow backdrop effect */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <label htmlFor="prompt-textarea" className="flex items-center gap-2 text-sm font-semibold text-indigo-300 uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Enter Notes or Study Topic
          </label>

          {/* Difficulty selector */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="px-2 text-slate-400 font-medium">Difficulty:</span>
            {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all font-medium ${
                  difficulty === level
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Free-form text input */}
        <div className="relative mb-4">
          <textarea
            id="prompt-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your lecture notes, article excerpt, or type any subject (e.g. 'Explain React useEffect, stale closures, and cleanups')..."
            rows={4}
            disabled={isLoading}
            className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-500 rounded-xl p-4 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none resize-none text-base leading-relaxed"
          />

          <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-slate-500 pointer-events-none">
            <Command className="w-3 h-3" /> Press Enter to generate
          </div>
        </div>

        {/* Action bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>AI will build interactive flashcards & quiz questions</span>
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            {isLoading ? 'Generating Study Set...' : 'Generate Interactive Study Set'}
          </button>
        </div>
      </form>

      {/* Quick preset chips */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          Or try a sample topic:
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESET_TOPICS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePresetClick(preset.label)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer group shadow-sm"
            >
              <span>{preset.icon}</span>
              <span>{preset.label}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 group-hover:bg-indigo-950 group-hover:text-indigo-300 transition-colors">
                {preset.category}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
