import React from 'react';
import { Sparkles, ShieldCheck, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-emerald-200" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-display">SPA24</span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed max-w-sm">
              SPA24 (spa24.online) is an independent, verified directory of licensed spa and wellness facilities. We help individuals locate genuine massage therapy, holistic healing, and relaxation centers with transparent business information.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Strict editorial review. Zero fake reviews or auto-generated profiles.</span>
            </div>
          </div>

          {/* Directory Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Explore Directory</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('/spa')} className="hover:text-emerald-400 transition-colors">
                  All Spas Directory
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/cities')} className="hover:text-emerald-400 transition-colors">
                  Browse by City
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/areas')} className="hover:text-emerald-400 transition-colors">
                  Browse by Area
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/services')} className="hover:text-emerald-400 transition-colors">
                  Wellness Services Guide
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/blog')} className="hover:text-emerald-400 transition-colors">
                  Wellness Journal &amp; Articles
                </button>
              </li>
            </ul>
          </div>

          {/* Popular Cities Quick Crawl */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Popular Locations</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('/spa/mumbai')} className="hover:text-emerald-400 transition-colors">
                  Spas in Mumbai
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/spa/bengaluru')} className="hover:text-emerald-400 transition-colors">
                  Spas in Bengaluru
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/spa/delhi')} className="hover:text-emerald-400 transition-colors">
                  Spas in Delhi NCR
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/spa/indore')} className="hover:text-emerald-400 transition-colors">
                  Spas in Indore
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/spa/goa')} className="hover:text-emerald-400 transition-colors">
                  Spas in Goa
                </button>
              </li>
            </ul>
          </div>

          {/* For Businesses & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Businesses &amp; Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('/list-your-spa')} className="hover:text-emerald-400 text-emerald-400 font-medium transition-colors">
                  + List Your Spa
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/claim-listing')} className="hover:text-emerald-400 transition-colors">
                  Claim Existing Listing
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-emerald-400 transition-colors">
                  About SPA24
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-emerald-400 transition-colors">
                  Contact Support
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/privacy-policy')} className="hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/terms')} className="hover:text-emerald-400 transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/admin')} className="hover:text-amber-400 text-stone-400 transition-colors flex items-center gap-1">
                  <span>Admin CMS Portal</span>
                  <span className="text-[9px] px-1 py-0.2 bg-amber-500/20 text-amber-400 rounded">Staff</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/disclaimer')} className="hover:text-emerald-400 transition-colors">
                  Medical Disclaimer
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} SPA24 (spa24.online). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="/robots.txt" target="_blank" rel="noreferrer" className="hover:underline">
              robots.txt
            </a>
            <span className="text-stone-700">•</span>
            <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="hover:underline">
              sitemap.xml
            </a>
            <span className="text-stone-700">•</span>
            <span>Non-Medical Directory</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
