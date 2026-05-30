import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Users, Download, Search, Eye, EyeOff, LogOut, FileJson, FileSpreadsheet } from 'lucide-react';

type Stats = {
  totalUsers: number;
  totalWishes: number;
  totalPalmReadings: number;
};

type UserRow = {
  id: number;
  name: string;
  phone: string;
  city: string;
  deity: string;
  gotra: string;
  birth_date: string;
  reminder_time: string;
  current_streak: number;
  longest_streak: number;
  created_at: string;
};

export default function AdminDashboard() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [token, setToken] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setUsers(data.users);
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
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) ||
    u.city?.toLowerCase().includes(search.toLowerCase())
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
              <p className="text-2xl font-bold text-amber-50">{stats.totalUsers}</p>
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
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input type="text" placeholder="Search users by name, phone, or city..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-white/90 outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
        </div>

        <div className="space-y-2">
          {filteredUsers.map((u, i) => (
            <motion.div key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="bg-[#fff8ea]/90 backdrop-blur-md rounded-xl border border-amber-200/70 p-3">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-stone-900 text-sm">{u.name}</span>
                <span className="text-[10px] text-stone-400">ID: {u.id}</span>
              </div>
              <div className="flex gap-2 text-xs text-stone-500">
                <span>📞 {u.phone}</span>
                <span>📍 {u.city}</span>
                <span>🙏 {u.deity}</span>
              </div>
              <div className="text-[10px] text-stone-400 mt-1">
                Joined: {new Date(u.created_at).toLocaleDateString('en-IN')}
                {u.current_streak > 0 && ` | Streak: ${u.current_streak}d`}
              </div>
            </motion.div>
          ))}
          {filteredUsers.length === 0 && (
            <p className="text-center text-stone-500 py-8">No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
