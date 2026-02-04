import { useState, useEffect } from 'react';
import { sdk } from '../lib/uipath';
import type { BucketGetResponse } from 'uipath-sdk';

export interface UseUiPathBucketsReturn {
  buckets: BucketGetResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all Storage Buckets from UiPath Orchestrator
 */
export function useUiPathBuckets(): UseUiPathBucketsReturn {
  const [buckets, setBuckets] = useState<BucketGetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBuckets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await sdk.buckets.getAll();
      setBuckets(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch buckets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuckets();
  }, []);

  return { buckets, loading, error, refetch: fetchBuckets };
}
