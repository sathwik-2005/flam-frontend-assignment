import React from 'react';
import { StudySet } from '../types/result';
import { History, X, Layers, Trash2, ArrowRight, BookOpen } from 'lucide-react';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  savedSets: StudySet[];
  onSelectSet: (set: StudySet) => void;
  onDeleteSet: (id: string) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  savedSets,
  onSelectSet,
  onDeleteSet,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 space-y-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <History className="w-4 h-4" /> Saved Study Sessions ({savedSets.length})
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {savedSets.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs space-y-2">
              <BookOpen className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
              <p>No saved study sessions yet.</p>
              <p className="text-[11px]">Generate a set and click "Save Session" to store it locally.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedSets.map((set) => (
                <div
                  key={set.id}
                  className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all flex items-start justify-between gap-3 group"
                >
                  <div
                    onClick={() => {
                      onSelectSet(set);
                      onClose();
                    }}
                    className="flex-1 cursor-pointer space-y-1"
                  >
                    <h4 className="font-semibold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors">
                      {set.topic}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-indigo-400" /> {set.cards.length} cards
                      </span>
                      <span>•</span>
                      <span>{new Date(set.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSet(set.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors cursor-pointer"
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            Close History <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
