#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "fastfetch" "Fastfetch"

if ! command -v fastfetch &> /dev/null; then
  log_add "Instalando Fastfetch..."
  DISTRO=$(get_distro)
  if [ "$DISTRO" = "debian" ]; then
    sudo add-apt-repository -y ppa:zhangsongcui3371/fastfetch 2>/dev/null
    sudo apt update -qq &> /dev/null
  fi
  if pkg_install fastfetch; then
    log_ok "Fastfetch instalado"
  fi
else
  log_ok "Fastfetch ja instalado: $(fastfetch --version | head -1)"
fi

mkdir -p ~/.config/fastfetch
ln -sf "$DOTFILES_DIR/fastfetch/config.jsonc" ~/.config/fastfetch/config.jsonc
log_ok "~/.config/fastfetch/config.jsonc -> cbdotfiles"
