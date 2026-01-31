import React, { useState, useEffect } from 'react';
import { Template, TemplateCategory } from '../../types/template';
import { getTemplates, deleteCustomTemplate } from '../../lib/templates';
import { TemplateCard } from './TemplateCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';

interface TemplateGalleryProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate: (template: Template) => void;
}

const CATEGORIES: TemplateCategory[] = ['General', 'Meeting', 'Project', 'Engineering', 'Design', 'Personal', 'Custom'];

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ isOpen, onClose, onSelectTemplate }) => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'All'>('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadTemplates();
        }
    }, [isOpen]);

    const loadTemplates = () => {
        setTemplates(getTemplates());
    };

    const handleDelete = (id: string) => {
        deleteCustomTemplate(id);
        loadTemplates();
    };

    const filteredTemplates = templates.filter(t => {
        const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 bg-[#fbfbfa] dark:bg-[#191919]">
                <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-800 pb-4">
                    <DialogTitle className="text-xl font-semibold mb-4">Create New Page</DialogTitle>

                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <Input
                                placeholder="Search templates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 w-full"
                            />
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar - Categories */}
                    <div className="w-48 border-r border-gray-200 dark:border-gray-800 p-4 overflow-y-auto hidden md:block">
                        <div className="space-y-1">
                            <Button
                                variant={selectedCategory === 'All' ? 'secondary' : 'ghost'}
                                className="w-full justify-start text-sm"
                                onClick={() => setSelectedCategory('All')}
                            >
                                All Templates
                            </Button>
                            {CATEGORIES.map(category => (
                                <Button
                                    key={category}
                                    variant={selectedCategory === category ? 'secondary' : 'ghost'}
                                    className="w-full justify-start text-sm"
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content - Grid */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-black/20">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Default Blank Page Option */}
                            {selectedCategory === 'All' && !searchQuery && (
                                <div
                                    className="p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex flex-col items-center justify-center text-center gap-2 min-h-[180px] transition-colors"
                                    onClick={() => onSelectTemplate({ id: 'blank', name: 'Blank Page', description: 'Start from scratch', category: 'General', icon: '📄', content: { title: 'Untitled Page', blocks: [] } })}
                                >
                                    <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm">
                                        <span className="text-xl">+</span>
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">Blank Page</span>
                                    <span className="text-xs text-gray-500">Start with an empty page</span>
                                </div>
                            )}

                            {filteredTemplates.map(template => (
                                <TemplateCard
                                    key={template.id}
                                    template={template}
                                    onSelect={onSelectTemplate}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>

                        {filteredTemplates.length === 0 && !(!searchQuery && selectedCategory === 'All') && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <p>No templates found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
