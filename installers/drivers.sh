#!/bin/bash
DOTFILES_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$DOTFILES_DIR/installers/helpers.sh"

log_title "drivers" "Drivers & Aceleracao de Video"

# Detectar GPU
GPU="unknown"
if lspci | grep -qi "amd.*radeon\|amd.*rx\|amd.*vega\|amd/ati"; then
  GPU="amd"
elif lspci | grep -qi "intel.*graphics\|intel.*hd\|intel.*uhd\|intel.*iris"; then
  GPU="intel"
elif lspci | grep -qi "nvidia"; then
  GPU="nvidia"
fi

if [ "$GPU" = "unknown" ]; then
  log_warn "GPU nao identificada. Instale drivers de video manualmente."
  exit 0
fi

log_add "GPU detectada: $GPU"

DISTRO=$(get_distro)
PACKAGES=()

case "$GPU" in
  amd)
    if [ "$DISTRO" = "arch" ]; then
      PACKAGES=(mesa vulkan-radeon libva-mesa-driver mesa-vdpau)
    elif [ "$DISTRO" = "debian" ]; then
      PACKAGES=(vainfo mesa-va-drivers mesa-vulkan-drivers mesa-vdpau-drivers vulkan-tools)
    elif [ "$DISTRO" = "fedora" ]; then
      PACKAGES=(mesa-va-drivers mesa-vdpau-drivers mesa-vulkan-drivers vulkan-tools libva-utils)
    fi
    ;;
  intel)
    if [ "$DISTRO" = "arch" ]; then
      PACKAGES=(mesa vulkan-intel intel-media-driver)
    elif [ "$DISTRO" = "debian" ]; then
      PACKAGES=(vainfo intel-media-va-driver mesa-vulkan-drivers vulkan-tools)
    elif [ "$DISTRO" = "fedora" ]; then
      PACKAGES=(mesa-vulkan-drivers intel-media-driver libva-utils vulkan-tools)
    fi
    ;;
  nvidia)
    log_warn "GPU NVIDIA detectada. Drivers proprietarios variam por modelo."
    log_warn "Instale manualmente: https://wiki.debian.org/NvidiaGraphicsDrivers"
    exit 0
    ;;
esac

if [ ${#PACKAGES[@]} -eq 0 ]; then
  log_warn "Distro '$DISTRO' nao suportada para drivers automaticos. Instale manualmente."
  exit 0
fi

log_add "Instalando: ${PACKAGES[*]}"
pkg_install "${PACKAGES[@]}"
log_ok "Drivers $GPU instalados"

if command -v vainfo &> /dev/null; then
  PROFILES=$(vainfo 2>&1 | grep -c "VAProfile")
  log_ok "VA-API funcionando ($PROFILES perfis de decodificacao)"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Bluetooth - Firmware Broadcom (Apple Mac)
# ─────────────────────────────────────────────────────────────────────────────
BT_USB=$(lsusb 2>/dev/null | grep -i "apple.*bluetooth\|broadcom.*bluetooth")
if [ -n "$BT_USB" ] || is_apple; then
  [ -z "$BT_USB" ] && BT_USB=$(lsusb 2>/dev/null | grep -i "broadcom")
  USB_ID=$(echo "$BT_USB" | grep -oP 'ID \K[0-9a-f]{4}:[0-9a-f]{4}')
  BT_CHIP=$(dmesg 2>/dev/null | grep -oP 'BCM\d+A?\d*' | head -1)
  if [ -z "$BT_CHIP" ]; then
    BT_CHIP=$(sudo dmesg 2>/dev/null | grep -oP 'BCM\d+A?\d*' | head -1)
  fi

  if [ -n "$BT_CHIP" ]; then
    log_add "Bluetooth Apple detectado: $BT_CHIP (USB $USB_ID)"
    FW_URL="https://raw.githubusercontent.com/winterheart/broadcom-bt-firmware/master/brcm"
    FW_DIR="/lib/firmware/brcm"
    VENDOR=$(echo "$USB_ID" | cut -d: -f1)
    PRODUCT=$(echo "$USB_ID" | cut -d: -f2)

    # Firmware pelo nome do chip
    if [ ! -f "$FW_DIR/${BT_CHIP}-${VENDOR}-${PRODUCT}.hcd" ]; then
      log_add "Baixando firmware Bluetooth ${BT_CHIP}..."
      sudo mkdir -p "$FW_DIR"
      sudo curl -sL "$FW_URL/${BT_CHIP}-0a5c-6410.hcd" -o "$FW_DIR/${BT_CHIP}-${VENDOR}-${PRODUCT}.hcd"
      # Tambem instala com ID USB direto
      sudo curl -sL "$FW_URL/${BT_CHIP}-0a5c-6410.hcd" -o "$FW_DIR/BCM-${VENDOR}-${PRODUCT}.hcd"
      sudo systemctl restart bluetooth
      log_ok "Firmware Bluetooth ${BT_CHIP} instalado"
    else
      log_ok "Firmware Bluetooth ${BT_CHIP} ja instalado"
    fi
  fi
else
  log_ok "Bluetooth OK (nao-Apple, firmware nao necessario)"
fi

# ─────────────────────────────────────────────────────────────────────────────
# PipeWire - Otimizar Bluetooth audio (SBC-XQ + buffer reduzido)
# ─────────────────────────────────────────────────────────────────────────────
if command -v pw-metadata &> /dev/null; then
  # Codec SBC-XQ (melhor qualidade que SBC padrao)
  BT_CARD=$(pactl list cards short 2>/dev/null | grep bluez | awk '{print $2}')
  if [ -n "$BT_CARD" ]; then
    SBC_XQ=$(pactl list cards 2>/dev/null | grep -o "a2dp-sink-sbc_xq")
    if [ -n "$SBC_XQ" ]; then
      pactl set-card-profile "$BT_CARD" a2dp-sink-sbc_xq 2>/dev/null
      log_ok "Bluetooth codec SBC-XQ ativado"
    fi
  fi

  # Buffer reduzido pra menor latencia
  pw-metadata -n settings 0 clock.force-quantum 256 2>/dev/null
  log_ok "PipeWire quantum 256 (latencia reduzida)"
fi
