#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "gitkraken" "GitKraken"

if ! command -v gitkraken &> /dev/null && ! flatpak list 2>/dev/null | grep -q gitkraken; then
  log_add "Instalando GitKraken..."
  DISTRO=$(get_distro)
  if [ "$DISTRO" = "arch" ]; then
    pkg_install gitkraken
  elif [ "$DISTRO" = "debian" ]; then
    log_add "Baixando GitKraken .deb..."
    local_deb=$(mktemp /tmp/gitkraken-XXXXX.deb)
    curl -sL https://release.gitkraken.com/linux/gitkraken-amd64.deb -o "$local_deb"
    sudo dpkg -i "$local_deb" || sudo apt install -f -y
    rm -f "$local_deb"
  elif [ "$DISTRO" = "fedora" ]; then
    log_add "Baixando GitKraken .rpm..."
    local_rpm=$(mktemp /tmp/gitkraken-XXXXX.rpm)
    curl -sL https://release.gitkraken.com/linux/gitkraken-amd64.rpm -o "$local_rpm"
    sudo dnf install -y "$local_rpm"
    rm -f "$local_rpm"
  else
    log_warn "Distro nao suportada. Instale GitKraken manualmente."
    exit 1
  fi
  log_ok "GitKraken instalado"
else
  log_ok "GitKraken ja instalado"
fi
