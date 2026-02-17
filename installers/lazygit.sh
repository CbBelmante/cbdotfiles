#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "lazygit" "LazyGit"

if ! command -v lazygit &> /dev/null; then
  log_add "Instalando LazyGit..."
  DISTRO=$(get_distro)
  if [ "$DISTRO" = "arch" ]; then
    pkg_install lazygit
  else
    LAZYGIT_VERSION=$(curl -s "https://api.github.com/repos/jesseduffield/lazygit/releases/latest" | grep -Po '"tag_name": "v\K[^"]*')
    curl -Lo /tmp/lazygit.tar.gz "https://github.com/jesseduffield/lazygit/releases/latest/download/lazygit_${LAZYGIT_VERSION}_Linux_x86_64.tar.gz"
    tar xf /tmp/lazygit.tar.gz -C /tmp lazygit
    sudo install /tmp/lazygit /usr/local/bin
    rm -f /tmp/lazygit /tmp/lazygit.tar.gz
  fi
  log_ok "LazyGit instalado"
else
  log_ok "LazyGit ja instalado: $(lazygit --version | head -1)"
fi

mkdir -p ~/.config/lazygit
ln -sf "$DOTFILES_DIR/lazygit/config.yml" ~/.config/lazygit/config.yml
log_ok "~/.config/lazygit/config.yml -> cbdotfiles"
