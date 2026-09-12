import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { City, Area, Service, ALL_SPA_CATEGORIES, LISTING_PLANS, PlanType } from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { useSEO } from '../hooks/useSEO';
import { PaymentCheckoutModal } from '../components/modals/PaymentCheckoutModal';
import {
  processDeviceImageFiles,
  fileToOptimizedDataUrl,
  formatFilenameToTitle
} from '../lib/imageUpload';
import {
  Building2,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Info,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Tag,
  Eye,
  UploadCloud,
  Upload,
  Plus,
  Trash2,
  Star,
  Image as ImageIcon,
  RefreshCw,
  Hash,
  Crown,
  CreditCard,
  Zap,
  TrendingUp,
  ShieldCheck,
  Check
} from 'lucide-react';

interface ListYourSpaPageProps {
  onNavigate: (path: string) => void;
}

interface PhotoItem {
  url: string;
  caption: string;
  alt_text: string;
  is_primary: boolean;
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

const POPULAR_CITIES = [
  'Bangalore',
  'Mumbai',
  'Delhi NCR',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Kolkata',
  'Goa'
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

export const ListYourSpaPage: React.FC<ListYourSpaPageProps> = ({ onNavigate }) => {
  const [cities, setCities] = useState<City[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // Form State - Identity
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState<string>(ALL_SPA_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [ownerName, setOwnerName] = useState('');

  // Contact & Location
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [bookingUrl, setBookingUrl] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [cityName, setCityName] = useState('');
  const [areaName, setAreaName] = useState('');
  const [pincode, setPincode] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');

  // Services
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);

  // Photos & Alt tags
  const [photos, setPhotos] = useState<PhotoItem[]>([
    {
      url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      caption: 'Reception & Welcome Lounge',
      alt_text: 'Luxury spa reception and consultation area with warm tranquil atmosphere',
      is_primary: true
    }
  ]);
  const [showAddUrlModal, setShowAddUrlModal] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newAlt, setNewAlt] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const singleReplaceInputRef = useRef<HTMLInputElement>(null);
  const [replaceTargetIdx, setReplaceTargetIdx] = useState<number | null>(null);

  // SEO & Counter
  const [keywords, setKeywords] = useState('');
  const [viewCount, setViewCount] = useState<number>(25);

  // Default 7-day schedule (Mon-Sun)
  const [openingHours, setOpeningHours] = useState(
    DAYS.map((d) => ({
      day_of_week: d.index,
      open_time: '10:00',
      close_time: '21:00',
      is_closed: false
    }))
  );

  // Duplicate Check State
  const [duplicateMatches, setDuplicateMatches] = useState<any[]>([]);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

  // Submission Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
    submissionId?: number;
  } | null>(null);
  const [formError, setFormError] = useState('');

  useSEO({
    title: 'List Your Spa & Wellness Business | SPA24 Verification',
    description: 'Submit your licensed spa, massage clinic, or wellness center for inclusion in the SPA24 directory. All submissions are manually verified with SEO tags and photos.',
    canonical: 'https://spa24.online/list-your-spa'
  });

  useEffect(() => {
    async function loadFormMeta() {
      try {
        const [c, a, s] = await Promise.all([
          api.cities.getAll(),
          api.areas.getAll(),
          api.services.getAll()
        ]);
        setCities(c);
        setAreas(a);
        setServices(s);
      } catch (err) {
        console.error('Error loading metadata:', err);
      }
    }
    loadFormMeta();
  }, []);

  // Filter area suggestions based on typed city
  const suggestedAreas = React.useMemo(() => {
    if (!cityName.trim()) return areas;
    const matchingCity = cities.find(
      (c) => c.name.toLowerCase() === cityName.trim().toLowerCase()
    );
    if (matchingCity) {
      return areas.filter((a) => a.city_id === matchingCity.id);
    }
    return areas;
  }, [areas, cities, cityName]);

  // Live duplicate check debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (businessName.trim().length >= 3 || phone.trim().length >= 5) {
        setIsCheckingDuplicate(true);
        try {
          const res = await api.businesses.checkDuplicate({
            name: businessName.trim(),
            phone: phone.trim(),
            website: website.trim() || undefined,
            city: cityName.trim() || undefined
          });
          setDuplicateMatches(res.matches || []);
        } catch {
          // ignore check errors
        } finally {
          setIsCheckingDuplicate(false);
        }
      } else {
        setDuplicateMatches([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [businessName, phone, website, cityName]);

  const toggleService = (svcId: number) => {
    setSelectedServiceIds((prev) =>
      prev.includes(svcId) ? prev.filter((id) => id !== svcId) : [...prev, svcId]
    );
  };

  const handleHourChange = (dayIdx: number, field: string, value: any) => {
    setOpeningHours((prev) =>
      prev.map((h) => (h.day_of_week === dayIdx ? { ...h, [field]: value } : h))
    );
  };

  // Device file upload handler
  const handleDeviceFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploadingImage(true);
    try {
      const processed = await processDeviceImageFiles(
        files,
        businessName.trim() || 'Luxury Spa'
      );
      if (processed.length > 0) {
        setPhotos((prev) => {
          const hasPrimary = prev.some((p) => p.is_primary);
          const formatted = processed.map((p, idx) => ({
            ...p,
            is_primary: !hasPrimary && idx === 0
          }));
          return [...prev, ...formatted];
        });
      }
    } catch (err) {
      console.error('Failed to process device image upload:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Single file replace from device
  const handleSingleFileReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replaceTargetIdx === null) return;
    try {
      const dataUrl = await fileToOptimizedDataUrl(file);
      const title = formatFilenameToTitle(file.name);
      setPhotos((prev) =>
        prev.map((p, idx) =>
          idx === replaceTargetIdx
            ? {
                ...p,
                url: dataUrl,
                caption: p.caption || title,
                alt_text:
                  p.alt_text ||
                  `${title} at ${businessName || 'Spa'} - Verified Wellness Suite`
              }
            : p
        )
      );
    } catch (err) {
      console.error('Error replacing single image:', err);
    } finally {
      setReplaceTargetIdx(null);
      if (singleReplaceInputRef.current) {
        singleReplaceInputRef.current.value = '';
      }
    }
  };

  const handleAddPhotoUrl = () => {
    if (!newUrl.trim()) return;
    const isFirst = photos.length === 0;
    setPhotos((prev) => [
      ...prev,
      {
        url: newUrl.trim(),
        caption: newCaption.trim() || 'Spa Treatment Suite',
        alt_text:
          newAlt.trim() ||
          `${businessName.trim() || 'Spa'} therapy room and treatment amenities`,
        is_primary: isFirst
      }
    ]);
    setNewUrl('');
    setNewCaption('');
    setNewAlt('');
    setShowAddUrlModal(false);
  };

  const handleAddPresetPhoto = (preset: (typeof PRESET_SPA_PHOTOS)[0]) => {
    const isFirst = photos.length === 0;
    setPhotos((prev) => [
      ...prev,
      {
        url: preset.url,
        caption: preset.caption,
        alt_text: `${preset.alt_text} at ${businessName || 'our verified spa'}`,
        is_primary: isFirst
      }
    ]);
  };

  const setPrimaryPhoto = (index: number) => {
    setPhotos((prev) =>
      prev.map((p, idx) => ({ ...p, is_primary: idx === index }))
    );
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      if (updated.length > 0 && !updated.some((p) => p.is_primary)) {
        updated[0].is_primary = true;
      }
      return updated;
    });
  };

  const addKeywordTag = (tag: string) => {
    const current = keywords
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (!current.includes(tag)) {
      setKeywords([...current, tag].join(', '));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!businessName || !phone || !email || !fullAddress || !cityName || !areaName || !ownerName) {
      setFormError('Please fill out all required fields marked with * (Business Name, Phone, Email, Address, City, Area, Owner Name)');
      return;
    }

    setIsSubmitting(true);
    try {
      const effectiveCategory =
        category === 'Other' && customCategory.trim()
          ? customCategory.trim()
          : category;

      // Ensure at least 1 photo exists
      let finalPhotos =
        photos.length > 0
          ? photos
          : [
              {
                url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
                caption: 'Traditional Ayurvedic Therapy Suite',
                alt_text: `${businessName.trim()} Luxury Spa & Wellness Treatment Suite`,
                is_primary: true
              }
            ];

      if (!finalPhotos.some((p) => p.is_primary)) {
        finalPhotos[0].is_primary = true;
      }

      const res = await api.submissions.create({
        business_name: businessName.trim(),
        category: effectiveCategory,
        description: description.trim() || 'Verified wellness and spa center.',
        phone: phone.trim(),
        email: email.trim(),
        website: website.trim() || null,
        booking_url: bookingUrl.trim() || null,
        full_address: fullAddress.trim(),
        city_name: cityName.trim(),
        area_name: areaName.trim(),
        pincode: pincode.trim() || null,
        google_maps_url: googleMapsUrl.trim() || null,
        service_ids: selectedServiceIds,
        opening_hours: openingHours,
        photos: finalPhotos,
        social_links: {},
        owner_name: ownerName.trim(),
        keywords: keywords.trim() || undefined,
        view_count: viewCount || 25
      });

      setSubmitResult({
        success: true,
        message: res.message,
        submissionId: res.submissionId
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit business listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'List Your Spa' }]} onNavigate={onNavigate} />

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified Directory Enrollment</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-display">
          List Your Spa on SPA24
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl">
          Join India&apos;s verified directory of genuine wellness facilities. Reach clients searching for licensed massage, ayurveda, and relaxation therapies with dedicated SEO optimization, photo alt tags, and live visitor counters.
        </p>

        {/* Verification Policy Banner */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900 shadow-xs">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Editorial Verification Protocol</p>
            <p className="leading-relaxed">
              SPA24 never auto-publishes unverified submissions. All new applications enter our moderation queue and undergo operational phone validation, physical premise verification, and duplicate cross-checks before appearing on the public directory.
            </p>
          </div>
        </div>
      </div>

      {submitResult?.success ? (
        <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center space-y-4 shadow-sm">
          <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-bold text-stone-900 font-display">
            Listing Application Submitted Successfully!
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
            Your reference tracking ID is{' '}
            <span className="font-mono font-bold text-emerald-800">
              #SUB-{submitResult.submissionId}
            </span>
            . Our compliance team will review your photos, alt tags, and contact lines within 24 to 48 business hours.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('/')}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Return to Homepage
            </button>
            <button
              onClick={() => {
                setSubmitResult(null);
                setBusinessName('');
                setPhone('');
                setFullAddress('');
                setPincode('');
                setKeywords('');
              }}
              className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold"
            >
              Submit Another Venue
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {formError && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Live Duplicate Warning Box */}
          {duplicateMatches.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm font-display">
                <ShieldAlert className="w-5 h-5 text-amber-700" />
                <span>Potential Duplicate Listings Detected</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                We found existing businesses in our directory that closely match this name or phone number. If you are the owner, you should claim the existing listing instead of creating a duplicate:
              </p>
              <div className="space-y-2 pt-1">
                {duplicateMatches.map((m: any, i: number) => (
                  <div
                    key={i}
                    className="p-3 bg-white rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-stone-900">{m.business.name}</p>
                      <p className="text-stone-500 text-[11px]">{m.business.address}</p>
                      <p className="text-stone-400 text-[10px]">
                        Matched on: {m.matchedFields.join(', ')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate(`/claim-listing?business_id=${m.business.id}`)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shrink-0"
                    >
                      Claim This Listing Instead →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hidden inputs for device image uploads */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleDeviceFiles(e.target.files);
            }}
          />
          <input
            ref={singleReplaceInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleSingleFileReplace}
          />

          {/* SECTION 1: BUSINESS IDENTITY & SPA TYPE */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-stone-900 font-display flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>1. Business Identity &amp; Spa Type</span>
              </h2>
              <span className="text-[11px] text-stone-400">All Spa Types Supported</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Official Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lotus Wellness & Ayurvedic Sanctuary"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Spa Category / Type */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Spa Classification &amp; Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-stone-800 cursor-pointer"
                >
                  {ALL_SPA_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="Other">Other / Custom Spa Type...</option>
                </select>
              </div>

              {category === 'Other' ? (
                <div>
                  <label className="block text-xs font-semibold text-emerald-700 mb-1">
                    Custom Spa Type Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Salt Cave & Halotherapy Sanctuary"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-emerald-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Owner / Representative Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              )}

              {category === 'Other' && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Owner / Representative Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Business Description &amp; Therapies Offered
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your spa suites, certified therapists, ambiance, signature treatments, and hygiene standards..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 resize-y"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: CONTACT, FREE-TEXT LOCATION & AREA PINCODE */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h2 className="text-base font-bold text-stone-900 font-display flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>2. Contact, Location &amp; Area Pincode</span>
              </h2>
              <span className="text-[11px] text-stone-400">
                Type your exact City, Area &amp; Pincode
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Operational Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98200 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Business Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. info@lotuswellness.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* City Free-text */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  City (Type your city) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bangalore, Mumbai, Etawah..."
                  list="city-options-list"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
                <datalist id="city-options-list">
                  {cities.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
                {/* Popular City quick tags */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <span className="text-[10px] text-stone-400 mr-1 self-center">Popular:</span>
                  {POPULAR_CITIES.slice(0, 5).map((quickCity) => (
                    <button
                      key={quickCity}
                      type="button"
                      onClick={() => setCityName(quickCity)}
                      className={`text-[10px] px-1.5 py-0.5 rounded-md border transition-colors ${
                        cityName.toLowerCase() === quickCity.toLowerCase()
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold'
                          : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                      }`}
                    >
                      {quickCity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Area / Locality Free-text */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Locality / Area Name (Type your area) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indiranagar, Bandra West, Civil Lines..."
                  list="area-options-list"
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
                <datalist id="area-options-list">
                  {suggestedAreas.map((a) => (
                    <option key={a.id} value={a.name} />
                  ))}
                </datalist>
              </div>

              {/* Area Pincode */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Area Pincode / Postal Code *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. 560038, 400050, 206001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-mono"
                  />
                  <Hash className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  Accurate pincode connects clients searching spas near their postal district
                </p>
              </div>

              {/* Google Maps Location Link */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Google Maps Location Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://maps.app.goo.gl/... or google.com/maps"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Complete Street Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Complete Street Address *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Building name, Floor/Suite #, Road name, Landmark, Postal locality"
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Official Website (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Online Booking URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://booking.example.com"
                  value={bookingUrl}
                  onChange={(e) => setBookingUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: GALLERY PHOTOS, DEVICE UPLOAD & SEO ALT TAGS */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-stone-900 font-display flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-700" />
                  <span>3. Photo Gallery, Device Upload &amp; SEO Alt Tags</span>
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Upload photos from your computer or phone. High-quality photos with descriptive alt tags improve rankings on Google Images.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload from Device</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddUrlModal(!showAddUrlModal)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add URL</span>
                </button>
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingFile(false);
                if (e.dataTransfer.files) handleDeviceFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                isDraggingFile
                  ? 'border-emerald-500 bg-emerald-50 scale-[1.01]'
                  : 'border-stone-200 hover:border-emerald-400 bg-stone-50/60 hover:bg-emerald-50/30'
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-800">
                    Drag &amp; drop photos from your device here, or{' '}
                    <span className="text-emerald-700 underline">browse files</span>
                  </p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Supports JPG, PNG, WEBP. Images are automatically optimized for instant fast loading.
                  </p>
                </div>
              </div>
            </div>

            {/* Add Photo by URL Expander */}
            {showAddUrlModal && (
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3 animate-in fade-in">
                <div className="text-xs font-bold text-stone-800">Add Hosted Photo via URL</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="url"
                    placeholder="Image URL (https://...)"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600 sm:col-span-1"
                  />
                  <input
                    type="text"
                    placeholder="Caption (e.g. VIP Couple Suite)"
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    className="px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600 sm:col-span-1"
                  />
                  <input
                    type="text"
                    placeholder="SEO Alt Tag (e.g. Couple massage suite with aroma candles)"
                    value={newAlt}
                    onChange={(e) => setNewAlt(e.target.value)}
                    className="px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600 sm:col-span-1"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddUrlModal(false)}
                    className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddPhotoUrl}
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold"
                  >
                    Save Photo
                  </button>
                </div>
              </div>
            )}

            {/* Presets Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs">
              <span className="text-emerald-900 font-medium text-[11px]">
                Need sample high-res photos? Add pre-verified luxury therapy suites:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SPA_PHOTOS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleAddPresetPhoto(p)}
                    className="px-2 py-1 bg-white hover:bg-emerald-100 border border-emerald-200 rounded-md text-[10px] font-semibold text-emerald-800 transition-colors shadow-2xs"
                  >
                    + {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Photos List */}
            {photos.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-stone-200 rounded-xl text-stone-400 text-xs">
                No photos added yet. Click &quot;Upload from Device&quot; or pick sample presets above.
              </div>
            ) : (
              <div className="space-y-3">
                {photos.map((photo, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition-all ${
                      photo.is_primary
                        ? 'bg-emerald-50/40 border-emerald-300 shadow-2xs'
                        : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      {/* Thumbnail with Primary Badge */}
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-stone-200 border border-stone-300 shrink-0">
                        <img
                          src={photo.url}
                          alt={photo.alt_text || 'Spa photo'}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        {photo.is_primary && (
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-bold shadow-xs">
                            COVER
                          </div>
                        )}
                      </div>

                      {/* Fields: Caption & Alt Tag */}
                      <div className="flex-1 min-w-0 space-y-2 w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 uppercase mb-0.5">
                              Photo Caption
                            </label>
                            <input
                              type="text"
                              value={photo.caption}
                              onChange={(e) =>
                                setPhotos((prev) =>
                                  prev.map((p, i) =>
                                    i === idx ? { ...p, caption: e.target.value } : p
                                  )
                                )
                              }
                              placeholder="e.g. Traditional Ayurvedic Suite"
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-emerald-800 uppercase mb-0.5 flex items-center gap-1">
                              <Tag className="w-3 h-3 text-emerald-600" />
                              <span>SEO Alt Tag (Keywords &amp; Accessibility)</span>
                            </label>
                            <input
                              type="text"
                              value={photo.alt_text}
                              onChange={(e) =>
                                setPhotos((prev) =>
                                  prev.map((p, i) =>
                                    i === idx ? { ...p, alt_text: e.target.value } : p
                                  )
                                )
                              }
                              placeholder="e.g. Luxury brass oil vessel and massage bed in Ayurvedic suite"
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-emerald-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600 text-stone-800"
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPrimaryPhoto(idx)}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                                photo.is_primary
                                  ? 'text-amber-700 bg-amber-100/70 cursor-default'
                                  : 'text-stone-600 hover:text-amber-700 hover:bg-stone-100 cursor-pointer'
                              }`}
                            >
                              <Star
                                className={`w-3 h-3 ${
                                  photo.is_primary
                                    ? 'fill-amber-500 text-amber-500'
                                    : 'text-stone-400'
                                }`}
                              />
                              <span>{photo.is_primary ? 'Primary Cover Photo' : 'Make Cover Photo'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setReplaceTargetIdx(idx);
                                singleReplaceInputRef.current?.click();
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold text-stone-600 hover:text-emerald-700 hover:bg-stone-100 transition-colors cursor-pointer"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Replace from Device</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 4: SERVICES & THERAPIES OFFERED */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-stone-900 font-display flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>4. Services &amp; Therapies Offered</span>
            </h2>

            <p className="text-xs text-stone-500">
              Select all treatments provided by licensed practitioners at your venue:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {services.map((svc) => {
                const isSelected = selectedServiceIds.includes(svc.id);
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => toggleService(svc.id)}
                    className={`p-3 text-left rounded-xl border text-xs font-semibold transition-colors flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span className="truncate">{svc.name}</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                        isSelected
                          ? 'bg-emerald-700 border-emerald-700 text-white'
                          : 'border-stone-300'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 5: OPERATING HOURS SCHEDULE */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-stone-900 font-display flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>5. Operating Hours Schedule</span>
            </h2>

            <div className="space-y-2">
              {DAYS.map((day) => {
                const hour = openingHours.find((h) => h.day_of_week === day.index) || {
                  day_of_week: day.index,
                  open_time: '10:00',
                  close_time: '21:00',
                  is_closed: false
                };
                return (
                  <div
                    key={day.name}
                    className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                  >
                    <span className="w-24 font-bold text-stone-800">{day.name}</span>

                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        disabled={hour.is_closed}
                        value={hour.open_time}
                        onChange={(e) => handleHourChange(day.index, 'open_time', e.target.value)}
                        className="px-2 py-1 bg-white border border-stone-200 rounded-md disabled:opacity-40 text-stone-800"
                      />
                      <span className="text-stone-400">to</span>
                      <input
                        type="time"
                        disabled={hour.is_closed}
                        value={hour.close_time}
                        onChange={(e) => handleHourChange(day.index, 'close_time', e.target.value)}
                        className="px-2 py-1 bg-white border border-stone-200 rounded-md disabled:opacity-40 text-stone-800"
                      />
                    </div>

                    <label className="flex items-center gap-1.5 text-stone-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hour.is_closed}
                        onChange={(e) => handleHourChange(day.index, 'is_closed', e.target.checked)}
                        className="w-3.5 h-3.5 text-emerald-700 rounded-sm"
                      />
                      <span>Closed</span>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 6: TARGET SEO KEYWORDS & VISITOR COUNTER */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5 shadow-xs">
            <h2 className="text-base font-bold text-stone-900 font-display flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-700" />
              <span>6. Target Keywords &amp; Visitor On Spa Counter</span>
            </h2>

            <div className="space-y-4">
              {/* Keywords Input */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Target Search Keywords &amp; Tags
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ayurvedic Massage, Couples Spa, Deep Tissue Therapy, Steam Bath, Body Polish"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Comma-separated keywords help your listing rank when potential clients search for specific wellness therapies.
                </p>

                {/* Keyword Suggestion Chips */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-stone-400 mr-1">Quick add:</span>
                  {KEYWORD_SUGGESTIONS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addKeywordTag(tag)}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-900 border border-stone-200 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visitor on Spa Counter */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-950">
                        Visitor on Spa Counter
                      </div>
                      <div className="text-[11px] text-amber-800">
                        Tracks and shows real-time visitor interest on your public profile.
                      </div>
                    </div>
                  </div>

                  {/* Initial Count Control */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-amber-900">
                      Initial Visits:
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={viewCount}
                      onChange={(e) => setViewCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-amber-950 text-center"
                    />
                    <button
                      type="button"
                      onClick={() => setViewCount((v) => v + 10)}
                      className="px-2 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-md text-xs font-bold transition-colors"
                      title="Add 10 initial views"
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewCount((v) => v + 50)}
                      className="px-2 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-md text-xs font-bold transition-colors"
                      title="Add 50 initial views"
                    >
                      +50
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submission CTA */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting for Verification...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Listing for Editorial Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
