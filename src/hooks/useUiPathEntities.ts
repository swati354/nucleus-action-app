import { useState, useEffect } from 'react';
import { sdk } from '../lib/uipath';
import type { EntityGetResponse } from 'uipath-sdk';

export interface UseUiPathEntitiesReturn {
  entities: EntityGetResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all Data Fabric entities
 */
export function useUiPathEntities(): UseUiPathEntitiesReturn {
  const [entities, setEntities] = useState<EntityGetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await sdk.entities.getAll();
      setEntities(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch entities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntities();
  }, []);

  return { entities, loading, error, refetch: fetchEntities };
}
