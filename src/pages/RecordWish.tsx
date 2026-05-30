import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Camera, CameraOff, Circle, Square, Save } from 'lucide-react';
import { api } from '../services/api';
import { getUserId } from '../services/auth';
import { saveWishVideo } from '../lib/wishVideoStore';

const MAX_DURATION = 30;

export default function RecordWish() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit') ? Number(searchParams.get('edit')) : null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [saving, setSaving] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      clearInterval(timerRef.current);
    };
  }, []);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });
      setStream(s);
      setCameraActive(true);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      setError('Camera access denied. Please allow camera and microphone permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    setCameraActive(false);
  };

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    setDuration(0);
    setRecordedBlob(null);
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);

    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setRecordedUrl(URL.createObjectURL(blob));
      clearInterval(timerRef.current);
    };

    recorder.start(100);
    setRecording(true);

    timerRef.current = window.setInterval(() => {
      setDuration(prev => {
        if (prev >= MAX_DURATION - 1) {
          stopRecording();
          return MAX_DURATION;
        }
        return prev + 1;
      });
    }, 1000);

    setTimeout(() => stopRecording(), MAX_DURATION * 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    clearInterval(timerRef.current);
  };

  const handleSave = async () => {
    if (!title.trim()) { setError('Please enter a wish title.'); return; }
    const userId = getUserId();
    if (!userId) return;
    setSaving(true);
    setError('');

    try {
      if (editId) {
        const updated = await api.put<{ id: number }>(`/wishes/${editId}`, { title, description });
        if (recordedBlob) {
          await saveWishVideo(updated.id, recordedBlob);
        }
      } else {
        const wish = await api.post<{ id: number }>('/wishes', { title, description });
        if (recordedBlob) {
          await saveWishVideo(wish.id, recordedBlob);
        }
      }
      navigate('/wishes');
    } catch {
      setError('Failed to save wish. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col max-w-md mx-auto relative overflow-hidden">
      <header className="p-4 pt-6 bg-[#2b1d16]/85 backdrop-blur-md sticky top-0 z-20 border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/wishes')} className="p-1 text-amber-100/70 hover:text-amber-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-serif text-amber-50">{editId ? 'Edit Wish' : 'New Wish'}</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Wish Title</label>
          <input type="text" placeholder="What is your wish?" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-2xl border border-amber-200 bg-white/90 outline-none focus:ring-2 focus:ring-amber-500 text-base" />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Description (optional)</label>
          <textarea placeholder="Add a note to remember..." value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-2xl border border-amber-200 bg-white/90 outline-none focus:ring-2 focus:ring-amber-500 text-base resize-none" />
        </div>

        <div className="bg-[#fff8ea]/90 backdrop-blur-md rounded-2xl border border-amber-200/70 overflow-hidden">
          <div className="p-4 border-b border-amber-100">
            <h3 className="font-medium text-stone-900 text-sm">Wish Recording</h3>
            <p className="text-xs text-stone-500 mt-0.5">Record a personal video message (max {MAX_DURATION}s)</p>
          </div>

          <div className="bg-black/5 min-h-[240px] flex items-center justify-center relative">
            {!cameraActive && !recordedUrl ? (
              <button onClick={startCamera} className="flex flex-col items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors p-8">
                <Camera className="w-12 h-12" />
                <span className="text-sm font-medium">Start Camera</span>
              </button>
            ) : recordedUrl ? (
              <video ref={previewRef} src={recordedUrl} controls className="w-full max-h-[320px] object-contain bg-black" />
            ) : (
              <>
                <video ref={videoRef} autoPlay muted playsInline className="w-full max-h-[320px] object-contain bg-black" />
                {recording && (
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full">
                    <Circle className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
                    <span className="text-white text-xs font-medium">{duration}s / {MAX_DURATION}s</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="p-4 flex justify-center gap-3">
            {cameraActive && !recording && !recordedUrl && (
              <button onClick={startRecording} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-colors">
                <Circle className="w-4 h-4 fill-white" /> Record
              </button>
            )}
            {recording && (
              <button onClick={stopRecording} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-stone-800 text-white font-medium text-sm hover:bg-stone-900 transition-colors">
                <Square className="w-4 h-4" /> Stop Recording
              </button>
            )}
            {recordedUrl && (
              <button onClick={() => { setRecordedBlob(null); if (recordedUrl) URL.revokeObjectURL(recordedUrl); setRecordedUrl(null); startCamera(); }} className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-stone-200 bg-white text-stone-600 text-sm hover:bg-stone-50 transition-colors">
                <CameraOff className="w-4 h-4" /> Re-record
              </button>
            )}
            {cameraActive && !recording && (
              <button onClick={stopCamera} className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-stone-200 bg-white text-stone-600 text-sm hover:bg-stone-50 transition-colors">
                <CameraOff className="w-4 h-4" /> Stop Camera
              </button>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <button onClick={handleSave} disabled={saving || !title.trim()} className="w-full py-4 rounded-2xl bg-amber-600 text-white font-medium text-base flex items-center justify-center gap-2 hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
          <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Wish'}
        </button>
      </div>
    </div>
  );
}
