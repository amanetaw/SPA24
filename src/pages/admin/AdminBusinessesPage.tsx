import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Business, City } from '../../types';
import {
  Building2,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react';

interface AdminBusinessesPageProps {
  onNavigate: (path: string) => void;
}

export const AdminBusinessesPage: React.FC<AdminBusinessesPageProps> = ({ onNavigate }) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCityId, setSelectedCityId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Business | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCities = async () => {
    try {
      const data = await api.admin.getCities();
      setCities(data);
    } catch {
      // Fallback
    }
  };

  const fetchBusinesses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.admin.getBusinesses({
        query: searchQuery || undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        city_id: selectedCityId,
        page,
        limit: 15
      });
      setBusinesses(res.businesses || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch businesses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [selectedStatus, selectedCityId, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBusinesses();
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.admin.updateBusinessStatus(id, newStatus);
      setSuccessMessage(`Business #${id} status updated to ${newStatus}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchBusinesses();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.admin.deleteBusiness(deleteTarget.id);
      setSuccessMessage(`Deleted listing "${deleteTarget.name}" successfully`);
      setDeleteTarget(null);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchBusinesses();
    } catch (err: any) {
      setError(err.message || 'Failed to delete business');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Published
          </span>
        );
      case 'draft':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Draft
          </span>
        );
      case 'suspended':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            Suspended
          </span>
        );
      case 'archived':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-700 text-slate-300">
            Archived
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
            Pending
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Businesses Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Total listings in database: <span className="font-semibold text-amber-400">{totalCount}</span>
          </p>
        </div>
        <button
          id="admin-create-business-btn"
          onClick={() => onNavigate('/admin/businesses/new')}
          className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Business</span>
        </button>
      </div>

      {/* Success / Error Alerts */}
      {successMessage && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by business name, address, or phone..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={selectedCityId || ''}
              onChange={e => {
                setSelectedCityId(e.target.value ? Number(e.target.value) : undefined);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="">All Cities</option>
              {cities.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-xl transition-colors cursor-pointer"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Businesses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700/80">
              <tr>
                <th className="px-5 py-3.5">Business / Category</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Verification</th>
                <th className="px-4 py-3.5 text-center">Views</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading listings...</span>
                    </div>
                  </td>
                </tr>
              ) : businesses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-medium text-slate-300">No businesses found</p>
                    <p className="text-xs text-slate-500 mt-1">Try relaxing your search criteria or create a new listing.</p>
                  </td>
                </tr>
              ) : (
                businesses.map(biz => {
                  const livePath = `/spa/${biz.city_slug || 'bangalore'}/${biz.area_slug || 'indiranagar'}/${biz.slug}`;
                  return (
                    <tr key={biz.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={biz.primary_photo || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=120&q=80'}
                            alt={biz.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-800 border border-slate-700 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-white truncate max-w-xs">{biz.name}</div>
                            <div className="text-xs text-slate-400 truncate">{biz.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs">
                        <div className="text-slate-200 font-medium">{biz.city_name || 'City N/A'}</div>
                        <div className="text-slate-400">
                          {biz.area_name || 'Area N/A'}
                          {(biz.pincode || biz.area_pincode) ? ` • PIN ${biz.pincode || biz.area_pincode}` : ''}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(biz.status)}
                      </td>
                      <td className="px-4 py-4 text-xs">
                        {biz.verification_status === 'verified' && (
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                          </span>
                        )}
                        {biz.verification_status === 'claimed' && (
                          <span className="text-sky-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                          </span>
                        )}
                        {biz.verification_status === 'unverified' && (
                          <span className="text-slate-400">Unverified</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono text-xs font-semibold">
                          <Eye className="w-3 h-3 text-amber-400" />
                          <span>{(biz.view_count || 0).toLocaleString()}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="View Public Profile"
                            onClick={() => onNavigate(livePath)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            title="Edit Listing"
                            id={`edit-business-${biz.id}`}
                            onClick={() => onNavigate(`/admin/businesses/${biz.id}/edit`)}
                            className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <select
                            value={biz.status}
                            onChange={e => handleStatusChange(biz.id, e.target.value)}
                            title="Quick Status Change"
                            className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                          >
                            <option value="published">Publish</option>
                            <option value="draft">Draft</option>
                            <option value="suspended">Suspend</option>
                            <option value="archived">Archive</option>
                          </select>
                          <button
                            title="Delete Listing"
                            onClick={() => setDeleteTarget(biz)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page {page} of {totalPages} ({totalCount} items)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              <span>Confirm Deletion</span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">"{deleteTarget.name}"</strong>?
              This operation will remove the listing, its opening hours, and photos from the directory.
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
                {deleting ? 'Deleting...' : 'Delete Business'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
