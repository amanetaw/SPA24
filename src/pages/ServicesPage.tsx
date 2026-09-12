import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Service } from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { useSEO } from '../hooks/useSEO';
import { Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

interface ServicesPageProps {
  onNavigate: (path: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('All');

  useSEO({
    title: 'Directory of Spa & Wellness Services | Treatment Guides',
    description: 'Explore comprehensive guides for massage therapy, ayurvedic treatments, facial rejuvenation, body wraps, and hydrotherapy.',
    canonical: 'https://spa24.online/services'
  });

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await api.services.getAll();
        setServices(data);
      } catch (err) {
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  const categories = ['All', ...new Set(services.map((s) => s.category))];
  const filtered = filterCat === 'All' ? services : services.filter((s) => s.category === filterCat);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Breadcrumbs items={[{ label: 'Services' }]} onNavigate={onNavigate} />

      <div className="max-w-3xl space-y-3">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-display">
          Wellness &amp; Therapy Directory
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Comprehensive guides explaining modalities, physiological benefits, session protocols, and certified providers in your area.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filterCat === cat
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 bg-stone-100 rounded-xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((svc) => (
            <div
              key={svc.id}
              onClick={() => onNavigate(`/services/${svc.slug}`)}
              className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">
                    {svc.category}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    {svc.published_count || 0} locations
                  </span>
                </div>

                <h3 className="text-lg font-bold text-stone-900 group-hover:text-emerald-800 transition-colors font-display mb-2">
                  {svc.name}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mb-4">
                  {svc.short_desc}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-emerald-800">
                <span>View Treatment Guide &amp; Providers</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
