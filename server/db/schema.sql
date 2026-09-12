-- =================================================================
-- SPA24 (spa24.online) - Production MySQL Database Schema
-- Normalized relational schema for spa & wellness directory
-- =================================================================

-- 1. USERS & ROLES
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  role ENUM('user', 'business_owner', 'editor', 'admin') NOT NULL DEFAULT 'user',
  phone VARCHAR(50) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. CITIES
CREATE TABLE IF NOT EXISTS cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'India',
  description TEXT NULL,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cities_slug (slug),
  INDEX idx_cities_state (state),
  INDEX idx_cities_popular (is_popular)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. AREAS
CREATE TABLE IF NOT EXISTS areas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  pincode VARCHAR(20) NULL,
  description TEXT NULL,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_city_area_slug (city_id, slug),
  INDEX idx_areas_slug (slug),
  INDEX idx_areas_city_id (city_id),
  CONSTRAINT fk_areas_city FOREIGN KEY (city_id) REFERENCES cities (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. SERVICES
CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL DEFAULT 'Massage Therapy',
  short_desc VARCHAR(255) NOT NULL,
  full_desc TEXT NOT NULL,
  expectations TEXT NOT NULL,
  provider_tips TEXT NOT NULL,
  icon VARCHAR(50) NULL,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_services_slug (slug),
  INDEX idx_services_popular (is_popular)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. BUSINESSES
CREATE TABLE IF NOT EXISTS businesses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'Day Spa & Wellness',
  description TEXT NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(191) NULL,
  website VARCHAR(255) NULL,
  booking_url VARCHAR(255) NULL,
  address VARCHAR(255) NOT NULL,
  city_id INT NOT NULL,
  area_id INT NOT NULL,
  google_maps_url VARCHAR(500) NULL,
  status ENUM('pending', 'published', 'suspended', 'archived') NOT NULL DEFAULT 'published',
  verification_status ENUM('unverified', 'verified', 'claimed') NOT NULL DEFAULT 'unverified',
  owner_id INT NULL,
  view_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_city_area_biz_slug (city_id, area_id, slug),
  INDEX idx_businesses_slug (slug),
  INDEX idx_businesses_city_id (city_id),
  INDEX idx_businesses_area_id (area_id),
  INDEX idx_businesses_status (status),
  INDEX idx_businesses_name (name),
  INDEX idx_businesses_phone (phone),
  CONSTRAINT fk_businesses_city FOREIGN KEY (city_id) REFERENCES cities (id) ON DELETE RESTRICT,
  CONSTRAINT fk_businesses_area FOREIGN KEY (area_id) REFERENCES areas (id) ON DELETE RESTRICT,
  CONSTRAINT fk_businesses_owner FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BUSINESS_SERVICES (Mapping Table)
CREATE TABLE IF NOT EXISTS business_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  business_id INT NOT NULL,
  service_id INT NOT NULL,
  price_from DECIMAL(10,2) NULL,
  duration_minutes INT NULL,
  notes VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_biz_service (business_id, service_id),
  INDEX idx_biz_services_biz (business_id),
  INDEX idx_biz_services_svc (service_id),
  CONSTRAINT fk_biz_svc_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE,
  CONSTRAINT fk_biz_svc_service FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. BUSINESS_PHOTOS
CREATE TABLE IF NOT EXISTS business_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  business_id INT NOT NULL,
  url VARCHAR(500) NOT NULL,
  caption VARCHAR(200) NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_photos_biz (business_id),
  CONSTRAINT fk_photos_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. BUSINESS_HOURS
CREATE TABLE IF NOT EXISTS business_hours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  business_id INT NOT NULL,
  day_of_week TINYINT NOT NULL COMMENT '0=Sunday, 1=Monday ... 6=Saturday',
  open_time VARCHAR(10) NULL COMMENT 'HH:MM format, e.g. 09:00',
  close_time VARCHAR(10) NULL COMMENT 'HH:MM format, e.g. 21:00',
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE KEY uq_biz_day (business_id, day_of_week),
  INDEX idx_hours_biz (business_id),
  CONSTRAINT fk_hours_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. SUBMISSIONS (List Your Spa)
CREATE TABLE IF NOT EXISTS submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  business_name VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(191) NOT NULL,
  website VARCHAR(255) NULL,
  booking_url VARCHAR(255) NULL,
  full_address VARCHAR(255) NOT NULL,
  city_name VARCHAR(100) NOT NULL,
  area_name VARCHAR(120) NOT NULL,
  google_maps_url VARCHAR(500) NULL,
  service_ids JSON NULL,
  opening_hours_json JSON NULL,
  photos_json JSON NULL,
  social_links_json JSON NULL,
  owner_name VARCHAR(150) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  rejection_reason TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  reviewed_by INT NULL,
  INDEX idx_submissions_status (status),
  INDEX idx_submissions_email (email),
  INDEX idx_submissions_phone (phone),
  CONSTRAINT fk_submissions_reviewer FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. CLAIMS
CREATE TABLE IF NOT EXISTS claims (
  id INT AUTO_INCREMENT PRIMARY KEY,
  business_id INT NOT NULL,
  user_id INT NOT NULL,
  applicant_name VARCHAR(150) NOT NULL,
  applicant_email VARCHAR(191) NOT NULL,
  applicant_phone VARCHAR(50) NOT NULL,
  applicant_role VARCHAR(100) NOT NULL,
  verification_method ENUM('email', 'website_token', 'phone', 'manual_admin') NOT NULL DEFAULT 'email',
  verification_token VARCHAR(100) NULL,
  proof_notes TEXT NULL,
  status ENUM('pending', 'under_review', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
  rejection_reason TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  reviewed_by INT NULL,
  INDEX idx_claims_status (status),
  INDEX idx_claims_biz (business_id),
  INDEX idx_claims_user (user_id),
  CONSTRAINT fk_claims_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE,
  CONSTRAINT fk_claims_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_claims_reviewer FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. CLAIM_VERIFICATIONS (Audit & token checks)
CREATE TABLE IF NOT EXISTS claim_verifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  claim_id INT NOT NULL,
  step_name VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  log_message TEXT NULL,
  verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_claim_verif_claim (claim_id),
  CONSTRAINT fk_claim_verif_claim FOREIGN KEY (claim_id) REFERENCES claims (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. BLOG CATEGORIES
CREATE TABLE IF NOT EXISTS blog_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. BLOG POSTS
CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content MEDIUMTEXT NOT NULL,
  featured_image VARCHAR(500) NULL,
  author VARCHAR(100) NOT NULL DEFAULT 'Editorial Team',
  category_id INT NOT NULL,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'published',
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_blog_posts_slug (slug),
  INDEX idx_blog_posts_status (status),
  CONSTRAINT fk_blog_category FOREIGN KEY (category_id) REFERENCES blog_categories (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. REPORTS (Listing inaccuracies or issues)
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  business_id INT NOT NULL,
  report_type ENUM('incorrect_info', 'permanently_closed', 'wrong_phone', 'wrong_location', 'other') NOT NULL,
  message TEXT NOT NULL,
  reporter_email VARCHAR(191) NULL,
  status ENUM('pending', 'resolved', 'dismissed') NOT NULL DEFAULT 'pending',
  admin_notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reports_biz (business_id),
  INDEX idx_reports_status (status),
  CONSTRAINT fk_reports_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. CORRECTIONS (Proposed listing edits from users/owners)
CREATE TABLE IF NOT EXISTS corrections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  business_id INT NOT NULL,
  user_id INT NULL,
  proposed_data_json JSON NOT NULL,
  notes TEXT NULL,
  status ENUM('pending', 'applied', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  INDEX idx_corrections_biz (business_id),
  INDEX idx_corrections_status (status),
  CONSTRAINT fk_corrections_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('new', 'read', 'replied') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id INT NULL,
  details_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_action (action),
  INDEX idx_audit_entity (entity_type, entity_id),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
