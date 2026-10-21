import React from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';
import {
  BookOpen,
  HelpCircle,
  FileCheck2,
  GraduationCap,
  Award,
  Users,
  Target,
  ArrowRight,
  Sparkles,
  PhoneCall,
  MapPin,
  Calendar,
  CheckCircle,
} from 'lucide-react';

export const PublicHome: React.FC<{ onOpenEnquiry: (course?: string) => void }> = ({ onOpenEnquiry }) => {
  const { courses, setActiveTab } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 md:pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200/80 dark:border-slate-800/80 bg-linear-to-b from-white via-slate-50 to-amber-50/20 dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading and Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                Premier Offline Coaching & Learning Platform
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                RAMOLA <br />
                <span className="text-[#002147] dark:text-[#d4af37]">COACHING CENTRE</span>
              </h1>

              <p className="text-lg sm:text-xl font-bold tracking-wide text-[#d4af37] dark:text-[#e5c158]">
                Learn • Practice • Improve
              </p>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                Dedicated academic excellence and competitive mathematics mentorship directed by <strong>Er. R. Ramola</strong>. We combine rigorous offline classroom coaching, structured paper tests, personalized mistake-analysis systems, and digital learning tools to build foundational clarity.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onOpenEnquiry()}
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-[#002147] text-white hover:bg-[#00152e] dark:bg-[#d4af37] dark:text-[#002147] dark:hover:bg-[#b89326] transition shadow-lg flex items-center gap-2"
                >
                  <span>Enroll for Current Session</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveTab('doubt-session')}
                  className="px-5 py-3.5 rounded-xl font-bold text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-2"
                >
                  <HelpCircle className="w-4 h-4 text-[#d4af37]" />
                  <span>Free Doubt Session</span>
                </button>

                <button
                  onClick={() => setActiveTab('free-test')}
                  className="px-5 py-3.5 rounded-xl font-bold text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-2"
                >
                  <FileCheck2 className="w-4 h-4 text-[#d4af37]" />
                  <span>Free Weekly Test</span>
                </button>
              </div>

              {/* Key Credentials Strip */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    14+
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Years of Mentorship</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-[#d4af37]">
                    100%
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Concept Mastery</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    15
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Mistake Rubrics Tracked</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card with Official Logo */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      Admissions Open 2025–26
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400">
                    Offline Batches
                  </span>
                </div>

                {/* Big Official Logo Display */}
                <div className="py-4 flex flex-col items-center justify-center text-center">
                  <Logo size="xl" showText={false} />
                  <h2 className="mt-4 text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    Ramola Coaching Centre
                  </h2>
                  <p className="text-xs font-semibold text-[#d4af37] tracking-widest uppercase mt-0.5">
                    Learn • Practice • Improve
                  </p>
                </div>

                {/* Quick Info Box */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Director & Senior Faculty:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Er. R. Ramola</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Focus Areas:</span>
                    <span className="font-bold text-[#d4af37]">Board, Higher & Competitive Maths</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Free Doubt Session:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Every Saturday 4:00 PM</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('portal')}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-[#002147] text-white hover:bg-[#00152e] dark:bg-[#d4af37] dark:text-[#002147] transition shadow flex items-center justify-center gap-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Student & Parent Portal Login</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Courses Section */}
      <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#d4af37]">
                Academic & Competitive Programs
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
                Courses Offered at Ramola Centre
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-xl">
                Structured curriculums designed to eliminate fear of mathematics and science through systematic step-by-step clarity.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('courses')}
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-bold text-[#002147] dark:text-[#d4af37] hover:underline"
            >
              <span>View All Courses & Batches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group flex flex-col justify-between rounded-3xl p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 hover:border-[#d4af37] dark:hover:border-[#d4af37] transition shadow-xs hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#002147] text-white dark:bg-slate-800 dark:text-amber-300">
                      {course.level}
                    </span>
                    <span className="text-xs font-black text-[#d4af37]">
                      ₹{course.fee.toLocaleString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#002147] dark:group-hover:text-[#d4af37] transition line-clamp-2">
                    {course.name}
                  </h3>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3">
                    <span>Duration:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{course.duration}</span>
                  </div>
                  <button
                    onClick={() => onOpenEnquiry(course.name)}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 hover:bg-[#002147] hover:text-white dark:hover:bg-[#d4af37] dark:hover:text-[#002147] transition"
                  >
                    Inquire for Batch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Weekly Doubt Session Spotlight */}
      <section className="py-16 bg-linear-to-r from-[#002147] to-[#00152e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
                <HelpCircle className="w-3.5 h-3.5" />
                Community Academic Service
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white">
                Free Weekly Doubt Session
              </h2>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Every Saturday from 4:00 PM to 6:00 PM, Ramola Coaching Centre opens its doors to all students (Classes 9, 10, 11, 12, Graduation, and competitive aspirants). Bring your toughest textbook problems, question papers, or exam doubts. Er. R. Ramola personally solves them step-by-step.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
                  <div className="font-bold text-sm text-[#d4af37]">Zero Cost</div>
                  <p className="text-xs text-slate-300 mt-0.5">100% free for all students, no strings attached.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
                  <div className="font-bold text-sm text-[#d4af37]">Personal Attention</div>
                  <p className="text-xs text-slate-300 mt-0.5">One-on-one whiteboard & calculation assistance.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
                  <div className="font-bold text-sm text-[#d4af37]">Mistake Diagnosis</div>
                  <p className="text-xs text-slate-300 mt-0.5">Learn why signs flip and where arithmetic goes wrong.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <div className="p-6 rounded-3xl bg-white text-slate-900 shadow-xl space-y-4 text-center">
                <Calendar className="w-8 h-8 text-[#002147] mx-auto" />
                <h3 className="text-lg font-black text-slate-900">
                  Next Session: This Saturday
                </h3>
                <p className="text-xs text-slate-600">
                  Time: 4:00 PM – 6:00 PM <br />
                  Location: Ramola Coaching Main Hall
                </p>
                <button
                  onClick={() => setActiveTab('doubt-session')}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#002147] text-white hover:bg-[#00152e] transition shadow"
                >
                  Register Seat for Free
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Ramola Methodology */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-[#d4af37]">
              The Ramola Framework
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
              Why Students Excel at Ramola
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Most students lose 10–25% of their marks not because they don’t understand concepts, but due to unanalyzed recurring mistakes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#d4af37] flex items-center justify-center font-black text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Learn Concepts Deeply
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Direct classroom delivery with visual proofs and zero rote-memorization. Every formula is derived from first principles.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#d4af37] flex items-center justify-center font-black text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Practice with Offline Tests
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Bi-weekly pen-and-paper tests simulating real board & exam conditions. Exam temperament cannot be built on screens alone.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#d4af37] flex items-center justify-center font-black text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Improve via Mistake Analysis
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Each returned test breaks down marks lost into 15 specific categories: Sign slips, calculation errors, or diagram omissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <footer className="mt-16 pt-12 pb-8 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={true} />
          </div>
          <div className="text-center sm:text-right">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Ramola Coaching Centre • Learn • Practice • Improve
            </p>
            <p className="mt-1 text-[11px]">
              Offline Classes & Online Learning Platform • Directed by Er. R. Ramola
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
