import React from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import * as Popover from "@radix-ui/react-popover";

interface IconPickerProps {
  onChange: (icon: string) => void;
  children: React.ReactNode;
  asChild?: boolean;
}

export const IconPicker: React.FC<IconPickerProps> = ({
  onChange,
  children,
  asChild,
}) => {
  // We check if the user is in dark mode to style the picker accordingly
  const currentTheme = (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) 
    ? Theme.DARK 
    : Theme.LIGHT;

  return (
    <Popover.Root>
      <Popover.Trigger asChild={asChild}>
        {children}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="z-50 border-none shadow-none drop-shadow-md bg-transparent data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
          <EmojiPicker
            height={350}
            theme={currentTheme}
            onEmojiClick={(data) => onChange(data.emoji)}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};