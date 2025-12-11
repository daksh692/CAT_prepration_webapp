import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import Syllabus from './pages/Syllabus';
import Study from './pages/Study';
import Tests from './pages/Tests.tsx';
import Profile from './pages/Profile';
import ModuleDetail from './pages/ModuleDetail';
import SkipTest from './pages/SkipTest';
import StudyMaterial from './pages/StudyMaterial';
import AdminDashboard from './pages/AdminDashboard';
import AdminProfile from './pages/AdminProfile';
import Friends from './pages/Friends';
import Leaderboard from './pages/Leaderboard';

function Navigation() {
  const location = useLocation();
  const { isAdmin, user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // Conditionally include Admin nav item based on user role
  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/syllabus', label: 'Syllabus', icon: '📚' },
    { path: '/study', label: 'Study', icon: '⏱️' },
    { path: '/tests', label: 'Tests', icon: '📝' },
    { path: '/friends', label: 'Friends', icon: '👥' },
    { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin', icon: '⚙️' }] : []),
    ...(isAdmin ? [{ path: '/admin/profile', label: 'Settings', icon: '🔧' }] : []),
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:top-0 md:bottom-auto z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Nav Items */}
          <div className="flex justify-around md:justify-start md:space-x-8 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-2 px-3 py-2 rounded-lg transition-colors ${isActive(item.path)
                  ? 'text-primary bg-blue-50'
                  : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                  }`}
              >
                <span className="text-xl md:text-base">{item.icon}</span>
                <span className="text-xs md:text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Info & Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user?.name} {isAdmin && <span className="text-purple-600 font-semibold">(Admin)</span>}
            </span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-background-light pb-20 md:pb-0 md:pt-16">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Public browsing (syllabus/modules) - no auth required */}
          <Route path="/syllabus" element={<Syllabus />} />
          <Route path="/module/:moduleId" element={<ModuleDetail />} />

          {/* Protected Routes - require authentication */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/study-material/:chapterId" element={
            <ProtectedRoute>
              <StudyMaterial />
            </ProtectedRoute>
          } />
          <Route path="/skip-test/:chapterId" element={
            <ProtectedRoute>
              <SkipTest />
            </ProtectedRoute>
          } />
          <Route path="/study" element={
            <ProtectedRoute>
              <Study />
            </ProtectedRoute>
          } />
          <Route path="/tests" element={
            <ProtectedRoute>
              <Tests />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Phase 2C: Friends & Leaderboard */}
          <Route path="/friends" element={
            <ProtectedRoute>
              <Friends />
            </ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          } />

          {/* Admin Only Route */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/profile" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminProfile />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
