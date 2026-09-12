import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminOverviewPage } from './AdminOverviewPage';
import { AdminBusinessesPage } from './AdminBusinessesPage';
import { AdminBusinessFormPage } from './AdminBusinessFormPage';
import { AdminCitiesPage } from './AdminCitiesPage';
import { AdminCityFormPage } from './AdminCityFormPage';
import { AdminAreasPage } from './AdminAreasPage';
import { AdminAreaFormPage } from './AdminAreaFormPage';
import { AdminServicesPage } from './AdminServicesPage';
import { AdminServiceFormPage } from './AdminServiceFormPage';
import { AdminBlogListPage } from './AdminBlogListPage';
import { AdminBlogFormPage } from './AdminBlogFormPage';
import { AdminSubmissionsPage } from './AdminSubmissionsPage';
import { AdminClaimsPage } from './AdminClaimsPage';
import { AdminReportsPage } from './AdminReportsPage';
import { AdminCorrectionsPage } from './AdminCorrectionsPage';
import { AdminUsersPage } from './AdminUsersPage';
import { AdminPhotosPage } from './AdminPhotosPage';
import { AdminSettingsPage } from './AdminSettingsPage';

interface AdminCMSPageProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const AdminCMSPage: React.FC<AdminCMSPageProps> = ({ currentPath, onNavigate }) => {
  // Routing logic for Admin Sub-routes
  const renderContent = () => {
    // 1. Businesses
    if (currentPath === '/admin/businesses/new') {
      return <AdminBusinessFormPage onNavigate={onNavigate} />;
    }
    const editBizMatch = currentPath.match(/^\/admin\/businesses\/(\d+)\/edit$/);
    if (editBizMatch) {
      return <AdminBusinessFormPage businessId={Number(editBizMatch[1])} onNavigate={onNavigate} />;
    }
    if (currentPath === '/admin/businesses') {
      return <AdminBusinessesPage onNavigate={onNavigate} />;
    }

    // 2. Cities
    if (currentPath === '/admin/cities/new') {
      return <AdminCityFormPage onNavigate={onNavigate} />;
    }
    const editCityMatch = currentPath.match(/^\/admin\/cities\/(\d+)\/edit$/);
    if (editCityMatch) {
      return <AdminCityFormPage cityId={Number(editCityMatch[1])} onNavigate={onNavigate} />;
    }
    if (currentPath === '/admin/cities') {
      return <AdminCitiesPage onNavigate={onNavigate} />;
    }

    // 3. Areas
    if (currentPath === '/admin/areas/new') {
      return <AdminAreaFormPage onNavigate={onNavigate} />;
    }
    const editAreaMatch = currentPath.match(/^\/admin\/areas\/(\d+)\/edit$/);
    if (editAreaMatch) {
      return <AdminAreaFormPage areaId={Number(editAreaMatch[1])} onNavigate={onNavigate} />;
    }
    if (currentPath === '/admin/areas') {
      return <AdminAreasPage onNavigate={onNavigate} />;
    }

    // 4. Services
    if (currentPath === '/admin/services/new') {
      return <AdminServiceFormPage onNavigate={onNavigate} />;
    }
    const editServiceMatch = currentPath.match(/^\/admin\/services\/(\d+)\/edit$/);
    if (editServiceMatch) {
      return <AdminServiceFormPage serviceId={Number(editServiceMatch[1])} onNavigate={onNavigate} />;
    }
    if (currentPath === '/admin/services') {
      return <AdminServicesPage onNavigate={onNavigate} />;
    }

    // 5. Blog
    if (currentPath === '/admin/blog/new') {
      return <AdminBlogFormPage onNavigate={onNavigate} />;
    }
    const editBlogMatch = currentPath.match(/^\/admin\/blog\/(\d+)\/edit$/);
    if (editBlogMatch) {
      return <AdminBlogFormPage postId={Number(editBlogMatch[1])} onNavigate={onNavigate} />;
    }
    if (currentPath === '/admin/blog') {
      return <AdminBlogListPage onNavigate={onNavigate} />;
    }

    // 6. Moderation
    if (currentPath === '/admin/submissions') {
      return <AdminSubmissionsPage onNavigate={onNavigate} />;
    }
    if (currentPath === '/admin/claims') {
      return <AdminClaimsPage onNavigate={onNavigate} />;
    }
    if (currentPath === '/admin/reports') {
      return <AdminReportsPage onNavigate={onNavigate} />;
    }
    if (currentPath === '/admin/corrections') {
      return <AdminCorrectionsPage onNavigate={onNavigate} />;
    }

    // 7. Users
    if (currentPath === '/admin/users') {
      return <AdminUsersPage onNavigate={onNavigate} />;
    }

    // 8. Photos
    if (currentPath === '/admin/photos') {
      return <AdminPhotosPage onNavigate={onNavigate} />;
    }

    // 9. Settings
    if (currentPath === '/admin/settings') {
      return <AdminSettingsPage onNavigate={onNavigate} />;
    }

    // Default: Dashboard / Overview
    return <AdminOverviewPage onNavigate={onNavigate} />;
  };

  return (
    <AdminLayout currentPath={currentPath} onNavigate={onNavigate}>
      {renderContent()}
    </AdminLayout>
  );
};
