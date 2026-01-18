import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * Input Props Interface
 * 
 * Extends the standard HTML input element attributes.
 * This means our Input component accepts all normal input props
 * like type, placeholder, value, onChange, etc.
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Input Component
 * 
 * A styled text input field used throughout the app.
 * This is a wrapper around the standard HTML input element with consistent styling.
 * 
 * Features:
 * - Consistent height and padding
 * - Border with focus ring on focus
 * - Placeholder text styling
 * - Disabled state styling
 * - File input styling
 * - Full width by default
 * 
 * Usage examples:
 * <Input type="text" placeholder="Enter your name" />
 * <Input type="email" value={email} onChange={handleChange} />
 * <Input type="password" disabled />
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type} // The input type (text, email, password, etc.)
        className={cn(
          // Base input styles that apply to all inputs
          // Flexbox for consistent height and alignment
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          
          // File input specific styles
          // Removes default file input styling and applies custom font styles
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          
          // Placeholder text styling
          // Uses muted color to indicate it's not actual content
          "placeholder:text-muted-foreground",
          
          // Focus state styling
          // Removes default browser outline and adds custom ring
          // The ring stands out but doesn't add to the element's size
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          
          // Disabled state styling
          // Prevents interaction and reduces opacity to show it's not usable
          "disabled:cursor-not-allowed disabled:opacity-50",
          
          className // Allow custom classes to override or extend these styles
        )}
        ref={ref} // Forward ref so parent components can access the DOM node
        {...props} // Spread all other props (value, onChange, placeholder, etc.)
      />
    )
  }
)

// Set display name for better debugging in React DevTools
Input.displayName = "Input"

export { Input }