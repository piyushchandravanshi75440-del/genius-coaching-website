import React, { useState } from 'react';
import { TESTIMONIAL_PLACEHOLDERS, BRAND_INFO } from '../data/coachingData';
import {
  MessageSquare,
  Quote,
  CheckCircle2,
  Send,
  Star,
  ShieldCheck,
  MapPin,
  Sparkles,
  HeartHandshake,
  GraduationCap
} from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'class10' | 'class9' | 'bseb' | 'cbse'>('all');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [childName, setChildName] = useState('');
  const [studentClass, setStudentClass] = useState('Class 10');
  const [boardType, setBoardType] = useState('BSEB');
  const [userRole, setUserRole] = useState<'Parent' | 'Student'>('Parent');
  const [reviewMessage, setReviewMessage] = useState('');

  const filteredReviews = TESTIMONIAL_PLACEHOLDERS.filter((item) => {
    if (activeFilter === 'class10') return item.classTag.includes('Class 10');
    if (activeFilter === 'class9') return item.classTag.includes('Class 9');
    if (activeFilter === 'bseb') return item.classTag.includes('BSEB');
    if (activeFilter === 'cbse') return item.classTag.includes('CBSE');
    return true;
  });

  const handleSendReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !reviewMessage.trim()) return;

    const message = `*Parent Feedback Submission for Genius Coaching Centre*\nParent/Student Name: ${authorName}\nStudent: ${childName || 'N/A'}\nRole: ${userRole}\nClass & Board: ${studentClass} (${boardType})\nFeedback: ${reviewMessage}`;
    const url = `${BRAND_INFO.whatsappBaseUrl}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setShowReviewForm(false);
    setAuthorName('');
    setChildName('');
    setReviewMessage('');
  };

  return (
    <section id="reviews" className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-200 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider mb-3.5 border border-blue-200 shadow-xs">
            <HeartHandshake className="w-4 h-4 text-blue-700" />
            <span>Parents Trust & Genuine Feedback</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display">
            Humare Parents Ka Bharosa
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Bhabua ke Class 9 aur 10 ke parents ka sachha anubhav — regular tests, doubt solving, aur board exams me shandar result ki guarantee.
          </p>

          {/* Social Proof Trust Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-700 font-semibold">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-xs">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="font-bold text-slate-900">4.9 / 5.0 Rating</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">Bhabua Parents</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Verified Parent Reviews</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 shadow-xs">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Class 9 & 10 (BSEB / CBSE)</span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'all', label: 'All Reviews (6)' },
              { id: 'class10', label: 'Class 10 Board' },
              { id: 'class9', label: 'Class 9 Foundation' },
              { id: 'bseb', label: 'BSEB (Bihar Board)' },
              { id: 'cbse', label: 'CBSE Board' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 mb-14">
          {filteredReviews.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative group"
            >
              {/* Top Accent Highlight Tag */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {item.highlightTag && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/80">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>{item.highlightTag}</span>
                  </span>
                )}
              </div>

              {/* Quote Content */}
              <div className="relative mb-6">
                <Quote className="w-8 h-8 text-slate-200 absolute -top-3 -left-1 -z-0 opacity-70" />
                <p className="text-sm text-slate-700 leading-relaxed font-normal relative z-10 pt-1">
                  “{item.quote}”
                </p>
              </div>

              {/* Parent Author Details */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-700 to-indigo-900 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                    {item.avatarInitials || item.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {item.name}
                      </h4>
                      <span title="Verified Parent" className="inline-flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-500">
                      {item.role}
                    </p>

                    {item.location && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{item.location}</span>
                      </p>
                    )}
                  </div>
                </div>

                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200 shrink-0 self-start">
                  {item.classTag}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Parent Submission & Trust Banner */}
        <div className="max-w-3xl mx-auto rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 p-6 sm:p-8 text-white text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold mb-3 border border-white/10">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Aapka Feedback Humare Liye Sabse Kimti Hai</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Kya Aapka Bachha Bhi Genius Coaching Centre Me Padh Raha Hai?
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              Apna anubhav humare sath share karein. Aapka feedback dusre parents ko sahi margdarshan chunne me madad karta hai.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{showReviewForm ? 'Form Band Karein' : 'Apna Feedback Likhein'}</span>
              </button>

              <a
                href={BRAND_INFO.whatsappBaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors"
              >
                <span>Direct WhatsApp Par Bat Karein</span>
              </a>
            </div>

            {/* Interactive Feedback Form */}
            {showReviewForm && (
              <form
                onSubmit={handleSendReview}
                className="mt-6 pt-6 border-t border-white/15 text-left bg-white/5 p-4 sm:p-6 rounded-xl space-y-4 backdrop-blur-xs"
              >
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-amber-400" />
                  <span>Feedback Form — Genius Coaching Centre</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Parent / Guardian Ka Naam *
                    </label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. Rameshwar Singh"
                      className="w-full text-xs px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Bachhe (Student) Ka Naam
                    </label>
                    <input
                      type="text"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="e.g. Aditya Kumar"
                      className="w-full text-xs px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Aap Kaun Hain?</label>
                    <select
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value as 'Parent' | 'Student')}
                      className="w-full text-xs px-2 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="Parent">Parent (Mata/Pita)</option>
                      <option value="Student">Student (Vidhyarthi)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Class</label>
                    <select
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      className="w-full text-xs px-2 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="Class 10">Class 10</option>
                      <option value="Class 9">Class 9</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Board</label>
                    <select
                      value={boardType}
                      onChange={(e) => setBoardType(e.target.value)}
                      className="w-full text-xs px-2 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="BSEB">Bihar Board (BSEB)</option>
                      <option value="CBSE">CBSE Board</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Aapka Anubhav / Honest Feedback *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reviewMessage}
                    onChange={(e) => setReviewMessage(e.target.value)}
                    placeholder="Teachers ka padhana kaisa laga? Tests aur doubt clearing se bachhe me kya badlav aaya..."
                    className="w-full text-xs px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all"
                >
                  <Send className="w-3.5 h-3.5 text-slate-950" />
                  <span>Send Feedback Directly via WhatsApp</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

export default ReviewsSection;
