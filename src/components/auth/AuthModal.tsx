import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';
import {
  Lock,
  Mail,
  User,
  Phone,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  X,
  Database,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  GraduationCap,
} from 'lucide-react';
import { setCustomSupabaseCredentials, isSupabaseConfigured, testSupabaseConnection } from '../../lib/supabase';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, signIn, signUp, currentUser } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup' | 'supabase_setup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'PARENT'>('STUDENT');
  const [showPassword, setShowPassword] = useState(false);

  // Form feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Supabase direct connection inputs
  const [customUrl, setCustomUrl] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [connectionTestMsg, setConnectionTestMsg] = useState('');
  const [connectionTestSuccess, setConnectionTestSuccess] = useState<boolean | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const result = await signIn(email.trim(), password);
      if (result.success) {
        setSuccessMsg('Authentication successful. Loading your portal...');
        setTimeout(() => {
          setIsAuthModalOpen(false);
          setSuccessMsg('');
          setEmail('');
          setPassword('');
        }, 800);
      } else {
        setErrorMsg(result.error || 'Invalid credentials. Please verify your email and password.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const result = await signUp(
        email.trim(),
        password,
        fullName.trim(),
        selectedRole,
        phone.trim()
      );

      if (result.success) {
        setSuccessMsg(`Registration successful as ${selectedRole}. You are now signed in.`);
        setTimeout(() => {
          setIsAuthModalOpen(false);
          setSuccessMsg('');
          setEmail('');
          setPassword('');
          setFullName('');
          setPhone('');
        }, 1000);
      } else {
        setErrorMsg(result.error || 'Failed to create account.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Registration error.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim() || !customKey.trim()) {
      setErrorMsg('Both Supabase URL and Anon Key are required.');
      return;
    }

    const saved = setCustomSupabaseCredentials(customUrl.trim(), customKey.trim());
    if (saved) {
      setSuccessMsg('Supabase credentials saved. Reloading connection...');
    }
  };

  const handleTestConnection = async () => {
    setConnectionTestMsg('Testing connection to Supabase...');
    const res = await testSupabaseConnection();
    setConnectionTestSuccess(res.success);
    setConnectionTestMsg(res.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 text-left space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            setIsAuthModalOpen(false);
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Close auth modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header & Logo */}
        <div className="space-y-3">
          <Logo size="md" showText={true} showTagline={false} />
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {mode === 'signin' && 'Sign In to Your Account'}
              {mode === 'signup' && 'Register New Student or Parent'}
              {mode === 'supabase_setup' && 'Supabase Cloud Configuration'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'signin' && 'Access verified coursework, tests, homework, and reports.'}
              {mode === 'signup' && 'Create your verified account for Ramola Coaching Centre.'}
              {mode === 'supabase_setup' && 'Connect or verify your Supabase project URL and API key.'}
            </p>
          </div>
        </div>

        {/* Supabase Connection Status Tag */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Database / Auth:
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isSupabaseConfigured
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              {isSupabaseConfigured ? 'Supabase Connected' : 'Local Preview Auth'}
            </span>
          </div>

          <button
            onClick={() => setMode(mode === 'supabase_setup' ? 'signin' : 'supabase_setup')}
            className="text-[11px] font-bold text-[#d4af37] hover:underline"
          >
            {mode === 'supabase_setup' ? 'Back to Login' : 'Config'}
          </button>
        </div>

        {/* Error / Success Banners */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* =================================================================== */}
        {/* MODE 1: SIGN IN FORM */}
        {/* =================================================================== */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Password *
                </label>
                <span className="text-[10px] text-slate-400">Min. 6 chars</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold bg-[#002147] text-white hover:bg-[#00152e] dark:bg-[#d4af37] dark:text-[#002147] transition shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick credentials helper for audit demonstration */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Official Verified Accounts (Audit Testing):
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@ramolacoaching.com');
                    setPassword('RamolaAdmin2026!');
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-left hover:border-[#d4af37]"
                >
                  <p className="font-bold text-slate-900 dark:text-white truncate">Super Admin</p>
                  <p className="text-[10px] text-slate-400 truncate">admin@ramolacoaching.com</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('priya.sharma@ramolacoaching.com');
                    setPassword('TeacherPass2026!');
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-left hover:border-[#d4af37]"
                >
                  <p className="font-bold text-slate-900 dark:text-white truncate">Teacher (Faculty)</p>
                  <p className="text-[10px] text-slate-400 truncate">priya.sharma@ramolacoaching.com</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('rahul.sharma@student.ramola.com');
                    setPassword('StudentPass2026!');
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-left hover:border-[#d4af37]"
                >
                  <p className="font-bold text-slate-900 dark:text-white truncate">Student (Rahul)</p>
                  <p className="text-[10px] text-slate-400 truncate">rahul.sharma@student...</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('suresh.sharma@parent.com');
                    setPassword('ParentPass2026!');
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-left hover:border-[#d4af37]"
                >
                  <p className="font-bold text-slate-900 dark:text-white truncate">Parent (Suresh)</p>
                  <p className="text-[10px] text-slate-400 truncate">suresh.sharma@parent.com</p>
                </button>
              </div>
            </div>

            <div className="pt-2 text-center">
              <span className="text-slate-500">Need a new account? </span>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-bold text-[#d4af37] hover:underline"
              >
                Register as Student or Parent
              </button>
            </div>
          </form>
        )}

        {/* =================================================================== */}
        {/* MODE 2: SIGN UP FORM */}
        {/* =================================================================== */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Account Type *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('STUDENT')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition ${
                    selectedRole === 'STUDENT'
                      ? 'border-[#002147] bg-[#002147] text-white dark:border-[#d4af37] dark:bg-[#d4af37] dark:text-[#002147]'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Student Account
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('PARENT')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition ${
                    selectedRole === 'PARENT'
                      ? 'border-[#002147] bg-[#002147] text-white dark:border-[#d4af37] dark:bg-[#d4af37] dark:text-[#002147]'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Parent / Guardian
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Note: Teacher and Admin roles cannot be self-selected. Faculty accounts require an invitation from the Director.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Create Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold bg-[#002147] text-white hover:bg-[#00152e] dark:bg-[#d4af37] dark:text-[#002147] transition shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? <span>Registering...</span> : <span>Create Account</span>}
            </button>

            <div className="pt-2 text-center">
              <span className="text-slate-500">Already registered? </span>
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-bold text-[#d4af37] hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* =================================================================== */}
        {/* MODE 3: SUPABASE PROJECT CONFIGURATION */}
        {/* =================================================================== */}
        {mode === 'supabase_setup' && (
          <form onSubmit={handleSaveSupabaseConfig} className="space-y-4 text-xs">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-700 dark:text-slate-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                <ShieldCheck className="w-4 h-4" />
                <span>Supabase Configuration</span>
              </p>
              <p className="text-[11px]">
                Enter your Supabase Project URL and Anon Public Key from Project Settings → API in your Supabase dashboard.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Project URL *
              </label>
              <input
                type="url"
                required
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Anon Public Key *
              </label>
              <input
                type="password"
                required
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-[11px]"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl font-bold bg-[#002147] text-white hover:bg-[#00152e] dark:bg-[#d4af37] dark:text-[#002147] transition shadow text-xs"
              >
                Save Credentials
              </button>
              <button
                type="button"
                onClick={handleTestConnection}
                className="px-3.5 py-2.5 rounded-xl font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs"
              >
                Test Link
              </button>
            </div>

            {connectionTestMsg && (
              <p
                className={`text-[11px] font-medium p-2 rounded-xl ${
                  connectionTestSuccess
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300'
                }`}
              >
                {connectionTestMsg}
              </p>
            )}

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-xs font-bold text-[#d4af37] hover:underline"
              >
                ← Return to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
