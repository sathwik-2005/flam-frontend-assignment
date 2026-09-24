import React, { useState } from 'react';
import { StudySet } from '../types/result';
import { FlashcardDeck } from './FlashcardDeck';
import { QuizView } from './QuizView';
import { RefinementBar } from './RefinementBar';
import { Layers, HelpCircle, FileText, Sparkles, Clock, CheckCircle2, Bookmark } from 'lucide-react';

interface ResultViewProps {
  studySet: StudySet;
  onRefine: (instructions: string) => void;
  isLoading: boolean;
  onSaveSession?: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ studySet, onRefine, isLoading, onSaveSession }) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'quiz' | 'summary'>('cards');

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel rounded-2xl p-6 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Interactive AI Study Deck
          </div>
          <h1 className="text-2xl font-bold text-slate-100">{studySet.topic}</h1>
          <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" /> {studySet.cards.length} Flashcards
            </span>
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-purple-400" /> {studySet.quiz.length} Quiz Questions
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> {studySet.summary.estimatedStudyTimeMinutes} mins
            </span>
          </div>
        </div>

        {onSaveSession && (
          <button
            type="button"
            onClick={onSaveSession}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border border-slate-700"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" /> Save Session
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('cards')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'cards'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" /> Flashcards ({studySet.cards.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'quiz'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" /> Practice Quiz ({studySet.quiz.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'summary'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Topic Summary
        </button>
      </div>

      {/* AI Refinement Loop input bar */}
      <RefinementBar onRefine={onRefine} isLoading={isLoading} />

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'cards' && <FlashcardDeck cards={studySet.cards} />}
        {activeTab === 'quiz' && <QuizView questions={studySet.quiz} />}
        {activeTab === 'summary' && (
          <div className="glass-panel rounded-2xl p-6 space-y-6 text-sm leading-relaxed">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Key Takeaways
              </h3>
              <ul className="space-y-2">
                {studySet.summary.keyTakeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {studySet.summary.prerequisites.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Recommended Prerequisites
                </h3>
                <div className="flex flex-wrap gap-2">
                  {studySet.summary.prerequisites.map((prereq, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono">
                      {prereq}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
