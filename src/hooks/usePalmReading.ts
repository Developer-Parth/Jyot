import { useState } from 'react';
import { api } from '../services/api.js';

export function usePalmReading() {
  const [reading, setReading] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getReading = async (imageBase64: string) => {
    setLoading(true);
    setError(null);
    setReading(null);

    try {
      const data = await api.post<{ reading: string }>('/palm-reading', { imageBase64 });
      setReading(data.reading);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching the reading');
    } finally {
      setLoading(false);
    }
  };

  const clearReading = () => {
    setReading(null);
    setError(null);
  };

  return { reading, loading, error, getReading, clearReading };
}
