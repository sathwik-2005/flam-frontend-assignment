import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, ShieldCheck, XCircle } from 'lucide-react';

interface LoadingStateProps {
  topic: string;
  onCancel?: () => void;
}

const LOADING_STEPS = [
  'Routing prompt through secure backend proxy...',
  'Requesting structured JSON output from LLM...',
  'Parsing JSON syntax defensively...',
  'Validating flashcards & quiz schema shape...',
  'Assembling interactive React UI components...',
];

export const LoadingState: React.FC<LoadingStateProps> = ({ topic, onCancel }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    const stepInterval = setInterval(() => {
      setCurrentStepIdx((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1));
    }, 1800);

    return () => {
      clearInterval(timer);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto glass-panel rounded-2xl p-8 space-y-6 text-center border border-indigo-500/30 shadow-2xl shadow-indigo-950/30 animate-fade-in">
      <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
        <div className="w-14 h-14 rounded-full bg-indigo-600/30 border border-indigo-500 flex items-center justify-center text-indigo-400 shadow-inner">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-slate-100">Analyzing & Building Study Set</h3>
        <p className="text-xs text-indigo-300 font-mono">Topic: "{topic}"</p>
      </div>

      {/* Animated step feedback */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono space-y-2">
        <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
          <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Pipeline Status
          </span>
          <span className="text-slate-500">Elapsed: {elapsedSeconds}s</span>
        </div>

        <div className="text-emerald-400 flex items-center justify-center gap-2 py-1">
          <ShieldCheck className="w-4 h-4 flex-shrink-0 animate-pulse" />
          <span>{LOADING_STEPS[currentStepIdx]}</span>
        </div>
      </div>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 text-xs transition-colors cursor-pointer"
        >
          <XCircle className="w-3.5 h-3.5" /> Cancel Request
        </button>
      )}
    </div>
  );
};
