#!/bin/bash
# Funcoes auxiliares compartilhadas entre installers

# Detecta o gerenciador de pacotes
pkg_install() {
  if command -v pacman &> /dev/null; then
    sudo pacman -S --noconfirm "$@"
  elif command -v apt &> /dev/null; then
    sudo apt install -y "$@"
  elif command -v dnf &> /dev/null; then
    sudo dnf install -y "$@"
  else
    echo "  [!] Gerenciador de pacotes nao encontrado. Instale manualmente: $*"
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
