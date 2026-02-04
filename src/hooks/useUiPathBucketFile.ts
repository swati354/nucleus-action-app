import { useState, useCallback } from 'react';
import { sdk } from '../lib/uipath';
import type { BucketGetUriResponse, BucketGetReadUriOptions } from 'uipath-sdk';

export interface UseUiPathBucketFileReturn {
  fileInfo: BucketGetUriResponse | null;
  fileContent: Blob | null;
  loading: boolean;
  error: string | null;
  getReadUri: (options: BucketGetReadUriOptions) => Promise<BucketGetUriResponse | null>;
  fetchFileContent: (options: BucketGetReadUriOptions) => Promise<Blob | null>;
  reset: () => void;
}

/**
 * Hook to read files/images from UiPath Orchestrator Storage Buckets
 *
 * Uses the SDK's getReadUri method to get a download URL, and optionally
 * fetches the file content directly.
 *
 * @example
 * ```tsx
 * const { getReadUri, fetchFileContent, fileInfo, fileContent, loading, error } = useUiPathBucketFile();
 *
 * // Get just the download URL
 * const info = await getReadUri({ bucketId: 123, folderId: 456, path: '/images/photo.jpg' });
 * console.log(info.uri); // Direct download URL
 *
 * // Or fetch the file content directly
 * const blob = await fetchFileContent({ bucketId: 123, folderId: 456, path: '/images/photo.jpg' });
 * const imageUrl = URL.createObjectURL(blob);
 * ```
 */
export function useUiPathBucketFile(): UseUiPathBucketFileReturn {
  const [fileInfo, setFileInfo] = useState<BucketGetUriResponse | null>(null);
  const [fileContent, setFileContent] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getReadUri = useCallback(async (options: BucketGetReadUriOptions): Promise<BucketGetUriResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await sdk.buckets.getReadUri(options);
      setFileInfo(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get file read URI';
      setError(errorMessage);
      setFileInfo(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFileContent = useCallback(async (options: BucketGetReadUriOptions): Promise<Blob | null> => {
    setLoading(true);
    setError(null);

    try {
      // First get the read URI
      const uriResponse = await sdk.buckets.getReadUri(options);
      setFileInfo(uriResponse);

      // Fetch the actual file content
      const fetchResponse = await fetch(uriResponse.uri, {
        method: uriResponse.httpMethod,
        headers: uriResponse.headers,
      });

      if (!fetchResponse.ok) {
        throw new Error(`Failed to fetch file: ${fetchResponse.statusText}`);
      }

      const blob = await fetchResponse.blob();
      setFileContent(blob);
      return blob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch file content';
      setError(errorMessage);
      setFileContent(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setFileInfo(null);
    setFileContent(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    fileInfo,
    fileContent,
    loading,
    error,
    getReadUri,
    fetchFileContent,
    reset,
  };
}
