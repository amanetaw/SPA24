import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import {
  INITIAL_CITIES,
  INITIAL_AREAS,
  INITIAL_SERVICES,
  INITIAL_BUSINESSES,
  INITIAL_BUSINESS_SERVICES,
  INITIAL_BUSINESS_HOURS,
  INITIAL_BUSINESS_PHOTOS,
  INITIAL_BLOG_CATEGORIES,
  INITIAL_BLOG_POSTS,
  INITIAL_USERS
} from './seed-data.js';

export interface DatabaseStatus {
  driver: 'mysql' | 'persistent_json';
  connected: boolean;
  host: string;
  database: string;
  totalBusinesses: number;
  totalCities: number;
  totalServices: number;
}

export interface BusinessFilterOptions {
  search?: string;
  query?: string;
  citySlug?: string;
  city_id?: number;
  areaSlug?: string;
  serviceSlug?: string;
  openNow?: boolean;
  status?: string;
  sort?: 'popular' | 'newest' | 'name';
  page?: number;
  limit?: number;
}

// In-Memory / File-Persisted state shape (Strictly matches MySQL tables)
interface StoreSchema {
  users: any[];
  cities: any[];
  areas: any[];
  services: any[];
  businesses: any[];
  business_services: any[];
  business_photos: any[];
  business_hours: any[];
  submissions: any[];
  claims: any[];
  claim_verifications: any[];
  blog_categories: any[];
  blog_posts: any[];
  reports: any[];
  corrections: any[];
  contact_messages: any[];
  audit_logs: any[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'spa24_database.json');

class DatabaseService {
  private pool: mysql.Pool | null = null;
  private isMySQLConnected: boolean = false;
  private store: StoreSchema | null = null;
  private saveTimeout: NodeJS.Timeout | null = null;

  async initialize() {
    // 1. Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.warn('Could not create data dir:', err);
      }
    }

    // 2. Try MySQL connection if environment variables provided
    const dbHost = process.env.DB_HOST;
    const dbUser = process.env.DB_USER;
    const dbPass = process.env.DB_PASSWORD;
    const dbName = process.env.DB_NAME || 'spa24';
    const dbPort = Number(process.env.DB_PORT) || 3306;
    const dbUrl = process.env.DATABASE_URL;

    if (dbUrl || (dbHost && dbUser)) {
      try {
        const config: mysql.PoolOptions = dbUrl
          ? { uri: dbUrl, waitForConnections: true, connectionLimit: 10, queueLimit: 0, connectTimeout: 3000 }
          : {
              host: dbHost,
              port: dbPort,
              user: dbUser,
              password: dbPass,
              database: dbName,
              waitForConnections: true,
              connectionLimit: 10,
              queueLimit: 0,
              connectTimeout: 3000
            };

        this.pool = mysql.createPool(config);
        const connection = await this.pool.getConnection();
        await connection.ping();
        connection.release();
        this.isMySQLConnected = true;
        console.log(`[SPA24 DB] Successfully connected to MySQL at ${dbHost || 'DATABASE_URL'}/${dbName}`);
      } catch (err: any) {
        console.warn(`[SPA24 DB] MySQL connection not established (${err.message}). Using local persistent database layer.`);
        this.isMySQLConnected = false;
      }
    } else {
      console.log('[SPA24 DB] No remote MySQL server configured in environment. Using local persistent database layer.');
    }

    // 3. Load or seed store
    this.loadStore();
  }

  private loadStore() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.store = JSON.parse(raw);
        console.log('[SPA24 DB] Loaded database from persistent storage file.');

        // Guarantee administrator access with requested password Aman@1972
        const adminUser = this.store?.users.find(u => u.email.toLowerCase() === 'admin@spa24.online');
        if (adminUser) {
          adminUser.role = 'admin';
          adminUser.password_hash = bcrypt.hashSync('Aman@1972', 10);
        }
        let amanUser = this.store?.users.find(u => u.email.toLowerCase() === 'amansharmaetaw@gmail.com');
        if (amanUser) {
          amanUser.role = 'admin';
          amanUser.password_hash = bcrypt.hashSync('Aman@1972', 10);
        } else if (this.store) {
          this.store.users.push({
            id: (this.store.users.length || 0) + 1,
            email: 'amansharmaetaw@gmail.com',
            password_hash: bcrypt.hashSync('Aman@1972', 10),
            full_name: 'THE AMAN SHARMA',
            role: 'admin',
            phone: '+91 80572 08341',
            is_active: true
          });
        }
        this.saveStore();
        return;
      } catch (e) {
        console.warn('[SPA24 DB] Failed to parse existing db file, re-seeding:', e);
      }
    }

    // Seed defaults
    this.store = {
      users: [...INITIAL_USERS],
      cities: [...INITIAL_CITIES],
      areas: [...INITIAL_AREAS],
      services: [...INITIAL_SERVICES],
      businesses: [...INITIAL_BUSINESSES],
      business_services: [...INITIAL_BUSINESS_SERVICES],
      business_photos: [...INITIAL_BUSINESS_PHOTOS],
      business_hours: [...INITIAL_BUSINESS_HOURS],
      submissions: [
        {
          id: 1,
          business_name: 'Tranquil Palms Ayurvedic & Swedish Spa',
          category: 'Holistic Day Spa',
          description: 'Proposed new branch in Indiranagar featuring certified Panchakarma treatments, hot stone therapy, and modern cedar saunas.',
          phone: '+91 80 4912 3456',
          email: 'submission@tranquilpalms.example.com',
          website: 'https://tranquilpalms.example.com',
          booking_url: 'https://tranquilpalms.example.com/reserve',
          full_address: '120, 100ft Road, HAL 2nd Stage, Indiranagar',
          city_name: 'Bengaluru',
          area_name: 'Indiranagar',
          google_maps_url: 'https://maps.google.com/?q=Indiranagar+Bengaluru',
          service_ids: [1, 2, 4, 6],
          opening_hours_json: [
            { day_of_week: 1, open_time: '09:00', close_time: '21:00', is_closed: false },
            { day_of_week: 2, open_time: '09:00', close_time: '21:00', is_closed: false },
            { day_of_week: 3, open_time: '09:00', close_time: '21:00', is_closed: false },
            { day_of_week: 4, open_time: '09:00', close_time: '21:00', is_closed: false },
            { day_of_week: 5, open_time: '09:00', close_time: '21:00', is_closed: false },
            { day_of_week: 6, open_time: '09:00', close_time: '22:00', is_closed: false },
            { day_of_week: 0, open_time: '09:00', close_time: '21:00', is_closed: false }
          ],
          photos_json: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80'],
          social_links_json: { instagram: 'tranquilpalms' },
          owner_name: 'Kavita Menon',
          status: 'pending',
          rejection_reason: null,
          created_at: new Date().toISOString(),
          reviewed_at: null,
          reviewed_by: null
        }
      ],
      claims: [
        {
          id: 1,
          business_id: 3, // Oceanic Breeze
          user_id: 3,
          applicant_name: 'Rohan Mehra',
          applicant_email: 'rohan.mehra@example.com',
          applicant_phone: '+91 98201 11223',
          applicant_role: 'General Manager',
          verification_method: 'email',
          verification_token: 'CLAIM-TOKEN-84920',
          proof_notes: 'I am the General Manager of Oceanic Breeze Juhu. Requesting claim to update our newly renovated massage menu and extended weekend operating hours.',
          status: 'pending',
          rejection_reason: null,
          created_at: new Date().toISOString(),
          reviewed_at: null,
          reviewed_by: null
        }
      ],
      claim_verifications: [],
      blog_categories: [...INITIAL_BLOG_CATEGORIES],
      blog_posts: [...INITIAL_BLOG_POSTS],
      reports: [
        {
          id: 1,
          business_id: 2,
          report_type: 'incorrect_info',
          message: 'The front desk phone line was updated last month.',
          reporter_email: 'visitor@example.com',
          status: 'pending',
          admin_notes: null,
          created_at: new Date().toISOString()
        }
      ],
      corrections: [],
      contact_messages: [
        {
          id: 1,
          name: 'Vikram Joshi',
          email: 'vikram@example.com',
          subject: 'Partnership inquiry for Indore wellness clinics',
          message: 'Hello SPA24 team, we operate a network of certified wellness therapists and would like to list our centers under the Indore directory.',
          status: 'new',
          created_at: new Date().toISOString()
        }
      ],
      audit_logs: [
        {
          id: 1,
          user_id: 1,
          action: 'INITIALIZE_SYSTEM',
          entity_type: 'SYSTEM',
          entity_id: null,
          details_json: { message: 'SPA24 Database initialized with verified schema & starter directories' },
          created_at: new Date().toISOString()
        }
      ]
    };

    this.saveStore();
  }

  private saveStore() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(this.store, null, 2), 'utf-8');
      } catch (err) {
        console.error('[SPA24 DB] Failed to write database file:', err);
      }
    }, 100);
  }

  getStatus(): DatabaseStatus {
    return {
      driver: this.isMySQLConnected ? 'mysql' : 'persistent_json',
      connected: true,
      host: this.isMySQLConnected ? (process.env.DB_HOST || 'DATABASE_URL') : 'local_storage',
      database: this.isMySQLConnected ? (process.env.DB_NAME || 'spa24') : 'spa24_database.json',
      totalBusinesses: this.store?.businesses.length || 0,
      totalCities: this.store?.cities.length || 0,
      totalServices: this.store?.services.length || 0
    };
  }

  // ==========================================
  // USERS & AUTH
  // ==========================================
  async findUserByEmail(email: string) {
    return this.store?.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  }

  async findUserById(id: number) {
    return this.store?.users.find(u => u.id === id) || null;
  }

  async createUser(data: { email: string; password_hash: string; full_name: string; role?: string; phone?: string }) {
    const id = (this.store?.users.length || 0) + 1;
    const user = {
      id,
      email: data.email.toLowerCase().trim(),
      password_hash: data.password_hash,
      full_name: data.full_name.trim(),
      role: data.role || 'user',
      phone: data.phone || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.store?.users.push(user);
    this.saveStore();
    return user;
  }

  async listUsers() {
    return (this.store?.users || []).map(({ password_hash, ...rest }) => rest);
  }

  async updateUserRole(id: number, role: string) {
    const user = this.store?.users.find(u => u.id === id);
    if (user) {
      user.role = role;
      user.updated_at = new Date().toISOString();
      this.saveStore();
    }
    return user;
  }

  // ==========================================
  // CITIES
  // ==========================================
  async getCities(publishedOnly = true) {
    const cities = publishedOnly
      ? (this.store?.cities || []).filter(c => c.is_published)
      : (this.store?.cities || []);

    return cities.map(city => {
      const count = (this.store?.businesses || []).filter(
        b => b.city_id === city.id && b.status === 'published'
      ).length;
      return { ...city, published_count: count };
    });
  }

  async getCityBySlug(slug: string) {
    const city = (this.store?.cities || []).find(c => c.slug.toLowerCase() === slug.toLowerCase());
    if (!city) return null;

    const count = (this.store?.businesses || []).filter(
      b => b.city_id === city.id && b.status === 'published'
    ).length;

    const areas = (this.store?.areas || [])
      .filter(a => a.city_id === city.id && a.is_published)
      .map(area => {
        const areaCount = (this.store?.businesses || []).filter(
          b => b.area_id === area.id && b.status === 'published'
        ).length;
        return { ...area, published_count: areaCount };
      });

    return { ...city, published_count: count, areas };
  }

  async getCityById(id: number) {
    const city = (this.store?.cities || []).find(c => c.id === id);
    if (!city) return null;
    const count = (this.store?.businesses || []).filter(
      b => b.city_id === city.id && b.status === 'published'
    ).length;
    return { ...city, published_count: count };
  }

  async createCity(data: any) {
    const id = (this.store?.cities.reduce((max, c) => Math.max(max, c.id), 0) || 0) + 1;
    const baseSlug = (data.slug || data.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const newCity = {
      id,
      name: data.name ? data.name.trim() : '',
      slug: baseSlug,
      state: data.state ? data.state.trim() : '',
      country: data.country ? data.country.trim() : 'India',
      description: data.description ? data.description.trim() : '',
      seo_title: data.seo_title || null,
      meta_description: data.meta_description || null,
      is_popular: Boolean(data.is_popular),
      is_published: data.is_published !== undefined ? Boolean(data.is_published) : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.store?.cities.push(newCity);
    this.saveStore();
    return newCity;
  }

  async updateCity(id: number, data: any) {
    const city = this.store?.cities.find(c => c.id === id);
    if (!city) return null;
    Object.assign(city, data, { updated_at: new Date().toISOString() });
    this.saveStore();
    return city;
  }

  async deleteCity(id: number) {
    if (!this.store) return false;
    const idx = this.store.cities.findIndex(c => c.id === id);
    if (idx >= 0) {
      this.store.cities.splice(idx, 1);
      this.saveStore();
      return true;
    }
    return false;
  }

  // ==========================================
  // AREAS
  // ==========================================
  async getAreas(publishedOnly = true) {
    const areas = publishedOnly
      ? (this.store?.areas || []).filter(a => a.is_published)
      : (this.store?.areas || []);

    return areas.map(area => {
      const city = this.store?.cities.find(c => c.id === area.city_id);
      const count = (this.store?.businesses || []).filter(
        b => b.area_id === area.id && b.status === 'published'
      ).length;
      return { ...area, city_name: city?.name || '', city_slug: city?.slug || '', published_count: count };
    });
  }

  async getAreaBySlug(citySlug: string, areaSlug: string) {
    const city = (this.store?.cities || []).find(c => c.slug.toLowerCase() === citySlug.toLowerCase());
    if (!city) return null;

    const area = (this.store?.areas || []).find(
      a => a.city_id === city.id && a.slug.toLowerCase() === areaSlug.toLowerCase()
    );
    if (!area) return null;

    const count = (this.store?.businesses || []).filter(
      b => b.area_id === area.id && b.status === 'published'
    ).length;

    const nearbyAreas = (this.store?.areas || [])
      .filter(a => a.city_id === city.id && a.id !== area.id && a.is_published)
      .slice(0, 6)
      .map(a => ({
        ...a,
        city_name: city.name,
        city_slug: city.slug,
        published_count: (this.store?.businesses || []).filter(b => b.area_id === a.id && b.status === 'published').length
      }));

    return { ...area, city, published_count: count, nearbyAreas };
  }

  async getAreaById(id: number) {
    const area = (this.store?.areas || []).find(a => a.id === id);
    if (!area) return null;
    const city = (this.store?.cities || []).find(c => c.id === area.city_id);
    const count = (this.store?.businesses || []).filter(
      b => b.area_id === area.id && b.status === 'published'
    ).length;
    return {
      ...area,
      city_name: city?.name || '',
      city_slug: city?.slug || '',
      published_count: count
    };
  }

  async createArea(data: any) {
    const id = (this.store?.areas.reduce((max, a) => Math.max(max, a.id), 0) || 0) + 1;
    const baseSlug = (data.slug || data.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const newArea = {
      id,
      city_id: Number(data.city_id),
      name: data.name ? data.name.trim() : '',
      slug: baseSlug,
      pincode: data.pincode ? data.pincode.trim() : '',
      description: data.description ? data.description.trim() : '',
      seo_title: data.seo_title || null,
      meta_description: data.meta_description || null,
      is_popular: Boolean(data.is_popular),
      is_published: data.is_published !== undefined ? Boolean(data.is_published) : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.store?.areas.push(newArea);
    this.saveStore();
    return newArea;
  }

  async updateArea(id: number, data: any) {
    const area = this.store?.areas.find(a => a.id === id);
    if (!area) return null;
    Object.assign(area, data, { updated_at: new Date().toISOString() });
    this.saveStore();
    return area;
  }

  async deleteArea(id: number) {
    if (!this.store) return false;
    const idx = this.store.areas.findIndex(a => a.id === id);
    if (idx >= 0) {
      this.store.areas.splice(idx, 1);
      this.saveStore();
      return true;
    }
    return false;
  }

  // ==========================================
  // SERVICES
  // ==========================================
  async getServices() {
    return (this.store?.services || []).map(svc => {
      const bizIds = (this.store?.business_services || [])
        .filter(bs => bs.service_id === svc.id)
        .map(bs => bs.business_id);
      const count = (this.store?.businesses || []).filter(
        b => bizIds.includes(b.id) && b.status === 'published'
      ).length;
      return { ...svc, published_count: count };
    });
  }

  async getServiceBySlug(slug: string) {
    const service = (this.store?.services || []).find(s => s.slug.toLowerCase() === slug.toLowerCase());
    if (!service) return null;

    // Businesses offering this service
    const matchingBizServices = (this.store?.business_services || []).filter(bs => bs.service_id === service.id);
    const bizIds = matchingBizServices.map(bs => bs.business_id);
    const businesses = (this.store?.businesses || [])
      .filter(b => bizIds.includes(b.id) && b.status === 'published')
      .map(b => this.enrichBusinessRecord(b));

    // Cities where available
    const cityIds = Array.from(new Set(businesses.map(b => b.city_id)));
    const availableCities = (this.store?.cities || []).filter(c => cityIds.includes(c.id));

    // Related services
    const relatedServices = (this.store?.services || [])
      .filter(s => s.id !== service.id)
      .slice(0, 4);

    return {
      ...service,
      businesses,
      availableCities,
      relatedServices,
      published_count: businesses.length
    };
  }

  async getServiceById(id: number) {
    return (this.store?.services || []).find(s => s.id === id) || null;
  }

  async createService(data: any) {
    const id = (this.store?.services.reduce((max, s) => Math.max(max, s.id), 0) || 0) + 1;
    const baseSlug = (data.slug || data.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const newService = {
      id,
      name: data.name ? data.name.trim() : '',
      slug: baseSlug,
      category: data.category || 'Therapeutic Wellness',
      short_desc: data.short_desc || data.description || '',
      full_desc: data.full_desc || data.description || '',
      expectations: data.expectations || '',
      provider_tips: data.provider_tips || '',
      seo_title: data.seo_title || null,
      meta_description: data.meta_description || null,
      icon: data.icon || 'Sparkles',
      is_popular: Boolean(data.is_popular),
      is_published: data.is_published !== undefined ? Boolean(data.is_published) : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.store?.services.push(newService);
    this.saveStore();
    return newService;
  }

  async updateService(id: number, data: any) {
    const svc = this.store?.services.find(s => s.id === id);
    if (!svc) return null;
    Object.assign(svc, data, { updated_at: new Date().toISOString() });
    this.saveStore();
    return svc;
  }

  async deleteService(id: number) {
    if (!this.store) return false;
    const idx = this.store.services.findIndex(s => s.id === id);
    if (idx >= 0) {
      this.store.services.splice(idx, 1);
      this.saveStore();
      return true;
    }
    return false;
  }

  // ==========================================
  // BUSINESSES
  // ==========================================
  enrichBusinessRecord(b: any) {
    const city = (this.store?.cities || []).find(c => c.id === b.city_id);
    const area = (this.store?.areas || []).find(a => a.id === b.area_id);
    const photos = (this.store?.business_photos || [])
      .filter(p => p.business_id === b.id)
      .sort((p1, p2) => (p2.is_primary ? 1 : 0) - (p1.is_primary ? 1 : 0));
    const hours = (this.store?.business_hours || []).filter(h => h.business_id === b.id);
    
    // Services offered
    const bizServices = (this.store?.business_services || []).filter(bs => bs.business_id === b.id);
    const services = bizServices.map(bs => {
      const svc = (this.store?.services || []).find(s => s.id === bs.service_id);
      return {
        service_id: bs.service_id,
        name: svc?.name || 'Wellness Therapy',
        slug: svc?.slug || 'wellness-therapy',
        price_from: bs.price_from,
        duration_minutes: bs.duration_minutes,
        notes: bs.notes
      };
    });

    // Check Open Now based on current day of week and time
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday
    const currentHourMinute = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const todayHours = hours.find(h => h.day_of_week === currentDay);

    let isOpenNow = false;
    if (todayHours && !todayHours.is_closed && todayHours.open_time && todayHours.close_time) {
      isOpenNow = currentHourMinute >= todayHours.open_time && currentHourMinute <= todayHours.close_time;
    }

    return {
      ...b,
      city_name: city?.name || '',
      city_slug: city?.slug || '',
      city_state: city?.state || '',
      area_name: area?.name || '',
      area_slug: area?.slug || '',
      area_pincode: b.pincode || area?.pincode || '',
      pincode: b.pincode || area?.pincode || '',
      primary_photo: photos[0]?.url || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      photos,
      hours,
      services,
      is_open_now: isOpenNow,
      today_hours: todayHours
    };
  }

  async searchBusinesses(options: BusinessFilterOptions) {
    const {
      search,
      query,
      citySlug,
      city_id,
      areaSlug,
      serviceSlug,
      openNow,
      status = 'published',
      sort = 'popular',
      page = 1,
      limit = 12
    } = options;

    const effectiveSearch = (search || query || '').toLowerCase().trim();

    let list = (this.store?.businesses || []).filter(b => {
      if (status && b.status !== status) return false;
      if (city_id && b.city_id !== city_id) return false;
      return true;
    });

    // Filter by city
    if (citySlug) {
      const city = (this.store?.cities || []).find(c => c.slug.toLowerCase() === citySlug.toLowerCase());
      if (city) {
        list = list.filter(b => b.city_id === city.id);
      } else {
        return { businesses: [], total: 0, page, totalPages: 0 };
      }
    }

    // Filter by area
    if (areaSlug) {
      const area = (this.store?.areas || []).find(a => a.slug.toLowerCase() === areaSlug.toLowerCase());
      if (area) {
        list = list.filter(b => b.area_id === area.id);
      } else {
        return { businesses: [], total: 0, page, totalPages: 0 };
      }
    }

    // Filter by service
    if (serviceSlug) {
      const svc = (this.store?.services || []).find(s => s.slug.toLowerCase() === serviceSlug.toLowerCase());
      if (svc) {
        const matchingBizIds = (this.store?.business_services || [])
          .filter(bs => bs.service_id === svc.id)
          .map(bs => bs.business_id);
        list = list.filter(b => matchingBizIds.includes(b.id));
      } else {
        return { businesses: [], total: 0, page, totalPages: 0 };
      }
    }

    // Text search (name, description, address, category)
    if (effectiveSearch) {
      const q = effectiveSearch;
      list = list.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        (b.keywords && typeof b.keywords === 'string' && b.keywords.toLowerCase().includes(q))
      );
    }

    // Enrich items
    let enriched = list.map(b => this.enrichBusinessRecord(b));

    // Filter Open Now
    if (openNow) {
      enriched = enriched.filter(b => b.is_open_now);
    }

    // Sort
    if (sort === 'newest') {
      enriched.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
    } else if (sort === 'name') {
      enriched.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // popular by default - prioritize paid plans (yearly > half_yearly > monthly > free) then view counts
      enriched.sort((a, b) => {
        const planWeight = (p?: string) => (p === 'yearly' ? 3000 : p === 'half_yearly' ? 2000 : p === 'monthly' ? 1000 : 0);
        const scoreA = (a.view_count || 0) + planWeight(a.plan_type);
        const scoreB = (b.view_count || 0) + planWeight(b.plan_type);
        return scoreB - scoreA;
      });
    }

    const total = enriched.length;
    const startIndex = (page - 1) * limit;
    const paginated = enriched.slice(startIndex, startIndex + limit);

    return {
      businesses: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getBusinessBySlugs(citySlug: string, areaSlug: string, businessSlug: string) {
    const city = (this.store?.cities || []).find(c => c.slug.toLowerCase() === citySlug.toLowerCase());
    if (!city) return null;

    const area = (this.store?.areas || []).find(
      a => a.city_id === city.id && a.slug.toLowerCase() === areaSlug.toLowerCase()
    );
    if (!area) return null;

    const business = (this.store?.businesses || []).find(
      b => b.city_id === city.id && b.area_id === area.id && b.slug.toLowerCase() === businessSlug.toLowerCase()
    );
    if (!business) return null;

    // Increment view count
    business.view_count = (business.view_count || 0) + 1;
    this.saveStore();

    const enriched = this.enrichBusinessRecord(business);

    // Related businesses in the same area
    const relatedAreaBusinesses = (this.store?.businesses || [])
      .filter(b => b.area_id === area.id && b.id !== business.id && b.status === 'published')
      .slice(0, 3)
      .map(b => this.enrichBusinessRecord(b));

    // Related businesses in the same city
    const relatedCityBusinesses = (this.store?.businesses || [])
      .filter(b => b.city_id === city.id && b.area_id !== area.id && b.id !== business.id && b.status === 'published')
      .slice(0, 3)
      .map(b => this.enrichBusinessRecord(b));

    return {
      ...enriched,
      relatedAreaBusinesses,
      relatedCityBusinesses
    };
  }

  async getBusinessById(id: number) {
    const business = (this.store?.businesses || []).find(b => b.id === id);
    if (!business) return null;
    return this.enrichBusinessRecord(business);
  }

  // Duplicate detection using name, phone, website, address, city
  async checkDuplicateBusiness(criteria: { name?: string; phone?: string; website?: string; address?: string; cityId?: number; cityName?: string }) {
    const matches: any[] = [];
    const businesses = this.store?.businesses || [];

    const normPhone = criteria.phone ? criteria.phone.replace(/[^0-9]/g, '') : '';
    const normName = criteria.name ? criteria.name.toLowerCase().trim() : '';
    const normWebsite = criteria.website ? criteria.website.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '') : '';

    for (const b of businesses) {
      let isMatch = false;
      let matchedFields: string[] = [];

      // Check phone
      if (normPhone && b.phone) {
        const bPhone = b.phone.replace(/[^0-9]/g, '');
        if (bPhone.length >= 7 && (bPhone.includes(normPhone) || normPhone.includes(bPhone))) {
          isMatch = true;
          matchedFields.push('phone');
        }
      }

      // Check name similarity
      if (normName && b.name) {
        const bName = b.name.toLowerCase().trim();
        if (bName === normName || (normName.length > 5 && (bName.includes(normName) || normName.includes(bName)))) {
          isMatch = true;
          matchedFields.push('name');
        }
      }

      // Check website
      if (normWebsite && b.website) {
        const bWeb = b.website.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
        if (bWeb === normWebsite) {
          isMatch = true;
          matchedFields.push('website');
        }
      }

      if (isMatch) {
        matches.push({
          business: this.enrichBusinessRecord(b),
          matchedFields
        });
      }
    }

    return matches;
  }

  async createBusiness(data: any) {
    const id = (this.store?.businesses.reduce((max, b) => Math.max(max, b.id), 0) || 0) + 1;
    const baseSlug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const slug = baseSlug.replace(/^-+|-+$/g, '');

    let cityId = Number(data.city_id) || 0;
    let areaId = Number(data.area_id) || 0;

    // Resolve or create City dynamically if city_name was provided
    if (data.city_name && data.city_name.trim()) {
      const cName = data.city_name.trim();
      let city = (this.store?.cities || []).find(c => c.name.toLowerCase() === cName.toLowerCase());
      if (!city) {
        city = await this.createCity({
          name: cName,
          slug: cName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
          state: data.city_state || 'India',
          is_popular: false
        });
      }
      cityId = city.id;
    }

    // Resolve or create Area dynamically in this city if area_name was provided
    if (cityId && data.area_name && data.area_name.trim()) {
      const aName = data.area_name.trim();
      let area = (this.store?.areas || []).find(
        a => a.city_id === cityId && a.name.toLowerCase() === aName.toLowerCase()
      );
      if (!area) {
        area = await this.createArea({
          city_id: cityId,
          name: aName,
          slug: aName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
          pincode: data.pincode ? data.pincode.trim() : null,
          is_popular: false
        });
      } else if (data.pincode && !area.pincode) {
        area.pincode = data.pincode.trim();
      }
      areaId = area.id;
    }

    const newBusiness = {
      id,
      name: data.name.trim(),
      slug,
      category: data.category || 'Day Spa & Wellness',
      description: data.description.trim(),
      phone: data.phone.trim(),
      email: data.email ? data.email.trim() : null,
      website: data.website ? data.website.trim() : null,
      booking_url: data.booking_url ? data.booking_url.trim() : null,
      address: data.address.trim(),
      city_id: cityId,
      area_id: areaId,
      pincode: data.pincode ? data.pincode.trim() : null,
      google_maps_url: data.google_maps_url || null,
      seo_title: data.seo_title ? data.seo_title.trim() : null,
      meta_description: data.meta_description ? data.meta_description.trim() : null,
      keywords: data.keywords ? (Array.isArray(data.keywords) ? data.keywords.join(', ') : data.keywords.trim()) : null,
      status: data.status || 'published',
      verification_status: data.verification_status || 'verified',
      owner_id: data.owner_id || null,
      view_count: data.view_count !== undefined ? Number(data.view_count) : 0,
      plan_type: data.plan_type || 'free',
      payment_status: data.payment_status || (data.plan_type && data.plan_type !== 'free' ? 'paid' : 'free'),
      payment_id: data.payment_id || null,
      amount_paid: data.amount_paid !== undefined ? Number(data.amount_paid) : (data.plan_type === 'yearly' ? 8999 : data.plan_type === 'half_yearly' ? 4999 : data.plan_type === 'monthly' ? 999 : 0),
      plan_started_at: data.plan_started_at || (data.plan_type && data.plan_type !== 'free' ? new Date().toISOString() : null),
      plan_expires_at: data.plan_expires_at || null,
      featured_tier: data.featured_tier || (data.plan_type === 'yearly' ? 'platinum' : data.plan_type === 'half_yearly' ? 'premium' : data.plan_type === 'monthly' ? 'standard' : null),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.store?.businesses.push(newBusiness);

    // Business Services
    if (Array.isArray(data.service_ids)) {
      data.service_ids.forEach((svcId: number) => {
        this.store?.business_services.push({
          id: (this.store.business_services.length || 0) + 1,
          business_id: id,
          service_id: Number(svcId),
          price_from: null,
          duration_minutes: null,
          notes: null
        });
      });
    }

    // Photos
    if (Array.isArray(data.photos) && data.photos.length > 0) {
      data.photos.forEach((item: any, idx: number) => {
        const url = typeof item === 'string' ? item.trim() : (item.url || '').trim();
        if (url) {
          this.store?.business_photos.push({
            id: (this.store.business_photos.length || 0) + 1,
            business_id: id,
            url,
            caption: typeof item === 'object' && item.caption ? item.caption.trim() : null,
            alt_text: typeof item === 'object' && item.alt_text ? item.alt_text.trim() : (typeof item === 'object' && item.caption ? item.caption.trim() : null),
            is_primary: typeof item === 'object' && item.is_primary !== undefined ? Boolean(item.is_primary) : idx === 0,
            display_order: idx + 1,
            created_at: new Date().toISOString()
          });
        }
      });
    }

    // Hours
    if (Array.isArray(data.hours) && data.hours.length > 0) {
      data.hours.forEach((h: any) => {
        this.store?.business_hours.push({
          id: (this.store.business_hours.length || 0) + 1,
          business_id: id,
          day_of_week: h.day_of_week,
          open_time: h.open_time,
          close_time: h.close_time,
          is_closed: Boolean(h.is_closed)
        });
      });
    } else {
      // Default standard hours
      for (let day = 0; day <= 6; day++) {
        this.store?.business_hours.push({
          id: (this.store.business_hours.length || 0) + 1,
          business_id: id,
          day_of_week: day,
          open_time: '09:00',
          close_time: '21:00',
          is_closed: false
        });
      }
    }

    this.saveStore();
    return this.enrichBusinessRecord(newBusiness);
  }

  async updateBusiness(id: number, data: any) {
    const business = this.store?.businesses.find(b => b.id === id);
    if (!business) return null;

    let cityId = data.city_id ? Number(data.city_id) : business.city_id;
    let areaId = data.area_id ? Number(data.area_id) : business.area_id;

    // Resolve or create City dynamically if city_name was passed
    if (data.city_name && data.city_name.trim()) {
      const cName = data.city_name.trim();
      let city = (this.store?.cities || []).find(c => c.name.toLowerCase() === cName.toLowerCase());
      if (!city) {
        city = await this.createCity({
          name: cName,
          slug: cName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
          state: data.city_state || 'India',
          is_popular: false
        });
      }
      cityId = city.id;
    }

    // Resolve or create Area dynamically in this city if area_name was passed
    if (cityId && data.area_name && data.area_name.trim()) {
      const aName = data.area_name.trim();
      let area = (this.store?.areas || []).find(
        a => a.city_id === cityId && a.name.toLowerCase() === aName.toLowerCase()
      );
      if (!area) {
        area = await this.createArea({
          city_id: cityId,
          name: aName,
          slug: aName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
          pincode: data.pincode ? data.pincode.trim() : null,
          is_popular: false
        });
      } else if (data.pincode && !area.pincode) {
        area.pincode = data.pincode.trim();
      }
      areaId = area.id;
    }

    Object.assign(business, data, {
      city_id: cityId,
      area_id: areaId,
      pincode: data.pincode !== undefined ? (data.pincode ? data.pincode.trim() : null) : business.pincode,
      view_count: data.view_count !== undefined ? Number(data.view_count) : business.view_count,
      plan_type: data.plan_type !== undefined ? data.plan_type : business.plan_type,
      payment_status: data.payment_status !== undefined ? data.payment_status : business.payment_status,
      payment_id: data.payment_id !== undefined ? data.payment_id : business.payment_id,
      amount_paid: data.amount_paid !== undefined ? Number(data.amount_paid) : business.amount_paid,
      plan_started_at: data.plan_started_at !== undefined ? data.plan_started_at : business.plan_started_at,
      plan_expires_at: data.plan_expires_at !== undefined ? data.plan_expires_at : business.plan_expires_at,
      featured_tier: data.featured_tier !== undefined ? data.featured_tier : business.featured_tier,
      updated_at: new Date().toISOString()
    });

    // Update services if provided
    if (Array.isArray(data.service_ids)) {
      if (this.store) {
        this.store.business_services = this.store.business_services.filter(bs => bs.business_id !== id);
        data.service_ids.forEach((svcId: number) => {
          this.store?.business_services.push({
            id: (this.store.business_services.length || 0) + 1,
            business_id: id,
            service_id: Number(svcId),
            price_from: null,
            duration_minutes: null,
            notes: null
          });
        });
      }
    }

    // Update hours if provided
    if (Array.isArray(data.hours)) {
      if (this.store) {
        this.store.business_hours = this.store.business_hours.filter(h => h.business_id !== id);
        data.hours.forEach((h: any) => {
          this.store?.business_hours.push({
            id: (this.store.business_hours.length || 0) + 1,
            business_id: id,
            day_of_week: h.day_of_week,
            open_time: h.open_time,
            close_time: h.close_time,
            is_closed: Boolean(h.is_closed)
          });
        });
      }
    }

    // Update photos if provided
    if (Array.isArray(data.photos)) {
      if (this.store) {
        this.store.business_photos = this.store.business_photos.filter(p => p.business_id !== id);
        data.photos.forEach((item: any, idx: number) => {
          const url = typeof item === 'string' ? item.trim() : (item.url || '').trim();
          if (url) {
            this.store?.business_photos.push({
              id: (this.store.business_photos.length || 0) + 1,
              business_id: id,
              url,
              caption: typeof item === 'object' && item.caption ? item.caption.trim() : null,
              alt_text: typeof item === 'object' && item.alt_text ? item.alt_text.trim() : (typeof item === 'object' && item.caption ? item.caption.trim() : null),
              is_primary: typeof item === 'object' && item.is_primary !== undefined ? Boolean(item.is_primary) : idx === 0,
              display_order: idx + 1,
              created_at: new Date().toISOString()
            });
          }
        });
      }
    }

    this.saveStore();
    return this.enrichBusinessRecord(business);
  }

  async updateBusinessStatus(id: number, status: string) {
    const business = this.store?.businesses.find(b => b.id === id);
    if (!business) return null;
    business.status = status;
    business.updated_at = new Date().toISOString();
    this.saveStore();
    return business;
  }

  async deleteBusiness(id: number) {
    if (!this.store) return false;
    const idx = this.store.businesses.findIndex(b => b.id === id);
    if (idx >= 0) {
      this.store.businesses.splice(idx, 1);
      this.store.business_services = this.store.business_services.filter(bs => bs.business_id !== id);
      this.store.business_photos = this.store.business_photos.filter(p => p.business_id !== id);
      this.store.business_hours = this.store.business_hours.filter(h => h.business_id !== id);
      this.saveStore();
      return true;
    }
    return false;
  }

  // ==========================================
  // SUBMISSIONS (LIST YOUR SPA)
  // ==========================================
  async createSubmission(data: any) {
    const id = (this.store?.submissions.reduce((max, s) => Math.max(max, s.id), 0) || 0) + 1;
    const submission = {
      id,
      business_name: data.business_name.trim(),
      category: data.category || 'Day Spa & Wellness',
      description: data.description.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      website: data.website || null,
      booking_url: data.booking_url || null,
      full_address: data.full_address.trim(),
      city_name: data.city_name.trim(),
      area_name: data.area_name.trim(),
      pincode: data.pincode ? String(data.pincode).trim() : '',
      google_maps_url: data.google_maps_url || null,
      service_ids: data.service_ids || [],
      opening_hours_json: data.opening_hours || [],
      photos_json: data.photos || [],
      social_links_json: data.social_links || {},
      owner_name: data.owner_name.trim(),
      keywords: data.keywords ? String(data.keywords).trim() : '',
      view_count: data.view_count !== undefined ? Number(data.view_count) : 1,
      plan_type: data.plan_type || 'free',
      payment_status: data.payment_status || (data.plan_type && data.plan_type !== 'free' ? (data.payment_id ? 'paid' : 'pending') : 'free'),
      payment_id: data.payment_id || null,
      amount_paid: data.amount_paid !== undefined ? Number(data.amount_paid) : (data.plan_type === 'yearly' ? 8999 : data.plan_type === 'half_yearly' ? 4999 : data.plan_type === 'monthly' ? 999 : 0),
      payment_method: data.payment_method || null,
      paid_at: data.paid_at || (data.payment_id ? new Date().toISOString() : null),
      status: 'pending',
      rejection_reason: null,
      created_at: new Date().toISOString(),
      reviewed_at: null,
      reviewed_by: null
    };

    this.store?.submissions.push(submission);
    this.saveStore();
    return submission;
  }

  async getSubmissions(status?: string) {
    let list = this.store?.submissions || [];
    if (status) {
      list = list.filter(s => s.status === status);
    }
    return list;
  }

  async approveSubmission(submissionId: number, adminUserId: number) {
    const sub = this.store?.submissions.find(s => s.id === submissionId);
    if (!sub || sub.status !== 'pending') return null;

    // Resolve or create City
    let city = (this.store?.cities || []).find(c => c.name.toLowerCase() === sub.city_name.toLowerCase());
    if (!city) {
      city = await this.createCity({
        name: sub.city_name,
        slug: sub.city_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        state: 'Local State',
        is_popular: false
      });
    }

    // Resolve or create Area
    let area = (this.store?.areas || []).find(
      a => a.city_id === city.id && a.name.toLowerCase() === sub.area_name.toLowerCase()
    );
    if (!area) {
      area = await this.createArea({
        city_id: city.id,
        name: sub.area_name,
        slug: sub.area_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        pincode: sub.pincode || '',
        is_popular: false
      });
    } else if (!area.pincode && sub.pincode) {
      area.pincode = sub.pincode;
    }

    // Calculate plan expiry date
    let planExpiresAt: string | null = null;
    if (sub.plan_type && sub.plan_type !== 'free') {
      const exp = new Date();
      if (sub.plan_type === 'yearly') {
        exp.setFullYear(exp.getFullYear() + 1);
      } else if (sub.plan_type === 'half_yearly') {
        exp.setMonth(exp.getMonth() + 6);
      } else if (sub.plan_type === 'monthly') {
        exp.setMonth(exp.getMonth() + 1);
      }
      planExpiresAt = exp.toISOString();
    }

    const featuredTier = sub.plan_type === 'yearly' ? 'platinum' : sub.plan_type === 'half_yearly' ? 'premium' : sub.plan_type === 'monthly' ? 'standard' : null;

    // Create verified business
    const business = await this.createBusiness({
      name: sub.business_name,
      category: sub.category,
      description: sub.description,
      phone: sub.phone,
      email: sub.email,
      website: sub.website,
      booking_url: sub.booking_url,
      address: sub.full_address,
      city_id: city.id,
      area_id: area.id,
      pincode: sub.pincode || area.pincode || '',
      google_maps_url: sub.google_maps_url,
      service_ids: sub.service_ids,
      photos: sub.photos_json,
      hours: sub.opening_hours_json,
      keywords: sub.keywords || '',
      view_count: sub.view_count || 1,
      status: 'published',
      verification_status: 'verified',
      plan_type: sub.plan_type || 'free',
      payment_status: sub.payment_status || (sub.plan_type && sub.plan_type !== 'free' ? 'paid' : 'free'),
      payment_id: sub.payment_id || null,
      amount_paid: sub.amount_paid !== undefined ? sub.amount_paid : 0,
      plan_started_at: sub.paid_at || new Date().toISOString(),
      plan_expires_at: planExpiresAt,
      featured_tier: featuredTier
    });

    // Mark submission approved
    sub.status = 'approved';
    sub.reviewed_at = new Date().toISOString();
    sub.reviewed_by = adminUserId;

    // Audit log
    await this.logAudit({
      user_id: adminUserId,
      action: 'APPROVE_SUBMISSION',
      entity_type: 'SUBMISSION',
      entity_id: sub.id,
      details: { business_id: business.id, business_name: business.name, plan_type: sub.plan_type }
    });

    this.saveStore();
    return { submission: sub, business };
  }

  async getPaymentsSummary() {
    const businesses = this.store?.businesses || [];
    const submissions = this.store?.submissions || [];

    const records: any[] = [];

    // From businesses
    businesses.forEach(b => {
      if ((b.plan_type && b.plan_type !== 'free') || (b.amount_paid && b.amount_paid > 0) || b.payment_id) {
        records.push({
          id: `biz-${b.id}`,
          source: 'business',
          business_id: b.id,
          business_name: b.name,
          category: b.category,
          plan_type: b.plan_type || 'monthly',
          payment_status: b.payment_status || 'paid',
          amount_paid: b.amount_paid || (b.plan_type === 'yearly' ? 8999 : b.plan_type === 'half_yearly' ? 4999 : 999),
          payment_id: b.payment_id || `PAY-BIZ-${b.id}`,
          payment_method: 'UPI / Razorpay',
          created_at: b.plan_started_at || b.created_at,
          expires_at: b.plan_expires_at || null,
          featured_tier: b.featured_tier || null,
          city_id: b.city_id,
          phone: b.phone
        });
      }
    });

    // From submissions (including pending ones)
    submissions.forEach(s => {
      if ((s.plan_type && s.plan_type !== 'free') || (s.amount_paid && s.amount_paid > 0) || s.payment_id) {
        const alreadyInBiz = records.some(r => r.source === 'business' && r.payment_id && r.payment_id === s.payment_id);
        if (!alreadyInBiz) {
          records.push({
            id: `sub-${s.id}`,
            source: 'submission',
            submission_id: s.id,
            business_name: s.business_name,
            category: s.category,
            plan_type: s.plan_type || 'monthly',
            payment_status: s.payment_status || 'pending',
            amount_paid: s.amount_paid || (s.plan_type === 'yearly' ? 8999 : s.plan_type === 'half_yearly' ? 4999 : 999),
            payment_id: s.payment_id || `SUB-PENDING-${s.id}`,
            payment_method: s.payment_method || 'UPI',
            created_at: s.created_at,
            expires_at: null,
            phone: s.phone
          });
        }
      }
    });

    let totalRevenue = 0;
    let monthlyCount = 0;
    let monthlyRevenue = 0;
    let halfYearlyCount = 0;
    let halfYearlyRevenue = 0;
    let yearlyCount = 0;
    let yearlyRevenue = 0;
    let pendingCount = 0;
    let activeSubscriptions = 0;

    records.forEach(r => {
      const isPaid = r.payment_status === 'paid';
      const amt = Number(r.amount_paid) || 0;
      if (isPaid) {
        totalRevenue += amt;
        activeSubscriptions++;
      } else if (r.payment_status === 'pending') {
        pendingCount++;
      }

      if (r.plan_type === 'monthly') {
        monthlyCount++;
        if (isPaid) monthlyRevenue += amt;
      } else if (r.plan_type === 'half_yearly') {
        halfYearlyCount++;
        if (isPaid) halfYearlyRevenue += amt;
      } else if (r.plan_type === 'yearly') {
        yearlyCount++;
        if (isPaid) yearlyRevenue += amt;
      }
    });

    return {
      summary: {
        totalRevenue,
        activeSubscriptions,
        pendingCount,
        monthlyCount,
        monthlyRevenue,
        halfYearlyCount,
        halfYearlyRevenue,
        yearlyCount,
        yearlyRevenue,
        totalRecords: records.length
      },
      transactions: records.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
    };
  }

  async updateBusinessPlan(businessId: number, planData: any, adminUserId?: number) {
    const biz = this.store?.businesses.find(b => b.id === businessId);
    if (!biz) return null;

    const planType = planData.plan_type || biz.plan_type || 'free';
    const paymentStatus = planData.payment_status || biz.payment_status || 'paid';
    const amountPaid = planData.amount_paid !== undefined ? Number(planData.amount_paid) : (biz.amount_paid || 0);
    const paymentId = planData.payment_id || biz.payment_id || `PAY-MANUAL-${Date.now()}`;
    const featuredTier = planData.featured_tier !== undefined ? planData.featured_tier : (planType === 'yearly' ? 'platinum' : planType === 'half_yearly' ? 'premium' : planType === 'monthly' ? 'standard' : null);

    biz.plan_type = planType;
    biz.payment_status = paymentStatus;
    biz.amount_paid = amountPaid;
    biz.payment_id = paymentId;
    biz.featured_tier = featuredTier;
    if (planData.plan_expires_at) {
      biz.plan_expires_at = planData.plan_expires_at;
    } else if (planData.extend_months) {
      const currentExp = biz.plan_expires_at ? new Date(biz.plan_expires_at) : new Date();
      currentExp.setMonth(currentExp.getMonth() + Number(planData.extend_months));
      biz.plan_expires_at = currentExp.toISOString();
    } else if (planType !== 'free' && !biz.plan_expires_at) {
      const exp = new Date();
      if (planType === 'yearly') exp.setFullYear(exp.getFullYear() + 1);
      else if (planType === 'half_yearly') exp.setMonth(exp.getMonth() + 6);
      else if (planType === 'monthly') exp.setMonth(exp.getMonth() + 1);
      biz.plan_expires_at = exp.toISOString();
    }
    if (!biz.plan_started_at) {
      biz.plan_started_at = new Date().toISOString();
    }
    biz.updated_at = new Date().toISOString();

    if (adminUserId) {
      await this.logAudit({
        user_id: adminUserId,
        action: 'UPDATE_BUSINESS_PLAN',
        entity_type: 'BUSINESS',
        entity_id: biz.id,
        details: { plan_type: planType, payment_status: paymentStatus, amount_paid: amountPaid }
      });
    }

    this.saveStore();
    return this.enrichBusinessRecord(biz);
  }

  async rejectSubmission(submissionId: number, adminUserId: number, reason: string) {
    const sub = this.store?.submissions.find(s => s.id === submissionId);
    if (!sub) return null;

    sub.status = 'rejected';
    sub.rejection_reason = reason;
    sub.reviewed_at = new Date().toISOString();
    sub.reviewed_by = adminUserId;

    await this.logAudit({
      user_id: adminUserId,
      action: 'REJECT_SUBMISSION',
      entity_type: 'SUBMISSION',
      entity_id: sub.id,
      details: { reason }
    });

    this.saveStore();
    return sub;
  }

  // ==========================================
  // CLAIMS
  // ==========================================
  async createClaim(data: {
    business_id: number;
    user_id: number;
    applicant_name: string;
    applicant_email: string;
    applicant_phone: string;
    applicant_role: string;
    verification_method: string;
    proof_notes?: string;
  }) {
    const id = (this.store?.claims.reduce((max, c) => Math.max(max, c.id), 0) || 0) + 1;
    const token = `VERIF-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    const claim = {
      id,
      business_id: Number(data.business_id),
      user_id: Number(data.user_id),
      applicant_name: data.applicant_name.trim(),
      applicant_email: data.applicant_email.trim(),
      applicant_phone: data.applicant_phone.trim(),
      applicant_role: data.applicant_role.trim(),
      verification_method: data.verification_method,
      verification_token: token,
      proof_notes: data.proof_notes ? data.proof_notes.trim() : null,
      status: 'pending',
      rejection_reason: null,
      created_at: new Date().toISOString(),
      reviewed_at: null,
      reviewed_by: null
    };

    this.store?.claims.push(claim);

    // Initial claim verification step log
    this.store?.claim_verifications.push({
      id: (this.store.claim_verifications.length || 0) + 1,
      claim_id: id,
      step_name: 'CLAIM_SUBMITTED',
      status: 'pending',
      log_message: `Claim initiated via ${data.verification_method}. Generated verification token: ${token}`,
      verified_at: new Date().toISOString()
    });

    this.saveStore();
    return claim;
  }

  async getClaims(status?: string) {
    let list = this.store?.claims || [];
    if (status) {
      list = list.filter(c => c.status === status);
    }
    return list.map(claim => {
      const biz = (this.store?.businesses || []).find(b => b.id === claim.business_id);
      const user = (this.store?.users || []).find(u => u.id === claim.user_id);
      return {
        ...claim,
        business_name: biz?.name || 'Unknown Business',
        business_slug: biz?.slug || '',
        user_email: user?.email || claim.applicant_email
      };
    });
  }

  async getClaimsByUserId(userId: number) {
    const claims = (this.store?.claims || []).filter(c => c.user_id === userId);
    return claims.map(claim => {
      const biz = (this.store?.businesses || []).find(b => b.id === claim.business_id);
      return {
        ...claim,
        business_name: biz?.name || '',
        business_slug: biz?.slug || ''
      };
    });
  }

  async reviewClaim(claimId: number, adminUserId: number, action: 'verified' | 'rejected', reason?: string) {
    const claim = this.store?.claims.find(c => c.id === claimId);
    if (!claim) return null;

    claim.status = action;
    claim.rejection_reason = reason || null;
    claim.reviewed_at = new Date().toISOString();
    claim.reviewed_by = adminUserId;

    if (action === 'verified') {
      // Update business owner and verification status
      const biz = this.store?.businesses.find(b => b.id === claim.business_id);
      if (biz) {
        biz.owner_id = claim.user_id;
        biz.verification_status = 'claimed';
        biz.updated_at = new Date().toISOString();
      }

      // Elevate applicant user role to business_owner if they are a regular user
      const applicantUser = this.store?.users.find(u => u.id === claim.user_id);
      if (applicantUser && applicantUser.role === 'user') {
        applicantUser.role = 'business_owner';
        applicantUser.updated_at = new Date().toISOString();
      }
    }

    await this.logAudit({
      user_id: adminUserId,
      action: action === 'verified' ? 'APPROVE_CLAIM' : 'REJECT_CLAIM',
      entity_type: 'CLAIM',
      entity_id: claim.id,
      details: { business_id: claim.business_id, user_id: claim.user_id, reason }
    });

    this.saveStore();
    return claim;
  }

  // ==========================================
  // BLOG
  // ==========================================
  async getBlogPosts(status = 'published') {
    let list = this.store?.blog_posts || [];
    if (status && status !== 'all') {
      list = list.filter(p => p.status === status);
    }
    return list.map(post => {
      const cat = (this.store?.blog_categories || []).find(c => c.id === post.category_id);
      return {
        ...post,
        category_name: cat?.name || 'General Wellness',
        category_slug: cat?.slug || 'general-wellness'
      };
    });
  }

  async getBlogPostById(id: number) {
    const post = (this.store?.blog_posts || []).find(p => p.id === id);
    if (!post) return null;
    const cat = (this.store?.blog_categories || []).find(c => c.id === post.category_id);
    return {
      ...post,
      category_name: cat?.name || 'General Wellness',
      category_slug: cat?.slug || 'general-wellness'
    };
  }

  async getBlogPostBySlug(slug: string) {
    const post = (this.store?.blog_posts || []).find(p => p.slug.toLowerCase() === slug.toLowerCase());
    if (!post) return null;

    const cat = (this.store?.blog_categories || []).find(c => c.id === post.category_id);
    const relatedPosts = (this.store?.blog_posts || [])
      .filter(p => p.id !== post.id && p.status === 'published')
      .slice(0, 3)
      .map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        featured_image: p.featured_image,
        published_at: p.published_at
      }));

    // Directory linking based on content / category
    const relevantServices = (this.store?.services || []).slice(0, 4);
    const relevantCities = (this.store?.cities || []).slice(0, 4);

    return {
      ...post,
      category_name: cat?.name || 'General Wellness',
      category_slug: cat?.slug || 'general-wellness',
      relatedPosts,
      relevantServices,
      relevantCities
    };
  }

  async createBlogPost(data: any) {
    const id = (this.store?.blog_posts.reduce((max, p) => Math.max(max, p.id), 0) || 0) + 1;
    const baseSlug = (data.slug || data.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const post = {
      id,
      title: data.title ? data.title.trim() : '',
      slug: baseSlug,
      excerpt: data.excerpt ? data.excerpt.trim() : '',
      content: data.content ? data.content.trim() : '',
      featured_image: data.featured_image || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      author: data.author ? data.author.trim() : 'Editorial Team',
      category_id: Number(data.category_id) || 1,
      seo_title: data.seo_title || null,
      meta_description: data.meta_description || null,
      status: data.status || 'published',
      published_at: data.published_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.store?.blog_posts.push(post);
    this.saveStore();
    return post;
  }

  async updateBlogPost(id: number, data: any) {
    const post = this.store?.blog_posts.find(p => p.id === id);
    if (!post) return null;
    if (data.title) post.title = data.title.trim();
    if (data.slug) post.slug = data.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (data.excerpt !== undefined) post.excerpt = data.excerpt.trim();
    if (data.content !== undefined) post.content = data.content.trim();
    if (data.featured_image !== undefined) post.featured_image = data.featured_image;
    if (data.author !== undefined) post.author = data.author.trim();
    if (data.category_id !== undefined) post.category_id = Number(data.category_id);
    if (data.seo_title !== undefined) (post as any).seo_title = data.seo_title;
    if (data.meta_description !== undefined) (post as any).meta_description = data.meta_description;
    if (data.status !== undefined) post.status = data.status;
    if (data.published_at !== undefined) post.published_at = data.published_at;
    post.updated_at = new Date().toISOString();
    this.saveStore();
    return post;
  }

  async deleteBlogPost(id: number) {
    if (!this.store) return false;
    const idx = this.store.blog_posts.findIndex(p => p.id === id);
    if (idx >= 0) {
      this.store.blog_posts.splice(idx, 1);
      this.saveStore();
      return true;
    }
    return false;
  }

  // ==========================================
  // REPORTS, CORRECTIONS & CONTACT
  // ==========================================
  async createReport(data: { business_id: number; report_type: string; message: string; reporter_email?: string }) {
    const id = (this.store?.reports.reduce((max, r) => Math.max(max, r.id), 0) || 0) + 1;
    const report = {
      id,
      business_id: Number(data.business_id),
      report_type: data.report_type,
      message: data.message.trim(),
      reporter_email: data.reporter_email ? data.reporter_email.trim() : null,
      status: 'pending',
      admin_notes: null,
      created_at: new Date().toISOString()
    };
    this.store?.reports.push(report);
    this.saveStore();
    return report;
  }

  async getReports() {
    return (this.store?.reports || []).map(r => {
      const biz = (this.store?.businesses || []).find(b => b.id === r.business_id);
      return { ...r, business_name: biz?.name || 'Unknown Business' };
    });
  }

  async resolveReport(id: number, adminNotes?: string) {
    const r = this.store?.reports.find(item => item.id === id);
    if (r) {
      r.status = 'resolved';
      r.admin_notes = adminNotes || 'Resolved by admin';
      this.saveStore();
    }
    return r;
  }

  async createCorrection(data: { business_id: number; user_id?: number; proposed_data: any; notes?: string }) {
    const id = (this.store?.corrections.reduce((max, c) => Math.max(max, c.id), 0) || 0) + 1;
    const correction = {
      id,
      business_id: Number(data.business_id),
      user_id: data.user_id ? Number(data.user_id) : null,
      proposed_data_json: data.proposed_data,
      notes: data.notes || '',
      status: 'pending',
      created_at: new Date().toISOString(),
      reviewed_at: null
    };
    this.store?.corrections.push(correction);
    this.saveStore();
    return correction;
  }

  async getCorrections() {
    return (this.store?.corrections || []).map(c => {
      const biz = (this.store?.businesses || []).find(b => b.id === c.business_id);
      return { ...c, business_name: biz?.name || 'Unknown Business' };
    });
  }

  async resolveCorrection(id: number, status: string, notes?: string) {
    const corr = this.store?.corrections.find(c => c.id === id);
    if (!corr) return null;
    corr.status = status;
    (corr as any).admin_notes = notes || '';
    corr.reviewed_at = new Date().toISOString();
    this.saveStore();
    return corr;
  }

  async getAllPhotos() {
    return (this.store?.business_photos || []).map(p => {
      const biz = (this.store?.businesses || []).find(b => b.id === p.business_id);
      const city = (this.store?.cities || []).find(c => c.id === biz?.city_id);
      const area = (this.store?.areas || []).find(a => a.id === biz?.area_id);
      return {
        ...p,
        business_name: biz?.name || 'Unknown Business',
        business_slug: biz?.slug || '',
        city_slug: city?.slug || '',
        area_slug: area?.slug || ''
      };
    });
  }

  async deletePhoto(photoId: number) {
    if (!this.store) return false;
    const idx = this.store.business_photos.findIndex(p => p.id === photoId);
    if (idx >= 0) {
      this.store.business_photos.splice(idx, 1);
      this.saveStore();
      return true;
    }
    return false;
  }

  async createContactMessage(data: { name: string; email: string; subject: string; message: string }) {
    const id = (this.store?.contact_messages.reduce((max, m) => Math.max(max, m.id), 0) || 0) + 1;
    const msg = {
      id,
      name: data.name.trim(),
      email: data.email.trim(),
      subject: data.subject.trim(),
      message: data.message.trim(),
      status: 'new',
      created_at: new Date().toISOString()
    };
    this.store?.contact_messages.push(msg);
    this.saveStore();
    return msg;
  }

  async getContactMessages() {
    return this.store?.contact_messages || [];
  }

  // ==========================================
  // AUDIT LOGS
  // ==========================================
  async logAudit(data: { user_id?: number | null; action: string; entity_type: string; entity_id?: number | null; details?: any }) {
    const id = (this.store?.audit_logs.reduce((max, a) => Math.max(max, a.id), 0) || 0) + 1;
    const entry = {
      id,
      user_id: data.user_id || null,
      action: data.action,
      entity_type: data.entity_type,
      entity_id: data.entity_id || null,
      details_json: data.details || null,
      created_at: new Date().toISOString()
    };
    this.store?.audit_logs.unshift(entry);
    this.saveStore();
    return entry;
  }

  async getAuditLogs(limit = 50) {
    return (this.store?.audit_logs || []).slice(0, limit);
  }

  // Business Owner Dashboard
  async getBusinessesByOwner(ownerId: number) {
    return (this.store?.businesses || [])
      .filter(b => b.owner_id === ownerId)
      .map(b => this.enrichBusinessRecord(b));
  }
}

export const db = new DatabaseService();
