# Enterprise Deployment & Operations Guide

Production deployment guidelines for high-availability, scalability, and disaster recovery.

## Infrastructure Prerequisites

- **Compute**: Linux VPS or Kubernetes cluster (Ubuntu 22.04 LTS / Debian 12 / RHEL 9).
- **Runtime**: Node.js `22.x` LTS or Docker runtime (`node:22-alpine`).
- **Database**: MySQL `8.0+` with InnoDB engine, binary logging, and automated nightly backups.
- **Reverse Proxy**: Nginx or Cloudflare with SSL/TLS termination and HTTP/2 or HTTP/3 support.

## Production Configuration Checklist

1. **Environment Variables**:
   - `NODE_ENV=production`
   - `SESSION_SECRET`: High-entropy random string (at least 32 characters).
   - `DATABASE_URL`: `mysql://<user>:<pwd>@<host>:3306/<db>?connectionLimit=25`
   - `FRONTEND_URL` & `CLIENT_ORIGIN`: Canonical HTTPS domain (e.g. `https://erp.company.com`).
   - `TRUST_PROXY=true` (when behind Nginx, ALB, or Cloudflare).

2. **Nginx Reverse Proxy Block**:

   ```nginx
   server {
       listen 443 ssl http2;
       server_name erp.company.com;
       ssl_certificate /etc/letsencrypt/live/erp.company.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/erp.company.com/privkey.pem;

       location /api/ {
           proxy_pass http://127.0.0.1:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location / {
           root /var/www/serviceflow-erp/client/dist;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

3. **Database Tuning & Backup**:
   - Automated dump: `mysqldump -u <user> -p serviceflow_prod > backup_$(date +%F).sql`
   - MySQL pool defaults: `connectionLimit: 25`, `queueLimit: 100`, `enableKeepAlive: true`.
