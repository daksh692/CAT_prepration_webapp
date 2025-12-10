import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Home() {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [modules, setModules] = useState<any[]>([]);
    const [chapters, setChapters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Dashboard stats from API
    const [currentStreak, setCurrentStreak] = useState(0);
    const [longestStreak, setLongestStreak] = useState(0);
    const [dailyGoalMinutes, setDailyGoalMinutes] = useState(120);
    const [dailyGoalQuestions, setDailyGoalQuestions] = useState(10);
    const [todayMinutes, setTodayMinutes] = useState(0);
    const [todayQuestions, setTodayQuestions] = useState(0);
    const [examDate, setExamDate] = useState(new Date('2026-11-24'));

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [modulesData, chaptersData, streakData, todayData, settingsData] = await Promise.all([
                    api.getAllModules(),
                    api.getAllChapters(),
                    api.getStreak(),
                    api.getTodayStats(),
                    api.getUserSettings()
                ]);

                setModules(modulesData);
                setChapters(chaptersData);

                // Set streak data
                setCurrentStreak(streakData.current_streak || 0);
                setLongestStreak(streakData.longest_streak || 0);

                // Set today's stats
                setTodayMinutes(todayData.total_minutes || 0);
                setTodayQuestions(todayData.total_questions || 0);

                // Set settings
                setDailyGoalMinutes(settingsData.daily_goal_minutes || 120);
                setDailyGoalQuestions(settingsData.daily_goal_questions || 10);
                if (settingsData.exam_date) {
                    setExamDate(new Date(settingsData.exam_date));
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Calculate stats
    const totalModules = modules?.length || 0;
    const completedChapters = chapters?.filter(c => c.completed || c.skipped).length || 0;
    const totalChapters = chapters?.length || 0;
    const overallProgress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

    // Section-wise progress
    const getSectionProgress = (section: 'VARC' | 'DILR' | 'QA') => {
        const sectionModuleIds = modules?.filter(m => m.section === section).map(m => m.id) || [];
        const sectionChapters = chapters?.filter(c => sectionModuleIds.includes(c.module_id)) || [];
        const completed = sectionChapters.filter(c => c.completed || c.skipped).length;
        return sectionChapters.length > 0 ? Math.round((completed / sectionChapters.length) * 100) : 0;
    };

    // Days until exam
    const daysUntilExam = Math.ceil((examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    // Daily goal progress - now tracks both time and questions
    const goalProgressMinutes = Math.min(Math.round((todayMinutes / dailyGoalMinutes) * 100), 100);
    const goalProgressQuestions = Math.min(Math.round((todayQuestions / dailyGoalQuestions) * 100), 100);
    const overallGoalProgress = Math.round((goalProgressMinutes + goalProgressQuestions) / 2);

    // Motivational quotes
    const quotes = [
        "Success is the sum of small efforts repeated day in and day out.",
        "The expert in anything was once a beginner.",
        "Don't watch the clock; do what it does. Keep going.",
        "The secret of getting ahead is getting started.",
        "Study while others are sleeping; work while others are loafing.",
        "Your limitation—it's only your imagination.",
    ];
    const dailyQuote = quotes[new Date().getDate() % quotes.length];

    if (loading) {
        return (
            <div className="text-center py-20">
                <p className="text-6xl mb-4">⏳</p>
                <p className="text-gray-500">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Time */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Welcome Back! 👋</h1>
                        <p className="text-blue-100">
                            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-2xl font-mono mt-2">
                            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    {daysUntilExam > 0 && (
                        <div className="text-right">
                            <p className="text-blue-100 text-sm">CAT Exam in</p>
                            <p className="text-4xl font-bold">{daysUntilExam}</p>
                            <p className="text-blue-100 text-sm">days</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Today's Goal Progress */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-bold text-secondary">Today's Goal</h2>
                    <span className="text-sm text-gray-500">
                        {overallGoalProgress}% Complete
                    </span>
                </div>

                {/* Time Goal */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">⏱️ Study Time</span>
                        <span className="text-sm text-gray-500">
                            {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m / {Math.floor(dailyGoalMinutes / 60)}h {dailyGoalMinutes % 60}m
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full transition-all duration-500 ${goalProgressMinutes >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${goalProgressMinutes}%` }}
                        ></div>
                    </div>
                </div>

                {/* Questions Goal */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">📝 Questions Solved</span>
                        <span className="text-sm text-gray-500">
                            {todayQuestions} / {dailyGoalQuestions}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full transition-all duration-500 ${goalProgressQuestions >= 100 ? 'bg-green-500' : 'bg-purple-500'}`}
                            style={{ width: `${goalProgressQuestions}%` }}
                        ></div>
                    </div>
                </div>

                <p className="text-center mt-4 text-sm font-medium text-gray-600">
                    {overallGoalProgress >= 100 ? '🎉 Today\'s Goal Achieved!' : `Keep going! ${100 - overallGoalProgress}% to go`}
                </p>
            </div>

            {/* Streak Calendar */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-secondary">🔥 Study Streak</h2>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-primary">{currentStreak}</p>
                        <p className="text-xs text-gray-500">Current Streak</p>
                    </div>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Longest: {longestStreak} days</span>
                    <span className="text-xs text-gray-400">Keep it up! 💪</span>
                </div>
                {/* Placeholder for calendar visualization */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
                    Calendar view coming soon...
                </div>
            </div>

            {/* Section Progress */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { section: 'VARC' as const, name: 'Verbal Ability', icon: '📖', color: 'blue' },
                    { section: 'DILR' as const, name: 'Data Interpretation', icon: '🧩', color: 'purple' },
                    { section: 'QA' as const, name: 'Quantitative Ability', icon: '🔢', color: 'orange' },
                ].map(({ section, name, icon, color }) => {
                    const progress = getSectionProgress(section);
                    return (
                        <div key={section} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-2xl">{icon}</span>
                                <div>
                                    <h3 className="font-bold text-secondary">{section}</h3>
                                    <p className="text-xs text-gray-500">{name}</p>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full bg-${color}-500`}
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <p className="text-center mt-2 text-sm font-medium text-gray-600">{progress}%</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
                    <p className="text-3xl font-bold text-blue-600">{totalModules}</p>
                    <p className="text-sm text-blue-700 font-medium">Total Modules</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
                    <p className="text-3xl font-bold text-green-600">{completedChapters}</p>
                    <p className="text-sm text-green-700 font-medium">Completed</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200">
                    <p className="text-3xl font-bold text-purple-600">{overallProgress}%</p>
                    <p className="text-sm text-purple-700 font-medium">Progress</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200">
                    <p className="text-3xl font-bold text-orange-600">{totalChapters}</p>
                    <p className="text-sm text-orange-700 font-medium">Total Chapters</p>
                </div>
            </div>

            {/* Motivational Quote */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-xl border border-purple-200">
                <p className="text-lg italic text-gray-700 text-center">"{dailyQuote}"</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => navigate('/syllabus')}
                    className="bg-primary text-white p-4 rounded-xl font-bold hover:bg-blue-600 transition shadow-md"
                >
                    📚 View Syllabus
                </button>
                <button
                    onClick={() => navigate('/study')}
                    className="bg-green-500 text-white p-4 rounded-xl font-bold hover:bg-green-600 transition shadow-md"
                >
                    📝 Study Now
                </button>
            </div>
        </div>
    );
}
