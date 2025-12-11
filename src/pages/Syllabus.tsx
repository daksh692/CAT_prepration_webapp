import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

type Section = 'All' | 'VARC' | 'DILR' | 'QA';

export default function Syllabus() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState<Section>('All');
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchModules = async () => {
            try {
                setLoading(true);
                let data;
                if (activeSection === 'All') {
                    data = await api.getAllModules();
                } else {
                    data = await api.getModulesBySection(activeSection);
                }
                setModules(data);
                setError('');
            } catch (err) {
                console.error('Error fetching modules:', err);
                setError('Failed to load modules. Make sure the backend server is running.');
            } finally {
                setLoading(false);
            }
        };

        fetchModules();
    }, [activeSection]);

    const handleModuleClick = (moduleId: number) => {
        navigate(`/module/${moduleId}`);
    };

    const getPhaseColor = (phase: string) => {
        switch (phase) {
            case 'Foundation': return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'Intermediate': return 'bg-purple-100 text-purple-700 border-purple-300';
            case 'Advanced': return 'bg-orange-100 text-orange-700 border-orange-300';
            case 'Final Prep': return 'bg-red-100 text-red-700 border-red-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const getSectionIcon = (section: string) => {
        switch (section) {
            case 'VARC': return '📖';
            case 'DILR': return '🧩';
            case 'QA': return '🔢';
            default: return '📚';
        }
    };

    const sections: Section[] = ['All', 'VARC', 'DILR', 'QA'];

    // Group modules by phase
    const groupedModules = modules?.reduce((acc, module) => {
        if (!acc[module.phase]) {
            acc[module.phase] = [];
        }
        acc[module.phase].push(module);
        return acc;
    }, {} as Record<string, typeof modules>);

    const phaseOrder = ['Foundation', 'Intermediate', 'Advanced', 'Final Prep'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-secondary">📚 CAT Syllabus</h1>
            </div>

            {/* Section Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {sections.map((section) => (
                    <button
                        key={section}
                        onClick={() => setActiveSection(section)}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${activeSection === section
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {section !== 'All' && getSectionIcon(section)} {section}
                    </button>
                ))}
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                    <p className="text-sm mt-2">Make sure backend is running on http://localhost:5000</p>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="text-center py-20">
                    <p className="text-6xl mb-4">⏳</p>
                    <p className="text-gray-500">Loading modules...</p>
                </div>
            ) : !modules || modules.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-6xl mb-4">📚</p>
                    <p className="text-gray-500">No modules found.</p>
                    <p className="text-sm text-gray-400 mt-2">Make sure the database is seeded.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Modules grouped by phase */}
                    {phaseOrder.map((phase) => {
                        const phaseModules = groupedModules?.[phase];
                        if (!phaseModules || phaseModules.length === 0) return null;

                        return (
                            <div key={phase} className="space-y-3">
                                {/* Phase Header */}
                                <div className={`inline-block px-4 py-2 rounded-lg border-2 font-bold ${getPhaseColor(phase)}`}>
                                    {phase}
                                </div>

                                {/* Modules in this phase */}
                                <div className="grid gap-3 md:grid-cols-2">
                                    {phaseModules.map((module: any) => (
                                        <div
                                            key={module.id}
                                            onClick={() => handleModuleClick(module.id!)}
                                            className="bg-white p-5 rounded-xl shadow-sm border-l-4 hover:shadow-md transition cursor-pointer"
                                            style={{
                                                borderLeftColor:
                                                    module.priority === 'High' ? '#EA4335' :
                                                        module.priority === 'Medium' ? '#FBBC05' : '#34A853'
                                            }}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xl">{getSectionIcon(module.section)}</span>
                                                        <h3 className="text-lg font-semibold text-secondary">{module.name}</h3>
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        {module.section} • {module.estimated_hours}hrs
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${module.priority === 'High' ? 'bg-red-100 text-red-700' :
                                                    module.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                    {module.priority}
                                                </span>
                                            </div>

                                            {/* Progress placeholder */}
                                            <div className="mt-3">
                                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                    <span>0 / 0 chapters</span>
                                                    <span>0%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Stats Footer */}
            {modules && modules.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200 mt-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Course Overview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                            <div className="text-3xl mb-2">📚</div>
                            <p className="text-3xl font-bold text-blue-600 mb-1">{modules.length}</p>
                            <p className="text-sm font-medium text-gray-600">Total Modules</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                            <div className="text-3xl mb-2">⏱️</div>
                            <p className="text-3xl font-bold text-purple-600 mb-1">
                                {(() => {
                                    const totalHours = modules.reduce((sum, m) => sum + (Number(m.estimated_hours) || 0), 0);
                                    const days = Math.floor(totalHours / 24);
                                    const hours = Math.floor(totalHours % 24);
                                    const minutes = Math.round((totalHours % 1) * 60);
                                    return `${days}d ${hours}h ${minutes}m`;
                                })()}
                            </p>
                            <p className="text-sm font-medium text-gray-600">Total Time</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                            <div className="text-3xl mb-2">📖</div>
                            <p className="text-3xl font-bold text-green-600 mb-1">
                                {modules.filter(m => m.section === 'VARC').length}
                            </p>
                            <p className="text-sm font-medium text-gray-600">VARC Modules</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                            <div className="text-3xl mb-2">✅</div>
                            <p className="text-3xl font-bold text-orange-600 mb-1">0%</p>
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
