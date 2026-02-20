import type { IModule } from "./index";
import { DOTFILES_DIR, symlink } from "../helpers";
import { log } from "../log";

export const git: IModule = {
  id: "git",
  name: "Git",
  emoji: "🔀",
  description: "Symlink .gitconfig",
  installsSoftware: false,

  async run() {
    log.title("git", "Git");

    await symlink(`${DOTFILES_DIR}/git/.gitconfig`, `${process.env.HOME}/.gitconfig`);
    log.ok("~/.gitconfig -> cbdotfiles");
  },
};
