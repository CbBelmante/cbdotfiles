#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# KEYBIND GENERATOR - Gera configs a partir de keybinds.conf + vars.conf
# ═══════════════════════════════════════════════════════════════════════════════
#
# Uso: ./keybinds/generate.sh
#
# Gera:
#   keybinds/generated/hyprland-bindings.conf  (formato Hyprland)
#   keybinds/generated/cosmic-custom.ron        (formato COSMIC RON)
#   aerospace/aerospace.toml                    (formato AeroSpace macOS)
#
# Compativel com bash 3.2+ (macOS) e bash 5+ (Linux)
# ═══════════════════════════════════════════════════════════════════════════════

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE="$SCRIPT_DIR/keybinds.conf"
VARS_FILE="$SCRIPT_DIR/vars.conf"
GENERATED_DIR="$SCRIPT_DIR/generated"
DOTFILES_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

mkdir -p "$GENERATED_DIR"

# ─────────────────────────────────────────────────────────────────────────────
# Carregar variaveis de vars.conf (sem declare -A pra bash 3.2)
# ─────────────────────────────────────────────────────────────────────────────

HYPR_TERMINAL="" HYPR_BROWSER="" HYPR_WEBAPPBROWSER="" HYPR_FILEMANAGER=""
HYPR_CLOCK="" HYPR_DATE=""
COSMIC_TERMINAL="" COSMIC_BROWSER="" COSMIC_WEBAPPBROWSER="" COSMIC_FILEMANAGER=""
COSMIC_EDITOR="" COSMIC_BROWSER_FLAGS=""
AERO_TERMINAL="" AERO_BROWSER="" AERO_EDITOR="" AERO_FILEMANAGER=""
WIN_TERMINAL="" WIN_BROWSER="" WIN_EDITOR="" WIN_FILEMANAGER=""

while IFS= read -r line; do
  [[ "$line" =~ ^[[:space:]]*# ]] && continue
  [[ -z "$line" ]] && continue
  case "$line" in
    HYPR_TERMINAL=*) HYPR_TERMINAL="${line#*=}" ;;
    HYPR_BROWSER=*) HYPR_BROWSER="${line#*=}" ;;
    HYPR_WEBAPPBROWSER=*) HYPR_WEBAPPBROWSER="${line#*=}" ;;
    HYPR_FILEMANAGER=*) HYPR_FILEMANAGER="${line#*=}" ;;
    HYPR_CLOCK=*) HYPR_CLOCK="${line#*=}" ;;
    HYPR_DATE=*) HYPR_DATE="${line#*=}" ;;
    COSMIC_TERMINAL=*) COSMIC_TERMINAL="${line#*=}" ;;
    COSMIC_BROWSER=*) COSMIC_BROWSER="${line#*=}" ;;
    COSMIC_WEBAPPBROWSER=*) COSMIC_WEBAPPBROWSER="${line#*=}" ;;
    COSMIC_FILEMANAGER=*) COSMIC_FILEMANAGER="${line#*=}" ;;
    COSMIC_EDITOR=*) COSMIC_EDITOR="${line#*=}" ;;
    COSMIC_BROWSER_FLAGS=*) COSMIC_BROWSER_FLAGS="${line#*=}" ;;
    AERO_TERMINAL=*) AERO_TERMINAL="${line#*=}" ;;
    AERO_BROWSER=*) AERO_BROWSER="${line#*=}" ;;
    AERO_EDITOR=*) AERO_EDITOR="${line#*=}" ;;
    AERO_FILEMANAGER=*) AERO_FILEMANAGER="${line#*=}" ;;
    WIN_TERMINAL=*) WIN_TERMINAL="${line#*=}" ;;
    WIN_BROWSER=*) WIN_BROWSER="${line#*=}" ;;
    WIN_EDITOR=*) WIN_EDITOR="${line#*=}" ;;
    WIN_FILEMANAGER=*) WIN_FILEMANAGER="${line#*=}" ;;
  esac
done < "$VARS_FILE"

expand_hypr_vars() {
  local text="$1"
  text="${text//\$terminal/$HYPR_TERMINAL}"
  text="${text//\$browser/$HYPR_BROWSER}"
  text="${text//\$webappbrowser/$HYPR_WEBAPPBROWSER}"
  text="${text//\$filemanager/$HYPR_FILEMANAGER}"
  text="${text//\$clock/$HYPR_CLOCK}"
  text="${text//\$date/$HYPR_DATE}"
  echo "$text"
}

expand_cosmic_vars() {
  local text="$1"
  text="${text//\$COSMIC_TERMINAL/$COSMIC_TERMINAL}"
  text="${text//\$COSMIC_BROWSER/$COSMIC_BROWSER}"
  text="${text//\$COSMIC_WEBAPPBROWSER/$COSMIC_WEBAPPBROWSER}"
  text="${text//\$COSMIC_FILEMANAGER/$COSMIC_FILEMANAGER}"
  text="${text//\$COSMIC_EDITOR/$COSMIC_EDITOR}"
  text="${text//\$COSMIC_BROWSER_FLAGS/$COSMIC_BROWSER_FLAGS}"
  echo "$text"
}

expand_aero_vars() {
  local text="$1"
  text="${text//\$AERO_TERMINAL/$AERO_TERMINAL}"
  text="${text//\$AERO_BROWSER/$AERO_BROWSER}"
  text="${text//\$AERO_EDITOR/$AERO_EDITOR}"
  text="${text//\$AERO_FILEMANAGER/$AERO_FILEMANAGER}"
  echo "$text"
}

expand_win_vars() {
  local text="$1"
  text="${text//\$WIN_TERMINAL/$WIN_TERMINAL}"
  text="${text//\$WIN_BROWSER/$WIN_BROWSER}"
  text="${text//\$WIN_EDITOR/$WIN_EDITOR}"
  text="${text//\$WIN_FILEMANAGER/$WIN_FILEMANAGER}"
  echo "$text"
}

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

mods_to_hyprland() {
  echo "$1" | tr '+' ' ' | tr '[:lower:]' '[:upper:]'
}

mods_to_cosmic() {
  echo "[$(echo "$1" | sed 's/+/, /g')]"
}

key_to_cosmic() {
  local key="$1"
  case "$key" in
    Return|Escape|Print|Left|Right|Up|Down) echo "$key" ;;
    slash|space|comma|period) echo "$key" ;;
    [0-9]) echo "$key" ;;
    *) echo "$key" | tr '[:upper:]' '[:lower:]' ;;
  esac
}

mods_to_aerospace() {
  local result="$1"
  result="${result//Super/cmd}"
  result="${result//Ctrl/ctrl}"
  result="${result//Shift/shift}"
  result="${result//Alt/alt}"
  result=$(echo "$result" | tr '+' '-' | tr '[:upper:]' '[:lower:]')
  echo "$result"
}

key_to_aerospace() {
  local key="$1"
  case "$key" in
    Return) echo "enter" ;;
    Escape) echo "escape" ;;
    Print|NONE) echo "" ;;
    slash) echo "slash" ;;
    space) echo "space" ;;
    comma) echo "comma" ;;
    period) echo "period" ;;
    Left) echo "left" ;;
    Right) echo "right" ;;
    Up) echo "up" ;;
    Down) echo "down" ;;
    *) echo "$key" | tr '[:upper:]' '[:lower:]' ;;
  esac
}

# ─────────────────────────────────────────────────────────────────────────────
# Helpers macOS (symbolichotkeys) — atalhos NATIVOS do sistema
# ─────────────────────────────────────────────────────────────────────────────
#
# O macOS guarda os atalhos nativos (print, Mission Control, etc.) em
# com.apple.symbolichotkeys, identificados por um ID numerico. Remapear o
# combo de um ID preserva 100% do comportamento nativo (miniatura no canto,
# editor de anotacao, nome com timestamp) — so troca a tecla que o dispara.
#
# Isso existe porque `screencapture -u` (a flag que mostra a miniatura) NAO
# funciona quando chamado por um processo em background como o AeroSpace:
# retorna exit=0 e nao grava arquivo nenhum. Medido nesta base.
#
# O array `parameters` do symbolichotkey e (ascii, keycode, mascara_mods).

# Virtual key codes do macOS (Carbon). Cobre letras e digitos.
key_to_macos_keycode() {
  case "$(echo "$1" | tr '[:upper:]' '[:lower:]')" in
    a) echo 0 ;;  b) echo 11 ;; c) echo 8 ;;  d) echo 2 ;;  e) echo 14 ;;
    f) echo 3 ;;  g) echo 5 ;;  h) echo 4 ;;  i) echo 34 ;; j) echo 38 ;;
    k) echo 40 ;; l) echo 37 ;; m) echo 46 ;; n) echo 45 ;; o) echo 31 ;;
    p) echo 35 ;; q) echo 12 ;; r) echo 15 ;; s) echo 1 ;;  t) echo 17 ;;
    u) echo 32 ;; v) echo 9 ;;  w) echo 13 ;; x) echo 7 ;;  y) echo 16 ;;
    z) echo 6 ;;
    0) echo 29 ;; 1) echo 18 ;; 2) echo 19 ;; 3) echo 20 ;; 4) echo 21 ;;
    5) echo 23 ;; 6) echo 22 ;; 7) echo 26 ;; 8) echo 28 ;; 9) echo 25 ;;
    *) echo "" ;;
  esac
}

# Codigo ASCII do caractere (letras minusculas e digitos).
key_to_macos_ascii() {
  local k
  k=$(echo "$1" | tr '[:upper:]' '[:lower:]')
  case "$k" in
    [a-z0-9]) printf '%d' "'$k" ;;
    *) echo "" ;;
  esac
}

# Mascara de modificadores: shift 131072 | control 262144
#                           option 524288 | command 1048576
mods_to_macos_mask() {
  local mask=0
  case "$1" in *Shift*)   mask=$((mask + 131072)) ;; esac
  case "$1" in *Ctrl*)    mask=$((mask + 262144)) ;; esac
  case "$1" in *Alt*)     mask=$((mask + 524288)) ;; esac
  case "$1" in *Super*)   mask=$((mask + 1048576)) ;; esac
  echo "$mask"
}

# ─────────────────────────────────────────────────────────────────────────────
# Gerar Hyprland bindings.conf
# ─────────────────────────────────────────────────────────────────────────────

generate_hyprland() {
  local output="$GENERATED_DIR/hyprland-bindings.conf"
  local count=0

  cat > "$output" << 'HEADER'
# ═══════════════════════════════════════════════════════════════════════════════
# HYPRLAND BINDINGS - GERADO AUTOMATICAMENTE
# NÃO EDITE AQUI! Edite keybinds/keybinds.conf e keybinds/vars.conf
# ═══════════════════════════════════════════════════════════════════════════════

HEADER

  echo "# APPLICATION VARIABLES" >> "$output"
  echo "\$terminal = $HYPR_TERMINAL" >> "$output"
  echo "\$browser = $HYPR_BROWSER" >> "$output"
  echo "\$webappbrowser = $HYPR_WEBAPPBROWSER" >> "$output"
  echo "\$filemanager = $HYPR_FILEMANAGER" >> "$output"
  echo "\$clock = $HYPR_CLOCK" >> "$output"
  echo "\$date = $HYPR_DATE" >> "$output"
  echo "" >> "$output"

  while IFS= read -r line; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$line" ]] && continue

    local safe_line="${line//\\|/__PIPE__}"

    local tipo mods key desc cmd_hypr
    tipo=$(echo "$safe_line" | cut -d'|' -f1 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    mods=$(echo "$safe_line" | cut -d'|' -f2 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    key=$(echo "$safe_line" | cut -d'|' -f3 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    desc=$(echo "$safe_line" | cut -d'|' -f4 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    cmd_hypr=$(echo "$safe_line" | cut -d'|' -f5 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    cmd_hypr="${cmd_hypr//__PIPE__/|}"

    [[ "$tipo" != "BOTH" && "$tipo" != "HYPR" ]] && continue
    [[ -z "$cmd_hypr" ]] && continue

    local hypr_mods
    hypr_mods=$(mods_to_hyprland "$mods")

    echo "bindd = $hypr_mods, $key, $desc, $cmd_hypr" >> "$output"
    count=$((count + 1))
  done < "$SOURCE"

  echo -e "  ${GREEN}✓${NC} hyprland-bindings.conf (${count} keybinds)"
}

# ─────────────────────────────────────────────────────────────────────────────
# Gerar COSMIC custom RON
# ─────────────────────────────────────────────────────────────────────────────

generate_cosmic() {
  local output="$GENERATED_DIR/cosmic-custom.ron"
  local count=0

  cat > "$output" << 'HEADER'
// ═══════════════════════════════════════════════════════════════════════════════
// COSMIC KEYBINDS - GERADO AUTOMATICAMENTE
// NÃO EDITE AQUI! Edite keybinds/keybinds.conf e keybinds/vars.conf
// ═══════════════════════════════════════════════════════════════════════════════
{
HEADER

  while IFS= read -r line; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$line" ]] && continue

    local safe_line="${line//\\|/__PIPE__}"

    local tipo mods key desc cmd_cosmic
    tipo=$(echo "$safe_line" | cut -d'|' -f1 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    mods=$(echo "$safe_line" | cut -d'|' -f2 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    key=$(echo "$safe_line" | cut -d'|' -f3 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    desc=$(echo "$safe_line" | cut -d'|' -f4 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    cmd_cosmic=$(echo "$safe_line" | cut -d'|' -f6 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    cmd_cosmic="${cmd_cosmic//__PIPE__/|}"

    [[ "$tipo" != "BOTH" && "$tipo" != "COSM" ]] && continue
    [[ -z "$cmd_cosmic" ]] && continue

    cmd_cosmic=$(expand_cosmic_vars "$cmd_cosmic")

    local cosmic_mods cosmic_key
    cosmic_mods=$(mods_to_cosmic "$mods")
    cosmic_key=$(key_to_cosmic "$key")

    echo "  // $desc" >> "$output"
    if [ "$key" = "NONE" ]; then
      echo "  (modifiers: $cosmic_mods): $cmd_cosmic," >> "$output"
    else
      echo "  (modifiers: $cosmic_mods, key: \"$cosmic_key\"): $cmd_cosmic," >> "$output"
    fi
    echo "" >> "$output"
    count=$((count + 1))
  done < "$SOURCE"

  echo "}" >> "$output"
  echo -e "  ${GREEN}✓${NC} cosmic-custom.ron (${count} keybinds)"
}

# ─────────────────────────────────────────────────────────────────────────────
# Gerar AeroSpace config (macOS)
# ─────────────────────────────────────────────────────────────────────────────

generate_aerospace() {
  local output="$DOTFILES_DIR/aerospace/aerospace.toml"
  local count=0

  mkdir -p "$(dirname "$output")"

  cat > "$output" << 'HEADER'
# ═══════════════════════════════════════════════════════════════════════════════
# AEROSPACE CONFIG - GERADO AUTOMATICAMENTE
# ═══════════════════════════════════════════════════════════════════════════════
#
# NÃO EDITE AQUI! Edite keybinds/keybinds.conf e keybinds/vars.conf
# Depois rode: ./keybinds/generate.sh
#
# Docs: https://nikitabobko.github.io/AeroSpace/guide
# ═══════════════════════════════════════════════════════════════════════════════

config-version = 2

start-at-login = true

enable-normalization-flatten-containers = true
enable-normalization-opposite-orientation-for-nested-containers = true

on-focused-monitor-changed = ['move-mouse monitor-lazy-center']

automatically-unhide-macos-hidden-apps = true

# Inicia JankyBorders junto com AeroSpace (borda na janela ativa)
after-startup-command = ['exec-and-forget borders']

# Workspaces por monitor (1-5 monitor principal, 6-9 secundario)
[workspace-to-monitor-force-assignment]
1 = 2
2 = 2
3 = 2
4 = 2
5 = 2
6 = 1
7 = 1
8 = 1
9 = 1

[gaps]
inner.horizontal = 10
inner.vertical = 10
outer.left = 10
outer.bottom = 10
outer.top = 10
outer.right = 10

# ═══════════════════════════════════════════════════════════════════════════════
# KEYBINDS (gerados de keybinds.conf — Super vira cmd no macOS)
# ═══════════════════════════════════════════════════════════════════════════════

[mode.main.binding]
HEADER

  while IFS= read -r line; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$line" ]] && continue

    local safe_line="${line//\\|/__PIPE__}"

    local tipo mods key desc cmd_aero
    tipo=$(echo "$safe_line" | cut -d'|' -f1 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    mods=$(echo "$safe_line" | cut -d'|' -f2 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    key=$(echo "$safe_line" | cut -d'|' -f3 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    desc=$(echo "$safe_line" | cut -d'|' -f4 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    cmd_aero=$(echo "$safe_line" | cut -d'|' -f7 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    cmd_aero="${cmd_aero//__PIPE__/|}"

    [[ "$tipo" != "BOTH" && "$tipo" != "AERO" ]] && continue
    [[ -z "$cmd_aero" ]] && continue

    # macos-hotkey: nao e comando do AeroSpace — vai para symbolichotkeys.sh
    case "$cmd_aero" in macos-hotkey:*) continue ;; esac

    cmd_aero=$(expand_aero_vars "$cmd_aero")

    local aero_mods aero_key
    aero_mods=$(mods_to_aerospace "$mods")
    aero_key=$(key_to_aerospace "$key")

    [[ -z "$aero_key" ]] && continue

    local binding
    if [ -n "$aero_mods" ]; then
      binding="${aero_mods}-${aero_key}"
    else
      binding="${aero_key}"
    fi

    echo "# $desc" >> "$output"
    echo "$binding = '$cmd_aero'" >> "$output"
    echo "" >> "$output"
    count=$((count + 1))
  done < "$SOURCE"

  echo -e "  ${GREEN}✓${NC} aerospace.toml (${count} keybinds)"
}

# ─────────────────────────────────────────────────────────────────────────────
# Gerar macOS symbolichotkeys (atalhos NATIVOS do sistema)
# ─────────────────────────────────────────────────────────────────────────────

generate_macos_hotkeys() {
  local output="$DOTFILES_DIR/macos/symbolichotkeys.sh"
  local count=0

  mkdir -p "$(dirname "$output")"

  cat > "$output" << 'HEADER'
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

# ATENCAO: tem de ser XML com <integer> explicito. O formato old-style
# ("{enabled = 1; parameters = (115, 1, 1179648);}") grava os numeros como
# STRING, e o macOS ignora em silencio um symbolichotkey tipado como string
# — o atalho simplesmente nao dispara. Confirmado com plutil nesta base:
# os nativos do sistema sao <integer>, sem aspas.
set_hotkey() {
  local id="$1" ascii="$2" keycode="$3" mask="$4" desc="$5"
  defaults write com.apple.symbolichotkeys AppleSymbolicHotKeys -dict-add "$id" "
<dict>
  <key>enabled</key><integer>1</integer>
  <key>value</key>
  <dict>
    <key>parameters</key>
    <array>
      <integer>$ascii</integer>
      <integer>$keycode</integer>
      <integer>$mask</integer>
    </array>
    <key>type</key><string>standard</string>
  </dict>
</dict>"
  echo -e "  ${GREEN}+${NC} id=$id  $desc"
}

echo ""
echo -e "${CYAN}  macOS: atalhos nativos (symbolichotkeys)${NC}"
echo ""

HEADER

  # Linhas marcadas com macos-hotkey:<id> na coluna do AeroSpace
  while IFS= read -r line; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$line" ]] && continue

    local safe_line="${line//\\|/__PIPE__}"

    local tipo mods key desc cmd_aero
    tipo=$(echo "$safe_line" | cut -d'|' -f1 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    mods=$(echo "$safe_line" | cut -d'|' -f2 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    key=$(echo "$safe_line" | cut -d'|' -f3 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    desc=$(echo "$safe_line" | cut -d'|' -f4 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    cmd_aero=$(echo "$safe_line" | cut -d'|' -f7 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

    [[ "$tipo" != "BOTH" && "$tipo" != "AERO" ]] && continue
    case "$cmd_aero" in macos-hotkey:*) ;; *) continue ;; esac

    local hk_id ascii keycode mask
    hk_id="${cmd_aero#macos-hotkey:}"
    ascii=$(key_to_macos_ascii "$key")
    keycode=$(key_to_macos_keycode "$key")
    mask=$(mods_to_macos_mask "$mods")

    if [ -z "$ascii" ] || [ -z "$keycode" ]; then
      echo -e "  ${YELLOW}!${NC} tecla '$key' sem key code macOS — id=$hk_id ignorado" >&2
      continue
    fi

    echo "set_hotkey $hk_id $ascii $keycode $mask \"$desc ($mods+$key)\"" >> "$output"
    count=$((count + 1))
  done < "$SOURCE"

  cat >> "$output" << 'FOOTER'

# Aplica sem precisar de logout. Se falhar, so um relogin resolve.
if /System/Library/PrivateFrameworks/SystemAdministration.framework/Resources/activateSettings -u 2>/dev/null; then
  echo ""
  echo -e "  ${GREEN}+${NC} atalhos aplicados"
else
  echo ""
  echo -e "  ${YELLOW}!${NC} faca logout/login para os atalhos valerem"
fi
echo ""
FOOTER

  chmod +x "$output"
  echo -e "  ${GREEN}✓${NC} macos/symbolichotkeys.sh (${count} atalhos nativos)"
}

# ─────────────────────────────────────────────────────────────────────────────
# Gerar GlazeWM config (Windows)
# ─────────────────────────────────────────────────────────────────────────────

mods_to_glazewm() {
  local result="$1"
  result="${result//Super/alt}"
  result="${result//Ctrl/ctrl}"
  result="${result//Shift/shift}"
  result="${result//Alt/alt}"
  result=$(echo "$result" | tr '+' '+' | tr '[:upper:]' '[:lower:]')
  echo "$result"
}

key_to_glazewm() {
  local key="$1"
  case "$key" in
    Return) echo "enter" ;;
    Escape) echo "escape" ;;
    Print|NONE) echo "" ;;
    slash) echo "oem_2" ;;
    space) echo "space" ;;
    comma) echo "oem_comma" ;;
    period) echo "oem_period" ;;
    Left) echo "left" ;;
    Right) echo "right" ;;
    Up) echo "up" ;;
    Down) echo "down" ;;
    *) echo "$key" | tr '[:upper:]' '[:lower:]' ;;
  esac
}

generate_glazewm() {
  local output="$DOTFILES_DIR/glazewm/config.yaml"
  local count=0

  mkdir -p "$(dirname "$output")"

  cat > "$output" << 'HEADER'
# ═══════════════════════════════════════════════════════════════════════════════
# GLAZEWM CONFIG - GERADO AUTOMATICAMENTE
# ═══════════════════════════════════════════════════════════════════════════════
#
# NÃO EDITE AQUI! Edite keybinds/keybinds.conf e keybinds/vars.conf
# Depois rode: ./keybinds/generate.sh
#
# Docs: https://github.com/glzr-io/glazewm
# ═══════════════════════════════════════════════════════════════════════════════

general:
  startup_commands: ['shell-exec zebar']
  shutdown_commands: ['shell-exec taskkill /IM zebar.exe /F']
  focus_follows_cursor: false
  toggle_workspace_on_refocus: false
  cursor_jump:
    enabled: true
    trigger: 'monitor_focus'
  hide_method: 'cloak'

gaps:
  scale_with_dpi: true
  inner_gap: '10px'
  outer_gap:
    top: '10px'
    right: '10px'
    bottom: '10px'
    left: '10px'

window_effects:
  focused_window:
    border:
      enabled: true
      color: '#89b4fa'
  other_windows:
    border:
      enabled: true
      color: '#45475a'

window_behavior:
  initial_state: 'tiling'
  state_defaults:
    floating:
      centered: true
      shown_on_top: false
    fullscreen:
      maximized: false
      shown_on_top: false

workspaces:
  - name: '1'
  - name: '2'
  - name: '3'
  - name: '4'
  - name: '5'
  - name: '6'
  - name: '7'
  - name: '8'
  - name: '9'

# ═══════════════════════════════════════════════════════════════════════════════
# KEYBINDS (gerados de keybinds.conf — Super vira alt no Windows)
# ═══════════════════════════════════════════════════════════════════════════════

keybindings:
HEADER

  while IFS= read -r line; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$line" ]] && continue

    local safe_line="${line//\\|/__PIPE__}"

    local tipo mods key desc cmd_glaze
    tipo=$(echo "$safe_line" | cut -d'|' -f1 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    mods=$(echo "$safe_line" | cut -d'|' -f2 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    key=$(echo "$safe_line" | cut -d'|' -f3 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    desc=$(echo "$safe_line" | cut -d'|' -f4 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    cmd_glaze=$(echo "$safe_line" | cut -d'|' -f8 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    cmd_glaze="${cmd_glaze//__PIPE__/|}"

    [[ "$tipo" != "BOTH" && "$tipo" != "GLAZE" ]] && continue
    [[ -z "$cmd_glaze" ]] && continue

    cmd_glaze=$(expand_win_vars "$cmd_glaze")

    local glaze_mods glaze_key
    glaze_mods=$(mods_to_glazewm "$mods")
    glaze_key=$(key_to_glazewm "$key")

    [[ -z "$glaze_key" ]] && continue

    local binding
    if [ -n "$glaze_mods" ]; then
      binding="${glaze_mods}+${glaze_key}"
    else
      binding="${glaze_key}"
    fi

    echo "  # $desc" >> "$output"
    echo "  - commands: ['$cmd_glaze']" >> "$output"
    echo "    bindings: ['$binding']" >> "$output"
    count=$((count + 1))
  done < "$SOURCE"

  echo -e "  ${GREEN}✓${NC} glazewm/config.yaml (${count} keybinds)"
}

# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${BOLD}[keybinds]${NC} Gerando configs..."
echo ""

generate_hyprland
generate_cosmic
generate_aerospace
generate_macos_hotkeys
generate_glazewm

echo ""
echo -e "  ${CYAN}+${NC} Hyprland/COSMIC: keybinds/generated/"
echo -e "  ${CYAN}+${NC} AeroSpace: aerospace/aerospace.toml"
echo -e "  ${CYAN}+${NC} macOS nativos: macos/symbolichotkeys.sh"
echo -e "  ${CYAN}+${NC} GlazeWM: glazewm/config.yaml"
echo -e "  ${CYAN}+${NC} Variaveis: keybinds/vars.conf"
