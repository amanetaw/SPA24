import React, { useState } from 'react';
import { Sparkles, Search, MapPin, Menu, X, Shield, User as UserIcon, PlusCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onNavigate: (path: string) => void;
  currentPath: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPath }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      onNavigate(`/spa?q=${encodeURIComponent(quickSearch.trim())}`);
      setQuickSearch('');
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Browse Spas', path: '/spa' },
    { label: 'Services', path: '/services' },
    { label: 'Cities', path: '/cities' },
    { label: 'Areas', path: '/areas' },
    { label: 'Blog', path: '/blog' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              id="header-brand-logo"
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2 text-left group focus:outline-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                <Sparkles className="w-5 h-5 text-emerald-100" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-stone-900 font-display">SPA24</span>
                <span className="hidden sm:block text-[11px] font-medium tracking-wider uppercase text-emerald-700">Wellness Directory</span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((item) => {
                const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`);
                return (
                  <button
                    key={item.path}
                    id={`nav-link-${item.path.replace(/[^a-z0-9]/gi, '-')}`}
                    onClick={() => onNavigate(item.path)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-emerald-800 bg-emerald-50 font-semibold'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Search & Actions */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                id="header-quick-search-input"
                type="text"
                placeholder="Search spa, city, service..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-100 border border-stone-200 rounded-full focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2 pointer-events-none" />
            </form>
          </div>

          {/* User / CTA Section */}
          <div className="flex items-center gap-3">
            {/* Admin CMS Direct Entry for Admins */}
            {user?.role === 'admin' && (
              <button
                id="header-admin-cms-cta"
                onClick={() => onNavigate('/admin')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-300 bg-slate-900 border border-amber-500/40 hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin CMS</span>
              </button>
            )}

            {/* List Your Spa CTA */}
            <button
              id="header-list-spa-cta"
              onClick={() => onNavigate('/list-your-spa')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>List Your Spa</span>
            </button>

            {/* Auth Dropdown or Login Button */}
            {user ? (
              <div className="relative">
                <button
                  id="user-menu-button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg text-stone-700 hover:bg-stone-100 transition-colors focus:outline-hidden"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden xl:inline text-xs font-medium text-stone-700 max-w-[100px] truncate">
                    {user.full_name}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-semibold text-stone-900 truncate">{user.full_name}</p>
                      <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded-sm uppercase tracking-wide bg-stone-100 text-stone-600">
                        Role: {user.role.replace('_', ' ')}
                      </span>
                    </div>

                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          onNavigate('/admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2"
                      >
                        <Shield className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    {(user.role === 'business_owner' || user.role === 'admin') && (
                      <button
                        onClick={() => {
                          onNavigate('/dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-stone-500" />
                        <span>Owner Dashboard</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onNavigate('/claim-listing');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50"
                    >
                      Claim a Listing
                    </button>

                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="header-login-button"
                  onClick={() => onNavigate('/login')}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  Sign In
                </button>
                <button
                  id="header-register-button"
                  onClick={() => onNavigate('/register')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
                >
                  Join
                </button>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 py-3 space-y-2">
            <form onSubmit={handleSearchSubmit} className="relative w-full mb-3 px-1">
              <input
                type="text"
                placeholder="Search spas, cities, services..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-stone-100 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
            </form>

            <div className="grid grid-cols-2 gap-1 px-1">
              {navLinks.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    onNavigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left px-3 py-2 rounded-lg text-sm font-medium ${
                    currentPath === item.path ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-100 flex flex-col gap-2 px-1">
              {user?.role === 'admin' && (
                <button
                  id="mobile-admin-cms-cta"
                  onClick={() => {
                    onNavigate('/admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 text-center text-xs font-bold text-amber-300 bg-slate-900 rounded-lg border border-amber-500/40 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Admin CMS Dashboard</span>
                </button>
              )}
              <button
                onClick={() => {
                  onNavigate('/list-your-spa');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 text-center text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200"
              >
                + List Your Spa
              </button>
              <button
                onClick={() => {
                  onNavigate('/claim-listing');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 text-center text-xs font-medium text-stone-600 bg-stone-100 rounded-lg"
              >
                Claim Existing Listing
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
