import React from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { useSEO } from '../hooks/useSEO';

interface PrivacyPolicyPageProps {
  onNavigate: (path: string) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigate }) => {
  useSEO({
    title: 'Privacy Policy | SPA24 Verified Directory',
    description: 'Our commitment to data protection, transparency, and consumer privacy across all directory services.',
    canonical: 'https://spa24.online/privacy-policy'
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumbs items={[{ label: 'Privacy Policy' }]} onNavigate={onNavigate} />

      <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-display">
        Privacy Policy
      </h1>
      <p className="text-xs text-stone-500">Effective Date: January 1, 2026 • Last updated: March 2026</p>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900 font-display">1. Information We Collect</h2>
          <p>
            SPA24 (spa24.online) collects minimal information necessary to maintain a reliable, verified business directory. This includes business identity data (name, operational telephone, premise address, operating hours) publicly published by venue owners, as well as account registration credentials (name, email) for registered representatives.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900 font-display">2. Use of Information</h2>
          <p>
            We use collected data solely to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Display verified spa and wellness listings to the public.</li>
            <li>Conduct manual and automated fraud checks to avoid duplicate and ghost listings.</li>
            <li>Enable business owners to manage and update their authorized profiles.</li>
            <li>Communicate critical verification and moderation status alerts.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900 font-display">3. Third-Party Sharing</h2>
          <p>
            SPA24 does not sell, rent, or lease consumer personal records or applicant contact information to advertisers. Verified business contact numbers and websites are displayed publically by design so that clients may contact venues directly.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900 font-display">4. Data Security &amp; Retention</h2>
          <p>
            We employ modern industry standards to safeguard submitted contact records, passwords (hashed with bcrypt), and verification audit logs.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900 font-display">5. Contact Information</h2>
          <p>
            For privacy inquiries or data removal requests, please contact our legal desk at <a href="mailto:privacy@spa24.online" className="text-emerald-800 underline">privacy@spa24.online</a>.
          </p>
        </section>
      </div>
    </div>
  );
};
