import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

type Tab = 'videos' | 'notes' | 'keypoints' | 'examples' | 'practice';

export default function StudyMaterial() {
    const { chapterId } = useParams<{ chapterId: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>('videos');
    const [showDetailedNotes, setShowDetailedNotes] = useState(false);
    const [expandedExample, setExpandedExample] = useState<number | null>(null);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [showHints, setShowHints] = useState<Record<number, boolean>>({});
    const [checkedAnswers, setCheckedAnswers] = useState<Record<number, boolean>>({});

    const [chapter, setChapter] = useState<any>(null);
    const [studyData, setStudyData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudyMaterials = async () => {
            if (!chapterId) return;

            try {
                setLoading(true);
                const [chapterData, materialsData] = await Promise.all([
                    api.getChapterById(Number(chapterId)),
                    api.getChapterStudyMaterials(Number(chapterId))
                ]);

                setChapter(chapterData);
                setStudyData(materialsData);
            } catch (error) {
                console.error('Error fetching study materials:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudyMaterials();
    }, [chapterId]);

    const handleMarkStudied = async () => {
        if (!chapterId) return;
        try {
            await api.updateChapter(Number(chapterId), {
                completed: true,
                completed_at: Date.now()
            });
            navigate(-1);
        } catch (error) {
            console.error('Error marking chapter as studied:', error);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-20">
                <p className="text-6xl mb-4">⏳</p>
                <p className="text-gray-500">Loading study materials...</p>
            </div>
        );
    }

    if (!chapter) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500 mb-4">Chapter not found.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
                >
                    ← Back
                </button>
            </div>
        );
    }

    if (!studyData || !studyData.material) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500 mb-4">Study material not available for this chapter yet.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
                >
                    ← Back
                </button>
            </div>
        );
    }

    const { material, videos, pointers, formulas, examples, practiceProblems } = studyData;

    const tabs: { id: Tab; label: string; icon: string }[] = [
        { id: 'videos', label: 'Videos', icon: '📹' },
        { id: 'notes', label: 'Notes', icon: '📝' },
        { id: 'keypoints', label: 'Key Points', icon: '💡' },
        { id: 'examples', label: 'Examples', icon: '📊' },
        { id: 'practice', label: 'Practice', icon: '✏️' },
    ];

    const getYouTubeEmbedUrl = (url: string) => {
        const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
        return `https://www.youtube.com/embed/${videoId}`;
    };

    const checkAnswer = (index: number, correctAnswer: string) => {
        const userAnswer = userAnswers[index]?.trim().toLowerCase();
        const correct = correctAnswer.toLowerCase();
        const isCorrect = userAnswer === correct || correctAnswer.toLowerCase().includes(userAnswer);

        setCheckedAnswers({ ...checkedAnswers, [index]: isCorrect });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <button
                    onClick={() => navigate(-1)}
                    className="text-primary hover:text-blue-600 mb-3 flex items-center gap-2"
                >
                    ← Back to Module
                </button>
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">📚 {chapter.name}</h1>
                    <p className="text-purple-100">Study Material & Practice</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex overflow-x-auto border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 min-w-[120px] px-4 py-3 font-medium transition ${activeTab === tab.id
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {/* Videos Tab */}
                    {activeTab === 'videos' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-secondary mb-4">Video Lessons</h2>
                            {videos && videos.length > 0 ? (
                                videos.map((video: any) => (
                                    <div key={video.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                                        <div className="aspect-video bg-black">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={getYouTubeEmbedUrl(video.url)}
                                                title={video.title}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="w-full h-full"
                                            ></iframe>
                                        </div>
                                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                                            <h3 className="font-bold text-lg text-secondary mb-2">{video.title}</h3>
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>📺 {video.channel}</span>
                                                <span>⏱️ {video.duration}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">No videos available yet.</p>
                            )}
                        </div>
                    )}

                    {/* Notes Tab */}
                    {activeTab === 'notes' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-secondary mb-4">Study Notes</h2>

                            {/* Brief Notes */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-6 rounded-xl shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-3xl">📌</span>
                                    <h3 className="font-bold text-xl text-blue-900">Quick Summary</h3>
                                </div>
                                <div className="prose prose-blue max-w-none">
                                    <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">{material.brief_notes}</p>
                                </div>
                            </div>

                            {/* Detailed Notes Toggle */}
                            <div className="text-center">
                                <button
                                    onClick={() => setShowDetailedNotes(!showDetailedNotes)}
                                    className="px-8 py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition shadow-lg text-lg"
                                >
                                    {showDetailedNotes ? '▲ Hide Detailed Notes' : '▼ Learn More (Detailed Explanation)'}
                                </button>
                            </div>

                            {/* Detailed Notes */}
                            {showDetailedNotes && (
                                <div className="bg-white border-2 border-gray-300 rounded-xl shadow-lg overflow-hidden">
                                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
                                        <h3 className="font-bold text-xl">📖 Detailed Explanation</h3>
                                    </div>
                                    <div className="p-8">
                                        <div
                                            className="prose prose-lg max-w-none prose-headings:text-secondary prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b-2 prose-h2:border-blue-200 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-blue-700"
                                            dangerouslySetInnerHTML={{ __html: material.detailed_notes }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Key Points Tab */}
                    {activeTab === 'keypoints' && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-secondary mb-4">💡 Key Pointers</h2>
                            {pointers && pointers.length > 0 ? (
                                <div className="space-y-3">
                                    {pointers.map((pointer: any) => (
                                        <div key={pointer.id} className="flex items-start gap-4 p-5 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-lg shadow-sm hover:shadow-md transition">
                                            <span className="text-3xl flex-shrink-0">💡</span>
                                            <p className="text-gray-800 text-lg flex-1 leading-relaxed">{pointer.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">No key pointers available yet.</p>
                            )}

                            {/* Formulas */}
                            {formulas && formulas.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-2xl font-bold text-secondary mb-4 flex items-center gap-2">
                                        <span>📐</span> Important Formulas
                                    </h3>
                                    <div className="space-y-3">
                                        {formulas.map((formula: any) => (
                                            <div key={formula.id} className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl shadow-sm">
                                                <code className="text-purple-900 font-mono text-lg block">{formula.formula}</code>
                                                {formula.description && <p className="text-gray-600 mt-2">{formula.description}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Examples Tab */}
                    {activeTab === 'examples' && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-secondary mb-4">📊 Solved Examples</h2>
                            {examples && examples.length > 0 ? (
                                examples.map((example: any, idx: number) => (
                                    <div key={example.id} className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition">
                                        <button
                                            onClick={() => setExpandedExample(expandedExample === idx ? null : idx)}
                                            className="w-full p-6 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 hover:from-green-100 hover:via-blue-100 hover:to-purple-100 transition text-left"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">📝</span>
                                                    <h3 className="font-bold text-xl text-secondary">Example {idx + 1}</h3>
                                                </div>
                                                <span className="text-3xl text-primary">{expandedExample === idx ? '▼' : '▶'}</span>
                                            </div>
                                            <p className="text-gray-800 mt-3 text-lg font-medium">{example.problem}</p>
                                        </button>

                                        {expandedExample === idx && (
                                            <div className="p-6 bg-white border-t-2 border-gray-200 space-y-4">
                                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-5 rounded-lg">
                                                    <p className="text-sm font-bold text-green-800 mb-2 flex items-center gap-2">
                                                        <span>✓</span> Solution:
                                                    </p>
                                                    <p className="text-gray-900 font-mono text-lg">{example.solution}</p>
                                                </div>
                                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-5 rounded-lg">
                                                    <p className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                                                        <span>💭</span> Explanation:
                                                    </p>
                                                    <p className="text-gray-800 text-base leading-relaxed">{example.explanation}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">No examples available yet.</p>
                            )}
                        </div>
                    )}

                    {/* Practice Tab */}
                    {activeTab === 'practice' && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-secondary mb-4">✏️ Practice Problems</h2>
                            <p className="text-gray-600 mb-6 text-lg">Try solving these problems to test your understanding!</p>

                            {practiceProblems && practiceProblems.length > 0 ? (
                                practiceProblems.map((problem: any, idx: number) => (
                                    <div key={problem.id} className="border-2 border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-bold text-xl text-secondary">Problem {idx + 1}</h3>
                                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700 border-2 border-green-300' :
                                                problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300' :
                                                    'bg-red-100 text-red-700 border-2 border-red-300'
                                                }`}>
                                                {problem.difficulty}
                                            </span>
                                        </div>

                                        <p className="text-gray-800 mb-5 text-lg leading-relaxed">{problem.question}</p>

                                        {problem.hint && (
                                            <div className="mb-4">
                                                <button
                                                    onClick={() => setShowHints({ ...showHints, [idx]: !showHints[idx] })}
                                                    className="text-sm text-yellow-700 hover:text-yellow-800 font-medium flex items-center gap-2"
                                                >
                                                    <span>💡</span> {showHints[idx] ? 'Hide Hint' : 'Show Hint'}
                                                </button>
                                                {showHints[idx] && (
                                                    <div className="mt-2 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                                                        <p className="text-sm text-yellow-900">{problem.hint}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                placeholder="Your answer..."
                                                value={userAnswers[idx] || ''}
                                                onChange={(e) => {
                                                    setUserAnswers({ ...userAnswers, [idx]: e.target.value });
                                                    if (checkedAnswers[idx] !== undefined) {
                                                        const newChecked = { ...checkedAnswers };
                                                        delete newChecked[idx];
                                                        setCheckedAnswers(newChecked);
                                                    }
                                                }}
                                                className="flex-1 p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary text-lg"
                                            />
                                            <button
                                                onClick={() => checkAnswer(idx, problem.answer)}
                                                className="px-8 py-4 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition shadow-md text-lg"
                                            >
                                                Check
                                            </button>
                                        </div>

                                        {checkedAnswers[idx] !== undefined && (
                                            <div className={`mt-4 p-5 rounded-lg border-2 ${checkedAnswers[idx] ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'
                                                }`}>
                                                <p className={`font-bold text-lg mb-2 ${checkedAnswers[idx] ? 'text-green-800' : 'text-red-800'}`}>
                                                    {checkedAnswers[idx] ? '✓ Correct! Well done!' : '✗ Incorrect'}
                                                </p>
                                                {!checkedAnswers[idx] && (
                                                    <>
                                                        {problem.explanation && (
                                                            <div className="mt-3 p-4 bg-red-100 rounded-lg border-l-4 border-red-600">
                                                                <p className="text-sm font-bold text-red-900 mb-2">📖 Explanation:</p>
                                                                <p className="text-red-800">{problem.explanation}</p>
                                                            </div>
                                                        )}
                                                        <div className="mt-3 p-4 bg-blue-100 rounded-lg border-l-4 border-blue-600">
                                                            <p className="text-sm font-bold text-blue-900 mb-2">✓ Correct Answer:</p>
                                                            <p className="text-blue-900 font-mono text-lg">{problem.answer}</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">No practice problems available yet.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={() => navigate(`/skip-test/${chapterId}`)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition shadow-lg text-lg"
                >
                    ⚡ Take Skip Test
                </button>
                <button
                    onClick={handleMarkStudied}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition shadow-lg text-lg"
                >
                    ✓ Mark as Studied
                </button>
            </div>
        </div>
    );
}
