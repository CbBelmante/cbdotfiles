#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "fastfetch" "Fastfetch"

if ! command -v fastfetch &> /dev/null; then
  log_add "Instalando Fastfetch..."
  DISTRO=$(get_distro)
  if [ "$DISTRO" = "arch" ]; then
    pkg_install fastfetch
  elif [ "$DISTRO" = "debian" ]; then
    # PPA para Ubuntu/Debian
    sudo add-apt-repository -y ppa:zhangsongcui3371/fastfetch 2>/dev/null
    sudo apt update -qq
    pkg_install fastfetch
  else
    pkg_install fastfetch
  fi
  log_ok "Fastfetch instalado"
else
  log_ok "Fastfetch ja instalado: $(fastfetch --version | head -1)"
fi

mkdir -p ~/.config/fastfetch
ln -sf "$DOTFILES_DIR/fastfetch/config.jsonc" ~/.config/fastfetch/config.jsonc
log_ok "~/.config/fastfetch/config.jsonc -> cbdotfiles"
