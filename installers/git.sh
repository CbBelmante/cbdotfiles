#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "git" "Git"
ln -sf "$DOTFILES_DIR/git/.gitconfig" ~/.gitconfig
log_ok "~/.gitconfig -> cbdotfiles"
