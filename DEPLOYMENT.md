# MOPH Portal Deployment Guide

This guide explains how to deploy the MOPH Portal application to a Linux server.

## Prerequisites

1. Linux server with SSH access (Ubuntu 20.04/22.04 recommended)
2. Node.js 16+ and npm installed
3. PM2 installed globally (`npm install -g pm2`)
4. Nginx installed (`sudo apt install nginx`)
5. MySQL/MariaDB server (if using a separate database server)

## Server Setup

1. **Update system packages**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install required packages**
   ```bash
   sudo apt install -y git nginx
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

## Deployment Steps

1. **On your local machine**, prepare the deployment package:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

2. **On the server**, set up the application:
   ```bash
   # Create necessary directories
   sudo mkdir -p /var/log/moph-portal
   sudo chown -R $USER:$USER /var/log/moph-portal
   
   # Install Nginx config
   sudo cp nginx-moph-portal.conf /etc/nginx/sites-available/moph-portal
   sudo ln -sf /etc/nginx/sites-available/moph-portal /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   
   # Set up firewall (if ufw is enabled)
   sudo ufw allow 80/tcp
   sudo ufw allow 22/tcp
   ```

3. **Configure environment variables** in `/var/www/moph-portal/.env`

4. **Start the application**
   ```bash
   cd /var/www/moph-portal
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## Maintenance

- **View logs**: `pm2 logs`
- **Restart services**: `pm2 restart all`
- **Update application**:
  ```bash
  cd /var/www/moph-portal
  git pull
  npm install
  npm run build
  pm2 restart all
  ```

## Troubleshooting

1. **Check PM2 status**: `pm2 status`
2. **View logs**: `pm2 logs`
3. **Check Nginx logs**: `sudo tail -f /var/log/nginx/error.log`
4. **Check application logs**:
   ```bash
   tail -f /var/log/moph-portal/backend-error.log
   tail -f /var/log/moph-portal/backend-out.log
   ```

## Security Considerations

1. Always use HTTPS in production (use Let's Encrypt for free SSL certificates)
2. Keep your server and dependencies updated
3. Use strong passwords for all accounts
4. Regularly backup your database
5. Monitor server resources and logs
