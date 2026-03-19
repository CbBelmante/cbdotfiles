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
alias ls='eza --tree --level=2 --icons'
alias ls3='eza --tree --level=3 --icons'
alias lsl='eza --icons'
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

open() {
    xdg-open "$@" >/dev/null 2>&1 &
}

# ───────────────────────────────────────────────────────────────────────────────
# Dicas rapidas (cbhelp)
# ───────────────────────────────────────────────────────────────────────────────
cbhelp() {
    echo ""
    echo "  ⚙️  CBDOTFILES - Comandos uteis"
    echo "  ══════════════════════════════════════════════════════════"
    echo ""
    echo "  📦 Dotfiles:"
    echo "    cbdotInstall       Abre o menu de instalacao"
    echo "    cbdotUpdate        Atualiza (git pull + reinstala)"
    echo "    cbdotReinstall     Reinstala do zero (limpa selecao)"
    echo "    cbhelp             Esta ajuda"
    echo "  ──────────────────────────────────────────────────────────"
    echo "  🐚 Terminal & Shell:"
    echo "    p10kconfig         Configura visual do Powerlevel10k"
    echo "    n                  Abre Neovim (n arquivo.txt ou n pra abrir dir)"
    echo "    ff                 Busca fuzzy de arquivos com preview (fzf+bat)"
    echo "    Ctrl+R             Historico de comandos com busca fuzzy"
    echo "    bat arquivo        Cat com syntax highlight"
    echo "    rg texto           Busca em conteudo de arquivos (ripgrep)"
    echo "  ──────────────────────────────────────────────────────────"
    echo "  📊 Monitoramento:"
    echo "    btop               Monitor de sistema (CPU, RAM, disco, rede)"
    echo "    fastfetch          Info do sistema (hardware, OS, tema)"
    echo "    htop               Monitor de processos (classico)"
    echo "  ──────────────────────────────────────────────────────────"
    echo "  🖥️ Zellij / tmux:"
    echo "    zj cbw1 projeto    Abre sessao Zellij com layout"
    echo "    zj-tab cbw1 dir    Nova tab no Zellij"
    echo "    zj-l / zj-a        Listar / reconectar sessoes"
    echo "    zj-ka              Matar todas as sessoes"
    echo "    ta / tl / tk nome  tmux attach / list / kill session"
    echo "    t-new cbw1 dir     Nova sessao tmux com layout"
    echo "  ──────────────────────────────────────────────────────────"
    echo "  🔀 Git:"
    echo "    gs                 git status"
    echo "    ga                 git add"
    echo "    gc \"msg\"           git commit -m"
    echo "    gp                 git push"
    echo "    gl                 git log --oneline --graph"
    echo "    lazygit            Git TUI interativo"
    echo "  ──────────────────────────────────────────────────────────"
    echo "  📂 Navegacao:"
    echo "    ws                 cd ~/Workspaces"
    echo "    .. / ... / ....    Subir 1/2/3 niveis"
    echo "    cd <termo>         Zoxide (lembra diretorios visitados)"
    echo "    ls / ll / la       eza com icones (tree/list/all)"
    echo "    tree               eza tree 3 niveis"
    echo "  ──────────────────────────────────────────────────────────"
    echo "  ⌨️  Atalhos de teclado:"
    echo "    Super+Space        App launcher"
    echo "    Super+Return       Terminal (Kitty)"
    echo "    Super+B            Browser padrao"
    echo "    Super+Shift+B      Browser modo privado"
    echo "    Super+F            File manager"
    echo "    Super+N            Editor"
    echo "    Super+Shift+S      Screenshot (interativo)"
    echo "    Print              Screenshot (alternativo)"
    echo "    Shift+Print        Screenshot direto pro clipboard"
    echo "    Super+Q / Super+W  Fechar janela"
    echo "    Super+Escape       Power menu (lock/suspend/reboot/shutdown)"
    echo "    Super+K            Mostrar TODOS os atalhos"
    echo "  ──────────────────────────────────────────────────────────"
    echo "  🚀 Apps rapidos:"
    echo "    Super+Shift+O      Obsidian"
    echo "    Super+Shift+G      GitKraken"
    echo "    Super+Shift+M      Spotify"
    echo "    Super+Shift+T      btop"
    echo "    Super+Shift+N      Notion"
    echo "    Super+G            GitHub (webapp)"
    echo "    Super+/            1Password"
    echo "  ──────────────────────────────────────────────────────────"
    echo "  🐳 Docker:"
    echo "    d                  docker"
    echo "    dc                 docker compose"
    echo "    lazydocker         Docker TUI"
    echo "  ──────────────────────────────────────────────────────────"
    echo "  🔧 Sistema & CLIs:"
    echo "    open arquivo       Abre com app padrao (xdg-open)"
    echo "    supabase           Supabase CLI"
    echo "    firebase           Firebase CLI"
    echo "    gh                 GitHub CLI"
    echo "  ──────────────────────────────────────────────────────────"
    echo "  🔒 Overrides locais (nao vao pro git):"
    echo "    local/local.sh             Variaveis (CB_SUSPEND, CB_BROWSER_FLAGS)"
    echo "    local/zsh/aliases.zsh      Aliases pessoais"
    echo "    local/kitty/kitty.conf     Override de terminal"
    echo ""
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

# Atualizar dotfiles: puxa do git e reinstala modulos salvos
cbdotUpdate() {
    local dotdir="$HOME/Workspaces/cbdotfiles"
    echo "=== Atualizando cbdotfiles ==="
    git -C "$dotdir" pull && "$dotdir/install.sh" --update && source ~/.zshrc
    echo "=== cbdotfiles atualizado! ==="
}

# Reinstalar dotfiles: limpa selecao salva e reabre menu do zero
cbdotReinstall() {
    local dotdir="$HOME/Workspaces/cbdotfiles"
    rm -f "$dotdir/local/.modules"
    "$dotdir/install.sh" && source ~/.zshrc
}

# Recriar symlinks: refaz todos os links sem reinstalar nada
cbdotResymlink() {
    local dotdir="$HOME/Workspaces/cbdotfiles"
    local bun="${BUN_INSTALL:-$HOME/.bun}/bin/bun"
    cd "$dotdir/ts-installer" && "$bun" run src/resymlink.ts && source ~/.zshrc
}
