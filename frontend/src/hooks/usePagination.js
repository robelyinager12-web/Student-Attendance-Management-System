import { useState } from 'react';

function usePagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);

  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const goToPage = (p) => setPage(p);
  const reset = () => setPage(1);

  return { page, limit, nextPage, prevPage, goToPage, reset };
}

export default usePagination;