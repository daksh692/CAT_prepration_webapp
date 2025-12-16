import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface ActiveSession {
    chapterId: number;
    chapterName: string;
    moduleName: string;
    startTime: number;
    duration: number; // in seconds
    questions: number;
    studyMode: 'website' | 'external';
    isPaused: boolean;
}

export default function Study() {
    const navigate = useNavigate();
    const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
    const [chapters, setChapters] = useState<any[]>([]);
    const [showChapterSelect, setShowChapterSelect] = useState(false);
    const [studyMode, setStudyMode] = useState<'website' | 'external'>('website');

    // Today's stats
    const [todayMinutes, setTodayMinutes] = useState(0);
    const [todayQuestions, setTodayQuestions] = useState(0);
    const [todaySessions, setTodaySessions] = useState<any[]>([]);

    // Weekly analytics
    const [weeklyData, setWeeklyData] = useState<any>(null);

    // Timer
    const timerRef = useRef<number | null>(null);

    // Load chapters and stats on mount
    useEffect(() => {
        loadChapters();
        loadTodayStats();
        loadTodaySessions();
        loadWeeklyAnalytics();

        // Check for saved session in localStorage
        const saved = localStorage.getItem('active_session');
        if (saved) {
            const session = JSON.parse(saved);
            setActiveSession(session);
            if (!session.isPaused) {
                startTimer();
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    // Auto-save session every 60 seconds
    useEffect(() => {
        if (activeSession && !activeSession.isPaused) {
            const saveInterval = setInterval(() => {
                localStorage.setItem('active_session', JSON.stringify(activeSession));
            }, 60000); // Every minute

            return () => clearInterval(saveInterval);
        }
    }, [activeSession]);

    const loadChapters = async () => {
        try {
            const data = await api.getAllChapters();
            setChapters(data);
        } catch (error) {
            console.error('Error loading chapters:', error);
        }
    };

    const loadTodayStats = async () => {
        try {
            const stats = await api.getTodayStats();
            setTodayMinutes(stats.total_minutes || 0);
            setTodayQuestions(stats.total_questions || 0);
        } catch (error) {
            console.error('Error loading today stats:', error);
        }
    };

    const loadTodaySessions = async () => {
        try {
            const data = await api.getTodaySessions();
            setTodaySessions(data.sessions || []);
        } catch (error) {
            console.error('Error loading today sessions:', error);
        }
    };

    const loadWeeklyAnalytics = async () => {
        try {
            const data = await api.getWeeklyAnalytics();
            setWeeklyData(data);
        } catch (error) {
            console.error('Error loading weekly analytics:', error);
        }
    };

    const startTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(() => {
            setActiveSession(prev => {
                if (!prev || prev.isPaused) return prev;
                return { ...prev, duration: prev.duration + 1 };
            });
        }, 1000);
    };

    const handleStartSession = async (chapterId: number) => {
        try {
            const chapter = chapters.find(c => c.id === chapterId);
            if (!chapter) return;

            const response = await api.startSession(chapterId, studyMode);

            const session: ActiveSession = {
                chapterId: chapter.id,
                chapterName: chapter.name,
                moduleName: response.chapter.module_name || '',
                startTime: Date.now(),
                duration: 0,
                questions: 0,
                studyMode,
                isPaused: false
            };

            setActiveSession(session);
            setShowChapterSelect(false);
            startTimer();
            localStorage.setItem('active_session', JSON.stringify(session));
        } catch (error) {
            console.error('Error starting session:', error);
            alert('Failed to start session');
        }
    };

    const handlePauseResume = () => {
        setActiveSession(prev => {
            if (!prev) return prev;
            const updated = { ...prev, isPaused: !prev.isPaused };
            localStorage.setItem('active_session', JSON.stringify(updated));

            if (updated.isPaused) {
                if (timerRef.current) clearInterval(timerRef.current);
            } else {
                startTimer();
            }

            return updated;
        });
    };

    const handleAddQuestion = () => {
        setActiveSession(prev => {
            if (!prev) return prev;
            const updated = { ...prev, questions: prev.questions + 1 };
            localStorage.setItem('active_session', JSON.stringify(updated));
            return updated;
        });
    };

    const handleEndSession = async () => {
        if (!activeSession) return;

        const durationMinutes = Math.floor(activeSession.duration / 60);
        if (durationMinutes === 0) {
            alert('Session too short! Study for at least 1 minute.');
            return;
        }

        try {
            await api.endSession({
                chapter_id: activeSession.chapterId,
                duration: durationMinutes,
                questions_completed: activeSession.questions,
                study_mode: activeSession.studyMode
            });

            // Clean up
            if (timerRef.current) clearInterval(timerRef.current);
            localStorage.removeItem('active_session');
            setActiveSession(null);

            // Reload stats
            await loadTodayStats();
            await loadTodaySessions();
            await loadWeeklyAnalytics();

            alert(`Session completed! ${durationMinutes} minutes, ${activeSession.questions} questions. Great job! 🎉`);
        } catch (error) {
            console.error('Error ending session:', error);
            alert('Failed to save session');
        }
    };

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const maxWeeklyMinutes = weeklyData?.data_points
        ? Math.max(...weeklyData.data_points.map((d: any) => d.total_minutes), 120)
        : 120;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-secondary">📚 Study Sessions</h1>

            {/* Active Session Card */}
            {!activeSession ? (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-xl shadow-sm border border-green-200">
                    <p className="text-6xl mb-4 text-center">⏱️</p>
                    <p className="text-xl font-bold text-center text-secondary mb-4">Ready to Study?</p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setShowChapterSelect(true)}
                            className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-600 transition shadow-md"
                        >
                            🚀 Start New Session
                        </button>
                        <button
                            onClick={() => navigate('/syllabus')}
                            className="bg-blue-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-600 transition shadow-md"
                        >
                            📖 Browse Syllabus
                        </button>
                    </div>
                </div>
            ) : (
                <div className={`p-6 rounded-xl shadow-md border-2 ${activeSession.isPaused ? 'bg-yellow-50 border-yellow-400' : 'bg-green-50 border-green-400'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-gray-600">{activeSession.moduleName}</p>
                            <h2 className="text-2xl font-bold text-secondary">{activeSession.chapterName}</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Mode: {activeSession.studyMode === 'website' ? '💻 Website' : '📚 External Materials'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-4xl font-mono font-bold text-green-600">{formatTime(activeSession.duration)}</p>
                            <p className="text-sm text-gray-500">
                                {activeSession.isPaused ? '⏸️ Paused' : '▶️ Active'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg mb-4">
                        <p className="text-lg font-semibold text-gray-700">
                            📝 Questions Completed: <span className="text-purple-600">{activeSession.questions}</span>
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleAddQuestion}
                            className="flex-1 bg-purple-500 text-white py-3 rounded-lg font-bold hover:bg-purple-600 transition"
                        >
                            ➕ Add Question
                        </button>
                        <button
                            onClick={handlePauseResume}
                            className="flex-1 bg-yellow-500 text-white py-3 rounded-lg font-bold hover:bg-yellow-600 transition"
                        >
                            {activeSession.isPaused ? '▶️ Resume' : '⏸️ Pause'}
                        </button>
                        <button
                            onClick={handleEndSession}
                            className="flex-1 bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 transition"
                        >
                            ⏹️ End Session
                        </button>
                    </div>
                </div>
            )}

            {/* Today's Summary */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-secondary mb-4">📅 Today's Summary</h2>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-3xl font-bold text-blue-600">{Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m</p>
                        <p className="text-sm text-gray-600">Total Time</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-3xl font-bold text-purple-600">{todayQuestions}</p>
                        <p className="text-sm text-gray-600">Questions</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-3xl font-bold text-green-600">{todaySessions.length}</p>
                        <p className="text-sm text-gray-600">Sessions</p>
                    </div>
                </div>
            </div>

            {/* Weekly Analytics Graph */}
            {weeklyData && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-secondary mb-4">📊 Weekly Study Hours</h2>
                    <div className="flex items-end justify-between gap-2 h-48 mb-4">
                        {weeklyData.data_points.map((day: any, index: number) => {
                            const heightPercent = (day.total_minutes / maxWeeklyMinutes) * 100;
                            const hours = (day.total_minutes / 60).toFixed(1);
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center">
                                    <div className="w-full flex flex-col justify-end" style={{ height: '100%' }}>
                                        <div
                                            className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg transition-all hover:opacity-80 cursor-pointer relative group"
                                            style={{ height: `${heightPercent}%`, minHeight: day.total_minutes > 0 ? '8px' : '0' }}
                                            title={`${day.day_name}: ${hours}h (${day.total_questions} questions)`}
                                        >
                                            {day.total_minutes > 0 && (
                                                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-600 opacity-0 group-hover:opacity-100 transition">
                                                    {hours}h
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs mt-2 text-gray-600 font-medium">{day.day_name}</p>
                                </div>
                            );
                        })}
                    </div>
                    <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="text-lg font-bold text-gray-700">{Math.floor(weeklyData.summary.total_minutes / 60)}h</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Average/Day</p>
                            <p className="text-lg font-bold text-gray-700">{Math.floor(weeklyData.summary.avg_minutes_per_day / 60)}h</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Days Studied</p>
                            <p className="text-lg font-bold text-gray-700">{weeklyData.summary.days_studied}/7</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Total Questions</p>
                            <p className="text-lg font-bold text-gray-700">{weeklyData.summary.total_questions}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Today's Sessions List */}
            {todaySessions.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-secondary mb-4">📚 Today's Sessions</h2>
                    <div className="space-y-3">
                        {todaySessions.map((session, index) => (
                            <div key={session.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-gray-400">{index + 1}</div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800">{session.chapter_name || 'General Study'}</p>
                                    <p className="text-sm text-gray-500">{session.module_name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-blue-600">{session.duration} min</p>
                                    <p className="text-sm text-purple-600">{session.questions_completed} questions</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Chapter Selection Modal */}
            {showChapterSelect && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-secondary mb-4">Select Chapter to Study</h2>

                        {/* Study Mode Selection */}
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <p className="font-semibold text-gray-700 mb-2">Study Mode:</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStudyMode('website')}
                                    className={`flex-1 py-3 rounded-lg font-semibold transition ${studyMode === 'website'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300'
                                        }`}
                                >
                                    💻 Website (auto-pause on inactivity)
                                </button>
                                <button
                                    onClick={() => setStudyMode('external')}
                                    className={`flex-1 py-3 rounded-lg font-semibold transition ${studyMode === 'external'
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300'
                                        }`}
                                >
                                    📚 External Materials (manual timer)
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            {chapters.map(chapter => (
                                <button
                                    key={chapter.id}
                                    onClick={() => handleStartSession(chapter.id)}
                                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition"
                                >
                                    <p className="font-semibold text-gray-800">{chapter.name}</p>
                                    <p className="text-sm text-gray-500">Difficulty: {chapter.difficulty}</p>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowChapterSelect(false)}
                            className="w-full bg-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-400 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
