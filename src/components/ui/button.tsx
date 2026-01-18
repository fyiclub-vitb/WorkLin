import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

/**
 * Button Variants Configuration
 * 
 * This uses CVA (class-variance-authority) to create a flexible button system.
 * Instead of writing separate button components for every style, we define
 * different "variants" and "sizes" that can be combined.
 * 
 * Think of it like a character creator in a game where you pick:
 * - Variant (the overall style/color scheme)
 * - Size (how big the button should be)
 */
const buttonVariants = cva(
  // Base styles that apply to ALL buttons regardless of variant or size
  // These handle things like layout, transitions, focus states, and disabled states
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      // Different visual styles for buttons
      variant: {
        // Default button - the primary blue button you see most often
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        
        // Destructive button - red, used for dangerous actions like delete
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        
        // Outline button - transparent with a border, less prominent
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        
        // Secondary button - gray, used for less important actions
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        
        // Ghost button - completely transparent until you hover
        // Good for icon buttons or subtle actions
        ghost: "hover:bg-accent hover:text-accent-foreground",
        
        // Link button - looks like a text link with underline
        link: "text-primary underline-offset-4 hover:underline",
      },
      
      // Different sizes for buttons
      size: {
        // Default size - used for most buttons in forms and dialogs
        default: "h-10 px-4 py-2",
        
        // Small size - used in tight spaces or for less important actions
        sm: "h-9 rounded-md px-3",
        
        // Large size - used for primary CTAs (Call To Action) like "Sign Up"
        lg: "h-11 rounded-md px-8",
        
        // Icon size - perfect square for icon-only buttons
        icon: "h-10 w-10",
      },
    },
    
    // What happens if you don't specify a variant or size
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * Button Props Interface
 * 
 * Defines what properties you can pass to the Button component.
 * It extends the standard HTML button attributes plus our custom variants.
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean // Special prop that lets you render the button as a different element
                    // Useful when you want button styling on a link or other element
}

/**
 * Button Component
 * 
 * This is the main button component used throughout the entire app.
 * It's built with Radix UI's Slot component which gives us composition superpowers.
 * 
 * Usage examples:
 * <Button>Click me</Button>                           // Default blue button
 * <Button variant="destructive">Delete</Button>       // Red delete button
 * <Button variant="ghost" size="icon">...</Button>    // Icon-only ghost button
 * <Button asChild><a href="/home">Home</a></Button>   // Link styled as button
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // If asChild is true, use Slot which merges props with the child element
    // Otherwise, use a regular button element
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        // Combine the variant/size classes with any custom className passed in
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref} // Forward the ref for parent components to access the DOM node
        {...props} // Spread any other props (onClick, disabled, etc.)
      />
    )
  }
)

// Set display name for better debugging in React DevTools
Button.displayName = "Button"

// Export both the component and the variants function
// The variants function is exported so other components can reuse the same styles
export { Button, buttonVariants }