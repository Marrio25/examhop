import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

type QuestionType = 'single_choice' | 'true_false' | 'fill_in' | 'reorder' | 'code_fill';

interface QuizQuestion {
  id: string;
  type: QuestionType;
  theoryBefore?: string;
  prompt: string;
  codeSnippet?: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    type: 'single_choice',
    theoryBefore:
      'În C++ trebuie să specifici tipul variabilei (int, double, string etc.). Tipurile trebuie să corespundă valorii atribuite.',
    prompt: 'Care declarație este corectă în C++?',
    options: ['int x = "10";', 'string x = 10;', 'int x = 10;', 'x int = 10;'],
    correctAnswer: 'int x = 10;',
    explanation: 'int x = 10; este singura declarație cu tip și valoare compatibile și sintaxă corectă.',
  },
  {
    id: 'q2',
    type: 'code_fill',
    prompt: 'Completează tipul lipsă astfel încât programul să se compileze:',
    codeSnippet: `#include <iostream>
using namespace std;

int main() {
    ____ x = 5;
    cout << x;
    return 0;
}`,
    correctAnswer: 'int',
    explanation: 'x este o variabilă întreagă, deci tipul potrivit este int.',
  },
  {
    id: 'q3',
    type: 'true_false',
    prompt: 'În C++, std::cout se află în namespace-ul std.',
    correctAnswer: 'True',
    explanation: 'std::cout este definit în namespace-ul std; de aceea folosim prefixul std::.',
  },
  {
    id: 'q4',
    type: 'code_fill',
    theoryBefore:
      'Instrucțiunile if/else în C++ sunt similare cu cele din alte limbaje: if (cond) { ... } else { ... }.',
    prompt: 'Ce se afișează pe ecran?',
    codeSnippet: `int x = 7;
if (x > 10) {
    cout << "mare";
} else {
    cout << "mic";
}`,
    correctAnswer: 'mic',
    explanation: '7 nu este mai mare decât 10, deci se execută ramura else și se afișează „mic”.',
  },
  {
    id: 'q5',
    type: 'reorder',
    prompt:
      'Pune liniile în ordinea corectă pentru a afișa „Par” dacă n este par, altfel „Impar”. Scrie doar ordinea numerelor (ex: 3,1,2,4,5,6).',
    codeSnippet: `1. if (n % 2 == 0) {
2. cout << "Par";
3. int n = 4;
4. } else {
5. cout << "Impar";
6. }`,
    correctAnswer: '3,1,2,4,5,6',
    explanation:
      'Mai întâi declarăm n, apoi if cu condiția, afișăm „Par”, altfel „Impar” și închidem acoladele.',
  },
  {
    id: 'q6',
    type: 'code_fill',
    theoryBefore:
      'Un tablou fix în C++ are o dimensiune cunoscută, iar indexarea pornește de la 0. Un for clasic folosește for (int i = 0; i < dim; i++).',
    prompt: 'Completează astfel încât să fie afișate toate elementele tabloului:',
    codeSnippet: `int arr[3] = {1, 2, 3};

for (int i = 0; i < ____; i++) {
    cout << arr[i] << " ";
}`,
    correctAnswer: '3',
    explanation:
      'Tabloul are 3 elemente, indexate 0,1,2. Condiția trebuie să fie i < 3 pentru a le parcurge pe toate.',
  },
  {
    id: 'q7',
    type: 'single_choice',
    prompt: 'Ce se afișează pe ecran?',
    codeSnippet: `int arr[4] = {10, 20, 30, 40};
cout << arr[2];`,
    options: ['10', '20', '30', '40'],
    correctAnswer: '30',
    explanation: 'arr[2] este al treilea element (indexarea pornește de la 0), adică 30.',
  },
  {
    id: 'q8',
    type: 'true_false',
    prompt: 'Instrucțiunea return 0; din main indică faptul că programul s-a terminat cu succes.',
    correctAnswer: 'True',
    explanation: 'Prin convenție, codul de ieșire 0 semnifică succes la terminarea programului.',
  },
];

export default function CppQuizScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<
    { id: string; userAnswer: string; isCorrect: boolean }[]
  >([]);
  const [showSummary, setShowSummary] = useState(false);
  const [showMistakes, setShowMistakes] = useState(false);

  const question = QUESTIONS[currentIndex];
  const total = QUESTIONS.length;

  const normalize = (val: string) => val.trim().toLowerCase();

  const checkAnswer = () => {
    let userAnswer: string;

    if (question.type === 'single_choice' || question.type === 'true_false') {
      if (!selectedOption) return;
      userAnswer = selectedOption;
    } else {
      if (!answer.trim()) return;
      userAnswer = answer;
    }

    const correct =
      typeof question.correctAnswer === 'string'
        ? normalize(userAnswer) === normalize(question.correctAnswer as string)
        : false;

    setIsCorrect(correct);
    setAnswers((prev) => {
      const existingIndex = prev.findIndex((a) => a.id === question.id);
      const entry = { id: question.id, userAnswer, isCorrect: correct };
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = entry;
        return copy;
      }
      return [...prev, entry];
    });

    if (correct) {
      setScore((prev) => {
        const wasAlreadyCorrect = answers.find((a) => a.id === question.id)?.isCorrect;
        return wasAlreadyCorrect ? prev : prev + 1;
      });
    }
  };

  const goNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
      setAnswer('');
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      setShowSummary(true);
    }
  };

  const correctCount = score;
  const grade = Math.round((correctCount / total) * 10);
  const xp = grade * 30;

  const renderSummary = () => {
    const wrongQuestions = QUESTIONS.filter(
      (q) => !answers.find((a) => a.id === q.id && a.isCorrect),
    );

    return (
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Rezultatul tău</Text>
          <Text style={styles.summaryGradeBig}>{grade}/10</Text>
          <Text style={styles.summaryLine}>
            Ai răspuns corect la {correctCount} din {total} întrebări.
          </Text>
          <Text style={styles.summaryLine}>Ai câștigat {xp} XP.</Text>
        </View>

        {wrongQuestions.length > 0 && (
          <View style={styles.mistakesSection}>
            <TouchableOpacity
              style={styles.showMistakesButton}
              onPress={() => setShowMistakes(!showMistakes)}
            >
              <Text style={styles.showMistakesButtonText}>
                {showMistakes ? '▼' : '▶'} Vezi greșelile ({wrongQuestions.length})
              </Text>
            </TouchableOpacity>

            {showMistakes && (
              <View>
                <Text style={styles.summarySubtitle}>Întrebări greșite & explicații</Text>
                {wrongQuestions.map((q) => {
                  const your = answers.find((a) => a.id === q.id)?.userAnswer ?? '—';
                  const correctText =
                    typeof q.correctAnswer === 'string'
                      ? q.correctAnswer
                      : (q.correctAnswer as string[]).join(', ');
                  return (
                    <View key={q.id} style={styles.explanationCard}>
                      <Text style={styles.explanationQuestion}>{q.prompt}</Text>
                      {q.codeSnippet ? (
                        <View style={styles.codeBox}>
                          <Text style={styles.codeText}>{q.codeSnippet}</Text>
                        </View>
                      ) : null}
                      <Text style={styles.explanationLabel}>Răspunsul tău:</Text>
                      <Text style={styles.explanationValue}>{your}</Text>
                      <Text style={styles.explanationLabel}>Răspuns corect:</Text>
                      <Text style={styles.explanationValue}>{correctText}</Text>
                      <Text style={styles.explanationLabel}>Explicație:</Text>
                      <Text style={styles.explanationText}>{q.explanation}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <LinearGradient colors={['#a855f7', '#8b5cf6', '#7c3aed']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>C++ Basics</Text>
        <Text style={styles.headerScore}>
          {score}/{total}
        </Text>
      </View>

      {!showSummary && (
        <View style={styles.progressWrapper}>
          <Text style={styles.progressLabel}>
            Question {currentIndex + 1} / {total}
          </Text>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${((currentIndex + 1) / total) * 100}%` },
              ]}
            />
          </View>
        </View>
      )}

      {!showSummary && (
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 32 }}>
          {question.theoryBefore ? (
            <View style={styles.theoryBox}>
              <Text style={styles.theoryText}>{question.theoryBefore}</Text>
            </View>
          ) : null}

          <Text style={styles.prompt}>{question.prompt}</Text>

          {question.codeSnippet ? (
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{question.codeSnippet}</Text>
            </View>
          ) : null}

          {['single_choice', 'true_false'].includes(question.type) && question.options && (
            <View style={styles.optionsWrapper}>
              {question.options.map((opt) => {
                const isActive = selectedOption === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.optionButton, isActive && styles.optionButtonActive]}
                    onPress={() => {
                      setSelectedOption(opt);
                      setAnswer('');
                      setIsCorrect(null);
                    }}
                  >
                    <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {['fill_in', 'reorder', 'code_fill'].includes(question.type) && (
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Scrie răspunsul aici"
                placeholderTextColor="rgba(15, 23, 42, 0.4)"
                value={answer}
                onChangeText={(text) => {
                  setAnswer(text);
                  setIsCorrect(null);
                }}
                multiline={question.type !== 'fill_in'}
              />
            </View>
          )}

          {isCorrect !== null && (
            <Text style={[styles.feedbackText, isCorrect ? styles.correct : styles.incorrect]}>
              {isCorrect ? 'Corect! 🎉' : 'Nu e corect. Încearcă din nou sau mergi mai departe.'}
            </Text>
          )}
        </ScrollView>
      )}

      {showSummary && renderSummary()}

      <View style={styles.bottomBar}>
        {!showSummary ? (
          <>
            <TouchableOpacity style={styles.checkButton} onPress={checkAnswer}>
              <Text style={styles.checkButtonText}>Check</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextButton} onPress={goNext}>
              <Text style={styles.nextButtonText}>
                {currentIndex < total - 1 ? 'Next' : 'Finish'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={() => router.back()}>
            <Text style={styles.nextButtonText}>Back to quizzes</Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backText: {
    color: '#f9fafb',
    fontSize: 14,
  },
  headerTitle: {
    color: '#f9fafb',
    fontSize: 18,
    fontWeight: '700',
  },
  headerScore: {
    color: '#f9fafb',
    fontSize: 14,
    fontWeight: '600',
  },
  progressWrapper: {
    marginBottom: 16,
  },
  progressLabel: {
    color: '#e5e7eb',
    fontSize: 13,
    marginBottom: 4,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#22c55e',
  },
  content: {
    flex: 1,
  },
  theoryBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  theoryText: {
    color: '#f9fafb',
    fontSize: 13,
  },
  prompt: {
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  codeBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  codeText: {
    color: '#e5e7eb',
    fontFamily: 'monospace',
    fontSize: 13,
  },
  optionsWrapper: {
    gap: 8,
    marginBottom: 12,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionButtonActive: {
    backgroundColor: '#f97316',
  },
  optionText: {
    color: '#f9fafb',
    fontSize: 14,
  },
  optionTextActive: {
    fontWeight: '700',
  },
  inputWrapper: {
    marginTop: 4,
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
    color: '#111827',
    fontSize: 14,
  },
  feedbackText: {
    marginTop: 8,
    fontSize: 14,
  },
  correct: {
    color: '#bbf7d0',
  },
  incorrect: {
    color: '#fee2e2',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
  },
  checkButton: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkButtonText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    paddingVertical: 10,
  },
  nextButtonText: {
    color: '#f9fafb',
    fontSize: 14,
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.6)',
  },
  summaryTitle: {
    color: '#e5e7eb',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  summaryGradeBig: {
    color: '#fbbf24',
    fontSize: 64,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryLine: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  summarySubtitle: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  explanationCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.4)',
  },
  explanationQuestion: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  explanationLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
  explanationValue: {
    color: '#e5e7eb',
    fontSize: 13,
  },
  explanationText: {
    color: '#cbd5f5',
    fontSize: 13,
    marginTop: 2,
  },
  mistakesSection: {
    marginTop: 8,
  },
  showMistakesButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  showMistakesButtonText: {
    color: '#f9fafb',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});


