import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Correction } from '../../types';
import {
  FileEdit,
  CheckCircle2,
  XCircle,
  Building2,
  AlertCircle,
  RefreshCw,
  Edit
} from 'lucide-react';

interface AdminCorrectionsPageProps {
  onNavigate: (path: string) => void;
}

export const AdminCorrectionsPage: React.FC<AdminCorrectionsPageProps> = ({ onNavigate }) => {
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState<'pending' | 'applied' | 'rejected' | 'all'>('pending');
  const [processing, setProcessing] = useState(false);

  const fetchCorrections = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.admin.getCorrections();
      setCorrections(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load corrections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCorrections();
  }, []);

  const handleApply = async (c: Correction) => {
    setProcessing(true);
    try {
      await api.admin.updateCorrection(c.id, 'applied');
      setSuccess(`Correction for "${c.business_name}" marked as applied.`);
      setTimeout(() => setSuccess(''), 3000);
      fetchCorrections();
    } catch (err: any) {
      setError(err.message || 'Failed to update correction');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (c: Correction) => {
    setProcessing(true);
    try {
      await api.admin.updateCorrection(c.id, 'rejected');
      setSuccess(`Correction rejected.`);
      setTimeout(() => setSuccess(''), 3000);
      fetchCorrections();
    } catch (err: any) {
      setError(err.message || 'Failed to reject correction');
    } finally {
      setProcessing(false);
    }
  };

  const filtered = corrections.filter(c =>
    filter === 'all' ? true : c.status === filter
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Suggested Edit Corrections</h1>
          <p className="text-sm text-slate-400 mt-1">
            Community suggestions for updated phone numbers, revised operating hours, or address changes
          </p>
        </div>
        <button
          onClick={fetchCorrections}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors w-fit cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          <span>Refresh List</span>
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
        {(['pending', 'applied', 'rejected', 'all'] as const).map(tab => {
          const count = tab === 'all' ? corrections.length : corrections.filter(c => c.status === tab).length;
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

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <span>Loading corrections...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <FileEdit className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-white font-semibold text-base">No corrections found</p>
            <p className="text-xs text-slate-500 mt-1">There are no {filter !== 'all' ? filter : ''} suggested edits to review.</p>
          </div>
        ) : (
          filtered.map(item => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <FileEdit className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{item.business_name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>Listing #{item.business_id}</span>
                      <span>•</span>
                      <span>Submitted on {new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                  item.status === 'pending'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : item.status === 'applied'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/15 text-red-400 border border-red-500/30'
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl space-y-2 text-xs text-slate-300">
                <div className="font-semibold text-slate-200">Proposed Edits & Feedback:</div>
                <p className="leading-relaxed whitespace-pre-line">
                  {item.notes || item.suggested_changes || (item.proposed_data_json ? JSON.stringify(item.proposed_data_json, null, 2) : 'No description provided')}
                </p>
                {item.user_email && (
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-700/60">
                    Contributed by: {item.user_email}
                  </div>
                )}
              </div>

              {item.status === 'pending' && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <button
                    onClick={() => onNavigate(`/admin/businesses/${item.business_id}/edit`)}
                    className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Open Business Editor</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(item)}
                      disabled={processing}
                      className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApply(item)}
                      disabled={processing}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-emerald-600/30 cursor-pointer"
                    >
                      Mark Applied
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
