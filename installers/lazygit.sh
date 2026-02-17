#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "lazygit" "LazyGit"
mkdir -p ~/.config/lazygit
ln -sf "$DOTFILES_DIR/lazygit/config.yml" ~/.config/lazygit/config.yml
log_ok "~/.config/lazygit/config.yml -> cbdotfiles"
