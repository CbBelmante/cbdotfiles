#!/bin/bash
# Abre o browser padrao do sistema, com suporte a modo privado
# Uso: open-browser.sh [--private]

DESKTOP_FILE=$(xdg-settings get default-web-browser 2>/dev/null)
BROWSER=$(basename "$DESKTOP_FILE" .desktop | sed 's/-stable//' | sed 's/-browser//')

# Detecta a flag de modo privado por browser
get_private_flag() {
  case "$BROWSER" in
    vivaldi*)    echo "--private" ;;
    google-chrome*|chrome*) echo "--incognito" ;;
    chromium*)   echo "--incognito" ;;
    firefox*)    echo "--private-window" ;;
    opera*)      echo "--private" ;;
    *)           echo "--private" ;;
  esac
}

if [ "$1" = "--private" ]; then
  gtk-launch "$DESKTOP_FILE" "$(get_private_flag)"
else
  gtk-launch "$DESKTOP_FILE"
fi
