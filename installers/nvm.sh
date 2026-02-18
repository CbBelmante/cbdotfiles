#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "nvm" "NVM"

if [ ! -d "$HOME/.nvm" ] && [ ! -d "$HOME/.config/nvm" ]; then
  log_add "Instalando NVM..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
else
  log_ok "NVM ja instalado"
fi

# Carrega NVM no shell atual
export NVM_DIR="${HOME}/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

if command -v nvm &>/dev/null; then
  local_version="$(nvm current 2>/dev/null)"
  remote_version="$(nvm version-remote --lts 2>/dev/null)"

  if [ "$local_version" = "$remote_version" ]; then
    log_ok "Node $local_version LTS (mais recente)"
  else
    log_add "Instalando Node LTS $remote_version..."
    nvm install --lts --default
    log_ok "Node $(node --version) LTS instalado e definido como default"
  fi
else
  log_add "AVISO: NVM nao carregou. Reinicie o terminal e rode: nvm install node"
fi
