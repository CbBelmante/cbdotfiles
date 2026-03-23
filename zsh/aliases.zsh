# ═══════════════════════════════════════════════════════════════════════════════
# CB ALIASES & FUNCTIONS
# Arquivo separado para facilitar edicao sem mexer no .zshrc
# ═══════════════════════════════════════════════════════════════════════════════

# ───────────────────────────────────────────────────────────────────────────────
# Navigation - Workspaces
# ───────────────────────────────────────────────────────────────────────────────
alias ws='cd ~/Workspaces'
alias workspaces='cd ~/Workspaces'
alias cbdotfiles='cd ~/Workspaces/cbdotfiles'

# ───────────────────────────────────────────────────────────────────────────────
# Navigation - System
# ───────────────────────────────────────────────────────────────────────────────
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'

# ───────────────────────────────────────────────────────────────────────────────
# Enhanced ls with icons (eza)
# ───────────────────────────────────────────────────────────────────────────────
alias ls='eza --icons'
alias ls2='eza --tree --level=2 --icons'
alias ls3='eza --tree --level=3 --icons'
alias ll='eza -lah --icons'
alias la='eza -A --icons'
alias tree='eza --tree --level=3 --icons'

# ───────────────────────────────────────────────────────────────────────────────
# Git Shortcuts
# ───────────────────────────────────────────────────────────────────────────────
alias gs='git status'
alias ga='git add'
alias gc='git commit -m'
alias gp='git push'
alias gl='git log --oneline --graph'

# ───────────────────────────────────────────────────────────────────────────────
# Arch Linux / Package Management
# ───────────────────────────────────────────────────────────────────────────────
alias update='sudo pacman -Syu'
alias install='sudo pacman -S'
alias search='pacman -Ss'

# ───────────────────────────────────────────────────────────────────────────────
# Omarchy / Hyprland
# ───────────────────────────────────────────────────────────────────────────────
alias hyprconf='cd ~/.config/hypr'
alias openthemes='nautilus ~/.local/share/omarchy/themes'
alias reload-hypr='hyprctl reload'
alias omarchy-refresh='omarchy-refresh-config'
alias omarchy-ver='omarchy-version'
alias omarchy-theme='omarchy-theme-current'
alias omarchy-sync-gtk='python3 ~/.config/omarchy/generate-gtk-theme.py'

# ───────────────────────────────────────────────────────────────────────────────
# Zoxide (cd inteligente - lembra diretorios visitados)
# ───────────────────────────────────────────────────────────────────────────────
if command -v zoxide &> /dev/null; then
    eval "$(zoxide init zsh)"
    alias cd="zd"
    zd() {
        if [ $# -eq 0 ]; then
            builtin cd ~ && return
        elif [ -d "$1" ]; then
            builtin cd "$1"
        else
            z "$@" && pwd || echo "Diretorio nao encontrado"
        fi
    }
fi

# ───────────────────────────────────────────────────────────────────────────────
# fzf (busca fuzzy) + bat (preview com syntax highlight)
# ───────────────────────────────────────────────────────────────────────────────
if command -v fzf &> /dev/null; then
    alias ff="fzf --preview 'bat --style=numbers --color=always {}'"
    # Keybindings do fzf (Ctrl+R historico fuzzy)
    [ -f /usr/share/doc/fzf/examples/key-bindings.zsh ] && source /usr/share/doc/fzf/examples/key-bindings.zsh
    [ -f /usr/share/fzf/key-bindings.zsh ] && source /usr/share/fzf/key-bindings.zsh
    [ -f ~/.fzf.zsh ] && source ~/.fzf.zsh
fi

# ───────────────────────────────────────────────────────────────────────────────
# Ferramentas
# ───────────────────────────────────────────────────────────────────────────────
n() { if [ "$#" -eq 0 ]; then nvim .; else nvim "$@"; fi; }
alias d='docker'
alias dc='docker compose'
alias p10kconfig='p10k configure'
alias pcinfo='bash ~/Workspaces/cbdotfiles/bin/pcinfo.sh'

open() {
    xdg-open "$@" >/dev/null 2>&1 &
}

# ───────────────────────────────────────────────────────────────────────────────
# Help & Info (scripts em bin/)
# ───────────────────────────────────────────────────────────────────────────────
alias cbhelp='bash ~/Workspaces/cbdotfiles/bin/cbhelp.sh'
alias nvimtips='bash ~/Workspaces/cbdotfiles/bin/nvimtips.sh'
alias cbbrowser='~/Workspaces/cbdotfiles/install.sh --chbrowser'
_cb_edit_local() {
    local f=~/Workspaces/cbdotfiles/local/$1
    local header="$2"
    mkdir -p "$(dirname "$f")"
    [ ! -f "$f" ] && echo -e "$header" > "$f"
    ${EDITOR:-nvim} "$f"
}
_cb_ensure_symlink() {
    local src="$1" dst="$2"
    if [ -f "$src" ] && [ ! -L "$dst" ]; then
        mkdir -p "$(dirname "$dst")"
        ln -sf "$src" "$dst"
    fi
}
aliases() { _cb_edit_local "zsh/local.zsh" "# Config local do shell (nao vai pro git)\n# Aliases, exports, variaveis pessoais\n# Para trocar o editor: export EDITOR=nano\n"; _cb_ensure_symlink ~/Workspaces/cbdotfiles/local/zsh/local.zsh ~/.config/cb/local.zsh; source ~/.zshrc; }
cbzshrc()  { ${EDITOR:-nvim} ~/Workspaces/cbdotfiles/zsh/.zshrc; }
cbkitty()  { _cb_edit_local "kitty/kitty.conf" "# Override local do Kitty (fonte, tamanho, etc)"; _cb_ensure_symlink ~/Workspaces/cbdotfiles/local/kitty/kitty.conf ~/.config/kitty/local.conf; }
cblocal()  { _cb_edit_local "local.sh" "# Variaveis locais (CB_SUSPEND, CB_BROWSER_FLAGS, etc)"; }

# ───────────────────────────────────────────────────────────────────────────────
# Editor wrappers — intercepta atalhos conhecidos (aliases, .zshrc, kitty, etc)
# ───────────────────────────────────────────────────────────────────────────────
_cb_editor_intercept() {
    case "$1" in
        aliases|alias|.zshrc|zshrc) aliases; return 0 ;;
        kitty|kitty.conf)           cbkitty; return 0 ;;
        local.sh)                   cblocal; return 0 ;;
    esac
    return 1
}
nano()  { _cb_editor_intercept "$1" || command nano "$@"; }
nvim()  { if [ "$#" -eq 0 ]; then command nvim .; elif _cb_editor_intercept "$1"; then :; else command nvim "$@"; fi; }
vim()   { _cb_editor_intercept "$1" || command vim "$@"; }

# ───────────────────────────────────────────────────────────────────────────────
# Zellij Layouts
# ───────────────────────────────────────────────────────────────────────────────
# Resolve alias de navegacao (cd ...) ou nome de pasta em ~/Workspaces
_resolve_dir() {
    local input="$1"
    # Caminho absoluto ou com ~: usa direto
    if [[ "$input" == /* || "$input" == ~* ]]; then
        echo "$input"
        return
    fi
    # Tenta resolver como alias (ex: mns -> 'cd ~/Workspaces/mnesis_frontend')
    local alias_def=$(alias "$input" 2>/dev/null)
    if [[ "$alias_def" =~ "cd (.+)" ]]; then
        local resolved="${match[1]//\'/}"
        echo "${resolved/#\~/$HOME}"
        return
    fi
    # Fallback: assume pasta em ~/Workspaces
    echo "$HOME/Workspaces/$input"
}

# Abrir sessao: z <layout> <diretorio|alias>
# Se sessao ja existe, reconecta. Se nao, cria nova.
# Ex: z cbw1 mns
# Ex: z cbw1 ~/Workspaces/meu-projeto
zj() {
    local layout="$1"
    local dir="$2"

    if [[ -z "$layout" || -z "$dir" ]]; then
        echo "Uso: zj <layout> <diretorio|alias>"
        echo "Ex:  zj cbw1 mns"
        echo "Ex:  zj cbw1 volan"
        echo "Ex:  zj cbw1 ~/Workspaces/meu-projeto"
        return 1
    fi

    if [[ -n "$ZELLIJ" ]]; then
        echo "Ja esta dentro do Zellij! Use zj-tab pra abrir nova tab ou saia primeiro."
        return 1
    fi

    dir=$(_resolve_dir "$dir")
    local session_name="$(basename "$dir")"

    local layout_name
    case "$layout" in
        cbw1) layout_name="CbWorkTemplate1" ;;
        cbw2) layout_name="CbWorkTemplate2" ;;
        *) layout_name="$layout" ;;
    esac

    # Se sessao ja existe, reconecta. Senao, cria nova.
    local sessions
    sessions=$(zellij list-sessions --no-formatting --short 2>&1 || true)
    if echo "$sessions" | grep -qx "$session_name" 2>/dev/null; then
        zellij attach "$session_name"
    else
        cd "$dir" && zellij --new-session-with-layout "$layout_name" -s "$session_name"
    fi
}

# Alias retrocompativel
alias zj-new='zj'

# Listar sessoes
alias zj-l='zellij list-sessions'

# Attach na ultima sessao
alias zj-a='zellij attach'

# Matar todas as sessoes
alias zj-ka='zellij kill-all-sessions --yes && zellij delete-all-sessions --yes'

# Matar sessao especifica: zj-k <nome>
alias zj-k='zellij kill-session'

# Nova tab dentro do Zellij: zj-tab <layout> <diretorio|alias>
# Ex: zj-tab cbw1 mns
zj-tab() {
    local layout="$1"
    local dir="$2"

    if [[ -z "$layout" || -z "$dir" ]]; then
        echo "Uso: zj-tab <layout> <diretorio|alias>"
        echo "Ex:  zj-tab cbw1 mns"
        echo "Ex:  zj-tab cbw1 volan"
        echo "Ex:  zj-tab cbw1 ~/Workspaces/meu-projeto"
        return 1
    fi

    dir=$(_resolve_dir "$dir")

    case "$layout" in
        cbw1) layout="CbWorkTemplate1" ;;
        cbw2) layout="CbWorkTemplate2" ;;
    esac

    zellij action new-tab --layout "$layout" --cwd "$dir"
}

# ───────────────────────────────────────────────────────────────────────────────
# tmux
# ───────────────────────────────────────────────────────────────────────────────
# Nova sessao: t-new <layout> <diretorio|alias>
# Ex: t-new cbw1 mns
# Ex: t-new cbw1 ~/Workspaces/meu-projeto
t-new() {
    local layout="$1"
    local dir="$2"

    if [[ -z "$layout" || -z "$dir" ]]; then
        echo "Uso: t-new <layout> <diretorio|alias>"
        echo "Ex:  t-new cbw1 mns"
        echo "Ex:  t-new cbw1 volan"
        echo "Ex:  t-new cbw1 ~/Workspaces/meu-projeto"
        return 1
    fi

    dir=$(_resolve_dir "$dir")

    local script
    case "$layout" in
        cbw1) script="$HOME/Workspaces/cbdotfiles/tmux/CbWorkTemplate1.sh" ;;
        *) echo "Layout desconhecido: $layout"; return 1 ;;
    esac

    bash "$script" "$dir"
}

# Aliases rapidos
alias ta='tmux attach'
alias tl='tmux list-sessions'
alias tk='tmux kill-session -t'

# ───────────────────────────────────────────────────────────────────────────────
# CbDotfiles
# ───────────────────────────────────────────────────────────────────────────────
# Instalar dotfiles: abre o menu interativo (Padrao / Custom)
cbdotInstall() {
    local dotdir="$HOME/Workspaces/cbdotfiles"
    "$dotdir/install.sh" && source ~/.zshrc
}
alias cbdotinstall='cbdotInstall'
alias cbinstall='cbdotInstall'

# Atualizar dotfiles: puxa do git e reinstala modulos salvos
cbdotUpdate() {
    local dotdir="$HOME/Workspaces/cbdotfiles"
    echo "=== Atualizando cbdotfiles ==="
    git -C "$dotdir" pull && "$dotdir/install.sh" --update && source ~/.zshrc
    echo "=== cbdotfiles atualizado! ==="
}
alias cbdotupdate='cbdotUpdate'
alias cbupdate='cbdotUpdate'

# Reinstalar dotfiles: limpa selecao salva e reabre menu do zero
cbdotReinstall() {
    local dotdir="$HOME/Workspaces/cbdotfiles"
    rm -f "$dotdir/local/.modules"
    "$dotdir/install.sh" && source ~/.zshrc
}
alias cbdotreinstall='cbdotReinstall'
alias cbreinstall='cbdotReinstall'

# Recriar symlinks: refaz todos os links sem reinstalar nada
cbdotResymlink() {
    local dotdir="$HOME/Workspaces/cbdotfiles"
    local bun="${BUN_INSTALL:-$HOME/.bun}/bin/bun"
    cd "$dotdir/ts-installer" && "$bun" run src/resymlink.ts && source ~/.zshrc
}
alias cbdotresymlink='cbdotResymlink'
alias cbresymlink='cbdotResymlink'
