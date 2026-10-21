import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ContactPage: React.FC = () => {
  const { submitEnquiry } = useApp();

  const [studentName, setStudentName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('Class 10 Mathematics & Science');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !phone.trim()) return;

    submitEnquiry({
      studentName: studentName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      courseInterested: course,
      message: message.trim(),
    });

    confetti({
      particleCount: 50,
      spread: 60,
    });

    setSubmitted(true);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-left space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400">
          Connect With Us
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mt-2">
          Contact Ramola Coaching
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Visit our offline centre or send an admission inquiry. Our academic counselors will get back to you immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Information & Office Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Centre Information
            </h2>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block">Offline Campus:</strong>
                  <span className="text-slate-600 dark:text-slate-300">
                    Ramola Coaching Centre, Main Academic Arcade, Near Clock Tower & Central Market.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block">Telephone & WhatsApp:</strong>
                  <a href="tel:+919876543210" className="text-slate-600 dark:text-slate-300 hover:text-[#d4af37]">
                    +91 98765 43210 / +91 98765 43211
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block">Email Admissions:</strong>
                  <a href="mailto:admissions@ramolacoaching.com" className="text-slate-600 dark:text-slate-300 hover:text-[#d4af37]">
                    admissions@ramolacoaching.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block">Office Working Hours:</strong>
                  <span className="text-slate-600 dark:text-slate-300">
                    Monday to Saturday: 9:00 AM – 8:00 PM <br />
                    Sunday: 9:30 AM – 2:00 PM (Test Sessions)
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <span className="font-bold text-[#d4af37] block mb-1">Director Consultations:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  Parents wishing to consult personally with Er. R. Ramola regarding academic stream selection are requested to book an appointment in advance.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl">
            {!submitted ? (
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Send a Direct Message
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Leave your details and query; our admissions desk will follow up promptly.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="e.g. Ananya Negi"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Phone / WhatsApp *
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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Program of Interest
                      </label>
                      <select
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                      >
                        <option value="Class 9–10 Foundation">Class 9–10: Mathematics & Science</option>
                        <option value="Class 11–12 Mathematics">Class 11–12: Advanced Mathematics</option>
                        <option value="Graduation Mathematics">Graduation Mathematics (BSc/BTech/BA)</option>
                        <option value="Competitive Mathematics">Competitive: JEE / NDA / CDS / AFCAT</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Your Query or Message
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask about batch timings, fees, demo classes, or upcoming test series..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-bold text-xs bg-[#002147] text-white hover:bg-[#00152e] dark:bg-[#d4af37] dark:text-[#002147] dark:hover:bg-[#b89326] transition shadow-md flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Inquiry Message</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white">
                  Message Sent!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                  Thank you, <strong>{studentName}</strong>. Your inquiry has been logged in our admissions queue. We will contact you at <strong>{phone}</strong> shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  Send Another Inquiry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
