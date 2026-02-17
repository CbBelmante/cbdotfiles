#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "nvim" "Neovim"

if ! command -v nvim &> /dev/null; then
  log_add "Instalando Neovim..."
  pkg_install neovim
else
  log_ok "Neovim ja instalado: $(nvim --version | head -1)"
fi

mkdir -p ~/.config
if [ -d ~/.config/nvim ] && [ ! -L ~/.config/nvim ]; then
  log_warn "Backup: ~/.config/nvim -> ~/.config/nvim.bak.$(date +%Y%m%d)"
  mv ~/.config/nvim ~/.config/nvim.bak.$(date +%Y%m%d)
fi
ln -sfn "$DOTFILES_DIR/nvim" ~/.config/nvim
log_ok "~/.config/nvim -> cbdotfiles"
