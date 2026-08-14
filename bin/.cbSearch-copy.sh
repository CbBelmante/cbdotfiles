#!/bin/bash
# Helper script para copiar comando e mostrar feedback
# Usado pelo cbSearch

set -euo pipefail

# Recebe o comando como argumento
command="$1"

# Tenta wl-copy (Wayland)
if command -v wl-copy &> /dev/null; then
  echo -n "$command" | wl-copy
  echo "✅ Copiado: $command" >&2
  exit 0
fi

# Tenta xclip (X11)
if command -v xclip &> /dev/null; then
  echo -n "$command" | xclip -selection clipboard
  echo "✅ Copiado: $command" >&2
  exit 0
fi

# Sem clipboard
echo "📋 Comando: $command" >&2
echo "⚠️  Clipboard não disponível" >&2
exit 1
