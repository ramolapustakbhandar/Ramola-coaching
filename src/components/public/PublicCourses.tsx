import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookOpen, Clock, Users, ArrowRight, CheckCircle2, Search, Filter } from 'lucide-react';

export const PublicCourses: React.FC<{ onOpenEnquiry: (courseName?: string) => void }> = ({ onOpenEnquiry }) => {
  const { courses, batches, subjects, chapters } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['ALL', 'ACADEMIC', 'COMPETITIVE', 'GRADUATION'];

  const filteredCourses = courses.filter((c) => {
    const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400">
          Curriculum Catalog
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mt-2">
          Academic & Entrance Courses
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
          From foundational Class 9–10 concepts to advanced undergraduate mathematics and high-stakes entrance exams.
        </p>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search courses, levels, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-[#002147] text-white dark:bg-[#d4af37] dark:text-[#002147]'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat === 'ALL' ? 'All Programs' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredCourses.map((course) => {
          const courseBatches = batches.filter((b) => b.courseId === course.id);
          const courseSubjects = subjects.filter((s) => s.courseId === course.id);

          return (
            <div
              key={course.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#002147] text-white dark:bg-slate-800 dark:text-amber-300">
                      {course.level}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {course.code}
                    </span>
                  </div>
                  <div className="text-lg font-black text-[#d4af37]">
                    ₹{course.fee.toLocaleString()}
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {course.name}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {course.description}
                </p>

                {/* Course Metadata */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-[#d4af37] shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">Duration</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{course.duration}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-[#d4af37] shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">Active Batches</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {courseBatches.length > 0 ? `${courseBatches.length} Schedule(s)` : 'Enrolling Now'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Active Batches details */}
                {courseBatches.length > 0 && (
                  <div className="pt-2 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Timings & Batches:
                    </span>
                    {courseBatches.map((b) => (
                      <div
                        key={b.id}
                        className="px-3 py-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20 text-xs flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-900 dark:text-white">{b.name}</span>
                        <span className="text-slate-600 dark:text-slate-300 font-mono text-[11px]">{b.timing}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  Includes full Offline Test Series & Mistake Analysis
                </span>
                <button
                  onClick={() => onOpenEnquiry(course.name)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#002147] text-white hover:bg-[#00152e] dark:bg-[#d4af37] dark:text-[#002147] dark:hover:bg-[#b89326] transition shadow shrink-0 flex items-center gap-1.5"
                >
                  <span>Inquire for Admission</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
