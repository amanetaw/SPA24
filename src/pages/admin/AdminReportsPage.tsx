import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Report } from '../../types';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface AdminReportsPageProps {
  onNavigate: (path: string) => void;
}

export const AdminReportsPage: React.FC<AdminReportsPageProps> = ({ onNavigate }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState<'pending' | 'resolved' | 'dismissed' | 'all'>('pending');
  const [processing, setProcessing] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.reports.getAll();
      setReports(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id: number) => {
    setProcessing(true);
    try {
      await api.reports.resolve(id);
      setSuccess('Report marked as resolved.');
      setTimeout(() => setSuccess(''), 3000);
      fetchReports();
    } catch (err: any) {
      setError(err.message || 'Failed to resolve report');
    } finally {
      setProcessing(false);
    }
  };

  const handleDismiss = async (id: number) => {
    setProcessing(true);
    try {
      await api.reports.dismiss(id);
      setSuccess('Report dismissed.');
      setTimeout(() => setSuccess(''), 3000);
      fetchReports();
    } catch (err: any) {
      setError(err.message || 'Failed to dismiss report');
    } finally {
      setProcessing(false);
    }
  };

  const filtered = reports.filter(r =>
    filter === 'all' ? true : r.status === filter
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Listing Inaccuracy & Fraud Reports</h1>
          <p className="text-sm text-slate-400 mt-1">
            Consumer reports flagging closed establishments, deceptive pricing, or policy violations
          </p>
        </div>
        <button
          onClick={fetchReports}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors w-fit cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          <span>Refresh Reports</span>
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
        {(['pending', 'resolved', 'dismissed', 'all'] as const).map(tab => {
          const count = tab === 'all' ? reports.length : reports.filter(r => r.status === tab).length;
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

      {/* Reports List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <span>Loading reports...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <AlertTriangle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-white font-semibold text-base">No reports found</p>
            <p className="text-xs text-slate-500 mt-1">All consumer flags have been addressed.</p>
          </div>
        ) : (
          filtered.map(rep => (
            <div
              key={rep.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{rep.business_name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-semibold text-red-400 uppercase tracking-wider">{rep.reason}</span>
                      <span>•</span>
                      <span>Listing #{rep.business_id}</span>
                      <span>•</span>
                      <span>{new Date(rep.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                  rep.status === 'pending'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : rep.status === 'resolved'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {rep.status}
                </span>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl space-y-2 text-xs text-slate-300">
                <div className="font-semibold text-slate-200">Consumer Details & Notes:</div>
                <p className="leading-relaxed">{rep.details || 'No additional notes provided.'}</p>
                {rep.reporter_email && (
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-700/60">
                    Reporter: {rep.reporter_email}
                  </div>
                )}
              </div>

              {rep.status === 'pending' && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <button
                    onClick={() => onNavigate(`/admin/businesses/${rep.business_id}/edit`)}
                    className="text-xs text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
                  >
                    Inspect & Edit Business Listing
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDismiss(rep.id)}
                      disabled={processing}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Dismiss Flag
                    </button>
                    <button
                      onClick={() => handleResolve(rep.id)}
                      disabled={processing}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-emerald-600/30 cursor-pointer"
                    >
                      Mark Resolved
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
