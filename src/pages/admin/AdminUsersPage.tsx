import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { User } from '../../types';
import {
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Shield,
  Briefcase,
  User as UserIcon,
  RefreshCw
} from 'lucide-react';

interface AdminUsersPageProps {
  onNavigate: (path: string) => void;
}

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ onNavigate }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const [allUsers, me] = await Promise.all([
        api.admin.getUsers(),
        api.auth.me().catch(() => null)
      ]);
      setUsers(allUsers);
      setCurrentUser(me);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: 'admin' | 'business_owner' | 'user') => {
    setUpdatingId(userId);
    setError('');
    try {
      await api.admin.updateUserRole(userId, newRole);
      setSuccess(`Role updated to ${newRole}`);
      setTimeout(() => setSuccess(''), 3000);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter(u => {
    const displayName = u.full_name || u.name || '';
    const matchesSearch =
      displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' ? true : u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">User Directory & Role Permissions</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage system administrators, verified business owners, and general consumer accounts
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors w-fit cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          <span>Refresh Users</span>
        </button>
      </div>

      {success && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users by name or email address..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Roles</option>
          <option value="admin">System Admin</option>
          <option value="business_owner">Business Owner</option>
          <option value="user">Consumer / User</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700/80">
              <tr>
                <th className="px-5 py-3.5">User Identity</th>
                <th className="px-4 py-3.5">Contact Email</th>
                <th className="px-4 py-3.5">Phone</th>
                <th className="px-4 py-3.5">Joined Date</th>
                <th className="px-5 py-3.5 text-right">Assigned Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading user accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-medium text-slate-300">No users found</p>
                  </td>
                </tr>
              ) : (
                filtered.map(u => {
                  const isMe = currentUser?.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            u.role === 'admin'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : u.role === 'business_owner'
                              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {(u.full_name || u.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              <span>{u.full_name || u.name || 'User'}</span>
                              {isMe && (
                                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">ID #{u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-mono text-slate-300">
                        {u.email}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-400">
                        {u.phone || '—'}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-400">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={u.role}
                            disabled={updatingId === u.id || isMe}
                            onChange={e => handleRoleChange(u.id, e.target.value as any)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                              u.role === 'admin'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : u.role === 'business_owner'
                                ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            <option value="user" className="bg-slate-900 text-white">General User</option>
                            <option value="business_owner" className="bg-slate-900 text-white">Business Owner</option>
                            <option value="admin" className="bg-slate-900 text-white">Administrator</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
