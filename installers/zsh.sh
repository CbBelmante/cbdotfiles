#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "zsh" "Zsh"

# Instalar zsh se nao estiver instalado
if ! command -v zsh &> /dev/null; then
  log_add "Instalando zsh..."
  pkg_install zsh
  log_ok "Zsh instalado"
else
  log_ok "Zsh ja instalado: $(zsh --version)"
fi

# Oh My Zsh (verifica o arquivo principal, nao so o diretorio)
if [ ! -f "$HOME/.oh-my-zsh/oh-my-zsh.sh" ]; then
  log_add "Instalando Oh My Zsh..."
  # Salva plugins/temas custom se o diretorio existe mas esta incompleto
  if [ -d "$HOME/.oh-my-zsh" ]; then
    log_add "Diretorio ~/.oh-my-zsh incompleto, reinstalando..."
    rm -rf "$HOME/.oh-my-zsh"
  fi
  sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended --keep-zshrc
  log_ok "Oh My Zsh instalado"
else
  log_ok "Oh My Zsh ja instalado"
fi

# Powerlevel10k
P10K_DIR="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k"
if [ ! -d "$P10K_DIR" ]; then
  log_add "Instalando Powerlevel10k..."
  git clone --depth=1 https://github.com/romkatv/powerlevel10k.git "$P10K_DIR"
else
  log_ok "Powerlevel10k ja instalado"
fi

# Plugins
ZSH_CUSTOM="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}"

if [ ! -d "$ZSH_CUSTOM/plugins/zsh-autosuggestions" ]; then
  log_add "Instalando zsh-autosuggestions..."
  git clone https://github.com/zsh-users/zsh-autosuggestions "$ZSH_CUSTOM/plugins/zsh-autosuggestions"
else
  log_ok "zsh-autosuggestions ja instalado"
fi

if [ ! -d "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting" ]; then
  log_add "Instalando zsh-syntax-highlighting..."
  git clone https://github.com/zsh-users/zsh-syntax-highlighting "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting"
else
  log_ok "zsh-syntax-highlighting ja instalado"
fi

# Definir Zsh como shell padrao
if [ "$SHELL" != "$(which zsh)" ]; then
  log_add "Definindo Zsh como shell padrao..."
  sudo chsh -s "$(which zsh)" "$USER"
  log_ok "Zsh definido como shell padrao (efetivo no proximo login)"
else
  log_ok "Zsh ja e o shell padrao"
fi

# Symlinks
ln -sf "$DOTFILES_DIR/zsh/.zshrc" ~/.zshrc
log_ok "~/.zshrc -> cbdotfiles"

mkdir -p ~/.config/cb
ln -sf "$DOTFILES_DIR/zsh/aliases.zsh" ~/.config/cb/aliases.zsh
log_ok "~/.config/cb/aliases.zsh -> cbdotfiles"
