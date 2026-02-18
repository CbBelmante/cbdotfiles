#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "vivaldi" "Vivaldi Browser"

if ! command -v vivaldi &> /dev/null; then
  log_add "Instalando Vivaldi..."
  DISTRO=$(get_distro)
  if [ "$DISTRO" = "arch" ]; then
    pkg_install vivaldi
  elif [ "$DISTRO" = "debian" ]; then
    log_add "Adicionando repositorio Vivaldi..."
    curl -fsSL https://repo.vivaldi.com/archive/linux_signing_key.pub | sudo gpg --dearmor -o /usr/share/keyrings/vivaldi-browser.gpg
    echo "deb [signed-by=/usr/share/keyrings/vivaldi-browser.gpg] https://repo.vivaldi.com/archive/deb/ stable main" | sudo tee /etc/apt/sources.list.d/vivaldi.list > /dev/null
    sudo apt update -qq &> /dev/null
    sudo apt install -y vivaldi-stable
  elif [ "$DISTRO" = "fedora" ]; then
    sudo dnf config-manager --add-repo https://repo.vivaldi.com/archive/vivaldi-fedora.repo
    sudo dnf install -y vivaldi-stable
  else
    log_warn "Distro nao suportada. Instale Vivaldi manualmente."
    exit 1
  fi
  log_ok "Vivaldi instalado"
else
  log_ok "Vivaldi ja instalado: $(vivaldi --version 2>&1 | head -1)"
fi

# Definir como browser padrao
if command -v xdg-settings &> /dev/null; then
  DESKTOP_FILE=$(find /usr/share/applications -name "vivaldi*" -print -quit 2>/dev/null)
  if [ -n "$DESKTOP_FILE" ]; then
    DESKTOP_NAME=$(basename "$DESKTOP_FILE")
    xdg-settings set default-web-browser "$DESKTOP_NAME"
    log_ok "Vivaldi definido como browser padrao ($DESKTOP_NAME)"
  else
    log_warn "Desktop file do Vivaldi nao encontrado, defina manualmente"
  fi
else
  log_warn "xdg-settings nao disponivel, defina o browser padrao manualmente"
fi
