import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog'; // Adjust path if needed based on where you save this file
import { Keyboard, Command, Search, Bold, Italic, FileText } from 'lucide-react';

interface ShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ open, onOpenChange }) => {
  const groups = [
    {
      label: "General",
      items: [
        { icon: <Keyboard size={14} />, label: "Keyboard Shortcuts", keys: ["⌘", "?"] },
        { icon: <Command size={14} />, label: "Command Palette", keys: ["⌘", "K"] },
        { icon: <Search size={14} />, label: "Search", keys: ["⌘", "P"] },
      ]
    },
    {
      label: "Editing",
      items: [
        { icon: <Bold size={14} />, label: "Bold", keys: ["⌘", "B"] },
        { icon: <Italic size={14} />, label: "Italic", keys: ["⌘", "I"] },
        { icon: <Command size={14} />, label: "Slash Commands", keys: ["/"] },
      ]
    },
    {
      label: "Navigation",
      items: [
        { icon: <FileText size={14} />, label: "New Page", keys: ["⌘", "Shift", "N"] },
      ]
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Essential shortcuts to navigate WorkLin efficiently.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {groups.map((group) => (
            <div key={group.label} className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">{group.label}</h3>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 text-foreground">
                      <span className="text-muted-foreground">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, i) => (
                        <kbd
                          key={i}
                          className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};