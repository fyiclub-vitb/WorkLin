import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

/**
 * Toast Notification System
 * 
 * This file implements the toast notification components used throughout the app.
 * Toasts are those little notification boxes that pop up to tell you something happened,
 * like "Page created successfully" or "Error saving changes".
 * 
 * We're using Radix UI as the foundation because it handles all the accessibility
 * and keyboard navigation stuff for us. We just style it to match our design.
 */

// Re-export the ToastProvider from Radix
// This wraps our app and manages all the toast notifications
const ToastProvider = ToastPrimitives.Provider

/**
 * ToastViewport Component
 * 
 * This is the container that holds all active toasts on the screen.
 * It's positioned at the bottom-right corner (on desktop) or top (on mobile).
 * You don't see it directly, but it controls where toasts appear.
 */
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      // Position fixed so it stays in place when scrolling
      // On mobile (sm breakpoint), toasts appear at bottom-right
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

/**
 * Toast Variants Configuration
 * 
 * This defines the different styles toasts can have.
 * We use CVA (class-variance-authority) to manage the different variants.
 * Currently we have:
 * - default: Normal gray toast for general info
 * - destructive: Red toast for errors or warnings
 */
const toastVariants = cva(
  // Base styles that apply to all toasts
  // The data-[state] and data-[swipe] attributes handle animations
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Toast Component
 * 
 * The main toast notification component.
 * This is the actual box that shows up with your message.
 */
const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

/**
 * ToastAction Component
 * 
 * This is an optional button you can add to toasts.
 * For example, if a page gets deleted, you could have an "Undo" action button.
 */
const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      // Styled to look like a small button
      // The group-[.destructive] classes make it match red toasts
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

/**
 * ToastClose Component
 * 
 * The little X button in the corner that lets you dismiss the toast manually.
 * Normally toasts auto-dismiss after a few seconds, but this gives users control.
 */
const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      // Positioned in the top-right corner
      // Fades in when you hover over the toast (opacity-0 to group-hover:opacity-100)
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close="" // Custom attribute for styling purposes
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

/**
 * ToastTitle Component
 * 
 * The bold text at the top of the toast.
 * This is usually a short message like "Success!" or "Error"
 */
const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

/**
 * ToastDescription Component
 * 
 * The secondary text that provides more details.
 * For example, if the title is "Page created", the description might be
 * "Your new page has been saved successfully"
 */
const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

// TypeScript type definitions for better autocomplete and type safety
type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>
type ToastActionElement = React.ReactElement<typeof ToastAction>

// Export everything so other components can use the toast system
export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}