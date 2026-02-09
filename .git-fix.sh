#!/bin/bash
# Git Workaround für EduFunds
# Dieses Skript fixt alle bekannten Git-Probleme

cd /mnt/projekte/Edufunds

# 1. Alle Locks entfernen
rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/*.lock 2>/dev/null
find .git -name "*.lock" -delete 2>/dev/null

# 2. Git Konfiguration (damit es nie nachfragt)
git config user.email "milo@edufunds.de"
git config user.name "Milo"
git config core.editor "true"
git config core.pager "cat"

# 3. Commit ohne Editor
export GIT_EDITOR=true
export EDITOR=true

echo "✅ Git konfiguriert. Bereit für commits."
