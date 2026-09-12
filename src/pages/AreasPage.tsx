import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Area, City } from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { useSEO } from '../hooks/useSEO';
import { MapPin, Search, ChevronRight } from 'lucide-react';

interface AreasPageProps {
  onNavigate: (path: string) => void;
}

export const AreasPage: React.FC<AreasPageProps> = ({ onNavigate }) => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCityId, setSelectedCityId] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Browse Spa Centers by Locality & Neighborhood',
    description: 'Explore local neighborhood spa listings with pin-point accuracy across verified residential and commercial zones.',
    canonical: 'https://spa24.online/areas'
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [areasData, citiesData] = await Promise.all([
          api.areas.getAll(),
          api.cities.getAll()
        ]);
        setAreas(areasData);
        setCities(citiesData);
      } catch (err) {
        console.error('Error loading areas:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = areas.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.city_name && a.city_name.toLowerCase().includes(search.toLowerCase())) ||
      (a.pincode && a.pincode.includes(search));
    const matchesCity = selectedCityId === 'all' || a.city_id === selectedCityId;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Areas & Localities' }]} onNavigate={onNavigate} />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-display">
            Local Neighborhood Directories
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Find spas and wellness centers within walking distance of specific commercial hubs or residential sectors.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <select
            value={selectedCityId}
            onChange={(e) => setSelectedCityId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">All Cities</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-56">
            <input
              type="text"
              placeholder="Search area or PIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
            <div key={n} className="h-20 bg-stone-100 rounded-xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((area) => (
            <div
              key={area.id}
              onClick={() => onNavigate(`/spa/${area.city_slug}/${area.slug}`)}
              className="bg-white p-4 rounded-xl border border-stone-200 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium mb-1">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>{area.city_name}</span>
                </div>
                <h3 className="font-bold text-sm text-stone-900 group-hover:text-emerald-800 transition-colors font-display">
                  {area.name}
                </h3>
                {area.pincode && (
                  <p className="text-[10px] text-stone-400 mt-0.5">PIN: {area.pincode}</p>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <span>{area.published_count || 0} listings</span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
