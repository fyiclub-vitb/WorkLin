import React, { useMemo } from 'react';
import { Page } from '../../types/workspace';
import { RollupProperty as RollupPropertyType } from '../../types/database';
import { calculateRollup } from '../../lib/database/relations';
import { Calculator, TrendingUp, Hash } from 'lucide-react';

interface RollupPropertyProps {
  page: Page;
  property: RollupPropertyType;
  allPages: Page[];
}

export const RollupProperty: React.FC<RollupPropertyProps> = ({
  page,
  property,
  allPages,
}) => {
  // Calculate the rollup value
  const rollupValue = useMemo(
    () => calculateRollup(page, property, allPages),
    [page, property, allPages]
  );

  // Format the display value based on aggregation type
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '—';
    }

    switch (property.aggregation) {
      case 'count':
      case 'count_unique':
        return String(value);

      case 'sum':
      case 'average':
      case 'min':
      case 'max':
      case 'median':
      case 'range':
        return typeof value === 'number' ? value.toFixed(2) : String(value);

      case 'percent_empty':
      case 'percent_not_empty':
        return `${Number(value).toFixed(1)}%`;

      case 'earliest_date':
      case 'latest_date':
        return value instanceof Date
          ? value.toLocaleDateString()
          : new Date(value).toLocaleDateString();

      case 'date_range':
        return `${value} days`;

      case 'show_unique':
      case 'show_original':
        return Array.isArray(value) ? value.join(', ') : String(value);

      default:
        return String(value);
    }
  };

  // Get icon based on aggregation type
  const getIcon = () => {
    switch (property.aggregation) {
      case 'count':
      case 'count_unique':
        return <Hash size={16} className="text-purple-500" />;
      case 'sum':
      case 'average':
        return <Calculator size={16} className="text-green-500" />;
      case 'min':
      case 'max':
      case 'median':
      case 'range':
        return <TrendingUp size={16} className="text-blue-500" />;
      default:
        return <Calculator size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
        {getIcon()}
        {property.name}
      </label>

      {/* Rollup Value Display */}
      <div className="px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-md">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
            {property.aggregation.replace(/_/g, ' ')}
          </span>
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {formatValue(rollupValue)}
          </span>
        </div>
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          From {property.relationProperty} → {property.targetProperty}
        </div>
      </div>
    </div>
  );
};