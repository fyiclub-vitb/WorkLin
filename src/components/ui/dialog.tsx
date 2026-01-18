import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

/**
 * Dialog/Modal Components
 * 
 * This file implements a modal dialog system using Radix UI as the foundation.
 * Dialogs are those popup boxes that appear on top of the page, usually to:
 * - Show important information
 * - Confirm dangerous actions (like deleting something)
 * - Collect user input in forms
 * 
 * Radix UI handles the hard parts:
 * - Trapping keyboard focus inside the dialog
 * - Closing on Escape key
 * - Managing scroll lock on the body
 * - Screen reader announcements
 * - Preventing background interaction
 * 
 * We just style it to look nice.
 */

// Re-export Radix primitives with simpler names
const Dialog = DialogPrimitive.Root // Controls open/close state
const DialogTrigger = DialogPrimitive.Trigger // Button that opens the dialog
const DialogPortal = DialogPrimitive.Portal // Renders dialog in a portal (outside normal DOM tree)
const DialogClose = DialogPrimitive.Close // Button that closes the dialog

/**
 * DialogOverlay Component
 * 
 * The dark semi-transparent background that covers the page when a dialog is open.
 * This helps focus attention on the dialog and prevents clicking on things behind it.
 */
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      // Fixed positioning to cover entire viewport
      // Semi-transparent background with blur effect
      // Fade in/out animations when opening/closing
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

/**
 * DialogContent Component
 * 
 * The actual dialog box that contains your content.
 * Centered on screen with smooth animations when opening/closing.
 * Includes a close button in the top-right corner.
 */
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  // Portal ensures the dialog renders at the end of the document body
  // This prevents z-index stacking issues
  <DialogPortal>
    {/* First render the overlay (background) */}
    <DialogOverlay />
    
    {/* Then render the dialog content on top */}
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Position in center of screen using translate trick
        // Fixed width on desktop, full width on mobile
        // Smooth zoom and slide animations
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {/* Dialog content (title, description, form fields, etc.) */}
      {children}
      
      {/* Close button (X icon in top-right corner) */}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span> {/* Screen reader text */}
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

/**
 * DialogHeader Component
 * 
 * Container for the dialog title and description.
 * Centers text on mobile, left-aligns on desktop.
 * Adds vertical spacing between title and description.
 */
const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      // Flex column with spacing
      // Center on mobile, left-align on desktop (sm breakpoint)
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

/**
 * DialogFooter Component
 * 
 * Container for action buttons at the bottom of the dialog.
 * On mobile, buttons stack vertically.
 * On desktop, buttons appear in a row at the right side.
 */
const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      // Stack buttons vertically on mobile (col-reverse puts primary button at bottom)
      // Horizontal row on desktop with buttons at the end (right side)
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

/**
 * DialogTitle Component
 * 
 * The main heading of the dialog.
 * Important for accessibility - screen readers announce this when the dialog opens.
 */
const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      // Large, bold text for the dialog title
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

/**
 * DialogDescription Component
 * 
 * Secondary text that provides more context about the dialog.
 * Also important for accessibility - helps users understand the dialog's purpose.
 */
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      // Smaller, muted text
      "text-sm text-muted-foreground",
      className
    )}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

// Export all dialog components
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}