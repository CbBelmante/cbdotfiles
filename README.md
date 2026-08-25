<div align="center">
<pre>
   ██████╗██████╗ ██████╗  ██████╗ ████████╗███████╗██╗██╗     ███████╗███████╗
  ██╔════╝██╔══██╗██╔══██╗██╔═══██╗╚══██╔══╝██╔════╝██║██║     ██╔════╝██╔════╝
  ██║     ██████╔╝██║  ██║██║   ██║   ██║   █████╗  ██║██║     █████╗  ███████╗
  ██║     ██╔══██╗██║  ██║██║   ██║   ██║   ██╔══╝  ██║██║     ██╔══╝  ╚════██║
  ╚██████╗██████╔╝██████╔╝╚██████╔╝   ██║   ██║     ██║███████╗███████╗███████║
   ╚═════╝╚═════╝ ╚═════╝  ╚═════╝    ╚═╝   ╚═╝     ╚═╝╚══════╝╚══════╝╚══════╝
</pre>

⚙️ **DOTFILES PESSOAIS** | 🐧 Linux & 🍎 macOS
🔗 Symlinks Automaticos | 📦 Instalacao Modular | 🔄 Sincronizacao entre Maquinas

</div>

## 📖 Sobre

Configuracoes pessoais de desenvolvimento. Clone o repositorio em qualquer maquina, rode o instalador e tudo funciona — editor, terminal, shell, aliases e layouts.

**Compativel com:** Arch Linux (pacman) | Ubuntu/Debian (apt) | Fedora (dnf) | macOS (brew) | Windows (winget/choco)

## 🚀 Instalacao Rapida (Maquina Nova)

### ⚡ One-liner (recomendado — Linux e macOS)

```bash
curl -sL https://raw.githubusercontent.com/CbBelmante/cbdotfiles/master/bootstrap.sh | bash
```

> Clona o repositorio em `~/Workspaces/cbdotfiles` e roda o instalador automaticamente.
> No macOS, instala Xcode CLT (git) e Homebrew se necessario.

### 📋 Passo a passo — Linux

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

### 🍎 Passo a passo — macOS

```bash
# 1. Pre-requisito: Xcode Command Line Tools (inclui git)
xcode-select --install

# 2. Clone e instale
git clone https://github.com/CbBelmante/cbdotfiles.git ~/Workspaces/cbdotfiles
cd ~/Workspaces/cbdotfiles
./install.sh    # instala Homebrew + Bun automaticamente

# 3. Reinicie o terminal
source ~/.zshrc
```

> No macOS, o instalador usa Homebrew para tudo. Apenas modulos genuinamente Linux-only (drivers, desktop-tools, keybinds, power) sao pulados com "skip".

> O instalador cuida de tudo: instala Homebrew e Bun (se necessario), dependencias e abre o menu interativo.

> 💡 Na proxima vez que precisar atualizar, basta rodar `cbdotUpdate`

## 📦 Instalacao Seletiva

O instalador abre um menu interativo com duas opcoes:

```
? Como deseja instalar?
❯ Minimal (shell + terminal + apps — sem infra dev)
  Padrao (todos os modulos)
  Custom (selecionar modulos)
```

No modo **Minimal**, instala o uso diario completo sem infra dev pesada:

| Inclui | Pula |
|--------|------|
| Zsh + Oh My Zsh + Powerlevel10k + p10k | Git nome/email (usa existente, sem prompt) |
| Fontes Nerd Font + CLI tools | SSH key generation |
| Neovim + Zellij + tmux + LazyGit + Delta + GH CLI | NVM + Node |
| Kitty + Ghostty + AeroSpace (macOS) | Docker, Firebase, Supabase |
| Browsers (Vivaldi, Firefox, Chrome) | GitKraken, Postman, Insomnia |
| Apps (LibreOffice, VLC, Obsidian, Sublime) | LazyDocker, Tauri |
| Fastfetch + Btop + Stochos + Keybinds | Gaming (Steam, Discord) |
| | Virtualization (UTM/VirtualBox) |

> Depois de instalar no Minimal, rode `cbdotInstall` a qualquer momento para adicionar o que falta (Git, Docker, etc).

No modo **Custom**, selecione os modulos com checkbox:

```
? Selecione os modulos para instalar:
  ◻ 🐚 shell-tools    Zsh + NVM + Git + CLI tools
  ◻ 🛠️ dev            Neovim + Zellij + VS Code + LazyGit...
  ◻ 🖥️ desktop-tools  Wofi + clipboard + screenshots...
  ...
```

Tambem aceita argumentos diretos:

```bash
./install.sh --custom        # vai direto pra selecao de modulos
./install.sh --all           # instala tudo (sem menu)
./install.sh --chbrowser     # altera o browser padrao (sem instalar nada)
./install.sh --chterminal    # altera o terminal padrao (sem instalar nada)
./install.sh shell-tools dev # instala so esses
./install.sh --help          # lista todos os modulos
```

Ao selecionar o modulo `browsers`, o instalador mostra checkbox dos navegadores e pergunta qual definir como padrao. Use `--chbrowser` a qualquer momento para alterar o browser padrao e `--chterminal` para alterar o terminal padrao (kitty/ghostty).

### 🧩 Modulos Disponiveis

| Modulo | Descricao | Plataforma |
|--------|-----------|:----------:|
| 🐚 `shell-tools` | Zsh + Oh My Zsh + NVM + Node LTS + Git + SSH key + Kitty + Ghostty + AeroSpace + JankyBorders (macOS) + CLI tools | 🐧 🍎 |
| 🔤 `fonts` | Fontes Nerd Font | 🐧 🍎 |
| 🛠️ `dev` | Neovim + Zellij + tmux + VS Code + GitKraken + LazyGit + Delta + Docker + Firebase + Supabase + Postman + Stochos... | 🐧 🍎 |
| 🖥️ `fastfetch` | Config Fastfetch (system info) | 🐧 🍎 |
| 📊 `btop` | Config Btop (monitor de sistema) | 🐧 🍎 |
| 🎮 `drivers` | Drivers GPU (AMD/Intel/NVIDIA) + diagnostico amdgpu/radeon + Bluetooth Mac | 🐧 |
| 🌐 `browsers` | Navegadores (Vivaldi, Firefox, Chrome, Opera, Chromium) + flags Wayland no Linux | 🐧 🍎 |
| 🖥️ `desktop-tools` | Ferramentas de desktop (wofi, clipboard, screenshots, notificacoes) | 🐧 |
| 📦 `apps` | LibreOffice + Sublime + VLC + Obsidian + Kdenlive + qBittorrent/Transmission + KeepingYouAwake | 🐧 🍎 |
| 🎮 `gaming` | Steam + Discord (+ Lutris + ProtonUp-Qt + MangoHud + Gamemode + Wine no Linux) | 🐧 🍎 |
| 🖥️ `virtualization` | UTM (macOS) / VirtualBox (Linux) | 🐧 🍎 |
| ⌨️ `keybinds` | Gera e aplica keybinds (Hyprland/COSMIC/AeroSpace) | 🐧 🍎 |
| ⚡ `power` | Energia (suspend auto-detecta desktop/laptop) | 🐧 |

## 🔄 Atualizacao

Depois de instalado, para puxar mudancas do repositorio em qualquer maquina:

```bash
cbdotUpdate
```

Faz automaticamente: `git pull` → `install.sh --update` → `source ~/.zshrc`

> O `--update` reinstala apenas os modulos que voce selecionou na instalacao (salvos em `local/.modules`). Se nao existe selecao salva, abre o menu interativo.

## 🔧 Comandos uteis

| Comando | Alias curto | Descricao |
|---------|-------------|-----------|
| `cbdotInstall` | `cbInstall` | Abre o menu de instalacao |
| `cbdotUpdate` | `cbUpdate` | Atualiza (git pull + reinstala modulos salvos) |
| `cbdotReinstall` | `cbReinstall` | Reinstala do zero (limpa selecao) |
| `cbdotResymlink` | `cbResymlink` | Refaz todos os symlinks |
| `cbBrowser` | | Trocar browser padrao |
| `cbTerminal` | | Trocar terminal padrao (kitty/ghostty) |
| `aliases` | | Editar config local do shell (aliases, exports, variaveis) |
| `cbZshrc` | | Editar .zshrc do repositorio (global) |
| `cbKitty` | | Editar override local do Kitty |
| `cbLocal` | | Editar variaveis locais (suspend, browser flags) |
| `pcInfo` | | Info completa do PC (hw, gpu, drivers, rede, software) |
| `pcInfo gpu` | | Diagnostico GPU (driver, vulkan, VA-API, kernel params) |
| `cbHelp` | | Referencia completa de comandos e atalhos |
| `cbKeysHelp` | | Busca interativa de atalhos do desktop |
| `cbForceReload` | `cbReload` | Regenera keybinds + recarrega AeroSpace + Zsh |
| `claudeRoot` | | Abre a pasta ~/.claude no file manager |

> Todos os comandos `cb*` funcionam em camelCase e lowercase (ex: `cbdotUpdate` = `cbdotupdate` = `cbupdate`)

## 🔑 SSH + GitHub (pos-install)

O instalador gera automaticamente uma chave SSH `ed25519` com o email do Git e instala o GitHub CLI (`gh`). Depois do install, configure o acesso ao GitHub:

### ⚡ Setup rapido (recomendado)

```bash
# 1. Login no GitHub CLI (abre o browser)
gh auth login

# 2. Dar permissao pra adicionar SSH key
gh auth refresh -h github.com -s admin:public_key

# 3. Adicionar a chave SSH no GitHub (nome da maquina)
gh ssh-key add ~/.ssh/id_ed25519.pub --title "Meu Mac Mini"

# 4. Registrar GitHub como host confiavel
ssh-keyscan github.com >> ~/.ssh/known_hosts

# 5. Pronto! Clone qualquer repo
git clone git@github.com:usuario/repo.git
```

> Cada maquina gera sua propria chave SSH. Repita os passos 1-4 em cada maquina nova.
> O titulo da chave (ex: "Meu Mac Mini", "Arch Desktop") identifica qual maquina no GitHub Settings.

### 📋 Setup manual (alternativa)

```bash
# Ver a chave publica
cat ~/.ssh/id_ed25519.pub

# Cole em: https://github.com/settings/ssh/new
```

### 🔗 HTTPS vs SSH

| Protocolo | Clone | Quando usar |
|-----------|-------|-------------|
| SSH | `git clone git@github.com:user/repo.git` | Padrao (apos setup acima) |
| HTTPS | `git clone https://github.com/user/repo.git` | Funciona direto apos `gh auth login` |

> Apos o `gh auth login`, ambos os protocolos funcionam. SSH e o padrao recomendado — nao pede senha em push/pull.

## 🌐 Flags Wayland (browsers + Electron)

Em Wayland, o modulo `browsers` configura automaticamente:

- `~/.config/electron-flags.conf` — VS Code, GitKraken, Discord, Obsidian
- `~/.config/code-flags.conf` — VS Code especifico
- `~/.config/chrome-flags.conf` — Google Chrome
- `~/.config/vivaldi-stable.conf` — Vivaldi
- Override `.desktop` dos browsers no launcher

Flags padrao (VA-API): `--enable-features=VaapiVideoDecodeLinuxGL --disable-features=UseChromeOSDirectVideoDecoder`

Para `--disable-gpu` (maquinas com problema de GPU), adicione no `local/local.sh`:
```bash
CB_BROWSER_FLAGS="--disable-gpu"
```

## 📂 Estrutura do Projeto

```text
cbdotfiles/
├── bootstrap.sh                   # ⚡ One-liner para maquina nova
├── install.sh                     # 🎯 Shell minimo (garante Bun + chama TS)
├── .gitignore                     # 🚫 Ignora arquivos gerados
├── bin/                           # 🔧 Scripts utilitarios
│   ├── cbhelp.sh                  # 📋 Referencia de comandos e atalhos
│   ├── pcinfo.sh                  # 🖥️ Diagnostico do sistema (hw, gpu, drivers)
│   └── open-browser.sh            # 🌐 Abre browser padrao com flags VA-API
├── ts-installer/                  # 🟦 Instalador TypeScript (Bun Shell)
│   ├── package.json               # 📦 Deps: @inquirer/prompts
│   ├── tsconfig.json              # ⚙️ Config TypeScript
│   └── src/
│       ├── install.ts             # 🎯 Entry point (menu interativo)
│       ├── defaults.ts            # 📋 Defaults centralizados (mude aqui!)
│       ├── helpers.ts             # 🔧 Detecta distro, desktop, hardware
│       ├── log.ts                 # 🎨 Log colorido + header + summary
│       └── modules/               # 📦 Um arquivo por modulo
│           ├── index.ts           # Registry (IModule[])
│           ├── shell-tools.ts     # 🐚 Zsh + NVM + Git + Kitty + Ghostty + CLI tools
│           ├── fonts.ts           # 🔤 Nerd Fonts
│           ├── drivers.ts         # 🎮 GPU + Bluetooth (detecta hardware)
│           ├── browsers.ts        # 🌐 Vivaldi, Opera, Firefox, Chrome, Chromium
│           ├── desktop-tools.ts   # 🖥️ Wofi, clipboard, screenshots (tiling WMs)
│           ├── dev.ts             # 🛠️ Neovim, Zellij, VS Code, GitKraken, GitHub CLI, LazyGit, LazyDocker, Docker, SQLite, Tauri Dev, Firebase, Supabase, Postman, Insomnia, Claude, Antigravity, Kimi, Codex, FlowForge
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
│   └── .gitconfig                 # Configuracao compartilhavel (incluida via git include.path)
├── zellij/
│   ├── config.kdl                 # ⌨️ Keybinds e config principal
│   ├── CbWorkTemplate1.kdl       # 📐 Layout: nvim + 6 terminais
│   └── CbWorkTemplate2.kdl       # 📐 Layout: nvim + 4 terminais
├── tmux/
│   ├── tmux.conf                  # ⚙️ Config tmux (catppuccin, vim nav, passthrough)
│   └── CbWorkTemplate1.sh        # 📐 Layout equivalente ao Zellij
├── zsh/
│   ├── .zshrc                     # 🐚 Config Zsh principal
│   └── aliases.zsh                # 🔗 Aliases e funcoes (zj-new, zj-tab, etc)
├── nvim/                          # ✏️ Config completa Neovim (LazyVim)
│   ├── init.lua
│   ├── lua/
│   └── ...
├── aerospace/
│   └── aerospace.toml             # 🪟 Config AeroSpace macOS (GERADO por generate.sh)
├── borders/
│   └── bordersrc                  # 🔲 Config JankyBorders (borda janela ativa macOS)
├── glazewm/
│   └── config.yaml                # 🪟 Config GlazeWM Windows (GERADO por generate.sh)
├── stochos/
│   └── config.toml                # 🎯 Config Stochos (mouseless keyboard control)
├── ghostty/
│   ├── config                     # 👻 Config base Ghostty
│   ├── macos.conf                 # 🍎 Override macOS (font 13pt)
│   ├── omarchy.conf               # 🔧 Override Omarchy (opacity 0.65)
│   ├── cosmic.conf                # 🔧 Override COSMIC (opacity 0.85 + cores)
│   └── generate-cosmic-theme.sh   # 🔄 Gera cosmic.conf do tema COSMIC ativo
├── kitty/
│   ├── kitty.conf                 # 🐱 Config base Kitty
│   ├── macos.conf                 # 🍎 Override macOS (titlebar-only, font 13pt)
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
~/.config/cb/local.zsh                → cbdotfiles/local/zsh/local.zsh (se existir)
~/.config/zellij/config.kdl           → cbdotfiles/zellij/config.kdl
~/.config/zellij/layouts/*.kdl        → cbdotfiles/zellij/*.kdl
~/.config/nvim/                       → cbdotfiles/nvim/
~/.config/kitty/kitty.conf            → cbdotfiles/kitty/kitty.conf
~/.config/kitty/env.conf              → cbdotfiles/kitty/{macos,omarchy,cosmic}.conf
~/.config/kitty/local.conf            → cbdotfiles/local/kitty/kitty.conf (se existir)
~/.config/ghostty/config              → cbdotfiles/ghostty/config
~/.config/ghostty/env.conf            → cbdotfiles/ghostty/{macos,omarchy,cosmic}.conf
~/.config/ghostty/local.conf          → cbdotfiles/local/ghostty/config.ghostty (se existir)
~/.aerospace.toml                     → cbdotfiles/aerospace/aerospace.toml (macOS, gerado)
~/.config/borders/bordersrc           → cbdotfiles/borders/bordersrc (macOS)
~/.config/stochos/config.toml         → cbdotfiles/stochos/config.toml
~/.config/lazygit/config.yml          → cbdotfiles/lazygit/config.yml
~/.tmux.conf                          → cbdotfiles/tmux/tmux.conf
~/.markdownlint-cli2.yaml             → cbdotfiles/nvim/.markdownlint-cli2.yaml
~/.config/fastfetch/config.jsonc      → cbdotfiles/fastfetch/config.jsonc
~/.config/btop/btop.conf              → cbdotfiles/btop/btop.conf
```

**Arquivo criado (nao symlink):**
```
~/.gitconfig                          → arquivo real (user + include.path → cbdotfiles/git/.gitconfig)
```

## 🔍 Shell Tools

Ferramentas de linha de comando inspiradas no Omarchy:

### Zoxide (cd inteligente)

Lembra os diretorios visitados. Navegue com atalhos:

```bash
cd ~/Workspaces/meu-projeto       # visita uma vez
cd ~                               # volta pro home
cd meu-projeto                    # zoxide lembra e volta direto
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
| `d` / `dc` | Docker / Docker Compose |
| `sqlp` / `sqlPractice` | Menu interativo para criar/abrir bancos SQLite de pratica |
| `nvimHelp` / `sqlpHelp` / `cbHelp` / `cbKeysHelp` | Busca interativa fuzzy de comandos e dicas |

## 🔍 cbSearch - Sistema de Help Interativo

Busca fuzzy (fzf) em comandos e dicas. **152 comandos buscáveis** em 4 helps especializados!

```bash
nvimHelp      # 48 comandos Neovim essenciais
sqlpHelp      # 19 comandos SQL + dadbod
cbHelp        # 15 aliases + ferramentas cbdotfiles
cbKeysHelp    # 32 atalhos do desktop (alinhado com Omarchy 4)
```

**Features:**
- 🔍 Busca fuzzy em nome + descrição + tags
- 📖 Preview detalhado com exemplos
- 📋 Copia comando (Enter)
- ⌨️ Navegação rápida (setas)
- 🎯 Layout top-down intuitivo
- 📦 Data-driven (JSON)

**Busque por:**
- Nome: `yi"`, `gg`, `SELECT`
- Tags: `frequente`, `copiar`, `deletar`
- Descrição: `aspas`, `undo`, `join`

> 📖 Documentação completa: [`data/README.md`](data/README.md)

## 🗄️ SQL Practice

Ferramenta interativa para treinar SQL com SQLite. Cria bancos automaticamente, copia connection string pro clipboard, e abre no Neovim com dadbod UI já configurado.

```bash
sqlp              # menu interativo
sqlpHelp          # guia passo a passo
```

**Features:**
- ⚡ Nome automático brasileiro (practice-13-08-2026-11h51)
- 🏢 3 presets: Completo (com dados) / Estrutura / Vazio
- 📋 Auto-copia connection string pro clipboard
- 🚀 Abre Neovim com dadbod UI já ativo
- 🗑️ Limpar bancos antigos (multi-select)

**Path padrão:** `~/Workspaces/sql-practice/`

> 📖 Documentação completa: [`sql-practice/README.md`](sql-practice/README.md)

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

### 📐 CbWorkTemplate2 (`cbw2`)

Layout mais limpo com Neovim central e 4 terminais:

```
┌──────────────────────────────────────────────────┐
│                    tab-bar                        │
├─────────┬────────────────────────┬───────────────┤
│         │                        │               │
│terminal │        nvim            │  terminal     │
│  (20%)  │       (editor)         │   (20%)       │
│         ├───────────┬────────────┤               │
│         │ terminal  │  terminal  │               │
├─────────┴───────────┴────────────┴───────────────┤
│                   status-bar                      │
└──────────────────────────────────────────────────┘
```

### 🚀 Comandos Zellij Customizados

#### Abrir/reconectar sessao

```bash
zj <layout> <diretorio|alias>

zj cbw1 meu-projeto              # cria sessao ou reconecta se ja existe
zj cbw1 ~/Workspaces/outro       # caminho completo
```

> Se a sessao ja existe, reconecta automaticamente. Se nao, cria nova com o layout.
> Aceita qualquer alias de navegacao (`cd ...`) cadastrado no `aliases.zsh`.

#### Nova tab (dentro do Zellij)

```bash
zj-tab <layout> <diretorio|alias>

zj-tab cbw1 meu-projeto
zj-tab cbw1 ~/Workspaces/outro
```

#### Outros comandos

| Comando | Acao |
|---------|------|
| `zj-l` | Listar sessoes ativas |
| `zj-a` | Attach na ultima sessao |
| `zj-k <nome>` | Matar sessao especifica |
| `zj-ka` | Matar todas as sessoes |

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
| `cbdotfiles` | ~/Workspaces/cbdotfiles |

> Aliases de projetos pessoais ficam em `local/zsh/aliases.zsh` (gitignored).

### 🔀 Git

| Alias | Comando |
|-------|---------|
| `gs` | `git status` |
| `ga` | `git add` |
| `gc` | `git commit -m` |
| `gp` | `git push` |
| `gl` | `git log --oneline --graph` |

### 📂 Sistema (eza — com fallback)

| Alias | Comando |
|-------|---------|
| `ls` | `eza --icons` (fallback: `ls` padrao se eza nao instalado) |
| `ll` | `eza -lah --icons` |
| `la` | `eza -A --icons` |
| `tree` | `eza --tree --level=3 --icons` |

### 📦 Package Management (detecta distro)

| Distro | `update` | `install` | `search` |
|--------|----------|-----------|----------|
| Arch | `sudo pacman -Syu` | `sudo pacman -S` | `pacman -Ss` |
| Debian/Ubuntu | `sudo apt update && sudo apt upgrade` | `sudo apt install` | `apt search` |
| Fedora | `sudo dnf upgrade` | `sudo dnf install` | `dnf search` |

### 🪟 Hyprland / Omarchy (condicionais)

Aliases so sao definidos se os comandos existem na maquina:

| Alias | Comando | Requer |
|-------|---------|--------|
| `hyprconf` | `cd ~/.config/hypr` | hyprctl |
| `reload-hypr` | `hyprctl reload` | hyprctl |
| `omarchy-ver` | `omarchy-version` | Omarchy |
| `omarchy-theme` | `omarchy-theme-current` | Omarchy |

## ⌨️ Keybind Generator

Sistema de keybinds com **fonte unica de verdade**. Defina uma vez em `keybinds.conf`, configure as variaveis em `vars.conf`, gere para ambos:

```
keybinds.conf + vars.conf  ──▶  hyprland-bindings.conf  (Arch/Hyprland)
                           ├──▶  cosmic-custom.ron       (Pop!OS/COSMIC)
                           ├──▶  aerospace.toml          (macOS/AeroSpace)
                           └──▶  glazewm/config.yaml     (Windows/GlazeWM)
```

### 🪟 AeroSpace (macOS Tiling WM)

No macOS, o AeroSpace funciona como tiling WM (equivalente ao Hyprland/COSMIC no Linux). O instalador configura automaticamente:

- **Keybinds** gerados da mesma fonte (`keybinds.conf`) — `Super` vira `Cmd`
- **JankyBorders** para borda visual na janela ativa (azul) e inativa (cinza)
- **Workspaces por monitor** — cada monitor tem seus proprios workspaces
- **Auto-start** no login

| Atalho macOS | Acao |
|---|---|
| `Cmd+Enter` | Terminal (Ghostty) |
| `Cmd+Shift+B` | Browser |
| `Cmd+1-5` | Workspaces monitor principal |
| `Cmd+6-9` | Workspaces monitor secundario |
| `Cmd+Shift+1-9` | Mover janela pra workspace |
| `Cmd+H/J/K/L` | Foco entre janelas |
| `Cmd+Shift+H/J/K/L` | Mover janela |
| `Alt+W` | Fechar janela |
| `Alt+Space` | App launcher |

> Para multi-monitor, os workspaces sao fixos por tela no `generate.sh` (`workspace-to-monitor-force-assignment`). Ajuste os numeros conforme seus monitores.

### 🪟 GlazeWM (Windows Tiling WM)

No Windows, o GlazeWM funciona como tiling WM. Instale via `winget install GlazeWM` e copie `glazewm/config.yaml` para `%userprofile%\.glzr\glazewm\config.yaml`. O config e gerado pelo mesmo `generate.sh` com os mesmos keybinds.

| Plataforma | Tiling WM | Modifier | Config |
|---|---|---|---|
| Arch/Hyprland | Hyprland | Super | `keybinds/generated/hyprland-bindings.conf` |
| Pop!_OS | COSMIC | Super | `keybinds/generated/cosmic-custom.ron` |
| macOS | AeroSpace | Cmd | `aerospace/aerospace.toml` |
| Windows | GlazeWM | Alt | `glazewm/config.yaml` |

### Variaveis (`vars.conf`)

Mude o browser, terminal ou app em **um lugar so**:

```bash
# Hyprland
HYPR_TERMINAL=uwsm app -- ghostty
HYPR_BROWSER=uwsm app -- vivaldi

# COSMIC
COSMIC_TERMINAL=ghostty
COSMIC_BROWSER=vivaldi
```

### Tipos

| Tipo | Descricao |
|------|-----------|
| `BOTH` | Gera para Hyprland e COSMIC |
| `HYPR` | Gera apenas para Hyprland |
| `COSM` | Gera apenas para COSMIC |

### Atalhos Padronizados

Padrao alinhado com Omarchy 4: `Super+Letra` = acoes do WM, `Super+Shift+Letra` = lancar apps, `Super+Ctrl+Letra` = paineis/utilitarios.

| Atalho | Acao |
|--------|------|
| **Apps (Super+Shift)** | |
| `Super+Enter` | Terminal |
| `Super+Shift+B` | Browser padrao do sistema (via open-browser.sh) |
| `Super+Shift+Alt+B` | Browser modo privado (detecta flag correta) |
| `Super+Shift+F` | File manager |
| `Super+Shift+N` | Editor |
| `Super+Shift+/` | 1Password |
| `Super+Shift+O` | Obsidian |
| `Super+Shift+G` | GitKraken |
| `Super+Shift+M` | Spotify |
| `Super+Shift+D` | LazyDocker |
| `Super+Shift+Ctrl+A` | Coding agent |
| **WM (Super)** | |
| `Super+W` | Fechar janela |
| `Super+F` | Full screen |
| `Super+Escape` | System menu |
| `Super+K` | Mostrar todos os atalhos |
| **Utilitarios (Super+Ctrl)** | |
| `Super+Ctrl+T` | Btop (activity) |
| `Super+Ctrl+V` | Clipboard history |
| `Super+C/X/V` | Copy / Cut / Paste |
| **Midia** | |
| `Super+Shift+S` / `Print` | Screenshot (interativo) |
| `Super+Shift+Alt+S` / `Alt+Print` | Screen recording |
| `Super+Shift+Ctrl+S` / `Super+Print` | Color picker |

### Regenerar

```bash
./keybinds/generate.sh          # gera os arquivos
./install.sh keybinds            # gera + aplica symlinks
```

## 📋 Defaults Centralizados

Todos os defaults do projeto ficam em **dois arquivos**:

| Arquivo | O que configura |
|---------|----------------|
| `ts-installer/src/defaults.ts` | Shell, terminal, editor, browser, fontes, power, NVM, CLI tools |
| `keybinds/vars.conf` | Apps por desktop (terminal, browser, file manager, editor) |

### `defaults.ts` (principais)

| Default | Valor | Descricao |
|---------|-------|-----------|
| `SHELL.default` | `zsh` | Shell padrao |
| `SHELL.theme` | `powerlevel10k` | Tema do Zsh |
| `TERMINAL.app` | `ghostty` | Terminal padrao |
| `TERMINAL.font` | `CaskaydiaMono Nerd Font` | Fonte do terminal |
| `TERMINAL.fontSize` | `7` | Tamanho da fonte |
| `EDITOR.default` | `nvim` | Editor padrao |
| `EDITOR.nvimMinVersion` | `0.11.2` | Versao minima do Neovim |
| `BROWSER.default` | `vivaldi` | Browser padrao (--all) |
| `POWER.suspendDesktop` | `false` | Suspend no desktop |
| `POWER.suspendLaptop` | `true` | Suspend no laptop |
| `POWER.idleTimeoutSecs` | `1800` | Timeout de idle (30min) |
| `NVM.version` | `0.40.1` | Versao do NVM |
| `FONTS` | `CascadiaMono, JetBrainsMono` | Nerd Fonts instaladas |

### Listas de tools (`active`)

Cada modulo tem uma lista de tools com `active: true/false` no `defaults.ts`:

- **`defaultInstall: true`** = incluso no modo **Padrao** (instalar tudo)
- **`defaultInstall: false`** = disponivel apenas no modo **Custom** (selecao manual)

| Lista | Tools `false` (apenas Custom) |
|-------|-------------------------------|
| `DEV_TOOLS_ENABLED` | Tauri, Insomnia, Phonto, Claude Config, Claude Desktop, Claude Code, Antigravity CLI, Kimi Code, Codex CLI, FlowForge |
| `BROWSERS_ENABLED` | Opera, Chromium |
| `APPS_ENABLED` | Kdenlive, KeepingYouAwake |
| `GAMING_ENABLED` | (todos defaultInstall) |
| `VIRTUALIZATION_ENABLED` | VirtualBox/UTM |

> Quer que o Docker nao instale por padrao? Mude `{ id: "docker", defaultInstall: false }` no `defaults.ts`. No modo Custom ele ainda aparece pra selecionar.

> No macOS, ferramentas Linux-only (PavuControl, PeaZip, Lutris, ProtonUp-Qt, MangoHud, Gamemode, Wine) sao filtradas automaticamente e nao aparecem no menu. Apps com equivalente macOS sao instalados via `brew install --cask` (ex: qBittorrent → Transmission, VirtualBox → UTM).

### `vars.conf` (keybinds por desktop)

```bash
# Hyprland
HYPR_TERMINAL=uwsm app -- ghostty
HYPR_BROWSER=uwsm app -- vivaldi

# COSMIC
COSMIC_TERMINAL=ghostty
COSMIC_BROWSER=vivaldi
```

> Quer mudar o browser padrao? Use `cbBrowser` ou mude `BROWSER.default` no `defaults.ts` e `COSMIC_BROWSER`/`HYPR_BROWSER` no `vars.conf`.
> Quer mudar o terminal padrao? Use `cbTerminal` ou mude `TERMINAL.app` no `defaults.ts` e `COSMIC_TERMINAL`/`HYPR_TERMINAL` no `vars.conf`.

### Git

Nome e email do Git sao **perguntados durante o install** (nao ficam no repositorio). As configs compartilhaveis (branch padrao, aliases, editor) ficam em `git/.gitconfig` e sao incluidas via `git config --global include.path`.

## 🔒 Local Overrides (configs por maquina)

Cada maquina pode ter configs especificas que **nao vao pro git**. Basta criar arquivos em `local/` com a **mesma estrutura** do projeto:

```bash
# Copie o template
cp -r local.example/ local/

# Edite o que quiser
nvim local/local.sh              # variaveis pro instalador
nvim local/zsh/aliases.zsh       # aliases so dessa maquina
nvim local/kitty/kitty.conf      # fonte/tamanho diferente (Kitty)
nvim local/ghostty/config.ghostty # fonte/tamanho diferente (Ghostty)
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
# local/zsh/local.zsh
alias deploy='ssh deploy@prod-server'
alias vpn='sudo openvpn ~/configs/trabalho.ovpn'
```

**Projetos com worktrees numeradas — funcao dinamica:**
```bash
# local/zsh/local.zsh
function meuapp() {
  if [ -z "$1" ]; then
    builtin cd ~/Workspaces/meu-app
  elif [ -d ~/Workspaces/meu-app-$1 ]; then
    builtin cd ~/Workspaces/meu-app-$1
  elif [ -d ~/Workspaces/meu-app_$1 ]; then
    builtin cd ~/Workspaces/meu-app_$1
  else
    echo "Worktree meu-app $1 nao encontrado"
    command ls -d ~/Workspaces/meu-app* 2>/dev/null | sed 's|.*/||'
  fi
}
```

Uso:
```bash
meuapp           # vai pro projeto principal
meuapp 308       # vai pro worktree meu-app-308
zj cbw2 meuapp   # abre Zellij no projeto
zj cbw2 meuapp 308  # abre Zellij no worktree 308
```

> Use `function nome()` (nao `nome()`) pra evitar conflito com o alias `cd` do zoxide.
> Use `builtin cd` dentro de funcoes pelo mesmo motivo.
> Funciona com `zj`: resolve funcoes e aliases automaticamente, inclusive com numero.
> Aceite `_` e `-`: adicione elif pra cada variacao do nome.

### Como funciona

| Camada | Kitty | Ghostty | Vai pro git? |
|--------|-------|---------|:------------:|
| Base | `kitty/kitty.conf` | `ghostty/config` | ✅ |
| Ambiente | `kitty/env.conf` | `ghostty/env.conf` | ✅ |
| Local | `local/kitty/kitty.conf` | `local/ghostty/config.ghostty` | ❌ |

O instalador detecta automaticamente se `local/` tem overrides e cria os symlinks. O modulo `power` auto-detecta desktop (sem bateria) vs laptop e configura suspend — sem precisar de override manual.

## 🎮 Drivers (deteccao automatica)

O modulo `drivers` detecta o hardware e instala/configura automaticamente:

| Hardware | O que faz |
|----------|-----------|
| **GPU AMD (GCN 3.0+)** | Mesa, Vulkan (RADV), VA-API — driver `amdgpu` nativo |
| **GPU AMD (GCN 1.0/1.1)** | Detecta driver `radeon`, oferece troca pra `amdgpu` (kernel params + blacklist + initramfs) |
| **GPU Intel** | Mesa, Vulkan, Intel Media Driver |
| **GPU NVIDIA** | Avisa para instalar manualmente |
| **Bluetooth Apple/Broadcom** | Detecta e avisa sobre firmware necessario |

### Diagnostico GPU

```bash
pcInfo gpu    # mostra driver ativo, vulkan, VA-API, kernel params, recomendacoes
```

Para GPUs AMD antigas (SI/CIK), o installer configura automaticamente:
1. Parametros do kernel (`amdgpu.si_support=1` ou `amdgpu.cik_support=1`)
2. Blacklist do modulo `radeon` (`/etc/modprobe.d/blacklist-radeon.conf`)
3. Atualiza initramfs
4. Pede reboot

## ➕ Adicionando Novos Layouts

1. Crie o arquivo `.kdl` em `cbdotfiles/zellij/`
2. Adicione o nome curto no `case` das funcoes `zj` e `zj-tab` no `aliases.zsh`:

```bash
case "$layout" in
    cbw1) layout_name="CbWorkTemplate1" ;;
    cbw2) layout_name="CbWorkTemplate2" ;;  # novo
esac
```

3. Rode `cbdotUpdate` ou `./install.sh dev`

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

## ✏️ Plugins Neovim (customizados)

Alem do LazyVim base, os seguintes plugins sao adicionados:

| Plugin | Descricao |
|--------|-----------|
| `cb-headscale.nvim` | Headings markdown com fonte grande via Kitty OSC 66 (h1=3x, h2=2x) |
| `render-markdown.nvim` | Renderiza markdown (bullets, headings, code, tabelas, checkboxes) |
| `mini.map` | Minimap lateral (code overview) |
| `nvim-notify` | Notificacoes com animacao (fade + slide) |
| `vim-move` | Move linhas/blocos com Alt+j/k |
| `bufferline.nvim` | Tabs com icone de fechar corrigido |
| `dropbar.nvim` | Breadcrumbs no topo (arquivo > classe > funcao) estilo VS Code |
| `nvim-navic` | Contexto do codigo via LSP (dentro de qual funcao/classe) |
| `claudecode.nvim` | Integracao Claude Code com diff no Neovim via WebSocket |
| `git-blame.nvim` | Blame inline na linha atual (estilo GitLens) |
| `harpoon` | Marca e pula entre arquivos frequentes (`<leader>1-4`) |
| `todo-comments.nvim` | Destaca e lista TODO/FIXME/HACK no codigo |
| `noice.nvim` | Cmdline popup e notificacoes com visual polido |
| `markdownlint-cli2` | Linter de markdown (MD012/13/58/60 desabilitados) |
| `vim-dadbod` + `vim-dadbod-ui` | Database UI no Neovim com autocomplete SQL via blink.cmp (`<leader>db`) |

### 🎨 Tema do Neovim

Tema padrao: **Origamid** (port do VS Code theme do Andre Rafael).

Temas disponiveis (troque com `:colorscheme <nome>`):

| Tema | Estilo |
|------|--------|
| `origamid` | Escuro com verde/amarelo/azul (padrao) |
| `moonlight` | Azul escuro |
| `catppuccin` | Pastel escuro |
| `gruvbox` | Retro warm |
| `tokyonight` | Azul moderno |
| `kanagawa` | Inspirado em arte japonesa |
| `rose-pine` | Tons suaves |
| `nightfox` | Escuro contrastado |
| `onedark` | Estilo Atom |
| `vscode` | Estilo VS Code |

Para mudar o padrao, edite `nvim/lua/plugins/themes.lua`:

```lua
{ "LazyVim/LazyVim", opts = { colorscheme = "catppuccin" } },
```

### ⌨️ Atalhos customizados do Neovim

Overrides pra evitar conflito com Zellij e melhorar produtividade:

| Atalho | Acao | Obs |
|--------|------|-----|
| `Tab` | Alternar entre paineis (neo-tree / editor) | Substitui `Ctrl+w w` |
| `<leader>p` | Buscar arquivo (Telescope) | Substitui `Ctrl+p` (conflita com Zellij) |
| `<leader>e` | Abrir/fechar neo-tree | Padrao LazyVim |
| `<leader>ff` | Buscar arquivo (Telescope) | Padrao LazyVim |
| `<leader>ac` | Iniciar Claude Code | claudecode.nvim |
| `<leader>ha` | Marcar arquivo no Harpoon | harpoon |
| `<leader>hh` | Menu do Harpoon | harpoon |
| `<leader>1-4` | Pular pro arquivo 1-4 do Harpoon | harpoon |
| `<leader>st` | Buscar TODO/FIXME/HACK | todo-comments |
| `<leader>gb` | Git blame da linha | gitsigns (LazyVim) |
| `Alt+j/k` | Mover linha/bloco | vim-move |

> Neo-tree abre automaticamente ao iniciar o Neovim.

### ⚙️ Opcoes extras

| Opcao | Descricao |
|-------|-----------|
| Auto-save | Salva automaticamente ao trocar buffer (exceto diffs do Claude) |
| Spell check | Desativado globalmente (inclusive markdown) |
| Neo-tree auto-open | Sidebar sempre visivel ao abrir |

> O `cb-headscale.nvim` so funciona no Kitty >= 0.40 direto (sem Zellij/tmux). O instalador instala Kitty do site oficial.

## 🛠️ Tecnologias

### Instalador
- **🟦 Bun** + **TypeScript** - Instalador interativo (Bun Shell + @inquirer/prompts)

### Ferramentas instaladas
- **🐚 Zsh** + Oh My Zsh + Powerlevel10k
- **🖥️ Zellij** - Multiplexador de terminal (Rust)
- **🪟 tmux** - Multiplexador alternativo (catppuccin, vim nav, TPM)
- **✏️ Neovim** - Editor (LazyVim + cb-headscale.nvim)
- **🐱 Kitty** >= 0.40 - Terminal emulator (site oficial no Linux, brew no macOS)
- **👻 Ghostty** - Terminal emulator (apt/PPA no Ubuntu, pacman no Arch, brew no macOS)
- **🌐 Vivaldi** / **Firefox** / **Chrome** - Browsers
- **💻 VS Code** - Editor GUI
- **🐙 GitKraken** - Git GUI
- **🦥 LazyGit** - Git TUI
- **🔀 Delta** - Git pager (side-by-side, syntax highlight, line numbers)
- **📊 Btop** - Monitor de sistema
- **🖥️ Fastfetch** - System info
- **📦 NVM** - Node Version Manager
- **🔍 Zoxide** + **fzf** + **ripgrep** + **bat** - Shell tools
- **🐧 Arch Linux** / **Ubuntu/Debian** / **Fedora** / **🍎 macOS** / **🪟 Windows** - Plataformas suportadas
