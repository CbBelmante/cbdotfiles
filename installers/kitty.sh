#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "kitty" "Kitty"

if ! command -v kitty &> /dev/null; then
  log_add "Instalando Kitty..."
  if pkg_install kitty; then
    log_ok "Kitty instalado"
  fi
else
  log_ok "Kitty ja instalado: $(kitty --version 2>/dev/null | head -1)"
fi

mkdir -p ~/.config/kitty
ln -sf "$DOTFILES_DIR/kitty/kitty.conf" ~/.config/kitty/kitty.conf
log_ok "~/.config/kitty/kitty.conf -> cbdotfiles"

# Detecta ambiente e aplica override correto
DESKTOP=$(get_desktop)
case "$DESKTOP" in
  omarchy)
    ln -sf "$DOTFILES_DIR/kitty/omarchy.conf" ~/.config/kitty/env.conf
    log_ok "env: omarchy (opacity 0.65)"
    ;;
  cosmic)
    # Gera cosmic.conf a partir do tema COSMIC ativo
    if [ -d "$HOME/.config/cosmic/com.system76.CosmicTheme.Dark/v1" ]; then
      log_add "Detectando tema COSMIC..."
      bash "$DOTFILES_DIR/kitty/generate-cosmic-theme.sh"
      log_ok "cosmic.conf gerado a partir do tema COSMIC ativo"
    fi
    ln -sf "$DOTFILES_DIR/kitty/cosmic.conf" ~/.config/kitty/env.conf
    log_ok "env: cosmic"
    ;;
  *)
    ln -sf "$DOTFILES_DIR/kitty/omarchy.conf" ~/.config/kitty/env.conf
    log_warn "Desktop nao detectado, usando config omarchy como padrao"
    ;;
esac
