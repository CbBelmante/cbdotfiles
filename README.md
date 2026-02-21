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
# 1. Pre-requisito: git
sudo apt install git   # ou: sudo pacman -S git

# 2. Clone e instale
git clone https://github.com/CbBelmante/cbdotfiles.git ~/Workspaces/cbdotfiles
cd ~/Workspaces/cbdotfiles
./install.sh

# 3. Reinicie o terminal
source ~/.zshrc
```

> O instalador cuida de tudo: instala Bun (se necessario), dependencias e abre o menu interativo.

> 💡 Na proxima vez que precisar atualizar, basta rodar `cbdotUpdate`

## 📦 Instalacao Seletiva

O instalador abre um menu interativo com duas opcoes:

```
? Como deseja instalar?
❯ Padrao (todos os modulos)
  Custom (selecionar modulos)
```

No modo **Custom**, selecione os modulos com checkbox:

```
? Selecione os modulos para instalar:
  ◻ 🐚 shell-tools    Zsh + NVM + Git + CLI tools
  ◻ 🛠️ dev            Neovim + Zellij + VS Code + LazyGit...
  ◻ 🐱 kitty          Config Kitty + override por ambiente
  ...
```

Tambem aceita argumentos diretos:

```bash
./install.sh --custom        # vai direto pra selecao de modulos
./install.sh --all           # instala tudo (sem menu)
./install.sh --chbrowser     # altera o browser padrao (sem instalar nada)
./install.sh shell-tools dev # instala so esses
./install.sh --help          # lista todos os modulos
```

Ao selecionar o modulo `browsers`, o instalador mostra checkbox dos navegadores e pergunta qual definir como padrao. Use `--chbrowser` a qualquer momento para alterar o browser padrao.

### 🧩 Modulos Disponiveis

| Modulo | Descricao | Instala software? |
|--------|-----------|-------------------|
| 🐚 `shell-tools` | Zsh + Oh My Zsh + NVM + Git + Kitty + Zoxide + fzf + ripgrep + bat + eza | ✅ Zsh, NVM, Kitty, ferramentas CLI |
| 🔤 `fonts` | Fontes Nerd Font | ✅ Fontes |
| 🎮 `drivers` | Drivers GPU (AMD/Intel/NVIDIA) + Bluetooth Mac | ✅ Mesa, VA-API, firmware |
| 🌐 `browsers` | Navegadores (Vivaldi, Opera, Firefox, Chrome, Chromium) | ✅ Browsers selecionados |
| 🛠️ `dev` | Neovim + Zellij + VS Code + GitKraken + LazyGit + LazyDocker | ✅ Dev tools selecionados |
| 🖥️ `fastfetch` | Config Fastfetch (system info) | ❌ Apenas symlink |
| 📊 `btop` | Config Btop (monitor de sistema) | ❌ Apenas symlink |
| 📦 `apps` | LibreOffice + Sublime + VLC + Obsidian + Kdenlive + PeaZip + qBittorrent | ✅ Apps selecionados |
| 🎮 `gaming` | Steam + Lutris + ProtonUp-Qt + MangoHud + Gamemode + Wine + Discord | ✅ Gaming tools |
| ⌨️ `keybinds` | Gera e aplica keybinds (Hyprland/COSMIC) | ❌ Gera configs |
| ⚡ `power` | Energia (suspend auto-detecta desktop/laptop) | ❌ Apenas gsettings |

## 🔄 Atualizacao

Depois de instalado, para puxar mudancas do repositorio em qualquer maquina:

```bash
cbdotUpdate
```

Faz automaticamente: `git pull` → `install.sh --update` → `source ~/.zshrc`

> O `--update` reinstala apenas os modulos que voce selecionou na instalacao (salvos em `local/.modules`). Se nao existe selecao salva, abre o menu interativo.

## 📂 Estrutura do Projeto

```text
cbdotfiles/
├── bootstrap.sh                   # ⚡ One-liner para maquina nova
├── install.sh                     # 🎯 Shell minimo (garante Bun + chama TS)
├── .gitignore                     # 🚫 Ignora arquivos gerados
├── ts-installer/                  # 🟦 Instalador TypeScript (Bun Shell)
│   ├── package.json               # 📦 Deps: @inquirer/prompts
│   ├── tsconfig.json              # ⚙️ Config TypeScript
│   └── src/
│       ├── install.ts             # 🎯 Entry point (menu interativo)
│       ├── helpers.ts             # 🔧 Detecta distro, desktop, hardware
│       ├── log.ts                 # 🎨 Log colorido + header + summary
│       └── modules/               # 📦 Um arquivo por modulo
│           ├── index.ts           # Registry (IModule[])
│           ├── shell-tools.ts     # 🐚 Zsh + NVM + Git + Kitty + CLI tools
│           ├── fonts.ts           # 🔤 Nerd Fonts
│           ├── drivers.ts         # 🎮 GPU + Bluetooth (detecta hardware)
│           ├── browsers.ts        # 🌐 Vivaldi, Opera, Firefox, Chrome, Chromium
│           ├── dev.ts             # 🛠️ Neovim, Zellij, VS Code, GitKraken, LazyGit, LazyDocker
│           ├── fastfetch.ts       # 🖥️ System info
│           ├── btop.ts            # 📊 Monitor de sistema
│           ├── apps.ts            # 📦 LibreOffice, Sublime, VLC, Obsidian...
│           ├── gaming.ts          # 🎮 Steam, Lutris, Wine, Discord...
│           ├── keybinds.ts        # ⌨️ Gerador de keybinds
│           └── power.ts           # ⚡ Energia (desktop/laptop)
├── local.example/                 # 📋 Template de overrides locais
│   ├── local.sh                   # Variaveis pro instalador
│   ├── zsh/aliases.zsh            # Aliases locais
│   └── kitty/kitty.conf           # Override de kitty
├── local/                         # 🔒 Overrides dessa maquina (gitignored)
│   └── ...                        # Mesma estrutura de local.example/
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
~/.config/cb/local.zsh                → cbdotfiles/local/zsh/aliases.zsh (se existir)
~/.gitconfig                          → cbdotfiles/git/.gitconfig
~/.config/zellij/config.kdl           → cbdotfiles/zellij/config.kdl
~/.config/zellij/layouts/*.kdl        → cbdotfiles/zellij/*.kdl
~/.config/nvim/                       → cbdotfiles/nvim/
~/.config/kitty/kitty.conf            → cbdotfiles/kitty/kitty.conf
~/.config/kitty/env.conf              → cbdotfiles/kitty/{omarchy,cosmic}.conf
~/.config/kitty/local.conf            → cbdotfiles/local/kitty/kitty.conf (se existir)
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
| `Super+Shift+S` / `Print` | Screenshot (interativo) |
| `Shift+Print` | Screenshot (clipboard) |

### Regenerar

```bash
./keybinds/generate.sh          # gera os arquivos
./install.sh keybinds            # gera + aplica symlinks
```

## 🔒 Local Overrides (configs por maquina)

Cada maquina pode ter configs especificas que **nao vao pro git**. Basta criar arquivos em `local/` com a **mesma estrutura** do projeto:

```bash
# Copie o template
cp -r local.example/ local/

# Edite o que quiser
nvim local/local.sh              # variaveis pro instalador
nvim local/zsh/aliases.zsh       # aliases so dessa maquina
nvim local/kitty/kitty.conf      # fonte/tamanho diferente
```

### Exemplos

**Desktop — desabilitar suspend:**
```bash
# local/local.sh
CB_SUSPEND=off
```

**Notebook — fonte maior no terminal:**
```bash
# local/kitty/kitty.conf
font_size 11.0
```

**Maquina do trabalho — aliases extras:**
```bash
# local/zsh/aliases.zsh
alias deploy='ssh deploy@prod-server'
alias vpn='sudo openvpn ~/configs/trabalho.ovpn'
```

### Como funciona

| Camada | Arquivo | Vai pro git? |
|--------|---------|:------------:|
| Base | `kitty/kitty.conf` | ✅ |
| Ambiente | `kitty/env.conf` (omarchy/cosmic) | ✅ |
| Local | `local/kitty/kitty.conf` | ❌ |

O instalador detecta automaticamente se `local/` tem overrides e cria os symlinks. O modulo `power` auto-detecta desktop (sem bateria) vs laptop e configura suspend — sem precisar de override manual.

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

3. Rode `cbdotUpdate` ou `./install.sh zellij`

## ➕ Adicionando Novos Modulos

1. Crie o modulo em `ts-installer/src/modules/<nome>.ts`:

```typescript
import { $ } from "bun";
import type { IModule } from "./index";
import { DOTFILES_DIR, HOME, symlink } from "../helpers";
import { log } from "../log";

export const nome: IModule = {
  id: "nome",
  name: "Nome do Modulo",
  emoji: "📦",
  description: "O que faz",
  installsSoftware: false,

  async run() {
    log.title("nome", "Nome do Modulo");
    await symlink(`${DOTFILES_DIR}/nome/config`, `${HOME}/.config/nome/config`);
    log.ok("~/.config/nome/config -> cbdotfiles");
  },
};
```

2. Registre no array `ALL_MODULES` em `ts-installer/src/modules/index.ts`

3. Rode `./install.sh nome` para testar

## 🛠️ Tecnologias

### Instalador
- **🟦 Bun** + **TypeScript** - Instalador interativo (Bun Shell + @inquirer/prompts)

### Ferramentas instaladas
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
