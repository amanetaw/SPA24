import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  MapPin,
  Sparkles,
  BookOpen,
  ShieldAlert,
  FileCheck,
  AlertTriangle,
  FileEdit,
  Users,
  Image as ImageIcon,
  Settings,
  LogOut,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Shield,
  Lock,
  ArrowLeft
} from 'lucide-react';

interface AdminLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentPath,
  onNavigate,
  children
}) => {
  const { user, logout, login } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Counts for moderation badges
  const [pendingCounts, setPendingCounts] = useState<{
    submissions: number;
    claims: number;
    reports: number;
    corrections: number;
  }>({
    submissions: 0,
    claims: 0,
    reports: 0,
    corrections: 0
  });

  useEffect(() => {
    if (user && user.role === 'admin') {
      api.admin.getStats()
        .then(stats => {
          setPendingCounts({
            submissions: stats.pendingSubmissions || 0,
            claims: stats.pendingClaims || 0,
            reports: stats.pendingReports || 0,
            corrections: 0
          });
        })
        .catch(() => {});
    }
  }, [user]);

  // Handle demo admin quick login
  const handleDemoAdminLogin = async () => {
    setQuickLoginLoading(true);
    setLoginError('');
    try {
      await login('admin@spa24.online', 'Aman@1972');
    } catch (err: any) {
      setLoginError(err.message || 'Failed to authenticate admin');
    } finally {
      setQuickLoginLoading(false);
    }
  };

  const navSections: NavSection[] = [
    {
      items: [
        {
          label: 'Dashboard',
          path: '/admin',
          icon: <LayoutDashboard className="w-4 h-4" />
        }
      ]
    },
    {
      title: 'BUSINESSES',
      items: [
        {
          label: 'All Businesses',
          path: '/admin/businesses',
          icon: <Building2 className="w-4 h-4" />
        },
        {
          label: 'Add Business',
          path: '/admin/businesses/new',
          icon: <PlusCircle className="w-4 h-4" />
        }
      ]
    },
    {
      title: 'LOCATIONS',
      items: [
        {
          label: 'Cities',
          path: '/admin/cities',
          icon: <MapPin className="w-4 h-4" />
        },
        {
          label: 'Add City',
          path: '/admin/cities/new',
          icon: <PlusCircle className="w-4 h-4" />
        },
        {
          label: 'Areas',
          path: '/admin/areas',
          icon: <MapPin className="w-4 h-4" />
        },
        {
          label: 'Add Area',
          path: '/admin/areas/new',
          icon: <PlusCircle className="w-4 h-4" />
        }
      ]
    },
    {
      title: 'SERVICES',
      items: [
        {
          label: 'All Services',
          path: '/admin/services',
          icon: <Sparkles className="w-4 h-4" />
        },
        {
          label: 'Add Service',
          path: '/admin/services/new',
          icon: <PlusCircle className="w-4 h-4" />
        }
      ]
    },
    {
      title: 'CONTENT',
      items: [
        {
          label: 'Blog Posts',
          path: '/admin/blog',
          icon: <BookOpen className="w-4 h-4" />
        },
        {
          label: 'Add Blog Post',
          path: '/admin/blog/new',
          icon: <PlusCircle className="w-4 h-4" />
        }
      ]
    },
    {
      title: 'MODERATION',
      items: [
        {
          label: 'Submissions',
          path: '/admin/submissions',
          icon: <FileCheck className="w-4 h-4" />,
          badge: pendingCounts.submissions
        },
        {
          label: 'Claims',
          path: '/admin/claims',
          icon: <ShieldAlert className="w-4 h-4" />,
          badge: pendingCounts.claims
        },
        {
          label: 'Reports',
          path: '/admin/reports',
          icon: <AlertTriangle className="w-4 h-4" />,
          badge: pendingCounts.reports
        },
        {
          label: 'Corrections',
          path: '/admin/corrections',
          icon: <FileEdit className="w-4 h-4" />
        }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        {
          label: 'Users',
          path: '/admin/users',
          icon: <Users className="w-4 h-4" />
        },
        {
          label: 'Photos',
          path: '/admin/photos',
          icon: <ImageIcon className="w-4 h-4" />
        },
        {
          label: 'Settings',
          path: '/admin/settings',
          icon: <Settings className="w-4 h-4" />
        }
      ]
    }
  ];

  const isCurrentRoute = (path: string) => {
    if (path === '/admin') {
      return currentPath === '/admin';
    }
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  // If user is not an admin, render the Admin Access Gate
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center px-4 py-12">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl mx-auto mb-6">
            <Shield className="w-8 h-8 text-amber-400" />
          </div>

          <h1 className="text-2xl font-bold text-center text-white mb-2">
            SPA24 Admin CMS Access
          </h1>
          <p className="text-slate-400 text-center text-sm mb-6 leading-relaxed">
            This protected zone requires administrative privileges to manage directory listings, locations, services, and content.
          </p>

          {loginError && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 text-red-300 text-xs rounded-lg">
              {loginError}
            </div>
          )}

          <div className="space-y-4">
            <button
              id="admin-quick-login-btn"
              onClick={handleDemoAdminLogin}
              disabled={quickLoginLoading}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {quickLoginLoading ? (
                <span>Authenticating Administrator...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authenticate as System Admin</span>
                </>
              )}
            </button>

            <button
              id="admin-back-to-site-btn"
              onClick={() => onNavigate('/')}
              className="w-full py-3 px-4 bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Public Directory</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700/60 text-center">
            <p className="text-xs text-slate-400 font-mono">
              Root Account: admin@spa24.online
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased">
      {/* Mobile Topbar */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-sm">
            S24
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
              <span>Admin CMS</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-medium">
                PROD
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static flex flex-col ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header / Brand */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
              <Shield className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="font-bold text-base text-white tracking-tight flex items-center gap-2">
                <span>SPA24 CMS</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-1.5 py-0.5 rounded border border-emerald-500/30">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">Directory Control Centre</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {section.title && (
                <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                  {section.title}
                </div>
              )}
              {section.items.map(item => {
                const active = isCurrentRoute(item.path);
                return (
                  <button
                    key={item.path}
                    id={`admin-nav-${item.path.replace(/\//g, '-').replace(/^-/, '')}`}
                    onClick={() => {
                      onNavigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left ${
                      active
                        ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={active ? 'text-amber-400' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 ? (
                      <span className="bg-amber-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    ) : (
                      active && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 space-y-3">
          <button
            id="admin-view-live-site-btn"
            onClick={() => onNavigate('/')}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>View Public Directory</span>
          </button>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
            <div className="truncate pr-2">
              <p className="font-semibold text-slate-200 truncate">{user.full_name || 'System Admin'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Top Navbar */}
        <header className="hidden md:flex bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 py-3.5 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-sm text-slate-400 font-mono">
            <span>Admin</span>
            <span>/</span>
            <span className="text-amber-400 font-semibold">
              {currentPath.replace('/admin', '') || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/admin/businesses/new')}
              className="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-amber-500/20 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Business</span>
            </button>
            <button
              onClick={() => onNavigate('/')}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Live Website</span>
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
