import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Business, Claim, Service } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSEO } from '../hooks/useSEO';
import {
  Building2,
  Clock,
  Sparkles,
  Edit3,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Save,
  Phone,
  Mail,
  MapPin,
  Globe
} from 'lucide-react';

interface OwnerDashboardPageProps {
  onNavigate: (path: string) => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const OwnerDashboardPage: React.FC<OwnerDashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(null);

  // Edit form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [bookingUrl, setBookingUrl] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState<any[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [error, setError] = useState('');

  useSEO({
    title: 'Owner Portal & Listing Management | SPA24',
    description: 'Manage verified spa listing details, updated schedules, offered treatments, and view ownership verification claims.',
    canonical: 'https://spa24.online/dashboard'
  });

  useEffect(() => {
    async function loadOwnerData() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const [bizList, claimsList, servicesList] = await Promise.all([
          api.owner.getBusinesses(),
          api.owner.getClaims(),
          api.services.getAll()
        ]);
        setBusinesses(bizList);
        setClaims(claimsList);
        setAllServices(servicesList);

        if (bizList.length > 0) {
          selectBusinessToEdit(bizList[0]);
        }
      } catch (err: any) {
        console.error('Failed to load owner listings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOwnerData();
  }, [user]);

  const selectBusinessToEdit = (b: Business) => {
    setSelectedBiz(b);
    setName(b.name || '');
    setPhone(b.phone || '');
    setEmail(b.email || '');
    setWebsite(b.website || '');
    setBookingUrl(b.booking_url || '');
    setDescription(b.description || '');
    setAddress(b.address || '');
    setSelectedServiceIds(b.services ? b.services.map((s) => s.service_id) : []);

    // Load or populate hours
    if (b.hours && b.hours.length > 0) {
      setHours(b.hours);
    } else {
      setHours(
        DAYS.map((_, idx) => ({
          day_of_week: idx,
          open_time: '10:00',
          close_time: '21:00',
          is_closed: false
        }))
      );
    }
  };

  const handleHourChange = (dayIdx: number, field: string, val: any) => {
    setHours((prev) =>
      prev.map((h) => (h.day_of_week === dayIdx ? { ...h, [field]: val } : h))
    );
  };

  const toggleService = (id: number) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBiz) return;

    setIsSaving(true);
    setSaveSuccess('');
    setError('');

    try {
      const res = await api.owner.updateBusiness(selectedBiz.id, {
        name,
        phone,
        email,
        website,
        booking_url: bookingUrl,
        description,
        address,
        hours,
        service_ids: selectedServiceIds
      });

      setSaveSuccess('Business listing updated successfully! Changes are live in the directory.');
      setSelectedBiz(res.business);
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update business details.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <Shield className="w-12 h-12 text-emerald-700 mx-auto" />
        <h2 className="text-xl font-bold text-stone-900 font-display">Owner Authentication Required</h2>
        <p className="text-xs text-stone-600">Please sign in to access your verified business dashboard.</p>
        <button
          onClick={() => onNavigate('/login?redirect=/dashboard')}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Switch Banner */}
      {user.role === 'admin' && (
        <div className="bg-slate-950 text-white rounded-2xl border border-amber-500/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>Enterprise Administrator Access</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 uppercase">Admin</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                You have master privileges to manage all directory businesses, cities, areas, treatments, blog, and moderation queues.
              </p>
            </div>
          </div>
          <button
            id="switch-to-admin-cms-btn"
            onClick={() => onNavigate('/admin')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-1.5 w-fit cursor-pointer flex-shrink-0"
          >
            <span>Open Dedicated Admin CMS</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-stone-900 font-display">
              Business Owner Portal
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 uppercase">
              {user.role.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Logged in as {user.full_name} ({user.email})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/claim-listing')}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors"
          >
            Claim Another Spa
          </button>
          <button
            onClick={() => onNavigate('/list-your-spa')}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            + Add New Listing
          </button>
        </div>
      </div>

      {/* Claims Tracker Banner */}
      {claims.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Active Ownership Claims ({claims.length})
          </h2>
          <div className="divide-y divide-stone-100 text-xs">
            {claims.map((c) => (
              <div key={c.id} className="py-2.5 flex items-center justify-between gap-3">
                <div>
                  <span className="font-semibold text-stone-900">{c.business_name || `Business #${c.business_id}`}</span>
                  <span className="text-stone-400 text-[11px] block">
                    Token: {c.verification_token} • Applied on {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    c.status === 'verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : c.status === 'rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Listing Editor Section */}
      {businesses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-lg mx-auto space-y-4">
          <Building2 className="w-12 h-12 text-stone-400 mx-auto" />
          <h2 className="text-base font-bold text-stone-900 font-display">No Managed Businesses Found</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            You have not yet claimed or had a listing assigned to your account. If your spa is already listed on SPA24, claim it below:
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => onNavigate('/claim-listing')}
              className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold"
            >
              Claim Existing Listing
            </button>
            <button
              onClick={() => onNavigate('/list-your-spa')}
              className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold"
            >
              Submit New Spa
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Business Selector */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Your Managed Listings ({businesses.length})
            </h2>

            <div className="space-y-2">
              {businesses.map((b) => (
                <div
                  key={b.id}
                  onClick={() => selectBusinessToEdit(b)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedBiz?.id === b.id
                      ? 'bg-emerald-50 border-emerald-600 shadow-2xs'
                      : 'bg-white border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <p className="font-bold text-stone-900 truncate">{b.name}</p>
                  <p className="text-stone-500 text-[11px] mt-0.5">{b.area_name}, {b.city_name}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-emerald-700 font-semibold uppercase">{b.status}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(`/spa/${b.city_slug}/${b.area_slug}/${b.slug}`);
                      }}
                      className="text-stone-500 hover:text-stone-900 inline-flex items-center gap-0.5"
                    >
                      <span>View Live</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 3 Columns: Active Editor Form */}
          <div className="lg:col-span-3 space-y-6">
            {selectedBiz && (
              <form onSubmit={handleSave} className="space-y-6">
                {saveSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{saveSuccess}</span>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-300 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Card 1: Core Details */}
                <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-stone-900 font-display">
                      Business Details
                    </h2>
                    <span className="text-xs text-stone-400">ID #{selectedBiz.id}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Business Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Website
                      </label>
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Booking URL
                      </label>
                      <input
                        type="url"
                        value={bookingUrl}
                        onChange={(e) => setBookingUrl(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Physical Street Address
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Overview &amp; Description
                      </label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Card 2: Services Offered */}
                <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3">
                  <h2 className="text-base font-bold text-stone-900 font-display">
                    Select Services Offered
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {allServices.map((s) => {
                      const active = selectedServiceIds.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleService(s.id)}
                          className={`p-2.5 rounded-lg border text-left transition-colors flex items-center justify-between ${
                            active
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                              : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          <span className="truncate">{s.name}</span>
                          <span>{active ? '✓' : ''}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Card 3: Operating Hours */}
                <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3">
                  <h2 className="text-base font-bold text-stone-900 font-display">
                    Weekly Schedule
                  </h2>
                  <div className="space-y-2 text-xs">
                    {DAYS.map((dayName, idx) => {
                      const h = hours.find((item) => item.day_of_week === idx) || {
                        day_of_week: idx,
                        open_time: '10:00',
                        close_time: '21:00',
                        is_closed: false
                      };
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 p-2 bg-stone-50 border border-stone-200 rounded-lg"
                        >
                          <span className="w-24 font-bold text-stone-800">{dayName}</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              disabled={h.is_closed}
                              value={h.open_time}
                              onChange={(e) => handleHourChange(idx, 'open_time', e.target.value)}
                              className="px-2 py-1 bg-white border border-stone-200 rounded-md disabled:opacity-40"
                            />
                            <span className="text-stone-400">to</span>
                            <input
                              type="time"
                              disabled={h.is_closed}
                              value={h.close_time}
                              onChange={(e) => handleHourChange(idx, 'close_time', e.target.value)}
                              className="px-2 py-1 bg-white border border-stone-200 rounded-md disabled:opacity-40"
                            />
                          </div>
                          <label className="flex items-center gap-1 text-stone-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={h.is_closed}
                              onChange={(e) => handleHourChange(idx, 'is_closed', e.target.checked)}
                              className="w-3.5 h-3.5 text-emerald-700"
                            />
                            <span>Closed</span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Save CTA */}
                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving Changes...' : 'Save & Publish Updates'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
