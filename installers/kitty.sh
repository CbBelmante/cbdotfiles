#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "kitty" "Kitty"

if ! command -v kitty &> /dev/null; then
  log_add "Instalando Kitty..."
  if pkg_install kitty; then
    log_ok "Kitty instalado"
  fi
else
  log_ok "Kitty ja instalado: $(kitty --version 2>/dev/null | head -1)"
fi

mkdir -p ~/.config/kitty
ln -sf "$DOTFILES_DIR/kitty/kitty.conf" ~/.config/kitty/kitty.conf
log_ok "~/.config/kitty/kitty.conf -> cbdotfiles"
