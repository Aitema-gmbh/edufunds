# Git Workflow für Milo (automatisch, kein Editor)

function git-commit-quick() {
  cd /mnt/projekte/Edufunds
  rm -f .git/index.lock 2>/dev/null
  git add -A
  GIT_EDITOR=true git commit -m "$1" --no-edit
}

function git-push-quick() {
  cd /mnt/projekte/Edufunds
  git push origin main 2>&1 || git push origin master 2>&1
}

function git-deploy() {
  echo "🚀 Starte Deployment..."
  git-commit-quick "Auto-deploy: $(date +%Y-%m-%d-%H:%M)"
  git-push-quick
  echo "✅ Deployment abgeschlossen"
}

# Export für Sub-Agenten
export -f git-commit-quick
export -f git-push-quick
export -f git-deploy

# Git config defaults
export GIT_EDITOR=true
export EDITOR=true
export GIT_PAGER=cat
