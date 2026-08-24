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
  result="${result//Super/alt}"
  result="${result//Ctrl/ctrl}"
  result="${result//Shift/shift}"
  result="${result//Alt/alt}"
  echo "$result" | tr '+' '-' | tr '[:upper:]' '[:lower:]'
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

start-at-login = true

enable-normalization-flatten-containers = true
enable-normalization-opposite-orientation-for-nested-containers = true

on-focused-monitor-changed = ['move-mouse monitor-lazy-center']

[gaps]
inner.horizontal = 10
inner.vertical = 10
outer.left = 10
outer.bottom = 10
outer.top = 10
outer.right = 10

# ═══════════════════════════════════════════════════════════════════════════════
# KEYBINDS (gerados de keybinds.conf — Super vira alt no macOS)
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
# Main
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${BOLD}[keybinds]${NC} Gerando configs..."
echo ""

generate_hyprland
generate_cosmic
generate_aerospace

echo ""
echo -e "  ${CYAN}+${NC} Hyprland/COSMIC: keybinds/generated/"
echo -e "  ${CYAN}+${NC} AeroSpace: aerospace/aerospace.toml"
echo -e "  ${CYAN}+${NC} Variaveis: keybinds/vars.conf"
