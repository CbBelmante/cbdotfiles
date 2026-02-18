#!/bin/bash
# Menu de energia - funciona em qualquer ambiente
CHOICE=$(echo -e "Lock\nSuspend\nReboot\nShutdown" | wofi --dmenu -p "Power" 2>/dev/null || echo -e "Lock\nSuspend\nReboot\nShutdown" | zenity --list --column="Acao" --title="Power" 2>/dev/null)

case "$CHOICE" in
    Lock)     loginctl lock-session ;;
    Suspend)  systemctl suspend ;;
    Reboot)   systemctl reboot ;;
    Shutdown) systemctl poweroff ;;
esac
