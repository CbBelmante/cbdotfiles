// ═══════════════════════════════════════════════════════════════════════════════
// CBDOTFILES DEFAULTS - Fonte unica de verdade
// ═══════════════════════════════════════════════════════════════════════════════
//
// Quer mudar algo? Mude aqui e todos os modulos respeitam.
// Configs de keybinds ficam em: keybinds/vars.conf
// ═══════════════════════════════════════════════════════════════════════════════

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

export const SHELL = {
  default: "zsh",
  framework: "ohmyzsh",
  theme: "powerlevel10k/powerlevel10k",
  plugins: ["git", "zsh-autosuggestions", "zsh-syntax-highlighting", "docker", "npm", "sudo"],
};

// ---------------------------------------------------------------------------
// Terminal
// ---------------------------------------------------------------------------

export const TERMINAL = {
  app: "kitty",
  font: "CaskaydiaMono Nerd Font",
  fontSize: 7,
  cursorShape: "block",
  opacity: {
    omarchy: 0.65,
    cosmic: 0.85,
  },
  blur: {
    omarchy: 20,
    cosmic: 32,
  },
  minVersion: "0.40.0",
};

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

export const EDITOR = {
  default: "nvim",
  nvimMinVersion: "0.11.2",
  nvimConfig: "lazyvim",
};

// ---------------------------------------------------------------------------
// Browser
// ---------------------------------------------------------------------------

export const BROWSER = {
  default: "vivaldi",
  webappBrowser: {
    hyprland: "chromium",
    cosmic: "vivaldi --app",
  },
  cosmicFlags: "--enable-features=VaapiVideoDecodeLinuxGL --disable-features=UseChromeOSDirectVideoDecoder",
};

// ---------------------------------------------------------------------------
// File Manager
// ---------------------------------------------------------------------------

export const FILE_MANAGER = {
  hyprland: "nautilus",
  cosmic: "cosmic-files",
};

// ---------------------------------------------------------------------------
// Git
// ---------------------------------------------------------------------------

export const GIT = {
  defaultBranch: "main",
  pullRebase: false,
  autoSetupRemote: true,
  editor: "nvim",
  autocrlf: "input",
};

// ---------------------------------------------------------------------------
// Fontes
// ---------------------------------------------------------------------------

export const FONTS = [
  { name: "CascadiaMono", url: "CascadiaMono" },
  { name: "JetBrainsMono", url: "JetBrainsMono" },
];

// ---------------------------------------------------------------------------
// Power
// ---------------------------------------------------------------------------

export const POWER = {
  suspendDesktop: false,
  suspendLaptop: true,
  suspendApple: false,
  idleTimeoutSecs: 1800, // 30 min
};

// ---------------------------------------------------------------------------
// NVM
// ---------------------------------------------------------------------------

export const NVM = {
  version: "0.40.1",
};

// ---------------------------------------------------------------------------
// CLI Tools
// ---------------------------------------------------------------------------

export const CLI_TOOLS = {
  cdReplacement: "zoxide",
  lsReplacement: "eza",
  catReplacement: "bat",
  grepReplacement: "ripgrep",
  fuzzyFinder: "fzf",
};

// ---------------------------------------------------------------------------
// Multiplexers
// ---------------------------------------------------------------------------

export const MULTIPLEXERS = {
  tmuxTheme: "catppuccin-mocha",
  tmuxSaveInterval: 10, // minutos
};

// ---------------------------------------------------------------------------
// Listas de tools por modulo
// ---------------------------------------------------------------------------
// active: true  = incluso no modo "Padrao" (instalar tudo)
// active: false = disponivel apenas no modo "Custom" (selecao manual)
// ---------------------------------------------------------------------------

interface IToolToggle {
  id: string;
  active: boolean;
}

export const DEV_TOOLS_ENABLED: IToolToggle[] = [
  { id: "nvim", active: true },
  { id: "tmux", active: true },
  { id: "zellij", active: true },
  { id: "vscode", active: true },
  { id: "gitkraken", active: true },
  { id: "lazygit", active: true },
  { id: "gh", active: true },
  { id: "lazydocker", active: true },
  { id: "tauri", active: false },
  { id: "docker", active: true },
];

export const APPS_ENABLED: IToolToggle[] = [
  { id: "libreoffice", active: true },
  { id: "sublime", active: true },
  { id: "pavucontrol", active: true },
  { id: "vlc", active: true },
  { id: "obsidian", active: true },
  { id: "kdenlive", active: false },
  { id: "peazip", active: true },
  { id: "qbittorrent", active: true },
];

export const GAMING_ENABLED: IToolToggle[] = [
  { id: "steam", active: true },
  { id: "lutris", active: true },
  { id: "protonup-qt", active: true },
  { id: "mangohud", active: true },
  { id: "gamemode", active: true },
  { id: "wine", active: true },
  { id: "discord", active: true },
];

export const BROWSERS_ENABLED: IToolToggle[] = [
  { id: "vivaldi", active: true },
  { id: "opera", active: false },
  { id: "firefox", active: true },
  { id: "chrome", active: true },
  { id: "chromium", active: false },
];

export const VIRTUALIZATION_ENABLED: IToolToggle[] = [
  { id: "virtualbox", active: false },
];
