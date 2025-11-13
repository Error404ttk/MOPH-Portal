#!/bin/bash

# Configuration
SERVER_IP="192.168.99.220"
SSH_PORT="9220"
SSH_USER="srp"
REMOTE_DIR="/var/www/moph-portal"

# Build frontend
echo "Building frontend..."
npm run build

# Create deployment directory
mkdir -p deploy/moph-portal/{frontend,backend}

# Copy frontend files
cp -r dist/* deploy/moph-portal/frontend/

# Copy backend files
cp -r server/* deploy/moph-portal/backend/

# Copy configuration files
cp package*.json deploy/moph-portal/
cp ecosystem.config.js deploy/moph-portal/
cp .env.example deploy/moph-portal/.env

# Create deployment package
cd deploy
tar -czvf moph-portal.tar.gz moph-portal

# Transfer to server
echo "Transferring files to server..."
scp -P $SSH_PORT moph-portal.tar.gz ${SSH_USER}@${SERVER_IP}:/tmp/

# Execute remote commands
echo "Setting up on remote server..."
ssh -p $SSH_PORT ${SSH_USER}@${SERVER_IP} << 'ENDSSH'
# Create directory if not exists
sudo mkdir -p /var/www/moph-portal
sudo chown -R $USER:$USER /var/www

# Extract files
cd /var/www
rm -rf moph-portal/*
tar -xzvf /tmp/moph-portal.tar.gz -C /var/www

# Install dependencies
cd /var/www/moph-portal
npm install --production
cd backend
npm install
cd ..

# Set permissions
chmod 600 .env

# Restart services
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Clean up
rm -f /tmp/moph-portal.tar.gz
ENDSSH

echo "Deployment completed!"
