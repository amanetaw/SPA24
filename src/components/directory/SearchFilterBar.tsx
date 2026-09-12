import React, { useState, useEffect } from 'react';
import { Search, MapPin, SlidersHorizontal, RotateCcw, Check } from 'lucide-react';
import { City, Area, Service } from '../../types';

interface SearchFilterBarProps {
  initialSearch?: string;
  initialCity?: string;
  initialArea?: string;
  initialService?: string;
  initialOpenNow?: boolean;
  initialSort?: string;
  cities: City[];
  services: Service[];
  areas: Area[];
  onFilterChange: (filters: {
    q: string;
    city: string;
    area: string;
    service: string;
    open_now: boolean;
    sort: string;
  }) => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  initialSearch = '',
  initialCity = '',
  initialArea = '',
  initialService = '',
  initialOpenNow = false,
  initialSort = 'popular',
  cities,
  services,
  areas,
  onFilterChange
}) => {
  const [q, setQ] = useState(initialSearch);
  const [city, setCity] = useState(initialCity);
  const [area, setArea] = useState(initialArea);
  const [service, setService] = useState(initialService);
  const [openNow, setOpenNow] = useState(initialOpenNow);
  const [sort, setSort] = useState(initialSort);

  // Filter areas based on selected city
  const filteredAreas = city
    ? areas.filter(a => {
        const foundCity = cities.find(c => c.slug === city);
        return foundCity ? a.city_id === foundCity.id : false;
      })
    : areas;

  useEffect(() => {
    setQ(initialSearch);
    setCity(initialCity);
    setArea(initialArea);
    setService(initialService);
    setOpenNow(initialOpenNow);
    setSort(initialSort);
  }, [initialSearch, initialCity, initialArea, initialService, initialOpenNow, initialSort]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onFilterChange({ q, city, area, service, open_now: openNow, sort });
  };

  const handleCityChange = (newCitySlug: string) => {
    setCity(newCitySlug);
    setArea(''); // reset area when city changes
    onFilterChange({ q, city: newCitySlug, area: '', service, open_now: openNow, sort });
  };

  const handleReset = () => {
    setQ('');
    setCity('');
    setArea('');
    setService('');
    setOpenNow(false);
    setSort('popular');
    onFilterChange({ q: '', city: '', area: '', service: '', open_now: false, sort: 'popular' });
  };

  const hasActiveFilters = q || city || area || service || openNow || sort !== 'popular';

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Search Row */}
        <div className="flex flex-col md:flex-row items-stretch gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <input
              id="directory-search-input"
              type="text"
              placeholder="Search by spa name, keyword, or therapy..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
          </div>

          {/* City Selector */}
          <div className="relative min-w-[160px] sm:w-48">
            <select
              id="filter-city-select"
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
              aria-label="Filter by city"
              className="w-full appearance-none pl-9 pr-8 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 cursor-pointer text-stone-800"
            >
              <option value="">All Cities</option>
              {cities.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name} {c.published_count !== undefined ? `(${c.published_count})` : ''}
                </option>
              ))}
            </select>
            <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
          </div>

          {/* Search Button */}
          <button
            id="apply-filter-button"
            type="submit"
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors shrink-0 flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>

        {/* Secondary Filter Row */}
        <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Area Selector */}
            <div className="min-w-[140px]">
              <select
                id="filter-area-select"
                value={area}
                onChange={(e) => {
                  setArea(e.target.value);
                  onFilterChange({ q, city, area: e.target.value, service, open_now: openNow, sort });
                }}
                aria-label="Filter by locality or area"
                className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-700 focus:outline-hidden cursor-pointer"
              >
                <option value="">All Localities / Areas</option>
                {filteredAreas.map((a) => (
                  <option key={a.id} value={a.slug}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Category */}
            <div className="min-w-[150px]">
              <select
                id="filter-service-select"
                value={service}
                onChange={(e) => {
                  setService(e.target.value);
                  onFilterChange({ q, city, area, service: e.target.value, open_now: openNow, sort });
                }}
                aria-label="Filter by specific service"
                className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-700 focus:outline-hidden cursor-pointer"
              >
                <option value="">All Services</option>
                {services.map((s) => (
                  <option key={s.id} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Open Now Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none px-2 py-1 bg-stone-50 hover:bg-stone-100 rounded-lg border border-stone-200">
              <input
                id="filter-open-now-checkbox"
                type="checkbox"
                checked={openNow}
                onChange={(e) => {
                  setOpenNow(e.target.checked);
                  onFilterChange({ q, city, area, service, open_now: e.target.checked, sort });
                }}
                className="w-3.5 h-3.5 text-emerald-600 rounded-sm focus:ring-emerald-500 border-stone-300"
              />
              <span className="font-medium text-stone-700">Open Now Only</span>
            </label>
          </div>

          {/* Sort & Reset Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-stone-400">Sort:</span>
              <select
                id="filter-sort-select"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  onFilterChange({ q, city, area, service, open_now: openNow, sort: e.target.value });
                }}
                aria-label="Sort listings"
                className="px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-700 focus:outline-hidden cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Recently Added</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-800 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
