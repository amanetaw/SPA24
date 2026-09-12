import React, { useState } from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { useSEO } from '../hooks/useSEO';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

interface ContactPageProps {
  onNavigate: (path: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  useSEO({
    title: 'Contact Editorial Desk & Support | SPA24',
    description: 'Get in touch with the SPA24 directory moderation team for business listing inquiries, partnerships, or verification assistance.',
    canonical: 'https://spa24.online/contact'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Breadcrumbs items={[{ label: 'Contact Us' }]} onNavigate={onNavigate} />

      <header className="space-y-3">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-display">
          Contact SPA24
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Need help with your business verification, claim token, or editorial feedback? Reach out to our operational team.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact info cards */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-2 shadow-xs">
            <Mail className="w-5 h-5 text-emerald-700" />
            <h2 className="text-sm font-bold text-stone-900 font-display">Editorial &amp; Verification</h2>
            <p className="text-xs text-stone-600">contact@spa24.online</p>
            <p className="text-[11px] text-stone-400">Response within 24 business hours</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-2 shadow-xs">
            <Phone className="w-5 h-5 text-emerald-700" />
            <h2 className="text-sm font-bold text-stone-900 font-display">Verification Hotline</h2>
            <p className="text-xs text-stone-600">+91 (022) 2654-8900</p>
            <p className="text-[11px] text-stone-400">Mon - Fri, 9:30 AM to 6:00 PM IST</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-2 shadow-xs">
            <MapPin className="w-5 h-5 text-emerald-700" />
            <h2 className="text-sm font-bold text-stone-900 font-display">Headquarters</h2>
            <p className="text-xs text-stone-600">Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra 400051</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2">
          {sent ? (
            <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center space-y-4 shadow-xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h2 className="text-lg font-bold text-stone-900 font-display">Message Dispatched</h2>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                Thank you for contacting SPA24. An editorial staff member will review your correspondence shortly.
              </p>
              <button
                onClick={() => setSent(false)}
                className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-stone-800"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Listing Verification Issue">Listing Verification Issue</option>
                  <option value="Claim Token Assistance">Claim Token Assistance</option>
                  <option value="Inaccurate Data Report">Inaccurate Data Report</option>
                  <option value="Partnership & Press">Partnership & Press</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Your Message</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide detailed information regarding your inquiry or reference listing ID..."
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Inquiry</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
