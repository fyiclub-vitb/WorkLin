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

/**
 * Get all pages related through a relation property
 */
export const getRelatedPages = (
  page: Page,
  relationPropertyName: string,
  allPages: Page[]
): Page[] => {
  const properties = (page as any).properties as Record<string, DatabaseProperty> | undefined;
  if (!properties) return [];

  const relationProp = properties[relationPropertyName];
  if (!relationProp || relationProp.type !== 'relation') return [];

  const linkedIds = relationProp.linkedPageIds || [];
  return allPages.filter((p) => linkedIds.includes(p.id));
};

/**
 * Add a relation link between two pages
 */
export const addRelation = (
  sourcePage: Page,
  relationPropertyName: string,
  targetPageId: string,
  allPages: Page[]
): Page => {
  const properties = (sourcePage as any).properties || {};
  const relationProp = properties[relationPropertyName] as RelationProperty;

  if (!relationProp || relationProp.type !== 'relation') {
    throw new Error('Relation property not found');
  }

  const linkedIds = relationProp.linkedPageIds || [];
  if (linkedIds.includes(targetPageId)) {
    return sourcePage; // Already linked
  }

  const updatedProp: RelationProperty = {
    ...relationProp,
    linkedPageIds: [...linkedIds, targetPageId],
  };

  return {
    ...sourcePage,
    properties: {
      ...properties,
      [relationPropertyName]: updatedProp,
    },
    updatedAt: new Date(),
  } as Page;
};

/**
 * Remove a relation link
 */
export const removeRelation = (
  sourcePage: Page,
  relationPropertyName: string,
  targetPageId: string
): Page => {
  const properties = (sourcePage as any).properties || {};
  const relationProp = properties[relationPropertyName] as RelationProperty;

  if (!relationProp || relationProp.type !== 'relation') {
    return sourcePage;
  }

  const linkedIds = relationProp.linkedPageIds || [];
  const updatedProp: RelationProperty = {
    ...relationProp,
    linkedPageIds: linkedIds.filter((id) => id !== targetPageId),
  };

  return {
    ...sourcePage,
    properties: {
      ...properties,
      [relationPropertyName]: updatedProp,
    },
    updatedAt: new Date(),
  } as Page;
};

/**
 * Calculate rollup property value
 */
export const calculateRollup = (
  page: Page,
  rollupProperty: RollupProperty,
  allPages: Page[]
): any => {
  // Get related pages through the relation property
  const relatedPages = getRelatedPages(page, rollupProperty.relationProperty, allPages);

  if (relatedPages.length === 0) {
    return rollupProperty.aggregation === 'count' ? 0 : null;
  }

  // Extract target property values from related pages
  const values = relatedPages
    .map((p) => {
      const propValues = (p as any).propertyValues || {};
      return propValues[rollupProperty.targetProperty];
    })
    .filter((v) => v !== undefined && v !== null);

  return aggregateValues(values, rollupProperty.aggregation);
};

/**
 * Aggregate values based on aggregation type
 */
const aggregateValues = (values: any[], aggregation: RollupAggregation): any => {
  if (values.length === 0) {
    return aggregation === 'count' ? 0 : null;
  }

  switch (aggregation) {
    case 'count':
      return values.length;

    case 'count_unique':
      return new Set(values).size;

    case 'sum':
      return values.reduce((sum, val) => sum + (Number(val) || 0), 0);

    case 'average':
      const numValues = values.filter((v) => typeof v === 'number' || !isNaN(Number(v)));
      if (numValues.length === 0) return null;
      return numValues.reduce((sum, val) => sum + Number(val), 0) / numValues.length;

    case 'min':
      const numericMin = values.filter((v) => typeof v === 'number' || !isNaN(Number(v)));
      return numericMin.length > 0 ? Math.min(...numericMin.map(Number)) : null;

    case 'max':
      const numericMax = values.filter((v) => typeof v === 'number' || !isNaN(Number(v)));
      return numericMax.length > 0 ? Math.max(...numericMax.map(Number)) : null;

    case 'median':
      const numericMedian = values
        .filter((v) => typeof v === 'number' || !isNaN(Number(v)))
        .map(Number)
        .sort((a, b) => a - b);
      if (numericMedian.length === 0) return null;
      const mid = Math.floor(numericMedian.length / 2);
      return numericMedian.length % 2 === 0
        ? (numericMedian[mid - 1] + numericMedian[mid]) / 2
        : numericMedian[mid];

    case 'range':
      const numericRange = values.filter((v) => typeof v === 'number' || !isNaN(Number(v))).map(Number);
      if (numericRange.length === 0) return null;
      return Math.max(...numericRange) - Math.min(...numericRange);

    case 'earliest_date':
      const dates = values
        .map((v) => (v instanceof Date ? v : new Date(v)))
        .filter((d) => d instanceof Date && !isNaN(d.getTime()));
      return dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))) : null;

    case 'latest_date':
      const latestDates = values
        .map((v) => (v instanceof Date ? v : new Date(v)))
        .filter((d) => d instanceof Date && !isNaN(d.getTime()));
      return latestDates.length > 0 ? new Date(Math.max(...latestDates.map((d) => d.getTime()))) : null;

    case 'date_range':
      const allDates = values
        .map((v) => (v instanceof Date ? v : new Date(v)))
        .filter((d) => d instanceof Date && !isNaN(d.getTime()));
      if (allDates.length === 0) return null;
      const earliest = Math.min(...allDates.map((d) => d.getTime()));
      const latest = Math.max(...allDates.map((d) => d.getTime()));
      return Math.floor((latest - earliest) / (1000 * 60 * 60 * 24)); // Days

    case 'percent_empty':
      const totalCount = values.length;
      const emptyCount = values.filter((v) => v === null || v === undefined || v === '').length;
      return totalCount > 0 ? (emptyCount / totalCount) * 100 : 0;

    case 'percent_not_empty':
      const total = values.length;
      const notEmpty = values.filter((v) => v !== null && v !== undefined && v !== '').length;
      return total > 0 ? (notEmpty / total) * 100 : 0;

    case 'show_unique':
      return Array.from(new Set(values));

    case 'show_original':
      return values;

    default:
      return null;
  }
};

/**
 * Evaluate a formula expression
 */
export const evaluateFormula = (
  formula: FormulaProperty,
  context: FormulaContext
): FormulaResult => {
  try {
    // Simple formula parser - supports basic operations
    // In production, you'd use a proper expression parser like mathjs
    let expression = formula.expression;

    // Replace property references: prop("PropertyName")
    expression = expression.replace(/prop\("([^"]+)"\)/g, (_, propName) => {
      const value = context.properties[propName];
      if (value === undefined) return 'null';
      if (typeof value === 'string') return `"${value}"`;
      return String(value);
    });

    // Replace date functions
    expression = expression.replace(/now\(\)/g, String(context.now.getTime()));
    expression = expression.replace(/today\(\)/g, String(new Date().setHours(0, 0, 0, 0)));

    // Replace page properties
    expression = expression.replace(/page\.title/g, `"${context.page.title}"`);
    expression = expression.replace(/page\.createdAt/g, String(context.page.createdAt.getTime()));

    // Evaluate the expression safely
    // WARNING: In production, use a proper sandboxed evaluator
    const result = new Function(`return ${expression}`)();

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
    return {
      value: null,
      type: 'error',
      error: error.message || 'Formula evaluation failed',
    };
  }
};

/**
 * Create bidirectional relation
 */
export const createBidirectionalRelation = (
  sourcePage: Page,
  targetPage: Page,
  sourcePropertyName: string,
  reversePropertyName: string
): { sourcePage: Page; targetPage: Page } => {
  // Add forward relation
  const updatedSource = addRelation(sourcePage, sourcePropertyName, targetPage.id, [targetPage]);

  // Add reverse relation
  const targetProperties = (targetPage as any).properties || {};
  const reverseRelation: RelationProperty = {
    type: 'relation',
    name: reversePropertyName,
    linkedPageIds: [sourcePage.id],
    bidirectional: true,
  };

  const updatedTarget = {
    ...targetPage,
    properties: {
      ...targetProperties,
      [reversePropertyName]: reverseRelation,
    },
    updatedAt: new Date(),
  } as Page;

  return { sourcePage: updatedSource, targetPage: updatedTarget };
};

/**
 * Filter pages by relation
 */
export const filterPagesByRelation = (
  pages: Page[],
  relationPropertyName: string,
  targetPageId: string
): Page[] => {
  return pages.filter((page) => {
    const properties = (page as any).properties as Record<string, DatabaseProperty> | undefined;
    if (!properties) return false;

    const relationProp = properties[relationPropertyName];
    if (!relationProp || relationProp.type !== 'relation') return false;

    return relationProp.linkedPageIds?.includes(targetPageId) || false;
  });
};