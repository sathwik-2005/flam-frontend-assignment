import React, { useState, useEffect } from 'react';
import { Flashcard } from '../types/result';
import { ChevronLeft, ChevronRight, RotateCw, CheckCircle2, AlertCircle, Volume2, Sparkles } from 'lucide-react';

interface FlashcardDeckProps {
  cards: Flashcard[];
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [needsReviewIds, setNeedsReviewIds] = useState<Set<string>>(new Set());
  const [speaking, setSpeaking] = useState(false);

  const currentCard = cards[currentIndex];

  // Reset state if card set changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cards]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, cards.length]);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const toggleMastered = (cardId: string) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
        setNeedsReviewIds((r) => {
          const nr = new Set(r);
          nr.delete(cardId);
          return nr;
        });
      }
      return next;
    });
  };

  const toggleNeedsReview = (cardId: string) => {
    setNeedsReviewIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
        setMasteredIds((m) => {
          const nm = new Set(m);
          nm.delete(cardId);
          return nm;
        });
      }
      return next;
    });
  };

  const handleTextToSpeech = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (speaking) {
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!cards || cards.length === 0) {
    return <div className="text-center p-8 text-slate-400">No flashcards available.</div>;
  }

  const isMastered = masteredIds.has(currentCard.id);
  const isNeedsReview = needsReviewIds.has(currentCard.id);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Deck Header & Progress */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
        <div className="flex items-center gap-3">
          <span>Card {currentIndex + 1} of {cards.length}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-mono">
            {currentCard.category || 'General'}
          </span>
          {currentCard.difficulty && (
            <span className={`px-2 py-0.5 rounded-full font-mono capitalize ${
              currentCard.difficulty === 'easy' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
              currentCard.difficulty === 'hard' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
              'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              {currentCard.difficulty}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> {masteredIds.size} Mastered
          </span>
          <span className="text-amber-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {needsReviewIds.size} Review
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-indigo-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={() => setIsFlipped((prev) => !prev)}
        className="w-full h-80 perspective-1000 cursor-pointer group select-none"
      >
        <div
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Card Front (Question) */}
          <div className="absolute inset-0 w-full h-full glass-panel rounded-2xl p-8 flex flex-col justify-between backface-hidden border border-slate-700/60 shadow-xl group-hover:border-indigo-500/50 transition-colors">
            <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold uppercase tracking-wider">
              <span>Question</span>
              <button
                type="button"
                onClick={(e) => handleTextToSpeech(currentCard.question, e)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors"
                title="Read question aloud"
              >
                <Volume2 className={`w-4 h-4 ${speaking ? 'text-amber-400 animate-pulse' : ''}`} />
              </button>
            </div>

            <div className="my-auto text-center px-4">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-100 leading-relaxed">
                {currentCard.question}
              </h3>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5" /> Click or press Space to reveal answer
              </span>
              <span className="text-slate-500 font-mono">ID: {currentCard.id}</span>
            </div>
          </div>

          {/* Card Back (Answer) */}
          <div className="absolute inset-0 w-full h-full glass-panel bg-slate-900/95 rounded-2xl p-8 flex flex-col justify-between backface-hidden rotate-y-180 border border-indigo-500/40 shadow-2xl shadow-indigo-950/50">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Answer & Explanation
              </span>
              <button
                type="button"
                onClick={(e) => handleTextToSpeech(currentCard.answer, e)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-colors"
                title="Read answer aloud"
              >
                <Volume2 className={`w-4 h-4 ${speaking ? 'text-amber-400 animate-pulse' : ''}`} />
              </button>
            </div>

            <div className="my-auto text-center px-4 overflow-y-auto max-h-48">
              <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
                {currentCard.answer}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Click to flip back</span>
              <span className="text-indigo-400 font-medium">Use ← → keys to navigate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls & Mastery status */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrev}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <button
            type="button"
            onClick={() => setIsFlipped((prev) => !prev)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-200 text-sm font-semibold transition-colors cursor-pointer"
          >
            <RotateCw className="w-4 h-4" /> Flip Card
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-colors cursor-pointer"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mastered / Need Review Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleNeedsReview(currentCard.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isNeedsReview
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-amber-300 hover:border-amber-500/50'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            {isNeedsReview ? 'Marked Needs Review' : 'Need Review'}
          </button>

          <button
            type="button"
            onClick={() => toggleMastered(currentCard.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isMastered
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30'
                : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-emerald-300 hover:border-emerald-500/50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isMastered ? 'Marked Mastered' : 'Got It!'}
          </button>
        </div>
      </div>
    </div>
  );
};
