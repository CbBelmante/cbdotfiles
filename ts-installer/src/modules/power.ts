import { $ } from "bun";
import type { IModule } from "./index";
import { isApple, isLaptop, commandExists } from "../helpers";
import { log } from "../log";

export const power: IModule = {
  id: "power",
  name: "Power",
  emoji: "⚡",
  description: "Energia (suspend auto-detecta desktop/laptop)",
  installsSoftware: false,

  async run(overrides) {
    log.title("power", "Energia");

    // Detecta hardware Apple
    if (isApple()) {
      try {
        const product = await Bun.file("/sys/class/dmi/id/product_name").text();
        log.warn(`Hardware Apple detectado: ${product.trim()}`);
      } catch {}
    }

    // Determina suspend: override local > apple > auto-detecta
    let suspend: "on" | "off";

    if (overrides.CB_SUSPEND) {
      suspend = overrides.CB_SUSPEND as "on" | "off";
      log.ok(`Suspend override: ${suspend} (via local.sh)`);
    } else if (isApple()) {
      suspend = "off";
      log.ok("Suspend desabilitado (Apple hardware — ACPI sleep nao funciona no Linux)");
    } else if (isLaptop()) {
      suspend = "on";
      log.ok("Laptop detectado (bateria presente)");
    } else {
      suspend = "off";
      log.ok("Desktop detectado (sem bateria)");
    }

    const hasGsettings = await commandExists("gsettings");

    if (suspend === "off") {
      if (hasGsettings) {
        await $`gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type 'nothing'`;
        await $`gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-timeout 0`;
        log.ok("Suspend desabilitado (gsettings)");
      }

      if (isApple()) {
        try {
          await $`sudo systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target`;
          log.ok("Suspend/hibernate mascarado (systemd) — Apple hardware");
        } catch {
          log.warn("Falha ao mascarar suspend no systemd");
        }
      }
    } else {
      if (hasGsettings) {
        await $`gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type 'suspend'`;
        await $`gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-timeout 1800`;
        log.ok("Suspend habilitado (30min)");
      }

      await $`sudo systemctl unmask sleep.target suspend.target hibernate.target hybrid-sleep.target`.nothrow();
    }
  },
};
