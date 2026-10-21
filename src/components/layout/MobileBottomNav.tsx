import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Home,
  BookOpen,
  HelpCircle,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  CheckSquare,
} from 'lucide-react';

export const MobileBottomNav: React.FC<{ onOpenEnquiry?: () => void }> = ({ onOpenEnquiry }) => {
  const { activeTab, setActiveTab, currentRole } = useApp();

  const isPortalMode = ['portal', 'admin', 'teacher', 'student', 'parent'].includes(activeTab);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-lg px-2 py-1 shadow-lg no-print">
      <div className="flex items-center justify-around">
        {!isPortalMode ? (
          <>
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold transition ${
                activeTab === 'home'
                  ? 'text-[#002147] dark:text-[#d4af37]'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Home className="w-4 h-4 mb-0.5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveTab('courses')}
              className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold transition ${
                activeTab === 'courses'
                  ? 'text-[#002147] dark:text-[#d4af37]'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <BookOpen className="w-4 h-4 mb-0.5" />
              <span>Courses</span>
            </button>

            <button
              onClick={() => setActiveTab('doubt-session')}
              className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold transition ${
                activeTab === 'doubt-session'
                  ? 'text-[#002147] dark:text-[#d4af37]'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <HelpCircle className="w-4 h-4 mb-0.5" />
              <span>Doubt Class</span>
            </button>

            <button
              onClick={() => setActiveTab('free-test')}
              className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold transition ${
                activeTab === 'free-test'
                  ? 'text-[#002147] dark:text-[#d4af37]'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <FileCheck2 className="w-4 h-4 mb-0.5" />
              <span>Free Test</span>
            </button>

            <button
              onClick={() => setActiveTab('portal')}
              className="flex flex-col items-center py-1 px-2 text-[10px] font-bold text-[#d4af37] dark:text-[#d4af37]"
            >
              <GraduationCap className="w-4 h-4 mb-0.5" />
              <span>Portal</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('portal')}
              className="flex flex-col items-center py-1 px-3 text-[10px] font-bold text-[#002147] dark:text-[#d4af37]"
            >
              <LayoutDashboard className="w-4 h-4 mb-0.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('home')}
              className="flex flex-col items-center py-1 px-3 text-[10px] font-semibold text-slate-500 dark:text-slate-400"
            >
              <Home className="w-4 h-4 mb-0.5" />
              <span>Website</span>
            </button>

            {onOpenEnquiry && (
              <button
                onClick={onOpenEnquiry}
                className="flex flex-col items-center py-1 px-3 text-[10px] font-semibold text-amber-600 dark:text-amber-400"
              >
                <CheckSquare className="w-4 h-4 mb-0.5" />
                <span>Enquiry</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
