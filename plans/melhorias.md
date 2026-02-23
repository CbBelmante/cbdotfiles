# Plano de Melhorias - cbdotfiles

Auditoria completa do projeto. Objetivo: instalar em qualquer maquina Linux e sair usando.

---

## Criticos (quebram a instalacao)

### 1. Vivaldi, Opera, GitKraken, LazyDocker no Arch usam pacman mas estao no AUR
- **Onde:** `browsers.ts` (Vivaldi, Opera), `dev.ts` (GitKraken, LazyDocker)
- **Problema:** `pkgInstall("vivaldi")` tenta `pacman -S` mas o pacote so existe no AUR. Falha silenciosamente.
- **Fix:** Detectar `yay`/`paru` e usar AUR, igual ja faz pro Chrome no `browsers.ts`.

### 2. `pacman -Syu` roda em CADA chamada de `pkgInstall`
- **Onde:** `helpers.ts` linha 113
- **Problema:** Cada `pkgInstall` no Arch faz full system upgrade (`-Syu`). Se chama 15 vezes, sao 15 upgrades. Lento e pode causar problemas.
- **Fix:** Rodar `-Syu` uma unica vez no inicio. Depois usar `pacman -S --needed --noconfirm`.

### 3. Pipe (`|`) nos keybinds quebra o gerador
- **Onde:** `keybinds/generate.sh`, `keybinds/keybinds.conf`
- **Problema:** O `cut -d'|'` interpreta pipes dos comandos como separador de coluna. Keybinds afetados:
  - Color picker: `pkill hyprpicker || hyprpicker -a` (truncado)
  - Clipboard history: `cliphist list | wofi --dmenu | cliphist decode | wl-copy` (truncado)
- **Fix:** Usar outro delimitador no `keybinds.conf` (ex: `::` ou tab) ou escapar pipes antes do parse.

### 4. `.gitconfig` com email corporativo hardcoded
- **Onde:** `git/.gitconfig`
- **Problema:** `email = guilherme.belmante@volan.com.br` vai pro symlink em qualquer maquina. Commits pessoais saem com email errado.
- **Fix:** Usar `local/git/.gitconfig` pra email/nome, ou perguntar interativamente no modulo `shell-tools` (setupGit).

### 5. Bun completions com path hardcoded no `.zshrc`
- **Onde:** `zsh/.zshrc` linha ~145
- **Problema:** `source "/home/cbbelmante/.bun/_bun"` — path absoluto com username fixo. Nao funciona em outra maquina.
- **Fix:** Usar `$HOME/.bun/_bun` ou `$BUN_INSTALL/_bun`.

---

## Medios (funciona mas com problemas)

### 6. Aliases de pacote so funcionam no Arch
- **Onde:** `zsh/aliases.zsh` linhas 53-55
- **Problema:** `alias update='sudo pacman -Syu'` falha no Debian/Fedora.
- **Fix:** Condicionar aliases pela distro ou usar funcoes que detectam o gerenciador.

### 7. `eza` pode nao existir nos repos Debian/Fedora antigos
- **Onde:** `shell-tools.ts` (instalacao), `zsh/aliases.zsh` (uso)
- **Problema:** Se `eza` nao instala, todos os aliases de `ls` quebram (`ls='eza --icons'`). Shell fica inutilizavel.
- **Fix:** Fallback: so definir aliases de eza se o comando existir. Ou instalar eza via cargo/binary se nao estiver nos repos.

### 8. Docker, Spotify, 1Password, wofi nao sao instalados
- **Onde:** Keybinds e aliases referenciam mas nenhum modulo instala
- **Problema:** Na maquina nova, varios atalhos e aliases nao funcionam:
  - `Super+/` → 1Password (nao instalado)
  - `Super+Shift+M` → Spotify (nao instalado)
  - `Super+Space` → wofi (nao instalado)
  - `alias d='docker'` → Docker (nao instalado)
  - `Super+Ctrl+V` → cliphist/wl-clipboard (nao instalado)
  - `Super+Shift+Alt+T` → tty-clock (nao instalado)
  - `Super+Shift+Alt+V` → cava (nao instalado)
- **Fix:** Adicionar esses ao modulo `apps` ou criar modulo `desktop-tools` pra ferramentas de DE.

### 9. Downloads de binarios sao so x86_64
- **Onde:** `dev.ts` (Neovim, Zellij, LazyGit, LazyDocker)
- **Problema:** URLs hardcoded pra `x86_64`. Em ARM64 falha.
- **Fix:** Detectar `uname -m` e ajustar URL. Ou usar repos da distro quando disponivel.

### 10. `bootstrap.sh` nao instala git automaticamente
- **Onde:** `bootstrap.sh` linhas 20-23
- **Problema:** Numa maquina virgem, `git` pode nao existir. O script imprime erro e sai.
- **Fix:** Detectar distro e instalar git (`apt install git` / `pacman -S git` / `dnf install git`).

---

## Menores (bom ter)

### 11. Sem `.p10k.zsh` no repositorio
- **Problema:** Cada maquina nova roda o wizard do Powerlevel10k. Visual nao e consistente entre maquinas.
- **Fix:** Incluir `.p10k.zsh` no repo e fazer symlink.

### 12. `gsettings` no modulo power so funciona com GNOME
- **Onde:** `power.ts`
- **Problema:** No COSMIC ou Hyprland puro, o schema do GNOME nao existe e o comando falha.
- **Fix:** Verificar se o schema existe antes de tentar. Adicionar `hypridle` config pra Hyprland.

### 13. `fastfetch` usa PPA no Debian
- **Onde:** `fastfetch.ts` linha 27
- **Problema:** PPAs sao Ubuntu-only. Em Debian puro, `add-apt-repository` pode nao existir.
- **Fix:** No Debian, instalar via download direto ou verificar se esta nos repos.

### 14. Aliases Omarchy/Hyprland quebram fora do Hyprland
- **Onde:** `zsh/aliases.zsh` linhas 60-66
- **Problema:** `reload-hypr`, `hyprconf` etc nao existem no COSMIC.
- **Fix:** Condicionar: so definir se `hyprctl` existir.

### 15. `show-keybinds.sh` fecha imediatamente
- **Onde:** `keybinds/show-keybinds.sh`
- **Problema:** Chamado via `$terminal -e bash show-keybinds.sh`, a janela fecha quando o script termina. Usuario nao consegue ler.
- **Fix:** Adicionar `read -p "Pressione Enter para fechar"` no final.

### 16. Aliases de workspace sao pessoais
- **Onde:** `zsh/aliases.zsh` linhas 11-24
- **Problema:** `volan`, `mnesis`, `temporeal` etc sao projetos especificos. Em outra maquina sem esses projetos, `cd` falha silenciosamente.
- **Fix:** Mover pro `local/zsh/aliases.zsh` (ja suportado pelo sistema de overrides).

### 17. `EDITOR` nao esta definido no `.zshrc`
- **Onde:** `zsh/.zshrc` linhas 99-104 (comentado)
- **Problema:** `git commit` (sem `-m`), `crontab -e`, `sudoedit` usam `vi` ou `nano` ao inves de nvim.
- **Fix:** Descomentar `export EDITOR='nvim'`.

### 18. Steam e MangoHud no Arch requerem multilib
- **Onde:** `gaming.ts`
- **Problema:** `pacman -S steam` falha se `[multilib]` nao esta habilitado no `/etc/pacman.conf`.
- **Fix:** Verificar/habilitar multilib antes de instalar, ou avisar o usuario.

### 19. GPG keyring pode ja existir (re-execucao)
- **Onde:** `browsers.ts` (Vivaldi, Opera, Chrome no Debian)
- **Problema:** `sudo gpg --dearmor -o /usr/share/keyrings/...` falha se o arquivo ja existe.
- **Fix:** Adicionar `--batch --yes` ou checar `existsSync` antes.

### 20. `getDesktop()` confunde Hyprland com Omarchy
- **Onde:** `helpers.ts` linha 37
- **Problema:** Se o usuario usa Hyprland puro (sem Omarchy), `hyprctl` existe e retorna "omarchy". Pode aplicar configs erradas.
- **Fix:** Verificar `~/.config/omarchy` primeiro (ja faz), mas so usar `hyprctl` como fallback se o diretorio nao existir.

---

## Ordem sugerida de implementacao

1. **Criticos primeiro:** #1 (AUR), #2 (pacman -Syu), #3 (pipe keybinds), #4 (gitconfig), #5 (bun path)
2. **Depois medios:** #6 (aliases distro), #7 (eza fallback), #8 (tools faltando), #10 (bootstrap git)
3. **Depois menores:** conforme necessidade

---

*Gerado em 2026-02-22*
