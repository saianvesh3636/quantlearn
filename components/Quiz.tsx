'use client';

import React, { useState, useCallback } from 'react';
import { useProgress } from '@/providers/ProgressProvider';

/**
 * Quiz question type matching types/curriculum.ts
 */
export interface QuizQuestion {
  /** The question text displayed to the user */
  question: string;
  /** Array of answer options (typically 4 choices) */
  options: string[];
  /** Index of the correct answer in the options array (0-based) */
  correctIndex: number;
}

interface QuizProps {
  /** Array of quiz questions */
  questions: QuizQuestion[];
  /** Lesson slug for progress tracking */
  lessonSlug: string;
  /** Callback when quiz is passed */
  onPass?: () => void;
}

interface QuizState {
  /** Selected answer index for each question (-1 = not selected) */
  selectedAnswers: number[];
  /** Whether the quiz has been submitted */
  submitted: boolean;
  /** Whether the quiz was passed */
  passed: boolean;
  /** Which questions were answered incorrectly */
  incorrectQuestions: number[];
  /** Number of attempts made */
  attempts: number;
}

/**
 * Calculate passing threshold: need at least 2/3 correct answers
 */
function calculatePassingThreshold(totalQuestions: number): number {
  return Math.ceil((2 / 3) * totalQuestions);
}

/**
 * Quiz component with multiple choice questions, answer selection, and submit functionality
 * Requires 2/3 correct answers to pass
 * Shows incorrect answers without revealing correct ones on first attempt
 */
export function Quiz({ questions, lessonSlug, onPass }: QuizProps) {
  const { markQuizPassed, isQuizPassed } = useProgress();
  const alreadyPassed = isQuizPassed(lessonSlug);

  const [state, setState] = useState<QuizState>({
    selectedAnswers: new Array(questions.length).fill(-1),
    submitted: false,
    passed: alreadyPassed,
    incorrectQuestions: [],
    attempts: 0,
  });

  const passingThreshold = calculatePassingThreshold(questions.length);

  const handleSelectAnswer = useCallback((questionIndex: number, optionIndex: number) => {
    if (state.submitted && state.passed) return; // Don't allow changes after passing

    setState(prev => {
      const newSelectedAnswers = [...prev.selectedAnswers];
      newSelectedAnswers[questionIndex] = optionIndex;
      return {
        ...prev,
        selectedAnswers: newSelectedAnswers,
        // Reset submission state when changing answers after a failed attempt
        submitted: prev.passed ? prev.submitted : false,
        incorrectQuestions: prev.passed ? prev.incorrectQuestions : [],
      };
    });
  }, [state.submitted, state.passed]);

  const handleSubmit = useCallback(async () => {
    // Check if all questions are answered
    const allAnswered = state.selectedAnswers.every(answer => answer !== -1);
    if (!allAnswered) return;

    // Grade the quiz
    const incorrectQuestions: number[] = [];
    let correctCount = 0;

    questions.forEach((question, index) => {
      if (state.selectedAnswers[index] === question.correctIndex) {
        correctCount++;
      } else {
        incorrectQuestions.push(index);
      }
    });

    const passed = correctCount >= passingThreshold;

    setState(prev => ({
      ...prev,
      submitted: true,
      passed,
      incorrectQuestions,
      attempts: prev.attempts + 1,
    }));

    if (passed) {
      // Save to IndexedDB
      await markQuizPassed(lessonSlug);
      onPass?.();
    }
  }, [state.selectedAnswers, questions, passingThreshold, lessonSlug, markQuizPassed, onPass]);

  const handleRetry = useCallback(() => {
    setState(prev => ({
      ...prev,
      submitted: false,
      incorrectQuestions: [],
      // Keep selected answers so user can see what they chose
    }));
  }, []);

  const allAnswered = state.selectedAnswers.every(answer => answer !== -1);
  const correctCount = questions.length - state.incorrectQuestions.length;

  // If already passed, show success message
  if (alreadyPassed && !state.submitted) {
    return (
      <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Quiz Completed!</h3>
            <p className="text-green-700 dark:text-green-300">You have already passed this quiz. The next lesson is unlocked.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Knowledge Check</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Answer at least {passingThreshold} of {questions.length} questions correctly to unlock the next lesson.
      </p>

      <div className="space-y-6">
        {questions.map((question, questionIndex) => {
          const isIncorrect = state.submitted && state.incorrectQuestions.includes(questionIndex);
          const isCorrect = state.submitted && !state.incorrectQuestions.includes(questionIndex);

          return (
            <div
              key={questionIndex}
              className={`p-4 rounded-lg border ${
                isIncorrect
                  ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                  : isCorrect
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
              }`}
            >
              <p className="font-medium text-gray-900 dark:text-white mb-3 flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm">
                  {questionIndex + 1}
                </span>
                <span>{question.question}</span>
              </p>

              <div className="space-y-2 ml-8">
                {question.options.map((option, optionIndex) => {
                  const isSelected = state.selectedAnswers[questionIndex] === optionIndex;
                  const showAsIncorrect = state.submitted && isSelected && isIncorrect;
                  const showAsCorrect = state.submitted && state.passed && isSelected && isCorrect;

                  return (
                    <button
                      key={optionIndex}
                      onClick={() => handleSelectAnswer(questionIndex, optionIndex)}
                      disabled={state.submitted && state.passed}
                      className={`w-full text-left p-3 rounded-md border transition-colors ${
                        showAsIncorrect
                          ? 'border-red-500 bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100'
                          : showAsCorrect
                          ? 'border-green-500 bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100'
                          : isSelected
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-900 dark:text-primary-100'
                          : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                      } ${
                        state.submitted && state.passed
                          ? 'cursor-default'
                          : 'cursor-pointer'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? showAsIncorrect
                              ? 'border-red-500 bg-red-500'
                              : showAsCorrect
                              ? 'border-green-500 bg-green-500'
                              : 'border-primary-500 bg-primary-500'
                            : 'border-gray-300 dark:border-gray-500'
                        }`}>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </span>
                        <span>{option}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Show feedback for incorrect answers */}
              {isIncorrect && state.attempts === 1 && (
                <p className="mt-2 ml-8 text-sm text-red-600 dark:text-red-400">
                  This answer is incorrect. Try again!
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Results and actions */}
      <div className="mt-6">
        {state.submitted && (
          <div className={`mb-4 p-4 rounded-lg ${
            state.passed
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            {state.passed ? (
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                    Congratulations!
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    You got {correctCount} of {questions.length} correct. The next lesson is now unlocked!
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                    Not quite!
                  </h3>
                  <p className="text-red-700 dark:text-red-300">
                    You got {correctCount} of {questions.length} correct. You need at least {passingThreshold} to pass.
                    {state.attempts === 1 && " Review the highlighted questions and try again."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-4">
          {!state.submitted && (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                allAnswered
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              Submit Answers
            </button>
          )}

          {state.submitted && !state.passed && (
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md font-medium transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Quiz;
