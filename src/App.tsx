import React, { useState, useEffect, useRef } from 'react';
import { StudySet, EvaluationErrorDetails } from './types/result';
import { validateResult } from './lib/validateResult';
import { callGenerateApi } from './lib/api';
import { saveStudySet, getSavedStudySets, deleteStudySet } from './lib/storage';

import { PromptInput } from './components/PromptInput';
import { ResultView } from './components/ResultView';
import { ErrorState } from './components/ErrorState';
import { LoadingState } from './components/LoadingState';
import { DevErrorSimulator, SimulationMode } from './components/DevErrorSimulator';
import { HistorySidebar } from './components/HistorySidebar';

import { Sparkles, History, Github, ShieldAlert } from 'lucide-react';

export const App: React.FC = () => {
  const [studySet, setStudySet] = useState<StudySet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<EvaluationErrorDetails | null>(null);
  const [lastInputTopic, setLastInputTopic] = useState<string>('');
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('none');
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [savedSets, setSavedSets] = useState<StudySet[]>([]);

  // Guard against stale responses (Assignment PDF Requirement Section 6 & 7)
  const requestId = useRef(0);

  useEffect(() => {
    setSavedSets(getSavedStudySets());
  }, []);

  const handleGenerate = async (
    promptText: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
    refinementText?: string
  ) => {
    const id = ++requestId.current; // Increment request counter
    const currentTopic = promptText || studySet?.topic || 'Study Set';
    setLastInputTopic(currentTopic);

    setIsLoading(true);
    setError(null);

    const response = await callGenerateApi({
      prompt: promptText,
      difficulty,
      refinement: refinementText,
      existingSet: studySet || undefined,
      simulateError: simulationMode,
    });

    // STALE RESPONSE GUARD: If a newer request was initiated while waiting, discard this one!
    if (id !== requestId.current) {
      console.log(`[Stale Response Guard] Request #${id} ignored because newer Request #${requestId.current} is active.`);
      return;
    }

    setIsLoading(false);

    // 1. Check HTTP/Network/API Errors
    if (!response.success || response.error) {
      setError(
        response.error || {
          type: 'FAILED_REQUEST',
          title: 'API Call Failed',
          message: 'Failed to complete request to backend proxy server.',
          timestamp: new Date().toLocaleTimeString(),
        }
      );
      return;
    }

    // 2. Defensive JSON Parsing & Structural Validation
    const validation = validateResult(response.rawJson || '', currentTopic);

    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    // 3. Render Validated Structured Data
    setStudySet(validation.data);
    const updatedHistory = saveStudySet(validation.data);
    setSavedSets(updatedHistory);
  };

  const handleRefine = (instructions: string) => {
    if (!studySet) return;
    handleGenerate(studySet.topic, 'intermediate', instructions);
  };

  const handleRetry = () => {
    if (lastInputTopic) {
      handleGenerate(lastInputTopic);
    }
  };

  const handleDeleteSavedSet = (id: string) => {
    const updated = deleteStudySet(id);
    setSavedSets(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Dev Failure Simulator Bar for Evaluators */}
      <DevErrorSimulator currentMode={simulationMode} onSelectMode={setSimulationMode} />

      {/* Main App Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-100 tracking-tight flex items-center gap-2">
                Flam Study Assistant
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono font-medium">
                  v1.0 • Structured AI Tool
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Turns free-form notes into interactive cards, quizzes & study decks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border border-slate-700"
            >
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span>Saved Sets</span>
              {savedSets.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white font-mono text-[10px]">
                  {savedSets.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Simulation Alert notice if active */}
        {simulationMode !== 'none' && (
          <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Simulation Active:</strong> Next AI request will simulate mode <code>{simulationMode}</code> to test failure handling.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSimulationMode('none')}
              className="px-2 py-1 rounded bg-amber-900 hover:bg-amber-800 text-amber-100 font-mono text-[11px]"
            >
              Reset to Normal
            </button>
          </div>
        )}

        {/* Input section always accessible at top */}
        <PromptInput onSubmit={(topic, diff) => handleGenerate(topic, diff)} isLoading={isLoading} />

        {/* Dynamic Display Area */}
        {isLoading && (
          <LoadingState topic={lastInputTopic} onCancel={() => setIsLoading(false)} />
        )}

        {!isLoading && error && (
          <ErrorState error={error} onRetry={handleRetry} />
        )}

        {!isLoading && !error && studySet && (
          <ResultView
            studySet={studySet}
            onRefine={handleRefine}
            isLoading={isLoading}
            onSaveSession={() => {
              const updated = saveStudySet(studySet);
              setSavedSets(updated);
            }}
          />
        )}

        {!isLoading && !error && !studySet && (
          <div className="text-center py-12 text-slate-500 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
              <Sparkles className="w-8 h-8 text-indigo-500/60" />
            </div>
            <p className="text-sm font-medium text-slate-400">No study set generated yet.</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Type any topic or paste notes above, or click one of the sample preset chips to generate flashcards and quiz questions instantly!
            </p>
          </div>
        )}
      </main>

      {/* History Drawer */}
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedSets={savedSets}
        onSelectSet={(set) => {
          setStudySet(set);
          setError(null);
        }}
        onDeleteSet={handleDeleteSavedSet}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 space-y-1">
        <p>Flam Frontend Internship Assignment • Built with React, TypeScript & Node Express</p>
        <p className="text-[11px] text-slate-600">Strict JSON output validation • Stale response guarding • Zero API keys in browser</p>
      </footer>
    </div>
  );
};
