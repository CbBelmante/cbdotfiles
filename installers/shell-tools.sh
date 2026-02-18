#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "shell-tools" "Shell Tools (zoxide, fzf, ripgrep, bat)"

DISTRO=$(get_distro)

# Zoxide
if ! command -v zoxide &> /dev/null; then
  log_add "Instalando zoxide..."
  if [ "$DISTRO" = "arch" ]; then
    pkg_install zoxide
  else
    curl -sSfL https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh | sh
  fi
  log_ok "Zoxide instalado"
else
  log_ok "Zoxide ja instalado"
fi

# fzf
if ! command -v fzf &> /dev/null; then
  log_add "Instalando fzf..."
  if [ "$DISTRO" = "arch" ]; then
    pkg_install fzf
  else
    pkg_install fzf
  fi
  log_ok "fzf instalado"
else
  log_ok "fzf ja instalado"
fi

# ripgrep
if ! command -v rg &> /dev/null; then
  log_add "Instalando ripgrep..."
  pkg_install ripgrep
  log_ok "ripgrep instalado"
else
  log_ok "ripgrep ja instalado"
fi

# bat (preview do fzf)
if ! command -v bat &> /dev/null && ! command -v batcat &> /dev/null; then
  log_add "Instalando bat..."
  pkg_install bat
  log_ok "bat instalado"
else
  log_ok "bat ja instalado"
fi

# No Debian/Ubuntu, bat se chama batcat - criar symlink
if command -v batcat &> /dev/null && ! command -v bat &> /dev/null; then
  mkdir -p ~/.local/bin
  ln -sf "$(which batcat)" ~/.local/bin/bat
  log_ok "Symlink bat -> batcat"
fi
