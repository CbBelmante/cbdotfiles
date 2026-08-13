#!/bin/bash
# Preview helper para cbSearch
set -euo pipefail

json_file="$1"
selected_line="$2"

# Extrai o comando (primeira palavra)
command=$(printf '%s' "$selected_line" | awk '{print $1}')

# Renderiza preview com jq
jq -r --arg cmd "$command" '
  .items[] |
  select(.command == $cmd or .name == $cmd) |
  "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
  "Comando: \(.command // .name)\n" +
  "\(.description)\n\n" +
  "Categoria: \(.category // "Geral")\n\n" +
  "Detalhes:\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
  (.details // "Sem detalhes") + "\n\n" +
  (if (.tags | length) > 0 then "Tags: " + (.tags | join(", ")) + "\n\n" else "" end) +
  (if (.related | length) > 0 then "Relacionados: " + (.related | join(", ")) + "\n" else "" end) +
  "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
' "$json_file" 2>/dev/null || echo "❌ Erro ao carregar preview"
