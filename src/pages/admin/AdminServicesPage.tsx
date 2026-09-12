import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Service } from '../../types';
import {
  Sparkles,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye
} from 'lucide-react';

interface AdminServicesPageProps {
  onNavigate: (path: string) => void;
}

export const AdminServicesPage: React.FC<AdminServicesPageProps> = ({ onNavigate }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.admin.getServices();
      setServices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.admin.deleteService(deleteTarget.id);
      setSuccess(`Deleted service "${deleteTarget.name}" successfully`);
      setDeleteTarget(null);
      setTimeout(() => setSuccess(''), 3000);
      fetchServices();
    } catch (err: any) {
      setError(err.message || 'Failed to delete service');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase()) ||
    s.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Services & Taxonomy</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage treatment categories, therapeutic descriptions, and service landing pages
          </p>
        </div>
        <button
          id="admin-create-service-btn"
          onClick={() => onNavigate('/admin/services/new')}
          className="py-2.5 px-4 bg-purple-500 hover:bg-purple-400 text-slate-950 font-semibold text-sm rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-purple-500/20 cursor-pointer w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Service</span>
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

      {/* Search Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search treatments by name, category, or slug..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700/80">
              <tr>
                <th className="px-5 py-3.5">Service / Treatment</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">URL Slug</th>
                <th className="px-4 py-3.5 text-center">Spas Offering</th>
                <th className="px-4 py-3.5">Popular</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading treatment catalog...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-medium text-slate-300">No services found</p>
                  </td>
                </tr>
              ) : (
                filtered.map(svc => (
                  <tr key={svc.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{svc.name}</div>
                      <div className="text-xs text-slate-400 line-clamp-1">{svc.short_desc}</div>
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-purple-300">
                      {svc.category}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-300">
                      /{svc.slug}
                    </td>
                    <td className="px-4 py-4 text-center font-mono text-xs text-purple-400 font-semibold">
                      {svc.published_count || 0}
                    </td>
                    <td className="px-4 py-4 text-xs">
                      {svc.is_popular ? (
                        <span className="text-amber-400 font-medium">★ Top Trend</span>
                      ) : (
                        <span className="text-slate-500">Standard</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="View Public Service Page"
                          onClick={() => onNavigate(`/services/${svc.slug}`)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          title="Edit Service"
                          id={`edit-service-${svc.id}`}
                          onClick={() => onNavigate(`/admin/services/${svc.id}/edit`)}
                          className="p-1.5 text-purple-400 hover:text-purple-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete Service"
                          onClick={() => setDeleteTarget(svc)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              <span>Confirm Delete Service</span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">"{deleteTarget.name}"</strong>?
              This will remove the service definition from the master taxonomy.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-red-600/30 cursor-pointer"
              >
                {deleting ? 'Deleting...' : 'Delete Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
