module.exports = {
  apps: [
    {
      name: "moph-portal-backend",
      script: "server.js", // Path to your backend entry file
      cwd: "./server", // Set the current working directory for the backend
      instances: 1,
      autorestart: true,
      watch: false, // Set to true for development, false for production
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_USER: process.env.DB_USER,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_DATABASE: process.env.DB_DATABASE,
      },
      env_file: "./server/.env",
    },
    {
      name: "moph-portal-frontend",
      script: "serve", // Use pm2's built-in static file server
      env: {
        PM2_SERVE_PATH: "./dist", // Directory where your frontend build output is located
        PM2_SERVE_PORT: 3000, // Port for the frontend (e.g., 3000)
        PM2_SERVE_SPA: "true", // Enable SPA mode for React Router
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
    },
  ],
};
