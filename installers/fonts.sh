#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "fonts" "Nerd Fonts"

# Fontes desejadas
FONTS=(
  "CaskaydiaMono"
  "JetBrainsMono"
)

# Nomes dos pacotes no Arch
declare -A ARCH_PKGS
ARCH_PKGS[CaskaydiaMono]="ttf-cascadia-mono-nerd"
ARCH_PKGS[JetBrainsMono]="ttf-jetbrains-mono-nerd"

install_font_debian() {
  local font_name="$1"
  local font_dir="$HOME/.local/share/fonts"
  mkdir -p "$font_dir"

  local url="https://github.com/ryanoasis/nerd-fonts/releases/latest/download/${font_name}.tar.xz"
  local tmp="/tmp/${font_name}-nerd.tar.xz"

  if curl -sLo "$tmp" "$url" && tar xf "$tmp" -C "$font_dir"; then
    rm -f "$tmp"
    return 0
  else
    rm -f "$tmp"
    return 1
  fi
}

DISTRO=$(get_distro)

for font in "${FONTS[@]}"; do
  # Checa se ja esta instalada
  if fc-list | grep -qi "${font}.*Nerd" 2>/dev/null; then
    log_ok "${font} Nerd Font ja instalada"
    continue
  fi

  log_add "Instalando ${font} Nerd Font..."

  if [ "$DISTRO" = "arch" ]; then
    if pkg_install "${ARCH_PKGS[$font]}"; then
      log_ok "${font} Nerd Font instalada"
    fi
  else
    if install_font_debian "$font"; then
      log_ok "${font} Nerd Font instalada"
    else
      log_warn "Falha ao instalar ${font} Nerd Font"
    fi
  fi
done

# Atualizar cache de fontes (so se instalou algo novo)
if [ "$DISTRO" != "arch" ]; then
  fc-cache -f &> /dev/null
fi
