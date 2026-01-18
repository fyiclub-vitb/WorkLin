import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * Card Components
 * 
 * This file exports a set of components that work together to create card layouts.
 * Cards are those rectangular containers you see everywhere in modern UIs.
 * They group related information and make it stand out from the background.
 * 
 * The card system is split into parts:
 * - Card: The main container
 * - CardHeader: Top section (usually has title and description)
 * - CardTitle: The main heading
 * - CardDescription: Subtitle or explanation text
 * - CardContent: Main content area
 * - CardFooter: Bottom section (usually has actions/buttons)
 * 
 * You don't have to use all parts - mix and match based on what you need.
 */

/**
 * Card Component
 * 
 * The main container that wraps everything else.
 * Has rounded corners, a border, and a subtle shadow to make it "float" above the page.
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Base card styles - border, shadow, and semantic color tokens
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className // Allow custom classes to be added
    )}
    {...props}
  />
))
Card.displayName = "Card"

/**
 * CardHeader Component
 * 
 * The top section of the card where titles and descriptions go.
 * Uses flexbox column layout with vertical spacing between children.
 * Standard padding keeps content away from edges.
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Flex column with spacing and padding
      "flex flex-col space-y-1.5 p-6",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * CardTitle Component
 * 
 * The main heading of the card.
 * Renders as an h3 tag for proper semantic HTML and accessibility.
 * Large, bold text that clearly identifies what the card is about.
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      // Large, bold heading with tight line spacing
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * CardDescription Component
 * 
 * Secondary text that provides more context about the card.
 * Smaller and more muted than the title so it doesn't compete for attention.
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      // Smaller text with muted color
      "text-sm text-muted-foreground",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * CardContent Component
 * 
 * The main content area of the card.
 * This is where you put the actual information or UI elements.
 * Has padding on all sides except the top (since CardHeader already has padding).
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      // Padding on all sides except top
      "p-6 pt-0", 
      className
    )} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

/**
 * CardFooter Component
 * 
 * The bottom section of the card, usually for action buttons.
 * Uses flexbox to align items horizontally with padding.
 * Commonly contains "Save", "Cancel", "Submit" type buttons.
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Horizontal flexbox with padding, no top padding
      "flex items-center p-6 pt-0",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Export all card components so they can be used together
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }