import React from 'react';
import { MapPin, Phone, Clock, ExternalLink, ShieldCheck, CheckCircle2, ChevronRight, Eye } from 'lucide-react';
import { Business } from '../../types';

interface BusinessCardProps {
  business: Business;
  onNavigate: (path: string) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ business, onNavigate }) => {
  const detailUrl = `/spa/${business.city_slug || 'city'}/${business.area_slug || 'area'}/${business.slug}`;

  return (
    <div
      id={`business-card-${business.id}`}
      className="group bg-white rounded-xl border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden hover:border-emerald-200"
    >
      {/* Photo Container */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-100">
        <img
          src={business.primary_photo || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'}
          alt={`${business.name} wellness facility`}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Verification Status Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold backdrop-blur-md bg-stone-900/80 text-white shadow-xs">
          {business.verification_status === 'claimed' ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Owner</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Directory Verified</span>
            </>
          )}
        </div>

        {/* Open Now Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide backdrop-blur-md shadow-xs ${
              business.is_open_now
                ? 'bg-emerald-600/90 text-white'
                : 'bg-stone-800/80 text-stone-200'
            }`}
          >
            {business.is_open_now ? 'Open Now' : 'Closed'}
          </span>
        </div>

        {/* Visitor on Spa Counter Badge */}
        {business.view_count !== undefined && business.view_count > 0 && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md bg-stone-950/75 text-amber-300 border border-amber-400/20">
            <Eye className="w-3 h-3 text-amber-400" />
            <span>{business.view_count.toLocaleString()} visits</span>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Location */}
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium mb-1.5 flex-wrap">
            <span>{business.category}</span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-600">
              {business.area_name}, {business.city_name}
              {(business.pincode || business.area_pincode) ? ` (${business.pincode || business.area_pincode})` : ''}
            </span>
          </div>

          {/* Business Title */}
          <h3
            onClick={() => onNavigate(detailUrl)}
            className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors cursor-pointer line-clamp-1 mb-2 font-display"
          >
            {business.name}
          </h3>

          {/* Address */}
          <p className="text-xs text-stone-500 line-clamp-2 flex items-start gap-1.5 mb-3">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
            <span>{business.address}</span>
          </p>

          {/* Services Chips */}
          {business.services && business.services.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {business.services.slice(0, 3).map((svc) => (
                <span
                  key={svc.service_id}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-100 text-stone-700"
                >
                  {svc.name}
                </span>
              ))}
              {business.services.length > 3 && (
                <span className="px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-stone-50 text-stone-500">
                  +{business.services.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          {/* Phone */}
          {business.phone ? (
            <a
              href={`tel:${business.phone}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-emerald-700 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>{business.phone}</span>
            </a>
          ) : (
            <span className="text-xs text-stone-400">Hours: 9am - 9pm</span>
          )}

          {/* View Details CTA */}
          <button
            onClick={() => onNavigate(detailUrl)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
          >
            <span>View Profile</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
