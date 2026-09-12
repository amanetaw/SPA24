import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Business, City, Area, Service } from '../types';
import { BusinessCard } from '../components/directory/BusinessCard';
import { SearchFilterBar } from '../components/directory/SearchFilterBar';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { useSEO } from '../hooks/useSEO';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

interface DirectoryPageProps {
  onNavigate: (path: string) => void;
  searchParams?: URLSearchParams;
}

export const DirectoryPage: React.FC<DirectoryPageProps> = ({ onNavigate, searchParams }) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter states from URL or defaults
  const [cities, setCities] = useState<City[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [q, setQ] = useState(searchParams?.get('q') || '');
  const [city, setCity] = useState(searchParams?.get('city') || '');
  const [area, setArea] = useState(searchParams?.get('area') || '');
  const [service, setService] = useState(searchParams?.get('service') || '');
  const [openNow, setOpenNow] = useState(searchParams?.get('open_now') === 'true');
  const [sort, setSort] = useState(searchParams?.get('sort') || 'popular');

  useSEO({
    title: city
      ? `Spas & Wellness Centers in ${city.charAt(0).toUpperCase() + city.slice(1)} | Verified Directory`
      : 'Browse All Verified Spas & Wellness Centers',
    description: 'Browse genuine, licensed spa and wellness facilities. Filter by locality, therapeutic service, and operating hours.',
    canonical: 'https://spa24.online/spa'
  });

  // Load lookup options
  useEffect(() => {
    async function loadMeta() {
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
        console.error('Error loading filter data:', err);
      }
    }
    loadMeta();
  }, []);

  // Fetch businesses when filters change
  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      try {
        const res = await api.businesses.search({
          q: q || undefined,
          city: city || undefined,
          area: area || undefined,
          service: service || undefined,
          open_now: openNow,
          sort,
          page,
          limit: 12
        });
        setBusinesses(res.businesses);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch (err) {
        console.error('Failed to search businesses:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [q, city, area, service, openNow, sort, page]);

  const handleFilterChange = (filters: {
    q: string;
    city: string;
    area: string;
    service: string;
    open_now: boolean;
    sort: string;
  }) => {
    setQ(filters.q);
    setCity(filters.city);
    setArea(filters.area);
    setService(filters.service);
    setOpenNow(filters.open_now);
    setSort(filters.sort);
    setPage(1); // reset to first page on filter change
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'All Spas', path: '/spa' },
          ...(city ? [{ label: city.charAt(0).toUpperCase() + city.slice(1), path: `/spa/${city}` }] : []),
          ...(area ? [{ label: area.replace('-', ' ') }] : [])
        ]}
        onNavigate={onNavigate}
      />

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-display">
          {city ? `Spas & Wellness in ${city.charAt(0).toUpperCase() + city.slice(1)}` : 'Verified Spa & Wellness Directory'}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Showing {total} verified business {total === 1 ? 'profile' : 'profiles'} across our verified national index.
        </p>
      </div>

      {/* Search & Filters */}
      <SearchFilterBar
        initialSearch={q}
        initialCity={city}
        initialArea={area}
        initialService={service}
        initialOpenNow={openNow}
        initialSort={sort}
        cities={cities}
        services={services}
        areas={areas}
        onFilterChange={handleFilterChange}
      />

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-stone-100 rounded-xl h-80 border border-stone-200"></div>
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-lg mx-auto my-8 space-y-4">
          <AlertCircle className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="text-base font-bold text-stone-900 font-display">No Listings Matched Your Criteria</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Try adjusting your search terms, selecting a broader locality, or clearing the "Open Now" filter.
          </p>
          <div className="pt-2">
            <button
              onClick={() => handleFilterChange({ q: '', city: '', area: '', service: '', open_now: false, sort: 'popular' })}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((biz) => (
              <BusinessCard key={biz.id} business={biz} onNavigate={onNavigate} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-stone-200">
              <button
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="text-xs text-stone-600 px-3">
                Page <span className="font-bold text-stone-900">{page}</span> of {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
