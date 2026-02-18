#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "vscode" "Visual Studio Code"

if ! command -v code &> /dev/null; then
  log_add "Instalando VS Code..."
  DISTRO=$(get_distro)
  if [ "$DISTRO" = "arch" ]; then
    pkg_install code
  elif [ "$DISTRO" = "debian" ]; then
    log_add "Adicionando repositorio Microsoft..."
    curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | sudo gpg --dearmor -o /usr/share/keyrings/microsoft.gpg
    echo "deb [signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/repos/code stable main" | sudo tee /etc/apt/sources.list.d/vscode.list > /dev/null
    sudo apt update -qq &> /dev/null
    sudo apt install -y code
  elif [ "$DISTRO" = "fedora" ]; then
    sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
    echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" | sudo tee /etc/yum.repos.d/vscode.repo > /dev/null
    sudo dnf install -y code
  else
    log_warn "Distro nao suportada. Instale VS Code manualmente."
    exit 1
  fi
  log_ok "VS Code instalado"
else
  log_ok "VS Code ja instalado: $(code --version | head -1)"
fi
