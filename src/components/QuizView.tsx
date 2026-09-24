import React, { useState } from 'react';
import { QuizQuestion } from '../types/result';
import confetti from 'canvas-confetti';
import { CheckCircle, XCircle, HelpCircle, RefreshCw, Award, ArrowRight, BookOpen } from 'lucide-react';

interface QuizViewProps {
  questions: QuizQuestion[];
}

export const QuizView: React.FC<QuizViewProps> = ({ questions: initialQuestions }) => {
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [wrongIndices, setWrongIndices] = useState<number[]>([]);

  const currentQ = activeQuestions[currentIndex];

  const handleSelectOption = (optIndex: number) => {
    if (selectedOptions[currentIndex] !== undefined) return; // Answered already

    setSelectedOptions((prev) => ({
      ...prev,
      [currentIndex]: optIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Calculate results
      const wrong: number[] = [];
      activeQuestions.forEach((q, idx) => {
        const selected = selectedOptions[idx];
        if (selected === undefined || selected !== q.correctIndex) {
          wrong.push(idx);
        }
      });
      setWrongIndices(wrong);
      setIsCompleted(true);

      const scorePct = ((activeQuestions.length - wrong.length) / activeQuestions.length) * 100;
      if (scorePct >= 75) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const handleRetestWrongAnswers = () => {
    const missed = activeQuestions.filter((_, idx) => wrongIndices.includes(idx));
    if (missed.length > 0) {
      setActiveQuestions(missed);
      setCurrentIndex(0);
      setSelectedOptions({});
      setIsCompleted(false);
      setWrongIndices([]);
    }
  };

  const handleResetFullQuiz = () => {
    setActiveQuestions(initialQuestions);
    setCurrentIndex(0);
    setSelectedOptions({});
    setIsCompleted(false);
    setWrongIndices([]);
  };

  if (!activeQuestions || activeQuestions.length === 0) {
    return <div className="text-center p-8 text-slate-400">No quiz questions available.</div>;
  }

  // Quiz Summary Screen
  if (isCompleted) {
    const correctCount = activeQuestions.length - wrongIndices.length;
    const scorePercentage = Math.round((correctCount / activeQuestions.length) * 100);

    return (
      <div className="w-full max-w-2xl mx-auto glass-panel rounded-2xl p-8 space-y-6 text-center animate-fade-in">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Award className="w-10 h-10 text-white" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-100">Quiz Completed!</h2>
          <p className="text-sm text-slate-400">Here is how you performed on this study set:</p>
        </div>

        <div className="grid grid-cols-3 gap-4 py-4 bg-slate-900/80 rounded-xl border border-slate-800">
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Total Questions</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{activeQuestions.length}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Score</div>
            <div className={`text-2xl font-bold mt-1 ${scorePercentage >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {scorePercentage}%
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Correct</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{correctCount}</div>
          </div>
        </div>

        {/* Breakdown of questions */}
        <div className="space-y-3 text-left">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Question Breakdown</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {activeQuestions.map((q, idx) => {
              const selected = selectedOptions[idx];
              const isCorrect = selected === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start justify-between gap-3 ${
                    isCorrect ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200' : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="font-semibold">{idx + 1}. {q.question}</span>
                    <div className="text-[11px] opacity-80">
                      Your answer: <span className="font-medium">{selected !== undefined ? q.options[selected] : 'Not answered'}</span>
                      {!isCorrect && (
                        <span> | Correct: <span className="font-semibold text-emerald-300">{q.options[q.correctIndex]}</span></span>
                      )}
                    </div>
                  </div>
                  <div>
                    {isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          {wrongIndices.length > 0 && (
            <button
              type="button"
              onClick={handleRetestWrongAnswers}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Re-test {wrongIndices.length} Wrong Answer{wrongIndices.length > 1 ? 's' : ''}
            </button>
          )}

          <button
            type="button"
            onClick={handleResetFullQuiz}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" /> Retake Entire Quiz
          </button>
        </div>
      </div>
    );
  }

  const selectedForCurrent = selectedOptions[currentIndex];
  const hasAnsweredCurrent = selectedForCurrent !== undefined;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
        <span>Question {currentIndex + 1} of {activeQuestions.length}</span>
        <div className="w-48 bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-500 h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-700/60 shadow-xl">
        <h3 className="text-lg sm:text-xl font-bold text-slate-100 leading-snug">
          {currentQ.question}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((optionText, optIdx) => {
            let stateClass = 'bg-slate-900/90 border-slate-700 text-slate-200 hover:border-indigo-500/50 hover:bg-slate-800';

            if (hasAnsweredCurrent) {
              if (optIdx === currentQ.correctIndex) {
                stateClass = 'bg-emerald-950/80 border-emerald-500 text-emerald-100 font-semibold shadow-md shadow-emerald-950/50';
              } else if (optIdx === selectedForCurrent) {
                stateClass = 'bg-rose-950/80 border-rose-500 text-rose-100 font-semibold';
              } else {
                stateClass = 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={optIdx}
                type="button"
                onClick={() => handleSelectOption(optIdx)}
                disabled={hasAnsweredCurrent}
                className={`w-full p-4 rounded-xl border text-left text-sm transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer ${stateClass}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xs font-mono font-semibold text-slate-300">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span>{optionText}</span>
                </div>

                {hasAnsweredCurrent && optIdx === currentQ.correctIndex && (
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                )}
                {hasAnsweredCurrent && optIdx === selectedForCurrent && optIdx !== currentQ.correctIndex && (
                  <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Card */}
        {hasAnsweredCurrent && (
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs leading-relaxed space-y-1 animate-fade-in">
            <div className="font-semibold flex items-center gap-1.5 text-indigo-300">
              <HelpCircle className="w-4 h-4" /> Explanation
            </div>
            <p>{currentQ.explanation}</p>
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={handleNext}
          disabled={!hasAnsweredCurrent}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
        >
          {currentIndex < activeQuestions.length - 1 ? (
            <>Next Question <ArrowRight className="w-4 h-4" /></>
          ) : (
            'View Final Score'
          )}
        </button>
      </div>
    </div>
  );
};
