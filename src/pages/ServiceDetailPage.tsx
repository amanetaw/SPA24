import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Service, Business, City } from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { BusinessCard } from '../components/directory/BusinessCard';
import { useSEO } from '../hooks/useSEO';
import { Sparkles, CheckCircle2, HelpCircle, Building2, ChevronRight, ShieldCheck } from 'lucide-react';

interface ServiceDetailPageProps {
  serviceSlug: string;
  onNavigate: (path: string) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({ serviceSlug, onNavigate }) => {
  const [service, setService] = useState<(Service & {
    businesses: Business[];
    availableCities: City[];
    relatedServices: Service[];
  }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadService() {
      setLoading(true);
      setError('');
      try {
        const res = await api.services.getBySlug(serviceSlug);
        setService(res);
      } catch (err: any) {
        setError(err.message || 'Service guide not found.');
      } finally {
        setLoading(false);
      }
    }
    loadService();
  }, [serviceSlug]);

  const svcName = service?.name || serviceSlug;

  useSEO({
    title: `${svcName} Guide - Expectations, Certified Providers & Spas`,
    description: service?.short_desc || `Find verified spa facilities providing ${svcName}. Read treatment details, protocols, and find local practitioners.`,
    canonical: `https://spa24.online/services/${serviceSlug}`
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-6">
        <div className="h-6 bg-stone-200 rounded-sm w-48"></div>
        <div className="h-10 bg-stone-200 rounded-sm w-96"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900 font-display">Service Guide Not Found</h2>
        <p className="text-xs text-stone-600">{error || 'The requested wellness therapy could not be located.'}</p>
        <button
          onClick={() => onNavigate('/services')}
          className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold"
        >
          View All Services
        </button>
      </div>
    );
  }

  const faqs = [
    {
      q: `How long does a standard ${service.name} appointment last?`,
      a: `Most ${service.name} sessions range between 60 to 90 minutes. Providers often advise arriving 15 minutes ahead of time to complete intake consultations.`
    },
    {
      q: `How do I ensure the spa therapist is certified?`,
      a: `Inquire whether the spa therapist holds an accredited certification in therapeutic bodywork or Ayurvedic healing. Venues verified on SPA24 are vetted for professional standards.`
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <Breadcrumbs
        items={[
          { label: 'Services', path: '/services' },
          { label: service.name }
        ]}
        onNavigate={onNavigate}
      />

      {/* Hero Header */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-10 shadow-xs space-y-4">
        <div className="max-w-3xl space-y-3">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            {service.category}
          </span>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-display">
            {service.name}
          </h1>

          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            {service.short_desc}
          </p>
        </div>
      </section>

      {/* Guide Content: Expectations & Provider Selection */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* What to Expect */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3">
          <div className="flex items-center gap-2 text-stone-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold font-display">What Clients Can Expect</h2>
          </div>
          <div className="text-xs sm:text-sm text-stone-600 leading-relaxed whitespace-pre-line">
            {service.expectations}
          </div>
        </div>

        {/* How to choose a provider */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3">
          <div className="flex items-center gap-2 text-stone-900">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold font-display">How to Choose a Provider</h2>
          </div>
          <div className="text-xs sm:text-sm text-stone-600 leading-relaxed whitespace-pre-line">
            {service.provider_tips}
          </div>
        </div>
      </section>

      {/* Spas Offering this Service */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 font-display">
              Verified Providers Offering {service.name}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Strictly verified venues with this certified therapy on their menu
            </p>
          </div>
          <button
            onClick={() => onNavigate(`/spa?service=${service.slug}`)}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
          >
            <span>Filter Search</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {service.businesses && service.businesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.businesses.map((biz) => (
              <BusinessCard key={biz.id} business={biz} onNavigate={onNavigate} />
            ))}
          </div>
        ) : (
          <div className="p-8 bg-stone-50 rounded-xl border border-stone-200 text-center">
            <p className="text-xs text-stone-600">No active venues currently linked to {service.name}.</p>
          </div>
        )}
      </section>

      {/* Available Cities */}
      {service.availableCities && service.availableCities.length > 0 && (
        <section className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
          <h3 className="text-base font-bold text-stone-900 font-display mb-3">
            Cities with Certified {service.name} Centers
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {service.availableCities.map((c) => (
              <button
                key={c.id}
                onClick={() => onNavigate(`/spa/${c.slug}?service=${service.slug}`)}
                className="p-3 bg-white hover:bg-emerald-50 rounded-xl border border-stone-200 hover:border-emerald-300 text-left text-xs font-semibold text-stone-800 transition-colors"
              >
                {c.name} ({service.name}) →
              </button>
            ))}
          </div>
        </section>
      )}

      {/* FAQs */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
        <h3 className="text-base font-bold text-stone-900 font-display">
          {service.name} Treatment FAQs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 bg-stone-50 rounded-xl border border-stone-100">
              <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5 mb-1">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-stone-600 pl-5 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Services */}
      {service.relatedServices && service.relatedServices.length > 0 && (
        <section className="pt-6 border-t border-stone-200">
          <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wider mb-4">
            Complementary Wellness Therapies
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {service.relatedServices.map((rs) => (
              <button
                key={rs.id}
                onClick={() => onNavigate(`/services/${rs.slug}`)}
                className="p-4 bg-white hover:bg-emerald-50 rounded-xl border border-stone-200 hover:border-emerald-300 text-left transition-colors group"
              >
                <h4 className="text-xs font-bold text-stone-900 group-hover:text-emerald-800">{rs.name}</h4>
                <p className="text-[11px] text-stone-500 line-clamp-2 mt-1">{rs.short_desc}</p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
