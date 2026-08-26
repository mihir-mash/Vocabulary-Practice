import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FlashCard from '../components/FlashCard';
import { rateWord, buildPracticeDeck } from '../lib/srs';
import { RotateCw, CheckCircle2, Flame, Loader2 } from 'lucide-react';

const cardVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function RevisePage({ savedWords, onUpdateWord, loadingWords }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('hard');
  const [sessionDeck, setSessionDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Build deck when words or selected difficulty change
  useEffect(() => {
    const filtered = savedWords.filter(w => w.difficulty === selectedDifficulty);
    setSessionDeck(buildPracticeDeck(filtered));
    setCurrentIndex(0);
    setReviewedCount(0);
    setIsFinished(false);
  }, [savedWords, selectedDifficulty]);

  const totalCards = sessionDeck.length;

  const handleRate = useCallback(async rating => {
    const current = sessionDeck[currentIndex];
    if (!current) return;
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

  const handleRestart = () => {
    const filtered = savedWords.filter(w => w.difficulty === selectedDifficulty);
    setSessionDeck(buildPracticeDeck(filtered));
    setCurrentIndex(0);
    setReviewedCount(0);
    setIsFinished(false);
  };

  if (loadingWords) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <Loader2 size={24} style={{ animation: 'spin 0.9s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ fontSize: '0.88rem', margin: 0 }}>Loading revision cards from Firestore...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (savedWords.length === 0) {
    return (
      <EmptyState
        title="No words saved"
        subtitle="Use the Search tab to look up words and add them to your practice collection."
      />
    );
  }

  const difficulties = ['hard', 'medium', 'easy'];
  const difficultyLabels = { hard: 'Hard', medium: 'Medium', easy: 'Easy' };
  const difficultyColors = { hard: '#f87171', medium: '#fbbf24', easy: '#34d399' };
  const difficultyCounts = {
    hard: savedWords.filter(w => w.difficulty === 'hard').length,
    medium: savedWords.filter(w => w.difficulty === 'medium').length,
    easy: savedWords.filter(w => w.difficulty === 'easy').length,
  };

  if (isFinished || totalCards === 0 || currentIndex >= sessionDeck.length) {
    const hardWordsCount = savedWords.filter(w => w.difficulty === 'hard').length;
    const mediumWordsCount = savedWords.filter(w => w.difficulty === 'medium').length;
    const easyWordsCount = savedWords.filter(w => w.difficulty === 'easy').length;
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '55vh',
          padding: '40px 20px',
          textAlign: 'center',
          maxWidth: '480px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(16,185,129,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: '#10b981',
          }}
        >
          <CheckCircle2 size={32} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
          Round Completed!
        </h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0 0 20px 0', fontSize: '0.9rem', lineHeight: 1.6 }}>
          You reviewed all {reviewedCount} words in this round.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: '8px',
            width: '100%',
            marginBottom: '20px',
          }}
        >
          <div className="card" style={{ padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f87171' }}>{hardWordsCount}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Hard</div>
          </div>
          <div className="card" style={{ padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fbbf24' }}>{mediumWordsCount}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Medium</div>
          </div>
          <div className="card" style={{ padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34d399' }}>{easyWordsCount}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Easy</div>
          </div>
        </div>
        <button
          onClick={handleRestart}
          className="btn btn-purple"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px' }}
        >
          <RotateCw size={15} />
          Start Next Round
        </button>
      </motion.div>
    );
  }

  const currentWord = sessionDeck[currentIndex];
  if (!currentWord) return null;

  return (
    <div style={{ padding: '24px 20px 60px', maxWidth: '520px', margin: '0 auto' }}>
      <nav style={{ display: 'flex', gap: '8px', marginBottom: '20px', justifyContent: 'center' }}>
        {difficulties.map(d => (
          <button
            key={d}
            onClick={() => setSelectedDifficulty(d)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: selectedDifficulty === d ? `2px solid ${difficultyColors[d]}` : '1px solid var(--border)',
              background: selectedDifficulty === d ? `rgba(255,255,255,0.08)` : 'transparent',
              color: difficultyColors[d],
              fontWeight: selectedDifficulty === d ? 600 : 500,
              cursor: 'pointer',
            }}
          >
            {difficultyLabels[d]} ({difficultyCounts[d]})
          </button>
        ))}
      </nav>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
            Flashcards
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.82rem' }}>
            Card {currentIndex + 1} of {totalCards}
          </p>
        </div>
        {currentWord.difficulty === 'hard' && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: '#f87171',
              background: 'rgba(239,68,68,0.1)',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
          >
            <Flame size={12} /> Hard (Priority)
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
          <FlashCard word={currentWord} onRate={handleRate} cardIndex={currentIndex} totalCards={totalCards} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>{title}</h2>
      <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.88rem', maxWidth: '320px', lineHeight: 1.6 }}>{subtitle}</p>
    </motion.div>
  );
}
