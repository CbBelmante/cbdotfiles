#!/usr/bin/env bun

import { existsSync, readdirSync } from "fs";
import { $ } from "bun";
import { DOTFILES_DIR, HOME, getDesktop, symlink } from "./helpers";
import { log, showHeader } from "./log";

// ---------------------------------------------------------------------------
// Todos os symlinks gerenciados pelo cbdotfiles
// ---------------------------------------------------------------------------

interface ISymlinkEntry {
  source: string;
  target: string;
  condition?: () => boolean;
}

function entries(): ISymlinkEntry[] {
  const links: ISymlinkEntry[] = [
    // Shell
    { source: `${DOTFILES_DIR}/zsh/.zshrc`, target: `${HOME}/.zshrc` },
    { source: `${DOTFILES_DIR}/zsh/aliases.zsh`, target: `${HOME}/.config/cb/aliases.zsh` },
    {
      source: `${DOTFILES_DIR}/local/zsh/aliases.zsh`,
      target: `${HOME}/.config/cb/local.zsh`,
      condition: () => existsSync(`${DOTFILES_DIR}/local/zsh/aliases.zsh`),
    },

    // Git
    { source: `${DOTFILES_DIR}/git/.gitconfig`, target: `${HOME}/.gitconfig` },

    // Kitty
    { source: `${DOTFILES_DIR}/kitty/kitty.conf`, target: `${HOME}/.config/kitty/kitty.conf` },
    {
      source: `${DOTFILES_DIR}/local/kitty/kitty.conf`,
      target: `${HOME}/.config/kitty/local.conf`,
      condition: () => existsSync(`${DOTFILES_DIR}/local/kitty/kitty.conf`),
    },

    // Neovim
    {
      source: `${DOTFILES_DIR}/nvim`,
      target: `${HOME}/.config/nvim`,
      condition: () => existsSync(`${DOTFILES_DIR}/nvim`),
    },
    {
      source: `${DOTFILES_DIR}/nvim/.markdownlint-cli2.yaml`,
      target: `${HOME}/.markdownlint-cli2.yaml`,
      condition: () => existsSync(`${DOTFILES_DIR}/nvim/.markdownlint-cli2.yaml`),
    },

    // Zellij
    {
      source: `${DOTFILES_DIR}/zellij/config.kdl`,
      target: `${HOME}/.config/zellij/config.kdl`,
      condition: () => existsSync(`${DOTFILES_DIR}/zellij/config.kdl`),
    },

    // tmux
    {
      source: `${DOTFILES_DIR}/tmux/tmux.conf`,
      target: `${HOME}/.tmux.conf`,
      condition: () => existsSync(`${DOTFILES_DIR}/tmux/tmux.conf`),
    },

    // LazyGit
    {
      source: `${DOTFILES_DIR}/lazygit/config.yml`,
      target: `${HOME}/.config/lazygit/config.yml`,
      condition: () => existsSync(`${DOTFILES_DIR}/lazygit/config.yml`),
    },

    // Btop
    {
      source: `${DOTFILES_DIR}/btop/btop.conf`,
      target: `${HOME}/.config/btop/btop.conf`,
      condition: () => existsSync(`${DOTFILES_DIR}/btop/btop.conf`),
    },

    // Fastfetch
    {
      source: `${DOTFILES_DIR}/fastfetch/config.jsonc`,
      target: `${HOME}/.config/fastfetch/config.jsonc`,
      condition: () => existsSync(`${DOTFILES_DIR}/fastfetch/config.jsonc`),
    },
  ];

  return links;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  showHeader(DOTFILES_DIR);
  log.title("resymlink", "Recriando symlinks");

  let count = 0;

  for (const entry of entries()) {
    if (entry.condition && !entry.condition()) {
      log.dim(`skip: ${entry.source} (nao existe)`);
      continue;
    }

    // Neovim usa ln -sfn (diretorio)
    if (entry.source === `${DOTFILES_DIR}/nvim`) {
      await $`mkdir -p ${HOME}/.config`;
      await $`ln -sfn ${entry.source} ${entry.target}`;
    } else {
      await symlink(entry.source, entry.target);
    }

    const short = entry.target.replace(HOME, "~");
    log.ok(short);
    count++;
  }

  // Kitty env.conf (depende do desktop)
  const desktop = await getDesktop();
  const envConf = `${HOME}/.config/kitty/env.conf`;

  switch (desktop) {
    case "omarchy":
    case "hyprland":
    case "sway":
      await symlink(`${DOTFILES_DIR}/kitty/omarchy.conf`, envConf);
      log.ok(`~/.config/kitty/env.conf -> ${desktop}`);
      count++;
      break;
    case "cosmic":
      await symlink(`${DOTFILES_DIR}/kitty/cosmic.conf`, envConf);
      log.ok("~/.config/kitty/env.conf -> cosmic");
      count++;
      break;
    default:
      await symlink(`${DOTFILES_DIR}/kitty/omarchy.conf`, envConf);
      log.ok(`~/.config/kitty/env.conf -> ${desktop} (padrao)`);
      count++;
      break;
  }

  // Zellij layouts
  const zellijDir = `${DOTFILES_DIR}/zellij`;
  if (existsSync(zellijDir)) {
    await $`mkdir -p ${HOME}/.config/zellij/layouts`;
    const layouts = readdirSync(zellijDir).filter(
      (f) => f.endsWith(".kdl") && f !== "config.kdl"
    );
    for (const layout of layouts) {
      await symlink(`${zellijDir}/${layout}`, `${HOME}/.config/zellij/layouts/${layout}`);
      log.ok(`~/.config/zellij/layouts/${layout}`);
      count++;
    }
  }

  console.log();
  log.ok(`${count} symlinks recriados`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
