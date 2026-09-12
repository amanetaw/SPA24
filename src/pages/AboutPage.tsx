import React from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { useSEO } from '../hooks/useSEO';
import { ShieldCheck, Target, Award, Users, CheckCircle2 } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  useSEO({
    title: 'About SPA24 | The Verified Spa & Wellness Directory',
    description: 'Learn about SPA24’s mission to provide honest, verified, zero-spam wellness information connecting discerning seekers with licensed spas.',
    canonical: 'https://spa24.online/about'
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Breadcrumbs items={[{ label: 'About Us' }]} onNavigate={onNavigate} />

      <header className="space-y-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Integrity First</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight font-display">
          Building India&apos;s Most Trusted Wellness Index
        </h1>
        <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
          SPA24 was founded to solve a pervasive problem: online directories saturated with fake listings, misleading ratings, ghost addresses, and unverified reviews.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-stone-900 font-display">Our Core Mission</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            To provide 100% accurate, operationally active, and physically verified directory profiles for genuine spa, massage therapy, and Ayurvedic healing facilities.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-stone-900 font-display">Zero Fake Data Guarantee</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            We never generate synthetic testimonials, mock 5-star ratings, or fictitious awards. All phone lines, street addresses, and therapist services are manually validated by editorial staff.
          </p>
        </div>
      </div>

      <section className="bg-stone-50 rounded-2xl p-6 sm:p-8 border border-stone-200 space-y-4">
        <h2 className="text-xl font-bold text-stone-900 font-display">
          Our Four Pillars of Quality
        </h2>
        <div className="space-y-3 text-xs text-stone-700">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900">Telephone Line Verification:</strong> Every business contact number is dialed to verify active operation and reception availability.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900">Physical Premise Checking:</strong> We cross-reference municipal commercial records and street mapping to ensure every address is authentic.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900">Direct-to-Venue Pricing:</strong> We do not charge user booking commissions, ensuring clients receive transparent in-house rates.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900">Community Corrections:</strong> Visitors and verified owners can instantly propose schedule changes or flag inaccuracies via our public feedback tooling.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
