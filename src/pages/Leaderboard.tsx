import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface LeaderboardEntry {
    rank: number;
    userId: number;
    name: string;
    avgScore: string;
    totalTests: number;
    currentStreak?: number;
    longestStreak?: number;
    is_me: boolean;
}

export default function Leaderboard() {
    const [tab, setTab] = useState<'public' | 'friends'>('friends');
    const [section, setSection] = useState<'overall' | 'VARC' | 'DILR' | 'QA'>('overall');
    const [sortBy, setSortBy] = useState<'score' | 'tests' | 'streak'>('score');
    const [publicLeaderboard, setPublicLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [friendsLeaderboard, setFriendsLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [showOnPublic, setShowOnPublic] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLeaderboards();
    }, [tab, section, sortBy]);

    const fetchLeaderboards = async () => {
        setLoading(true);
        try {
            if (tab === 'public') {
                const data = await api.getPublicLeaderboard(section === 'overall' ? null : section);
                setPublicLeaderboard(data.leaderboard);
            } else {
                const data = await api.getFriendsLeaderboard(section === 'overall' ? null : section, sortBy);
                setFriendsLeaderboard(data.leaderboard);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const togglePublicVisibility = async () => {
        try {
            await api.togglePublicLeaderboard(!showOnPublic);
            setShowOnPublic(!showOnPublic);
        } catch (error) {
            console.error('Error toggling visibility:', error);
        }
    };

    const getRankEmoji = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return rank;
    };

    const currentLeaderboard = tab === 'public' ? publicLeaderboard : friendsLeaderboard;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                🏆 Leaderboard
            </h1>

            {/* Tab Selector */}
            <div className="flex space-x-2 mb-6 border-b">
                <button
                    onClick={() => setTab('friends')}
                    className={`px-6 py-3 font-semibold transition ${tab === 'friends'
                        ? 'text-purple-600 border-b-2 border-purple-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    👥 Friends
                </button>
                <button
                    onClick={() => setTab('public')}
                    className={`px-6 py-3 font-semibold transition ${tab === 'public'
                        ? 'text-yellow-600 border-b-2 border-yellow-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    🌐 Public
                </button>
            </div>

            {/* Public Leaderboard Opt-in Banner */}
            {tab === 'public' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-gray-800">Public Leaderboard Visibility</p>
                            <p className="text-sm text-gray-600">
                                {showOnPublic ? 'You are visible on the public leaderboard' : 'You are NOT visible on the public leaderboard'}
                            </p>
                        </div>
                        <button
                            onClick={togglePublicVisibility}
                            className={`px-4 py-2 rounded-lg font-semibold ${showOnPublic
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                        >
                            {showOnPublic ? 'Hide Me' : 'Show Me'}
                        </button>
                    </div>
                </div>
            )}

            {/* Section Filter */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="font-semibold text-gray-700 mr-2">Section:</span>
                    {['overall', 'VARC', 'DILR', 'QA'].map(sec => (
                        <button
                            key={sec}
                            onClick={() => setSection(sec as any)}
                            className={`px-4 py-2 rounded-lg font-semibold transition ${section === sec
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {sec === 'overall' ? '📊 Overall' : sec}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sort Options (Friends only) */}
            {tab === 'friends' && (
                <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="font-semibold text-gray-700 mr-2">Sort by:</span>
                        <button
                            onClick={() => setSortBy('score')}
                            className={`px-4 py-2 rounded-lg font-semibold transition ${sortBy === 'score'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            📊 Score
                        </button>
                        <button
                            onClick={() => setSortBy('tests')}
                            className={`px-4 py-2 rounded-lg font-semibold transition ${sortBy === 'tests'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            📝 Tests
                        </button>
                        <button
                            onClick={() => setSortBy('streak')}
                            className={`px-4 py-2 rounded-lg font-semibold transition ${sortBy === 'streak'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            🔥 Streak
                        </button>
                    </div>
                </div>
            )}

            {/* Leaderboard Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                ) : currentLeaderboard.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">
                            {tab === 'friends' ? 'Add friends to see the leaderboard!' : 'No users on public leaderboard yet'}
                        </p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-purple-100 to-blue-100">
                            <tr>
                                <th className="px-6 py-4 text-left font-bold text-gray-700">Rank</th>
                                <th className="px-6 py-4 text-left font-bold text-gray-700">Name</th>
                                <th className="px-6 py-4 text-center font-bold text-gray-700">Avg Score</th>
                                <th className="px-6 py-4 text-center font-bold text-gray-700">Tests</th>
                                {tab === 'friends' && (
                                    <th className="px-6 py-4 text-center font-bold text-gray-700">🔥 Streak</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {currentLeaderboard.map((entry, index) => (
                                <tr
                                    key={`${entry.userId}-${index}`}
                                    className={`border-b ${entry.is_me
                                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 font-bold'
                                        : index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                        } hover:bg-blue-50 transition`}
                                >
                                    <td className="px-6 py-4 text-2xl">
                                        {getRankEmoji(entry.rank)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={entry.is_me ? 'text-orange-600' : 'text-gray-800'}>
                                            {entry.name} {entry.is_me && '(You)'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-blue-600 font-bold text-lg">
                                            {entry.avgScore}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-700">
                                        {entry.totalTests}
                                    </td>
                                    {tab === 'friends' && (
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 text-orange-600 font-bold">
                                                🔥 {entry.currentStreak || 0}
                                            </span>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Best: {entry.longestStreak || 0}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
