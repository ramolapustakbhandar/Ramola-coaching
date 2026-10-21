/**
 * Ramola Coaching Centre - Types & Domain Models
 * Learn • Practice • Improve
 */

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'TEACHER'
  | 'STUDENT'
  | 'PARENT'
  | 'ACCOUNTANT'
  | 'COUNSELLOR';

export type AccessStatus = 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'REVOKED' | 'PENDING';

export type ContentType =
  | 'YOUTUBE_VIDEO'
  | 'DRIVE_DOC'
  | 'PDF'
  | 'WORKSHEET'
  | 'QUESTION_PAPER'
  | 'SOLUTION'
  | 'EXTERNAL_LINK';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';

export type DoubtStatus = 'OPEN' | 'IN_PROGRESS' | 'ANSWERED' | 'RESOLVED';

export type PaymentMethod = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'OTHER';

export type TestType = 'OFFLINE' | 'ONLINE_MCQ';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  status: AccessStatus;
  createdAt: string;
}

export interface TeacherAssignment {
  id: string;
  teacherId: string;
  courseId: string;
  courseName: string;
  batchId?: string;
  batchName?: string;
  subjectId?: string;
  subjectName?: string;
}

export interface TeacherProfile extends UserProfile {
  qualification?: string;
  bio?: string;
  specializations: string[];
  permissions: Record<string, boolean>;
  assignments: TeacherAssignment[];
}

export interface StudentProfile extends UserProfile {
  rollNumber: string;
  schoolName?: string;
  targetExam?: string;
  currentLevel?: string;
  guardianName?: string;
  guardianPhone?: string;
  parentId?: string;
  enrolledCourseIds: string[];
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  category: 'ACADEMIC' | 'COMPETITIVE' | 'GRADUATION' | 'SPECIAL';
  level: string; // e.g. "Class 9-10", "Class 11-12", "JEE", "BSc/BTech"
  duration: string;
  fee: number;
  startDate?: string;
  endDate?: string;
  status: 'ACTIVE' | 'UPCOMING' | 'ARCHIVED';
  thumbnail?: string;
  assignedTeacherIds?: string[];
  subjects?: Subject[];
}

export interface Batch {
  id: string;
  courseId: string;
  courseName?: string;
  name: string;
  timing: string;
  roomOrLink: string;
  maxStudents: number;
  status: 'ACTIVE' | 'FULL' | 'COMPLETED';
}

export interface Subject {
  id: string;
  courseId: string;
  name: string;
  code?: string;
  orderIndex: number;
  chapters?: Chapter[];
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  chapterNumber: number;
  description?: string;
  orderIndex: number;
  topics?: Topic[];
}

export interface Topic {
  id: string;
  chapterId: string;
  name: string;
  topicNumber: number;
  description?: string;
  orderIndex: number;
}

export interface CourseContent {
  id: string;
  courseId: string;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  teacherId?: string;
  teacherName?: string;
  title: string;
  description?: string;
  contentType: ContentType;
  url: string;
  externalId?: string; // YouTube Video ID or Drive ID
  isFree: boolean;
  isPublished: boolean;
  durationMinutes?: number;
  orderIndex: number;
  createdAt: string;
}

export interface MistakeCategory {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  orderIndex: number;
}

export interface QuestionLevelResult {
  questionNumber: number;
  status: 'CORRECT' | 'INCORRECT' | 'UNATTEMPTED';
  mistakeCategoryId?: string;
  mistakeCategoryName?: string;
  note?: string;
}

export interface OfflineTestResult {
  id: string;
  testId: string;
  testTitle: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  courseId: string;
  courseName: string;
  enteredBy: string;
  testDate: string;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  teacherRemarks?: string;
  mistakeCounts: Record<string, number>; // CategoryName -> Count
  questionBreakdown?: QuestionLevelResult[];
  createdAt: string;
}

export interface TestQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  questionType: 'MCQ' | 'TRUE_FALSE' | 'NUMERICAL';
  options: string[];
  correctAnswer: string;
  marks: number;
  explanation?: string;
}

export interface OnlineTest {
  id: string;
  courseId: string;
  courseName: string;
  subjectId?: string;
  chapterId?: string;
  title: string;
  testType: TestType;
  durationMinutes: number;
  maxMarks: number;
  passMarks: number;
  isPublished: boolean;
  isFree: boolean;
  instructions?: string;
  questions: TestQuestion[];
  createdAt: string;
}

export interface TestAttempt {
  id: string;
  testId: string;
  testTitle: string;
  studentId: string;
  studentName: string;
  score: number;
  maxMarks: number;
  percentage: number;
  passed: boolean;
  answers: Record<string, string>; // questionId -> selectedOption
  startedAt: string;
  completedAt: string;
}

export interface Homework {
  id: string;
  courseId: string;
  courseName: string;
  subjectId?: string;
  subjectName?: string;
  chapterId?: string;
  teacherId?: string;
  teacherName?: string;
  title: string;
  description: string;
  driveLink?: string;
  maxMarks?: number;
  assignedDate: string;
  dueDate: string;
  status: 'ACTIVE' | 'CLOSED';
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  submissionLink?: string;
  submissionText?: string;
  submittedAt: string;
  marksAwarded?: number;
  teacherFeedback?: string;
  status: 'ASSIGNED' | 'SUBMITTED' | 'EVALUATED' | 'OVERDUE';
}

export interface Doubt {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  subjectName?: string;
  chapterName?: string;
  topic?: string;
  question: string;
  imageUrl?: string;
  status: DoubtStatus;
  answeredBy?: string;
  answeredByName?: string;
  answerText?: string;
  answeredAt?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  batchId?: string;
  batchName?: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  courseId: string;
  courseName: string;
  totalFee: number;
  discount: number;
  finalFee: number;
  paidAmount: number;
  balance: number;
  dueDate?: string;
  status: 'PAID' | 'PARTIAL' | 'OVERDUE';
  payments: FeePayment[];
}

export interface FeePayment {
  id: string;
  feeId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  receivedBy: string;
  notes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  audience: 'ALL' | 'COURSE' | 'BATCH' | 'TEACHERS' | 'PARENTS' | 'STUDENTS';
  targetCourseId?: string;
  targetCourseName?: string;
  attachmentUrl?: string;
  publishedBy: string;
  publishedByName: string;
  publishDate: string;
  expiryDate?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  link?: string;
  type: 'HOMEWORK' | 'TEST' | 'RESULT' | 'DOUBT' | 'FEE' | 'ANNOUNCEMENT' | 'GENERAL';
  isRead: boolean;
  createdAt: string;
}

export interface StudentEnrollmentAccess {
  id: string;
  studentId: string;
  courseId: string;
  courseName: string;
  batchId?: string;
  batchName?: string;
  status: AccessStatus;
  startDate: string;
  expiryDate?: string;
  grantedBy: string;
}

export interface AiAnalysisResult {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  overallSummary: string;
  strengths: string[];
  weaknesses: string[];
  recurringMistakes: string[];
  improvementTrend: string;
  topicsRequiringAttention: string[];
  suggestedPractice: string[];
  suggestedRevision: string[];
  suggestedDoubtSessionTopics: string[];
  teacherRecommendations: string[];
  isAiGenerated: boolean;
  isReviewed: boolean;
  isSharedWithStudent: boolean;
  isSharedWithParent: boolean;
  generatedAt: string;
  factualData?: {
    studentName?: string;
    courseName?: string;
    totalTests?: number;
    scoreHistory?: string;
    attendanceRate?: string | number;
    homeworkCompletion?: string;
    recordedMistakes?: Record<string, number>;
  };
  academicInterpretation?: {
    summary?: string;
    improvementTrend?: string;
    recurringMistakes?: string[];
    likelyImprovementArea?: string;
    strengths?: string[];
    weaknesses?: string[];
  };
  recommendations?: {
    suggestedPractice?: string[];
    suggestedRevision?: string[];
    suggestedDoubtSessionTopics?: string[];
    teacherRecommendations?: string[];
  };
}

export interface ProgressReport {
  id: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  courseId: string;
  courseName: string;
  batchName: string;
  period: string;
  attendancePercent: number;
  averageTestScore: number;
  testsAttempted: number;
  topMistakes: string[];
  teacherRemarks: string;
  aiAnalysis?: AiAnalysisResult;
  isSharedStudent: boolean;
  isSharedParent: boolean;
  generatedDate: string;
}

export interface ActivityLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  timestamp: string;
}

export interface AdmissionEnquiry {
  id: string;
  studentName: string;
  parentName?: string;
  phone: string;
  email?: string;
  courseInterested: string;
  classLevel?: string;
  message?: string;
  status: 'NEW' | 'CONTACTED' | 'CONVERTED' | 'CLOSED';
  createdAt: string;
}

export interface TeacherInvitation {
  id: string;
  email: string;
  fullName: string;
  token: string;
  invitedBy: string;
  assignedCourseIds: string[];
  grantedPermissions: string[];
  expiresAt: string;
  isAccepted: boolean;
  createdAt: string;
}

export interface SecurityAuditCheck {
  id: string;
  category: string;
  title: string;
  requirement: string;
  status: 'VERIFIED' | 'ENFORCED' | 'WARNING';
  details: string;
  technicalEnforcement: string;
}
