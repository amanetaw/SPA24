import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  Settings,
  Database,
  FileCode,
  Globe,
  History,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Server,
  RefreshCw
} from 'lucide-react';

interface AdminSettingsPageProps {
  onNavigate: (path: string) => void;
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'system' | 'mysql' | 'audit'>('system');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const logs = await api.admin.getAuditLogs();
      setAuditLogs(logs);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audit logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchLogs();
    }
  }, [activeTab]);

  const mysqlSchemaCode = `-- ========================================================
-- SPA24 Enterprise Directory - Hostinger Production MySQL Schema
-- Generated for cPanel / phpMyAdmin Cloud Import
-- ========================================================

CREATE DATABASE IF NOT EXISTS \`spa24_production\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`spa24_production\`;

-- 1. Users & RBAC
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`email\` VARCHAR(191) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`name\` VARCHAR(191) NOT NULL,
  \`phone\` VARCHAR(50) NULL,
  \`role\` ENUM('admin', 'business_owner', 'user') NOT NULL DEFAULT 'user',
  \`is_verified\` TINYINT(1) NOT NULL DEFAULT 0,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_users_role\` (\`role\`)
) ENGINE=InnoDB;

-- 2. Cities & Geographic Centers
CREATE TABLE IF NOT EXISTS \`cities\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`slug\` VARCHAR(100) NOT NULL UNIQUE,
  \`state\` VARCHAR(100) NOT NULL,
  \`country\` VARCHAR(100) NOT NULL DEFAULT 'India',
  \`description\` TEXT NULL,
  \`seo_title\` VARCHAR(255) NULL,
  \`meta_description\` TEXT NULL,
  \`is_popular\` TINYINT(1) NOT NULL DEFAULT 0,
  \`is_published\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_cities_slug\` (\`slug\`)
) ENGINE=InnoDB;

-- 3. Localities / Areas
CREATE TABLE IF NOT EXISTS \`areas\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`city_id\` INT NOT NULL,
  \`name\` VARCHAR(100) NOT NULL,
  \`slug\` VARCHAR(100) NOT NULL,
  \`pincode\` VARCHAR(20) NULL,
  \`description\` TEXT NULL,
  \`seo_title\` VARCHAR(255) NULL,
  \`meta_description\` TEXT NULL,
  \`is_popular\` TINYINT(1) NOT NULL DEFAULT 0,
  \`is_published\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY \`uk_city_area_slug\` (\`city_id\`, \`slug\`),
  FOREIGN KEY (\`city_id\`) REFERENCES \`cities\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Taxonomy & Services
CREATE TABLE IF NOT EXISTS \`services\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(150) NOT NULL,
  \`slug\` VARCHAR(150) NOT NULL UNIQUE,
  \`category\` VARCHAR(100) NOT NULL,
  \`short_desc\` VARCHAR(255) NOT NULL,
  \`full_desc\` TEXT NULL,
  \`expectations\` TEXT NULL,
  \`provider_tips\` TEXT NULL,
  \`seo_title\` VARCHAR(255) NULL,
  \`meta_description\` TEXT NULL,
  \`is_popular\` TINYINT(1) NOT NULL DEFAULT 0,
  INDEX \`idx_services_category\` (\`category\`)
) ENGINE=InnoDB;

-- 5. Businesses / Spa Centers
CREATE TABLE IF NOT EXISTS \`businesses\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(191) NOT NULL,
  \`slug\` VARCHAR(191) NOT NULL UNIQUE,
  \`tagline\` VARCHAR(255) NULL,
  \`description\` TEXT NOT NULL,
  \`category\` VARCHAR(100) NOT NULL,
  \`phone\` VARCHAR(50) NOT NULL,
  \`secondary_phone\` VARCHAR(50) NULL,
  \`email\` VARCHAR(191) NULL,
  \`website\` VARCHAR(255) NULL,
  \`address\` VARCHAR(255) NOT NULL,
  \`area_id\` INT NOT NULL,
  \`city_id\` INT NOT NULL,
  \`pincode\` VARCHAR(20) NULL,
  \`latitude\` DECIMAL(10, 8) NULL,
  \`longitude\` DECIMAL(11, 8) NULL,
  \`google_maps_url\` TEXT NULL,
  \`cover_image\` VARCHAR(255) NULL,
  \`logo_image\` VARCHAR(255) NULL,
  \`price_range\` ENUM('$', '$$', '$$$', '$$$$') NOT NULL DEFAULT '$$',
  \`rating\` DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
  \`review_count\` INT NOT NULL DEFAULT 0,
  \`is_verified\` TINYINT(1) NOT NULL DEFAULT 0,
  \`is_featured\` TINYINT(1) NOT NULL DEFAULT 0,
  \`status\` ENUM('active', 'inactive', 'pending', 'draft') NOT NULL DEFAULT 'active',
  \`owner_id\` INT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (\`city_id\`) REFERENCES \`cities\`(\`id\`) ON DELETE RESTRICT,
  FOREIGN KEY (\`area_id\`) REFERENCES \`areas\`(\`id\`) ON DELETE RESTRICT,
  FOREIGN KEY (\`owner_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL,
  INDEX \`idx_biz_status_city\` (\`status\`, \`city_id\`)
) ENGINE=InnoDB;

-- 6. Business Services Mapping (with custom pricing)
CREATE TABLE IF NOT EXISTS \`business_services\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`business_id\` INT NOT NULL,
  \`service_id\` INT NOT NULL,
  \`price_inr\` DECIMAL(10, 2) NULL,
  \`duration_min\` INT NULL,
  \`is_highlighted\` TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY \`uk_biz_svc\` (\`business_id\`, \`service_id\`),
  FOREIGN KEY (\`business_id\`) REFERENCES \`businesses\`(\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`service_id\`) REFERENCES \`services\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Business Operating Hours
CREATE TABLE IF NOT EXISTS \`business_hours\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`business_id\` INT NOT NULL,
  \`day_of_week\` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  \`open_time\` VARCHAR(10) NULL,
  \`close_time\` VARCHAR(10) NULL,
  \`is_closed\` TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY \`uk_biz_day\` (\`business_id\`, \`day_of_week\`),
  FOREIGN KEY (\`business_id\`) REFERENCES \`businesses\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Business Photo Gallery
CREATE TABLE IF NOT EXISTS \`business_photos\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`business_id\` INT NOT NULL,
  \`url\` VARCHAR(500) NOT NULL,
  \`caption\` VARCHAR(255) NULL,
  \`is_primary\` TINYINT(1) NOT NULL DEFAULT 0,
  \`display_order\` INT NOT NULL DEFAULT 0,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`business_id\`) REFERENCES \`businesses\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Blog & Articles
CREATE TABLE IF NOT EXISTS \`blog_posts\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`title\` VARCHAR(255) NOT NULL,
  \`slug\` VARCHAR(255) NOT NULL UNIQUE,
  \`excerpt\` TEXT NOT NULL,
  \`content\` LONGTEXT NOT NULL,
  \`featured_image\` VARCHAR(500) NULL,
  \`author\` VARCHAR(100) NOT NULL DEFAULT 'SPA24 Editorial Team',
  \`category_id\` INT NOT NULL DEFAULT 1,
  \`seo_title\` VARCHAR(255) NULL,
  \`meta_description\` TEXT NULL,
  \`status\` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published',
  \`published_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_blog_status\` (\`status\`, \`published_at\`)
) ENGINE=InnoDB;

-- 10. Audit Logs
CREATE TABLE IF NOT EXISTS \`audit_logs\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`action\` VARCHAR(100) NOT NULL,
  \`entity\` VARCHAR(100) NOT NULL,
  \`entity_id\` INT NOT NULL,
  \`user_id\` INT NULL,
  \`user_email\` VARCHAR(191) NULL,
  \`details\` TEXT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mysqlSchemaCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const downloadSqlFile = () => {
    const blob = new Blob([mysqlSchemaCode], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spa24_hostinger_mysql_schema.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System & Database Settings</h1>
          <p className="text-sm text-slate-400 mt-1">
            Production deployment configs, MySQL schema exporter, XML sitemap verification, and audit trails
          </p>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'system'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>System & Sitemap</span>
        </button>

        <button
          onClick={() => setActiveTab('mysql')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'mysql'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Hostinger MySQL Schema</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>CMS Audit Logs</span>
        </button>
      </div>

      {/* Tab: System & Sitemap */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>XML Sitemap & Canonical Robots</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              The dynamic sitemap generates automated XML nodes for all published cities, sub-localities, treatment services, and live blog articles for immediate indexing in Google Search Console.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-2">
                <div className="font-semibold text-xs text-white">Dynamic XML Sitemap</div>
                <div className="text-[11px] font-mono text-slate-400">/api/sitemap.xml</div>
                <a
                  href="/api/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-xs text-amber-400 hover:text-amber-300 font-semibold underline pt-1"
                >
                  View Generated XML Feed →
                </a>
              </div>

              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-2">
                <div className="font-semibold text-xs text-white">Robots.txt Directive</div>
                <div className="text-[11px] font-mono text-slate-400">/robots.txt</div>
                <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Configured to allow public crawlers</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-400" />
              <span>Runtime Engine Specifications</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <div className="text-slate-400">Environment Mode</div>
                <div className="text-white font-semibold text-sm mt-0.5">Production Ready</div>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <div className="text-slate-400">Active Persistence Engine</div>
                <div className="text-white font-semibold text-sm mt-0.5">JSON Master DB & MySQL Compatible</div>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <div className="text-slate-400">Security / Auth Shield</div>
                <div className="text-white font-semibold text-sm mt-0.5">JWT with Role-Based Guard</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Hostinger MySQL Schema */}
      {activeTab === 'mysql' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>Hostinger cPanel MySQL Migration DDL</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete DDL statement script to import into phpMyAdmin on Hostinger VPS or Cloud Hosting
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
                </button>
                <button
                  onClick={downloadSqlFile}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .sql</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto max-h-[450px] leading-relaxed select-all">
                {mysqlSchemaCode}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Administrator Activity Trail</h2>
            <button
              onClick={fetchLogs}
              disabled={loadingLogs}
              className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
              <span>Refresh Trail</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700/80">
                  <tr>
                    <th className="px-5 py-3.5">Action</th>
                    <th className="px-4 py-3.5">Entity</th>
                    <th className="px-4 py-3.5">Target ID</th>
                    <th className="px-4 py-3.5">Admin Email</th>
                    <th className="px-5 py-3.5 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loadingLogs ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                        <div className="flex justify-center items-center gap-2">
                          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                          <span>Loading audit trail...</span>
                        </div>
                      </td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                        No audit events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log, i) => (
                      <tr key={log.id || i} className="hover:bg-slate-800/50 transition-colors text-xs">
                        <td className="px-5 py-3.5 font-semibold text-amber-400">
                          {log.action}
                        </td>
                        <td className="px-4 py-3.5 text-slate-300">
                          {log.entity}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-400">
                          #{log.entity_id}
                        </td>
                        <td className="px-4 py-3.5 text-slate-300 font-mono">
                          {log.user_email || 'System'}
                        </td>
                        <td className="px-5 py-3.5 text-right text-slate-400">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
