#!/usr/bin/env bash
# CbWorkTemplate1 — Layout equivalente ao Zellij CbWorkTemplate1
# 3 colunas: esquerda (2 terms) | centro (nvim + 2 terms) | direita (2 terms)
#
# Uso: CbWorkTemplate1.sh [diretorio]

DIR="${1:-.}"
SESSION_NAME="$(basename "$DIR")"

# Se ja existe sessao com esse nome, apenas attach
if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    tmux attach-session -t "$SESSION_NAME"
    exit 0
fi

# Criar sessao
tmux new-session -d -s "$SESSION_NAME" -c "$DIR"

# ── Coluna esquerda (20%) — 2 terminais empilhados ──
tmux split-window -h -c "$DIR" -p 80  # split vertical, direita fica 80%
tmux select-pane -t 0
tmux split-window -v -c "$DIR"        # split horizontal no painel esquerdo

# ── Coluna centro (60%) — nvim + 2 terminais ──
tmux select-pane -t 2                 # painel direito (80%)
tmux split-window -h -c "$DIR" -p 25  # split vertical, direita fica 25%
tmux select-pane -t 2                 # painel centro
tmux split-window -v -c "$DIR" -p 20  # split horizontal, embaixo fica 20%
tmux select-pane -t 3                 # painel embaixo do centro
tmux split-window -h -c "$DIR"        # 2 terminais lado a lado embaixo

# ── Coluna direita (20%) — 2 terminais empilhados ──
tmux select-pane -t 5                 # painel direita
tmux split-window -v -c "$DIR"        # split horizontal

# ── Abrir nvim no painel central ──
tmux select-pane -t 2
tmux send-keys "nvim" Enter

# ── Attach ──
tmux attach-session -t "$SESSION_NAME"
