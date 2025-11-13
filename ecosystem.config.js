const path = require('path');
const appDir = __dirname;

module.exports = {
  apps: [
    {
      name: "moph-portal-backend",
      script: "./server/server.js",
      cwd: appDir,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        HOST: "0.0.0.0",
      },
      env_file: "./.env",
      error_file: "./logs/backend-error.log",
      out_file: "./logs/backend-out.log",
      time: true
    },
    {
      name: "moph-portal-frontend",
      script: "serve",
      cwd: appDir,
      args: ["-s", "dist", "-l", "3000", "--cors", "--single"],
      env: {
        PM2_SERVE_PATH: "dist",
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
