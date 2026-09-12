import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { City, Business, Area, Service } from '../types';
import { BusinessCard } from '../components/directory/BusinessCard';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { useSEO } from '../hooks/useSEO';
import { MapPin, Building2, Sparkles, HelpCircle, ChevronRight, CheckCircle2 } from 'lucide-react';

interface CityPageProps {
  citySlug: string;
  onNavigate: (path: string) => void;
}

export const CityPage: React.FC<CityPageProps> = ({ citySlug, onNavigate }) => {
  const [data, setData] = useState<{
    city: City;
    businesses: Business[];
    totalBusinesses: number;
    areas: Area[];
    availableServices: Service[];
    nearbyCities: City[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCity() {
      setLoading(true);
      setError('');
      try {
        const res = await api.cities.getBySlug(citySlug);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load city directory');
      } finally {
        setLoading(false);
      }
    }
    loadCity();
  }, [citySlug]);

  const cityName = data?.city ? data.city.name : citySlug;

  useSEO({
    title: `Best Spas & Wellness Centers in ${cityName} | Verified Directory`,
    description: `Explore genuine spa, massage therapy, and wellness centers across ${cityName}. Verified opening hours, exact addresses, and certified treatments.`,
    canonical: `https://spa24.online/spa/${citySlug}`,
    schema: data?.city ? {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Spas in ${data.city.name}`,
      description: data.city.description,
      numberOfItems: data.totalBusinesses,
      itemListElement: data.businesses.map((b, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'DaySpa',
          name: b.name,
          address: b.address,
          telephone: b.phone,
          url: `https://spa24.online/spa/${citySlug}/${b.area_slug}/${b.slug}`
        }
      }))
    } : undefined
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
        <h2 className="text-xl font-bold text-stone-900 font-display">City Directory Not Found</h2>
        <p className="text-xs text-stone-600">{error || 'The requested city could not be found in our database.'}</p>
        <button
          onClick={() => onNavigate('/cities')}
          className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold"
        >
          Browse All Cities
        </button>
      </div>
    );
  }

  const { city, businesses, areas, availableServices, nearbyCities, totalBusinesses } = data;

  const cityFaqs = [
    {
      q: `How many verified spas are listed in ${city.name}?`,
      a: `SPA24 currently lists ${totalBusinesses} verified spa and wellness facilities in ${city.name}, each reviewed for physical operational status and phone line validity.`
    },
    {
      q: `Which areas in ${city.name} have the highest concentration of spas?`,
      a: areas.length > 0
        ? `Top localities with active wellness venues include ${areas.slice(0, 3).map(a => a.name).join(', ')}.`
        : `Check our neighborhood index for active listings.`
    },
    {
      q: `Can I book an appointment directly through SPA24?`,
      a: `SPA24 provides direct verified contact numbers and official booking website links for each venue so you can reserve directly without third-party commission surcharges.`
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Spas', path: '/spa' },
          { label: city.name }
        ]}
        onNavigate={onNavigate}
      />

      {/* City Hero Banner */}
      <section className="bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 rounded-2xl p-6 sm:p-10 text-white shadow-md">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-800/80 text-emerald-200 border border-emerald-700/60">
            <Building2 className="w-3.5 h-3.5" />
            <span>{city.state}, {city.country}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display">
            Spas &amp; Wellness Centers in {city.name}
          </h1>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            {city.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-emerald-200">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{totalBusinesses} Verified Venues</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{areas.length} Localities Indexed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Localities in this City */}
      {areas.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-stone-900 font-display">
              Neighborhoods in {city.name}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {areas.map((a) => (
              <button
                key={a.id}
                onClick={() => onNavigate(`/spa/${city.slug}/${a.slug}`)}
                className="p-3 bg-white hover:bg-emerald-50 rounded-xl border border-stone-200 hover:border-emerald-300 text-left transition-colors group"
              >
                <p className="font-semibold text-xs text-stone-900 group-hover:text-emerald-900 truncate">
                  {a.name}
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">Explore spas →</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Businesses in this City */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 font-display">
              Verified Listings in {city.name}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Strictly verified addresses and active phone lines
            </p>
          </div>
          <button
            onClick={() => onNavigate(`/spa?city=${city.slug}`)}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
          >
            <span>Filter All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {businesses.length === 0 ? (
          <div className="p-8 bg-stone-50 rounded-xl border border-stone-200 text-center">
            <p className="text-xs text-stone-600">No published listings currently in {city.name}.</p>
            <button
              onClick={() => onNavigate('/list-your-spa')}
              className="mt-3 px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold"
            >
              + List the First Spa in {city.name}
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

      {/* Available Services in this City */}
      {availableServices.length > 0 && (
        <section className="bg-stone-50 rounded-2xl p-6 sm:p-8 border border-stone-200">
          <h2 className="text-xl font-bold text-stone-900 font-display mb-2">
            Popular Therapies in {city.name}
          </h2>
          <p className="text-xs text-stone-600 mb-6">
            Find specialized providers certified in these wellness disciplines:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableServices.map((svc) => (
              <button
                key={svc.id}
                onClick={() => onNavigate(`/services/${svc.slug}`)}
                className="bg-white p-4 rounded-xl border border-stone-200 hover:border-emerald-300 text-left transition-all group"
              >
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm uppercase">
                  {svc.category}
                </span>
                <h3 className="font-bold text-sm text-stone-900 group-hover:text-emerald-800 transition-colors mt-2">
                  {svc.name}
                </h3>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2">{svc.short_desc}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Local Directory Info & FAQ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
          <h3 className="text-base font-bold text-stone-900 font-display">
            Local Wellness Directory Overview: {city.name}
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            {city.name} offers a wide spectrum of relaxation modalities, ranging from ancient Ayurvedic abhyanga and Panchakarma therapies to modern Swedish, deep tissue, and European hydrotherapy centers.
          </p>
          <p className="text-xs text-stone-600 leading-relaxed">
            When choosing a wellness center in {city.name}, ensure you consult the official operating hours and contact numbers provided on each listing profile to confirm availability, therapists, and reservation requirements.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-bold text-stone-900 font-display mb-2">
            {city.name} Spa FAQs
          </h3>
          {cityFaqs.map((faq, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-stone-200">
              <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5 mb-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-stone-600 pl-5 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Nearby / Other Cities */}
      {nearbyCities.length > 0 && (
        <section className="pt-6 border-t border-stone-200">
          <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wider mb-4">
            Explore Other Destination Directories
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {nearbyCities.map((nc) => (
              <button
                key={nc.id}
                onClick={() => onNavigate(`/spa/${nc.slug}`)}
                className="p-3 bg-stone-50 hover:bg-emerald-50 rounded-xl border border-stone-200 text-left text-xs font-semibold text-stone-800 hover:text-emerald-900 transition-colors"
              >
                Spas in {nc.name} →
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
