import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

interface TestResult {
    id: number;
    test_date: string;
    test_type: 'website' | 'external';
    section?: string;
    chapter_name?: string;
    total_questions: number;
    total_marks: number;
    percentage: number;
    is_checked?: boolean;
}

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlocked_at?: number;
    progress: number;
    target: number;
    percentage: number;
}

export default function Tests() {
    const [activeTab, setActiveTab] = useState<'overview' | 'add-test' | 'achievements' | 'history'>('overview');

    // Data state
    const [results, setResults] = useState<TestResult[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [trends, setTrends] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [weakAreas, setWeakAreas] = useState<any>(null);
    const [achievements, setAchievements] = useState<Achievement[]>([]);

    // Phase 2A state
    const [heatmapData, setHeatmapData] = useState<any[]>([]);
    const [topicData, setTopicData] = useState<any>(null);
    const [catPrediction, setCatPrediction] = useState<any>(null);

    // Phase 2B state - Date Range
    const [dateRange, setDateRange] = useState<'7' | '15' | '30' | '60' | '90' | 'all' | 'custom'>('30');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    // Form state for adding external tests
    const [section, setSection] = useState<'VARC' | 'DILR' | 'QA'>('VARC');
    const [correctMCQ, setCorrectMCQ] = useState(0);
    const [incorrectMCQ, setIncorrectMCQ] = useState(0);
    const [correctFITB, setCorrectFITB] = useState(0);
    const [incorrectFITB, setIncorrectFITB] = useState(0);
    const [isChecked, setIsChecked] = useState(true);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    // Refetch when date range changes
    useEffect(() => {
        if (dateRange !== 'custom' || (customStartDate && customEndDate)) {
            fetchAllData();
        }
    }, [dateRange, customStartDate, customEndDate]);

    const getDaysFromRange = () => {
        if (dateRange === 'all') return 3650; // ~10 years
        if (dateRange === 'custom') {
            if (!customStartDate || !customEndDate) return 30;
            const start = new Date(customStartDate);
            const end = new Date(customEndDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        return parseInt(dateRange);
    };

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const days = getDaysFromRange();

            const [
                resultsData,
                trendsData,
                subjectsData,
                weakAreasData,
                achievementsData,
                heatmap,
                topics,
                prediction
            ] = await Promise.all([
                api.getTestResults(days),
                api.getPerformanceTrends(days),
                api.getSubjectPerformance(),
                api.getWeakAreas(),
                api.getAchievements(),
                api.getStudyHeatmap(Math.min(days, 365)),
                api.getTopicAnalytics(),
                api.getCATPredictor()
            ]);

            setResults(resultsData.results);
            setSummary(resultsData.summary);
            setTrends(trendsData.trends);
            setSubjects(subjectsData.subjects);
            setWeakAreas(weakAreasData);
            setAchievements(achievementsData.achievements);
            setHeatmapData(heatmap.activity);
            setTopicData(topics);
            setCatPrediction(prediction);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Phase 2B: Custom Tooltip Component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || !payload.length) return null;

        const data = payload[0].payload;

        return (
            <div className="bg-white p-4 rounded-lg shadow-2xl border-2 border-blue-300 max-w-xs">
                <p className="font-bold text-gray-800 mb-3 text-sm border-b pb-2">
                    📅 {label}
                </p>
                <div className="space-y-2 text-sm">
                    {data.score !== undefined && (
                        <div className="flex justify-between gap-6">
                            <span className="text-gray-600">Score:</span>
                            <span className="font-bold text-blue-600 text-lg">{data.score}%</span>
                        </div>
                    )}
                    {data.type && (
                        <div className="flex justify-between gap-6">
                            <span className="text-gray-600">Type:</span>
                            <span className="font-semibold">{data.type === 'website' ? '🌐 Website' : '📚 External'}</span>
                        </div>
                    )}
                    {data.tests && (
                        <div className="flex justify-between gap-6">
                            <span className="text-gray-600">Tests:</span>
                            <span className="font-semibold text-indigo-600">{data.tests}</span>
                        </div>
                    )}
                    {data.subject && (
                        <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                            📖 {data.subject}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const calculateMarks = () => {
        const totalMarks = (correctMCQ * 3) - (incorrectMCQ * 1) + (correctFITB * 3);
        const maxMarks = ((correctMCQ + incorrectMCQ) * 3) + ((correctFITB + incorrectFITB) * 3);
        return { totalMarks, maxMarks, percentage: maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0 };
    };

    const handleSubmitTest = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setSubmitting(true);

        try {
            await api.recordExternalTest({
                section,
                correct_mcq: correctMCQ,
                incorrect_mcq: incorrectMCQ,
                correct_fitb: correctFITB,
                incorrect_fitb: incorrectFITB,
                is_checked: isChecked,
                notes
            });

            setMessage({ type: 'success', text: 'External test result recorded successfully!' });

            // Reset form
            setCorrectMCQ(0);
            setIncorrectMCQ(0);
            setCorrectFITB(0);
            setIncorrectFITB(0);
            setNotes('');

            // Refresh data
            fetchAllData();

            // Switch to history tab
            setTimeout(() => setActiveTab('history'), 1500);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to record test' });
        } finally {
            setSubmitting(false);
        }
    };

    const marks = calculateMarks();

    // Prepare chart data
    const trendChartData = trends.map(t => ({
        date: new Date(t.test_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: parseFloat(t.avg_percentage).toFixed(1),
        type: t.test_type
    }));

    const subjectChartData = subjects.map(s => ({
        subject: s.section,
        score: parseFloat(s.avg_percentage).toFixed(1),
        tests: s.test_count
    }));

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">📝 Tests & Analytics</h1>
                <p className="text-gray-600 mt-2">Track your practice and test performance</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 mb-6 border-b">
                {['overview', 'add-test', 'achievements', 'history'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-6 py-3 font-semibold transition capitalize ${activeTab === tab
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab === 'overview' && '📊'}
                        {tab === 'add-test' && '➕'}
                        {tab === 'achievements' && '🏆'}
                        {tab === 'history' && '📜'} {tab.replace('-', ' ')}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Phase 2B: Date Range Selector */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    📅 Date Range Filter
                                </label>
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value as any)}
                                    className="w-full px-4 py-3 border border-blue-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                                >
                                    <option value="7">Last 7 Days</option>
                                    <option value="15">Last 15 Days</option>
                                    <option value="30">Last 30 Days</option>
                                    <option value="60">Last 60 Days</option>
                                    <option value="90">Last 90 Days</option>
                                    <option value="all">All Time</option>
                                    <option value="custom">Custom Range...</option>
                                </select>
                            </div>

                            {dateRange === 'custom' && (
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">From</label>
                                        <input
                                            type="date"
                                            value={customStartDate}
                                            onChange={(e) => setCustomStartDate(e.target.value)}
                                            className="px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <span className="text-gray-500 mt-5">to</span>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">To</label>
                                        <input
                                            type="date"
                                            value={customEndDate}
                                            onChange={(e) => setCustomEndDate(e.target.value)}
                                            className="px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {dateRange !== 'custom' && (
                                <div className="text-sm text-gray-600 mt-6">
                                    <span className="font-semibold">
                                        {dateRange === 'all' ? 'All Time' : `Last ${dateRange} Days`}
                                    </span> • {results.length} tests found
                                </div>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-gray-600">Loading analytics...</p>
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="grid md:grid-cols-4 gap-6">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                                    <div className="text-blue-600 text-sm font-semibold mb-2">Total Tests</div>
                                    <div className="text-3xl font-bold text-blue-700">{summary?.total_tests || 0}</div>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                                    <div className="text-green-600 text-sm font-semibold mb-2">Website Tests</div>
                                    <div className="text-3xl font-bold text-green-700">{summary?.website_tests || 0}</div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                                    <div className="text-purple-600 text-sm font-semibold mb-2">External Tests</div>
                                    <div className="text-3xl font-bold text-purple-700">{summary?.external_tests || 0}</div>
                                </div>

                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                                    <div className="text-orange-600 text-sm font-semibold mb-2">Avg Score</div>
                                    <div className="text-3xl font-bold text-orange-700">
                                        {summary?.average_percentage ? `${summary.average_percentage.toFixed(1)}%` : '0%'}
                                    </div>
                                </div>
                            </div>

                            {/* CAT SCORE PREDICTOR - Phase 2A */}
                            {catPrediction && catPrediction.predicted_percentile !== null && (
                                <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-xl shadow-2xl p-8 border-2 border-yellow-300">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800">🎯 CAT Percentile Predictor</h2>
                                            <p className="text-gray-600 text-sm mt-1">Based on your recent performance</p>
                                        </div>
                                        <div className={`px-4 py-2 rounded-full text-xs font-semibold ${catPrediction.confidence === 'high' ? 'bg-green-100 text-green-700' :
                                            catPrediction.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {catPrediction.confidence.toUpperCase()} CONFIDENCE
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="text-center">
                                            <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">
                                                {catPrediction.predicted_percentile.toFixed(1)}
                                            </div>
                                            <div className="text-2xl font-bold text-gray-700 mt-2">Predicted Percentile</div>
                                            <div className="mt-4 text-sm text-gray-600">
                                                Based on {catPrediction.total_tests} tests
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="bg-white bg-opacity-50 rounded-lg p-4">
                                                <div className="text-sm text-gray-600 mb-2">Recent 30-day Average</div>
                                                <div className="text-2xl font-bold text-blue-600">{catPrediction.recent_avg}%</div>
                                            </div>
                                            <div className="bg-white bg-opacity-50 rounded-lg p-4">
                                                <div className="text-sm text-gray-600 mb-2">Overall Average</div>
                                                <div className="text-2xl font-bold text-purple-600">{catPrediction.overall_avg}%</div>
                                            </div>
                                            <div className="bg-white bg-opacity-50 rounded-lg p-4">
                                                <div className="text-sm text-gray-600 mb-2">Section Scores</div>
                                                <div className="flex justify-between text-sm">
                                                    <span>VARC: <strong>{catPrediction.section_scores?.varc || 0}%</strong></span>
                                                    <span>DILR: <strong>{catPrediction.section_scores?.dilr || 0}%</strong></span>
                                                    <span>QA: <strong>{catPrediction.section_scores?.qa || 0}%</strong></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STUDY HEATMAP - Phase 2A */}
                            {heatmapData.length > 0 && (
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">📅 Study Pattern Heatmap</h2>
                                    <p className="text-gray-600 text-sm mb-6">Your activity over the last 90 days</p>

                                    <div className="overflow-x-auto">
                                        <div className="inline-flex flex-wrap gap-1">
                                            {heatmapData.map((day, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:scale-125 ${day.level === 0 ? 'bg-gray-100' :
                                                        day.level === 1 ? 'bg-green-200' :
                                                            day.level === 2 ? 'bg-green-400' :
                                                                day.level === 3 ? 'bg-green-600' :
                                                                    'bg-green-800'
                                                        }`}
                                                    title={`${day.date}: ${day.study_minutes}min, ${day.test_count} tests, ${day.questions} questions`}
                                                ></div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-600">
                                        <span>Less</span>
                                        <div className="flex gap-1">
                                            <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
                                            <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
                                            <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                                            <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
                                            <div className="w-3 h-3 bg-green-800 rounded-sm"></div>
                                        </div>
                                        <span>More</span>
                                    </div>
                                </div>
                            )}

                            {/* TOPIC DEEP DIVE - Phase 2A */}
                            {topicData && topicData.modules && topicData.modules.length > 0 && (
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">📖 Topic-wise Performance</h2>
                                    <p className="text-gray-600 text-sm mb-6">Chapter-level breakdown of your performance</p>

                                    {/* Weakest Chapters Alert */}
                                    {topicData.weak_chapters && topicData.weak_chapters.length > 0 && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                            <h3 className="font-bold text-red-900 mb-3">⚠️ Focus on These Chapters:</h3>
                                            <div className="space-y-2">
                                                {topicData.weak_chapters.slice(0, 3).map((ch: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-center text-sm">
                                                        <span className="text-red-800">
                                                            {ch.chapter_name} <span className="text-red-600">({ch.section})</span>
                                                        </span>
                                                        <span className="font-semibold text-red-700">{ch.avg_percentage.toFixed(1)}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Module Breakdown */}
                                    <div className="space-y-4">
                                        {topicData.modules.map((module: any) => (
                                            <details key={module.module_id} className="border border-gray-200 rounded-lg overflow-hidden">
                                                <summary className="bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${module.section === 'VARC' ? 'bg-green-100 text-green-700' :
                                                            module.section === 'DILR' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {module.section}
                                                        </span>
                                                        <span className="font-semibold text-gray-800">{module.module_name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-sm text-gray-600">{module.total_tests} tests</span>
                                                        <span className="text-lg font-bold text-indigo-600">{module.avg_percentage.toFixed(1)}%</span>
                                                    </div>
                                                </summary>

                                                <div className="p-4 bg-white">
                                                    <div className="space-y-2">
                                                        {module.chapters.map((chapter: any) => (
                                                            <div key={chapter.chapter_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                                <div>
                                                                    <div className="font-medium text-gray-800">{chapter.chapter_name}</div>
                                                                    <div className="text-xs text-gray-500 mt-1">
                                                                        {chapter.test_count} tests • {chapter.total_questions} questions
                                                                    </div>
                                                                </div>
                                                                <div className={`text-2xl font-bold ${chapter.avg_percentage >= 80 ? 'text-green-600' :
                                                                    chapter.avg_percentage >= 60 ? 'text-blue-600' :
                                                                        chapter.avg_percentage >= 40 ? 'text-orange-600' :
                                                                            'text-red-600'
                                                                    }`}>
                                                                    {chapter.avg_percentage.toFixed(1)}%
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </details>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Performance Trend Chart */}
                            {trendChartData.length > 0 && (
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">📈 Performance Trends</h2>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={trendChartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis domain={[0, 100]} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} name="Score %" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Subject Comparison */}
                            {subjectChartData.length > 0 && (
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 Subject-wise Performance</h2>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={subjectChartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="subject" />
                                            <YAxis domain={[0, 100]} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Bar dataKey="score" fill="#8B5CF6" name="Average Score %" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Self-Preparation Summary */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 Self-Preparation Summary</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-700">Website Practice (Auto-Recorded)</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Tests Completed:</span>
                                                <span className="font-semibold">{summary?.website_tests || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total Questions:</span>
                                                <span className="font-semibold">
                                                    {results.filter(r => r.test_type === 'website')
                                                        .reduce((sum, r) => sum + r.total_questions, 0)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total Marks:</span>
                                                <span className="font-semibold text-blue-600">
                                                    {results.filter(r => r.test_type === 'website')
                                                        .reduce((sum, r) => sum + r.total_marks, 0).toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-700">External Practice (Manual Entry)</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Tests Completed:</span>
                                                <span className="font-semibold">{summary?.external_tests || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total Questions:</span>
                                                <span className="font-semibold">
                                                    {results.filter(r => r.test_type === 'external')
                                                        .reduce((sum, r) => sum + r.total_questions, 0)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total Marks:</span>
                                                <span className="font-semibold text-purple-600">
                                                    {results.filter(r => r.test_type === 'external')
                                                        .reduce((sum, r) => sum + r.total_marks, 0).toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CAT Marking Info */}
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
                                <h3 className="font-bold text-indigo-900 mb-3">ℹ️ CAT Exam Marking System</h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="font-semibold text-indigo-800 mb-2">Multiple Choice Questions (MCQ):</p>
                                        <ul className="space-y-1 text-indigo-700">
                                            <li>✅ Correct Answer: <span className="font-bold text-green-600">+3 marks</span></li>
                                            <li>❌ Incorrect Answer: <span className="font-bold text-red-600">-1 mark</span></li>
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-indigo-800 mb-2">Fill in the Blanks (FITB):</p>
                                        <ul className="space-y-1 text-indigo-700">
                                            <li>✅ Correct Answer: <span className="font-bold text-green-600">+3 marks</span></li>
                                            <li>❌ Incorrect Answer: <span className="font-bold text-gray-600">0 marks</span></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Weak Areas */}
                            {weakAreas && weakAreas.weak_areas?.length > 0 && (
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">⚠️ Areas for Improvement</h2>
                                    <div className="space-y-4">
                                        {weakAreas.weak_areas.map((area: any) => (
                                            <div key={area.section} className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-red-900">{area.section}</h3>
                                                    <span className="text-sm text-red-700">{area.avg_percentage.toFixed(1)}%</span>
                                                </div>
                                                <p className="text-sm text-red-800">{area.recommendation}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Strong Areas */}
                            {weakAreas && weakAreas.strong_areas?.length > 0 && (
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">💪 Your Strengths</h2>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        {weakAreas.strong_areas.map((area: any) => (
                                            <div key={area.section} className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                                <h3 className="font-bold text-green-900">{area.section}</h3>
                                                <p className="text-2xl font-bold text-green-600 mt-2">{area.avg_percentage.toFixed(1)}%</p>
                                                <p className="text-xs text-green-700 mt-1">{area.test_count} tests</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Add Test Tab */}
            {activeTab === 'add-test' && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">➕ Record External Test Result</h2>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-blue-800">
                            💡 <strong>Note:</strong> Website practice tests are recorded <strong>automatically</strong>.
                            Use this form to log tests from <strong>external study materials</strong>.
                        </p>
                    </div>

                    {message && (
                        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmitTest} className="space-y-6">
                        {/* Section Selection */}
                        <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                            <h3 className="font-bold text-indigo-900 mb-4">📚 Subject</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {(['VARC', 'DILR', 'QA'] as const).map(subj => (
                                    <button
                                        key={subj}
                                        type="button"
                                        onClick={() => setSection(subj)}
                                        className={`py-3 px-6 rounded-lg font-semibold transition ${section === subj
                                            ? 'bg-indigo-600 text-white shadow-lg'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                                            }`}
                                    >
                                        {subj}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* MCQ Section */}
                        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                            <h3 className="font-bold text-purple-900 mb-4">Multiple Choice Questions (MCQ)</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ✅ Correct Answers
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={correctMCQ}
                                        onChange={(e) => setCorrectMCQ(parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                    <p className="text-xs text-green-600 mt-1">+3 marks each</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ❌ Incorrect Answers
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={incorrectMCQ}
                                        onChange={(e) => setIncorrectMCQ(parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                    <p className="text-xs text-red-600 mt-1">-1 mark each</p>
                                </div>
                            </div>
                        </div>

                        {/* FITB Section */}
                        <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                            <h3 className="font-bold text-indigo-900 mb-4">Fill in the Blanks (FITB) - Optional</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ✅ Correct FITB
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={correctFITB}
                                        onChange={(e) => setCorrectFITB(parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <p className="text-xs text-green-600 mt-1">+3 marks each</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ❌ Incorrect FITB
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={incorrectFITB}
                                        onChange={(e) => setIncorrectFITB(parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <p className="text-xs text-gray-600 mt-1">0 marks (no negative)</p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => setIsChecked(e.target.checked)}
                                        className="w-5 h-5 text-indigo-600"
                                    />
                                    <span className="text-sm text-gray-700">I have checked my answers</span>
                                </label>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    rows={3}
                                    placeholder="Add any notes about this test..."
                                />
                            </div>
                        </div>

                        {/* Marks Preview */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                            <h3 className="font-bold text-green-900 mb-4">📊 Score Preview</h3>
                            <div className="grid md:grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">Total Marks</div>
                                    <div className="text-3xl font-bold text-green-600">{marks.totalMarks.toFixed(1)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">Max Marks</div>
                                    <div className="text-3xl font-bold text-gray-700">{marks.maxMarks}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">Percentage</div>
                                    <div className="text-3xl font-bold text-blue-600">{marks.percentage.toFixed(1)}%</div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition ${submitting ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {submitting ? 'Recording...' : '✅ Record External Test Result'}
                        </button>
                    </form>
                </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">🏆 Achievements</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {achievements.map((achievement) => (
                            <div
                                key={achievement.id}
                                className={`p-6 rounded-xl border-2 transition ${achievement.unlocked
                                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
                                    : 'bg-gray-50 border-gray-200 opacity-60'
                                    }`}
                            >
                                <div className="text-5xl mb-3 text-center">{achievement.icon}</div>
                                <h3 className="font-bold text-gray-800 text-center mb-2">{achievement.name}</h3>
                                <p className="text-sm text-gray-600 text-center mb-4">{achievement.description}</p>

                                {achievement.unlocked ? (
                                    <div className="text-center">
                                        <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                                            ✓ Unlocked
                                        </div>
                                        {achievement.unlocked_at && (
                                            <p className="text-xs text-gray-500 mt-2">
                                                {new Date(achievement.unlocked_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all"
                                                style={{ width: `${achievement.percentage}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-600 text-center">
                                            {achievement.progress} / {achievement.target}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">📜 Test History</h2>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-gray-600">Loading history...</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📝</div>
                            <p className="text-gray-600">No test results yet. Complete a practice test or add an external test!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {results.map((result) => (
                                <div key={result.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${result.test_type === 'website'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {result.test_type === 'website' ? '🌐 Website' : '📚 External'}
                                                </span>
                                                {result.section && (
                                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded">
                                                        {result.section}
                                                    </span>
                                                )}
                                                <span className="text-sm text-gray-600">
                                                    {new Date(result.test_date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                                {result.chapter_name && (
                                                    <span className="text-sm text-gray-500">• {result.chapter_name}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-6 text-sm">
                                                <span className="text-gray-600">
                                                    Questions: <span className="font-semibold">{result.total_questions}</span>
                                                </span>
                                                <span className="text-gray-600">
                                                    Marks: <span className="font-semibold text-green-600">{result.total_marks.toFixed(1)}</span>
                                                </span>
                                                <span className="text-gray-600">
                                                    Score: <span className="font-semibold text-blue-600">{result.percentage.toFixed(1)}%</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`text-3xl font-bold ${result.percentage >= 80 ? 'text-green-500' :
                                            result.percentage >= 60 ? 'text-blue-500' :
                                                result.percentage >= 40 ? 'text-orange-500' :
                                                    'text-red-500'
                                            }`}>
                                            {result.percentage >= 80 ? '🏆' :
                                                result.percentage >= 60 ? '👍' :
                                                    result.percentage >= 40 ? '📈' : '💪'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
