# EduFunds Docker Image
# Statischer Export mit nginx

FROM node:20-alpine AS builder

WORKDIR /app

# Dependencies installieren
COPY package.json ./
RUN npm install

# Source Code kopieren
COPY . .

# Statischen Export erstellen
RUN node export-static.js

# Production Stage mit nginx
FROM nginx:alpine

# nginx Konfiguration
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    error_page 404 /404.html;
    location = /404.html {
        internal;
    }
    
    # Gzip Kompression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
EOF

# Statische Dateien kopieren
COPY --from=builder /app/dist /usr/share/nginx/html

# Gesundheitscheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]