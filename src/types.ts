// SPA24 TypeScript Domain Types

export interface City {
  id: number;
  name: string;
  slug: string;
  state: string;
  country: string;
  description: string;
  seo_title?: string | null;
  meta_description?: string | null;
  is_popular: boolean;
  is_published: boolean;
  published_count?: number;
  areas?: Area[];
}

export interface Area {
  id: number;
  city_id: number;
  name: string;
  slug: string;
  pincode: string;
  description: string;
  seo_title?: string | null;
  meta_description?: string | null;
  is_popular: boolean;
  is_published: boolean;
  city_name?: string;
  city_slug?: string;
  published_count?: number;
}

export interface Service {
  id: number;
  name: string;
  slug: string;
  category: string;
  short_desc: string;
  full_desc: string;
  expectations: string;
  provider_tips: string;
  seo_title?: string | null;
  meta_description?: string | null;
  icon?: string;
  is_popular: boolean;
  is_published?: boolean;
  published_count?: number;
}

export interface BusinessHour {
  id?: number;
  business_id?: number;
  day_of_week: number; // 0 = Sunday, 1 = Monday ...
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface BusinessPhoto {
  id?: number;
  business_id?: number;
  business_name?: string;
  url: string;
  caption?: string;
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
}

export interface BusinessServiceItem {
  service_id: number;
  name: string;
  slug: string;
  price_from?: number | null;
  duration_minutes?: number | null;
  notes?: string | null;
}

export type PlanType = 'free' | 'monthly' | 'half_yearly' | 'yearly';
export type PaymentStatus = 'pending' | 'paid' | 'waived' | 'refunded' | 'free';

export interface ListingPlan {
  id: PlanType;
  name: string;
  tagline: string;
  durationMonths: number;
  price: number;
  originalPrice?: number;
  billingPeriod: string;
  monthlyEquivalent: number;
  discountLabel?: string;
  popular?: boolean;
  badgeText?: string;
  featured_tier?: 'standard' | 'premium' | 'platinum';
  features: string[];
}

export const LISTING_PLANS: ListingPlan[] = [
  {
    id: 'free',
    name: 'Free Basic',
    tagline: 'Standard community verification',
    durationMonths: 0,
    price: 0,
    billingPeriod: 'Lifetime Free',
    monthlyEquivalent: 0,
    features: [
      'Directory listing after editorial review',
      'Name, address, phone & city index',
      'Single cover photo',
      'Standard search placement',
      'Basic inquiry notifications'
    ]
  },
  {
    id: 'monthly',
    name: 'Monthly Pro',
    tagline: 'Flexible visibility boost for growing spas',
    durationMonths: 1,
    price: 999,
    originalPrice: 1299,
    billingPeriod: 'Billed monthly',
    monthlyEquivalent: 999,
    discountLabel: 'Save 23%',
    badgeText: 'Verified Pro',
    featured_tier: 'standard',
    features: [
      'Priority 24-hour verification approval',
      'Verified Pro trust badge on directory',
      'Full photo gallery with SEO Alt tags',
      'Live Visitor on Spa Counter enabled',
      'Direct WhatsApp & Call lead buttons',
      'Target search keywords indexing',
      'Monthly performance analytics'
    ]
  },
  {
    id: 'half_yearly',
    name: 'Half-Yearly Growth',
    tagline: 'Top choice for reputable wellness centers',
    durationMonths: 6,
    price: 4999,
    originalPrice: 5994,
    billingPeriod: 'Billed every 6 months',
    monthlyEquivalent: 833,
    discountLabel: 'Save 17%',
    popular: true,
    badgeText: 'Premium Featured',
    featured_tier: 'premium',
    features: [
      'Everything in Monthly Pro plan',
      'Featured badge in Locality & City',
      'Top 5 Search ranking in your area',
      'Highlighted listing card with purple accent',
      'Direct website backlink & booking URL',
      'Priority phone & WhatsApp customer support',
      'Zero ads on your listing page'
    ]
  },
  {
    id: 'yearly',
    name: 'Yearly Platinum VIP',
    tagline: 'Maximum visibility & market leadership',
    durationMonths: 12,
    price: 8999,
    originalPrice: 11988,
    billingPeriod: 'Billed annually',
    monthlyEquivalent: 749,
    discountLabel: 'Save 25%',
    badgeText: 'Platinum VIP Partner',
    featured_tier: 'platinum',
    features: [
      'Everything in Half-Yearly Growth',
      'Number 1 / Top 3 Guaranteed area placement',
      'Platinum Shield verified badge & gold border',
      'Homepage Spotlight & City Hero banner rotation',
      'Wellness journal & editorial review mention',
      'Dedicated account manager for updates',
      'Full 12 months verified directory prestige'
    ]
  }
];

export function getPlanBadgeInfo(planType?: string | null) {
  switch (planType) {
    case 'yearly':
      return {
        label: 'Platinum VIP',
        badgeClass: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400/50 shadow-xs',
        textClass: 'text-amber-700',
        color: 'amber'
      };
    case 'half_yearly':
      return {
        label: 'Premium Featured',
        badgeClass: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400/50 shadow-xs',
        textClass: 'text-purple-700',
        color: 'purple'
      };
    case 'monthly':
      return {
        label: 'Verified Pro',
        badgeClass: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-400/50 shadow-xs',
        textClass: 'text-emerald-700',
        color: 'emerald'
      };
    default:
      return {
        label: 'Standard Free',
        badgeClass: 'bg-stone-100 text-stone-700 border-stone-300',
        textClass: 'text-stone-600',
        color: 'stone'
      };
  }
}

export interface Business {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  phone: string;
  email?: string | null;
  website?: string | null;
  booking_url?: string | null;
  address: string;
  city_id: number;
  area_id: number;
  google_maps_url?: string | null;
  status: 'pending' | 'published' | 'suspended' | 'archived' | 'draft';
  verification_status: 'unverified' | 'verified' | 'claimed';
  owner_id?: number | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  social_links?: any;
  seo_title?: string | null;
  meta_description?: string | null;
  keywords?: string | string[] | null;
  pincode?: string | null;
  // Plan & Payment fields
  plan_type?: PlanType;
  payment_status?: PaymentStatus;
  payment_id?: string | null;
  amount_paid?: number;
  plan_started_at?: string | null;
  plan_expires_at?: string | null;
  featured_tier?: 'standard' | 'premium' | 'platinum' | null;
  // Enriched fields
  city_name?: string;
  city_slug?: string;
  city_state?: string;
  area_name?: string;
  area_slug?: string;
  area_pincode?: string;
  primary_photo?: string;
  photos?: BusinessPhoto[];
  hours?: BusinessHour[];
  services?: BusinessServiceItem[];
  is_open_now?: boolean;
  today_hours?: BusinessHour;
  relatedAreaBusinesses?: Business[];
  relatedCityBusinesses?: Business[];
}

export interface Submission {
  id: number;
  business_name: string;
  category: string;
  description: string;
  phone: string;
  email: string;
  website?: string | null;
  booking_url?: string | null;
  full_address: string;
  city_name: string;
  area_name: string;
  pincode?: string | null;
  google_maps_url?: string | null;
  service_ids: number[];
  opening_hours_json: any[];
  photos_json: any[];
  social_links_json?: any;
  owner_name: string;
  keywords?: string | null;
  view_count?: number;
  // Plan & Payment fields
  plan_type?: PlanType;
  payment_status?: PaymentStatus;
  payment_id?: string | null;
  amount_paid?: number;
  payment_method?: string | null;
  paid_at?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string | null;
  created_at: string;
  reviewed_at?: string | null;
  reviewed_by?: number | null;
}

export interface Claim {
  id: number;
  business_id: number;
  user_id: number;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  applicant_role: string;
  claimant_name?: string;
  claimant_email?: string;
  claimant_phone?: string;
  claimant_role?: string;
  proof_document_type?: string;
  proof_document_url?: string;
  verification_method: 'email' | 'website_token' | 'phone' | 'manual_admin';
  verification_token: string;
  proof_notes?: string | null;
  status: 'pending' | 'under_review' | 'verified' | 'rejected';
  rejection_reason?: string | null;
  created_at: string;
  reviewed_at?: string | null;
  reviewed_by?: number | null;
  business_name?: string;
  business_slug?: string;
  user_email?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  author: string;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  seo_title?: string | null;
  meta_description?: string | null;
  status: 'draft' | 'published' | 'archived';
  published_at: string;
  updated_at: string;
  relatedPosts?: any[];
  relevantServices?: Service[];
  relevantCities?: City[];
}

export interface Correction {
  id: number;
  business_id: number;
  business_name?: string;
  user_id?: number | null;
  user_email?: string;
  proposed_data_json?: any;
  suggested_changes?: string;
  notes?: string;
  status: 'pending' | 'reviewed' | 'applied' | 'rejected';
  created_at: string;
  reviewed_at?: string | null;
  admin_notes?: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  name?: string;
  role: 'user' | 'business_owner' | 'editor' | 'admin';
  phone?: string | null;
  created_at?: string;
}

export interface AuditLog {
  id: number;
  user_id?: number | null;
  action: string;
  entity_type: string;
  entity_id?: number | null;
  details_json?: any;
  created_at: string;
}

export interface UserReport {
  id: number;
  business_id: number;
  business_name?: string;
  reason: string;
  details: string;
  reporter_name?: string;
  reporter_email?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  admin_notes?: string;
  created_at: string;
}

export type Photo = BusinessPhoto;
export type Report = UserReport;

export interface SearchResult {
  businesses: Business[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const ALL_SPA_CATEGORIES = [
  'Day Spa & Wellness Center',
  'Ayurvedic & Panchakarma Clinic',
  'Thai Traditional Massage Spa',
  'Luxury Hotel & 5-Star Resort Spa',
  'Couples & Private Suite Spa',
  'Medical & Aesthetic Skin Spa',
  'Turkish Hammam & Bathhouse',
  'Swedish & Deep Tissue Therapy Spa',
  'Foot Reflexology & Acupressure Lounge',
  'Salon & Beauty Day Spa',
  'Organic & Holistic Healing Spa',
  'Destination Wellness & Yoga Retreat',
  'Thermal Mineral & Hot Springs Spa',
  'Express Mall & Airport Transit Spa',
  'Unisex Wellness Spa',
  'Men\'s Grooming & Relaxation Spa',
  'Women-Only Wellness Haven'
];

