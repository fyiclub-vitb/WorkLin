/** @type {import('tailwindcss').Config} */
export default {
  // Dark mode configuration
  // We use the "class" strategy, which means dark mode is enabled by adding a "dark" class to the html element
  // The alternative would be "media" which uses the system preference
  darkMode: ["class"],
  
  // Content paths - tells Tailwind where to look for class names
  // It scans these files and only includes the CSS for classes that are actually used
  // This keeps the final CSS bundle small
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  
  // Theme customization
  theme: {
    extend: {
      // Custom breakpoints for responsive design
      screens: {
        'xs': '475px', // Extra small devices (larger phones)
                       // Default Tailwind breakpoints are sm:640px, md:768px, lg:1024px, xl:1280px
      },
      
      // Color system
      // These use CSS variables so they can be easily themed
      // The actual color values are defined in src/styles/index.css
      colors: {
        // Border colors for UI elements
        border: "hsl(var(--border))",
        
        // Input field colors
        input: "hsl(var(--input))",
        
        // Focus ring color (that outline you see when tabbing through elements)
        ring: "hsl(var(--ring))",
        
        // Main background and text colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // Primary brand color (usually blue in our case)
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))", // Text that goes on primary background
        },
        
        // Secondary color (used for less important elements)
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        
        // Destructive color (red, for delete buttons and errors)
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        
        // Muted color (gray, for disabled or less important elements)
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        
        // Accent color (for highlights and hover states)
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        
        // Popover colors (for dropdowns, tooltips, etc.)
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        
        // Card colors (for card components)
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      
      // Border radius tokens
      // These create consistent rounded corners throughout the app
      // The actual values are defined as CSS variables
      borderRadius: {
        lg: "var(--radius)",                    // Large radius (e.g., for cards)
        md: "calc(var(--radius) - 2px)",       // Medium radius (slightly smaller)
        sm: "calc(var(--radius) - 4px)",       // Small radius (even smaller)
      },
    },
  },
  
  // Plugins array
  // Currently empty, but you could add Tailwind plugins here
  // For example: @tailwindcss/forms, @tailwindcss/typography, etc.
  plugins: [],
}