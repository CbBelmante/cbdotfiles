#!/bin/bash

DOTFILES_DIR="$(cd "$(dirname "$0")" && pwd)"
INSTALLERS_DIR="$DOTFILES_DIR/installers"

# Modulos disponiveis (ordem de instalacao)
ALL_MODULES=(zsh nvm git zellij nvim ghostty kitty lazygit fastfetch btop)

show_help() {
  echo "=== CbDotfiles Installer ==="
  echo ""
  echo "Uso: ./install.sh [modulos...]"
  echo ""
  echo "Sem argumentos instala tudo. Com argumentos instala apenas os selecionados."
  echo ""
  echo "Modulos disponiveis:"
  for mod in "${ALL_MODULES[@]}"; do
    echo "  - $mod"
  done
  echo ""
  echo "Exemplos:"
  echo "  ./install.sh              # instala tudo"
  echo "  ./install.sh zellij nvim  # instala so zellij e nvim"
  echo "  ./install.sh --help       # mostra esta ajuda"
}

run_module() {
  local mod="$1"
  local script="$INSTALLERS_DIR/$mod.sh"

  if [ -f "$script" ]; then
    echo ""
    bash "$script"
  else
    echo "[!] Modulo '$mod' nao encontrado: $script"
  fi
}

# --- Main ---
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
  show_help
  exit 0
fi

echo "=== CbDotfiles Installer ==="
echo "Diretorio: $DOTFILES_DIR"

# Se passou argumentos, instala so os selecionados
if [ $# -gt 0 ]; then
  MODULES=("$@")
else
  MODULES=("${ALL_MODULES[@]}")
fi

for mod in "${MODULES[@]}"; do
  run_module "$mod"
done

# PATH check
echo ""
if echo "$PATH" | grep -q '.local/bin'; then
  echo "[ok] ~/.local/bin ja esta no PATH"
else
  echo "[!] Adicione ~/.local/bin ao PATH no seu .zshrc:"
  echo '    export PATH="$HOME/.local/bin:$PATH"'
fi

echo ""
echo "=== Pronto! Reinicie o terminal ou rode: source ~/.zshrc ==="
