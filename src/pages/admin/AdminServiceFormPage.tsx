import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Service } from '../../types';
import {
  ArrowLeft,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Globe,
  Info,
  Lightbulb
} from 'lucide-react';

interface AdminServiceFormPageProps {
  serviceId?: number;
  onNavigate: (path: string) => void;
}

const SERVICE_CATEGORIES = [
  'Body Massages',
  'Ayurvedic Therapies',
  'Facial & Skin Care',
  'Hydrotherapy & Baths',
  'Holistic Wellness',
  'Body Wraps & Scrubs',
  'Couples & Signature Rituals'
];

export const AdminServiceFormPage: React.FC<AdminServiceFormPageProps> = ({
  serviceId,
  onNavigate
}) => {
  const isEditing = !!serviceId;
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(!isEditing);
  const [category, setCategory] = useState(SERVICE_CATEGORIES[0]);
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [expectations, setExpectations] = useState('');
  const [providerTips, setProviderTips] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isPopular, setIsPopular] = useState(false);

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
    if (isEditing && serviceId) {
      api.admin.getService(serviceId)
        .then(svc => {
          setName(svc.name);
          setSlug(svc.slug);
          setAutoSlug(false);
          setCategory(svc.category || SERVICE_CATEGORIES[0]);
          setShortDesc(svc.short_desc || '');
          setFullDesc(svc.full_desc || '');
          setExpectations(svc.expectations || '');
          setProviderTips(svc.provider_tips || '');
          setSeoTitle(svc.seo_title || '');
          setMetaDescription(svc.meta_description || '');
          setIsPopular(!!svc.is_popular);
        })
        .catch((err: any) => {
          setError(err.message || 'Failed to load service details');
        })
        .finally(() => setLoading(false));
    }
  }, [serviceId, isEditing]);

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Service Name is required');
      return;
    }
    if (!shortDesc.trim()) {
      setError('Short Description is required for directory listings');
      return;
    }

    setSaving(true);
    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      category,
      short_desc: shortDesc.trim(),
      full_desc: fullDesc.trim(),
      expectations: expectations.trim(),
      provider_tips: providerTips.trim(),
      seo_title: seoTitle.trim() || null,
      meta_description: metaDescription.trim() || null,
      is_popular: isPopular
    };

    try {
      if (isEditing && serviceId) {
        await api.admin.updateService(serviceId, payload);
        setSuccess('Service updated successfully!');
      } else {
        await api.admin.createService(payload);
        setSuccess('Service created successfully!');
      }
      setTimeout(() => {
        onNavigate('/admin/services');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading service specifications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/admin/services')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isEditing ? `Edit Service: ${name}` : 'Add New Service'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Defines directory taxonomy, patient guidance, and canonical treatment landing pages
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg shadow-purple-500/20 flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : isEditing ? 'Update Service' : 'Create Service'}</span>
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

      {/* Main Parameters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Treatment Profile</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Service Name <span className="text-purple-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. Deep Tissue Sports Massage"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
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
                  className="rounded border-slate-700 text-purple-500"
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
              placeholder="deep-tissue-sports-massage"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-purple-500"
            >
              {SERVICE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Concise Directory Summary <span className="text-purple-400">*</span>
            </label>
            <input
              type="text"
              value={shortDesc}
              onChange={e => setShortDesc(e.target.value)}
              placeholder="Intense pressure targeting chronic muscular tension and athletic stiffness."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Comprehensive Service Overview
            </label>
            <textarea
              rows={4}
              value={fullDesc}
              onChange={e => setFullDesc(e.target.value)}
              placeholder="Deep tissue massage is a specialized manual therapy that uses slow, firm strokes..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Educational Guidance (Expectations & Tips) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Info className="w-4 h-4 text-sky-400" />
          <span>Patient Guidance & Etiquette</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              What to Expect During Session
            </label>
            <textarea
              rows={4}
              value={expectations}
              onChange={e => setExpectations(e.target.value)}
              placeholder="You will be asked about trigger points and pressure tolerance before undressing in private..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Provider & Preparation Tips
            </label>
            <textarea
              rows={4}
              value={providerTips}
              onChange={e => setProviderTips(e.target.value)}
              placeholder="Hydrate well before and after the session. Communicate with therapist if pressure is uncomfortable..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* SEO & Flags */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>SEO Metadata</span>
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              SEO Meta Title
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={e => setSeoTitle(e.target.value)}
              placeholder="Deep Tissue Massage Centers & Spas | SPA24"
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
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
              placeholder="Explore top rated deep tissue sports massage spas with pricing, verified reviews, and appointments..."
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={e => setIsPopular(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
              />
              <span>Popular Treatment (Featured in category listings & header menus)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => onNavigate('/admin/services')}
          className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-sm rounded-xl transition-colors shadow-lg shadow-purple-500/20 cursor-pointer"
        >
          {saving ? 'Saving...' : isEditing ? 'Update Service' : 'Create Service'}
        </button>
      </div>
    </div>
  );
};
