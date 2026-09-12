import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { City } from '../../types';
import {
  ArrowLeft,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
  Globe
} from 'lucide-react';

interface AdminCityFormPageProps {
  cityId?: number;
  onNavigate: (path: string) => void;
}

export const AdminCityFormPage: React.FC<AdminCityFormPageProps> = ({
  cityId,
  onNavigate
}) => {
  const isEditing = !!cityId;
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(!isEditing);
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
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
    if (isEditing && cityId) {
      api.admin.getCity(cityId)
        .then(city => {
          setName(city.name);
          setSlug(city.slug);
          setAutoSlug(false);
          setState(city.state || '');
          setCountry(city.country || 'India');
          setDescription(city.description || '');
          setSeoTitle(city.seo_title || '');
          setMetaDescription(city.meta_description || '');
          setIsPopular(!!city.is_popular);
          setIsPublished(city.is_published !== false);
        })
        .catch((err: any) => {
          setError(err.message || 'Failed to load city details');
        })
        .finally(() => setLoading(false));
    }
  }, [cityId, isEditing]);

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('City Name is required');
      return;
    }
    if (!state.trim()) {
      setError('State / Province is required');
      return;
    }

    setSaving(true);
    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      state: state.trim(),
      country: country.trim() || 'India',
      description: description.trim(),
      seo_title: seoTitle.trim() || null,
      meta_description: metaDescription.trim() || null,
      is_popular: isPopular,
      is_published: isPublished
    };

    try {
      if (isEditing && cityId) {
        await api.admin.updateCity(cityId, payload);
        setSuccess('City updated successfully!');
      } else {
        await api.admin.createCity(payload);
        setSuccess('City created successfully!');
      }
      setTimeout(() => {
        onNavigate('/admin/cities');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to save city');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading city information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/admin/cities')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isEditing ? `Edit City: ${name}` : 'Add New City'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Defines metropolitan hub and canonical directory routes
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg shadow-sky-500/20 flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : isEditing ? 'Update City' : 'Create City'}</span>
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
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Fields */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <MapPin className="w-4 h-4 text-sky-400" />
          <span>City Parameters</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              City Name <span className="text-sky-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. Bangalore"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
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
                  className="rounded border-slate-700 text-sky-500"
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
              placeholder="bangalore"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              State / Province <span className="text-sky-400">*</span>
            </label>
            <input
              type="text"
              value={state}
              onChange={e => setState(e.target.value)}
              placeholder="e.g. Karnataka"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Country</label>
            <input
              type="text"
              value={country}
              onChange={e => setCountry(e.target.value)}
              placeholder="India"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              City Overview Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Explore top rated luxury wellness centers and Ayurvedic retreats in Bangalore..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
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
              placeholder="Best Spas in Bangalore | Top Massage & Wellness Centers - SPA24"
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
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
              placeholder="Discover verified luxury day spas, Thai massage centers, and Ayurvedic treatments across Bangalore..."
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-6 pt-3 border-t border-slate-800">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={e => setIsPublished(e.target.checked)}
                className="rounded border-slate-700 text-sky-500 focus:ring-sky-500"
              />
              <span>Published (Indexed and visible on public website)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={e => setIsPopular(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
              />
              <span>Featured City (Pinned on homepage)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => onNavigate('/admin/cities')}
          className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-xl transition-colors shadow-lg shadow-sky-500/20 cursor-pointer"
        >
          {saving ? 'Saving...' : isEditing ? 'Update City' : 'Create City'}
        </button>
      </div>
    </div>
  );
};
