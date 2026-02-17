#!/bin/bash

echo "[nvm] Configurando NVM..."

if [ ! -d "$HOME/.nvm" ] && [ ! -d "$HOME/.config/nvm" ]; then
  echo "  [+] Instalando NVM..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
else
  echo "  [ok] NVM ja instalado"
fi
