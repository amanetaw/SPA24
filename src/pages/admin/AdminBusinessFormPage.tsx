import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { City, Area, Service, Business, ALL_SPA_CATEGORIES } from '../../types';
import {
  processDeviceImageFiles,
  fileToOptimizedDataUrl,
  formatFilenameToTitle
} from '../../lib/imageUpload';
import {
  ArrowLeft,
  Building2,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Star,
  MapPin,
  Clock,
  Sparkles,
  Image as ImageIcon,
  Share2,
  Search,
  Tag,
  Globe,
  HelpCircle,
  Eye,
  UploadCloud,
  Upload,
  RefreshCw,
  Hash
} from 'lucide-react';

interface AdminBusinessFormPageProps {
  businessId?: number;
  onNavigate: (path: string) => void;
}

const DAYS = [
  { index: 1, name: 'Monday' },
  { index: 2, name: 'Tuesday' },
  { index: 3, name: 'Wednesday' },
  { index: 4, name: 'Thursday' },
  { index: 5, name: 'Friday' },
  { index: 6, name: 'Saturday' },
  { index: 0, name: 'Sunday' }
];

const PRESET_SPA_PHOTOS = [
  {
    name: 'Ayurvedic Treatment Room',
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    caption: 'Traditional Ayurvedic Therapy Suite',
    alt_text: 'Authentic Ayurvedic massage bed with brass herbal oil vessel and warm ambient lighting'
  },
  {
    name: 'Hot Stone & Aromatherapy',
    url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80',
    caption: 'Swedish & Hot Stone Massage Suite',
    alt_text: 'Volcanic basalt hot stones and organic aromatherapy massage oils on wooden tray'
  },
  {
    name: 'Hydrotherapy Jacuzzi',
    url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
    caption: 'Private Hydrotherapy Jacuzzi',
    alt_text: 'Indoor heated hydrotherapy spa jacuzzi pool with fresh rose petals and candles'
  },
  {
    name: 'Herbal Steam & Sauna',
    url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80',
    caption: 'Herbal Steam Bath Suite',
    alt_text: 'Cedar wood sauna and herbal detox steam room for wellness treatments'
  },
  {
    name: 'Relaxation & Tea Lounge',
    url: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1200&q=80',
    caption: 'Post-Treatment Zen Lounge',
    alt_text: 'Quiet relaxation lounge with comfortable daybeds, herbal green tea, and ambient lanterns'
  }
];

const KEYWORD_SUGGESTIONS = [
  'Ayurvedic Massage',
  'Couples Spa',
  'Deep Tissue Massage',
  'Swedish Massage',
  'Thai Herbal Compress',
  'Body Polish & Scrub',
  'Steam & Sauna',
  'Foot Reflexology',
  'Aromatherapy Massage',
  'Head & Shoulder Massage',
  'Full Body Spa',
  'Organic Facial'
];

export const AdminBusinessFormPage: React.FC<AdminBusinessFormPageProps> = ({
  businessId,
  onNavigate
}) => {
  const isEditing = !!businessId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dropdown options
  const [cities, setCities] = useState<City[]>([]);
  const [allAreas, setAllAreas] = useState<Area[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(!isEditing);
  const [category, setCategory] = useState<string>(ALL_SPA_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [bookingUrl, setBookingUrl] = useState('');
  const [address, setAddress] = useState('');

  // Free-text City, Area, Pincode
  const [cityName, setCityName] = useState('');
  const [areaName, setAreaName] = useState('');
  const [pincode, setPincode] = useState('');
  const [cityId, setCityId] = useState<number>(0);
  const [areaId, setAreaId] = useState<number>(0);

  // Visitor counter
  const [viewCount, setViewCount] = useState<number>(0);

  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [status, setStatus] = useState<'published' | 'draft' | 'suspended' | 'archived'>('published');
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'unverified' | 'claimed'>('verified');

  // Services
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);

  // Hours
  const [hours, setHours] = useState<
    { day_of_week: number; open_time: string; close_time: string; is_closed: boolean }[]
  >(
    DAYS.map(d => ({
      day_of_week: d.index,
      open_time: '09:00',
      close_time: '21:00',
      is_closed: false
    }))
  );

  // Photos with URLs, captions, and SEO alt tags
  const [photos, setPhotos] = useState<
    { url: string; caption?: string; alt_text?: string; is_primary: boolean }[]
  >([
    {
      url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      caption: 'Main Spa Reception',
      alt_text: 'Peaceful spa reception lounge with warm atmospheric lighting',
      is_primary: true
    }
  ]);

  // Device file upload states
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadNotice, setUploadNotice] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // SEO & Keywords
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');

  // Social Links
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Auto generate slug
  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  // When city name is typed, try to match known city ID and suggest areas
  const handleCityNameChange = (typed: string) => {
    setCityName(typed);
    const matchedCity = cities.find(c => c.name.toLowerCase() === typed.trim().toLowerCase());
    if (matchedCity) {
      setCityId(matchedCity.id);
    } else {
      setCityId(0);
    }
  };

  // When area name is typed, try to match known area ID and pre-populate pincode if available
  const handleAreaNameChange = (typed: string) => {
    setAreaName(typed);
    const matchedArea = allAreas.find(
      a => (!cityId || a.city_id === cityId) && a.name.toLowerCase() === typed.trim().toLowerCase()
    );
    if (matchedArea) {
      setAreaId(matchedArea.id);
      if (matchedArea.pincode && !pincode) {
        setPincode(matchedArea.pincode);
      }
    } else {
      setAreaId(0);
    }
  };

  // Load initial dropdowns & existing business if editing
  useEffect(() => {
    const init = async () => {
      try {
        const [citiesData, areasData, servicesData] = await Promise.all([
          api.admin.getCities(),
          api.admin.getAreas(),
          api.admin.getServices()
        ]);
        setCities(citiesData);
        setAllAreas(areasData);
        setServices(servicesData);

        if (isEditing && businessId) {
          const biz = await api.admin.getBusiness(businessId);
          setName(biz.name);
          setSlug(biz.slug);
          setAutoSlug(false);

          if (ALL_SPA_CATEGORIES.includes(biz.category)) {
            setCategory(biz.category);
          } else if (biz.category) {
            setCategory('Other / Custom');
            setCustomCategory(biz.category);
          } else {
            setCategory(ALL_SPA_CATEGORIES[0]);
          }

          setDescription(biz.description || '');
          setPhone(biz.phone || '');
          setEmail(biz.email || '');
          setWebsite(biz.website || '');
          setBookingUrl(biz.booking_url || '');
          setAddress(biz.address || '');

          setCityName(biz.city_name || '');
          setAreaName(biz.area_name || '');
          setPincode(biz.pincode || biz.area_pincode || '');
          setCityId(biz.city_id || 0);
          setAreaId(biz.area_id || 0);

          setViewCount(biz.view_count || 0);

          setGoogleMapsUrl(biz.google_maps_url || '');
          setStatus((biz.status as any) || 'published');
          setVerificationStatus(biz.verification_status || 'verified');

          if (biz.services && biz.services.length > 0) {
            setSelectedServiceIds(biz.services.map(s => s.service_id));
          }

          if (biz.hours && biz.hours.length > 0) {
            setHours(
              DAYS.map(d => {
                const found = biz.hours?.find(h => h.day_of_week === d.index);
                return (
                  found || {
                    day_of_week: d.index,
                    open_time: '09:00',
                    close_time: '21:00',
                    is_closed: false
                  }
                );
              })
            );
          }

          if (biz.photos && biz.photos.length > 0) {
            setPhotos(
              biz.photos.map(p => ({
                url: p.url,
                caption: p.caption || '',
                alt_text: p.alt_text || p.caption || '',
                is_primary: !!p.is_primary
              }))
            );
          } else if (biz.primary_photo) {
            setPhotos([
              {
                url: biz.primary_photo,
                caption: 'Primary Photo',
                alt_text: `${biz.name} - Front View`,
                is_primary: true
              }
            ]);
          }

          setSeoTitle(biz.seo_title || '');
          setMetaDescription(biz.meta_description || '');
          setKeywords(Array.isArray(biz.keywords) ? biz.keywords.join(', ') : (biz.keywords || ''));

          if (biz.social_links) {
            setInstagram(biz.social_links.instagram || '');
            setFacebook(biz.social_links.facebook || '');
            setWhatsapp(biz.social_links.whatsapp || '');
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to initialize form');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [businessId, isEditing]);

  // Suggested areas based on currently typed city
  const suggestedAreas = allAreas.filter(a => {
    if (cityId) return a.city_id === cityId;
    if (cityName.trim()) {
      const matchedCity = cities.find(c => c.name.toLowerCase() === cityName.trim().toLowerCase());
      if (matchedCity) return a.city_id === matchedCity.id;
    }
    return true;
  });

  // Toggle service selection
  const toggleService = (id: number) => {
    setSelectedServiceIds(prev =>
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  // Update opening hour
  const updateHour = (
    dayIndex: number,
    field: 'open_time' | 'close_time' | 'is_closed',
    value: any
  ) => {
    setHours(prev =>
      prev.map(h => (h.day_of_week === dayIndex ? { ...h, [field]: value } : h))
    );
  };

  // Add photo row (URL)
  const addPhotoRow = () => {
    setPhotos(prev => [
      ...prev,
      {
        url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80',
        caption: '',
        alt_text: '',
        is_primary: prev.length === 0
      }
    ]);
  };

  // Add preset photo with prefilled caption and SEO alt tag
  const addPresetPhoto = (preset: { url: string; caption: string; alt_text: string }) => {
    setPhotos(prev => [
      ...prev,
      {
        url: preset.url,
        caption: preset.caption,
        alt_text: preset.alt_text,
        is_primary: prev.length === 0
      }
    ]);
  };

  // Process files uploaded from device
  const handleDeviceFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploadingFiles(true);
    setError('');
    try {
      const processed = await processDeviceImageFiles(files, name || 'Spa');
      if (processed.length > 0) {
        setPhotos(prev => {
          const hasPrimary = prev.some(p => p.is_primary);
          const updated = processed.map((p, idx) => ({
            ...p,
            is_primary: !hasPrimary && idx === 0
          }));
          return [...prev, ...updated];
        });
        setUploadNotice(`Added ${processed.length} photo(s) from device! Captions and SEO Alt Tags auto-generated.`);
        setTimeout(() => setUploadNotice(''), 4500);
      }
    } catch (err: any) {
      setError('Device photo upload error: ' + (err.message || 'Unknown error'));
    } finally {
      setIsUploadingFiles(false);
    }
  };

  // Replace an individual photo row from device file
  const handleRowFileReplace = async (rowIdx: number, file: File) => {
    if (!file) return;
    try {
      const dataUrl = await fileToOptimizedDataUrl(file);
      const title = formatFilenameToTitle(file.name);
      setPhotos(prev =>
        prev.map((p, i) =>
          i === rowIdx
            ? {
                ...p,
                url: dataUrl,
                caption: p.caption || title,
                alt_text: p.alt_text || `${title} at ${name || 'Spa'}`
              }
            : p
        )
      );
    } catch (err: any) {
      setError('Failed to load image file: ' + err.message);
    }
  };

  // Set primary photo
  const setPrimaryPhoto = (index: number) => {
    setPhotos(prev =>
      prev.map((p, idx) => ({
        ...p,
        is_primary: idx === index
      }))
    );
  };

  // Remove photo
  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const next = prev.filter((_, idx) => idx !== index);
      if (next.length > 0 && !next.some(p => p.is_primary)) {
        next[0].is_primary = true;
      }
      return next;
    });
  };

  // Save handler
  const handleSave = async (publishStatus?: 'published' | 'draft') => {
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Business Name is required');
      return;
    }
    if (!phone.trim()) {
      setError('Phone Number is required');
      return;
    }
    if (!address.trim()) {
      setError('Street Address is required');
      return;
    }
    if (!cityName.trim()) {
      setError('City Name is required. Please type or select a city.');
      return;
    }
    if (!areaName.trim()) {
      setError('Area / Locality is required. Please type your locality.');
      return;
    }

    const finalCategory =
      category === 'Other / Custom'
        ? customCategory.trim() || 'Day Spa & Wellness Center'
        : category;

    setSaving(true);

    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      category: finalCategory,
      description,
      phone: phone.trim(),
      email: email.trim() || null,
      website: website.trim() || null,
      booking_url: bookingUrl.trim() || null,
      address: address.trim(),
      city_id: cityId || undefined,
      area_id: areaId || undefined,
      city_name: cityName.trim(),
      area_name: areaName.trim(),
      pincode: pincode.trim() || undefined,
      view_count: viewCount,
      google_maps_url: googleMapsUrl.trim() || null,
      status: publishStatus || status,
      verification_status: verificationStatus,
      service_ids: selectedServiceIds,
      hours: hours,
      photos: photos.filter(p => p.url.trim() !== ''),
      seo_title: seoTitle.trim() || undefined,
      meta_description: metaDescription.trim() || undefined,
      keywords: keywords.trim() || undefined,
      social_links: {
        instagram: instagram.trim() || undefined,
        facebook: facebook.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined
      }
    };

    try {
      if (isEditing && businessId) {
        await api.admin.updateBusiness(businessId, payload);
        setSuccess('Business listing updated successfully!');
      } else {
        const created = await api.admin.createBusiness(payload);
        setSuccess(`Business listing "${created.name}" created successfully!`);
      }
      setTimeout(() => {
        onNavigate('/admin/businesses');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to save business');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading business data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/admin/businesses')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isEditing ? `Edit: ${name || 'Business'}` : 'Add New Business'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct CRUD creation persisting to the backend database
            </p>
          </div>
        </div>

        {/* Top Action buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            Save as Draft
          </button>
          <button
            type="button"
            id="admin-save-business-btn"
            onClick={() => handleSave('published')}
            disabled={saving}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : isEditing ? 'Update & Publish' : 'Publish Listing'}</span>
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {success && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Section 1: Basic Information */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>General Business Profile</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Business Name <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              id="business-name-input"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. Lotus Wellness & Ayurvedic Spa"
              required
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                URL Slug
              </label>
              <label className="text-[11px] text-slate-400 flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSlug}
                  onChange={e => setAutoSlug(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500"
                />
                Auto-generate
              </label>
            </div>
            <input
              type="text"
              value={slug}
              onChange={e => {
                setAutoSlug(false);
                setSlug(e.target.value);
              }}
              placeholder="lotus-wellness-ayurvedic-spa"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Spa Type &amp; Category <span className="text-amber-400">*</span>
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {ALL_SPA_CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="Other / Custom">Other / Custom Spa Type (Type Below)</option>
            </select>
            {category === 'Other / Custom' && (
              <div className="mt-2">
                <input
                  type="text"
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                  placeholder="Enter custom spa type, e.g. Hot Stone & Aromatherapy Sanctuary"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-amber-500/60 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Verification Status
            </label>
            <select
              value={verificationStatus}
              onChange={e => setVerificationStatus(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="verified">Verified (Official Directory Badge)</option>
              <option value="claimed">Claimed by Owner</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>

          {/* Visitor Counter */}
          <div className="md:col-span-2 p-4 bg-slate-800/40 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Visitor On Spa Counter</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Profile Counter
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Number of real customer visits on this spa's listing page. Increments automatically with visitor views.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5">
                <span className="text-xs text-slate-400 mr-2">Views:</span>
                <input
                  type="number"
                  min="0"
                  value={viewCount}
                  onChange={e => setViewCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 bg-transparent text-amber-400 font-bold text-sm focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setViewCount(prev => prev + 10)}
                className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
                title="Add 10 views"
              >
                +10
              </button>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Comprehensive Editorial Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the atmosphere, signature massages, therapist qualifications, ambiance, and amenities..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Location & Contact */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-400" />
            <span>Location & Contact Information</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Type any City and Area/Locality freely with auto-completion. No restricted dropdown required!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* City Free-text */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                City <span className="text-amber-400">*</span>
              </label>
              <span className="text-[10px] text-amber-400/90 font-medium">Type any city</span>
            </div>
            <input
              type="text"
              list="admin-city-options"
              value={cityName}
              onChange={e => handleCityNameChange(e.target.value)}
              placeholder="Type city (e.g. Delhi, Etawah, Mumbai...)"
              required
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <datalist id="admin-city-options">
              {cities.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.state})
                </option>
              ))}
            </datalist>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {cities.slice(0, 5).map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCityNameChange(c.name)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors cursor-pointer ${
                    cityName.toLowerCase() === c.name.toLowerCase()
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Area / Locality Free-text */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Area / Locality <span className="text-amber-400">*</span>
              </label>
              <span className="text-[10px] text-amber-400/90 font-medium">Type any area</span>
            </div>
            <input
              type="text"
              list="admin-area-options"
              value={areaName}
              onChange={e => handleAreaNameChange(e.target.value)}
              placeholder="Type area (e.g. Civil Lines, Indiranagar...)"
              required
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <datalist id="admin-area-options">
              {suggestedAreas.map(a => (
                <option key={a.id} value={a.name}>
                  {a.name} {a.pincode ? `(PIN: ${a.pincode})` : ''}
                </option>
              ))}
            </datalist>
            {suggestedAreas.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {suggestedAreas.slice(0, 4).map(a => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      handleAreaNameChange(a.name);
                      if (a.pincode && !pincode) setPincode(a.pincode);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors cursor-pointer ${
                      areaName.toLowerCase() === a.name.toLowerCase()
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Area Pincode */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Area Pincode / Postal Code
            </label>
            <input
              type="text"
              value={pincode}
              onChange={e => setPincode(e.target.value)}
              placeholder="e.g. 206001 or 560038"
              maxLength={10}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <p className="text-[10px] text-slate-400 mt-1.5">
              Postal code for localized directory filtering &amp; maps.
            </p>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Street Address <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. 42 100ft Road, Opposite Metro Station, Indiranagar"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Direct Phone Number <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Inquiry Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="bookings@example.com"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Official Website URL
            </label>
            <input
              type="url"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="https://lotusspa.in"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Online Appointment / Booking URL
            </label>
            <input
              type="url"
              value={bookingUrl}
              onChange={e => setBookingUrl(e.target.value)}
              placeholder="https://lotusspa.in/book"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Google Maps Location URL
            </label>
            <input
              type="url"
              value={googleMapsUrl}
              onChange={e => setGoogleMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/?q=..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Services Offered */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Assigned Services & Treatments</span>
          </h2>
          <span className="text-xs text-purple-400 font-mono">
            {selectedServiceIds.length} selected
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {services.map(svc => {
            const checked = selectedServiceIds.includes(svc.id);
            return (
              <label
                key={svc.id}
                className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs font-medium transition-colors ${
                  checked
                    ? 'bg-purple-950/40 border-purple-500/50 text-purple-200'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleService(svc.id)}
                  className="rounded border-slate-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="truncate">{svc.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Section 4: Operating Hours */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>Weekly Operating Hours</span>
        </h2>

        <div className="space-y-2.5">
          {DAYS.map(day => {
            const current = hours.find(h => h.day_of_week === day.index) || {
              day_of_week: day.index,
              open_time: '09:00',
              close_time: '21:00',
              is_closed: false
            };

            return (
              <div
                key={day.index}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-800 gap-3"
              >
                <div className="w-28 font-semibold text-xs text-white">{day.name}</div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={current.is_closed}
                      onChange={e => updateHour(day.index, 'is_closed', e.target.checked)}
                      className="rounded border-slate-700 text-amber-500"
                    />
                    <span>Closed</span>
                  </label>

                  {!current.is_closed && (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={current.open_time}
                        onChange={e => updateHour(day.index, 'open_time', e.target.value)}
                        className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                      />
                      <span className="text-slate-500 text-xs">to</span>
                      <input
                        type="time"
                        value={current.close_time}
                        onChange={e => updateHour(day.index, 'close_time', e.target.value)}
                        className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 5: Photos & Image SEO Alt Tags */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>Listing Gallery Photos &amp; Image Alt Tags</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Upload photos directly from your computer/mobile device, or paste web URLs. Every photo includes editable <strong className="text-amber-300">Alt Tags</strong> for Google SEO ranking.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Hidden file input for header button & dropzone */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={e => {
                if (e.target.files) {
                  handleDeviceFiles(e.target.files);
                  e.target.value = '';
                }
              }}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingFiles}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload from Device</span>
            </button>
            <button
              type="button"
              onClick={addPhotoRow}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add URL</span>
            </button>
          </div>
        </div>

        {/* Upload from Device Dropzone */}
        <div
          onDragOver={e => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={e => {
            e.preventDefault();
            setIsDraggingOver(false);
            if (e.dataTransfer.files) {
              handleDeviceFiles(e.dataTransfer.files);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
            isDraggingOver
              ? 'border-amber-400 bg-amber-500/10'
              : 'border-slate-700 hover:border-slate-600 bg-slate-800/30 hover:bg-slate-800/50'
          }`}
        >
          {isUploadingFiles ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
              <span className="text-xs font-semibold text-white">Processing &amp; optimizing image files...</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  <span className="text-amber-400 underline decoration-amber-400/50 underline-offset-2">
                    Click to browse from device
                  </span>{' '}
                  or drag &amp; drop photos here
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Supports JPG, PNG, WEBP. Images are automatically optimized and assigned initial SEO alt tags.
                </p>
              </div>
            </>
          )}
        </div>

        {uploadNotice && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{uploadNotice}</span>
          </div>
        )}

        {/* Quick Presets Bar */}
        <div className="bg-slate-800/40 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Click High-Quality Spa Presets (Royalty-Free):</span>
            </span>
            <span className="text-[11px] text-slate-500">Includes optimized alt tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_SPA_PHOTOS.map((preset, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => addPresetPhoto(preset)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/50 text-slate-300 hover:text-white rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3 h-3 text-amber-400" />
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Photo rows */}
        <div className="space-y-3.5">
          {photos.map((photo, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative group shrink-0">
                  <img
                    src={photo.url || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=120&q=80'}
                    alt={photo.alt_text || photo.caption || 'Spa Photo Preview'}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-800 border border-slate-700"
                  />
                  {photo.is_primary && (
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow">
                      COVER
                    </span>
                  )}
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-slate-400">
                        Photo Source URL / Data
                      </label>
                      <label className="text-[10px] text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            if (e.target.files?.[0]) {
                              handleRowFileReplace(idx, e.target.files[0]);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={photo.url.startsWith('data:') ? 'Device Image (Embedded Base64)' : photo.url}
                      readOnly={photo.url.startsWith('data:')}
                      onChange={e => {
                        const next = [...photos];
                        next[idx].url = e.target.value;
                        setPhotos(next);
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className={`w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 ${
                        photo.url.startsWith('data:') ? 'text-slate-400 cursor-not-allowed italic' : ''
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Visual Caption (Shown on screen)
                    </label>
                    <input
                      type="text"
                      value={photo.caption || ''}
                      onChange={e => {
                        const next = [...photos];
                        next[idx].caption = e.target.value;
                        setPhotos(next);
                      }}
                      placeholder="e.g. VIP Treatment Room"
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setPrimaryPhoto(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      photo.is_primary
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${photo.is_primary ? 'fill-slate-950' : ''}`} />
                    <span>{photo.is_primary ? 'Primary Cover' : 'Make Primary'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    title="Remove Photo"
                    className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Alt Tag Row */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-amber-400 flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-amber-400" />
                    <span>Image Alt Tag (SEO &amp; Accessibility)</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Indexed by Google Image search</span>
                </div>
                <input
                  type="text"
                  value={photo.alt_text || ''}
                  onChange={e => {
                    const next = [...photos];
                    next[idx].alt_text = e.target.value;
                    setPhotos(next);
                  }}
                  placeholder="e.g. Traditional Ayurvedic massage therapy on wooden table with warm herbal oils"
                  className="w-full px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 6: Search Engine Optimization (SEO) & Target Keywords */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-400" />
            <span>Search Engine Optimization (SEO) &amp; Keywords</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Optimize how this spa listing appears on Google, Bing, and local search queries.
          </p>
        </div>

        <div className="space-y-4">
          {/* SEO Meta Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                SEO Meta Title (Title Tag)
              </label>
              <span className={`text-[11px] font-mono ${
                seoTitle.length >= 50 && seoTitle.length <= 60
                  ? 'text-emerald-400'
                  : seoTitle.length > 60
                  ? 'text-amber-400'
                  : 'text-slate-500'
              }`}>
                {seoTitle.length}/60 chars (Recommended: 50-60)
              </span>
            </div>
            <input
              type="text"
              value={seoTitle}
              onChange={e => setSeoTitle(e.target.value)}
              placeholder={`e.g. ${name || 'Lotus Wellness Spa'} | Luxury Ayurvedic & Thai Massage in ${areaName || 'Indiranagar'}`}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Meta Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Meta Description (Search Result Snippet)
              </label>
              <span className={`text-[11px] font-mono ${
                metaDescription.length >= 130 && metaDescription.length <= 160
                  ? 'text-emerald-400'
                  : metaDescription.length > 160
                  ? 'text-amber-400'
                  : 'text-slate-500'
              }`}>
                {metaDescription.length}/160 chars (Recommended: 130-160)
              </span>
            </div>
            <textarea
              rows={2}
              value={metaDescription}
              onChange={e => setMetaDescription(e.target.value)}
              placeholder="e.g. Discover authentic Ayurvedic body massages, Swedish therapies, and herbal steam baths at our verified wellness center. Book an appointment online."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-y"
            />
          </div>

          {/* Target Keywords */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-purple-400" />
                <span>Target Keywords &amp; Search Tags</span>
              </label>
              <span className="text-[11px] text-slate-500">Comma-separated terms</span>
            </div>
            <input
              type="text"
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
              placeholder="e.g. ayurvedic massage, couples spa, thai massage, swedish therapy, indiranagar spa"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />

            {/* Keyword Suggestions Chips */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium mr-1">
                Suggested Keywords:
              </span>
              {KEYWORD_SUGGESTIONS.map((kw, kwIdx) => {
                const isAlreadyIncluded = keywords.toLowerCase().includes(kw.toLowerCase());
                return (
                  <button
                    key={kwIdx}
                    type="button"
                    disabled={isAlreadyIncluded}
                    onClick={() => {
                      if (!isAlreadyIncluded) {
                        const next = keywords.trim() ? `${keywords.trim()}, ${kw}` : kw;
                        setKeywords(next);
                      }
                    }}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                      isAlreadyIncluded
                        ? 'bg-slate-800/50 text-slate-600 border border-slate-800 cursor-default'
                        : 'bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-purple-100 border border-purple-500/30 cursor-pointer'
                    }`}
                  >
                    + {kw}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Google Search Snippet Preview */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2.5">
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span>Live Google Search Snippet Preview:</span>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-sans max-w-2xl">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-black">
                  S
                </div>
                <span className="text-slate-400 text-xs truncate">
                  https://spa24.online &rsaquo; spa &rsaquo; {cities.find(c => c.id === cityId)?.slug || 'city'} &rsaquo; {slug || 'spa-name'}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-sky-400 hover:underline cursor-pointer truncate">
                {seoTitle || (name ? `${name} - Verified Spa in ${cities.find(c => c.id === cityId)?.name || 'India'} | SPA24` : 'Spa Name | SPA24 Directory')}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {metaDescription || (description ? description.slice(0, 155) + '...' : 'Verified licensed spa listing with verified timings, treatment pricing, authentic photos, and verified reviews on SPA24.')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 7: Social & Publishing Options */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Share2 className="w-4 h-4 text-rose-400" />
          <span>Social Media & Publication Status</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Instagram URL</label>
            <input
              type="text"
              value={instagram}
              onChange={e => setInstagram(e.target.value)}
              placeholder="https://instagram.com/lotusspa"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Facebook URL</label>
            <input
              type="text"
              value={facebook}
              onChange={e => setFacebook(e.target.value)}
              placeholder="https://facebook.com/lotusspa"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">WhatsApp Number</label>
            <input
              type="text"
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              placeholder="+919876543210"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Publication Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="published">Published (Live in public directory & sitemap)</option>
              <option value="draft">Draft (Hidden from public)</option>
              <option value="suspended">Suspended (Temporarily disabled)</option>
              <option value="archived">Archived (De-indexed)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => onNavigate('/admin/businesses')}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => handleSave()}
          disabled={saving}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create & Publish Listing'}</span>
        </button>
      </div>
    </div>
  );
};
