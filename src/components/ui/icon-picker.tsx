import React from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import * as Popover from "@radix-ui/react-popover";

/**
 * Props for the IconPicker component
 */
interface IconPickerProps {
  onChange: (icon: string) => void; // Callback function that receives the selected emoji
  children: React.ReactNode; // The trigger element (usually a button or current icon display)
  asChild?: boolean; // If true, merges props with the child element instead of wrapping it
}

/**
 * IconPicker Component
 * 
 * A popup emoji picker that lets users select icons for their pages or other items.
 * Used throughout the app wherever users can customize icons.
 * 
 * How it works:
 * 1. User clicks on the trigger (children prop)
 * 2. A popover opens with the emoji picker
 * 3. User selects an emoji
 * 4. onChange callback fires with the selected emoji
 * 5. Popover automatically closes
 * 
 * The picker automatically adapts to dark mode based on system preferences.
 */
export const IconPicker: React.FC<IconPickerProps> = ({
  onChange,
  children,
  asChild,
}) => {
  // Detect if the user prefers dark mode
  // This checks the system/browser preference, not our app's dark mode toggle
  // We do this to style the emoji picker to match the user's system theme
  const currentTheme = (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) 
    ? Theme.DARK 
    : Theme.LIGHT;

  return (
    // Popover.Root manages the open/close state
    <Popover.Root>
      {/* The trigger - whatever element the user clicks to open the picker */}
      {/* asChild prop lets us merge with the child instead of wrapping it */}
      <Popover.Trigger asChild={asChild}>
        {children}
      </Popover.Trigger>
      
      {/* Portal renders the popover outside the normal DOM tree */}
      {/* This prevents z-index and overflow issues */}
      <Popover.Portal>
        {/* The actual popover content */}
        <Popover.Content className="z-50 border-none shadow-none drop-shadow-md bg-transparent data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
          {/* The actual emoji picker component from emoji-picker-react library */}
          {/* It comes with search, categories, recent emojis, etc. */}
          <EmojiPicker
            height={350} // Fixed height to keep the picker consistent
            theme={currentTheme} // Dark or light theme based on system preference
            onEmojiClick={(data) => onChange(data.emoji)} // When user picks an emoji, call our onChange callback
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};