import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Submission } from '../../types';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  Eye,
  RefreshCw
} from 'lucide-react';

interface AdminSubmissionsPageProps {
  onNavigate: (path: string) => void;
}

export const AdminSubmissionsPage: React.FC<AdminSubmissionsPageProps> = ({ onNavigate }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Rejection modal
  const [rejectTarget, setRejectTarget] = useState<Submission | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  // Detail drawer
  const [viewTarget, setViewTarget] = useState<Submission | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.submissions.getAll();
      setSubmissions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleApprove = async (sub: Submission) => {
    setProcessing(true);
    try {
      await api.submissions.approve(sub.id);
      setSuccess(`Submission for "${sub.business_name}" approved and published!`);
      setTimeout(() => setSuccess(''), 4000);
      fetchSubmissions();
    } catch (err: any) {
      setError(err.message || 'Failed to approve submission');
    } finally {
      setProcessing(false);
    }
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    setProcessing(true);
    try {
      await api.submissions.reject(rejectTarget.id, rejectionReason);
      setSuccess(`Submission "${rejectTarget.business_name}" rejected.`);
      setRejectTarget(null);
      setRejectionReason('');
      setTimeout(() => setSuccess(''), 4000);
      fetchSubmissions();
    } catch (err: any) {
      setError(err.message || 'Failed to reject submission');
    } finally {
      setProcessing(false);
    }
  };

  const filtered = submissions.filter(s =>
    filter === 'all' ? true : s.status === filter
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Business Submissions Moderation</h1>
          <p className="text-sm text-slate-400 mt-1">
            Review user-submitted listings, verify details, and convert approved submissions into live directory spas
          </p>
        </div>
        <button
          onClick={fetchSubmissions}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors w-fit cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          <span>Refresh Queue</span>
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {(['pending', 'approved', 'rejected', 'all'] as const).map(tab => {
          const count = tab === 'all' ? submissions.length : submissions.filter(s => s.status === tab).length;
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

      {/* Submissions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <span>Loading submissions...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <FileCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-white font-semibold text-base">No submissions found</p>
            <p className="text-xs text-slate-500 mt-1">There are no {filter !== 'all' ? filter : ''} listing applications at this time.</p>
          </div>
        ) : (
          filtered.map(sub => (
            <div
              key={sub.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{sub.business_name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{sub.category}</span>
                      <span>•</span>
                      <span>Submitted by {sub.owner_name}</span>
                      <span>•</span>
                      <span>{new Date(sub.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                    sub.status === 'pending'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : sub.status === 'approved'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/15 text-red-400 border border-red-500/30'
                  }`}>
                    {sub.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-200">{sub.city_name}, {sub.area_name}</div>
                    <div className="text-slate-400">{sub.full_address}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-200 font-semibold">{sub.phone}</div>
                    <div className="text-slate-400">{sub.email}</div>
                  </div>
                </div>

                <div className="text-slate-400 line-clamp-2">
                  {sub.description}
                </div>
              </div>

              {sub.rejection_reason && (
                <div className="p-3 bg-red-950/40 border border-red-900 rounded-xl text-xs text-red-300">
                  <strong className="font-semibold">Rejection note:</strong> {sub.rejection_reason}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => setViewTarget(sub)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Full Details</span>
                </button>

                {sub.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRejectTarget(sub)}
                      disabled={processing}
                      className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(sub)}
                      disabled={processing}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-emerald-600/30 flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Publish</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Inspect Details Modal */}
      {viewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span>{viewTarget.business_name}</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-800 rounded-xl space-y-1">
                <div className="font-semibold text-slate-200">Owner Contact</div>
                <div>Name: {viewTarget.owner_name}</div>
                <div>Phone: {viewTarget.phone}</div>
                <div>Email: {viewTarget.email}</div>
                {viewTarget.website && <div>Website: <a href={viewTarget.website} target="_blank" rel="noreferrer" className="text-amber-400 underline">{viewTarget.website}</a></div>}
              </div>

              <div className="p-3 bg-slate-800 rounded-xl space-y-1">
                <div className="font-semibold text-slate-200">Address &amp; Location</div>
                <div>{viewTarget.full_address}</div>
                <div>
                  City: <strong className="text-white">{viewTarget.city_name}</strong> | Area: <strong className="text-white">{viewTarget.area_name}</strong>
                  {viewTarget.pincode && <span> | PIN: <strong className="text-amber-400 font-mono">{viewTarget.pincode}</strong></span>}
                </div>
                {viewTarget.google_maps_url && (
                  <div className="pt-1">
                    <a href={viewTarget.google_maps_url} target="_blank" rel="noreferrer" className="text-amber-400 underline">Google Maps Link</a>
                  </div>
                )}
              </div>

              {viewTarget.keywords && (
                <div className="p-3 bg-slate-800 rounded-xl space-y-1">
                  <div className="font-semibold text-slate-200">Target SEO Keywords</div>
                  <div className="text-emerald-400 font-mono text-[11px]">{viewTarget.keywords}</div>
                </div>
              )}

              {viewTarget.photos_json && viewTarget.photos_json.length > 0 && (
                <div className="p-3 bg-slate-800 rounded-xl space-y-2">
                  <div className="font-semibold text-slate-200">Uploaded Gallery Photos &amp; Alt Tags ({viewTarget.photos_json.length})</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {viewTarget.photos_json.map((p: any, idx: number) => {
                      const url = typeof p === 'string' ? p : p.url;
                      const caption = typeof p === 'object' ? p.caption : '';
                      const alt = typeof p === 'object' ? p.alt_text : '';
                      return (
                        <div key={idx} className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 space-y-1">
                          <img src={url} alt={alt || 'Spa preview'} className="w-full h-20 object-cover rounded-md" />
                          {alt && <div className="text-[10px] text-amber-300 truncate" title={alt}>Alt: {alt}</div>}
                          {caption && <div className="text-[10px] text-slate-400 truncate">{caption}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-800 rounded-xl space-y-1">
                <div className="font-semibold text-slate-200">Description</div>
                <div className="leading-relaxed">{viewTarget.description}</div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setViewTarget(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <span>Reject Submission</span>
            </h3>
            <p className="text-xs text-slate-300">
              Provide a reason for rejecting <strong className="text-white">"{rejectTarget.business_name}"</strong>:
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete address, unable to verify business registration..."
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setRejectTarget(null);
                  setRejectionReason('');
                }}
                disabled={processing}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={processing}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                {processing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
