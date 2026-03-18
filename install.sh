#!/bin/bash
# Instalador cbdotfiles — garante Bun e roda o instalador TypeScript
set -e

DOTFILES_DIR="$(cd "$(dirname "$0")" && pwd)"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ---------------------------------------------------------------------------
# Garante que Bun esta instalado
# ---------------------------------------------------------------------------
export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
export PATH="$BUN_INSTALL/bin:$PATH"

if ! command -v bun &> /dev/null; then
  echo -e "  ${CYAN}+${NC} Instalando Bun..."
  curl -fsSL https://bun.sh/install | bash
  export PATH="$BUN_INSTALL/bin:$PATH"
  echo -e "  ${GREEN}+${NC} Bun instalado: $(bun --version)"
fi

# ---------------------------------------------------------------------------
# Instala dependencias (silencioso se ja instaladas)
# ---------------------------------------------------------------------------
cd "$DOTFILES_DIR/ts-installer"
bun install --frozen-lockfile 2>/dev/null || bun install --silent

# ---------------------------------------------------------------------------
# Roda o instalador TypeScript
# ---------------------------------------------------------------------------
# Se stdin nao e terminal (ex: curl | bash), redireciona de /dev/tty
if [ -t 0 ]; then
  bun run src/install.ts "$@"
else
  bun run src/install.ts "$@" < /dev/tty
fi
