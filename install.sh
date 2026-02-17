#!/bin/bash

DOTFILES_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Dotfiles Installer ==="
echo "Diretorio: $DOTFILES_DIR"
echo ""

# --- Zellij ---
if ! command -v zellij &> /dev/null; then
  echo "[+] Instalando Zellij..."
  mkdir -p ~/.local/bin
  curl -sL https://github.com/zellij-org/zellij/releases/latest/download/zellij-x86_64-unknown-linux-musl.tar.gz | tar xz -C ~/.local/bin/
  chmod +x ~/.local/bin/zellij
  echo "    Zellij instalado em ~/.local/bin/zellij"
else
  echo "[ok] Zellij ja instalado: $(zellij --version)"
fi

# --- Oh My Zsh ---
if [ ! -d "$HOME/.oh-my-zsh" ]; then
  echo "[+] Instalando Oh My Zsh..."
  sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
else
  echo "[ok] Oh My Zsh ja instalado"
fi

# --- Powerlevel10k ---
P10K_DIR="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k"
if [ ! -d "$P10K_DIR" ]; then
  echo "[+] Instalando Powerlevel10k..."
  git clone --depth=1 https://github.com/romkatv/powerlevel10k.git "$P10K_DIR"
else
  echo "[ok] Powerlevel10k ja instalado"
fi

# --- Plugins do Zsh ---
ZSH_CUSTOM="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}"

if [ ! -d "$ZSH_CUSTOM/plugins/zsh-autosuggestions" ]; then
  echo "[+] Instalando zsh-autosuggestions..."
  git clone https://github.com/zsh-users/zsh-autosuggestions "$ZSH_CUSTOM/plugins/zsh-autosuggestions"
else
  echo "[ok] zsh-autosuggestions ja instalado"
fi

if [ ! -d "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting" ]; then
  echo "[+] Instalando zsh-syntax-highlighting..."
  git clone https://github.com/zsh-users/zsh-syntax-highlighting "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting"
else
  echo "[ok] zsh-syntax-highlighting ja instalado"
fi

# --- NVM ---
if [ ! -d "$HOME/.nvm" ]; then
  echo "[+] Instalando NVM..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
else
  echo "[ok] NVM ja instalado"
fi

# --- Symlinks ---
echo ""
echo "[*] Criando symlinks..."

# Zellij
mkdir -p ~/.config/zellij
ln -sf "$DOTFILES_DIR/zellij/config.kdl" ~/.config/zellij/config.kdl
echo "    ~/.config/zellij/config.kdl -> dotfiles"

# Git
ln -sf "$DOTFILES_DIR/git/.gitconfig" ~/.gitconfig
echo "    ~/.gitconfig -> dotfiles"

# Zsh
ln -sf "$DOTFILES_DIR/zsh/.zshrc" ~/.zshrc
echo "    ~/.zshrc -> dotfiles"

# --- PATH ---
echo ""
if echo "$PATH" | grep -q '.local/bin'; then
  echo "[ok] ~/.local/bin ja esta no PATH"
else
  echo "[!] Adicione ~/.local/bin ao PATH no seu .zshrc:"
  echo '    export PATH="$HOME/.local/bin:$PATH"'
fi

echo ""
echo "=== Pronto! Reinicie o terminal ou rode: source ~/.zshrc ==="
