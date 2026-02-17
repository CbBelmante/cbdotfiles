#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "[btop] Configurando Btop..."
mkdir -p ~/.config/btop
ln -sf "$DOTFILES_DIR/btop/btop.conf" ~/.config/btop/btop.conf
echo "  [ok] ~/.config/btop/btop.conf -> cbdotfiles"
