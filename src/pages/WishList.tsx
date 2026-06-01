import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, Play, Trash2, Plus, Clock } from 'lucide-react';
import { api } from '../services/api';
import { getUserId } from '../services/auth';
import { getWishVideoLocal } from '../lib/wishVideoStore';

type Wish = {
  id: number;
  user_id: number;
  title: string;
  description: string;
  video_id: string;
  created_at: string;
};

export default function WishList() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [videoStatus, setVideoStatus] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;

    api.get<Wish[]>('/wishes').then(async (list) => {
      setWishes(list);
      const status: Record<number, boolean> = {};
      for (const w of list) {
        status[w.id] = !!(w.video_id || await getWishVideoLocal(w.id));
      }
      setVideoStatus(status);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (wishId: number) => {
    const userId = getUserId();
    if (!userId) return;
    try {
      await api.del(`/wishes/${wishId}`);
      setWishes(prev => prev.filter(w => w.id !== wishId));
    } catch {}
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden">
      <header className="p-4 pt-6 bg-[#2b1d16]/85 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-amber-500/20">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-serif text-amber-50">My Wishes</h1>
          <button onClick={() => navigate('/record-wish')} className="bg-amber-500 text-stone-950 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-amber-400 transition-colors">
            <Plus className="w-4 h-4" /> New Wish
          </button>
        </div>
        <p className="text-xs text-amber-100/60">Your wishes are private. Only you can see them.</p>
      </header>

      <div className="p-4 space-y-4">
        {loading ? (
          <p className="text-center text-stone-500 py-12">Loading your wishes...</p>
        ) : wishes.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#fff8ea]/90 backdrop-blur-md rounded-3xl p-8 text-center border border-amber-200/70 mt-8">
            <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-rose-500" />
            </div>
            <h2 className="text-xl font-serif text-stone-900 mb-2">No wishes yet</h2>
            <p className="text-sm text-stone-500 mb-6">Record your first wish — a private moment for your spiritual journey.</p>
            <button onClick={() => navigate('/record-wish')} className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-stone-950 text-amber-50 font-medium text-sm hover:bg-stone-800 transition-colors">
              <Plus className="w-4 h-4" /> Record Your First Wish
            </button>
          </motion.div>
        ) : (
          wishes.map((wish, i) => (
            <motion.div key={wish.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-[#fff8ea]/90 backdrop-blur-md rounded-2xl border border-amber-200/70 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-serif text-lg text-stone-900">{wish.title}</h3>
                  <button onClick={() => handleDelete(wish.id)} className="p-1.5 text-stone-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {wish.description && (
                  <p className="text-sm text-stone-600 mb-3 line-clamp-2">{wish.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(wish.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  {videoStatus[wish.id] ? (
                    <Link to={`/wish/${wish.id}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-xs font-medium hover:bg-amber-200 transition-colors">
                      <Play className="w-3.5 h-3.5" /> Play
                    </Link>
                  ) : (
                    <Link to={`/record-wish?edit=${wish.id}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 text-stone-500 text-xs font-medium hover:bg-stone-200 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Add Recording
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
