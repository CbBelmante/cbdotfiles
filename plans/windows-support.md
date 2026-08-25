# Windows Support — Plano de Implementacao

## Estrategia: WSL + configs nativas

O instalador roda dentro do WSL (Linux no Windows). Configs que precisam
estar no lado Windows (GlazeWM, fonts, terminal) sao copiadas automaticamente.

## Fase 1 — Setup inicial (na maquina Windows)

### 1.1 Instalar WSL
```powershell
# PowerShell como Admin
wsl --install
# Reinicia o PC
```

### 1.2 Dentro do WSL, rodar cbdotfiles normalmente
```bash
curl -sL https://raw.githubusercontent.com/CbBelmante/cbdotfiles/master/bootstrap.sh | bash
```

### 1.3 Detectar WSL no instalador
- `helpers.ts`: adicionar `isWSL()` (checa `/proc/version` por "microsoft")
- Quando WSL, instalar tudo do Linux + copiar configs pro Windows host

## Fase 2 — Copiar configs pro Windows host

O WSL monta o Windows em `/mnt/c/`. O instalador copia automaticamente:

| Config | Origem (WSL) | Destino (Windows) |
|---|---|---|
| GlazeWM | `glazewm/config.yaml` | `/mnt/c/Users/$USER/.glzr/glazewm/config.yaml` |
| Fonts | `~/Library/Fonts/` ou download | `/mnt/c/Windows/Fonts/` (precisa admin) |
| Windows Terminal | Gerar `settings.json` | `/mnt/c/Users/$USER/AppData/Local/Packages/.../settings.json` |
| Git | `.gitconfig` | `/mnt/c/Users/$USER/.gitconfig` |

### Implementacao sugerida
```typescript
// helpers.ts
export function isWSL(): boolean {
  try {
    const version = require("fs").readFileSync("/proc/version", "utf-8");
    return /microsoft/i.test(version);
  } catch {
    return false;
  }
}

export function winHome(): string {
  // /mnt/c/Users/NomeDoUsuario
  const user = process.env.USER || "user";
  return `/mnt/c/Users/${user}`;
}
```

## Fase 3 — Instalar apps Windows via winget

Dentro do WSL, o `winget` do Windows e acessivel via `/mnt/c/.../winget.exe`.

```typescript
// helpers.ts
export async function wingetInstall(...packages: string[]): Promise<boolean> {
  for (const pkg of packages) {
    await $`/mnt/c/Users/$USER/AppData/Local/Microsoft/WindowsApps/winget.exe install -e --id ${pkg}`.nothrow();
  }
  return true;
}
```

### Mapeamento de apps

| App | winget ID |
|---|---|
| GlazeWM | `glzr-io.glazeWM` |
| VS Code | `Microsoft.VisualStudioCode` |
| GitKraken | `Axosoft.GitKraken` |
| Discord | `Discord.Discord` |
| Steam | `Valve.Steam` |
| VLC | `VideoLAN.VLC` |
| Obsidian | `Obsidian.Obsidian` |
| Docker Desktop | `Docker.DockerDesktop` |
| Firefox | `Mozilla.Firefox` |
| Chrome | `Google.Chrome` |
| Vivaldi | `VivaldiTechnologies.Vivaldi` |
| Postman | `Postman.Postman` |
| 1Password | `AgileBits.1Password` |
| Spotify | `Spotify.Spotify` |
| qBittorrent | `qBittorrent.qBittorrent` |
| LibreOffice | `TheDocumentFoundation.LibreOffice` |
| VirtualBox | `Oracle.VirtualBox` |
| Windows Terminal | `Microsoft.WindowsTerminal` |
| Ghostty | (sem winget ainda — instalar manualmente) |

## Fase 4 — Windows Terminal config

Gerar `settings.json` do Windows Terminal com:
- Fonte: CaskaydiaMono Nerd Font
- Esquema de cores alinhado com Kitty/Ghostty
- Opacity/acrylic
- Shell padrao: WSL

```json
{
  "defaultProfile": "{WSL-GUID}",
  "profiles": {
    "defaults": {
      "font": { "face": "CaskaydiaMono Nerd Font", "size": 11 },
      "opacity": 85,
      "useAcrylic": true
    }
  }
}
```

## Fase 5 — Fonts no Windows

Nerd Fonts precisam ser instaladas no Windows (nao no WSL):

```bash
# Dentro do WSL, copia pro Windows
cp ~/.local/share/fonts/*.ttf /mnt/c/Windows/Fonts/
# Ou usa PowerShell pra instalar
powershell.exe -c "Get-ChildItem /mnt/c/temp/fonts/*.ttf | ForEach-Object { Copy-Item $_.FullName C:\Windows\Fonts }"
```

## Fase 6 — Shell aliases no WSL

O `.zshrc` e aliases funcionam normalmente dentro do WSL.
Adicionar aliases extras pra comandos Windows:

```bash
# Abrir Explorer do Windows
alias explorer='explorer.exe .'

# Abrir app Windows
alias winopen='cmd.exe /c start'
```

## Checklist

- [ ] `isWSL()` no helpers.ts
- [ ] `winHome()` pra path do Windows host
- [ ] Copiar GlazeWM config pro Windows host apos gerar
- [ ] `wingetInstall()` pra instalar apps Windows
- [ ] Gerar Windows Terminal settings.json
- [ ] Instalar fonts no lado Windows
- [ ] Aliases WSL extras (explorer, winopen)
- [ ] Testar install.sh completo no WSL
- [ ] Documentar no README
