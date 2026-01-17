import React, { useState, useEffect } from 'react';
import { Search, Save, Loader2, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { SearchFilters } from './SearchFilters';
import { searchPages, SearchResult, SearchFilters as SearchFiltersType, saveSearchQuery } from '../../lib/firebase/search';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/use-toast';

// This component provides advanced search with filters
// It searches through local storage instead of the cloud
export const AdvancedSearch = () => {
    const { workspace } = useWorkspace();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [query, setQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SearchResult['pages']>([]);
    const [error, setError] = useState<string | null>(null);

    // Filter options for narrowing down search
    const [filters, setFilters] = useState<Partial<SearchFiltersType>>({
        dateRange: { start: null, end: null },
        tags: []
    });

    // Search through local storage (not cloud)
    const handleSearch = async () => {
        setLoading(true);
        setError(null);

        try {
            const savedData = localStorage.getItem('worklin-workspace');
            let localPages: any[] = [];

            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    // Get the pages array from workspace object
                    localPages = Array.isArray(parsed.pages) ? parsed.pages : [];
                } catch (e) {
                    console.error("Failed to parse local storage for search", e);
                }
            } else {
                // If storage is empty, use workspace state as fallback
                localPages = workspace?.pages || [];
            }

            // Filter by text search
            if (query) {
                const lowerQ = query.toLowerCase();
                localPages = localPages.filter(p => p.title?.toLowerCase().includes(lowerQ));
            }

            // Filter by page type (document, canvas, kanban, etc.)
            if (filters.type) {
                localPages = localPages.filter(p => p.type === filters.type);
            }

            // Filter by tags
            if (filters.tags && filters.tags.length > 0) {
                localPages = localPages.filter(p =>
                    p.tags && filters.tags!.every((tag: string) => p.tags.includes(tag))
                );
            }

            // Filter by date range
            if (filters.dateRange?.start || filters.dateRange?.end) {
                const start = filters.dateRange.start ? filters.dateRange.start.getTime() : 0;
                const end = filters.dateRange.end ? filters.dateRange.end.getTime() : Infinity;
                localPages = localPages.filter(p => {
                    // Handle both Date objects and date strings
                    const dateVal = p.updatedAt ? new Date(p.updatedAt).getTime() : 0;
                    return dateVal >= start && dateVal <= end;
                });
            }

            setResults(localPages);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
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
        alert("Search saved!");
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
            <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold tracking-tight">Advanced Search</h2>

                {/* Search input and buttons */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search pages..."
                            className="pl-8"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Button onClick={handleSearch} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Search
                    </Button>
                    {/* Toggle filters button */}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowFilters(!showFilters)}
                        title="Toggle Filters"
                    >
                        {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>

                {/* Filter panel - only shown when toggled */}
                {showFilters && (
                    <SearchFilters
                        filters={filters}
                        onChange={setFilters}
                        onClear={() => setFilters({ dateRange: { start: null, end: null }, tags: [] })}
                    />
                )}

                {/* Save query button */}
                <div className="flex justify-start">
                    <Button variant="ghost" size="sm" onClick={handleSaveSearch} disabled={!query && !filters.tags?.length && !filters.type && !filters.authorId}>
                        <Save className="mr-2 h-4 w-4" /> Save Query
                    </Button>
                </div>

                {/* Search results */}
                <div className="space-y-2 mt-4">
                    {error && <div className="text-red-500 text-sm">{error}</div>}

                    {/* Empty state */}
                    {results.length === 0 && !loading && !error && (
                        <div className="text-center text-muted-foreground py-8">
                            No results found. Try adjusting your filters.
                        </div>
                    )}

                    {/* Result cards */}
                    {results.map((page) => (
                        <Card
                            key={page.id}
                            className="p-4 hover:bg-muted/50 transition-colors cursor-pointer flex items-center gap-3"
                            onClick={() => navigate(`/workspace/${workspace?.id}/page/${page.id}`)}
                        >
                            <FileText className="h-5 w-5 text-blue-500" />
                            <div className="flex-1">
                                <h4 className="font-medium">{page.title || 'Untitled'}</h4>
                                <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                                    <span>{page.type || 'Document'}</span>
                                    <span>•</span>
                                    <span>{new Date(page.updatedAt instanceof Date ? page.updatedAt : (page.updatedAt as any).toDate()).toLocaleDateString()}</span>
                                    {page.tags && page.tags.length > 0 && (
                                        <>
                                            <span>•</span>
                                            <div className="flex gap-1">
                                                {page.tags.map(tag => (
                                                    <span key={tag} className="bg-secondary px-1 rounded">{tag}</span>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};