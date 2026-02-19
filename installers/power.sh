#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "power" "Energia"

# Determina se deve suspender: override local > auto-detecta
if [ -n "$CB_SUSPEND" ]; then
  SUSPEND="$CB_SUSPEND"
  log_ok "Suspend override: $SUSPEND (via local.sh)"
elif is_laptop; then
  SUSPEND="on"
  log_ok "Laptop detectado (bateria presente)"
else
  SUSPEND="off"
  log_ok "Desktop detectado (sem bateria)"
fi

if [ "$SUSPEND" = "off" ]; then
  # Desabilita suspend
  if command -v gsettings &> /dev/null; then
    gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type 'nothing'
    gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-timeout 0
    log_ok "Suspend desabilitado (AC)"
  else
    log_warn "gsettings nao encontrado, configure manualmente"
  fi
else
  # Mantem suspend habilitado (30min padrao)
  if command -v gsettings &> /dev/null; then
    gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type 'suspend'
    gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-timeout 1800
    log_ok "Suspend habilitado (30min)"
  else
    log_warn "gsettings nao encontrado, configure manualmente"
  fi
fi
