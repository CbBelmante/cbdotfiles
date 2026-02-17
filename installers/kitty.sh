#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "[kitty] Configurando Kitty..."
mkdir -p ~/.config/kitty
ln -sf "$DOTFILES_DIR/kitty/kitty.conf" ~/.config/kitty/kitty.conf
echo "  [ok] ~/.config/kitty/kitty.conf -> cbdotfiles"
