import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  HelpCircle,
  Building2,
  ChevronRight
} from 'lucide-react';
import { api } from '../lib/api';
import { City, Area, Service, Business } from '../types';
import { BusinessCard } from '../components/directory/BusinessCard';
import { useSEO } from '../hooks/useSEO';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [cities, setCities] = useState<City[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [featuredBusinesses, setFeaturedBusinesses] = useState<Business[]>([]);
  const [recentBusinesses, setRecentBusinesses] = useState<Business[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Find Genuine Spas & Wellness Services Near You',
    description: 'Explore verified spa and wellness centers across major cities. Transparent business directories, verified opening hours, services, and official contact details.',
    canonical: 'https://spa24.online/',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'SPA24',
      url: 'https://spa24.online',
      description: 'Directory of genuine spa, massage therapy, and wellness businesses.',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://spa24.online/spa?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    }
  });

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [citiesData, areasData, servicesData, featuredRes, recentRes] = await Promise.all([
          api.cities.getAll(),
          api.areas.getAll(),
          api.services.getAll(),
          api.businesses.search({ limit: 6, sort: 'popular' }),
          api.businesses.search({ limit: 4, sort: 'newest' })
        ]);

        setCities(citiesData);
        setAreas(areasData);
        setServices(servicesData);
        setFeaturedBusinesses(featuredRes.businesses);
        setRecentBusinesses(recentRes.businesses);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCity) params.set('city', selectedCity);
    if (selectedService) params.set('service', selectedService);
    onNavigate(`/spa${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const faqs = [
    {
      q: 'How does SPA24 verify spa listings?',
      a: 'Every listing submitted to SPA24 undergoes manual editorial review by our compliance team. We verify business licenses, physical location, operational phone lines, and operating hours before granting published status.'
    },
    {
      q: 'Does SPA24 use artificial reviews or ratings?',
      a: 'No. In adherence to strict directory standards, SPA24 never fabricates customer reviews, star ratings, or simulated testimonials. We provide verifiable facts: contact info, exact address, offered therapies, operating schedule, and authentic imagery.'
    },
    {
      q: 'How can a spa business owner claim their profile?',
      a: 'Business owners can click "Claim Listing", provide proof of ownership (official company email domain, website token, or utility verification), and upon editorial validation, gain complete control over their listing.'
    },
    {
      q: 'What should I do if I spot inaccurate business information?',
      a: 'Each business profile includes a "Report Inaccuracy" and "Suggest Correction" button. Submissions are reviewed and updated within 24 to 48 hours.'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-stone-100 via-stone-50 to-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/70 text-emerald-900 border border-emerald-200/80 mb-6 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Editorial Verification • Genuine Spas • Zero Fake Reviews</span>
          </div>

          {/* H1 Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight font-display mb-4">
            Find Spas &amp; Wellness Services Near You
          </h1>

          <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            Discover verified massage therapy, day spas, ayurvedic retreats, and relaxation centers across premier cities and local neighborhoods.
          </p>

          {/* Main Hero Search Card */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-lg border border-stone-200/80 max-w-4xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch gap-2.5">
              {/* Keyword */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Spa name, massage type, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>

              {/* City */}
              <div className="relative sm:w-48">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full appearance-none pl-9 pr-8 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-stone-700 cursor-pointer"
                >
                  <option value="">All Cities</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>

              {/* Service */}
              <div className="relative sm:w-48">
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full appearance-none pl-9 pr-8 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-stone-700 cursor-pointer"
                >
                  <option value="">All Services</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <Sparkles className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="px-7 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm shrink-0 flex items-center justify-center gap-2"
              >
                <span>Find Spas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Tags */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-stone-500">
            <span className="font-semibold text-stone-600">Quick Searches:</span>
            {services.slice(0, 5).map((s) => (
              <button
                key={s.id}
                onClick={() => onNavigate(`/services/${s.slug}`)}
                className="px-2.5 py-1 bg-white hover:bg-stone-100 rounded-full border border-stone-200 transition-colors"
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 font-display">Popular Cities</h2>
            <p className="text-xs text-stone-500 mt-0.5">Explore spa directories across top metropolitan destinations</p>
          </div>
          <button
            onClick={() => onNavigate('/cities')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
          >
            <span>View All Cities</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {cities.slice(0, 5).map((city) => (
            <div
              key={city.id}
              onClick={() => onNavigate(`/spa/${city.slug}`)}
              className="group bg-white p-4 rounded-xl border border-stone-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-stone-900 text-sm group-hover:text-emerald-800 transition-colors font-display">
                  {city.name}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">{city.state}</p>
              </div>
              <div className="mt-4 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-600">
                <span>{city.published_count || 0} listings</span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 font-display">Wellness &amp; Therapy Services</h2>
            <p className="text-xs text-stone-500 mt-0.5">Learn what to expect from specialized wellness treatments</p>
          </div>
          <button
            onClick={() => onNavigate('/services')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
          >
            <span>All Services</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.slice(0, 6).map((svc) => (
            <div
              key={svc.id}
              onClick={() => onNavigate(`/services/${svc.slug}`)}
              className="bg-white p-5 rounded-xl border border-stone-200 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">
                    {svc.category}
                  </span>
                  <span className="text-xs text-stone-500">{svc.published_count || 0} locations</span>
                </div>
                <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors font-display mb-1.5">
                  {svc.name}
                </h3>
                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {svc.short_desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-medium text-emerald-800">
                <span>Treatment guide &amp; providers</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Businesses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 font-display">Verified Spa Centers</h2>
            <p className="text-xs text-stone-500 mt-0.5">Authentic facilities reviewed by our editorial team</p>
          </div>
          <button
            onClick={() => onNavigate('/spa')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
          >
            <span>Explore All ({featuredBusinesses.length}+)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredBusinesses.map((biz) => (
            <BusinessCard key={biz.id} business={biz} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* Why Use SPA24 Section (Trust Architecture) */}
      <section className="bg-stone-100 py-12 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-display mb-2">
              Why Users Trust SPA24
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              We built SPA24 to solve the rampant issue of fabricated reviews, duplicate listings, and inaccurate addresses across typical online business directories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-sm mb-2 font-display">Zero Fabricated Content</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                We never create artificial 5-star ratings or bot reviews. We focus on factual accuracy: authentic opening hours, verifiable phone numbers, and physical premises.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-sm mb-2 font-display">Strict Verification Pipeline</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Every listing submitted by a venue owner or community member must clear duplicate checks and manual editorial approval before going live.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-sm mb-2 font-display">Dynamic Operating Status</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Know whether a center is currently open or closed with real-time day-of-week hour calculations, preventing wasted trips.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Areas Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 font-display">Browse by Neighborhood &amp; Area</h2>
            <p className="text-xs text-stone-500 mt-0.5">Find wellness providers within walking distance of key commercial districts</p>
          </div>
          <button
            onClick={() => onNavigate('/areas')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
          >
            <span>All Localities</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {areas.slice(0, 12).map((area) => (
            <button
              key={area.id}
              onClick={() => onNavigate(`/spa/${area.city_slug}/${area.slug}`)}
              className="p-3 bg-white hover:bg-emerald-50 rounded-xl border border-stone-200 hover:border-emerald-300 text-left transition-colors group"
            >
              <p className="font-semibold text-xs text-stone-900 group-hover:text-emerald-900 truncate">
                {area.name}
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5">{area.city_name}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Owner CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-stone-900 rounded-2xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold font-display">Own a Spa or Wellness Center?</h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
              List your verified business on SPA24. Reach authentic clients searching for massage therapies, ayurveda, and relaxation in your neighborhood.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('/list-your-spa')}
              className="px-5 py-2.5 bg-white hover:bg-stone-100 text-emerald-900 font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              List Your Spa Free
            </button>
            <button
              onClick={() => onNavigate('/claim-listing')}
              className="px-5 py-2.5 bg-emerald-800/80 hover:bg-emerald-800 text-white border border-emerald-700 font-semibold text-xs rounded-xl transition-colors"
            >
              Claim Existing Listing
            </button>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-stone-900 font-display">Frequently Asked Questions</h2>
          <p className="text-xs text-stone-500 mt-1">Everything you need to know about the SPA24 wellness directory</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs">
              <h3 className="text-sm font-bold text-stone-900 flex items-start gap-2 mb-2 font-display">
                <HelpCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
