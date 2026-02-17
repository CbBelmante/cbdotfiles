#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "[ghostty] Configurando Ghostty..."
mkdir -p ~/.config/ghostty
ln -sf "$DOTFILES_DIR/ghostty/config" ~/.config/ghostty/config
echo "  [ok] ~/.config/ghostty/config -> cbdotfiles"
