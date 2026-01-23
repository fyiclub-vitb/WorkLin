// PostCSS configuration for processing CSS
// PostCSS transforms our CSS with plugins before it goes to the browser

export default {
  plugins: {
    // TailwindCSS processes all the utility classes and generates the final CSS
    tailwindcss: {},
    
    // Autoprefixer adds vendor prefixes (-webkit-, -moz-, etc.) for browser compatibility
    // This ensures our CSS works across different browsers
    autoprefixer: {},
  },
}