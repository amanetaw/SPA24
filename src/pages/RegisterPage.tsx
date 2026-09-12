import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSEO } from '../hooks/useSEO';
import { UserPlus, AlertCircle, ShieldCheck } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (path: string) => void;
  redirectPath?: string;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate, redirectPath = '/dashboard' }) => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'business_owner'>('business_owner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useSEO({
    title: 'Register an Account | SPA24 Directory',
    description: 'Create an account to list wellness facilities, claim existing business profiles, and manage verified information.',
    canonical: 'https://spa24.online/register'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        email,
        password,
        full_name: fullName,
        phone: phone || undefined,
        role
      });
      onNavigate(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight font-display">
          Create a SPA24 Account
        </h1>
        <p className="text-xs text-stone-500">
          Claim, list, or review authentic wellness centers
        </p>
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
            Full Name *
          </label>
          <input
            type="text"
            required
            placeholder="Priya Sharma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            required
            placeholder="priya@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            placeholder="+91 98200 12345"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('business_owner')}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                role === 'business_owner'
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              Spa Owner / Manager
            </button>
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                role === 'user'
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              Directory Member
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Password (Min 8 characters) *
          </label>
          <input
            type="password"
            required
            minLength={8}
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
          {loading ? 'Creating Account...' : 'Register Account'}
        </button>

        <p className="text-center text-xs text-stone-500 pt-2">
          Already registered?{' '}
          <button
            type="button"
            onClick={() => onNavigate(`/login?redirect=${redirectPath}`)}
            className="text-emerald-800 font-bold hover:underline"
          >
            Sign In
          </button>
        </p>
      </form>
    </div>
  );
};
