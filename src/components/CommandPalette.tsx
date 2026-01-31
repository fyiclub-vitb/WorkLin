import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { Input } from './ui/input';
import { Command, Search, Plus, Trash2, Copy, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export interface CommandItem {
  id: string;
  title: string;
  description?: string;
  category: 'page' | 'block' | 'view' | 'workspace' | 'settings';
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandItem[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  commands,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredCommands, setFilteredCommands] = useState<CommandItem[]>(commands);

  // Filter commands based on search
  useEffect(() => {
    if (!search) {
      setFilteredCommands(commands);
      setSelectedIndex(0);
      return;
    }

    const query = search.toLowerCase();
    const filtered = commands.filter(cmd =>
      cmd.title.toLowerCase().includes(query) ||
      cmd.description?.toLowerCase().includes(query) ||
      cmd.category.toLowerCase().includes(query)
    );

    setFilteredCommands(filtered);
    setSelectedIndex(0);
  }, [search, commands]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
          setSearch('');
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        setSearch('');
        break;
      default:
        break;
    }
  }, [filteredCommands, selectedIndex, onClose]);

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  const categoryLabels: Record<string, string> = {
    page: '📄 Pages',
    block: '🧱 Blocks',
    view: '👁️ Views',
    workspace: '🏢 Workspace',
    settings: '⚙️ Settings',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-2xl border-0 shadow-2xl rounded-lg overflow-hidden">
        <div className="bg-white dark:bg-slate-950 border-b dark:border-slate-800">
          <div className="flex items-center gap-3 px-6 py-4 border-b dark:border-slate-800">
            <Command size={18} className="text-gray-400" />
            <Input
              placeholder="Type a command or search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border-0 bg-transparent text-lg focus:outline-none focus:ring-0 placeholder:text-gray-400"
              autoFocus
            />
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-[400px] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <Search size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-600 dark:text-gray-400 text-center">
                No commands found for "{search}"
              </p>
            </div>
          ) : (
            <div className="px-4 py-4">
              {Object.entries(groupedCommands).map(([category, items]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                    {categoryLabels[category]}
                  </h3>
                  <div className="space-y-1">
                    {items.map((cmd, idx) => {
                      const globalIndex = filteredCommands.findIndex(c => c.id === cmd.id);
                      const isSelected = globalIndex === selectedIndex;

                      return (
                        <motion.button
                          key={cmd.id}
                          onClick={() => {
                            cmd.action();
                            onClose();
                            setSearch('');
                          }}
                          className={`w-full flex items-start gap-3 px-4 py-3 rounded-md transition-colors text-left ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'hover:bg-gray-100 dark:hover:bg-slate-800/50 text-gray-900 dark:text-gray-100'
                          }`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.02 }}
                        >
                          <div className={`mt-1 ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                            {cmd.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{cmd.title}</div>
                            {cmd.description && (
                              <div className={`text-sm ${
                                isSelected ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {cmd.description}
                              </div>
                            )}
                          </div>
                          {cmd.shortcut && (
                            <div className={`text-xs px-2 py-1 rounded ${
                              isSelected
                                ? 'bg-blue-500/30'
                                : 'bg-gray-100 dark:bg-slate-800'
                            }`}>
                              {cmd.shortcut}
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Tips */}
        {filteredCommands.length > 0 && (
          <div className="bg-gray-50 dark:bg-slate-900/50 border-t dark:border-slate-800 px-6 py-3 flex justify-between text-xs text-gray-500">
            <div className="flex gap-4">
              <span><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-xs">↑↓</kbd> Navigate</span>
              <span><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-xs">Enter</kbd> Select</span>
              <span><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-xs">Esc</kbd> Close</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
