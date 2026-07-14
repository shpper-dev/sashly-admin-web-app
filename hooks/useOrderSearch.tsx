"use client";

import { useEffect, useState, useCallback } from "react";
import { Order } from "@/lib/models/order.model";

interface UseOrderSearchOptions {
  filter?: string;
  extraFilter?: string;
  pageSize: number;
  debounceMs?: number;
}

interface UseOrderSearchResult {
  search: string;
  setSearch: (v: string) => void;
  isSearchActive: boolean;
  searchLoading: boolean;
  searchResults: Order[];
  searchPage: number;
  searchHasNextPage: boolean;
  onSearchNext: () => void;
  onSearchPrev: () => void;
  /** Re-fetches the current search/page without changing anything else */
  refresh: () => void;
}

export function useOrderSearch({
  filter,
  extraFilter,
  pageSize,
  debounceMs = 300,
}: UseOrderSearchOptions): UseOrderSearchResult {
  const [search, setSearch] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [page, setPage] = useState(1);

  const [results, setResults] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  // used only to force a re-fetch
  const [refreshKey, setRefreshKey] = useState(0);

  const isSearchActive =
    debouncedQuery.trim().length > 0 || !!extraFilter;

  // debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(search.trim());
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [search, debounceMs]);

  // reset to first page when search/filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, extraFilter]);

  const refresh = useCallback(() => {
    setRefreshKey((v) => v + 1);
  }, []);

  useEffect(() => {
    if (!isSearchActive) {
      setResults([]);
      setHasNextPage(false);
      return;
    }

    let cancelled = false;

    setLoading(true);

    const offset = (page - 1) * pageSize;

    const combinedFilter = [filter, extraFilter]
      .filter(Boolean)
      .join(" AND ");

    const params = new URLSearchParams({
      q: debouncedQuery,
      limit: String(pageSize),
      offset: String(offset),
    });

    if (combinedFilter) {
      params.set("filter", combinedFilter);
    }

    fetch(`/api/orders/search?${params.toString()}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Search failed (${res.status})`);
        }

        return res.json();
      })
      .then((data: { hits: Order[]; estimatedTotalHits: number }) => {
        if (cancelled) return;

        setResults(data.hits);

        setHasNextPage(
          offset + data.hits.length < data.estimatedTotalHits
        );
      })
      .catch((err) => {
        if (cancelled) return;

        console.error(err);

        setResults([]);
        setHasNextPage(false);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    debouncedQuery,
    extraFilter,
    filter,
    page,
    pageSize,
    isSearchActive,
    refreshKey, // <- refresh triggers this effect again
  ]);

  return {
    search,
    setSearch,

    isSearchActive,
    searchLoading: loading,
    searchResults: results,

    searchPage: page,
    searchHasNextPage: hasNextPage,

    onSearchNext: () =>
      setPage((p) => (hasNextPage ? p + 1 : p)),

    onSearchPrev: () =>
      setPage((p) => Math.max(1, p - 1)),

    refresh,
  };
}