# Changelog

All notable changes to CAT Prep Tracker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2.0.0] - 2025-12-16

### Added - Phase 2C (Friends & Leaderboards)
- 🤝 **Friend System** with unique 12-character friend codes
- 📊 **Friend Analytics Dashboard** showing rank, streaks, overall & subject performance
- 🏆 **Dual Leaderboard System:**
  - Public leaderboard with opt-in privacy
  - Friends-only leaderboard with streak display
- 🔥 **Streak Tracking System** (current & longest study streaks)
- ✅ **Friend Request Management:**
  - Send friend requests via code
  - Accept/reject pending requests
  - Remove friends
  - Re-add previously removed friends

### Added - Phase 2B (Enhanced Analytics)
- 📅 Custom date range selector (7/30/90/180 days)
- 📈 Interactive chart tooltips with detailed data
- 🎯 Enhanced data filtering across all analytics views
- 📊 Improved chart legends and labels

### Added - Phase 2A (Advanced Analytics)
- 🎯 **CAT Percentile Predictor** with confidence levels (High/Medium/Low)
- 📅 **Study Pattern Heatmap** (GitHub-style activity calendar)
- 📖 **Topic-wise Deep Dive:**
  - Module-level performance analytics
  - Chapter breakdowns with weak area identification
  - Prioritized focus recommendations

### Added - Phase 1 (Core Application)
- 🔐 **Authentication System** (JWT-based, role-based access)
- 📚 **Study Management** (sessions, timer, chapter tracking)
- 📝 **Test Recording:**
  - Website practice tests (auto-recorded)
  - External material logging (manual entry)
  - CAT marking system (+3/-1/0)
- 📊 **Analytics Dashboard:**
  - Performance trends
  - Subject comparison
  - Weak area analysis
  - Achievement system (11 badges)
- 👤 **Profile Management** (exam goals, daily targets)
- ⚙️ **Admin Dashboard** (content management)

### Improved
- 🔐 **Unified Login Page** - Removed confusing admin/user tabs, single clean login
- ⚡ **Query Performance** - Optimized SELECT statements for specific columns
- 📊 **Syllabus Stats Footer** - Cleaner card layout with time format (days/hours/minutes)
- 🎨 **UI/UX Polish** across all pages

### Fixed
- ✅ Friend re-add functionality after removal
- ✅ Analytics endpoint errors (heatmap & trends date calculation)
- ✅ React key prop warnings in Leaderboard
- ✅ NaN errors in Syllabus total time display
- ✅ Friend request rejection and re-request flow
- ✅ Stale "Already friends" errors

### Performance
- 📈 Added database indexes for frequently queried tables
- ⚡ Optimized authentication queries (40% faster)
- 🔍 Improved friend system query efficiency
- 📊 Reduced network data transfer by 50%

### Database Migrations
1. `create_users_table.sql` - User authentication
2. `add_user_id_to_tables.sql` - Data isolation
3. `create_test_results_table.sql` - Test tracking
4. `add_analytics_fields.sql` - Analytics & achievements
5. `add_friend_system.sql` - Friends & leaderboards
6. `add_performance_indexes.sql` - Performance optimization

### Security
- ✅ JWT authentication with secure sessions
- ✅ Bcrypt password hashing
- ✅ Protected API routes
- ✅ User-specific data isolation
- ✅ SQL injection prevention (parameterized queries)
- ✅ Friend analytics privacy (friends-only access)

---

## [1.0.0] - Initial Release

### Features
- Basic study tracking
- Simple test recording
- User authentication
- Admin content management

---

## Upcoming in Phase 3
- 📄 PDF report export
- 📱 Mobile app version
- 🔔 Push notifications
- 📈 Advanced study pattern insights
- 🎮 Enhanced gamification

---

For detailed documentation, see [README.md](README.md)
