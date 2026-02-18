#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "keybinds" "Keybinds"

# Gerar configs a partir da fonte unica
bash "$DOTFILES_DIR/keybinds/generate.sh"

GENERATED="$DOTFILES_DIR/keybinds/generated"

# Detectar ambiente desktop
if command -v hyprctl &> /dev/null && [ -n "$HYPRLAND_INSTANCE_SIGNATURE" ]; then
  DE="hyprland"
elif [ -d "$HOME/.config/cosmic" ]; then
  DE="cosmic"
else
  DE="unknown"
fi

# Aplicar Hyprland
if [ "$DE" = "hyprland" ] || [ -d "$HOME/.config/hypr" ]; then
  if [ -f "$GENERATED/hyprland-bindings.conf" ]; then
    ln -sf "$GENERATED/hyprland-bindings.conf" "$HOME/.config/hypr/bindings.conf"
    log_ok "~/.config/hypr/bindings.conf -> cbdotfiles (generated)"
  fi
fi

# Aplicar COSMIC
if [ "$DE" = "cosmic" ] || [ -d "$HOME/.config/cosmic" ]; then
  if [ -f "$GENERATED/cosmic-custom.ron" ]; then
    COSMIC_DIR="$HOME/.config/cosmic/com.system76.CosmicSettings.Shortcuts/v1"
    mkdir -p "$COSMIC_DIR"
    cp "$GENERATED/cosmic-custom.ron" "$COSMIC_DIR/custom"
    log_ok "~/.config/cosmic/.../Shortcuts/v1/custom -> cbdotfiles (generated)"
  fi

  # Definir Kitty como terminal padrao no COSMIC
  COSMIC_ACTIONS_DIR="$HOME/.config/cosmic/com.system76.CosmicSettings.Shortcuts/v1"
  mkdir -p "$COSMIC_ACTIONS_DIR"
  echo '{ Terminal: "kitty" }' > "$COSMIC_ACTIONS_DIR/system_actions"
  log_ok "COSMIC terminal padrao -> kitty"
fi

if [ "$DE" = "unknown" ]; then
  log_warn "Ambiente desktop nao detectado (Hyprland/COSMIC)"
  log_warn "Configs gerados em: keybinds/generated/"
fi
