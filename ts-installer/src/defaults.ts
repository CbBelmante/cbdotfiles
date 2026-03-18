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
