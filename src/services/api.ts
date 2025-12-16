// API Configuration
// API Configuration
// in production use relative path /api (Vercel functions), in dev use localhost:5000
const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

// API Service - Centralized API calls
class ApiService {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        // Get token from localStorage
        const token = localStorage.getItem('token');
        const authHeaders: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders,
                    ...options?.headers,
                },
            });

            // Handle 401 Unauthorized - token expired or invalid
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                throw new Error('Unauthorized - please login again');
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Request failed' }));
                throw new Error(error.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // ==================== MODULES ====================

    async getAllModules() {
        return this.request<any[]>('/modules');
    }

    async getModuleById(id: number) {
        return this.request<any>(`/modules/${id}`);
    }

    async getModulesBySection(section: 'VARC' | 'DILR' | 'QA') {
        return this.request<any[]>(`/modules/section/${section}`);
    }

    // ==================== CHAPTERS ====================

    async getAllChapters() {
        return this.request<any[]>('/chapters');
    }

    async getChapterById(id: number) {
        return this.request<any>(`/chapters/${id}`);
    }

    async getChaptersByModule(moduleId: number) {
        return this.request<any[]>(`/chapters/module/${moduleId}`);
    }

    async getChapterByName(name: string) {
        return this.request<any>(`/chapters/name/${encodeURIComponent(name)}`);
    }

    async updateChapter(id: number, updates: any) {
        return this.request(`/chapters/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }

    // ==================== STUDY MATERIALS ====================

    async getChapterStudyMaterials(chapterId: number) {
        return this.request<any>(`/study/chapter/${chapterId}`);
    }

    async getSkipTestQuestions(chapterId: number) {
        return this.request<any[]>(`/study/skip-test/${chapterId}`);
    }

    async getChaptersWithMaterials() {
        return this.request<any[]>('/study/chapters-with-materials');
    }

    // ==================== DASHBOARD ====================

    // Streak
    async getStreak() {
        return this.request<any>('/dashboard/streak');
    }

    async updateStreak() {
        return this.request<any>('/dashboard/streak/update', { method: 'POST' });
    }

    // Today's stats
    async getTodayStats() {
        return this.request<any>('/dashboard/today');
    }

    // Study session
    async recordStudySession(data: { chapter_id?: number; duration: number; questions_completed: number }) {
        return this.request<any>('/dashboard/session', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Settings
    async getUserSettings() {
        return this.request<any>('/dashboard/settings');
    }

    async updateUserSettings(settings: { daily_goal_minutes?: number; daily_goal_questions?: number; exam_date?: string }) {
        return this.request<any>('/dashboard/settings', {
            method: 'PUT',
            body: JSON.stringify(settings),
        });
    }

    // ==================== STUDY SESSIONS ====================

    // Session history
    async getSessionHistory(days: number = 7) {
        return this.request<any>(`/study/sessions/history?days=${days}`);
    }

    // Today's sessions
    async getTodaySessions() {
        return this.request<any>('/study/sessions/today');
    }

    // Start session
    async startSession(chapterId: number, studyMode: 'website' | 'external' = 'website') {
        return this.request<any>('/study/sessions/start', {
            method: 'POST',
            body: JSON.stringify({ chapter_id: chapterId, study_mode: studyMode }),
        });
    }

    // End session
    async endSession(data: { chapter_id?: number; duration: number; questions_completed: number; study_mode?: string }) {
        return this.request<any>('/study/sessions/end', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Weekly analytics
    async getWeeklyAnalytics() {
        return this.request<any>('/study/analytics/weekly');
    }

    // ==================== AUTHENTICATION ====================

    // Login
    async login(email: string, password: string) {
        return this.request<{ token: string; user: any; message: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    // Register
    async register(email: string, password: string, name: string) {
        return this.request<{ token: string; user: any; message: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        });
    }

    // Get current user
    async getCurrentUser() {
        return this.request<any>('/auth/me');
    }

    // Logout
    async logout() {
        return this.request<{ message: string }>('/auth/logout', {
            method: 'POST',
        });
    }

    // Create admin user (admin only)
    async createAdminUser(email: string, password: string, name: string) {
        return this.request<{ user: any; message: string }>('/auth/admin/create', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        });
    }

    // Update profile
    async updateProfile(data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }) {
        return this.request<{ user: any; message: string }>('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Get all users (admin only)
    async getAllUsers() {
        return this.request<{ users: any[] }>('/auth/admin/users');
    }

    // =================================
    // TEST RESULTS
    // =================================

    // Get test results
    async getTestResults(days: number = 30, testType?: 'website' | 'external') {
        const params = new URLSearchParams({ days: days.toString() });
        if (testType) params.append('test_type', testType);
        return this.request<{ results: any[]; summary: any }>(`/tests/results?${params}`);
    }

    // Record website test result
    async recordWebsiteTest(data: {
        chapter_id?: number;
        correct_mcq: number;
        incorrect_mcq: number;
        unattempted_mcq: number;
    }) {
        return this.request<{ message: string; marks: any }>('/tests/results/website', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Record external test result
    async recordExternalTest(data: {
        chapter_id?: number;
        section?: 'VARC' | 'DILR' | 'QA';  // Added section field
        correct_mcq: number;
        incorrect_mcq: number;
        correct_fitb?: number;
        incorrect_fitb?: number;
        is_checked?: boolean;
        notes?: string;
    }) {
        return this.request<{ message: string; marks: any }>('/tests/results/external', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Get test analytics
    async getTestAnalytics(days: number = 30) {
        return this.request<{ daily_data: any[]; subject_data: any[]; overall: any }>(`/tests/analytics?days=${days}`);
    }

    // Delete test result
    async deleteTestResult(id: number) {
        return this.request<{ message: string }>(`/tests/results/${id}`, {
            method: 'DELETE',
        });
    }

    // =================================
    // ANALYTICS & ACHIEVEMENTS
    // =================================

    // Get performance trends
    async getPerformanceTrends(days: number = 30) {
        return this.request<{ trends: any[] }>(`/analytics/trends?days=${days}`);
    }

    // Get subject-wise performance
    async getSubjectPerformance() {
        return this.request<{ subjects: any[] }>('/analytics/subjects');
    }

    // Get weak area analysis
    async getWeakAreas() {
        return this.request<{ overall_average: number; weak_areas: any[]; strong_areas: any[] }>('/analytics/weak-areas');
    }

    // Get achievements
    async getAchievements() {
        return this.request<{ achievements: any[] }>('/analytics/achievements');
    }

    // Check achievements (called after test completion)
    async checkAchievements() {
        return this.request<{ new_achievements: any[] }>('/analytics/check-achievements', {
            method: 'POST'
        });
    }

    // =================================
    // PHASE 2A - ADVANCED ANALYTICS
    // =================================

    // Get study heatmap data
    async getStudyHeatmap(days: number = 365) {
        return this.request<{ activity: any[] }>(`/analytics/heatmap?days=${days}`);
    }

    // Get topic-wise analytics
    async getTopicAnalytics() {
        return this.request<{ modules: any[]; overall_average: number; weak_chapters: any[] }>('/analytics/topics');
    }

    // Get CAT score prediction
    async getCATPredictor() {
        return this.request<{
            predicted_percentile: number;
            confidence: string;
            recent_average: number;
            overall_average: number;
            total_tests: number;
            section_averages: any;
        }>('/analytics/cat-predictor');
    }

    // =================================
    // PHASE 2C - FRIEND SYSTEM
    // =================================

    // Get my friend code
    async getMyFriendCode() {
        return this.request<{ code: string }>('/friends/my-code');
    }

    // Send friend request
    async sendFriendRequest(friendCode: string) {
        return this.request('/friends/request', {
            method: 'POST',
            body: JSON.stringify({ friendCode })
        });
    }

    // Get pending friend requests
    async getPendingRequests() {
        return this.request<{ requests: any[] }>('/friends/requests/pending');
    }

    // Accept friend request
    async acceptFriendRequest(requestId: number) {
        return this.request(`/friends/requests/${requestId}/accept`, {
            method: 'POST'
        });
    }

    // Reject friend request
    async rejectFriendRequest(requestId: number) {
        return this.request(`/friends/requests/${requestId}/reject`, {
            method: 'POST'
        });
    }

    //Get friends list
    async getFriends() {
        return this.request<{ friends: any[] }>('/friends');
    }

    // Get friend analytics
    async getFriendAnalytics(friendId: number) {
        return this.request<{
            friend: { name: string; current_streak: number; longest_streak: number };
            overall: { total_tests: number; avg_score: string; best_score: string };
            subjects: any[];
            rank: { position: number; total_friends: number };
        }>(`/friends/${friendId}/analytics`);
    }

    // Remove friend
    async removeFriend(friendId: number) {
        return this.request(`/friends/${friendId}`, {
            method: 'DELETE'
        });
    }

    // =================================
    // PHASE 2C - LEADERBOARDS
    // =================================

    // Get public leaderboard
    async getPublicLeaderboard(section: string | null = null) {
        const url = section ? `/leaderboard/public?section=${section}` : '/leaderboard/public';
        return this.request<{ leaderboard: any[] }>(url);
    }

    // Get friends leaderboard
    async getFriendsLeaderboard(section: string | null = null, sortBy: string = 'score') {
        let url = `/leaderboard/friends?sortBy=${sortBy}`;
        if (section) url += `&section=${section}`;
        return this.request<{ leaderboard: any[] }>(url);
    }

    // Toggle public leaderboard visibility
    async togglePublicLeaderboard(show: boolean) {
        return this.request('/leaderboard/public/toggle', {
            method: 'POST',
            body: JSON.stringify({ show })
        });
    }
}

// Export singleton instance
export const api = new ApiService();
export default api;
