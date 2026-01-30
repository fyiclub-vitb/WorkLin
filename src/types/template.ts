import { Block } from './workspace';

export type TemplateCategory = 'General' | 'Meeting' | 'Project' | 'Personal' | 'Engineering' | 'Design' | 'Custom';

export interface Template {
    id: string;
    name: string;
    description: string;
    category: TemplateCategory;
    icon: string;
    content: {
        title: string;
        blocks: Partial<Block>[];
    };
    isCustom?: boolean;
    createdAt?: string;
}
