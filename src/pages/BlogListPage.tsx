import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { BlogPost } from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { useSEO } from '../hooks/useSEO';
import { Calendar, User, Clock, ArrowRight, BookOpen } from 'lucide-react';

interface BlogListPageProps {
  onNavigate: (path: string) => void;
}

export const BlogListPage: React.FC<BlogListPageProps> = ({ onNavigate }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Wellness Journal & Spa Guides | SPA24 Editorial',
    description: 'Read expert advice on massage modalities, holistic etiquette, pre-session preparation, and therapeutic benefits.',
    canonical: 'https://spa24.online/blog'
  });

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await api.blog.getAll();
        setPosts(data);
      } catch (err) {
        console.error('Error fetching blog articles:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Breadcrumbs items={[{ label: 'Blog & Editorial' }]} onNavigate={onNavigate} />

      <div className="max-w-3xl space-y-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <BookOpen className="w-3.5 h-3.5" />
          <span>SPA24 Editorial Desk</span>
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-display">
          Wellness Journal &amp; Therapy Guides
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          In-depth articles covering evidence-based benefits of bodywork, holistic health protocols, and guidance on choosing licensed practitioners.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 bg-stone-100 rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              onClick={() => onNavigate(`/blog/${post.slug}`)}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="h-48 w-full overflow-hidden bg-stone-100">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      <span>{new Date(post.published_at).toLocaleDateString()}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-stone-400" />
                      <span>{post.author}</span>
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors font-display line-clamp-2">
                    {post.title}
                  </h2>

                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between text-xs font-semibold text-emerald-800">
                <span>Read Full Article</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
