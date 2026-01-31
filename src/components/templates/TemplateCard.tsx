import React from 'react';
import { Template } from '../../types/template';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';

interface TemplateCardProps {
    template: Template;
    onSelect: (template: Template) => void;
    onDelete?: (templateId: string) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect, onDelete }) => {
    return (
        <Card
            className="p-4 hover:shadow-md transition-shadow cursor-pointer border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e1e1e] group relative"
            onClick={() => onSelect(template)}
        >
            <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl">
                        {template.icon}
                    </div>
                    {template.isCustom && onDelete && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(template.id);
                            }}
                        >
                            <Trash2 size={16} />
                        </Button>
                    )}
                </div>

                <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[2.5em]">
                        {template.description}
                    </p>
                </div>

                <div className="pt-2 mt-auto">
                    <Button
                        className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
                        variant="ghost"
                    >
                        Use Template
                    </Button>
                </div>
            </div>
        </Card>
    );
};
