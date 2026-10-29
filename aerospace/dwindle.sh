#!/bin/sh
# ═══════════════════════════════════════════════════════════════════════════════
# DWINDLE POR CURSOR — emula dwindle:smart_split do Hyprland no AeroSpace
# ═══════════════════════════════════════════════════════════════════════════════
#
# O AeroSpace 0.21.3 nao tem layout dwindle: `man aerospace-layout` lista so
# tiles e accordion. Os forks que adicionam dwindle (DwindleSpace, HyprSpace)
# decidem o eixo pela PROPORCAO da janela. Este script decide pelo CURSOR, que
# e o modo smart_split do Hyprland: a janela sob o mouse e dividida em quatro
# triangulos e o triangulo do cursor da a direcao.
#
# COMO FUNCIONA
#   1. o callback on-window-detected entrega a janela nova em AEROSPACE_WINDOW_ID
#   2. wmprobe da a posicao do mouse e o retangulo de cada janela
#      (necessario porque o CLI do AeroSpace nao expoe geometria alguma)
#   3. acha a janela sob o cursor, no mesmo workspace da janela nova
#   4. o quadrante do cursor dentro dela decide esquerda/direita/cima/baixo
#   5. join-with aninha as duas, layout forca o eixo, swap corrige a ordem
#
# FALLBACK: cursor fora de qualquer janela do workspace -> decide pela proporcao
# da janela alvo (wide divide ao lado, tall divide empilhando), que e o dwindle
# classico do Hyprland sem smart_split.
#
# INTERRUPTOR DE PANICO: nasce DESARMADO. Só roda se existir ~/.aerospace-dwindle-on
#   armar:    touch ~/.aerospace-dwindle-on
#   desarmar: rm ~/.aerospace-dwindle-on     (efeito imediato, sem reload)
#
# MEDIDO: flatten-containers pode ficar em `true` (o padrao). Com 3+ janelas o
# container aninhado sobrevive. Com exatamente 2 janelas o root inverte inteiro,
# que e o comportamento correto do dwindle nesse caso.
# ═══════════════════════════════════════════════════════════════════════════════

[ -f "$HOME/.aerospace-dwindle-on" ] || exit 0

W="${AEROSPACE_WINDOW_ID:-}"
[ -n "$W" ] || exit 0

PROBE="$HOME/Workspaces/cbdotfiles/aerospace/wmprobe"
[ -x "$PROBE" ] || exit 0

# Deixa o AeroSpace terminar de tilar antes de medir.
sleep 0.3

ws=$(aerospace list-windows --all --format '%{window-id} %{workspace}' 2>/dev/null \
     | awk -v w="$W" '$1 == w { print $2; exit }')
[ -n "$ws" ] || exit 0

# Primeira janela do workspace nao tem com quem dividir.
peers=$(aerospace list-windows --workspace "$ws" --format '%{window-id}' 2>/dev/null \
        | grep -v "^${W}\$")
[ -n "$peers" ] || exit 0

probe=$("$PROBE" 2>/dev/null) || exit 0
mx=$(printf '%s\n' "$probe" | awk '$1 == "mouse" { print $2; exit }')
my=$(printf '%s\n' "$probe" | awk '$1 == "mouse" { print $3; exit }')
[ -n "$mx" ] && [ -n "$my" ] || exit 0

rect_of() {
  printf '%s\n' "$probe" | awk -v id="$1" '$1 == "win" && $2 == id { print $3, $4, $5, $6; exit }'
}

# ── acha a janela sob o cursor, entre as do mesmo workspace ──────────────────
U=""
for p in $peers; do
  r=$(rect_of "$p"); [ -n "$r" ] || continue
  set -- $r
  if [ "$mx" -ge "$1" ] && [ "$mx" -lt $(( $1 + $3 )) ] \
  && [ "$my" -ge "$2" ] && [ "$my" -lt $(( $2 + $4 )) ]; then
    U=$p; ux=$1; uy=$2; uw=$3; uh=$4
    break
  fi
done

# ── fallback: nenhuma janela sob o cursor -> primeira peer, eixo pela proporcao
if [ -z "$U" ]; then
  for p in $peers; do
    r=$(rect_of "$p"); [ -n "$r" ] || continue
    set -- $r
    U=$p; ux=$1; uy=$2; uw=$3; uh=$4
    break
  done
  [ -n "$U" ] || exit 0
  if [ "$uw" -ge "$uh" ]; then dir=right; else dir=down; fi
else
  # ── quadrante do cursor: compara deslocamento relativo ao centro, em milesimos
  rx=$(( (mx - ux) * 1000 / uw - 500 ))
  ry=$(( (my - uy) * 1000 / uh - 500 ))
  arx=${rx#-}; ary=${ry#-}
  if [ "$arx" -ge "$ary" ]; then
    if [ "$rx" -ge 0 ]; then dir=right; else dir=left; fi
  else
    if [ "$ry" -ge 0 ]; then dir=down; else dir=up; fi
  fi
fi

case "$dir" in
  left|right) axis=horizontal ;;
  up|down)    axis=vertical   ;;
esac

# ── aninha a janela nova com a alvo ─────────────────────────────────────────
# join-with pede uma DIRECAO, nao um alvo: deduz onde esta a alvo comparando
# os centros das duas.
wr=$(rect_of "$W")
toU=""
if [ -n "$wr" ]; then
  set -- $wr
  wcx=$(( $1 + $3 / 2 )); wcy=$(( $2 + $4 / 2 ))
  ucx=$(( ux + uw / 2 ));  ucy=$(( uy + uh / 2 ))
  ddx=$(( ucx - wcx )); ddy=$(( ucy - wcy ))
  addx=${ddx#-}; addy=${ddy#-}
  if [ "$addx" -ge "$addy" ]; then
    if [ "$ddx" -ge 0 ]; then toU=right; else toU=left; fi
  else
    if [ "$ddy" -ge 0 ]; then toU=down; else toU=up; fi
  fi
fi

if [ -n "$toU" ]; then
  aerospace join-with --window-id "$W" "$toU" 2>/dev/null
fi

# ── forca o eixo pedido pelo cursor ─────────────────────────────────────────
aerospace layout --window-id "$W" "$axis" 2>/dev/null

# ── corrige a ordem: a janela nova deve ficar NO lado que o cursor indicou ──
probe=$("$PROBE" 2>/dev/null) || exit 0
wr=$(rect_of "$W"); ur=$(rect_of "$U")
[ -n "$wr" ] && [ -n "$ur" ] || exit 0
set -- $wr; wcx=$(( $1 + $3 / 2 )); wcy=$(( $2 + $4 / 2 ))
set -- $ur; ucx=$(( $1 + $3 / 2 )); ucy=$(( $2 + $4 / 2 ))

case "$dir" in
  right) [ "$wcx" -lt "$ucx" ] && aerospace swap --window-id "$W" right 2>/dev/null ;;
  left)  [ "$wcx" -gt "$ucx" ] && aerospace swap --window-id "$W" left  2>/dev/null ;;
  down)  [ "$wcy" -lt "$ucy" ] && aerospace swap --window-id "$W" down  2>/dev/null ;;
  up)    [ "$wcy" -gt "$ucy" ] && aerospace swap --window-id "$W" up    2>/dev/null ;;
esac
exit 0
