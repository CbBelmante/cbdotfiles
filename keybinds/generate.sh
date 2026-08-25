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
generate_glazewm

echo ""
echo -e "  ${CYAN}+${NC} Hyprland/COSMIC: keybinds/generated/"
echo -e "  ${CYAN}+${NC} AeroSpace: aerospace/aerospace.toml"
echo -e "  ${CYAN}+${NC} GlazeWM: glazewm/config.yaml"
echo -e "  ${CYAN}+${NC} Variaveis: keybinds/vars.conf"
