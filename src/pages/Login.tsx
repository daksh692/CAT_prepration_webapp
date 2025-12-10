import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const { login, register } = useAuth();

    const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
    const [isRegister, setIsRegister] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegister) {
                // Register (only available for users)
                if (!name) {
                    setError('Name is required');
                    setLoading(false);
                    return;
                }
                await register(email, password, name);
            } else {
                // Login
                await login(email, password);
            }

            // Redirect to dashboard
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    // Pre-fill demo credentials when clicking on demo buttons
    const useDemoCredentials = (type: 'admin' | 'user') => {
        if (type === 'admin') {
            setEmail('admin@catprep.com');
            setPassword('admin123');
            setActiveTab('admin');
        } else {
            setEmail('student@catprep.com');
            setPassword('student123');
            setActiveTab('user');
        }
        setIsRegister(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <h1 className="text-3xl font-bold text-center">📚 CAT Prep Tracker</h1>
                    <p className="text-center text-blue-100 mt-2">
                        {isRegister ? 'Create your account' : 'Welcome back!'}
                    </p>
                </div>

                {/* Tab Selector (Login only) */}
                {!isRegister && (
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab('user')}
                            className={`flex-1 py-4 font-semibold transition ${activeTab === 'user'
                                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            👤 User Login
                        </button>
                        <button
                            onClick={() => setActiveTab('admin')}
                            className={`flex-1 py-4 font-semibold transition ${activeTab === 'admin'
                                    ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            🔐 Admin Login
                        </button>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {isRegister && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-bold text-white transition ${activeTab === 'admin'
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Login'}
                    </button>

                    {/* Demo Buttons */}
                    {!isRegister && (
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500 text-center">Quick Demo Login:</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => useDemoCredentials('user')}
                                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition"
                                >
                                    👤 Demo User
                                </button>
                                <button
                                    type="button"
                                    onClick={() => useDemoCredentials('admin')}
                                    className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition"
                                >
                                    🔐 Demo Admin
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Toggle Register/Login */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError('');
                                setEmail('');
                                setPassword('');
                                setName('');
                            }}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                            {isRegister ? 'Already have an account? Login' : 'New user? Create an account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
