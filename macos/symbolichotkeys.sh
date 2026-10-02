#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# macOS SYMBOLICHOTKEYS - GERADO AUTOMATICAMENTE
# ═══════════════════════════════════════════════════════════════════════════════
#
# NÃO EDITE AQUI! Edite keybinds/keybinds.conf e rode ./keybinds/generate.sh
#
# Remapeia atalhos NATIVOS do macOS para combos que nao colidem com o
# AeroSpace. O print continua 100% nativo (miniatura no canto inferior,
# editor de anotacao ao clicar nela, arquivo com timestamp) — so muda a tecla.
#
# Por que remapear em vez de chamar `screencapture` pelo AeroSpace: a flag -u
# (a que mostra a miniatura) nao funciona em processo de background. Retorna
# exit=0 e nao grava arquivo nenhum.
#
# Idempotente: rodar varias vezes nao duplica nada.
# ═══════════════════════════════════════════════════════════════════════════════

set -uo pipefail

[[ "$(uname)" != "Darwin" ]] && { echo "  (nao e macOS, nada a fazer)"; exit 0; }

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[0;33m'
NC='\033[0m'

PLIST="$HOME/Library/Preferences/com.apple.symbolichotkeys.plist"

# Backup antes de tocar (uma vez por dia, pra nao poluir)
if [ -f "$PLIST" ]; then
  BACKUP="$PLIST.cbdotfiles-$(date +%Y%m%d).bak"
  [ -f "$BACKUP" ] || cp "$PLIST" "$BACKUP"
fi

set_hotkey() {
  local id="$1" ascii="$2" keycode="$3" mask="$4" desc="$5"
  defaults write com.apple.symbolichotkeys AppleSymbolicHotKeys -dict-add "$id" \
    "{enabled = 1; value = {parameters = ($ascii, $keycode, $mask); type = standard;};}"
  echo -e "  ${GREEN}+${NC} id=$id  $desc"
}

echo ""
echo -e "${CYAN}  macOS: atalhos nativos (symbolichotkeys)${NC}"
echo ""

set_hotkey 30 115 1 1179648 "Screenshot (interactive) (Super+Shift+S)"
set_hotkey 28 115 1 1703936 "Screenshot nativo (tela inteira) (Super+Shift+Alt+S)"
set_hotkey 184 115 1 1441792 "Screenshot nativo (painel de opcoes) (Super+Ctrl+Shift+S)"

# Aplica sem precisar de logout. Se falhar, so um relogin resolve.
if /System/Library/PrivateFrameworks/SystemAdministration.framework/Resources/activateSettings -u 2>/dev/null; then
  echo ""
  echo -e "  ${GREEN}+${NC} atalhos aplicados"
else
  echo ""
  echo -e "  ${YELLOW}!${NC} faca logout/login para os atalhos valerem"
fi
echo ""
