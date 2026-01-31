// Defines the different ways to visualize page data
// table: Spreadsheet-like grid view with rows and columns
// board: Kanban-style view with cards in columns
// calendar: Calendar view showing items by date
export type ViewType = 'table' | 'board' | 'calendar';

// Defines a filter rule for a view
// Filters determine which pages/items are shown in the view
export interface ViewFilter {
    property: string; // Which property to filter on
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than'; // How to compare the value
    value: any; // The value to compare against
}

// Defines how items are sorted in a view
// Determines the order in which pages/items appear
export interface ViewSort {
    property: string; // Which property to sort by
    direction: 'asc' | 'desc'; // Ascending (A-Z, 0-9) or descending (Z-A, 9-0)
}

// Complete definition of a saved view
// Views are different ways to look at the same data with different filters, sorts, and layouts
export interface ViewDefinition {
    id: string; // Unique identifier for this view
    name: string; // Display name shown to users
    type: ViewType; // How the data is visualized (table, board, calendar)
    filter?: ViewFilter; // Optional filter to show only certain items
    sort?: ViewSort; // Optional sort to control item order
    properties?: string[]; // Optional list of property IDs to show in this view (hides others)
}