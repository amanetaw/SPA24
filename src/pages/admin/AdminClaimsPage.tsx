import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Claim } from '../../types';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Building2,
  User,
  Phone,
  Mail,
  AlertCircle,
  FileText,
  RefreshCw
} from 'lucide-react';

interface AdminClaimsPageProps {
  onNavigate: (path: string) => void;
}

export const AdminClaimsPage: React.FC<AdminClaimsPageProps> = ({ onNavigate }) => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState<'pending' | 'verified' | 'rejected' | 'all'>('pending');
  const [processing, setProcessing] = useState(false);

  const fetchClaims = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.claims.getAll();
      setClaims(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load ownership claims');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleVerify = async (claim: Claim) => {
    setProcessing(true);
    try {
      await api.claims.verify(claim.id);
      setSuccess(`Claim for "${claim.business_name}" approved and verified! User now has owner rights.`);
      setTimeout(() => setSuccess(''), 4000);
      fetchClaims();
    } catch (err: any) {
      setError(err.message || 'Failed to verify claim');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (claim: Claim) => {
    setProcessing(true);
    try {
      await api.claims.reject(claim.id);
      setSuccess(`Claim for "${claim.business_name}" rejected.`);
      setTimeout(() => setSuccess(''), 4000);
      fetchClaims();
    } catch (err: any) {
      setError(err.message || 'Failed to reject claim');
    } finally {
      setProcessing(false);
    }
  };

  const filtered = claims.filter(c =>
    filter === 'all' ? true : c.status === filter
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Ownership Claims Verification</h1>
          <p className="text-sm text-slate-400 mt-1">
            Validate business proof documents and assign verified ownership portals to legitimate spa proprietors
          </p>
        </div>
        <button
          onClick={fetchClaims}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors w-fit cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          <span>Refresh Claims</span>
        </button>
      </div>

      {success && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {(['pending', 'verified', 'rejected', 'all'] as const).map(tab => {
          const count = tab === 'all' ? claims.length : claims.filter(c => c.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer flex items-center gap-2 ${
                filter === tab
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{tab}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filter === tab ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Claims List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <span>Loading claims...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-white font-semibold text-base">No claims found</p>
            <p className="text-xs text-slate-500 mt-1">There are no {filter !== 'all' ? filter : ''} verification requests at this moment.</p>
          </div>
        ) : (
          filtered.map(claim => (
            <div
              key={claim.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{claim.business_name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>Listing #{claim.business_id}</span>
                      <span>•</span>
                      <span>Filed on {new Date(claim.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                  claim.status === 'pending'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : claim.status === 'verified'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/15 text-red-400 border border-red-500/30'
                }`}>
                  {claim.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                <div className="p-3 bg-slate-800/60 rounded-xl space-y-1">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5 mb-1">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Claimant Information</span>
                  </div>
                  <div>Name: <strong className="text-white">{claim.applicant_name || claim.claimant_name || 'N/A'}</strong></div>
                  <div>Role / Position: {claim.applicant_role || claim.claimant_role || 'Owner / Representative'}</div>
                  <div>Email: {claim.applicant_email || claim.claimant_email || 'N/A'}</div>
                  <div>Phone: {claim.applicant_phone || claim.claimant_phone || 'N/A'}</div>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl space-y-1">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5 mb-1">
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    <span>Verification Method & Notes</span>
                  </div>
                  <div className="text-slate-300 leading-relaxed">
                    Method: <span className="font-semibold text-white uppercase">{claim.verification_method || 'Email OTP'}</span>
                  </div>
                  {claim.proof_notes && (
                    <div className="text-slate-400 text-[11px] pt-1 leading-relaxed">
                      Notes: {claim.proof_notes}
                    </div>
                  )}
                  {claim.proof_document_url ? (
                    <div className="pt-2">
                      <a
                        href={claim.proof_document_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-400 underline font-semibold flex items-center gap-1"
                      >
                        View Verification Attachment
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>

              {claim.status === 'pending' && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleReject(claim)}
                    disabled={processing}
                    className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Reject Claim
                  </button>
                  <button
                    onClick={() => handleVerify(claim)}
                    disabled={processing}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-emerald-600/30 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify & Grant Access</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
