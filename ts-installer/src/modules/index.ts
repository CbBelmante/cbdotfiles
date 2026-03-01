import { fonts } from "./fonts";
import { drivers } from "./drivers";
import { desktopTools } from "./desktop-tools";
import { shellTools } from "./shell-tools";
import { browsers } from "./browsers";
import { dev } from "./dev";
import { fastfetch } from "./fastfetch";
import { btop } from "./btop";
import { keybinds } from "./keybinds";
import { power } from "./power";
import { gaming } from "./gaming";
import { apps } from "./apps";
import { virtualization } from "./virtualization";

export interface IRunContext {
  overrides: Record<string, string>;
  isAll: boolean;
}

export interface IModule {
  id: string;
  name: string;
  emoji: string;
  description: string;
  installsSoftware: boolean;
  run: (ctx: IRunContext) => Promise<void>;
}

// Ordem de instalacao
export const ALL_MODULES: IModule[] = [
  shellTools,
  fonts,
  drivers,
  desktopTools,
  browsers,
  dev,
  fastfetch,
  btop,
  apps,
  gaming,
  virtualization,
  keybinds,
  power,
];

export function getModuleById(id: string): IModule | undefined {
  return ALL_MODULES.find((m) => m.id === id);
}
