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
// defaultInstall: true  = incluso no modo "Padrao" (instalar tudo)
// defaultInstall: false = disponivel apenas no modo "Custom" (selecao manual)
// ---------------------------------------------------------------------------

interface IToolToggle {
  id: string;
  defaultInstall: boolean;
}

export const DEV_TOOLS_ENABLED: IToolToggle[] = [
  { id: "nvim", defaultInstall: true },
  { id: "tmux", defaultInstall: true },
  { id: "zellij", defaultInstall: true },
  { id: "vscode", defaultInstall: true },
  { id: "gitkraken", defaultInstall: true },
  { id: "lazygit", defaultInstall: true },
  { id: "gh", defaultInstall: true },
  { id: "lazydocker", defaultInstall: true },
  { id: "tauri", defaultInstall: false },
  { id: "sqlite", defaultInstall: true },
  { id: "docker", defaultInstall: true },
  { id: "firebase", defaultInstall: true },
  { id: "supabase", defaultInstall: true },
  { id: "postman", defaultInstall: true },
  { id: "insomnia", defaultInstall: false },
];

export const APPS_ENABLED: IToolToggle[] = [
  { id: "libreoffice", defaultInstall: true },
  { id: "sublime", defaultInstall: true },
  { id: "pavucontrol", defaultInstall: true },
  { id: "vlc", defaultInstall: true },
  { id: "obsidian", defaultInstall: true },
  { id: "kdenlive", defaultInstall: false },
  { id: "peazip", defaultInstall: true },
  { id: "qbittorrent", defaultInstall: true },
];

export const GAMING_ENABLED: IToolToggle[] = [
  { id: "steam", defaultInstall: true },
  { id: "lutris", defaultInstall: true },
  { id: "protonup-qt", defaultInstall: true },
  { id: "mangohud", defaultInstall: true },
  { id: "gamemode", defaultInstall: true },
  { id: "wine", defaultInstall: true },
  { id: "discord", defaultInstall: true },
];

export const BROWSERS_ENABLED: IToolToggle[] = [
  { id: "vivaldi", defaultInstall: true },
  { id: "opera", defaultInstall: false },
  { id: "firefox", defaultInstall: true },
  { id: "chrome", defaultInstall: true },
  { id: "chromium", defaultInstall: false },
];

export const VIRTUALIZATION_ENABLED: IToolToggle[] = [
  { id: "virtualbox", defaultInstall: false },
];
