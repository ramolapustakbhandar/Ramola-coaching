import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HelpCircle, CheckCircle, Calendar, Clock, MapPin, Sparkles, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

export const FreeDoubtSession: React.FC = () => {
  const { courses, submitEnquiry } = useApp();

  const [studentName, setStudentName] = useState('');
  const [phone, setPhone] = useState('');
  const [grade, setGrade] = useState('Class 10');
  const [doubtTopic, setDoubtTopic] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !phone.trim()) return;

    submitEnquiry({
      studentName: studentName.trim(),
      phone: phone.trim(),
      courseInterested: `Free Saturday Doubt Session (${grade})`,
      classLevel: grade,
      message: `Registered for upcoming Free Saturday Doubt Session. Doubt area: ${doubtTopic}`,
    });

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });

    setIsRegistered(true);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-left">
      {/* Top Banner */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400">
          Community Initiative
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mt-2">
          Free Weekly Doubt Session
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Open to every aspiring student in the city. Bring your hardest questions, unsolved board problems, or conceptual roadblocks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Information Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Why We Host This For Free
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              At Ramola Coaching Centre, we firmly believe no student should abandon higher mathematics or sciences simply because an unanswered doubt snowballed into exam fear. Our founder, <strong>Er. R. Ramola</strong>, conducts these sessions personally to ensure every student gains fundamental confidence.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <strong className="text-slate-900 dark:text-white">No Enrollment Required:</strong> You don’t need to be a paid student at Ramola Centre to attend.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <strong className="text-slate-900 dark:text-white">Whiteboard Problem Solving:</strong> Watch step-by-step mathematical proofs derived live with zero hand-waving.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <strong className="text-slate-900 dark:text-white">Mistake Notebook Guidance:</strong> Learn how to classify calculation slips vs sign mistakes so they never repeat.
                </div>
              </div>
            </div>

            {/* Logistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#d4af37] shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-slate-900 dark:text-white">Every Saturday</div>
                  <div className="text-slate-500">Weekly Schedule</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#d4af37] shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-slate-900 dark:text-white">4:00 – 6:00 PM</div>
                  <div className="text-slate-500">2 Full Hours</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#d4af37] shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-slate-900 dark:text-white">Main Offline Hall</div>
                  <div className="text-slate-500">Ramola Centre</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Registration Card */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl">
            {!isRegistered ? (
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Reserve a Free Seat
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Seats in the main classroom hall are allocated on a first-come first-served basis. Register to get your confirmation pass.
                </p>

                <form onSubmit={handleRegister} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Student Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      WhatsApp / Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Your Current Class / Exam
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                    >
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                      <option value="Class 11">Class 11</option>
                      <option value="Class 12">Class 12</option>
                      <option value="Graduation (BSc/BTech)">Graduation (BSc / BTech / BA)</option>
                      <option value="Competitive (JEE/NDA)">Competitive (JEE / NDA / CDS / AFCAT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Topics You Plan to Bring (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={doubtTopic}
                      onChange={(e) => setDoubtTopic(e.target.value)}
                      placeholder="e.g. Quadratic word equations, Chain Rule, Trigonometry"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-bold text-xs bg-[#002147] text-white hover:bg-[#00152e] dark:bg-[#d4af37] dark:text-[#002147] dark:hover:bg-[#b89326] transition shadow-md flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Confirm Free Session Registration</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white">
                  Seat Confirmed!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Welcome, <strong>{studentName}</strong>. Your pass for the Saturday Doubt Session has been registered. Bring your questions notebook at 4:00 PM.
                </p>
                <button
                  onClick={() => setIsRegistered(false)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  Register Another Student
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
