module.exports = {
  apps: [
    {
      name: "moph-portal-backend",
      script: "./backend/server.js",
      cwd: "/var/www/moph-portal",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        HOST: "0.0.0.0",
      },
      env_file: "/var/www/moph-portal/.env",
      error_file: "/var/log/moph-portal/backend-error.log",
      out_file: "/var/log/moph-portal/backend-out.log",
      time: true
    },
    {
      name: "moph-portal-frontend",
      script: "serve",
      cwd: "/var/www/moph-portal",
      args: ["-s", "frontend", "-l", "3000", "--cors", "--single"],
      env: {
        PM2_SERVE_PATH: "frontend",
        PM2_SERVE_PORT: 3000,
        PM2_SERVE_SPA: "true",
        PM2_SERVE_HOMEPAGE: "/index.html"
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
    },
  ],
};
