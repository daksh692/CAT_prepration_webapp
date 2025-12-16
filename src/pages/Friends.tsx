import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Friend {
    id: number;
    name: string;
    friend_code: string;
    avg_score: number;
    total_tests: number;
    current_streak: number;
    longest_streak: number;
}

interface FriendRequest {
    id: number;
    sender_id: number;
    sender_name: string;
    sender_code: string;
    created_at: number;
}

export default function Friends() {
    const [myCode, setMyCode] = useState('');
    const [friendCode, setFriendCode] = useState('');
    const [friends, setFriends] = useState<Friend[]>([]);
    const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Analytics modal state
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [analytics, setAnalytics] = useState<any>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [codeData, friendsData, requestsData] = await Promise.all([
                api.getMyFriendCode(),
                api.getFriends(),
                api.getPendingRequests()
            ]);

            setMyCode(codeData.code);
            setFriends(friendsData.friends);
            setPendingRequests(requestsData.requests);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(myCode);
        setMessage({ type: 'success', text: 'Friend code copied!' });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleSendRequest = async () => {
        if (!friendCode || friendCode.length !== 12) {
            setMessage({ type: 'error', text: 'Please enter a valid 12-character friend code' });
            return;
        }

        try {
            await api.sendFriendRequest(friendCode);
            setMessage({ type: 'success', text: 'Friend request sent!' });
            setFriendCode('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to send request' });
        }
        setTimeout(() => setMessage(null), 3000);
    };

    const handleAcceptRequest = async (requestId: number) => {
        try {
            await api.acceptFriendRequest(requestId);
            setMessage({ type: 'success', text: 'Friend request accepted!' });
            fetchAllData();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to accept request' });
        }
        setTimeout(() => setMessage(null), 3000);
    };

    const handleRejectRequest = async (requestId: number) => {
        try {
            await api.rejectFriendRequest(requestId);
            setMessage({ type: 'success', text: 'Friend request rejected' });
            fetchAllData();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to reject request' });
        }
        setTimeout(() => setMessage(null), 3000);
    };

    const handleRemoveFriend = async (friendId: number) => {
        if (!confirm('Are you sure you want to remove this friend?')) return;

        try {
            await api.removeFriend(friendId);
            setMessage({ type: 'success', text: 'Friend removed' });
            fetchAllData();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to remove friend' });
        }
        setTimeout(() => setMessage(null), 3000);
    };

    const handleViewStats = async (friendId: number) => {

        setShowAnalytics(true);
        setAnalyticsLoading(true);
        try {
            const data = await api.getFriendAnalytics(friendId);
            setAnalytics(data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load friend stats' });
            setShowAnalytics(false);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                👥 Friends
            </h1>

            {/* Message */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            {/* My Friend Code */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">🔑 Your Friend Code</h2>
                <div className="flex items-center gap-4">
                    <div className="flex-1 bg-white px-6 py-4 rounded-lg border-2 border-blue-300">
                        <p className="text-3xl font-mono font-bold text-blue-600 tracking-wider text-center">
                            {myCode || 'Loading...'}
                        </p>
                    </div>
                    <button
                        onClick={copyCode}
                        className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    >
                        📋 Copy
                    </button>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                    Share this code with friends to connect!
                </p>
            </div>

            {/* Add Friend */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">➕ Add Friend</h2>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={friendCode}
                        onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                        placeholder="Enter friend code (12 characters)"
                        maxLength={12}
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-lg"
                    />
                    <button
                        onClick={handleSendRequest}
                        className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                    >
                        Send Request
                    </button>
                </div>
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        📬 Pending Requests ({pendingRequests.length})
                    </h2>
                    <div className="space-y-3">
                        {pendingRequests.map(request => (
                            <div key={request.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <div>
                                    <p className="font-semibold text-gray-800">{request.sender_name}</p>
                                    <p className="text-sm text-gray-600">Code: {request.sender_code}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAcceptRequest(request.id)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        ✓ Accept
                                    </button>
                                    <button
                                        onClick={() => handleRejectRequest(request.id)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        ✗ Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Friends List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    👥 My Friends ({friends.length})
                </h2>
                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                ) : friends.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                        No friends yet. Add some using their friend code!
                    </p>
                ) : (
                    <div className="space-y-3">
                        {friends.map(friend => (
                            <div key={friend.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100">
                                <div className="flex-1">
                                    <p className="font-bold text-lg text-gray-800">{friend.name}</p>
                                    <div className="flex gap-4 text-sm text-gray-600 mt-1">
                                        <span>📊 {friend.avg_score?.toFixed(1)}% avg</span>
                                        <span>📝 {friend.total_tests} tests</span>
                                        <span>🔥 {friend.current_streak} day streak</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleViewStats(friend.id)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        📊 View Stats
                                    </button>
                                    <button
                                        onClick={() => handleRemoveFriend(friend.id)}
                                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-300"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Analytics Modal */}
            {showAnalytics && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAnalytics(false)}>
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {analyticsLoading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : analytics && (
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-800">{analytics.friend.name}'s Stats</h2>
                                        <p className="text-gray-600 mt-1">Performance Dashboard</p>
                                    </div>
                                    <button
                                        onClick={() => setShowAnalytics(false)}
                                        className="text-gray-400 hover:text-gray-600 text-2xl"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Rank Card */}
                                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-6 border-2 border-yellow-200">
                                    <div className="text-center">
                                        <p className="text-gray-600 mb-2">Rank Among Friends</p>
                                        <p className="text-5xl font-bold text-orange-600">#{analytics.rank.position}</p>
                                        <p className="text-sm text-gray-600 mt-2">out of {analytics.rank.total_friends} friends</p>
                                    </div>
                                </div>

                                {/* Streaks */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                                        <p className="text-sm text-gray-600 mb-1">🔥 Current Streak</p>
                                        <p className="text-3xl font-bold text-orange-600">{analytics.friend.current_streak} days</p>
                                    </div>
                                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                        <p className="text-sm text-gray-600 mb-1">⭐ Longest Streak</p>
                                        <p className="text-3xl font-bold text-purple-600">{analytics.friend.longest_streak} days</p>
                                    </div>
                                </div>

                                {/* Overall Stats */}
                                <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">📈 Overall Performance</h3>
                                    <div className="grid grid-cols-3 gap-4 mb-5">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Total Tests</p>
                                            <p className="text-2xl font-bold text-blue-600">{analytics.overall.total_tests}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Average Score</p>
                                            <p className="text-2xl font-bold text-green-600">{analytics.overall.avg_score}%</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Best Score</p>
                                            <p className="text-2xl font-bold text-purple-600">{analytics.overall.best_score}%</p>
                                        </div>
                                    </div>

                                    {/* Subject-wise scores */}
                                    {analytics.subjects.length > 0 && (
                                        <>
                                            <div className="border-t border-blue-300 pt-4">
                                                <p className="text-sm font-semibold text-gray-700 mb-3">📚 By Subject</p>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {['VARC', 'DILR', 'QA'].map(section => {
                                                        const subjectData = analytics.subjects.find((s: any) => s.section === section);
                                                        return (
                                                            <div key={section} className="bg-white rounded-lg p-3 border border-blue-200">
                                                                <p className="text-xs font-semibold text-gray-600 mb-1">{section}</p>
                                                                <p className="text-xl font-bold text-blue-600">
                                                                    {subjectData ? `${subjectData.avg_score}%` : 'N/A'}
                                                                </p>
                                                                {subjectData && (
                                                                    <p className="text-xs text-gray-500">{subjectData.test_count} tests</p>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Subject Performance */}
                                {analytics.subjects.length > 0 && (
                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4">📚 Subject Performance</h3>
                                        <div className="space-y-4">
                                            {analytics.subjects.map((subject: any) => (
                                                <div key={subject.section} className="bg-white rounded-lg p-5 border-2 border-gray-200">
                                                    <h4 className="font-bold text-lg text-gray-800 mb-3">{subject.section}</h4>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div>
                                                            <p className="text-xs text-gray-600 mb-1">Total Tests</p>
                                                            <p className="text-xl font-bold text-blue-600">{subject.test_count}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-600 mb-1">Average Score</p>
                                                            <p className="text-xl font-bold text-green-600">{subject.avg_score}%</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-600 mb-1">Best Score</p>
                                                            <p className="text-xl font-bold text-purple-600">{subject.best_score}%</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
