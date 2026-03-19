#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# PCINFO - Informacoes do sistema (hardware, drivers, software)
# Uso: pcinfo [secao]
# Secoes: all, hw, gpu, audio, net, disk, sw, de, docker
# ═══════════════════════════════════════════════════════════════════════════════

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

divider() { echo -e "  ${DIM}──────────────────────────────────────────────────────${NC}"; }
header()  { echo -e "\n  ${CYAN}${BOLD}$1${NC}"; divider; }
info()    { printf "  ${GREEN}%-22s${NC} %s\n" "$1" "$2"; }
warn()    { printf "  ${YELLOW}%-22s${NC} %s\n" "$1" "$2"; }

section="$1"
[[ -z "$section" ]] && section="all"

# ─────────────────────────────────────────────────────────────────────────────
# Hardware
# ─────────────────────────────────────────────────────────────────────────────
show_hw() {
  header "🖥️  HARDWARE"

  # Maquina
  local vendor=$(cat /sys/class/dmi/id/sys_vendor 2>/dev/null || echo "?")
  local product=$(cat /sys/class/dmi/id/product_name 2>/dev/null || echo "?")
  info "Maquina" "$vendor $product"

  # CPU
  local cpu=$(grep -m1 "model name" /proc/cpuinfo | cut -d: -f2 | sed 's/^ //')
  local cores=$(nproc 2>/dev/null || echo "?")
  info "CPU" "$cpu ($cores cores)"

  # RAM
  local ram_total=$(free -h | awk '/^Mem:/ {print $2}')
  local ram_used=$(free -h | awk '/^Mem:/ {print $3}')
  local ram_avail=$(free -h | awk '/^Mem:/ {print $7}')
  info "RAM" "$ram_used / $ram_total (disponivel: $ram_avail)"

  # Swap
  local swap_total=$(free -h | awk '/^Swap:/ {print $2}')
  local swap_used=$(free -h | awk '/^Swap:/ {print $3}')
  info "Swap" "$swap_used / $swap_total"

  # Tipo
  if [ -d /sys/class/power_supply/BAT* ] 2>/dev/null; then
    local bat=$(cat /sys/class/power_supply/BAT0/capacity 2>/dev/null || echo "?")
    info "Tipo" "Laptop (bateria: ${bat}%)"
  else
    info "Tipo" "Desktop (sem bateria)"
  fi

  # Apple
  [[ "$vendor" == "Apple Inc." ]] && warn "Apple" "Hardware Apple detectado"
}

# ─────────────────────────────────────────────────────────────────────────────
# GPU & Drivers
# ─────────────────────────────────────────────────────────────────────────────
show_gpu() {
  header "🎮  GPU & DRIVERS"

  # GPU
  local gpu=$(lspci 2>/dev/null | grep -i "VGA" | cut -d: -f3 | sed 's/^ //')
  info "GPU" "$gpu"

  # Driver em uso
  local driver=$(lspci -k 2>/dev/null | grep -A2 "VGA" | grep "Kernel driver" | awk '{print $NF}')
  if [[ "$driver" == "amdgpu" ]]; then
    info "Driver" "$driver (moderno)"
  elif [[ "$driver" == "radeon" ]]; then
    warn "Driver" "$driver (antigo — considere trocar pra amdgpu)"
  else
    info "Driver" "${driver:-desconhecido}"
  fi

  # Vulkan
  if command -v vulkaninfo &>/dev/null; then
    local vk_driver=$(vulkaninfo --summary 2>/dev/null | grep "driverName" | head -1 | awk '{print $NF}')
    if [[ "$vk_driver" == "llvmpipe" ]]; then
      warn "Vulkan" "llvmpipe (SOFTWARE — sem aceleracao GPU!)"
    elif [[ -n "$vk_driver" ]]; then
      info "Vulkan" "$vk_driver (hardware)"
    else
      warn "Vulkan" "nao detectado"
    fi
  else
    warn "Vulkan" "vulkaninfo nao instalado"
  fi

  # VA-API
  if command -v vainfo &>/dev/null; then
    local vaapi_driver=$(vainfo 2>&1 | grep "Driver version" | head -1)
    local profiles=$(vainfo 2>&1 | grep -c "VAProfile" || echo "0")
    if [[ -n "$vaapi_driver" ]]; then
      info "VA-API" "$profiles perfis — $vaapi_driver"
    else
      local vaapi_status=$(vainfo 2>&1 | head -5 | tail -1)
      info "VA-API" "$vaapi_status"
    fi
  else
    warn "VA-API" "vainfo nao instalado"
  fi

  # Mesa
  local mesa=$(dpkg -l 2>/dev/null | grep "libgl1-mesa-dri" | awk '{print $3}' | head -1)
  [[ -z "$mesa" ]] && mesa=$(pacman -Q mesa 2>/dev/null | awk '{print $2}')
  [[ -n "$mesa" ]] && info "Mesa" "$mesa"

  # Kernel params (amdgpu)
  local cmdline=$(cat /proc/cmdline 2>/dev/null)
  if echo "$cmdline" | grep -q "amdgpu"; then
    info "Kernel params" "$(echo "$cmdline" | grep -oE 'amdgpu\.[^ ]+' | tr '\n' ' ')"
  fi

  # Blacklist
  if [ -f /etc/modprobe.d/blacklist-radeon.conf ]; then
    info "Blacklist" "radeon bloqueado"
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Audio
# ─────────────────────────────────────────────────────────────────────────────
show_audio() {
  header "🔊  AUDIO"

  if command -v pactl &>/dev/null; then
    local server=$(pactl info 2>/dev/null | grep "Server Name" | cut -d: -f2 | sed 's/^ //')
    info "Server" "$server"
    local default_sink=$(pactl info 2>/dev/null | grep "Default Sink" | cut -d: -f2 | sed 's/^ //')
    info "Saida" "$default_sink"
  elif command -v pipewire &>/dev/null; then
    info "Server" "PipeWire"
  else
    warn "Audio" "nenhum servidor detectado"
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Rede
# ─────────────────────────────────────────────────────────────────────────────
show_net() {
  header "🌐  REDE"

  local ip=$(hostname -I 2>/dev/null | awk '{print $1}')
  info "IP local" "${ip:-nao conectado}"

  local gateway=$(ip route 2>/dev/null | grep default | awk '{print $3}' | head -1)
  [[ -n "$gateway" ]] && info "Gateway" "$gateway"

  local dns=$(grep "nameserver" /etc/resolv.conf 2>/dev/null | head -1 | awk '{print $2}')
  [[ -n "$dns" ]] && info "DNS" "$dns"

  local hostname=$(hostname 2>/dev/null)
  info "Hostname" "$hostname"
}

# ─────────────────────────────────────────────────────────────────────────────
# Disco
# ─────────────────────────────────────────────────────────────────────────────
show_disk() {
  header "💾  DISCO"

  df -h / /home 2>/dev/null | awk 'NR>1 {printf "  \033[0;32m%-22s\033[0m %s usado de %s (%s)\n", $6, $3, $2, $5}'
}

# ─────────────────────────────────────────────────────────────────────────────
# Software
# ─────────────────────────────────────────────────────────────────────────────
show_sw() {
  header "📦  SOFTWARE"

  # OS
  local os=$(grep PRETTY_NAME /etc/os-release 2>/dev/null | cut -d= -f2 | tr -d '"')
  info "OS" "$os"

  # Kernel
  info "Kernel" "$(uname -r)"

  # Shell
  info "Shell" "$SHELL"

  # Terminal
  local term="${TERM_PROGRAM:-${TERMINAL:-?}}"
  if command -v kitty &>/dev/null; then
    term="kitty $(kitty --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')"
  fi
  info "Terminal" "$term"

  # Editor
  local editor="${EDITOR:-${VISUAL:-?}}"
  if command -v nvim &>/dev/null; then
    editor="nvim $(nvim --version 2>/dev/null | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')"
  fi
  info "Editor" "$editor"

  # Node
  if command -v node &>/dev/null; then
    info "Node" "$(node --version 2>/dev/null)"
  else
    warn "Node" "nao instalado"
  fi

  # Bun
  if command -v bun &>/dev/null; then
    info "Bun" "$(bun --version 2>/dev/null)"
  fi

  # Docker
  if command -v docker &>/dev/null; then
    info "Docker" "$(docker --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')"
  fi

  # Git
  if command -v git &>/dev/null; then
    local git_user=$(git config --global user.name 2>/dev/null)
    local git_email=$(git config --global user.email 2>/dev/null)
    info "Git" "$git_user <$git_email>"
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Desktop Environment
# ─────────────────────────────────────────────────────────────────────────────
show_de() {
  header "🖥️  DESKTOP"

  info "Desktop" "${XDG_CURRENT_DESKTOP:-?}"
  info "Sessao" "${XDG_SESSION_TYPE:-?}"

  # Browser padrao
  if command -v xdg-settings &>/dev/null; then
    local browser=$(xdg-settings get default-web-browser 2>/dev/null)
    info "Browser padrao" "${browser:-?}"
  fi

  # Resolucao
  if command -v xrandr &>/dev/null; then
    local res=$(xrandr 2>/dev/null | grep '*' | awk '{print $1}' | head -1)
    [[ -n "$res" ]] && info "Resolucao" "$res"
  elif [ -f /sys/class/drm/card0-*/modes ]; then
    local res=$(head -1 /sys/class/drm/card*/card*-*/modes 2>/dev/null | head -1)
    [[ -n "$res" ]] && info "Resolucao" "$res"
  fi

  # Wayland flags
  if [ -f ~/.config/electron-flags.conf ]; then
    info "Electron flags" "$(cat ~/.config/electron-flags.conf | tr '\n' ' ')"
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Docker
# ─────────────────────────────────────────────────────────────────────────────
show_docker() {
  header "🐳  DOCKER"

  if ! command -v docker &>/dev/null; then
    warn "Docker" "nao instalado"
    return
  fi

  info "Versao" "$(docker --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')"

  if docker info &>/dev/null; then
    local containers=$(docker ps -q 2>/dev/null | wc -l)
    local images=$(docker images -q 2>/dev/null | wc -l)
    info "Containers" "$containers rodando"
    info "Imagens" "$images"
  else
    warn "Status" "Docker nao acessivel (precisa de sudo ou grupo docker)"
  fi

  if command -v docker compose version &>/dev/null; then
    info "Compose" "$(docker compose version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')"
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

echo -e "\n  ${BOLD}⚙️  PCINFO${NC} — ${DIM}cbdotfiles system info${NC}"

case "$section" in
  all)    show_hw; show_gpu; show_audio; show_net; show_disk; show_sw; show_de; show_docker ;;
  hw)     show_hw ;;
  gpu)    show_gpu ;;
  audio)  show_audio ;;
  net)    show_net ;;
  disk)   show_disk ;;
  sw)     show_sw ;;
  de)     show_de ;;
  docker) show_docker ;;
  *)
    echo "  Uso: pcinfo [secao]"
    echo "  Secoes: all, hw, gpu, audio, net, disk, sw, de, docker"
    ;;
esac

echo ""
