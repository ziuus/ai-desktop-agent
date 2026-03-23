#!/bin/bash
# Autonomous Desktop Agent Loop
# Takes screenshot, analyzes, acts, repeats

SCREENSHOT="/tmp/agent_screen.png"

while true; do
    echo "--- Agent Loop ---"
    
    # 1. Take screenshot
    scrot $SCREENSHOT
    echo "Screenshot taken"
    
    # 2. User can now see what the agent sees and give next command
    # Or automated decision making happens here
    
    # 3. Small delay to avoid loop spam
    sleep 1
done
