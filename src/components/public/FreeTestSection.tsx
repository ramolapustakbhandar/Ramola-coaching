import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { OnlineTest, TestQuestion } from '../../types';
import { FileCheck2, Timer, CheckCircle, XCircle, ArrowRight, RotateCcw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export const FreeTestSection: React.FC<{ onOpenEnquiry: () => void }> = ({ onOpenEnquiry }) => {
  const { onlineTests, recordTestAttempt, currentUser } = useApp();

  const freeTest = onlineTests.find((t) => t.isFree) || onlineTests[0];

  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState((freeTest?.durationMinutes || 20) * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hasStarted && !isSubmitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [hasStarted, isSubmitted, timeLeft]);

  if (!freeTest) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">No free test currently scheduled. Please check back soon.</p>
      </div>
    );
  }

  const currentQuestion = freeTest.questions[currentQuestionIndex];

  const handleSelectOption = (option: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
  };

  const handleSubmit = () => {
    let calculatedScore = 0;
    freeTest.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        calculatedScore += q.marks;
      }
    });

    const percent = Math.round((calculatedScore / freeTest.maxMarks) * 100);
    setScore(calculatedScore);
    setIsSubmitted(true);

    recordTestAttempt({
      testId: freeTest.id,
      testTitle: freeTest.title,
      studentId: currentUser?.id || 'guest-student',
      studentName: currentUser?.fullName || 'Guest Student',
      score: calculatedScore,
      maxMarks: freeTest.maxMarks,
      percentage: percent,
      passed: calculatedScore >= freeTest.passMarks,
      answers: selectedAnswers,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    if (percent >= 60) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setTimeLeft((freeTest.durationMinutes || 20) * 60);
    setIsSubmitted(false);
    setHasStarted(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-left">
      <div className="text-center mb-8">
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400">
          Ramola Assessment Engine
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2">
          {freeTest.title}
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Test your conceptual understanding and speed with our instant-grading online test. Detailed step explanations available upon submission.
        </p>
      </div>

      {!hasStarted ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-center">
              <span className="text-xs text-slate-500">Duration</span>
              <p className="text-lg font-black text-slate-900 dark:text-white">{freeTest.durationMinutes} Mins</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-center">
              <span className="text-xs text-slate-500">Total Marks</span>
              <p className="text-lg font-black text-[#d4af37]">{freeTest.maxMarks}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-center">
              <span className="text-xs text-slate-500">Passing Score</span>
              <p className="text-lg font-black text-slate-900 dark:text-white">{freeTest.passMarks}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-center">
              <span className="text-xs text-slate-500">Questions</span>
              <p className="text-lg font-black text-slate-900 dark:text-white">{freeTest.questions.length}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-700 dark:text-slate-300">
            <strong>Instructions:</strong> {freeTest.instructions}
          </div>

          <button
            onClick={() => setHasStarted(true)}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#002147] text-white hover:bg-[#00152e] dark:bg-[#d4af37] dark:text-[#002147] dark:hover:bg-[#b89326] transition shadow-lg flex items-center justify-center gap-2"
          >
            <span>Start Free Test Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : !isSubmitted ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
          {/* Header Strip with Timer and Question Indicator */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <span className="text-xs font-bold text-slate-500">
              Question {currentQuestionIndex + 1} of {freeTest.questions.length}
            </span>
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white">
              <Timer className="w-4 h-4 text-[#d4af37]" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {currentQuestion.questionText}
            </h3>
            <span className="text-[11px] font-semibold text-[#d4af37]">
              Marks: {currentQuestion.marks}
            </span>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQuestion.options.map((opt, i) => {
              const isSelected = selectedAnswers[currentQuestion.id] === opt;
              return (
                <button
                  key={i}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-sm text-left transition ${
                    isSelected
                      ? 'border-[#002147] bg-[#002147]/5 dark:border-[#d4af37] dark:bg-[#d4af37]/10 font-bold text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {isSelected && <CheckCircle className="w-4 h-4 text-[#d4af37]" />}
                </button>
              );
            })}
          </div>

          {/* Bottom Pagination & Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300"
            >
              Previous
            </button>

            {currentQuestionIndex < freeTest.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#002147] text-white dark:bg-[#d4af37] dark:text-[#002147]"
              >
                Next Question
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow"
              >
                Submit Test
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Test Result and Breakdown */
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-[#d4af37] mx-auto flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Test Completed!
            </h3>
            <p className="text-3xl font-black text-[#d4af37]">
              {score} / {freeTest.maxMarks} Marks ({Math.round((score / freeTest.maxMarks) * 100)}%)
            </p>
            <p className="text-xs text-slate-500">
              {score >= freeTest.passMarks
                ? 'Great effort! You passed the qualifying threshold.'
                : 'Keep practicing! Review the solutions below and join our Saturday Doubt Class.'}
            </p>
          </div>

          {/* Solutions & Explanations */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Detailed Question Analysis:
            </h4>
            {freeTest.questions.map((q, idx) => {
              const userAns = selectedAnswers[q.id];
              const isCorrect = userAns === q.correctAnswer;
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    isCorrect
                      ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                      : 'border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Q{idx + 1}. {q.questionText}
                    </span>
                    {isCorrect ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-bold shrink-0">
                        <CheckCircle className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 font-bold shrink-0">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    <div>Your answer: <span className="font-semibold">{userAns || 'Unattempted'}</span></div>
                    <div>Correct answer: <span className="font-bold text-slate-900 dark:text-white">{q.correctAnswer}</span></div>
                  </div>
                  {q.explanation && (
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                      <strong>Ramola Solution:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRestart}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Test</span>
            </button>
            <button
              onClick={onOpenEnquiry}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#002147] text-white dark:bg-[#d4af37] dark:text-[#002147] transition shadow flex items-center justify-center gap-2"
            >
              <span>Enroll for Full Test Series</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
