#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "fastfetch" "Fastfetch"
mkdir -p ~/.config/fastfetch
ln -sf "$DOTFILES_DIR/fastfetch/config.jsonc" ~/.config/fastfetch/config.jsonc
log_ok "~/.config/fastfetch/config.jsonc -> cbdotfiles"
