#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "[lazygit] Configurando LazyGit..."
mkdir -p ~/.config/lazygit
ln -sf "$DOTFILES_DIR/lazygit/config.yml" ~/.config/lazygit/config.yml
echo "  [ok] ~/.config/lazygit/config.yml -> cbdotfiles"
