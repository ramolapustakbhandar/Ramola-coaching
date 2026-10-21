import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';
import { PWAInstallButton } from '../common/PWAInstallButton';
import {
  Sun,
  Moon,
  Bell,
  GraduationCap,
  Compass,
  ChevronDown,
  LogOut,
  ShieldCheck,
  User,
} from 'lucide-react';

interface NavbarProps {
  onOpenEnquiry?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenEnquiry }) => {
  const {
    theme,
    toggleTheme,
    currentUser,
    currentRole,
    isAuthenticated,
    setIsAuthModalOpen,
    signOut,
    activeTab,
    setActiveTab,
    notifications,
    markNotificationRead,
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadNotifications = currentUser
    ? notifications.filter((n) => !n.isRead && n.userId === currentUser.id)
    : [];

  const isPortalMode = ['portal', 'admin', 'teacher', 'student', 'parent'].includes(activeTab);

  const roleBadgeColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800',
    ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    TEACHER: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    STUDENT: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    PARENT: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    ACCOUNTANT: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300',
    COUNSELLOR: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200',
    GUEST: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200',
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Official Logo */}
          <div
            onClick={() => setActiveTab('home')}
            className="cursor-pointer transition-transform hover:opacity-95"
          >
            <Logo size="md" showText={true} showTagline={true} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {!isPortalMode ? (
              <>
                <button
                  onClick={() => setActiveTab('home')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    activeTab === 'home'
                      ? 'text-[#002147] dark:text-[#d4af37] font-semibold bg-amber-500/10'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => setActiveTab('courses')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    activeTab === 'courses'
                      ? 'text-[#002147] dark:text-[#d4af37] font-semibold bg-amber-500/10'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Courses
                </button>
                <button
                  onClick={() => setActiveTab('doubt-session')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    activeTab === 'doubt-session'
                      ? 'text-[#002147] dark:text-[#d4af37] font-semibold bg-amber-500/10'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Free Doubt Session
                </button>
                <button
                  onClick={() => setActiveTab('free-test')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    activeTab === 'free-test'
                      ? 'text-[#002147] dark:text-[#d4af37] font-semibold bg-amber-500/10'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Free Weekly Test
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    activeTab === 'about'
                      ? 'text-[#002147] dark:text-[#d4af37] font-semibold bg-amber-500/10'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => setActiveTab('contact')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    activeTab === 'contact'
                      ? 'text-[#002147] dark:text-[#d4af37] font-semibold bg-amber-500/10'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Contact
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('home')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <Compass className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Public Website</span>
                </button>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Verified Role:
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                    roleBadgeColors[currentRole] || 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {currentRole.replace('_', ' ')}
                </span>
              </div>
            )}
          </nav>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* PWA Install Button */}
            <PWAInstallButton variant="nav" />

            {/* Public Quick Admission Enquiry Button */}
            {!isPortalMode && onOpenEnquiry && (
              <button
                onClick={onOpenEnquiry}
                className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#d4af37] hover:bg-[#b89326] text-[#002147] transition shadow-xs cursor-pointer"
              >
                Admission Enquiry
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#002147]" />
              )}
            </button>

            {/* Authenticated Notifications (Only shown when logged in) */}
            {isAuthenticated && currentUser && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  aria-label="View notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
                  )}
                  {unreadNotifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h4>
                      <span className="text-[11px] text-slate-400">
                        {unreadNotifications.length} unread
                      </span>
                    </div>
                    <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                      {notifications.filter((n) => n.userId === currentUser.id).length === 0 ? (
                        <p className="py-6 text-center text-xs text-slate-400">No notifications yet.</p>
                      ) : (
                        notifications
                          .filter((n) => n.userId === currentUser.id)
                          .map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => markNotificationRead(notif.id)}
                              className={`p-3 rounded-xl transition cursor-pointer text-left ${
                                notif.isRead
                                  ? 'opacity-70 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                  : 'bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                  {notif.title}
                                </span>
                                {!notif.isRead && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                )}
                              </div>
                              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                                {notif.message}
                              </p>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Authenticated User Account Menu OR Sign In Button */}
            {isAuthenticated && currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#002147] text-white dark:bg-[#d4af37] dark:text-[#002147] flex items-center justify-center font-bold text-xs">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {currentUser.fullName}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {currentUser.role.replace('_', ' ').toLowerCase()}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Secure User Details & Sign Out Dropdown (NO INSECURE ROLE SWITCHING) */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Authenticated Identity
                      </p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {currentUser.fullName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            roleBadgeColors[currentUser.role] || 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {currentUser.role}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Database Verified</span>
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 space-y-1">
                      <button
                        onClick={() => {
                          setActiveTab('portal');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-bold bg-[#002147] text-white hover:bg-[#00152e] dark:bg-[#d4af37] dark:text-[#002147] transition cursor-pointer"
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span>Go to My Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#002147] text-white hover:bg-[#00152e] dark:bg-[#d4af37] dark:text-[#002147] transition shadow cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Sign In / Portal</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
