import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { City } from '../../types';
import {
  MapPin,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye
} from 'lucide-react';

interface AdminCitiesPageProps {
  onNavigate: (path: string) => void;
}

export const AdminCitiesPage: React.FC<AdminCitiesPageProps> = ({ onNavigate }) => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<City | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCities = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.admin.getCities();
      setCities(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load cities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleTogglePublish = async (city: City) => {
    try {
      await api.admin.updateCity(city.id, {
        is_published: !city.is_published
      });
      setSuccess(`City "${city.name}" ${!city.is_published ? 'published' : 'moved to draft'}`);
      setTimeout(() => setSuccess(''), 3000);
      fetchCities();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle publication');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.admin.deleteCity(deleteTarget.id);
      setSuccess(`Deleted city "${deleteTarget.name}" successfully`);
      setDeleteTarget(null);
      setTimeout(() => setSuccess(''), 3000);
      fetchCities();
    } catch (err: any) {
      setError(err.message || 'Failed to delete city');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = cities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.state.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Cities Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure target municipal markets, SEO hub pages, and geographic coverage
          </p>
        </div>
        <button
          id="admin-create-city-btn"
          onClick={() => onNavigate('/admin/cities/new')}
          className="py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-sky-500/20 cursor-pointer w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New City</span>
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
            placeholder="Search by city name, state, or slug..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Cities Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700/80">
              <tr>
                <th className="px-5 py-3.5">City / State</th>
                <th className="px-4 py-3.5">URL Slug</th>
                <th className="px-4 py-3.5 text-center">Spas</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Featured</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading cities...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-medium text-slate-300">No cities found</p>
                  </td>
                </tr>
              ) : (
                filtered.map(city => (
                  <tr key={city.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{city.name}</div>
                      <div className="text-xs text-slate-400">{city.state}, {city.country}</div>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-300">
                      /{city.slug}
                    </td>
                    <td className="px-4 py-4 text-center font-mono text-xs text-sky-400 font-semibold">
                      {city.published_count || 0}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleTogglePublish(city)}
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                          city.is_published
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {city.is_published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-xs">
                      {city.is_popular ? (
                        <span className="text-amber-400 font-medium">★ Featured</span>
                      ) : (
                        <span className="text-slate-500">Standard</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="View Public City Hub"
                          onClick={() => onNavigate(`/spa/${city.slug}`)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          title="Edit City"
                          id={`edit-city-${city.id}`}
                          onClick={() => onNavigate(`/admin/cities/${city.id}/edit`)}
                          className="p-1.5 text-sky-400 hover:text-sky-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete City"
                          onClick={() => setDeleteTarget(city)}
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              <span>Confirm Delete City</span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">"{deleteTarget.name}"</strong>?
              Ensure no active spas depend on this city before deletion.
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
                {deleting ? 'Deleting...' : 'Delete City'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
