"use client";
import { useEffect, useState } from "react";
import { Order } from "@/lib/models/order.model";

interface UseOrderSearchOptions {
  /** Meilisearch filter expression scoping results to this tab (e.g. status = readyToDeliver). Omit for no scoping. */
  filter?: string;
  /** Page size — pass the same PAGE_SIZE used for the tab's Firestore pagination to keep page lengths consistent. */
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
}

export function useOrderSearch({ filter, pageSize, debounceMs = 300 }: UseOrderSearchOptions): UseOrderSearchResult {
  const [search, setSearch] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1); // 1-indexed, mirrors currentPage convention used elsewhere
  const [results, setResults] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const isSearchActive = debouncedQuery.trim().length > 0;

  // Debounce raw input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(search.trim()), debounceMs);
    return () => clearTimeout(t);
  }, [search, debounceMs]);

  // New query -> back to page 1
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  useEffect(() => {
    if (!isSearchActive) {
      setResults([]);
      setHasNextPage(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const offset = (page - 1) * pageSize;
    const params = new URLSearchParams({
      q: debouncedQuery,
      limit: String(pageSize),
      offset: String(offset),
    });
    if (filter) params.set("filter", filter);

    fetch(`/api/orders/search?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Search failed with status ${res.status}`);
        return res.json();
      })
      .then((data: { hits: Order[]; estimatedTotalHits: number }) => {
        if (cancelled) return;
        setResults(data.hits);
        setHasNextPage(offset + data.hits.length < data.estimatedTotalHits);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setResults([]);
        setHasNextPage(false);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [debouncedQuery, page, pageSize, filter, isSearchActive]);

  return {
    search,
    setSearch,
    isSearchActive,
    searchLoading: loading,
    searchResults: results,
    searchPage: page,
    searchHasNextPage: hasNextPage,
    onSearchNext: () => setPage((p) => (hasNextPage ? p + 1 : p)),
    onSearchPrev: () => setPage((p) => Math.max(1, p - 1)),
  };
}