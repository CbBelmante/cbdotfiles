#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

echo "[zellij] Configurando Zellij..."

if ! command -v zellij &> /dev/null; then
  echo "  [+] Instalando Zellij..."
  DISTRO=$(get_distro)
  if [ "$DISTRO" = "arch" ]; then
    pkg_install zellij
  else
    # Binario universal pra Debian/Ubuntu/outros
    mkdir -p ~/.local/bin
    curl -sL https://github.com/zellij-org/zellij/releases/latest/download/zellij-x86_64-unknown-linux-musl.tar.gz | tar xz -C ~/.local/bin/
    chmod +x ~/.local/bin/zellij
    echo "  [ok] Zellij instalado em ~/.local/bin/zellij"
  fi
else
  echo "  [ok] Zellij ja instalado: $(zellij --version)"
fi

# Symlinks
mkdir -p ~/.config/zellij/layouts
ln -sf "$DOTFILES_DIR/zellij/config.kdl" ~/.config/zellij/config.kdl
echo "  [ok] ~/.config/zellij/config.kdl -> cbdotfiles"

for layout in "$DOTFILES_DIR"/zellij/*.kdl; do
  [ "$(basename "$layout")" = "config.kdl" ] && continue
  ln -sf "$layout" ~/.config/zellij/layouts/
  echo "  [ok] ~/.config/zellij/layouts/$(basename "$layout") -> cbdotfiles"
done
