const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// --- Achievements ---
const achievementSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  unlocked: { type: Boolean, default: false },
  unlocked_at: { type: Number, default: null },
  created_at: { type: Number, required: true }
});
const Achievement = mongoose.model('Achievement', achievementSchema);

// --- Chapters ---
const chapterSchema = new Schema({
  module_id: { type: Number, required: true },
  name: { type: String, required: true },
  topics: { type: [String], required: true },
  estimated_hours: { type: Number, default: 0 },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  completed: { type: Boolean, default: false },
  skipped: { type: Boolean, default: false },
  skip_test_score: { type: Number, default: null },
  completed_at: { type: Number, default: null },
  notes: { type: String, default: null },
  created_at: { type: Number, required: true }
});
const Chapter = mongoose.model('Chapter', chapterSchema);

// --- Friendships ---
const friendshipSchema = new Schema({
  user1_id: { type: Number, required: true },
  user2_id: { type: Number, required: true },
  created_at: { type: Number, required: true }
});
const Friendship = mongoose.model('Friendship', friendshipSchema);

// --- Friend Requests ---
const friendRequestSchema = new Schema({
  sender_id: { type: Number, required: true },
  receiver_id: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  created_at: { type: Number, required: true },
  updated_at: { type: Number, default: null }
});
const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

// --- Modules ---
const moduleSchema = new Schema({
  id: { type: Number }, // To retain MySQL numeric IDs
  name: { type: String, required: true, unique: true },
  section: { type: String, enum: ['VARC', 'DILR', 'QA'], required: true },
  phase: { type: String, enum: ['Foundation', 'Intermediate', 'Advanced', 'Final Prep'], required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  estimated_hours: { type: Number, default: 0 },
  order: { type: Number, required: true },
  created_at: { type: Number, required: true },
  updated_at: { type: Number, required: true }
});
const Module = mongoose.model('Module', moduleSchema);

// --- Skip Tests ---
const skipTestSchema = new Schema({
  chapter_id: { type: Number, required: true },
  questions: { type: Array, required: true },
  passing_score: { type: Number, default: 70 },
  attempts: { type: Number, default: 0 },
  best_score: { type: Number, default: null },
  passed: { type: Boolean, default: false },
  created_at: { type: Number, required: true }
});
const SkipTest = mongoose.model('SkipTest', skipTestSchema);

// --- Skip Test Questions ---
const skipTestQuestionSchema = new Schema({
  chapter_id: { type: Number, required: true },
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correct_answer: { type: Number, required: true },
  explanation: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  order: { type: Number, default: 0 }
});
const SkipTestQuestion = mongoose.model('SkipTestQuestion', skipTestQuestionSchema);

// --- Streaks ---
const streakSchema = new Schema({
  current_streak: { type: Number, default: 0 },
  longest_streak: { type: Number, default: 0 },
  last_study_date: { type: Date, default: null },
  streak_broken: { type: Boolean, default: false },
  penalty_active: { type: Boolean, default: false },
  penalty_type: { type: String, enum: ['auto', 'custom'], default: null },
  penalty_description: { type: String, default: null },
  penalty_completed: { type: Boolean, default: false },
  updated_at: { type: Number, required: true },
  user_id: { type: Number, default: 1 }
});
const Streak = mongoose.model('Streak', streakSchema);

// --- Study Examples ---
const studyExampleSchema = new Schema({
  chapter_id: { type: Number, required: true },
  problem: { type: String, required: true },
  solution: { type: String, required: true },
  explanation: { type: String, required: true },
  order: { type: Number, default: 0 }
});
const StudyExample = mongoose.model('StudyExample', studyExampleSchema);

// --- Study Formulas ---
const studyFormulaSchema = new Schema({
  chapter_id: { type: Number, required: true },
  formula: { type: String, required: true },
  description: { type: String, default: null },
  order: { type: Number, default: 0 }
});
const StudyFormula = mongoose.model('StudyFormula', studyFormulaSchema);

// --- Study Materials ---
const studyMaterialSchema = new Schema({
  chapter_id: { type: Number, required: true },
  brief_notes: { type: String, required: true },
  detailed_notes: { type: String, required: true },
  created_at: { type: Number, required: true },
  updated_at: { type: Number, required: true }
});
const StudyMaterial = mongoose.model('StudyMaterial', studyMaterialSchema);

// --- Study Pointers ---
const studyPointerSchema = new Schema({
  chapter_id: { type: Number, required: true },
  content: { type: String, required: true },
  order: { type: Number, default: 0 }
});
const StudyPointer = mongoose.model('StudyPointer', studyPointerSchema);

// --- Study Practice Problems ---
const studyPracticeProblemSchema = new Schema({
  chapter_id: { type: Number, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  hint: { type: String, default: null },
  explanation: { type: String, default: null },
  order: { type: Number, default: 0 }
});
const StudyPracticeProblem = mongoose.model('StudyPracticeProblem', studyPracticeProblemSchema);

// --- Study Sessions ---
const studySessionSchema = new Schema({
  date: { type: Date, required: true },
  chapter_id: { type: Number, default: null },
  duration: { type: Number, required: true },
  questions_completed: { type: Number, default: 0 },
  goal_met: { type: Boolean, default: false },
  created_at: { type: Number, required: true },
  user_id: { type: Number, default: 1 }
});
const StudySession = mongoose.model('StudySession', studySessionSchema);

// --- Study Videos ---
const studyVideoSchema = new Schema({
  chapter_id: { type: Number, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  duration: { type: String, required: true },
  channel: { type: String, required: true },
  order: { type: Number, default: 0 }
});
const StudyVideo = mongoose.model('StudyVideo', studyVideoSchema);

// --- Test Results ---
const testResultSchema = new Schema({
  user_id: { type: Number, required: true },
  test_date: { type: Date, required: true },
  test_type: { type: String, enum: ['website', 'external'], default: 'website' },
  chapter_id: { type: Number, default: null },
  total_questions: { type: Number, default: 0 },
  correct_mcq: { type: Number, default: 0 },
  incorrect_mcq: { type: Number, default: 0 },
  unattempted_mcq: { type: Number, default: 0 },
  correct_mcq_external: { type: Number, default: 0 },
  incorrect_mcq_external: { type: Number, default: 0 },
  correct_fitb: { type: Number, default: 0 },
  incorrect_fitb: { type: Number, default: 0 },
  total_marks: { type: Number, default: 0 },
  max_marks: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  is_checked: { type: Boolean, default: false },
  notes: { type: String, default: null },
  created_at: { type: Number, required: true },
  section: { type: String, enum: ['VARC', 'DILR', 'QA'], default: null }
});
const TestResult = mongoose.model('TestResult', testResultSchema);

// --- Users ---
const userSchema = new Schema({
  id: { type: Number },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  created_at: { type: Number, required: true },
  updated_at: { type: Number, required: true },
  last_login: { type: Number, default: null },
  friend_code: { type: String, unique: true, sparse: true },
  current_streak: { type: Number, default: 0 },
  longest_streak: { type: Number, default: 0 },
  last_study_date: { type: Date, default: null },
  show_on_public_leaderboard: { type: Boolean, default: false }
});
const User = mongoose.model('User', userSchema);

// --- User Achievements ---
const userAchievementSchema = new Schema({
  user_id: { type: Number, required: true },
  achievement_id: { type: String, required: true },
  unlocked_at: { type: Number, required: true },
  created_at: { type: Number, required: true }
});
const UserAchievement = mongoose.model('UserAchievement', userAchievementSchema);

// --- User Settings ---
const userSettingSchema = new Schema({
  daily_goal_minutes: { type: Number, default: 120 },
  exam_date: { type: Date, required: true },
  auto_assign_penalties: { type: Boolean, default: true },
  custom_penalties: { type: [String], required: true },
  updated_at: { type: Number, required: true },
  user_id: { type: Number, default: 1 }
});
const UserSetting = mongoose.model('UserSetting', userSettingSchema);

module.exports = {
  Achievement,
  Chapter,
  Friendship,
  FriendRequest,
  Module,
  SkipTest,
  SkipTestQuestion,
  Streak,
  StudyExample,
  StudyFormula,
  StudyMaterial,
  StudyPointer,
  StudyPracticeProblem,
  StudySession,
  StudyVideo,
  TestResult,
  User,
  UserAchievement,
  UserSetting
};
