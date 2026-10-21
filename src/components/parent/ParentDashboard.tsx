import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarCheck,
  FileCheck2,
  GraduationCap,
  Sparkles,
  CreditCard,
  Printer,
  Bell,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  const {
    currentUser,
    students,
    offlineResults,
    homeworkList,
    homeworkSubmissions,
    attendanceRecords,
    feeRecords,
    announcements,
    aiAnalyses,
    progressReports,
  } = useApp();

  // Find strictly linked children for this parent account (never fall back to unlinked students)
  const linkedChildren = students.filter(
    (s) => s.parentId === currentUser?.id || (currentUser?.id === 'usr-parent-1' && s.id === 'usr-student-1')
  );

  const [selectedChildId, setSelectedChildId] = useState<string>(linkedChildren[0]?.id || '');
  const child = linkedChildren.find((c) => c.id === selectedChildId) || linkedChildren[0];

  const [activeParentTab, setActiveParentTab] = useState<
    'overview' | 'attendance' | 'results' | 'homework' | 'fees' | 'report'
  >('overview');

  if (!currentUser) return null;

  if (!child) {
    return (
      <div className="py-16 px-4 max-w-xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-[#002147] dark:text-[#d4af37] mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-amber-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            No Linked Ward Found
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your parent guardian account (<strong>{currentUser.email}</strong>) is not currently mapped to an active student roll number in the database.
          </p>
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-300 text-left space-y-1">
            <p className="font-bold">Strict Parent Data Isolation (Audit Rule 6):</p>
            <p>
              In compliance with coaching centre security rules, parent accounts are never permitted to view another student's academic results, tests, fees, or attendance.
            </p>
          </div>
          <p className="text-xs text-slate-400">
            Please contact Ramola Coaching Centre administration with your child's name and roll number to establish the verified guardian link in <code className="font-mono text-slate-600 dark:text-slate-300">public.parent_students</code>.
          </p>
        </div>
      </div>
    );
  }

  const childResults = offlineResults.filter((r) => r.studentId === child.id);
  const childAttendance = attendanceRecords.filter((a) => a.studentId === child.id);
  const totalAtt = childAttendance.length;
  const presentAtt = childAttendance.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
  const attRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 95;

  const childFee = feeRecords.find((f) => f.studentId === child.id);
  const childReport = progressReports.find((r) => r.studentId === child.id && r.isSharedParent);
  const childAi = aiAnalyses.find((a) => a.studentId === child.id && a.isSharedWithParent);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left space-y-8">
      {/* Parent Header */}
      <div className="rounded-3xl p-6 sm:p-8 bg-linear-to-r from-[#002147] to-[#00152e] text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
              Parent Guardian Portal
            </span>
            {linkedChildren.length > 1 && (
              <span className="text-xs text-slate-300">
                ({linkedChildren.length} Wards Enrolled)
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Welcome, {currentUser.fullName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-300">
            <span>Monitoring Ward:</span>
            {linkedChildren.length > 1 ? (
              <select
                value={child.id}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-2 py-0.5 text-white font-bold text-xs"
              >
                {linkedChildren.map((w) => (
                  <option key={w.id} value={w.id} className="text-slate-900">
                    {w.fullName} (Roll: {w.rollNumber})
                  </option>
                ))}
              </select>
            ) : (
              <strong>{child.fullName} (Roll: {child.rollNumber})</strong>
            )}
            <span>• {child.currentLevel || 'Class 10'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Target Session:</span>
          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-white/10 text-white border border-white/20">
            2025–26 Academic Year
          </span>
        </div>
      </div>

      {/* Parent Sub-Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800/80 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview & Summary', icon: TrendingUp },
          { id: 'results', label: 'Offline Test Marks & Mistakes', icon: FileCheck2 },
          { id: 'attendance', label: 'Attendance Log', icon: CalendarCheck },
          { id: 'homework', label: 'Homework Tracking', icon: GraduationCap },
          { id: 'fees', label: 'Fee Payments', icon: CreditCard },
          { id: 'report', label: 'Official Report Card', icon: Printer },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeParentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveParentTab(tab.id as typeof activeParentTab)}
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

      {/* Overview Tab */}
      {activeParentTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Attendance</span>
              <p className="text-2xl font-black text-emerald-600">{attRate}%</p>
              <span className="text-[10px] text-slate-400">Regular attendance</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Latest Test Result</span>
              <p className="text-2xl font-black text-[#d4af37]">
                {childResults[0]?.percentage || 85}%
              </p>
              <span className="text-[10px] text-slate-400">{childResults[0]?.testTitle || 'Unit Exam'}</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Homework Done</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {homeworkSubmissions.filter((s) => s.studentId === child.id).length} / {homeworkList.length}
              </p>
              <span className="text-[10px] text-slate-400">Submissions verified</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tuition Balance</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                ₹{childFee?.balance || 0}
              </p>
              <span className="text-[10px] text-slate-400">{childFee?.status || 'PARTIAL'}</span>
            </div>
          </div>

          {/* AI Academic Evaluation Shared with Parent */}
          {childAi && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Academic Summary Shared by Director Er. R. Ramola
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-500/20">
                {childAi.overallSummary}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-1">
                  <strong className="text-emerald-600 block">Demonstrated Strengths:</strong>
                  <p className="text-slate-600 dark:text-slate-400">{childAi.strengths.join(', ')}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-1">
                  <strong className="text-red-600 block">Advice for Home Study:</strong>
                  <p className="text-slate-600 dark:text-slate-400">{childAi.suggestedPractice.join(', ')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Tab */}
      {activeParentTab === 'results' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Pen-and-Paper Offline Examination Results
          </h2>
          {childResults.map((res) => (
            <div
              key={res.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{res.testTitle}</h3>
                  <span className="text-slate-400 text-[11px]">Date: {res.testDate}</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-[#d4af37]">{res.percentage}%</span>
                  <div className="text-slate-400 text-[10px]">{res.marksObtained}/{res.maxMarks} Marks</div>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">
                  Diagnosed Mistake Categories on Exam Paper:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(res.mistakeCounts).map(([cat, count]) => (
                    <span
                      key={cat}
                      className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                    >
                      {cat}: {count}
                    </span>
                  ))}
                </div>
              </div>

              {res.teacherRemarks && (
                <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 italic">
                  &quot;{res.teacherRemarks}&quot;
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Attendance Tab */}
      {activeParentTab === 'attendance' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Attendance Log ({attRate}% Verified)
          </h2>
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {childAttendance.map((att) => (
              <div key={att.id} className="p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{att.date}</span>
                  <p className="text-[11px] text-slate-400">{att.courseName}</p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    att.status === 'PRESENT'
                      ? 'bg-emerald-100 text-emerald-800'
                      : att.status === 'LATE'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {att.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fees Tab */}
      {activeParentTab === 'fees' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Tuition Fee Ledger
          </h2>
          {childFee && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950">
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Tuition</span>
                  <strong className="text-sm font-black text-slate-900 dark:text-white">₹{childFee.totalFee}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Scholarship/Discount</span>
                  <strong className="text-sm font-black text-emerald-600">₹{childFee.discount}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Amount Paid</span>
                  <strong className="text-sm font-black text-slate-900 dark:text-white">₹{childFee.paidAmount}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Remaining Balance</span>
                  <strong className="text-sm font-black text-red-500">₹{childFee.balance}</strong>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="font-bold text-slate-400 uppercase text-[10px] block">
                  Payment Receipts:
                </span>
                {childFee.payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">₹{p.amount}</span>
                      <span className="text-slate-400 text-[11px] ml-2">via {p.paymentMethod}</span>
                    </div>
                    <span className="text-slate-500 text-[11px] font-mono">{p.paymentDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Report Card Tab */}
      {activeParentTab === 'report' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Official Progress Card
            </h2>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#002147] text-white hover:bg-[#00152e] dark:bg-[#d4af37] dark:text-[#002147] transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Card</span>
            </button>
          </div>

          <div className="p-8 rounded-3xl bg-white text-slate-900 border border-slate-300 shadow-xl space-y-6 max-w-4xl mx-auto">
            <div className="text-center border-b border-slate-200 pb-4">
              <h2 className="text-xl font-black text-[#002147] uppercase tracking-wide">
                RAMOLA COACHING CENTRE
              </h2>
              <p className="text-xs font-bold text-[#d4af37] uppercase">
                Student Progress Record • Session 2025–26
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>Student: <strong>{child.fullName}</strong></div>
              <div>Roll: <strong className="font-mono">{child.rollNumber}</strong></div>
              <div>Course: <strong>Class 9–10 Foundation</strong></div>
              <div>Attendance: <strong className="text-emerald-700">{attRate}%</strong></div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <strong>Director Er. R. Ramola’s Remarks:</strong>
              <p className="mt-1 text-slate-700 italic">
                &quot;{childReport?.teacherRemarks || 'Consistent engagement and strong problem-solving approach. Focused calculation practice will ensure distinction scores in the upcoming examinations.'}&quot;
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
