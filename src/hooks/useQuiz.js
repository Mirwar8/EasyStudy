import { useState, useMemo, useCallback, useEffect } from "react";

/**
 * useQuiz Hook
 * Maneja el estado de una sesión de estudio/examen.
 * @param {Array} originalCards - Las tarjetas del mazo.
 */
export const useQuiz = (originalCards) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState([]); // { cardId, isCorrect, timeTaken }
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [duration, setDuration] = useState(0);

  // Mezclar las cartas al inicio
  const shuffledCards = useMemo(() => {
    return [...originalCards].sort(() => Math.random() - 0.5);
  }, [originalCards]);

  const currentCard = shuffledCards[currentIndex];

  useEffect(() => {
    setStartTime(Date.now());
  }, [currentIndex]);

  const nextQuestion = useCallback(
    (isCorrect) => {
      const endTime = Date.now();
      const timeTaken = (endTime - startTime) / 1000;

      const newResult = {
        cardId: currentCard._id,
        isCorrect,
        timeTaken,
      };

      const newResults = [...results, newResult];
      setResults(newResults);

      if (currentIndex < shuffledCards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsFinished(true);
        // Calcular duración total
        const totalTime = newResults.reduce(
          (acc, curr) => acc + curr.timeTaken,
          0,
        );
        setDuration(totalTime);
      }
    },
    [currentIndex, shuffledCards, currentCard, results, startTime],
  );

  const resetQuiz = useCallback(() => {
    setCurrentIndex(0);
    setResults([]);
    setIsFinished(false);
    setStartTime(Date.now());
    setDuration(0);
  }, []);

  const stats = useMemo(() => {
    if (!isFinished) return null;
    const correctCount = results.filter((r) => r.isCorrect).length;
    const totalCount = shuffledCards.length;
    const score = Math.round((correctCount / totalCount) * 100);

    return {
      correctCount,
      totalCount,
      score,
      duration,
    };
  }, [isFinished, results, shuffledCards, duration]);

  return {
    currentCard,
    currentIndex,
    totalQuestions: shuffledCards.length,
    isFinished,
    nextQuestion,
    resetQuiz,
    stats,
    progress: (currentIndex / shuffledCards.length) * 100,
  };
};
