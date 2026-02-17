#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "zellij" "Zellij"

if ! command -v zellij &> /dev/null; then
  log_add "Instalando Zellij..."
  DISTRO=$(get_distro)
  if [ "$DISTRO" = "arch" ]; then
    pkg_install zellij
  else
    mkdir -p ~/.local/bin
    curl -sL https://github.com/zellij-org/zellij/releases/latest/download/zellij-x86_64-unknown-linux-musl.tar.gz | tar xz -C ~/.local/bin/
    chmod +x ~/.local/bin/zellij
  fi
  log_ok "Zellij instalado"
else
  log_ok "Zellij ja instalado: $(zellij --version)"
fi

mkdir -p ~/.config/zellij/layouts
ln -sf "$DOTFILES_DIR/zellij/config.kdl" ~/.config/zellij/config.kdl
log_ok "~/.config/zellij/config.kdl -> cbdotfiles"

for layout in "$DOTFILES_DIR"/zellij/*.kdl; do
  [ "$(basename "$layout")" = "config.kdl" ] && continue
  ln -sf "$layout" ~/.config/zellij/layouts/
  log_ok "~/.config/zellij/layouts/$(basename "$layout") -> cbdotfiles"
done
