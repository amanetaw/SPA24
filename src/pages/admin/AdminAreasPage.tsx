import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Area, City } from '../../types';
import {
  MapPin,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye
} from 'lucide-react';

interface AdminAreasPageProps {
  onNavigate: (path: string) => void;
}

export const AdminAreasPage: React.FC<AdminAreasPageProps> = ({ onNavigate }) => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCityId, setSelectedCityId] = useState<number | undefined>(undefined);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<Area | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [areasData, citiesData] = await Promise.all([
        api.admin.getAreas(),
        api.admin.getCities()
      ]);
      setAreas(areasData);
      setCities(citiesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load areas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTogglePublish = async (area: Area) => {
    try {
      await api.admin.updateArea(area.id, {
        is_published: !area.is_published
      });
      setSuccess(`Area "${area.name}" ${!area.is_published ? 'published' : 'moved to draft'}`);
      setTimeout(() => setSuccess(''), 3000);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle publication');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.admin.deleteArea(deleteTarget.id);
      setSuccess(`Deleted area "${deleteTarget.name}" successfully`);
      setDeleteTarget(null);
      setTimeout(() => setSuccess(''), 3000);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete area');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = areas.filter(a => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase()) ||
      (a.city_name && a.city_name.toLowerCase().includes(search.toLowerCase())) ||
      (a.pincode && a.pincode.includes(search));

    const matchesCity = !selectedCityId || a.city_id === selectedCityId;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Areas & Localities</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage sub-locality landing pages, geo-clusters, and neighborhood search nodes
          </p>
        </div>
        <button
          id="admin-create-area-btn"
          onClick={() => onNavigate('/admin/areas/new')}
          className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Area</span>
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

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by area name, pincode, or city..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={selectedCityId || ''}
          onChange={e => setSelectedCityId(e.target.value ? Number(e.target.value) : undefined)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Cities</option>
          {cities.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Areas Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700/80">
              <tr>
                <th className="px-5 py-3.5">Area Name / Slug</th>
                <th className="px-4 py-3.5">Parent City</th>
                <th className="px-4 py-3.5">Pincode</th>
                <th className="px-4 py-3.5 text-center">Spas</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading areas...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-medium text-slate-300">No areas found</p>
                  </td>
                </tr>
              ) : (
                filtered.map(area => (
                  <tr key={area.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{area.name}</div>
                      <div className="text-xs font-mono text-slate-400">/{area.slug}</div>
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-slate-300">
                      {area.city_name || `City #${area.city_id}`}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-300">
                      {area.pincode || '—'}
                    </td>
                    <td className="px-4 py-4 text-center font-mono text-xs text-emerald-400 font-semibold">
                      {area.published_count || 0}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleTogglePublish(area)}
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                          area.is_published
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {area.is_published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="View Area Hub"
                          onClick={() => onNavigate(`/spa/${area.city_slug || 'bangalore'}/${area.slug}`)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          title="Edit Area"
                          id={`edit-area-${area.id}`}
                          onClick={() => onNavigate(`/admin/areas/${area.id}/edit`)}
                          className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete Area"
                          onClick={() => setDeleteTarget(area)}
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
              <span>Confirm Delete Area</span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">"{deleteTarget.name}"</strong>?
              Businesses linked to this area will need their area reassigned.
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
                {deleting ? 'Deleting...' : 'Delete Area'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
