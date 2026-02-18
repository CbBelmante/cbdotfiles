<div align="center">
<pre>
   ██████╗██████╗ ██████╗  ██████╗ ████████╗███████╗██╗██╗     ███████╗███████╗
  ██╔════╝██╔══██╗██╔══██╗██╔═══██╗╚══██╔══╝██╔════╝██║██║     ██╔════╝██╔════╝
  ██║     ██████╔╝██║  ██║██║   ██║   ██║   █████╗  ██║██║     █████╗  ███████╗
  ██║     ██╔══██╗██║  ██║██║   ██║   ██║   ██╔══╝  ██║██║     ██╔══╝  ╚════██║
  ╚██████╗██████╔╝██████╔╝╚██████╔╝   ██║   ██║     ██║███████╗███████╗███████║
   ╚═════╝╚═════╝ ╚═════╝  ╚═════╝    ╚═╝   ╚═╝     ╚═╝╚══════╝╚══════╝╚══════╝
</pre>

⚙️ **DOTFILES PESSOAIS** | 🐧 Arch Linux & Ubuntu/Debian & Fedora
🔗 Symlinks Automaticos | 📦 Instalacao Modular | 🔄 Sincronizacao entre Maquinas

</div>

## 📖 Sobre

Configuracoes pessoais de desenvolvimento. Clone o repositorio em qualquer maquina Linux, rode o instalador e tudo funciona — editor, terminal, shell, aliases e layouts.

**Compativel com:** Arch Linux (pacman) | Ubuntu/Debian (apt) | Fedora (dnf)

## 🚀 Instalacao Rapida (Maquina Nova)

### ⚡ One-liner (recomendado)

```bash
curl -sL https://raw.githubusercontent.com/CbBelmante/cbdotfiles/master/bootstrap.sh | bash
```

> Clona o repositorio em `~/Workspaces/cbdotfiles` e roda o instalador automaticamente.

### 📋 Passo a passo (manual)

```bash
# 0. Pre-requisitos
# Arch Linux
sudo pacman -S git curl zsh eza
# Ubuntu/Debian
sudo apt install git curl zsh eza

# 1. Clone e instale
git clone https://github.com/CbBelmante/cbdotfiles.git ~/Workspaces/cbdotfiles
cd ~/Workspaces/cbdotfiles
chmod +x install.sh installers/*.sh
./install.sh

# 2. Defina Zsh como shell padrao
chsh -s $(which zsh)

# 3. Reinicie o terminal
source ~/.zshrc
```

> 💡 Na proxima vez que precisar atualizar, basta rodar `cbdotupdate`

## 📦 Instalacao Seletiva

Nao precisa instalar tudo. Escolha os modulos que quiser:

```bash
./install.sh zellij nvim     # so zellij e neovim
./install.sh zsh git         # so zsh e git
./install.sh --help          # lista todos os modulos
```

### 🧩 Modulos Disponiveis

| Modulo | Descricao | Instala software? |
|--------|-----------|-------------------|
| 🐚 `zsh` | Oh My Zsh + Powerlevel10k + plugins + symlink .zshrc | ✅ Oh My Zsh, P10k, plugins |
| 📦 `nvm` | Node Version Manager | ✅ NVM |
| 🔀 `git` | Symlink .gitconfig | ❌ Apenas symlink |
| 🔤 `fonts` | Fontes Nerd Font | ✅ Fontes |
| 🎮 `drivers` | Drivers GPU (AMD/Intel/NVIDIA) + Bluetooth Mac | ✅ Mesa, VA-API, firmware |
| 🔍 `shell-tools` | Zoxide + fzf + ripgrep + bat | ✅ Ferramentas de shell |
| 🖥️ `zellij` | Multiplexador de terminal + config + layouts | ✅ Zellij (se nao instalado) |
| ✏️ `nvim` | Config completa Neovim (LazyVim) >= 0.11.2 | ✅ Neovim (GitHub release) |
| 🐱 `kitty` | Config Kitty + override por ambiente (Omarchy/COSMIC) | ✅ Kitty (se nao instalado) |
| 🌐 `vivaldi` | Vivaldi Browser + browser padrao | ✅ Vivaldi (repo oficial) |
| 🌐 `opera` | Opera Browser | ✅ Opera (repo oficial) |
| 💻 `vscode` | Visual Studio Code | ✅ VS Code (repo Microsoft) |
| 🐙 `gitkraken` | GitKraken (Git GUI) | ✅ GitKraken (.deb/.rpm) |
| 🦥 `lazygit` | Config LazyGit (Git TUI) | ❌ Apenas symlink |
| 🖥️ `fastfetch` | Config Fastfetch (system info) | ❌ Apenas symlink |
| 📊 `btop` | Config Btop (monitor de sistema) | ❌ Apenas symlink |
| ⌨️ `keybinds` | Gera e aplica keybinds (Hyprland/COSMIC) | ❌ Gera configs |

## 🔄 Atualizacao

Depois de instalado, para puxar mudancas do repositorio em qualquer maquina:

```bash
cbdotupdate
```

Faz automaticamente: `git pull` → `install.sh` → `source ~/.zshrc`

## 📂 Estrutura do Projeto

```text
cbdotfiles/
├── bootstrap.sh                   # ⚡ One-liner para maquina nova
├── install.sh                     # 🎯 Orquestrador principal
├── .gitignore                     # 🚫 Ignora arquivos gerados
├── installers/                    # 📦 Um script por modulo
│   ├── helpers.sh                 # 🔧 Detecta distro + desktop (Omarchy/COSMIC)
│   ├── zsh.sh                     # 🐚 Oh My Zsh + plugins + symlink
│   ├── nvm.sh                     # 📦 Node Version Manager
│   ├── git.sh                     # 🔀 Symlink .gitconfig
│   ├── drivers.sh                 # 🎮 GPU + Bluetooth firmware (detecta hardware)
│   ├── shell-tools.sh             # 🔍 Zoxide, fzf, ripgrep, bat
│   ├── zellij.sh                  # 🖥️ Zellij + config + layouts
│   ├── nvim.sh                    # ✏️ Neovim (verifica versao >= 0.11.2)
│   ├── kitty.sh                   # 🐱 Terminal Kitty (detecta ambiente)
│   ├── vivaldi.sh                 # 🌐 Vivaldi Browser + browser padrao
│   ├── opera.sh                   # 🌐 Opera Browser
│   ├── vscode.sh                  # 💻 Visual Studio Code
│   ├── gitkraken.sh               # 🐙 GitKraken
│   ├── lazygit.sh                 # 🦥 Git TUI
│   ├── fastfetch.sh               # 🖥️ System info
│   ├── btop.sh                    # 📊 Monitor de sistema
│   └── keybinds.sh                # ⌨️ Gerador de keybinds
├── git/
│   └── .gitconfig                 # Configuracao global do Git
├── zellij/
│   ├── config.kdl                 # ⌨️ Keybinds e config principal
│   └── CbWorkTemplate1.kdl       # 📐 Layout: nvim + 6 terminais
├── zsh/
│   ├── .zshrc                     # 🐚 Config Zsh principal
│   └── aliases.zsh                # 🔗 Aliases e funcoes (z-new, z-tab, etc)
├── nvim/                          # ✏️ Config completa Neovim (LazyVim)
│   ├── init.lua
│   ├── lua/
│   └── ...
├── kitty/
│   ├── kitty.conf                 # 🐱 Config base Kitty
│   ├── omarchy.conf               # 🔧 Override Omarchy (opacity 0.65)
│   └── cosmic.conf                # 🔧 Override COSMIC (opacity 0.85)
├── lazygit/
│   └── config.yml                 # 🦥 Config LazyGit
├── fastfetch/
│   └── config.jsonc               # 🖥️ Config Fastfetch
├── btop/
│   └── btop.conf                  # 📊 Config Btop
└── keybinds/
    ├── keybinds.conf              # ⌨️ Fonte unica de verdade (bindings)
    ├── vars.conf                  # 🔧 Variaveis Hyprland + COSMIC
    ├── generate.sh                # 🔄 Gerador (keybinds.conf -> configs)
    ├── show-keybinds.sh           # 📋 Mostra todos os atalhos (Super+K)
    └── generated/                 # 📁 Arquivos gerados (gitignored)
        ├── hyprland-bindings.conf # 🪟 Keybinds Hyprland
        └── cosmic-custom.ron      # 🚀 Keybinds COSMIC (RON)
```

### 🔗 Symlinks Criados

```
~/.zshrc                              → cbdotfiles/zsh/.zshrc
~/.config/cb/aliases.zsh              → cbdotfiles/zsh/aliases.zsh
~/.gitconfig                          → cbdotfiles/git/.gitconfig
~/.config/zellij/config.kdl           → cbdotfiles/zellij/config.kdl
~/.config/zellij/layouts/*.kdl        → cbdotfiles/zellij/*.kdl
~/.config/nvim/                       → cbdotfiles/nvim/
~/.config/kitty/kitty.conf            → cbdotfiles/kitty/kitty.conf
~/.config/kitty/env.conf              → cbdotfiles/kitty/{omarchy,cosmic}.conf
~/.config/lazygit/config.yml          → cbdotfiles/lazygit/config.yml
~/.config/fastfetch/config.jsonc      → cbdotfiles/fastfetch/config.jsonc
~/.config/btop/btop.conf              → cbdotfiles/btop/btop.conf
```

## 🔍 Shell Tools

Ferramentas de linha de comando inspiradas no Omarchy:

### Zoxide (cd inteligente)

Lembra os diretorios visitados. Navegue com atalhos:

```bash
cd ~/Workspaces/mnesis_frontend   # visita uma vez
cd ~                               # volta pro home
cd mnesis                          # zoxide lembra e volta direto
```

### fzf (busca fuzzy)

```bash
ff                    # busca arquivos com preview (bat)
Ctrl+R                # historico de comandos com busca fuzzy
```

### Ferramentas extras

| Comando | Descricao |
|---------|-----------|
| `n` | Abre Neovim (sem args abre o diretorio atual) |
| `ff` | Busca fuzzy de arquivos com preview |
| `rg` | Busca rapida em conteudo de arquivos (ripgrep) |
| `bat` | Cat com syntax highlight |
| `open` | Abre arquivo/diretorio com app padrao (xdg-open) |
| `d` | Docker |

## 🖥️ Layouts do Zellij

### 📐 CbWorkTemplate1 (`cbw1`)

Layout estilo VSCode com Neovim central e terminais ao redor:

```
┌──────────────────────────────────────────────────┐
│                    tab-bar                        │
├─────────┬────────────────────────┬───────────────┤
│         │                        │               │
│terminal │        nvim            │  terminal     │
│         │       (editor)         │               │
├─────────┤                        ├───────────────┤
│         │                        │               │
│terminal │                        │  terminal     │
│         ├───────────┬────────────┤               │
│         │ terminal  │  terminal  │               │
├─────────┴───────────┴────────────┴───────────────┤
│                   status-bar                      │
└──────────────────────────────────────────────────┘
```

### 🚀 Comandos Zellij Customizados

#### Nova sessao (fora do Zellij)

```bash
z-new <layout> <diretorio|alias>

z-new cbw1 mns                    # resolve alias mns -> ~/Workspaces/mnesis_frontend
z-new cbw1 volan                  # resolve alias volan -> ~/Workspaces/volan_admin
z-new cbw1 ~/projetos/meu-app    # caminho completo
```

> Aceita qualquer alias de navegacao (`cd ...`) cadastrado no `aliases.zsh`. Sem alias, faz fallback para `~/Workspaces/<nome>`.

#### Nova tab (dentro do Zellij)

```bash
z-tab <layout> <diretorio|alias>

z-tab cbw1 volan
z-tab cbw1 cbadmin
z-tab cbw1 radar
```

### ⌨️ Atalhos do Zellij

| Atalho | Acao |
|--------|------|
| `Alt + h/j/k/l` | 🔄 Mover foco entre paineis |
| `Alt + setas` | 🔄 Mover foco entre paineis |
| `Ctrl + t` | 📑 Modo tab (`n` nova, `x` fechar, `r` renomear) |
| `Ctrl + p` | 🪟 Modo pane (`n` novo, `x` fechar) |
| `Ctrl + n` | 📏 Modo resize (`h/j/k/l` redimensionar) |
| `Ctrl + s` | 📜 Modo scroll |
| `Ctrl + q` | 🚪 Sair do Zellij |
| `Ctrl + g` | 🔒 Lock mode |

## 🐚 Aliases do .zshrc

### 📁 Navegacao Workspaces

| Alias | Destino |
|-------|---------|
| `ws` / `workspaces` | ~/Workspaces |
| `mnesis` / `mns` / `mne` | ~/Workspaces/mnesis_frontend |
| `volan` | ~/Workspaces/volan_admin |
| `cbadmin` | ~/Workspaces/CbAdmin |
| `temporeal` / `tempo` | ~/Workspaces/temporeal_admin |
| `radar` | ~/Workspaces/radarEleitoral |
| `corp` | ~/Workspaces/corp-components |
| `elas` | ~/Workspaces/elas_podem_website |
| `vlcomponents` | ~/Workspaces/VLComponents_vue |
| `cbdotfiles` | ~/Workspaces/cbdotfiles |

### 🔀 Git

| Alias | Comando |
|-------|---------|
| `gs` | `git status` |
| `ga` | `git add` |
| `gc` | `git commit -m` |
| `gp` | `git push` |
| `gl` | `git log --oneline --graph` |

### 📂 Sistema (eza)

| Alias | Comando |
|-------|---------|
| `ls` | `eza --icons` |
| `ll` | `eza -lah --icons` |
| `la` | `eza -A --icons` |
| `tree` | `eza --tree --level=3 --icons` |

### 📦 Arch Linux

| Alias | Comando |
|-------|---------|
| `update` | `sudo pacman -Syu` |
| `install` | `sudo pacman -S` |
| `search` | `pacman -Ss` |

### 🪟 Hyprland / Omarchy

| Alias | Comando |
|-------|---------|
| `hyprconf` | `cd ~/.config/hypr` |
| `reload-hypr` | `hyprctl reload` |
| `omarchy-refresh` | `omarchy-refresh-config` |
| `omarchy-ver` | `omarchy-version` |
| `omarchy-theme` | `omarchy-theme-current` |

## ⌨️ Keybind Generator

Sistema de keybinds com **fonte unica de verdade**. Defina uma vez em `keybinds.conf`, configure as variaveis em `vars.conf`, gere para ambos:

```
keybinds.conf + vars.conf  ──▶  hyprland-bindings.conf  (Arch/Hyprland)
                           └──▶  cosmic-custom.ron       (Pop!OS/COSMIC)
```

### Variaveis (`vars.conf`)

Mude o browser, terminal ou app em **um lugar so**:

```bash
# Hyprland
HYPR_TERMINAL=uwsm app -- kitty
HYPR_BROWSER=uwsm app -- vivaldi

# COSMIC
COSMIC_TERMINAL=kitty
COSMIC_BROWSER=vivaldi
```

### Tipos

| Tipo | Descricao |
|------|-----------|
| `BOTH` | Gera para Hyprland e COSMIC |
| `HYPR` | Gera apenas para Hyprland |
| `COSM` | Gera apenas para COSMIC |

### Atalhos Padronizados

| Atalho | Acao |
|--------|------|
| `Super+Enter` | Terminal |
| `Super+F` | File manager |
| `Super+B` | Browser |
| `Super+Shift+B` | Browser (privado) |
| `Super+N` | Editor |
| `Super+/` | 1Password |
| `Super+G` | GitHub (webapp) |
| `Super+Shift+N` | Notion (webapp) |
| `Super+Shift+O` | Obsidian |
| `Super+Shift+G` | GitKraken |
| `Super+Shift+M` | Spotify |
| `Super+Shift+T` | Btop |
| `Super+C/X/V` | Copy / Cut / Paste |
| `Super+Ctrl+V` | Clipboard history |
| `Super+Q` / `Super+W` | Fechar janela |
| `Super+Escape` | Power menu (lock/suspend/reboot/shutdown) |
| `Super+K` | Mostrar todos os atalhos |
| `Ctrl+Shift+3/4/5` | Screenshots |

### Regenerar

```bash
./keybinds/generate.sh          # gera os arquivos
./install.sh keybinds            # gera + aplica symlinks
```

## 🎮 Drivers (deteccao automatica)

O modulo `drivers` detecta o hardware e instala automaticamente:

| Hardware | O que instala |
|----------|---------------|
| **GPU AMD** | Mesa, Vulkan, VA-API (aceleracao de video) |
| **GPU Intel** | Mesa, Vulkan, Intel Media Driver |
| **GPU NVIDIA** | Avisa para instalar manualmente |
| **Bluetooth Apple/Broadcom** | Firmware BCM + otimizacao PipeWire |

## ➕ Adicionando Novos Layouts

1. Crie o arquivo `.kdl` em `cbdotfiles/zellij/`
2. Adicione o nome curto no `case` das funcoes `z-new` e `z-tab` no `aliases.zsh`:

```bash
case "$layout" in
    cbw1) layout="CbWorkTemplate1" ;;
    cbw2) layout="CbWorkTemplate2" ;;  # novo
esac
```

3. Rode `cbdotupdate` ou `./install.sh zellij`

## ➕ Adicionando Novos Modulos

1. Crie o installer em `cbdotfiles/installers/<nome>.sh`:
```bash
#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "nome" "Nome do Modulo"
# ... logica de instalacao
```

2. Adicione o nome no array `ALL_MODULES` em `install.sh`

3. Rode `./install.sh <nome>` para testar

## 🛠️ Tecnologias

- **🐚 Zsh** + Oh My Zsh + Powerlevel10k
- **🖥️ Zellij** - Multiplexador de terminal (Rust)
- **✏️ Neovim** - Editor (LazyVim)
- **🐱 Kitty** - Terminal emulator (config por ambiente)
- **🌐 Vivaldi** / **Opera** - Browsers
- **💻 VS Code** - Editor GUI
- **🐙 GitKraken** - Git GUI
- **🦥 LazyGit** - Git TUI
- **📊 Btop** - Monitor de sistema
- **🖥️ Fastfetch** - System info
- **📦 NVM** - Node Version Manager
- **🔍 Zoxide** + **fzf** + **ripgrep** + **bat** - Shell tools
- **🐧 Arch Linux** / **Ubuntu/Debian** / **Fedora** - Distros suportadas
