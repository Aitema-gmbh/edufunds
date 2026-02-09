#!/bin/bash
# =============================================================================
# EduFunds Database Backup Script
# =============================================================================
# Dieses Script erstellt ein Backup der PostgreSQL Datenbank.
# Es wird automatisch täglich ausgeführt (wenn backup Service aktiv).
#
# Usage:
#   ./scripts/backup.sh              # Manuelles Backup
#   docker-compose --profile backup up -d  # Automatisierte Backups
# =============================================================================

set -e

# Konfiguration
BACKUP_DIR="/backups"
DB_NAME="${POSTGRES_DB:-edufunds}"
DB_USER="${POSTGRES_USER:-edufunds}"
DB_HOST="${POSTGRES_HOST:-postgres}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/edufunds_backup_${DATE}.sql.gz"

echo "========================================"
echo "EduFunds Database Backup"
echo "========================================"
echo "Date: $(date)"
echo "Database: ${DB_NAME}"
echo "Backup File: ${BACKUP_FILE}"
echo ""

# Backup erstellen
echo "Creating backup..."
PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
    -h "${DB_HOST}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    --verbose \
    --no-owner \
    --no-privileges \
    | gzip > "${BACKUP_FILE}"

# Dateigröße anzeigen
FILESIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "Backup created: ${FILESIZE}"
echo ""

# Alte Backups löschen
echo "Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
find "${BACKUP_DIR}" -name "edufunds_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
echo "Cleanup complete."

# Liste verfügbarer Backups
echo ""
echo "Available backups:"
ls -lh "${BACKUP_DIR}"/edufunds_backup_*.sql.gz 2>/dev/null || echo "No backups found"

echo ""
echo "Backup completed successfully!"
echo "========================================"
