import { Page } from './workspace';

// Relation property type
// This allows pages to link to other pages, creating connections between content
// Like how a "Project" page might link to multiple "Task" pages
export interface RelationProperty {
  type: 'relation';
  name: string;
  linkedPageIds: string[]; // Array of page IDs that this property links to
  targetPageType?: string; // Optional filter - only allow linking to specific page types
  bidirectional?: boolean; // If true, creates automatic reverse link on the target page
  reversePropertyName?: string; // Name for the automatically created reverse relation
}

// Rollup property type
// This aggregates data from pages you've linked through a relation
// Example: A "Project" could have a rollup showing the total hours from all linked "Task" pages
export interface RollupProperty {
  type: 'rollup';
  name: string;
  relationProperty: string; // Which relation property to follow
  targetProperty: string; // Which property to pull from the linked pages
  aggregation: RollupAggregation; // How to combine the values (sum, average, count, etc.)
}

// All the different ways we can aggregate rollup data
// These determine how we combine values from multiple linked pages
export type RollupAggregation =
  | 'count' // Simply count how many related items exist
  | 'count_unique' // Count unique values only (no duplicates)
  | 'sum' // Add up all numeric values
  | 'average' // Calculate the mean of numeric values
  | 'min' // Find the smallest value
  | 'max' // Find the largest value
  | 'median' // Find the middle value when sorted
  | 'range' // Calculate max minus min
  | 'earliest_date' // Find the oldest date
  | 'latest_date' // Find the most recent date
  | 'date_range' // Calculate days between earliest and latest
  | 'percent_empty' // Percentage of empty/null values
  | 'percent_not_empty' // Percentage of filled values
  | 'show_unique' // Display all unique values as an array
  | 'show_original'; // Display all values as-is

// Formula property type
// Allows calculated fields using expressions (like Excel formulas)
// Example: A "Total" formula that adds "Price" and "Tax" properties
export interface FormulaProperty {
  type: 'formula';
  name: string;
  expression: string; // The formula expression (e.g., "prop('Price') + prop('Tax')")
  returnType: 'text' | 'number' | 'boolean' | 'date'; // What type of value the formula returns
}

// Union type that represents any type of database property
// This allows us to store different property types in the same collection
export type DatabaseProperty = RelationProperty | RollupProperty | FormulaProperty;

// Extended Page type with database functionality
// This adds property schema and values to the base Page type
export interface DatabasePage extends Page {
  properties?: Record<string, DatabaseProperty>; // Schema - defines what properties exist
  propertyValues?: Record<string, any>; // Actual values for those properties
}

// Represents a single link between two pages
// This is the underlying data structure for relations
export interface RelationLink {
  id: string;
  sourcePageId: string; // The page where the link originates
  targetPageId: string; // The page being linked to
  propertyName: string; // Name of the relation property
  createdAt: Date;
  bidirectional: boolean; // Whether this creates a reverse link
}

// Context object passed to formula evaluation
// Contains all the data a formula might need to access
export interface FormulaContext {
  properties: Record<string, any>; // All property values from the page
  now: Date; // Current date/time for date calculations
  page: {
    title: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

// Result object returned from formula evaluation
// Contains the calculated value and its type, or an error if evaluation failed
export interface FormulaResult {
  value: any; // The calculated result
  type: 'text' | 'number' | 'boolean' | 'date' | 'error'; // Type of the result
  error?: string; // Error message if evaluation failed
}