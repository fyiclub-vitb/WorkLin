import React, { useState, useMemo } from 'react';
import { Page } from '../../types/workspace';
import { RelationProperty as RelationPropertyType } from '../../types/database';
import { addRelation, removeRelation, getRelatedPages } from '../../lib/database/relations';
import { Search, X, Link as LinkIcon, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@radix-ui/react-popover';

interface RelationPropertyProps {
  page: Page;
  property: RelationPropertyType;
  propertyName: string;
  allPages: Page[];
  onUpdate: (updatedPage: Page) => void;
}

export const RelationProperty: React.FC<RelationPropertyProps> = ({
  page,
  property,
  propertyName,
  allPages,
  onUpdate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get currently related pages
  const relatedPages = useMemo(
    () => getRelatedPages(page, propertyName, allPages),
    [page, propertyName, allPages]
  );

  // Filter available pages for linking
  const availablePages = useMemo(() => {
    const relatedIds = new Set(relatedPages.map((p) => p.id));
    let filtered = allPages.filter((p) => p.id !== page.id && !relatedIds.has(p.id));

    // Filter by page type if specified
    if (property.targetPageType) {
      filtered = filtered.filter((p) => (p as any).type === property.targetPageType);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(query));
    }

    return filtered;
  }, [allPages, page.id, relatedPages, property.targetPageType, searchQuery]);

  const handleAddRelation = (targetPageId: string) => {
    const updatedPage = addRelation(page, propertyName, targetPageId, allPages);
    onUpdate(updatedPage);
    setSearchQuery('');
  };

  const handleRemoveRelation = (targetPageId: string) => {
    const updatedPage = removeRelation(page, propertyName, targetPageId);
    onUpdate(updatedPage);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <LinkIcon size={16} className="text-blue-500" />
        {property.name}
      </label>

      {/* Related Pages List */}
      <div className="flex flex-wrap gap-2">
        {relatedPages.map((relatedPage) => (
          <div
            key={relatedPage.id}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-sm group"
          >
            <span className="text-gray-700 dark:text-gray-300">{relatedPage.icon}</span>
            <span className="text-gray-900 dark:text-gray-100">{relatedPage.title}</span>
            <button
              onClick={() => handleRemoveRelation(relatedPage.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              aria-label="Remove relation"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {/* Add Relation Button */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-auto py-1.5 px-3 text-sm border-dashed border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-600"
            >
              <Plus size={14} className="mr-1" />
              Add {property.name}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 z-50"
            align="start"
          >
            {/* Search Input */}
            <div className="relative mb-2">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                type="text"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
                autoFocus
              />
            </div>

            {/* Available Pages List */}
            <div className="max-h-64 overflow-y-auto space-y-1">
              {availablePages.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  {searchQuery ? 'No pages found' : 'No available pages'}
                </div>
              ) : (
                availablePages.map((availablePage) => (
                  <button
                    key={availablePage.id}
                    onClick={() => {
                      handleAddRelation(availablePage.id);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-sm transition-colors text-left"
                  >
                    <span className="text-lg">{availablePage.icon}</span>
                    <span className="flex-1 text-gray-900 dark:text-gray-100 truncate">
                      {availablePage.title}
                    </span>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Relation Info */}
      {property.bidirectional && (
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <LinkIcon size={12} />
          Bidirectional: Changes sync to related pages
        </p>
      )}
    </div>
  );
};