/**
 * Ramola Coaching Centre
 * Learn • Practice • Improve
 * Production Education Management & Student Learning Platform
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { AuthModal } from './components/auth/AuthModal';
import { PublicHome } from './components/public/PublicHome';
import { PublicCourses } from './components/public/PublicCourses';
import { FreeDoubtSession } from './components/public/FreeDoubtSession';
import { FreeTestSection } from './components/public/FreeTestSection';
import { AboutPage } from './components/public/AboutPage';
import { ContactPage } from './components/public/ContactPage';
import { AdmissionEnquiryModal } from './components/public/AdmissionEnquiryModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { Lock, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';

function MainApp() {
  const { activeTab, setActiveTab, currentRole, isAuthenticated, setIsAuthModalOpen } = useApp();

  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [selectedCourseForEnquiry, setSelectedCourseForEnquiry] = useState<string | undefined>(undefined);

  const handleOpenEnquiry = (courseName?: string) => {
    setSelectedCourseForEnquiry(courseName);
    setIsEnquiryOpen(true);
  };

  const isPortalMode = ['portal', 'admin', 'teacher', 'student', 'parent'].includes(activeTab);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Offline connectivity indicator */}
      <OfflineIndicator />

      {/* Main Responsive Header */}
      <Navbar onOpenEnquiry={() => handleOpenEnquiry()} />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <PublicHome onOpenEnquiry={handleOpenEnquiry} />
        )}

        {activeTab === 'courses' && (
          <PublicCourses onOpenEnquiry={handleOpenEnquiry} />
        )}

        {activeTab === 'doubt-session' && (
          <FreeDoubtSession />
        )}

        {activeTab === 'free-test' && (
          <FreeTestSection onOpenEnquiry={() => handleOpenEnquiry('Free Test Series')} />
        )}

        {activeTab === 'about' && (
          <AboutPage />
        )}

        {activeTab === 'contact' && (
          <ContactPage />
        )}

        {/* Portal Views (Role-Based Dynamic Routing with Authenticated Identity) */}
        {isPortalMode && (
          <>
            {!isAuthenticated ? (
              <div className="py-20 px-4 max-w-lg mx-auto text-center space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-[#002147] dark:text-[#d4af37] mx-auto flex items-center justify-center shadow-inner">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Sign In Required
                  </h2>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    The Ramola Coaching Centre portal requires authenticated student, parent, faculty, or administrative credentials.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl font-bold bg-[#002147] text-white hover:bg-[#00152e] dark:bg-[#d4af37] dark:text-[#002147] transition shadow flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveTab('home')}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl font-bold border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition text-xs"
                  >
                    Return to Public Website
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left text-[11px] text-slate-500 space-y-1">
                  <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Security Notice</span>
                  </p>
                  <p>
                    All academic records, test papers, fee receipts, and homework evaluations are isolated via Supabase Row Level Security.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {(currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN') && (
                  <AdminDashboard />
                )}
                {currentRole === 'TEACHER' && (
                  <TeacherDashboard />
                )}
                {currentRole === 'STUDENT' && (
                  <StudentDashboard />
                )}
                {currentRole === 'PARENT' && (
                  <ParentDashboard />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Mobile-First Bottom Navigation */}
      <MobileBottomNav onOpenEnquiry={() => handleOpenEnquiry()} />

      {/* Admission Enquiry Modal */}
      <AdmissionEnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        preselectedCourse={selectedCourseForEnquiry}
      />

      {/* Authentication & Supabase Sign In Modal */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
