import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Business, BusinessHour } from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { BusinessCard } from '../components/directory/BusinessCard';
import { ReportModal } from '../components/modals/ReportModal';
import { CorrectionModal } from '../components/modals/CorrectionModal';
import { useSEO } from '../hooks/useSEO';
import {
  MapPin,
  Phone,
  Globe,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Edit3,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Share2,
  Tag,
  Eye
} from 'lucide-react';

interface BusinessDetailPageProps {
  citySlug: string;
  areaSlug: string;
  businessSlug: string;
  onNavigate: (path: string) => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const BusinessDetailPage: React.FC<BusinessDetailPageProps> = ({
  citySlug,
  areaSlug,
  businessSlug,
  onNavigate
}) => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Modals
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadBusiness() {
      setLoading(true);
      setError('');
      try {
        const res = await api.businesses.getBySlug(citySlug, areaSlug, businessSlug);
        setBusiness(res);
      } catch (err: any) {
        setError(err.message || 'Business profile could not be found.');
      } finally {
        setLoading(false);
      }
    }
    loadBusiness();
  }, [citySlug, areaSlug, businessSlug]);

  const bName = business?.name || 'Spa Profile';
  const cName = business?.city_name || citySlug;
  const aName = business?.area_name || areaSlug;

  useSEO({
    title: business?.seo_title || `${bName} in ${aName}, ${cName} - Hours, Services & Phone`,
    description: business?.meta_description || (business
      ? `${business.name} located at ${business.address}. View verified opening hours, services, and official contact phone.`
      : 'Verified Spa Profile on SPA24.'),
    canonical: `https://spa24.online/spa/${citySlug}/${areaSlug}/${businessSlug}`,
    schema: business
      ? {
          '@context': 'https://schema.org',
          '@type': 'DaySpa',
          name: business.name,
          image: business.photos?.map((p) => p.url) || [business.primary_photo],
          address: {
            '@type': 'PostalAddress',
            streetAddress: business.address,
            addressLocality: business.city_name,
            addressRegion: business.city_state,
            postalCode: business.area_pincode,
            addressCountry: 'IN'
          },
          telephone: business.phone,
          url: business.website || `https://spa24.online/spa/${citySlug}/${areaSlug}/${businessSlug}`,
          openingHoursSpecification: business.hours?.map((h) => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: DAYS[h.day_of_week],
            opens: h.is_closed ? '00:00' : h.open_time,
            closes: h.is_closed ? '00:00' : h.close_time
          }))
        }
      : undefined
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-6">
        <div className="h-6 bg-stone-200 rounded-sm w-64"></div>
        <div className="h-96 bg-stone-100 rounded-2xl"></div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-stone-400 mx-auto" />
        <h2 className="text-xl font-bold text-stone-900 font-display">Business Profile Not Found</h2>
        <p className="text-xs text-stone-600">
          The requested wellness center could not be loaded or may have been archived.
        </p>
        <button
          onClick={() => onNavigate(`/spa/${citySlug}`)}
          className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold"
        >
          Return to {cName} Directory
        </button>
      </div>
    );
  }

  const photos = business.photos && business.photos.length > 0
    ? business.photos
    : [{ url: business.primary_photo || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', is_primary: true, display_order: 1 }];

  const currentPhoto = photos[activePhotoIdx] || photos[0];
  const todayDayIdx = new Date().getDay();

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Spas', path: '/spa' },
          { label: business.city_name || citySlug, path: `/spa/${citySlug}` },
          { label: business.area_name || areaSlug, path: `/spa/${citySlug}/${areaSlug}` },
          { label: business.name }
        ]}
        onNavigate={onNavigate}
      />

      {/* Main Header / Top Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {business.category}
              </span>

              {business.verification_status === 'claimed' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Claimed by Owner</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Listing</span>
                </span>
              )}

              <span
                className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                  business.is_open_now
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-800 text-stone-200'
                }`}
              >
                {business.is_open_now ? '● Open Now' : 'Closed Now'}
              </span>

              {/* Visitor On Spa Counter */}
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200"
                title={`${business.view_count || 1} visitors viewed this spa profile`}
              >
                <Eye className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  <strong className="font-bold">{(business.view_count || 1).toLocaleString()}</strong> visitors on spa
                </span>
              </span>
            </div>

            {/* Business Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-display">
              {business.name}
            </h1>

            {/* Location */}
            <p className="text-xs sm:text-sm text-stone-600 flex items-start gap-1.5 max-w-2xl">
              <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <span>
                {business.address}, {business.area_name}, {business.city_name}
                {(business.pincode || business.area_pincode) ? ` - ${business.pincode || business.area_pincode}` : ''}
              </span>
            </p>
          </div>

          {/* Direct Actions Column */}
          <div className="flex flex-wrap lg:flex-col items-stretch gap-2.5 w-full sm:w-auto shrink-0">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call {business.phone}</span>
              </a>
            )}

            {business.booking_url && (
              <a
                href={business.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Online</span>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </a>
            )}

            <div className="flex items-center gap-2 w-full">
              <button
                onClick={handleShare}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? 'Link Copied!' : 'Share'}</span>
              </button>

              <button
                onClick={() => setIsCorrectionOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors"
                title="Suggest updated phone or hours"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Suggest Edit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery & Quick Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Photos & Description & Services */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Photo Gallery */}
          <div className="space-y-3">
            <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs">
              <img
                src={currentPhoto.url}
                alt={currentPhoto.alt_text || currentPhoto.caption || `${business.name} - ${business.category || 'Spa & Wellness'}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-all"
              />
              {currentPhoto.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-stone-950/70 backdrop-blur-xs p-3 text-white text-xs font-medium">
                  {currentPhoto.caption}
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            {photos.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {photos.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      idx === activePhotoIdx ? 'border-emerald-600 scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={p.url}
                      alt={p.alt_text || p.caption || `${business.name} thumbnail ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3">
            <h2 className="text-lg font-bold text-stone-900 font-display">
              About {business.name}
            </h2>
            <div className="text-xs sm:text-sm text-stone-600 leading-relaxed whitespace-pre-line">
              {business.description}
            </div>
          </div>

          {/* Target Keywords & Tags */}
          {business.keywords && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                <Tag className="w-3.5 h-3.5 text-emerald-700" />
                <span>Specialized Keywords &amp; Tags</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(business.keywords)
                  ? business.keywords
                  : business.keywords.split(',')
                ).map((kw, kIdx) => {
                  const cleanKw = typeof kw === 'string' ? kw.trim() : '';
                  if (!cleanKw) return null;
                  return (
                    <button
                      key={kIdx}
                      onClick={() => onNavigate(`/search?q=${encodeURIComponent(cleanKw)}`)}
                      className="px-2.5 py-1 bg-stone-50 hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border border-stone-200 hover:border-emerald-300 rounded-lg text-xs font-medium transition-colors"
                    >
                      #{cleanKw}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Services & Treatment Pricing */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900 font-display">
                Services &amp; Therapies Offered
              </h2>
              <span className="text-xs text-stone-400">
                {business.services?.length || 0} treatments available
              </span>
            </div>

            {business.services && business.services.length > 0 ? (
              <div className="divide-y divide-stone-100">
                {business.services.map((svc) => (
                  <div key={svc.service_id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <button
                        onClick={() => onNavigate(`/services/${svc.slug}`)}
                        className="text-xs font-bold text-stone-900 hover:text-emerald-800 transition-colors text-left"
                      >
                        {svc.name}
                      </button>
                      {svc.notes && (
                        <p className="text-[11px] text-stone-500 mt-0.5">{svc.notes}</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      {svc.price_from ? (
                        <span className="text-xs font-extrabold text-stone-900">
                          From ₹{svc.price_from}
                        </span>
                      ) : (
                        <span className="text-xs text-stone-500">Contact for pricing</span>
                      )}
                      {svc.duration_minutes && (
                        <p className="text-[10px] text-stone-400">{svc.duration_minutes} mins</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500">
                Services are verified during telephone or in-person consultation.
              </p>
            )}
          </div>
        </div>

        {/* Right 1 Col: Operating Hours & Verification & Metadata */}
        <div className="space-y-6">
          {/* Operating Hours Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-stone-900">
              <Clock className="w-4 h-4 text-emerald-700" />
              <h2 className="text-base font-bold font-display">Weekly Operating Schedule</h2>
            </div>

            <div className="space-y-2 text-xs">
              {business.hours && business.hours.length > 0 ? (
                business.hours.map((h) => {
                  const isToday = h.day_of_week === todayDayIdx;
                  return (
                    <div
                      key={h.day_of_week}
                      className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg transition-colors ${
                        isToday ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200' : 'text-stone-700'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {DAYS[h.day_of_week]}
                        {isToday && (
                          <span className="text-[9px] uppercase px-1 py-0.2 rounded-sm bg-emerald-700 text-white font-semibold">
                            Today
                          </span>
                        )}
                      </span>

                      <span>
                        {h.is_closed ? (
                          <span className="text-stone-400 font-normal">Closed</span>
                        ) : (
                          `${h.open_time} - ${h.close_time}`
                        )}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-stone-500 text-xs">Schedule not submitted. Typically 10:00 AM - 9:00 PM.</p>
              )}
            </div>
          </div>

          {/* Contact & Official Verification Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-stone-900 font-display">
              Verified Information
            </h2>

            <div className="space-y-3 text-xs">
              {business.phone && (
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase">Telephone</span>
                    <a href={`tel:${business.phone}`} className="font-semibold text-stone-900 hover:text-emerald-700">
                      {business.phone}
                    </a>
                  </div>
                </div>
              )}

              {business.website && (
                <div className="flex items-start gap-2.5">
                  <Globe className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                  <div className="overflow-hidden">
                    <span className="text-stone-400 block text-[10px] uppercase">Official Website</span>
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-emerald-800 hover:underline truncate block"
                    >
                      {business.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
              )}

              {business.google_maps_url && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase">Navigation</span>
                    <a
                      href={business.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-emerald-800 hover:underline flex items-center gap-1"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Claim / Ownership prompt */}
            <div className="pt-4 border-t border-stone-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500">Listing ownership:</span>
                <span className="font-semibold text-stone-800 capitalize">
                  {business.verification_status}
                </span>
              </div>

              {business.verification_status !== 'claimed' ? (
                <button
                  onClick={() => onNavigate(`/claim-listing?business_id=${business.id}`)}
                  className="w-full py-2 px-3 text-center text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
                >
                  Do you own this spa? Claim this listing
                </button>
              ) : (
                <p className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                  This profile is actively managed by verified facility ownership.
                </p>
              )}

              <div className="flex items-center justify-between pt-2 text-[11px] text-stone-400">
                <span>Updated: {business.updated_at ? new Date(business.updated_at).toLocaleDateString() : 'Recently'}</span>
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="text-stone-500 hover:text-rose-600 transition-colors"
                >
                  Report Inaccuracy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Businesses in Same Locality */}
      {business.relatedAreaBusinesses && business.relatedAreaBusinesses.length > 0 && (
        <section className="pt-6 border-t border-stone-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-stone-900 font-display">
                More Spas in {business.area_name}
              </h2>
              <p className="text-xs text-stone-500">Other verified venues in this neighborhood</p>
            </div>
            <button
              onClick={() => onNavigate(`/spa/${citySlug}/${areaSlug}`)}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {business.relatedAreaBusinesses.map((b) => (
              <BusinessCard key={b.id} business={b} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* Modals */}
      <ReportModal
        businessId={business.id}
        businessName={business.name}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      <CorrectionModal
        business={business}
        isOpen={isCorrectionOpen}
        onClose={() => setIsCorrectionOpen(false)}
      />
    </div>
  );
};
