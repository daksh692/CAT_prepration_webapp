# 🎓 CAT Preparation Web App

> **Your Ultimate Companion for CAT Exam Success** - A comprehensive, data-driven platform to ace the Common Admission Test

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?logo=mysql)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## ✨ Key Highlights

🎯 **Smart Analytics** • 🏆 **Gamification** • 📊 **Performance Tracking** • 📚 **Comprehensive Study Materials** • 🔐 **Secure Authentication** • 📱 **Responsive Design**

---

## 🚀 Features Overview

### 📚 **Study Management**
- **Comprehensive Syllabus** covering VARC, DILR, and QA sections
- **Modular Content** organized by subjects and chapters
- **Rich Study Materials**:
  - 📹 Video lectures
  - 📝 Detailed notes
  - 💡 Key pointers
  - 🧮 Formula sheets
  - 📖 Practice examples
- **Study Session Tracking** with real-time duration monitoring
- **Streak System** to maintain daily study consistency

### 🎯 **Practice & Testing**

#### Website Practice Tests
- **Auto-recorded results** - No manual entry needed!
- **Chapter-wise skip tests** to assess understanding
- **CAT marking system** (+3 for correct, -1 for wrong in MCQ)
- **Instant performance feedback**

#### External Material Logging
- **Manual test entry** for external mock tests
- **Section categorization** (VARC/DILR/QA)
- **MCQ and FITB support**
- **Notes and observations** for each test

### 📊 **Advanced Analytics Dashboard**

#### Phase 1 Analytics
- 📈 **Performance Trends Chart** - Visualize score progression over 30 days
- 🎯 **Subject-wise Comparison** - Bar charts comparing VARC, DILR, QA
- ⚠️ **Weak Area Identification** - AI-powered recommendations
- 💪 **Strength Analysis** - Celebrate your strong subjects
- 📚 **Self-Preparation Summary** - Detailed website vs external breakdown
- ℹ️ **CAT Marking Guide** - Always visible for reference

#### Phase 2A Advanced Features
- 🎯 **CAT Percentile Predictor**
  - Predict your likely CAT percentile
  - Confidence levels (High/Medium/Low)
  - Based on weighted recent performance
  - Section-wise score breakdown
  
- 📅 **Study Pattern Heatmap**
  - GitHub-style activity calendar
  - 90-day visual history
  - Color-coded intensity levels
  - Hover for detailed stats
  
- 📖 **Topic-wise Deep Dive**
  - Chapter-level performance analytics
  - Expandable module sections
  - Weakest chapters alert
  - Prioritized focus recommendations

### 🏆 **Gamification & Achievements**

Unlock **11 achievement badges** as you progress:

| Badge | Achievement | Icon |
|-------|------------|------|
| **First Step** | Complete your first test | 🎯 |
| **Week Warrior** | 7-day study streak | 🔥 |
| **Month Master** | 30-day study streak | 🔥 |
| **Beginner** | 10 tests completed | 📝 |
| **Intermediate** | 50 tests completed | 📝 |
| **Expert** | 100 tests completed | 📝 |
| **Good Score** | Achieve 80%+ on a test | ⭐ |
| **Excellent Score** | Achieve 90%+ on a test | ⭐ |
| **Century** | Solve 100 questions | 📚 |
| **Half Thousand** | Solve 500 questions | 📚 |
| **Thousand Club** | Solve 1000 questions | 📚 |

**Features:**
- ✅ Progress tracking for locked badges
- 🎉 Unlock notifications
- 📅 Achievement dates displayed
- 🎮 Visual progress bars

### 👥 **User Management**

#### For Students
- 📊 **Personalized Dashboard** with real-time stats
- ⚙️ **Profile Settings** - Set exam date and daily goals
- 📈 **Progress Tracking** - Monitor your preparation journey
- 🔒 **Secure Login** with JWT authentication

#### For Admins
- 📚 **Content Management** - Add/edit study materials
- 👤 **User Management** - View all registered students
- 🔐 **Admin Creation** - Controlled admin access
- 📊 **System Overview** - Monitor platform usage

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Beautiful data visualizations
- **React Router** - Client-side routing
- **Vite** - Lightning-fast build tool

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Relational database
- **JWT** - Secure authentication
- **bcrypt** - Password hashing

### Key Libraries
- `recharts` - Performance charts
- `axios` - HTTP client
- `date-fns` - Date utilities
- `react-router-dom` - Navigation

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ installed
- MySQL 8+ installed
- npm or yarn package manager

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/daksh692/CAT_prepration_webapp.git
cd CAT_prepration_webapp
```

### 2️⃣ Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 3️⃣ Database Setup

**Create MySQL Database:**
```sql
CREATE DATABASE catprep_db;
```

**Run Migrations:**
```bash
cd server
# Import each migration file in order:
# 1. create_users_table.sql
# 2. add_user_id_to_tables.sql
# 3. create_test_results_table.sql
# 4. add_analytics_fields.sql
```

### 4️⃣ Environment Configuration

**Create `server/.env`:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=catprep_db
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
```

### 5️⃣ Seed Database (Optional)
```bash
cd server
node seed/seed.js
```

### 6️⃣ Start the Application

**Terminal 1 - Backend:**
```bash
cd server
node index.js
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Access the app:** http://localhost:5173

---

## 👤 Default Accounts


### Student Account this will be a test email you can use this to browse around the website to track you own exam progress your register and login is recomended 
- **Email:** `student@catprep.com`
- **Password:** `student123`

---

## 📱 Application Structure

```
CATPrep-Web/
├── src/                          # Frontend source
│   ├── pages/                    # Page components
│   │   ├── Home.tsx             # Landing page
│   │   ├── Login.tsx            # Authentication
│   │   ├── Syllabus.tsx         # Module overview
│   │   ├── StudyMaterial.tsx    # Chapter content
│   │   ├── Study.tsx            # Study sessions
│   │   ├── Tests.tsx            # Analytics dashboard
│   │   ├── Profile.tsx          # User settings
│   │   └── AdminDashboard.tsx   # Admin panel
│   ├── components/              # Reusable components
│   ├── contexts/                # React contexts
│   ├── services/                # API services
│   └── main.tsx                 # Entry point
│
├── server/                       # Backend source
│   ├── routes/                  # API endpoints
│   │   ├── auth.js             # Authentication
│   │   ├── modules.js          # Syllabus data
│   │   ├── chapters.js         # Chapter content
│   │   ├── study.js            # Study sessions
│   │   ├── tests.js            # Test results
│   │   ├── analytics.js        # Advanced analytics
│   │   └── admin.js            # Admin operations
│   ├── middleware/              # Auth middleware
│   ├── migrations/              # Database schemas
│   ├── seed/                    # Sample data
│   └── index.js                 # Server entry
│
└── public/                       # Static assets
```

---

## 🎨 UI/UX Highlights

### Design Principles
- 🎨 **Modern Aesthetics** - Gradient cards, glassmorphism
- 📱 **Fully Responsive** - Mobile, tablet, desktop optimized
- 🌈 **Vibrant Color Palette** - Subject-coded (VARC=green, DILR=orange, QA=blue)
- ⚡ **Smooth Animations** - Hover effects, transitions
- 🎯 **Intuitive Navigation** - Clear user flows
- 📊 **Data Visualization** - Charts, heatmaps, progress bars

### Color Coding
- **VARC:** Green shades (🟢)
- **DILR:** Orange shades (🟠)
- **QA:** Blue shades (🔵)
- **Success:** Green
- **Warning:** Yellow/Orange
- **Error:** Red
- **Info:** Blue/Indigo

---

## 📊 Analytics Features Breakdown

### Overview Tab
1. Summary cards (Tests, Averages)
2. CAT Percentile Predictor
3. Study Pattern Heatmap
4. Topic-wise Deep Dive
5. Performance Trends Chart
6. Subject Comparison Chart
7. Self-Preparation Summary
8. Weak/Strong Areas

### Add Test Tab
- Section selector (VARC/DILR/QA)
- MCQ input (Correct/Incorrect)
- FITB input (optional)
- Real-time score preview
- Notes field

### Achievements Tab
- Badge grid display
- Progress indicators
- Unlock dates
- Visual differentiation

### History Tab
- Chronological test list
- Section badges
- Performance emojis
- Detailed statistics

---

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing (bcrypt)
- ✅ Protected API routes
- ✅ User-specific data isolation
- ✅ Role-based access control (Admin/Student)
- ✅ Secure session management

---

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Study
- `GET /api/modules` - Get all modules
- `GET /api/chapters/:moduleId` - Get module chapters
- `POST /api/study/session/start` - Start study session
- `POST /api/study/session/end` - End study session

### Tests
- `GET /api/tests/results` - Get test history
- `POST /api/tests/results/website` - Record website test
- `POST /api/tests/results/external` - Record external test

### Analytics
- `GET /api/analytics/trends` - Performance trends
- `GET /api/analytics/subjects` - Subject-wise stats
- `GET /api/analytics/weak-areas` - Weak area analysis
- `GET /api/analytics/achievements` - User badges
- `GET /api/analytics/heatmap` - Study heatmap data
- `GET /api/analytics/topics` - Topic-wise analytics
- `GET /api/analytics/cat-predictor` - CAT score prediction

---

## 🎯 Roadmap

### ✅ Completed (Phase 1 & 2A)
- Core study management
- Practice test system
- Basic & advanced analytics
- Achievement system
- CAT percentile predictor
- Study heatmap
- Topic-wise deep dive

### 🔄 In Progress (Phase 2B)
- Custom date range selector
- Interactive chart tooltips
- Enhanced data filtering

### 📋 Planned (Phase 2C)
- PDF report export
- Optional leaderboards
- Study pattern insights
- Mobile app version

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Developer

**Daksh**  
📧 Email: [dakshshah692@gmail.com)  
🔗 GitHub: [@daksh692](https://github.com/daksh692)

---

## 🙏 Acknowledgments

- **CAT Aspirants** - For inspiration and feedback
- **Open Source Community** - For amazing tools and libraries
- **Contributors** - For making this platform better

---

## 📸 Screenshots

_Coming soon! Screenshots of the application will be added here._

---

## 🎓 About CAT

The Common Admission Test (CAT) is a computer-based test for admission to top MBA programs in India. This application helps aspirants:

- 📚 Organize their study materials
- 📊 Track performance metrics
- 🎯 Identify weak areas
- 🏆 Stay motivated with gamification
- 📈 Predict exam readiness

---

<div align="center">

### ⭐ If you find this project helpful, please give it a star!

**Made with ❤️ for CAT Aspirants**

[Report Bug](https://github.com/daksh692/CAT_prepration_webapp/issues) • [Request Feature](https://github.com/daksh692/CAT_prepration_webapp/issues)

</div>
