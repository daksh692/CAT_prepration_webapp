import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Question {
    question: string;
    options: string[];
    correctAnswer: number | string;
    explanation: string;
    type: 'MCQ' | 'TITA';
    difficulty: 'Easy' | 'Medium' | 'Hard';
    timeLimit: number;
    marks: number;
    negativeMark: number;
}

// Sample CAT-level questions for demonstration
const sampleQuestions: Question[] = [
    {
        question: "If the ratio of the present ages of A and B is 3:4, and after 5 years the ratio becomes 4:5, what is the present age of A?",
        options: ["15 years", "20 years", "25 years", "30 years"],
        correctAnswer: 0,
        explanation: "Let present ages be 3x and 4x. After 5 years: (3x+5)/(4x+5) = 4/5. Solving: 15x+25 = 16x+20, x=5. So A's age = 3×5 = 15 years.",
        type: 'MCQ',
        difficulty: 'Medium',
        timeLimit: 120,
        marks: 3,
        negativeMark: 1
    },
    {
        question: "A train 150m long passes a pole in 15 seconds. What is the speed of the train in km/hr?",
        options: [],
        correctAnswer: "36",
        explanation: "Speed = Distance/Time = 150m/15s = 10 m/s. Converting to km/hr: 10 × 18/5 = 36 km/hr.",
        type: 'TITA',
        difficulty: 'Easy',
        timeLimit: 90,
        marks: 3,
        negativeMark: 0
    },
    {
        question: "In a class of 60 students, 30 play cricket, 25 play football, and 10 play both. How many students play neither cricket nor football?",
        options: ["15", "20", "25", "30"],
        correctAnswer: 0,
        explanation: "Using set theory: Total = Cricket + Football - Both + Neither. 60 = 30 + 25 - 10 + Neither. Neither = 15.",
        type: 'MCQ',
        difficulty: 'Medium',
        timeLimit: 120,
        marks: 3,
        negativeMark: 1
    },
    {
        question: "If 2^x = 32, what is the value of x?",
        options: [],
        correctAnswer: "5",
        explanation: "2^x = 32 = 2^5. Therefore, x = 5.",
        type: 'TITA',
        difficulty: 'Easy',
        timeLimit: 60,
        marks: 3,
        negativeMark: 0
    },
    {
        question: "A shopkeeper marks his goods 40% above cost price but gives a discount of 20%. What is his profit percentage?",
        options: ["10%", "12%", "15%", "20%"],
        correctAnswer: 1,
        explanation: "Let CP = 100. MP = 140. SP = 140 - 20% of 140 = 140 - 28 = 112. Profit% = (112-100)/100 × 100 = 12%.",
        type: 'MCQ',
        difficulty: 'Medium',
        timeLimit: 150,
        marks: 3,
        negativeMark: 1
    }
];

export default function SkipTest() {
    const { chapterId } = useParams<{ chapterId: string }>();
    const navigate = useNavigate();

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<(number | string | null)[]>(Array(5).fill(null));
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes total
    const [testStarted, setTestStarted] = useState(false);
    const [testCompleted, setTestCompleted] = useState(false);
    const [score, setScore] = useState(0);
    const [showExplanations, setShowExplanations] = useState(false);
    const [chapter, setChapter] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChapter = async () => {
            if (!chapterId) return;
            try {
                const data = await api.getChapterById(Number(chapterId));
                setChapter(data);
            } catch (error) {
                console.error('Error fetching chapter:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchChapter();
    }, [chapterId]);

    // Timer
    useEffect(() => {
        if (testStarted && !testCompleted && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [testStarted, testCompleted, timeLeft]);

    const handleStart = () => {
        setTestStarted(true);
    };

    const handleAnswer = (answer: number | string) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = answer;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        // Calculate score and count correct/incorrect/unattempted
        let rawScore = 0;
        let correctMCQ = 0;
        let incorrectMCQ = 0;
        let unattemptedMCQ = 0;

        answers.forEach((answer, idx) => {
            const question = sampleQuestions[idx];
            if (answer !== null) {
                if (question.type === 'MCQ') {
                    if (answer === question.correctAnswer) {
                        rawScore += question.marks;
                        correctMCQ++;
                    } else {
                        rawScore -= question.negativeMark;
                        incorrectMCQ++;
                    }
                } else { // TITA
                    if (String(answer).toLowerCase() === String(question.correctAnswer).toLowerCase()) {
                        rawScore += question.marks;
                    }
                }
            } else {
                // Count unattempted MCQs
                if (question.type === 'MCQ') {
                    unattemptedMCQ++;
                }
            }
        });

        const maxScore = sampleQuestions.reduce((sum, q) => sum + q.marks, 0);
        const percentage = Math.max(0, Math.round((rawScore / maxScore) * 100));
        setScore(percentage);
        setTestCompleted(true);

        // Record test result automatically
        try {
            await api.recordWebsiteTest({
                chapter_id: Number(chapterId),
                correct_mcq: correctMCQ,
                incorrect_mcq: incorrectMCQ,
                unattempted_mcq: unattemptedMCQ
            });
        } catch (error) {
            console.error('Error recording test result:', error);
        }

        // Update chapter status if passed
        if (percentage >= 80) {
            try {
                await api.updateChapter(Number(chapterId), {
                    skipped: true,
                    skip_test_score: percentage,
                    completed_at: Date.now(),
                });
            } catch (error) {
                console.error('Error updating chapter:', error);
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="text-center py-20">
                <p className="text-6xl mb-4">⏳</p>
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    if (!chapter) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500">Chapter not found</p>
            </div>
        );
    }

    // Start Screen
    if (!testStarted) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <button
                    onClick={() => navigate(-1)}
                    className="text-primary hover:text-blue-600 flex items-center gap-2"
                >
                    ← Back
                </button>

                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-2xl shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">Skip Test</h1>
                    <p className="text-purple-100">{chapter.name}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                    <h2 className="text-xl font-bold text-secondary">Test Instructions</h2>

                    <div className="space-y-3 text-gray-700">
                        <p>• <strong>Questions:</strong> 5 questions (Mix of MCQ and TITA)</p>
                        <p>• <strong>Time Limit:</strong> 10 minutes</p>
                        <p>• <strong>Passing Score:</strong> 80% or above</p>
                        <p>• <strong>Marking Scheme:</strong></p>
                        <div className="pl-6 space-y-1 text-sm">
                            <p>- MCQ: +3 for correct, -1 for incorrect, 0 for unattempted</p>
                            <p>- TITA: +3 for correct, 0 for incorrect (no negative marking)</p>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> Questions are at CAT exam difficulty level. If you score 80% or above, this chapter will be marked as "Skipped" and count as completed.
                        </p>
                    </div>

                    <button
                        onClick={handleStart}
                        className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition shadow-md"
                    >
                        Start Test
                    </button>
                </div>
            </div>
        );
    }

    // Results Screen
    if (testCompleted) {
        const passed = score >= 80;
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className={`p-8 rounded-2xl shadow-lg text-white ${passed ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-red-600 to-pink-600'
                    }`}>
                    <div className="text-center">
                        <p className="text-6xl mb-4">{passed ? '🎉' : '😔'}</p>
                        <h1 className="text-3xl font-bold mb-2">
                            {passed ? 'Congratulations!' : 'Keep Practicing!'}
                        </h1>
                        <p className="text-xl mb-4">Your Score: {score}%</p>
                        <p className="text-lg opacity-90">
                            {passed
                                ? 'You\'ve successfully skipped this chapter!'
                                : 'You need 80% or above to skip this chapter.'}
                        </p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-secondary">Review Answers</h2>
                        <button
                            onClick={() => setShowExplanations(!showExplanations)}
                            className="text-primary hover:text-blue-600 font-medium"
                        >
                            {showExplanations ? 'Hide' : 'Show'} Explanations
                        </button>
                    </div>

                    <div className="space-y-4">
                        {sampleQuestions.map((q, idx) => {
                            const userAnswer = answers[idx];
                            const isCorrect = q.type === 'MCQ'
                                ? userAnswer === q.correctAnswer
                                : String(userAnswer).toLowerCase() === String(q.correctAnswer).toLowerCase();

                            return (
                                <div key={idx} className={`p-4 rounded-lg border-2 ${isCorrect ? 'border-green-300 bg-green-50' :
                                    userAnswer === null ? 'border-gray-300 bg-gray-50' :
                                        'border-red-300 bg-red-50'
                                    }`}>
                                    <div className="flex items-start gap-3 mb-2">
                                        <span className="text-xl">
                                            {isCorrect ? '✅' : userAnswer === null ? '⭕' : '❌'}
                                        </span>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800 mb-2">Q{idx + 1}. {q.question}</p>
                                            <p className="text-sm text-gray-600">
                                                <strong>Your Answer:</strong> {
                                                    userAnswer === null ? 'Not Attempted' :
                                                        q.type === 'MCQ' ? q.options[userAnswer as number] : userAnswer
                                                }
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <strong>Correct Answer:</strong> {
                                                    q.type === 'MCQ' ? q.options[q.correctAnswer as number] : q.correctAnswer
                                                }
                                            </p>
                                            {showExplanations && (
                                                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                                                    <p className="text-sm text-blue-800">{q.explanation}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex gap-3">
                    {!passed && (
                        <button
                            onClick={() => {
                                setTestStarted(false);
                                setTestCompleted(false);
                                setCurrentQuestion(0);
                                setAnswers(Array(5).fill(null));
                                setTimeLeft(600);
                            }}
                            className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition"
                        >
                            Retry Test
                        </button>
                    )}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
                    >
                        Back to Module
                    </button>
                </div>
            </div>
        );
    }

    // Test Screen
    const question = sampleQuestions[currentQuestion];
    const userAnswer = answers[currentQuestion];

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        {sampleQuestions.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentQuestion(idx)}
                                className={`w-10 h-10 rounded-lg font-bold transition ${idx === currentQuestion ? 'bg-primary text-white' :
                                    answers[idx] !== null ? 'bg-green-100 text-green-700' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                    <div className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-primary'}`}>
                        ⏱️ {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            {/* Question */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-sm font-medium text-gray-500">
                        Question {currentQuestion + 1} of {sampleQuestions.length}
                    </h2>
                    <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${question.type === 'MCQ' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                            }`}>
                            {question.type}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${question.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                            question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                            {question.difficulty}
                        </span>
                    </div>
                </div>

                <p className="text-lg text-gray-800 mb-6">{question.question}</p>

                {question.type === 'MCQ' ? (
                    <div className="space-y-3">
                        {question.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                className={`w-full text-left p-4 rounded-lg border-2 transition ${userAnswer === idx
                                    ? 'border-primary bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="font-medium text-gray-700">
                                    {String.fromCharCode(65 + idx)}. {option}
                                </span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enter your answer:
                        </label>
                        <input
                            type="text"
                            value={userAnswer || ''}
                            onChange={(e) => handleAnswer(e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                            placeholder="Type your answer here..."
                        />
                    </div>
                )}

                <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                    <strong>Marking:</strong> {question.type === 'MCQ'
                        ? '+3 for correct, -1 for incorrect'
                        : '+3 for correct, 0 for incorrect (no negative)'}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between gap-3">
                <button
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    ← Previous
                </button>

                {currentQuestion === sampleQuestions.length - 1 ? (
                    <button
                        onClick={handleSubmit}
                        className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-md"
                    >
                        Submit Test
                    </button>
                ) : (
                    <button
                        onClick={() => setCurrentQuestion(Math.min(sampleQuestions.length - 1, currentQuestion + 1))}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-blue-600 transition"
                    >
                        Next →
                    </button>
                )}
            </div>
        </div>
    );
}
