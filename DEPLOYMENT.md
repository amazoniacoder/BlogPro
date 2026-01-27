# Production Deployment Guide

## Server Information
- **Server IP**: 89.169.0.223
- **Domain**: blogpro.tech
- **Database**: PostgreSQL (porto1)
- **Email**: Yandex SMTP

## Pre-deployment Checklist

### 1. Environment Configuration
Ensure the following files are configured:
- `.env.production` (root directory)
- `client/.env.production`

### 2. Build the Application

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Build client
npm run build:client

# Build server
npm run build:server
```

### 3. Database Setup

On the production server:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database if not exists
CREATE DATABASE porto1;

# Run migrations
npm run db:push
```

### 4. SSL Certificate Setup

For production with HTTPS:

```bash
# Install certbot (if not already installed)
sudo apt-get update
sudo apt-get install certbot

# Generate SSL certificate for blogpro.tech
sudo certbot certonly --standalone -d blogpro.tech -d www.blogpro.tech

# Copy certificates to project
sudo cp /etc/letsencrypt/live/blogpro.tech/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/blogpro.tech/privkey.pem ./ssl/key.pem
```

### 5. Server Configuration

#### Nginx Configuration (Recommended)

Create `/etc/nginx/sites-available/blogpro.tech`:

```nginx
# HTTP редирект на HTTPS
server {
    listen 80;
    server_name blogpro.tech www.blogpro.tech;
    return 301 https://blogpro.tech$request_uri;
}

# HTTPS редирект с www на основной домен
server {
    listen 443 ssl http2;
    server_name www.blogpro.tech;
    
    ssl_certificate /etc/letsencrypt/live/blogpro.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/blogpro.tech/privkey.pem;
    
    return 301 https://blogpro.tech$request_uri;
}

# Основной сервер (без www)
server {
    listen 443 ssl http2;
    server_name blogpro.tech;

    ssl_certificate /etc/letsencrypt/live/blogpro.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/blogpro.tech/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Client max body size
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /uploads {
        alias /path/to/blogpro/public/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/blogpro.tech /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. PM2 Process Manager (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start dist/index.js --name blogpro

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### 7. Environment Variables on Server

Copy `.env.production` to `.env` on the server:

```bash
cp .env.production .env
```

Ensure all sensitive values are updated:
- `SESSION_SECRET`
- `JWT_SECRET`
- Database credentials
- Email credentials

## Deployment Steps

### Option 1: Git Deployment (Recommended)

```bash
# On your local machine
git add .
git commit -m "Production deployment configuration"
git push origin main

# On the production server
cd /path/to/blogpro
git pull origin main
npm install
cd client && npm install && cd ..
npm run build
pm2 restart blogpro
```

### Option 2: Manual Deployment

```bash
# Build locally
npm run build

# Transfer files to server (using rsync or scp)
rsync -avz --exclude 'node_modules' --exclude '.git' ./ user@89.169.0.223:/path/to/blogpro/

# On the server
cd /path/to/blogpro
npm install --production
pm2 restart blogpro
```

## Post-Deployment Verification

1. **Check Application Status**
   ```bash
   pm2 status
   pm2 logs blogpro
   ```

2. **Test Endpoints**
   ```bash
   curl https://blogpro.tech/api/health
   ```

3. **Check Database Connection**
   ```bash
   psql -U postgres -d porto1 -c "SELECT COUNT(*) FROM users;"
   ```

4. **Verify SSL Certificate**
   ```bash
   openssl s_client -connect blogpro.tech:443 -servername blogpro.tech
   ```

## Monitoring

### PM2 Monitoring
```bash
pm2 monit
```

### Logs
```bash
# Application logs
pm2 logs blogpro

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Backup Strategy

### Database Backup
```bash
# Create backup
pg_dump -U postgres porto1 > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -U postgres porto1 < backup_file.sql
```

### File Backup
```bash
# Backup uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz public/uploads/
```

## Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs blogpro --lines 100

# Check environment variables
pm2 env 0

# Restart application
pm2 restart blogpro
```

### Database Connection Issues
```bash
# Test database connection
psql -U postgres -d porto1

# Check PostgreSQL status
sudo systemctl status postgresql
```

### SSL Certificate Issues
```bash
# Renew certificate
sudo certbot renew

# Test certificate
sudo certbot certificates
```

## Security Checklist

- [ ] Firewall configured (UFW or iptables)
- [ ] SSH key-based authentication enabled
- [ ] Database password is strong
- [ ] JWT_SECRET and SESSION_SECRET are unique and strong
- [ ] SSL certificate is valid and auto-renewal is configured
- [ ] Regular backups are scheduled
- [ ] Monitoring and alerting are set up
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured

## Maintenance

### Update Application
```bash
git pull origin main
npm install
npm run build
pm2 restart blogpro
```

### Update Dependencies
```bash
npm update
npm audit fix
pm2 restart blogpro
```

### Database Maintenance
```bash
# Vacuum database
psql -U postgres -d porto1 -c "VACUUM ANALYZE;"

# Check database size
psql -U postgres -d porto1 -c "SELECT pg_size_pretty(pg_database_size('porto1'));"
```
