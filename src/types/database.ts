import { Page } from './workspace';

/**
 * Relation property: Links to other pages
 */
export interface RelationProperty {
  type: 'relation';
  name: string;
  linkedPageIds: string[]; // Pages this relation points to
  targetPageType?: string; // Optional: filter by page type
  bidirectional?: boolean; // If true, creates reverse relation
  reversePropertyName?: string; // Name for the reverse relation
}

/**
 * Rollup property: Aggregates data from related pages
 */
export interface RollupProperty {
  type: 'rollup';
  name: string;
  relationProperty: string; // Which relation to follow
  targetProperty: string; // Which property to aggregate from related pages
  aggregation: RollupAggregation;
}

export type RollupAggregation =
  | 'count' // Count of related items
  | 'count_unique' // Count unique values
  | 'sum' // Sum of numeric values
  | 'average' // Average of numeric values
  | 'min' // Minimum value
  | 'max' // Maximum value
  | 'median' // Median value
  | 'range' // Max - Min
  | 'earliest_date' // Earliest date
  | 'latest_date' // Latest date
  | 'date_range' // Latest - Earliest
  | 'percent_empty' // % of empty values
  | 'percent_not_empty' // % of non-empty values
  | 'show_unique' // Show unique values
  | 'show_original'; // Show all values

/**
 * Formula property: Calculated field using expressions
 */
export interface FormulaProperty {
  type: 'formula';
  name: string;
  expression: string; // Formula expression
  returnType: 'text' | 'number' | 'boolean' | 'date';
}

/**
 * Database property: Union of all property types
 */
export type DatabaseProperty = RelationProperty | RollupProperty | FormulaProperty;

/**
 * Page with database properties
 */
export interface DatabasePage extends Page {
  properties?: Record<string, DatabaseProperty>;
  propertyValues?: Record<string, any>; // Actual values for properties
}

/**
 * Relation link: Represents a connection between two pages
 */
export interface RelationLink {
  id: string;
  sourcePageId: string;
  targetPageId: string;
  propertyName: string;
  createdAt: Date;
  bidirectional: boolean;
}

/**
 * Formula context: Variables available in formula expressions
 */
export interface FormulaContext {
  properties: Record<string, any>; // All property values
  now: Date; // Current date/time
  page: {
    title: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

/**
 * Formula result: Result of evaluating a formula
 */
export interface FormulaResult {
  value: any;
  type: 'text' | 'number' | 'boolean' | 'date' | 'error';
  error?: string;
}