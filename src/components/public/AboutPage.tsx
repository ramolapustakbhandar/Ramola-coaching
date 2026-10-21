import React from 'react';
import { Logo } from '../common/Logo';
import { Award, GraduationCap, Target, ShieldCheck, HeartHandshake, CheckCircle } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-left space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400">
          About Ramola Coaching Centre
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mt-2">
          Learn • Practice • Improve
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Founded with a clear academic mission: transforming mathematics and sciences from subjects of anxiety into instruments of triumph.
        </p>
      </div>

      {/* Director Spotlight */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4 flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
            <div className="w-24 h-24 rounded-full bg-[#002147] text-white dark:bg-[#d4af37] dark:text-[#002147] flex items-center justify-center font-black text-3xl shadow-lg mb-4">
              R
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Er. R. Ramola
            </h2>
            <p className="text-xs font-bold text-[#d4af37] uppercase tracking-wider mt-0.5">
              Director & Chief Mentor
            </p>
            <p className="text-xs text-slate-500 mt-2">
              M.Tech in Engineering & Pure Mathematics Specialist. 14+ years of dedicated coaching excellence.
            </p>
          </div>

          <div className="md:col-span-8 space-y-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              A Message from the Director
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              &quot;Over fourteen years of mentoring students across Class 9–12 boards, BSc/BTech mathematics, and competitive entrance examinations (JEE, NDA, CDS), I observed one universal truth: <strong>students do not fail because they lack intelligence</strong>.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              They struggle because nobody systematically diagnoses their micro-errors. A student who repeatedly makes sign mistakes or formula application errors needs targeted feedback, not more blind memorization. That is why we built our comprehensive mistake-classification framework and our student progress tracking platform.&quot;
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Calculus & Analysis
              </span>
              <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Board Examination Toppers
              </span>
              <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                JEE / NDA Strategy
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <Award className="w-8 h-8 text-[#d4af37]" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Uncompromising Academic Quality
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Every lecture, worksheet, and test is carefully curated to bridge the gap between classroom theory and rigorous examination challenges.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <ShieldCheck className="w-8 h-8 text-[#d4af37]" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Transparent Parent Communication
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Parents receive factual, timely updates on attendance, pen-and-paper test marks, and academic progress through our dedicated Parent Portal.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <HeartHandshake className="w-8 h-8 text-[#d4af37]" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Free Community Support
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Our weekly Saturday doubt sessions ensure that financial constraints never prevent a student from accessing expert mathematical mentorship.
          </p>
        </div>
      </div>
    </div>
  );
};
