#!/bin/bash
# Abre o browser padrao do sistema, com suporte a modo privado
# Uso: open-browser.sh [--private]
# Aplica flags de estabilidade pra Chromium-based em AMD+Wayland

DESKTOP_FILE=$(xdg-settings get default-web-browser 2>/dev/null)
BROWSER=$(basename "$DESKTOP_FILE" .desktop | sed 's/-stable//' | sed 's/-browser//')

# Detecta o comando do browser a partir do .desktop file
get_browser_cmd() {
  case "$BROWSER" in
    vivaldi*)        echo "vivaldi" ;;
    google-chrome*)  echo "google-chrome-stable" ;;
    chrome*)         echo "google-chrome-stable" ;;
    chromium*)       echo "chromium" ;;
    firefox*)        echo "firefox" ;;
    opera*)          echo "opera" ;;
    *)               echo "" ;;
  esac
}

# Flag de modo privado por browser
get_private_flag() {
  case "$BROWSER" in
    vivaldi*)                echo "--private" ;;
    google-chrome*|chrome*)  echo "--incognito" ;;
    chromium*)               echo "--incognito" ;;
    firefox*)                echo "--private-window" ;;
    opera*)                  echo "--private" ;;
    *)                       echo "--private" ;;
  esac
}

# Flags de estabilidade pra Chromium-based (fix crash AMD+Wayland)
get_stability_flags() {
  case "$BROWSER" in
    firefox*) echo "" ;;  # Firefox nao precisa
    *)
      echo "--enable-features=VaapiVideoDecodeLinuxGL --disable-features=UseChromeOSDirectVideoDecoder"
      ;;
  esac
}

CMD=$(get_browser_cmd)
FLAGS=$(get_stability_flags)

if [ -z "$CMD" ] || ! command -v "$CMD" &>/dev/null; then
  # Fallback: usa gtk-launch se nao encontrou o comando
  gtk-launch "$DESKTOP_FILE" "$@"
  exit 0
fi

if [ "$1" = "--private" ]; then
  exec $CMD $(get_private_flag) $FLAGS &>/dev/null &
else
  exec $CMD $FLAGS &>/dev/null &
fi
