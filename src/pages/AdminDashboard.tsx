import { useState, useEffect } from 'react';

interface Chapter {
    id: number;
    name: string;
    module_name: string;
    section: string;
    has_materials: boolean;
}

interface Video {
    id: number;
    title: string;
    url: string;
    duration: string;
    channel: string;
    order: number;
}

interface Pointer {
    id: number;
    content: string;
    order: number;
}

interface Formula {
    id: number;
    formula: string;
    description: string | null;
    order: number;
}

interface Example {
    id: number;
    problem: string;
    solution: string;
    explanation: string;
    order: number;
}

interface PracticeProblem {
    id: number;
    question: string;
    answer: string;
    difficulty: string;
    hint: string | null;
    explanation: string | null;
    order: number;
}

interface StudyMaterial {
    id?: number;
    brief_notes: string;
    detailed_notes: string;
}

interface StudyMaterials {
    material: StudyMaterial | null;
    videos: Video[];
    pointers: Pointer[];
    formulas: Formula[];
    examples: Example[];
    practiceProblems: PracticeProblem[];
}

export default function AdminDashboard() {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
    const [materials, setMaterials] = useState<StudyMaterials | null>(null);
    const [activeTab, setActiveTab] = useState<'videos' | 'notes' | 'pointers' | 'formulas' | 'examples' | 'practice'>('videos');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Video form state
    const [showVideoForm, setShowVideoForm] = useState(false);
    const [editingVideo, setEditingVideo] = useState<Video | null>(null);
    const [videoForm, setVideoForm] = useState({
        title: '',
        url: '',
        duration: '',
        channel: ''
    });

    // Notes form state
    const [notesForm, setNotesForm] = useState({
        brief_notes: '',
        detailed_notes: ''
    });

    // Pointer form state
    const [showPointerForm, setShowPointerForm] = useState(false);
    const [editingPointer, setEditingPointer] = useState<Pointer | null>(null);
    const [pointerForm, setPointerForm] = useState({ content: '' });

    // Formula form state
    const [showFormulaForm, setShowFormulaForm] = useState(false);
    const [editingFormula, setEditingFormula] = useState<Formula | null>(null);
    const [formulaForm, setFormulaForm] = useState({ formula: '', description: '' });

    // Example form state
    const [showExampleForm, setShowExampleForm] = useState(false);
    const [editingExample, setEditingExample] = useState<Example | null>(null);
    const [exampleForm, setExampleForm] = useState({ problem: '', solution: '', explanation: '' });

    // Practice problem form state
    const [showProblemForm, setShowProblemForm] = useState(false);
    const [editingProblem, setEditingProblem] = useState<PracticeProblem | null>(null);
    const [problemForm, setProblemForm] = useState({
        question: '',
        answer: '',
        difficulty: 'Easy',
        hint: '',
        explanation: ''
    });

    // Fetch all chapters
    useEffect(() => {
        fetchChapters();
    }, []);

    // Fetch materials when chapter is selected
    useEffect(() => {
        if (selectedChapterId) {
            fetchMaterials(selectedChapterId);
        }
    }, [selectedChapterId]);

    // Load notes when materials change
    useEffect(() => {
        if (materials?.material) {
            setNotesForm({
                brief_notes: materials.material.brief_notes || '',
                detailed_notes: materials.material.detailed_notes || ''
            });
        }
    }, [materials]);

    const fetchChapters = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/chapters');
            const data = await response.json();
            setChapters(data);
        } catch (error) {
            console.error('Error fetching chapters:', error);
        }
    };

    const fetchMaterials = async (chapterId: number) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/admin/chapters/${chapterId}/materials`);
            const data = await response.json();
            setMaterials(data);
        } catch (error) {
            console.error('Error fetching materials:', error);
        } finally {
            setLoading(false);
        }
    };

    // Video handlers
    const handleAddVideo = () => {
        setEditingVideo(null);
        setVideoForm({ title: '', url: '', duration: '', channel: '' });
        setShowVideoForm(true);
    };

    const handleEditVideo = (video: Video) => {
        setEditingVideo(video);
        setVideoForm({
            title: video.title,
            url: video.url,
            duration: video.duration,
            channel: video.channel
        });
        setShowVideoForm(true);
    };

    const handleSaveVideo = async () => {
        if (!selectedChapterId) return;

        setSaving(true);
        try {
            const videoData = {
                ...videoForm,
                order: editingVideo ? editingVideo.order : (materials?.videos.length || 0) + 1
            };

            if (editingVideo) {
                await fetch(`http://localhost:5000/api/admin/videos/${editingVideo.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(videoData)
                });
            } else {
                await fetch(`http://localhost:5000/api/admin/chapters/${selectedChapterId}/videos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(videoData)
                });
            }

            await fetchMaterials(selectedChapterId);
            setShowVideoForm(false);
            setVideoForm({ title: '', url: '', duration: '', channel: '' });
        } catch (error) {
            console.error('Error saving video:', error);
            alert('Failed to save video');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteVideo = async (videoId: number) => {
        if (!confirm('Are you sure you want to delete this video?')) return;

        try {
            await fetch(`http://localhost:5000/api/admin/videos/${videoId}`, {
                method: 'DELETE'
            });

            if (selectedChapterId) {
                await fetchMaterials(selectedChapterId);
            }
        } catch (error) {
            console.error('Error deleting video:', error);
            alert('Failed to delete video');
        }
    };

    // Notes handlers
    const handleSaveNotes = async () => {
        if (!selectedChapterId) return;

        setSaving(true);
        try {
            await fetch(`http://localhost:5000/api/admin/chapters/${selectedChapterId}/materials`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notesForm)
            });

            await fetchMaterials(selectedChapterId);
            alert('Notes saved successfully!');
        } catch (error) {
            console.error('Error saving notes:', error);
            alert('Failed to save notes');
        } finally {
            setSaving(false);
        }
    };

    // Pointer handlers
    const handleAddPointer = () => {
        setEditingPointer(null);
        setPointerForm({ content: '' });
        setShowPointerForm(true);
    };

    const handleEditPointer = (pointer: Pointer) => {
        setEditingPointer(pointer);
        setPointerForm({ content: pointer.content });
        setShowPointerForm(true);
    };

    const handleSavePointer = async () => {
        if (!selectedChapterId) return;

        setSaving(true);
        try {
            const pointerData = {
                ...pointerForm,
                order: editingPointer ? editingPointer.order : (materials?.pointers.length || 0) + 1
            };

            if (editingPointer) {
                await fetch(`http://localhost:5000/api/admin/pointers/${editingPointer.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pointerData)
                });
            } else {
                await fetch(`http://localhost:5000/api/admin/chapters/${selectedChapterId}/pointers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pointerData)
                });
            }

            await fetchMaterials(selectedChapterId);
            setShowPointerForm(false);
            setPointerForm({ content: '' });
        } catch (error) {
            console.error('Error saving pointer:', error);
            alert('Failed to save pointer');
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePointer = async (pointerId: number) => {
        if (!confirm('Are you sure you want to delete this pointer?')) return;

        try {
            await fetch(`http://localhost:5000/api/admin/pointers/${pointerId}`, {
                method: 'DELETE'
            });

            if (selectedChapterId) {
                await fetchMaterials(selectedChapterId);
            }
        } catch (error) {
            console.error('Error deleting pointer:', error);
            alert('Failed to delete pointer');
        }
    };

    // Formula handlers
    const handleAddFormula = () => {
        setEditingFormula(null);
        setFormulaForm({ formula: '', description: '' });
        setShowFormulaForm(true);
    };

    const handleEditFormula = (formula: Formula) => {
        setEditingFormula(formula);
        setFormulaForm({
            formula: formula.formula,
            description: formula.description || ''
        });
        setShowFormulaForm(true);
    };

    const handleSaveFormula = async () => {
        if (!selectedChapterId) return;

        setSaving(true);
        try {
            const formulaData = {
                ...formulaForm,
                order: editingFormula ? editingFormula.order : (materials?.formulas.length || 0) + 1
            };

            if (editingFormula) {
                await fetch(`http://localhost:5000/api/admin/formulas/${editingFormula.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formulaData)
                });
            } else {
                await fetch(`http://localhost:5000/api/admin/chapters/${selectedChapterId}/formulas`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formulaData)
                });
            }

            await fetchMaterials(selectedChapterId);
            setShowFormulaForm(false);
            setFormulaForm({ formula: '', description: '' });
        } catch (error) {
            console.error('Error saving formula:', error);
            alert('Failed to save formula');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteFormula = async (formulaId: number) => {
        if (!confirm('Are you sure you want to delete this formula?')) return;

        try {
            await fetch(`http://localhost:5000/api/admin/formulas/${formulaId}`, {
                method: 'DELETE'
            });

            if (selectedChapterId) {
                await fetchMaterials(selectedChapterId);
            }
        } catch (error) {
            console.error('Error deleting formula:', error);
            alert('Failed to delete formula');
        }
    };

    // Example handlers
    const handleAddExample = () => {
        setEditingExample(null);
        setExampleForm({ problem: '', solution: '', explanation: '' });
        setShowExampleForm(true);
    };

    const handleEditExample = (example: Example) => {
        setEditingExample(example);
        setExampleForm({
            problem: example.problem,
            solution: example.solution,
            explanation: example.explanation
        });
        setShowExampleForm(true);
    };

    const handleSaveExample = async () => {
        if (!selectedChapterId) return;

        setSaving(true);
        try {
            const exampleData = {
                ...exampleForm,
                order: editingExample ? editingExample.order : (materials?.examples.length || 0) + 1
            };

            if (editingExample) {
                await fetch(`http://localhost:5000/api/admin/examples/${editingExample.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(exampleData)
                });
            } else {
                await fetch(`http://localhost:5000/api/admin/chapters/${selectedChapterId}/examples`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(exampleData)
                });
            }

            await fetchMaterials(selectedChapterId);
            setShowExampleForm(false);
            setExampleForm({ problem: '', solution: '', explanation: '' });
        } catch (error) {
            console.error('Error saving example:', error);
            alert('Failed to save example');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteExample = async (exampleId: number) => {
        if (!confirm('Are you sure you want to delete this example?')) return;

        try {
            await fetch(`http://localhost:5000/api/admin/examples/${exampleId}`, {
                method: 'DELETE'
            });

            if (selectedChapterId) {
                await fetchMaterials(selectedChapterId);
            }
        } catch (error) {
            console.error('Error deleting example:', error);
            alert('Failed to delete example');
        }
    };

    // Practice problem handlers
    const handleAddProblem = () => {
        setEditingProblem(null);
        setProblemForm({
            question: '',
            answer: '',
            difficulty: 'Easy',
            hint: '',
            explanation: ''
        });
        setShowProblemForm(true);
    };

    const handleEditProblem = (problem: PracticeProblem) => {
        setEditingProblem(problem);
        setProblemForm({
            question: problem.question,
            answer: problem.answer,
            difficulty: problem.difficulty,
            hint: problem.hint || '',
            explanation: problem.explanation || ''
        });
        setShowProblemForm(true);
    };

    const handleSaveProblem = async () => {
        if (!selectedChapterId) return;

        setSaving(true);
        try {
            const problemData = {
                ...problemForm,
                order: editingProblem ? editingProblem.order : (materials?.practiceProblems.length || 0) + 1
            };

            if (editingProblem) {
                await fetch(`http://localhost:5000/api/admin/practice-problems/${editingProblem.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(problemData)
                });
            } else {
                await fetch(`http://localhost:5000/api/admin/chapters/${selectedChapterId}/practice-problems`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(problemData)
                });
            }

            await fetchMaterials(selectedChapterId);
            setShowProblemForm(false);
            setProblemForm({
                question: '',
                answer: '',
                difficulty: 'Easy',
                hint: '',
                explanation: ''
            });
        } catch (error) {
            console.error('Error saving practice problem:', error);
            alert('Failed to save practice problem');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProblem = async (problemId: number) => {
        if (!confirm('Are you sure you want to delete this practice problem?')) return;

        try {
            await fetch(`http://localhost:5000/api/admin/practice-problems/${problemId}`, {
                method: 'DELETE'
            });

            if (selectedChapterId) {
                await fetchMaterials(selectedChapterId);
            }
        } catch (error) {
            console.error('Error deleting practice problem:', error);
            alert('Failed to delete practice problem');
        }
    };

    const selectedChapter = chapters.find(c => c.id === selectedChapterId);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold mb-2">📚 Study Materials Admin</h1>
                <p className="text-indigo-100">Manage videos, notes, examples, and practice problems</p>
            </div>

            {/* Chapter Selector */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Chapter to Edit
                </label>
                <select
                    value={selectedChapterId || ''}
                    onChange={(e) => setSelectedChapterId(Number(e.target.value))}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                >
                    <option value="">-- Select a Chapter --</option>
                    {chapters.map(chapter => (
                        <option key={chapter.id} value={chapter.id}>
                            {chapter.section} → {chapter.module_name} → {chapter.name}
                            {chapter.has_materials ? ' ✓' : ' (No materials)'}
                        </option>
                    ))}
                </select>
            </div>

            {/* Content Area */}
            {selectedChapterId && materials && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    {/* Tabs */}
                    <div className="border-b border-gray-200 px-6">
                        <div className="flex gap-4 overflow-x-auto">
                            {[
                                { id: 'videos', label: '📹 Videos', count: materials.videos.length },
                                { id: 'notes', label: '📝 Notes', count: materials.material ? 1 : 0 },
                                { id: 'pointers', label: '🎯 Pointers', count: materials.pointers.length },
                                { id: 'formulas', label: '🧮 Formulas', count: materials.formulas.length },
                                { id: 'examples', label: '💡 Examples', count: materials.examples.length },
                                { id: 'practice', label: '✏️ Practice', count: materials.practiceProblems.length }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition ${activeTab === tab.id
                                            ? 'border-indigo-600 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab.label} ({tab.count})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {loading ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Loading...</p>
                            </div>
                        ) : (
                            <>
                                {/* Videos Tab */}
                                {activeTab === 'videos' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-xl font-bold text-gray-800">
                                                Videos for "{selectedChapter?.name}"
                                            </h2>
                                            <button
                                                onClick={handleAddVideo}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                                            >
                                                + Add Video
                                            </button>
                                        </div>

                                        {materials.videos.length === 0 ? (
                                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                                <p className="text-gray-500">No videos yet. Click "Add Video" to get started.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {materials.videos.map((video, index) => (
                                                    <div
                                                        key={video.id}
                                                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition"
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
                                                                    <h3 className="font-bold text-gray-800">{video.title}</h3>
                                                                </div>
                                                                <p className="text-sm text-gray-600">
                                                                    {video.channel} • {video.duration}
                                                                </p>
                                                                <p className="text-xs text-gray-400 mt-1 font-mono break-all">
                                                                    {video.url}
                                                                </p>
                                                            </div>
                                                            <div className="flex gap-2 ml-4">
                                                                <button
                                                                    onClick={() => handleEditVideo(video)}
                                                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded font-medium text-sm hover:bg-blue-200 transition"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteVideo(video.id)}
                                                                    className="px-3 py-1 bg-red-100 text-red-700 rounded font-medium text-sm hover:bg-red-200 transition"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Video Form Modal */}
                                        {showVideoForm && (
                                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                                <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl">
                                                    <h3 className="text-xl font-bold mb-4">
                                                        {editingVideo ? 'Edit Video' : 'Add New Video'}
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Title
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={videoForm.title}
                                                                onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                                                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                                                placeholder="e.g., Divisibility Rules Explained"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                YouTube URL
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={videoForm.url}
                                                                onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                                                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none font-mono text-sm"
                                                                placeholder="https://www.youtube.com/watch?v=..."
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Duration
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={videoForm.duration}
                                                                    onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                                                                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                                                    placeholder="e.g., 52:18"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Channel
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={videoForm.channel}
                                                                    onChange={(e) => setVideoForm({ ...videoForm, channel: e.target.value })}
                                                                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                                                    placeholder="e.g., MBA Wallah"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 mt-6">
                                                        <button
                                                            onClick={handleSaveVideo}
                                                            disabled={saving || !videoForm.title || !videoForm.url}
                                                            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {saving ? 'Saving...' : 'Save Video'}
                                                        </button>
                                                        <button
                                                            onClick={() => setShowVideoForm(false)}
                                                            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Notes Tab */}
                                {activeTab === 'notes' && (
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-bold text-gray-800">
                                            Notes for "{selectedChapter?.name}"
                                        </h2>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Brief Notes
                                            </label>
                                            <textarea
                                                value={notesForm.brief_notes}
                                                onChange={(e) => setNotesForm({ ...notesForm, brief_notes: e.target.value })}
                                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none font-mono text-sm"
                                                rows={6}
                                                placeholder="Enter brief notes (markdown supported)..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Detailed Notes (HTML)
                                            </label>
                                            <textarea
                                                value={notesForm.detailed_notes}
                                                onChange={(e) => setNotesForm({ ...notesForm, detailed_notes: e.target.value })}
                                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none font-mono text-sm"
                                                rows={12}
                                                placeholder="Enter detailed notes (HTML supported)..."
                                            />
                                        </div>

                                        <button
                                            onClick={handleSaveNotes}
                                            disabled={saving}
                                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                                        >
                                            {saving ? 'Saving...' : 'Save Notes'}
                                        </button>
                                    </div>
                                )}

                                {/* Pointers Tab */}
                                {activeTab === 'pointers' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-xl font-bold text-gray-800">
                                                Key Pointers for "{selectedChapter?.name}"
                                            </h2>
                                            <button
                                                onClick={handleAddPointer}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                                            >
                                                + Add Pointer
                                            </button>
                                        </div>

                                        {materials.pointers.length === 0 ? (
                                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                                <p className="text-gray-500">No pointers yet. Click "Add Pointer" to get started.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {materials.pointers.map((pointer, index) => (
                                                    <div
                                                        key={pointer.id}
                                                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition"
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-start gap-2">
                                                                    <span className="text-sm font-bold text-gray-500 mt-1">#{index + 1}</span>
                                                                    <p className="text-gray-800">{pointer.content}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2 ml-4">
                                                                <button
                                                                    onClick={() => handleEditPointer(pointer)}
                                                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded font-medium text-sm hover:bg-blue-200 transition"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeletePointer(pointer.id)}
                                                                    className="px-3 py-1 bg-red-100 text-red-700 rounded font-medium text-sm hover:bg-red-200 transition"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Pointer Form Modal */}
                                        {showPointerForm && (
                                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                                <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl">
                                                    <h3 className="text-xl font-bold mb-4">
                                                        {editingPointer ? 'Edit Pointer' : 'Add New Pointer'}
                                                    </h3>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Content
                                                        </label>
                                                        <textarea
                                                            value={pointerForm.content}
                                                            onChange={(e) => setPointerForm({ content: e.target.value })}
                                                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                                            rows={4}
                                                            placeholder="Enter key pointer..."
                                                        />
                                                    </div>
                                                    <div className="flex gap-3 mt-6">
                                                        <button
                                                            onClick={handleSavePointer}
                                                            disabled={saving || !pointerForm.content}
                                                            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {saving ? 'Saving...' : 'Save Pointer'}
                                                        </button>
                                                        <button
                                                            onClick={() => setShowPointerForm(false)}
                                                            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Formulas Tab */}
                                {activeTab === 'formulas' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-xl font-bold text-gray-800">
                                                Formulas for "{selectedChapter?.name}"
                                            </h2>
                                            <button
                                                onClick={handleAddFormula}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                                            >
                                                + Add Formula
                                            </button>
                                        </div>

                                        {materials.formulas.length === 0 ? (
                                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                                <p className="text-gray-500">No formulas yet. Click "Add Formula" to get started.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {materials.formulas.map((formula, index) => (
                                                    <div
                                                        key={formula.id}
                                                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition"
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
                                                                    <code className="font-mono text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                                                                        {formula.formula}
                                                                    </code>
                                                                </div>
                                                                {formula.description && (
                                                                    <p className="text-sm text-gray-600 ml-8">{formula.description}</p>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-2 ml-4">
                                                                <button
                                                                    onClick={() => handleEditFormula(formula)}
                                                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded font-medium text-sm hover:bg-blue-200 transition"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteFormula(formula.id)}
                                                                    className="px-3 py-1 bg-red-100 text-red-700 rounded font-medium text-sm hover:bg-red-200 transition"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Formula Form Modal */}
                                        {showFormulaForm && (
                                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                                <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl">
                                                    <h3 className="text-xl font-bold mb-4">
                                                        {editingFormula ? 'Edit Formula' : 'Add New Formula'}
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Formula
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={formulaForm.formula}
                                                                onChange={(e) => setFormulaForm({ ...formulaForm, formula: e.target.value })}
                                                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none font-mono"
                                                                placeholder="e.g., a² + b² = c²"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Description (Optional)
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={formulaForm.description}
                                                                onChange={(e) => setFormulaForm({ ...formulaForm, description: e.target.value })}
                                                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                                                placeholder="e.g., Pythagorean theorem"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 mt-6">
                                                        <button
                                                            onClick={handleSaveFormula}
                                                            disabled={saving || !formulaForm.formula}
                                                            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {saving ? 'Saving...' : 'Save Formula'}
                                                        </button>
                                                        <button
                                                            onClick={() => setShowFormulaForm(false)}
                                                            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Examples Tab */}
                                {activeTab === 'examples' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-xl font-bold text-gray-800">
                                                Examples for "{selectedChapter?.name}"
                                            </h2>
                                            <button
                                                onClick={handleAddExample}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                                            >
                                                + Add Example
                                            </button>
                                        </div>

                                        {materials.examples.length === 0 ? (
                                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                                <p className="text-gray-500">No examples yet. Click "Add Example" to get started.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {materials.examples.map((example, index) => (
                                                    <div
                                                        key={example.id}
                                                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition"
                                                    >
                                                        <div className="flex justify-between items-start mb-3">
                                                            <h3 className="font-bold text-gray-800">Example #{index + 1}</h3>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleEditExample(example)}
                                                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded font-medium text-sm hover:bg-blue-200 transition"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteExample(example.id)}
                                                                    className="px-3 py-1 bg-red-100 text-red-700 rounded font-medium text-sm hover:bg-red-200 transition"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 mb-1">Problem:</p>
                                                                <p className="text-gray-800">{example.problem}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 mb-1">Solution:</p>
                                                                <p className="text-gray-800">{example.solution}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 mb-1">Explanation:</p>
                                                                <p className="text-gray-600 text-sm">{example.explanation}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Example Form Modal */}
                                        {showExampleForm && (
                                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
                                                <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 my-8 shadow-2xl">
                                                    <h3 className="text-xl font-bold mb-4">
                                                        {editingExample ? 'Edit Example' : 'Add New Example'}
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Problem
                                                            </label>
                                                            <textarea
                                                                value={exampleForm.problem}
                                                                onChange={(e) => setExampleForm({ ...exampleForm, problem: e.target.value })}
                                                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                                                rows={3}
                                                                placeholder="Enter the problem statement..."
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Solution
                                                            </label>
                                                            <textarea
                                                                value={exampleForm.solution}
                                                                onChange={(e) => setExampleForm({ ...exampleForm, solution: e.target.value })}
                                                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                                                rows={3}
                                                                placeholder="Enter the solution..."
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Explanation
                                                            </label>
                                                            <textarea
                                                                value={exampleForm.explanation}
                                                                onChange={(e) => setExampleForm({ ...exampleForm, explanation: e.target.value })}
                                                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                                                rows={4}
                                                                placeholder="Explain the solution step by step..."
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 mt-6">
                                                        <button
                                                            onClick={handleSaveExample}
                                                            disabled={saving || !exampleForm.problem || !exampleForm.solution}
                                                            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {saving ? 'Saving...' : 'Save Example'}
                                                        </button>
                                                        <button
                                                            onClick={() => setShowExampleForm(false)}
                                                            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Practice Problems Tab */}
                                {activeTab === 'practice' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-xl font-bold text-gray-800">
                                                Practice Problems for "{selectedChapter?.name}"
                                            </h2>
                                            <button
                                                onClick={handleAddProblem}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                                            >
                                                + Add Problem
                                            </button>
                                        </div>

                                        {materials.practiceProblems.length === 0 ? (
                                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                                <p className="text-gray-500">No practice problems yet. Click "Add Problem" to get started.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {materials.practiceProblems.map((problem, index) => (
                                                    <div
                                                        key={problem.id}
                                                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition"
                                                    >
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-bold text-gray-800">Problem #{index + 1}</h3>
                                                                <span className={`px-2 py-1 rounded text-xs font-medium ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                                                        problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                            'bg-red-100 text-red-700'
                                                                    }`}>
                                                                    {problem.difficulty}
                                                                </span>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleEditProblem(problem)}
                                                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded font-medium text-sm hover:bg-blue-200 transition"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteProblem(problem.id)}
                                                                    className="px-3 py-1 bg-red-100 text-red-700 rounded font-medium text-sm hover:bg-red-200 transition"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 mb-1">Question:</p>
                                                                <p className="text-gray-800">{problem.question}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 mb-1">Answer:</p>
                                                                <p className="text-gray-800 font-medium">{problem.answer}</p>
                                                            </div>
                                                            {problem.hint && (
                                                                <div>
                                                                    <p className="text-xs font-semibold text-gray-500 mb-1">Hint:</p>
                                                                    <p className="text-gray-600 text-sm italic">{problem.hint}</p>
                                                                </div>
                                                            )}
                                                            {problem.explanation && (
                                                                <div>
                                                                    <p className="text-xs font-semibold text-gray-500 mb-1">Explanation:</p>
                                                                    <p className="text-gray-600 text-sm">{problem.explanation}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Practice Problem Form Modal */}
                                        {showProblemForm && (
                                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
                                                <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 my-8 shadow-2xl">
                                                    <h3 className="text-xl font-bold mb-4">
                                                        {editingProblem ? 'Edit Practice Problem' : 'Add New Practice Problem'}
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Question
                                                            </label>
                                                            <textarea
                                                                value={problemForm.question}
                                                                onChange={(e) => setProblemForm({ ...problemForm, question: e.target.value })}
                                                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                                                rows={3}
                                                                placeholder="Enter the question..."
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Answer
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={problemForm.answer}
                                                                    onChange={(e) => setProblemForm({ ...problemForm, answer: e.target.value })}
                                                                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                                                    placeholder="Enter the answer..."
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Difficulty
                                                                </label>
                                                                <select
                                                                    value={problemForm.difficulty}
                                                                    onChange={(e) => setProblemForm({ ...problemForm, difficulty: e.target.value })}
                                                                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                                                >
                                                                    <option value="Easy">Easy</option>
                                                                    <option value="Medium">Medium</option>
                                                                    <option value="Hard">Hard</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Hint (Optional)
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={problemForm.hint}
                                                                onChange={(e) => setProblemForm({ ...problemForm, hint: e.target.value })}
                                                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                                                placeholder="Enter a hint..."
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Explanation (Optional)
                                                            </label>
                                                            <textarea
                                                                value={problemForm.explanation}
                                                                onChange={(e) => setProblemForm({ ...problemForm, explanation: e.target.value })}
                                                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                                                rows={4}
                                                                placeholder="Explain the solution..."
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 mt-6">
                                                        <button
                                                            onClick={handleSaveProblem}
                                                            disabled={saving || !problemForm.question || !problemForm.answer}
                                                            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {saving ? 'Saving...' : 'Save Problem'}
                                                        </button>
                                                        <button
                                                            onClick={() => setShowProblemForm(false)}
                                                            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {!selectedChapterId && (
                <div className="text-center py-20 bg-gray-50 rounded-xl">
                    <p className="text-6xl mb-4">📚</p>
                    <p className="text-gray-500 text-lg">Select a chapter to start managing study materials</p>
                </div>
            )}
        </div>
    );
}
