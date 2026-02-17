#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "[fastfetch] Configurando Fastfetch..."
mkdir -p ~/.config/fastfetch
ln -sf "$DOTFILES_DIR/fastfetch/config.jsonc" ~/.config/fastfetch/config.jsonc
echo "  [ok] ~/.config/fastfetch/config.jsonc -> cbdotfiles"
