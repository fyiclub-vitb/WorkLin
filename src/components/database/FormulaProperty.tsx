import React, { useMemo } from 'react';
import { Page } from '../../types/workspace';
import { FormulaProperty as FormulaPropertyType, FormulaContext } from '../../types/database';
import { evaluateFormula } from '../../lib/database/relations';
import { Binary, AlertCircle, CheckCircle } from 'lucide-react';

interface FormulaPropertyProps {
  page: Page;
  property: FormulaPropertyType;
}

// This component shows a calculated field based on a formula
// Like Excel formulas but for our database pages
export const FormulaProperty: React.FC<FormulaPropertyProps> = ({ page, property }) => {
  // Build the context object with all the data the formula can access
  const context: FormulaContext = useMemo(
    () => ({
      properties: (page as any).propertyValues || {}, // All the page's properties
      now: new Date(), // Current date/time
      page: {
        title: page.title,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
      },
    }),
    [page]
  );

  // Run the formula and get the result
  const result = useMemo(() => evaluateFormula(property, context), [property, context]);

  // Format the value nicely based on what type it is
  const formatValue = (value: any, type: string): string => {
    if (value === null || value === undefined) {
      return '—'; // Show a dash for empty values
    }

    switch (type) {
      case 'number':
        return typeof value === 'number' ? value.toFixed(2) : String(value);
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'date':
        return value instanceof Date
          ? value.toLocaleDateString()
          : new Date(value).toLocaleDateString();
      case 'text':
      default:
        return String(value);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <Binary size={16} className="text-orange-500" />
        {property.name}
      </label>

      {/* Show the formula result or error */}
      <div
        className={`px-4 py-3 rounded-md border ${
          result.type === 'error'
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
        }`}
      >
        {result.type === 'error' ? (
          // Show error message if formula failed
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-900 dark:text-red-200">Formula Error</p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">{result.error}</p>
            </div>
          </div>
        ) : (
          // Show the calculated result
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                {property.expression}
              </span>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {formatValue(result.value, result.type)}
            </span>
          </div>
        )}
      </div>

      {/* Show info about the formula */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>
          <strong>Return type:</strong> {property.returnType}
        </p>
        <p>
          <strong>Expression:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{property.expression}</code>
        </p>
      </div>
    </div>
  );
};