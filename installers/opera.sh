#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "opera" "Opera Browser"

if ! command -v opera &> /dev/null; then
  log_add "Instalando Opera..."
  DISTRO=$(get_distro)
  if [ "$DISTRO" = "arch" ]; then
    pkg_install opera
  elif [ "$DISTRO" = "debian" ]; then
    log_add "Adicionando repositorio Opera..."
    curl -fsSL https://deb.opera.com/archive.key | sudo gpg --dearmor -o /usr/share/keyrings/opera-browser.gpg
    echo "deb [signed-by=/usr/share/keyrings/opera-browser.gpg] https://deb.opera.com/opera-stable/ stable non-free" | sudo tee /etc/apt/sources.list.d/opera.list > /dev/null
    sudo apt update -qq &> /dev/null
    sudo apt install -y opera-stable
  elif [ "$DISTRO" = "fedora" ]; then
    sudo rpm --import https://rpm.opera.com/rpmrepo.key
    sudo tee /etc/yum.repos.d/opera.repo > /dev/null <<'REPO'
[opera]
name=Opera packages
baseurl=https://rpm.opera.com/rpm
gpgcheck=1
gpgkey=https://rpm.opera.com/rpmrepo.key
enabled=1
REPO
    sudo dnf install -y opera-stable
  else
    log_warn "Distro nao suportada. Instale Opera manualmente."
    exit 1
  fi
  log_ok "Opera instalado"
else
  log_ok "Opera ja instalado"
fi
