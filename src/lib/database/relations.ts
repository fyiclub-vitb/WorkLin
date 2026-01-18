import { Page } from '../../types/workspace';
import {
  DatabaseProperty,
  RelationProperty,
  RollupProperty,
  FormulaProperty,
  RollupAggregation,
  FormulaContext,
  FormulaResult,
  RelationLink,
} from '../../types/database';

// Function to get all pages that are linked through a relation property
// This is useful for displaying related content or following connections between pages
export const getRelatedPages = (
  page: Page,
  relationPropertyName: string,
  allPages: Page[]
): Page[] => {
  // Try to get the properties object from the page
  const properties = (page as any).properties as Record<string, DatabaseProperty> | undefined;
  if (!properties) return [];

  // Get the specific relation property we're interested in
  const relationProp = properties[relationPropertyName];
  if (!relationProp || relationProp.type !== 'relation') return [];

  // Get the list of linked page IDs
  const linkedIds = relationProp.linkedPageIds || [];
  
  // Filter all pages to return only the ones that are linked
  return allPages.filter((p) => linkedIds.includes(p.id));
};

// Function to add a new relation link between the source page and a target page
// This creates a one-way link from source to target
export const addRelation = (
  sourcePage: Page,
  relationPropertyName: string,
  targetPageId: string,
  allPages: Page[]
): Page => {
  // Get or initialize the properties object
  const properties = (sourcePage as any).properties || {};
  const relationProp = properties[relationPropertyName] as RelationProperty;

  // Make sure the relation property exists
  if (!relationProp || relationProp.type !== 'relation') {
    throw new Error('Relation property not found');
  }

  // Get current linked IDs
  const linkedIds = relationProp.linkedPageIds || [];
  
  // If already linked, return the page unchanged
  if (linkedIds.includes(targetPageId)) {
    return sourcePage;
  }

  // Create updated relation property with the new link added
  const updatedProp: RelationProperty = {
    ...relationProp,
    linkedPageIds: [...linkedIds, targetPageId],
  };

  // Return a new page object with the updated property
  return {
    ...sourcePage,
    properties: {
      ...properties,
      [relationPropertyName]: updatedProp,
    },
    updatedAt: new Date(),
  } as Page;
};

// Function to remove a relation link between source and target page
// This breaks the connection but doesn't delete either page
export const removeRelation = (
  sourcePage: Page,
  relationPropertyName: string,
  targetPageId: string
): Page => {
  // Get the properties object
  const properties = (sourcePage as any).properties || {};
  const relationProp = properties[relationPropertyName] as RelationProperty;

  // If relation doesn't exist, return page unchanged
  if (!relationProp || relationProp.type !== 'relation') {
    return sourcePage;
  }

  // Get current linked IDs
  const linkedIds = relationProp.linkedPageIds || [];
  
  // Create updated property with the target ID removed
  const updatedProp: RelationProperty = {
    ...relationProp,
    linkedPageIds: linkedIds.filter((id) => id !== targetPageId),
  };

  // Return new page object with updated property
  return {
    ...sourcePage,
    properties: {
      ...properties,
      [relationPropertyName]: updatedProp,
    },
    updatedAt: new Date(),
  } as Page;
};

// Function to calculate rollup property values
// Rollups aggregate data from related pages (like sum, average, count, etc.)
export const calculateRollup = (
  page: Page,
  rollupProperty: RollupProperty,
  allPages: Page[]
): any => {
  // First get all pages related through the specified relation property
  const relatedPages = getRelatedPages(page, rollupProperty.relationProperty, allPages);

  // If no related pages, return appropriate default value
  if (relatedPages.length === 0) {
    return rollupProperty.aggregation === 'count' ? 0 : null;
  }

  // Extract the target property values from all related pages
  const values = relatedPages
    .map((p) => {
      const propValues = (p as any).propertyValues || {};
      return propValues[rollupProperty.targetProperty];
    })
    .filter((v) => v !== undefined && v !== null);

  // Perform the aggregation operation on these values
  return aggregateValues(values, rollupProperty.aggregation);
};

// Helper function to perform different types of aggregations on an array of values
// Supports numeric operations, date operations, and counting operations
const aggregateValues = (values: any[], aggregation: RollupAggregation): any => {
  // Handle empty values case
  if (values.length === 0) {
    return aggregation === 'count' ? 0 : null;
  }

  switch (aggregation) {
    case 'count':
      // Simply count the number of values
      return values.length;

    case 'count_unique':
      // Count unique values using a Set
      return new Set(values).size;

    case 'sum':
      // Add up all numeric values
      return values.reduce((sum, val) => sum + (Number(val) || 0), 0);

    case 'average':
      // Calculate the mean of numeric values
      const numValues = values.filter((v) => typeof v === 'number' || !isNaN(Number(v)));
      if (numValues.length === 0) return null;
      return numValues.reduce((sum, val) => sum + Number(val), 0) / numValues.length;

    case 'min':
      // Find the minimum numeric value
      const numericMin = values.filter((v) => typeof v === 'number' || !isNaN(Number(v)));
      return numericMin.length > 0 ? Math.min(...numericMin.map(Number)) : null;

    case 'max':
      // Find the maximum numeric value
      const numericMax = values.filter((v) => typeof v === 'number' || !isNaN(Number(v)));
      return numericMax.length > 0 ? Math.max(...numericMax.map(Number)) : null;

    case 'median':
      // Calculate the median (middle value) of numeric values
      const numericMedian = values
        .filter((v) => typeof v === 'number' || !isNaN(Number(v)))
        .map(Number)
        .sort((a, b) => a - b);
      if (numericMedian.length === 0) return null;
      const mid = Math.floor(numericMedian.length / 2);
      // For even length, average the two middle values
      return numericMedian.length % 2 === 0
        ? (numericMedian[mid - 1] + numericMedian[mid]) / 2
        : numericMedian[mid];

    case 'range':
      // Calculate the difference between max and min
      const numericRange = values.filter((v) => typeof v === 'number' || !isNaN(Number(v))).map(Number);
      if (numericRange.length === 0) return null;
      return Math.max(...numericRange) - Math.min(...numericRange);

    case 'earliest_date':
      // Find the earliest date in the values
      const dates = values
        .map((v) => (v instanceof Date ? v : new Date(v)))
        .filter((d) => d instanceof Date && !isNaN(d.getTime()));
      return dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))) : null;

    case 'latest_date':
      // Find the latest date in the values
      const latestDates = values
        .map((v) => (v instanceof Date ? v : new Date(v)))
        .filter((d) => d instanceof Date && !isNaN(d.getTime()));
      return latestDates.length > 0 ? new Date(Math.max(...latestDates.map((d) => d.getTime()))) : null;

    case 'date_range':
      // Calculate the number of days between earliest and latest dates
      const allDates = values
        .map((v) => (v instanceof Date ? v : new Date(v)))
        .filter((d) => d instanceof Date && !isNaN(d.getTime()));
      if (allDates.length === 0) return null;
      const earliest = Math.min(...allDates.map((d) => d.getTime()));
      const latest = Math.max(...allDates.map((d) => d.getTime()));
      return Math.floor((latest - earliest) / (1000 * 60 * 60 * 24)); // Convert milliseconds to days

    case 'percent_empty':
      // Calculate percentage of empty values
      const totalCount = values.length;
      const emptyCount = values.filter((v) => v === null || v === undefined || v === '').length;
      return totalCount > 0 ? (emptyCount / totalCount) * 100 : 0;

    case 'percent_not_empty':
      // Calculate percentage of non-empty values
      const total = values.length;
      const notEmpty = values.filter((v) => v !== null && v !== undefined && v !== '').length;
      return total > 0 ? (notEmpty / total) * 100 : 0;

    case 'show_unique':
      // Return array of unique values
      return Array.from(new Set(values));

    case 'show_original':
      // Return all values as-is
      return values;

    default:
      return null;
  }
};

// Function to evaluate formula expressions
// Formulas are like spreadsheet formulas that calculate values based on page properties
// WARNING: This uses eval-like functionality which can be unsafe in production
export const evaluateFormula = (
  formula: FormulaProperty,
  context: FormulaContext
): FormulaResult => {
  try {
    // Start with the formula expression
    let expression = formula.expression;

    // Replace property references with their actual values
    // Example: prop("Title") becomes the actual title value
    expression = expression.replace(/prop\("([^"]+)"\)/g, (_, propName) => {
      const value = context.properties[propName];
      if (value === undefined) return 'null';
      if (typeof value === 'string') return `"${value}"`;
      return String(value);
    });

    // Replace date functions with their values
    // now() returns current timestamp in milliseconds
    expression = expression.replace(/now\(\)/g, String(context.now.getTime()));
    // today() returns today's date at midnight
    expression = expression.replace(/today\(\)/g, String(new Date().setHours(0, 0, 0, 0)));

    // Replace page property references
    expression = expression.replace(/page\.title/g, `"${context.page.title}"`);
    expression = expression.replace(/page\.createdAt/g, String(context.page.createdAt.getTime()));

    // Evaluate the expression
    // WARNING: Using Function constructor is similar to eval and should be sandboxed in production
    const result = new Function(`return ${expression}`)();

    // Return the result with its type
    return {
      value: result,
      type: typeof result === 'number'
        ? 'number'
        : typeof result === 'boolean'
        ? 'boolean'
        : result instanceof Date
        ? 'date'
        : 'text',
    };
  } catch (error: any) {
    // If formula evaluation fails, return an error result
    return {
      value: null,
      type: 'error',
      error: error.message || 'Formula evaluation failed',
    };
  }
};

// Function to create a two-way relation between pages
// When page A links to page B, page B also links back to page A
export const createBidirectionalRelation = (
  sourcePage: Page,
  targetPage: Page,
  sourcePropertyName: string,
  reversePropertyName: string
): { sourcePage: Page; targetPage: Page } => {
  // Add the forward relation from source to target
  const updatedSource = addRelation(sourcePage, sourcePropertyName, targetPage.id, [targetPage]);

  // Create the reverse relation on the target page
  const targetProperties = (targetPage as any).properties || {};
  const reverseRelation: RelationProperty = {
    type: 'relation',
    name: reversePropertyName,
    linkedPageIds: [sourcePage.id],
    bidirectional: true,
  };

  // Update the target page with the reverse relation
  const updatedTarget = {
    ...targetPage,
    properties: {
      ...targetProperties,
      [reversePropertyName]: reverseRelation,
    },
    updatedAt: new Date(),
  } as Page;

  // Return both updated pages
  return { sourcePage: updatedSource, targetPage: updatedTarget };
};

// Function to filter pages that have a relation to a specific target page
// Useful for finding all pages that link to a particular page
export const filterPagesByRelation = (
  pages: Page[],
  relationPropertyName: string,
  targetPageId: string
): Page[] => {
  return pages.filter((page) => {
    // Get the page's properties
    const properties = (page as any).properties as Record<string, DatabaseProperty> | undefined;
    if (!properties) return false;

    // Check if the relation property exists
    const relationProp = properties[relationPropertyName];
    if (!relationProp || relationProp.type !== 'relation') return false;

    // Check if this relation includes the target page ID
    return relationProp.linkedPageIds?.includes(targetPageId) || false;
  });
};