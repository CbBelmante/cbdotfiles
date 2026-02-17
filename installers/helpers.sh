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

# Detecta o gerenciador de pacotes (com retry e refresh de mirrors)
pkg_install() {
  if command -v pacman &> /dev/null; then
    if ! sudo pacman -S --noconfirm "$@" 2>/dev/null; then
      log_warn "Falha na instalacao, atualizando mirrors e tentando novamente..."
      sudo pacman -Syy --noconfirm &> /dev/null
      if ! sudo pacman -S --noconfirm "$@"; then
        log_warn "Falha ao instalar: $*"
        return 1
      fi
    fi
  elif command -v apt &> /dev/null; then
    if ! sudo apt install -y "$@" 2>/dev/null; then
      log_warn "Falha na instalacao, atualizando repos e tentando novamente..."
      sudo apt update -qq &> /dev/null
      if ! sudo apt install -y "$@"; then
        log_warn "Falha ao instalar: $*"
        return 1
      fi
    fi
  elif command -v dnf &> /dev/null; then
    if ! sudo dnf install -y "$@"; then
      log_warn "Falha ao instalar: $*"
      return 1
    fi
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
