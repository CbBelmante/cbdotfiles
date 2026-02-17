#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

echo "[nvim] Configurando Neovim..."

if ! command -v nvim &> /dev/null; then
  echo "  [+] Instalando Neovim..."
  pkg_install neovim
else
  echo "  [ok] Neovim ja instalado: $(nvim --version | head -1)"
fi

# Symlink da pasta inteira
mkdir -p ~/.config
if [ -d ~/.config/nvim ] && [ ! -L ~/.config/nvim ]; then
  echo "  [!] Backup: ~/.config/nvim -> ~/.config/nvim.bak.$(date +%Y%m%d)"
  mv ~/.config/nvim ~/.config/nvim.bak.$(date +%Y%m%d)
fi
ln -sfn "$DOTFILES_DIR/nvim" ~/.config/nvim
echo "  [ok] ~/.config/nvim -> cbdotfiles"
