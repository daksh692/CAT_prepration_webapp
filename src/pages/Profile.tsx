import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Profile() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'stats' | 'settings'>('profile');

    // Profile state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Stats state
    const [stats, setStats] = useState({
        totalMinutes: 0,
        totalQuestions: 0,
        currentStreak: 0,
        longestStreak: 0
    });
    const [loadingStats, setLoadingStats] = useState(false);

    // Settings state
    const [examDate, setExamDate] = useState('');
    const [dailyGoalMinutes, setDailyGoalMinutes] = useState(120);
    const [dailyGoalQuestions, setDailyGoalQuestions] = useState(10);
    const [settingsLoading, setSettingsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'stats') {
            fetchStats();
        } else if (activeTab === 'settings') {
            fetchSettings();
        }
    }, [activeTab]);

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const [streakData, todayData] = await Promise.all([
                api.getStreak(),
                api.getTodayStats()
            ]);
            setStats({
                totalMinutes: todayData.total_minutes || 0,
                totalQuestions: parseInt(todayData.total_questions) || 0,
                currentStreak: streakData.current_streak || 0,
                longestStreak: streakData.longest_streak || 0
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchSettings = async () => {
        setSettingsLoading(true);
        try {
            const settings = await api.getUserSettings();
            if (settings.exam_date) {
                const examDateObj = new Date(settings.exam_date);
                setExamDate(examDateObj.toISOString().split('T')[0]);
            }
            setDailyGoalMinutes(settings.daily_goal_minutes || 120);
            setDailyGoalQuestions(settings.daily_goal_questions || 10);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setSettingsLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword && newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setSaving(true);
        try {
            const updateData: any = {};

            if (name !== user?.name) updateData.name = name;
            if (email !== user?.email) updateData.email = email;
            if (newPassword) {
                updateData.currentPassword = currentPassword;
                updateData.newPassword = newPassword;
            }

            const response = await api.updateProfile(updateData);
            localStorage.setItem('user', JSON.stringify(response.user));

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            setTimeout(() => window.location.reload(), 1500);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setSaving(true);

        try {
            await api.updateUserSettings({
                exam_date: (examDate ? new Date(examDate).toISOString() : null) ?? undefined,
                daily_goal_minutes: dailyGoalMinutes,
                daily_goal_questions: dailyGoalQuestions
            });
            setMessage({ type: 'success', text: 'Study settings updated successfully!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update settings' });
        } finally {
            setSaving(false);
        }
    };

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl">
                            👤
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{user?.name}</h1>
                            <p className="text-blue-100">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-4 font-semibold transition ${activeTab === 'profile'
                            ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        👤 My Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`flex-1 py-4 font-semibold transition ${activeTab === 'stats'
                            ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        📊 My Stats
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex-1 py-4 font-semibold transition ${activeTab === 'settings'
                            ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        ⚙️ Settings
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
                                <p className="text-sm text-gray-600 mb-4">Leave blank if you don't want to change your password</p>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Current password"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="New password"
                                            minLength={6}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Confirm password"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4">
                                <button
                                    type="button"
                                    onClick={logout}
                                    className="px-6 py-3 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition"
                                >
                                    Logout
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition ${saving ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Stats Tab */}
                    {activeTab === 'stats' && (
                        <div>
                            {loadingStats ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <p className="mt-4 text-gray-600">Loading stats...</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-blue-800">Today's Study Time</h3>
                                            <span className="text-3xl">⏱️</span>
                                        </div>
                                        <p className="text-4xl font-bold text-blue-600">{formatTime(stats.totalMinutes)}</p>
                                        <p className="text-sm text-blue-700 mt-2">Keep going! 💪</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-purple-800">Questions Solved</h3>
                                            <span className="text-3xl">📝</span>
                                        </div>
                                        <p className="text-4xl font-bold text-purple-600">{stats.totalQuestions}</p>
                                        <p className="text-sm text-purple-700 mt-2">Today's progress</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-orange-800">Current Streak</h3>
                                            <span className="text-3xl">🔥</span>
                                        </div>
                                        <p className="text-4xl font-bold text-orange-600">{stats.currentStreak} days</p>
                                        <p className="text-sm text-orange-700 mt-2">Study daily to increase!</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-green-800">Longest Streak</h3>
                                            <span className="text-3xl">🏆</span>
                                        </div>
                                        <p className="text-4xl font-bold text-green-600">{stats.longestStreak} days</p>
                                        <p className="text-sm text-green-700 mt-2">Your personal best!</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <form onSubmit={handleUpdateSettings} className="space-y-6">
                            {settingsLoading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <p className="mt-4 text-gray-600">Loading settings...</p>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            📅 Target CAT Exam Date
                                        </label>
                                        <input
                                            type="date"
                                            value={examDate}
                                            onChange={(e) => setExamDate(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <p className="text-sm text-gray-500 mt-2">
                                            {examDate && (() => {
                                                const target = new Date(examDate);
                                                const today = new Date();
                                                const daysLeft = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                                return daysLeft > 0
                                                    ? `${daysLeft} days left to prepare! 💪`
                                                    : 'Exam date has passed';
                                            })()}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ⏱️ Daily Study Goal (Minutes)
                                        </label>
                                        <div className="flex items-center space-x-4">
                                            <input
                                                type="range"
                                                min="30"
                                                max="480"
                                                step="30"
                                                value={dailyGoalMinutes}
                                                onChange={(e) => setDailyGoalMinutes(parseInt(e.target.value))}
                                                className="flex-1"
                                            />
                                            <span className="text-2xl font-bold text-blue-600 w-24 text-center">
                                                {Math.floor(dailyGoalMinutes / 60)}h {dailyGoalMinutes % 60}m
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Recommended: 2-3 hours per day for consistent progress
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            📝 Daily Questions Goal
                                        </label>
                                        <div className="flex items-center space-x-4">
                                            <input
                                                type="range"
                                                min="5"
                                                max="100"
                                                step="5"
                                                value={dailyGoalQuestions}
                                                onChange={(e) => setDailyGoalQuestions(parseInt(e.target.value))}
                                                className="flex-1"
                                            />
                                            <span className="text-2xl font-bold text-purple-600 w-24 text-center">
                                                {dailyGoalQuestions}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Recommended: 15-30 questions per day for skill development
                                        </p>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-blue-900 mb-2">💡 Study Tips</h4>
                                        <ul className="text-sm text-blue-800 space-y-1">
                                            <li>• Consistency is key - study daily to maintain your streak</li>
                                            <li>• Quality over quantity - focus on understanding concepts</li>
                                            <li>• Take regular breaks every 25-30 minutes (Pomodoro technique)</li>
                                            <li>• Review mistakes to learn and improve faster</li>
                                        </ul>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className={`w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition ${saving ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                        >
                                            {saving ? 'Saving...' : 'Save Settings'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
