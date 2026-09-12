import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { BlogPost } from '../../types';
import {
  ArrowLeft,
  BookOpen,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
  Globe,
  Image as ImageIcon
} from 'lucide-react';

interface AdminBlogFormPageProps {
  postId?: number;
  onNavigate: (path: string) => void;
}

export const AdminBlogFormPage: React.FC<AdminBlogFormPageProps> = ({
  postId,
  onNavigate
}) => {
  const isEditing = !!postId;
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(!isEditing);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState(
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'
  );
  const [author, setAuthor] = useState('SPA24 Editorial Team');
  const [categoryId, setCategoryId] = useState(1);
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>('published');

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (autoSlug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  useEffect(() => {
    if (isEditing && postId) {
      api.admin.getBlogPost(postId)
        .then(post => {
          setTitle(post.title);
          setSlug(post.slug);
          setAutoSlug(false);
          setExcerpt(post.excerpt || '');
          setContent(post.content || '');
          setFeaturedImage(post.featured_image || '');
          setAuthor(post.author || 'SPA24 Editorial Team');
          setCategoryId(post.category_id || 1);
          setSeoTitle(post.seo_title || '');
          setMetaDescription(post.meta_description || '');
          setStatus((post.status as any) || 'published');
        })
        .catch((err: any) => {
          setError(err.message || 'Failed to load blog post');
        })
        .finally(() => setLoading(false));
    }
  }, [postId, isEditing]);

  const handleSave = async (publishStatus?: 'published' | 'draft') => {
    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('Article Title is required');
      return;
    }
    if (!excerpt.trim()) {
      setError('Article Excerpt is required');
      return;
    }
    if (!content.trim()) {
      setError('Article Content is required');
      return;
    }

    setSaving(true);
    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      excerpt: excerpt.trim(),
      content: content.trim(),
      featured_image: featuredImage.trim(),
      author: author.trim() || 'SPA24 Editorial Team',
      category_id: categoryId,
      seo_title: seoTitle.trim() || null,
      meta_description: metaDescription.trim() || null,
      status: publishStatus || status
    };

    try {
      if (isEditing && postId) {
        await api.admin.updateBlogPost(postId, payload);
        setSuccess('Article updated successfully!');
      } else {
        await api.admin.createBlogPost(payload);
        setSuccess('Article created and published successfully!');
      }
      setTimeout(() => {
        onNavigate('/admin/blog');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to save blog post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading editorial article...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/admin/blog')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isEditing ? `Edit Article: ${title}` : 'Write New Article'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Organic wellness content, buyer guides, and therapy explainers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            Save as Draft
          </button>
          <button
            type="button"
            id="admin-save-blog-btn"
            onClick={() => handleSave('published')}
            disabled={saving}
            className="px-5 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg shadow-rose-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : isEditing ? 'Update Post' : 'Publish Article'}</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Article Metadata Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <BookOpen className="w-4 h-4 text-rose-400" />
          <span>Article Metadata</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Article Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="e.g. 7 Benefits of Deep Tissue Massage for Office Professionals"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">URL Slug</label>
              <label className="text-[11px] text-slate-400 flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSlug}
                  onChange={e => setAutoSlug(e.target.checked)}
                  className="rounded border-slate-700 text-rose-500"
                />
                Auto
              </label>
            </div>
            <input
              type="text"
              value={slug}
              onChange={e => {
                setAutoSlug(false);
                setSlug(e.target.value);
              }}
              placeholder="7-benefits-deep-tissue-massage"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Author Byline</label>
            <input
              type="text"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="e.g. Dr. Priya Sharma, Wellness Consultant"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Featured Header Image URL
            </label>
            <div className="flex items-center gap-3">
              <input
                type="url"
                value={featuredImage}
                onChange={e => setFeaturedImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              {featuredImage && (
                <img
                  src={featuredImage}
                  alt="Preview"
                  className="w-10 h-10 rounded-lg object-cover bg-slate-800 border border-slate-700 flex-shrink-0"
                />
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Summary Excerpt (Displayed on blog feed) <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="Discover how deep tissue massage relieves posture-induced neck tension and boosts circulation..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Article Body Editor with Live Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Article Body (Markdown Supported)</span>
          </h2>

          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                activeTab === 'preview'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>
        </div>

        {activeTab === 'editor' ? (
          <div>
            <textarea
              rows={15}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="## Introduction&#10;&#10;Write your article in markdown. Use ## for headings, - for bullet lists, and **bold** for emphasis."
              className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-rose-500 leading-relaxed"
            />
            <p className="text-[11px] text-slate-500 mt-2">
              Tip: Standard Markdown formatting like ## Subheadings, * lists, and [links](url) will render cleanly on the public site.
            </p>
          </div>
        ) : (
          <div className="p-6 bg-slate-800/60 rounded-xl border border-slate-700/60 min-h-[300px] prose prose-invert prose-amber max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-line">
            {content || <span className="text-slate-500 italic">No content written yet.</span>}
          </div>
        )}
      </div>

      {/* SEO & Publication Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>SEO & Publishing Controls</span>
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              SEO Meta Title
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={e => setSeoTitle(e.target.value)}
              placeholder="7 Benefits of Deep Tissue Massage | Wellness Advice - SPA24"
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              SEO Meta Description
            </label>
            <textarea
              rows={2}
              value={metaDescription}
              onChange={e => setMetaDescription(e.target.value)}
              placeholder="Learn about deep tissue massage techniques, how they treat pain, and what to expect during your first therapy session..."
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Article Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="w-full sm:w-64 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="published">Published (Live on website & sitemap)</option>
              <option value="draft">Draft (Private editorial mode)</option>
              <option value="archived">Archived (Unpublished)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => onNavigate('/admin/blog')}
          className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="px-6 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-sm rounded-xl transition-colors shadow-lg shadow-rose-500/20 cursor-pointer"
        >
          {saving ? 'Saving...' : isEditing ? 'Update Article' : 'Publish Article'}
        </button>
      </div>
    </div>
  );
};
