import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Photo } from '../../types';
import {
  Image as ImageIcon,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Building2
} from 'lucide-react';

interface AdminPhotosPageProps {
  onNavigate: (path: string) => void;
}

export const AdminPhotosPage: React.FC<AdminPhotosPageProps> = ({ onNavigate }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchPhotos = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.admin.getAllPhotos();
      setPhotos(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load photo assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleDelete = async (photo: Photo) => {
    if (!window.confirm(`Delete this photo from ${photo.business_name || 'business'}?`)) return;
    setDeletingId(photo.id);
    try {
      await api.admin.deletePhoto(photo.id);
      setSuccess('Photo deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchPhotos();
    } catch (err: any) {
      setError(err.message || 'Failed to delete photo');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = photos.filter(p =>
    (p.business_name && p.business_name.toLowerCase().includes(search.toLowerCase())) ||
    (p.caption && p.caption.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Photo & Media Asset Moderation</h1>
          <p className="text-sm text-slate-400 mt-1">
            Audit venue photography, cover banners, treatment room galleries, and remove non-compliant images
          </p>
        </div>
        <button
          onClick={fetchPhotos}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors w-fit cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          <span>Refresh Media</span>
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

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search photos by business name or caption..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Photo Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span>Loading image assets...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <ImageIcon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-semibold text-base">No photos found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(photo => (
            <div
              key={photo.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group hover:border-slate-700 transition-all flex flex-col"
            >
              <div className="relative aspect-video bg-slate-950 overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.caption || 'Spa facility'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as any).src = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <button
                  onClick={() => handleDelete(photo)}
                  disabled={deletingId === photo.id}
                  title="Delete Photo"
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="font-semibold text-xs text-white truncate">
                    {photo.business_name || `Business #${photo.business_id}`}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">
                    {photo.caption || 'Venue photo'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
                  <span>Photo #{photo.id}</span>
                  <button
                    onClick={() => onNavigate(`/admin/businesses/${photo.business_id}/edit`)}
                    className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Manage</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
