#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "power" "Energia"

# Detecta hardware Apple
if is_apple; then
  PRODUCT=$(cat /sys/class/dmi/id/product_name 2>/dev/null)
  log_warn "Hardware Apple detectado: $PRODUCT"
fi

# Determina se deve suspender: override local > apple > auto-detecta
if [ -n "$CB_SUSPEND" ]; then
  SUSPEND="$CB_SUSPEND"
  log_ok "Suspend override: $SUSPEND (via local.sh)"
elif is_apple; then
  SUSPEND="off"
  log_ok "Suspend desabilitado (Apple hardware — ACPI sleep nao funciona no Linux)"
elif is_laptop; then
  SUSPEND="on"
  log_ok "Laptop detectado (bateria presente)"
else
  SUSPEND="off"
  log_ok "Desktop detectado (sem bateria)"
fi

if [ "$SUSPEND" = "off" ]; then
  # Desabilita suspend via gsettings
  if command -v gsettings &> /dev/null; then
    gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type 'nothing'
    gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-timeout 0
    log_ok "Suspend desabilitado (gsettings)"
  fi

  # Desabilita suspend via systemd (impede shutdown acidental em hardware Apple)
  if is_apple; then
    if sudo systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target; then
      log_ok "Suspend/hibernate mascarado (systemd) — Apple hardware"
    else
      log_warn "Falha ao mascarar suspend no systemd"
    fi
  fi
else
  # Mantem suspend habilitado
  if command -v gsettings &> /dev/null; then
    gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type 'suspend'
    gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-timeout 1800
    log_ok "Suspend habilitado (30min)"
  fi

  # Garante que systemd nao esta mascarado
  sudo systemctl unmask sleep.target suspend.target hibernate.target hybrid-sleep.target || true
fi
