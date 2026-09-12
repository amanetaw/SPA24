import React from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { useSEO } from '../hooks/useSEO';
import { ShieldCheck, PhoneCall, MapPin, FileCheck2, AlertOctagon, CheckCircle } from 'lucide-react';

interface VerificationGuidelinesPageProps {
  onNavigate: (path: string) => void;
}

export const VerificationGuidelinesPage: React.FC<VerificationGuidelinesPageProps> = ({ onNavigate }) => {
  useSEO({
    title: 'Verification Standards & Editorial Guidelines | SPA24',
    description: 'Learn how SPA24 validates phone lines, premise addresses, and certifications to guarantee genuine wellness listings.',
    canonical: 'https://spa24.online/verification-guidelines'
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Verification Guidelines' }]} onNavigate={onNavigate} />

      <header className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Integrity Standard</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-display">
          Listing Verification Guidelines
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          SPA24 enforces rigorous verification criteria to protect wellness clients from counterfeit venues and misleading advertising.
        </p>
      </header>

      <div className="space-y-6 text-xs sm:text-sm text-stone-700">
        {/* Guideline 1 */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-stone-900 font-bold font-display text-base">
            <PhoneCall className="w-5 h-5 text-emerald-700" />
            <span>1. Operational Telephone Validation</span>
          </div>
          <p className="leading-relaxed">
            All submitted phone numbers undergo operational verification. Our team verifies that:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-stone-600">
            <li>The phone connects directly to the named spa reception desk or official hotline.</li>
            <li>Voice responses confirm business hours and physical location.</li>
            <li>Disconnected numbers or redirected generic call centers are rejected immediately.</li>
          </ul>
        </div>

        {/* Guideline 2 */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-stone-900 font-bold font-display text-base">
            <MapPin className="w-5 h-5 text-emerald-700" />
            <span>2. Physical Commercial Address Verification</span>
          </div>
          <p className="leading-relaxed">
            SPA24 exclusively lists businesses with legitimate, physical premises. We require:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-stone-600">
            <li>Complete building details, unit/suite numbers, and identifiable landmarks.</li>
            <li>No PO boxes, virtual mail drops, or residential apartments without dedicated commercial spa licensing.</li>
            <li>Cross-verification with satellite street mapping and municipal business tax records.</li>
          </ul>
        </div>

        {/* Guideline 3 */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-stone-900 font-bold font-display text-base">
            <FileCheck2 className="w-5 h-5 text-emerald-700" />
            <span>3. Authentic Photos &amp; Transparency</span>
          </div>
          <p className="leading-relaxed">
            Venues must provide genuine exterior and interior photographs showcasing reception, treatment rooms, and hygienic amenities. Submissions utilizing low-resolution stock images or stolen imagery from other establishments will be rejected.
          </p>
        </div>

        {/* Guideline 4 */}
        <div className="bg-rose-50/60 rounded-2xl border border-rose-200 p-6 space-y-3">
          <div className="flex items-center gap-2 text-rose-900 font-bold font-display text-base">
            <AlertOctagon className="w-5 h-5 text-rose-700" />
            <span>4. Strict Prohibition Against Unlawful Operations</span>
          </div>
          <p className="text-rose-900 leading-relaxed text-xs">
            SPA24 is strictly dedicated to legitimate, therapeutic, and certified health wellness. Any establishment found offering or soliciting non-therapeutic, uncertified, or illicit services will be immediately removed and reported to relevant regulatory authorities.
          </p>
        </div>
      </div>
    </div>
  );
};
