import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';

export function useLazyTable<T = any>(
  query: any,
  {
    variables = {},
    skip = false,
    transform = (data: any) => data,
  }: {
    variables?: Record<string, any>;
    skip?: boolean;
    transform?: (data: any) => T[];
  }
) {
  const [hasFetched, setHasFetched] = useState(false);
  const [resultData, setResultData] = useState<T[]>([]);

  const { data, loading, error } = useQuery(query, {
    variables,
    skip: skip || hasFetched,
  });

  useEffect(() => {
    if (data && !hasFetched) {
      setResultData(transform(data));
      setHasFetched(true);
    }
  }, [data, hasFetched, transform]);

  return {
    data: resultData,
    loading,
    error,
    refetchStatus: () => setHasFetched(false), // optional reset for refetching
  };
}
