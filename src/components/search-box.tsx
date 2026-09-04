import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ArrowUp, GraduationCap, RefreshCw, Search } from "lucide-react";
import { Link, useRevalidator } from "react-router-dom";

import { useWikiConfig } from "@/client/wiki-config";
import { HighlightedText, buildHighlightQuery } from "@/components/highlighted-text";
import { slugFromFileName, titleFromFileName, type SearchResult, type PageSummary } from "@/lib/wiki-shared";

function SearchInput({
  query,
  onChange,
  onSubmit,
  inputRef,
}: {
  query: string;
  onChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const config = useWikiConfig();

  return (
    <form onSubmit={onSubmit} className="group relative w-full">
      <div
        aria-hidden
        className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-[var(--teal)] via-[var(--lavender)] to-[var(--peach)] opacity-0 blur-sm transition-opacity duration-300 group-focus-within:opacity-70"
      />
      <div className="surface-raised relative flex items-center rounded-full">
        <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)] transition-colors duration-200 group-focus-within:text-[var(--teal)]" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => onChange(event.target.value)}
          placeholder={config.searchPlaceholder}
          className="w-full rounded-full bg-transparent py-3.5 pl-12 pr-14 text-[0.95rem] text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--foreground)] text-[var(--background)] shadow-[0_4px_12px_-4px_rgba(21,19,26,0.4)] transition-[transform,box-shadow,background] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[var(--teal)] hover:shadow-[0_6px_16px_-4px_rgba(132,185,201,0.6)] active:scale-[0.92]"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

export interface TopicBrowseState {
  name: string;
  emoji: string;
  pages: PageSummary[];
}
function splitBrandTitle(title: string) {
  if (title === "Fad.Wiki") return { lead: "Fad.", accent: "Wiki" };
  // Split on camelCase / PascalCase boundary (e.g. "WikiOS" → "Wiki" + "OS")
  const camelMatch = title.match(/^(.+?)([A-Z][A-Z]+)$/);
  if (camelMatch) {
    return { lead: camelMatch[1], accent: camelMatch[2] };
  }

  const words = title.trim().split(/\s+/).filter(Boolean);

  if (words.length <= 1) {
    const midpoint = Math.max(1, Math.ceil(title.length / 2));
    return {
      lead: title.slice(0, midpoint),
      accent: title.slice(midpoint),
    };
  }

  return {
    lead: words.slice(0, -1).join(" "),
    accent: words[words.length - 1] ?? "",
  };
} import { Navbar } from "./navbar";

export function SearchBox({
  totalPages,
  children,
}: {
  totalPages: number;
  children: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const deferredQuery = useDeferredValue(query);
  const highlight = useMemo(() => buildHighlightQuery(deferredQuery), [deferredQuery]);

  useEffect(() => {
    const trimmedQuery = deferredQuery.trim();

    if (!trimmedQuery) {
      abortRef.current?.abort();
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as { error?: string; results?: SearchResult[] };

        if (!response.ok) {
          throw new Error(data.error ?? "Search failed");
        }

        if (!controller.signal.aborted) {
          startTransition(() => {
            setResults(data.results ?? []);
            setIsSearching(false);
            setSearchError(null);
          });
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        if (!controller.signal.aborted) {
          setIsSearching(false);
          setSearchError(error instanceof Error ? error.message : "Search failed");
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [deferredQuery]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  const handleQueryChange = (value: string) => {
    const trimmedValue = value.trim();

    setQuery(value);
    setIsSearching(trimmedValue.length > 0);
    setSearchError(null);

    if (!trimmedValue) {
      setResults(null);
    }
  };

  const resetSearch = () => {
    setQuery("");
    setResults(null);
    setIsSearching(false);
    setSearchError(null);
    abortRef.current?.abort();
    inputRef.current?.focus();
  };

  const hasQuery = query.trim().length > 0;
  const showResults = hasQuery;
  const brandTitle = splitBrandTitle(useWikiConfig().siteTitle);

  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-950 text-zinc-50 overflow-hidden">
      {/* Background Ambient Glow */}
      {!showResults && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-purple-900/30 via-indigo-900/15 to-transparent rounded-full blur-3xl opacity-70" />
        </div>
      )}

      <Navbar
        totalPages={totalPages}
        onBrandClick={(event) => {
          if (window.location.pathname === "/") {
            event.preventDefault();
            resetSearch();
          }
        }}
      />

      <main
        className={`relative z-10 flex flex-1 flex-col items-center px-4 ${
          showResults ? "pt-2 sm:pt-4" : "pt-8 sm:pt-16"
        }`}
      >
        <div
          className={`flex w-full max-w-7xl flex-col items-center gap-6 sm:gap-8 ${
            showResults ? "" : "animate-in"
          }`}
        >
          {!showResults && (
            <div className="text-center flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-300 text-xs font-semibold uppercase tracking-widest mb-4 shadow-sm backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                STEAM-IE KNOWLEDGE VAULT & AI OS
              </div>
              <h1
                className="font-display text-[clamp(3.5rem,12vw,7rem)] leading-[0.95] tracking-[-0.035em] text-white"
                style={{ fontWeight: 300 }}
              >
                {brandTitle.lead}
                <span
                  className="bg-gradient-to-r from-teal-300 via-purple-300 to-rose-300 bg-clip-text text-transparent"
                  style={{ fontWeight: 400 }}
                >
                  {brandTitle.accent ?? ""}
                </span>
              </h1>
            </div>
          )}

          <div className="w-full max-w-xl">
            <SearchInput
              query={query}
              onChange={handleQueryChange}
              onSubmit={handleSubmit}
              inputRef={inputRef}
            />

            {hasQuery && (
              <div className="animate-in surface-raised mt-3 overflow-hidden rounded-3xl">
                {isSearching ? (
                  <div className="space-y-3 p-4">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="animate-pulse space-y-2 rounded-xl bg-[var(--secondary)] p-4"
                      >
                        <div className="h-4 w-2/3 rounded bg-[var(--border)]" />
                        <div className="h-3 w-full rounded bg-[var(--border)]" />
                      </div>
                    ))}
                  </div>
                ) : results && results.length === 0 ? (
                  <div className="p-6 text-sm text-[var(--muted-foreground)]">
                    No matches for{" "}
                    <span className="font-semibold text-[var(--foreground)]">{query}</span>
                  </div>
                ) : searchError ? (
                  <div className="p-6 text-sm text-[var(--muted-foreground)]">
                    Search is temporarily unavailable. Please try again in a moment.
                  </div>
                ) : results ? (
                  <div className="divide-y divide-[var(--border)]">
                    {results.map((result, index) => {
                      const title = titleFromFileName(result.file);
                      const slug = slugFromFileName(result.file);
                      const staggerClass = `stagger-${Math.min(index + 1, 8)}`;
                      const accent = ["var(--teal)", "var(--peach)", "var(--lavender)"][index % 3];

                      return (
                        <Link
                          key={result.file}
                          to={`/wiki/${slug}`}
                          className={`animate-in group relative block px-5 py-4 transition-[background-color] duration-150 hover:bg-white/50 ${staggerClass}`}
                        >
                          <span
                            aria-hidden
                            className="absolute left-0 top-1/2 h-0 w-1 -translate-y-1/2 rounded-r-full transition-all duration-200 group-hover:h-[70%]"
                            style={{ background: accent }}
                          />
                          <p className="truncate font-display text-[1.05rem] text-[var(--foreground)]">
                            {title}
                          </p>
                          {result.matches.length > 0 && (
                            <p className="mt-2 line-clamp-2 text-[0.85rem] leading-relaxed text-[var(--muted-foreground)]">
                              <HighlightedText
                                highlight={highlight}
                                text={result.matches[0].snippet}
                              />
                            </p>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {!showResults && children}
        </div>
      </main>

      <footer className="pb-6" />
    </div>
  );
}
