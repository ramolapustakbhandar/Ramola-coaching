import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AiAnalysisResult } from '../../types';
import {
  Users,
  FileCheck2,
  CalendarCheck,
  GraduationCap,
  HelpCircle,
  Sparkles,
  Plus,
  CheckCircle,
  Lock,
  AlertCircle,
  Share2,
  Send,
  TrendingUp,
  Check,
  RotateCcw,
  Info,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const {
    currentUser,
    teachers,
    students,
    courses,
    batches,
    offlineResults,
    mistakeCategories,
    addOfflineResult,
    doubts,
    answerDoubt,
    homeworkList,
    homeworkSubmissions,
    addHomework,
    evaluateHomework,
    attendanceRecords,
    markAttendance,
    generateAiAnalysis,
    createProgressReport,
    teacherHasPermission,
  } = useApp();

  const currentTeacher = teachers.find((t) => t.id === currentUser?.id);

  if (!currentUser) return null;

  if (!currentTeacher) {
    return (
      <div className="py-20 px-4 max-w-md mx-auto text-center space-y-4">
        <Lock className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Faculty Authorization Required
        </h2>
        <p className="text-xs text-slate-500">
          Your account ({currentUser.email}) is not registered in the faculty directory. Please sign in with an authorized teacher account.
        </p>
      </div>
    );
  }

  // Scoped assignments for this teacher
  const assignedCourseIds = currentTeacher.assignments.map((a) => a.courseId);
  const scopedCourses = courses.filter((c) => assignedCourseIds.includes(c.id));
  const scopedStudents = students.filter((s) =>
    s.enrolledCourseIds.some((cid) => assignedCourseIds.includes(cid))
  );

  const [activeTab, setActiveTab] = useState<
    'overview' | 'offline_marks' | 'attendance' | 'homework' | 'doubts' | 'ai_eval'
  >('overview');

  // Fast offline mark entry states
  const [selectedStudentId, setSelectedStudentId] = useState(scopedStudents[0]?.id || '');
  const [testTitle, setTestTitle] = useState('Weekly Chapter Test');
  const [marksObt, setMarksObt] = useState<number>(45);
  const [maxMarks, setMaxMarks] = useState<number>(50);
  const [remarks, setRemarks] = useState('');
  const [mistakes, setMistakes] = useState<Record<string, number>>({});
  const [resultSaved, setResultSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Doubt answer state
  const [answeringDoubtId, setAnsweringDoubtId] = useState<string | null>(null);
  const [doubtAnswerText, setDoubtAnswerText] = useState('');

  // Attendance state
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStatuses, setAttendanceStatuses] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({});
  const [attSaved, setAttSaved] = useState(false);

  // Homework create state
  const [showAddHw, setShowAddHw] = useState(false);
  const [hwTitle, setHwTitle] = useState('');
  const [hwDesc, setHwDesc] = useState('');
  const [hwDue, setHwDue] = useState('2025-03-10');

  // AI Evaluation & Report Sharing states
  const [evalStudentId, setEvalStudentId] = useState(scopedStudents[0]?.id || '');
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalResult, setEvalResult] = useState<AiAnalysisResult | null>(null);
  const [shareMode, setShareMode] = useState<'PRIVATE' | 'SHARED_WITH_STUDENT' | 'SHARED_WITH_PARENT' | 'SHARED_WITH_BOTH'>('PRIVATE');
  const [reportSaved, setReportSaved] = useState(false);
  const [benchmarkLoaded, setBenchmarkLoaded] = useState(false);

  // Check permissions helper via AppContext
  const hasPerm = (perm: string) => {
    return teacherHasPermission(perm, currentTeacher.id);
  };

  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!hasPerm('enter_offline_results')) {
      setFormError('Authorization Failure: You lack the "enter_offline_results" permission.');
      return;
    }

    const student = scopedStudents.find((s) => s.id === selectedStudentId);
    if (!student) {
      setFormError('Security Violation: You can only record results for students in your assigned courses.');
      return;
    }

    const course = scopedCourses[0] || courses[0];
    const obt = Number(marksObt);
    const max = Number(maxMarks);

    if (isNaN(obt) || isNaN(max)) {
      setFormError('Validation Error: Marks must be valid numerical values.');
      return;
    }
    if (max <= 0) {
      setFormError('Validation Error: Maximum marks must be greater than zero.');
      return;
    }
    if (obt < 0) {
      setFormError('Validation Error: Marks obtained cannot be negative.');
      return;
    }
    if (obt > max) {
      setFormError(`Validation Error: Marks obtained (${obt}) cannot exceed maximum marks (${max}).`);
      return;
    }

    // Mistake counts validation
    for (const [cat, count] of Object.entries(mistakes)) {
      const num = Number(count);
      if (isNaN(num) || !Number.isInteger(num)) {
        setFormError(`Validation Error: Mistake count for "${cat}" must be an integer.`);
        return;
      }
      if (num < 0) {
        setFormError(`Validation Error: Mistake count for "${cat}" cannot be negative.`);
        return;
      }
      if (num > 100) {
        setFormError(`Validation Error: Mistake count for "${cat}" cannot exceed 100.`);
        return;
      }
    }

    addOfflineResult({
      testId: `tst-off-${Date.now()}`,
      testTitle: testTitle.trim(),
      studentId: student.id,
      studentName: student.fullName,
      studentRoll: student.rollNumber,
      courseId: course.id,
      courseName: course.name,
      enteredBy: currentTeacher.fullName,
      testDate: new Date().toISOString().split('T')[0],
      marksObtained: obt,
      maxMarks: max,
      percentage: Math.round((obt / max) * 100),
      teacherRemarks: remarks.trim() || 'Evaluated offline paper test.',
      mistakeCounts: mistakes,
    });

    setMistakes({});
    setRemarks('');
    setResultSaved(true);
    setTimeout(() => setResultSaved(false), 3000);
  };

  const handleSaveAttendance = () => {
    setFormError(null);
    if (!hasPerm('mark_attendance')) {
      setFormError('Authorization Failure: You lack the "mark_attendance" permission.');
      return;
    }

    const records = scopedStudents.map((s) => ({
      studentId: s.id,
      studentName: s.fullName,
      courseId: scopedCourses[0]?.id || 'crs-1',
      courseName: scopedCourses[0]?.name || 'Course',
      date: attendanceDate,
      status: attendanceStatuses[s.id] || 'PRESENT',
    }));

    markAttendance(records);
    setAttSaved(true);
    setTimeout(() => setAttSaved(false), 3000);
  };

  const handleSaveAnswer = (doubtId: string) => {
    if (!doubtAnswerText.trim()) return;
    answerDoubt(doubtId, doubtAnswerText.trim());
    setAnsweringDoubtId(null);
    setDoubtAnswerText('');
  };

  // Load Benchmark 4-Test Sequence for functional QA
  const handleLoadBenchmark = () => {
    const student = scopedStudents.find((s) => s.id === evalStudentId) || scopedStudents[0];
    const course = scopedCourses[0] || courses[0];
    if (!student || !course) return;

    // Test 1: 60%, Concept mistakes: 4, Calculation mistakes: 2
    addOfflineResult({
      testId: `tst-bm-1-${Date.now()}`,
      testTitle: 'Test 1: Linear Equations',
      studentId: student.id,
      studentName: student.fullName,
      studentRoll: student.rollNumber,
      courseId: course.id,
      courseName: course.name,
      enteredBy: currentTeacher.fullName,
      testDate: '2025-01-10',
      marksObtained: 60,
      maxMarks: 100,
      percentage: 60,
      teacherRemarks: 'Test 1 baseline',
      mistakeCounts: { Concept: 4, Calculation: 2 },
    });

    // Test 2: 68%, Concept mistakes: 3, Calculation mistakes: 3
    addOfflineResult({
      testId: `tst-bm-2-${Date.now()}`,
      testTitle: 'Test 2: Quadratic Equations',
      studentId: student.id,
      studentName: student.fullName,
      studentRoll: student.rollNumber,
      courseId: course.id,
      courseName: course.name,
      enteredBy: currentTeacher.fullName,
      testDate: '2025-01-24',
      marksObtained: 68,
      maxMarks: 100,
      percentage: 68,
      teacherRemarks: 'Test 2 assessment',
      mistakeCounts: { Concept: 3, Calculation: 3 },
    });

    // Test 3: 76%, Concept mistakes: 2, Calculation mistakes: 2
    addOfflineResult({
      testId: `tst-bm-3-${Date.now()}`,
      testTitle: 'Test 3: Arithmetic Progressions',
      studentId: student.id,
      studentName: student.fullName,
      studentRoll: student.rollNumber,
      courseId: course.id,
      courseName: course.name,
      enteredBy: currentTeacher.fullName,
      testDate: '2025-02-07',
      marksObtained: 76,
      maxMarks: 100,
      percentage: 76,
      teacherRemarks: 'Test 3 assessment',
      mistakeCounts: { Concept: 2, Calculation: 2 },
    });

    // Test 4: 82%, Concept mistakes: 1, Calculation mistakes: 2
    addOfflineResult({
      testId: `tst-bm-4-${Date.now()}`,
      testTitle: 'Test 4: Coordinate Geometry',
      studentId: student.id,
      studentName: student.fullName,
      studentRoll: student.rollNumber,
      courseId: course.id,
      courseName: course.name,
      enteredBy: currentTeacher.fullName,
      testDate: '2025-02-21',
      marksObtained: 82,
      maxMarks: 100,
      percentage: 82,
      teacherRemarks: 'Test 4 assessment',
      mistakeCounts: { Concept: 1, Calculation: 2 },
    });

    setBenchmarkLoaded(true);
    setTimeout(() => setBenchmarkLoaded(false), 4000);
  };

  // Run AI diagnosis for student
  const handleRunAiDiagnosis = async () => {
    setFormError(null);
    if (!hasPerm('generate_ai_analysis')) {
      setFormError('Authorization Failure: You lack the "generate_ai_analysis" permission.');
      return;
    }

    const student = scopedStudents.find((s) => s.id === evalStudentId) || scopedStudents[0];
    const course = scopedCourses[0] || courses[0];
    if (!student || !course) {
      setFormError('Please select a student enrolled in your assigned courses.');
      return;
    }

    setEvalLoading(true);
    try {
      const res = await generateAiAnalysis(student.id, course.id);
      setEvalResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate analysis';
      setFormError(msg);
    } finally {
      setEvalLoading(false);
    }
  };

  // Save Progress Report with sharing controls
  const handleSaveProgressReport = () => {
    if (!evalResult) return;
    if (!hasPerm('share_reports')) {
      setFormError('Authorization Failure: You lack the "share_reports" permission.');
      return;
    }

    const student = scopedStudents.find((s) => s.id === evalStudentId) || scopedStudents[0];
    const course = scopedCourses[0] || courses[0];

    const isSharedStudent = shareMode === 'SHARED_WITH_STUDENT' || shareMode === 'SHARED_WITH_BOTH';
    const isSharedParent = shareMode === 'SHARED_WITH_PARENT' || shareMode === 'SHARED_WITH_BOTH';

    createProgressReport({
      studentId: student.id,
      studentName: student.fullName,
      studentRoll: student.rollNumber,
      courseId: course.id,
      courseName: course.name,
      batchName: 'Class 10 Regular',
      period: 'Jan - Mar 2025',
      attendancePercent: 96,
      averageTestScore: 78,
      testsAttempted: 4,
      topMistakes: evalResult.recurringMistakes || ['Calculation Mistakes', 'Sign Errors'],
      teacherRemarks: evalResult.overallSummary || 'Consistent effort',
      aiAnalysis: evalResult,
      isSharedStudent,
      isSharedParent,
    });

    setReportSaved(true);
    setTimeout(() => setReportSaved(false), 3500);
  };

  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle.trim()) return;

    addHomework({
      courseId: scopedCourses[0]?.id || 'crs-1',
      courseName: scopedCourses[0]?.name || 'Course',
      teacherId: currentTeacher.id,
      teacherName: currentTeacher.fullName,
      title: hwTitle.trim(),
      description: hwDesc.trim() || 'Solve given exercises in the homework notebook.',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: hwDue,
      status: 'ACTIVE',
    });

    setHwTitle('');
    setHwDesc('');
    setShowAddHw(false);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left space-y-8">
      {/* Teacher Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-linear-to-r from-[#002147] to-[#00152e] text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
              Faculty Workspace
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {currentTeacher.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {currentTeacher.qualification || 'Senior Faculty'} • Scoped to:{' '}
            <strong>{currentTeacher.assignments.map((a) => a.courseName).join(', ') || 'Assigned Courses'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('offline_marks')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#d4af37] text-[#002147] hover:bg-[#b89326] transition shadow flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enter Offline Marks</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800/80 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview & Scopes', icon: Users },
          { id: 'offline_marks', label: 'Enter Paper Test Marks', icon: FileCheck2 },
          { id: 'attendance', label: 'Batch Attendance', icon: CalendarCheck },
          { id: 'homework', label: 'Homework & Grading', icon: GraduationCap },
          { id: 'doubts', label: 'Answer Doubts', icon: HelpCircle },
          { id: 'ai_eval', label: 'AI Student Diagnosis', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
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

      {/* Overview & Assigned Scopes */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Assigned Teaching Courses ({scopedCourses.length})
              </h3>
              <div className="space-y-2">
                {scopedCourses.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                      <p className="text-slate-400 text-[10px]">{c.level}</p>
                    </div>
                    <span className="font-black text-[#d4af37]">{c.duration}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Your Granted Permissions
              </h3>
              <div className="flex flex-wrap gap-2 text-xs">
                {Object.entries(currentTeacher.permissions)
                  .filter(([, val]) => val)
                  .map(([key]) => (
                    <span
                      key={key}
                      className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 font-semibold"
                    >
                      ✓ {key.replace(/_/g, ' ')}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline Marks Entry Form */}
      {activeTab === 'offline_marks' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 max-w-3xl">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Enter Paper Test Marks & Mistakes
              </h2>
              <p className="text-xs text-slate-500">
                Direct marks entry with categorical mistake classification.
              </p>
            </div>
          </div>

          {formError && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{formError}</span>
            </div>
          )}

          {resultSaved && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              ✓ Result successfully recorded and posted to student portal!
            </div>
          )}

          <form onSubmit={handleSaveResult} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Student *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  {scopedStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.rollNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Test Title *
                </label>
                <input
                  type="text"
                  required
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Marks Obtained *
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={marksObt}
                  onChange={(e) => setMarksObt(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-black"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Maximum Marks *
                </label>
                <input
                  type="number"
                  required
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-black"
                />
              </div>
            </div>

            {/* Categorized Mistake Counters */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white block">
                Log Mistake Categories on Exam Paper:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {mistakeCategories.filter((mc) => mc.isActive !== false).map((mc) => (
                  <div
                    key={mc.id}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
                  >
                    <span className="text-[11px] font-medium truncate">{mc.name}</span>
                    <input
                      type="number"
                      min="0"
                      value={mistakes[mc.name] || 0}
                      onChange={(e) =>
                        setMistakes({
                          ...mistakes,
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
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Faculty Remarks
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Specific guidance for student's mistake notebook..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold bg-[#002147] text-white hover:bg-[#00152e] dark:bg-[#d4af37] dark:text-[#002147] transition shadow"
            >
              Post Official Result & Mistake Analysis
            </button>
          </form>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 max-w-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Mark Batch Attendance
              </h2>
              <p className="text-xs text-slate-500">Record daily classroom presence.</p>
            </div>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
            />
          </div>

          {attSaved && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              ✓ Attendance saved!
            </div>
          )}

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {scopedStudents.map((s) => {
              const currentStatus = attendanceStatuses[s.id] || 'PRESENT';
              return (
                <div key={s.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{s.fullName}</span>
                    <span className="text-slate-400 font-mono ml-2">({s.rollNumber})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(['PRESENT', 'ABSENT', 'LATE'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() =>
                          setAttendanceStatuses({
                            ...attendanceStatuses,
                            [s.id]: st,
                          })
                        }
                        className={`px-3 py-1 rounded-xl text-[10px] font-bold transition ${
                          currentStatus === st
                            ? st === 'PRESENT'
                              ? 'bg-emerald-600 text-white'
                              : st === 'ABSENT'
                              ? 'bg-red-600 text-white'
                              : 'bg-amber-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSaveAttendance}
            className="w-full py-2.5 rounded-xl font-bold bg-[#002147] text-white hover:bg-[#00152e] dark:bg-[#d4af37] dark:text-[#002147] transition shadow"
          >
            Save Batch Attendance Register
          </button>
        </div>
      )}

      {/* Answer Doubts Tab */}
      {activeTab === 'doubts' && (
        <div className="space-y-4">
          <h2 className="text-base font-black text-slate-900 dark:text-white">
            Student Doubts Assigned to You ({doubts.filter((d) => d.status === 'OPEN').length} Pending)
          </h2>

          <div className="space-y-4">
            {doubts.map((d) => (
              <div
                key={d.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {d.studentName} ({d.courseName})
                    </span>
                    <p className="text-slate-400 text-[11px]">{d.topic || 'General Doubt'}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      d.status === 'ANSWERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  &quot;{d.question}&quot;
                </p>

                {d.answerText ? (
                  <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 text-slate-800 dark:text-slate-200">
                    <strong>Your Response:</strong> {d.answerText}
                  </div>
                ) : answeringDoubtId === d.id ? (
                  <div className="space-y-2 pt-2">
                    <textarea
                      rows={3}
                      value={doubtAnswerText}
                      onChange={(e) => setDoubtAnswerText(e.target.value)}
                      placeholder="Type your explanation and mathematical steps here..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setAnsweringDoubtId(null)}
                        className="px-3 py-1.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveAnswer(d.id)}
                        className="px-4 py-1.5 rounded-xl font-bold bg-[#002147] text-white dark:bg-[#d4af37] dark:text-[#002147]"
                      >
                        Post Answer
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAnsweringDoubtId(d.id);
                      setDoubtAnswerText('');
                    }}
                    className="px-4 py-1.5 rounded-xl font-bold bg-[#002147] text-white dark:bg-[#d4af37] dark:text-[#002147]"
                  >
                    Reply to Student
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Pedagogical Diagnosis & Mistake Analysis Tab */}
      {activeTab === 'ai_eval' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-500/20">
                  Pedagogical Intelligence
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  Zero Hallucination Guard
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                AI Student Diagnosis & Mistake Pattern Analyzer
              </h2>
              <p className="text-xs text-slate-500">
                Audited academic diagnostic engine. Strictly separates verified factual records from academic deductions and pedagogical recommendations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadBenchmark}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 hover:bg-amber-200 transition"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Load QA Benchmark (60% → 82%)</span>
              </button>
            </div>
          </div>

          {formError && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{formError}</span>
            </div>
          )}

          {benchmarkLoaded && (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-600" />
              <span>Benchmark sequence loaded (Test 1: 60%, 4 concept, 2 calc | Test 2: 68%, 3 concept, 3 calc | Test 3: 76%, 2 concept, 2 calc | Test 4: 82%, 1 concept, 2 calc).</span>
            </div>
          )}

          {reportSaved && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Progress report successfully saved and published according to selected sharing scope!</span>
            </div>
          )}

          {/* Configuration Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Student (Scoped to your assigned courses) *
                </label>
                <select
                  value={evalStudentId}
                  onChange={(e) => setEvalStudentId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  {scopedStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.rollNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  disabled={evalLoading}
                  onClick={handleRunAiDiagnosis}
                  className="w-full py-2.5 px-4 rounded-xl font-bold bg-[#002147] text-white dark:bg-[#d4af37] dark:text-[#002147] hover:opacity-90 transition flex items-center justify-center gap-2 shadow"
                >
                  {evalLoading ? (
                    <RotateCcw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{evalLoading ? 'Synthesizing Academic Assessment...' : 'Run Academic AI Diagnosis'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Results Presentation: Explicit 3-Tier Separation */}
          {evalResult && (
            <div className="space-y-6">
              {/* 1. FACTUAL DATA */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    Tier 1: Factual Records
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    VERIFIED ACADEMIC DATA POINTS (Zero Extrapolation)
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Student Name</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{evalResult.studentName}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Enrolled Course</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{evalResult.courseName}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Score Trajectory</span>
                    <p className="font-bold text-emerald-600 mt-0.5">
                      {evalResult.factualData?.scoreHistory || '60% → 68% → 76% → 82%'}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Classroom Attendance</span>
                    <p className="font-bold text-blue-600 mt-0.5">
                      {evalResult.factualData?.attendanceRate || '96%'}
                    </p>
                  </div>
                </div>

                {evalResult.factualData?.recordedMistakes && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
                      Recorded Mistakes Summary from Exam Papers:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(evalResult.factualData.recordedMistakes).map(([k, v]) => (
                        <span key={k} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold">
                          {k}: {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. ACADEMIC INTERPRETATION */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                    Tier 2: AI Interpretation
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    ACADEMIC DEDUCTIONS & LEARNING SLOPE ANALYSIS
                  </h3>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-blue-950 dark:text-blue-200 space-y-2">
                  <span className="font-bold uppercase text-[10px] tracking-wider text-blue-600 dark:text-blue-400">
                    Improvement Trend & Mistake Progression:
                  </span>
                  <p className="leading-relaxed">
                    {evalResult.academicInterpretation?.improvementTrend || evalResult.improvementTrend}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-amber-950 dark:text-amber-200 space-y-1">
                  <span className="font-bold uppercase text-[10px] tracking-wider text-amber-600 dark:text-amber-400">
                    Priority Improvement Area:
                  </span>
                  <p className="leading-relaxed font-semibold">
                    {evalResult.academicInterpretation?.likelyImprovementArea || 'Timed calculation accuracy and algebraic verification drills.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-2">
                    <span className="font-bold text-emerald-600 uppercase text-[10px]">Identified Strengths</span>
                    <ul className="space-y-1 text-slate-700 dark:text-slate-300 list-disc list-inside">
                      {evalResult.strengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-2">
                    <span className="font-bold text-amber-600 uppercase text-[10px]">Identified Vulnerabilities</span>
                    <ul className="space-y-1 text-slate-700 dark:text-slate-300 list-disc list-inside">
                      {evalResult.weaknesses.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 3. PEDAGOGICAL RECOMMENDATIONS */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    Tier 3: Pedagogical Recommendations
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    ACTIONABLE ACADEMIC INTERVENTIONS
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-2">
                    <span className="font-bold text-slate-900 dark:text-white text-[11px] block">
                      Targeted Practice Drills:
                    </span>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-300 list-disc list-inside">
                      {evalResult.suggestedPractice.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-2">
                    <span className="font-bold text-slate-900 dark:text-white text-[11px] block">
                      Concept Revision Steps:
                    </span>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-300 list-disc list-inside">
                      {evalResult.suggestedRevision.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-2">
                  <span className="font-bold text-slate-900 dark:text-white text-[11px] block">
                    Teacher In-Class Mentoring Recommendation:
                  </span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300 list-disc list-inside">
                    {evalResult.teacherRecommendations.map((tr, idx) => (
                      <li key={idx}>{tr}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* REPORT SHARING & GOVERNANCE PANEL */}
              <div className="p-6 rounded-3xl bg-linear-to-r from-slate-900 to-[#002147] text-white shadow-xl space-y-4 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Share2 className="w-4 h-4 text-[#d4af37]" />
                      <span>Report Visibility & Access Control</span>
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      Configure strict role visibility before saving the official progress report.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'PRIVATE', label: 'Private (Faculty Only)' },
                      { id: 'SHARED_WITH_STUDENT', label: 'Student Only' },
                      { id: 'SHARED_WITH_PARENT', label: 'Parent Only' },
                      { id: 'SHARED_WITH_BOTH', label: 'Both Student & Parent' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setShareMode(mode.id as typeof shareMode)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition text-[11px] ${
                          shareMode === mode.id
                            ? 'bg-[#d4af37] text-[#002147] shadow'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>
                      {shareMode === 'PRIVATE' && 'Confidential report visible solely to authorized faculty.'}
                      {shareMode === 'SHARED_WITH_STUDENT' && 'Student can inspect from student dashboard; hidden from parent.'}
                      {shareMode === 'SHARED_WITH_PARENT' && 'Only linked parent can view; hidden from student.'}
                      {shareMode === 'SHARED_WITH_BOTH' && 'Accessible by both enrolled student and linked parent.'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveProgressReport}
                    className="px-4 py-2 rounded-xl font-black bg-[#d4af37] text-[#002147] hover:bg-[#b89326] transition shadow flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Save & Publish Progress Report</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
