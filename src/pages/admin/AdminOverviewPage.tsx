import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  Building2,
  MapPin,
  Sparkles,
  BookOpen,
  FileCheck,
  ShieldAlert,
  AlertTriangle,
  Users,
  PlusCircle,
  ExternalLink,
  RefreshCw,
  Database,
  Globe,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface AdminOverviewPageProps {
  onNavigate: (path: string) => void;
}

export const AdminOverviewPage: React.FC<AdminOverviewPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, logsRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getAuditLogs()
      ]);
      setStats(statsRes);
      setAuditLogs(logsRes.slice(0, 10));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Directory overview, moderation queues, and operational status
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors w-fit cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/50 border border-red-800 text-red-300 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('/admin/businesses')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 cursor-pointer transition-all hover:bg-slate-850 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Businesses</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white tracking-tight">
              {stats?.totalBusinesses ?? (loading ? '...' : 0)}
            </span>
          </div>
          <div className="mt-2 text-xs text-amber-400/90 font-medium">Manage Listings &rarr;</div>
        </div>

        <div
          onClick={() => onNavigate('/admin/cities')}
          className="bg-slate-900 border border-slate-800 hover:border-sky-500/40 rounded-2xl p-5 cursor-pointer transition-all hover:bg-slate-850 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Cities</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white tracking-tight">
              {stats?.totalCities ?? (loading ? '...' : 0)}
            </span>
          </div>
          <div className="mt-2 text-xs text-sky-400/90 font-medium">Manage Locations &rarr;</div>
        </div>

        <div
          onClick={() => onNavigate('/admin/areas')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 cursor-pointer transition-all hover:bg-slate-850 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Areas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white tracking-tight">
              {stats?.totalAreas ?? (loading ? '...' : 0)}
            </span>
          </div>
          <div className="mt-2 text-xs text-emerald-400/90 font-medium">Browse Sub-localities &rarr;</div>
        </div>

        <div
          onClick={() => onNavigate('/admin/services')}
          className="bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-5 cursor-pointer transition-all hover:bg-slate-850 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Services</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white tracking-tight">
              {stats?.totalServices ?? (loading ? '...' : 0)}
            </span>
          </div>
          <div className="mt-2 text-xs text-purple-400/90 font-medium">Treatment Taxonomies &rarr;</div>
        </div>
      </div>

      {/* Moderation Attention Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <span>Moderation & Inquiries Queue</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigate('/admin/submissions')}
            className="p-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">Pending Submissions</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                (stats?.pendingSubmissions || 0) > 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-400'
              }`}>
                {stats?.pendingSubmissions ?? 0}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              New spa applications awaiting verification before being published.
            </p>
          </div>

          <div
            onClick={() => onNavigate('/admin/claims')}
            className="p-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">Ownership Claims</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                (stats?.pendingClaims || 0) > 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-400'
              }`}>
                {stats?.pendingClaims ?? 0}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Business owner verification requests for listed establishments.
            </p>
          </div>

          <div
            onClick={() => onNavigate('/admin/reports')}
            className="p-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">Inaccuracy Reports</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                (stats?.pendingReports || 0) > 0 ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-400'
              }`}>
                {stats?.pendingReports ?? 0}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              User reports concerning closed spas, wrong phones, or inaccurate photos.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div>
        <h2 className="text-base font-bold text-white mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigate('/admin/businesses/new')}
            className="p-3 bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 rounded-xl text-left transition-all group cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-semibold text-white">Add Business</div>
            <div className="text-[11px] text-slate-400 mt-0.5">New Directory listing</div>
          </button>

          <button
            onClick={() => onNavigate('/admin/cities/new')}
            className="p-3 bg-slate-900 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800/80 rounded-xl text-left transition-all group cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-sky-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-semibold text-white">Add City</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Expand to new market</div>
          </button>

          <button
            onClick={() => onNavigate('/admin/areas/new')}
            className="p-3 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 rounded-xl text-left transition-all group cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-semibold text-white">Add Area</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Local neighborhood</div>
          </button>

          <button
            onClick={() => onNavigate('/admin/services/new')}
            className="p-3 bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/80 rounded-xl text-left transition-all group cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-semibold text-white">Add Service</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Treatment category</div>
          </button>

          <button
            onClick={() => onNavigate('/admin/blog/new')}
            className="p-3 bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-800/80 rounded-xl text-left transition-all group cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-semibold text-white">Write Article</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Editorial SEO content</div>
          </button>

          <button
            onClick={() => onNavigate('/admin/settings')}
            className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-600 hover:bg-slate-800/80 rounded-xl text-left transition-all group cursor-pointer"
          >
            <Database className="w-4 h-4 text-slate-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-semibold text-white">System & DB</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Database & SEO tools</div>
          </button>
        </div>
      </div>

      {/* Two columns: Recent Audit Activity & SEO/System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audit Activity */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Recent Audit Logs</span>
            </h2>
            <button
              onClick={() => onNavigate('/admin/settings')}
              className="text-xs text-amber-400 hover:underline cursor-pointer"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No audit logs logged yet.</p>
            ) : (
              auditLogs.map(log => (
                <div
                  key={log.id}
                  className="flex items-start justify-between text-xs p-2.5 rounded-lg bg-slate-800/40 border border-slate-800"
                >
                  <div className="space-y-0.5">
                    <div className="font-mono font-semibold text-amber-300">
                      {log.action}
                    </div>
                    <div className="text-slate-400">
                      Entity: <span className="text-slate-300">{log.entity_type} #{log.entity_id || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SEO & Engine Health */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>SEO & Infrastructure Readiness</span>
          </h2>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">Dynamic XML Sitemap</p>
                <p className="text-[11px] text-slate-400">Includes all published Spas, Cities, Areas, Services & Blog</p>
              </div>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
              >
                <span>/sitemap.xml</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">Robots.txt Configuration</p>
                <p className="text-[11px] text-slate-400">Protects /admin & /api, allows public directory indexation</p>
              </div>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
              >
                <span>/robots.txt</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">Database Engine</p>
                <p className="text-[11px] text-slate-400">
                  {stats?.dbStatus?.mode === 'mysql' ? 'Hostinger MySQL Database Connected' : 'JSON Storage Engine (Persistent)'}
                </p>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-semibold border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
