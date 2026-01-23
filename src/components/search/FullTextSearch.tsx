import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, Loader2, FileText, X, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { EmptyState } from '../ui/empty-state';
import { 
  searchWorkspace, 
  getSearchSuggestions, 
  logSearchClick, 
  logSearchAnalytics,
  saveRecentSearch,
  getRecentSearches,
  SearchResult 
} from '../../lib/search/search';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';

export const FullTextSearch = () => {
  const { workspace } = useWorkspace();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get recent searches
  const recentSearches = useMemo(() => getRecentSearches(10), []);

  // Debounced search suggestions
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.trim().length >= 2 && workspace?.id) {
      debounceTimerRef.current = setTimeout(() => {
        const suggs = getSearchSuggestions(
          workspace.id, 
          query, 
          workspace.pages || [], 
          5
        );
        setSuggestions(suggs);
        setShowSuggestions(true);
      }, 300);
    } else {
      setSuggestions([]);
      if (query.length === 0 && recentSearches.length > 0) {
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, workspace?.id, workspace.pages, recentSearches.length]);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!workspace?.id || !searchQuery.trim()) {
      setResults([]);
      if (!workspace?.id) {
        setError('Workspace not found. Please refresh the page.');
      }
      return;
    }

    setLoading(true);
    setError(null);
    setShowSuggestions(false);

    // Debug logging
    const pages = workspace.pages || [];
    console.log('[Search] Workspace ID:', workspace.id);
    console.log('[Search] Pages count:', pages.length);
    console.log('[Search] Pages:', pages.map(p => ({ id: p.id, title: p.title, workspaceId: p.workspaceId })));
    console.log('[Search] Query:', searchQuery);

    try {
      // Perform client-side search using MiniSearch
      const searchResults = searchWorkspace(searchQuery, pages, {
        workspaceId: workspace.id,
        query: searchQuery,
        limit: 20,
        fuzzyThreshold: 0.2, // MiniSearch fuzzy threshold
      });

      console.log('[Search] Results count:', searchResults.length);
      console.log('[Search] Results:', searchResults);

      setResults(searchResults);
      
      // Save to recent searches
      if (searchQuery.trim()) {
        saveRecentSearch(searchQuery);
      }

      // Log search analytics (localStorage only - no Firestore)
      logSearchAnalytics({
        query: searchQuery,
        workspaceId: workspace.id,
        resultsCount: searchResults.length,
      });

      if (searchResults.length === 0) {
        toast({
          title: 'No results found',
          description: 'Try adjusting your search query',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Search failed');
      setResults([]);
      toast({
        title: 'Search error',
        description: err.message || 'An error occurred while searching',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [workspace?.id, workspace.pages, toast]);

  const handleSearch = () => {
    performSearch(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        setQuery(suggestions[selectedIndex]);
        performSearch(suggestions[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    performSearch(suggestion);
  };

  const handleResultClick = async (result: SearchResult) => {
    if (workspace?.id) {
      // Log click analytics (localStorage only)
      logSearchClick(query, result.page.id, workspace.id);
    }
    navigate(`/workspace/${workspace?.id}/page/${result.page.id}`);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setError(null);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight">Full-Text Search</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Search across all workspace content with fuzzy matching and typo tolerance
          <br />
          <span className="text-xs">Client-side search - no Firebase billing required</span>
        </p>

        {/* Search Input */}
        <div className="relative">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="search"
                placeholder="Search pages, content, tags..."
                className="pl-10 pr-10 h-12 text-base"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (suggestions.length > 0 || recentSearches.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={loading || !query.trim()}
              size="lg"
              className="h-12 px-6"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 w-full mt-2 bg-popover border rounded-md shadow-lg max-h-64 overflow-y-auto"
            >
              {suggestions.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-3 w-3" />
                    Suggestions
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors ${
                        selectedIndex === index ? 'bg-accent' : ''
                      }`}
                    >
                      <Search className="inline h-3 w-3 mr-2 text-muted-foreground" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              {recentSearches.length > 0 && query.length === 0 && (
                <div className="p-2 border-t">
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Recent Searches
                  </div>
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors"
                    >
                      <Clock className="inline h-3 w-3 mr-2 text-muted-foreground" />
                      {search}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
            {error}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
            </div>

            {results.map((result, index) => (
              <Card
                key={result.page.id}
                className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleResultClick(result)}
              >
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-base">{result.page.title || 'Untitled'}</h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {result.matches.title && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            Title
                          </span>
                        )}
                        {result.matches.tags && (
                          <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded">
                            Tag
                          </span>
                        )}
                        {result.matches.content && (
                          <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded">
                            Content
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {Math.round(result.score)} pts
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 text-xs text-muted-foreground mt-2">
                      <span>{result.page.type || 'Document'}</span>
                      {result.page.tags && result.page.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex gap-1 flex-wrap">
                            {result.page.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="bg-secondary px-1.5 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                            {result.page.tags.length > 3 && (
                              <span>+{result.page.tags.length - 3}</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Highlights */}
                    {result.highlights && result.highlights.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {result.highlights.map((highlight, idx) => (
                          <p key={idx} className="text-sm text-muted-foreground line-clamp-1">
                            {highlight}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {results.length === 0 && !loading && !error && query && (
          <EmptyState
            title="No results found"
            description="Try different keywords or check spelling."
            actionLabel="Clear search"
            onAction={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            secondaryActionLabel="Show all pages"
            onSecondaryAction={() => {
              setQuery('');
              setResults([]);
              navigate('/app');
            }}
            icon={<Search size={24} />}
            className="py-12"
          />
        )}

        {/* Empty State */}
        {results.length === 0 && !loading && !error && !query && (
          <div className="text-center text-muted-foreground py-12">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Start searching</p>
            <p className="text-sm mt-2">
              Enter a query to search across all workspace content
            </p>
            {recentSearches.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-medium mb-2">Recent Searches</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {recentSearches.slice(0, 5).map((search, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(search)}
                      className="text-xs bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-md transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
