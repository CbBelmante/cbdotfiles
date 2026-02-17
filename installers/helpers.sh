#!/bin/bash
# Funcoes auxiliares compartilhadas entre installers

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# Logs padronizados
log_ok()    { echo -e "  ${GREEN}✓${NC} $1"; }
log_add()   { echo -e "  ${CYAN}+${NC} $1"; }
log_warn()  { echo -e "  ${YELLOW}!${NC} $1"; }
log_title() { echo -e "${BOLD}[$1]${NC} Configurando $2..."; }

# Detecta o gerenciador de pacotes
pkg_install() {
  if command -v pacman &> /dev/null; then
    sudo pacman -S --noconfirm "$@"
  elif command -v apt &> /dev/null; then
    sudo apt install -y "$@"
  elif command -v dnf &> /dev/null; then
    sudo dnf install -y "$@"
  else
    log_warn "Gerenciador de pacotes nao encontrado. Instale manualmente: $*"
    return 1
  fi
}

# Retorna o nome da distro
get_distro() {
  if command -v pacman &> /dev/null; then
    echo "arch"
  elif command -v apt &> /dev/null; then
    echo "debian"
  elif command -v dnf &> /dev/null; then
    echo "fedora"
  else
    echo "unknown"
  fi
}
