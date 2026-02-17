#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "ghostty" "Ghostty"

if ! command -v ghostty &> /dev/null; then
  log_add "Instalando Ghostty..."
  DISTRO=$(get_distro)
  if [ "$DISTRO" = "arch" ]; then
    if pkg_install ghostty; then
      log_ok "Ghostty instalado"
    fi
  else
    log_warn "Ghostty nao disponivel via apt/dnf. Instale manualmente: https://ghostty.org"
  fi
else
  log_ok "Ghostty ja instalado: $(ghostty --version 2>/dev/null || echo 'ok')"
fi

mkdir -p ~/.config/ghostty
ln -sf "$DOTFILES_DIR/ghostty/config" ~/.config/ghostty/config
log_ok "~/.config/ghostty/config -> cbdotfiles"
