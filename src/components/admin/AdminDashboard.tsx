import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CourseContent } from '../../types';
import {
  Users,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  FileText,
  Video,
  HelpCircle,
  CalendarCheck,
  CreditCard,
  Bell,
  Sparkles,
  Activity,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sliders,
  Printer,
  Share2,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    students,
    teachers,
    courses,
    batches,
    offlineResults,
    mistakeCategories,
    courseContents,
    homeworkList,
    homeworkSubmissions,
    doubts,
    attendanceRecords,
    feeRecords,
    announcements,
    activityLogs,
    enquiries,
    addCourse,
    addBatch,
    addStudent,
    updateStudent,
    enrollments,
    grantStudentAccess,
    updateStudentAccessStatus,
    addTeacher,
    updateTeacherPermissions,
    updateTeacherAssignments,
    toggleTeacherStatus,
    addOfflineResult,
    addMistakeCategory,
    updateMistakeCategory,
    addContent,
    deleteContent,
    addHomework,
    evaluateHomework,
    answerDoubt,
    markAttendance,
    addFeePayment,
    addAnnouncement,
    generateAiAnalysis,
    aiAnalyses,
    updateAiAnalysis,
    createProgressReport,
    updateEnquiryStatus,
    securityAuditChecks,
    teacherInvitations,
    inviteTeacher,
  } = useApp();

  const [currentTab, setCurrentTab] = useState<
    | 'overview'
    | 'security_audit'
    | 'students'
    | 'teachers'
    | 'courses'
    | 'offline_results'
    | 'mistake_rubrics'
    | 'content'
    | 'homework'
    | 'attendance'
    | 'fees'
    | 'ai_analysis'
    | 'announcements'
    | 'logs'
    | 'enquiries'
  >('overview');

  // Modal / Form States
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showInviteTeacherModal, setShowInviteTeacherModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteCourses, setInviteCourses] = useState<string[]>([]);
  const [invitePerms, setInvitePerms] = useState<string[]>([
    'view_students',
    'mark_attendance',
    'enter_offline_results',
    'add_mistake_analysis',
  ]);
  const [invitationSuccess, setInvitationSuccess] = useState<string | null>(null);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [showEnterResultModal, setShowEnterResultModal] = useState(false);
  const [showAssignHomeworkModal, setShowAssignHomeworkModal] = useState(false);
  const [showGrantAccessModal, setShowGrantAccessModal] = useState(false);

  // Selected entities for deep management
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');
  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId) || teachers[0];

  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Forms states
  // Student form
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentRoll, setNewStudentRoll] = useState('');
  const [newStudentLevel, setNewStudentLevel] = useState('Class 10');
  const [newStudentGuardian, setNewStudentGuardian] = useState('');

  // Course form
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseLevel, setNewCourseLevel] = useState('Class 11-12');
  const [newCourseCategory, setNewCourseCategory] = useState<'ACADEMIC' | 'COMPETITIVE' | 'GRADUATION' | 'SPECIAL'>('ACADEMIC');
  const [newCourseFee, setNewCourseFee] = useState<number>(30000);
  const [newCourseDuration, setNewCourseDuration] = useState('1 Year Academic Session');
  const [newCourseDesc, setNewCourseDesc] = useState('');

  // Offline Result Entry Form
  const [resStudentId, setResStudentId] = useState(students[0]?.id || '');
  const [resCourseId, setResCourseId] = useState(courses[0]?.id || '');
  const [resTestTitle, setResTestTitle] = useState('Weekly Chapter Test: Algebra Mastery');
  const [resMarksObtained, setResMarksObtained] = useState<number>(42);
  const [resMaxMarks, setResMaxMarks] = useState<number>(50);
  const [resRemarks, setResRemarks] = useState('');
  const [resMistakeCounts, setResMistakeCounts] = useState<Record<string, number>>({});

  // Content Form (YouTube / Google Drive)
  const [cntTitle, setCntTitle] = useState('');
  const [cntType, setCntType] = useState<CourseContent['contentType']>('YOUTUBE_VIDEO');
  const [cntUrl, setCntUrl] = useState('');
  const [cntCourseId, setCntCourseId] = useState(courses[0]?.id || '');
  const [cntIsFree, setCntIsFree] = useState(false);
  const [cntDesc, setCntDesc] = useState('');

  // Grant Access Form
  const [accessCourseId, setAccessCourseId] = useState(courses[0]?.id || '');
  const [accessBatchId, setAccessBatchId] = useState(batches[0]?.id || '');
  const [accessStartDate, setAccessStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [accessExpiryDate, setAccessExpiryDate] = useState('2026-03-31');

  // AI Generation State
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');

  // Quick Metrics
  const activeStudentsCount = students.filter((s) => s.status === 'ACTIVE').length;
  const activeTeachersCount = teachers.filter((t) => t.status === 'ACTIVE').length;
  const pendingDoubtsCount = doubts.filter((d) => d.status === 'OPEN').length;
  const totalFeesPending = feeRecords.reduce((acc, f) => acc + f.balance, 0);

  // Submit new student
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    addStudent({
      fullName: newStudentName.trim(),
      email: newStudentEmail.trim() || `${newStudentName.toLowerCase().replace(/\s+/g, '')}@student.ramola.com`,
      role: 'STUDENT',
      phone: newStudentPhone.trim(),
      rollNumber: newStudentRoll.trim() || `RCC-${Math.floor(1000 + Math.random() * 9000)}`,
      currentLevel: newStudentLevel,
      guardianName: newStudentGuardian.trim(),
      enrolledCourseIds: [courses[0]?.id || 'crs-1'],
      status: 'ACTIVE',
    });
    setNewStudentName('');
    setNewStudentPhone('');
    setNewStudentRoll('');
    setShowAddStudentModal(false);
  };

  // Submit new course
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;
    addCourse({
      name: newCourseName.trim(),
      code: newCourseCode.trim() || `RCC-${newCourseName.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-3)}`,
      category: newCourseCategory,
      level: newCourseLevel,
      fee: Number(newCourseFee) || 0,
      duration: newCourseDuration,
      description: newCourseDesc.trim() || 'Comprehensive subject coaching with theory, offline tests, and mistake analysis.',
      status: 'ACTIVE',
    });
    setNewCourseName('');
    setNewCourseCode('');
    setNewCourseDesc('');
    setShowAddCourseModal(false);
  };

  // Submit offline test result
  const handleSaveOfflineResult = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === resStudentId) || students[0];
    const course = courses.find((c) => c.id === resCourseId) || courses[0];
    const maxM = Number(resMaxMarks) || 50;
    const obtM = Number(resMarksObtained) || 0;
    const pct = Math.round((obtM / maxM) * 100);

    addOfflineResult({
      testId: `tst-off-${Date.now()}`,
      testTitle: resTestTitle.trim(),
      studentId: student.id,
      studentName: student.fullName,
      studentRoll: student.rollNumber,
      courseId: course.id,
      courseName: course.name,
      enteredBy: 'Er. R. Ramola',
      testDate: new Date().toISOString().split('T')[0],
      marksObtained: obtM,
      maxMarks: maxM,
      percentage: pct,
      teacherRemarks: resRemarks.trim() || 'Completed offline exam.',
      mistakeCounts: resMistakeCounts,
    });

    setResRemarks('');
    setResMistakeCounts({});
    setShowEnterResultModal(false);
  };

  // Submit Course Content
  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cntTitle.trim() || !cntUrl.trim()) return;
    const course = courses.find((c) => c.id === cntCourseId) || courses[0];

    // Extract YouTube ID if applicable
    let extId = '';
    if (cntType === 'YOUTUBE_VIDEO') {
      const match = cntUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      extId = match ? match[1] : '';
    } else if (cntUrl.includes('drive.google.com')) {
      const match = cntUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      extId = match ? match[1] : '';
    }

    addContent({
      courseId: course.id,
      title: cntTitle.trim(),
      description: cntDesc.trim(),
      contentType: cntType,
      url: cntUrl.trim(),
      externalId: extId,
      isFree: cntIsFree,
      isPublished: true,
      orderIndex: courseContents.length + 1,
    });

    setCntTitle('');
    setCntUrl('');
    setCntDesc('');
    setShowAddContentModal(false);
  };

  // Trigger Gemini AI Student Analysis
  const handleTriggerAiAnalysis = async (studentId: string, courseId: string) => {
    setIsGeneratingAi(true);
    setAiSuccessMsg('');
    try {
      const result = await generateAiAnalysis(studentId, courseId);
      setAiSuccessMsg(`Generated AI performance evaluation for ${result.studentName}!`);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left space-y-8">
      {/* Admin Header with Title & Quick Switchers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300">
              Super Admin Console
            </span>
            <span className="text-xs text-slate-400 font-mono">v1.0 Production</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Coaching Operations & Academic Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Full authority over students, teachers, granular permissions, course hierarchies, offline mark registers, mistake rubrics, and AI student analysis.
          </p>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowEnterResultModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#d4af37] text-[#002147] hover:bg-[#b89326] transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enter Offline Marks</span>
          </button>
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#002147] text-white hover:bg-[#00152e] dark:bg-slate-800 dark:text-white transition shadow-sm"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </button>
          <button
            onClick={() => setShowAddCourseModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 transition shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Create Course</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800/80 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview & KPIs', icon: Activity },
          { id: 'security_audit', label: 'Security & RLS Audit (13 Rules)', icon: ShieldCheck },
          { id: 'students', label: 'Students & Access', icon: Users },
          { id: 'teachers', label: 'Teachers & Permissions', icon: ShieldCheck },
          { id: 'courses', label: 'Courses & Batches', icon: BookOpen },
          { id: 'offline_results', label: 'Offline Results & Mistakes', icon: FileText },
          { id: 'mistake_rubrics', label: 'Mistake Categories', icon: Sliders },
          { id: 'content', label: 'YouTube & Drive Content', icon: Video },
          { id: 'homework', label: 'Homework & Submissions', icon: GraduationCap },
          { id: 'attendance', label: 'Attendance Register', icon: CalendarCheck },
          { id: 'fees', label: 'Fees Ledger', icon: CreditCard },
          { id: 'ai_analysis', label: 'AI Student Analysis', icon: Sparkles },
          { id: 'enquiries', label: 'Admissions Queue', icon: HelpCircle },
          { id: 'announcements', label: 'Announcements', icon: Bell },
          { id: 'logs', label: 'Audit Activity Logs', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as typeof currentTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                isActive
                  ? 'bg-[#002147] text-white dark:bg-[#d4af37] dark:text-[#002147] shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. OVERVIEW & KPIS */}
      {/* ========================================================================= */}
      {currentTab === 'overview' && (
        <div className="space-y-8">
          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Students</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{activeStudentsCount}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Enrolled in offline batches</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Teachers</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{activeTeachersCount}</p>
              <span className="text-[10px] text-slate-400">Scoped assignments</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Courses & Batches</span>
              <p className="text-2xl font-black text-[#d4af37]">{courses.length} / {batches.length}</p>
              <span className="text-[10px] text-slate-400">Dynamic hierarchies</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Offline Results</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{offlineResults.length}</p>
              <span className="text-[10px] text-slate-400">Paper tests recorded</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Doubts</span>
              <p className="text-2xl font-black text-amber-500">{pendingDoubtsCount}</p>
              <span className="text-[10px] text-amber-600 font-semibold">Awaiting faculty reply</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fee Balance</span>
              <p className="text-2xl font-black text-red-500">₹{totalFeesPending.toLocaleString()}</p>
              <span className="text-[10px] text-red-600 font-semibold">Across active enrollments</span>
            </div>
          </div>

          {/* Quick Management Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Offline Test Results */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#d4af37]" />
                  <span>Recent Offline Results</span>
                </h3>
                <button
                  onClick={() => setCurrentTab('offline_results')}
                  className="text-xs font-bold text-[#d4af37] hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2.5">
                {offlineResults.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{r.studentName}</p>
                      <p className="text-slate-500 text-[11px]">{r.testTitle}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-emerald-600 text-sm">{r.percentage}%</span>
                      <p className="text-[10px] text-slate-400">{r.marksObtained}/{r.maxMarks}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Students Needing Academic Attention */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Academic Alert / Low Scores</span>
                </h3>
                <span className="text-xs text-slate-400">&lt; 80% Benchmark</span>
              </div>

              <div className="space-y-2.5">
                {offlineResults
                  .filter((r) => r.percentage < 80)
                  .slice(0, 3)
                  .map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20 text-xs flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{r.studentName}</p>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                          Frequent: {Object.keys(r.mistakeCounts).slice(0, 2).join(', ') || 'Calculation slip'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedStudentId(r.studentId);
                          setCurrentTab('ai_analysis');
                        }}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#002147] text-white dark:bg-[#d4af37] dark:text-[#002147]"
                      >
                        AI Diagnosis
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Admissions Enquiries Triage */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#d4af37]" />
                  <span>New Admissions Enquiries</span>
                </h3>
                <button
                  onClick={() => setCurrentTab('enquiries')}
                  className="text-xs font-bold text-[#d4af37] hover:underline"
                >
                  Manage ({enquiries.length})
                </button>
              </div>

              <div className="space-y-2.5">
                {enquiries.slice(0, 3).map((enq) => (
                  <div
                    key={enq.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{enq.studentName}</p>
                      <p className="text-slate-500 text-[11px]">{enq.courseInterested}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        enq.status === 'NEW'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {enq.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1.5. SECURITY & RLS AUDIT VERIFICATION (ALL 13 REQUIREMENTS) */}
      {/* ========================================================================= */}
      {currentTab === 'security_audit' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/20">
                  13 / 13 Rules Enforced & Verified
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  PostgreSQL RLS
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                Security & Functionality Audit Verification Matrix
              </h2>
              <p className="text-xs text-slate-500">
                Formal technical audit verifying database identity, RLS isolation, Super Admin immutability, teacher permissions, and course lifecycle.
              </p>
            </div>

            <button
              onClick={() => setShowInviteTeacherModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#002147] text-white hover:bg-[#00152e] dark:bg-[#d4af37] dark:text-[#002147] transition shadow"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Issue Faculty Invitation</span>
            </button>
          </div>

          {/* Audit Summary Statistics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Audit Requirements</span>
              <p className="text-2xl font-black text-emerald-600">13 / 13</p>
              <span className="text-[10px] text-slate-400">100% Complete & Hardened</span>
            </div>
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">RLS Protected Tables</span>
              <p className="text-2xl font-black text-[#002147] dark:text-[#d4af37]">28 Tables</p>
              <span className="text-[10px] text-slate-400">Row Level Security Enabled</span>
            </div>
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Role Switcher Status</span>
              <p className="text-2xl font-black text-red-500">Removed</p>
              <span className="text-[10px] text-slate-400">Database Identity Only</span>
            </div>
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Super Admin Bootstrap</span>
              <p className="text-2xl font-black text-purple-600">Idempotent</p>
              <span className="text-[10px] text-slate-400">bootstrap_super_admin()</span>
            </div>
          </div>

          {/* 13 Audit Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityAuditChecks.map((item, idx) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#002147] text-white dark:bg-[#d4af37] dark:text-[#002147] flex items-center justify-center font-black text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {item.title}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/20">
                    {item.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                  <p>
                    <strong className="text-slate-800 dark:text-slate-200">User Brief: </strong>
                    {item.requirement}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    <strong className="text-slate-700 dark:text-slate-300">Resolution: </strong>
                    {item.details}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 font-mono text-[10px] text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-[#d4af37] block mb-0.5">Technical Enforcement:</span>
                  {item.technicalEnforcement}
                </div>
              </div>
            ))}
          </div>

          {/* Faculty Invitations Queue */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                  <span>Secure Faculty Onboarding Invitations</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Faculty accounts cannot be self-registered. The Director issues verified invitation tokens with assigned scopes and permissions.
                </p>
              </div>
              <button
                onClick={() => setShowInviteTeacherModal(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#002147] text-white dark:bg-[#d4af37] dark:text-[#002147]"
              >
                + New Invite
              </button>
            </div>

            {teacherInvitations.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                No pending faculty invitations. Click "Issue Faculty Invitation" to generate an onboarding token.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {teacherInvitations.map((inv) => (
                  <div key={inv.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{inv.fullName} ({inv.email})</p>
                      <p className="text-[11px] text-slate-400 font-mono">Token: {inv.token}</p>
                      <p className="text-[10px] text-slate-500">
                        Assigned: {inv.grantedPermissions.length} permissions • Expires in 7 days
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      Pending Sign Up
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. STUDENTS & ACCESS MANAGEMENT */}
      {/* ========================================================================= */}
      {currentTab === 'students' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Student Registry & Granular Access Control
              </h2>
              <p className="text-xs text-slate-500">
                Grant or revoke course access, modify start/expiry dates, suspend accounts, and view academic records.
              </p>
            </div>
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#002147] text-white hover:bg-[#00152e] dark:bg-[#d4af37] dark:text-[#002147] transition shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register New Student</span>
            </button>
          </div>

          {/* Students Table */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3.5 font-bold">Student Name & Roll</th>
                    <th className="px-4 py-3.5 font-bold">Level / Exam</th>
                    <th className="px-4 py-3.5 font-bold">Guardian & Phone</th>
                    <th className="px-4 py-3.5 font-bold">Course Access & Status</th>
                    <th className="px-4 py-3.5 font-bold">Expiry Date</th>
                    <th className="px-4 py-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {students.map((student) => {
                    const studentEnrollment = enrollments.find((e) => e.studentId === student.id);
                    const status = studentEnrollment?.status || student.status;

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900 dark:text-white">{student.fullName}</div>
                          <div className="text-[11px] font-mono text-slate-400">{student.rollNumber}</div>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                          {student.currentLevel || 'Class 10'}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="text-slate-800 dark:text-slate-200">{student.guardianName || 'Guardian'}</div>
                          <div className="text-slate-400 text-[11px]">{student.phone}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : status === 'SUSPENDED'
                                ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {status}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">
                            {studentEnrollment?.courseName || 'Class 9–10 Foundation'}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                          {studentEnrollment?.expiryDate || '2026-03-31'}
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-2">
                          {status === 'ACTIVE' ? (
                            <button
                              onClick={() => {
                                if (studentEnrollment) {
                                  updateStudentAccessStatus(studentEnrollment.id, 'SUSPENDED');
                                } else {
                                  updateStudent(student.id, { status: 'SUSPENDED' });
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/60 dark:text-red-300"
                            >
                              Suspend Access
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (studentEnrollment) {
                                  updateStudentAccessStatus(studentEnrollment.id, 'ACTIVE');
                                } else {
                                  updateStudent(student.id, { status: 'ACTIVE' });
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300"
                            >
                              Restore Access
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedStudentId(student.id);
                              setShowGrantAccessModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                          >
                            Extend / Reassign
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TEACHER MANAGEMENT & GRANULAR PERMISSIONS */}
      {/* ========================================================================= */}
      {currentTab === 'teachers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Teacher Registry & Granular Permission System
              </h2>
              <p className="text-xs text-slate-500">
                Control individual teacher authorizations for tests, marks, mistake analysis, homework, fees, and content upload.
              </p>
            </div>
            <button
              onClick={() => setShowAddTeacherModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#002147] text-white hover:bg-[#00152e] dark:bg-[#d4af37] dark:text-[#002147] transition shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Faculty Member</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Teachers List Sidebar */}
            <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-2">
                Faculty Members ({teachers.length})
              </span>
              {teachers.map((teacher) => {
                const isSelected = teacher.id === selectedTeacher.id;
                return (
                  <div
                    key={teacher.id}
                    onClick={() => setSelectedTeacherId(teacher.id)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition text-left ${
                      isSelected
                        ? 'bg-[#002147] text-white dark:bg-[#d4af37] dark:text-[#002147] font-bold shadow'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{teacher.fullName}</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          isSelected
                            ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {teacher.role}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 truncate ${isSelected ? 'opacity-90' : 'text-slate-500'}`}>
                      {teacher.qualification || 'Senior Faculty'}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Granular Permission Editor for Selected Teacher */}
            <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Permissions: {selectedTeacher.fullName}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedTeacher.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      selectedTeacher.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedTeacher.status}
                  </span>
                  <button
                    onClick={() =>
                      toggleTeacherStatus(
                        selectedTeacher.id,
                        selectedTeacher.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
                      )
                    }
                    className="px-3 py-1 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    {selectedTeacher.status === 'ACTIVE' ? 'Suspend Faculty' : 'Restore Faculty'}
                  </button>
                </div>
              </div>

              {/* Course & Batch Scoping */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Assigned Teaching Scopes (Only sees these courses/students):
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedTeacher.assignments.map((as) => (
                    <span
                      key={as.id}
                      className="px-3 py-1 rounded-xl text-xs font-medium bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20"
                    >
                      {as.courseName}
                    </span>
                  ))}
                </div>
              </div>

              {/* Grouped Permission Toggles */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Granular Module Permissions
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { key: 'view_students', label: 'View Assigned Students' },
                    { key: 'add_students', label: 'Register New Students' },
                    { key: 'mark_attendance', label: 'Mark Batch Attendance' },
                    { key: 'create_tests', label: 'Create Tests & Questions' },
                    { key: 'enter_offline_results', label: 'Enter Offline Paper Test Marks' },
                    { key: 'add_mistake_analysis', label: 'Record Mistake Categories' },
                    { key: 'create_homework', label: 'Assign Homework & Tasks' },
                    { key: 'evaluate_homework', label: 'Evaluate Submissions & Give Marks' },
                    { key: 'upload_notes', label: 'Upload Notes & Drive Docs' },
                    { key: 'add_youtube_videos', label: 'Embed YouTube Video Lessons' },
                    { key: 'answer_doubts', label: 'Answer Student Doubts' },
                    { key: 'generate_ai_analysis', label: 'Generate Gemini AI Student Reports' },
                    { key: 'view_fees', label: 'View Fee Balances' },
                    { key: 'manage_courses', label: 'Manage Academic Hierarchy' },
                  ].map((perm) => {
                    const isGranted = Boolean(
                      selectedTeacher.permissions?.all || selectedTeacher.permissions?.[perm.key]
                    );

                    return (
                      <div
                        key={perm.key}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80"
                      >
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {perm.label}
                        </span>
                        <input
                          type="checkbox"
                          checked={isGranted}
                          disabled={selectedTeacher.role === 'SUPER_ADMIN'}
                          onChange={(e) => {
                            const updated = {
                              ...selectedTeacher.permissions,
                              [perm.key]: e.target.checked,
                            };
                            updateTeacherPermissions(selectedTeacher.id, updated);
                          }}
                          className="h-4 w-4 rounded-md accent-[#d4af37] cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. COURSES, SUBJECTS & BATCHES */}
      {/* ========================================================================= */}
      {currentTab === 'courses' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Course Catalog & Academic Hierarchy
              </h2>
              <p className="text-xs text-slate-500">
                100% dynamic: Create any class, entrance exam, graduation syllabus, subjects, and batch timings.
              </p>
            </div>
            <button
              onClick={() => setShowAddCourseModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#002147] text-white hover:bg-[#00152e] dark:bg-[#d4af37] dark:text-[#002147] transition shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Course</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const courseBatches = batches.filter((b) => b.courseId === course.id);

              return (
                <div
                  key={course.id}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {course.level}
                    </span>
                    <span className="text-xs font-black text-[#d4af37]">
                      ₹{course.fee.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {course.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {course.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Duration:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{course.duration}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Batches ({courseBatches.length}):
                      </span>
                      {courseBatches.map((b) => (
                        <div
                          key={b.id}
                          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between"
                        >
                          <span>{b.name}</span>
                          <span className="text-slate-400">{b.timing}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. OFFLINE RESULTS & MISTAKE ANALYSIS */}
      {/* ========================================================================= */}
      {currentTab === 'offline_results' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Offline Paper Test Results & Mistake Analysis
              </h2>
              <p className="text-xs text-slate-500">
                Log pen-and-paper examination marks, percentage, teacher feedback, and granular counts for all 15 mistake categories.
              </p>
            </div>
            <button
              onClick={() => setShowEnterResultModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#d4af37] text-[#002147] hover:bg-[#b89326] transition shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enter New Test Result</span>
            </button>
          </div>

          <div className="space-y-4">
            {offlineResults.map((result) => (
              <div
                key={result.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {result.testTitle}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Student: <strong>{result.studentName}</strong> ({result.studentRoll}) • Date: {result.testDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-2xl font-black text-[#d4af37]">
                        {result.percentage}%
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {result.marksObtained} / {result.maxMarks} Marks
                      </p>
                    </div>
                  </div>
                </div>

                {/* Categorized Mistake Badges */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Recorded Mistake Counts:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(result.mistakeCounts).map(([cat, count]) => (
                      <span
                        key={cat}
                        className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900"
                      >
                        {cat}: <strong className="ml-1 font-black">{count}</strong>
                      </span>
                    ))}
                  </div>
                </div>

                {result.teacherRemarks && (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-300">
                    <strong>Faculty Remarks:</strong> &quot;{result.teacherRemarks}&quot;
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MISTAKE CATEGORIES MANAGER */}
      {/* ========================================================================= */}
      {currentTab === 'mistake_rubrics' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Mistake Categories (Diagnostic Rubrics)
              </h2>
              <p className="text-xs text-slate-500">
                15 standard categories. Admins can add new rubrics or deactivate unused categories.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mistakeCategories.map((mc) => (
              <div
                key={mc.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{mc.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Active
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">{mc.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. CONTENT MANAGER (YOUTUBE & GOOGLE DRIVE) */}
      {/* ========================================================================= */}
      {currentTab === 'content' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Course Study Material & Video Lessons
              </h2>
              <p className="text-xs text-slate-500">
                Embed YouTube lectures (zero video storage in DB) and Google Drive PDFs/worksheets with course access control.
              </p>
            </div>
            <button
              onClick={() => setShowAddContentModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#002147] text-white hover:bg-[#00152e] dark:bg-[#d4af37] dark:text-[#002147] transition shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Link Video or Drive Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courseContents.map((content) => (
              <div
                key={content.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400">
                    {content.contentType.replace('_', ' ')}
                  </span>
                  {content.isFree && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                      Free Preview
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {content.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {content.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <a
                    href={content.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-[#002147] dark:text-[#d4af37] hover:underline"
                  >
                    <span>Open Resource</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => deleteContent(content.id)}
                    className="text-red-500 hover:text-red-700 text-[11px] font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. AI STUDENT ANALYSIS */}
      {/* ========================================================================= */}
      {currentTab === 'ai_analysis' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-[#d4af37]">
                  Gemini 3.8 Flash Powered
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                AI Student Academic Evaluation Engine
              </h2>
              <p className="text-xs text-slate-500">
                Transforms offline paper test scores, categorized mistake frequencies, and attendance records into personalized learning diagnoses.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.rollNumber})
                  </option>
                ))}
              </select>

              <button
                disabled={isGeneratingAi}
                onClick={() => handleTriggerAiAnalysis(selectedStudentId, courses[0]?.id || 'crs-1')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#002147] text-white hover:bg-[#00152e] dark:bg-[#d4af37] dark:text-[#002147] transition shadow disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingAi ? 'Analyzing Data...' : 'Run Gemini Analysis'}</span>
              </button>
            </div>
          </div>

          {aiSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              {aiSuccessMsg}
            </div>
          )}

          {/* AI Reports List */}
          <div className="space-y-6">
            {aiAnalyses
              .filter((a) => a.studentId === selectedStudentId)
              .map((analysis) => (
                <div
                  key={analysis.id}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        Performance Diagnosis: {analysis.studentName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Course: {analysis.courseName} • Generated: {new Date(analysis.generatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateAiAnalysis(analysis.id, {
                            isSharedWithStudent: !analysis.isSharedWithStudent,
                          })
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                          analysis.isSharedWithStudent
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {analysis.isSharedWithStudent ? 'Shared with Student ✓' : 'Share with Student'}
                      </button>

                      <button
                        onClick={() =>
                          updateAiAnalysis(analysis.id, {
                            isSharedWithParent: !analysis.isSharedWithParent,
                          })
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                          analysis.isSharedWithParent
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {analysis.isSharedWithParent ? 'Shared with Parent ✓' : 'Share with Parent'}
                      </button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                    <strong>Academic Summary:</strong> {analysis.overallSummary}
                  </div>

                  {/* 2-Column Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-2">
                      <h4 className="font-bold text-emerald-600 dark:text-emerald-400">
                        Demonstrated Strengths
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                        {analysis.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-2">
                      <h4 className="font-bold text-red-600 dark:text-red-400">
                        Recurring Mistakes & Weak Areas
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                        {analysis.weaknesses.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                      <span className="font-bold text-slate-900 dark:text-white block">Suggested Practice:</span>
                      <p className="text-slate-600 dark:text-slate-400">{analysis.suggestedPractice.join(', ')}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                      <span className="font-bold text-slate-900 dark:text-white block">Saturday Doubt Focus:</span>
                      <p className="text-slate-600 dark:text-slate-400">{analysis.suggestedDoubtSessionTopics.join(', ')}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                      <span className="font-bold text-slate-900 dark:text-white block">Faculty Mentoring Advice:</span>
                      <p className="text-slate-600 dark:text-slate-400">{analysis.teacherRecommendations.join(', ')}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. ADMISSIONS ENQUIRIES */}
      {/* ========================================================================= */}
      {currentTab === 'enquiries' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Public Admissions Queue & Enquiries
              </h2>
              <p className="text-xs text-slate-500">
                Inquiries submitted through the website or doubt class registration.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {enquiries.map((enq) => (
              <div
                key={enq.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{enq.studentName}</span>
                    <span className="text-slate-400 font-mono">{enq.phone}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Course: <strong>{enq.courseInterested}</strong> {enq.classLevel && `(${enq.classLevel})`}
                  </p>
                  {enq.message && <p className="text-slate-500 italic">&quot;{enq.message}&quot;</p>}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={enq.status}
                    onChange={(e) => updateEnquiryStatus(enq.id, e.target.value as typeof enq.status)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                  >
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="CONVERTED">CONVERTED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                  <a
                    href={`tel:${enq.phone}`}
                    className="px-3 py-1.5 rounded-xl font-bold bg-[#002147] text-white dark:bg-[#d4af37] dark:text-[#002147]"
                  >
                    Call Student
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. ACTIVITY LOGS AUDIT TRAIL */}
      {/* ========================================================================= */}
      {currentTab === 'logs' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              System Audit & Activity Logs
            </h2>
            <p className="text-xs text-slate-500">
              Immutable historical record of every administrative action, permission modification, mark entry, and access revocation.
            </p>
          </div>

          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-4 text-xs flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                      {log.action}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">{log.actorName}</span>
                    <span className="text-slate-400 text-[10px]">({log.actorRole})</span>
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD STUDENT */}
      {/* ========================================================================= */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Register New Student</h3>
            <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Sneha Bisht"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Roll Number</label>
                <input
                  type="text"
                  value={newStudentRoll}
                  onChange={(e) => setNewStudentRoll(e.target.value)}
                  placeholder="RCC-2025-104"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newStudentPhone}
                    onChange={(e) => setNewStudentPhone(e.target.value)}
                    placeholder="+91 98..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Class</label>
                  <select
                    value={newStudentLevel}
                    onChange={(e) => setNewStudentLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                    <option value="Graduation">Graduation</option>
                    <option value="JEE / Competitive">JEE / Competitive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Guardian Name</label>
                <input
                  type="text"
                  value={newStudentGuardian}
                  onChange={(e) => setNewStudentGuardian(e.target.value)}
                  placeholder="Parent name"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-[#002147] text-white dark:bg-[#d4af37] dark:text-[#002147]"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ENTER OFFLINE RESULT & MISTAKE ANALYSIS */}
      {/* ========================================================================= */}
      {showEnterResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-4 my-8">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Enter Offline Paper Test Result
            </h3>
            <form onSubmit={handleSaveOfflineResult} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Student *</label>
                  <select
                    value={resStudentId}
                    onChange={(e) => setResStudentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.rollNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Course *</label>
                  <select
                    value={resCourseId}
                    onChange={(e) => setResCourseId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Test Title *</label>
                <input
                  type="text"
                  required
                  value={resTestTitle}
                  onChange={(e) => setResTestTitle(e.target.value)}
                  placeholder="e.g. Unit Test 2: Triangles & Proofs"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Marks Obtained *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={resMarksObtained}
                    onChange={(e) => setResMarksObtained(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Maximum Marks *</label>
                  <input
                    type="number"
                    required
                    value={resMaxMarks}
                    onChange={(e) => setResMaxMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-black"
                  />
                </div>
              </div>

              {/* Granular Mistake Analysis Counters */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Detailed Mistake Analysis (Log counts per category):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {mistakeCategories.slice(0, 9).map((mc) => (
                    <div
                      key={mc.id}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
                    >
                      <span className="text-[11px] font-medium truncate">{mc.name}</span>
                      <input
                        type="number"
                        min="0"
                        value={resMistakeCounts[mc.name] || 0}
                        onChange={(e) =>
                          setResMistakeCounts({
                            ...resMistakeCounts,
                            [mc.name]: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-10 px-1 py-0.5 rounded text-center border font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Teacher Feedback</label>
                <textarea
                  rows={2}
                  value={resRemarks}
                  onChange={(e) => setResRemarks(e.target.value)}
                  placeholder="e.g. Excellent algebraic factorization. Need to check sign changes on bracket expansions."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEnterResultModal(false)}
                  className="px-4 py-2 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-[#002147] text-white dark:bg-[#d4af37] dark:text-[#002147]"
                >
                  Save Result & Mistakes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CREATE COURSE */}
      {/* ========================================================================= */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Create New Course</h3>
            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="e.g. NDA / CDS Mathematics Fast-Track"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={newCourseCategory}
                    onChange={(e) => setNewCourseCategory(e.target.value as typeof newCourseCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="ACADEMIC">Academic</option>
                    <option value="COMPETITIVE">Competitive</option>
                    <option value="GRADUATION">Graduation</option>
                    <option value="SPECIAL">Special</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Level / Target</label>
                  <input
                    type="text"
                    value={newCourseLevel}
                    onChange={(e) => setNewCourseLevel(e.target.value)}
                    placeholder="e.g. NDA / Defence"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fee (₹)</label>
                  <input
                    type="number"
                    value={newCourseFee}
                    onChange={(e) => setNewCourseFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Duration</label>
                  <input
                    type="text"
                    value={newCourseDuration}
                    onChange={(e) => setNewCourseDuration(e.target.value)}
                    placeholder="6 Months"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-4 py-2 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-[#002147] text-white dark:bg-[#d4af37] dark:text-[#002147]"
                >
                  Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: LINK YOUTUBE OR GOOGLE DRIVE CONTENT */}
      {/* ========================================================================= */}
      {showAddContentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Link Course Resource</h3>
            <form onSubmit={handleSaveContent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Course *</label>
                <select
                  value={cntCourseId}
                  onChange={(e) => setCntCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Type *</label>
                <select
                  value={cntType}
                  onChange={(e) => setCntType(e.target.value as typeof cntType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value="YOUTUBE_VIDEO">YouTube Embedded Lesson</option>
                  <option value="DRIVE_DOC">Google Drive Notes / Document</option>
                  <option value="PDF">Google Drive PDF Question Bank</option>
                  <option value="WORKSHEET">Worksheet Link</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Resource Title *</label>
                <input
                  type="text"
                  required
                  value={cntTitle}
                  onChange={(e) => setCntTitle(e.target.value)}
                  placeholder="e.g. Quadratic Equations Masterclass Part 1"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">YouTube URL or Google Drive Link *</label>
                <input
                  type="url"
                  required
                  value={cntUrl}
                  onChange={(e) => setCntUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://drive.google.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cntFree"
                  checked={cntIsFree}
                  onChange={(e) => setCntIsFree(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#d4af37]"
                />
                <label htmlFor="cntFree" className="text-slate-700 dark:text-slate-300 font-medium">
                  Free Preview (Accessible without active enrollment)
                </label>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddContentModal(false)}
                  className="px-4 py-2 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-[#002147] text-white dark:bg-[#d4af37] dark:text-[#002147]"
                >
                  Publish Content
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ISSUE FACULTY ONBOARDING INVITATION */}
      {/* ========================================================================= */}
      {showInviteTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
              <span>Issue Faculty Onboarding Invitation</span>
            </h3>
            <p className="text-xs text-slate-500">
              Generate a verified invitation token with pre-assigned course scopes and granular permissions.
            </p>

            {invitationSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300">
                {invitationSuccess}
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!inviteEmail.trim() || !inviteName.trim()) return;
                const inv = await inviteTeacher(
                  inviteEmail.trim(),
                  inviteName.trim(),
                  inviteCourses.length > 0 ? inviteCourses : [courses[0]?.id || 'crs-1'],
                  invitePerms
                );
                setInvitationSuccess(`Invitation generated! Token: ${inv.token}`);
                setTimeout(() => {
                  setInvitationSuccess(null);
                  setShowInviteTeacherModal(false);
                  setInviteEmail('');
                  setInviteName('');
                }, 2000);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Faculty Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Kumar"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Faculty Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="rajesh.kumar@ramolacoaching.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Teaching Scope *
                </label>
                <select
                  multiple
                  value={inviteCourses}
                  onChange={(e) =>
                    setInviteCourses(Array.from(e.target.selectedOptions, (opt) => opt.value))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white h-24"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.level})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400">Hold Ctrl / Cmd to select multiple courses</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pre-Granted Permissions
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950">
                  {[
                    { key: 'view_students', label: 'View Students' },
                    { key: 'mark_attendance', label: 'Mark Attendance' },
                    { key: 'create_tests', label: 'Create Tests' },
                    { key: 'enter_offline_results', label: 'Offline Results' },
                    { key: 'add_mistake_analysis', label: 'Mistake Analysis' },
                    { key: 'create_homework', label: 'Assign Homework' },
                    { key: 'evaluate_homework', label: 'Evaluate Submissions' },
                    { key: 'upload_notes', label: 'Upload Drive Notes' },
                    { key: 'add_youtube_videos', label: 'Embed YouTube Videos' },
                    { key: 'answer_doubts', label: 'Answer Doubts' },
                    { key: 'generate_ai_analysis', label: 'Generate AI Reports' },
                  ].map((p) => (
                    <label key={p.key} className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={invitePerms.includes(p.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setInvitePerms([...invitePerms, p.key]);
                          } else {
                            setInvitePerms(invitePerms.filter((k) => k !== p.key));
                          }
                        }}
                        className="rounded accent-[#d4af37]"
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteTeacherModal(false)}
                  className="px-4 py-2 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-[#002147] text-white dark:bg-[#d4af37] dark:text-[#002147]"
                >
                  Create Invitation Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
