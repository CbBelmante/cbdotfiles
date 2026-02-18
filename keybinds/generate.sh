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
# ═══════════════════════════════════════════════════════════════════════════════

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE="$SCRIPT_DIR/keybinds.conf"
VARS_FILE="$SCRIPT_DIR/vars.conf"
GENERATED_DIR="$SCRIPT_DIR/generated"

# Cores
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

mkdir -p "$GENERATED_DIR"

# ─────────────────────────────────────────────────────────────────────────────
# Carregar variaveis de vars.conf
# ─────────────────────────────────────────────────────────────────────────────
declare -A HYPR_VARS
declare -A COSMIC_VARS

while IFS= read -r line; do
  [[ "$line" =~ ^[[:space:]]*# ]] && continue
  [[ -z "$line" ]] && continue
  if [[ "$line" =~ ^HYPR_([A-Z_]+)=(.+)$ ]]; then
    HYPR_VARS["${BASH_REMATCH[1],,}"]="${BASH_REMATCH[2]}"
  elif [[ "$line" =~ ^COSMIC_([A-Z_]+)=(.+)$ ]]; then
    COSMIC_VARS["COSMIC_${BASH_REMATCH[1]}"]="${BASH_REMATCH[2]}"
  fi
done < "$VARS_FILE"

# Substitui $COSMIC_* por seus valores
expand_cosmic_vars() {
  local text="$1"
  for var in "${!COSMIC_VARS[@]}"; do
    text="${text//\$$var/${COSMIC_VARS[$var]}}"
  done
  echo "$text"
}

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

# Converte mods "Super+Shift+Alt" -> "SUPER SHIFT ALT" (Hyprland)
mods_to_hyprland() {
  local mods="$1"
  echo "$mods" | tr '+' ' ' | tr '[:lower:]' '[:upper:]'
}

# Converte mods "Super+Shift" -> "[Super, Shift]" (COSMIC RON)
mods_to_cosmic() {
  local mods="$1"
  local result
  result=$(echo "$mods" | sed 's/+/, /g')
  echo "[$result]"
}

# Converte tecla para COSMIC RON (minuscula, nomes especiais)
key_to_cosmic() {
  local key="$1"
  case "$key" in
    Return) echo "Return" ;;
    Escape) echo "Escape" ;;
    slash)  echo "slash" ;;
    [0-9])  echo "$key" ;;
    *)      echo "$key" | tr '[:upper:]' '[:lower:]' ;;
  esac
}

# ─────────────────────────────────────────────────────────────────────────────
# Gerar Hyprland bindings.conf
# ─────────────────────────────────────────────────────────────────────────────

generate_hyprland() {
  local output="$GENERATED_DIR/hyprland-bindings.conf"
  local count=0
  local current_section=""

  cat > "$output" << 'HEADER'
# ═══════════════════════════════════════════════════════════════════════════════
# HYPRLAND BINDINGS - GERADO AUTOMATICAMENTE
# ═══════════════════════════════════════════════════════════════════════════════
#
# NÃO EDITE AQUI! Edite keybinds/keybinds.conf e keybinds/vars.conf
# Depois rode: ./keybinds/generate.sh
# ═══════════════════════════════════════════════════════════════════════════════

HEADER

  # Gerar bloco de variaveis a partir de vars.conf
  echo "# APPLICATION VARIABLES" >> "$output"
  for var in "${!HYPR_VARS[@]}"; do
    echo "\$$var = ${HYPR_VARS[$var]}" >> "$output"
  done
  echo "" >> "$output"

  while IFS= read -r line; do
    # Pular comentarios e linhas vazias
    [[ "$line" =~ ^[[:space:]]*# ]] && {
      # Detectar secoes
      if [[ "$line" =~ ^#\ ─ ]]; then
        :
      elif [[ "$line" =~ ^#\ [A-Z] ]] && [[ ! "$line" =~ ^#\ \$ ]] && [[ ! "$line" =~ ^#\ Formato ]] && [[ ! "$line" =~ ^#\ TIPOS ]] && [[ ! "$line" =~ ^#\ MODS ]] && [[ ! "$line" =~ ^#\ CMD ]] && [[ ! "$line" =~ ^#\ Para ]] && [[ ! "$line" =~ ^#\ Definidas ]] && [[ ! "$line" =~ ^#\ Mude ]]; then
        section_name="${line#\# }"
        if [ "$section_name" != "$current_section" ]; then
          current_section="$section_name"
          echo "# $current_section" >> "$output"
        fi
      fi
      continue
    }
    [[ -z "$line" ]] && continue

    # Parse: TIPO | MODS | TECLA | DESC | CMD_HYPR | CMD_COSMIC
    local tipo mods key desc cmd_hypr
    tipo=$(echo "$line" | cut -d'|' -f1 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    mods=$(echo "$line" | cut -d'|' -f2 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    key=$(echo "$line" | cut -d'|' -f3 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    desc=$(echo "$line" | cut -d'|' -f4 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    cmd_hypr=$(echo "$line" | cut -d'|' -f5 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

    # Pular se nao e pra Hyprland
    [[ "$tipo" != "BOTH" && "$tipo" != "HYPR" ]] && continue

    # Pular se nao tem comando Hyprland
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
// ═══════════════════════════════════════════════════════════════════════════════
//
// NÃO EDITE AQUI! Edite keybinds/keybinds.conf e keybinds/vars.conf
// Depois rode: ./keybinds/generate.sh
//
// Copie para: ~/.config/cosmic/com.system76.CosmicSettings.Shortcuts/v1/custom
// ═══════════════════════════════════════════════════════════════════════════════
{
HEADER

  local entries=()

  while IFS= read -r line; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$line" ]] && continue

    local tipo mods key desc cmd_cosmic
    tipo=$(echo "$line" | cut -d'|' -f1 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    mods=$(echo "$line" | cut -d'|' -f2 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    key=$(echo "$line" | cut -d'|' -f3 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    desc=$(echo "$line" | cut -d'|' -f4 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    cmd_cosmic=$(echo "$line" | cut -d'|' -f6 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

    # Pular se nao e pra COSMIC
    [[ "$tipo" != "BOTH" && "$tipo" != "COSM" ]] && continue

    # Pular se nao tem comando COSMIC
    [[ -z "$cmd_cosmic" ]] && continue

    # Substituir variaveis COSMIC_*
    cmd_cosmic=$(expand_cosmic_vars "$cmd_cosmic")

    local cosmic_mods cosmic_key
    cosmic_mods=$(mods_to_cosmic "$mods")
    cosmic_key=$(key_to_cosmic "$key")

    entries+=("  // $desc")
    if [ "$key" = "NONE" ]; then
      entries+=("  (modifiers: $cosmic_mods): $cmd_cosmic,")
    else
      entries+=("  (modifiers: $cosmic_mods, key: \"$cosmic_key\"): $cmd_cosmic,")
    fi
    entries+=("")
    count=$((count + 1))
  done < "$SOURCE"

  # Escrever entries
  for entry in "${entries[@]}"; do
    echo "$entry" >> "$output"
  done

  echo "}" >> "$output"

  echo -e "  ${GREEN}✓${NC} cosmic-custom.ron (${count} keybinds)"
}

# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${BOLD}[keybinds]${NC} Gerando configs..."
echo ""

generate_hyprland
generate_cosmic

echo ""
echo -e "  ${CYAN}+${NC} Arquivos em: keybinds/generated/"
echo -e "  ${CYAN}+${NC} Variaveis lidas de: keybinds/vars.conf"
