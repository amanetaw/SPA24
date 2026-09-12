import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { DirectoryPage } from './pages/DirectoryPage';
import { CityPage } from './pages/CityPage';
import { AreaPage } from './pages/AreaPage';
import { BusinessDetailPage } from './pages/BusinessDetailPage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { CitiesPage } from './pages/CitiesPage';
import { AreasPage } from './pages/AreasPage';
import { BlogListPage } from './pages/BlogListPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { ListYourSpaPage } from './pages/ListYourSpaPage';
import { ClaimListingPage } from './pages/ClaimListingPage';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminCMSPage } from './pages/admin/AdminCMSPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { VerificationGuidelinesPage } from './pages/VerificationGuidelinesPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setSearchParams(new URLSearchParams(window.location.search));
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (path: string) => {
    const [pathname, search] = path.split('?');
    window.history.pushState({}, '', path);
    setCurrentPath(pathname);
    setSearchParams(new URLSearchParams(search || ''));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderRoute = () => {
    // 1. Home
    if (currentPath === '/' || currentPath === '') {
      return <HomePage onNavigate={handleNavigate} />;
    }

    // 2. Directory and deep hierarchy (/spa, /spa/:city, /spa/:city/:area, /spa/:city/:area/:business)
    if (currentPath.startsWith('/spa')) {
      const parts = currentPath.split('/').filter(Boolean); // ['spa', 'mumbai', 'bandra-west', 'lotus-wellness']

      if (parts.length === 1) {
        return <DirectoryPage onNavigate={handleNavigate} searchParams={searchParams} />;
      }
      if (parts.length === 2) {
        return <CityPage citySlug={parts[1]} onNavigate={handleNavigate} />;
      }
      if (parts.length === 3) {
        return <AreaPage citySlug={parts[1]} areaSlug={parts[2]} onNavigate={handleNavigate} />;
      }
      if (parts.length >= 4) {
        return (
          <BusinessDetailPage
            citySlug={parts[1]}
            areaSlug={parts[2]}
            businessSlug={parts[3]}
            onNavigate={handleNavigate}
          />
        );
      }
    }

    // 3. Services (/services, /services/:service)
    if (currentPath.startsWith('/services')) {
      const parts = currentPath.split('/').filter(Boolean);
      if (parts.length === 1) {
        return <ServicesPage onNavigate={handleNavigate} />;
      }
      if (parts.length >= 2) {
        return <ServiceDetailPage serviceSlug={parts[1]} onNavigate={handleNavigate} />;
      }
    }

    // 4. Cities and Areas Index
    if (currentPath === '/cities') {
      return <CitiesPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/areas') {
      return <AreasPage onNavigate={handleNavigate} />;
    }

    // 5. Blog & Editorial (/blog, /blog/:slug)
    if (currentPath.startsWith('/blog')) {
      const parts = currentPath.split('/').filter(Boolean);
      if (parts.length === 1) {
        return <BlogListPage onNavigate={handleNavigate} />;
      }
      if (parts.length >= 2) {
        return <BlogPostPage articleSlug={parts[1]} onNavigate={handleNavigate} />;
      }
    }

    // 6. Submissions & Claims
    if (currentPath === '/list-your-spa') {
      return <ListYourSpaPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/claim-listing') {
      const bizId = searchParams.get('business_id') ? Number(searchParams.get('business_id')) : null;
      return <ClaimListingPage onNavigate={handleNavigate} preselectedBusinessId={bizId} />;
    }

    // 7. Dashboards
    if (currentPath === '/dashboard') {
      return <OwnerDashboardPage onNavigate={handleNavigate} />;
    }
    if (currentPath.startsWith('/admin')) {
      return <AdminCMSPage currentPath={currentPath} onNavigate={handleNavigate} />;
    }

    // 8. Auth
    if (currentPath === '/login') {
      return <LoginPage onNavigate={handleNavigate} redirectPath={searchParams.get('redirect') || '/dashboard'} />;
    }
    if (currentPath === '/register') {
      return <RegisterPage onNavigate={handleNavigate} redirectPath={searchParams.get('redirect') || '/dashboard'} />;
    }

    // 9. Static & Legal
    if (currentPath === '/about') {
      return <AboutPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/contact') {
      return <ContactPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/privacy-policy') {
      return <PrivacyPolicyPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/terms') {
      return <TermsPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/verification-guidelines') {
      return <VerificationGuidelinesPage onNavigate={handleNavigate} />;
    }

    // Fallback: 404
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-3xl font-extrabold text-stone-900 font-display">404 - Page Not Found</h1>
        <p className="text-xs text-stone-600">
          The requested page could not be located in the SPA24 directory.
        </p>
        <button
          onClick={() => handleNavigate('/')}
          className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-semibold"
        >
          Return to Homepage
        </button>
      </div>
    );
  };

  const isAdminRoute = currentPath.startsWith('/admin');

  return (
    <AuthProvider>
      <ErrorBoundary>
        {isAdminRoute ? (
          renderRoute()
        ) : (
          <div className="min-h-screen flex flex-col bg-stone-50 font-sans text-stone-900 antialiased selection:bg-emerald-200 selection:text-emerald-900">
            <Header onNavigate={handleNavigate} currentPath={currentPath} />
            <main className="flex-1 pb-16">
              {renderRoute()}
            </main>
            <Footer onNavigate={handleNavigate} />
          </div>
        )}
      </ErrorBoundary>
    </AuthProvider>
  );
}
