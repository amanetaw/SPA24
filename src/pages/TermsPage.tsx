import React from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { useSEO } from '../hooks/useSEO';

interface TermsPageProps {
  onNavigate: (path: string) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
  useSEO({
    title: 'Terms of Service | SPA24 Directory Platform',
    description: 'Terms and conditions governing the usage, listing submission, and ownership claim policies of SPA24.',
    canonical: 'https://spa24.online/terms'
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumbs items={[{ label: 'Terms of Service' }]} onNavigate={onNavigate} />

      <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-display">
        Terms of Service
      </h1>
      <p className="text-xs text-stone-500">Effective Date: January 1, 2026 • Version 2.0</p>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900 font-display">1. Acceptance of Terms</h2>
          <p>
            By accessing or using SPA24 (spa24.online), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must discontinue platform usage immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900 font-display">2. Directory Integrity &amp; Prohibition of Fraud</h2>
          <p>
            Users and business representatives strictly warrant that all submitted details—including physical commercial addresses, contact phone lines, and operating schedules—are genuine, active, and lawful. Generating synthetic businesses, virtual offices without physical premises, fake consumer reviews, or fabricated certifications is strictly prohibited and results in permanent blacklisting.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900 font-display">3. Editorial Discretion &amp; Verification</h2>
          <p>
            SPA24 maintains sole editorial discretion to approve, reject, modify, or unpublish any listing that fails to meet our verification criteria. Submitting an application does not guarantee directory publication.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900 font-display">4. Ownership Claims &amp; Unauthorized Representation</h2>
          <p>
            Attempting to claim ownership of an existing business listing without explicit authorization from the legitimate operating business constitutes fraud and will be subject to account termination and legal reporting.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900 font-display">5. Disclaimer of Liability</h2>
          <p>
            While SPA24 verifies basic business authenticity, users contract directly with individual independent venues for wellness treatments. SPA24 is not liable for medical outcomes, treatment cancellations, or personal disputes between clients and listed venues.
          </p>
        </section>
      </div>
    </div>
  );
};
