import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { City } from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { useSEO } from '../hooks/useSEO';
import { Building2, MapPin, ChevronRight, Search } from 'lucide-react';

interface CitiesPageProps {
  onNavigate: (path: string) => void;
}

export const CitiesPage: React.FC<CitiesPageProps> = ({ onNavigate }) => {
  const [cities, setCities] = useState<City[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Browse Spa & Wellness Directories by City',
    description: 'Find licensed spas, massage parlors, and wellness resorts grouped by city and state across our verified directory.',
    canonical: 'https://spa24.online/cities'
  });

  useEffect(() => {
    async function loadCities() {
      try {
        const data = await api.cities.getAll();
        setCities(data);
      } catch (err) {
        console.error('Error fetching cities:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCities();
  }, []);

  const filtered = cities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Cities' }]} onNavigate={onNavigate} />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-display">
            Browse Spas by City
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Explore verified wellness directories across metropolitan hubs and regional retreats.
          </p>
        </div>

        {/* Filter */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search city or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-32 bg-stone-100 rounded-xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((city) => (
            <div
              key={city.id}
              onClick={() => onNavigate(`/spa/${city.slug}`)}
              className="bg-white p-5 rounded-2xl border border-stone-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                    {city.published_count || 0} listings
                  </span>
                </div>

                <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors font-display">
                  {city.name}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">{city.state}, {city.country}</p>
                <p className="text-xs text-stone-600 line-clamp-2 mt-2 leading-relaxed">
                  {city.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-medium text-emerald-800">
                <span>View {city.name} Directory</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
