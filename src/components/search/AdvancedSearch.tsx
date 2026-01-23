import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, Save, Loader2, FileText, ChevronDown, ChevronUp, Clock, Sparkles, TrendingUp, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { SearchFilters } from './SearchFilters';
import {
    searchWorkspace,
    getSearchSuggestions,
    logSearchClick,
    logSearchAnalytics,
    saveRecentSearch,
    getRecentSearches,
    SearchResult
} from '../../lib/search/search';
import { saveSearchQuery, SearchFilters as SearchFiltersType } from '../../lib/firebase/search';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';
import { useWorkspaceStore } from '../../store/workspaceStore';

// This component provides advanced search with filters, suggestions, and keyboard navigation
export const AdvancedSearch = () => {
    const { workspace } = useWorkspace();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { setCurrentPageId } = useWorkspaceStore();

    const [query, setQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
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

    // Filter options for narrowing down search
    const [filters, setFilters] = useState<Partial<SearchFiltersType>>({
        dateRange: { start: null, end: null },
        tags: []
    });

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
    }, [query, workspace?.id, workspace?.pages, recentSearches.length]);

    // Search through the workspace using MiniSearch
    const handleSearch = useCallback(async (searchQuery: string = query) => {
        if (!workspace) return;

        setLoading(true);
        setError(null);
        setShowSuggestions(false);

        try {
            const searchResults = searchWorkspace(searchQuery, workspace.pages, {
                workspaceId: workspace.id,
                query: searchQuery,
                limit: 50,
            });

            let filteredResults = searchResults;

            // Additional filters
            if (filters.type) {
                filteredResults = filteredResults.filter((r) => r.page.type === filters.type);
            }

            if (filters.tags && filters.tags.length > 0) {
                filteredResults = filteredResults.filter((r) =>
                    r.page.tags && filters.tags!.every((tag: string) => r.page.tags!.includes(tag))
                );
            }

            if (filters.dateRange?.start || filters.dateRange?.end) {
                const start = filters.dateRange.start ? filters.dateRange.start.getTime() : 0;
                const end = filters.dateRange.end ? filters.dateRange.end.getTime() : Infinity;
                filteredResults = filteredResults.filter((r) => {
                    const updatedAt = r.page.updatedAt;
                    const dateVal = updatedAt instanceof Date
                        ? updatedAt.getTime()
                        : (updatedAt && (updatedAt as any).toDate ? (updatedAt as any).toDate().getTime() : 0);
                    return dateVal >= start && dateVal <= end;
                });
            }

            setResults(filteredResults);

            // Save to recent searches
            if (searchQuery.trim()) {
                saveRecentSearch(searchQuery);
            }

            // Log search analytics
            logSearchAnalytics({
                query: searchQuery,
                workspaceId: workspace.id,
                resultsCount: filteredResults.length,
            });

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [workspace, query, filters]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                const selected = suggestions[selectedIndex];
                setQuery(selected);
                handleSearch(selected);
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
        handleSearch(suggestion);
    };

    const handleResultClick = (result: SearchResult) => {
        if (workspace?.id) {
            logSearchClick(query, result.page.id, workspace.id);
        }
        // Set the current page and navigate to the main workspace view
        setCurrentPageId(result.page.id);
        navigate('/app');
    };

    // Save this search query for later use
    const handleSaveSearch = async () => {
        if (!workspace) return;

        const name = prompt("Enter a name for this search query:");
        if (!name) return;

        // Use first workspace member as user ID (simplified)
        const userId = workspace.members[0];

        await saveSearchQuery(userId, name, {
            query: query || undefined,
            ...filters
        });
        toast({
            title: "Search saved",
            description: `Search query "${name}" has been saved.`,
        });
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
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-blue-600" />
                        <h2 className="text-3xl font-bold tracking-tight">Advanced Search</h2>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => setShowFilters(!showFilters)}
                        className="text-muted-foreground"
                    >
                        {showFilters ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                        {showFilters ? "Hide Filters" : "Show Filters"}
                    </Button>
                </div>

                {/* Search input and buttons */}
                <div className="relative">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                ref={inputRef}
                                type="search"
                                placeholder="Search everything..."
                                className="pl-10 h-12 text-base shadow-sm"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() => (suggestions.length > 0 || recentSearches.length > 0) && setShowSuggestions(true)}
                            />
                            {query && (
                                <button
                                    onClick={() => { setQuery(''); setResults([]); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <Button onClick={() => handleSearch()} disabled={loading} size="lg" className="h-12 px-8">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                            Search
                        </Button>
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
                        <div
                            ref={suggestionsRef}
                            className="absolute z-50 w-full mt-2 bg-popover border rounded-xl shadow-2xl max-h-80 overflow-y-auto p-2"
                        >
                            {suggestions.length > 0 && (
                                <div className="p-1">
                                    <div className="px-3 py-2 text-xs font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                                        <TrendingUp className="h-3 w-3" />
                                        Suggestions
                                    </div>
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className={`w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent transition-colors flex items-center gap-2 ${selectedIndex === index ? 'bg-accent text-accent-foreground' : 'text-foreground/80'
                                                }`}
                                        >
                                            <Search className="h-3.5 w-3.5 text-muted-foreground" />
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {recentSearches.length > 0 && query.length === 0 && (
                                <div className="p-1 border-t dark:border-gray-800 mt-1">
                                    <div className="px-3 py-2 text-xs font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                                        <Clock className="h-3 w-3" />
                                        Recent Searches
                                    </div>
                                    {recentSearches.slice(0, 5).map((search, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestionClick(search)}
                                            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent transition-colors flex items-center gap-2 text-foreground/80"
                                        >
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                            {search}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Filter panel - only shown when toggled */}
                {showFilters && (
                    <div className="bg-muted/30 p-4 rounded-xl border border-dashed border-muted-foreground/20">
                        <SearchFilters
                            filters={filters}
                            onChange={setFilters}
                            onClear={() => setFilters({ dateRange: { start: null, end: null }, tags: [] })}
                        />
                    </div>
                )}

                {/* Save query button */}
                <div className="flex justify-start">
                    <Button variant="ghost" size="sm" onClick={handleSaveSearch} disabled={!query && !filters.tags?.length && !filters.type && !filters.authorId} className="text-muted-foreground hover:text-blue-600">
                        <Save className="mr-2 h-4 w-4" /> Save this specific search configuration
                    </Button>
                </div>

                {/* Search results */}
                <div className="space-y-3 mt-4">
                    {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">{error}</div>}

                    {/* Empty state */}
                    {results.length === 0 && !loading && !error && (
                        <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-muted-foreground/10">
                            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold opacity-80">No matches found</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                                We couldn't find any pages matching your current search and filters.
                            </p>
                            <Button variant="link" onClick={() => { setQuery(''); setFilters({ dateRange: { start: null, end: null }, tags: [] }); handleSearch(''); }} className="mt-4">
                                Clear all search and filters
                            </Button>
                        </div>
                    )}

                    {/* Result cards */}
                    {results.length > 0 && (
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                Showing {results.length} results
                            </p>
                        </div>
                    )}

                    {results.map((result) => (
                        <Card
                            key={result.page.id}
                            className="p-5 hover:bg-muted/40 transition-all cursor-pointer flex flex-col gap-3 group border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/50"
                            onClick={() => handleResultClick(result)}
                        >
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-lg text-blue-600 group-hover:scale-110 transition-transform">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className="font-bold text-lg group-hover:text-blue-600 transition-colors truncate">
                                            {result.page.title || 'Untitled Page'}
                                        </h4>
                                        <div className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-full flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <Sparkles className="h-3 w-3" />
                                            {Math.round(result.score)} pts
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1.5 items-center">
                                        <span className="capitalize font-semibold text-foreground/70">{result.page.type || 'Document'}</span>
                                        <span className="opacity-40">•</span>
                                        <span>Updated {new Date(result.page.updatedAt instanceof Date ? result.page.updatedAt : (result.page.updatedAt as any).toDate()).toLocaleDateString()}</span>
                                        {result.page.tags && result.page.tags.length > 0 && (
                                            <>
                                                <span className="opacity-40">•</span>
                                                <div className="flex gap-1 flex-wrap">
                                                    {result.page.tags.map(tag => (
                                                        <span key={tag} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight">{tag}</span>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {result.highlights && result.highlights.length > 0 && (
                                <div className="ml-14 p-3 bg-muted/30 rounded-lg border border-muted-foreground/5 space-y-2">
                                    {result.highlights.map((highlight, idx) => (
                                        <div key={idx} className="text-xs text-muted-foreground/90 italic leading-relaxed" dangerouslySetInnerHTML={{ __html: highlight }}>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};