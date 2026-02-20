import { $ } from "bun";
import type { IModule } from "./index";
import { HOME, commandExists, getDistro, pkgInstall, symlink } from "../helpers";
import { log } from "../log";

interface ITool {
  name: string;
  cmd: string;
  packages: string[];
  fallback?: () => Promise<void>;
}

export const shellTools: IModule = {
  id: "shell-tools",
  name: "Shell Tools",
  emoji: "🔍",
  description: "Zoxide + fzf + ripgrep + bat",
  installsSoftware: true,

  async run() {
    log.title("shell-tools", "Shell Tools (zoxide, fzf, ripgrep, bat)");

    const distro = await getDistro();

    const tools: ITool[] = [
      {
        name: "Zoxide",
        cmd: "zoxide",
        packages: ["zoxide"],
        fallback: async () => {
          await $`curl -sSfL https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh | sh`;
        },
      },
      {
        name: "fzf",
        cmd: "fzf",
        packages: ["fzf"],
      },
      {
        name: "ripgrep",
        cmd: "rg",
        packages: ["ripgrep"],
      },
      {
        name: "bat",
        cmd: "bat",
        packages: ["bat"],
      },
    ];

    for (const tool of tools) {
      // bat no debian se chama batcat
      const altCmd = tool.cmd === "bat" ? "batcat" : null;
      const exists =
        (await commandExists(tool.cmd)) ||
        (altCmd && (await commandExists(altCmd)));

      if (!exists) {
        log.add(`Instalando ${tool.name}...`);
        if (distro !== "arch" && tool.fallback) {
          await tool.fallback();
        } else {
          await pkgInstall(...tool.packages);
        }
        log.ok(`${tool.name} instalado`);
      } else {
        log.ok(`${tool.name} ja instalado`);
      }
    }

    // Debian/Ubuntu: bat se chama batcat — criar symlink
    if (
      (await commandExists("batcat")) &&
      !(await commandExists("bat"))
    ) {
      await $`mkdir -p ${HOME}/.local/bin`;
      const batcatPath = (await $`which batcat`.text()).trim();
      await symlink(batcatPath, `${HOME}/.local/bin/bat`);
      log.ok("Symlink bat -> batcat");
    }
  },
};
