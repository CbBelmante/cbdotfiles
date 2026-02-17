<div align="center">
<pre>
   ██████╗██████╗ ██████╗  ██████╗ ████████╗███████╗██╗██╗     ███████╗███████╗
  ██╔════╝██╔══██╗██╔══██╗██╔═══██╗╚══██╔══╝██╔════╝██║██║     ██╔════╝██╔════╝
  ██║     ██████╔╝██║  ██║██║   ██║   ██║   █████╗  ██║██║     █████╗  ███████╗
  ██║     ██╔══██╗██║  ██║██║   ██║   ██║   ██╔══╝  ██║██║     ██╔══╝  ╚════██║
  ╚██████╗██████╔╝██████╔╝╚██████╔╝   ██║   ██║     ██║███████╗███████╗███████║
   ╚═════╝╚═════╝ ╚═════╝  ╚═════╝    ╚═╝   ╚═╝     ╚═╝╚══════╝╚══════╝╚══════╝
</pre>

⚙️ **DOTFILES PESSOAIS** | 🐧 Arch Linux & Ubuntu/Debian
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

> Clona o repositorio em `~/workspaces/cbdotfiles` e roda o instalador automaticamente.

### 📋 Passo a passo (manual)

```bash
# 0. Pre-requisitos
# Arch Linux
sudo pacman -S git curl zsh eza
# Ubuntu/Debian
sudo apt install git curl zsh eza

# 1. Clone e instale
git clone https://github.com/CbBelmante/cbdotfiles.git ~/workspaces/cbdotfiles
cd ~/workspaces/cbdotfiles
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
| 🖥️ `zellij` | Multiplexador de terminal + config + layouts | ✅ Zellij (se nao instalado) |
| ✏️ `nvim` | Config completa Neovim (LazyVim) | ✅ Neovim (se nao instalado) |
| 👻 `ghostty` | Config terminal Ghostty | ❌ Apenas symlink |
| 🐱 `kitty` | Config terminal Kitty | ❌ Apenas symlink |
| 🦥 `lazygit` | Config LazyGit (Git TUI) | ❌ Apenas symlink |
| 🖥️ `fastfetch` | Config Fastfetch (system info) | ❌ Apenas symlink |
| 📊 `btop` | Config Btop (monitor de sistema) | ❌ Apenas symlink |

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
├── installers/                    # 📦 Um script por modulo
│   ├── helpers.sh                 # 🔧 Detecta distro (Arch/Debian/Fedora)
│   ├── zsh.sh                     # 🐚 Oh My Zsh + plugins + symlink
│   ├── nvm.sh                     # 📦 Node Version Manager
│   ├── git.sh                     # 🔀 Symlink .gitconfig
│   ├── zellij.sh                  # 🖥️ Zellij + config + layouts
│   ├── nvim.sh                    # ✏️ Neovim + backup automatico
│   ├── ghostty.sh                 # 👻 Terminal Ghostty
│   ├── kitty.sh                   # 🐱 Terminal Kitty
│   ├── lazygit.sh                 # 🦥 Git TUI
│   ├── fastfetch.sh               # 🖥️ System info
│   └── btop.sh                    # 📊 Monitor de sistema
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
├── ghostty/
│   └── config                     # 👻 Config Ghostty
├── kitty/
│   └── kitty.conf                 # 🐱 Config Kitty
├── lazygit/
│   └── config.yml                 # 🦥 Config LazyGit
├── fastfetch/
│   └── config.jsonc               # 🖥️ Config Fastfetch
└── btop/
    └── btop.conf                  # 📊 Config Btop
```

### 🔗 Symlinks Criados

```
~/.zshrc                              → cbdotfiles/zsh/.zshrc
~/.config/cb/aliases.zsh              → cbdotfiles/zsh/aliases.zsh
~/.gitconfig                          → cbdotfiles/git/.gitconfig
~/.config/zellij/config.kdl           → cbdotfiles/zellij/config.kdl
~/.config/zellij/layouts/*.kdl        → cbdotfiles/zellij/*.kdl
~/.config/nvim/                       → cbdotfiles/nvim/
~/.config/ghostty/config              → cbdotfiles/ghostty/config
~/.config/kitty/kitty.conf            → cbdotfiles/kitty/kitty.conf
~/.config/lazygit/config.yml          → cbdotfiles/lazygit/config.yml
~/.config/fastfetch/config.jsonc      → cbdotfiles/fastfetch/config.jsonc
~/.config/btop/btop.conf              → cbdotfiles/btop/btop.conf
```

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
z-new <layout> <diretorio>

z-new cbw1 mnesis_frontend        # ~/workspaces/mnesis_frontend
z-new cbw1 volan_admin            # ~/workspaces/volan_admin
z-new cbw1 ~/projetos/meu-app    # caminho completo
```

#### Nova tab (dentro do Zellij)

```bash
z-tab <layout> <diretorio>

z-tab cbw1 volan_admin
z-tab cbw1 CbAdmin
z-tab cbw1 radarEleitoral
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
| `ws` / `workspaces` | ~/workspaces |
| `mnesis` / `mns` / `mne` | ~/workspaces/mnesis_frontend |
| `volan` | ~/workspaces/volan_admin |
| `cbadmin` | ~/workspaces/CbAdmin |
| `temporeal` / `tempo` | ~/workspaces/temporeal_admin |
| `radar` | ~/workspaces/radarEleitoral |
| `corp` | ~/workspaces/corp-components |
| `elas` | ~/workspaces/elas_podem_website |
| `vlcomponents` | ~/workspaces/VLComponents_vue |

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

## ➕ Adicionando Novos Layouts

1. Crie o arquivo `.kdl` em `cbdotfiles/zellij/`
2. Adicione o nome curto no `case` das funcoes `z-new` e `z-tab` no `zsh/.zshrc`:

```bash
case "$layout" in
    cbw1) layout="CbWorkTemplate1" ;;
    cbw2) layout="CbWorkTemplate2" ;;  # novo
esac
```

3. Rode `cbdotupdate` ou `./install.sh zellij`

## ➕ Adicionando Novos Modulos

1. Crie a pasta com os arquivos de config:
```bash
mkdir cbdotfiles/<nome>/
# copie os arquivos de config para dentro
```

2. Crie o installer em `cbdotfiles/installers/<nome>.sh`:
```bash
#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

echo "[nome] Configurando..."
mkdir -p ~/.config/<nome>
ln -sf "$DOTFILES_DIR/<nome>/config" ~/.config/<nome>/config
echo "  [ok] symlink criado"
```

3. Adicione o nome no array `ALL_MODULES` em `install.sh`:
```bash
ALL_MODULES=(zsh nvm git zellij nvim ghostty kitty lazygit fastfetch btop <nome>)
```

4. Rode `./install.sh <nome>` para testar

## 🛠️ Tecnologias

- **🐚 Zsh** + Oh My Zsh + Powerlevel10k
- **🖥️ Zellij** - Multiplexador de terminal (Rust)
- **✏️ Neovim** - Editor (LazyVim)
- **👻 Ghostty** / **🐱 Kitty** - Terminal emulators
- **🦥 LazyGit** - Git TUI
- **📊 Btop** - Monitor de sistema
- **🖥️ Fastfetch** - System info
- **📦 NVM** - Node Version Manager
- **🐧 Arch Linux** / **Ubuntu/Debian** - Distros suportadas
