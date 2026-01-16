export type ViewType = 'table' | 'board' | 'calendar';

export interface ViewFilter {
    property: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
}

export interface ViewSort {
    property: string;
    direction: 'asc' | 'desc';
}

export interface ViewDefinition {
    id: string;
    name: string;
    type: ViewType;
    filter?: ViewFilter;
    sort?: ViewSort;
    properties?: string[]; // IDs of properties to show in this view
}
