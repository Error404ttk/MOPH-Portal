// Environment configuration
export const config = {
  // Use environment variables in production, fallback to localhost in development
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  // Add other environment-specific variables here
} as const;
