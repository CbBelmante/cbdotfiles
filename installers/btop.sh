#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "btop" "Btop"

if ! command -v btop &> /dev/null; then
  log_add "Instalando Btop..."
  if pkg_install btop; then
    log_ok "Btop instalado"
  fi
else
  log_ok "Btop ja instalado: $(btop --version 2>/dev/null | head -1)"
fi

mkdir -p ~/.config/btop
ln -sf "$DOTFILES_DIR/btop/btop.conf" ~/.config/btop/btop.conf
log_ok "~/.config/btop/btop.conf -> cbdotfiles"
