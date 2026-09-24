import React, { useState } from 'react';
import { EvaluationErrorDetails } from '../types/result';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Bug, Terminal } from 'lucide-react';

interface ErrorStateProps {
  error: EvaluationErrorDetails;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  const [showRaw, setShowRaw] = useState(false);

  const getErrorTypeBadge = (type: string) => {
    switch (type) {
      case 'MALFORMED_JSON':
        return { label: 'JSON Syntax Error', color: 'bg-rose-950 text-rose-300 border-rose-800' };
      case 'WRONG_SHAPE':
        return { label: 'Schema Validation Failure', color: 'bg-amber-950 text-amber-300 border-amber-800' };
      case 'EMPTY_RESPONSE':
        return { label: 'Empty Model Output', color: 'bg-purple-950 text-purple-300 border-purple-800' };
      case 'TIMEOUT':
        return { label: 'Request Timeout (15s)', color: 'bg-blue-950 text-blue-300 border-blue-800' };
      default:
        return { label: 'Backend Proxy Error', color: 'bg-red-950 text-red-300 border-red-800' };
    }
  };

  const badge = getErrorTypeBadge(error.type);

  return (
    <div className="w-full max-w-2xl mx-auto glass-panel rounded-2xl p-8 space-y-6 border border-rose-500/30 shadow-2xl shadow-rose-950/20 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex-shrink-0">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${badge.color}`}>
              {badge.label}
            </span>
            <span className="text-xs text-slate-500 font-mono">{error.timestamp}</span>
          </div>

          <h3 className="text-xl font-bold text-slate-100">{error.title}</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{error.message}</p>
        </div>
      </div>

      {/* Defensive Parser Diagnostic Box */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold uppercase tracking-wider">
          <Bug className="w-3.5 h-3.5" /> Defensive Parsing Guard Result
        </div>
        <p className="text-slate-300">
          Our schema validator caught this model anomaly before it could crash the React tree. No blank renders or unhandled promise rejections occurred.
        </p>
      </div>

      {/* Raw Payload Inspector Toggle */}
      {error.rawOutput && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowRaw((prev) => !prev)}
            className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5" />
            {showRaw ? 'Hide Raw Model Payload' : 'Inspect Raw Model Payload'}
            {showRaw ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showRaw && (
            <pre className="p-4 rounded-xl bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto max-h-48 border border-slate-800 leading-relaxed">
              {error.rawOutput}
            </pre>
          )}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <span className="text-xs text-slate-500">Ready to re-try prompt generation</span>
        <button
          type="button"
          onClick={onRetry}
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Re-try Prompt
        </button>
      </div>
    </div>
  );
};
