import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { useSEO } from '../hooks/useSEO';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (path: string) => void;
  redirectPath?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, redirectPath = '/dashboard' }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useSEO({
    title: 'Sign In to SPA24 Business & User Portal',
    description: 'Sign in to access your business owner dashboard, claim listings, and manage verified spa profiles.',
    canonical: 'https://spa24.online/login'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      onNavigate(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight font-display">
          Sign In to SPA24
        </h1>
        <p className="text-xs text-stone-500">
          Access your business dashboard or submit verified edits
        </p>
      </div>

      {/* Demo Credentials Quick-Fill helper */}
      <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-xs">
        <p className="font-bold text-stone-700 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Quick Login Credentials:</span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemo('admin@spa24.online', 'Aman@1972')}
            className="p-2 bg-white hover:bg-emerald-50 rounded-lg border border-stone-200 text-left text-[11px] font-medium text-stone-800 transition-colors"
          >
            <span className="block font-bold text-emerald-800">Admin Account</span>
            admin@spa24.online
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('amansharmaetaw@gmail.com', 'Aman@1972')}
            className="p-2 bg-white hover:bg-emerald-50 rounded-lg border border-stone-200 text-left text-[11px] font-medium text-stone-800 transition-colors"
          >
            <span className="block font-bold text-emerald-800">Aman Sharma (Admin)</span>
            amansharmaetaw...
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>

        <p className="text-center text-xs text-stone-500 pt-2">
          Don&apos;t have an account yet?{' '}
          <button
            type="button"
            onClick={() => onNavigate(`/register?redirect=${redirectPath}`)}
            className="text-emerald-800 font-bold hover:underline"
          >
            Create an Account
          </button>
        </p>
      </form>
    </div>
  );
};
