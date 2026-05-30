import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Clock } from 'lucide-react';
import { api } from '../services/api';
import { getUserId } from '../services/auth';
import { getWishVideo, deleteWishVideo } from '../lib/wishVideoStore';

type Wish = {
  id: number;
  title: string;
  description: string;
  created_at: string;
};

export default function WishDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [wish, setWish] = useState<Wish | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const userId = getUserId();
    if (!userId) return;

    api.get<Wish[]>('/wishes').then(async (list) => {
      const found = list.find(w => w.id === Number(id));
      if (!found) { navigate('/wishes'); return; }
      setWish(found);

      const blob = await getWishVideo(found.id);
      if (blob) {
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        setVideoUrl(url);
      }
    }).catch(() => navigate('/wishes'))
    .finally(() => setLoading(false));

    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [id]);

  const handleDelete = async () => {
    const userId = getUserId();
    if (!userId || !wish) return;
    try {
      await api.del(`/wishes/${wish.id}`);
      await deleteWishVideo(wish.id);
      navigate('/wishes');
    } catch {}
  };

  if (loading) {
    return <div className="min-h-screen bg-transparent flex items-center justify-center"><p className="text-stone-500">Loading...</p></div>;
  }

  if (!wish) return null;

  return (
    <div className="min-h-screen bg-transparent flex flex-col max-w-md mx-auto relative overflow-hidden">
      <header className="p-4 pt-6 bg-[#2b1d16]/85 backdrop-blur-md sticky top-0 z-20 border-b border-amber-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/wishes')} className="p-1 text-amber-100/70 hover:text-amber-100">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-serif text-amber-50 truncate">{wish.title}</h1>
          </div>
          <button onClick={handleDelete} className="p-2 text-amber-100/50 hover:text-red-400 transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center gap-1.5 text-xs text-stone-500">
          <Clock className="w-3.5 h-3.5" />
          <span>{new Date(wish.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>

        {wish.description && (
          <p className="text-sm text-stone-700 bg-[#fff8ea]/80 backdrop-blur-md p-4 rounded-2xl border border-amber-200/70">{wish.description}</p>
        )}

        {videoUrl ? (
          <div className="bg-black rounded-2xl overflow-hidden shadow-lg">
            <video src={videoUrl} controls className="w-full aspect-[3/4] object-contain bg-black" autoPlay />
          </div>
        ) : (
          <div className="bg-[#fff8ea]/90 backdrop-blur-md rounded-2xl border border-amber-200/70 p-8 text-center">
            <p className="text-stone-500 mb-3">No video recording for this wish.</p>
            <button onClick={() => navigate(`/record-wish?edit=${wish.id}`)} className="px-4 py-2 rounded-xl bg-amber-100 text-amber-800 text-sm font-medium hover:bg-amber-200 transition-colors">
              Add Recording
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
