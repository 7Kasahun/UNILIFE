import React, { useState } from 'react';
import { Mail, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto py-4">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-navy-800 tracking-tight">Contact UniLife Ethiopia</h1>
        <p className="text-xs text-slate-500 max-w-lg mx-auto">
          Have questions, suggestions, or university partnership inquiries? We’d love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 bg-navy-800 text-white rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white">Get in Touch</h2>
          <p className="text-xs text-blue-200 leading-relaxed">
            UniLife Ethiopia is maintained by Ethiopian technologists and student contributors dedicated to academic excellence.
          </p>

          <div className="space-y-4 pt-2 text-xs">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>support@unilife.et</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Addis Ababa, Ethiopia</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-base text-navy-800">Message Received!</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Thank you for contacting UniLife Ethiopia. Our support team will respond to your email promptly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Feedback on GPA Calculator"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message *</label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-blue text-white font-bold text-xs hover:bg-blue-700 active:scale-98 transition-all shadow-md shadow-blue-500/20"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
