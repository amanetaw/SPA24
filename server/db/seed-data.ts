// Initial verified seed data for SPA24 directory
import bcrypt from 'bcryptjs';

export const INITIAL_CITIES = [
  {
    id: 1,
    name: 'Mumbai',
    slug: 'mumbai',
    state: 'Maharashtra',
    country: 'India',
    description: 'India\'s premier metropolitan hub offering world-class wellness sanctuaries, authentic Ayurvedic clinics, and luxury urban day spas across historic and coastal neighborhoods.',
    is_popular: true,
    is_published: true
  },
  {
    id: 2,
    name: 'Bengaluru',
    slug: 'bengaluru',
    state: 'Karnataka',
    country: 'India',
    description: 'The garden city blends tech dynamism with serene holistic retreats, traditional Southern Abhyanga centers, and organic day spas.',
    is_popular: true,
    is_published: true
  },
  {
    id: 3,
    name: 'Delhi NCR',
    slug: 'delhi',
    state: 'Delhi',
    country: 'India',
    description: 'Heritage wellness hubs and contemporary luxury spa destinations catering to busy executives and wellness seekers.',
    is_popular: true,
    is_published: true
  },
  {
    id: 4,
    name: 'Indore',
    slug: 'indore',
    state: 'Madhya Pradesh',
    country: 'India',
    description: 'Madhya Pradesh\'s cleanest commercial center features rapidly growing boutique day spas, herbal rejuvenation clinics, and family relaxation centers.',
    is_popular: true,
    is_published: true
  },
  {
    id: 5,
    name: 'Goa',
    slug: 'goa',
    state: 'Goa',
    country: 'India',
    description: 'Coastal paradise renowned for beachside holistic healing retreats, Swedish relaxation therapies, and Ayurvedic wellness resorts.',
    is_popular: true,
    is_published: true
  },
  {
    id: 6,
    name: 'Pune',
    slug: 'pune',
    state: 'Maharashtra',
    country: 'India',
    description: 'Cultural center known for tranquil meditation retreats, Thai massage academies, and bespoke urban wellness parlors.',
    is_popular: true,
    is_published: true
  }
];

export const INITIAL_AREAS = [
  // Mumbai
  {
    id: 1,
    city_id: 1,
    name: 'Bandra West',
    slug: 'bandra-west',
    pincode: '400050',
    description: 'Coastal and vibrant Bandra West features premier boutique spas, artisanal facial studios, and peaceful holistic lounges along Hill Road and Turner Road.',
    is_popular: true,
    is_published: true
  },
  {
    id: 2,
    city_id: 1,
    name: 'Dadar',
    slug: 'dadar',
    pincode: '400028',
    description: 'Central Mumbai junction hosting established traditional reflexology centers, traditional Ayurvedic treatment clinics, and modern wellness parlors.',
    is_popular: true,
    is_published: true
  },
  {
    id: 3,
    city_id: 1,
    name: 'Juhu',
    slug: 'juhu',
    pincode: '400049',
    description: 'Upscale beachfront locality celebrated for premium resort spas, celebrity relaxation sanctuaries, and organic wellness suites.',
    is_popular: true,
    is_published: true
  },
  {
    id: 4,
    city_id: 1,
    name: 'Colaba',
    slug: 'colaba',
    pincode: '400005',
    description: 'South Mumbai heritage quarter with timeless luxury therapies and bespoke massage studios near the harbor.',
    is_popular: false,
    is_published: true
  },
  // Bengaluru
  {
    id: 5,
    city_id: 2,
    name: 'Indiranagar',
    slug: 'indiranagar',
    pincode: '560038',
    description: 'Cosmopolitan neighborhood packed with premier Thai therapy academies, deep tissue specialists, and holistic aroma bars along 100ft Road.',
    is_popular: true,
    is_published: true
  },
  {
    id: 6,
    city_id: 2,
    name: 'Koramangala',
    slug: 'koramangala',
    pincode: '560034',
    description: 'Dynamic urban quarter with popular urban retreats, Swedish relaxation clinics, and foot reflexology lounges.',
    is_popular: true,
    is_published: true
  },
  // Delhi
  {
    id: 7,
    city_id: 3,
    name: 'Connaught Place',
    slug: 'connaught-place',
    pincode: '110001',
    description: 'Central Delhi colonnaded hub featuring business-traveler day spas, quick revitalizing therapies, and luxury wellness centers.',
    is_popular: true,
    is_published: true
  },
  {
    id: 8,
    city_id: 3,
    name: 'Vasant Kunj',
    slug: 'vasant-kunj',
    pincode: '110070',
    description: 'Green South Delhi enclave housing extensive holistic spas, heated stone specialists, and tranquil wellness villas.',
    is_popular: true,
    is_published: true
  },
  // Indore
  {
    id: 9,
    city_id: 4,
    name: 'Vijay Nagar',
    slug: 'vijay-nagar',
    pincode: '452010',
    description: 'Premier modern hub of Indore with state-of-the-art wellness clubs, Swedish massage studios, and relaxing couple spa suites.',
    is_popular: true,
    is_published: true
  },
  {
    id: 10,
    city_id: 4,
    name: 'Old Palasia',
    slug: 'old-palasia',
    pincode: '452001',
    description: 'Central Indore neighborhood known for established Ayurvedic rejuvenation therapy clinics and authentic herbal therapies.',
    is_popular: true,
    is_published: true
  },
  // Goa
  {
    id: 11,
    city_id: 5,
    name: 'Candolim',
    slug: 'candolim',
    pincode: '403515',
    description: 'North Goa beach strip boasting tranquil sea-breeze spa cabanas, Ayurvedic Shirodhara packages, and Thai massage pavilions.',
    is_popular: true,
    is_published: true
  }
];

export const INITIAL_SERVICES = [
  {
    id: 1,
    name: 'Swedish Massage',
    slug: 'swedish-massage',
    category: 'Full Body Massage',
    short_desc: 'Classic gentle to medium pressure therapy using long gliding strokes to relieve tension, promote circulation, and restore calm.',
    full_desc: 'Swedish massage is one of the most widely practiced therapeutic modalities globally. It utilizes five primary strokes: effleurage (sliding strokes), petrissage (kneading), tapotement (rhythmic tapping), friction, and vibration. The therapy aims to relax muscles, boost lymphatic fluid drainage, and relieve emotional stress.',
    expectations: 'Sessions typically last 60 to 90 minutes. You will disrobe to your comfort level under fresh linens. The therapist applies warm essential oils or unscented grapeseed oil while systematically releasing tension from neck to feet.',
    provider_tips: 'Look for certified therapists who conduct a brief pre-session intake to check for sensitivities, pressure preferences, and recent muscular strains.',
    icon: 'Sparkles',
    is_popular: true
  },
  {
    id: 2,
    name: 'Deep Tissue Massage',
    slug: 'deep-tissue-massage',
    category: 'Therapeutic Bodywork',
    short_desc: 'Targeted firm pressure targeting chronic muscle tension, deep postural adhesions, and connective tissue knots.',
    full_desc: 'Deep tissue bodywork focuses on the deeper layers of muscle tissue and fascia. Slow strokes and direct deep finger or elbow pressure work across the grain of muscles to break up adhesions caused by repetitive strain, physical workouts, or prolonged desk postures.',
    expectations: 'You may experience brief moments of therapeutic discomfort when tight trigger points are accessed. Clear ongoing communication with your therapist ensures the pressure remains productive.',
    provider_tips: 'Choose practitioners with recognized neuromuscular or sports massage credentials. Hydrate well before and after your treatment.',
    icon: 'Activity',
    is_popular: true
  },
  {
    id: 3,
    name: 'Authentic Thai Massage',
    slug: 'thai-massage',
    category: 'Eastern & Holistic Bodywork',
    short_desc: 'Ancient energetic bodywork combining passive stretching, acupressure, and rhythmic joint mobilization on a floor mat.',
    full_desc: 'Developed in Thailand with roots in Ayurvedic and traditional Chinese medicine, Thai massage is often described as assisted yoga. The therapist utilizes thumbs, palms, forearms, and feet along sen (energy lines) while gently guiding your body into invigorating stretches.',
    expectations: 'Unlike oil-based therapies, Thai massage is performed fully clothed in loose, comfortable cotton attire on a firm floor mat. No oils are used unless combined with herbal compresses.',
    provider_tips: 'Seek spas where therapists are certified from traditional Thai massage institutions (such as Wat Pho). Ensure the facility maintains spacious, clean floor mats.',
    icon: 'Sun',
    is_popular: true
  },
  {
    id: 4,
    name: 'Ayurvedic Abhyanga & Panchakarma',
    slug: 'ayurvedic-massage',
    category: 'Ayurvedic Therapies',
    short_desc: 'Traditional warm herbalized oil body treatment tailored to constitutional doshas for detoxification and rejuvenation.',
    full_desc: 'Abhyanga is the classical whole-body warm oil massage of Ayurveda. Infused with dosha-specific botanical formulations like bala, ashwagandha, or sesame, the rhythmic strokes encourage cellular waste elimination, calm the nervous system, and deeply nourish skin tissues.',
    expectations: 'Generous amounts of warmed medicated herbal oil are applied in synchronized long strokes. The session is often concluded with a herbal steam bath (Swedana) to open microchannels.',
    provider_tips: 'Verify that the center employs qualified Ayurvedic physicians (BAMS) or trained therapists who use authentic traditional herbal oils.',
    icon: 'Flower2',
    is_popular: true
  },
  {
    id: 5,
    name: 'Aromatherapy Wellness',
    slug: 'aromatherapy',
    category: 'Relaxation & Sensory',
    short_desc: 'Gentle restorative massage incorporating pure therapeutic-grade botanical essential oils to soothe mind and body.',
    full_desc: 'Aromatherapy merges tactile sensory therapy with olfactory healing. Pure plant essences such as lavender, eucalyptus, bergamot, and sandalwood are custom-blended into nourishing carrier oils to balance stress hormones and foster tranquility.',
    expectations: 'Begins with an aroma sensory test where you select scents that align with your current mood. Gentle rhythmic strokes follow in a dim, peaceful ambiance.',
    provider_tips: 'Ensure the spa uses genuine therapeutic essential oils rather than synthetic fragrance oils which can irritate skin.',
    icon: 'Wind',
    is_popular: true
  },
  {
    id: 6,
    name: 'Hot Stone Therapy',
    slug: 'hot-stone-massage',
    category: 'Thermal Bodywork',
    short_desc: 'Smooth basalt volcanic stones heated to therapeutic temperatures placed and glided over muscular trigger points.',
    full_desc: 'Smooth, iron-rich volcanic basalt stones retain and transmit deep penetrating heat. The thermal energy softens rigid fascia faster than manual pressure alone, allowing gentle strokes to deeply relieve tightness without excessive mechanical pressure.',
    expectations: 'Heated stones are placed along energy meridians (back, palms, between toes) while warm stones are held in the therapist\'s hands to perform sweeping strokes.',
    provider_tips: 'Ensure stones are sterilized between sessions and tested for safe, regulated temperature before contacting bare skin.',
    icon: 'Flame',
    is_popular: true
  },
  {
    id: 7,
    name: 'Foot Reflexology',
    slug: 'foot-reflexology',
    category: 'Reflexology',
    short_desc: 'Focused pressure point therapy on feet and calves corresponding to bodily systems and stress reduction.',
    full_desc: 'Reflexology is based on the principle that specific reflex zones on the feet and hands correspond to specific organs, glands, and biological systems. Targeted thumb-walking techniques relieve systemic fatigue and stimulate circulation.',
    expectations: 'Conducted in comfortable reclining loungers. Begins with an herbal foot bath, followed by systematic thumb pressure and cooling peppermint or tea-tree balms.',
    provider_tips: 'Great option for quick revitalization during lunch breaks or after extensive walking.',
    icon: 'Footprints',
    is_popular: false
  },
  {
    id: 8,
    name: 'Facial Wellness & Rejuvenation',
    slug: 'facial-wellness',
    category: 'Skincare & Wellness',
    short_desc: 'Non-invasive holistic skin treatment combining lymphatic facial massage, botanical hydration, and skin barrier nourishment.',
    full_desc: 'Spa facial wellness focuses on natural skin rejuvenation rather than aggressive chemical peels. Combines gentle cleansing, botanical steam, facial pressure point stimulation, and rich antioxidant masks.',
    expectations: 'Thorough skin cleansing, gentle exfoliation, relaxing facial and décolleté massage, mask application, and SPF moisturization.',
    provider_tips: 'Discuss your skin allergies and any active breakouts with your aesthetician prior to application.',
    icon: 'Smile',
    is_popular: false
  }
];

export const INITIAL_BUSINESSES = [
  {
    id: 1,
    name: 'Aura Sanctum Spa & Holistic Wellness',
    slug: 'aura-sanctum-spa-and-holistic-wellness',
    category: 'Boutique Luxury Day Spa',
    description: 'A tranquil sanctuary nestled in Bandra West, Aura Sanctum combines ancient Thai bodywork with restorative Swedish techniques. Featuring private suites, organic cold-pressed botanical oils, and skilled licensed practitioners dedicated to restoring physical balance in a peaceful urban oasis.',
    phone: '+91 22 2640 1892',
    email: 'contact@aurasanctum.example.com',
    website: 'https://aurasanctum.example.com',
    booking_url: 'https://aurasanctum.example.com/reservations',
    address: 'Plot 42, 2nd Floor, Turner Road, Bandra West',
    city_id: 1, // Mumbai
    area_id: 1, // Bandra West
    google_maps_url: 'https://maps.google.com/?q=Bandra+West+Mumbai',
    status: 'published',
    verification_status: 'verified',
    owner_id: 2, // Demo owner
    view_count: 1420
  },
  {
    id: 2,
    name: 'Sanjeevani Ayurvedic Rejuvenation Centre',
    slug: 'sanjeevani-ayurvedic-rejuvenation-centre',
    category: 'Ayurvedic Treatment Clinic',
    description: 'Operational for over twelve years in Dadar, Sanjeevani provides authentic Kerala Abhyanga, Shirodhara, and joint-care herbal treatments supervised by resident Ayurvedic practitioners. Clean therapeutic rooms, traditional brass steam units, and certified herbal preparations.',
    phone: '+91 22 2418 7731',
    email: 'info@sanjeevaniayur.example.com',
    website: 'https://sanjeevaniayur.example.com',
    booking_url: '',
    address: '14 Bhavani Shankar Road, Near Plaza Cinema, Dadar',
    city_id: 1, // Mumbai
    area_id: 2, // Dadar
    google_maps_url: 'https://maps.google.com/?q=Dadar+Mumbai',
    status: 'published',
    verification_status: 'verified',
    owner_id: null,
    view_count: 890
  },
  {
    id: 3,
    name: 'Oceanic Breeze Beachside Spa & Sauna',
    slug: 'oceanic-breeze-beachside-spa-sauna',
    category: 'Resort Day Spa',
    description: 'Located a short stroll from Juhu Beach, Oceanic Breeze offers coastal-inspired thalassotherapy, Swedish muscle recovery, and soothing hot stone relaxation. Features couple suites with cedarwood dry saunas and rain shower amenities.',
    phone: '+91 22 2619 4400',
    email: 'juhu@oceanicbreeze.example.com',
    website: 'https://oceanicbreeze.example.com',
    booking_url: 'https://oceanicbreeze.example.com/book',
    address: '88 Juhu Tara Road, Juhu',
    city_id: 1, // Mumbai
    area_id: 3, // Juhu
    google_maps_url: 'https://maps.google.com/?q=Juhu+Tara+Road+Mumbai',
    status: 'published',
    verification_status: 'claimed',
    owner_id: null,
    view_count: 1105
  },
  {
    id: 4,
    name: 'Zenith Deep Tissue & Body Recovery Lounge',
    slug: 'zenith-deep-tissue-body-recovery-lounge',
    category: 'Therapeutic Recovery Center',
    description: 'Indiranagar\'s dedicated center for posture correction, athletic muscle recovery, and deep myofascial release. Staffed by sports therapy certified therapists who conduct comprehensive range-of-motion assessments before treatment.',
    phone: '+91 80 4125 9901',
    email: 'care@zenithrecovery.example.com',
    website: 'https://zenithrecovery.example.com',
    booking_url: 'https://zenithrecovery.example.com/slots',
    address: '742, 100 Feet Road, HAL 2nd Stage, Indiranagar',
    city_id: 2, // Bengaluru
    area_id: 5, // Indiranagar
    google_maps_url: 'https://maps.google.com/?q=Indiranagar+Bengaluru',
    status: 'published',
    verification_status: 'verified',
    owner_id: null,
    view_count: 980
  },
  {
    id: 5,
    name: 'Bodhi Vriksha Thai & Herbal Spa',
    slug: 'bodhi-vriksha-thai-herbal-spa',
    category: 'Traditional Thai Bodywork',
    description: 'Authentic Thai massage studio in Koramangala designed with imported teakwood partitions and dedicated floor mats. Practitioners trained in classical northern Thai stretching and warm herbal poultice therapies.',
    phone: '+91 80 2553 1120',
    email: 'namaste@bodhivriksha.example.com',
    website: 'https://bodhivriksha.example.com',
    booking_url: '',
    address: '18, 5th Block, Jyoti Nivas College Road, Koramangala',
    city_id: 2, // Bengaluru
    area_id: 6, // Koramangala
    google_maps_url: 'https://maps.google.com/?q=Koramangala+Bengaluru',
    status: 'published',
    verification_status: 'verified',
    owner_id: null,
    view_count: 730
  },
  {
    id: 6,
    name: 'The Heritage Imperial Wellness Pavilion',
    slug: 'the-heritage-imperial-wellness-pavilion',
    category: 'Luxury Heritage Spa',
    description: 'Distinguished city-center wellness oasis situated in Connaught Place. Offering executive aromatherapy de-stress packages, Swedish bodywork, and express reflexology designed for busy professionals.',
    phone: '+91 11 4350 8820',
    email: 'concierge@heritageimperial.example.com',
    website: 'https://heritageimperial.example.com',
    booking_url: 'https://heritageimperial.example.com/appointments',
    address: 'Inner Circle, Block F, Connaught Place',
    city_id: 3, // Delhi
    area_id: 7, // Connaught Place
    google_maps_url: 'https://maps.google.com/?q=Connaught+Place+Delhi',
    status: 'published',
    verification_status: 'verified',
    owner_id: null,
    view_count: 1250
  },
  {
    id: 7,
    name: 'Nirvana Royal Spa & Rejuvenation Studio',
    slug: 'nirvana-royal-spa-rejuvenation-studio',
    category: 'Urban Day Spa',
    description: 'Contemporary multi-therapy wellness center in Vijay Nagar, Indore. Features private single and couple steam chambers, Swedish massages, and skin barrier replenishing botanical facials.',
    phone: '+91 731 408 6622',
    email: 'info@nirvanaindore.example.com',
    website: 'https://nirvanaindore.example.com',
    booking_url: 'https://nirvanaindore.example.com/book-now',
    address: 'Scheme No 54, PU-4 Commercial Complex, Vijay Nagar',
    city_id: 4, // Indore
    area_id: 9, // Vijay Nagar
    google_maps_url: 'https://maps.google.com/?q=Vijay+Nagar+Indore',
    status: 'published',
    verification_status: 'verified',
    owner_id: null,
    view_count: 670
  },
  {
    id: 8,
    name: 'Coastal Palms Ayurvedic Retreat & Day Spa',
    slug: 'coastal-palms-ayurvedic-retreat-day-spa',
    category: 'Holistic Beachside Spa',
    description: 'Serene coastal facility in Candolim offering Shirodhara forehead oil flow therapies, full-body herbal exfoliation, and ocean-facing Swedish massage cabanas. Certified natural ingredients.',
    phone: '+91 832 248 9110',
    email: 'goa@coastalpalms.example.com',
    website: 'https://coastalpalms.example.com',
    booking_url: 'https://coastalpalms.example.com/reserve',
    address: 'Near Holiday Beach Resort, Candolim Main Road',
    city_id: 5, // Goa
    area_id: 11, // Candolim
    google_maps_url: 'https://maps.google.com/?q=Candolim+Goa',
    status: 'published',
    verification_status: 'verified',
    owner_id: null,
    view_count: 840
  }
];

export const INITIAL_BUSINESS_SERVICES = [
  // Aura Sanctum (1)
  { business_id: 1, service_id: 1, price_from: 2800, duration_minutes: 60, notes: 'Includes warm organic jojoba oil and shower suite' },
  { business_id: 1, service_id: 2, price_from: 3400, duration_minutes: 75, notes: 'Focused shoulder and lower back recovery' },
  { business_id: 1, service_id: 3, price_from: 3000, duration_minutes: 90, notes: 'Classical northern Thai mat bodywork' },
  { business_id: 1, service_id: 5, price_from: 3200, duration_minutes: 60, notes: 'Choice of French lavender or lemongrass oil' },
  // Sanjeevani (2)
  { business_id: 2, service_id: 4, price_from: 2200, duration_minutes: 60, notes: 'Doctor consultation + herbal steam included' },
  { business_id: 2, service_id: 1, price_from: 2000, duration_minutes: 60, notes: 'Traditional sesame oil application' },
  // Oceanic Breeze (3)
  { business_id: 3, service_id: 1, price_from: 3100, duration_minutes: 60, notes: 'Ocean mineral scrub follow-up available' },
  { business_id: 3, service_id: 6, price_from: 4200, duration_minutes: 90, notes: 'Basalt heated stones and cedarwood sauna' },
  { business_id: 3, service_id: 8, price_from: 2600, duration_minutes: 60, notes: 'Marine collagen hydration' },
  // Zenith (4)
  { business_id: 4, service_id: 2, price_from: 3500, duration_minutes: 75, notes: 'Targeted trigger point and fascial release' },
  { business_id: 4, service_id: 1, price_from: 2900, duration_minutes: 60, notes: 'Post-workout tension relief' },
  { business_id: 4, service_id: 7, price_from: 1800, duration_minutes: 45, notes: 'Reflex zone stimulation and calf release' },
  // Bodhi Vriksha (5)
  { business_id: 5, service_id: 3, price_from: 2600, duration_minutes: 90, notes: 'Full mat body stretching with herbal balm' },
  { business_id: 5, service_id: 7, price_from: 1600, duration_minutes: 45, notes: 'Wooden stick reflexology and foot bath' },
  // The Heritage (6)
  { business_id: 6, service_id: 1, price_from: 3600, duration_minutes: 60, notes: 'Executive relaxation in private suite' },
  { business_id: 6, service_id: 5, price_from: 4000, duration_minutes: 75, notes: 'Bergamot and sandalwood infusion' },
  { business_id: 6, service_id: 6, price_from: 4800, duration_minutes: 90, notes: 'Full thermal basalt stone experience' },
  // Nirvana (7)
  { business_id: 7, service_id: 1, price_from: 2100, duration_minutes: 60, notes: 'Includes steam room access' },
  { business_id: 7, service_id: 2, price_from: 2600, duration_minutes: 60, notes: 'Medium to firm pressure' },
  { business_id: 7, service_id: 8, price_from: 2000, duration_minutes: 50, notes: 'Botanical soothing facial' },
  // Coastal Palms (8)
  { business_id: 8, service_id: 4, price_from: 2800, duration_minutes: 75, notes: 'Classical Shirodhara + Abhyanga' },
  { business_id: 8, service_id: 1, price_from: 2700, duration_minutes: 60, notes: 'Coconut and almond oil blend' },
  { business_id: 8, service_id: 5, price_from: 3000, duration_minutes: 60, notes: 'Calming coastal blend' }
];

export const INITIAL_BUSINESS_HOURS = [
  // Mon-Sun standard hours for all businesses
  ...[1, 2, 3, 4, 5, 6, 7, 8].flatMap(bizId => [
    { business_id: bizId, day_of_week: 1, open_time: '09:00', close_time: '21:00', is_closed: false },
    { business_id: bizId, day_of_week: 2, open_time: '09:00', close_time: '21:00', is_closed: false },
    { business_id: bizId, day_of_week: 3, open_time: '09:00', close_time: '21:00', is_closed: false },
    { business_id: bizId, day_of_week: 4, open_time: '09:00', close_time: '21:00', is_closed: false },
    { business_id: bizId, day_of_week: 5, open_time: '09:00', close_time: '21:30', is_closed: false },
    { business_id: bizId, day_of_week: 6, open_time: '08:30', close_time: '22:00', is_closed: false },
    { business_id: bizId, day_of_week: 0, open_time: '08:30', close_time: '21:30', is_closed: false }
  ])
];

export const INITIAL_BUSINESS_PHOTOS = [
  { id: 1, business_id: 1, url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80', caption: 'Tranquil private suite with botanical essences', is_primary: true, display_order: 1 },
  { id: 2, business_id: 1, url: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1000&q=80', caption: 'Organic essential oils and heated towels', is_primary: false, display_order: 2 },
  { id: 3, business_id: 2, url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1000&q=80', caption: 'Traditional wooden Droni table and brass Shirodhara vessel', is_primary: true, display_order: 1 },
  { id: 4, business_id: 3, url: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1000&q=80', caption: 'Coastal relaxation lounge and herbal tea corner', is_primary: true, display_order: 1 },
  { id: 5, business_id: 4, url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1000&q=80', caption: 'Ergonomic therapeutic therapy bed and assessments', is_primary: true, display_order: 1 },
  { id: 6, business_id: 5, url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1000&q=80', caption: 'Traditional Thai floor mat setup with natural bamboo elements', is_primary: true, display_order: 1 },
  { id: 7, business_id: 6, url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80', caption: 'Heritage brass fixtures and luxury private suites', is_primary: true, display_order: 1 },
  { id: 8, business_id: 7, url: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1000&q=80', caption: 'Modern ambient therapy suite in Vijay Nagar', is_primary: true, display_order: 1 },
  { id: 9, business_id: 8, url: 'https://images.unsplash.com/photo-1583416750470-965b2707b355?auto=format&fit=crop&w=1000&q=80', caption: 'Beachside palm cabana setup in Candolim', is_primary: true, display_order: 1 }
];

export const INITIAL_BLOG_CATEGORIES = [
  { id: 1, name: 'Wellness Education', slug: 'wellness-education', description: 'Evidence-based guides on bodywork, muscle recovery, and stress reduction.' },
  { id: 2, name: 'Therapy Comparisons', slug: 'therapy-comparisons', description: 'Clear breakdowns helping you pick the right massage modality.' },
  { id: 3, name: 'Directory & Etiquette', slug: 'directory-etiquette', description: 'Practical advice on spa booking, tipping etiquette, and verified standards.' }
];

export const INITIAL_BLOG_POSTS = [
  {
    id: 1,
    title: 'Swedish vs. Deep Tissue Massage: Which Is Right for Your Body?',
    slug: 'swedish-vs-deep-tissue-massage-guide',
    excerpt: 'Understand the distinct physiological differences, pressure levels, and ideal situations for both Swedish and deep tissue bodywork.',
    category_id: 2,
    author: 'Dr. Neha Verma, PT',
    featured_image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80',
    status: 'published',
    content: `When booking a wellness treatment, deciding between Swedish massage and deep tissue bodywork is one of the most common dilemmas. While both therapies use intentional touch to relieve stress, their biomechanical objectives and pressure intensity diverge significantly.

### Understanding Swedish Massage
Swedish massage is designed primarily around systemic relaxation and circulatory support. Developed by Pehr Henrik Ling in the 19th century, it relies on five foundational stroke patterns:
- **Effleurage**: Broad gliding strokes toward the heart.
- **Petrissage**: Rhythmic muscle lifting and kneading.
- **Friction**: Targeted warmth generation over superficial tissues.
- **Tapotement**: Gentle rhythmic tapping.
- **Vibration**: Rapid shaking movements to loosen superficial fascia.

If you are experiencing general life fatigue, travel stiffness, or simply need an hour to unplug your nervous system from screen stimulation, Swedish massage is your premier choice.

### When Deep Tissue Is Indicated
In contrast, deep tissue therapy focuses on specific, chronic musculoskeletal dysfunctions. Therapists use thumbs, knuckles, forearms, and elbows to access deeper fascial planes and break up rigid fibrous bands (commonly known as "knots" or adhesions).

Key indicators for deep tissue include:
- Chronic postural tightness in the upper trapezius from prolonged laptop use.
- Sciatic nerve pinching or lower back tightness.
- Athletic recovery following intensive marathon or weight training.

### What to Expect During Treatment
During deep tissue work, communication is essential. You should experience what therapists describe as "productive discomfort"—a firm, releasing pressure that remains within your pain tolerance. If you find yourself holding your breath or tensing your shoulders, inform your therapist immediately to adjust the depth.

### Preparing for Your Session
- Avoid heavy meals within 90 minutes of your appointment.
- Hydrate well beforehand to maintain muscle cell elasticity.
- Clearly inform the practitioner of any recent injuries, surgeries, or medications.`,
    published_at: '2026-08-15 10:00:00'
  },
  {
    id: 2,
    title: 'A First-Timer’s Guide to Spa Etiquette: What to Expect and How to Prepare',
    slug: 'first-timers-guide-to-spa-etiquette',
    excerpt: 'From arrival times and draping guidelines to pressure feedback, here is everything you need to know for a confident spa visit.',
    category_id: 3,
    author: 'Rajesh Nair, Spa Director',
    featured_image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    status: 'published',
    content: `Visiting a wellness sanctuary for the first time should be an unhurried, reassuring experience. Knowing standard spa protocols removes any lingering awkwardness so you can fully receive the restorative benefits of your treatment.

### 1. The Importance of Early Arrival
Arrive at least 15 to 20 minutes before your appointment time. This allows you to fill out mandatory health declaration cards, change into a clean robe, and sip herbal tea while your heart rate decelerates.

### 2. Draping and Modesty Standards
Professional, verified spas strictly adhere to proper draping protocols. You will be provided total privacy to undress to your comfort level (most clients leave underwear on or use disposable briefs provided by the center). During the massage, only the specific limb or back section being actively treated is uncovered.

### 3. Communicating With Your Therapist
Never hesitate to speak up. The session is exclusively for your comfort. You are encouraged to communicate regarding:
- Room temperature (too cool or too warm).
- Music volume or background ambient sounds.
- Level of physical pressure.
- Unscented oils if you have sensitivities to botanical fragrances.

### 4. Post-Session Recovery
Spend a few minutes resting in the relaxation lounge before stepping back into urban traffic. Drink warm water to assist kidney filtration, and take a gentle shower with mild temperature water.`,
    published_at: '2026-08-28 14:30:00'
  }
];

export const INITIAL_USERS = [
  {
    id: 1,
    email: 'admin@spa24.online',
    password_hash: bcrypt.hashSync('Aman@1972', 10),
    full_name: 'System Administrator',
    role: 'admin',
    phone: '+91 98000 00001',
    is_active: true
  },
  {
    id: 2,
    email: 'owner@spa24.online',
    password_hash: bcrypt.hashSync('OwnerPassword24!', 10),
    full_name: 'Priya Sharma (Owner)',
    role: 'business_owner',
    phone: '+91 98000 00002',
    is_active: true
  },
  {
    id: 3,
    email: 'user@spa24.online',
    password_hash: bcrypt.hashSync('UserPassword24!', 10),
    full_name: 'Ananya Deshmukh',
    role: 'user',
    phone: '+91 98000 00003',
    is_active: true
  },
  {
    id: 4,
    email: 'amansharmaetaw@gmail.com',
    password_hash: bcrypt.hashSync('Aman@1972', 10),
    full_name: 'THE AMAN SHARMA',
    role: 'admin',
    phone: '+91 80572 08341',
    is_active: true
  }
];
