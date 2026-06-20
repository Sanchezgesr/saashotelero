'use client'

import { useState, useCallback } from 'react'

interface UsePaginationOptions {
  initialPage?: number
  itemsPerPage?: number
}

export function usePagination({ initialPage = 1, itemsPerPage = 25 }: UsePaginationOptions = {}) {
  const [page, setPage] = useState(initialPage)

  const from = (page - 1) * itemsPerPage
  const to = from + itemsPerPage - 1

  const goToPage = useCallback((p: number) => setPage(Math.max(1, p)), [])
  const nextPage = useCallback(() => setPage(p => p + 1), [])
  const prevPage = useCallback(() => setPage(p => Math.max(1, p - 1)), [])
  const reset = useCallback(() => setPage(1), [])

  return { page, from, to, itemsPerPage, goToPage, nextPage, prevPage, reset }
}
