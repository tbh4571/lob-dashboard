import { useState } from 'react';

/** Client-side pagination over an already-filtered array. If `items` shrinks
 * (e.g. a filter changes) past the current page, the returned page clamps down
 * automatically rather than showing an empty page. */
export function usePagination<T>(items: T[], limit: number) {
  const [page, setPage] = useState(0);
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(page, pageCount - 1);
  const start = currentPage * limit;
  const pageItems = items.slice(start, start + limit);
  return { page: currentPage, setPage, pageCount, start, total, limit, pageItems };
}
