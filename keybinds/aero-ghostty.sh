#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# AERO-GHOSTTY - Abre JANELA nova do Ghostty na instancia existente (macOS)
# ═══════════════════════════════════════════════════════════════════════════════
#
# Uso: aero-ghostty.sh [comando]
#   sem argumento  -> janela nova com o shell padrao
#   com argumento  -> janela nova rodando o comando (ex: lazydocker, btop)
#
# POR QUE ESTE SCRIPT EXISTE:
#   No macOS, chamar /Applications/Ghostty.app/Contents/MacOS/ghostty direto
#   cria uma INSTANCIA NOVA do app a cada vez — um icone na Dock por janela,
#   ~46 MB de runtime cada, e a instancia NAO morre quando a janela fecha.
#   O proprio Ghostty avisa: "On macOS, launching the terminal emulator from
#   the CLI is not supported and only actions are supported."
#   A action +new-window tambem nao existe no macOS ("not supported on this
#   platform"), e `open -a Ghostty` apenas ativa o app sem abrir janela.
#   Entao o caminho e pedir Cmd+N ao app que ja esta rodando.
# ═══════════════════════════════════════════════════════════════════════════════

set -uo pipefail

APP="Ghostty"
APP_BIN="/Applications/Ghostty.app/Contents/MacOS/ghostty"
CMD="${1:-}"

# Se o Ghostty ainda nao esta rodando, o `open` normal ja sobe o app com janela.
if ! pgrep -f "$APP_BIN" > /dev/null 2>&1; then
  if [[ -n "$CMD" ]]; then
    open -a "$APP" --args -e "$CMD"
  else
    open -a "$APP"
  fi
  exit 0
fi

# Ja esta rodando: pede JANELA nova (Cmd+N) a instancia existente.
osascript \
  -e "tell application \"$APP\" to activate" \
  -e 'delay 0.3' \
  -e "tell application \"System Events\" to keystroke \"n\" using command down" \
  > /dev/null 2>&1

# Com comando: espera a janela ficar pronta e digita o comando nela.
if [[ -n "$CMD" ]]; then
  sleep 0.6
  osascript \
    -e "tell application \"System Events\" to keystroke \"$CMD\"" \
    -e "tell application \"System Events\" to key code 36" \
    > /dev/null 2>&1
fi
