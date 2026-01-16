import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/queryClient';

interface AdminData {
  users: number;
  posts: number;
  media: number;
}

interface UseAdminDataReturn {
  data: AdminData | null;
  loading: boolean;
  error: string | null;
}

export const useAdminData = (): UseAdminDataReturn => {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiRequest('GET', '/admin/stats');
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  return { data, loading, error };
};
