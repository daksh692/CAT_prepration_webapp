import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ModuleDetail() {
    const { moduleId } = useParams<{ moduleId: string }>();
    const navigate = useNavigate();
    const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
    const [module, setModule] = useState<any>(null);
    const [chapters, setChapters] = useState<any[]>([]);
    const [chaptersWithMaterials, setChaptersWithMaterials] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!moduleId) return;

            try {
                setLoading(true);
                // Fetch module and chapters in parallel
                const [moduleData, chaptersData, materialsChapters] = await Promise.all([
                    api.getModuleById(Number(moduleId)),
                    api.getChaptersByModule(Number(moduleId)),
                    api.getChaptersWithMaterials()
                ]);

                setModule(moduleData);
                setChapters(chaptersData);

                // Create set of chapter IDs that have materials
                const materialsSet = new Set(materialsChapters.map((ch: any) => ch.id));
                setChaptersWithMaterials(materialsSet);
            } catch (error) {
                console.error('Error fetching module data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [moduleId]);

    const handleChapterComplete = async (chapterId: number, completed: boolean) => {
        try {
            await api.updateChapter(chapterId, {
                completed,
                completed_at: completed ? Date.now() : null,
            });

            // Update local state
            setChapters(chapters.map(ch =>
                ch.id === chapterId ? { ...ch, completed } : ch
            ));
        } catch (error) {
            console.error('Error updating chapter:', error);
        }
    };

    const handleSkipTest = (chapterId: number) => {
        navigate(`/skip-test/${chapterId}`);
    };

    const handleStudyMaterial = (chapterId: number) => {
        navigate(`/study-material/${chapterId}`);
    };

    const hasStudyMaterial = (chapterId: number) => {
        return chaptersWithMaterials.has(chapterId);
    };

    const getStatusIcon = (chapter: any) => {
        if (chapter.skipped) return '⚡';
        if (chapter.completed) return '✅';
        return '⭕';
    };

    const getStatusText = (chapter: any) => {
        if (chapter.skipped) return 'Skipped';
        if (chapter.completed) return 'Completed';
        return 'Not Started';
    };

    const getStatusColor = (chapter: any) => {
        if (chapter.skipped) return 'text-purple-600 bg-purple-50 border-purple-200';
        if (chapter.completed) return 'text-green-600 bg-green-50 border-green-200';
        return 'text-gray-600 bg-gray-50 border-gray-200';
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-100 text-green-700';
            case 'Medium': return 'bg-yellow-100 text-yellow-700';
            case 'Hard': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="text-center py-20">
                <p className="text-6xl mb-4">⏳</p>
                <p className="text-gray-500">Loading module...</p>
            </div>
        );
    }

    if (!module) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500">Module not found</p>
                <button
                    onClick={() => navigate('/syllabus')}
                    className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
                >
                    Back to Syllabus
                </button>
            </div>
        );
    }

    const completedCount = chapters?.filter(c => c.completed || c.skipped).length || 0;
    const totalCount = chapters?.length || 0;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <button
                    onClick={() => navigate('/syllabus')}
                    className="text-primary hover:text-blue-600 mb-3 flex items-center gap-2"
                >
                    ← Back to Syllabus
                </button>
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{module.name}</h1>
                            <div className="flex gap-3 text-sm">
                                <span className="bg-white/20 px-3 py-1 rounded-full">{module.section}</span>
                                <span className="bg-white/20 px-3 py-1 rounded-full">{module.phase}</span>
                                <span className="bg-white/20 px-3 py-1 rounded-full">{module.estimated_hours}hrs</span>
                            </div>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${module.priority === 'High' ? 'bg-red-500' :
                            module.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}>
                            {module.priority} Priority
                        </span>
                    </div>
                </div>
            </div>

            {/* Progress */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-bold text-secondary">Progress</h2>
                    <span className="text-sm text-gray-500">
                        {completedCount} / {totalCount} chapters
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                        className="bg-primary h-4 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p className="text-center mt-2 text-sm font-medium text-gray-600">{progress}%</p>
            </div>

            {/* Chapters */}
            <div className="space-y-3">
                <h2 className="text-xl font-bold text-secondary">Chapters</h2>

                {!chapters || chapters.length === 0 ? (
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
                        <p className="text-gray-500 mb-2">No chapters available yet</p>
                        <p className="text-sm text-gray-400">Chapters will be added soon for this module</p>
                    </div>
                ) : (
                    chapters.map((chapter) => {
                        // Parse topics if they're stored as JSON string
                        const topics = typeof chapter.topics === 'string'
                            ? JSON.parse(chapter.topics)
                            : chapter.topics;

                        return (
                            <div
                                key={chapter.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                            >
                                {/* Chapter Header */}
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-2xl">{getStatusIcon(chapter)}</span>
                                                <h3 className="text-lg font-semibold text-secondary">{chapter.name}</h3>
                                                {hasStudyMaterial(chapter.id!) && (
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                                        📚 Study Material
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-2 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(chapter.difficulty)}`}>
                                                    {chapter.difficulty}
                                                </span>
                                                <span className="text-gray-500">{chapter.estimated_hours}hrs</span>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(chapter)}`}>
                                            {getStatusText(chapter)}
                                        </span>
                                    </div>

                                    {/* Topics Preview */}
                                    {topics && topics.length > 0 && (
                                        <div className="mb-3">
                                            <button
                                                onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id!)}
                                                className="text-sm text-primary hover:text-blue-600 font-medium"
                                            >
                                                {expandedChapter === chapter.id ? '▼' : '▶'} Topics ({topics.length})
                                            </button>
                                            {expandedChapter === chapter.id && (
                                                <div className="mt-2 pl-4 space-y-1">
                                                    {topics.map((topic: string, idx: number) => (
                                                        <p key={idx} className="text-sm text-gray-600">• {topic}</p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 flex-wrap">
                                        {/* Study Material - Always available if exists */}
                                        {hasStudyMaterial(chapter.id!) && (
                                            <button
                                                onClick={() => handleStudyMaterial(chapter.id!)}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition"
                                            >
                                                📚 Study Material
                                            </button>
                                        )}

                                        {/* Skip Test - Always available for retaking */}
                                        <button
                                            onClick={() => handleSkipTest(chapter.id!)}
                                            className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition"
                                        >
                                            ⚡ {chapter.skipped || chapter.completed ? 'Retake' : 'Take'} Skip Test
                                        </button>

                                        {/* Mark Complete/Incomplete */}
                                        {!chapter.completed && !chapter.skipped ? (
                                            <button
                                                onClick={() => handleChapterComplete(chapter.id!, true)}
                                                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition"
                                            >
                                                ✓ Mark Complete
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleChapterComplete(chapter.id!, false)}
                                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
                                            >
                                                ↺ Mark Incomplete
                                            </button>
                                        )}
                                    </div>

                                    {/* Skip Test Score */}
                                    {chapter.skipped && chapter.skip_test_score && (
                                        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                            <p className="text-sm text-purple-700">
                                                <strong>Skip Test Score:</strong> {chapter.skip_test_score}%
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
