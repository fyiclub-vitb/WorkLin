import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { cn } from '../../lib/utils'; // Assuming this exists, based on TipTapEditor usage

interface MentionPopoverProps {
    items: any[];
    command: (item: any) => void;
}

export const MentionPopover = forwardRef((props: MentionPopoverProps, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
        const item = props.items[index];
        if (item) {
            props.command(item);
        }
    };

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
    };

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
        selectItem(selectedIndex);
    };

    useEffect(() => {
        setSelectedIndex(0);
    }, [props.items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                upHandler();
                return true;
            }

            if (event.key === 'ArrowDown') {
                downHandler();
                return true;
            }

            if (event.key === 'Enter') {
                enterHandler();
                return true;
            }

            return false;
        },
    }));

    if (!props.items?.length) {
        return null;
    }

    return (
        <div className="z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="p-1 max-h-[200px] overflow-y-auto">
                {props.items.map((item, index) => (
                    <button
                        className={cn(
                            "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-left",
                            index === selectedIndex ? "bg-accent text-accent-foreground bg-gray-100 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-700",
                        )}
                        key={index}
                        onClick={() => selectItem(index)}
                    >
                        {item.icon && <span className="mr-2 h-4 w-4 opacity-70">{item.icon}</span>}
                        <span className="flex-1 truncate">{item.label || item.title || item.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
});

MentionPopover.displayName = 'MentionPopover';
