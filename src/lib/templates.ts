import { Template, TemplateCategory } from '../types/template';


export const DEFAULT_TEMPLATES: Template[] = [
    {
        id: 'meeting-notes',
        name: 'Meeting Notes',
        description: 'Capture meeting attendees, agenda, and action items.',
        category: 'Meeting',
        icon: '📅',
        content: {
            title: 'Meeting Notes - [Date]',
            blocks: [
                { type: 'heading1', content: 'Meeting Details' },
                { type: 'bulleted-list', content: 'Date: ' },
                { type: 'bulleted-list', content: 'Attendees: ' },
                { type: 'heading2', content: 'Agenda' },
                { type: 'bulleted-list', content: 'Topic 1' },
                { type: 'bulleted-list', content: 'Topic 2' },
                { type: 'heading2', content: 'Action Items' },
                { type: 'checkbox', content: 'Task 1' },
                { type: 'checkbox', content: 'Task 2' },
            ],
        },
    },
    {
        id: 'project-plan',
        name: 'Project Plan',
        description: 'Outline project goals, timeline, and resources.',
        category: 'Project',
        icon: '🚀',
        content: {
            title: 'Project Name - Plan',
            blocks: [
                { type: 'heading1', content: 'Project Overview' },
                { type: 'paragraph', content: 'Brief description of the project goals and objectives.' },
                { type: 'heading2', content: 'Timeline' },
                { type: 'bulleted-list', content: 'Phase 1: Planning' },
                { type: 'bulleted-list', content: 'Phase 2: Execution' },
                { type: 'bulleted-list', content: 'Phase 3: Launch' },
                { type: 'heading2', content: 'Resources' },
                { type: 'bulleted-list', content: 'Team members' },
                { type: 'bulleted-list', content: 'Tools & Budget' },
            ],
        },
    },
    {
        id: 'bug-report',
        name: 'Bug Report',
        description: 'Standardized format for reporting software bugs.',
        category: 'Engineering',
        icon: '🐛',
        content: {
            title: 'Bug: [Issue Description]',
            blocks: [
                { type: 'heading1', content: 'Overview' },
                { type: 'paragraph', content: 'Description of the issue.' },
                { type: 'heading2', content: 'Reproduction Steps' },
                { type: 'numbered-list', content: 'Step 1' },
                { type: 'numbered-list', content: 'Step 2' },
                { type: 'numbered-list', content: 'Step 3' },
                { type: 'heading2', content: 'Expected Behavior' },
                { type: 'paragraph', content: 'What shoud have happened.' },
                { type: 'heading2', content: 'Actual Behavior' },
                { type: 'paragraph', content: 'What actually happened.' },
            ],
        },
    },
    {
        id: 'weekly-planner',
        name: 'Weekly Planner',
        description: 'Plan your week with goals and daily tasks.',
        category: 'Personal',
        icon: '🗓️',
        content: {
            title: 'Weekly Plan',
            blocks: [
                { type: 'heading1', content: 'Weekly Goals' },
                { type: 'checkbox', content: 'Goal 1' },
                { type: 'checkbox', content: 'Goal 2' },
                { type: 'heading2', content: 'Monday' },
                { type: 'checkbox', content: '' },
                { type: 'heading2', content: 'Tuesday' },
                { type: 'checkbox', content: '' },
                { type: 'heading2', content: 'Wednesday' },
                { type: 'checkbox', content: '' },
                // ... extend as needed
            ],
        },
    },
];

const CUSTOM_TEMPLATES_KEY = 'worklin_custom_templates';

export const getCustomTemplates = (): Template[] => {
    try {
        const stored = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Failed to load custom templates', e);
        return [];
    }
};

export const getTemplates = (): Template[] => {
    const custom = getCustomTemplates();
    return [...DEFAULT_TEMPLATES, ...custom];
};

export const saveCustomTemplate = (template: Omit<Template, 'id' | 'isCustom' | 'category'>): Template => {
    const newTemplate: Template = {
        ...template,
        id: crypto.randomUUID(),
        category: 'Custom',
        isCustom: true,
        createdAt: new Date().toISOString(),
    };

    const current = getCustomTemplates();
    const updated = [...current, newTemplate];
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
    return newTemplate;
};

export const deleteCustomTemplate = (templateId: string) => {
    const current = getCustomTemplates();
    const updated = current.filter(t => t.id !== templateId);
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
};
