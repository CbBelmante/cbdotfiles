#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "[git] Configurando Git..."
ln -sf "$DOTFILES_DIR/git/.gitconfig" ~/.gitconfig
echo "  [ok] ~/.gitconfig -> cbdotfiles"
