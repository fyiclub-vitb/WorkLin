import React, { useState } from 'react';
import { Page } from '../types/workspace';
import { DatabaseProperty } from '../types/database';
import { RelationProperty } from './database/RelationProperty';
import { RollupProperty } from './database/RollupProperty';
import { FormulaProperty } from './database/FormulaProperty';
import { Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

interface PagePropertiesProps {
  page: Page;
  allPages: Page[];
  onUpdatePage: (pageId: string, updates: Partial<Page>) => void;
}

export const PageProperties: React.FC<PagePropertiesProps> = ({
  page,
  allPages,
  onUpdatePage,
}) => {
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [newPropertyType, setNewPropertyType] = useState<'relation' | 'rollup' | 'formula'>('relation');
  const [newPropertyName, setNewPropertyName] = useState('');

  const pageProperties = (page as any).properties || {};

  const handleAddProperty = () => {
    if (!newPropertyName.trim()) return;

    let newProperty: DatabaseProperty;

    switch (newPropertyType) {
      case 'relation':
        newProperty = {
          type: 'relation',
          name: newPropertyName,
          linkedPageIds: [],
          bidirectional: false,
        };
        break;
      case 'rollup':
        newProperty = {
          type: 'rollup',
          name: newPropertyName,
          relationProperty: '', // User will configure
          targetProperty: '',
          aggregation: 'count',
        };
        break;
      case 'formula':
        newProperty = {
          type: 'formula',
          name: newPropertyName,
          expression: '',
          returnType: 'text',
        };
        break;
    }

    const updatedProperties = {
      ...pageProperties,
      [newPropertyName]: newProperty,
    };

    onUpdatePage(page.id, { properties: updatedProperties } as any);
    setNewPropertyName('');
    setShowAddProperty(false);
  };

  const handleRemoveProperty = (propertyName: string) => {
    const { [propertyName]: removed, ...rest } = pageProperties;
    onUpdatePage(page.id, { properties: rest } as any);
  };

  return (
    <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Database Properties
        </h3>
        <Dialog open={showAddProperty} onOpenChange={setShowAddProperty}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus size={16} className="mr-2" />
              Add Property
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Database Property</DialogTitle>
              <DialogDescription>
                Choose a property type and give it a name
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Property Type</label>
                <select
                  value={newPropertyType}
                  onChange={(e) => setNewPropertyType(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="relation">Relation</option>
                  <option value="rollup">Rollup</option>
                  <option value="formula">Formula</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Property Name</label>
                <input
                  type="text"
                  value={newPropertyName}
                  onChange={(e) => setNewPropertyName(e.target.value)}
                  placeholder="e.g., Related Tasks"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                />
              </div>
              <Button onClick={handleAddProperty} disabled={!newPropertyName.trim()}>
                Add Property
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {Object.keys(pageProperties).length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-sm">No database properties yet</p>
          <p className="text-xs mt-1">Click "Add Property" to create relations, rollups, or formulas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(pageProperties).map(([name, property]: [string, any]) => (
            <div key={name} className="relative">
              <button
                onClick={() => handleRemoveProperty(name)}
                className="absolute -right-2 -top-2 p-1 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-full text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove property"
              >
                <X size={12} />
              </button>

              {property.type === 'relation' && (
                <RelationProperty
                  page={page}
                  property={property}
                  propertyName={name}
                  allPages={allPages}
                  onUpdate={(updatedPage) => onUpdatePage(updatedPage.id, updatedPage)}
                />
              )}

              {property.type === 'rollup' && (
                <RollupProperty page={page} property={property} allPages={allPages} />
              )}

              {property.type === 'formula' && (
                <FormulaProperty page={page} property={property} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};