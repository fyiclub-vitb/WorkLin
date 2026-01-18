import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast"
import { useToast } from "../../hooks/use-toast"

/**
 * Toaster Component
 * 
 * This is the top-level component that actually displays all the toasts on the screen.
 * You add this once to your app (usually in App.tsx or a layout component) and it handles
 * showing all the toast notifications that get triggered throughout your app.
 * 
 * How it works:
 * 1. The useToast hook keeps track of all active toasts in a global store
 * 2. This component subscribes to that store and renders each toast
 * 3. When you call toast() anywhere in the app, it adds a new toast to the store
 * 4. This component automatically picks it up and displays it
 * 5. Toasts auto-dismiss after a few seconds (configured in the hook)
 */
export function Toaster() {
  // Get the list of all currently active toasts from the global toast store
  const { toasts } = useToast()

  return (
    // ToastProvider wraps everything and provides context for toast management
    <ToastProvider>
      {/* Loop through each toast and render it */}
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          // Each toast needs a unique key for React to track it properly
          <Toast key={id} {...props}>
            {/* Main content area of the toast */}
            <div className="grid gap-1">
              {/* Show title if provided (like "Success" or "Error") */}
              {title && <ToastTitle>{title}</ToastTitle>}
              
              {/* Show description if provided (detailed message) */}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            
            {/* Optional action button (like "Undo" or "View") */}
            {action}
            
            {/* The X button to close the toast manually */}
            <ToastClose />
          </Toast>
        )
      })}
      
      {/* This is the container that positions all toasts on screen */}
      {/* It's empty but necessary for proper positioning */}
      <ToastViewport />
    </ToastProvider>
  )
}