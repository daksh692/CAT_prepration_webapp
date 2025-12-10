import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface User {
    id: number;
    email: string;
    name: string;
    role: string;
    created_at: number;
    last_login: number | null;
}

export default function AdminProfile() {
    const { user, logout } = useAuth();
    const [activeSection, setActiveSection] = useState<'profile' | 'users' | 'create-admin'>('profile');

    // Profile settings state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Users list state
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Create admin state
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const [newAdminName, setNewAdminName] = useState('');
    const [creatingAdmin, setCreatingAdmin] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

    useEffect(() => {
        if (activeSection === 'users') {
            fetchUsers();
        }
    }, [activeSection]);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const response = await api.getAllUsers();
            setUsers(response.users);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to load users' });
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        // Validate password match
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

            // Update localStorage with new user data
            localStorage.setItem('user', JSON.stringify(response.user));

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // Reload page to update nav bar
            setTimeout(() => window.location.reload(), 1500);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        setCreatingAdmin(true);
        try {
            await api.createAdminUser(newAdminEmail, newAdminPassword, newAdminName);
            setMessage({ type: 'success', text: 'Admin user created successfully!' });
            setNewAdminEmail('');
            setNewAdminPassword('');
            setNewAdminName('');

            // Refresh users list if on that tab
            if (activeSection === 'users') {
                fetchUsers();
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to create admin' });
        } finally {
            setCreatingAdmin(false);
        }
    };

    const formatDate = (timestamp: number | null) => {
        if (!timestamp) return 'Never';
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                    <h1 className="text-3xl font-bold">⚙️ Admin Settings</h1>
                    <p className="text-purple-100 mt-2">Manage your profile and users</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        onClick={() => setActiveSection('profile')}
                        className={`flex-1 py-4 font-semibold transition ${activeSection === 'profile'
                            ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                            : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        👤 My Profile
                    </button>
                    <button
                        onClick={() => setActiveSection('users')}
                        className={`flex-1 py-4 font-semibold transition ${activeSection === 'users'
                            ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                            : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        👥 All Users
                    </button>
                    <button
                        onClick={() => setActiveSection('create-admin')}
                        className={`flex-1 py-4 font-semibold transition ${activeSection === 'create-admin'
                            ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                            : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        ➕ Create Admin
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Message Display */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Profile Settings */}
                    {activeSection === 'profile' && (
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Enter current password"
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
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Enter new password"
                                            minLength={6}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Confirm new password"
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
                                    className={`px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition ${saving ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Users List */}
                    {activeSection === 'users' && (
                        <div>
                            {loadingUsers ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                    <p className="mt-4 text-gray-600">Loading users...</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 border-b">
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Email
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Role
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Created
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Last Login
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {users.map((u) => (
                                                <tr key={u.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="font-medium text-gray-900">{u.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-gray-600">{u.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.role === 'admin'
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {u.role === 'admin' ? '🔐 Admin' : '👤 User'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {formatDate(u.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {formatDate(u.last_login)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {users.length === 0 && (
                                        <div className="text-center py-12 text-gray-500">
                                            No users found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Create Admin */}
                    {activeSection === 'create-admin' && (
                        <form onSubmit={handleCreateAdmin} className="max-w-lg mx-auto space-y-6">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                                    <span className="text-3xl">🔐</span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Create New Admin</h2>
                                <p className="text-gray-600 mt-2">Add another administrator to the system</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={newAdminName}
                                    onChange={(e) => setNewAdminName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={newAdminEmail}
                                    onChange={(e) => setNewAdminEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="admin@catprep.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={newAdminPassword}
                                    onChange={(e) => setNewAdminPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Min. 6 characters"
                                    minLength={6}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={creatingAdmin}
                                className={`w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition ${creatingAdmin ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {creatingAdmin ? 'Creating...' : 'Create Admin User'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
