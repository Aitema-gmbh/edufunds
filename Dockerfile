# EduFunds Docker Image
# Statischer Export mit nginx (optimiert ohne npm install)

FROM node:20-alpine AS builder

WORKDIR /app

# Nur die notwendigen Dateien kopieren
COPY data/ ./data/
COPY export-static.js ./

# Statischen Export erstellen (kein npm install nötig)
RUN node export-static.js

# Production Stage mit nginx
FROM nginx:alpine

# nginx Konfiguration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Statische Dateien kopieren
COPY --from=builder /app/dist /usr/share/nginx/html

# Gesundheitscheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
