#!/bin/bash

DOTFILES_DIR="$(cd "$(dirname "$0")" && pwd)"
INSTALLERS_DIR="$DOTFILES_DIR/installers"

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# Modulos disponiveis (ordem de instalacao)
ALL_MODULES=(zsh nvm git zellij nvim ghostty kitty lazygit fastfetch btop)

show_header() {
  echo ""
  echo -e "${CYAN}${BOLD}"
  echo "   ██████╗██████╗ ██████╗  ██████╗ ████████╗███████╗██╗██╗     ███████╗███████╗"
  echo "  ██╔════╝██╔══██╗██╔══██╗██╔═══██╗╚══██╔══╝██╔════╝██║██║     ██╔════╝██╔════╝"
  echo "  ██║     ██████╔╝██║  ██║██║   ██║   ██║   █████╗  ██║██║     █████╗  ███████╗"
  echo "  ██║     ██╔══██╗██║  ██║██║   ██║   ██║   ██╔══╝  ██║██║     ██╔══╝  ╚════██║"
  echo "  ╚██████╗██████╔╝██████╔╝╚██████╔╝   ██║   ██║     ██║███████╗███████╗███████║"
  echo "   ╚═════╝╚═════╝ ╚═════╝  ╚═════╝    ╚═╝   ╚═╝     ╚═╝╚══════╝╚══════╝╚══════╝"
  echo -e "${NC}"
  echo -e "  ${DIM}Diretorio: $DOTFILES_DIR${NC}"
  echo ""
}

show_help() {
  show_header
  echo -e "  ${BOLD}Uso:${NC} ./install.sh [modulos...]"
  echo ""
  echo -e "  Sem argumentos instala tudo. Com argumentos instala apenas os selecionados."
  echo ""
  echo -e "  ${BOLD}Modulos disponiveis:${NC}"
  for mod in "${ALL_MODULES[@]}"; do
    echo -e "    ${CYAN}•${NC} $mod"
  done
  echo ""
  echo -e "  ${BOLD}Exemplos:${NC}"
  echo -e "    ${DIM}./install.sh${NC}              ${DIM}# instala tudo${NC}"
  echo -e "    ${DIM}./install.sh zellij nvim${NC}  ${DIM}# instala so zellij e nvim${NC}"
  echo ""
}

run_module() {
  local mod="$1"
  local script="$INSTALLERS_DIR/$mod.sh"

  if [ -f "$script" ]; then
    echo ""
    bash "$script"
  else
    echo -e "  ${YELLOW}[!]${NC} Modulo '$mod' nao encontrado"
  fi
}

show_footer() {
  echo ""
  echo -e "  ${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "  ${GREEN}${BOLD}  ✓ cbdotfiles updated!${NC}"
  echo -e "  ${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  ${DIM}Rode:${NC} ${BOLD}source ~/.zshrc${NC}"
  echo ""
}

# --- Main ---
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
  show_help
  exit 0
fi

show_header

# Se passou argumentos, instala so os selecionados
if [ $# -gt 0 ]; then
  MODULES=("$@")
  echo -e "  ${BLUE}Modulos:${NC} ${MODULES[*]}"
else
  MODULES=("${ALL_MODULES[@]}")
  echo -e "  ${BLUE}Instalando todos os modulos...${NC}"
fi

for mod in "${MODULES[@]}"; do
  run_module "$mod"
done

# PATH check
echo ""
if ! echo "$PATH" | grep -q '.local/bin'; then
  echo -e "  ${YELLOW}[!]${NC} Adicione ~/.local/bin ao PATH no seu .zshrc:"
  echo -e "      ${DIM}export PATH=\"\$HOME/.local/bin:\$PATH\"${NC}"
fi

show_footer
