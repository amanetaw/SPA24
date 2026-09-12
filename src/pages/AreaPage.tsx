import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Area, City, Business, Service } from '../types';
import { BusinessCard } from '../components/directory/BusinessCard';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { useSEO } from '../hooks/useSEO';
import { MapPin, Building2, HelpCircle, ChevronRight } from 'lucide-react';

interface AreaPageProps {
  citySlug: string;
  areaSlug: string;
  onNavigate: (path: string) => void;
}

export const AreaPage: React.FC<AreaPageProps> = ({ citySlug, areaSlug, onNavigate }) => {
  const [data, setData] = useState<{
    area: Area & { city: City };
    businesses: Business[];
    totalBusinesses: number;
    nearbyAreas: Area[];
    availableServices: Service[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadArea() {
      setLoading(true);
      setError('');
      try {
        const res = await api.areas.getBySlug(citySlug, areaSlug);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load area directory');
      } finally {
        setLoading(false);
      }
    }
    loadArea();
  }, [citySlug, areaSlug]);

  const areaName = data?.area?.name || areaSlug;
  const cityName = data?.area?.city?.name || citySlug;

  useSEO({
    title: `Best Spas in ${areaName}, ${cityName} | Verified Local Directory`,
    description: `Locate top verified spa and massage therapy clinics in ${areaName}, ${cityName}. Direct phone contacts, exact street addresses, and opening hours.`,
    canonical: `https://spa24.online/spa/${citySlug}/${areaSlug}`
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-6">
        <div className="h-6 bg-stone-200 rounded-sm w-48"></div>
        <div className="h-10 bg-stone-200 rounded-sm w-96"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 bg-stone-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900 font-display">Area Directory Not Found</h2>
        <p className="text-xs text-stone-600">{error || 'The requested locality could not be located.'}</p>
        <button
          onClick={() => onNavigate(`/spa/${citySlug}`)}
          className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold"
        >
          View All {cityName} Spas
        </button>
      </div>
    );
  }

  const { area, businesses, nearbyAreas, availableServices, totalBusinesses } = data;

  const faqs = [
    {
      q: `Are the spas in ${area.name} currently operational?`,
      a: `Yes, each listing displays live operating hours calculated from their registered schedule. You can call them directly using the verified telephone number on their listing.`
    },
    {
      q: `What kinds of treatments are available in ${area.name}?`,
      a: `Venues in ${area.name} offer Swedish massage, deep tissue therapy, Ayurvedic abhyanga, facial treatments, and body scrubs.`
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Spas', path: '/spa' },
          { label: area.city.name, path: `/spa/${citySlug}` },
          { label: area.name }
        ]}
        onNavigate={onNavigate}
      />

      {/* Area Header */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-800">
            <MapPin className="w-3.5 h-3.5" />
            <span>Locality in {area.city.name} {area.pincode ? `• PIN: ${area.pincode}` : ''}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-display">
            Spas &amp; Wellness in {area.name}, {area.city.name}
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {area.description}
          </p>

          <div className="text-xs font-semibold text-stone-700 pt-1">
            {totalBusinesses} verified venue{totalBusinesses === 1 ? '' : 's'} operating in {area.name}
          </div>
        </div>
      </section>

      {/* Businesses Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-stone-900 font-display">
            Directory of Spas in {area.name}
          </h2>
          <button
            onClick={() => onNavigate(`/spa?city=${citySlug}&area=${areaSlug}`)}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
          >
            <span>Filter Search</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {businesses.length === 0 ? (
          <div className="p-8 bg-stone-50 rounded-xl border border-stone-200 text-center">
            <p className="text-xs text-stone-600">No active listings currently registered for {area.name}.</p>
            <button
              onClick={() => onNavigate('/list-your-spa')}
              className="mt-3 px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold"
            >
              + List a Spa in {area.name}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((biz) => (
              <BusinessCard key={biz.id} business={biz} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </section>

      {/* Services in this Area */}
      {availableServices.length > 0 && (
        <section className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
          <h3 className="text-base font-bold text-stone-900 font-display mb-3">
            Wellness Therapies Available in {area.name}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {availableServices.map((s) => (
              <button
                key={s.id}
                onClick={() => onNavigate(`/services/${s.slug}`)}
                className="p-3 bg-white rounded-xl border border-stone-200 hover:border-emerald-300 text-left transition-colors"
              >
                <p className="text-xs font-bold text-stone-900 truncate">{s.name}</p>
                <p className="text-[10px] text-stone-500 mt-0.5">{s.category}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Nearby Areas */}
      {nearbyAreas.length > 0 && (
        <section>
          <h3 className="text-base font-bold text-stone-900 font-display mb-3">
            Neighboring Localities in {area.city.name}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {nearbyAreas.map((na) => (
              <button
                key={na.id}
                onClick={() => onNavigate(`/spa/${citySlug}/${na.slug}`)}
                className="p-3 bg-white hover:bg-emerald-50 rounded-xl border border-stone-200 hover:border-emerald-300 text-left text-xs font-semibold text-stone-800 transition-colors"
              >
                Spas in {na.name} →
              </button>
            ))}
          </div>
        </section>
      )}

      {/* FAQs */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
        <h3 className="text-base font-bold text-stone-900 font-display">
          Frequently Asked Questions ({area.name})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, i) => (
            <div key={i} className="p-4 bg-stone-50 rounded-xl border border-stone-100">
              <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5 mb-1">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-stone-600 pl-5 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
