import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  FileCheck2,
  HelpCircle,
  TrendingUp,
  Clock,
  CalendarCheck,
  CheckCircle,
  PlayCircle,
  ExternalLink,
  Printer,
  AlertCircle,
  Sparkles,
  Send,
  Video,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    students,
    courses,
    enrollments,
    canAccessCourse,
    courseContents,
    offlineResults,
    onlineTests,
    homeworkList,
    homeworkSubmissions,
    doubts,
    askDoubt,
    submitHomework,
    attendanceRecords,
    feeRecords,
    announcements,
    aiAnalyses,
    progressReports,
  } = useApp();

  const currentStudent = students.find((s) => s.id === currentUser?.id);

  const [activeStudentTab, setActiveStudentTab] = useState<
    'overview' | 'courses' | 'tests' | 'homework' | 'materials' | 'doubts' | 'performance' | 'report'
  >('overview');

  // Doubt submission state
  const [doubtSubject, setDoubtSubject] = useState('Mathematics');
  const [doubtTopic, setDoubtTopic] = useState('');
  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [doubtSubmittedMsg, setDoubtSubmittedMsg] = useState(false);

  // Homework submission state
  const [hwModalId, setHwModalId] = useState<string | null>(null);
  const [hwLink, setHwLink] = useState('');
  const [hwNote, setHwNote] = useState('');

  // Course Access Lifecycle
  const studentEnrollments = currentStudent
    ? enrollments.filter((e) => e.studentId === currentStudent.id)
    : [];

  const accessibleCourseIds = studentEnrollments
    .filter((e) => canAccessCourse(e.courseId, currentStudent?.id))
    .map((e) => e.courseId);

  // Filtered Course Contents based on Active Enrollment
  const accessibleVideos = courseContents.filter(
    (c) =>
      c.contentType === 'YOUTUBE_VIDEO' &&
      c.isPublished &&
      (c.isFree || accessibleCourseIds.includes(c.courseId))
  );

  const accessibleMaterials = courseContents.filter(
    (c) =>
      c.contentType !== 'YOUTUBE_VIDEO' &&
      c.isPublished &&
      (c.isFree || accessibleCourseIds.includes(c.courseId))
  );

  // Active Video Lesson player state
  const [activeVideo, setActiveVideo] = useState<{ id: string; title: string; url: string; extId?: string } | null>(
    accessibleVideos[0]
      ? {
          id: accessibleVideos[0].id,
          title: accessibleVideos[0].title,
          url: accessibleVideos[0].url,
          extId: accessibleVideos[0].externalId,
        }
      : null
  );

  if (!currentUser) return null;

  if (!currentStudent) {
    return (
      <div className="py-20 px-4 max-w-md mx-auto text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Student Profile Not Initialized
        </h2>
        <p className="text-xs text-slate-500">
          Your account ({currentUser.email}) does not have an attached student roll number yet. Please contact administration to link your enrollment.
        </p>
      </div>
    );
  }

  // Filtered Student Data (Strict Student Isolation)
  const studentOfflineResults = offlineResults.filter((r) => r.studentId === currentStudent.id);
  const studentDoubts = doubts.filter((d) => d.studentId === currentStudent.id);
  const studentAttendance = attendanceRecords.filter((a) => a.studentId === currentStudent.id);
  const totalAtt = studentAttendance.length;
  const presentAtt = studentAttendance.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
  const attendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 95;

  const studentFee = feeRecords.find((f) => f.studentId === currentStudent.id);
  const studentReport = progressReports.find((r) => r.studentId === currentStudent.id && r.isSharedStudent);
  const studentAi = aiAnalyses.find((a) => a.studentId === currentStudent.id && a.isSharedWithStudent);

  // Handle Ask Doubt
  const handleAskDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtQuestion.trim()) return;

    askDoubt({
      studentId: currentStudent.id,
      studentName: currentStudent.fullName,
      courseId: courses[0]?.id || 'crs-1',
      courseName: courses[0]?.name || 'Class 9–10 Foundation',
      subjectName: doubtSubject,
      topic: doubtTopic.trim() || 'Concept clarification',
      question: doubtQuestion.trim(),
    });

    setDoubtTopic('');
    setDoubtQuestion('');
    setDoubtSubmittedMsg(true);
    setTimeout(() => setDoubtSubmittedMsg(false), 4000);
  };

  // Handle Submit Homework
  const handleSaveHwSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwModalId) return;

    submitHomework({
      homeworkId: hwModalId,
      studentId: currentStudent.id,
      studentName: currentStudent.fullName,
      submissionLink: hwLink.trim() || 'https://drive.google.com/uploaded-assignment',
      submissionText: hwNote.trim(),
      submittedAt: new Date().toISOString(),
      status: 'SUBMITTED',
    });

    confetti({
      particleCount: 50,
      spread: 60,
    });

    setHwModalId(null);
    setHwLink('');
    setHwNote('');
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left space-y-8">
      {/* Student Welcome Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-linear-to-r from-[#002147] via-[#001f42] to-[#00152e] text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
              Student Portal
            </span>
            <span className="text-xs text-slate-300 font-mono">Roll: {currentStudent.rollNumber}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome back, {currentStudent.fullName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Current Goal: <strong>{currentStudent.targetExam || 'CBSE Board Excellence'}</strong> • Attendance: <strong className="text-emerald-400">{attendanceRate}%</strong>
          </p>
        </div>

        {/* Action Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveStudentTab('courses')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#d4af37] text-[#002147] hover:bg-[#b89326] transition shadow-sm flex items-center gap-1.5"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Continue Learning</span>
          </button>
          <button
            onClick={() => setActiveStudentTab('doubts')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition border border-white/20 flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-[#d4af37]" />
            <span>Ask a Doubt</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800/80 scrollbar-none">
        {[
          { id: 'overview', label: 'Dashboard & Today', icon: BookOpen },
          { id: 'courses', label: 'Video Masterclasses', icon: Video },
          { id: 'materials', label: 'Study Notes & Drive PDFs', icon: ExternalLink },
          { id: 'tests', label: 'Tests & Mistake Analysis', icon: FileCheck2 },
          { id: 'homework', label: 'Homework & Tasks', icon: CalendarCheck },
          { id: 'doubts', label: 'Doubt Desk', icon: HelpCircle },
          { id: 'performance', label: 'Academic Performance', icon: TrendingUp },
          { id: 'report', label: 'Progress Report Card', icon: Printer },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeStudentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveStudentTab(tab.id as typeof activeStudentTab)}
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
      {/* TAB 1: OVERVIEW & TODAY'S LEARNING */}
      {/* ========================================================================= */}
      {activeStudentTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Attendance</span>
              <p className="text-2xl font-black text-emerald-600">{attendanceRate}%</p>
              <span className="text-[10px] text-slate-400">Consistent regular attendance</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Recent Test Score</span>
              <p className="text-2xl font-black text-[#d4af37]">
                {studentOfflineResults[0]?.percentage || 85}%
              </p>
              <span className="text-[10px] text-slate-400">{studentOfflineResults[0]?.testTitle || 'Unit Exam'}</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Doubts Answered</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {studentDoubts.filter((d) => d.status === 'ANSWERED').length} / {studentDoubts.length}
              </p>
              <span className="text-[10px] text-slate-400">Faculty replies received</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fee Status</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {studentFee?.balance === 0 ? 'Clear ✓' : `₹${studentFee?.balance || 0}`}
              </p>
              <span className="text-[10px] text-slate-400">Due: {studentFee?.dueDate || '25th Mar'}</span>
            </div>
          </div>

          {/* Today's Schedule & Action Items */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {/* Upcoming Class Schedule */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#d4af37]" />
                    <span>Next Offline Classroom Batch</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Confirmed
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      Mathematics: Quadratic Word Problems & Discriminant
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 mt-0.5">
                      Batch A • Mon, Wed, Fri (4:30 PM – 6:30 PM) • Room 101
                    </div>
                  </div>
                  <span className="font-bold text-[#002147] dark:text-[#d4af37] shrink-0">
                    Er. R. Ramola
                  </span>
                </div>
              </div>

              {/* Homework Due Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-[#d4af37]" />
                    <span>Homework Due Soon</span>
                  </h3>
                  <button
                    onClick={() => setActiveStudentTab('homework')}
                    className="text-xs font-bold text-[#d4af37] hover:underline"
                  >
                    View All
                  </button>
                </div>

                {homeworkList.map((hw) => {
                  const isSubmitted = homeworkSubmissions.some((s) => s.homeworkId === hw.id && s.studentId === currentStudent.id);
                  return (
                    <div
                      key={hw.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{hw.title}</div>
                        <div className="text-slate-500 text-[11px]">Due: {hw.dueDate}</div>
                      </div>
                      {isSubmitted ? (
                        <span className="flex items-center gap-1 font-bold text-emerald-600 text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5" /> Submitted
                        </span>
                      ) : (
                        <button
                          onClick={() => setHwModalId(hw.id)}
                          className="px-3 py-1.5 rounded-xl font-bold bg-[#002147] text-white dark:bg-[#d4af37] dark:text-[#002147] text-[11px]"
                        >
                          Submit Link
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Sidebar: Announcements */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#d4af37]" />
                  <span>Centre Notice Board</span>
                </h3>

                <div className="space-y-3">
                  {announcements.map((anc) => (
                    <div
                      key={anc.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs space-y-1"
                    >
                      <span className="font-bold text-slate-900 dark:text-white block">{anc.title}</span>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                        {anc.message}
                      </p>
                      <span className="text-[10px] text-slate-400 block pt-1">
                        By {anc.publishedByName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VIDEO MASTERCLASSES (YOUTUBE EMBED) */}
      {/* ========================================================================= */}
      {activeStudentTab === 'courses' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Course Video Masterclasses
              </h2>
              <p className="text-xs text-slate-500">
                Watch recorded classroom derivations, formula tutorials, and chapter reviews embedded directly inside your portal.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300">
              <span className="font-bold">Application Access Control:</span> Verified Active Enrolled Students Only
            </div>
          </div>

          {/* YouTube External Content Privacy Disclaimer (Audit Item 11) */}
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
            <Video className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p>
              <strong>External YouTube Video Notice:</strong> Video lectures are hosted externally on YouTube and never stored in database tables. While portal playback is strictly restricted to active course enrollments, unlisted YouTube links may be shared externally by third parties.
            </p>
          </div>

          {activeVideo && (
            <div className="rounded-3xl bg-black overflow-hidden shadow-2xl border border-slate-800">
              <div className="aspect-video w-full bg-slate-950">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.extId || 'dQw4w9WgXcQ'}`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{activeVideo.title}</h3>
                  <p className="text-xs text-slate-400">Embedded Ramola Lecture</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#d4af37] text-[#002147]">
                  Playing Now
                </span>
              </div>
            </div>
          )}

          {/* Video List */}
          {accessibleVideos.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <Video className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">No Active Course Videos</p>
              <p className="text-xs text-slate-500">
                You do not currently have active, unexpired course enrollments for video lectures. Please contact administration if you need course access renewed.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {accessibleVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() =>
                    setActiveVideo({
                      id: video.id,
                      title: video.title,
                      url: video.url,
                      extId: video.externalId,
                    })
                  }
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#d4af37] cursor-pointer transition shadow-xs space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                      YouTube Lecture
                    </span>
                    <span className="text-slate-400">{video.durationMinutes || 45} Mins</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2">
                    {video.title}
                  </h4>
                  <p className="text-slate-500 text-[11px] line-clamp-2">
                    {video.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STUDY MATERIALS & GOOGLE DRIVE NOTES */}
      {/* ========================================================================= */}
      {activeStudentTab === 'materials' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Official Study Material & Formula Sheets
              </h2>
              <p className="text-xs text-slate-500">
                Curated Google Drive PDFs, previous-year question banks, and handwritten formula booklets.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300">
              <span className="font-bold">Access Verification:</span> Course Enrollment Required
            </div>
          </div>

          {/* Google Drive Security Boundary Notice (Audit Item 12) */}
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
            <ExternalLink className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p>
              <strong>External Google Drive Notice:</strong> Study materials are stored on Google Drive (zero file uploads in Supabase DB). Application access control protects links within this portal, but a shareable Google Drive URL is subject to Google Drive file permissions.
            </p>
          </div>

          {accessibleMaterials.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">No Active Course Materials</p>
              <p className="text-xs text-slate-500">
                Study notes and Drive PDF links require active, valid course enrollment. Contact administration to extend or reassign course access.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accessibleMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400">
                      {mat.contentType.replace('_', ' ')}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {mat.title}
                    </h3>
                    <p className="text-slate-500 text-[11px]">{mat.description}</p>
                  </div>
                  <a
                    href={mat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl font-bold bg-[#002147] text-white dark:bg-[#d4af37] dark:text-[#002147] hover:opacity-90 shrink-0 flex items-center gap-1.5"
                  >
                    <span>Open in Drive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TESTS & MISTAKE ANALYSIS */}
      {/* ========================================================================= */}
      {activeStudentTab === 'tests' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Offline Paper Test Marks & Mistake Breakdown
            </h2>
            <p className="text-xs text-slate-500">
              Review every graded paper test, teacher comments, and categorized mistakes (Sign slips, calculation errors, formula omissions).
            </p>
          </div>

          <div className="space-y-4">
            {studentOfflineResults.map((result) => (
              <div
                key={result.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {result.testTitle}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Date: {result.testDate} • Checked by: {result.enteredBy}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#d4af37]">
                      {result.percentage}%
                    </span>
                    <p className="text-xs text-slate-400">
                      {result.marksObtained} / {result.maxMarks} Marks
                    </p>
                  </div>
                </div>

                {/* Categorized Mistakes */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Mistakes Diagnosed on Paper:
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

                {result.questionBreakdown && result.questionBreakdown.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Question Breakdown:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {result.questionBreakdown.map((q) => (
                        <div
                          key={q.questionNumber}
                          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px]"
                        >
                          <span>Question {q.questionNumber}:</span>
                          <span className={q.status === 'CORRECT' ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>
                            {q.status} {q.mistakeCategoryName ? `(${q.mistakeCategoryName})` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.teacherRemarks && (
                  <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 text-xs text-slate-700 dark:text-slate-300">
                    <strong>Er. R. Ramola’s Remark:</strong> &quot;{result.teacherRemarks}&quot;
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: HOMEWORK */}
      {/* ========================================================================= */}
      {activeStudentTab === 'homework' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Homework & Assigned Tasks
            </h2>
            <p className="text-xs text-slate-500">
              Submit your scanned homework links from Google Drive and check teacher evaluation feedback.
            </p>
          </div>

          <div className="space-y-4">
            {homeworkList.map((hw) => {
              const submission = homeworkSubmissions.find((s) => s.homeworkId === hw.id && s.studentId === currentStudent.id);

              return (
                <div
                  key={hw.id}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{hw.title}</h3>
                      <p className="text-xs text-slate-500">
                        Subject: {hw.subjectName} • Due: {hw.dueDate}
                      </p>
                    </div>
                    {submission ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {submission.status}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        Pending Submission
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">{hw.description}</p>

                  {submission ? (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Marks Awarded: <strong>{submission.marksAwarded || 'Grading in progress'} / {hw.maxMarks || 20}</strong>
                        </span>
                        <a
                          href={submission.submissionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#d4af37] font-bold hover:underline"
                        >
                          View Submission Link
                        </a>
                      </div>
                      {submission.teacherFeedback && (
                        <p className="text-slate-600 dark:text-slate-400 pt-1">
                          <strong>Teacher Feedback:</strong> &quot;{submission.teacherFeedback}&quot;
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setHwModalId(hw.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#002147] text-white hover:bg-[#00152e] dark:bg-[#d4af37] dark:text-[#002147] transition shadow"
                    >
                      Submit Completed Homework
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: DOUBT DESK */}
      {/* ========================================================================= */}
      {activeStudentTab === 'doubts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Ask Doubt Form */}
          <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Ask Faculty a Doubt
            </h3>
            <p className="text-xs text-slate-500">
              Submit your question or problem statement. Er. R. Ramola and your teachers review and answer directly.
            </p>

            {doubtSubmittedMsg && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                Doubt submitted! Faculty will answer shortly.
              </div>
            )}

            <form onSubmit={handleAskDoubt} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <select
                  value={doubtSubject}
                  onChange={(e) => setDoubtSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science / Physics">Science / Physics</option>
                  <option value="Higher Calculus">Higher Calculus</option>
                  <option value="JEE / Competitive">JEE / Competitive</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Topic / Concept</label>
                <input
                  type="text"
                  value={doubtTopic}
                  onChange={(e) => setDoubtTopic(e.target.value)}
                  placeholder="e.g. Discriminant in word problems"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Your Question *</label>
                <textarea
                  rows={4}
                  required
                  value={doubtQuestion}
                  onChange={(e) => setDoubtQuestion(e.target.value)}
                  placeholder="Describe your difficulty in detail. Specify step numbers or equation lines where you get stuck..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold bg-[#002147] text-white hover:bg-[#00152e] dark:bg-[#d4af37] dark:text-[#002147] transition shadow flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Question to Faculty</span>
              </button>
            </form>
          </div>

          {/* Doubt History */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Your Doubt History ({studentDoubts.length})
            </h3>

            {studentDoubts.map((d) => (
              <div
                key={d.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {d.topic || 'Doubt'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      d.status === 'ANSWERED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>You asked:</strong> &quot;{d.question}&quot;
                </p>

                {d.answerText && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20 text-slate-800 dark:text-slate-200 space-y-1">
                    <span className="font-bold text-[#002147] dark:text-[#d4af37] block">
                      {d.answeredByName || 'Faculty'}&apos;s Solution:
                    </span>
                    <p className="leading-relaxed">{d.answerText}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: PERFORMANCE & AI DIAGNOSIS */}
      {/* ========================================================================= */}
      {activeStudentTab === 'performance' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Personalized Academic Analytics & AI Report
            </h2>
            <p className="text-xs text-slate-500">
              Targeted strengths, recurring mistake areas, and custom revision recommendations curated by Er. R. Ramola.
            </p>
          </div>

          {studentAi ? (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#d4af37]">
                  Official Academic Assessment
                </span>
                <span className="text-xs text-slate-400">
                  Updated: {new Date(studentAi.generatedAt).toLocaleDateString()}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                <strong>Executive Summary:</strong> {studentAi.overallSummary}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-600 dark:text-emerald-400">
                    Your Strongest Conceptual Topics
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                    {studentAi.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-red-600 dark:text-red-400">
                    Targeted Mistake Areas to Fix
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                    {studentAi.weaknesses.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Next Steps for Saturday Free Doubt Session:
                </span>
                <p className="text-slate-600 dark:text-slate-300">
                  {studentAi.suggestedDoubtSessionTopics.join(', ')}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2 text-xs text-slate-500">
              <Sparkles className="w-8 h-8 text-[#d4af37] mx-auto" />
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                AI Evaluation Under Faculty Review
              </p>
              <p>Your faculty mentor is finalizing your personalized report card. It will appear here once approved.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: PROGRESS REPORT CARD (PRINTABLE) */}
      {/* ========================================================================= */}
      {activeStudentTab === 'report' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between no-print">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Official Student Progress Report Card
              </h2>
              <p className="text-xs text-slate-500">
                Official certified assessment from Ramola Coaching Centre.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#002147] text-white hover:bg-[#00152e] dark:bg-[#d4af37] dark:text-[#002147] transition shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
          </div>

          {/* Printable Report Card Document */}
          <div className="rounded-3xl bg-white text-slate-900 border border-slate-300 p-8 sm:p-12 shadow-2xl space-y-8 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
            {/* Report Header */}
            <div className="flex items-center justify-between border-b-2 border-[#002147] pb-6">
              <div>
                <h1 className="text-2xl font-black text-[#002147] tracking-tight uppercase">
                  RAMOLA COACHING CENTRE
                </h1>
                <p className="text-xs font-bold text-[#d4af37] tracking-widest uppercase">
                  Learn • Practice • Improve
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Director: Er. R. Ramola (M.Tech) • Main Offline Academic Campus
                </p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#002147] text-white uppercase">
                  Official Progress Card
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Session: 2025–26
                </p>
              </div>
            </div>

            {/* Student Bio Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Student Name</span>
                <strong className="text-slate-900 font-bold">{currentStudent.fullName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Roll Number</span>
                <strong className="font-mono text-slate-900 font-bold">{currentStudent.rollNumber}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Target Level</span>
                <strong className="text-slate-900 font-bold">{currentStudent.currentLevel || 'Class 10'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Attendance Rate</span>
                <strong className="text-emerald-700 font-bold">{attendanceRate}% Verified</strong>
              </div>
            </div>

            {/* Academic Test Results Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#002147]">
                Offline Examination Record & Mistake Diagnosis:
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden min-w-[500px]">
                  <thead className="bg-[#002147] text-white text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Test Title</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Marks</th>
                      <th className="p-3">Percentage</th>
                      <th className="p-3">Top Diagnosed Mistakes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {studentOfflineResults.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{r.testTitle}</td>
                        <td className="p-3 text-slate-600">{r.testDate}</td>
                        <td className="p-3 font-semibold">{r.marksObtained} / {r.maxMarks}</td>
                        <td className="p-3 font-black text-[#d4af37]">{r.percentage}%</td>
                        <td className="p-3 text-slate-600">
                          {Object.entries(r.mistakeCounts).map(([cat, cnt]) => `${cat} (${cnt})`).join(', ') || 'Clean run'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Faculty Remarks */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-[#002147] block">Chief Mentor Observation:</span>
              <p className="text-slate-700 leading-relaxed italic">
                &quot;{studentReport?.teacherRemarks || 'Student shows sharp conceptual understanding and positive growth. Recommend continuing mistake notebook entries and timed calculation practice.'}&quot;
              </p>
            </div>

            {/* Signature Strip */}
            <div className="pt-8 flex items-end justify-between border-t border-slate-200 text-xs">
              <div className="text-center">
                <div className="w-32 border-b border-slate-400 mb-1" />
                <span className="text-slate-500 text-[10px]">Parent / Guardian Signature</span>
              </div>
              <div className="text-center">
                <div className="font-serif italic font-bold text-slate-900 text-sm mb-1">Er. R. Ramola</div>
                <div className="w-36 border-b border-slate-400 mb-1" />
                <span className="text-slate-500 text-[10px]">Director, Ramola Coaching Centre</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Homework Submission Modal */}
      {hwModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Submit Homework</h3>
            <form onSubmit={handleSaveHwSubmission} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Google Drive Link / Scanned PDF URL *
                </label>
                <input
                  type="url"
                  required
                  value={hwLink}
                  onChange={(e) => setHwLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Note to Faculty
                </label>
                <textarea
                  rows={2}
                  value={hwNote}
                  onChange={(e) => setHwNote(e.target.value)}
                  placeholder="e.g. Completed all questions. Question 4 was slightly challenging."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setHwModalId(null)}
                  className="px-4 py-2 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-[#002147] text-white dark:bg-[#d4af37] dark:text-[#002147]"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
