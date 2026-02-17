#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "[zsh] Configurando Zsh..."

# Oh My Zsh
if [ ! -d "$HOME/.oh-my-zsh" ]; then
  echo "  [+] Instalando Oh My Zsh..."
  sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
else
  echo "  [ok] Oh My Zsh ja instalado"
fi

# Powerlevel10k
P10K_DIR="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k"
if [ ! -d "$P10K_DIR" ]; then
  echo "  [+] Instalando Powerlevel10k..."
  git clone --depth=1 https://github.com/romkatv/powerlevel10k.git "$P10K_DIR"
else
  echo "  [ok] Powerlevel10k ja instalado"
fi

# Plugins
ZSH_CUSTOM="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}"

if [ ! -d "$ZSH_CUSTOM/plugins/zsh-autosuggestions" ]; then
  echo "  [+] Instalando zsh-autosuggestions..."
  git clone https://github.com/zsh-users/zsh-autosuggestions "$ZSH_CUSTOM/plugins/zsh-autosuggestions"
else
  echo "  [ok] zsh-autosuggestions ja instalado"
fi

if [ ! -d "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting" ]; then
  echo "  [+] Instalando zsh-syntax-highlighting..."
  git clone https://github.com/zsh-users/zsh-syntax-highlighting "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting"
else
  echo "  [ok] zsh-syntax-highlighting ja instalado"
fi

# Symlinks
ln -sf "$DOTFILES_DIR/zsh/.zshrc" ~/.zshrc
echo "  [ok] ~/.zshrc -> cbdotfiles"

mkdir -p ~/.config/cb
ln -sf "$DOTFILES_DIR/zsh/aliases.zsh" ~/.config/cb/aliases.zsh
echo "  [ok] ~/.config/cb/aliases.zsh -> cbdotfiles"
