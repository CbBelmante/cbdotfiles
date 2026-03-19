#!/bin/bash
# Abre o browser padrao do sistema
# Uso: open-browser.sh [--private] [--app=URL]
#
# Flags extras via local/local.sh:
#   CB_BROWSER_FLAGS="--disable-gpu"

DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Carrega overrides locais
LOCAL_CONF="$DOTFILES_DIR/local/local.sh"
[ -f "$LOCAL_CONF" ] && source "$LOCAL_CONF"

DESKTOP_FILE=$(xdg-settings get default-web-browser 2>/dev/null)
BROWSER=$(basename "$DESKTOP_FILE" .desktop | sed 's/-stable//' | sed 's/-browser//')

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

# Flags padrao pra Chromium-based (VA-API — seguro em qualquer GPU)
get_default_flags() {
  case "$BROWSER" in
    firefox*) echo "" ;;
    *)
      echo "--enable-features=VaapiVideoDecodeLinuxGL --disable-features=UseChromeOSDirectVideoDecoder"
      ;;
  esac
}

# Flag de webapp por browser
get_app_flag() {
  case "$BROWSER" in
    firefox*)  echo "--ssb" ;;
    *)         echo "--app" ;;
  esac
}

CMD=$(get_browser_cmd)
FLAGS="$(get_default_flags) ${CB_BROWSER_FLAGS:-}"

if [ -z "$CMD" ] || ! command -v "$CMD" &>/dev/null; then
  # Fallback: xdg-open pra URLs, gtk-launch pro resto
  for arg in "$@"; do
    if [[ "$arg" == --app=* ]]; then
      xdg-open "${arg#--app=}" &>/dev/null &
      exit 0
    fi
  done
  gtk-launch "$DESKTOP_FILE" "$@"
  exit 0
fi

# Monta argumentos
ARGS=""
for arg in "$@"; do
  if [[ "$arg" == "--private" ]]; then
    ARGS="$ARGS $(get_private_flag)"
  elif [[ "$arg" == --app=* ]]; then
    URL="${arg#--app=}"
    ARGS="$ARGS $(get_app_flag)=$URL"
  else
    ARGS="$ARGS $arg"
  fi
done

exec $CMD $ARGS $FLAGS &>/dev/null &
