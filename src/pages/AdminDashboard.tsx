import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Shield, Search, Eye, EyeOff, LogOut, FileJson, FileSpreadsheet, Ban, RotateCcw, AlertTriangle, Undo2, Calendar, Clock, XCircle, Image, Trash2, History } from 'lucide-react';

type Stats = {
  totalUsers: number;
  totalWishes: number;
  totalPalmReadings: number;
};

type AdminUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  deity: string;
  gotra: string;
  birth_date: string;
  reminder_time: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string;
  is_suspended: boolean;
  suspended_until: string | null;
  is_banned: boolean;
  created_at: string;
  wishCount: number;
  palmReadingCount: number;
  palmReadings: { id: number; created_at: string; reading_text: string; hasImage: boolean }[];
  subscription: any;
};

type LogItem = {
  id: number;
  action: string;
  target_user_id: number;
  target_name: string;
  details: string;
  created_at: string;
};

export default function AdminDashboard() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [token, setToken] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [suspendModal, setSuspendModal] = useState<AdminUser | null>(null);
  const [suspendDate, setSuspendDate] = useState('');
  const [suspendTime, setSuspendTime] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banModal, setBanModal] = useState<AdminUser | null>(null);
  const [message, setMessage] = useState('');
  const [imageModal, setImageModal] = useState<{ url: string; readingId: number } | null>(null);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchUsers();
  }, [token, fetchUsers]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Invalid credentials');
      }
      const data = await res.json();
      setToken(data.token);
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = async () => {
    const res = await fetch('/api/admin/export/json', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jyot-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = async () => {
    const res = await fetch('/api/admin/export/csv', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jyot-users.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    setToken('');
    setUsername('');
    setPassword('');
    setStats(null);
    setUsers([]);
    setSearch('');
    setMessage('');
  };

  const handleSuspend = async () => {
    if (!suspendModal) return;
    const userId = suspendModal.id;
    setActionLoading(userId);
    setError('');
    try {
      const suspendedUntil = suspendDate && suspendTime
        ? `${suspendDate}T${suspendTime}:00`
        : null;
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ suspendedUntil, reason: suspendReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message);
      setSuspendModal(null);
      setSuspendDate('');
      setSuspendTime('');
      setSuspendReason('');
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnsuspend = async (userId: number) => {
    setActionLoading(userId);
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${userId}/unsuspend`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBan = async () => {
    if (!banModal) return;
    const userId = banModal.id;
    setActionLoading(userId);
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: banReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message);
      setBanModal(null);
      setBanReason('');
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      setLogs(await res.json());
    } catch {}
  }, [token]);

  const handleDelete = async (u: AdminUser) => {
    if (!window.confirm(`Permanently delete User #${u.id} (${u.name || 'Unknown'}) and ALL their data? Wishes, jaaps, palm readings, and subscriptions will be erased. This CANNOT be undone.`)) return;
    setActionLoading(u.id);
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${u.id}/delete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const viewPalmImage = async (readingId: number) => {
    try {
      const res = await fetch(`/api/admin/palm-readings/${readingId}/image`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load image');
      const data = await res.json();
      setImageModal({ url: data.url, readingId });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUnban = async (userId: number) => {
    setActionLoading(userId);
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${userId}/unban`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.city?.toLowerCase().includes(search.toLowerCase()) ||
    String(u.id).includes(search)
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col max-w-md mx-auto relative overflow-hidden">
        <div className="flex-1 flex flex-col justify-center p-6">
          <div className="bg-[#fff8ea]/90 backdrop-blur-md rounded-3xl p-8 border border-amber-200/70 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-stone-900 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-2xl font-serif text-stone-900 text-center mb-6">Admin Access</h1>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-stone-500 bg-white" placeholder="Admin username" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 pr-10 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-stone-500 bg-white" placeholder="Admin password" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-600 text-center">{error}</p>}

              <button type="submit" disabled={loading || !username || !password} className="w-full py-3 rounded-xl bg-stone-900 text-amber-50 font-medium text-sm hover:bg-stone-800 transition-colors disabled:opacity-50">
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const statusBadge = (u: AdminUser) => {
    if (u.is_banned) return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">Banned</span>;
    if (u.is_suspended) {
      const expired = u.suspended_until && new Date(u.suspended_until) < new Date();
      if (expired) return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">Expired</span>;
      return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Suspended</span>;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col max-w-md mx-auto relative overflow-hidden pb-8">
      <header className="p-4 pt-6 bg-[#2b1d16]/85 backdrop-blur-md sticky top-0 z-20 border-b border-amber-500/20">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-serif text-amber-50 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" /> Admin
          </h1>
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100/10 text-amber-100 text-xs hover:bg-amber-100/20 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-100/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-amber-50">{users.length}</p>
              <p className="text-[10px] text-amber-100/60 uppercase tracking-wider">Users</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-amber-100/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-amber-50">{stats.totalWishes}</p>
              <p className="text-[10px] text-amber-100/60 uppercase tracking-wider">Wishes</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-amber-100/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-amber-50">{stats.totalPalmReadings}</p>
              <p className="text-[10px] text-amber-100/60 uppercase tracking-wider">Readings</p>
            </motion.div>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={handleExportJSON} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-100/10 text-amber-100 text-xs hover:bg-amber-100/20 transition-colors">
            <FileJson className="w-3.5 h-3.5" /> Export JSON
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-100/10 text-amber-100 text-xs hover:bg-amber-100/20 transition-colors">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </header>

      <div className="p-4">
        {message && (
          <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 text-center">{message}</p>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input type="text" placeholder="Search by name, phone, email, city, or ID..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-white/90 outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
        </div>

        {error && <p className="text-sm text-red-600 text-center mb-4">{error}</p>}

        <button onClick={() => { setShowLogs(!showLogs); if (!showLogs && logs.length === 0) fetchLogs(); }} className="w-full flex items-center justify-center gap-2 py-2.5 mb-4 rounded-xl border border-amber-200/70 bg-[#fff8ea]/80 text-stone-600 text-xs font-medium hover:bg-amber-50 transition-colors">
          <History className="w-4 h-4" /> {showLogs ? 'Hide' : 'View'} Admin Action Log ({logs.length})
        </button>

        {showLogs && (
          <div className="mb-4 bg-[#fff8ea]/90 backdrop-blur-md rounded-xl border border-amber-200/70 p-3 max-h-60 overflow-y-auto space-y-1.5">
            {logs.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-4">No actions logged yet.</p>
            ) : (
              logs.map(log => (
                <div key={log.id} className="text-[11px] text-stone-600 flex items-start gap-2">
                  <span className="shrink-0 text-stone-400">{new Date(log.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  <span className={`font-medium uppercase ${log.action === 'ban' ? 'text-red-600' : log.action === 'suspend' ? 'text-amber-600' : log.action === 'delete' ? 'text-rose-700' : log.action === 'unsuspend' || log.action === 'unban' ? 'text-emerald-600' : 'text-stone-600'}`}>{log.action}</span>
                  <span className="truncate">
                    {log.target_name || `User #${log.target_user_id}`}
                    {log.details ? ` — ${log.details}` : ''}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        <div className="space-y-2">
          {filteredUsers.map((u, i) => (
            <motion.div key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className={`bg-[#fff8ea]/90 backdrop-blur-md rounded-xl border p-3 ${u.is_banned ? 'border-red-300' : u.is_suspended ? 'border-amber-300' : 'border-amber-200/70'}`}>
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-900 text-sm">{u.name || 'Unknown'}</span>
                  {statusBadge(u)}
                </div>
                <span className="text-[10px] text-stone-400">ID: {u.id}</span>
              </div>

              <div className="text-xs text-stone-500 space-y-0.5">
                <p>📧 {u.email} | 📞 {u.phone || '—'} | 📍 {u.city || '—'}</p>
                <p>🙏 {u.deity} | 🗿 {u.gotra || '—'} | 🎂 {u.birth_date || '—'}</p>
                <p>⏰ {u.reminder_time} | Streak: {u.current_streak}d (best: {u.longest_streak}d)</p>
                <p>Wishes: {u.wishCount} | Readings: {u.palmReadingCount} | Joined: {new Date(u.created_at).toLocaleDateString('en-IN')}</p>
                {u.subscription && <p className="text-amber-700">⭐ {u.subscription.plan} — {u.subscription.status}</p>}
                {u.suspended_until && <p className="text-amber-600">⏳ Suspended until: {new Date(u.suspended_until).toLocaleString('en-IN')}</p>}
                {u.palmReadings.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {u.palmReadings.map(r => (
                      <p key={r.id} className="text-stone-500 flex items-center gap-1">
                        📖 Reading #{r.id} ({new Date(r.created_at).toLocaleDateString('en-IN')})
                        {r.hasImage && (
                          <button onClick={() => viewPalmImage(r.id)} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-medium hover:bg-purple-200 transition-colors">
                            <Image className="w-3 h-3" /> View
                          </button>
                        )}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-1.5 mt-2">
                {u.is_banned ? (
                  <>
                    <button onClick={() => handleUnban(u.id)} disabled={actionLoading === u.id} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-medium hover:bg-emerald-200 transition-colors disabled:opacity-50">
                      <Undo2 className="w-3 h-3" /> {actionLoading === u.id ? '...' : 'Unban'}
                    </button>
                    <button onClick={() => handleDelete(u)} disabled={actionLoading === u.id} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-100 text-rose-800 text-[10px] font-medium hover:bg-red-200 transition-colors disabled:opacity-50">
                      <Trash2 className="w-3 h-3" /> {actionLoading === u.id ? '...' : 'Delete'}
                    </button>
                  </>
                ) : u.is_suspended ? (
                  <>
                    <button onClick={() => handleUnsuspend(u.id)} disabled={actionLoading === u.id} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-medium hover:bg-emerald-200 transition-colors disabled:opacity-50">
                      <RotateCcw className="w-3 h-3" /> {actionLoading === u.id ? '...' : 'Unsuspend'}
                    </button>
                    <button onClick={() => setBanModal(u)} disabled={actionLoading === u.id} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-100 text-red-700 text-[10px] font-medium hover:bg-red-200 transition-colors disabled:opacity-50">
                      <Ban className="w-3 h-3" /> Ban
                    </button>
                    <button onClick={() => handleDelete(u)} disabled={actionLoading === u.id} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-100 text-rose-800 text-[10px] font-medium hover:bg-red-200 transition-colors disabled:opacity-50">
                      <Trash2 className="w-3 h-3" /> {actionLoading === u.id ? '...' : 'Delete'}
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setSuspendModal(u)} disabled={actionLoading === u.id} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-[10px] font-medium hover:bg-amber-200 transition-colors disabled:opacity-50">
                      <Clock className="w-3 h-3" /> Suspend
                    </button>
                    <button onClick={() => setBanModal(u)} disabled={actionLoading === u.id} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-100 text-red-700 text-[10px] font-medium hover:bg-red-200 transition-colors disabled:opacity-50">
                      <Ban className="w-3 h-3" /> Ban
                    </button>
                    <button onClick={() => handleDelete(u)} disabled={actionLoading === u.id} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-100 text-rose-800 text-[10px] font-medium hover:bg-red-200 transition-colors disabled:opacity-50">
                      <Trash2 className="w-3 h-3" /> {actionLoading === u.id ? '...' : 'Delete'}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
          {filteredUsers.length === 0 && (
            <p className="text-center text-stone-500 py-8">No users found.</p>
          )}
        </div>
      </div>

      {suspendModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSuspendModal(null)}>
          <div className="bg-[#2b1d16] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-amber-500/20" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif text-amber-50">Suspend User</h3>
              <button onClick={() => setSuspendModal(null)} className="text-amber-100/50 hover:text-amber-100">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-amber-100/70 mb-4">
              Suspending <span className="font-medium text-amber-200">{suspendModal.name || `User #${suspendModal.id}`}</span>
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs text-amber-100/60 mb-1">Reason for suspension</label>
                <textarea value={suspendReason} onChange={e => setSuspendReason(e.target.value)} rows={2} placeholder="Why is this user being suspended?" className="w-full px-3 py-2.5 rounded-xl bg-amber-900/20 border border-amber-500/20 text-amber-50 text-sm outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs text-amber-100/60 mb-1">Suspend until date (optional — empty = indefinite)</label>
                <input type="date" value={suspendDate} onChange={e => setSuspendDate(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-amber-900/20 border border-amber-500/20 text-amber-50 text-sm outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-xs text-amber-100/60 mb-1">Time</label>
                <input type="time" value={suspendTime} onChange={e => setSuspendTime(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-amber-900/20 border border-amber-500/20 text-amber-50 text-sm outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSuspendModal(null)} className="flex-1 py-3 rounded-xl border border-amber-200/20 text-amber-100/70 text-sm font-medium hover:bg-amber-100/5 transition-colors">
                Cancel
              </button>
              <button onClick={handleSuspend} disabled={actionLoading === suspendModal.id} className="flex-1 py-3 rounded-xl bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50">
                {actionLoading === suspendModal.id ? '...' : 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}

      {banModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setBanModal(null); setBanReason(''); }}>
          <div className="bg-[#2b1d16] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-amber-500/20" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif text-amber-50">Permanently Ban User</h3>
              <button onClick={() => { setBanModal(null); setBanReason(''); }} className="text-amber-100/50 hover:text-amber-100">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-amber-100/70 mb-4">
              This will permanently ban <span className="font-medium text-amber-200">{banModal.name || `User #${banModal.id}`}</span>. They will not be able to log in.
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs text-amber-100/60 mb-1">Reason for ban</label>
                <textarea value={banReason} onChange={e => setBanReason(e.target.value)} rows={2} placeholder="Why is this user being banned?" className="w-full px-3 py-2.5 rounded-xl bg-amber-900/20 border border-amber-500/20 text-amber-50 text-sm outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setBanModal(null); setBanReason(''); }} className="flex-1 py-3 rounded-xl border border-amber-200/20 text-amber-100/70 text-sm font-medium hover:bg-amber-100/5 transition-colors">
                Cancel
              </button>
              <button onClick={handleBan} disabled={actionLoading === banModal.id} className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
                {actionLoading === banModal.id ? '...' : 'Ban Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {imageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setImageModal(null)}>
          <div className="relative max-w-full max-h-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setImageModal(null)} className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors">
              <XCircle className="w-5 h-5" />
            </button>
            <img src={imageModal.url} alt={`Palm reading #${imageModal.readingId}`} className="max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
