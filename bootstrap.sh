#!/bin/bash
set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

REPO="https://github.com/CbBelmante/cbdotfiles.git"
DEST="$HOME/Workspaces/cbdotfiles"

echo ""
echo -e "${CYAN}${BOLD}  cbdotfiles bootstrap${NC}"
echo -e "${CYAN}  =====================${NC}"
echo ""

# check git
if ! command -v git &> /dev/null; then
  echo -e "  ${RED}x${NC} git nao encontrado. Instale o git primeiro."
  exit 1
fi

# clone or pull
if [ -d "$DEST" ]; then
  echo -e "  ${GREEN}✓${NC} Repositorio ja existe em $DEST"
  cd "$DEST"
  git pull --quiet
  echo -e "  ${GREEN}✓${NC} git pull concluido"
else
  echo -e "  ${CYAN}+${NC} Clonando cbdotfiles..."
  mkdir -p "$(dirname "$DEST")"
  git clone "$REPO" "$DEST"
  echo -e "  ${GREEN}✓${NC} Clonado em $DEST"
fi

# run install
cd "$DEST"
chmod +x install.sh installers/*.sh
echo ""
./install.sh "$@"
