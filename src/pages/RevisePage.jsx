import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FlashCard from '../components/FlashCard';
import { rateWord, buildPracticeDeck } from '../lib/srs';
import { RotateCw, CheckCircle2, Flame, Loader2 } from 'lucide-react';

const DIFFICULTIES = ['hard', 'medium', 'easy'];
const DIFFICULTY_LABELS = { hard: 'Hard', medium: 'Medium', easy: 'Easy' };
const DIFFICULTY_COLORS = { hard: '#cf1f1f', medium: '#fb24d3', easy: '#34d399' };

const cardVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function RevisePage({ savedWords, onUpdateWord, loadingWords }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('hard');

  // The deck is stored in a ref — React state changes (like savedWords updating after rating)
  // will NEVER cause the deck to be rebuilt mid-round.
  const [sessionDeck, setSessionDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Keep a stable ref to savedWords so startSession always uses latest words
  const savedWordsRef = useRef(savedWords);
  useEffect(() => {
    savedWordsRef.current = savedWords;
  });

  // Build a fresh deck — called ONLY on tab change or explicit restart, never mid-round
  const startSession = useCallback((difficulty) => {
    const filtered = savedWordsRef.current.filter(w => w.difficulty === difficulty);
    const deck = buildPracticeDeck(filtered);
    setSessionDeck(deck);
    setCurrentIndex(0);
    setReviewedCount(0);
    setIsFinished(false);
  }, []);

  // Rebuild when difficulty tab changes
  useEffect(() => {
    startSession(selectedDifficulty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDifficulty]);

  const totalCards = sessionDeck.length;

  const handleRate = useCallback(async (rating) => {
    const current = sessionDeck[currentIndex];
    if (!current) return;

    // Persist updated difficulty to parent storage — this intentionally does NOT rebuild the deck
    const updated = rateWord(current, rating);
    onUpdateWord(updated);

    await new Promise(r => setTimeout(r, 180));

    const nextIdx = currentIndex + 1;
    setReviewedCount(c => c + 1);
    if (nextIdx >= sessionDeck.length) {
      setIsFinished(true);
    } else {
      setCurrentIndex(nextIdx);
    }
  }, [sessionDeck, currentIndex, onUpdateWord]);

  const handleRestart = useCallback(() => {
    startSession(selectedDifficulty);
  }, [startSession, selectedDifficulty]);

  // ── Loading state ────────────────────────────────────────────────
  if (loadingWords) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <Loader2 size={24} style={{ animation: 'spin 0.9s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ fontSize: '0.88rem', margin: 0 }}>Loading your vocabulary...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── No words at all ──────────────────────────────────────────────
  if (savedWords.length === 0) {
    return (
      <EmptyState
        title="No words saved"
        subtitle="Use the Search tab to look up words and add them to your practice collection."
      />
    );
  }

  // ── Counts for tab badges (always reads latest savedWords) ───────
  const counts = {
    hard:   savedWords.filter(w => w.difficulty === 'hard').length,
    medium: savedWords.filter(w => w.difficulty === 'medium').length,
    easy:   savedWords.filter(w => w.difficulty === 'easy').length,
  };

  const currentWord = !isFinished && totalCards > 0 ? sessionDeck[currentIndex] : null;

  return (
    <div style={{ padding: '24px 20px 60px', maxWidth: '520px', margin: '0 auto' }}>

      {/* ── Difficulty tab selector ── */}
      <nav style={{ display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
        {DIFFICULTIES.map(d => (
          <button
            key={d}
            onClick={() => setSelectedDifficulty(d)}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: selectedDifficulty === d
                ? `2px solid ${DIFFICULTY_COLORS[d]}`
                : '1px solid var(--border)',
              background: selectedDifficulty === d
                ? `${DIFFICULTY_COLORS[d]}18`
                : 'transparent',
              color: DIFFICULTY_COLORS[d],
              fontWeight: selectedDifficulty === d ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {DIFFICULTY_LABELS[d]} ({counts[d]})
          </button>
        ))}
      </nav>

      {/* ── Session finished ── */}
      {isFinished ? (
        <motion.div
          key="finished"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '30px 20px',
            textAlign: 'center',
          }}
        >
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'rgba(16,185,129,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px', color: '#10b981',
          }}>
            <CheckCircle2 size={32} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
            {DIFFICULTY_LABELS[selectedDifficulty]} Round Done!
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 24px 0', fontSize: '0.9rem' }}>
            You reviewed all {reviewedCount} {selectedDifficulty} cards.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', width: '100%', marginBottom: '24px' }}>
            {DIFFICULTIES.map(d => (
              <div key={d} className="card" style={{ padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: DIFFICULTY_COLORS[d] }}>{counts[d]}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{DIFFICULTY_LABELS[d]}</div>
              </div>
            ))}
          </div>
          <button
            onClick={handleRestart}
            className="btn btn-purple"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
          >
            <RotateCw size={15} />
            Start Next Round
          </button>
        </motion.div>

      /* ── Empty deck for this difficulty ── */
      ) : totalCards === 0 ? (
        <motion.div
          key={`empty-${selectedDifficulty}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '40vh',
            padding: '30px 20px', textAlign: 'center',
          }}
        >
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
            No {DIFFICULTY_LABELS[selectedDifficulty]} Words
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '300px', margin: 0, lineHeight: 1.6 }}>
            You have no words marked as {DIFFICULTY_LABELS[selectedDifficulty].toLowerCase()} right now.
            Pick another tab or keep practising to move words between levels.
          </p>
        </motion.div>

      /* ── Active flashcard session ── */
      ) : currentWord ? (
        <>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 3px 0', color: 'var(--text-primary)' }}>
                {DIFFICULTY_LABELS[selectedDifficulty]} Flashcards
              </h1>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8rem' }}>
                Card {currentIndex + 1} of {totalCards}
              </p>
            </div>
            {selectedDifficulty === 'hard' && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '0.72rem', fontWeight: 600, color: '#f87171',
                background: 'rgba(239,68,68,0.1)', padding: '3px 8px',
                borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)',
              }}>
                <Flame size={12} /> Priority
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentWord.word}-${currentIndex}`}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <FlashCard
                word={currentWord}
                onRate={handleRate}
                cardIndex={currentIndex}
                totalCards={totalCards}
              />
            </motion.div>
          </AnimatePresence>
        </>
      ) : null}
    </div>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '50vh',
        padding: '40px 20px', textAlign: 'center',
      }}
    >
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>{title}</h2>
      <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.88rem', maxWidth: '320px', lineHeight: 1.6 }}>{subtitle}</p>
    </motion.div>
  );
}
