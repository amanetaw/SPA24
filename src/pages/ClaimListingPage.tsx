import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Business, Claim } from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { useAuth } from '../context/AuthContext';
import { useSEO } from '../hooks/useSEO';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Mail,
  Phone,
  Globe,
  Lock,
  Building2
} from 'lucide-react';

interface ClaimListingPageProps {
  onNavigate: (path: string) => void;
  preselectedBusinessId?: number | null;
}

export const ClaimListingPage: React.FC<ClaimListingPageProps> = ({
  onNavigate,
  preselectedBusinessId
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  // Claim form states
  const [applicantName, setApplicantName] = useState(user?.full_name || '');
  const [applicantEmail, setApplicantEmail] = useState(user?.email || '');
  const [applicantPhone, setApplicantPhone] = useState(user?.phone || '');
  const [applicantRole, setApplicantRole] = useState('Owner / Managing Partner');
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'website_token' | 'phone' | 'manual_admin'>('email');
  const [proofNotes, setProofNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<{ message: string; claim: Claim } | null>(null);
  const [error, setError] = useState('');

  useSEO({
    title: 'Claim Your Business Listing | SPA24 Verification',
    description: 'Claim ownership of your existing spa listing on SPA24. Gain full management access to update schedules, photos, and services.',
    canonical: 'https://spa24.online/claim-listing'
  });

  // If preselectedBusinessId is passed, load that business directly
  useEffect(() => {
    if (preselectedBusinessId) {
      api.businesses.getById(preselectedBusinessId)
        .then((b) => setSelectedBusiness(b))
        .catch(() => {});
    }
  }, [preselectedBusinessId]);

  // Search debounce for finding business
  useEffect(() => {
    if (selectedBusiness) return;
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const res = await api.businesses.search({ q: searchQuery.trim(), limit: 6 });
          setSearchResults(res.businesses);
        } catch {
          // ignore
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedBusiness]);

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('You must sign in or create an account to claim a business listing.');
      return;
    }

    if (!selectedBusiness) {
      setError('Please search and select the business listing you want to claim.');
      return;
    }

    if (!applicantName || !applicantEmail || !applicantPhone || !applicantRole) {
      setError('Please fill in all applicant details.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.claims.create({
        business_id: selectedBusiness.id,
        applicant_name: applicantName,
        applicant_email: applicantEmail,
        applicant_phone: applicantPhone,
        applicant_role: applicantRole,
        verification_method: verificationMethod,
        proof_notes: proofNotes.trim()
      });

      setClaimSuccess(res);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Failed to submit claim request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Claim Listing' }]} onNavigate={onNavigate} />

      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Verified Ownership Program</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-display">
          Claim an Existing Spa Listing
        </h1>

        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          If your business is already listed in the SPA24 directory, claim it to update operating hours, upload authentic venue photos, manage service pricing, and display a verified badge.
        </p>
      </div>

      {!user && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-amber-900">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>You need to be logged into a SPA24 user account to file a claim.</span>
          </div>
          <button
            onClick={() => onNavigate('/login?redirect=/claim-listing')}
            className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-semibold shrink-0"
          >
            Sign In First
          </button>
        </div>
      )}

      {claimSuccess ? (
        <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center space-y-4 shadow-sm">
          <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-bold text-stone-900 font-display">
            Claim Request Successfully Submitted
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
            Your claim for <span className="font-bold text-stone-900">{selectedBusiness?.name}</span> is registered under verification token <span className="font-mono font-bold text-emerald-800">{claimSuccess.claim.verification_token}</span>.
          </p>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Our editorial administrator will verify your credentials within 24 business hours. You will receive an email confirmation once verified.
          </p>
          <div className="pt-4">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Go to Owner Dashboard
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmitClaim} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Select Business */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-stone-900 font-display flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>1. Find Your Business Listing</span>
            </h2>

            {selectedBusiness ? (
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-sm text-stone-900">{selectedBusiness.name}</p>
                  <p className="text-xs text-stone-600">{selectedBusiness.address}</p>
                  <p className="text-[11px] text-stone-500">{selectedBusiness.city_name} • {selectedBusiness.phone}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBusiness(null)}
                  className="px-3 py-1 bg-white hover:bg-stone-100 text-stone-700 rounded-lg text-xs font-semibold border border-stone-200 shrink-0"
                >
                  Change Listing
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by spa name, phone, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
                </div>

                {searchResults.length > 0 && (
                  <div className="border border-stone-200 rounded-xl divide-y divide-stone-100 overflow-hidden bg-white shadow-xs">
                    {searchResults.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBusiness(b)}
                        className="p-3 hover:bg-emerald-50/60 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-bold text-stone-900">{b.name}</p>
                          <p className="text-stone-500 text-[11px]">{b.address}</p>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-800 shrink-0">
                          Select This Spa →
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery.length >= 2 && searchResults.length === 0 && (
                  <p className="text-xs text-stone-500 p-2">
                    No matching listings found. If your spa is not yet indexed, please{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('/list-your-spa')}
                      className="text-emerald-800 font-semibold underline"
                    >
                      Submit a New Listing
                    </button>
                    .
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Applicant Information */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-stone-900 font-display flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-700" />
              <span>2. Applicant Ownership Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Your Role at the Business *
                </label>
                <select
                  value={applicantRole}
                  onChange={(e) => setApplicantRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-stone-800 cursor-pointer"
                >
                  <option value="Owner / Managing Partner">Owner / Managing Partner</option>
                  <option value="General Manager">General Manager</option>
                  <option value="Marketing Director">Marketing Director</option>
                  <option value="Authorized Representative">Authorized Representative</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Official Business Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@businessdomain.com"
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Direct Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Verification Method */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-stone-900 font-display flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>3. Verification Method</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'email',
                  title: 'Official Domain Email',
                  desc: 'We verify using your company domain email matching the website.',
                  icon: Mail
                },
                {
                  id: 'phone',
                  title: 'Phone Callback',
                  desc: 'We call the listed business telephone to confirm your authorization.',
                  icon: Phone
                },
                {
                  id: 'website_token',
                  title: 'Website Meta / DNS Tag',
                  desc: 'Place a unique verification token on your official website.',
                  icon: Globe
                },
                {
                  id: 'manual_admin',
                  title: 'Document Upload / Manual Review',
                  desc: 'Provide utility bill or trade license for manual editorial approval.',
                  icon: FileCheck
                }
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = verificationMethod === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setVerificationMethod(m.id as any)}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-600 shadow-2xs'
                        : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-stone-900 mb-1">
                      <Icon className="w-4 h-4 text-emerald-700" />
                      <span>{m.title}</span>
                    </div>
                    <p className="text-stone-500 text-[11px] leading-relaxed">{m.desc}</p>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Additional Notes / Supporting Documentation Link
              </label>
              <textarea
                rows={2}
                placeholder="Include link to official website team page, business registration info, or instructions..."
                value={proofNotes}
                onChange={(e) => setProofNotes(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !user || !selectedBusiness}
              className="px-8 py-3 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Processing Claim...' : 'Submit Claim for Review'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
