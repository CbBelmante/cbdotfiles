# ═══════════════════════════════════════════════════════════════════════════════
# CB ALIASES & FUNCTIONS
# Arquivo separado para facilitar edicao sem mexer no .zshrc
# ═══════════════════════════════════════════════════════════════════════════════

# ───────────────────────────────────────────────────────────────────────────────
# Navigation - Workspaces
# ───────────────────────────────────────────────────────────────────────────────
alias ws='cd ~/Workspaces'
alias workspaces='cd ~/Workspaces'
alias volan='cd ~/Workspaces/volan_admin'
alias mnesis='cd ~/Workspaces/mnesis_frontend'
alias mne='cd ~/Workspaces/mnesis_frontend'
alias mns='cd ~/Workspaces/mnesis_frontend'
alias cbadmin='cd ~/Workspaces/CbAdmin'
alias temporeal='cd ~/Workspaces/temporeal_admin/'
alias tempo='cd ~/Workspaces/temporeal_admin/'
alias tmpreal='cd ~/Workspaces/temporeal_admin/'
alias radareleitoral='cd ~/Workspaces/radarEleitoral/'
alias radar='cd ~/Workspaces/radarEleitoral/'
alias corp='cd ~/Workspaces/corp-components/'
alias elas='cd ~/Workspaces/elas_podem_website/'
alias vlcomponents='cd ~/Workspaces/VLComponents_vue/'
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

open() {
    xdg-open "$@" >/dev/null 2>&1 &
}

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

# Nova sessao: z-new <layout> <diretorio|alias>
# Ex: z-new cbw1 mns
# Ex: z-new cbw1 ~/Workspaces/meu-projeto
z-new() {
    local layout="$1"
    local dir="$2"

    if [[ -z "$layout" || -z "$dir" ]]; then
        echo "Uso: z-new <layout> <diretorio|alias>"
        echo "Ex:  z-new cbw1 mns"
        echo "Ex:  z-new cbw1 volan"
        echo "Ex:  z-new cbw1 ~/Workspaces/meu-projeto"
        return 1
    fi

    dir=$(_resolve_dir "$dir")

    case "$layout" in
        cbw1) layout="CbWorkTemplate1" ;;
    esac

    zellij --layout "$layout" options --default-cwd "$dir"
}

# Nova tab dentro do Zellij: z-tab <layout> <diretorio|alias>
# Ex: z-tab cbw1 mns
z-tab() {
    local layout="$1"
    local dir="$2"

    if [[ -z "$layout" || -z "$dir" ]]; then
        echo "Uso: z-tab <layout> <diretorio|alias>"
        echo "Ex:  z-tab cbw1 mns"
        echo "Ex:  z-tab cbw1 volan"
        echo "Ex:  z-tab cbw1 ~/Workspaces/meu-projeto"
        return 1
    fi

    dir=$(_resolve_dir "$dir")

    case "$layout" in
        cbw1) layout="CbWorkTemplate1" ;;
    esac

    zellij action new-tab --layout "$layout" --cwd "$dir"
}

# ───────────────────────────────────────────────────────────────────────────────
# CbDotfiles
# ───────────────────────────────────────────────────────────────────────────────
# Atualizar dotfiles: puxa do git e roda o instalador
cbdotupdate() {
    local dotdir="$HOME/Workspaces/cbdotfiles"
    echo "=== Atualizando cbdotfiles ==="
    git -C "$dotdir" pull && "$dotdir/install.sh" && source ~/.zshrc
    echo "=== cbdotfiles atualizado! ==="
}
