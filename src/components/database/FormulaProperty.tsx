import React, { useMemo } from 'react';
import { Page } from '../../types/workspace';
import { FormulaProperty as FormulaPropertyType, FormulaContext } from '../../types/database';
import { evaluateFormula } from '../../lib/database/relations';
import { Binary, AlertCircle, CheckCircle } from 'lucide-react';

interface FormulaPropertyProps {
  page: Page;
  property: FormulaPropertyType;
}

export const FormulaProperty: React.FC<FormulaPropertyProps> = ({ page, property }) => {
  // Build formula context
  const context: FormulaContext = useMemo(
    () => ({
      properties: (page as any).propertyValues || {},
      now: new Date(),
      page: {
        title: page.title,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
      },
    }),
    [page]
  );

  // Evaluate the formula
  const result = useMemo(() => evaluateFormula(property, context), [property, context]);

  // Format the display value
  const formatValue = (value: any, type: string): string => {
    if (value === null || value === undefined) {
      return '—';
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

      {/* Formula Result Display */}
      <div
        className={`px-4 py-3 rounded-md border ${
          result.type === 'error'
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
        }`}
      >
        {result.type === 'error' ? (
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-900 dark:text-red-200">Formula Error</p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">{result.error}</p>
            </div>
          </div>
        ) : (
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

      {/* Formula Info */}
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