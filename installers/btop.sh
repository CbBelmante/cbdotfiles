#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "btop" "Btop"
mkdir -p ~/.config/btop
ln -sf "$DOTFILES_DIR/btop/btop.conf" ~/.config/btop/btop.conf
log_ok "~/.config/btop/btop.conf -> cbdotfiles"
