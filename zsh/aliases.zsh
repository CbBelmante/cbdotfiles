# ═══════════════════════════════════════════════════════════════════════════════
# CB ALIASES & FUNCTIONS
# Arquivo separado para facilitar edicao sem mexer no .zshrc
# ═══════════════════════════════════════════════════════════════════════════════

# ───────────────────────────────────────────────────────────────────────────────
# Navigation - Workspaces
# ───────────────────────────────────────────────────────────────────────────────
alias ws='cd ~/workspaces'
alias workspaces='cd ~/workspaces'
alias volan='cd ~/workspaces/volan_admin'
alias mnesis='cd ~/workspaces/mnesis_frontend'
alias mne='cd ~/workspaces/mnesis_frontend'
alias mns='cd ~/workspaces/mnesis_frontend'
alias cbadmin='cd ~/workspaces/CbAdmin'
alias temporeal='cd ~/workspaces/temporeal_admin/'
alias tempo='cd ~/workspaces/temporeal_admin/'
alias tmpreal='cd ~/workspaces/temporeal_admin/'
alias radareleitoral='cd ~/workspaces/radarEleitoral/'
alias radar='cd ~/workspaces/radarEleitoral/'
alias corp='cd ~/workspaces/corp-components/'
alias elas='cd ~/workspaces/elas_podem_website/'
alias vlcomponents='cd ~/workspaces/VLComponents_vue/'

# ───────────────────────────────────────────────────────────────────────────────
# Navigation - System
# ───────────────────────────────────────────────────────────────────────────────
alias ..='cd ..'
alias ...='cd ../..'

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
# Zellij Layouts
# ───────────────────────────────────────────────────────────────────────────────
# Nova sessao: z-new <layout> <diretorio>
# Ex: z-new cbw1 mnesis_frontend
z-new() {
    local layout="$1"
    local dir="$2"

    if [[ -z "$layout" || -z "$dir" ]]; then
        echo "Uso: z-new <layout> <diretorio>"
        echo "Ex:  z-new cbw1 ~/workspaces/volan_admin"
        echo "Ex:  z-new cbw1 mnesis_frontend"
        return 1
    fi

    if [[ "$dir" != /* && "$dir" != ~* ]]; then
        dir="$HOME/workspaces/$dir"
    fi

    case "$layout" in
        cbw1) layout="CbWorkTemplate1" ;;
    esac

    zellij --layout "$layout" options --default-cwd "$dir"
}

# Nova tab dentro do Zellij: z-tab <layout> <diretorio>
# Ex: z-tab cbw1 volan_admin
z-tab() {
    local layout="$1"
    local dir="$2"

    if [[ -z "$layout" || -z "$dir" ]]; then
        echo "Uso: z-tab <layout> <diretorio>"
        echo "Ex:  z-tab cbw1 ~/workspaces/volan_admin"
        echo "Ex:  z-tab cbw1 mnesis_frontend"
        return 1
    fi

    if [[ "$dir" != /* && "$dir" != ~* ]]; then
        dir="$HOME/workspaces/$dir"
    fi

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
    local dotdir="$HOME/workspaces/cbdotfiles"
    echo "=== Atualizando cbdotfiles ==="
    git -C "$dotdir" pull && "$dotdir/install.sh" && source ~/.zshrc
    echo "=== cbdotfiles atualizado! ==="
}
