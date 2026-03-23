#!/bin/bash
# AI Desktop Agent - Autonomous Control
# Every action is followed by screenshot feedback

SCREENSHOT="/tmp/agent_screen.png"
ACTION_LOG="/tmp/agent_actions.log"

log() {
    echo "[$(date '+%H:%M:%S')] $1" | tee -a $ACTION_LOG
}

screenshot() {
    scrot $SCREENSHOT 2>/dev/null
}

act() {
    log "ACTION: $1"
    eval "$2"
    sleep 0.5
    screenshot
    log "Screenshot updated"
}

# --- Autonomous Agent Loop ---
log "=== Autonomous Agent Started ==="
log "Telegram is on WS3"

# Example: Autonomous Telegram control
act "Switch to Telegram workspace" \
    "hyprctl dispatch focuswindow 'class:org.telegram.desktop'"

act "Click message input" \
    "xdotool mousemove 640 1020 && xdotool click 1"

act "Type message" \
    "xdotool type 'Autonomous AI message!'"

act "Click send button" \
    "xdotool mousemove 1245 1015 && xdotool click 1"

screenshot
log "=== Actions Complete - Review screenshot ==="

echo ""
echo "Review: $SCREENSHOT"
echo "Log: $ACTION_LOG"
