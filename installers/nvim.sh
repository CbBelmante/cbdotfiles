#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

NVIM_MIN_VERSION="0.11.2"

log_title "nvim" "Neovim"

# Compara versoes: retorna 0 se $1 >= $2
version_gte() {
  printf '%s\n%s' "$2" "$1" | sort -V -C
}

needs_install=false

if ! command -v nvim &> /dev/null; then
  needs_install=true
else
  current_version=$(nvim --version | head -1 | grep -oP '\d+\.\d+\.\d+')
  if version_gte "$current_version" "$NVIM_MIN_VERSION"; then
    log_ok "Neovim ja instalado: v$current_version (>= $NVIM_MIN_VERSION)"
  else
    log_warn "Neovim v$current_version encontrado, mas LazyVim requer >= $NVIM_MIN_VERSION"
    needs_install=true
  fi
fi

if [ "$needs_install" = true ]; then
  log_add "Instalando Neovim >= $NVIM_MIN_VERSION..."
  DISTRO=$(get_distro)
  if [ "$DISTRO" = "arch" ]; then
    pkg_install neovim
  else
    mkdir -p ~/.local/bin ~/.local/nvim
    log_add "Baixando Neovim do GitHub (latest stable)..."
    curl -sL https://github.com/neovim/neovim/releases/latest/download/nvim-linux-x86_64.tar.gz \
      | tar xz --strip-components=1 -C ~/.local/nvim/
    ln -sf ~/.local/nvim/bin/nvim ~/.local/bin/nvim
    chmod +x ~/.local/bin/nvim
  fi

  if command -v nvim &> /dev/null || [ -x ~/.local/bin/nvim ]; then
    installed_version=$(~/.local/bin/nvim --version 2>/dev/null | head -1 | grep -oP '\d+\.\d+\.\d+' || nvim --version | head -1 | grep -oP '\d+\.\d+\.\d+')
    log_ok "Neovim v$installed_version instalado"
  else
    log_warn "Falha ao instalar Neovim"
  fi
fi

mkdir -p ~/.config
if [ -d ~/.config/nvim ] && [ ! -L ~/.config/nvim ]; then
  log_warn "Backup: ~/.config/nvim -> ~/.config/nvim.bak.$(date +%Y%m%d)"
  mv ~/.config/nvim ~/.config/nvim.bak.$(date +%Y%m%d)
fi
ln -sfn "$DOTFILES_DIR/nvim" ~/.config/nvim
log_ok "~/.config/nvim -> cbdotfiles"
