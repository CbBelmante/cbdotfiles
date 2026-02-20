import { git } from "./git";
import { zsh } from "./zsh";
import { nvm } from "./nvm";
import { fonts } from "./fonts";
import { drivers } from "./drivers";
import { shellTools } from "./shell-tools";
import { zellij } from "./zellij";
import { nvim } from "./nvim";
import { kitty } from "./kitty";
import { vivaldi } from "./vivaldi";
import { opera } from "./opera";
import { vscode } from "./vscode";
import { gitkraken } from "./gitkraken";
import { lazygit } from "./lazygit";
import { fastfetch } from "./fastfetch";
import { btop } from "./btop";
import { keybinds } from "./keybinds";
import { power } from "./power";

export interface IModule {
  id: string;
  name: string;
  emoji: string;
  description: string;
  installsSoftware: boolean;
  run: (overrides: Record<string, string>) => Promise<void>;
}

// Ordem de instalacao
export const ALL_MODULES: IModule[] = [
  zsh,
  nvm,
  git,
  fonts,
  drivers,
  shellTools,
  zellij,
  nvim,
  kitty,
  vivaldi,
  opera,
  vscode,
  gitkraken,
  lazygit,
  fastfetch,
  btop,
  keybinds,
  power,
];

// Browsers disponiveis para selecao de padrao
export const BROWSER_MODULES = [vivaldi, opera];

export function getModuleById(id: string): IModule | undefined {
  return ALL_MODULES.find((m) => m.id === id);
}
