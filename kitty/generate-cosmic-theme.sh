#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# COSMIC THEME → KITTY - Le cores do tema COSMIC ativo e gera cosmic.conf
# ═══════════════════════════════════════════════════════════════════════════════
#
# Uso: ./kitty/generate-cosmic-theme.sh
# Saida: kitty/cosmic.conf (gerado a partir do tema COSMIC ativo)
# ═══════════════════════════════════════════════════════════════════════════════

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT="$SCRIPT_DIR/cosmic.conf"

THEME_DIR="$HOME/.config/cosmic/com.system76.CosmicTheme.Dark/v1"
ACCENT_FILE="$THEME_DIR/accent"
BG_FILE="$THEME_DIR/background"
PALETTE_FILE="$THEME_DIR/palette"

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

# Converte float (0.0-1.0) pra hex (00-FF)
float_to_hex() {
  local val="$1"
  local int
  # Trata valores negativos como 0
  int=$(awk "BEGIN { v=$val; if(v<0) v=0; if(v>1) v=1; printf \"%d\", v*255 }")
  printf '%02x' "$int"
}

# Extrai os 3 floats (red, green, blue) de um bloco RON e converte pra #RRGGBB
# Uso: extract_color "nome_do_campo" "arquivo"
extract_color() {
  local field="$1"
  local file="$2"
  local r g b

  # Extrai o bloco do campo e pega os valores red/green/blue
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

  r=$(echo "$block" | awk '{print $1}')
  g=$(echo "$block" | awk '{print $2}')
  b=$(echo "$block" | awk '{print $3}')

  echo "#$(float_to_hex "$r")$(float_to_hex "$g")$(float_to_hex "$b")"
}

# Extrai cor do primeiro bloco "base:" de um arquivo
extract_base_color() {
  local file="$1"
  extract_color "base" "$file"
}

# Extrai cor "on:" do background (foreground text)
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

# Background e foreground
BG=$(extract_base_color "$BG_FILE")
FG=$(extract_on_color "$BG_FILE")

# Accent (cursor)
ACCENT=$(extract_base_color "$ACCENT_FILE")

# Palette: 16 cores do terminal
COLOR0=$(extract_color "neutral_0" "$PALETTE_FILE")      # black
COLOR1=$(extract_color "accent_red" "$PALETTE_FILE")      # red
COLOR2=$(extract_color "accent_green" "$PALETTE_FILE")    # green
COLOR3=$(extract_color "accent_yellow" "$PALETTE_FILE")   # yellow
COLOR4=$(extract_color "accent_blue" "$PALETTE_FILE")     # blue
COLOR5=$(extract_color "accent_purple" "$PALETTE_FILE")   # magenta
COLOR6=$(extract_color "ext_blue" "$PALETTE_FILE")        # cyan
COLOR7=$(extract_color "neutral_8" "$PALETTE_FILE")       # white

COLOR8=$(extract_color "neutral_5" "$PALETTE_FILE")       # bright black
COLOR9=$(extract_color "bright_red" "$PALETTE_FILE")      # bright red
COLOR10=$(extract_color "bright_green" "$PALETTE_FILE")   # bright green
COLOR11=$(extract_color "accent_orange" "$PALETTE_FILE")  # bright yellow
COLOR12=$(extract_color "accent_indigo" "$PALETTE_FILE")  # bright blue
COLOR13=$(extract_color "ext_purple" "$PALETTE_FILE")     # bright magenta
COLOR14=$(extract_color "accent_blue" "$PALETTE_FILE")    # bright cyan
COLOR15=$(extract_color "neutral_10" "$PALETTE_FILE")     # bright white

# ─────────────────────────────────────────────────────────────────────────────
# Gera cosmic.conf
# ─────────────────────────────────────────────────────────────────────────────

cat > "$OUTPUT" << EOF
# Kitty - COSMIC overrides
# Gerado automaticamente a partir do tema: $THEME_NAME
# Para regenerar: ./kitty/generate-cosmic-theme.sh

# Transparency & Blur
background_opacity 0.85
background_blur 32

# Colors (COSMIC theme: $THEME_NAME)
background $BG
foreground $FG
cursor $ACCENT
cursor_text_color $BG

color0  $COLOR0
color1  $COLOR1
color2  $COLOR2
color3  $COLOR3
color4  $COLOR4
color5  $COLOR5
color6  $COLOR6
color7  $COLOR7

color8  $COLOR8
color9  $COLOR9
color10 $COLOR10
color11 $COLOR11
color12 $COLOR12
color13 $COLOR13
color14 $COLOR14
color15 $COLOR15
EOF

echo "  Tema: $THEME_NAME"
echo "  BG=$BG FG=$FG ACCENT=$ACCENT"
