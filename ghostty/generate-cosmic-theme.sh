#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# COSMIC THEME → GHOSTTY - Le cores do tema COSMIC ativo e gera cosmic.conf
# ═══════════════════════════════════════════════════════════════════════════════
#
# Uso: ./ghostty/generate-cosmic-theme.sh
# Saida: ghostty/cosmic.conf (gerado a partir do tema COSMIC ativo)
# ═══════════════════════════════════════════════════════════════════════════════

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT="$SCRIPT_DIR/cosmic.conf"

THEME_DIR="$HOME/.config/cosmic/com.system76.CosmicTheme.Dark/v1"
ACCENT_FILE="$THEME_DIR/accent"
BG_FILE="$THEME_DIR/background"
PALETTE_FILE="$THEME_DIR/palette"

# ─────────────────────────────────────────────────────────────────────────────
# Helpers (compartilhados com kitty/generate-cosmic-theme.sh)
# ─────────────────────────────────────────────────────────────────────────────

float_to_hex() {
  local val="$1"
  local int
  int=$(awk "BEGIN { v=$val; if(v<0) v=0; if(v>1) v=1; printf \"%d\", v*255 }")
  printf '%02x' "$int"
}

extract_color() {
  local field="$1"
  local file="$2"
  local block
  block=$(awk "
    /^    ${field}: \\(/ { found=1; next }
    /^        ${field}: \\(/ { found=1; next }
    /^    ${field}:/ && /\\(/ { found=1; next }
    found && /red:/ { r=\$2; gsub(/,/,\"\",r) }
    found && /green:/ { g=\$2; gsub(/,/,\"\",g) }
    found && /blue:/ { b=\$2; gsub(/,/,\"\",b); print r,g,b; found=0 }
  " "$file" | head -1)

  [ -z "$block" ] && echo "#000000" && return

  local r g b
  r=$(echo "$block" | awk '{print $1}')
  g=$(echo "$block" | awk '{print $2}')
  b=$(echo "$block" | awk '{print $3}')

  echo "#$(float_to_hex "$r")$(float_to_hex "$g")$(float_to_hex "$b")"
}

extract_base_color() {
  local file="$1"
  extract_color "base" "$file"
}

extract_on_color() {
  local file="$1"
  local block
  block=$(awk '
    /^    on: \(/ { found=1; next }
    found && /red:/ { r=$2; gsub(/,/,"",r) }
    found && /green:/ { g=$2; gsub(/,/,"",g) }
    found && /blue:/ { b=$2; gsub(/,/,"",b); print r,g,b; found=0 }
  ' "$file" | head -1)

  [ -z "$block" ] && echo "#ffffff" && return

  local r g b
  r=$(echo "$block" | awk '{print $1}')
  g=$(echo "$block" | awk '{print $2}')
  b=$(echo "$block" | awk '{print $3}')

  echo "#$(float_to_hex "$r")$(float_to_hex "$g")$(float_to_hex "$b")"
}

# ─────────────────────────────────────────────────────────────────────────────
# Verifica se o tema existe
# ─────────────────────────────────────────────────────────────────────────────

if [ ! -f "$PALETTE_FILE" ]; then
  echo "  [!] Tema COSMIC nao encontrado em $THEME_DIR"
  echo "  [!] Mantendo cosmic.conf atual"
  exit 1
fi

# ─────────────────────────────────────────────────────────────────────────────
# Extrai cores do tema ativo
# ─────────────────────────────────────────────────────────────────────────────

THEME_NAME=$(cat "$THEME_DIR/name" 2>/dev/null | tr -d '"')

BG=$(extract_base_color "$BG_FILE")
FG=$(extract_on_color "$BG_FILE")
ACCENT=$(extract_base_color "$ACCENT_FILE")

COLOR0=$(extract_color "neutral_0" "$PALETTE_FILE")
COLOR1=$(extract_color "accent_red" "$PALETTE_FILE")
COLOR2=$(extract_color "accent_green" "$PALETTE_FILE")
COLOR3=$(extract_color "accent_yellow" "$PALETTE_FILE")
COLOR4=$(extract_color "accent_blue" "$PALETTE_FILE")
COLOR5=$(extract_color "accent_purple" "$PALETTE_FILE")
COLOR6=$(extract_color "ext_blue" "$PALETTE_FILE")
COLOR7=$(extract_color "neutral_8" "$PALETTE_FILE")

COLOR8=$(extract_color "neutral_5" "$PALETTE_FILE")
COLOR9=$(extract_color "bright_red" "$PALETTE_FILE")
COLOR10=$(extract_color "bright_green" "$PALETTE_FILE")
COLOR11=$(extract_color "accent_orange" "$PALETTE_FILE")
COLOR12=$(extract_color "accent_indigo" "$PALETTE_FILE")
COLOR13=$(extract_color "ext_purple" "$PALETTE_FILE")
COLOR14=$(extract_color "accent_blue" "$PALETTE_FILE")
COLOR15=$(extract_color "neutral_10" "$PALETTE_FILE")

# ─────────────────────────────────────────────────────────────────────────────
# Gera cosmic.conf
# ─────────────────────────────────────────────────────────────────────────────

cat > "$OUTPUT" << EOF
# Ghostty - COSMIC overrides
# Gerado automaticamente a partir do tema: $THEME_NAME
# Para regenerar: ./ghostty/generate-cosmic-theme.sh

# Transparency
background-opacity = 0.85

# Colors (COSMIC theme: $THEME_NAME)
background = $BG
foreground = $FG
cursor-color = $ACCENT

palette = 0=$COLOR0
palette = 1=$COLOR1
palette = 2=$COLOR2
palette = 3=$COLOR3
palette = 4=$COLOR4
palette = 5=$COLOR5
palette = 6=$COLOR6
palette = 7=$COLOR7

palette = 8=$COLOR8
palette = 9=$COLOR9
palette = 10=$COLOR10
palette = 11=$COLOR11
palette = 12=$COLOR12
palette = 13=$COLOR13
palette = 14=$COLOR14
palette = 15=$COLOR15
EOF

echo "  Tema: $THEME_NAME"
echo "  BG=$BG FG=$FG ACCENT=$ACCENT"
