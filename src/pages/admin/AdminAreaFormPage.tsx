import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Area, City } from '../../types';
import {
  ArrowLeft,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
  Globe
} from 'lucide-react';

interface AdminAreaFormPageProps {
  areaId?: number;
  onNavigate: (path: string) => void;
}

export const AdminAreaFormPage: React.FC<AdminAreaFormPageProps> = ({
  areaId,
  onNavigate
}) => {
  const isEditing = !!areaId;
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [cities, setCities] = useState<City[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(!isEditing);
  const [cityId, setCityId] = useState<number>(0);
  const [pincode, setPincode] = useState('');
  const [description, setDescription] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const citiesData = await api.admin.getCities();
        setCities(citiesData);
        if (citiesData.length > 0 && !cityId) {
          setCityId(citiesData[0].id);
        }

        if (isEditing && areaId) {
          const area = await api.admin.getArea(areaId);
          setName(area.name);
          setSlug(area.slug);
          setAutoSlug(false);
          setCityId(area.city_id);
          setPincode(area.pincode || '');
          setDescription(area.description || '');
          setSeoTitle(area.seo_title || '');
          setMetaDescription(area.meta_description || '');
          setIsPopular(!!area.is_popular);
          setIsPublished(area.is_published !== false);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to initialize area data');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [areaId, isEditing]);

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Area Name is required');
      return;
    }
    if (!cityId) {
      setError('City selection is required');
      return;
    }

    setSaving(true);
    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      city_id: cityId,
      pincode: pincode.trim(),
      description: description.trim(),
      seo_title: seoTitle.trim() || null,
      meta_description: metaDescription.trim() || null,
      is_popular: isPopular,
      is_published: isPublished
    };

    try {
      if (isEditing && areaId) {
        await api.admin.updateArea(areaId, payload);
        setSuccess('Area updated successfully!');
      } else {
        await api.admin.createArea(payload);
        setSuccess('Area created successfully!');
      }
      setTimeout(() => {
        onNavigate('/admin/areas');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to save area');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading area details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/admin/areas')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isEditing ? `Edit Area: ${name}` : 'Add New Area'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Defines neighborhood hubs and sub-locality landing pages
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : isEditing ? 'Update Area' : 'Create Area'}</span>
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span>Area Parameters</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Area / Locality Name <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. Indiranagar"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">URL Slug</label>
              <label className="text-[11px] text-slate-400 flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSlug}
                  onChange={e => setAutoSlug(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500"
                />
                Auto
              </label>
            </div>
            <input
              type="text"
              value={slug}
              onChange={e => {
                setAutoSlug(false);
                setSlug(e.target.value);
              }}
              placeholder="indiranagar"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Parent City <span className="text-emerald-400">*</span>
            </label>
            <select
              value={cityId}
              onChange={e => setCityId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {cities.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.state})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Postal Code / PIN</label>
            <input
              type="text"
              value={pincode}
              onChange={e => setPincode(e.target.value)}
              placeholder="e.g. 560038"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Area Overview Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Discover the finest boutique spas, massage therapy studios, and wellness parlours in Indiranagar..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* SEO & Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>SEO & Publication Controls</span>
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              SEO Meta Title (Overrides default)
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={e => setSeoTitle(e.target.value)}
              placeholder="Best Spas in Indiranagar Bangalore | Top Rated Wellness - SPA24"
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              SEO Meta Description
            </label>
            <textarea
              rows={2}
              value={metaDescription}
              onChange={e => setMetaDescription(e.target.value)}
              placeholder="Find verified luxury spas and massage centers in Indiranagar, Bangalore with photos, prices and contact info..."
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-6 pt-3 border-t border-slate-800">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={e => setIsPublished(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
              />
              <span>Published (Accessible on directory and sitemap)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={e => setIsPopular(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
              />
              <span>Popular Neighborhood (Highlighted in city views)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => onNavigate('/admin/areas')}
          className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          {saving ? 'Saving...' : isEditing ? 'Update Area' : 'Create Area'}
        </button>
      </div>
    </div>
  );
};
