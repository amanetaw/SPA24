import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { BlogPost, Service, City } from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { useSEO } from '../hooks/useSEO';
import { Calendar, User, Clock, Share2, Sparkles, Building2, ChevronRight, AlertCircle } from 'lucide-react';

interface BlogPostPageProps {
  articleSlug: string;
  onNavigate: (path: string) => void;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ articleSlug, onNavigate }) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      setError('');
      try {
        const data = await api.blog.getBySlug(articleSlug);
        setPost(data);
      } catch (err: any) {
        setError(err.message || 'Article could not be loaded.');
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [articleSlug]);

  const pTitle = post?.title || 'Editorial Article';

  useSEO({
    title: pTitle,
    description: post?.excerpt || 'Read the latest wellness and spa guidance on SPA24.',
    canonical: `https://spa24.online/blog/${articleSlug}`,
    ogType: 'article',
    schema: post ? {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt,
      image: post.featured_image,
      author: {
        '@type': 'Person',
        name: post.author
      },
      publisher: {
        '@type': 'Organization',
        name: 'SPA24',
        logo: {
          '@type': 'ImageObject',
          url: 'https://spa24.online/icon.png'
        }
      },
      datePublished: post.published_at,
      dateModified: post.updated_at
    } : undefined
  });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-6 bg-stone-200 rounded-sm w-48"></div>
        <div className="h-10 bg-stone-200 rounded-sm w-full"></div>
        <div className="h-72 bg-stone-100 rounded-2xl"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-stone-400 mx-auto" />
        <h2 className="text-xl font-bold text-stone-900 font-display">Article Not Found</h2>
        <p className="text-xs text-stone-600">{error || 'The requested article does not exist.'}</p>
        <button
          onClick={() => onNavigate('/blog')}
          className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold"
        >
          Return to Blog
        </button>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Blog', path: '/blog' },
          { label: post.title }
        ]}
        onNavigate={onNavigate}
      />

      {/* Article Header */}
      <header className="space-y-4">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight font-display">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-stone-200 text-xs text-stone-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-stone-800">
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span>By {post.author}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>{new Date(post.published_at).toLocaleDateString()}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>4 min read</span>
            </span>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Link Copied!' : 'Share Article'}</span>
          </button>
        </div>
      </header>

      {/* Featured Banner */}
      <div className="rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 h-64 sm:h-96 shadow-xs">
        <img
          src={post.featured_image}
          alt={post.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Lead Excerpt */}
      <div className="p-4 sm:p-5 bg-emerald-50/60 border-l-4 border-emerald-700 rounded-r-xl text-stone-800 text-sm sm:text-base font-medium leading-relaxed">
        {post.excerpt}
      </div>

      {/* Article Content */}
      <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed space-y-4 text-sm sm:text-base whitespace-pre-line">
        {post.content}
      </div>

      {/* Relevant Directory Links Card */}
      <div className="mt-12 p-6 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
        <h3 className="text-base font-bold text-stone-900 font-display">
          Explore Related Directory Listings
        </h3>
        <p className="text-xs text-stone-600">
          Looking to book treatments discussed in this article? Browse certified venues:
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {post.relevantServices?.map((svc) => (
            <button
              key={svc.id}
              onClick={() => onNavigate(`/services/${svc.slug}`)}
              className="px-3 py-1.5 bg-white hover:bg-emerald-50 rounded-xl border border-stone-200 hover:border-emerald-300 text-xs font-semibold text-emerald-800 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{svc.name} Centers</span>
            </button>
          ))}

          {post.relevantCities?.map((c) => (
            <button
              key={c.id}
              onClick={() => onNavigate(`/spa/${c.slug}`)}
              className="px-3 py-1.5 bg-white hover:bg-emerald-50 rounded-xl border border-stone-200 hover:border-emerald-300 text-xs font-semibold text-stone-800 transition-colors flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-stone-400" />
              <span>Spas in {c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Related Posts */}
      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <div className="pt-8 border-t border-stone-200 space-y-4">
          <h3 className="text-lg font-bold text-stone-900 font-display">
            More Articles From the Editorial Desk
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {post.relatedPosts.map((rp: any) => (
              <div
                key={rp.id}
                onClick={() => onNavigate(`/blog/${rp.slug}`)}
                className="p-4 bg-white rounded-xl border border-stone-200 hover:border-emerald-300 transition-all cursor-pointer group"
              >
                <h4 className="font-bold text-xs text-stone-900 group-hover:text-emerald-800 font-display mb-1">
                  {rp.title}
                </h4>
                <p className="text-[11px] text-stone-500 line-clamp-2">{rp.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
