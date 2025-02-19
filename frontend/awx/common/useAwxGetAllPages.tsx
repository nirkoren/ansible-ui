import { useCallback, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { useGetRequest } from '../../common/crud/useGet';
import { AwxItemsResponse } from './AwxItemsResponse';

export function useAwxGetAllPages<T extends object>(url: string) {
  const getRequest = useGetRequest<AwxItemsResponse<T>>();
  const getKey = useCallback(
    (pageIndex: number, previousPageData: AwxItemsResponse<T>) => {
      if (previousPageData && !previousPageData.next) return null;

      return `${url}?order_by=name&page=${pageIndex + 1}&page_size=200`;
    },
    [url]
  );

  const { data, error, isLoading, mutate } = useSWRInfinite<AwxItemsResponse<T>, Error>(
    getKey,
    getRequest,
    {
      initialSize: 200,
    }
  );

  const items = useMemo(() => {
    return data?.reduce((items: T[], page: AwxItemsResponse<T>) => {
      if (Array.isArray(page.results)) {
        return [...items, ...page.results];
      }
      return items;
    }, []);
  }, [data]);

  const refresh = useCallback(() => {
    void mutate();
  }, [mutate]);
  return { items, error, isLoading, refresh };
}
