module.exports = {
  apps: [{
    name: 'moph-portal',
    script: 'server.js',
    watch: ['server.js', 'authMiddleware.js', 'config.json'],
    ignore_watch: ['node_modules'],
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
    }
  }]
};
