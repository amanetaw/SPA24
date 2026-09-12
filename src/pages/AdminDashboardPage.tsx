import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Business, Submission, Claim, UserReport, City, Service } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSEO } from '../hooks/useSEO';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  RefreshCw
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'submissions' | 'claims' | 'reports' | 'businesses'>('submissions');

  // Data states
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [error, setError] = useState('');

  useSEO({
    title: 'Admin Verification & Moderation Suite | SPA24',
    description: 'Review pending spa listings, verify ownership claims, inspect user inaccuracy reports, and audit changes.',
    canonical: 'https://spa24.online/admin'
  });

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [subRes, claimRes, repRes, bizRes] = await Promise.all([
        api.submissions.getAll('pending'),
        api.claims.getAll('pending'),
        api.admin.getReports(),
        api.businesses.search({ limit: 50, sort: 'newest' })
      ]);
      setSubmissions(subRes);
      setClaims(claimRes);
      setReports(repRes);
      setBusinesses(bizRes.businesses);
    } catch (err: any) {
      setError(err.message || 'Failed to load moderation queue. Admin privileges required.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'editor')) {
      loadAll();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Submission actions
  const handleApproveSubmission = async (id: number) => {
    try {
      const res = await api.submissions.approve(id);
      setActionMessage(`Submission approved! Business created and published.`);
      loadAll();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to approve submission.');
    }
  };

  const handleRejectSubmission = async (id: number) => {
    const reason = prompt('Enter rejection reason:') || 'Incomplete or unverified information.';
    try {
      await api.submissions.reject(id, reason);
      setActionMessage('Submission rejected.');
      loadAll();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to reject submission.');
    }
  };

  // Claim actions
  const handleVerifyClaim = async (id: number) => {
    try {
      await api.claims.review(id, 'verified');
      setActionMessage('Claim verified! Business ownership transferred to applicant.');
      loadAll();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to verify claim.');
    }
  };

  const handleRejectClaim = async (id: number) => {
    const reason = prompt('Enter claim rejection reason:') || 'Unable to verify authorization.';
    try {
      await api.claims.review(id, 'rejected', reason);
      setActionMessage('Claim rejected.');
      loadAll();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to reject claim.');
    }
  };

  // Report actions
  const handleResolveReport = async (id: number, status: 'resolved' | 'dismissed') => {
    try {
      await api.admin.resolveReport(id, `Marked as ${status} by administrator.`);
      setActionMessage(`Report marked as ${status}.`);
      loadAll();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to resolve report.');
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-xl font-bold text-stone-900 font-display">Administrator Access Required</h2>
        <p className="text-xs text-stone-600">
          This portal is restricted to authorized SPA24 editors and administrators.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onNavigate('/login?redirect=/admin')}
            className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold"
          >
            Sign In with Staff Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-stone-900 font-display">
              Editorial Verification Console
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 uppercase tracking-wider">
              {user.role}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Manual vetting console strictly upholding directory integrity and anti-spam protocols.
          </p>
        </div>

        <button
          onClick={loadAll}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-stone-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'submissions'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <span>Pending Submissions</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">
            {submissions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'claims'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <span>Ownership Claims</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px]">
            {claims.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'reports'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <span>Inaccuracy Reports</span>
          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px]">
            {reports.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('businesses')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'businesses'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <span>All Published Listings</span>
          <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px]">
            {businesses.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Submissions */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
              No pending listings in the queue. All submissions have been processed.
            </div>
          ) : (
            submissions.map((sub) => {
              const serviceCount = Array.isArray(sub.service_ids)
                ? sub.service_ids.length
                : (typeof (sub as any).raw_data === 'string'
                    ? (JSON.parse((sub as any).raw_data)?.service_ids?.length || 0)
                    : ((sub as any).raw_data?.service_ids?.length || 0));
              return (
                <div
                  key={sub.id}
                  className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-stone-400">#SUB-{sub.id}</span>
                      <h3 className="text-base font-bold text-stone-900 font-display">
                        {sub.business_name}
                      </h3>
                      <p className="text-xs text-stone-500">
                        Submitted by <span className="font-semibold">{sub.owner_name}</span> ({sub.email} • {sub.phone})
                      </p>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 self-start sm:self-auto">
                      {sub.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-semibold">Address &amp; Location</span>
                      <p className="font-medium text-stone-800">{sub.full_address}</p>
                      <p className="text-stone-500">{sub.area_name}, {sub.city_name}</p>
                    </div>

                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-semibold">Digital Presence</span>
                      {sub.website ? (
                        <a href={sub.website} target="_blank" rel="noopener noreferrer" className="text-emerald-800 hover:underline truncate block">
                          {sub.website}
                        </a>
                      ) : (
                        <p className="text-stone-400">No website provided</p>
                      )}
                      {sub.booking_url && (
                        <a href={sub.booking_url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline block text-[11px]">
                          Booking Link
                        </a>
                      )}
                    </div>

                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-semibold">Selected Services</span>
                      <p className="text-stone-600">
                        {serviceCount} therapies registered
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
                    <button
                      onClick={() => handleRejectSubmission(sub.id)}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Reject Submission
                    </button>
                    <button
                      onClick={() => handleApproveSubmission(sub.id)}
                      className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                    >
                      Approve &amp; Publish Listing
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Claims */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          {claims.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
              No pending ownership claims.
            </div>
          ) : (
            claims.map((claim) => (
              <div
                key={claim.id}
                className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-stone-900 font-display">
                      Claim for: {claim.business_name} (ID #{claim.business_id})
                    </h3>
                    <p className="text-xs text-stone-500">
                      Applicant: <span className="font-semibold">{claim.applicant_name}</span> ({claim.applicant_role})
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800 self-start sm:self-auto">
                    {claim.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">Applicant Contact</span>
                    <p className="font-medium text-stone-800">{claim.applicant_email}</p>
                    <p className="text-stone-500">{claim.applicant_phone}</p>
                  </div>

                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">Method &amp; Token</span>
                    <p className="font-mono text-stone-800">{claim.verification_method}</p>
                    <p className="font-mono text-[11px] text-stone-500">{claim.verification_token}</p>
                  </div>

                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">Applicant Proof Notes</span>
                    <p className="text-stone-600 line-clamp-3">{claim.proof_notes || 'None provided'}</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
                  <button
                    onClick={() => handleRejectClaim(claim.id)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Reject Claim
                  </button>
                  <button
                    onClick={() => handleVerifyClaim(claim.id)}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    Verify &amp; Assign Ownership
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
              No pending inaccuracy reports from visitors.
            </div>
          ) : (
            reports.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 shadow-xs text-xs"
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <span className="font-bold text-stone-900">
                    Report #{r.id} for {r.business_name} (ID #{r.business_id})
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 uppercase">
                    {r.reason}
                  </span>
                </div>

                <p className="text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-100">
                  {r.details}
                </p>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-stone-400 text-[11px]">
                    Reporter: {r.reporter_name || 'Anonymous'} ({r.reporter_email || 'No email'})
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResolveReport(r.id, 'dismissed')}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleResolveReport(r.id, 'resolved')}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: All Published Listings */}
      {activeTab === 'businesses' && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
            <h3 className="font-bold text-xs text-stone-800 uppercase tracking-wider">
              Directory Registry ({businesses.length})
            </h3>
            <span className="text-xs text-stone-500">Live on SPA24</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-stone-200">
              <thead className="bg-stone-50 text-stone-500 text-[11px] uppercase">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Locality</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Verification</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {businesses.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-stone-400">#{b.id}</td>
                    <td className="px-4 py-3 font-bold">{b.name}</td>
                    <td className="px-4 py-3 text-stone-600">{b.area_name}, {b.city_name}</td>
                    <td className="px-4 py-3">{b.phone}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 capitalize">
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 capitalize">
                        {b.verification_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onNavigate(`/spa/${b.city_slug}/${b.area_slug}/${b.slug}`)}
                        className="text-emerald-800 hover:underline font-semibold"
                      >
                        View Live →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
