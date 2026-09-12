import {
  Business,
  City,
  Area,
  Service,
  SearchResult,
  Submission,
  Claim,
  BlogPost,
  User,
  AuditLog,
  UserReport
} from '../types';

const TOKEN_KEY = 'spa24_token';

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
export const setAuthToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const removeAuthToken = () => localStorage.removeItem(TOKEN_KEY);

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers
  });

  if (!res.ok) {
    let errorMsg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data.error) errorMsg = data.error;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Businesses
  businesses: {
    search: (params: {
      q?: string;
      city?: string;
      area?: string;
      service?: string;
      open_now?: boolean;
      sort?: string;
      page?: number;
      limit?: number;
    }) => {
      const query = new URLSearchParams();
      if (params.q) query.set('q', params.q);
      if (params.city) query.set('city', params.city);
      if (params.area) query.set('area', params.area);
      if (params.service) query.set('service', params.service);
      if (params.open_now) query.set('open_now', 'true');
      if (params.sort) query.set('sort', params.sort);
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));
      return request<SearchResult>(`/api/businesses?${query.toString()}`);
    },
    getBySlug: (citySlug: string, areaSlug: string, businessSlug: string) => {
      return request<Business>(`/api/businesses/slug/${citySlug}/${areaSlug}/${businessSlug}`);
    },
    getById: (id: number) => {
      return request<Business>(`/api/businesses/${id}`);
    },
    checkDuplicate: (params: { name?: string; phone?: string; website?: string; address?: string; city?: string }) => {
      const query = new URLSearchParams();
      if (params.name) query.set('name', params.name);
      if (params.phone) query.set('phone', params.phone);
      if (params.website) query.set('website', params.website);
      if (params.address) query.set('address', params.address);
      if (params.city) query.set('city', params.city);
      return request<{ hasMatches: boolean; matches: Array<{ business: Business; matchedFields: string[] }> }>(
        `/api/businesses/check-duplicate?${query.toString()}`
      );
    }
  },

  // Cities
  cities: {
    getAll: () => request<City[]>('/api/cities'),
    getBySlug: (slug: string) => request<{
      city: City;
      businesses: Business[];
      totalBusinesses: number;
      areas: Area[];
      availableServices: Service[];
      nearbyCities: City[];
    }>(`/api/cities/${slug}`)
  },

  // Areas
  areas: {
    getAll: () => request<Area[]>('/api/areas'),
    getBySlug: (citySlug: string, areaSlug: string) => request<{
      area: Area & { city: City };
      businesses: Business[];
      totalBusinesses: number;
      nearbyAreas: Area[];
      availableServices: Service[];
    }>(`/api/areas/${citySlug}/${areaSlug}`)
  },

  // Services
  services: {
    getAll: () => request<Service[]>('/api/services'),
    getBySlug: (slug: string) => request<Service & {
      businesses: Business[];
      availableCities: City[];
      relatedServices: Service[];
      published_count: number;
    }>(`/api/services/${slug}`)
  },

  // Submissions (List Your Spa)
  submissions: {
    create: (data: any) => request<{ message: string; submissionId: number; status: string; possibleDuplicates?: any[] }>(
      '/api/submissions',
      { method: 'POST', body: JSON.stringify(data) }
    ),
    getAll: (status?: string) => request<Submission[]>(`/api/submissions${status ? `?status=${status}` : ''}`),
    approve: (id: number) => request<{ message: string; result: any }>(`/api/submissions/${id}/approve`, { method: 'POST' }),
    reject: (id: number, reason: string) => request<{ message: string }>(`/api/submissions/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    })
  },

  // Claims
  claims: {
    create: (data: any) => request<{ message: string; claim: Claim }>('/api/claims', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getMy: () => request<Claim[]>('/api/claims/my'),
    getAll: (status?: string) => request<Claim[]>(`/api/claims${status ? `?status=${status}` : ''}`),
    review: (id: number, action: 'verified' | 'rejected', reason?: string) => request<{ message: string; claim: Claim }>(
      `/api/claims/${id}/review`,
      { method: 'POST', body: JSON.stringify({ action, reason }) }
    ),
    verify: (id: number) => request<{ message: string; claim: Claim }>(
      `/api/claims/${id}/review`,
      { method: 'POST', body: JSON.stringify({ action: 'verified' }) }
    ),
    reject: (id: number, reason?: string) => request<{ message: string; claim: Claim }>(
      `/api/claims/${id}/review`,
      { method: 'POST', body: JSON.stringify({ action: 'rejected', reason }) }
    )
  },

  // Reports
  reports: {
    getAll: () => request<UserReport[]>('/api/reports'),
    resolve: (id: number, adminNotes?: string) => request<{ message: string }>(`/api/reports/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ admin_notes: adminNotes })
    }),
    dismiss: (id: number, adminNotes?: string) => request<{ message: string }>(`/api/reports/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ status: 'dismissed', admin_notes: adminNotes })
    })
  },

  // Blog
  blog: {
    getAll: () => request<BlogPost[]>('/api/blog'),
    getBySlug: (slug: string) => request<BlogPost>(`/api/blog/${slug}`),
    create: (data: any) => request<BlogPost>('/api/blog', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<BlogPost>(`/api/blog/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<{ message: string }>(`/api/blog/${id}`, { method: 'DELETE' })
  },

  // Interactions (Contact, Reports, Corrections)
  interactions: {
    contact: (data: { name: string; email: string; subject: string; message: string }) =>
      request<{ message: string }>('/api/contact', { method: 'POST', body: JSON.stringify(data) }),
    report: (data: { business_id: number; report_type: string; message: string; reporter_email?: string }) =>
      request<{ message: string }>('/api/reports', { method: 'POST', body: JSON.stringify(data) }),
    correction: (data: { business_id: number; proposed_data: any; notes?: string }) =>
      request<{ message: string }>('/api/corrections', { method: 'POST', body: JSON.stringify(data) })
  },

  // Auth
  auth: {
    login: (credentialsOrEmail: { email: string; password: string } | string, maybePassword?: string) => {
      const payload = typeof credentialsOrEmail === 'string'
        ? { email: credentialsOrEmail, password: maybePassword || '' }
        : credentialsOrEmail;
      return request<{ message: string; token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    register: (data: { email: string; password: string; full_name: string; role?: string; phone?: string }) =>
      request<{ message: string; token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    me: () => request<{ user: User }>('/api/auth/me')
  },

  // Owner Dashboard
  owner: {
    getBusinesses: () => request<Business[]>('/api/owner/businesses'),
    updateBusiness: (id: number, data: any) =>
      request<{ message: string; business: Business }>(`/api/owner/businesses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    getClaims: () => request<Claim[]>('/api/owner/claims')
  },

  // Admin Dashboard
  admin: {
    getStats: () => request<any>('/api/admin/stats'),
    getBusinesses: (params?: { status?: string; query?: string; city_id?: number; page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.status) q.set('status', params.status);
      if (params?.query) q.set('q', params.query);
      if (params?.city_id) q.set('city_id', String(params.city_id));
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      const qs = q.toString();
      return request<SearchResult>(`/api/admin/businesses${qs ? `?${qs}` : ''}`);
    },
    getBusiness: (id: number) => request<Business>(`/api/admin/businesses/${id}`),
    createBusiness: (data: any) =>
      request<Business>('/api/admin/businesses', { method: 'POST', body: JSON.stringify(data) }),
    updateBusiness: (id: number, data: any) =>
      request<Business>(`/api/admin/businesses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateBusinessStatus: (id: number, status: string) =>
      request<{ message: string; business: Business }>(`/api/admin/businesses/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      }),
    deleteBusiness: (id: number) => request<{ message: string }>(`/api/admin/businesses/${id}`, { method: 'DELETE' }),

    // Cities
    getCities: () => request<City[]>('/api/admin/cities'),
    getCity: (id: number) => request<City>(`/api/admin/cities/${id}`),
    createCity: (data: any) => request<City>('/api/admin/cities', { method: 'POST', body: JSON.stringify(data) }),
    updateCity: (id: number, data: any) => request<City>(`/api/admin/cities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteCity: (id: number) => request<{ success: boolean }>(`/api/admin/cities/${id}`, { method: 'DELETE' }),

    // Areas
    getAreas: () => request<Area[]>('/api/admin/areas'),
    getArea: (id: number) => request<Area>(`/api/admin/areas/${id}`),
    createArea: (data: any) => request<Area>('/api/admin/areas', { method: 'POST', body: JSON.stringify(data) }),
    updateArea: (id: number, data: any) => request<Area>(`/api/admin/areas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteArea: (id: number) => request<{ success: boolean }>(`/api/admin/areas/${id}`, { method: 'DELETE' }),

    // Services
    getServices: () => request<Service[]>('/api/admin/services'),
    getService: (id: number) => request<Service>(`/api/admin/services/${id}`),
    createService: (data: any) => request<Service>('/api/admin/services', { method: 'POST', body: JSON.stringify(data) }),
    updateService: (id: number, data: any) => request<Service>(`/api/admin/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteService: (id: number) => request<{ success: boolean }>(`/api/admin/services/${id}`, { method: 'DELETE' }),

    // Blog
    getBlogPosts: (status?: string) => request<BlogPost[]>(`/api/admin/blog${status ? `?status=${status}` : ''}`),
    getBlogPost: (id: number) => request<BlogPost>(`/api/admin/blog/${id}`),
    createBlogPost: (data: any) => request<BlogPost>('/api/admin/blog', { method: 'POST', body: JSON.stringify(data) }),
    updateBlogPost: (id: number, data: any) => request<BlogPost>(`/api/admin/blog/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteBlogPost: (id: number) => request<{ message: string }>(`/api/admin/blog/${id}`, { method: 'DELETE' }),

    // Photos
    getPhotos: () => request<any[]>('/api/admin/photos'),
    getAllPhotos: () => request<any[]>('/api/admin/photos'),
    deletePhoto: (id: number) => request<{ success: boolean }>(`/api/admin/photos/${id}`, { method: 'DELETE' }),

    // Users
    getUsers: () => request<User[]>('/api/admin/users'),
    updateUserRole: (id: number, role: string) =>
      request<{ message: string; user: User }>(`/api/admin/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role })
      }),

    // Logs & DB
    getAuditLogs: () => request<AuditLog[]>('/api/admin/audit-logs'),
    getReports: () => request<any[]>('/api/reports'),
    resolveReport: (id: number, adminNotes?: string) =>
      request<{ message: string }>(`/api/reports/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ admin_notes: adminNotes })
      }),
    getCorrections: () => request<any[]>('/api/corrections'),
    resolveCorrection: (id: number, status: string, notes?: string) =>
      request<any>(`/api/admin/corrections/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ status, notes })
      }),
    updateCorrection: (id: number, status: string, notes?: string) =>
      request<any>(`/api/admin/corrections/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ status, notes })
      }),
    getContactMessages: () => request<any[]>('/api/contact'),
    getDbStatus: () => request<any>('/api/admin/db-status'),

    // Monetization & Subscription Payments
    getPayments: () => request<{
      summary: {
        totalRevenue: number;
        activeSubscriptions: number;
        pendingCount: number;
        monthlyCount: number;
        monthlyRevenue: number;
        halfYearlyCount: number;
        halfYearlyRevenue: number;
        yearlyCount: number;
        yearlyRevenue: number;
        totalRecords: number;
      };
      transactions: any[];
    }>('/api/admin/payments'),
    updateBusinessPlan: (id: number, data: any) =>
      request<{ message: string; business: Business }>(`/api/admin/businesses/${id}/plan`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
  },

  // Public Payments & Checkout
  payments: {
    createOrder: (data: { plan_type: string; business_name?: string; email?: string; phone?: string }) =>
      request<{
        order_id: string;
        amount: number;
        currency: string;
        plan_name: string;
        plan_type: string;
        duration_months: number;
        upi_id: string;
        upi_string: string;
        created_at: string;
      }>('/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    verifyPayment: (data: { order_id?: string; plan_type: string; method?: string }) =>
      request<{
        success: boolean;
        payment_id: string;
        order_id: string;
        amount: number;
        currency: string;
        plan_type: string;
        plan_name: string;
        payment_method: string;
        status: string;
        timestamp: string;
      }>('/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  }
};
