// ESLint configuration file for Firebase Functions
// This file sets up the linting rules to keep our code clean and consistent

module.exports = {
  // This is the root config file, ESLint won't look for configs in parent directories
  root: true,
  
  // Define what environments our code will run in
  env: {
    es6: true,      // We're using ES6 features like arrow functions, promises, etc.
    node: true,     // This code runs in Node.js, not the browser
  },
  
  // We're extending recommended rule sets instead of defining everything from scratch
  extends: [
    "eslint:recommended",                      // Basic ESLint rules that catch common errors
    "plugin:@typescript-eslint/recommended",   // TypeScript-specific linting rules
  ],
  
  // Tell ESLint we're using TypeScript parser
  parser: "@typescript-eslint/parser",
  
  // Parser options to understand our project structure
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],  // Point to TypeScript config files
    sourceType: "module",                              // We're using ES modules (import/export)
  },
  
  // Don't lint the built files in the lib folder since they're auto-generated
  ignorePatterns: [
    "/lib/**/*",
  ],
  
  // Plugins add extra linting capabilities
  plugins: [
    "@typescript-eslint",  // Adds TypeScript-specific linting rules
  ],
  
  // Custom rules that override or add to the extended configs
  rules: {
    "quotes": ["error", "double"],     // Force double quotes instead of single quotes
    "import/no-unresolved": 0,         // Turn off the unresolved import check (sometimes causes false positives)
  },
};